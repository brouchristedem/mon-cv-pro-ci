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

export default function Template06({ cv }: { cv: CVData }) {
  const { personalInfo: p, couleurPrimaire: color } = cv;
  const sections = sortedVisible(cv);
  const sidebar = sections.filter((s) => SIDEBAR_TYPES.has(s.type));
  const main = sections.filter((s) => !SIDEBAR_TYPES.has(s.type));

  return (
    <div className="w-full h-full text-slate-800 font-sans text-[13px] leading-relaxed" style={{ background: cv.couleurFond }}>
      <div className="flex items-center gap-2 px-6 pt-5">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-[10px] font-mono text-slate-400">profil.json</span>
      </div>

      <div className="flex items-center gap-4 mx-6 mt-3 mb-6 pb-4 border-b-2" style={{ borderColor: color }}>
        {p.showPhoto && p.photoUrl && (
          <img
            src={p.photoUrl}
            alt=""
            className={`w-16 h-16 object-cover flex-shrink-0 ${photoClass(p.photoShape)}`}
          />
        )}
        <div>
          <h1 className="text-xl font-bold font-mono" style={{ color }}>
            {p.prenom || "Prénom"} {p.nom || "Nom"}
          </h1>
          <p className="text-[12px] text-slate-500 font-mono">
            {"<"}{p.titre || (cv.langue === "en" ? "Job Title" : "Titre du poste")}{" />"}
          </p>
        </div>
      </div>

      <div className="flex px-6 pb-6 gap-6">
        <main className="flex-[1.7] space-y-5">
          {main.map((section) => (
            <div key={section.id}>
              <h2 className="text-[12px] font-bold uppercase tracking-wide mb-2 font-mono flex items-center gap-1.5" style={{ color }}>
                <span className="text-slate-300">#</span> {section.titre}
              </h2>
              {section.items.length === 0 && (
                <p className="text-slate-300 italic text-[12px]">{cv.langue === "en" ? "No information added" : "Aucune information ajoutée"}</p>
              )}
              {section.items.map((item) => (
                <div key={item.id} className="mb-2 pl-3 border-l-2 border-slate-100">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">{item.titre}</span>
                    {(item.dateDebut || item.dateFin) && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(item.dateDebut, cv.dateFormat, cv.langue)} - {item.enCours ? (cv.langue === "en" ? "present" : "présent") : formatDate(item.dateFin, cv.dateFormat, cv.langue)}
                      </span>
                    )}
                  </div>
                  {item.sousTitre && <p className="text-[12px] text-slate-500">{item.sousTitre}</p>}
                  {item.description && (
                    <p className="text-[12px] text-slate-500 mt-0.5 whitespace-pre-line">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </main>

        <aside className="flex-1 rounded-lg p-4" style={{ background: `${color}0d` }}>
          <div className="text-[11px] space-y-1.5 mb-5 text-slate-600">
            {p.email && <p><ContactIcon type="email" cv={cv} />{p.email}</p>}
            {p.telephone && <p><ContactIcon type="telephone" cv={cv} />{p.telephone}</p>}
            {p.adresse && <p><ContactIcon type="adresse" cv={cv} />{p.adresse}</p>}
            {p.permis && <p><ContactIcon type="permis" cv={cv} />{cv.langue === "en" ? "Driving licence" : "Permis"} {p.permis}</p>}
            {p.linkedin && <p><ContactIcon type="linkedin" cv={cv} />{p.linkedin}</p>}
            {p.siteWeb && <p><ContactIcon type="siteWeb" cv={cv} />{p.siteWeb}</p>}
          </div>
          {sidebar.map((section) => (
            <div key={section.id} className="mb-5">
              <h2 className="text-[11px] font-bold uppercase tracking-wide mb-2 font-mono" style={{ color }}>
                {section.titre}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {section.items.length === 0 && <p className="text-[11px] text-slate-300 italic">—</p>}
                {section.items.map((item) => (
                  <span
                    key={item.id}
                    className="text-[10px] px-2 py-1 rounded font-mono bg-white border"
                    style={{ borderColor: `${color}40`, color }}
                    title={item.niveau}
                  >
                    {item.titre}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
