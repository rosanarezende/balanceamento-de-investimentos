import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Inicializar o Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

// Criar um usuário de teste para desenvolvimento
if (process.env.NODE_ENV !== "production") {
  const testEmail = "teste@exemplo.com"
  const testPassword = "senha123"

  // Verificar se o usuário já existe antes de criar
  signInWithEmailAndPassword(auth, testEmail, testPassword)
    .catch((error) => {
      // Se o usuário não existir, criar um novo
      if (error.code === "auth/user-not-found") {
        createUserWithEmailAndPassword(auth, testEmail, testPassword)
          .then(() => console.log("Usuário de teste criado com sucesso"))
          .catch((error) => console.error("Erro ao criar usuário de teste:", error))
      }
    })
    .finally(() => {
      // Fazer logout para não iniciar a aplicação já logado
      auth.signOut()
    })
}

export { app, auth, db, googleProvider }
