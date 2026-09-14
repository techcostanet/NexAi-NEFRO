import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, query, where, writeBatch, setDoc } from "firebase/firestore";
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
  console.log("🚀 Iniciando semeadura da base hiper-realista no Cloud Firestore...");
  console.log(`📊 Total de pacientes a carregar: ${DEMO_PATIENTS_DATA.length}`);

  try {
    // 1. Atualiza documento do Dr. Marcelo na coleção 'doctors'
    console.log("👨‍⚕️ Atualizando perfil e clínicas do Dr. Marcelo Ramos...");
    const doctorMarcelo = DEFAULT_DOCTORS.find(d => d.id === "dr-marcelo");
    if (doctorMarcelo) {
      const docRef = doc(db, "doctors", "dr-marcelo");
      await setDoc(docRef, {
        ...doctorMarcelo,
        atualizadoEm: new Date().toISOString()
      }, { merge: true });
      console.log("  -> Dr. Marcelo atualizado com 3 clínicas curtas e 60 pacientes.");
    }

    // 2. Busca e limpa pacientes legados do Dr. Marcelo
    console.log("🧹 Buscando registros antigos de pacientes do Dr. Marcelo...");
    const patientsCol = collection(db, "patients");
    const q = query(patientsCol, where("doctorId", "==", "dr-marcelo"));
    const snap = await getDocs(q);
    console.log(`  -> Encontrados ${snap.docs.length} registros existentes.`);

    const newPatientIds = new Set(DEMO_PATIENTS_DATA.map(p => p.id));
    const deleteBatch = writeBatch(db);
    let deleteCount = 0;

    snap.docs.forEach(d => {
      if (!newPatientIds.has(d.id)) {
        deleteBatch.delete(d.ref);
        deleteCount++;
        console.log(`  - Deletando registro obsoleto: ${d.id} (${d.data().nome})`);
      }
    });

    if (deleteCount > 0) {
      await deleteBatch.commit();
      console.log(`✅ ${deleteCount} registros obsoletos excluídos.`);
    }

    // 3. Gravação dos 60 novos pacientes em batches de 50
    console.log("📋 Gravando os 60 novos pacientes clínicos hiper-realistas...");
    const CHUNK_SIZE = 50;
    for (let i = 0; i < DEMO_PATIENTS_DATA.length; i += CHUNK_SIZE) {
      const chunk = DEMO_PATIENTS_DATA.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      chunk.forEach(patient => {
        const pRef = doc(db, "patients", patient.id);
        batch.set(pRef, {
          ...patient,
          doctorId: "dr-marcelo",
          atualizadoEm: new Date().toISOString()
        }, { merge: true });
      });

      await batch.commit();
      console.log(`  -> Gravados pacientes ${i + 1} a ${Math.min(i + CHUNK_SIZE, DEMO_PATIENTS_DATA.length)}`);
    }

    // 4. Verificação de integridade
    console.log("🔍 Verificando integridade dos dados no Firestore...");
    const verifySnap = await getDocs(query(patientsCol, where("doctorId", "==", "dr-marcelo")));
    console.log(`🎉 Total de pacientes do Dr. Marcelo no Firestore: ${verifySnap.docs.length}`);

    const countsByClinic = {};
    verifySnap.docs.forEach(d => {
      const c = d.data().clinica || 'Sem clínica';
      countsByClinic[c] = (countsByClinic[c] || 0) + 1;
    });

    console.log("Distribuição por clínica:");
    Object.entries(countsByClinic).forEach(([clinic, count]) => {
      console.log(`  • ${clinic}: ${count} pacientes`);
    });

    console.log("\n✅ Base de demonstração hiper-realista 100% sincronizada no Cloud Firestore!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro durante semeadura:", err);
    process.exit(1);
  }
}

main();
