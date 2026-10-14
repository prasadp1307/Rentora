import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtPayload } from "../auth/types/jwt-payload";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { PropertySearchDto } from "./dto/property-search.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";
import { PropertyImagesService } from "./property-images.service";
import { PropertiesService } from "./properties.service";

@ApiTags("properties")
@Controller()
export class PropertiesController {
  constructor(
    private propertiesService: PropertiesService,
    private imagesService: PropertyImagesService,
  ) {}

  @Get("properties")
  search(@Query() query: PropertySearchDto) {
    return this.propertiesService.search(query);
  }

  @Get("properties/:id")
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param("id") id: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.propertiesService.findPublicById(id, user?.sub);
  }

  @Post("properties")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(user.sub, dto);
  }

  @Patch("properties/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  update(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(id, user.sub, dto);
  }

  @Delete("properties/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  remove(@Param("id") id: string, @CurrentUser() user: JwtPayload) {
    return this.propertiesService.softDelete(id, user.sub);
  }

  @Post("properties/:id/publish")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  publish(@Param("id") id: string, @CurrentUser() user: JwtPayload) {
    return this.propertiesService.publish(id, user.sub);
  }

  @Post("properties/:id/unpublish")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  unpublish(@Param("id") id: string, @CurrentUser() user: JwtPayload) {
    return this.propertiesService.unpublish(id, user.sub);
  }

  @Post("properties/:id/mark-rented")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  markRented(@Param("id") id: string, @CurrentUser() user: JwtPayload) {
    return this.propertiesService.markRented(id, user.sub);
  }

  @Get("owners/me/properties")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  myProperties(@CurrentUser() user: JwtPayload) {
    return this.propertiesService.listOwnerProperties(user.sub);
  }

  @Get("owners/me/dashboard")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  ownerDashboard(@CurrentUser() user: JwtPayload) {
    return this.propertiesService.ownerDashboardStats(user.sub);
  }

  @Post("properties/:id/images/upload-url")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  uploadUrl(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { contentType: string; fileName: string },
  ) {
    return this.imagesService.createUploadUrl(
      id,
      user.sub,
      body.contentType,
      body.fileName,
    );
  }

  @Post("properties/:id/images/confirm")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  confirmImage(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      storageKey: string;
      url: string;
      isPrimary?: boolean;
    },
  ) {
    return this.imagesService.confirmUpload(id, user.sub, body);
  }

  @Patch("properties/:id/images/reorder")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  reorderImages(
    @Param("id") id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { imageIds: string[] },
  ) {
    return this.imagesService.reorder(id, user.sub, body.imageIds);
  }

  @Delete("properties/:id/images/:imageId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  deleteImage(
    @Param("id") id: string,
    @Param("imageId") imageId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.imagesService.remove(id, user.sub, imageId);
  }
}
