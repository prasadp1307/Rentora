export type PropertyCard = {
  id: string;
  title: string;
  city: string;
  locality: string;
  monthlyRent: string | number;
  securityDeposit?: string | number | null;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  furnishing: string;
  listingStatus: string;
  availableFrom?: string | null;
  imageUrl?: string | null;
  favouriteCount?: number;
};

export type Paginated<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AuthUser = {
  id: string;
  email: string;
  role: "TENANT" | "OWNER" | "ADMIN";
  status: string;
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string | null;
  };
};
