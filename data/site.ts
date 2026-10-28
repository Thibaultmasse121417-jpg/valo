/**
 * ------------------------------------------------------------------
 * CONTENU DU SITE — ESTALIA STUDIO
 * ------------------------------------------------------------------
 * Tout le texte du site, en français (langue principale) et en
 * anglais. Les titres composés sont des listes de lignes : chaque
 * ligne s'affiche sur sa propre ligne, `*mot*` passe en italique et
 * `c` décale la ligne (in1, in2) ou l'aligne à droite (r).
 *
 * Typographie française : espace insécable (N) avant : ; ? ! et à
 * l'intérieur des guillemets « ».
 * ------------------------------------------------------------------
 */

export type L = { fr: string; en: string };
export type Line = { t: string; c?: "in1" | "in2" | "r" };
export type Title = { fr: Line[]; en: Line[] };

const N = " ";
const l = (fr: string, en: string): L => ({ fr, en });

export const FILM = {
  src: "/videos/villa-san-peire.mp4",
  poster: "/videos/villa-san-peire.jpg",
  width: 1600,
  height: 666,
  duration: "0:50",
};

export const SEQUENCES: { t: number; name: L }[] = [
  { t: 1.5, name: l("Arrivée", "Arrival") },
  { t: 10, name: l("Séjour", "Living room") },
  { t: 25, name: l("Cuisine", "Kitchen") },
  { t: 27.3, name: l("Escalier", "Staircase") },
  { t: 30.5, name: l("Salle de bain", "Bathroom") },
  { t: 34.4, name: l("Suite", "Suite") },
  { t: 38.5, name: l("Patio", "Patio") },
  { t: 47, name: l("Le soir", "Nightfall") },
];

/* Études de direction artistique — propositions conceptuelles, pas des commandes clients. */
export const STUDIES: { img: string; title: L; sector: L; alt: L }[] = [
  {
    img: "/images/villa-poster.jpg",
    title: l("Villa, Côte d’Azur", "Villa, Côte d’Azur"),
    sector: l("Immobilier", "Real estate"),
    alt: l("Villa contemporaine avec piscine au coucher du soleil, entourée de palmiers", "Contemporary villa with a pool at sunset, surrounded by palm trees"),
  },
  {
    img: "/images/paris-poster.jpg",
    title: l("Appartement, Paris", "Apartment, Paris"),
    sector: l("Immobilier", "Real estate"),
    alt: l("Balcon d’un immeuble haussmannien face à la tour Eiffel au soleil couchant", "Balcony of a Haussmann building facing the Eiffel Tower at sunset"),
  },
  {
    img: "/images/chateau-poster.jpg",
    title: l("Château, heure bleue", "Château, blue hour"),
    sector: l("Hôtellerie", "Hospitality"),
    alt: l("Façade d’un château à l’heure bleue, fenêtres éclairées", "Château façade at blue hour, lit windows"),
  },
  {
    img: "/images/domaine-poster.jpg",
    title: l("Domaine, Provence", "Estate, Provence"),
    sector: l("Campings & domaines", "Campsites & estates"),
    alt: l("Vue aérienne d’un domaine entouré de champs et de collines au soleil couchant", "Aerial view of an estate among fields and hills at sunset"),
  },
];

export type TradeSlug = "commerces" | "agences-immobilieres" | "campings-hotels" | "notaires";
export type PageSlug = TradeSlug | "sites-web";

export type Trade = {
  slug: PageSlug;
  name: L;
  long: L;
  who: L;
  title: Title;
  intro: L;
  gains: L[];
  /** true : un vrai film existe pour ce métier ; sinon « exemple à venir ». */
  realFilm: boolean;
  img?: { src: string; alt: L };
  /** image du film utilisée comme vignette de référence quand l'exemple est à venir */
  still: number;
  /** libellé envoyé avec la demande de devis */
  ctx: string;
  seo: L;
};

