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
}

export interface CVData {
  id: string;
  langue: "fr" | "en";
  templateId: string;
  couleurPrimaire: string;
  disposition: "une-page" | "plusieurs-pages";
  taillePolice: "normale" | "grande";
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
