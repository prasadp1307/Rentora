import { PropertyCard } from "@/components/property-card";
import { SearchHero } from "@/components/search-hero";
import { apiFetch } from "@/lib/api";
import type { Paginated, PropertyCard as PropertyCardType } from "@/lib/types";
import { PropertyFilters } from "./property-filters";

type SearchParams = Record<string, string | string[] | undefined>;

function toQuery(params: SearchParams) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value) qs.set(key, value);
  }
  return qs.toString();
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const query = toQuery(sp);

  let results: Paginated<PropertyCardType> = {
    items: [],
    pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
  };

  try {
    results = await apiFetch<Paginated<PropertyCardType>>(
      `/properties?${query || "limit=12"}`,
    );
  } catch {
    /* empty */
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Browse properties</h1>
        <p className="mt-2 text-slate-600">
          {results.pagination.total} homes match your search
        </p>
      </div>

      <div className="mb-6">
        <SearchHero compact />
      </div>

      <PropertyFilters initial={sp} />

      {results.items.length ? (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.items.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          {results.pagination.totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: results.pagination.totalPages }).map(
                (_, i) => {
                  const page = i + 1;
                  const params = new URLSearchParams(query);
                  params.set("page", String(page));
                  return (
                    <a
                      key={page}
                      href={`/properties?${params.toString()}`}
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm ${
                        page === results.pagination.page
                          ? "border-brand-700 bg-brand-700 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </a>
                  );
                },
              )}
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-base font-medium text-slate-900">No properties found</p>
          <p className="mt-2 text-sm text-slate-600">
            Try clearing filters or searching another city.
          </p>
        </div>
      )}
    </div>
  );
}
