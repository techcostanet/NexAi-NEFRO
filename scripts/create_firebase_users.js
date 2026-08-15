import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSy_fake_api_key_for_script",
  authDomain: "nexai-nefro.firebaseapp.com",
  projectId: "nexai-nefro",
  storageBucket: "nexai-nefro.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Se precisar ler as variaveis reais do .env:
import fs from 'fs';
import path from 'path';

function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envFile.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/['"]/g, '');
      }
    });
    return envVars;
  } catch (e) {
    return {};
  }
}

const env = loadEnv();
const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
});

const auth = getAuth(app);

const accounts = [
  { email: 'admin@nefroapp.com', pass: 'admin123' },
  { email: 'dra.gisele@nefroapp.com', pass: 'senha123' },
  { email: 'dr.marcelo@nefroapp.com', pass: 'demo123' }
];

async function createAccounts() {
  for (const acc of accounts) {
    try {
      console.log(`Criando conta para: ${acc.email}...`);
      await createUserWithEmailAndPassword(auth, acc.email, acc.pass);
      console.log(`✅ Sucesso: ${acc.email}`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`ℹ️ Conta já existe: ${acc.email}`);
      } else {
        console.error(`❌ Erro ao criar ${acc.email}:`, error.code, error.message);
      }
    }
  }
  process.exit(0);
}

createAccounts();
