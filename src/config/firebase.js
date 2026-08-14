import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA0TDoy1FJOBYRQNPIrHcBwk0_rCejVHdM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nexai-nefro.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nexai-nefro",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nexai-nefro.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1085284590267",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1085284590267:web:8950b5a287c77fea107f9e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0ZQJ0WEWQW"
};

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase inicializado com sucesso no projeto:", firebaseConfig.projectId);
} catch (error) {
  console.error("Erro ao inicializar Firebase:", error);
}

export { app, auth, db };
