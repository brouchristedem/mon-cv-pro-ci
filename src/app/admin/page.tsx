"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  onSnapshot,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { TEMPLATE_LIST } from "@/lib/templateRegistry";
import { Trash2, Plus, Phone, Search, Users, Wallet, TicketPercent } from "lucide-react";

const PRICE = Number(process.env.NEXT_PUBLIC_PRICE_NEXT || 1000);

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

interface AdminStats {
  totalUsers: number;
  usersToday: number;
  topPromoCode: string | null;
  topPromoCodeCount: number;
}

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [newCode, setNewCode] = useState("");
  const [templateStatus, setTemplateStatus] = useState<Record<string, boolean>>({});
  const [claims, setClaims] = useState<PaymentClaim[]>([]);
  const [claimSearch, setClaimSearch] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

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

  // Statistiques calculées à partir de l'ensemble des comptes utilisateurs.
  // Chargées une seule fois (pas en temps réel) pour limiter le nombre de
  // lectures Firestore facturées ; un rechargement de la page suffit pour
  // les rafraîchir.
  useEffect(() => {
    if (!isAdmin) return;
    getDocs(collection(db, "users"))
      .then((snap) => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfTodaySeconds = startOfToday.getTime() / 1000;

        let usersToday = 0;
        const promoUsage: Record<string, number> = {};

        snap.forEach((d) => {
          const data = d.data();
          const createdAtSeconds: number | undefined = data.createdAt?.seconds;
          if (createdAtSeconds && createdAtSeconds >= startOfTodaySeconds) usersToday += 1;
          const used: string[] = Array.isArray(data.usedPromoCodes) ? data.usedPromoCodes : [];
          used.forEach((code) => {
            promoUsage[code] = (promoUsage[code] || 0) + 1;
          });
        });

        let topPromoCode: string | null = null;
        let topPromoCodeCount = 0;
        Object.entries(promoUsage).forEach(([code, count]) => {
          if (count > topPromoCodeCount) {
            topPromoCode = code;
            topPromoCodeCount = count;
          }
        });

        setStats({ totalUsers: snap.size, usersToday, topPromoCode, topPromoCodeCount });
      })
      .catch((err) => console.error("Erreur de chargement des statistiques admin:", err))
      .finally(() => setStatsLoading(false));
  }, [isAdmin]);

  const filteredClaims = claims.filter((c) => {
    const q = claimSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      c.email?.toLowerCase().includes(q) ||
      (c.waveReference || "").toLowerCase().includes(q)
    );
  });

  const addPromo = async () => {
    if (!newCode.trim()) return;
    await setDoc(doc(db, "promoCodes", newCode.trim()), { actif: true });
    setNewCode("");
  };

  const togglePromo = async (code: string, actif: boolean) => {
    await setDoc(doc(db, "promoCodes", code), { actif: !actif }, { merge: true });
  };

  const removeClaim = async (id: string) => {
    await deleteDoc(doc(db, "paymentClaims", id));
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
      <h1 className="text-xl font-bold">Administration — MON CV PRO CI</h1>

      <section>
        <h2 className="text-sm font-semibold mb-3">Aperçu rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border p-3">
            <div className="flex items-center gap-1.5 text-foreground/50 text-[11px] mb-1">
              <Wallet size={13} /> Revenus estimés (30 derniers paiements)
            </div>
            <p className="text-lg font-bold">
              {statsLoading && claims.length === 0 ? "…" : `${(claims.length * PRICE).toLocaleString("fr-FR")} FCFA`}
            </p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <div className="flex items-center gap-1.5 text-foreground/50 text-[11px] mb-1">
              <Users size={13} /> Comptes créés
            </div>
            <p className="text-lg font-bold">
              {statsLoading ? "…" : stats?.totalUsers ?? 0}
              <span className="text-xs font-normal text-foreground/50 ml-1.5">
                dont {statsLoading ? "…" : stats?.usersToday ?? 0} aujourd&apos;hui
              </span>
            </p>
          </div>
          <div className="rounded-xl border border-border p-3">
            <div className="flex items-center gap-1.5 text-foreground/50 text-[11px] mb-1">
              <TicketPercent size={13} /> Code promo le plus utilisé
            </div>
            <p className="text-lg font-bold font-mono truncate">
              {statsLoading
                ? "…"
                : stats?.topPromoCode
                  ? `${stats.topPromoCode} (${stats.topPromoCodeCount})`
                  : "—"}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-1">Journal des paiements déclarés</h2>
        <div className="relative mb-2">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            value={claimSearch}
            onChange={(e) => setClaimSearch(e.target.value)}
            placeholder="Rechercher par email ou référence Wave (T_...)"
            className="w-full rounded-lg border border-border bg-surface pl-8 pr-3 py-2 text-xs"
          />
        </div>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {filteredClaims.length === 0 && (
            <p className="text-xs text-foreground/40">
              {claims.length === 0
                ? "Aucune déclaration de paiement pour le moment."
                : "Aucun résultat pour cette recherche."}
            </p>
          )}
          {filteredClaims.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs">
              <div>
                <p>{c.email}</p>
                {c.waveReference && <p className="text-foreground/40 font-mono text-[10px]">Réf : {c.waveReference}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-foreground/40">
                  {c.createdAt ? new Date(c.createdAt.seconds * 1000).toLocaleString("fr-FR") : ""}
                </span>
                <button onClick={() => removeClaim(c.id)} className="text-red-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
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
        <Phone size={12} /> Service client (WhatsApp, pas d&apos;appel) affiché aux utilisateurs : +225 05 45 17 75 71
      </section>
    </div>
  );
}
