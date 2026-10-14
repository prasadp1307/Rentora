import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ListingStatus, NotificationType, VisitStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class VisitsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(
    tenantId: string,
    propertyId: string,
    requestedAt: string,
    message?: string,
  ) {
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

    const when = new Date(requestedAt);
    if (Number.isNaN(when.getTime()) || when < new Date()) {
      throw new BadRequestException("Requested visit time must be in the future");
    }

    const visit = await this.prisma.visitRequest.create({
      data: {
        tenantId,
        propertyId,
        requestedAt: when,
        message,
      },
    });

    await this.notifications.create(property.ownerId, {
      type: NotificationType.VISIT_REQUEST,
      title: "New visit request",
      body: `A tenant requested a visit for "${property.title}".`,
      data: { visitId: visit.id, propertyId },
    });

    return visit;
  }

  async listForTenant(tenantId: string) {
    return this.prisma.visitRequest.findMany({
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
    return this.prisma.visitRequest.findMany({
      where: { property: { ownerId } },
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { id: true, title: true } },
        tenant: {
          select: {
            profile: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
      },
    });
  }

  async updateStatus(
    visitId: string,
    actorId: string,
    role: "OWNER" | "TENANT" | "ADMIN",
    status: VisitStatus,
    ownerResponse?: string,
    rescheduledAt?: string,
  ) {
    const visit = await this.prisma.visitRequest.findUnique({
      where: { id: visitId },
      include: { property: true },
    });
    if (!visit) {
      throw new NotFoundException("Visit request not found");
    }

    if (role === "TENANT") {
      if (visit.tenantId !== actorId) {
        throw new ForbiddenException();
      }
      if (status !== VisitStatus.CANCELLED) {
        throw new BadRequestException("Invalid status for tenant");
      }
    } else if (role === "OWNER") {
      if (visit.property.ownerId !== actorId) {
        throw new ForbiddenException();
      }
    }

    const updated = await this.prisma.visitRequest.update({
      where: { id: visitId },
      data: {
        status,
        ownerResponse,
        rescheduledAt: rescheduledAt ? new Date(rescheduledAt) : undefined,
      },
    });

    await this.notifications.create(visit.tenantId, {
      type: NotificationType.VISIT_STATUS,
      title: "Visit request updated",
      body: `Your visit request for "${visit.property.title}" is now ${status}.`,
      data: { visitId, status },
    });

    return updated;
  }
}
