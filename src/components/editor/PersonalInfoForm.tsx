"use client";

import { useCVStore } from "@/lib/store";
import { useRef, useState } from "react";
import { UI } from "@/lib/i18n";
import { Loader2 } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/40 transition";
const labelClass = "text-xs font-medium text-foreground/70 mb-1 block";

// Redimensionne et compresse l'image côté navigateur avant de la stocker,
// pour rester largement sous la limite de taille de Firestore (aucun coût,
// aucun besoin de Firebase Storage).
function compressImage(file: File, maxSize = 500, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas non supporté"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PersonalInfoForm() {
  const cv = useCVStore((s) => s.cv);
  const set = useCVStore((s) => s.set);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const t = UI[cv.langue];

  const update = (field: keyof typeof cv.personalInfo, value: string | boolean) => {
    set((c) => ({ ...c, personalInfo: { ...c.personalInfo, [field]: value } }));
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      update("photoUrl", compressed);
    } catch (err) {
      console.error("Erreur de traitement de la photo:", err);
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => fileRef.current?.click()}
          type="button"
          disabled={uploading}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-border hover:bg-surface-muted transition disabled:opacity-60"
        >
          {uploading && <Loader2 size={14} className="animate-spin" />}
          {cv.personalInfo.photoUrl ? t.changePhoto : t.addPhoto}
        </button>
        {cv.personalInfo.photoUrl && !uploading && (
          <button
            type="button"
            onClick={() => update("photoUrl", "")}
            className="text-xs text-red-500 hover:underline"
          >
            {t.removePhoto}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
      </div>
      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}

      <div className="flex items-center justify-between">
        <span className={labelClass}>{t.showPhotoOnCV}</span>
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
          <span className={labelClass}>{t.photoShape}</span>
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
          <label className={labelClass}>{t.firstName}</label>
          <input
            className={inputClass}
            value={cv.personalInfo.prenom}
            onChange={(e) => update("prenom", e.target.value)}
            placeholder={t.firstNamePlaceholder}
          />
        </div>
        <div>
          <label className={labelClass}>{t.lastName}</label>
          <input
            className={inputClass}
            value={cv.personalInfo.nom}
            onChange={(e) => update("nom", e.target.value)}
            placeholder={t.lastNamePlaceholder}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>{t.jobTitle}</label>
        <input
          className={inputClass}
          value={cv.personalInfo.titre}
          onChange={(e) => update("titre", e.target.value)}
          placeholder={t.jobTitlePlaceholder}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t.email}</label>
          <input
            className={inputClass}
            value={cv.personalInfo.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder={t.emailPlaceholder}
          />
        </div>
        <div>
          <label className={labelClass}>{t.phone}</label>
          <input
            className={inputClass}
            value={cv.personalInfo.telephone}
            onChange={(e) => update("telephone", e.target.value)}
            placeholder={t.phonePlaceholder}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>{t.address}</label>
        <input
          className={inputClass}
          value={cv.personalInfo.adresse}
          onChange={(e) => update("adresse", e.target.value)}
          placeholder={t.addressPlaceholder}
        />
      </div>

      <div>
        <label className={labelClass}>{t.license}</label>
        <input
          className={inputClass}
          value={cv.personalInfo.permis || ""}
          onChange={(e) => update("permis", e.target.value)}
          placeholder={t.licensePlaceholder}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t.linkedin}</label>
          <input
            className={inputClass}
            value={cv.personalInfo.linkedin || ""}
            onChange={(e) => update("linkedin", e.target.value)}
            placeholder="linkedin.com/in/..."
          />
        </div>
        <div>
          <label className={labelClass}>{t.website}</label>
          <input
            className={inputClass}
            value={cv.personalInfo.siteWeb || ""}
            onChange={(e) => update("siteWeb", e.target.value)}
            placeholder="monsite.com"
          />
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <div className="flex items-center justify-between mb-2 mt-3">
          <span className={labelClass}>{t.otherInfo}</span>
          <button
            type="button"
            onClick={() =>
              set((c) => ({
                ...c,
                personalInfo: {
                  ...c.personalInfo,
                  autresInfos: [
                    ...c.personalInfo.autresInfos,
                    { id: Math.random().toString(36).slice(2, 9), label: "", valeur: "" },
                  ],
                },
              }))
            }
            className="text-xs text-blue-600 hover:underline"
          >
            + {t.add}
          </button>
        </div>
        <div className="space-y-2">
          {cv.personalInfo.autresInfos.map((info) => (
            <div key={info.id} className="flex gap-2 items-center">
              <input
                placeholder={t.labelPlaceholder}
                value={info.label}
                onChange={(e) =>
                  set((c) => ({
                    ...c,
                    personalInfo: {
                      ...c.personalInfo,
                      autresInfos: c.personalInfo.autresInfos.map((i) =>
                        i.id === info.id ? { ...i, label: e.target.value } : i
                      ),
                    },
                  }))
                }
                className="flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none"
              />
              <input
                placeholder={t.valuePlaceholder}
                value={info.valeur}
                onChange={(e) =>
                  set((c) => ({
                    ...c,
                    personalInfo: {
                      ...c.personalInfo,
                      autresInfos: c.personalInfo.autresInfos.map((i) =>
                        i.id === info.id ? { ...i, valeur: e.target.value } : i
                      ),
                    },
                  }))
                }
                className="flex-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  set((c) => ({
                    ...c,
                    personalInfo: {
                      ...c.personalInfo,
                      autresInfos: c.personalInfo.autresInfos.filter((i) => i.id !== info.id),
                    },
                  }))
                }
                className="text-red-400 hover:text-red-500 text-xs px-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
