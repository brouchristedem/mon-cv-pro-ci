"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveProgress: (cv: CVData) => Promise<void>;
  incrementDownloads: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadsUsed, setDownloadsUsed] = useState(0);
  const reset = useCVStore((s) => s.reset);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.cv) reset(data.cv as CVData);
          setDownloadsUsed(data.downloadsUsed || 0);
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
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [reset]);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(auth);
    reset(defaultCV());
  }, [reset]);

  const saveProgress = useCallback(
    async (cv: CVData) => {
      if (!user) return;
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, { cv, updatedAt: serverTimestamp() }, { merge: true });
    },
    [user]
  );

  const incrementDownloads = useCallback(async () => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const next = downloadsUsed + 1;
    setDownloadsUsed(next);
    await setDoc(ref, { downloadsUsed: next }, { merge: true });
  }, [user, downloadsUsed]);

  const isAdmin = !!user?.email && user.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        downloadsUsed,
        signInWithGoogle,
        signOut,
        saveProgress,
        incrementDownloads,
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
