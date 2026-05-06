import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://mktnotes.app";
  const now = new Date();

  const publicRoutes = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/pricing", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/demo", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.6, changeFrequency: "yearly" as const },
  ];

  return publicRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
