"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const { user, loading, signInWithGoogle, authError } = useAuth();
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/editor");
  }, [loading, user, router]);

  const displayError = error || authError;

  const handleClick = async () => {
    setError("");
    setConnecting(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-bold mb-2">Mon CV Pro CI</h1>
      <p className="text-sm text-foreground/60 mb-8 max-w-sm">
        Connectez-vous avec Google pour créer votre CV et retrouver votre progression à chaque
        visite.
      </p>
      <button
        onClick={handleClick}
        disabled={connecting}
        className="flex items-center gap-3 rounded-xl border border-border bg-surface px-6 py-3 font-medium hover:bg-surface-muted transition disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path
            fill="#FFC107"
            d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"
          />
          <path
            fill="#FF3D00"
            d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"
          />
          <path
            fill="#4CAF50"
            d="M24 45c5.5 0 10.4-1.8 14.3-5l-6.6-5.4C29.6 36.5 27 37 24 37c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 40.6 16.3 45 24 45z"
          />
          <path
            fill="#1976D2"
            d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.6 5.4C41.5 35.9 44 30.5 44 24c0-1.4-.1-2.7-.4-3.5z"
          />
        </svg>
        {connecting ? "Connexion en cours..." : "Continuer avec Google"}
      </button>
      {displayError && (
        <div className="mt-6 max-w-sm rounded-lg border border-red-300 bg-red-50 p-3 text-left">
          <p className="text-xs font-medium text-red-700">Erreur détectée :</p>
          <p className="text-[11px] text-red-600 mt-1 break-words">{displayError}</p>
        </div>
      )}
    </div>
  );
}

