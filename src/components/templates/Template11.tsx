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

export default function Template11({ cv }: { cv: CVData }) {
  const { personalInfo: p, couleurPrimaire: color } = cv;
  const sections = sortedVisible(cv);

  return (
    <div className="w-full h-full bg-white text-slate-800 p-10 font-sans text-[13px] leading-relaxed">
      <div className="grid grid-cols-[auto_1fr] gap-6 items-center mb-8">
        {p.showPhoto && p.photoUrl && (
          <img
            src={p.photoUrl}
            alt=""
            className={`w-20 h-20 object-cover ${photoClass(p.photoShape)}`}
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">
            {p.prenom || "Prénom"} {p.nom || "Nom"}
          </h1>
          <p className="text-sm" style={{ color }}>
            {p.titre || (cv.langue === "en" ? "Job Title" : "Titre du poste")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 text-[10.5px] text-slate-500 mb-8 pb-4 border-b border-slate-200">
        {p.email && <div><p className="text-[9px] uppercase text-slate-400">Email</p>{p.email}</div>}
        {p.telephone && <div><p className="text-[9px] uppercase text-slate-400">Téléphone</p>{p.telephone}</div>}
        {p.adresse && <div><p className="text-[9px] uppercase text-slate-400">Adresse</p>{p.adresse}</div>}
        {p.permis && <div><p className="text-[9px] uppercase text-slate-400">{cv.langue === "en" ? "Licence" : "Permis"}</p>{p.permis}</div>}
      </div>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={section.id} className="grid grid-cols-[32px_1fr] gap-3">
            <span className="text-lg font-bold" style={{ color: `${color}` }}>
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-[12px] font-bold uppercase tracking-wide mb-2">{section.titre}</h2>
              <div className="space-y-2">
                {section.items.length === 0 && (
                  <p className="text-slate-300 italic text-[12px]">{cv.langue === "en" ? "No information added" : "Aucune information ajoutée"}</p>
                )}
                {section.items.map((item) => (
                  <div key={item.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold">{item.titre}</span>
                      {(item.dateDebut || item.dateFin) && (
                        <span className="text-[11px] text-slate-400">
                          {formatDate(item.dateDebut, cv.dateFormat, cv.langue)} — {item.enCours ? (cv.langue === "en" ? "Present" : "Aujourd'hui") : item.dateFin}
                        </span>
                      )}
                    </div>
                    {item.sousTitre && <p className="text-[12px] text-slate-500">{item.sousTitre}</p>}
                    {item.niveau && <p className="text-[12px] text-slate-400">{item.niveau}</p>}
                    {item.description && (
                      <p className="text-[12px] text-slate-500 mt-0.5 whitespace-pre-line">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
