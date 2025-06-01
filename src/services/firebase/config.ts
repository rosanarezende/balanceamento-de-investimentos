"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

/**
 * Configuração do Firebase
 * 
 * Este arquivo configura a conexão com o Firebase e exporta as instâncias
 * necessárias para autenticação e acesso ao Firestore.
 */

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

// Verificar se as variáveis de ambiente estão definidas em tempo de desenvolvimento
if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error("Variáveis de ambiente do Firebase não estão definidas corretamente");
}

// Inicializar o Firebase apenas no lado do cliente
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;

// Verificar se estamos no ambiente do navegador antes de inicializar
if (typeof window !== 'undefined') {
  try {
    // Verificar se o objeto firebaseConfig possui as propriedades necessárias
    const requiredProperties: (keyof typeof firebaseConfig)[] = [
      "apiKey",
      "authDomain",
      "projectId",
      "storageBucket",
      "messagingSenderId",
      "appId",
    ];
    
    const missingProperties = requiredProperties.filter(
      (property) => !firebaseConfig[property]
    );
    
    if (missingProperties.length > 0) {
      throw new Error(
        `Propriedades ${missingProperties.join(", ")} estão faltando na configuração do Firebase`
      );
    }
    
    // Inicializar o Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Erro ao inicializar Firebase:", error);
  }
}

export { app, auth, db, googleProvider };
