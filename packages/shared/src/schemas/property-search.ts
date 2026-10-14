import { z } from "zod";
import { FurnishingType, PropertySort, PropertyType } from "../enums";

export const propertySearchQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  city: z.string().max(100).optional(),
  locality: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  keyword: z.string().max(200).optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  minRent: z.coerce.number().min(0).optional(),
  maxRent: z.coerce.number().min(0).optional(),
  bedrooms: z.coerce.number().int().min(0).max(20).optional(),
  furnishing: z.nativeEnum(FurnishingType).optional(),
  availableFrom: z.string().datetime().optional(),
  amenities: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (typeof v === "string" ? v.split(",").filter(Boolean) : v)),
  parking: z.coerce.boolean().optional(),
  sort: z.nativeEnum(PropertySort).default(PropertySort.RECENTLY_ADDED),
});

export type PropertySearchQuery = z.infer<typeof propertySearchQuerySchema>;
