import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: site, changeFrequency: "daily", priority: 1 },
    { url: `${site}/properties`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${site}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
