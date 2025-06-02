/**
 * Definições de tipos relacionados ao usuário e autenticação
 */

import { User as FirebaseUser } from "firebase/auth";

export interface UserPreferences {
  theme: "light" | "dark";
}

export interface WatchlistItem {
  ticker: string;
  targetPrice: number | null;
  notes: string;
}

export interface UserData {
  email: string | null;
  displayName: string | null;
  portfolio: Record<string, any>;
  watchlist: Record<string, WatchlistItem>;
  preferences: UserPreferences;
}

export interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}
