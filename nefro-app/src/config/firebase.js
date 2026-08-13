import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: O usuário deve substituir estas configurações pelas do seu projeto no Firebase Console.
const firebaseConfig = {
  apiKey: "COLOQUE_SUA_API_KEY_AQUI",
  authDomain: "COLOQUE_SEU_AUTH_DOMAIN_AQUI",
  projectId: "COLOQUE_SEU_PROJECT_ID_AQUI",
  storageBucket: "COLOQUE_SEU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "COLOQUE_SEU_MESSAGING_SENDER_ID_AQUI",
  appId: "COLOQUE_SEU_APP_ID_AQUI"
};

let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase não inicializado. Verifique src/config/firebase.js");
}

export { auth, db };
