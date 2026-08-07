"use client";

import { useEffect, useRef, useState } from "react";
import { useCVStore } from "@/lib/store";
import { EntryItem, Section } from "@/lib/types";
import { UI } from "@/lib/i18n";
import { parseRichRuns } from "@/lib/richText";
import { Trash2, Plus, Eye, EyeOff, Pencil, Bold, Underline } from "lucide-react";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Convertit le texte stocké (avec marqueurs **gras** / __souligné__) en
// HTML pour initialiser la zone éditable.
function markerTextToHtml(text: string): string {
  const runs = parseRichRuns(text);
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (runs.length === 0) return "";
  return runs
    .map((run) => {
      const escaped = escape(run.text).replace(/\n/g, "<br>");
      if (run.bold && run.underline) return `<strong><u>${escaped}</u></strong>`;
      if (run.bold) return `<strong>${escaped}</strong>`;
      if (run.underline) return `<u>${escaped}</u>`;
      return escaped;
    })
    .join("");
}

// Reconvertit le HTML de la zone éditable en texte avec marqueurs, pour
// le stockage (compatible avec l'aperçu et l'export PDF existants).
function htmlToMarkerText(root: Node): string {
  const runs: { text: string; bold: boolean; underline: boolean }[] = [];
  const collect = (node: Node, bold: boolean, underline: boolean) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (text) runs.push({ text, bold, underline });
      return;
    }
    if (node.nodeName === "BR") {
      runs.push({ text: "\n", bold: false, underline: false });
      return;
    }
    const el = node as HTMLElement;
    const nextBold = bold || el.tagName === "B" || el.tagName === "STRONG";
    const nextUnderline = underline || el.tagName === "U";
    node.childNodes.forEach((child) => collect(child, nextBold, nextUnderline));
    if (["DIV", "P"].includes(el.tagName) && node.nextSibling) {
      runs.push({ text: "\n", bold: false, underline: false });
    }
  };
  root.childNodes.forEach((child) => collect(child, false, false));

  let out = "";
  for (const run of runs) {
    const clean = run.text.replace(/\*\*/g, "").replace(/__/g, "");
    if (!clean) continue;
    if (run.bold && run.underline) out += `**__${clean}__**`;
    else if (run.bold) out += `**${clean}**`;
    else if (run.underline) out += `__${clean}__`;
    else out += clean;
  }
  return out;
}

