import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch } from "firebase/firestore";
import { DEMO_PATIENTS_DATA } from "../src/data/demoPatients.js";
import { DEFAULT_DOCTORS } from "../src/services/doctorService.js";

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
  console.log("🚀 Semeando base de demonstração completa no Cloud Firestore...");

  try {
    // 1. Cadastrar médicos
    console.log("👨‍⚕️ Atualizando médicos no Firestore...");
    for (const doctor of DEFAULT_DOCTORS) {
      const docRef = doc(db, "doctors", doctor.id);
      await setDoc(docRef, {
        ...doctor,
        atualizadoEm: new Date().toISOString()
      }, { merge: true });
      console.log(`  -> Médico cadastrado: ${doctor.nome} (${doctor.id})`);
    }

    // 2. Cadastrar pacientes de demonstração
    console.log(`📋 Semeando ${DEMO_PATIENTS_DATA.length} pacientes de demonstração clínica...`);
    const batch = writeBatch(db);
    DEMO_PATIENTS_DATA.forEach(patient => {
      const pRef = doc(db, "patients", patient.id);
      batch.set(pRef, {
        ...patient,
        atualizadoEm: new Date().toISOString()
      }, { merge: true });
    });

    await batch.commit();
    console.log("✅ Pacientes de demonstração gravados no Firestore com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao semear Firestore:", err);
    process.exit(1);
  }
}

main();
