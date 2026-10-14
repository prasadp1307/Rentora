"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, logout, loading } = useAuth();

  const dashboardHref =
    user?.role === "OWNER"
      ? "/owner/dashboard"
      : user?.role === "ADMIN"
        ? "/admin/dashboard"
        : user?.role === "TENANT"
          ? "/tenant/dashboard"
          : "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-sm font-bold text-white">
            R
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Rentora
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/properties" className="hover:text-brand-700">
            Browse
          </Link>
          <Link href="/about" className="hover:text-brand-700">
            About
          </Link>
          <Link href="/contact" className="hover:text-brand-700">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center rounded-lg bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
              >
                Sign up
              </Link>
            </>
          )}
          {!loading && user && (
            <>
              <Link
                href={dashboardHref}
                className="hidden text-sm font-medium text-slate-700 hover:text-brand-700 sm:inline"
              >
                Dashboard
              </Link>
              <Button variant="outline" onClick={() => void logout()}>
                Log out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
