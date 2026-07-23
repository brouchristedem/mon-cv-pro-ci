import { CVData } from "./types";

export function displayName(cv: CVData, prenomPlaceholder: string, nomPlaceholder: string) {
  const prenom = cv.personalInfo.prenom || prenomPlaceholder;
  const nom = cv.personalInfo.nom || nomPlaceholder;
  return cv.ordreNom === "nom-prenom" ? `${nom} ${prenom}` : `${prenom} ${nom}`;
}
