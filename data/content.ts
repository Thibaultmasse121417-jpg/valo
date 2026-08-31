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
  manifesto: { kicker: string; title: string[]; paragraphs: string[] };
  films: {
    kicker: string;
    title: string;
    subtitle: string;
    watch: string;
    play: string;
    comingSoon: string;
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
  trust: { items: { title: string; text: string }[] };
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
    form: {
      name: string;
      agency: string;
      email: string;
      phone: string;
      listingUrl: string;
      message: string;
      collaboration: string;
      submit: string;
      submitting: string;
      success: string;
      error: string;
      errors: { required: string; email: string; url: string };
    };
  };
  footer: { nav: NavLink[]; legal: NavLink[]; rights: string };
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
    },
    films: {
      kicker: "Selected Films",
      title: "SELECTED FILMS",
      subtitle: "Quelques propriétés. Des directions artistiques entièrement différentes.",
      watch: "Voir le film",
      play: "Lecture",
      comingSoon: "Film à venir",
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
      subtitle: "Transmettez-nous simplement l'annonce ou quelques informations sur la propriété.",
      form: {
        name: "Nom",
        agency: "Agence",
        email: "Email",
        phone: "Téléphone (facultatif)",
        listingUrl: "Lien de l'annonce",
        message: "Message",
        collaboration: "Je souhaite discuter d'une collaboration régulière.",
        submit: "Confier la propriété",
        submitting: "Envoi en cours…",
        success: "Merci. Votre demande a bien été transmise — nous revenons vers vous rapidement.",
        error: "Une erreur est survenue. Merci de réessayer ou de nous écrire directement.",
        errors: {
          required: "Ce champ est requis.",
          email: "Merci de renseigner un email valide.",
          url: "Merci de renseigner un lien valide.",
        },
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
    },
    films: {
      kicker: "Selected Films",
      title: "SELECTED FILMS",
      subtitle: "A handful of properties. Entirely different creative directions.",
      watch: "Watch the film",
      play: "Play",
      comingSoon: "Film coming soon",
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
      subtitle: "Simply send us the listing or a few details about the property.",
      form: {
        name: "Name",
        agency: "Agency",
        email: "Email",
        phone: "Phone (optional)",
        listingUrl: "Listing link",
        message: "Message",
        collaboration: "I'd like to discuss an ongoing collaboration.",
        submit: "Submit the property",
        submitting: "Sending…",
        success: "Thank you. Your request has been sent — we'll be in touch shortly.",
        error: "Something went wrong. Please try again or email us directly.",
        errors: {
          required: "This field is required.",
          email: "Please enter a valid email address.",
          url: "Please enter a valid link.",
        },
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
    langToggle: "FR",
  },
};

export type Content = ContentShape;
