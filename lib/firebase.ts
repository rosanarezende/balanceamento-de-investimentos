import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
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

// Verificar se as variáveis de ambiente estão definidas
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error("Variáveis de ambiente do Firebase não estão definidas corretamente")
}

// Verificar se o objeto firebaseConfig não é nulo e possui as propriedades necessárias
if (!firebaseConfig) {
  throw new Error("Configuração do Firebase não pode ser nula")
}

const requiredProperties = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
  "measurementId",
]

requiredProperties.forEach((property) => {
  if (!firebaseConfig[property]) {
    throw new Error(`Propriedade ${property} está faltando na configuração do Firebase`)
  }
})

// Inicializar o Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()

export { app, auth, db, googleProvider }
