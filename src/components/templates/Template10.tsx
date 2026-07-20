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

const SIDEBAR_TYPES = new Set(["langues", "competences", "certifications", "interets"]);

export default function Template10({ cv }: { cv: CVData }) {
  const { personalInfo: p, couleurPrimaire: color } = cv;
  const sections = sortedVisible(cv);
  const sidebar = sections.filter((s) => SIDEBAR_TYPES.has(s.type));
  const main = sections.filter((s) => !SIDEBAR_TYPES.has(s.type));

  return (
    <div className="w-full h-full bg-white text-slate-800 font-sans text-[13px] leading-relaxed flex">
      <aside className="w-[32%] p-6 bg-slate-50 border-r border-slate-200 flex-shrink-0 flex flex-col items-center text-center">
        {p.showPhoto && p.photoUrl ? (
          <img
            src={p.photoUrl}
            alt=""
            className={`w-28 h-28 object-cover mb-4 ${photoClass(p.photoShape)}`}
            style={{ boxShadow: `0 0 0 3px ${color}` }}
          />
        ) : (
          <div className="w-28 h-28 mb-4" />
        )}
        <h1 className="text-base font-bold">
          {p.prenom || "Prénom"} {p.nom || "Nom"}
        </h1>
        <p className="text-[11px] mt-1 font-semibold" style={{ color }}>
          {p.titre || (cv.langue === "en" ? "Job Title" : "Titre du poste")}
        </p>

        <div className="mt-5 text-[10.5px] text-slate-500 space-y-1 break-words">
          {p.email && <p><ContactIcon type="email" cv={cv} />{p.email}</p>}
          {p.telephone && <p><ContactIcon type="telephone" cv={cv} />{p.telephone}</p>}
          {p.adresse && <p><ContactIcon type="adresse" cv={cv} />{p.adresse}</p>}
          {p.permis && <p><ContactIcon type="permis" cv={cv} />{cv.langue === "en" ? "Driving licence" : "Permis"} {p.permis}</p>}
          {p.linkedin && <p><ContactIcon type="linkedin" cv={cv} />{p.linkedin}</p>}
          {p.siteWeb && <p><ContactIcon type="siteWeb" cv={cv} />{p.siteWeb}</p>}
        </div>

        {sidebar.map((section) => (
          <div key={section.id} className="mt-6 w-full text-left">
            <h2
              className="text-[10px] font-bold uppercase tracking-wide mb-2 text-center pb-1 border-b"
              style={{ color, borderColor: `${color}40` }}
            >
              {section.titre}
            </h2>
            {section.items.map((item) => (
              <div key={item.id} className="mb-1.5">
                <p className="text-[11px] text-center">{item.titre}</p>
                {item.niveau && <p className="text-[9.5px] text-slate-400 text-center">{item.niveau}</p>}
              </div>
            ))}
          </div>
        ))}
      </aside>

      <main className="flex-1 p-7 space-y-5">
        {main.map((section) => (
          <div key={section.id} className="relative pl-4 border-l-2" style={{ borderColor: `${color}40` }}>
            <h2 className="text-[13px] font-bold uppercase tracking-wide mb-2" style={{ color }}>
              {section.titre}
            </h2>
            {section.items.length === 0 && (
              <p className="text-slate-400 italic text-[12px]">{cv.langue === "en" ? "No information added" : "Aucune information ajoutée"}</p>
            )}
            {section.items.map((item) => (
              <div key={item.id} className="mb-3 relative">
                <span
                  className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full"
                  style={{ background: color }}
                />
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">{item.titre}</span>
                  {(item.dateDebut || item.dateFin) && (
                    <span className="text-[11px] text-slate-500">
                      {formatDate(item.dateDebut, cv.dateFormat, cv.langue)} — {item.enCours ? (cv.langue === "en" ? "Present" : "Aujourd'hui") : formatDate(item.dateFin, cv.dateFormat, cv.langue)}
                    </span>
                  )}
                </div>
                {item.sousTitre && <p className="text-[12px] text-slate-600">{item.sousTitre}</p>}
                {item.description && (
                  <p className="text-[12px] text-slate-600 mt-0.5 whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
