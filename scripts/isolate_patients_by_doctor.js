import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, writeBatch, updateDoc } from "firebase/firestore";

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

async function runMigration() {
  console.log("🔒 Iniciando isolamento estrito de pacientes por médico no Cloud Firestore...");

  const patientsCol = collection(db, "patients");
  const snap = await getDocs(patientsCol);
  console.log(`Encontrados ${snap.docs.length} pacientes.`);

  const batch = writeBatch(db);
  let giseleCount = 0;
  let marceloCount = 0;

  snap.docs.forEach((d) => {
    const pRef = doc(db, "patients", d.id);
    const data = d.data();

    if (d.id.startsWith("paciente-demo-")) {
      // Paciente de demonstração pertence ao Dr. Marcelo
      batch.update(pRef, {
        doctorId: "dr-marcelo",
        clinica: "Centro Nefrológico NexAi & Hospital do Rim",
        atualizadoEm: new Date().toISOString()
      });
      marceloCount++;
    } else {
      // Pacientes reais de hemodiálise de Betim pertencem à Dra. Gisele
      batch.update(pRef, {
        doctorId: "dra-gisele",
        clinica: "Dialize Betim",
        atualizadoEm: new Date().toISOString()
      });
      giseleCount++;
    }
  });

  // Atualizar contador nos documentos dos médicos
  const giseleDoc = doc(db, "doctors", "dra-gisele");
  batch.update(giseleDoc, {
    pacientesCount: giseleCount,
    atualizadoEm: new Date().toISOString()
  });

  const marceloDoc = doc(db, "doctors", "dr-marcelo");
  batch.update(marceloDoc, {
    pacientesCount: marceloCount,
    atualizadoEm: new Date().toISOString()
  });

  // Atualizar contagem da Dra. Camila Duque para 0
  const camilaDoc = doc(db, "doctors", "doc-1788294320148");
  batch.update(camilaDoc, {
    pacientesCount: 0,
    atualizadoEm: new Date().toISOString()
  });

  await batch.commit();

  console.log(`✅ Sucesso!`);
  console.log(`   - Dra. Gisele: ${giseleCount} pacientes atribuídos (Dialize Betim)`);
  console.log(`   - Dr. Marcelo: ${marceloCount} pacientes de demo atribuídos`);
  console.log(`   - Dra. Camila Duque: 0 pacientes (conta nova sem vazamento)`);
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("❌ Erro na migração:", err);
  process.exit(1);
});
