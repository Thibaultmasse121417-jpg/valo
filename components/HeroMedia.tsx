import MediaPlaceholder from "./MediaPlaceholder";

type HeroMediaProps = {
  hasVideo: boolean;
  hasPoster: boolean;
};

/**
 * Fond vidéo plein écran du Hero. Composant serveur : la présence des
 * fichiers est déterminée au build (voir lib/media.ts), donc aucun
 * flash de contenu manquant côté client.
 */
export default function HeroMedia({ hasVideo, hasPoster }: HeroMediaProps) {
  if (!hasVideo) {
    return (
      <div className="absolute inset-0 animate-[kenburns_24s_ease-in-out_infinite_alternate]">
        <MediaPlaceholder variant="hero" />
      </div>
    );
  }

  return (
    <video
      className="absolute inset-0 h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={hasPoster ? "/images/hero-poster.jpg" : undefined}
      aria-hidden
    >
      <source src="/videos/hero.mp4" type="video/mp4" />
    </video>
  );
}
