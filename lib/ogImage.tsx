import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * ------------------------------------------------------------------
 * VISUEL DE PARTAGE (OpenGraph / Twitter Card) — rendu à la volée
 * ------------------------------------------------------------------
 * Généré avec `next/og` (ImageResponse) plutôt qu'un SVG statique afin
 * d'être certain que les polices de la marque (Bodoni Moda, Archivo)
 * s'affichent correctement chez tous les crawlers sociaux, sans
 * dépendre d'une police système installée côté serveur du réseau.
 *
 * Les fichiers de police sont chargés localement depuis /assets/fonts
 * (et non re-téléchargés à chaque requête) — voir app/opengraph-image.tsx
 * et app/twitter-image.tsx, qui consomment ce module.
 * ------------------------------------------------------------------
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function loadOgFonts() {
  const [bodoni, archivo] = await Promise.all([
    readFile(path.join(process.cwd(), "assets/fonts/bodoni-moda-600.ttf")),
    readFile(path.join(process.cwd(), "assets/fonts/archivo-500.ttf")),
  ]);
  return [
    { name: "Bodoni Moda", data: bodoni, weight: 600 as const, style: "normal" as const },
    { name: "Archivo", data: archivo, weight: 500 as const, style: "normal" as const },
  ];
}

const cornerBorder = "1px solid rgba(246,242,234,0.5)";

export function OgCard({ tagline }: { tagline: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a09",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 48, left: 48, width: 30, height: 30, borderTop: cornerBorder, borderLeft: cornerBorder }} />
      <div style={{ position: "absolute", top: 48, right: 48, width: 30, height: 30, borderTop: cornerBorder, borderRight: cornerBorder }} />
      <div style={{ position: "absolute", bottom: 48, left: 48, width: 30, height: 30, borderBottom: cornerBorder, borderLeft: cornerBorder }} />
      <div style={{ position: "absolute", bottom: 48, right: 48, width: 30, height: 30, borderBottom: cornerBorder, borderRight: cornerBorder }} />

      <div
        style={{
          display: "flex",
          fontFamily: "Bodoni Moda",
          fontSize: 26,
          color: "#b08d5b",
          marginBottom: 22,
        }}
      >
        E
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Bodoni Moda",
          fontSize: 76,
          fontWeight: 600,
          color: "#f6f2ea",
          letterSpacing: 12,
        }}
      >
        ESTALIA STUDIO
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Archivo",
          fontSize: 17,
          fontWeight: 500,
          color: "rgba(246,242,234,0.55)",
          letterSpacing: 7,
          marginTop: 26,
          textTransform: "uppercase",
        }}
      >
        {tagline}
      </div>
    </div>
  );
}
