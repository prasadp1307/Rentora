"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchHero({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [maxRent, setMaxRent] = useState("");

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.set("city", city.trim());
    if (maxRent.trim()) params.set("maxRent", maxRent.trim());
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSearch}
      className={`flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center ${compact ? "" : "lg:p-4"}`}
    >
      <label className="flex-1">
        <span className="sr-only">City</span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City or locality"
          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-brand-600 focus:ring-2"
        />
      </label>
      <label className="sm:w-44">
        <span className="sr-only">Max rent</span>
        <input
          value={maxRent}
          onChange={(e) => setMaxRent(e.target.value)}
          placeholder="Max rent (₹)"
          inputMode="numeric"
          className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none ring-brand-600 focus:ring-2"
        />
      </label>
      <Button type="submit" size="lg" className="gap-2">
        <Search className="h-4 w-4" />
        Search
      </Button>
    </form>
  );
}
