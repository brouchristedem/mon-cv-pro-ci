"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useCVStore } from "@/lib/store";
import CVRenderer from "@/components/templates/CVRenderer";
import PersonalInfoForm from "@/components/editor/PersonalInfoForm";
import SectionsEditor from "@/components/editor/SectionsEditor";
import TemplatePicker from "@/components/editor/TemplatePicker";
import ColorPicker from "@/components/editor/ColorPicker";
import DownloadPanel from "@/components/editor/DownloadPanel";
import { useTheme } from "@/lib/ThemeContext";
import {
  Undo2,
  Redo2,
  Moon,
  Sun,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const STEPS = [
  { key: "infos", label: "Informations" },
  { key: "rubriques", label: "Rubriques" },
  { key: "modele", label: "Modèle & couleur" },
  { key: "mise-en-page", label: "Mise en page" },
  { key: "telecharger", label: "Télécharger" },
];

export default function EditorPage() {
  const router = useRouter();
  const { user, loading, isAdmin, signInWithGoogle, signOut, saveProgress } = useAuth();
  const cv = useCVStore((s) => s.cv);
  const set = useCVStore((s) => s.set);
  const undo = useCVStore((s) => s.undo);
  const redo = useCVStore((s) => s.redo);
  const canUndo = useCVStore((s) => s.canUndo);
  const canRedo = useCVStore((s) => s.canRedo);
  const { dark, toggle } = useTheme();
  const previewRef = useRef<HTMLDivElement>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    setStep(cv.step || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  useEffect(() => {
    if (!user) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveProgress({ ...cv, step });
    }, 800);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [cv, step, user, saveProgress]);

  const goStep = useCallback(
    (n: number) => {
      const clamped = Math.max(0, Math.min(STEPS.length - 1, n));
      setStep(clamped);
      set((c) => ({ ...c, step: clamped }));
    },
    [set]
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-foreground/60">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-border">
        <Link href="/" className="font-bold text-sm">
          Mon CV Pro CI
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded-lg hover:bg-surface-muted disabled:opacity-30 transition"
            title="Annuler"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded-lg hover:bg-surface-muted disabled:opacity-30 transition"
            title="Rétablir"
          >
            <Redo2 size={16} />
          </button>
          <select
            value={cv.langue}
            onChange={(e) => set((c) => ({ ...c, langue: e.target.value as "fr" | "en" }))}
            className="text-xs bg-transparent border border-border rounded-lg px-2 py-1.5"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-surface-muted transition" title="Thème">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {isAdmin && (
            <Link href="/admin" className="p-2 rounded-lg hover:bg-surface-muted transition" title="Admin">
              <ShieldCheck size={16} />
            </Link>
          )}
          <button onClick={signOut} className="p-2 rounded-lg hover:bg-surface-muted transition" title="Déconnexion">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="flex items-center gap-1 px-4 lg:px-6 py-2 overflow-x-auto border-b border-border text-xs">
        {STEPS.map((s, i) => (
          <button
            key={s.key}
            onClick={() => goStep(i)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              step === i
                ? "bg-blue-600 text-white"
                : "bg-surface-muted text-foreground/60 hover:text-foreground"
            }`}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      <main className="flex-1 flex flex-col lg:flex-row">
        <section className="lg:w-[420px] flex-shrink-0 p-4 lg:p-6 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto">
          {step === 0 && <PersonalInfoForm />}
          {step === 1 && <SectionsEditor />}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-2">Choisir un modèle</h3>
                <TemplatePicker />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Couleur du CV</h3>
                <ColorPicker />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold mb-2">Disposition</h3>
                <div className="flex gap-2">
                  {(["une-page", "plusieurs-pages"] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => set((c) => ({ ...c, disposition: d }))}
                      className={`px-3 py-2 text-xs rounded-lg border transition ${
                        cv.disposition === d
                          ? "border-blue-600 bg-blue-600/10 text-blue-600"
                          : "border-border hover:bg-surface-muted"
                      }`}
                    >
                      {d === "une-page" ? "Une page" : "Plusieurs pages"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">Taille des informations</h3>
                <div className="flex gap-2">
                  {(["normale", "grande"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => set((c) => ({ ...c, taillePolice: t }))}
                      className={`px-3 py-2 text-xs rounded-lg border transition capitalize ${
                        cv.taillePolice === t
                          ? "border-blue-600 bg-blue-600/10 text-blue-600"
                          : "border-border hover:bg-surface-muted"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 4 && <DownloadPanel previewRef={previewRef} />}

          <div className="flex justify-between pt-6">
            <button
              onClick={() => goStep(step - 1)}
              disabled={step === 0}
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg hover:bg-surface-muted disabled:opacity-30 transition"
            >
              <ChevronLeft size={14} /> Précédent
            </button>
            {step < STEPS.length - 1 && (
              <button
                onClick={() => goStep(step + 1)}
                className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Suivant <ChevronRight size={14} />
              </button>
            )}
          </div>
          {step < STEPS.length - 1 && (
            <button
              onClick={() => goStep(STEPS.length - 1)}
              className="text-[11px] text-foreground/40 hover:text-foreground/70 mt-2 underline"
            >
              Passer directement au téléchargement
            </button>
          )}
        </section>

        <section
          className={`flex-1 flex items-start justify-center p-4 lg:p-10 overflow-auto bg-surface-muted ${
            cv.taillePolice === "grande" ? "text-[15px]" : ""
          }`}
        >
          <div
            className="shadow-xl bg-white cv-protected"
            style={{ width: "210mm", minHeight: cv.disposition === "une-page" ? "297mm" : undefined }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div ref={previewRef}>
              <CVRenderer cv={cv} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
