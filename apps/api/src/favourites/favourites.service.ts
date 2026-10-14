import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ListingStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FavouritesService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    const favourites = await this.prisma.favourite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          include: {
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });

    return favourites
      .filter((f) => f.property.deletedAt === null)
      .map((f) => ({
        id: f.id,
        propertyId: f.propertyId,
        createdAt: f.createdAt,
        property: {
          id: f.property.id,
          title: f.property.title,
          city: f.property.city,
          locality: f.property.locality,
          monthlyRent: f.property.monthlyRent,
          bedrooms: f.property.bedrooms,
          bathrooms: f.property.bathrooms,
          listingStatus: f.property.listingStatus,
          imageUrl: f.property.images[0]?.url ?? null,
        },
      }));
  }

  async add(userId: string, propertyId: string) {
    const property = await this.prisma.property.findFirst({
      where: {
        id: propertyId,
        deletedAt: null,
        listingStatus: ListingStatus.PUBLISHED,
      },
    });
    if (!property) {
      throw new NotFoundException("Property not found");
    }

    try {
      await this.prisma.$transaction([
        this.prisma.favourite.create({
          data: { userId, propertyId },
        }),
        this.prisma.property.update({
          where: { id: propertyId },
          data: { favouriteCount: { increment: 1 } },
        }),
      ]);
    } catch {
      throw new ConflictException("Already in favourites");
    }

    return { message: "Added to favourites" };
  }

  async remove(userId: string, propertyId: string) {
    const fav = await this.prisma.favourite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });
    if (!fav) {
      throw new NotFoundException("Favourite not found");
    }

    await this.prisma.$transaction([
      this.prisma.favourite.delete({
        where: { userId_propertyId: { userId, propertyId } },
      }),
      this.prisma.property.update({
        where: { id: propertyId },
        data: { favouriteCount: { decrement: 1 } },
      }),
    ]);

    return { message: "Removed from favourites" };
  }
}
