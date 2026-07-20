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

export default function Template02({ cv }: { cv: CVData }) {
  const { personalInfo: p, couleurPrimaire: color } = cv;
  const sections = sortedVisible(cv);
  const sidebar = sections.filter((s) => SIDEBAR_TYPES.has(s.type));
  const main = sections.filter((s) => !SIDEBAR_TYPES.has(s.type));

  return (
    <div className="w-full h-full text-slate-800 font-sans text-[13px] leading-relaxed flex" style={{ background: cv.couleurFond }}>
      <aside className="w-[34%] p-6 text-white flex-shrink-0" style={{ background: color }}>
        {p.showPhoto && p.photoUrl && (
          <img
            src={p.photoUrl}
            alt=""
            className={`w-20 h-20 object-cover mb-4 ${photoClass(p.photoShape)}`}
          />
        )}
        <h1 className="text-lg font-bold leading-tight">
          {p.prenom || "Prénom"} {p.nom || "Nom"}
        </h1>
        <p className="text-[12px] opacity-90 mt-1">{p.titre || (cv.langue === "en" ? "Job Title" : "Titre du poste")}</p>

        <div className="mt-5 space-y-1 text-[11px] opacity-90 break-words">
          {p.email && <p><ContactIcon type="email" cv={cv} />{p.email}</p>}
          {p.telephone && <p><ContactIcon type="telephone" cv={cv} />{p.telephone}</p>}
          {p.adresse && <p><ContactIcon type="adresse" cv={cv} />{p.adresse}</p>}
          {p.permis && <p><ContactIcon type="permis" cv={cv} />{cv.langue === "en" ? "Driving licence" : "Permis"} {p.permis}</p>}
          {p.linkedin && <p><ContactIcon type="linkedin" cv={cv} />{p.linkedin}</p>}
          {p.siteWeb && <p><ContactIcon type="siteWeb" cv={cv} />{p.siteWeb}</p>}
        </div>

        {sidebar.map((section) => (
          <div key={section.id} className="mt-6">
            <h2 className="text-[11px] font-bold uppercase tracking-wide border-b border-white/30 pb-1 mb-2">
              {section.titre}
            </h2>
            {section.items.length === 0 && (
              <p className="text-[11px] opacity-60 italic">—</p>
            )}
            {section.items.map((item) => (
              <div key={item.id} className="mb-1.5">
                <p className="text-[12px] font-medium">{item.titre}</p>
                {item.niveau && <p className="text-[10px] opacity-80">{item.niveau}</p>}
              </div>
            ))}
          </div>
        ))}
      </aside>

      <main className="flex-1 p-6 space-y-5">
        {main.map((section) => (
          <div key={section.id}>
            <h2 className="text-[13px] font-bold uppercase tracking-wide mb-2" style={{ color }}>
              {section.titre}
            </h2>
            <div className="space-y-2">
              {section.items.length === 0 && (
                <p className="text-slate-400 italic text-[12px]">{cv.langue === "en" ? "No information added" : "Aucune information ajoutée"}</p>
              )}
              {section.items.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">{item.titre}</span>
                    {(item.dateDebut || item.dateFin) && (
                      <span className="text-[11px] text-slate-500">
                        {formatDate(item.dateDebut, cv.dateFormat, cv.langue)} — {item.enCours ? (cv.langue === "en" ? "Present" : "Aujourd'hui") : item.dateFin}
                      </span>
                    )}
                  </div>
                  {item.sousTitre && (
                    <p className="text-[12px] text-slate-600">
                      {item.sousTitre}
                      {item.lieu ? ` · ${item.lieu}` : ""}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-[12px] text-slate-600 mt-0.5 whitespace-pre-line">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
