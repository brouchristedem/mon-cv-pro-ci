"use client";

import { useEffect, useState } from "react";
import { useCVStore } from "@/lib/store";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Download, Loader2, CheckCircle2, ExternalLink, AlertCircle, MessageCircle, Info } from "lucide-react";
import { UI } from "@/lib/i18n";

const WAVE_LINK_FIRST = process.env.NEXT_PUBLIC_WAVE_LINK_FIRST || "#";
const PRICE_FIRST = Number(process.env.NEXT_PUBLIC_PRICE_FIRST || 500);
const WAVE_LINK_NEXT = process.env.NEXT_PUBLIC_WAVE_LINK_NEXT || "#";
const PRICE_NEXT = Number(process.env.NEXT_PUBLIC_PRICE_NEXT || 1000);
const SUPPORT_WHATSAPP_NUMBER = "2250545177571"; // format international sans "+" ni espaces, pour le lien wa.me
const SUPPORT_PHONE_DISPLAY = "+225 05 45 17 75 71";

export default function DownloadPanel() {
  const { user, downloadsUsed, paidUnlocked, incrementDownloads, confirmPaidDownload } = useAuth();
  const cv = useCVStore((s) => s.cv);
  const t = UI[cv.langue];
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [waveReference, setWaveReference] = useState("");
  const [waveClicked, setWaveClicked] = useState(false);
  const [isIOSSafari, setIsIOSSafari] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
    setIsIOSSafari(isIOS && isSafari);
  }, []);

  const isFirstDownload = downloadsUsed === 0;
  const price = isFirstDownload ? PRICE_FIRST : PRICE_NEXT;
  const waveLink = isFirstDownload ? WAVE_LINK_FIRST : WAVE_LINK_NEXT;
  const canDownload = paidUnlocked || promoApplied;

  // Méthode unique de téléchargement, utilisée sur tous les navigateurs et
  // systèmes : on génère un vrai fichier PDF (html2canvas-pro + jsPDF) à
  // partir de la zone dédiée #cv-capture-area plutôt que de s'appuyer sur
  // la boîte de dialogue d'impression du navigateur (window.print()), dont
  // le comportement de pagination s'est révélé incohérent d'un moteur à
  // l'autre (coupures/chevauchements de texte en bas de page). Pour éviter
  // qu'une rubrique ou une entrée du CV ne soit coupée en plein milieu par
  // une page, on ne découpe jamais à une hauteur de page fixe : on repère
  // d'abord la position réelle (bas) de chaque bloc marqué
  // "break-inside-avoid" dans le DOM, puis chaque saut de page choisit la
  // limite valide la plus proche sans jamais trancher un bloc protégé (sauf
  // si un seul bloc est plus grand qu'une page entière, cas limite
  // inévitable). html2canvas-pro (plutôt que html2canvas) est nécessaire
  // car Tailwind v4 génère ses couleurs avec des fonctions CSS modernes
  // (oklch/lab) que html2canvas classique ne sait pas interpréter et qui
  // faisaient échouer la génération, en particulier sur iPhone/Safari.
  const generatePdf = async () => {
    setDownloadError("");
    setGenerating(true);
    try {
      const node = document.getElementById("cv-capture-area");
      if (!node) throw new Error("Zone de capture introuvable");

      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);

      // Positions (en px CSS, relatives au haut de la zone capturée) du bas
      // de chaque bloc protégé : ce sont les seuls points où l'on a le
      // droit de couper une page.
      const protectedEls = Array.from(node.querySelectorAll<HTMLElement>(".break-inside-avoid"));
      const nodeTop = node.getBoundingClientRect().top;
      const safeBoundariesCss = protectedEls
        .map((el) => el.getBoundingClientRect().bottom - nodeTop)
        .filter((v) => v > 0)
        .sort((a, b) => a - b);

      const canvas = await html2canvas(node, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: node.scrollWidth,
        windowHeight: node.scrollHeight,
      });

      const pageWidthMm = 210;
      const pageHeightMm = 297;
      const pxPerMm = canvas.width / pageWidthMm;
      const pageHeightPx = Math.floor(pageHeightMm * pxPerMm);
      const cssToCanvasScale = canvas.width / node.offsetWidth;
      const safeBoundariesPx = safeBoundariesCss.map((v) => v * cssToCanvasScale);

      const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
      let renderedPx = 0;
      let firstPage = true;

      while (renderedPx < canvas.height) {
        const remaining = canvas.height - renderedPx;
        let sliceHeightPx = Math.min(pageHeightPx, remaining);

        if (remaining > pageHeightPx) {
          // On cherche la dernière limite "sûre" qui tient dans la page
          // courante ; si on en trouve une (strictement après le début de
          // la page), on coupe là plutôt qu'à la hauteur de page brute.
          const target = renderedPx + pageHeightPx;
          let bestCut = -1;
          for (const b of safeBoundariesPx) {
            if (b > renderedPx && b <= target) bestCut = b;
            if (b > target) break;
          }
          if (bestCut > renderedPx) {
            sliceHeightPx = Math.floor(bestCut - renderedPx);
          }
        }

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;
        const ctx = pageCanvas.getContext("2d");
        if (!ctx) throw new Error("Contexte canvas indisponible");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

        const sliceData = pageCanvas.toDataURL("image/jpeg", 0.95);
        if (!firstPage) pdf.addPage();
        pdf.addImage(sliceData, "JPEG", 0, 0, pageWidthMm, sliceHeightPx / pxPerMm);

        renderedPx += sliceHeightPx;
        firstPage = false;
      }

      const nomFichier =
        [cv.personalInfo?.prenom, cv.personalInfo?.nom]
          .filter(Boolean)
          .join("_")
          .replace(/[^a-zA-Z0-9_-]/g, "") || "CV";

      if (isIOSSafari) {
        // iOS Safari ne déclenche pas de façon fiable le téléchargement
        // automatique (attribut "download") : on ouvre le PDF dans un
        // nouvel onglet via une URL blob, l'utilisateur l'enregistre alors
        // via le bouton de partage du lecteur PDF natif de Safari.
        const blobUrl = pdf.output("bloburl");
        const opened = window.open(blobUrl as unknown as string, "_blank");
        if (!opened) pdf.save(`${nomFichier}.pdf`);
      } else {
        pdf.save(`${nomFichier}.pdf`);
      }

      try {
        await incrementDownloads();
      } catch (err) {
        console.error("Erreur lors de l'enregistrement du téléchargement:", err);
      }
      setPromoApplied(false);
      setWaveClicked(false);
      setWaveReference("");
    } catch (err) {
      console.error("Erreur de génération du PDF:", err);
      const detail = err instanceof Error ? ` (${err.message})` : "";
      setDownloadError(t.downloadFailed + detail);
    } finally {
      setGenerating(false);
    }
  };

  const proceedDownload = () => {
    generatePdf();
  };

  const checkPromo = async () => {
    setPromoError("");
    if (!promoCode.trim()) return;
    try {
      const snap = await getDoc(doc(db, "promoCodes", promoCode.trim()));
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

  const isPlausibleWaveReference = (value: string) => {
    const v = value.trim().toUpperCase();
    return /^T_[A-Z0-9]{16}$/.test(v);
  };

  const handlePaidConfirmClick = async () => {
    if (!user) return;
    setUnlockError("");
    if (!waveReference.trim()) {
      setUnlockError(t.waveReferenceRequired);
      return;
    }
    if (!isPlausibleWaveReference(waveReference)) {
      setUnlockError(t.waveReferenceInvalid);
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

  const statusMessage = promoApplied ? t.statusPromo : paidUnlocked ? t.statusPaid : null;

  return (
    <div className="space-y-3">
      {statusMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2.5 text-xs text-blue-700">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      {canDownload ? (
        <>
          <p className="text-[11px] text-amber-600 font-medium">{t.downloadWarning}</p>
          <button
            onClick={proceedDownload}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition disabled:opacity-60"
          >
            {generating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            {t.downloadCta}
          </button>
          {isIOSSafari && (
            <p className="text-[11px] text-foreground/50">{t.iosPrintHint}</p>
          )}
        </>
      ) : (
        <>
          <p className="text-xs text-foreground/60">
            {isFirstDownload ? t.firstDownloadInfo : t.nextDownloadInfo}
          </p>

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

          <div className="rounded-xl border border-border p-3 text-xs space-y-3">
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-amber-700">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{t.beforePayWarning}</span>
            </div>

            <a
              href={waveLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setWaveClicked(true)}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#1DC8CD] hover:opacity-90 text-white font-semibold py-3 text-sm transition"
            >
              {t.payWithWave} {price} FCFA {t.payWithWaveSuffix} <ExternalLink size={14} />
            </a>

            {waveClicked && (
              <div className="space-y-2 pt-1 border-t border-border">
                <div>
                  <label className="text-[11px] text-foreground/60 block mb-1">{t.waveReferenceLabel}</label>
                  <input
                    value={waveReference}
                    onChange={(e) => setWaveReference(e.target.value)}
                    placeholder={t.waveReferencePlaceholder}
                    className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>
                <p className="text-[11px] text-amber-600">{t.paidFlowWarning}</p>
                <button
                  onClick={handlePaidConfirmClick}
                  disabled={confirming}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 transition disabled:opacity-60"
                >
                  {confirming ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  {t.paidConfirm}
                </button>
              </div>
            )}
          </div>

          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-foreground/50 flex items-center gap-1.5 hover:text-foreground/80 transition"
          >
            <MessageCircle size={12} /> {t.customerService} {SUPPORT_PHONE_DISPLAY}
          </a>
        </>
      )}

      {(unlockError || downloadError) && (
        <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-2.5 text-xs text-red-700">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span className="break-words">{unlockError || downloadError}</span>
        </div>
      )}
    </div>
  );
}
