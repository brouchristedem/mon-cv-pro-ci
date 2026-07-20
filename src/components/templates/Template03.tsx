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

export default function Template03({ cv }: { cv: CVData }) {
  const { personalInfo: p, couleurPrimaire: color } = cv;

  return (
    <div className="w-full h-full text-slate-700 p-12 font-sans text-[13px] leading-relaxed" style={{ background: cv.couleurFond }}>
      <div className="text-center mb-8">
        {p.showPhoto && p.photoUrl && (
          <img
            src={p.photoUrl}
            alt=""
            className={`w-20 h-20 object-cover mx-auto mb-4 ${photoClass(p.photoShape)}`}
          />
        )}
        <h1 className="text-3xl font-light tracking-wide">
          {p.prenom || "Prénom"} <span className="font-bold">{p.nom || "Nom"}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 uppercase tracking-widest" style={{ color }}>
          {p.titre || (cv.langue === "en" ? "Job Title" : "Titre du poste")}
        </p>
        <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-3 text-[11px] text-slate-400">
          {p.email && <span><ContactIcon type="email" cv={cv} />{p.email}</span>}
          {p.telephone && <span><ContactIcon type="telephone" cv={cv} />{p.telephone}</span>}
          {p.adresse && <span><ContactIcon type="adresse" cv={cv} />{p.adresse}</span>}
          {p.permis && <span><ContactIcon type="permis" cv={cv} />{cv.langue === "en" ? "Driving licence" : "Permis"} {p.permis}</span>}
            {p.linkedin && <span><ContactIcon type="linkedin" cv={cv} />{p.linkedin}</span>}
            {p.siteWeb && <span><ContactIcon type="siteWeb" cv={cv} />{p.siteWeb}</span>}
        </div>
      </div>

      <div className="space-y-6">
        {sortedVisible(cv).map((section) => (
          <div key={section.id}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color }}>
                {section.titre}
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="space-y-3">
              {section.items.length === 0 && (
                <p className="text-slate-300 italic text-[12px]">{cv.langue === "en" ? "No information added" : "Aucune information ajoutée"}</p>
              )}
              {section.items.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium">{item.titre}</span>
                    {(item.dateDebut || item.dateFin) && (
                      <span className="text-[10px] text-slate-400">
                        {formatDate(item.dateDebut, cv.dateFormat, cv.langue)} — {item.enCours ? (cv.langue === "en" ? "Present" : "Aujourd'hui") : item.dateFin}
                      </span>
                    )}
                  </div>
                  {item.sousTitre && (
                    <p className="text-[12px] text-slate-500 italic">
                      {item.sousTitre}
                      {item.lieu ? `, ${item.lieu}` : ""}
                    </p>
                  )}
                  {item.niveau && <p className="text-[12px] text-slate-400">{item.niveau}</p>}
                  {item.description && (
                    <p className="text-[12px] text-slate-500 mt-1 whitespace-pre-line">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
