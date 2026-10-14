import {
  AccountStatus,
  FurnishingType,
  ListingStatus,
  PropertyType,
  UserRole,
} from "@prisma/client";
import * as argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AMENITIES = [
  { slug: "lift", name: "Lift", category: "building" },
  { slug: "power-backup", name: "Power backup", category: "building" },
  { slug: "water-supply", name: "24x7 water supply", category: "utilities" },
  { slug: "security", name: "Security", category: "building" },
  { slug: "gym", name: "Gym", category: "lifestyle" },
  { slug: "swimming-pool", name: "Swimming pool", category: "lifestyle" },
  { slug: "garden", name: "Garden", category: "outdoor" },
  { slug: "public-transport", name: "Public transport nearby", category: "location" },
  { slug: "internet", name: "Internet ready", category: "utilities" },
  { slug: "pets-allowed", name: "Pet friendly", category: "policy" },
];

async function main() {
  const passwordHash = await argon2.hash("Password1!", { type: argon2.argon2id });

  for (const a of AMENITIES) {
    await prisma.amenity.upsert({
      where: { slug: a.slug },
      create: a,
      update: { name: a.name, category: a.category },
    });
  }

  const admin = await prisma.user.upsert({
    where: { email: "admin@rentora.local" },
    update: {},
    create: {
      email: "admin@rentora.local",
      passwordHash,
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: { firstName: "Rentora", lastName: "Admin" },
      },
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: "owner@rentora.local" },
    update: {},
    create: {
      email: "owner@rentora.local",
      passwordHash,
      role: UserRole.OWNER,
      status: AccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: "Priya",
          lastName: "Sharma",
          phone: "+91-9000000001",
        },
      },
      ownerProfile: {
        create: {
          displayName: "Priya Sharma",
          contactEmail: "owner@rentora.local",
          contactPhone: "+91-9000000001",
        },
      },
    },
  });

  const tenant = await prisma.user.upsert({
    where: { email: "tenant@rentora.local" },
    update: {},
    create: {
      email: "tenant@rentora.local",
      passwordHash,
      role: UserRole.TENANT,
      status: AccountStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          firstName: "Arjun",
          lastName: "Mehta",
          phone: "+91-9000000002",
        },
      },
    },
  });

  const lift = await prisma.amenity.findUnique({ where: { slug: "lift" } });
  const gym = await prisma.amenity.findUnique({ where: { slug: "gym" } });
  const internet = await prisma.amenity.findUnique({ where: { slug: "internet" } });

  const existingCount = await prisma.property.count({
    where: { ownerId: owner.id },
  });

  if (existingCount === 0) {
    await prisma.property.createMany({
      data: [
        {
          ownerId: owner.id,
          title: "Sunlit 2BHK in Indiranagar",
          description:
            "Bright corner apartment with cross ventilation, modern kitchen, and dedicated workspace nook. Walking distance to cafés and metro.",
          propertyType: PropertyType.APARTMENT,
          listingStatus: ListingStatus.PUBLISHED,
          furnishing: FurnishingType.SEMI_FURNISHED,
          country: "India",
          state: "Karnataka",
          city: "Bengaluru",
          locality: "Indiranagar",
          addressLine: "12th Main, Indiranagar",
          showExactAddress: false,
          postalCode: "560038",
          mapLatApprox: 12.9784,
          mapLngApprox: 77.6408,
          monthlyRent: 32000,
          securityDeposit: 96000,
          maintenanceCharges: 2500,
          leaseDurationMonths: 11,
          availableFrom: new Date(),
          rentNegotiable: true,
          bedrooms: 2,
          bathrooms: 2,
          balconies: 1,
          builtUpArea: 1050,
          carpetArea: 890,
          parkingAvailable: true,
          propertyAgeYears: 6,
          publishedAt: new Date(),
          viewCount: 42,
        },
        {
          ownerId: owner.id,
          title: "Compact studio near HSR Layout",
          description:
            "Fully furnished studio ideal for working professionals. High-speed internet ready building with 24x7 security.",
          propertyType: PropertyType.STUDIO,
          listingStatus: ListingStatus.PUBLISHED,
          furnishing: FurnishingType.FURNISHED,
          country: "India",
          state: "Karnataka",
          city: "Bengaluru",
          locality: "HSR Layout",
          addressLine: "Sector 2, HSR Layout",
          showExactAddress: false,
          postalCode: "560102",
          mapLatApprox: 12.9116,
          mapLngApprox: 77.6473,
          monthlyRent: 18500,
          securityDeposit: 55500,
          availableFrom: new Date(),
          bedrooms: 1,
          bathrooms: 1,
          builtUpArea: 480,
          parkingAvailable: false,
          publishedAt: new Date(),
          viewCount: 28,
        },
        {
          ownerId: owner.id,
          title: "Family villa in Whitefield (Draft)",
          description: "Spacious 3BHK villa with private garden — owner draft listing.",
          propertyType: PropertyType.VILLA,
          listingStatus: ListingStatus.DRAFT,
          furnishing: FurnishingType.UNFURNISHED,
          country: "India",
          state: "Karnataka",
          city: "Bengaluru",
          locality: "Whitefield",
          addressLine: "Hope Farm Junction area",
          postalCode: "560066",
          monthlyRent: 65000,
          securityDeposit: 200000,
          bedrooms: 3,
          bathrooms: 3,
          builtUpArea: 2200,
          parkingAvailable: true,
        },
      ],
    });

    const published = await prisma.property.findMany({
      where: { ownerId: owner.id, listingStatus: ListingStatus.PUBLISHED },
    });

    for (const [index, property] of published.entries()) {
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          storageKey: `seed/${property.id}/primary.jpg`,
          url: `https://images.unsplash.com/photo-1560448204-e02f11c2d0e2?w=800&q=80&sig=${index}`,
          sortOrder: 0,
          isPrimary: true,
        },
      });

      const amenityIds = [lift, gym, internet].filter(Boolean).map((a) => a!.id);
      if (amenityIds.length) {
        await prisma.propertyAmenity.createMany({
          data: amenityIds.map((amenityId) => ({
            propertyId: property.id,
            amenityId,
          })),
          skipDuplicates: true,
        });
      }
    }
  }

  await prisma.location.upsert({
    where: { slug: "bengaluru" },
    create: {
      country: "India",
      state: "Karnataka",
      city: "Bengaluru",
      slug: "bengaluru",
      isPopular: true,
    },
    update: { isPopular: true },
  });

  console.log("Seed complete.");
  console.log("Admin:", admin.email);
  console.log("Owner:", owner.email);
  console.log("Tenant:", tenant.email);
  console.log("Password for all demo accounts: Password1!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
