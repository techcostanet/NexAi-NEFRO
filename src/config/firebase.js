import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyA0TDoy1FJOBYRQNPIrHcBwk0_rCejVHdM",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "nexai-nefro.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "nexai-nefro",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "nexai-nefro.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1085284590267",
  appId: env.VITE_FIREBASE_APP_ID || "1:1085284590267:web:8950b5a287c77fea107f9e",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-0ZQJ0WEWQW"
};

let app;
let auth;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("Firebase 100% Cloud inicializado com sucesso:", firebaseConfig.projectId);
} catch (error) {
  console.error("Erro ao inicializar Firebase Cloud:", error);
}

export { app, auth, db, storage };

