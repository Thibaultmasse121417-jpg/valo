import { ImageResponse } from "next/og";
import { OgCard, loadOgFonts, size, contentType } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Estalia Studio — Cinematic Real Estate";
export { size, contentType };

export default async function OpengraphImage() {
  const fonts = await loadOgFonts();
  return new ImageResponse(<OgCard tagline="Cinematic Real Estate" />, {
    ...size,
    fonts,
  });
}
