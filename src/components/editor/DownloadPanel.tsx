"use client";

import { useState, useEffect } from "react";
import { useCVStore } from "@/lib/store";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Download, Loader2, CheckCircle2, ExternalLink, AlertCircle, Phone } from "lucide-react";
import { UI } from "@/lib/i18n";

const WAVE_LINK = process.env.NEXT_PUBLIC_WAVE_LINK || "#";
const SUPPORT_PHONE = "+225 05 45 17 57 71";

export default function DownloadPanel() {
  const { user, downloadsUsed, paidUnlocked, incrementDownloads, confirmPaidDownload } = useAuth();
  const cv = useCVStore((s) => s.cv);
  const t = UI[cv.langue];
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [price, setPrice] = useState(500);
  const [generating, setGenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmContext, setConfirmContext] = useState<"free" | "paid">("free");
  const [unlockError, setUnlockError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [waveReference, setWaveReference] = useState("");

  const isFree = downloadsUsed === 0;
  const canDownload = isFree || paidUnlocked || promoApplied;

  useEffect(() => {
    getDoc(doc(db, "settings", "general"))
      .then((snap) => {
        if (snap.exists() && snap.data().prix) setPrice(snap.data().prix);
      })
      .catch((err) => console.error("Erreur de lecture du prix:", err));
  }, []);

  const openConfirm = (context: "free" | "paid") => {
    setConfirmContext(context);
    setConfirmOpen(true);
  };

  const proceedDownload = async () => {
    setGenerating(true);
    try {
      window.print();
      await incrementDownloads();
      setPromoApplied(false);
      setConfirmOpen(false);
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
        setPromoApplied(true);
      } else {
        setPromoError(t.promoInvalid);
      }
    } catch (err) {
      console.error("Erreur code promo:", err);
      setPromoError(t.genericError);
    }
  };

  const handlePaidConfirmClick = async () => {
    if (!user) return;
    setUnlockError("");
    if (!waveReference.trim()) {
      setUnlockError(t.waveReferenceRequired);
      return;
    }
    setConfirming(true);
    try {
      await confirmPaidDownload(waveReference.trim());
    } catch (err: unknown) {
      console.error("Erreur de confirmation de paiement:", err);
      const message = err instanceof Error ? err.message : String(err);
      setUnlockError(message || t.genericError);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-3">
      {canDownload ? (
        <button
          onClick={() => openConfirm(isFree ? "free" : "paid")}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition"
        >
          <Download size={18} />
          {isFree ? t.downloadFree : t.paymentValidated}
        </button>
      ) : (
        <>
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

          <div className="rounded-xl border border-border p-3 text-xs space-y-2">
            <a
              href={WAVE_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-blue-600 font-medium hover:underline"
            >
              {t.payWithWave} {price} FCFA {t.payWithWaveSuffix} <ExternalLink size={12} />
            </a>
            <div>
              <label className="text-[11px] text-foreground/60 block mb-1">{t.waveReferenceLabel}</label>
              <input
                value={waveReference}
                onChange={(e) => setWaveReference(e.target.value)}
                placeholder={t.waveReferencePlaceholder}
                className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none"
              />
            </div>
            <button
              onClick={handlePaidConfirmClick}
              disabled={confirming}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 transition disabled:opacity-60"
            >
              {confirming ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              {t.paidConfirm}
            </button>
          </div>

          <p className="text-[11px] text-foreground/50 flex items-center gap-1.5">
            <Phone size={12} /> {t.customerService} {SUPPORT_PHONE}
          </p>
        </>
      )}

      {unlockError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-2.5 text-xs text-red-700">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span className="break-words">{unlockError}</span>
        </div>
      )}

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => !generating && setConfirmOpen(false)}
        >
          <div
            className="bg-surface rounded-xl max-w-sm w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold mb-2">{t.confirmTitle}</h3>
            <p className="text-xs text-foreground/70 mb-2">
              {confirmContext === "free" ? t.confirmFreeText : t.confirmPaidText}
            </p>
            <p className="text-xs text-amber-600 font-medium mb-4">{t.confirmWarning}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={generating}
                className="flex-1 py-2 rounded-lg border border-border text-sm hover:bg-surface-muted transition disabled:opacity-50"
              >
                {t.confirmCancel}
              </button>
              <button
                onClick={proceedDownload}
                disabled={generating}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
              >
                {generating && <Loader2 className="animate-spin" size={14} />}
                {t.confirmProceed}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