export const TRADES: Record<PageSlug, Trade> = {
  commerces: {
    slug: "commerces",
    name: l("Commerces", "Shops"),
    long: l("Commerces & marques", "Shops & brands"),
    who: l("Boutiques, artisans, restaurants, instituts", "Shops, craftspeople, restaurants, salons"),
    title: {
      fr: [{ t: "Faire connaître votre adresse" }, { t: "*et donner envie d’y entrer.*", c: "in1" }],
      en: [{ t: "Make your address known" }, { t: "*and make people walk in.*", c: "in1" }],
    },
    intro: l(
      "Des films qui montrent votre lieu, vos produits et votre équipe, pour vous faire découvrir par de nouveaux clients près de chez vous.",
      "Films that show your place, your products and your team, so new customers nearby discover you."
    ),
    gains: [
      l("Film de promotion pour vos réseaux et votre fiche Google", "Promotional film for your social media and Google profile"),
      l(`Films saisonniers pour vos temps forts${N}: fêtes, soldes, nouveautés`, "Seasonal films for your key moments: holidays, sales, new arrivals"),
      l("Site vitrine avec horaires, produits et accès", "Showcase website with opening hours, products and directions"),
    ],
    realFilm: false,
    still: 3,
    ctx: "Commerce",
    seo: l(
      "Films de promotion et sites web pour commerces, artisans et restaurants : votre lieu, vos produits et votre équipe mis en valeur.",
      "Promotional films and websites for shops, craftspeople and restaurants."
    ),
  },
  "agences-immobilieres": {
    slug: "agences-immobilieres",
    name: l("Agences immobilières", "Estate agencies"),
    long: l("Agences immobilières", "Estate agencies"),
    who: l("Agences, mandataires, promoteurs", "Agencies, agents, developers"),
    title: {
      fr: [{ t: "Faire visiter," }, { t: "*avant la visite.*", c: "in1" }],
      en: [{ t: "The visit," }, { t: "*before the visit.*", c: "in1" }],
    },
    intro: l(
      "Des films de biens qui font ressentir les volumes et la lumière, réalisés à partir de vos photos et vidéos.",
      "Property films that convey volume and light, made from your photos and videos."
    ),
    gains: [
      l("Film de bien pour vos annonces et vos réseaux", "Property film for your listings and social media"),
      l("Formats courts pour présenter vos nouveaux mandats", "Short formats to present your new listings"),
      l("Site d’agence ou page de programme neuf", "Agency website or new-development page"),
    ],
    realFilm: true,
    img: { src: "/images/villa-poster.jpg", alt: l("Villa contemporaine avec piscine au coucher du soleil", "Contemporary villa with a pool at sunset") },
    still: 1,
    ctx: "Agence immobilière",
    seo: l(
      "Films de biens immobiliers réalisés à partir de vos photos et vidéos, pour agences, mandataires et promoteurs.",
      "Property films made from your photos and videos, for estate agencies, agents and developers."
    ),
  },
  "campings-hotels": {
    slug: "campings-hotels",
    name: l("Campings & hôtels", "Campsites & hotels"),
    long: l("Campings, hôtels & lieux d’accueil", "Campsites, hotels & guest houses"),
    who: l("Campings, hôtels, gîtes, maisons d’hôtes", "Campsites, hotels, cottages, guesthouses"),
    title: {
      fr: [{ t: "Faire ressentir les vacances" }, { t: "*avant l’arrivée.*", c: "in1" }],
      en: [{ t: "The holiday feeling," }, { t: "*before arrival.*", c: "in1" }],
    },
    intro: l(
      "Des images qui montrent vos hébergements, vos espaces et le cadre qui vous entoure.",
      "Images that show your accommodation, your spaces and the setting around you."
    ),
    gains: [
      l("Film de présentation de l’établissement", "Presentation film of your establishment"),
      l("Contenus de saison pour annoncer l’ouverture ou les nouveautés", "Seasonal content to announce opening or what’s new"),
      l("Site qui présente vos hébergements et renvoie vers votre réservation", "Website presenting your accommodation and linking to your booking tool"),
    ],
    realFilm: false,
    img: { src: "/images/domaine-poster.jpg", alt: l("Vue aérienne d’un domaine entouré de champs et de collines", "Aerial view of an estate among fields and hills") },
    still: 7,
    ctx: "Camping / hôtel",
    seo: l(
      "Films et sites web pour campings, hôtels, gîtes et maisons d’hôtes : vos hébergements et votre cadre mis en valeur.",
      "Films and websites for campsites, hotels, cottages and guesthouses."
    ),
  },
  notaires: {
    slug: "notaires",
    name: l("Notaires", "Notaries"),
    long: l("Études notariales", "Notary offices"),
    who: l("Études notariales et services de négociation", "Notary offices and property departments"),
    title: {
      fr: [{ t: "Présenter votre étude" }, { t: "*avec sobriété.*", c: "in1" }],
      en: [{ t: "Presenting your office" }, { t: "*with restraint.*", c: "in1" }],
    },
    intro: l(
      "Des films et un site qui présentent vos locaux, votre équipe et vos domaines d’intervention, dans le respect des usages de la profession.",
      "Films and a website presenting your offices, your team and your areas of practice, in keeping with the profession’s standards."
    ),
    gains: [
      l("Films de biens pour votre service de négociation immobilière", "Property films for your property sales department"),
      l("Film de présentation de l’étude et de l’équipe", "Presentation film of the office and the team"),
      l("Site de l’étude, clair, avec vos domaines et la prise de contact", "A clear office website with your areas of practice and contact"),
    ],
    realFilm: false,
    still: 2,
    ctx: "Étude notariale",
    seo: l(
      "Films et site web pour études notariales : vos locaux, votre équipe et vos domaines présentés avec sobriété.",
      "Films and website for notary offices, presented with restraint."
    ),
  },
  "sites-web": {
    slug: "sites-web",
    name: l("Sites web", "Websites"),
    long: l("Sites web", "Websites"),
    who: l("Pour chaque métier", "For every trade"),
    title: {
      fr: [{ t: "Un site" }, { t: "*qui vous ressemble.*", c: "in1" }],
      en: [{ t: "A website" }, { t: "*that looks like you.*", c: "in1" }],
    },
    intro: l(
      `Un site pensé comme une direction artistique${N}: une identité claire, des images mises en valeur et un chemin simple jusqu’au contact.`,
      "A website designed like an art direction: a clear identity, images given room, and a simple path to getting in touch."
    ),
    gains: [
      l(`Une identité, pas un modèle${N}: chaque site est dessiné pour son activité`, "An identity, not a template: each site is designed for its business"),
      l("Clair en quelques secondes, sur téléphone comme sur ordinateur", "Clear within seconds, on a phone as well as a computer"),
      l(`Pensé pour le contact${N}: appels à l’action nets, formulaire simple`, "Built for contact: clear calls to action, a simple form"),
    ],
    realFilm: false,
    still: 2,
    ctx: "Site web",
    seo: l(
      "Création de sites web sur mesure, adaptés à chaque métier et cohérents avec vos films.",
      "Bespoke websites suited to each trade and consistent with your films."
    ),
  },
};

