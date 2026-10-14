import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AccountStatus, ListingStatus, UserRole } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/types/jwt-payload";
import { AdminService } from "./admin.service";

class UpdateUserStatusDto {
  @IsEnum(AccountStatus)
  status!: AccountStatus;
}

class ModerationDto {
  @IsEnum(ListingStatus)
  listingStatus!: ListingStatus;

  @IsOptional()
  @IsString()
  moderationNote?: string;
}

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get("dashboard")
  dashboard() {
    return this.adminService.dashboard();
  }

  @Get("users")
  users(@Query("page") page?: number, @Query("limit") limit?: number) {
    return this.adminService.listUsers(Number(page) || 1, Number(limit) || 20);
  }

  @Patch("users/:id/status")
  updateUserStatus(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto.status, user.sub);
  }

  @Get("properties")
  properties(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("status") status?: ListingStatus,
  ) {
    return this.adminService.listProperties(
      Number(page) || 1,
      Number(limit) || 20,
      status,
    );
  }

  @Patch("properties/:id/moderation-status")
  moderateProperty(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ModerationDto,
  ) {
    return this.adminService.moderateProperty(
      id,
      dto.listingStatus,
      dto.moderationNote,
      user.sub,
    );
  }

  @Get("audit-logs")
  auditLogs(@Query("page") page?: number, @Query("limit") limit?: number) {
    return this.adminService.auditLogs(Number(page) || 1, Number(limit) || 50);
  }
}
