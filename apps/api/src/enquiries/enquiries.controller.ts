import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { EnquiryStatus, UserRole } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/types/jwt-payload";
import { EnquiriesService } from "./enquiries.service";

class CreateEnquiryDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

class UpdateEnquiryStatusDto {
  @IsEnum(EnquiryStatus)
  status!: EnquiryStatus;
}

@ApiTags("enquiries")
@Controller()
export class EnquiriesController {
  constructor(private enquiriesService: EnquiriesService) {}

  @Post("properties/:id/enquiries")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT)
  @ApiBearerAuth()
  create(
    @Param("id") propertyId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateEnquiryDto,
  ) {
    return this.enquiriesService.create(user.sub, propertyId, dto.message);
  }

  @Get("tenants/me/enquiries")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT)
  @ApiBearerAuth()
  tenantEnquiries(@CurrentUser() user: JwtPayload) {
    return this.enquiriesService.listForTenant(user.sub);
  }

  @Get("owners/me/enquiries")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  ownerEnquiries(@CurrentUser() user: JwtPayload) {
    return this.enquiriesService.listForOwner(user.sub);
  }

  @Patch("enquiries/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  updateStatus(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateEnquiryStatusDto,
  ) {
    return this.enquiriesService.updateStatus(
      id,
      user.sub,
      user.role,
      dto.status,
    );
  }
}
