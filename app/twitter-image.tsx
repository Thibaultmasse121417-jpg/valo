import { ImageResponse } from "next/og";
import { OgCard, loadOgFonts, size, contentType } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Estalia — Hotel Content Studio";
export { size, contentType };

export default async function TwitterImage() {
  const fonts = await loadOgFonts();
  return new ImageResponse(<OgCard tagline="Hotel Content Studio" />, {
    ...size,
    fonts,
  });
}
