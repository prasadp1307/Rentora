export const UserRole = {
  TENANT: "TENANT",
  OWNER: "OWNER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AccountStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  PENDING_VERIFICATION: "PENDING_VERIFICATION",
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const PropertyType = {
  APARTMENT: "APARTMENT",
  FLAT: "FLAT",
  INDEPENDENT_HOUSE: "INDEPENDENT_HOUSE",
  VILLA: "VILLA",
  STUDIO: "STUDIO",
  SHARED_ACCOMMODATION: "SHARED_ACCOMMODATION",
  PG: "PG",
  OTHER: "OTHER",
} as const;
export type PropertyType = (typeof PropertyType)[keyof typeof PropertyType];

export const ListingStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  UNPUBLISHED: "UNPUBLISHED",
  RENTED: "RENTED",
  ARCHIVED: "ARCHIVED",
} as const;
export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];

export const FurnishingType = {
  FURNISHED: "FURNISHED",
  SEMI_FURNISHED: "SEMI_FURNISHED",
  UNFURNISHED: "UNFURNISHED",
} as const;
export type FurnishingType = (typeof FurnishingType)[keyof typeof FurnishingType];

export const EnquiryStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  INTERESTED: "INTERESTED",
  CLOSED: "CLOSED",
  WITHDRAWN: "WITHDRAWN",
} as const;
export type EnquiryStatus = (typeof EnquiryStatus)[keyof typeof EnquiryStatus];

export const VisitStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  RESCHEDULED: "RESCHEDULED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;
export type VisitStatus = (typeof VisitStatus)[keyof typeof VisitStatus];

export const PropertySort = {
  RECOMMENDED: "recommended",
  RECENTLY_ADDED: "recently_added",
  RENT_ASC: "rent_asc",
  RENT_DESC: "rent_desc",
  RECENTLY_UPDATED: "recently_updated",
} as const;
export type PropertySort = (typeof PropertySort)[keyof typeof PropertySort];
