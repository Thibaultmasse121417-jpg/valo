/**
 * ------------------------------------------------------------------
 * CONTENU ÉDITORIAL — FR / EN
 * ------------------------------------------------------------------
 * Toutes les chaînes de texte du site sont centralisées ici, par langue.
 * Pour modifier un texte : cherchez la clé correspondante et éditez
 * la valeur `fr` et/ou `en`. Aucune traduction mot-à-mot : les deux
 * versions sont rédigées pour rester haut de gamme et naturelles.
 *
 * La copie propre à chaque univers (Real Estate / Wedding & Venues /
 * Hospitality / Business) vit dans `universes` ci-dessous, une entrée
 * par UniverseId (voir data/universes.ts pour les routes et médias).
 * ------------------------------------------------------------------
 */

import type { UniverseId } from "./universes";

export type Locale = "fr" | "en";

type NavLink = { label: string; href: string };

type UniverseCopy = {
  navLabel: string;
  seo: { title: string; description: string };
  hero: {
    kicker: string;
    title: string[];
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  intro: { kicker: string; title: string[]; paragraphs: string[] };
  shotLists: { title: string; beats: string[] }[];
  portfolio: { kicker: string; title: string; subtitle: string };
  cta: string;
};

export interface ContentShape {
  common: { close: string };
  nav: { links: NavLink[]; cta: string; openMenu: string; closeMenu: string; homeLabel: string };
  hero: {
    kicker: string;
    title: string[];
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scroll: string;
  };
  universeChooser: {
    kicker: string;
    title: string[];
    subtitle: string;
    items: { id: UniverseId; label: string; text: string; cta: string }[];
  };
  manifesto: { kicker: string; title: string[]; paragraphs: string[]; cta: string };
  films: {
    kicker: string;
    title: string;
    subtitle: string;
    watch: string;
    play: string;
    comingSoon: string;
    cta: string;
  };
  approach: {
    kicker: string;
    title: string[];
    steps: { number: string; title: string; text: string }[];
  };
  styles: {
    kicker: string;
    title: string[];
    note: string;
    columns: { title: string; beats: string[] }[];
  };
  offers: {
    kicker: string;
    title: string[];
    intro: string;
    tiers: { title: string; text: string }[];
    note: string;
    cta: string;
  };
  trust: { items: { title: string; text: string }[]; cta: string };
  about: {
    kicker: string;
    title: string;
    paragraphs: string[];
    founder: { title: string; text: string };
  };
  universes: Record<UniverseId, UniverseCopy>;
  contactForm: {
    kicker: string;
    title: string[];
    subtitle: string;
    responseTime: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    sector: string;
    sectorOptions: { value: string; label: string }[];
    url: string;
    message: string;
    submit: string;
    submitting: string;
    success: string;
    successNote: string;
    error: string;
    privacyNote: string;
    errors: { required: string; email: string; url: string };
  };
  footer: { nav: NavLink[]; universes: NavLink[]; legal: NavLink[]; rights: string };
  stickyCta: { label: string; dismiss: string };
  langToggle: string;
}

export const content: Record<Locale, ContentShape> = {
  fr: {
    common: { close: "Fermer" },
    nav: {
      links: [
        { label: "Real Estate", href: "/real-estate" },
        { label: "Wedding & Venues", href: "/wedding-venues" },
        { label: "Hospitality", href: "/hospitality" },
        { label: "Business", href: "/business" },
        { label: "Contact", href: "#contact" },
      ],
      cta: "Confier un projet",
      openMenu: "Ouvrir le menu",
      closeMenu: "Fermer le menu",
      homeLabel: "Accueil",
    },
    hero: {
      kicker: "ESTALIA STUDIO",
      title: ["Nous transformons les lieux d'exception", "en expériences cinématographiques."],
      subtitle: "Films sur mesure pour l'immobilier, l'hospitality et les lieux d'exception.",
      ctaPrimary: "Découvrir nos réalisations",
      ctaSecondary: "Nous confier un projet",
      scroll: "Défiler",
    },
    universeChooser: {
      kicker: "Nos univers",
      title: ["Quatre expertises,", "une seule exigence."],
      subtitle: "Choisissez l'univers qui correspond à votre lieu.",
      items: [
        {
          id: "real-estate",
          label: "Real Estate",
          text: "Des films conçus autour de l'architecture et de l'histoire de chaque propriété.",
          cta: "Découvrir",
        },
        {
          id: "wedding-venues",
          label: "Wedding & Venues",
          text: "Faites vivre l'émotion de votre lieu avant même la première visite.",
          cta: "Découvrir",
        },
        {
          id: "hospitality",
          label: "Hospitality",
          text: "Donnez envie de vivre l'expérience avant même la réservation.",
          cta: "Découvrir",
        },
        {
          id: "business",
          label: "Business",
          text: "Transformez votre établissement en campagne cinématique.",
          cta: "Découvrir",
        },
      ],
    },
    manifesto: {
      kicker: "Manifeste",
      title: ["Chaque lieu", "mérite sa propre mise en scène."],
      paragraphs: [
        "Nous ne travaillons pas à partir de modèles vidéo prédéfinis.",
        "L'architecture, l'environnement, les volumes et les caractéristiques remarquables de chaque lieu déterminent sa direction artistique.",
        "Un château ne se raconte pas comme un hôtel de charme. Un domaine de mariage ne se présente pas comme une concession automobile.",
        "Chaque réalisation est pensée autour du lieu — jamais autour d'un modèle générique.",
      ],
      cta: "Discuter de votre projet",
    },
    films: {
      kicker: "Selected Films",
      title: "SELECTED FILMS",
      subtitle: "Plusieurs lieux. Plusieurs univers. Une seule exigence cinématographique.",
      watch: "Voir le film",
      play: "Lecture",
      comingSoon: "Film à venir",
      cta: "Vous avez un lieu à mettre en scène ?",
    },
    approach: {
      kicker: "Notre méthode",
      title: ["THE ESTALIA", "APPROACH"],
      steps: [
        {
          number: "01",
          title: "Analyse",
          text: "Architecture, environnement, volumes, lumière et éléments distinctifs du lieu.",
        },
        {
          number: "02",
          title: "Direction",
          text: "Nous imaginons une narration et une direction cinématographique spécifiques.",
        },
        {
          number: "03",
          title: "Production",
          text: "Nous transformons les visuels disponibles en séquences cinématiques.",
        },
        {
          number: "04",
          title: "Validation",
          text: "Le client valide le film avant toute utilisation.",
        },
      ],
    },
    styles: {
      kicker: "Exemples de directions",
      title: ["Une réalisation différente", "pour chaque bien."],
      note: "Aucun scénario n'est appliqué automatiquement. La réalisation s'adapte au bien.",
      columns: [
        {
          title: "Château",
          beats: [
            "Arrivée aérienne au-dessus du domaine.",
            "Découverte progressive de l'allée.",
            "Révélation de la façade.",
            "Entrée dans le château.",
            "Détails architecturaux.",
            "Parc et plan final aérien.",
          ],
        },
        {
          title: "Villa méditerranéenne",
          beats: [
            "Approche depuis le paysage.",
            "Piscine et architecture.",
            "Transition à travers une baie vitrée.",
            "Volumes intérieurs.",
            "Terrasses.",
            "Golden hour.",
          ],
        },
        {
          title: "Appartement parisien",
          beats: [
            "Architecture extérieure.",
            "Balcon.",
            "Entrée.",
            "Perspectives du séjour.",
            "Moulures et matières.",
            "Vue sur Paris.",
          ],
        },
      ],
    },
    offers: {
      kicker: "Nos formules",
      title: ["Trois façons de", "collaborer avec nous."],
      intro:
        "Chaque projet est unique : nous établissons un devis sur mesure selon le lieu, la durée de production et vos besoins.",
      tiers: [
        { title: "Film Signature", text: "Pour une réalisation ponctuelle et exceptionnelle." },
        { title: "Film Prestige", text: "Pour une production plus ambitieuse, sur un lieu d'exception." },
        { title: "Collaboration", text: "Pour les professionnels avec plusieurs besoins réguliers." },
      ],
      note: "Sur devis",
      cta: "Demander un devis",
    },
    trust: {
      items: [
        {
          title: "Fidélité du lieu",
          text: "Chaque réalisation fait l'objet d'une validation afin de préserver au maximum l'identité et les caractéristiques essentielles du lieu.",
        },
        {
          title: "Validation",
          text: "Aucun contenu n'est publié sans validation.",
        },
        {
          title: "Confidentialité",
          text: "Les visuels et informations transmis restent utilisés uniquement dans le cadre de la réalisation.",
        },
        {
          title: "Sur mesure",
          text: "Chaque lieu fait l'objet d'une direction artistique spécifique.",
        },
      ],
      cta: "Nous contacter en toute confidentialité",
    },
    about: {
      kicker: "À propos",
      title: "ESTALIA STUDIO",
      paragraphs: [
        "Estalia Studio est un studio créatif spécialisé dans la mise en scène cinématographique de lieux d'exception.",
        "Nous associons direction artistique et technologies de création visuelle de nouvelle génération pour révéler l'identité propre de chaque lieu — qu'il s'agisse d'une propriété, d'un domaine, d'un hôtel ou d'un commerce premium.",
      ],
      founder: {
        title: "Fondateur — Estalia Studio",
        text: "Votre interlocuteur direct pour vos projets, quel que soit votre secteur.",
      },
    },
    universes: {
      "real-estate": {
        navLabel: "Real Estate",
        seo: {
          title: "Estalia Real Estate — Films cinématographiques pour propriétés d'exception",
          description:
            "Nous transformons les visuels existants d'une propriété en film cinématique pensé pour son architecture et son histoire. Châteaux, villas, appartements de prestige, domaines.",
        },
        hero: {
          kicker: "ESTALIA REAL ESTATE",
          title: ["Des films pensés", "pour chaque propriété d'exception."],
          subtitle:
            "Nous transformons les visuels existants d'un bien en film cinématographique conçu spécifiquement pour son architecture et son histoire.",
          ctaPrimary: "Voir nos réalisations",
          ctaSecondary: "Confier une propriété",
        },
        intro: {
          kicker: "Notre approche",
          title: ["L'architecture d'abord,", "jamais un modèle générique."],
          paragraphs: [
            "Un film Estalia n'est jamais une animation de photos. C'est une direction créative pensée pour révéler l'architecture, l'atmosphère et l'histoire propres à chaque bien.",
            "Châteaux, villas, appartements de prestige, penthouses, domaines, maisons d'architecte, propriétés historiques : chaque type de lieu appelle sa propre mise en scène, son propre rythme, sa propre narration.",
            "Le film reste fidèle au bien — nous mettons en scène ce qui existe déjà, nous ne le réinventons pas.",
          ],
        },
        shotLists: [
          {
            title: "Exemple de réalisation — Château",
            beats: [
              "Arrivée aérienne au-dessus du domaine.",
              "Approche par l'allée.",
              "Révélation du château.",
              "Façade.",
              "Entrée.",
              "Pièces principales.",
              "Détails architecturaux.",
              "Jardins.",
              "Plan final spectaculaire.",
            ],
          },
        ],
        portfolio: {
          kicker: "Real Estate",
          title: "PROPRIÉTÉS D'EXCEPTION",
          subtitle: "Quelques biens. Des directions artistiques entièrement différentes.",
        },
        cta: "Confier une propriété",
      },
      "wedding-venues": {
        navLabel: "Wedding & Venues",
        seo: {
          title: "Estalia Wedding & Venues — Films cinématographiques pour domaines et lieux de réception",
          description:
            "Nous transformons votre domaine en expérience cinématique qui permet aux futurs mariés de s'y projeter avant même la première visite.",
        },
        hero: {
          kicker: "ESTALIA WEDDING & VENUES",
          title: ["Imaginez votre journée", "ici."],
          subtitle:
            "Un lieu d'exception mérite une présentation à sa hauteur — nous transformons votre domaine en expérience cinématographique qui permet aux futurs mariés de s'y projeter immédiatement.",
          ctaPrimary: "Voir nos réalisations",
          ctaSecondary: "Mettre en scène votre domaine",
        },
        intro: {
          kicker: "Notre approche",
          title: ["L'émotion avant", "la démonstration."],
          paragraphs: [
            "Un mariage se choisit avec le cœur. Notre film donne aux futurs mariés la possibilité de se projeter dans votre lieu avant même la première visite.",
            "Cérémonie extérieure, jardins, terrasse, salle de réception, lumière du soir : nous mettons en scène chaque espace pour transmettre l'émotion et le patrimoine qui rendent votre domaine unique.",
            "L'objectif n'est pas de montrer un lieu vide, mais de faire ressentir ce que sera la journée.",
          ],
        },
        shotLists: [
          {
            title: "Exemple de réalisation — Domaine de mariage",
            beats: [
              "Vue aérienne du domaine.",
              "Arrivée par l'allée.",
              "Révélation du château.",
              "Jardins.",
              "Cérémonie extérieure.",
              "Terrasse.",
              "Salle de réception.",
              "Tables dressées.",
              "Lumières du soir.",
              "Coucher de soleil.",
              "Plan final du domaine.",
            ],
          },
        ],
        portfolio: {
          kicker: "Wedding & Venues",
          title: "LIEUX DE RÉCEPTION",
          subtitle: "Des domaines pensés pour faire rêver avant la première visite.",
        },
        cta: "Mettre en scène votre domaine",
      },
      hospitality: {
        navLabel: "Hospitality",
        seo: {
          title: "Estalia Hospitality — Films cinématographiques pour hôtels et restaurants",
          description:
            "Nous transformons votre établissement en expérience cinématique qui donne envie de le vivre avant même la réservation. Hôtels, hôtels boutique, resorts, spas, restaurants.",
        },
        hero: {
          kicker: "ESTALIA HOSPITALITY",
          title: ["Donnez envie de vivre", "l'expérience."],
          subtitle:
            "Nous transformons votre établissement en expérience cinématique qui donne envie de le vivre avant même la réservation.",
          ctaPrimary: "Voir nos réalisations",
          ctaSecondary: "Présenter votre établissement",
        },
        intro: {
          kicker: "Notre approche",
          title: ["L'expérience avant", "la réservation."],
          paragraphs: [
            "Notre message n'est pas « nous faisons de belles vidéos ». C'est : nous transformons votre établissement en expérience cinématique.",
            "Hôtels, hôtels boutique, resorts, maisons d'hôtes premium, spas, restaurants haut de gamme : chaque lieu a ses propres rituels, sa propre atmosphère — c'est elle que nous mettons en scène.",
            "L'objectif est simple : donner envie de réserver, de venir, de vivre l'expérience.",
          ],
        },
        shotLists: [
          {
            title: "Exemple — Hôtel",
            beats: [
              "Paysage / destination.",
              "Approche de l'hôtel.",
              "Façade.",
              "Lobby.",
              "Chambre.",
              "Vue depuis la chambre.",
              "Piscine.",
              "Spa.",
              "Restaurant.",
              "Coucher de soleil.",
            ],
          },
          {
            title: "Exemple — Restaurant",
            beats: [
              "Ville.",
              "Rue.",
              "Façade.",
              "Entrée.",
              "Salle.",
              "Cuisine.",
              "Plats.",
              "Cocktails.",
              "Terrasse.",
              "Ambiance du soir.",
            ],
          },
        ],
        portfolio: {
          kicker: "Hospitality",
          title: "ÉTABLISSEMENTS D'EXCEPTION",
          subtitle: "Hôtels, restaurants : une expérience à donner envie de vivre.",
        },
        cta: "Présenter votre établissement",
      },
      business: {
        navLabel: "Business",
        seo: {
          title: "Estalia Business — Films de marque pour commerces et entreprises premium",
          description:
            "Nous mettons en scène les commerces et entreprises au vrai potentiel visuel : concessions automobiles, showrooms, boutiques premium, salles de sport, spas.",
        },
        hero: {
          kicker: "ESTALIA BUSINESS",
          title: ["Transformez votre établissement", "en campagne cinématique."],
          subtitle:
            "Concessions automobiles, showrooms, boutiques premium, salles de sport, spas, restaurants : nous mettons en scène les commerces et entreprises au vrai potentiel visuel.",
          ctaPrimary: "Voir nos réalisations",
          ctaSecondary: "Présenter votre entreprise",
        },
        intro: {
          kicker: "Notre approche",
          title: ["Un vrai potentiel visuel,", "pas tous les commerces."],
          paragraphs: [
            "Cette expertise s'adresse aux commerces et entreprises qui ont un vrai potentiel visuel — pas à tous les commerces indistinctement.",
            "Un lieu, des produits, une ambiance : nous les mettons en scène avec la même exigence cinématographique que nos films immobiliers et hôteliers.",
            "Le positionnement reste premium, pensé pour des marques qui veulent se démarquer par l'image.",
          ],
        },
        shotLists: [
          {
            title: "Exemple — Concession automobile",
            beats: [
              "Extérieur.",
              "Enseigne.",
              "Ouverture du showroom.",
              "Véhicule.",
              "Détails carrosserie.",
              "Intérieur.",
              "Mouvement cinématique.",
              "Logo.",
            ],
          },
          {
            title: "Exemple — Salle de sport",
            beats: ["Extérieur.", "Entrée.", "Espaces.", "Machines.", "Entraînement.", "Détails.", "Ambiance.", "Branding."],
          },
        ],
        portfolio: {
          kicker: "Business",
          title: "MARQUES & ÉTABLISSEMENTS",
          subtitle: "Des commerces mis en scène avec la même exigence que nos films immobiliers.",
        },
        cta: "Présenter votre entreprise",
      },
    },
    contactForm: {
      kicker: "Contact",
      title: ["Un projet à nous", "confier ?"],
      subtitle:
        "Décrivez votre lieu ou votre établissement — nous revenons vers vous avec une direction artistique adaptée.",
      responseTime:
        "Réponse personnelle sous 48h ouvrées — vous échangez directement avec le fondateur, jamais avec un centre d'appels.",
      name: "Nom",
      company: "Entreprise",
      email: "Email",
      phone: "Téléphone",
      sector: "Secteur",
      sectorOptions: [
        { value: "immobilier", label: "Immobilier" },
        { value: "hotel", label: "Hôtel" },
        { value: "restaurant", label: "Restaurant" },
        { value: "mariage", label: "Mariage & événementiel" },
        { value: "commerce", label: "Commerce" },
        { value: "autre", label: "Autre" },
      ],
      url: "URL du bien / établissement",
      message: "Message",
      submit: "Confier un projet",
      submitting: "Envoi en cours…",
      success: "Merci. Votre demande a bien été transmise.",
      successNote: "Nous revenons vers vous sous 48h ouvrées.",
      error: "Une erreur est survenue. Merci de réessayer, ou de nous écrire directement.",
      privacyNote:
        "Vos coordonnées restent strictement confidentielles : elles ne servent qu'à étudier votre demande, et ne sont jamais partagées.",
      errors: {
        required: "Ce champ est requis.",
        email: "Merci de renseigner un email valide.",
        url: "Merci de renseigner un lien valide.",
      },
    },
    footer: {
      nav: [
        { label: "Réalisations", href: "#films" },
        { label: "Notre méthode", href: "#approche" },
        { label: "À propos", href: "/#about" },
        { label: "Contact", href: "#contact" },
      ],
      universes: [
        { label: "Real Estate", href: "/real-estate" },
        { label: "Wedding & Venues", href: "/wedding-venues" },
        { label: "Hospitality", href: "/hospitality" },
        { label: "Business", href: "/business" },
      ],
      legal: [
        { label: "Mentions légales", href: "/mentions-legales" },
        { label: "Politique de confidentialité", href: "/confidentialite" },
      ],
      rights: "Tous droits réservés.",
    },
    stickyCta: { label: "Discuter d'un projet", dismiss: "Masquer" },
    langToggle: "EN",
  },

  en: {
    common: { close: "Close" },
    nav: {
      links: [
        { label: "Real Estate", href: "/real-estate" },
        { label: "Wedding & Venues", href: "/wedding-venues" },
        { label: "Hospitality", href: "/hospitality" },
        { label: "Business", href: "/business" },
        { label: "Contact", href: "#contact" },
      ],
      cta: "Submit a project",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      homeLabel: "Home",
    },
    hero: {
      kicker: "ESTALIA STUDIO",
      title: ["We turn exceptional places", "into cinematic experiences."],
      subtitle: "Bespoke films for real estate, hospitality and exceptional places.",
      ctaPrimary: "Discover our films",
      ctaSecondary: "Submit a project",
      scroll: "Scroll",
    },
    universeChooser: {
      kicker: "Our worlds",
      title: ["Four expertises,", "one standard."],
      subtitle: "Choose the world that matches your place.",
      items: [
        {
          id: "real-estate",
          label: "Real Estate",
          text: "Films built around the architecture and the story of each property.",
          cta: "Discover",
        },
        {
          id: "wedding-venues",
          label: "Wedding & Venues",
          text: "Bring the emotion of your venue to life before the first visit.",
          cta: "Discover",
        },
        {
          id: "hospitality",
          label: "Hospitality",
          text: "Make people want to live the experience before they've even booked.",
          cta: "Discover",
        },
        {
          id: "business",
          label: "Business",
          text: "Turn your establishment into a cinematic campaign.",
          cta: "Discover",
        },
      ],
    },
    manifesto: {
      kicker: "Manifesto",
      title: ["Every place deserves", "its own story."],
      paragraphs: [
        "We do not work from predefined video templates.",
        "The architecture, the setting, the volumes and the defining features of each place shape its creative direction.",
        "A château is not told the way a boutique hotel is. A wedding venue is not presented the way a car dealership is.",
        "Every film is conceived around the place itself — never around a generic template.",
      ],
      cta: "Discuss your project",
    },
    films: {
      kicker: "Selected Films",
      title: "SELECTED FILMS",
      subtitle: "Several places. Several worlds. One cinematic standard.",
      watch: "Watch the film",
      play: "Play",
      comingSoon: "Film coming soon",
      cta: "Have a place to put on screen?",
    },
    approach: {
      kicker: "Our method",
      title: ["THE ESTALIA", "APPROACH"],
      steps: [
        {
          number: "01",
          title: "Analysis",
          text: "Architecture, setting, volumes, light and the defining features of the place.",
        },
        {
          number: "02",
          title: "Direction",
          text: "We imagine a narrative and a cinematic direction built specifically for it.",
        },
        {
          number: "03",
          title: "Production",
          text: "We transform the available visuals into cinematic sequences.",
        },
        {
          number: "04",
          title: "Approval",
          text: "The client approves the film before any use.",
        },
      ],
    },
    styles: {
      kicker: "Direction examples",
      title: ["A different film", "for every property."],
      note: "No script is applied automatically. The direction adapts to the property.",
      columns: [
        {
          title: "Château",
          beats: [
            "Aerial arrival above the estate.",
            "Gradual discovery of the driveway.",
            "Reveal of the façade.",
            "Entrance into the château.",
            "Architectural details.",
            "Grounds and final aerial shot.",
          ],
        },
        {
          title: "Mediterranean villa",
          beats: [
            "Approach through the landscape.",
            "Pool and architecture.",
            "Transition through a glass bay.",
            "Interior volumes.",
            "Terraces.",
            "Golden hour.",
          ],
        },
        {
          title: "Parisian apartment",
          beats: [
            "Exterior architecture.",
            "Balcony.",
            "Entrance.",
            "Living room perspectives.",
            "Mouldings and materials.",
            "View over Paris.",
          ],
        },
      ],
    },
    offers: {
      kicker: "Our packages",
      title: ["Three ways to", "work with us."],
      intro:
        "Every project is unique: we put together a bespoke quote based on the place, the production scope and your needs.",
      tiers: [
        { title: "Film Signature", text: "For a single, exceptional film." },
        { title: "Film Prestige", text: "For a more ambitious production, on an exceptional place." },
        { title: "Collaboration", text: "For professionals with several ongoing needs." },
      ],
      note: "Quote on request",
      cta: "Request a quote",
    },
    trust: {
      items: [
        {
          title: "Fidelity to the place",
          text: "Every film goes through an approval step designed to preserve, as closely as possible, the identity and essential character of the place.",
        },
        {
          title: "Approval",
          text: "No content is published without approval.",
        },
        {
          title: "Confidentiality",
          text: "Visuals and information shared with us are used solely for the purpose of the production.",
        },
        {
          title: "Bespoke",
          text: "Every place receives its own dedicated creative direction.",
        },
      ],
      cta: "Contact us in complete confidentiality",
    },
    about: {
      kicker: "About",
      title: "ESTALIA STUDIO",
      paragraphs: [
        "Estalia Studio is a creative studio specialised in the cinematic staging of exceptional places.",
        "We bring together creative direction and next-generation visual production technology to reveal the true identity of each place — whether a property, an estate, a hotel or a premium business.",
      ],
      founder: {
        title: "Founder — Estalia Studio",
        text: "Your direct contact for your project, whatever your sector.",
      },
    },
    universes: {
      "real-estate": {
        navLabel: "Real Estate",
        seo: {
          title: "Estalia Real Estate — Cinematic films for exceptional properties",
          description:
            "We transform a property's existing visuals into a cinematic film built around its architecture and its story. Châteaux, villas, prestige apartments, estates.",
        },
        hero: {
          kicker: "ESTALIA REAL ESTATE",
          title: ["Films crafted for", "every exceptional property."],
          subtitle:
            "We transform a property's existing visuals into a cinematic film built specifically around its architecture and its story.",
          ctaPrimary: "View our films",
          ctaSecondary: "Submit a property",
        },
        intro: {
          kicker: "Our approach",
          title: ["Architecture first,", "never a generic template."],
          paragraphs: [
            "An Estalia film is never a photo slideshow. It's a creative direction built to reveal the architecture, atmosphere and story specific to each property.",
            "Châteaux, villas, prestige apartments, penthouses, estates, architect-designed homes, historic properties: each type of place calls for its own staging, its own pace, its own narrative.",
            "The film stays faithful to the property — we stage what already exists, we don't reinvent it.",
          ],
        },
        shotLists: [
          {
            title: "Example film — Château",
            beats: [
              "Aerial arrival above the estate.",
              "Approach along the driveway.",
              "Reveal of the château.",
              "Façade.",
              "Entrance.",
              "Principal rooms.",
              "Architectural details.",
              "Gardens.",
              "Spectacular final shot.",
            ],
          },
        ],
        portfolio: {
          kicker: "Real Estate",
          title: "EXCEPTIONAL PROPERTIES",
          subtitle: "A handful of properties. Entirely different creative directions.",
        },
        cta: "Submit a property",
      },
      "wedding-venues": {
        navLabel: "Wedding & Venues",
        seo: {
          title: "Estalia Wedding & Venues — Cinematic films for estates and reception venues",
          description:
            "We turn your venue into a cinematic experience that lets future couples picture themselves there before the first visit.",
        },
        hero: {
          kicker: "ESTALIA WEDDING & VENUES",
          title: ["Picture your day", "here."],
          subtitle:
            "An exceptional venue deserves a presentation to match — we turn your estate into a cinematic experience that lets future couples picture themselves there instantly.",
          ctaPrimary: "View our films",
          ctaSecondary: "Showcase your venue",
        },
        intro: {
          kicker: "Our approach",
          title: ["Emotion before", "demonstration."],
          paragraphs: [
            "A wedding is chosen with the heart. Our film lets future couples picture themselves at your venue before they've even visited.",
            "Outdoor ceremony, gardens, terrace, reception hall, evening light: we stage every space to convey the emotion and the heritage that make your venue unique.",
            "The goal isn't to show an empty room — it's to make people feel what the day will be like.",
          ],
        },
        shotLists: [
          {
            title: "Example film — Wedding venue",
            beats: [
              "Aerial view of the estate.",
              "Arrival along the driveway.",
              "Reveal of the château.",
              "Gardens.",
              "Outdoor ceremony.",
              "Terrace.",
              "Reception hall.",
              "Tables set.",
              "Evening lights.",
              "Sunset.",
              "Final shot of the estate.",
            ],
          },
        ],
        portfolio: {
          kicker: "Wedding & Venues",
          title: "RECEPTION VENUES",
          subtitle: "Estates staged to let people dream before the first visit.",
        },
        cta: "Showcase your venue",
      },
      hospitality: {
        navLabel: "Hospitality",
        seo: {
          title: "Estalia Hospitality — Cinematic films for hotels and restaurants",
          description:
            "We turn your establishment into a cinematic experience that makes people want to live it before they've even booked. Hotels, boutique hotels, resorts, spas, restaurants.",
        },
        hero: {
          kicker: "ESTALIA HOSPITALITY",
          title: ["Make guests crave", "the experience."],
          subtitle:
            "We turn your establishment into a cinematic experience that makes people want to live it before they've even booked.",
          ctaPrimary: "View our films",
          ctaSecondary: "Showcase your establishment",
        },
        intro: {
          kicker: "Our approach",
          title: ["The experience before", "the booking."],
          paragraphs: [
            "Our message isn't 'we make beautiful videos.' It's: we turn your establishment into a cinematic experience.",
            "Hotels, boutique hotels, resorts, premium guesthouses, spas, fine restaurants: every place has its own rituals, its own atmosphere — that's what we stage.",
            "The goal is simple: make people want to book, to come, to live the experience.",
          ],
        },
        shotLists: [
          {
            title: "Example — Hotel",
            beats: [
              "Landscape / destination.",
              "Approach to the hotel.",
              "Façade.",
              "Lobby.",
              "Room.",
              "View from the room.",
              "Pool.",
              "Spa.",
              "Restaurant.",
              "Sunset.",
            ],
          },
          {
            title: "Example — Restaurant",
            beats: [
              "City.",
              "Street.",
              "Façade.",
              "Entrance.",
              "Dining room.",
              "Kitchen.",
              "Dishes.",
              "Cocktails.",
              "Terrace.",
              "Evening ambience.",
            ],
          },
        ],
        portfolio: {
          kicker: "Hospitality",
          title: "EXCEPTIONAL ESTABLISHMENTS",
          subtitle: "Hotels, restaurants: an experience worth wanting to live.",
        },
        cta: "Showcase your establishment",
      },
      business: {
        navLabel: "Business",
        seo: {
          title: "Estalia Business — Cinematic brand films for premium businesses",
          description:
            "We stage businesses with real visual potential: car dealerships, showrooms, premium boutiques, gyms, spas.",
        },
        hero: {
          kicker: "ESTALIA BUSINESS",
          title: ["Turn your business", "into a cinematic campaign."],
          subtitle:
            "Car dealerships, showrooms, premium boutiques, gyms, spas, restaurants: we stage businesses with real visual potential.",
          ctaPrimary: "View our films",
          ctaSecondary: "Present your business",
        },
        intro: {
          kicker: "Our approach",
          title: ["Real visual potential,", "not every shop."],
          paragraphs: [
            "This expertise is for businesses with real visual potential — not for every small shop indiscriminately.",
            "A place, products, an atmosphere: we stage them with the same cinematic rigor as our real estate and hospitality films.",
            "The positioning stays premium, built for brands that want to stand out through image.",
          ],
        },
        shotLists: [
          {
            title: "Example — Car dealership",
            beats: [
              "Exterior.",
              "Signage.",
              "Showroom opening.",
              "Vehicle.",
              "Bodywork details.",
              "Interior.",
              "Cinematic movement.",
              "Logo.",
            ],
          },
          {
            title: "Example — Gym",
            beats: ["Exterior.", "Entrance.", "Spaces.", "Equipment.", "Training.", "Details.", "Atmosphere.", "Branding."],
          },
        ],
        portfolio: {
          kicker: "Business",
          title: "BRANDS & ESTABLISHMENTS",
          subtitle: "Businesses staged with the same rigor as our real estate films.",
        },
        cta: "Present your business",
      },
    },
    contactForm: {
      kicker: "Contact",
      title: ["A project to", "entrust to us?"],
      subtitle: "Tell us about your place or establishment — we'll come back with a creative direction that fits.",
      responseTime:
        "A personal reply within 48 working hours — you deal directly with the founder, never a call centre.",
      name: "Name",
      company: "Company",
      email: "Email",
      phone: "Phone",
      sector: "Sector",
      sectorOptions: [
        { value: "immobilier", label: "Real estate" },
        { value: "hotel", label: "Hotel" },
        { value: "restaurant", label: "Restaurant" },
        { value: "mariage", label: "Wedding & events" },
        { value: "commerce", label: "Business" },
        { value: "autre", label: "Other" },
      ],
      url: "Property / establishment URL",
      message: "Message",
      submit: "Submit a project",
      submitting: "Sending…",
      success: "Thank you. Your request has been sent.",
      successNote: "We'll be in touch within 48 working hours.",
      error: "Something went wrong. Please try again, or write to us directly.",
      privacyNote: "Your details stay strictly confidential: used only to review your request, and never shared.",
      errors: {
        required: "This field is required.",
        email: "Please enter a valid email address.",
        url: "Please enter a valid link.",
      },
    },
    footer: {
      nav: [
        { label: "Films", href: "#films" },
        { label: "Our method", href: "#approche" },
        { label: "About", href: "/#about" },
        { label: "Contact", href: "#contact" },
      ],
      universes: [
        { label: "Real Estate", href: "/real-estate" },
        { label: "Wedding & Venues", href: "/wedding-venues" },
        { label: "Hospitality", href: "/hospitality" },
        { label: "Business", href: "/business" },
      ],
      legal: [
        { label: "Legal notice", href: "/mentions-legales" },
        { label: "Privacy policy", href: "/confidentialite" },
      ],
      rights: "All rights reserved.",
    },
    stickyCta: { label: "Discuss a project", dismiss: "Dismiss" },
    langToggle: "FR",
  },
};

export type Content = ContentShape;
