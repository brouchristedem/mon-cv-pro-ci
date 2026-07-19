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
import { SECTION_LABELS_FR, SECTION_LABELS_EN } from "@/lib/types";
import { UI } from "@/lib/i18n";
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

export default function EditorPage() {
  const router = useRouter();
  const { user, loading, isAdmin, signOut, saveProgress } = useAuth();
  const cv = useCVStore((s) => s.cv);
  const set = useCVStore((s) => s.set);
  const undo = useCVStore((s) => s.undo);
  const redo = useCVStore((s) => s.redo);
  const canUndo = useCVStore((s) => s.canUndo);
  const canRedo = useCVStore((s) => s.canRedo);
  const { dark, toggle } = useTheme();
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = UI[cv.langue];

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
      saveProgress({ ...cv, step }).catch((err) => console.error("Erreur de sauvegarde:", err));
    }, 800);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [cv, step, user, saveProgress]);

  const goStep = useCallback(
    (n: number) => {
      const clamped = Math.max(0, Math.min(t.steps.length - 1, n));
      setStep(clamped);
      set((c) => ({ ...c, step: clamped }));
    },
    [set, t.steps.length]
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-foreground/60">
        {t.loading}
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
            title={t.undo}
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded-lg hover:bg-surface-muted disabled:opacity-30 transition"
            title={t.redo}
          >
            <Redo2 size={16} />
          </button>
          <select
            value={cv.langue}
            onChange={(e) => {
              const langue = e.target.value as "fr" | "en";
              const labels = langue === "en" ? SECTION_LABELS_EN : SECTION_LABELS_FR;
              set((c) => ({
                ...c,
                langue,
                sections: c.sections.map((s) =>
                  s.type === "custom" ? s : { ...s, titre: labels[s.type] }
                ),
              }));
            }}
            className="text-xs bg-transparent border border-border rounded-lg px-2 py-1.5"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
          <button onClick={toggle} className="p-2 rounded-lg hover:bg-surface-muted transition" title={t.theme}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {isAdmin && (
            <Link href="/admin" className="p-2 rounded-lg hover:bg-surface-muted transition" title={t.admin}>
              <ShieldCheck size={16} />
            </Link>
          )}
          <button
            onClick={() => signOut().catch((err) => console.error(err))}
            className="p-2 rounded-lg hover:bg-surface-muted transition"
            title={t.logout}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="flex items-center gap-1 px-4 lg:px-6 py-2 overflow-x-auto border-b border-border text-xs">
        {t.steps.map((label, i) => (
          <button
            key={label}
            onClick={() => goStep(i)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition ${
              step === i
                ? "bg-blue-600 text-white"
                : "bg-surface-muted text-foreground/60 hover:text-foreground"
            }`}
          >
            {i + 1}. {label}
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
                <h3 className="text-sm font-semibold mb-2">{t.chooseTemplate}</h3>
                <TemplatePicker />
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">{t.cvColor}</h3>
                <ColorPicker />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold">{t.compressOnePage}</h3>
                  <button
                    type="button"
                    onClick={() => set((c) => ({ ...c, compresserUnePage: !c.compresserUnePage }))}
                    className={`w-10 h-6 rounded-full transition relative ${
                      cv.compresserUnePage ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                        cv.compresserUnePage ? "left-4.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-foreground/50">
                  {cv.compresserUnePage ? t.compressOn : t.compressOff}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-2">{t.textSize}</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={10}
                    max={24}
                    value={cv.tailleTexte}
                    onChange={(e) => set((c) => ({ ...c, tailleTexte: Number(e.target.value) }))}
                    className="flex-1"
                  />
                  <select
                    value={cv.tailleTexte}
                    onChange={(e) => set((c) => ({ ...c, tailleTexte: Number(e.target.value) }))}
                    className="text-xs border border-border rounded-lg px-2 py-1.5 bg-surface"
                  >
                    {[10, 11, 12, 13, 14, 16, 18, 20, 22, 24].map((v) => (
                      <option key={v} value={v}>
                        {v} pt
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          {step === 4 && <DownloadPanel />}

          <div className="flex justify-between pt-6">
            <button
              onClick={() => goStep(step - 1)}
              disabled={step === 0}
              className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg hover:bg-surface-muted disabled:opacity-30 transition"
            >
              <ChevronLeft size={14} /> {t.previous}
            </button>
            {step < t.steps.length - 1 && (
              <button
                onClick={() => goStep(step + 1)}
                className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                {t.next} <ChevronRight size={14} />
              </button>
            )}
          </div>
          {step < t.steps.length - 1 && (
            <button
              onClick={() => goStep(t.steps.length - 1)}
              className="text-[11px] text-foreground/40 hover:text-foreground/70 mt-2 underline"
            >
              {t.skipToDownload}
            </button>
          )}
        </section>

        <section
          className="flex-1 flex items-start justify-center p-4 lg:p-10 overflow-auto bg-surface-muted"
        >
          <div
            id="cv-print-area"
            className={`shadow-xl bg-white cv-protected ${cv.compresserUnePage ? "compresser" : ""}`}
            style={{ width: "210mm", zoom: cv.tailleTexte / 13 }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <CVRenderer cv={cv} />
          </div>
        </section>
      </main>
    </div>
  );
}
