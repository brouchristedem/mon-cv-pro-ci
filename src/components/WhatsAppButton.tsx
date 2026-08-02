"use client";

// Bouton flottant vers WhatsApp, affiché sur tout le site pour un accès
// rapide au support (canal le plus utilisé par nos utilisateurs).
const WHATSAPP_NUMBER = "2250545177571"; // +225 05 45 17 75 71
const DEFAULT_MESSAGE = "Bonjour, j'ai besoin d'aide avec MON CV PRO CI.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter le support par WhatsApp"
      title="Besoin d'aide ? Écrivez-nous sur WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-transform print:hidden"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.05 2C6.526 2 2.05 6.477 2.05 12c0 1.892.526 3.66 1.44 5.168L2 22l4.958-1.454A9.95 9.95 0 0 0 12.05 22c5.523 0 10-4.477 10-10S17.573 2 12.05 2zm0 18.18a8.16 8.16 0 0 1-4.166-1.14l-.299-.177-3.023.887.9-2.95-.194-.302A8.15 8.15 0 0 1 3.85 12c0-4.522 3.678-8.2 8.2-8.2 4.523 0 8.2 3.678 8.2 8.2 0 4.523-3.677 8.18-8.2 8.18z" />
      </svg>
    </a>
  );
}