export const TRADE_ORDER: TradeSlug[] = ["commerces", "agences-immobilieres", "campings-hotels", "notaires"];

export const PILLARS: { title: L; text: L }[] = [
  { title: l("Le lieu", "The place"), text: l(`La façade, la lumière, l’ambiance${N}: ce que l’on ressent en entrant.`, "The frontage, the light, the atmosphere: what you feel when you walk in.") },
  { title: l("Les produits", "The products"), text: l("Vos créations filmées de près, avec la matière, la couleur, le détail.", "Your creations filmed up close, with their texture, colour and detail.") },
  { title: l("L’équipe", "The team"), text: l("Les visages derrière l’enseigne, pour créer la confiance avant la première visite.", "The faces behind the name, to build trust before the first visit.") },
  { title: l("Le savoir-faire", "The craft"), text: l(`Le geste, la préparation, le soin${N}: ce que vous seul savez faire.`, "The gesture, the preparation, the care: what only you know how to do.") },
];

export const FORMATS: { cls: "fmt-v" | "fmt-s" | "fmt-h"; ratio: string; still: number; title: L; text: L; pos?: string }[] = [
  { cls: "fmt-v", ratio: "9:16", still: 1, pos: "30% 50%", title: l("Réseaux sociaux", "Social media"), text: l(`Instagram, Facebook, TikTok${N}: vertical et rythmé dès la première seconde.`, "Instagram, Facebook, TikTok: vertical and paced from the very first second.") },
  { cls: "fmt-s", ratio: "1:1", still: 6, title: l("Google", "Google"), text: l("Sur votre fiche d’établissement, pour vous démarquer quand on cherche près de chez vous.", "On your Business Profile, to stand out when people search nearby.") },
  { cls: "fmt-h", ratio: "16:9", still: 2, title: l("Votre site", "Your website"), text: l("En ouverture de votre page d’accueil, pour installer l’ambiance.", "Opening your home page, to set the mood.") },
];

