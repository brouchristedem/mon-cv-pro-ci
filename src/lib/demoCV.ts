import { CVData } from "./types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * CV de démonstration utilisé uniquement pour les aperçus visuels de la
 * landing page (galerie de modèles, mockup du hero). Jamais persisté, jamais
 * lié à un compte utilisateur.
 */
export function demoCV(templateId: string, couleurPrimaire = "#2563eb"): CVData {
  return {
    id: uid(),
    langue: "fr",
    templateId,
    couleurPrimaire,
    couleurFond: "#ffffff",
    tailleTexte: 13,
    dateFormat: "texte",
    iconStyle: "contour",
    ordreNom: "prenom-nom",
    modeCompact: true,
    step: 0,
    updatedAt: Date.now(),
    personalInfo: {
      photoShape: "cercle",
      showPhoto: true,
      prenom: "Edem-Alex",
      nom: "Edem",
      titre: "Responsable Marketing Digital",
      email: "edemalex.edem@email.com",
      telephone: "+225 07 12 34 56 78",
      adresse: "Abidjan, Côte d'Ivoire",
      linkedin: "linkedin.com/in/edemalexedem",
      siteWeb: "",
      autresInfos: [],
    },
    sections: [
      {
        id: uid(),
        type: "profil",
        titre: "Profil",
        visible: true,
        ordre: 0,
        items: [
          {
            id: uid(),
            titre: "",
            description:
              "Spécialiste marketing digital avec 6 ans d'expérience dans le développement de stratégies de croissance pour des marques en Afrique de l'Ouest. Passionné par la data et l'innovation.",
          },
        ],
      },
      {
        id: uid(),
        type: "experience",
        titre: "Expérience professionnelle",
        visible: true,
        ordre: 1,
        items: [
          {
            id: uid(),
            titre: "Responsable Marketing Digital",
            sousTitre: "Ivoire Digital Group",
            lieu: "Abidjan",
            dateDebut: "2022",
            dateFin: "",
            enCours: true,
            description:
              "Pilotage de la stratégie digitale multi-canal, gestion d'une équipe de 4 personnes et croissance de 45% du chiffre d'affaires en ligne.",
          },
          {
            id: uid(),
            titre: "Chargé de communication",
            sousTitre: "Atlantic Business Corp",
            lieu: "Abidjan",
            dateDebut: "2019",
            dateFin: "2022",
            description:
              "Conception et déploiement de campagnes publicitaires digitales pour des clients grands comptes en Côte d'Ivoire et au Sénégal.",
          },
        ],
      },
      {
        id: uid(),
        type: "formation",
        titre: "Formation",
        visible: true,
        ordre: 2,
        items: [
          {
            id: uid(),
            titre: "Master en Marketing & Communication",
            sousTitre: "Université Félix Houphouët-Boigny",
            lieu: "Abidjan",
            dateDebut: "2017",
            dateFin: "2019",
          },
        ],
      },
      {
        id: uid(),
        type: "competences",
        titre: "Compétences",
        visible: true,
        ordre: 3,
        affichage: "ligne",
        items: [
          { id: uid(), titre: "SEO / SEA" },
          { id: uid(), titre: "Réseaux sociaux" },
          { id: uid(), titre: "Google Analytics" },
          { id: uid(), titre: "Gestion de projet" },
        ],
      },
      {
        id: uid(),
        type: "langues",
        titre: "Langues",
        visible: true,
        ordre: 4,
        affichage: "ligne",
        items: [
          { id: uid(), titre: "Français", niveau: "Langue maternelle" },
          { id: uid(), titre: "Anglais", niveau: "Courant" },
        ],
      },
    ],
  };
}
