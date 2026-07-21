"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";
import { useCVStore, defaultCV } from "./store";
import { CVData } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  downloadsUsed: number;
  paidUnlocked: boolean;
  authError: string;
  loadError: string;
  debugInfo: string;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveProgress: (cv: CVData) => Promise<void>;
  incrementDownloads: () => Promise<void>;
  confirmPaidDownload: (waveReference: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadsUsed, setDownloadsUsed] = useState(0);
  const [paidUnlocked, setPaidUnlocked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const reset = useCVStore((s) => s.reset);

  useEffect(() => {
    // Récupère le résultat d'une éventuelle redirection Google en cours,
    // pour éviter de rester bloqué si l'utilisateur revient d'un rechargement.
    getRedirectResult(auth).catch((err) => {
      console.error("Erreur de redirection Google:", err);
      setAuthError(err?.message || String(err));
    });

    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        setLoadError("");
        if (u) {
          setDebugInfo(`uid=${u.uid.slice(0, 8)}... | lecture en cours...`);
          const ref = doc(db, "users", u.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            if (data.cv) reset(data.cv as CVData);
            setDownloadsUsed(data.downloadsUsed || 0);
            setPaidUnlocked(!!data.paidUnlocked);
            setDebugInfo(
              `uid=${u.uid.slice(0, 8)}... | document trouvé | téléchargements=${data.downloadsUsed || 0} | prénom sauvegardé="${data.cv?.personalInfo?.prenom || ""}"`
            );
          } else {
            const fresh = defaultCV();
            await setDoc(ref, {
              email: u.email,
              displayName: u.displayName,
              downloadsUsed: 0,
              cv: fresh,
              createdAt: serverTimestamp(),
            });
            reset(fresh);
            setDebugInfo(`uid=${u.uid.slice(0, 8)}... | AUCUN document trouvé, nouveau profil créé`);
          }
        } else {
          setDebugInfo("Aucun utilisateur connecté");
        }
      } catch (err: unknown) {
        console.error("Erreur lors du chargement du profil:", err);
        const message = err instanceof Error ? err.message : String(err);
        setLoadError(message);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [reset]);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const code = (err as { code?: string })?.code || "";
      // Si la popup est bloquée, fermée, ou non supportée, on bascule sur la redirection.
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(auth);
    reset(defaultCV());
  }, [reset]);

  const saveProgress = useCallback(
    async (cv: CVData) => {
      if (!user) {
        throw new Error("Sauvegarde impossible : aucun utilisateur connecté (session perdue).");
      }
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, { cv, updatedAt: serverTimestamp() }, { merge: true });
      // Vérification immédiate : on relit ce qui a vraiment été écrit côté serveur,
      // pour être certain que la sauvegarde a réellement pris effet.
      const verify = await getDoc(ref);
      const savedPrenom = verify.exists() ? verify.data()?.cv?.personalInfo?.prenom : undefined;
      setDebugInfo(
        `Dernière écriture vérifiée à ${new Date().toLocaleTimeString("fr-FR")} | prénom confirmé sur le serveur = "${savedPrenom ?? "ERREUR: absent"}"`
      );
    },
    [user]
  );

  const incrementDownloads = useCallback(async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const next = downloadsUsed + 1;
    setDownloadsUsed(next);
    setPaidUnlocked(false);
    await setDoc(ref, { downloadsUsed: next, paidUnlocked: false }, { merge: true });
  }, [user, downloadsUsed]);

  const confirmPaidDownload = useCallback(
    async (waveReference: string) => {
      if (!user) return;
      const existing = await getDocs(
        query(collection(db, "paymentClaims"), where("waveReference", "==", waveReference))
      );
      if (!existing.empty) {
        throw new Error(
          "Cette référence a déjà été utilisée pour un autre téléchargement. Vérifiez le numéro affiché par Wave après votre paiement."
        );
      }
      setPaidUnlocked(true);
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, { paidUnlocked: true, lastWaveReference: waveReference }, { merge: true });
      try {
        await addDoc(collection(db, "paymentClaims"), {
          userId: user.uid,
          email: user.email,
          waveReference,
          createdAt: serverTimestamp(),
        });
      } catch {
        // non bloquant
      }
    },
    [user]
  );

  const isAdmin = !!user?.email && user.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        downloadsUsed,
        paidUnlocked,
        authError,
        loadError,
        debugInfo,
        signInWithGoogle,
        signOut,
        saveProgress,
        incrementDownloads,
        confirmPaidDownload,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
