import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { FurnishingType, PropertyType } from "@prisma/client";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";

export class CreatePropertyDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(10)
  description!: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @ApiProperty({ enum: FurnishingType })
  @IsEnum(FurnishingType)
  furnishing!: FurnishingType;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  country!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  state!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  locality!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(500)
  addressLine!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showExactAddress?: boolean;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  postalCode!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  monthlyRent!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  securityDeposit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  maintenanceCharges?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  leaseDurationMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumStayMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  rentNegotiable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  brokerageInfo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  preferredTenantCriteria?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  bedrooms!: number;

  @ApiProperty()
  @IsInt()
  @Min(0)
  bathrooms!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  balconies?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  builtUpArea?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  carpetArea?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  areaUnit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  floorNumber?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  totalFloors?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  parkingAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  propertyAgeYears?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoTourUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  amenityIds?: string[];

  @ApiPropertyOptional({ description: "Save as draft when true" })
  @IsOptional()
  @IsBoolean()
  asDraft?: boolean;
}
