"use client";

import { useCVStore } from "@/lib/store";
import { EntryItem, Section, SECTION_LABELS_FR, SECTION_LABELS_EN, SectionType } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UI } from "@/lib/i18n";
import { GripVertical, Trash2, Plus, Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const ALL_TYPES: SectionType[] = [
  "profil",
  "experience",
  "formation",
  "competences",
  "langues",
  "certifications",
  "projets",
  "interets",
  "references",
];

function SortableSection({ section }: { section: Section }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  });
  const cv = useCVStore((s) => s.cv);
  const set = useCVStore((s) => s.set);
  const removeSection = useCVStore((s) => s.removeSection);
  const [open, setOpen] = useState(false);
  const t = UI[cv.langue];

  const style = { transform: CSS.Transform.toString(transform), transition };

  const labels = cv.langue === "en" ? SECTION_LABELS_EN : SECTION_LABELS_FR;

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

  const addItem = () =>
    set((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === section.id
          ? {
              ...s,
              items: [
                ...s.items,
                { id: uid(), titre: "", sousTitre: "", description: "" } as EntryItem,
              ],
            }
          : s
      ),
    }));

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
  const isSimpleText = section.type === "profil" || section.type === "interets";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-xl border border-border bg-surface overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-foreground/40 hover:text-foreground/70"
          aria-label="Déplacer"
        >
          <GripVertical size={16} />
        </button>
        <input
          value={section.titre}
          onChange={(e) => renameSection(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium outline-none min-w-0"
        />
        <button onClick={toggleVisible} className="text-foreground/50 hover:text-foreground" title="Afficher/masquer">
          {section.visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <button onClick={() => setOpen((o) => !o)} className="text-foreground/50 hover:text-foreground">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <button onClick={() => removeSection(section.id)} className="text-red-400 hover:text-red-500">
          <Trash2 size={16} />
        </button>
      </div>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
          {canToggleAffichage && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-foreground/50">{t.display}</span>
              <button
                onClick={() => setAffichage("liste")}
                className={`text-[11px] px-2 py-1 rounded-lg border transition ${
                  (section.affichage || "liste") === "liste"
                    ? "border-blue-600 text-blue-600 bg-blue-600/10"
                    : "border-border"
                }`}
              >
                {t.displayList}
              </button>
              <button
                onClick={() => setAffichage("ligne")}
                className={`text-[11px] px-2 py-1 rounded-lg border transition ${
                  section.affichage === "ligne"
                    ? "border-blue-600 text-blue-600 bg-blue-600/10"
                    : "border-border"
                }`}
              >
                {t.displayInline}
              </button>
            </div>
          )}
          {section.items.map((item) => (
            <div key={item.id} className="rounded-lg bg-surface-muted p-3 space-y-2 relative">
              <button
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
              <input
                placeholder={isLangOrSkill ? t.itemLangSkillPlaceholder : t.itemTitlePlaceholder}
                value={item.titre}
                onChange={(e) => updateItem(item.id, { titre: e.target.value })}
                className="w-full bg-transparent text-sm font-medium outline-none border-b border-border pb-1 pr-5"
              />
              {isLangOrSkill ? (
                <input
                  placeholder={t.itemLevelPlaceholder}
                  value={item.niveau || ""}
                  onChange={(e) => updateItem(item.id, { niveau: e.target.value })}
                  className="w-full bg-transparent text-xs outline-none"
                />
              ) : isSimpleText ? (
                <textarea
                  placeholder={t.description}
                  value={item.description || ""}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  className="w-full bg-transparent text-xs outline-none resize-none"
                  rows={2}
                />
              ) : (
                <>
                  <input
                    placeholder={t.itemOrgPlaceholder}
                    value={item.sousTitre || ""}
                    onChange={(e) => updateItem(item.id, { sousTitre: e.target.value })}
                    className="w-full bg-transparent text-xs outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      placeholder={t.dateStart}
                      value={item.dateDebut || ""}
                      onChange={(e) => updateItem(item.id, { dateDebut: e.target.value })}
                      className="bg-transparent text-xs outline-none border border-border rounded px-2 py-1"
                    />
                    <input
                      placeholder={t.dateEnd}
                      value={item.dateFin || ""}
                      disabled={item.enCours}
                      onChange={(e) => updateItem(item.id, { dateFin: e.target.value })}
                      className="bg-transparent text-xs outline-none border border-border rounded px-2 py-1 disabled:opacity-40"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-foreground/60">
                    <input
                      type="checkbox"
                      checked={!!item.enCours}
                      onChange={(e) => updateItem(item.id, { enCours: e.target.checked })}
                    />
                    {t.current}
                  </label>
                  <textarea
                    placeholder={t.description}
                    value={item.description || ""}
                    onChange={(e) => updateItem(item.id, { description: e.target.value })}
                    className="w-full bg-transparent text-xs outline-none resize-none"
                    rows={2}
                  />
                </>
              )}
            </div>
          ))}
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
          >
            <Plus size={14} /> {t.addItem}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SectionsEditor() {
  const cv = useCVStore((s) => s.cv);
  const set = useCVStore((s) => s.set);
  const addSection = useCVStore((s) => s.addSection);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const ordered = [...cv.sections].sort((a, b) => a.ordre - b.ordre);
  const labels = cv.langue === "en" ? SECTION_LABELS_EN : SECTION_LABELS_FR;
  const t = UI[cv.langue];
  const missing = ALL_TYPES.filter((type) => !cv.sections.some((s) => s.type === type));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((s) => s.id === active.id);
    const newIndex = ordered.findIndex((s) => s.id === over.id);
    const newOrder = arrayMove(ordered, oldIndex, newIndex);
    newOrder.forEach((s, i) => (s.ordre = i));
    set((c) => ({ ...c, sections: newOrder }));
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ordered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {ordered.map((section) => (
              <SortableSection key={section.id} section={section} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {missing.length > 0 && (
        <div className="pt-2">
          <p className="text-xs text-foreground/50 mb-2">{t.addSection}</p>
          <div className="flex flex-wrap gap-2">
            {missing.map((type) => (
              <button
                key={type}
                onClick={() =>
                  addSection({
                    id: uid(),
                    type,
                    titre: labels[type],
                    visible: true,
                    ordre: cv.sections.length,
                    items: [],
                  })
                }
                className="text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-border hover:bg-surface-muted transition"
              >
                + {labels[type]}
              </button>
            ))}
            <button
              onClick={() =>
                addSection({
                  id: uid(),
                  type: "custom",
                  titre: "Nouvelle rubrique",
                  visible: true,
                  ordre: cv.sections.length,
                  items: [],
                })
              }
              className="text-xs px-2.5 py-1.5 rounded-lg border border-dashed border-blue-400 text-blue-600 hover:bg-blue-500/10 transition"
            >
              {t.customSection}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
