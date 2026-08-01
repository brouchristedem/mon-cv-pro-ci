// Clé sessionStorage utilisée pour s'assurer que la personne passe toujours
// par la page d'accueil (ou la page de connexion, dans le parcours
// "télécharger") avant d'atteindre l'éditeur, plutôt que d'y arriver
// directement via un lien externe ou une URL tapée à la main.
export const ENTRY_GATE_KEY = "mcvpci_entered_via_home";