export const SITE_ROWS: { name: L; text: L }[] = [
  { name: l("Commerces", "Shops"), text: l("Horaires, produits, plan d’accès, lien vers votre fiche Google.", "Opening hours, products, directions, link to your Google profile.") },
  { name: l("Agences immobilières", "Estate agencies"), text: l("Vos biens, vos services, une demande d’estimation simple.", "Your listings, your services, a simple valuation request.") },
  { name: l("Campings & hôtels", "Campsites & hotels"), text: l("Hébergements, galerie, lien vers votre outil de réservation.", "Accommodation, gallery, link to your booking tool.") },
  { name: l("Notaires", "Notaries"), text: l("Domaines d’intervention, équipe, prise de contact.", "Areas of practice, team, getting in touch.") },
];

export const MONTHS: { long: L; short: string }[] = [
  ["Janv.", "Jan", "J"], ["Févr.", "Feb", "F"], ["Mars", "Mar", "M"], ["Avr.", "Apr", "A"], ["Mai", "May", "M"], ["Juin", "Jun", "J"],
  ["Juil.", "Jul", "J"], ["Août", "Aug", "A"], ["Sept.", "Sep", "S"], ["Oct.", "Oct", "O"], ["Nov.", "Nov", "N"], ["Déc.", "Dec", "D"],
].map(([fr, en, short]) => ({ long: l(fr, en), short }));

