import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, writeBatch } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = {
  apiKey: "AIzaSyA0TDoy1FJOBYRQNPIrHcBwk0_rCejVHdM",
  authDomain: "nexai-nefro.firebaseapp.com",
  projectId: "nexai-nefro",
  storageBucket: "nexai-nefro.firebasestorage.app",
  messagingSenderId: "1085284590267",
  appId: "1:1085284590267:web:8950b5a287c77fea107f9e",
  measurementId: "G-0ZQJ0WEWQW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log("🔍 Testando conexão com o Cloud Firestore (nexai-nefro)...");
  
  try {
    // 1. Teste de gravação e leitura de documento de verificação
    const testDocRef = doc(db, "_system_check", "status");
    await setDoc(testDocRef, {
      connected: true,
      lastCheck: new Date().toISOString(),
      system: "NexAi-NEFRO"
    });
    console.log("✅ Conexão estabelecida e permissão de escrita confirmada!");

    // 2. Carregar dados dos pacientes do arquivo JSON
    const dataPath = path.join(__dirname, "..", "src", "data", "patients_db.json");
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const patients = JSON.parse(rawData);

    console.log(`📦 Carregando ${patients.length} pacientes para a coleção 'patients' no Firestore...`);

    const batchSize = 300;
    for (let i = 0; i < patients.length; i += batchSize) {
      const chunk = patients.slice(i, i + batchSize);
      const batch = writeBatch(db);
      
      chunk.forEach(patient => {
        const patientRef = doc(db, "patients", patient.id);
        batch.set(patientRef, patient, { merge: true });
      });

      await batch.commit();
      console.log(`  -> Lote ${Math.floor(i / batchSize) + 1} enviado (${chunk.length} pacientes)...`);
    }

    // 3. Verificar quantidade total no Firestore
    const colRef = collection(db, "patients");
    const snapshot = await getDocs(colRef);
    console.log(`🎉 Sucesso total! Existem agora ${snapshot.size} pacientes registrados online no Firestore.`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao conectar ou enviar dados ao Firestore:", error);
    process.exit(1);
  }
}

main();
