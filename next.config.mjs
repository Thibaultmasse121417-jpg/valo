/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Les pages de l'ancienne version (lancement UK) renvoient vers leur
  // équivalent actuel : aucun lien partagé auparavant ne casse.
  async redirects() {
    return [
      { source: "/real-estate", destination: "/metiers/agences-immobilieres", permanent: true },
      { source: "/hospitality", destination: "/metiers/campings-hotels", permanent: true },
      { source: "/wedding-venues", destination: "/metiers/campings-hotels", permanent: true },
      { source: "/business", destination: "/metiers/commerces", permanent: true },
      { source: "/metiers", destination: "/#metiers", permanent: false },
    ];
  },
};

export default nextConfig;
