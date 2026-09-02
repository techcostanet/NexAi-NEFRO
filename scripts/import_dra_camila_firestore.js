import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, writeBatch, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
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

async function importAll() {
  console.log("☁️  Iniciando importação 100% Cloud Firestore para Dra. Camila Duque...");

  const rawJson = fs.readFileSync(path.resolve(process.cwd(), 'scratch/patients_camila_duque_imported.json'), 'utf8');
  const patients = JSON.parse(rawJson);
  console.log(`📋 Carregados ${patients.length} pacientes do JSON consolidado.`);

  // Firestore writeBatch suporta até 500 operações por batch. Como temos 31 pacientes, cabe num único batch.
  const batch = writeBatch(db);

  patients.forEach(p => {
    const pRef = doc(db, 'patients', p.id);
    batch.set(pRef, p, { merge: true });
  });

  // Atualizar contador e perfil da Dra. Camila Duque
  const camilaDocRef = doc(db, 'doctors', 'doc-1788294320148');
  batch.set(camilaDocRef, {
    pacientesCount: patients.length,
    clinicaPrincipal: 'Dialize Betim',
    locaisAtuacao: [
      {
        id: 'loc-betim-camila-3t',
        nome: 'Dialize Betim',
        tipo: 'Clínica de Hemodiálise',
        cidade: 'Betim/MG',
        diasSemana: 'Ter/Qui/Sáb',
        turnos: '3º Turno (17:00 - 21:00)',
        rtNome: 'Dra. Camila Duque',
        rtCrm: 'CRM/MG',
        telefoneEnfermagem: '(31) 3010-8222',
        status: 'Ativo',
        criadoEm: new Date().toISOString()
      }
    ],
    atualizadoEm: new Date().toISOString()
  }, { merge: true });

  // Criar log de auditoria
  const auditRef = doc(collection(db, 'audit_logs'), `audit-import-camila-${Date.now()}`);
  batch.set(auditRef, {
    id: auditRef.id,
    timestamp: new Date().toISOString(),
    tipoAcao: 'PATIENTS_IMPORT',
    descricao: `Importação completa e estruturada de ${patients.length} pacientes (3º Turno TQS - Dialize Betim) para a conta da Dra. Camila Duque`,
    adminEmail: 'admin@nefroapp.com',
    targetDoctorId: 'doc-1788294320148',
    targetDoctorName: 'Dra. Camila Duque',
    detalhes: {
      totalPacientes: patients.length,
      totalExamesHistorico: patients.reduce((acc, p) => acc + (p.historicoExames?.length || 0), 0),
      totalMedicamentos: patients.reduce((acc, p) => acc + (p.medicamentos?.length || 0), 0),
      pacientesDiabeticos: patients.filter(p => p.diabetico).length
    }
  });

  console.log("💾 Gravando no Cloud Firestore...");
  await batch.commit();
  console.log("✅ Batch gravado com sucesso no Cloud Firestore!");

  // Verificação de segurança e integridade
  console.log("\n🔍 Executando verificação de integridade pós-importação...");
  const q = query(collection(db, 'patients'), where('doctorId', '==', 'doc-1788294320148'));
  const snap = await getDocs(q);
  console.log(`✨ Verificação concluída: ${snap.docs.length} pacientes ativos encontrados para Dra. Camila Duque no Firestore!`);

  snap.docs.forEach((d, idx) => {
    const data = d.data();
    console.log(`   ${idx+1}. ${data.nome} | Acesso: ${data.acessoVascular?.tipo} ${data.acessoVascular?.ladoMembro} | PS: ${data.pesoSeco}kg | Histórico: ${data.historicoExames?.length || 0} meses | Meds: ${data.medicamentos?.length || 0}`);
  });

  process.exit(0);
}

importAll().catch(err => {
  console.error("❌ Erro durante a importação para o Firestore:", err);
  process.exit(1);
});
