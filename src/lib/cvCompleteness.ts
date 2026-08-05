import { CVData } from "./types";

export interface CompletenessResult {
  percent: number;
  tipKeys: string[]; // clés i18n, dans l'ordre de priorité
}

// Calcule un score de complétude (0-100) basé sur des critères simples et
// objectifs, avec les conseils correspondants pour les points manquants.
// Volontairement peu coûteux (pas d'appel réseau) : recalculé à chaque frappe.
export function computeCompleteness(cv: CVData): CompletenessResult {
  const checks: { done: boolean; weight: number; tipKey: string }[] = [];

  const p = cv.personalInfo;
  const identityDone = Boolean(p.prenom.trim() && p.nom.trim() && p.titre.trim());
  checks.push({ done: identityDone, weight: 15, tipKey: "" });

  const contactDone = Boolean(p.email.trim() && p.telephone.trim());
  checks.push({ done: contactDone, weight: 15, tipKey: "completenessTip2" });

  const hasPhoto = Boolean(p.showPhoto && p.photoUrl);
  checks.push({ done: hasPhoto, weight: 5, tipKey: "completenessTip1" });

  const profil = cv.sections.find((s) => s.type === "profil");
  const profilDone = Boolean(
    profil && profil.items.some((it) => (it.description || "").trim().length > 20)
  );
  checks.push({ done: profilDone, weight: 15, tipKey: "completenessTip3" });

  const experience = cv.sections.find((s) => s.type === "experience");
  const experienceDone = Boolean(experience && experience.items.length > 0);
  checks.push({ done: experienceDone, weight: 20, tipKey: "completenessTip4" });

  const formation = cv.sections.find((s) => s.type === "formation");
  const formationDone = Boolean(formation && formation.items.length > 0);
  checks.push({ done: formationDone, weight: 10, tipKey: "completenessTip5" });

  const competences = cv.sections.find((s) => s.type === "competences");
  const competencesDone = Boolean(competences && competences.items.length >= 3);
  checks.push({ done: competencesDone, weight: 10, tipKey: "completenessTip6" });

  const templateDone = Boolean(cv.templateId);
  checks.push({ done: templateDone, weight: 10, tipKey: "completenessTip7" });

  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const doneWeight = checks.reduce((sum, c) => sum + (c.done ? c.weight : 0), 0);
  const percent = Math.round((doneWeight / totalWeight) * 100);

  const tipKeys = checks
    .filter((c) => !c.done && c.tipKey)
    .map((c) => c.tipKey);

  // L'identité (prénom/nom/titre) n'a volontairement pas de conseil dédié :
  // c'est le tout premier champ du parcours, jamais oublié en pratique.
  return { percent, tipKeys };
}
