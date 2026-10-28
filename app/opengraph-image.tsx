import { ImageResponse } from "next/og";
import { OgCard, loadOgFonts, size, contentType } from "@/lib/ogImage";

export const runtime = "nodejs";
export const alt = "Estalia Studio — Des images qui se ressentent";
export { size, contentType };

export default async function OpengraphImage() {
  const fonts = await loadOgFonts();
  return new ImageResponse(<OgCard tagline="Films · Sites web · Direction artistique" />, {
    ...size,
    fonts,
  });
}
