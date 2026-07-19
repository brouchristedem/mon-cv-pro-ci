import Link from "next/link";
import { ArrowRight, Sparkles, Palette, Download } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl w-full mx-auto">
        <span className="font-bold">Mon CV Pro CI</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
          Créez un CV professionnel qui retient l&apos;attention des recruteurs
        </h1>
        <p className="text-foreground/60 mb-3">
          15 modèles élégants, personnalisables en temps réel.
        </p>
        <p className="text-sm font-medium mb-8 px-4 py-2 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-400">
          1er CV téléchargé gratuitement — les suivants à 500 FCFA via Wave
        </p>
        <Link
          href="/login"
          className="flex items-center gap-2 rounded-xl bg-blue-600 text-white px-6 py-3 font-medium hover:bg-blue-700 transition"
        >
          Créer mon CV <ArrowRight size={16} />
        </Link>

        <div className="grid sm:grid-cols-3 gap-6 mt-16 text-left">
          <div>
            <Sparkles className="text-blue-600 mb-2" size={20} />
            <h3 className="font-semibold text-sm mb-1">15 modèles distincts</h3>
            <p className="text-xs text-foreground/60">Des designs prisés par les recruteurs internationaux.</p>
          </div>
          <div>
            <Palette className="text-blue-600 mb-2" size={20} />
            <h3 className="font-semibold text-sm mb-1">Personnalisation totale</h3>
            <p className="text-xs text-foreground/60">Couleurs, rubriques, mise en page — tout est ajustable.</p>
          </div>
          <div>
            <Download className="text-blue-600 mb-2" size={20} />
            <h3 className="font-semibold text-sm mb-1">Aperçu en temps réel</h3>
            <p className="text-xs text-foreground/60">Voyez chaque changement instantanément avant de télécharger.</p>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-foreground/40 py-6">
        Mon CV Pro CI — Abidjan, Côte d&apos;Ivoire
      </footer>
    </div>
  );
}
