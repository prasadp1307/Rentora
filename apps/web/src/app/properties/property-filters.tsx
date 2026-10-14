"use client";

import { useRouter, useSearchParams } from "next/navigation";

const PROPERTY_TYPES = [
  "APARTMENT",
  "FLAT",
  "STUDIO",
  "VILLA",
  "INDEPENDENT_HOUSE",
];

export function PropertyFilters({
  initial,
}: {
  initial: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/properties?${next.toString()}`);
  }

  function clearAll() {
    router.push("/properties");
  }

  const active = Object.entries(initial).filter(
    ([k, v]) => v && k !== "page" && k !== "limit",
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Bedrooms (min)</span>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3"
            defaultValue={String(initial.bedrooms ?? "")}
            onChange={(e) => update("bedrooms", e.target.value)}
          >
            <option value="">Any</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Type</span>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3"
            defaultValue={String(initial.propertyType ?? "")}
            onChange={(e) => update("propertyType", e.target.value)}
          >
            <option value="">Any</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Sort</span>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3"
            defaultValue={String(initial.sort ?? "recently_added")}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="recently_added">Recently added</option>
            <option value="rent_asc">Rent: low to high</option>
            <option value="rent_desc">Rent: high to low</option>
            <option value="recently_updated">Recently updated</option>
          </select>
        </label>
        <button
          type="button"
          onClick={clearAll}
          className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Clear filters
        </button>
      </div>
      {active.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {active.map(([key, value]) => (
            <span
              key={key}
              className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800"
            >
              {key}: {String(value)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
