import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-semibold text-slate-900">Rentora</p>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Find rental homes that match your budget, location, and lifestyle —
            with verified listings and direct owner contact.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link href="/properties" className="hover:text-brand-700">
                Browse properties
              </Link>
            </li>
            <li>
              <Link href="/register?role=owner" className="hover:text-brand-700">
                List your property
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>
              <Link href="/privacy" className="hover:text-brand-700">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-brand-700">
                Terms & conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Rentora. All rights reserved.
      </div>
    </footer>
  );
}
