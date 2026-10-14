import { Module } from "@nestjs/common";
import { PropertiesController } from "./properties.controller";
import { PropertiesService } from "./properties.service";
import { PropertyImagesService } from "./property-images.service";

@Module({
  controllers: [PropertiesController],
  providers: [PropertiesService, PropertyImagesService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
