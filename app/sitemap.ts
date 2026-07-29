import type { MetadataRoute } from "next";
import { seoGuides } from "../lib/seo-guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-07-29");
  return [
    { url: "https://airant.co.uk", lastModified, changeFrequency: "weekly", priority: 1 },
    { url: "https://airant.co.uk/help", lastModified, changeFrequency: "weekly", priority: 0.9 },
    ...seoGuides.map((guide) => ({ url: `https://airant.co.uk/help/${guide.slug}`, lastModified, changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: "https://airant.co.uk/privacy", lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
