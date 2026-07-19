import { CVData } from "@/lib/types";

function photoClass(shape: string) {
  if (shape === "cercle") return "rounded-full";
  if (shape === "arrondi") return "rounded-2xl";
  if (shape === "carre") return "rounded-none";
  return "";
}

function sortedVisible(cv: CVData) {
  return [...cv.sections].filter((s) => s.visible).sort((a, b) => a.ordre - b.ordre);
}

export default function Template15({ cv }: { cv: CVData }) {
  const { personalInfo: p, couleurPrimaire: color } = cv;

  return (
    <div className="w-full h-full bg-white text-slate-800 font-sans text-[13px] leading-relaxed p-9">
      <div className="flex flex-col items-center text-center mb-8">
        {p.showPhoto && p.photoUrl ? (
          <img
            src={p.photoUrl}
            alt=""
            className={`w-32 h-32 object-cover mb-4 ${photoClass(p.photoShape)}`}
            style={{ boxShadow: `0 8px 24px ${color}40` }}
          />
        ) : (
          <div
            className={`w-32 h-32 mb-4 flex items-center justify-center text-white text-3xl font-bold ${photoClass(
              p.photoShape
            )}`}
            style={{ background: color }}
          >
            {(p.prenom?.[0] || "") + (p.nom?.[0] || "")}
          </div>
        )}
        <h1 className="text-2xl font-bold">
          {p.prenom || "Prénom"} {p.nom || "Nom"}
        </h1>
        <p className="text-sm mt-1" style={{ color }}>
          {p.titre || "Titre du poste"}
        </p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-[11px] text-slate-500">
          {p.email && <span>{p.email}</span>}
          {p.telephone && <span>{p.telephone}</span>}
          {p.adresse && <span>{p.adresse}</span>}
          {p.permis && <span>Permis {p.permis}</span>}
        </div>
      </div>

      <div className="space-y-5 max-w-xl mx-auto">
        {sortedVisible(cv).map((section) => (
          <div key={section.id}>
            <h2
              className="text-[12px] font-bold uppercase tracking-wide mb-2 text-center pb-1"
              style={{ borderBottom: `2px solid ${color}` }}
            >
              {section.titre}
            </h2>
            <div className="space-y-2">
              {section.items.length === 0 && (
                <p className="text-slate-300 italic text-[12px] text-center">Aucune information ajoutée</p>
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
  );
}
