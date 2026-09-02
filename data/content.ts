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
  immediateProof: {
    kicker: string;
    title: string[];
    beforeLabel: string;
    afterLabel: string;
    caption: string;
  };
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
  valueProps: {
    kicker: string;
    title: string[];
    negatives: string[];
    positives: { title: string; text: string }[];
  };
  offers: {
    kicker: string;
    title: string[];
    intro: string;
    tiers: {
      /** Identifiant stable (indépendant de la langue) pour brancher le paiement — voir data/config.ts payment.testCheckoutUrl. */
      id: "test" | "content" | "pro";
      title: string;
      price: string;
      period: string;
      text: string;
      deliverables: string[];
      badge?: string;
    }[];
    note: string;
    cta: string;
    testNote: { kicker: string; title: string; text: string };
  };
  trust: { items: { title: string; text: string }[]; cta: string };
  faq: { kicker: string; title: string[]; items: { q: string; a: string }[] };
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
        { label: "Portfolio", href: "#work" },
        { label: "Comment ça marche", href: "#how-it-works" },
        { label: "Tarifs", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
        { label: "Contact", href: "#contact" },
      ],
      cta: "Commencer",
      openMenu: "Ouvrir le menu",
      closeMenu: "Fermer le menu",
      homeLabel: "Accueil",
    },
    hero: {
      kicker: "ESTALIA STUDIO — HOSPITALITY",
      title: ["Transformez les visuels que vous avez déjà", "en contenu social premium."],
      subtitle: "Pas de nouveau tournage. Pas de déplacement. Du contenu frais chaque mois, pour votre hôtel.",
      ctaPrimary: "Voir comment ça marche",
      ctaSecondary: "Voir nos réalisations",
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
      kicker: "Le constat",
      title: ["Vous avez déjà investi", "dans de belles photos."],
      paragraphs: [
        "Mais les réseaux sociaux demandent du mouvement, de la fréquence et des formats renouvelés — pas seulement des photos statiques.",
        "Estalia transforme la bibliothèque visuelle que vous possédez déjà en un moteur de contenu continu.",
      ],
      cta: "Voir comment ça marche",
    },
    immediateProof: {
      kicker: "En une image",
      title: ["Votre photo.", "Notre traitement. Votre contenu."],
      beforeLabel: "Votre photo",
      afterLabel: "Le contenu Estalia",
      caption: "Aucun tournage. Le point de départ est toujours un visuel que vous possédez déjà.",
    },
    films: {
      kicker: "Portfolio",
      title: "CE QUE NOUS CRÉONS",
      subtitle: "Des exemples de concept, pensés pour l'hôtellerie indépendante haut de gamme.",
      watch: "Voir le concept",
      play: "Lecture",
      comingSoon: "Concept à venir",
      cta: "Un lieu à mettre en scène ?",
    },
    approach: {
      kicker: "Comment ça marche",
      title: ["TROIS ÉTAPES,", "AUCUN TOURNAGE."],
      steps: [
        {
          number: "01",
          title: "Envoyez vos visuels",
          text: "Vos photos et vidéos existantes — celles que vous avez déjà.",
        },
        {
          number: "02",
          title: "Nous créons",
          text: "Estalia les transforme en contenu cinématique et social-natif.",
        },
        {
          number: "03",
          title: "Vous publiez",
          text: "Vous recevez du contenu prêt à l'emploi, dans les formats de vos canaux.",
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
    valueProps: {
      kicker: "Pourquoi Estalia",
      title: ["Aucun tournage.", "Aucun déplacement."],
      negatives: ["Pas de tournage", "Pas de déplacement", "Pas de journée de production", "Pas de nouvelle séance photo"],
      positives: [
        { title: "Production rapide", text: "Du contenu livré en jours, pas en semaines d'agenda de tournage." },
        { title: "Contenu régulier", text: "Une cadence mensuelle fiable, sans réorganiser un shooting à chaque fois." },
        { title: "Moins de friction", text: "Vous envoyez ce que vous avez déjà — c'est tout." },
        { title: "Formats multiples", text: "Hero cinématique, Reels, Stories — à partir des mêmes visuels." },
      ],
    },
    offers: {
      kicker: "Nos formules",
      title: ["Trois façons de", "collaborer avec nous."],
      intro: "Des prix clairs, pas de devis à rallonge.",
      tiers: [
        {
          id: "test",
          title: "Estalia Test",
          price: "290 €",
          period: "paiement unique",
          text: "Le point d'entrée à faible risque pour découvrir la qualité Estalia.",
          deliverables: ["1 film Hero cinématique", "2 déclinaisons courtes", "1 tour de retouches"],
        },
        {
          id: "content",
          title: "Estalia Content",
          price: "690 €",
          period: "/ mois",
          text: "Notre offre principale — un flux de contenu mensuel constant.",
          deliverables: ["6 contenus / mois", "1 Hero + Reels + Stories", "2 tours de retouches", "Engagement 3 mois"],
          badge: "La plus choisie",
        },
        {
          id: "pro",
          title: "Estalia Pro",
          price: "1 290 €",
          period: "/ mois",
          text: "Pour les établissements à volume supérieur et campagnes saisonnières.",
          deliverables: ["12 contenus / mois", "Contenu saisonnier inclus", "2 langues", "2 tours de retouches"],
        },
      ],
      note: "Tarifs hors taxes. Sans engagement pour Estalia Test.",
      cta: "Commencer avec Estalia",
      testNote: {
        kicker: "Estalia Test",
        title: "Le moyen le plus simple de commencer",
        text: "Envoyez-nous vos visuels. Vous recevez 1 film Hero + 2 déclinaisons courtes. Si le résultat vous convainc, passez à Content quand vous le souhaitez.",
      },
    },
    trust: {
      items: [
        {
          title: "Fidélité à votre établissement",
          text: "Nous mettons en scène ce qui existe déjà — l'architecture et l'agencement réels de vos chambres ne sont jamais modifiés.",
        },
        {
          title: "Validation systématique",
          text: "Chaque contenu est vérifié par une personne avant envoi. Rien n'est publié sans votre validation.",
        },
        {
          title: "Confidentialité",
          text: "Vos visuels et informations restent utilisés uniquement dans le cadre de votre projet.",
        },
        {
          title: "Sur mesure",
          text: "Chaque établissement fait l'objet d'une direction artistique qui lui est propre.",
        },
      ],
      cta: "Nous contacter en toute confidentialité",
    },
    faq: {
      kicker: "FAQ",
      title: ["Les questions", "les plus fréquentes."],
      items: [
        { q: "Devez-vous visiter notre hôtel ?", a: "Non. Tout est produit à distance, à partir des visuels que vous nous envoyez." },
        { q: "De quels visuels avez-vous besoin ?", a: "Vos photos et vidéos existantes — celles de votre site, de votre banque d'images ou de votre dernière séance photo." },
        { q: "Pouvez-vous travailler uniquement à partir de photos ?", a: "Oui — c'est le cas le plus fréquent. Aucune vidéo source n'est nécessaire." },
        { q: "Nos chambres seront-elles modifiées ?", a: "Non. Chaque contenu est vérifié avant envoi — rien ne modifie l'agencement ou le mobilier réels de vos chambres." },
        { q: "Combien de temps prend la production ?", a: "Comptez environ une semaine pour Estalia Test. Content suit un calendrier mensuel régulier." },
        { q: "Pouvons-nous commencer par un seul projet ?", a: "Oui — c'est exactement à cela que sert Estalia Test, sans engagement." },
      ],
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
        text: "Thibault Masse a fondé Estalia Studio avec une conviction simple : chaque lieu d'exception mérite mieux qu'une photo. Passionné par l'image et l'architecture, il apporte une approche de réalisateur à chaque projet — et reste votre interlocuteur direct, quel que soit votre secteur.",
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
        { label: "Portfolio", href: "#work" },
        { label: "Comment ça marche", href: "#how-it-works" },
        { label: "Tarifs", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ],
      universes: [
        { label: "Real Estate", href: "/real-estate" },
        { label: "Wedding & Venues", href: "/wedding-venues" },
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
        { label: "Work", href: "#work" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
        { label: "Contact", href: "#contact" },
      ],
      cta: "Start",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      homeLabel: "Home",
    },
    hero: {
      kicker: "ESTALIA STUDIO — HOSPITALITY",
      title: ["Turn your existing hotel visuals", "into premium social content."],
      subtitle: "No new shoot. No travel. Fresh content every month.",
      ctaPrimary: "See how it works",
      ctaSecondary: "View our work",
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
      kicker: "The problem",
      title: ["You already invested in", "beautiful photography."],
      paragraphs: [
        "But social platforms need movement, frequency and fresh formats — not just static photos.",
        "Estalia turns the visual library you already have into an ongoing content engine.",
      ],
      cta: "See how it works",
    },
    immediateProof: {
      kicker: "In one image",
      title: ["Your photo.", "Our treatment. Your content."],
      beforeLabel: "Your photo",
      afterLabel: "Estalia content",
      caption: "No shoot. The starting point is always a visual you already own.",
    },
    films: {
      kicker: "Portfolio",
      title: "WHAT WE CREATE",
      subtitle: "Concept demonstrations, built for independent premium hospitality.",
      watch: "View the concept",
      play: "Play",
      comingSoon: "Concept coming soon",
      cta: "Have a place to put on screen?",
    },
    approach: {
      kicker: "How it works",
      title: ["THREE STEPS.", "NO NEW SHOOT."],
      steps: [
        {
          number: "01",
          title: "Send your visuals",
          text: "Upload the photography and video you already have.",
        },
        {
          number: "02",
          title: "We create",
          text: "Estalia turns them into cinematic and social-native content.",
        },
        {
          number: "03",
          title: "You publish",
          text: "Receive ready-to-use content in the formats your channels need.",
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
    valueProps: {
      kicker: "Why Estalia",
      title: ["No new shoot.", "No travel."],
      negatives: ["No shoot", "No travel", "No production day", "No new photo library required"],
      positives: [
        { title: "Faster production", text: "Content delivered in days, not weeks of shoot scheduling." },
        { title: "Consistent content", text: "A reliable monthly cadence, without organising a new shoot each time." },
        { title: "Lower friction", text: "Send what you already have — that's it." },
        { title: "Multiple formats", text: "Cinematic hero, Reels, Stories — from the same visuals." },
      ],
    },
    offers: {
      kicker: "Pricing",
      title: ["Three ways to", "work with us."],
      intro: "Clear pricing. No lengthy quote process.",
      tiers: [
        {
          id: "test",
          title: "Estalia Test",
          price: "£290",
          period: "one-time",
          text: "A low-risk entry point to see the Estalia quality for yourself.",
          deliverables: ["1 cinematic Hero", "2 short variants", "1 revision round"],
        },
        {
          id: "content",
          title: "Estalia Content",
          price: "£690",
          period: "/ month",
          text: "Our core offer — a steady stream of monthly content.",
          deliverables: ["6 pieces / month", "1 Hero + Reels + Stories", "2 revision rounds", "3-month minimum"],
          badge: "Most popular",
        },
        {
          id: "pro",
          title: "Estalia Pro",
          price: "£1,290",
          period: "/ month",
          text: "For higher-volume properties and seasonal campaigns.",
          deliverables: ["12 pieces / month", "Seasonal content included", "2 languages", "2 revision rounds"],
        },
      ],
      note: "Prices exclude tax. No commitment on Estalia Test.",
      cta: "Start with Estalia",
      testNote: {
        kicker: "Estalia Test",
        title: "The simplest way to start",
        text: "Send us your visuals. You receive 1 cinematic Hero + 2 short variants. If you like the result, move to Content whenever you're ready.",
      },
    },
    trust: {
      items: [
        {
          title: "Fidelity to your property",
          text: "We stage what already exists — the real layout and furniture of your rooms is never altered.",
        },
        {
          title: "Always reviewed",
          text: "Every piece is checked by a person before it's sent. Nothing is published without your approval.",
        },
        {
          title: "Confidentiality",
          text: "Visuals and information you share are used solely for your project.",
        },
        {
          title: "Bespoke",
          text: "Every property receives its own dedicated creative direction.",
        },
      ],
      cta: "Contact us in complete confidentiality",
    },
    faq: {
      kicker: "FAQ",
      title: ["The questions", "we get asked most."],
      items: [
        { q: "Do you need to visit our hotel?", a: "No. Everything is produced remotely, from the visuals you send us." },
        { q: "What assets do you need?", a: "Your existing photos and video — from your website, image library or last photoshoot." },
        { q: "Can you work from photography only?", a: "Yes — that's the most common case. No source video is required." },
        { q: "Will our rooms be altered?", a: "No. Every piece is reviewed before it's sent — nothing changes the real layout or furniture of your rooms." },
        { q: "How long does production take?", a: "About a week for Estalia Test. Content follows a steady monthly schedule." },
        { q: "Can we start with one project?", a: "Yes — that's exactly what Estalia Test is for, with no commitment." },
      ],
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
        text: "Thibault Masse founded Estalia Studio on a simple conviction: every exceptional place deserves more than a photo. Driven by a passion for image and architecture, he brings a director's eye to every project — and stays your direct contact, whatever your sector.",
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
        { label: "Work", href: "#work" },
        { label: "How it works", href: "#how-it-works" },
        { label: "Pricing", href: "#pricing" },
        { label: "FAQ", href: "#faq" },
      ],
      universes: [
        { label: "Real Estate", href: "/real-estate" },
        { label: "Wedding & Venues", href: "/wedding-venues" },
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
