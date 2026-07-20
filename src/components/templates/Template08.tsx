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

export default function Template08({ cv }: { cv: CVData }) {
  const { personalInfo: p, couleurPrimaire: color } = cv;
  const sections = sortedVisible(cv);
  const sidebar = sections.filter((s) => SIDEBAR_TYPES.has(s.type));
  const main = sections.filter((s) => !SIDEBAR_TYPES.has(s.type));

  return (
    <div className="w-full h-full text-slate-800 font-sans text-[11.5px] leading-snug p-6 flex gap-5" style={{ background: cv.couleurFond }}>
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          {p.showPhoto && p.photoUrl && (
            <img
              src={p.photoUrl}
              alt=""
              className={`w-14 h-14 object-cover flex-shrink-0 ${photoClass(p.photoShape)}`}
            />
          )}
          <div>
            <h1 className="text-lg font-bold" style={{ color }}>
              {p.prenom || "Prénom"} {p.nom || "Nom"}
            </h1>
            <p className="text-[11px] text-slate-500">{p.titre || (cv.langue === "en" ? "Job Title" : "Titre du poste")}</p>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 space-y-0.5">
          {p.email && <p><ContactIcon type="email" cv={cv} />{p.email}</p>}
          {p.telephone && <p><ContactIcon type="telephone" cv={cv} />{p.telephone}</p>}
          {p.adresse && <p><ContactIcon type="adresse" cv={cv} />{p.adresse}</p>}
          {p.permis && <p><ContactIcon type="permis" cv={cv} />{cv.langue === "en" ? "Driving licence" : "Permis"} {p.permis}</p>}
          {p.linkedin && <p><ContactIcon type="linkedin" cv={cv} />{p.linkedin}</p>}
          {p.siteWeb && <p><ContactIcon type="siteWeb" cv={cv} />{p.siteWeb}</p>}
        </div>
        {sidebar.map((section) => (
          <div key={section.id}>
            <h2
              className="text-[10px] font-bold uppercase tracking-wide mb-1.5 pb-1 border-b"
              style={{ color, borderColor: `${color}40` }}
            >
              {section.titre}
            </h2>
            {section.items.length === 0 && <p className="text-slate-300 italic text-[10px]">—</p>}
            {section.items.map((item) => (
              <div key={item.id} className="mb-1">
                <p className="font-medium">{item.titre}</p>
                {item.niveau && <p className="text-[9.5px] text-slate-400">{item.niveau}</p>}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex-[1.8] space-y-4 border-l border-slate-100 pl-5">
        {main.map((section) => (
          <div key={section.id}>
            <h2 className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color }}>
              {section.titre}
            </h2>
            {section.items.length === 0 && (
              <p className="text-slate-300 italic text-[10.5px]">{cv.langue === "en" ? "No information added" : "Aucune information ajoutée"}</p>
            )}
            {section.items.map((item) => (
              <div key={item.id} className="mb-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">{item.titre}</span>
                  {(item.dateDebut || item.dateFin) && (
                    <span className="text-[9.5px] text-slate-400">
                      {formatDate(item.dateDebut, cv.dateFormat, cv.langue)} — {item.enCours ? (cv.langue === "en" ? "Present" : "Aujourd'hui") : item.dateFin}
                    </span>
                  )}
                </div>
                {item.sousTitre && <p className="text-[10.5px] text-slate-500">{item.sousTitre}</p>}
                {item.description && (
                  <p className="text-[10.5px] text-slate-500 whitespace-pre-line">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