export const SEASONS: { id: string; from: number; to: number; when: L; title: L; text: L }[] = [
  { id: "valentin", from: 2, to: 2, when: l("14 février", "14 February"), title: l("Saint-Valentin", "Valentine’s Day"), text: l(`Coffrets, créations à offrir, ambiance intime${N}: le film qui donne une idée de cadeau.`, "Gift boxes, creations to give, an intimate mood: the film that sparks a gift idea.") },
  { id: "meres", from: 5, to: 5, when: l("Fin mai", "Late May"), title: l("Fête des mères", "Mother’s Day"), text: l("Idées cadeaux et portrait de votre savoir-faire, en douceur.", "Gift ideas and a gentle portrait of your craft.") },
  { id: "ete", from: 6, to: 8, when: l("Juin — août", "June — August"), title: l("Été", "Summer"), text: l(`Terrasse, lumière, produits de saison${N}: l’envie de sortir et de venir vous voir.`, "Terraces, light, seasonal products: the urge to go out and come and see you.") },
  { id: "rentree", from: 9, to: 9, when: l("Septembre", "September"), title: l("Rentrée", "Back to school"), text: l(`Nouveautés, nouvelles habitudes${N}: rappeler que vous êtes là.`, "New arrivals, new routines: a reminder that you’re here.") },
  { id: "halloween", from: 10, to: 10, when: l("31 octobre", "31 October"), title: l("Halloween", "Halloween"), text: l("Vitrine décorée, édition limitée, un ton plus ludique.", "A dressed window, a limited edition, a more playful tone.") },
  { id: "blackfriday", from: 11, to: 11, when: l("Fin novembre", "Late November"), title: l("Black Friday", "Black Friday"), text: l("Vos offres en quelques secondes, avec un rythme rapide pour les réseaux.", "Your offers in a few seconds, with a fast pace for social media.") },
  { id: "noel", from: 12, to: 12, when: l("Décembre", "December"), title: l("Noël", "Christmas"), text: l(`Vitrine, cadeaux, lumières${N}: le film des fêtes.`, "Window, gifts, lights: the holiday film.") },
];

export type ProjectType = "film" | "saisons" | "site" | "signature" | "autre";

export const PROJECT_TYPES: { id: ProjectType; label: L }[] = [
  { id: "film", label: l("Film de promotion", "Promotional film") },
  { id: "saisons", label: l("Pack saisonnier", "Seasonal pack") },
  { id: "site", label: l("Site web", "Website") },
  { id: "signature", label: l("Film + site web (formule Signature)", "Film + website (Signature package)") },
  { id: "autre", label: l("Je ne sais pas encore", "Not sure yet") },
];

/* Tarifs : aucun prix inventé — « Sur devis » tant que le fondateur n'a pas fixé ses prix. */
export const PLANS: { id: ProjectType; name: L; forWho: L; items: L[]; featured?: boolean }[] = [
  {
    id: "film",
    name: l("Film", "Film"),
    forWho: l("Pour vous présenter", "To introduce yourself"),
    items: [
      l("Un film de promotion à partir de vos photos et vidéos", "A promotional film made from your photos and videos"),
      l("Montage, étalonnage et musique", "Editing, colour grading and music"),
      l("Formats pour vos réseaux, votre site et Google", "Formats for your social media, website and Google"),
    ],
  },
  {
    id: "saisons",
    name: l("Saisons", "Seasons"),
    forWho: l("Pour rester présent toute l’année", "To stay visible all year round"),
    featured: true,
    items: [
      l("Plusieurs films autour de vos temps forts", "Several films around your key moments"),
      l("Un calendrier défini ensemble", "A calendar we set together"),
      l("Une direction artistique commune à tous les films", "One art direction shared by every film"),
    ],
  },
  {
    id: "signature",
    name: l("Signature", "Signature"),
    forWho: l("Pour une image complète", "For a complete image"),
    items: [
      l("Direction artistique de votre image", "Art direction of your image"),
      l("Un site web sur mesure", "A bespoke website"),
      l("Un film de présentation intégré au site", "A presentation film built into the site"),
    ],
  },
];

export const STEPS: { title: L; text: L }[] = [
  { title: l("Échange", "Conversation"), text: l("Nous parlons de votre projet, de vos objectifs et de ce que vous voulez faire ressentir.", "We talk about your project, your goals and what you want people to feel.") },
  { title: l("Direction artistique", "Art direction"), text: l(`Nous définissons l’intention${N}: ambiance, références, rythme et ton.`, "We define the intention: mood, references, pacing and tone.") },
  { title: l("Création", "Creation"), text: l("Nous créons le film, les contenus ou le site, dans la direction choisie ensemble.", "We create the film, the content or the website, in the direction chosen together.") },
  { title: l("Livraison", "Delivery"), text: l("Nous vous présentons le travail, effectuons les ajustements convenus, puis livrons.", "We present the work, make the agreed adjustments, then deliver.") },
];

