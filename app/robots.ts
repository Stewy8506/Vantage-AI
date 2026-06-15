import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/workspace", "/api/"],
    },
    sitemap: "https://vantage-theta-five.vercel.app/sitemap.xml",
  };
}
