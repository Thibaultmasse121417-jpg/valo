import Image from "next/image";
import MediaPlaceholder from "./MediaPlaceholder";

type HeroMediaProps = {
  hasVideo: boolean;
  hasPoster: boolean;
  videoSrc?: string;
  posterSrc?: string;
};

/**
 * Fond plein écran du Hero. Composant serveur : la présence des
 * fichiers est déterminée au build (voir lib/media.ts), donc aucun
 * flash de contenu manquant côté client.
 *
 * Ordre de préférence : vidéo réelle > image fixe cinématographique
 * (poster) > placeholder éditorial. Une image fixe de qualité vaut
 * largement mieux qu'une plaque vide en attendant le tournage.
 */
export default function HeroMedia({
  hasVideo,
  hasPoster,
  videoSrc = "/videos/hero.mp4",
  posterSrc = "/images/hero-poster.jpg",
}: HeroMediaProps) {
  if (hasVideo) {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={hasPoster ? posterSrc : undefined}
        aria-hidden
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    );
  }

  if (hasPoster) {
    return (
      <div className="absolute inset-0 animate-[kenburns_24s_ease-in-out_infinite_alternate]">
        <Image src={posterSrc} alt="" fill priority sizes="100vw" className="object-cover" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 animate-[kenburns_24s_ease-in-out_infinite_alternate]">
      <MediaPlaceholder variant="hero" />
    </div>
  );
}
