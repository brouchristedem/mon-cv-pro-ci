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

export default function Template05({ cv }: { cv: CVData }) {
  const { personalInfo: p, couleurPrimaire: color } = cv;

  return (
    <div className="w-full h-full bg-white text-slate-800 font-sans text-[13px] leading-relaxed relative overflow-hidden">
      <div
        className="absolute top-0 left-0 w-3 h-full"
        style={{ background: color }}
      />
      <div className="pl-10 pr-8 py-8">
        <div className="flex items-center gap-5 mb-8">
          {p.showPhoto && p.photoUrl && (
            <img
              src={p.photoUrl}
              alt=""
              className={`w-24 h-24 object-cover flex-shrink-0 ring-4 ${photoClass(p.photoShape)}`}
              style={{ boxShadow: `0 0 0 4px ${color}22` }}
            />
          )}
          <div>
            <h1 className="text-3xl font-extrabold" style={{ color }}>
              {p.prenom || "Prénom"}
            </h1>
            <h1 className="text-3xl font-extrabold text-slate-800 -mt-1">{p.nom || "Nom"}</h1>
            <p className="text-sm text-slate-500 mt-1">{p.titre || "Titre du poste"}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[p.email, p.telephone, p.adresse, p.permis && `Permis ${p.permis}`]
            .filter(Boolean)
            .map((v, i) => (
              <span
                key={i}
                className="text-[11px] px-2.5 py-1 rounded-full"
                style={{ background: `${color}15`, color }}
              >
                {v}
              </span>
            ))}
        </div>

        <div className="space-y-5">
          {sortedVisible(cv).map((section) => (
            <div key={section.id}>
              <h2 className="text-[13px] font-extrabold uppercase mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                {section.titre}
              </h2>
              <div className="space-y-2 pl-4">
                {section.items.length === 0 && (
                  <p className="text-slate-300 italic text-[12px]">Aucune information ajoutée</p>
                )}
                {section.items.map((item) => (
                  <div key={item.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold">{item.titre}</span>
                      {(item.dateDebut || item.dateFin) && (
                        <span className="text-[11px] text-slate-400">
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
    </div>
  );
}
