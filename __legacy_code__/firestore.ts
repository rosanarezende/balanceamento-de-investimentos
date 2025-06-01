import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { Stock } from '@/core/schemas/stock';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface FirestoreStock extends Stock {
  id: string;
  [key: string]: unknown;
}

export async function saveStockToDatabase(stock: FirestoreStock) {
  try {
    await setDoc(doc(db, 'stocks', stock.id), stock);
    // eslint-disable-next-line no-console
    console.log('Stock saved successfully');
  } catch (error) {
    console.error('Error saving stock: ', error);
  }
}

export function validateUserInput(input: string) {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input');
  }
  return input.trim();
}

export interface VerifyStockExistsResult {
  [key: string]: unknown;
}

export async function verifyStockExists(stockId: string): Promise<VerifyStockExistsResult> {
  const docRef = doc(db, 'stocks', stockId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as VerifyStockExistsResult;
  } else {
    throw new Error('No such stock!');
  }
}
