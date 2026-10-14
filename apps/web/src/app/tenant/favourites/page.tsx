"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PropertyCard } from "@/components/property-card";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import type { PropertyCard as PropertyCardType } from "@/lib/types";

type FavouriteRow = {
  id: string;
  property: PropertyCardType;
};

export default function FavouritesPage() {
  const { user, accessToken, loading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["favourites"],
    enabled: !!accessToken && user?.role === "TENANT",
    queryFn: () => apiFetch<FavouriteRow[]>("/favourites", { token: accessToken! }),
  });

  if (loading) return null;

  if (!user || user.role !== "TENANT") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-700">
        Tenant sign-in required. <Link href="/login" className="text-brand-700">Log in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Favourites</h1>
      {isLoading && <p className="mt-4 text-sm text-slate-600">Loading...</p>}
      {!isLoading && !data?.length && (
        <p className="mt-6 text-slate-600">No saved properties yet.</p>
      )}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((row) => (
          <PropertyCard key={row.id} property={row.property} />
        ))}
      </div>
    </div>
  );
}
