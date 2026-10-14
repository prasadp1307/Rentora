import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole, VisitStatus } from "@prisma/client";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/types/jwt-payload";
import { VisitsService } from "./visits.service";

class CreateVisitDto {
  @IsDateString()
  requestedAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}

class UpdateVisitStatusDto {
  @IsEnum(VisitStatus)
  status!: VisitStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  ownerResponse?: string;

  @IsOptional()
  @IsDateString()
  rescheduledAt?: string;
}

@ApiTags("visits")
@Controller()
export class VisitsController {
  constructor(private visitsService: VisitsService) {}

  @Post("properties/:id/visits")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT)
  @ApiBearerAuth()
  create(
    @Param("id") propertyId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateVisitDto,
  ) {
    return this.visitsService.create(
      user.sub,
      propertyId,
      dto.requestedAt,
      dto.message,
    );
  }

  @Get("tenants/me/visits")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT)
  @ApiBearerAuth()
  tenantVisits(@CurrentUser() user: JwtPayload) {
    return this.visitsService.listForTenant(user.sub);
  }

  @Get("owners/me/visits")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  ownerVisits(@CurrentUser() user: JwtPayload) {
    return this.visitsService.listForOwner(user.sub);
  }

  @Patch("visits/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT, UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  updateStatus(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateVisitStatusDto,
  ) {
    return this.visitsService.updateStatus(
      id,
      user.sub,
      user.role,
      dto.status,
      dto.ownerResponse,
      dto.rescheduledAt,
    );
  }
}
