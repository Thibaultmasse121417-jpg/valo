import { ImageResponse } from "next/og";
import { OgCard, loadOgFonts, size, contentType } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Estalia Studio — Cinematic Experiences";
export { size, contentType };

export default async function OpengraphImage() {
  const fonts = await loadOgFonts();
  return new ImageResponse(<OgCard tagline="Cinematic Experiences" />, {
    ...size,
    fonts,
  });
}
