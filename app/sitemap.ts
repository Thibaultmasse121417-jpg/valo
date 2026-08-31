import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://estalia-studio.vercel.app";
  return [
    { url: `${base}/`, lastModified: new Date(), priority: 1 },
    { url: `${base}/real-estate`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/wedding-venues`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/hospitality`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/business`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/mentions-legales`, lastModified: new Date() },
    { url: `${base}/confidentialite`, lastModified: new Date() },
  ];
}
