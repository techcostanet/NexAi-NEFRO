import { db } from '../src/config/firebase.js';
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  setDoc, 
  updateDoc, 
  where 
} from 'firebase/firestore';
import fs from 'fs';

const DOCTOR_ID = 'dra-maria-tereza';
const rawRecords = JSON.parse(fs.readFileSync('scratch/batch1_final_records.json', 'utf-8'));

function norm(s) {
  return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
}

function slugify(name) {
  return 'paciente-' + norm(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function runUpdate() {
  console.log("================================================================================");
  console.log("🔄 ATUALIZANDO PACIENTES DA DRA. MARIA TEREZA (SALÃO 1 - 1º TURNO)");
  console.log("================================================================================");

  const q = query(collection(db, 'patients'), where('doctorId', '==', DOCTOR_ID));
  const snap = await getDocs(q);
  console.log(`Pacientes atuais no Firestore para ${DOCTOR_ID}: ${snap.size}`);

  const patientsMap = new Map();
  snap.forEach(d => {
    const data = d.data();
    patientsMap.set(d.id, { docId: d.id, ...data });
    if (data.nome) {
      patientsMap.set(norm(data.nome), { docId: d.id, ...data });
    }
    if (data.cpf) {
      const clean = data.cpf.replace(/\D/g, '');
      if (clean) patientsMap.set(clean, { docId: d.id, ...data });
    }
  });

  const now = new Date().toISOString();
  let updatedCount = 0;

  for (const item of rawRecords) {
    const cleanCpf = item.cpf.replace(/\D/g, '');
    const expectedSlug = slugify(item.nome);
    const existing = patientsMap.get(cleanCpf) || patientsMap.get(norm(item.nome)) || patientsMap.get(expectedSlug);

    if (!existing) {
      console.warn(`⚠️ Paciente não encontrado no banco: ${item.nome} (CPF: ${item.cpf})`);
      continue;
    }

    const docRef = doc(db, 'patients', existing.docId);
    const updatePayload = {
      cpf: item.cpf,
      sexo: item.sexo,
      dataNascimento: item.dataNascimento,
      idade: item.idade,
      tipoPaciente: item.tipoPaciente,
      cid10: item.cid10,
      etiologiaDRC: item.etiologiaDRC,
      convenio: item.convenio,
      localAtendimento: item.localAtendimento,
      sala: item.sala,
      andar: item.andar,
      turno: item.turno,
      diaSemana: item.diaSemana,
      clinica: item.clinica,
      hospital: item.hospital,
      status: item.status,
      ativo: item.ativo,
      modalidade: item.modalidade,
      desfecho: item.desfecho,
      motivoDesligamento: item.motivoDesligamento,
      dataInicioDialise: item.dataInicioDialise,
      tempoTotalTratamento: item.tempoTotalTratamento,
      dataInicioClinica: item.dataInicioClinica,
      tempoNaClinica: item.tempoNaClinica,
      dataInicioTratamentoAtual: item.dataInicioTratamentoAtual,
      tempoTratamentoAtual: item.tempoTratamentoAtual,
      mudancaTratamento: item.mudancaTratamento,
      numeroSessoesPeriodo: item.numeroSessoesPeriodo,
      tratamentoAtual: item.tratamentoAtual,
      inicioClinica: item.inicioClinica,
      primeiroTratamento: item.primeiroTratamento,
      atualizadoEm: now
    };

    await updateDoc(docRef, updatePayload);
    updatedCount++;
    console.log(`✅ [${updatedCount}/33] Atualizado: ${item.nome} (${existing.docId}) | CPF: ${item.cpf} | Status: ${item.status} | Sessões: ${item.numeroSessoesPeriodo}`);
  }

  // Register audit log
  const auditId = `audit-${Date.now()}`;
  await setDoc(doc(db, 'audit_logs', auditId), {
    id: auditId,
    timestamp: now,
    tipoAcao: 'LICENSE_UPDATE',
    descricao: `Enriquecimento cadastral, TRS e desfechos de 33 pacientes do Salão 1 (1º Turno) - Dra. Maria Tereza`,
    adminEmail: 'sistema@nexai.com.br',
    targetDoctorId: DOCTOR_ID,
    targetDoctorName: 'Dra. Maria Tereza',
    detalhes: {
      pacientesAtualizados: updatedCount,
      obitosMapeados: ['EDSON RODRIGUES', 'NELSON PEREIRA', 'PAULO DA CRUZ MOUTINHO'],
      mudancaTtoMapeados: ['ADELMARIA ALVES PEREIRA SILVA'],
      sala: 'Salão 1',
      turno: '1º Turno',
      periodo: '01/07/2026 a 30/11/2026'
    }
  });
  console.log(`🛡️ Log de auditoria registrado: ${auditId}`);

  console.log("================================================================================");
  console.log(`🎉 SUCESSO! Todos os ${updatedCount} pacientes do Salão 1 foram enriquecidos.`);
  console.log("================================================================================");
}

runUpdate().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
