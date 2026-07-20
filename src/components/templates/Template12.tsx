import { CVData } from "@/lib/types";
import { ContactIcon } from "./ContactIcon";
import { formatDate } from "@/lib/formatDate";

function photoClass(shape: string) {
  if (shape === "cercle") return "rounded-full";
  if (shape === "arrondi") return "rounded-xl";
  if (shape === "carre") return "rounded-none";
  return "";
}

function sortedVisible(cv: CVData) {
  return [...cv.sections].filter((s) => s.visible).sort((a, b) => a.ordre - b.ordre);
}

const SIDEBAR_TYPES = new Set(["langues", "competences", "certifications", "interets", "references"]);

export default function Template12({ cv }: { cv: CVData }) {
  const { personalInfo: p, couleurPrimaire: color } = cv;
  const sections = sortedVisible(cv);
  const sidebar = sections.filter((s) => SIDEBAR_TYPES.has(s.type));
  const main = sections.filter((s) => !SIDEBAR_TYPES.has(s.type));

  return (
    <div className="w-full h-full bg-white text-slate-800 font-sans text-[12.5px] leading-relaxed p-8">
      <div className="flex justify-between items-start border-b-2 pb-4 mb-6" style={{ borderColor: color }}>
        <div className="flex items-center gap-4">
          {p.showPhoto && p.photoUrl && (
            <img
              src={p.photoUrl}
              alt=""
              className={`w-16 h-16 object-cover ${photoClass(p.photoShape)}`}
            />
          )}
          <div>
            <h1 className="text-xl font-bold uppercase">
              {p.nom || "NOM"}, {p.prenom || "Prénom"}
            </h1>
            <p className="text-[12px] text-slate-500">{p.titre || (cv.langue === "en" ? "Job Title" : "Titre du poste")}</p>
          </div>
        </div>
        <div className="text-right text-[10.5px] text-slate-500">
          {p.email && <p><ContactIcon type="email" cv={cv} />{p.email}</p>}
          {p.telephone && <p><ContactIcon type="telephone" cv={cv} />{p.telephone}</p>}
          {p.adresse && <p><ContactIcon type="adresse" cv={cv} />{p.adresse}</p>}
          {p.permis && <p>{cv.langue === "en" ? "Driving licence" : "Permis"}: {p.permis}</p>}
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-[1.7] space-y-4">
          {main.map((section) => (
            <div key={section.id}>
              <h2
                className="text-[11px] font-bold uppercase tracking-widest mb-2 pb-1 border-b border-slate-200"
              >
                {section.titre}
              </h2>
              {section.items.length === 0 && (
                <p className="text-slate-300 italic text-[11.5px]">{cv.langue === "en" ? "No information added" : "Aucune information ajoutée"}</p>
              )}
              {section.items.map((item) => (
                <div key={item.id} className="mb-2 grid grid-cols-[1fr_auto] gap-2">
                  <div>
                    <p className="font-semibold">{item.titre}</p>
                    {item.sousTitre && <p className="text-[11.5px] text-slate-500">{item.sousTitre}</p>}
                    {item.description && (
                      <p className="text-[11.5px] text-slate-500 mt-0.5 whitespace-pre-line">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {(item.dateDebut || item.dateFin) && (
                    <span className="text-[10.5px] text-slate-400 whitespace-nowrap">
                      {formatDate(item.dateDebut, cv.dateFormat, cv.langue)} - {item.enCours ? "Present" : item.dateFin}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex-1 space-y-4">
          {sidebar.map((section) => (
            <div key={section.id}>
              <h2
                className="text-[11px] font-bold uppercase tracking-widest mb-2 pb-1 border-b border-slate-200"
                style={{ color }}
              >
                {section.titre}
              </h2>
              {section.items.map((item) => (
                <div key={item.id} className="mb-1">
                  <p className="font-medium text-[11.5px]">{item.titre}</p>
                  {item.niveau && <p className="text-[10.5px] text-slate-400">{item.niveau}</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
