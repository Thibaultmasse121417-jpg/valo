import Image from "next/image";
import MediaPlaceholder from "./MediaPlaceholder";

type HeroMediaProps = {
  hasVideo: boolean;
  hasPoster: boolean;
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
export default function HeroMedia({ hasVideo, hasPoster }: HeroMediaProps) {
  if (hasVideo) {
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

  if (hasPoster) {
    return (
      <div className="absolute inset-0 animate-[kenburns_24s_ease-in-out_infinite_alternate]">
        <Image
          src="/images/hero-poster.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 animate-[kenburns_24s_ease-in-out_infinite_alternate]">
      <MediaPlaceholder variant="hero" />
    </div>
  );
}
