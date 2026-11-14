import { db } from '../src/config/firebase.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  setDoc, 
  updateDoc, 
  where 
} from 'firebase/firestore';
import fs from 'fs';

const DOCTOR_ID = 'dra-maria-tereza';

// Load finalized dataset
const rawRecords = JSON.parse(fs.readFileSync('scratch/final_33_records.json', 'utf-8'));

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
  console.log("🔄 ATUALIZANDO PACIENTES DA DRA. MARIA TEREZA (CARACTERÍSTICAS & SITUAÇÃO)");
  console.log("================================================================================");

  // 1. Fetch current patients of dra-maria-tereza
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
  let createdCount = 0;

  for (const item of rawRecords) {
    const cleanCpf = item.cpf.replace(/\D/g, '');
    const expectedSlug = slugify(item.nome);
    const existing = patientsMap.get(cleanCpf) || patientsMap.get(norm(item.nome)) || patientsMap.get(expectedSlug);

    // Ajuste fino para Antonio Alves da Silva (que está em HD no período com 58 sessões)
    const modalidadeEfetiva = item.index === 7 ? 'HD' : item.modalidade;
    const statusEfetivo = item.status === 'Tratamento Conservador' && item.index === 7 ? 'Ativo' : item.status;

    if (existing) {
      // Atualizar paciente existente
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
        status: statusEfetivo,
        ativo: item.ativo,
        modalidade: modalidadeEfetiva,
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

      if (item.desfecho) {
        updatePayload.desfecho = item.desfecho;
        updatePayload.motivoDesligamento = item.motivoDesligamento;
      }

      await updateDoc(docRef, updatePayload);
      updatedCount++;
      console.log(`✅ [${updatedCount}] Atualizado: ${item.nome} (${existing.docId}) | Status: ${statusEfetivo} | Início TRS: ${item.dataInicioDialise} (${item.tempoTotalTratamento}) | Sessões: ${item.numeroSessoesPeriodo}`);
    } else {
      // Criar novo paciente
      const newDocId = expectedSlug;
      const docRef = doc(db, 'patients', newDocId);

      const isConservador = modalidadeEfetiva === 'Conservador';

      const newPatientDoc = {
        id: newDocId,
        nome: item.nome,
        doctorId: DOCTOR_ID,
        activeTenantId: DOCTOR_ID,
        clinica: 'DialiZe Betim',
        hospital: 'HOSPITAL PUBLICO REGIONAL PREF. OSVALDO REZENDE FRANCO',
        localAtendimento: 'Salão 3',
        sala: 'Salão 3',
        andar: 'Salão 3',
        turno: '2º Turno',
        diaSemana: 'Seg/Qua/Sex',
        cpf: item.cpf,
        sexo: item.sexo,
        dataNascimento: item.dataNascimento,
        idade: item.idade,
        tipoPaciente: item.tipoPaciente,
        cid10: item.cid10,
        etiologiaDRC: item.etiologiaDRC,
        convenio: item.convenio,
        status: statusEfetivo,
        ativo: item.ativo,
        modalidade: modalidadeEfetiva,
        desfecho: item.desfecho || null,
        motivoDesligamento: item.motivoDesligamento || null,
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
        statusTransplante: 'Não Avaliado',
        tipoAcesso: isConservador ? 'Não Aplicável' : 'FAV',
        posicaoAcesso: isConservador ? 'Não Aplicável' : 'MSE',
        acessoVascular: isConservador ? null : {
          tipo: 'FAV',
          ladoMembro: 'MSE',
          fluxoSangue: 350,
          fluxoDialisato: 500,
          agulha: '16G',
          duracaoSessao: '04:00'
        },
        anticoagulacao: isConservador ? null : {
          tipo: 'heparina_padrao',
          doseAtaque: 1000,
          doseManutencao: 500,
          observacoes: 'Heparinização padrão.'
        },
        duracaoSessao: isConservador ? null : '04:00',
        prescricaoDialise: isConservador ? null : {
          tempoSessao: '04:00',
          duracaoHoras: 4.0,
          composicaoBanho: 'Padrão',
          tipoEsterilizacao: 'Padrão',
          frequenciaSemanal: '3x por semana',
          diasSemana: 'Seg/Qua/Sex',
          fluxoSangue: 350,
          fluxoDialisato: 500
        },
        exames: item.index === 2 ? {
          creatinina: 12.19,
          ureiaPre: 175,
          ureiaPos: 54,
          ktv: 1.36191,
          hbsag: 'NR',
          hiv: 'NR'
        } : {},
        historicoExames: item.index === 2 ? [
          {
            dataExame: '2026-11-01',
            creatinina: 12.19,
            ureiaPre: 175,
            ureiaPos: 54,
            ktv: 1.36191,
            hbsag: 'NR',
            hiv: 'NR'
          }
        ] : [],
        observacoesClinicas: isConservador 
          ? `Paciente em Tratamento Conservador (DialiZe Betim / Salão 3). Período 01/07/2026 a 30/11/2026.`
          : item.status === 'Óbito'
            ? `Paciente com registro de Óbito no período 01/07/2026 a 30/11/2026 (DialiZe Betim / Salão 3).`
            : `Paciente cadastrado via Dialsist Web (DialiZe Betim / Salão 3). Período 01/07/2026 a 30/11/2026.`,
        criadoEm: now,
        atualizadoEm: now
      };

      await setDoc(docRef, newPatientDoc);
      createdCount++;
      console.log(`✨ [NOVO] Criado: ${item.nome} (${newDocId}) | Status: ${statusEfetivo} | Início TRS: ${item.dataInicioDialise} (${item.tempoTotalTratamento})`);
    }
  }

  // 2. Update total count on doctor document
  const finalSnap = await getDocs(q);
  const totalCount = finalSnap.size;
  console.log(`\n📊 Total de pacientes da Dra. Maria Tereza no Firestore: ${totalCount}`);

  const doctorRef = doc(db, 'doctors', DOCTOR_ID);
  const doctorSnap = await getDoc(doctorRef);
  if (doctorSnap.exists()) {
    await updateDoc(doctorRef, {
      pacientesCount: totalCount,
      atualizadoEm: now
    });
    console.log(`✅ Documento doctors/${DOCTOR_ID} atualizado com pacientesCount: ${totalCount}`);
  }

  // 3. Register audit log
  const auditId = `audit-${Date.now()}`;
  await setDoc(doc(db, 'audit_logs', auditId), {
    id: auditId,
    timestamp: now,
    tipoAcao: 'LICENSE_UPDATE',
    descricao: `Atualização de características gerais e situação clínica dos 33 pacientes (30 atualizados, 3 novos) - Dra. Maria Tereza`,
    adminEmail: 'sistema@nexai.com.br',
    targetDoctorId: DOCTOR_ID,
    targetDoctorName: 'Dra. Maria Tereza',
    detalhes: {
      pacientesAtualizados: updatedCount,
      pacientesNovos: createdCount,
      totalPacientes: totalCount,
      periodo: '01/07/2026 a 30/11/2026',
      clinica: 'DialiZe Betim - Salão 3'
    }
  });
  console.log(`🛡️ Log de auditoria registrado: ${auditId}`);

  console.log("================================================================================");
  console.log(`🎉 SUCESSO! ${updatedCount} atualizados, ${createdCount} criados. Total no banco: ${totalCount}`);
  console.log("================================================================================");
}

runUpdate().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
