import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const routes = [
    { path: "", priority: 1 },
    { path: "/services", priority: 0.9 },
    { path: "/projects", priority: 0.8 },
    { path: "/about", priority: 0.7 },
    { path: "/reviews", priority: 0.7 },
    { path: "/contact", priority: 0.8 },
    { path: "/quote", priority: 0.9 },
  ];
  return routes.map((r) => ({ url: `${base}${r.path}`, changeFrequency: "monthly", priority: r.priority }));
}
