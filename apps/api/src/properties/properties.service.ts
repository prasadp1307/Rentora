import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ListingStatus, Prisma, UserRole } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { PropertySearchDto } from "./dto/property-search.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";

const publicInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  propertyAmenities: { include: { amenity: true } },
  owner: {
    select: {
      id: true,
      ownerProfile: {
        select: {
          displayName: true,
          contactEmail: true,
          contactPhone: true,
        },
      },
    },
  },
};

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async search(dto: PropertySearchDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      deletedAt: null,
      listingStatus: ListingStatus.PUBLISHED,
    };

    if (dto.city) where.city = { equals: dto.city, mode: "insensitive" };
    if (dto.locality)
      where.locality = { contains: dto.locality, mode: "insensitive" };
    if (dto.postalCode) where.postalCode = dto.postalCode;
    if (dto.propertyType) where.propertyType = dto.propertyType;
    if (dto.furnishing) where.furnishing = dto.furnishing;
    if (dto.bedrooms !== undefined) where.bedrooms = { gte: dto.bedrooms };
    if (dto.parking !== undefined) where.parkingAvailable = dto.parking;
    if (dto.availableFrom) {
      where.availableFrom = { lte: new Date(dto.availableFrom) };
    }
    if (dto.minRent !== undefined || dto.maxRent !== undefined) {
      where.monthlyRent = {};
      if (dto.minRent !== undefined) {
        (where.monthlyRent as Prisma.DecimalFilter).gte = dto.minRent;
      }
      if (dto.maxRent !== undefined) {
        (where.monthlyRent as Prisma.DecimalFilter).lte = dto.maxRent;
      }
    }
    if (dto.keyword) {
      where.OR = [
        { title: { contains: dto.keyword, mode: "insensitive" } },
        { description: { contains: dto.keyword, mode: "insensitive" } },
        { locality: { contains: dto.keyword, mode: "insensitive" } },
        { city: { contains: dto.keyword, mode: "insensitive" } },
      ];
    }
    if (dto.amenities?.length) {
      where.AND = dto.amenities.map((slug) => ({
        propertyAmenities: {
          some: { amenity: { slug } },
        },
      }));
    }

    const orderBy = this.resolveSort(dto.sort);

    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      items: items.map((p) => this.toCard(p)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublicById(id: string, viewerId?: string) {
    const property = await this.prisma.property.findFirst({
      where: {
        id,
        deletedAt: null,
        listingStatus: ListingStatus.PUBLISHED,
      },
      include: publicInclude,
    });
    if (!property) {
      throw new NotFoundException("Property not found");
    }

    await this.recordView(id, viewerId);

    return this.toPublicDetail(property);
  }

  async findByIdForOwner(id: string, ownerId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, ownerId, deletedAt: null },
      include: publicInclude,
    });
    if (!property) {
      throw new NotFoundException("Property not found");
    }
    return property;
  }

  async listOwnerProperties(ownerId: string) {
    return this.prisma.property.findMany({
      where: { ownerId, deletedAt: null },
      orderBy: { updatedAt: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { enquiries: true, visitRequests: true } },
      },
    });
  }

  async create(ownerId: string, dto: CreatePropertyDto) {
    const status = dto.asDraft ? ListingStatus.DRAFT : ListingStatus.PENDING_REVIEW;
    const { amenityIds, asDraft: _d, ...data } = dto;

    const property = await this.prisma.$transaction(async (tx) => {
      const created = await tx.property.create({
        data: this.buildCreateInput(ownerId, data, status),
      });

      if (amenityIds?.length) {
        await tx.propertyAmenity.createMany({
          data: amenityIds.map((amenityId) => ({
            propertyId: created.id,
            amenityId,
          })),
          skipDuplicates: true,
        });
      }

      return created;
    });

    return property;
  }

  async update(id: string, ownerId: string, dto: UpdatePropertyDto) {
    await this.assertOwner(id, ownerId);
    const { amenityIds, asDraft: _d, ...data } = dto;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.property.update({
        where: { id },
        data: {
          ...this.mapPropertyData(data),
          ...(data.latitude !== undefined
            ? { mapLatApprox: data.latitude }
            : {}),
          ...(data.longitude !== undefined
            ? { mapLngApprox: data.longitude }
            : {}),
        },
      });

      if (amenityIds !== undefined) {
        await tx.propertyAmenity.deleteMany({ where: { propertyId: id } });
        if (amenityIds.length) {
          await tx.propertyAmenity.createMany({
            data: amenityIds.map((amenityId) => ({
              propertyId: id,
              amenityId,
            })),
            skipDuplicates: true,
          });
        }
      }

      return updated;
    });
  }

  async softDelete(id: string, ownerId: string) {
    await this.assertOwner(id, ownerId);
    return this.prisma.property.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        listingStatus: ListingStatus.ARCHIVED,
      },
    });
  }

  async publish(id: string, ownerId: string) {
    const property = await this.assertOwner(id, ownerId);
    if (property.listingStatus === ListingStatus.RENTED) {
      throw new ForbiddenException("Cannot publish a rented property");
    }
    return this.prisma.property.update({
      where: { id },
      data: {
        listingStatus: ListingStatus.PENDING_REVIEW,
        publishedAt: new Date(),
      },
    });
  }

  async unpublish(id: string, ownerId: string) {
    await this.assertOwner(id, ownerId);
    return this.prisma.property.update({
      where: { id },
      data: { listingStatus: ListingStatus.UNPUBLISHED },
    });
  }

  async markRented(id: string, ownerId: string) {
    await this.assertOwner(id, ownerId);
    return this.prisma.property.update({
      where: { id },
      data: { listingStatus: ListingStatus.RENTED },
    });
  }

  async ownerDashboardStats(ownerId: string) {
    const [total, published, draft, pending, rented, enquiries, visits] =
      await Promise.all([
        this.prisma.property.count({
          where: { ownerId, deletedAt: null },
        }),
        this.prisma.property.count({
          where: {
            ownerId,
            deletedAt: null,
            listingStatus: ListingStatus.PUBLISHED,
          },
        }),
        this.prisma.property.count({
          where: {
            ownerId,
            deletedAt: null,
            listingStatus: ListingStatus.DRAFT,
          },
        }),
        this.prisma.property.count({
          where: {
            ownerId,
            deletedAt: null,
            listingStatus: ListingStatus.PENDING_REVIEW,
          },
        }),
        this.prisma.property.count({
          where: {
            ownerId,
            deletedAt: null,
            listingStatus: ListingStatus.RENTED,
          },
        }),
        this.prisma.enquiry.count({
          where: { property: { ownerId } },
        }),
        this.prisma.visitRequest.count({
          where: {
            property: { ownerId },
            status: "PENDING",
          },
        }),
      ]);

    return {
      totalProperties: total,
      published,
      draft,
      pendingReview: pending,
      rented,
      totalEnquiries: enquiries,
      pendingVisitRequests: visits,
    };
  }

  private async assertOwner(propertyId: string, ownerId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
    });
    if (!property) {
      throw new NotFoundException("Property not found");
    }
    if (property.ownerId !== ownerId) {
      throw new ForbiddenException("You do not own this property");
    }
    return property;
  }

  private buildCreateInput(
    ownerId: string,
    dto: CreatePropertyDto,
    listingStatus: ListingStatus,
  ): Prisma.PropertyUncheckedCreateInput {
    return {
      ownerId,
      listingStatus,
      title: dto.title,
      description: dto.description,
      propertyType: dto.propertyType,
      furnishing: dto.furnishing,
      country: dto.country,
      state: dto.state,
      city: dto.city,
      locality: dto.locality,
      addressLine: dto.addressLine,
      showExactAddress: dto.showExactAddress ?? false,
      postalCode: dto.postalCode,
      latitude: dto.latitude,
      longitude: dto.longitude,
      mapLatApprox: dto.latitude,
      mapLngApprox: dto.longitude,
      monthlyRent: dto.monthlyRent,
      securityDeposit: dto.securityDeposit,
      maintenanceCharges: dto.maintenanceCharges,
      leaseDurationMonths: dto.leaseDurationMonths,
      minimumStayMonths: dto.minimumStayMonths,
      availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : undefined,
      rentNegotiable: dto.rentNegotiable ?? false,
      brokerageInfo: dto.brokerageInfo,
      preferredTenantCriteria: dto.preferredTenantCriteria,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      balconies: dto.balconies ?? 0,
      builtUpArea: dto.builtUpArea,
      carpetArea: dto.carpetArea,
      areaUnit: dto.areaUnit ?? "sqft",
      floorNumber: dto.floorNumber,
      totalFloors: dto.totalFloors,
      parkingAvailable: dto.parkingAvailable ?? false,
      propertyAgeYears: dto.propertyAgeYears,
      videoTourUrl: dto.videoTourUrl,
    };
  }

  private mapPropertyData(
    dto: Partial<CreatePropertyDto>,
  ): Prisma.PropertyUpdateInput {
    const data: Prisma.PropertyUpdateInput = {};
    const fields = [
      "title",
      "description",
      "propertyType",
      "furnishing",
      "country",
      "state",
      "city",
      "locality",
      "addressLine",
      "showExactAddress",
      "postalCode",
      "leaseDurationMonths",
      "minimumStayMonths",
      "rentNegotiable",
      "brokerageInfo",
      "preferredTenantCriteria",
      "bedrooms",
      "bathrooms",
      "balconies",
      "areaUnit",
      "floorNumber",
      "totalFloors",
      "parkingAvailable",
      "propertyAgeYears",
      "videoTourUrl",
    ] as const;

    for (const key of fields) {
      if (dto[key] !== undefined) {
        (data as Record<string, unknown>)[key] = dto[key];
      }
    }

    if (dto.monthlyRent !== undefined) data.monthlyRent = dto.monthlyRent;
    if (dto.securityDeposit !== undefined)
      data.securityDeposit = dto.securityDeposit;
    if (dto.maintenanceCharges !== undefined)
      data.maintenanceCharges = dto.maintenanceCharges;
    if (dto.builtUpArea !== undefined) data.builtUpArea = dto.builtUpArea;
    if (dto.carpetArea !== undefined) data.carpetArea = dto.carpetArea;
    if (dto.latitude !== undefined) data.latitude = dto.latitude;
    if (dto.longitude !== undefined) data.longitude = dto.longitude;
    if (dto.availableFrom !== undefined)
      data.availableFrom = new Date(dto.availableFrom);

    return data;
  }

  private resolveSort(sort?: string): Prisma.PropertyOrderByWithRelationInput[] {
    switch (sort) {
      case "rent_asc":
        return [{ monthlyRent: "asc" }];
      case "rent_desc":
        return [{ monthlyRent: "desc" }];
      case "recently_updated":
        return [{ updatedAt: "desc" }];
      case "recommended":
        return [{ enquiryCount: "desc" }, { viewCount: "desc" }];
      case "recently_added":
      default:
        return [{ createdAt: "desc" }];
    }
  }

  private async recordView(propertyId: string, viewerId?: string) {
    await this.prisma.property.update({
      where: { id: propertyId },
      data: { viewCount: { increment: 1 } },
    });
    void viewerId;
  }

  private toCard(
    p: Prisma.PropertyGetPayload<{
      include: { images: true };
    }>,
  ) {
    return {
      id: p.id,
      title: p.title,
      city: p.city,
      locality: p.locality,
      monthlyRent: p.monthlyRent,
      securityDeposit: p.securityDeposit,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      propertyType: p.propertyType,
      furnishing: p.furnishing,
      listingStatus: p.listingStatus,
      availableFrom: p.availableFrom,
      imageUrl: p.images[0]?.url ?? null,
      favouriteCount: p.favouriteCount,
    };
  }

  private toPublicDetail(
    property: Prisma.PropertyGetPayload<{ include: typeof publicInclude }>,
  ) {
    const showExact = property.showExactAddress;
    return {
      ...property,
      addressLine: showExact ? property.addressLine : undefined,
      latitude: showExact ? property.latitude : property.mapLatApprox,
      longitude: showExact ? property.longitude : property.mapLngApprox,
      amenities: property.propertyAmenities.map((pa) => pa.amenity),
      owner: {
        displayName: property.owner.ownerProfile?.displayName,
        contactEmail: property.owner.ownerProfile?.contactEmail,
        contactPhone: property.owner.ownerProfile?.contactPhone,
      },
    };
  }
}
