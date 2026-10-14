import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, MapPin } from "lucide-react";
import type { PropertyCard as PropertyCardType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function PropertyCard({ property }: { property: PropertyCardType }) {
  const image =
    property.imageUrl ??
    "https://images.unsplash.com/photo-1560448204-e02f11c2d0e2?w=800&q=80";

  return (
    <article className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={image}
            alt={property.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
              {property.title}
            </h3>
            <p className="shrink-0 text-base font-bold text-brand-700">
              {formatCurrency(property.monthlyRent)}
              <span className="text-xs font-normal text-slate-500">/mo</span>
            </p>
          </div>
          <p className="flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400" />
            {property.locality}, {property.city}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" />
              {property.bedrooms} bed
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms} bath
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              {property.propertyType.replaceAll("_", " ")}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5">
              {property.furnishing.replaceAll("_", " ")}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
