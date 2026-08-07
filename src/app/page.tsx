"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Palette, Download, CheckCircle2 } from "lucide-react";
import TemplateGallery from "@/components/landing/TemplateGallery";
import FadeIn from "@/components/landing/FadeIn";
import { ENTRY_GATE_KEY } from "@/lib/entryGate";

export default function Home() {
  const ctaHref = "/editor";

  // Marque que la personne est bien passée par la page d'accueil : la page
  // éditeur exige cette marque (voir src/lib/entryGate.ts) pour empêcher un
  // accès direct à l'éditeur sans être d'abord passé par ici.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(ENTRY_GATE_KEY, "1");
    } catch {
      // sessionStorage indisponible (navigation privée stricte, etc.) : on
      // laisse simplement l'éditeur accessible sans bloquer la personne.
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border">
        <div className="flex items-center justify-between px-6 py-4 max-w-6xl w-full mx-auto">
          <span className="font-extrabold text-lg sm:text-xl tracking-wide">
            MON <span className="text-brand-600">CV PRO</span> CI
          </span>
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-foreground/70">
            <a href="#modeles" className="hover:text-foreground transition">
              Modèles
            </a>
            <a href="#tarifs" className="hover:text-foreground transition">
              Tarifs
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-14 pb-8 sm:pt-20 sm:pb-12">
        {/* Décor lumineux en fond */}
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-brand-600/10 blur-3xl pointer-events-none"
        />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-400 bg-brand-600/10 px-3 py-1.5 rounded-full mb-5">
              <Sparkles size={13} /> 15 modèles testés par des recruteurs ivoiriens
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] tracking-tight mb-5">
              Créez un CV professionnel qui{" "}
              <span className="text-brand-600">retient l&apos;attention</span> des recruteurs
            </h1>
            <p className="text-base sm:text-lg text-foreground/60 mb-6 max-w-md mx-auto lg:mx-0">
              15 modèles élégants, personnalisables en temps réel. Aucune compétence en design
              requise — créez, ajustez, téléchargez.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-8">
              <Link
                href={ctaHref}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-600 text-white px-7 py-3.5 text-base font-semibold shadow-lg shadow-brand-600/25 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 transition"
              >
                🚀 Je crée mon CV maintenant <ArrowRight size={18} />
              </Link>
              <a
                href="#modeles"
                className="w-full sm:w-auto flex items-center justify-center rounded-xl border border-border px-7 py-3.5 text-base font-medium hover:bg-surface-muted transition"
              >
                Voir les modèles
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-center text-xs sm:text-sm text-foreground/60">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-brand-600" /> Téléchargement à 1000 FCFA
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-brand-600" /> Paiement via Wave
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Galerie de modèles */}
      <section id="modeles" className="px-6 py-16 sm:py-20 bg-surface-muted/40 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">15 modèles, un pour chaque profil</h2>
            <p className="text-foreground/60 max-w-lg mx-auto">
              Parcourez la galerie et choisissez le style qui vous ressemble. Vous pourrez en changer
              à tout moment dans l&apos;éditeur.
            </p>
          </FadeIn>
          <FadeIn delay={100}>
            <TemplateGallery />
          </FadeIn>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8 sm:gap-10 text-center sm:text-left">
          <FadeIn>
            <Sparkles className="text-brand-600 mb-3 mx-auto sm:mx-0" size={24} />
            <h3 className="font-semibold mb-1.5">15 modèles distincts</h3>
            <p className="text-sm text-foreground/60">
              Des designs prisés par les recruteurs internationaux, pour tous les secteurs.
            </p>
          </FadeIn>
          <FadeIn delay={100}>
            <Palette className="text-brand-600 mb-3 mx-auto sm:mx-0" size={24} />
            <h3 className="font-semibold mb-1.5">Personnalisation totale</h3>
            <p className="text-sm text-foreground/60">
              Couleurs, rubriques, mise en page — tout est ajustable en quelques clics.
            </p>
          </FadeIn>
          <FadeIn delay={200}>
            <Download className="text-brand-600 mb-3 mx-auto sm:mx-0" size={24} />
            <h3 className="font-semibold mb-1.5">Aperçu en temps réel</h3>
            <p className="text-sm text-foreground/60">
              Voyez chaque changement instantanément avant de télécharger votre CV.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Comment ça marche</h2>
            <p className="text-foreground/60 max-w-lg mx-auto">
              Trois étapes, sans compte requis pour commencer.
            </p>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            <FadeIn className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="font-semibold mb-1.5">Remplis ton CV</h3>
              <p className="text-sm text-foreground/60">
                Renseigne tes informations dans l&apos;éditeur, section par section.
              </p>
            </FadeIn>
            <FadeIn delay={100} className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="font-semibold mb-1.5">Choisis ton modèle</h3>
              <p className="text-sm text-foreground/60">
                Change de modèle et de couleur à tout moment, en aperçu direct.
              </p>
            </FadeIn>
            <FadeIn delay={200} className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="font-semibold mb-1.5">Paie par Wave et télécharge</h3>
              <p className="text-sm text-foreground/60">
                1 000 FCFA via Wave, puis ton CV en PDF est prêt immédiatement.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="px-6 py-16 sm:py-20">
        <FadeIn className="max-w-md mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Un tarif simple et local</h2>
          <p className="text-foreground/60 mb-8">
            Payez facilement par Wave, sans carte bancaire ni abonnement.
          </p>
          <div className="rounded-2xl border border-border bg-surface p-8">
            <p className="text-sm text-foreground/50 mb-1">Prix unique</p>
            <p className="text-4xl font-extrabold text-accent-600 mb-6">1000 FCFA</p>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 pb-24 sm:pb-8 text-center text-xs text-foreground/50">
        <p className="font-semibold text-foreground/70 mb-1">MON CV PRO CI</p>
        <p className="mb-1">Assistance : +225 05 45 17 75 71</p>
        <p>Vos données restent confidentielles. Pas d&apos;abonnement caché.</p>
      </footer>

      {/* CTA sticky mobile */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 p-3 bg-background/95 backdrop-blur border-t border-border">
        <Link
          href={ctaHref}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 text-white px-5 py-3.5 text-sm font-semibold shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition"
        >
          Créer mon CV — 1 000 FCFA <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
