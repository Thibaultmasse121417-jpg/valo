type MediaPlaceholderProps = {
  /** Omis pour le Hero : le titre réel est déjà affiché par-dessus. */
  title?: string;
  subtitle?: string;
  tag?: string;
  variant?: "hero" | "tile" | "portrait";
  className?: string;
};

/**
 * Placeholder éditorial affiché tant qu'un fichier vidéo/image réel
 * n'a pas été déposé dans /public. Ne ressemble jamais à une erreur :
 * composition sobre noir/ivoire avec monogramme et texture, dans
 * l'esprit d'une plaque de studio de cinéma.
 *
 * Pour le Hero (variant="hero"), aucun titre n'est passé : la vraie
 * typographie du Hero est déjà affichée par-dessus, un second bloc de
 * texte centré créerait un doublon visuel.
 */
export default function MediaPlaceholder({
  title,
  subtitle,
  tag,
  variant = "tile",
  className = "",
}: MediaPlaceholderProps) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-noir ${className}`}
    >
      {/* texture très fine en fond */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #f6f2ea 0px, #f6f2ea 1px, transparent 1px, transparent 64px)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-noir/40 via-transparent to-noir/60" aria-hidden />

      {/* cadre fin */}
      <div className="pointer-events-none absolute inset-5 border border-ivoire/15 sm:inset-8" aria-hidden />

      {title ? (
        <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center sm:gap-5">
          <span
            className="font-serif text-3xl leading-none text-bronze/70 sm:text-4xl"
            aria-hidden
          >
            E
          </span>
          <p
            className={`font-serif uppercase tracking-widest2 text-ivoire ${
              variant === "hero" ? "text-3xl sm:text-5xl" : "text-xl sm:text-2xl"
            }`}
          >
            {title}
          </p>
          {subtitle ? (
            <p className="font-sans text-[11px] uppercase tracking-widest2 text-ivoire/50 sm:text-xs">
              {subtitle}
            </p>
          ) : null}
          {tag ? (
            <span className="mt-2 border border-ivoire/20 px-3 py-1.5 font-sans text-[10px] uppercase tracking-widest2 text-ivoire/45">
              {tag}
            </span>
          ) : null}
        </div>
      ) : (
        // Habillage purement atmosphérique (Hero) : monogramme discret, sans texte.
        <span
          className="relative z-10 font-serif text-[18vw] leading-none text-ivoire/[0.05] sm:text-[12vw]"
          aria-hidden
        >
          E
        </span>
      )}
    </div>
  );
}
