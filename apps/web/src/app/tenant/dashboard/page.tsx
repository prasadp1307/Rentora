"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function TenantDashboardPage() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== "TENANT") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-700">Tenant access required.</p>
        <Link href="/login" className="mt-4 inline-block text-brand-700 hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">
        Hello, {user.profile?.firstName ?? "there"}
      </h1>
      <p className="mt-2 text-slate-600">Track favourites, enquiries, and visit requests.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["/tenant/favourites", "Favourites"],
          ["/tenant/enquiries", "My enquiries"],
          ["/tenant/visits", "Visit requests"],
          ["/properties", "Browse properties"],
          ["/tenant/compare", "Compare listings"],
          ["/tenant/profile", "My profile"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-200"
          >
            <span className="font-medium text-slate-900">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
