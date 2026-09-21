import { db } from "../src/config/firebase.js";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

async function verify() {
  console.log("=== 1. VERIFICANDO MÉDICO DOC-85719-MG ===");
  const docSnap = await getDoc(doc(db, "doctors", "doc-85719-mg"));
  const docData = docSnap.data();
  console.log(`Nome: ${docData.nome}`);
  console.log(`CRM: ${docData.crm}/${docData.ufCrm}`);
  console.log(`Pacientes Count: ${docData.pacientesCount}`);
  console.log(`Hospital Vínculo: ${docData.hospitalVinculo}`);
  console.log("Locais de atuação:", JSON.stringify(docData.locaisAtuacao, null, 2));

  console.log("\n=== 2. VERIFICANDO PACIENTES DA CLÍNICA DIALIZE BETIM ===");
  const q = query(
    collection(db, "patients"),
    where("doctorId", "==", "doc-85719-mg"),
    where("clinica", "==", "DIALIZE BETIM")
  );
  const snap = await getDocs(q);
  console.log(`Total de pacientes na DIALIZE BETIM: ${snap.docs.length}`);

  let missingCpf = 0;
  let missingDate = 0;
  let modalidadeApd = 0;

  snap.docs.forEach((d, idx) => {
    const p = d.data();
    if (!p.cpf) missingCpf++;
    if (!p.dataNascimento) missingDate++;
    if (p.modalidade === "APD" || p.primeiroTratamento?.modalidade === "APD") modalidadeApd++;
    console.log(`${idx + 1}. [${d.id}] ${p.nome} | CPF: ${p.cpf} | Sexo: ${p.sexo} | Nasc: ${p.dataNascimento} (${p.idade}a) | Convênio: ${p.convenio} | Mod: ${p.modalidade} | Início Clínica: ${p.dataInicioClinica} | 1º TTO: ${p.dataInicioDialise} (${p.tempoTotalTratamento})`);
  });

  console.log(`\nVerificação:`);
  console.log(`- Faltando CPF: ${missingCpf}`);
  console.log(`- Faltando Data Nasc: ${missingDate}`);
  console.log(`- Modalidade APD (Eliete): ${modalidadeApd}`);

  console.log("\n=== 3. VERIFICANDO AUDIT LOG ===");
  const auditSnap = await getDocs(query(collection(db, "audit_logs"), where("tipoAcao", "==", "PATIENT_IMPORT")));
  console.log(`Logs de importação encontrados: ${auditSnap.docs.length}`);
  auditSnap.docs.forEach(d => console.log(JSON.stringify(d.data(), null, 2)));

  process.exit(0);
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
