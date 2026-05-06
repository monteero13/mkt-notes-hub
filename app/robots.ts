import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://mktnotes.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/demo"],
        disallow: [
          "/api/",
          "/auth/",
          "/dashboard",
          "/clients",
          "/campaigns",
          "/analytics",
          "/brainstorm",
          "/content",
          "/ideas",
          "/objectives",
          "/library",
          "/planner",
          "/team",
          "/billing",
          "/settings",
          "/onboarding",
          "/join/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
