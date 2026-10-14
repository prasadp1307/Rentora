import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { EnquiryStatus, ListingStatus, NotificationType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class EnquiriesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(tenantId: string, propertyId: string, message?: string) {
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

    const recent = await this.prisma.enquiry.findFirst({
      where: {
        tenantId,
        propertyId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        status: { not: EnquiryStatus.WITHDRAWN },
      },
    });
    if (recent) {
      throw new BadRequestException(
        "You already sent an enquiry for this property recently",
      );
    }

    const enquiry = await this.prisma.$transaction(async (tx) => {
      const created = await tx.enquiry.create({
        data: {
          tenantId,
          propertyId,
          message,
        },
        include: { property: true },
      });
      await tx.property.update({
        where: { id: propertyId },
        data: { enquiryCount: { increment: 1 } },
      });
      return created;
    });

    await this.notifications.create(property.ownerId, {
      type: NotificationType.ENQUIRY_NEW,
      title: "New rental enquiry",
      body: `You received a new enquiry for "${property.title}".`,
      data: { enquiryId: enquiry.id, propertyId },
    });

    return enquiry;
  }

  async listForTenant(tenantId: string) {
    return this.prisma.enquiry.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });
  }

  async listForOwner(ownerId: string) {
    return this.prisma.enquiry.findMany({
      where: { property: { ownerId } },
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { id: true, title: true } },
        tenant: {
          select: {
            id: true,
            email: true,
            profile: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
      },
    });
  }

  async updateStatus(
    enquiryId: string,
    actorId: string,
    role: "OWNER" | "TENANT" | "ADMIN",
    status: EnquiryStatus,
  ) {
    const enquiry = await this.prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: { property: true },
    });
    if (!enquiry) {
      throw new NotFoundException("Enquiry not found");
    }

    if (role === "TENANT") {
      if (enquiry.tenantId !== actorId) {
        throw new ForbiddenException();
      }
      if (status !== EnquiryStatus.WITHDRAWN) {
        throw new BadRequestException("Tenants can only withdraw enquiries");
      }
    } else if (role === "OWNER") {
      if (enquiry.property.ownerId !== actorId) {
        throw new ForbiddenException();
      }
    }

    const updated = await this.prisma.enquiry.update({
      where: { id: enquiryId },
      data: { status },
    });

    await this.notifications.create(enquiry.tenantId, {
      type: NotificationType.ENQUIRY_STATUS,
      title: "Enquiry status updated",
      body: `Your enquiry for "${enquiry.property.title}" is now ${status}.`,
      data: { enquiryId, status },
    });

    return updated;
  }
}
