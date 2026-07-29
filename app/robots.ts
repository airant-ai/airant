import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/result", "/api/"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/admin", "/result", "/api/"] },
    ],
    sitemap: "https://airant.co.uk/sitemap.xml",
    host: "https://airant.co.uk",
  };
}
