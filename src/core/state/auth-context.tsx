"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  type User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/services/firebase/config";
import { AuthContextType, UserData } from "@/core/types";
import { handleError } from "@/core/utils";

/**
 * Contexto de autenticação
 *
 * Este contexto gerencia o estado de autenticação do usuário,
 * fornecendo funções para login, logout e acesso aos dados do usuário.
 */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para criar ou atualizar dados do usuário no Firestore
  const createOrUpdateUserData = useCallback(async (currentUser: User) => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      // Se não existir, criar um novo documento para o usuário
      if (!userSnap.exists()) {
        const newUserData: UserData = {
          email: currentUser.email,
          displayName: currentUser.displayName,
          portfolio: {},
          watchlist: {},
          preferences: {
            theme: "dark",
          },
        };

        await setDoc(userRef, newUserData);
        return newUserData;
      }

      return userSnap.data() as UserData;
    } catch (err) {
      console.error("Erro ao criar/atualizar dados do usuário:", err);
      throw handleError(err);
    }
  }, []);

  // Efeito para monitorar mudanças no estado de autenticação
  useEffect(() => {
    // Usar uma variável para controlar se o componente ainda está montado
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth!, async (currentUser) => {
      try {
        if (!isMounted) return;

        if (currentUser) {
          setUser(currentUser);

          // Buscar ou criar dados do usuário
          const data = await createOrUpdateUserData(currentUser);
          if (isMounted) {
            setUserData(data);
          }
        } else {
          setUser(null);
          setUserData(null);
        }
      } catch (err) {
        console.error("Erro ao verificar autenticação:", err);
        if (isMounted) {
          setError("Erro ao verificar autenticação. Por favor, tente novamente.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    // Cleanup function
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [createOrUpdateUserData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!auth || !googleProvider) {
        console.error("Firebase Auth ou Google Provider não inicializado.");
        setError("Erro de configuração de autenticação.");
        setLoading(false);
        return;
      }
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      console.error("Erro ao fazer login com Google:", error);
      if (error instanceof Error) {
        setError(`Erro ao fazer login: ${error.message}`);
      } else {
        setError("Erro ao fazer login.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (!auth) {
        console.error("Firebase Auth não inicializado.");
        setError("Erro de configuração de autenticação.");
        return;
      }
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setError("Erro ao fazer logout. Por favor, tente novamente.");
    }
  }, []);

  // Memoizar o valor do contexto para evitar renderizações desnecessárias
  const contextValue = {
    user,
    userData,
    loading,
    error,
    signInWithGoogle,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de autenticação
 * @returns Contexto de autenticação
 * @throws Erro se usado fora de um AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