function DescriptionField({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (next: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [boldActive, setBoldActive] = useState(false);
  const [underlineActive, setUnderlineActive] = useState(false);

  // Initialise le contenu une seule fois au montage (le composant est
  // remonté à chaque changement d'élément grâce à la clé posée sur son
  // parent) : on ne touche plus ensuite au DOM depuis React, pour ne pas
  // faire sauter la position du curseur pendant la frappe.
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = markerTextToHtml(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncActiveState = () => {
    try {
      setBoldActive(document.queryCommandState("bold"));
      setUnderlineActive(document.queryCommandState("underline"));
    } catch {
      // Ignore : certains navigateurs peuvent lever une erreur hors focus.
    }
  };

  const handleInput = () => {
    if (ref.current) onChange(htmlToMarkerText(ref.current));
    syncActiveState();
  };

  const toggle = (command: "bold" | "underline") => {
    ref.current?.focus();
    document.execCommand(command);
    handleInput();
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <button
          type="button"
          title="Gras"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggle("bold")}
          className={`p-1.5 rounded border transition ${
            boldActive
              ? "border-brand-600 bg-brand-600/10 text-brand-600"
              : "border-border text-foreground/60 hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          <Bold size={12} />
        </button>
        <button
          type="button"
          title="Souligné"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggle("underline")}
          className={`p-1.5 rounded border transition ${
            underlineActive
              ? "border-brand-600 bg-brand-600/10 text-brand-600"
              : "border-border text-foreground/60 hover:text-foreground hover:bg-surface-muted"
          }`}
        >
          <Underline size={12} />
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onKeyUp={syncActiveState}
        onMouseUp={syncActiveState}
        onFocus={syncActiveState}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            document.execCommand("insertLineBreak");
            handleInput();
          }
        }}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs outline-none overflow-y-auto max-h-60 min-h-[4.5rem] whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-foreground/30"
      />
    </div>
  );
}

export default function SectionPanel({ section }: { section: Section }) {
  const cv = useCVStore((s) => s.cv);
  const set = useCVStore((s) => s.set);
  const removeSection = useCVStore((s) => s.removeSection);
  const [renaming, setRenaming] = useState(false);
  const t = UI[cv.langue];

  const toggleVisible = () =>
    set((c) => ({
      ...c,
      sections: c.sections.map((s) => (s.id === section.id ? { ...s, visible: !s.visible } : s)),
    }));

  const renameSection = (titre: string) =>
    set((c) => ({
      ...c,
      sections: c.sections.map((s) => (s.id === section.id ? { ...s, titre } : s)),
    }));

  const setAffichage = (affichage: "liste" | "ligne") =>
    set((c) => ({
      ...c,
      sections: c.sections.map((s) => (s.id === section.id ? { ...s, affichage } : s)),
    }));

  const canToggleAffichage = ["langues", "competences", "interets"].includes(section.type);

  const addItem = () => {
    const newId = uid();
    set((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === section.id
          ? {
              ...s,
              items: [
                ...s.items,
                { id: newId, titre: "", sousTitre: "", description: "" } as EntryItem,
              ],
            }
          : s
      ),
    }));
    // Fait défiler jusqu'au nouvel élément dès qu'il est rendu, pour ne pas
    // laisser la personne chercher où il est apparu.
    requestAnimationFrame(() => {
      document.getElementById(`item-${newId}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const updateItem = (itemId: string, patch: Partial<EntryItem>) =>
    set((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === section.id
          ? { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
          : s
      ),
    }));

  const removeItem = (itemId: string) =>
    set((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === section.id ? { ...s, items: s.items.filter((it) => it.id !== itemId) } : s
      ),
    }));

  const isLangOrSkill = section.type === "langues" || section.type === "competences";
  const isJustTitle = section.type === "interets";
  const isSimpleText = section.type === "profil";

  const TITLE_LABEL: Partial<Record<string, { fr: string; en: string }>> = {
    experience: { fr: "Poste occupé (ex : Développeur Web)", en: "Job title (e.g. Web Developer)" },
    formation: { fr: "Diplôme / Formation", en: "Degree / Program" },
    projets: { fr: "Titre du projet", en: "Project title" },
    certifications: { fr: "Titre de la certification", en: "Certification title" },
  };
  const ORG_LABEL: Partial<Record<string, { fr: string; en: string }>> = {
    experience: { fr: "Entreprise", en: "Company" },
    formation: { fr: "École / Établissement", en: "School / Institution" },
    projets: { fr: "École / Cadre du projet", en: "School / Project context" },
    certifications: { fr: "Organisme émetteur", en: "Issuing organization" },
    references: { fr: "Entreprise / Contact", en: "Company / Contact" },
  };
  const SHOW_LIEU = section.type !== "certifications";

  const titlePlaceholder = isLangOrSkill
    ? t.itemLangSkillPlaceholder
    : TITLE_LABEL[section.type]
    ? TITLE_LABEL[section.type]![cv.langue]
    : t.itemTitlePlaceholder;
  const orgPlaceholder = ORG_LABEL[section.type]
    ? ORG_LABEL[section.type]![cv.langue]
    : t.itemOrgPlaceholder;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {renaming ? (
          <input
            autoFocus
            value={section.titre}
            onChange={(e) => renameSection(e.target.value)}
            onBlur={() => setRenaming(false)}
            onKeyDown={(e) => e.key === "Enter" && setRenaming(false)}
            className="flex-1 bg-transparent text-base font-semibold outline-none min-w-0 border-b border-brand-500"
          />
        ) : (
          <h3 className="flex-1 text-base font-semibold truncate">{section.titre}</h3>
        )}
        <button
          onClick={() => setRenaming((r) => !r)}
          className="text-foreground/40 hover:text-foreground/70 p-1.5 rounded-lg hover:bg-surface-muted"
          title="Renommer"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={toggleVisible}
          className="text-foreground/50 hover:text-foreground p-1.5 rounded-lg hover:bg-surface-muted"
          title="Afficher/masquer"
        >
          {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button
          onClick={() => removeSection(section.id)}
          className="text-red-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-500/10"
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {canToggleAffichage && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-foreground/50">{t.display}</span>
          <button
            onClick={() => setAffichage("liste")}
            className={`text-[11px] px-2 py-1 rounded-lg border transition ${
              (section.affichage || "liste") === "liste"
                ? "border-brand-600 text-brand-600 bg-brand-600/10"
                : "border-border"
            }`}
          >
            {t.displayList}
          </button>
          <button
            onClick={() => setAffichage("ligne")}
            className={`text-[11px] px-2 py-1 rounded-lg border transition ${
              section.affichage === "ligne" ? "border-brand-600 text-brand-600 bg-brand-600/10" : "border-border"
            }`}
          >
            {t.displayInline}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {section.items.map((item) => (
          <div key={item.id} id={`item-${item.id}`} className="rounded-xl border border-border bg-surface p-3 space-y-2 relative">
            <button
              onClick={() => removeItem(item.id)}
              className="absolute top-2.5 right-2.5 text-red-400 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
            <input
              placeholder={titlePlaceholder}
              value={item.titre}
              onChange={(e) => updateItem(item.id, { titre: e.target.value })}
              className="w-full bg-transparent text-sm font-medium outline-none border-b border-border pb-1.5 pr-6"
            />
            {isJustTitle ? null : isLangOrSkill ? (
              <input
                placeholder={t.itemLevelPlaceholder}
                value={item.niveau || ""}
                onChange={(e) => updateItem(item.id, { niveau: e.target.value })}
                className="w-full bg-transparent text-xs outline-none"
              />
            ) : isSimpleText ? (
              <DescriptionField
                placeholder={t.description}
                value={item.description || ""}
                onChange={(next) => updateItem(item.id, { description: next })}
              />
            ) : (
              <>
                <input
                  placeholder={orgPlaceholder}
                  value={item.sousTitre || ""}
                  onChange={(e) => updateItem(item.id, { sousTitre: e.target.value })}
                  className="w-full bg-transparent text-xs outline-none"
                />
                {SHOW_LIEU && (
                  <input
                    placeholder={cv.langue === "en" ? "Location" : "Lieu"}
                    value={item.lieu || ""}
                    onChange={(e) => updateItem(item.id, { lieu: e.target.value })}
                    className="w-full bg-transparent text-xs outline-none"
                  />
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-foreground/40 block mb-0.5">{t.dateStart}</label>
                    <input
                      type="month"
                      value={item.dateDebut || ""}
                      onChange={(e) => updateItem(item.id, { dateDebut: e.target.value })}
                      className="w-full bg-transparent text-xs outline-none border border-border rounded px-2 py-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-foreground/40 block mb-0.5">{t.dateEnd}</label>
                    <input
                      type="month"
                      value={item.dateFin || ""}
                      disabled={item.enCours}
                      onChange={(e) => updateItem(item.id, { dateFin: e.target.value })}
                      className="w-full bg-transparent text-xs outline-none border border-border rounded px-2 py-1 disabled:opacity-40"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-foreground/60">
                  <input
                    type="checkbox"
                    checked={!!item.enCours}
                    onChange={(e) => updateItem(item.id, { enCours: e.target.checked })}
                  />
                  {t.current}
                </label>
                <DescriptionField
                  placeholder={t.description}
                  value={item.description || ""}
                  onChange={(next) => updateItem(item.id, { description: next })}
                />
              </>
            )}
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"
        >
          <Plus size={14} /> {t.addItem}
        </button>
      </div>
    </div>
  );
}
