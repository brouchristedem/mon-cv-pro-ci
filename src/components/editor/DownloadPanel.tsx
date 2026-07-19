"use client";

import { useState, useEffect } from "react";
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
import { Download, Loader2, CheckCircle2, ExternalLink } from "lucide-react";

const WAVE_LINK = process.env.NEXT_PUBLIC_WAVE_LINK || "#";

export default function DownloadPanel() {
  const { user, downloadsUsed, incrementDownloads } = useAuth();
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [price, setPrice] = useState(500);
  const [generating, setGenerating] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<"en_attente" | "valide" | null>(null);
  const [showWave, setShowWave] = useState(false);

  const isFree = downloadsUsed === 0;

  useEffect(() => {
    getDoc(doc(db, "settings", "general")).then((snap) => {
      if (snap.exists() && snap.data().prix) setPrice(snap.data().prix);
    });
  }, []);

  useEffect(() => {
    if (!pendingId) return;
    const unsub = onSnapshot(doc(db, "paymentRequests", pendingId), (snap) => {
      if (snap.exists()) {
        setPendingStatus(snap.data().statut);
      }
    });
    return () => unsub();
  }, [pendingId]);

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
    const snap = await getDoc(doc(db, "promoCodes", promoCode.trim().toUpperCase()));
    if (snap.exists() && snap.data().actif) {
      await generatePDF();
    } else {
      setPromoError("Code promo invalide ou expiré.");
    }
  };

  const requestPayment = async () => {
    if (!user) return;
    const ref = await addDoc(collection(db, "paymentRequests"), {
      userId: user.uid,
      email: user.email,
      montant: price,
      statut: "en_attente",
      createdAt: serverTimestamp(),
    });
    setPendingId(ref.id);
    setPendingStatus("en_attente");
    setShowWave(true);
  };

  if (isFree) {
    return (
      <button
        onClick={generatePDF}
        disabled={generating}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition disabled:opacity-60"
      >
        {generating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
        Télécharger mon CV (1er téléchargement gratuit)
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="Code promo"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none"
        />
        <button
          onClick={checkPromo}
          className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-surface-muted transition"
        >
          Appliquer
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
          Paiement validé — Télécharger le PDF
        </button>
      ) : pendingStatus === "en_attente" ? (
        <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-xs space-y-2">
          <p>
            Paiement en attente de validation. Après votre paiement Wave, cela peut prendre
            quelques minutes le temps que ce soit vérifié.
          </p>
          <a
            href={WAVE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline"
          >
            Payer {price} FCFA via Wave <ExternalLink size={12} />
          </a>
        </div>
      ) : (
        <button
          onClick={requestPayment}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 transition"
        >
          Débloquer ce téléchargement — {price} FCFA via Wave
        </button>
      )}
    </div>
  );
}
