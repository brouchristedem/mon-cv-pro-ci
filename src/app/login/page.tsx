"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, authError } =
    useAuth();
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!loading && user) router.replace("/editor");
  }, [loading, user, router]);

  const displayError = error || authError;

  useEffect(() => {
    if (!connecting) return;
    const t = setTimeout(() => {
      setConnecting(false);
      setError(
        "La connexion prend trop de temps. Vérifiez votre connexion internet et réessayez. Si le problème persiste, essayez de fermer complètement votre navigateur puis de rouvrir le site."
      );
    }, 10000);
    return () => clearTimeout(t);
  }, [connecting]);

  const handleGoogleClick = async () => {
    setError("");
    setInfo("");
    setConnecting(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setConnecting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setConnecting(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setConnecting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setInfo("");
    if (!email) {
      setError("Entrez d'abord votre adresse email ci-dessus, puis cliquez à nouveau.");
      return;
    }
    try {
      await resetPassword(email);
      setInfo("Un email pour réinitialiser votre mot de passe a été envoyé. Vérifiez votre boîte de réception.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center">
      <h1 className="text-2xl font-extrabold mb-2 uppercase tracking-wide">CV Pro CI</h1>
      <p className="text-sm text-foreground/60 mb-8 max-w-sm">
        Connectez-vous pour créer votre CV et retrouver votre progression à chaque visite.
      </p>

      <button
        onClick={handleGoogleClick}
        disabled={connecting}
        className="flex items-center gap-3 rounded-xl border border-border bg-surface px-6 py-3 font-medium hover:bg-surface-muted transition disabled:opacity-60 w-full max-w-sm justify-center"
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

      <div className="flex items-center gap-3 w-full max-w-sm my-6">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-foreground/40">ou</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleEmailSubmit} className="w-full max-w-sm flex flex-col gap-3 text-left">
        <input
          type="email"
          required
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Mot de passe (6 caractères minimum)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="rounded-xl border border-border bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={connecting}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition disabled:opacity-60"
        >
          {connecting
            ? "Connexion en cours..."
            : mode === "signup"
              ? "Créer mon compte"
              : "Se connecter"}
        </button>

        {mode === "signin" && (
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-xs text-foreground/50 hover:text-foreground/80 underline self-center"
          >
            Mot de passe oublié ?
          </button>
        )}
      </form>

      <p className="text-xs text-foreground/60 mt-5">
        {mode === "signin" ? "Pas encore de compte ?" : "Vous avez déjà un compte ?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError("");
            setInfo("");
          }}
          className="text-blue-600 font-medium hover:underline"
        >
          {mode === "signin" ? "Créer un compte" : "Se connecter"}
        </button>
      </p>

      {info && (
        <div className="mt-6 max-w-sm rounded-lg border border-green-300 bg-green-50 p-3 text-left">
          <p className="text-[11px] text-green-700">{info}</p>
        </div>
      )}

      {displayError && (
        <div className="mt-6 max-w-sm rounded-lg border border-red-300 bg-red-50 p-3 text-left">
          <p className="text-xs font-medium text-red-700">Erreur détectée :</p>
          <p className="text-[11px] text-red-600 mt-1 break-words">{displayError}</p>
        </div>
      )}
    </div>
  );
}
