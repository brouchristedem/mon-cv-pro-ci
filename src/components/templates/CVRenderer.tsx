import { CVData } from "@/lib/types";
import Template01 from "./Template01";
import Template02 from "./Template02";

// À mesure que chaque nouveau template est conçu, on l'ajoute ici.
// Les templates non encore créés retombent temporairement sur Template01
// (en attendant leur design dédié) pour que rien ne casse.
const REGISTRY: Record<string, React.ComponentType<{ cv: CVData }>> = {
  "template-01": Template01,
  "template-02": Template02,
};

export default function CVRenderer({ cv }: { cv: CVData }) {
  const Comp = REGISTRY[cv.templateId] || Template01;
  return <Comp cv={cv} />;
}
