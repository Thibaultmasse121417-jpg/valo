/**
 * ------------------------------------------------------------------
 * CONTENU ÉDITORIAL — FR / EN
 * ------------------------------------------------------------------
 * Toutes les chaînes de texte du site sont centralisées ici, par langue.
 * Pour modifier un texte : cherchez la clé correspondante et éditez
 * la valeur `fr` et/ou `en`. Aucune traduction mot-à-mot : les deux
 * versions sont rédigées pour rester haut de gamme et naturelles.
 * ------------------------------------------------------------------
 */

export type Locale = "fr" | "en";

type NavLink = { label: string; href: string };

export interface ContentShape {
  common: { close: string };
  nav: { links: NavLink[]; cta: string; openMenu: string; closeMenu: string };
  hero: {
    kicker: string;
    title: string[];
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scroll: string;
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
  agencies: {
    kicker: string;
    title: string[];
    paragraphs: string[];
    tiers: { title: string; text: string }[];
    cta: string;
  };
  trust: { items: { title: string; text: string }[]; cta: string };
  about: {
    kicker: string;
    title: string;
    paragraphs: string[];
    founder: { title: string; text: string };
  };
  contact: {
    kicker: string;
    title: string[];
    subtitle: string;
    stepLabel: string; // ex. "Étape {n} sur {total}" — {n}/{total} remplacés au rendu
    back: string;
    fork: {
      prompt: string;
      capacity: string;
      responseTime: string;
      agency: { label: string; title: string; text: string; cta: string };
      owner: { label: string; title: string; text: string; cta: string };
    };
    agencyFlow: {
      step1Title: string;
      options: { value: string; label: string }[];
      step2Title: string;
      agencyName: string;
      agencyLink: string;
      step3Title: string;
      submit: string;
    };
    ownerFlow: {
      step1Title: string;
      options: { value: string; label: string }[];
      step2Title: string;
      location: string;
      listingUrl: string;
      step3Title: string;
      submit: string;
    };
    shared: {
      name: string;
      email: string;
      phone: string;
      message: string;
      next: string;
      privacyNote: string;
    };
    submitting: string;
    success: string;
    successOwner: string; // contient {type} — remplacé par le type de bien choisi
    successAgency: string; // contient {tier} — remplacé par le palier choisi
    successNote: string;
    booking: { title: string; cta: string };
    error: string;
    errors: { required: string; email: string; url: string };
  };
  footer: { nav: NavLink[]; legal: NavLink[]; rights: string };
  stickyCta: { label: string; dismiss: string };
  langToggle: string;
}

export const content: Record<Locale, ContentShape> = {
  fr: {
    common: { close: "Fermer" },
    nav: {
      links: [
        { label: "Réalisations", href: "#films" },
        { label: "Approche", href: "#approche" },
        { label: "Agences", href: "#agences" },
        { label: "À propos", href: "#about" },
        { label: "Contact", href: "#contact" },
      ],
      cta: "Confier un bien",
      openMenu: "Ouvrir le menu",
      closeMenu: "Fermer le menu",
    },
    hero: {
      kicker: "ESTALIA STUDIO",
      title: ["Des films à la hauteur", "des biens d'exception."],
      subtitle:
        "Nous transformons les visuels existants de propriétés remarquables en expériences cinématographiques conçues spécifiquement pour chaque bien.",
      ctaPrimary: "Voir nos réalisations",
      ctaSecondary: "Nous confier un bien",
      scroll: "Défiler",
    },
    manifesto: {
      kicker: "Manifeste",
      title: ["Chaque propriété", "possède sa propre histoire."],
      paragraphs: [
        "Nous ne travaillons pas à partir de modèles vidéo prédéfinis.",
        "L'architecture, l'environnement, les volumes et les caractéristiques remarquables de chaque propriété déterminent sa direction artistique.",
        "Un château ne se raconte pas comme une villa méditerranéenne.",
        "Un penthouse parisien ne se présente pas comme un domaine viticole.",
        "Chaque réalisation est pensée autour du lieu.",
      ],
      cta: "Discuter de votre bien",
    },
    films: {
      kicker: "Selected Films",
      title: "SELECTED FILMS",
      subtitle: "Quelques propriétés. Des directions artistiques entièrement différentes.",
      watch: "Voir le film",
      play: "Lecture",
      comingSoon: "Film à venir",
      cta: "Vous avez un bien à mettre en scène ?",
    },
    approach: {
      kicker: "Notre approche",
      title: ["Une direction artistique", "pour chaque propriété."],
      steps: [
        {
          number: "01",
          title: "Analyse",
          text: "Architecture, environnement, volumes, lumière et caractéristiques remarquables.",
        },
        {
          number: "02",
          title: "Direction",
          text: "Définition du rythme, des mouvements de caméra, de l'atmosphère et de la narration.",
        },
        {
          number: "03",
          title: "Production",
          text: "Création des séquences, montage, musique, identité visuelle et déclinaisons sociales.",
        },
        {
          number: "04",
          title: "Validation",
          text: "Chaque réalisation est soumise à validation avant toute utilisation ou publication.",
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
    agencies: {
      kicker: "Pour les agences",
      title: ["Pensé pour les", "agences de prestige."],
      paragraphs: [
        "Estalia accompagne les agences souhaitant proposer à leurs propriétaires une présentation visuelle à la hauteur de leurs mandats.",
        "Une réalisation peut être commandée pour une propriété particulière ou intégrée à une collaboration régulière pour accompagner vos nouvelles entrées.",
        "Un bien filmé retient l'attention bien plus longtemps qu'une simple galerie photo : il touche des acquéreurs plus qualifiés, et aide à défendre un prix à la hauteur du bien — plutôt qu'à le négocier à la baisse.",
      ],
      tiers: [
        {
          title: "À l'unité",
          text: "Pour un mandat exceptionnel.",
        },
        {
          title: "Collaboration",
          text: "Pour plusieurs propriétés par mois.",
        },
        {
          title: "Sur mesure",
          text: "Pour les agences disposant d'un volume important de biens premium.",
        },
      ],
      cta: "Parler de vos mandats",
    },
    trust: {
      items: [
        {
          title: "Fidélité du bien",
          text: "Notre objectif est de mettre en valeur la propriété, pas d'en modifier les caractéristiques essentielles.",
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
          text: "Chaque propriété fait l'objet d'une direction artistique spécifique.",
        },
      ],
      cta: "Nous contacter en toute confidentialité",
    },
    about: {
      kicker: "À propos",
      title: "ESTALIA STUDIO",
      paragraphs: [
        "Estalia Studio est un studio créatif spécialisé dans la mise en scène cinématographique de propriétés d'exception.",
        "Nous associons direction artistique, technologies de création visuelle et culture de l'immobilier haut de gamme afin de créer des contenus capables de révéler l'identité propre de chaque lieu.",
      ],
      founder: {
        title: "Fondateur — Estalia Studio",
        text: "Votre interlocuteur direct pour les projets et collaborations avec les agences.",
      },
    },
    contact: {
      kicker: "Contact",
      title: ["Vous avez un", "mandat exceptionnel ?"],
      subtitle:
        "Un premier échange de 15 minutes suffit pour évaluer la direction artistique adaptée à votre bien.",
      stepLabel: "Étape {n} sur {total}",
      back: "Retour",
      fork: {
        prompt: "Pour commencer, dites-nous qui vous êtes.",
        capacity:
          "Afin de préserver la qualité de chaque réalisation, nous limitons volontairement le nombre de productions menées en parallèle.",
        responseTime:
          "Réponse personnelle sous 48h ouvrées — vous échangez directement avec le fondateur, jamais avec un centre d'appels.",
        agency: {
          label: "Agence immobilière",
          title: "Je représente une agence",
          text: "Vous souhaitez proposer à vos mandants une présentation filmée à la hauteur de leurs biens.",
          cta: "Je suis une agence",
        },
        owner: {
          label: "Propriétaire",
          title: "Je suis propriétaire",
          text: "Vous souhaitez mettre en valeur un bien d'exception que vous possédez ou représentez.",
          cta: "Je suis propriétaire",
        },
      },
      agencyFlow: {
        step1Title: "Quel est votre volume de mandats premium ?",
        options: [
          { value: "unite", label: "Un mandat ponctuel exceptionnel" },
          { value: "collaboration", label: "Plusieurs biens chaque mois" },
          { value: "surmesure", label: "Un volume important de biens premium" },
        ],
        step2Title: "Parlez-nous de votre agence",
        agencyName: "Nom de l'agence",
        agencyLink: "Lien vers l'agence ou une annonce",
        step3Title: "Vos coordonnées",
        submit: "Confier vos mandats",
      },
      ownerFlow: {
        step1Title: "Quel type de bien souhaitez-vous mettre en valeur ?",
        options: [
          { value: "chateau", label: "Château" },
          { value: "villa", label: "Villa" },
          { value: "appartement", label: "Appartement de prestige" },
          { value: "domaine", label: "Domaine" },
          { value: "autre", label: "Autre bien d'exception" },
        ],
        step2Title: "Parlez-nous de votre propriété",
        location: "Localisation du bien",
        listingUrl: "Lien de l'annonce (si disponible)",
        step3Title: "Vos coordonnées",
        submit: "Confier la propriété",
      },
      shared: {
        name: "Nom",
        email: "Email",
        phone: "Téléphone (facultatif)",
        message: "Message (facultatif)",
        next: "Continuer",
        privacyNote:
          "Vos coordonnées restent strictement confidentielles : elles ne servent qu'à étudier votre demande, et ne sont jamais partagées.",
      },
      submitting: "Envoi en cours…",
      success: "Merci. Votre demande a bien été transmise.",
      successOwner: "Merci. Nous préparons votre lecture du bien — {type}.",
      successAgency: "Merci. Nous revenons vers vous au sujet de votre collaboration — {tier}.",
      successNote: "Nous revenons vers vous sous 48h ouvrées.",
      booking: {
        title: "Vous préférez échanger directement ?",
        cta: "Réserver un créneau de 15 minutes",
      },
      error: "Une erreur est survenue. Merci de réessayer ou de nous écrire directement.",
      errors: {
        required: "Ce champ est requis.",
        email: "Merci de renseigner un email valide.",
        url: "Merci de renseigner un lien valide.",
      },
    },
    footer: {
      nav: [
        { label: "Réalisations", href: "#films" },
        { label: "Approche", href: "#approche" },
        { label: "Agences", href: "#agences" },
        { label: "À propos", href: "#about" },
        { label: "Contact", href: "#contact" },
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
        { label: "Portfolio", href: "#films" },
        { label: "Approach", href: "#approche" },
        { label: "Agencies", href: "#agences" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
      ],
      cta: "Submit a property",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    hero: {
      kicker: "ESTALIA STUDIO",
      title: ["Films worthy of", "exceptional properties."],
      subtitle:
        "We transform the existing visuals of remarkable properties into cinematic experiences, conceived specifically for each estate.",
      ctaPrimary: "View our films",
      ctaSecondary: "Submit a property",
      scroll: "Scroll",
    },
    manifesto: {
      kicker: "Manifesto",
      title: ["Every property deserves", "its own story."],
      paragraphs: [
        "We do not work from predefined video templates.",
        "The architecture, the setting, the volumes and the defining features of each property shape its creative direction.",
        "A château is not told the way a Mediterranean villa is.",
        "A Parisian penthouse is not presented the way a vineyard estate is.",
        "Every film is conceived around the place itself.",
      ],
      cta: "Discuss your property",
    },
    films: {
      kicker: "Selected Films",
      title: "SELECTED FILMS",
      subtitle: "A handful of properties. Entirely different creative directions.",
      watch: "Watch the film",
      play: "Play",
      comingSoon: "Film coming soon",
      cta: "Have a property to put on screen?",
    },
    approach: {
      kicker: "Our approach",
      title: ["A creative direction", "for every property."],
      steps: [
        {
          number: "01",
          title: "Analysis",
          text: "Architecture, setting, volumes, light and the property's defining features.",
        },
        {
          number: "02",
          title: "Direction",
          text: "Defining the pacing, camera movement, atmosphere and narrative.",
        },
        {
          number: "03",
          title: "Production",
          text: "Filming, editing, score, visual identity and social edits.",
        },
        {
          number: "04",
          title: "Approval",
          text: "Every film is submitted for approval before any use or publication.",
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
    agencies: {
      kicker: "For agencies",
      title: ["Designed for", "prestige agencies."],
      paragraphs: [
        "Estalia supports agencies who want to offer their owners a visual presentation worthy of their listings.",
        "A film can be commissioned for a single property or built into an ongoing collaboration to support your new listings.",
        "A filmed property holds attention far longer than a plain photo gallery: it reaches more qualified buyers, and helps defend a price that matches the property — rather than negotiate it down.",
      ],
      tiers: [
        {
          title: "Single project",
          text: "For an exceptional listing.",
        },
        {
          title: "Collaboration",
          text: "For several properties a month.",
        },
        {
          title: "Bespoke",
          text: "For agencies with a significant volume of premium properties.",
        },
      ],
      cta: "Talk about your listings",
    },
    trust: {
      items: [
        {
          title: "Fidelity to the property",
          text: "Our aim is to showcase the property, not to alter its essential character.",
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
          text: "Every property receives its own dedicated creative direction.",
        },
      ],
      cta: "Contact us in complete confidentiality",
    },
    about: {
      kicker: "About",
      title: "ESTALIA STUDIO",
      paragraphs: [
        "Estalia Studio is a creative studio specialised in the cinematic staging of exceptional properties.",
        "We bring together creative direction, visual production technology and a deep knowledge of luxury real estate to create content that reveals the true identity of each place.",
      ],
      founder: {
        title: "Founder — Estalia Studio",
        text: "Your direct contact for projects and agency collaborations.",
      },
    },
    contact: {
      kicker: "Contact",
      title: ["Have an exceptional", "listing?"],
      subtitle:
        "A first 15-minute conversation is enough to assess the right creative direction for your property.",
      stepLabel: "Step {n} of {total}",
      back: "Back",
      fork: {
        prompt: "To begin, tell us who you are.",
        capacity:
          "To preserve the quality of every film, we deliberately limit how many productions we run in parallel.",
        responseTime:
          "A personal reply within 48 working hours — you deal directly with the founder, never a call centre.",
        agency: {
          label: "Real estate agency",
          title: "I represent an agency",
          text: "You want to offer your principals a filmed presentation worthy of their listings.",
          cta: "I'm an agency",
        },
        owner: {
          label: "Property owner",
          title: "I'm a property owner",
          text: "You want to showcase an exceptional property you own or represent.",
          cta: "I'm a property owner",
        },
      },
      agencyFlow: {
        step1Title: "What is your volume of premium listings?",
        options: [
          { value: "unite", label: "A single exceptional listing" },
          { value: "collaboration", label: "Several properties every month" },
          { value: "surmesure", label: "A significant volume of premium properties" },
        ],
        step2Title: "Tell us about your agency",
        agencyName: "Agency name",
        agencyLink: "Link to your agency or a listing",
        step3Title: "Your details",
        submit: "Submit your listings",
      },
      ownerFlow: {
        step1Title: "What kind of property would you like to showcase?",
        options: [
          { value: "chateau", label: "Château" },
          { value: "villa", label: "Villa" },
          { value: "appartement", label: "Prestige apartment" },
          { value: "domaine", label: "Estate" },
          { value: "autre", label: "Other exceptional property" },
        ],
        step2Title: "Tell us about your property",
        location: "Property location",
        listingUrl: "Listing link (if available)",
        step3Title: "Your details",
        submit: "Submit the property",
      },
      shared: {
        name: "Name",
        email: "Email",
        phone: "Phone (optional)",
        message: "Message (optional)",
        next: "Continue",
        privacyNote:
          "Your details stay strictly confidential: used only to review your request, and never shared.",
      },
      submitting: "Sending…",
      success: "Thank you. Your request has been sent.",
      successOwner: "Thank you. We're already thinking about your property — {type}.",
      successAgency: "Thank you. We'll be in touch about your collaboration — {tier}.",
      successNote: "We'll be in touch within 48 working hours.",
      booking: {
        title: "Prefer to talk directly?",
        cta: "Book a 15-minute call",
      },
      error: "Something went wrong. Please try again or email us directly.",
      errors: {
        required: "This field is required.",
        email: "Please enter a valid email address.",
        url: "Please enter a valid link.",
      },
    },
    footer: {
      nav: [
        { label: "Portfolio", href: "#films" },
        { label: "Approach", href: "#approche" },
        { label: "Agencies", href: "#agences" },
        { label: "About", href: "#about" },
        { label: "Contact", href: "#contact" },
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
