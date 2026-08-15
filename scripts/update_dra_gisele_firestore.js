import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
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

async function updateDoctor() {
  const giseleRef = doc(db, 'doctors', 'dra-gisele');
  await setDoc(giseleRef, {
    clinicaPrincipal: 'Dialize Betim',
    locaisAtuacao: [
      {
        id: 'loc-betim-01',
        nome: 'Dialize Betim',
        tipo: 'Clínica de Hemodiálise',
        cidade: 'Betim/MG',
        diasSemana: 'Seg/Qua/Sex',
        turnos: '1º, 2º e 3º Turnos',
        rtNome: 'Dra. Gisele',
        rtCrm: '123456/SP',
        telefoneEnfermagem: '(31) 98888-3333',
        status: 'Ativo',
        criadoEm: new Date().toISOString()
      }
    ],
    atualizadoEm: new Date().toISOString()
  }, { merge: true });

  console.log("✅ Dra. Gisele atualizada no Firestore com local Dialize Betim!");
  process.exit(0);
}

updateDoctor().catch(err => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
