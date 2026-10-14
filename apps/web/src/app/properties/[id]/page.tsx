import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { PropertyActions } from "./property-actions";

type PropertyDetail = {
  id: string;
  title: string;
  description: string;
  city: string;
  locality: string;
  monthlyRent: string | number;
  securityDeposit?: string | number | null;
  maintenanceCharges?: string | number | null;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  furnishing: string;
  availableFrom?: string | null;
  images: { url: string; isPrimary: boolean }[];
  amenities: { name: string; slug: string }[];
  owner?: {
    displayName?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
};

async function getProperty(id: string) {
  try {
    return await apiFetch<PropertyDetail>(`/properties/${id}`);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) return { title: "Property not found" };
  return {
    title: property.title,
    description: property.description.slice(0, 160),
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 160),
      images: property.images[0]?.url ? [property.images[0].url] : [],
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const gallery = property.images.length
    ? property.images
    : [{ url: "https://images.unsplash.com/photo-1560448204-e02f11c2d0e2?w=1200&q=80", isPrimary: true }];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: property.title,
    description: property.description,
    numberOfRooms: property.bedrooms,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.locality,
      addressRegion: property.city,
    },
    offers: {
      "@type": "Offer",
      price: property.monthlyRent,
      priceCurrency: "INR",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {gallery.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-xl bg-slate-100 ${idx === 0 ? "sm:col-span-2 aspect-[16/9]" : "aspect-[4/3]"}`}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="50vw" />
              </div>
            ))}
          </div>

          <h1 className="mt-8 text-3xl font-bold text-slate-900">{property.title}</h1>
          <p className="mt-2 text-slate-600">
            {property.locality}, {property.city}
          </p>

          <div className="mt-6 prose prose-slate max-w-none">
            <p className="whitespace-pre-wrap text-slate-700">{property.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">Amenities</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {property.amenities.map((a) => (
                <li
                  key={a.slug}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                >
                  {a.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-3xl font-bold text-brand-700">
              {formatCurrency(property.monthlyRent)}
              <span className="text-base font-normal text-slate-500"> / month</span>
            </p>
            {property.securityDeposit != null && (
              <p className="mt-2 text-sm text-slate-600">
                Deposit: {formatCurrency(property.securityDeposit)}
              </p>
            )}
            <p className="mt-4 text-sm text-slate-600">
              {property.bedrooms} bed · {property.bathrooms} bath ·{" "}
              {property.propertyType.replaceAll("_", " ")} ·{" "}
              {property.furnishing.replaceAll("_", " ")}
            </p>
            <PropertyActions propertyId={property.id} />
          </div>

          {property.owner?.displayName && (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Contact
              </h2>
              <p className="mt-2 font-medium text-slate-900">
                {property.owner.displayName}
              </p>
              {property.owner.contactPhone && (
                <p className="mt-1 text-sm text-slate-600">{property.owner.contactPhone}</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
