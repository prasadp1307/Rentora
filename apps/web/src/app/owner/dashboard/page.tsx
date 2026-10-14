"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";

type OwnerStats = {
  totalProperties: number;
  published: number;
  draft: number;
  pendingReview: number;
  rented: number;
  totalEnquiries: number;
  pendingVisitRequests: number;
};

export default function OwnerDashboardPage() {
  const { user, accessToken, loading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["owner-dashboard"],
    enabled: !!accessToken && user?.role === "OWNER",
    queryFn: () =>
      apiFetch<OwnerStats>("/owners/me/dashboard", { token: accessToken! }),
  });

  if (loading) return null;

  if (!user || user.role !== "OWNER") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-700">Owner access required.</p>
        <Link href="/login" className="mt-4 inline-block text-brand-700 hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Owner dashboard</h1>
          <p className="mt-1 text-slate-600">Manage listings, enquiries, and visits.</p>
        </div>
        <Link
          href="/owner/properties/new"
          className="inline-flex h-10 items-center rounded-lg bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
        >
          Add property
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total properties", data?.totalProperties],
          ["Published", data?.published],
          ["Drafts", data?.draft],
          ["Pending review", data?.pendingReview],
          ["Rented", data?.rented],
          ["Enquiries", data?.totalEnquiries],
          ["Pending visits", data?.pendingVisitRequests],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {isLoading ? "—" : (value ?? 0)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/owner/properties" className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
          My properties
        </Link>
        <Link href="/owner/enquiries" className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
          Enquiries
        </Link>
        <Link href="/owner/visits" className="rounded-lg border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
          Visit requests
        </Link>
      </div>
    </div>
  );
}
