// Netlify Function (v2) — server-rendered book pages and sitemap.
import { handle } from "../../server/book-page.mjs";

export default async (req) => handle(req, {
  SUPABASE_URL: Netlify.env.get("SUPABASE_URL"),
  SUPABASE_ANON_KEY: Netlify.env.get("SUPABASE_ANON_KEY"),
  SITE_URL: Netlify.env.get("SITE_URL") || Netlify.env.get("URL"),
  SITE_INDEXABLE: Netlify.env.get("SITE_INDEXABLE"),
});

export const config = { path: ["/livre/*", "/sitemap.xml"] };
