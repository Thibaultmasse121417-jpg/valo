import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * ------------------------------------------------------------------
 * VISUEL DE PARTAGE (OpenGraph / Twitter Card) — rendu à la volée
 * ------------------------------------------------------------------
 * Généré avec `next/og` pour que les polices de la marque (Cormorant
 * Garamond, Manrope) s'affichent chez tous les réseaux sociaux. Les
 * fichiers de police sont lus localement depuis /assets/fonts.
 * ------------------------------------------------------------------
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function loadOgFonts() {
  const dir = path.join(process.cwd(), "assets/fonts");
  const [serif, serifItalic, sans] = await Promise.all([
    readFile(path.join(dir, "cormorant-garamond-latin-300-normal.woff")),
    readFile(path.join(dir, "cormorant-garamond-latin-300-italic.woff")),
    readFile(path.join(dir, "manrope-latin-600-normal.woff")),
  ]);
  return [
    { name: "Cormorant Garamond", data: serif, weight: 300 as const, style: "normal" as const },
    { name: "Cormorant Garamond", data: serifItalic, weight: 300 as const, style: "italic" as const },
    { name: "Manrope", data: sans, weight: 600 as const, style: "normal" as const },
  ];
}

const corner = "1px solid rgba(242,237,228,0.45)";

export function OgCard({ tagline }: { tagline: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backgroundColor: "#0b0b0a",
        padding: "72px 80px",
        position: "relative",
      }}
    >
      <div style={{ position: "absolute", top: 44, left: 44, width: 28, height: 28, borderTop: corner, borderLeft: corner }} />
      <div style={{ position: "absolute", top: 44, right: 44, width: 28, height: 28, borderTop: corner, borderRight: corner }} />
      <div style={{ position: "absolute", bottom: 44, left: 44, width: 28, height: 28, borderBottom: corner, borderLeft: corner }} />
      <div style={{ position: "absolute", bottom: 44, right: 44, width: 28, height: 28, borderBottom: corner, borderRight: corner }} />

      <div style={{ display: "flex", alignItems: "center", fontFamily: "Manrope", fontSize: 18, fontWeight: 600, letterSpacing: 4, color: "#958f86", textTransform: "uppercase" }}>
        <div style={{ width: 9, height: 9, borderRadius: 9, backgroundColor: "#e0613f", marginRight: 16 }} />
        Estalia Studio
      </div>
      <div style={{ display: "flex", flexDirection: "column", fontFamily: "Cormorant Garamond", fontWeight: 300, fontSize: 120, lineHeight: 0.9, color: "#f2ede4", marginTop: 26 }}>
        <div style={{ display: "flex" }}>Des images</div>
        <div style={{ display: "flex", paddingLeft: 100 }}>
          <span style={{ marginRight: 30 }}>qui se</span>
          <span style={{ fontStyle: "italic" }}>ressentent.</span>
        </div>
      </div>
      <div style={{ display: "flex", fontFamily: "Manrope", fontSize: 20, fontWeight: 600, letterSpacing: 3, color: "#c4beb3", marginTop: 38, textTransform: "uppercase" }}>
        {tagline}
      </div>
    </div>
  );
}
