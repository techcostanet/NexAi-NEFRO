import { db } from "../src/config/firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { HOMOLOGATED_LABS } from "../src/data/labProfiles.js";

async function seed() {
  console.log("=== SINCRONIZANDO LABORATÓRIOS HOMOLOGADOS NO CLOUD FIRESTORE (`lab_templates`) ===");

  for (const lab of HOMOLOGATED_LABS) {
    const docRef = doc(db, "lab_templates", lab.id);
    await setDoc(docRef, {
      ...lab,
      atualizadoEm: new Date().toISOString()
    }, { merge: true });
    console.log(`✅ Laboratório registrado no Firestore: ${lab.nome} (${lab.id}) - ${lab.totalExames} exames homologados`);
  }

  console.log("\n✨ Todos os perfis de laboratório foram aprendidos e gravados com sucesso na coleção `lab_templates`!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Erro ao sincronizar templates de laboratório:", err);
  process.exit(1);
});
