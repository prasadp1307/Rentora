import { Injectable, NotFoundException } from "@nestjs/common";
import {
  AccountStatus,
  ListingStatus,
  NotificationType,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async dashboard() {
    const [
      users,
      tenants,
      owners,
      properties,
      published,
      pending,
      enquiries,
      reports,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: "TENANT" } }),
      this.prisma.user.count({ where: { role: "OWNER" } }),
      this.prisma.property.count({ where: { deletedAt: null } }),
      this.prisma.property.count({
        where: { listingStatus: ListingStatus.PUBLISHED, deletedAt: null },
      }),
      this.prisma.property.count({
        where: { listingStatus: ListingStatus.PENDING_REVIEW, deletedAt: null },
      }),
      this.prisma.enquiry.count(),
      this.prisma.report.count({ where: { status: "OPEN" } }),
    ]);

    return {
      users,
      tenants,
      owners,
      properties,
      publishedListings: published,
      pendingReview: pending,
      enquiries,
      openReports: reports,
    };
  }

  async listUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
          profile: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.user.count(),
    ]);
    return { items, pagination: { page, limit, total } };
  }

  async updateUserStatus(
    userId: string,
    status: AccountStatus,
    actorId: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id: userId },
        data: { status },
      });
      await tx.auditLog.create({
        data: {
          actorId,
          action: "USER_STATUS_UPDATE",
          entityType: "User",
          entityId: userId,
          metadata: { status },
        },
      });
      return u;
    });

    return updated;
  }

  async listProperties(page = 1, limit = 20, status?: ListingStatus) {
    const skip = (page - 1) * limit;
    const where: Prisma.PropertyWhereInput = {
      deletedAt: null,
      ...(status ? { listingStatus: status } : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          owner: {
            select: {
              email: true,
              profile: { select: { firstName: true, lastName: true } },
            },
          },
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      this.prisma.property.count({ where }),
    ]);
    return { items, pagination: { page, limit, total } };
  }

  async moderateProperty(
    propertyId: string,
    listingStatus: ListingStatus,
    moderationNote: string | undefined,
    actorId: string,
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      throw new NotFoundException("Property not found");
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const p = await tx.property.update({
        where: { id: propertyId },
        data: {
          listingStatus,
          moderationNote,
          ...(listingStatus === ListingStatus.PUBLISHED
            ? { publishedAt: new Date() }
            : {}),
        },
      });
      await tx.auditLog.create({
        data: {
          actorId,
          action: "PROPERTY_MODERATION",
          entityType: "Property",
          entityId: propertyId,
          metadata: { listingStatus, moderationNote },
        },
      });
      return p;
    });

    await this.notifications.create(property.ownerId, {
      type: NotificationType.LISTING_MODERATION,
      title: "Listing moderation update",
      body: `Your listing "${property.title}" status is now ${listingStatus}.`,
      data: { propertyId, listingStatus },
    });

    return updated;
  }

  async auditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          actor: {
            select: { email: true, role: true },
          },
        },
      }),
      this.prisma.auditLog.count(),
    ]);
    return { items, pagination: { page, limit, total } };
  }
}
