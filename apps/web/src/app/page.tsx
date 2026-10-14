import Link from "next/link";
import { PropertyCard } from "@/components/property-card";
import { SearchHero } from "@/components/search-hero";
import { apiFetch } from "@/lib/api";
import type { Paginated, PropertyCard as PropertyCardType } from "@/lib/types";

async function getFeatured() {
  try {
    return await apiFetch<Paginated<PropertyCardType>>(
      "/properties?limit=6&sort=recently_added",
    );
  } catch {
    return { items: [], pagination: { page: 1, limit: 6, total: 0, totalPages: 0 } };
  }
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <div>
      <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50/70 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              Premium rentals, simplified
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Find a home that fits your life
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Search by city, budget, and lifestyle. Save favourites, compare
              listings, and reach owners directly.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-4xl">
            <SearchHero />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Recently added
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Fresh listings from verified owners
            </p>
          </div>
          <Link
            href="/properties"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            View all
          </Link>
        </div>
        {featured.items.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-600">
            Start the API and run database migrations to load demo listings.
          </div>
        )}
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
          {[
            {
              title: "Search smarter",
              body: "Filter by rent, bedrooms, furnishing, amenities, and availability with server-side pagination.",
            },
            {
              title: "Compare with confidence",
              body: "Shortlist favourites and compare rent, location, and amenities side by side.",
            },
            {
              title: "Owners stay in control",
              body: "Publish listings, manage enquiries, and approve visit requests from one dashboard.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
