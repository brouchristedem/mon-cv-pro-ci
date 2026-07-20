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

export default function Template14({ cv }: { cv: CVData }) {
  const { personalInfo: p, couleurPrimaire: color } = cv;
  const sections = sortedVisible(cv);
  const sidebar = sections.filter((s) => SIDEBAR_TYPES.has(s.type));
  const main = sections.filter((s) => !SIDEBAR_TYPES.has(s.type));

  return (
    <div className="w-full h-full text-slate-800 font-sans text-[12.5px] leading-relaxed p-7 border-[10px]" style={{ borderColor: `${color}12`, background: cv.couleurFond }}>
      <div className="flex items-center gap-4 mb-6">
        {p.showPhoto && p.photoUrl && (
          <img
            src={p.photoUrl}
            alt=""
            className={`w-16 h-16 object-cover border ${photoClass(p.photoShape)}`}
            style={{ borderColor: color }}
          />
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold" style={{ color }}>
            {p.prenom || "Prénom"} {p.nom || "Nom"}
          </h1>
          <p className="text-[12px] text-slate-500">{p.titre || (cv.langue === "en" ? "Job Title" : "Titre du poste")}</p>
        </div>
        <div className="text-right text-[10.5px] text-slate-500">
          {p.email && <p><ContactIcon type="email" cv={cv} />{p.email}</p>}
          {p.telephone && <p><ContactIcon type="telephone" cv={cv} />{p.telephone}</p>}
        </div>
      </div>
      {(p.adresse || p.permis) && (
        <p className="text-[10.5px] text-slate-400 mb-5">
          {p.adresse} {p.permis ? `· ${cv.langue === "en" ? "Driving licence" : "Permis"} ${p.permis}` : ""}
        </p>
      )}

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          {main.map((section) => (
            <div key={section.id} className="border border-slate-200 rounded-lg p-3">
              <h2 className="text-[11px] font-bold uppercase mb-2" style={{ color }}>
                {section.titre}
              </h2>
              {section.items.length === 0 && (
                <p className="text-slate-300 italic text-[11.5px]">{cv.langue === "en" ? "No information added" : "Aucune information ajoutée"}</p>
              )}
              {section.items.map((item) => (
                <div key={item.id} className="mb-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">{item.titre}</span>
                    {(item.dateDebut || item.dateFin) && (
                      <span className="text-[10px] text-slate-400">
                        {formatDate(item.dateDebut, cv.dateFormat, cv.langue)} — {item.enCours ? (cv.langue === "en" ? "Present" : "Aujourd'hui") : item.dateFin}
                      </span>
                    )}
                  </div>
                  {item.sousTitre && <p className="text-[11.5px] text-slate-500">{item.sousTitre}</p>}
                  {item.description && (
                    <p className="text-[11.5px] text-slate-500 mt-0.5 whitespace-pre-line">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {sidebar.map((section) => (
            <div key={section.id} className="border border-slate-200 rounded-lg p-3">
              <h2 className="text-[11px] font-bold uppercase mb-2" style={{ color }}>
                {section.titre}
              </h2>
              {section.items.map((item) => (
                <div key={item.id} className="mb-1">
                  <p className="text-[11px] font-medium">{item.titre}</p>
                  {item.niveau && <p className="text-[10px] text-slate-400">{item.niveau}</p>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
