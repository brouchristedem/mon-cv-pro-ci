"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { TEMPLATE_LIST } from "@/lib/templateRegistry";
import { Trash2, Plus, Phone } from "lucide-react";

interface PromoCode {
  code: string;
  actif: boolean;
}

interface PaymentClaim {
  id: string;
  email: string;
  waveReference?: string;
  createdAt?: { seconds: number };
}

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [newCode, setNewCode] = useState("");
  const [templateStatus, setTemplateStatus] = useState<Record<string, boolean>>({});
  const [claims, setClaims] = useState<PaymentClaim[]>([]);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) router.replace("/");
  }, [loading, user, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    const unsubPromo = onSnapshot(collection(db, "promoCodes"), (snap) => {
      setPromoCodes(snap.docs.map((d) => ({ code: d.id, actif: d.data().actif })));
    });
    const unsubClaims = onSnapshot(
      query(collection(db, "paymentClaims"), orderBy("createdAt", "desc"), limit(30)),
      (snap) => {
        setClaims(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentClaim, "id">) })));
      }
    );
    const initial: Record<string, boolean> = {};
    TEMPLATE_LIST.forEach((t) => (initial[t.id] = t.actif));
    setTemplateStatus(initial);
    return () => {
      unsubPromo();
      unsubClaims();
    };
  }, [isAdmin]);

  const addPromo = async () => {
    if (!newCode.trim()) return;
    await setDoc(doc(db, "promoCodes", newCode.trim().toUpperCase()), { actif: true });
    setNewCode("");
  };

  const togglePromo = async (code: string, actif: boolean) => {
    await setDoc(doc(db, "promoCodes", code), { actif: !actif }, { merge: true });
  };

  const removePromo = async (code: string) => {
    await deleteDoc(doc(db, "promoCodes", code));
  };

  const toggleTemplate = async (id: string) => {
    const next = !templateStatus[id];
    setTemplateStatus((s) => ({ ...s, [id]: next }));
    await setDoc(doc(db, "templates", id), { actif: next }, { merge: true });
  };

  if (loading || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center text-sm">Chargement...</div>;
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-xl font-bold">Administration — Mon CV Pro CI</h1>

      <section>
        <h2 className="text-sm font-semibold mb-1">Prix du téléchargement payant</h2>
        <p className="text-xs text-foreground/60">
          Le prix (505 FCFA) est fixé directement dans le lien de paiement Wave. Pour le changer,
          modifiez le montant dans le lien Wave utilisé par le site (variable
          NEXT_PUBLIC_WAVE_LINK sur Vercel), pas ici.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-1">Comment fonctionne le paiement maintenant</h2>
        <p className="text-xs text-foreground/60 mb-3">
          La personne paie via Wave puis clique elle-même sur « J&apos;ai terminé mon paiement » —
          le téléchargement se débloque immédiatement, sans validation de votre part. La liste
          ci-dessous n&apos;est qu&apos;un journal indicatif pour recouper avec votre compte Wave si besoin.
        </p>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {claims.length === 0 && <p className="text-xs text-foreground/40">Aucune déclaration de paiement pour le moment.</p>}
          {claims.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs">
              <div>
                <p>{c.email}</p>
                {c.waveReference && <p className="text-foreground/40 font-mono text-[10px]">Réf : {c.waveReference}</p>}
              </div>
              <span className="text-foreground/40">
                {c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleString("fr-FR") : ""}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">Codes promo</h2>
        <div className="flex gap-2 mb-3">
          <input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="ex : BIENVENUE2026"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
          <button
            onClick={addPromo}
            className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <Plus size={14} /> Ajouter
          </button>
        </div>
        <div className="space-y-2">
          {promoCodes.map((p) => (
            <div
              key={p.code}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
            >
              <span className="font-mono">{p.code}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePromo(p.code, p.actif)}
                  className={`text-xs px-2.5 py-1 rounded-full ${
                    p.actif ? "bg-green-500/15 text-green-600" : "bg-red-500/15 text-red-500"
                  }`}
                >
                  {p.actif ? "Actif" : "Désactivé"}
                </button>
                <button onClick={() => removePromo(p.code)} className="text-red-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-3">Templates ({TEMPLATE_LIST.length})</h2>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATE_LIST.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs"
            >
              <span>{t.nom}</span>
              <button
                onClick={() => toggleTemplate(t.id)}
                className={`px-2 py-1 rounded-full ${
                  templateStatus[t.id]
                    ? "bg-green-500/15 text-green-600"
                    : "bg-red-500/15 text-red-500"
                }`}
              >
                {templateStatus[t.id] ? "Actif" : "Désactivé"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center gap-2 text-xs text-foreground/50 pt-4 border-t border-border">
        <Phone size={12} /> Service client affiché aux utilisateurs : +225 05 45 17 75 71
      </section>
    </div>
  );
}
