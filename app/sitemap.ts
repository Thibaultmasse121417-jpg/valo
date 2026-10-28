import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/config";
import { TRADE_ORDER, tradeHref } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, priority: 1 },
    ...TRADE_ORDER.map((slug) => ({ url: `${base}${tradeHref(slug)}`, lastModified: now, priority: 0.9 })),
    { url: `${base}/sites-web`, lastModified: now, priority: 0.9 },
    { url: `${base}/mentions-legales`, lastModified: now },
    { url: `${base}/confidentialite`, lastModified: now },
  ];
}
