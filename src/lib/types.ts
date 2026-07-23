export type SectionType =
  | "profil"
  | "experience"
  | "formation"
  | "competences"
  | "langues"
  | "certifications"
  | "projets"
  | "interets"
  | "references"
  | "custom";

export interface InfoComplementaire {
  id: string;
  label: string;
  valeur: string;
}

export interface PersonalInfo {
  photoUrl?: string;
  photoShape: "cercle" | "carre" | "arrondi" | "aucune";
  showPhoto: boolean;
  prenom: string;
  nom: string;
  titre: string; // ex: Ingénieur logiciel
  email: string;
  telephone: string; // ex: +225 XXXXXXXX
  adresse: string;
  permis?: string;
  linkedin?: string;
  siteWeb?: string;
  autresInfos: InfoComplementaire[];
}

export interface EntryItem {
  id: string;
  titre: string;
  sousTitre?: string;
  lieu?: string;
  dateDebut?: string;
  dateFin?: string;
  enCours?: boolean;
  description?: string;
  niveau?: string; // pour langues/compétences, en texte, jamais de jauge
}

export interface Section {
  id: string;
  type: SectionType;
  titre: string;
  visible: boolean;
  ordre: number;
  items: EntryItem[];
  affichage?: "liste" | "ligne"; // pour langues, compétences, centres d'intérêt
}

export interface CVData {
  id: string;
  langue: "fr" | "en";
  templateId: string;
  couleurPrimaire: string;
  couleurFond: string;
  tailleTexte: number; // en pt, ex: 10 à 24, comme Word/Excel
  dateFormat: "texte" | "numerique"; // "Jan 2024" ou "01/2024"
  iconStyle: "aucune" | "contour" | "remplie";
  ordreNom: "prenom-nom" | "nom-prenom";
  personalInfo: PersonalInfo;
  sections: Section[];
  updatedAt: number;
  step: number; // pour reprendre la progression
}

export const SECTION_LABELS_FR: Record<SectionType, string> = {
  profil: "Profil",
  experience: "Expérience professionnelle",
  formation: "Formation",
  competences: "Compétences",
  langues: "Langues",
  certifications: "Certifications",
  projets: "Projet académique",
  interets: "Centres d'intérêt",
  references: "Références",
  custom: "Rubrique personnalisée",
};

export const SECTION_LABELS_EN: Record<SectionType, string> = {
  profil: "Profile",
  experience: "Work Experience",
  formation: "Education",
  competences: "Skills",
  langues: "Languages",
  certifications: "Certifications",
  projets: "Academic Project",
  interets: "Interests",
  references: "References",
  custom: "Custom Section",
};
