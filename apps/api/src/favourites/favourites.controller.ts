import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/types/jwt-payload";
import { FavouritesService } from "./favourites.service";

@ApiTags("favourites")
@Controller("favourites")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TENANT)
@ApiBearerAuth()
export class FavouritesController {
  constructor(private favouritesService: FavouritesService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.favouritesService.list(user.sub);
  }

  @Post(":propertyId")
  add(@CurrentUser() user: JwtPayload, @Param("propertyId") propertyId: string) {
    return this.favouritesService.add(user.sub, propertyId);
  }

  @Delete(":propertyId")
  remove(
    @CurrentUser() user: JwtPayload,
    @Param("propertyId") propertyId: string,
  ) {
    return this.favouritesService.remove(user.sub, propertyId);
  }
}
