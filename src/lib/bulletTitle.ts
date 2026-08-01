// Ajoute une puce "●" devant le titre des éléments de Langues, Compétences
// et Centres d'intérêt, pour un rendu plus visuel sur le CV.
const BULLET_TYPES = new Set(["langues", "competences", "interets"]);

export function bulletTitle(sectionType: string, titre: string): string {
  return BULLET_TYPES.has(sectionType) ? `● ${titre}` : titre;
}
