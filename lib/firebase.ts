import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase configuration is incomplete. Please check your environment variables.")
  throw new Error("Firebase configuration is incomplete")
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

let auth: Auth
let db: Firestore
let storage: FirebaseStorage

try {
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  console.log("[v0] Firebase initialized successfully")
} catch (error) {
  console.error("Firebase initialization error:", error)
  throw error
}

export { auth, db, storage }
export default app
