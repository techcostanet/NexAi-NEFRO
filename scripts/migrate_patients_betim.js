import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';
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

const db = getFirestore(app);

async function migratePatients() {
  console.log("Iniciando migração dos pacientes para 'Dialize Betim' no Cloud Firestore...");
  const patientsCol = collection(db, 'patients');
  const snap = await getDocs(patientsCol);
  console.log(`Encontrados ${snap.docs.length} pacientes.`);

  const batch = writeBatch(db);
  let count = 0;

  snap.docs.forEach(d => {
    const docRef = doc(db, 'patients', d.id);
    batch.update(docRef, {
      clinica: 'Dialize Betim',
      atualizadoEm: new Date().toISOString()
    });
    count++;
  });

  await batch.commit();
  console.log(`✅ Sucesso! ${count} pacientes foram atualizados para 'Dialize Betim'.`);
  process.exit(0);
}

migratePatients().catch(err => {
  console.error("❌ Erro na migração:", err);
  process.exit(1);
});
