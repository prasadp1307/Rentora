import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService } from "../storage/storage.service";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGES = 20;

@Injectable()
export class PropertyImagesService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async createUploadUrl(
    propertyId: string,
    ownerId: string,
    contentType: string,
    fileName: string,
  ) {
    await this.assertOwner(propertyId, ownerId);

    if (!ALLOWED_TYPES.includes(contentType)) {
      throw new BadRequestException("Unsupported image type");
    }

    const count = await this.prisma.propertyImage.count({
      where: { propertyId },
    });
    if (count >= MAX_IMAGES) {
      throw new BadRequestException(`Maximum ${MAX_IMAGES} images allowed`);
    }

    const ext = fileName.split(".").pop() ?? "jpg";
    const storageKey = `properties/${propertyId}/${uuidv4()}.${ext}`;

    const uploadUrl = await this.storage.getSignedUploadUrl(
      storageKey,
      contentType,
    );
    const publicUrl = this.storage.getPublicUrl(storageKey);

    return { uploadUrl, storageKey, publicUrl };
  }

  async confirmUpload(
    propertyId: string,
    ownerId: string,
    body: { storageKey: string; url: string; isPrimary?: boolean },
  ) {
    await this.assertOwner(propertyId, ownerId);

    if (!body.storageKey.startsWith(`properties/${propertyId}/`)) {
      throw new BadRequestException("Invalid storage key");
    }

    const maxOrder = await this.prisma.propertyImage.aggregate({
      where: { propertyId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;
    const isPrimary =
      body.isPrimary ??
      (sortOrder === 0 ||
        (await this.prisma.propertyImage.count({ where: { propertyId } })) ===
          0);

    if (isPrimary) {
      await this.prisma.propertyImage.updateMany({
        where: { propertyId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.propertyImage.create({
      data: {
        propertyId,
        storageKey: body.storageKey,
        url: body.url,
        sortOrder,
        isPrimary,
      },
    });
  }

  async reorder(propertyId: string, ownerId: string, imageIds: string[]) {
    await this.assertOwner(propertyId, ownerId);

    await this.prisma.$transaction(
      imageIds.map((id, index) =>
        this.prisma.propertyImage.updateMany({
          where: { id, propertyId },
          data: { sortOrder: index },
        }),
      ),
    );

    return { message: "Images reordered" };
  }

  async remove(propertyId: string, ownerId: string, imageId: string) {
    await this.assertOwner(propertyId, ownerId);

    const image = await this.prisma.propertyImage.findFirst({
      where: { id: imageId, propertyId },
    });
    if (!image) {
      throw new NotFoundException("Image not found");
    }

    await this.prisma.propertyImage.delete({ where: { id: imageId } });
    await this.storage.deleteObject(image.storageKey).catch(() => undefined);

    return { message: "Image removed" };
  }

  private async assertOwner(propertyId: string, ownerId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, deletedAt: null },
    });
    if (!property) {
      throw new NotFoundException("Property not found");
    }
    if (property.ownerId !== ownerId) {
      throw new ForbiddenException("You do not own this property");
    }
  }
}
