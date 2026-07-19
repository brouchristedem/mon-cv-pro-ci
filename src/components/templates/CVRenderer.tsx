import { CVData } from "@/lib/types";
import Template01 from "./Template01";
import Template02 from "./Template02";
import Template03 from "./Template03";
import Template04 from "./Template04";
import Template05 from "./Template05";
import Template06 from "./Template06";
import Template07 from "./Template07";
import Template08 from "./Template08";
import Template09 from "./Template09";
import Template10 from "./Template10";
import Template11 from "./Template11";
import Template12 from "./Template12";
import Template13 from "./Template13";
import Template14 from "./Template14";
import Template15 from "./Template15";

const REGISTRY: Record<string, React.ComponentType<{ cv: CVData }>> = {
  "template-01": Template01,
  "template-02": Template02,
  "template-03": Template03,
  "template-04": Template04,
  "template-05": Template05,
  "template-06": Template06,
  "template-07": Template07,
  "template-08": Template08,
  "template-09": Template09,
  "template-10": Template10,
  "template-11": Template11,
  "template-12": Template12,
  "template-13": Template13,
  "template-14": Template14,
  "template-15": Template15,
};

export default function CVRenderer({ cv }: { cv: CVData }) {
  const Comp = REGISTRY[cv.templateId] || Template01;
  return <Comp cv={cv} />;
}
