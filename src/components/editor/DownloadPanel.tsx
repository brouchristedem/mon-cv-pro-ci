"use client";

import { useState, useEffect } from "react";
import { useCVStore } from "@/lib/store";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { Download, Loader2, CheckCircle2, ExternalLink, AlertCircle } from "lucide-react";
import { UI } from "@/lib/i18n";

const WAVE_LINK = process.env.NEXT_PUBLIC_WAVE_LINK || "#";

export default function DownloadPanel() {
  const { user, downloadsUsed, incrementDownloads } = useAuth();
  const cv = useCVStore((s) => s.cv);
  const t = UI[cv.langue];
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [price, setPrice] = useState(500);
  const [generating, setGenerating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<"en_attente" | "valide" | null>(null);
  const [unlockError, setUnlockError] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  const isFree = downloadsUsed === 0;

  useEffect(() => {
    getDoc(doc(db, "settings", "general"))
      .then((snap) => {
        if (snap.exists() && snap.data().prix) setPrice(snap.data().prix);
      })
      .catch((err) => console.error("Erreur de lecture du prix:", err));
  }, []);

  useEffect(() => {
    if (!pendingId) return;
    const unsub = onSnapshot(
      doc(db, "paymentRequests", pendingId),
      (snap) => {
        if (snap.exists()) {
          setPendingStatus(snap.data().statut);
        }
      },
      (err) => {
        console.error("Erreur de suivi du paiement:", err);
        setUnlockError(t.genericError);
      }
    );
    return () => unsub();
  }, [pendingId, t.genericError]);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      window.print();
      await incrementDownloads();
      setPendingId(null);
      setPendingStatus(null);
    } finally {
      setGenerating(false);
    }
  };

  const checkPromo = async () => {
    setPromoError("");
    if (!promoCode.trim()) return;
    try {
      const snap = await getDoc(doc(db, "promoCodes", promoCode.trim().toUpperCase()));
      if (snap.exists() && snap.data().actif) {
        await generatePDF();
      } else {
        setPromoError(t.promoInvalid);
      }
    } catch (err) {
      console.error("Erreur code promo:", err);
      setPromoError(t.genericError);
    }
  };

  const requestPayment = async () => {
    if (!user) return;
    setUnlockError("");
    setUnlocking(true);
    try {
      const ref = await addDoc(collection(db, "paymentRequests"), {
        userId: user.uid,
        email: user.email,
        montant: price,
        statut: "en_attente",
        createdAt: serverTimestamp(),
      });
      setPendingId(ref.id);
      setPendingStatus("en_attente");
    } catch (err: unknown) {
      console.error("Erreur lors de la demande de paiement:", err);
      const message = err instanceof Error ? err.message : String(err);
      setUnlockError(message || t.genericError);
    } finally {
      setUnlocking(false);
    }
  };

  if (isFree) {
    return (
      <button
        onClick={generatePDF}
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition disabled:opacity-60"
      >
        {generating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
        {t.downloadFree}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder={t.promoCode}
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={checkPromo}
          className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-surface-muted transition"
        >
          {t.apply}
        </button>
      </div>
      {promoError && <p className="text-xs text-red-500">{promoError}</p>}

      {pendingStatus === "valide" ? (
        <button
          onClick={generatePDF}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium py-3 transition"
        >
          {generating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
          {t.paymentValidated}
        </button>
      ) : pendingStatus === "en_attente" ? (
        <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs space-y-2">
          <p>{t.paymentPending}</p>
          <a
            href={WAVE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline"
          >
            {t.payWithWave} {price} FCFA {t.payWithWaveSuffix} <ExternalLink size={12} />
          </a>
        </div>
      ) : (
        <button
          onClick={requestPayment}
          disabled={unlocking}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 transition disabled:opacity-60"
        >
          {unlocking && <Loader2 className="animate-spin" size={16} />}
          {t.unlockDownload} {price} FCFA {t.viaWave}
        </button>
      )}
      {unlockError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-2.5 text-xs text-red-700">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span className="break-words">{unlockError}</span>
        </div>
      )}
    </div>
  );
}
