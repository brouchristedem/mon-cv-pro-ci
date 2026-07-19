"use client";

import { useCVStore } from "@/lib/store";
import { useRef } from "react";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition";
const labelClass = "text-xs font-medium text-foreground/70 mb-1 block";

export default function PersonalInfoForm() {
  const cv = useCVStore((s) => s.cv);
  const set = useCVStore((s) => s.set);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof typeof cv.personalInfo, value: string | boolean) => {
    set((c) => ({ ...c, personalInfo: { ...c.personalInfo, [field]: value } }));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("photoUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          type="button"
          className="text-sm px-3 py-2 rounded-lg border border-border hover:bg-surface-muted transition"
        >
          {cv.personalInfo.photoUrl ? "Changer la photo" : "Ajouter une photo"}
        </button>
        {cv.personalInfo.photoUrl && (
          <button
            type="button"
            onClick={() => update("photoUrl", "")}
            className="text-xs text-red-500 hover:underline"
          >
            Retirer
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
      </div>

      <div className="flex items-center justify-between">
        <span className={labelClass}>Afficher la photo sur le CV</span>
        <button
          type="button"
          onClick={() => update("showPhoto", !cv.personalInfo.showPhoto)}
          className={`w-10 h-6 rounded-full transition relative ${
            cv.personalInfo.showPhoto ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
              cv.personalInfo.showPhoto ? "left-4.5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {cv.personalInfo.photoUrl && (
        <div>
          <span className={labelClass}>Forme de la photo</span>
          <div className="flex gap-2">
            {(["cercle", "arrondi", "carre"] as const).map((shape) => (
              <button
                key={shape}
                type="button"
                onClick={() => update("photoShape", shape)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition capitalize ${
                  cv.personalInfo.photoShape === shape
                    ? "border-blue-600 bg-blue-600/10 text-blue-600"
                    : "border-border hover:bg-surface-muted"
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Prénom</label>
          <input
            className={inputClass}
            value={cv.personalInfo.prenom}
            onChange={(e) => update("prenom", e.target.value)}
            placeholder="ex : Christ"
          />
        </div>
        <div>
          <label className={labelClass}>Nom</label>
          <input
            className={inputClass}
            value={cv.personalInfo.nom}
            onChange={(e) => update("nom", e.target.value)}
            placeholder="ex : Edem"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Titre professionnel</label>
        <input
          className={inputClass}
          value={cv.personalInfo.titre}
          onChange={(e) => update("titre", e.target.value)}
          placeholder="ex : Ingénieur logiciel"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Email</label>
          <input
            className={inputClass}
            value={cv.personalInfo.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="ex : nom@email.com"
          />
        </div>
        <div>
          <label className={labelClass}>Téléphone</label>
          <input
            className={inputClass}
            value={cv.personalInfo.telephone}
            onChange={(e) => update("telephone", e.target.value)}
            placeholder="ex : +225 XX XX XX XX XX"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Adresse</label>
        <input
          className={inputClass}
          value={cv.personalInfo.adresse}
          onChange={(e) => update("adresse", e.target.value)}
          placeholder="ex : Abidjan, Côte d'Ivoire"
        />
      </div>

      <div>
        <label className={labelClass}>Permis de conduire (optionnel)</label>
        <input
          className={inputClass}
          value={cv.personalInfo.permis || ""}
          onChange={(e) => update("permis", e.target.value)}
          placeholder="ex : B"
        />
      </div>
    </div>
  );
}