export const FAQS: { q: L; a: L }[] = [
  { q: l(`Faut-il organiser un tournage${N}?`, "Do you need to organise a shoot?"), a: l(`Le plus souvent, non${N}: nous travaillons à partir de vos photos et vidéos existantes, que vous nous transmettez à distance. Si vos images ne suffisent pas, nous en parlons ensemble.`, "Usually not: we work from your existing photos and videos, which you send us remotely. If your images aren’t enough, we discuss it together.") },
  { q: l(`Quels visuels dois-je fournir${N}?`, "What visuals should I provide?"), a: l(`Des photos et vidéos de votre lieu, de vos produits ou de votre équipe. Celles d’un smartphone récent conviennent souvent${N}; nous vous disons lesquelles garder.`, "Photos and videos of your place, your products or your team. Those from a recent smartphone are often fine; we tell you which ones to keep.") },
  { q: l(`Combien coûte un film${N}?`, "How much does a film cost?"), a: l(`Le prix dépend de la durée, du nombre de formats et de la formule choisie. Décrivez votre projet${N}: nous vous répondons avec un devis précis.`, "The price depends on length, number of formats and the package chosen. Describe your project: we reply with a precise quote.") },
  { q: l(`Quels sont les délais${N}?`, "How long does it take?"), a: l("Ils dépendent du projet et sont fixés ensemble dans le devis. Pour un temps fort de l’année, le plus tôt est le mieux.", "It depends on the project and is agreed together in the quote. For a seasonal moment, the earlier the better.") },
  { q: l(`Où pourrai-je publier mes vidéos${N}?`, "Where can I publish my videos?"), a: l(`Sur vos réseaux sociaux (Instagram, Facebook, TikTok), sur votre site, sur votre fiche Google et dans vos annonces${N}: chaque film est livré aux formats adaptés.`, "On your social media (Instagram, Facebook, TikTok), your website, your Google profile and your listings: each film is delivered in the right formats.") },
  { q: l(`Travaillez-vous partout en France${N}?`, "Do you work anywhere in France?"), a: l(`Oui${N}: tout se fait à distance, de l’échange à la livraison.`, "Yes: everything is done remotely, from the first conversation to delivery.") },
  { q: l(`Pouvez-vous aussi créer mon site${N}?`, "Can you also build my website?"), a: l("Oui. Nous concevons des sites sur mesure, adaptés à votre métier et cohérents avec vos films. C’est le cœur de la formule Signature.", "Yes. We design bespoke websites, suited to your trade and consistent with your films. It’s the heart of the Signature package.") },
];

export const NAV: { id: string; label: L }[] = [
  { id: "films", label: l("Le film", "The film") },
  { id: "metiers", label: l("Métiers", "Trades") },
  { id: "saisons", label: l("Saisons", "Seasons") },
  { id: "sites", label: l("Sites web", "Websites") },
  { id: "tarifs", label: l("Tarifs", "Pricing") },
  { id: "faq", label: l("FAQ", "FAQ") },
];

export const MOBILE_NAV: { id: string; label: L }[] = [
  { id: "films", label: l("Le film", "The film") },
  { id: "promo", label: l("Vidéos promo", "Promo videos") },
  { id: "metiers", label: l("Métiers", "Trades") },
  { id: "saisons", label: l("Saisons", "Seasons") },
  { id: "sites", label: l("Sites web", "Websites") },
  { id: "tarifs", label: l("Tarifs", "Pricing") },
  { id: "faq", label: l("FAQ", "FAQ") },
  { id: "studio", label: l("Studio", "Studio") },
];

export function tradeHref(slug: PageSlug) {
  return slug === "sites-web" ? "/sites-web" : `/metiers/${slug}`;
}

export function fmtTime(t: number) {
  const s = Math.floor(t);
  return `00:${s < 10 ? "0" : ""}${s}`;
}
