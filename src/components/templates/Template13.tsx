import { CVData } from "@/lib/types";

function photoClass(shape: string) {
  if (shape === "cercle") return "rounded-full";
  if (shape === "arrondi") return "rounded-xl";
  if (shape === "carre") return "rounded-none";
  return "";
}

function sortedVisible(cv: CVData) {
  return [...cv.sections].filter((s) => s.visible).sort((a, b) => a.ordre - b.ordre);
}

export default function Template13({ cv }: { cv: CVData }) {
  const { personalInfo: p, couleurPrimaire: color } = cv;

  return (
    <div className="w-full h-full bg-white text-slate-800 font-sans text-[13px] leading-relaxed">
      <div
        className="px-8 py-8 rounded-b-[2.5rem]"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      >
        <div className="flex items-center gap-5">
          {p.showPhoto && p.photoUrl && (
            <img
              src={p.photoUrl}
              alt=""
              className={`w-20 h-20 object-cover border-4 border-white/40 ${photoClass(p.photoShape)}`}
            />
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              {p.prenom || "Prénom"} {p.nom || "Nom"}
            </h1>
            <p className="text-white/85 text-sm">{p.titre || "Titre du poste"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 text-[11px] text-white/80">
          {p.email && <span>{p.email}</span>}
          {p.telephone && <span>{p.telephone}</span>}
          {p.adresse && <span>{p.adresse}</span>}
          {p.permis && <span>Permis {p.permis}</span>}
        </div>
      </div>

      <div className="px-8 py-6 space-y-4">
        {sortedVisible(cv).map((section) => (
          <div key={section.id} className="rounded-2xl p-4" style={{ background: `${color}0d` }}>
            <h2 className="text-[12.5px] font-bold uppercase mb-2" style={{ color }}>
              {section.titre}
            </h2>
            <div className="space-y-2">
              {section.items.length === 0 && (
                <p className="text-slate-300 italic text-[12px]">Aucune information ajoutée</p>
              )}
              {section.items.map((item) => (
                <div key={item.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold">{item.titre}</span>
                    {(item.dateDebut || item.dateFin) && (
                      <span className="text-[10.5px] text-slate-400">
                        {item.dateDebut} — {item.enCours ? "Aujourd'hui" : item.dateFin}
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
        ))}
      </div>
    </div>
  );
}
