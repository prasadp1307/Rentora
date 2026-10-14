import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      preferences?: Record<string, unknown>;
    },
  ) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return this.prisma.userProfile.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        preferences: data.preferences as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async updateOwnerProfile(
    userId: string,
    data: {
      displayName?: string;
      contactEmail?: string;
      contactPhone?: string;
      bio?: string;
      companyName?: string;
    },
  ) {
    return this.prisma.ownerProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
