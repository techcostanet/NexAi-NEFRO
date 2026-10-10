import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  writeBatch,
  query,
  where,
  arrayUnion
} from "firebase/firestore";
import { db } from "../config/firebase.js";
import { normalizeMedicamentosList } from "../data/dialysisMedications.js";
import { DEMO_PATIENTS_DATA } from "../data/demoPatients.js";
import { DR_MARCELO_LOGO } from "../data/drMarceloLogo.js";
import { logAuditEvent } from "./auditService.js";
import { getExamTime } from "../utils/dateUtils.js";

const PATIENTS_COLLECTION = "patients";
const METADATA_COLLECTION = "system_metadata";
const ALLERGIES_DOC = "allergies_catalog";

export const STATUS_TRANSPLANTE_OPTIONS = [
  { value: 'Encaminhar / Em Triagem', label: 'Triagem', badgeBg: '#fef3c7', color: '#b45309', border: '#fde68a' },
  { value: 'Encaminhado / Em Avaliação', label: 'Em Avaliação', badgeBg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' },
  { value: 'Ativo em Lista de Espera', label: 'Lista Ativa', badgeBg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  { value: 'Suspenso / Inativo em Lista', label: 'Suspenso', badgeBg: '#ffedd5', color: '#c2410c', border: '#fed7aa' },
  { value: 'Contraindicação Provisória', label: 'Contraindicação Provisória', badgeBg: '#fff7ed', color: '#c2410c', border: '#ffedd5' },
  { value: 'Contraindicação Definitiva', label: 'Contraindicação Definitiva', badgeBg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  { value: 'Contraindicado Clínico', label: 'Contraindicação Definitiva', badgeBg: '#fee2e2', color: '#b91c1c', border: '#fecaca', hidden: true },
  { value: 'Doador Vivo em Investigação', label: 'Doador Vivo', badgeBg: '#ecfeff', color: '#0e7490', border: '#a5f3fc' },
  { value: 'Já Transplantado', label: 'Transplantado', badgeBg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' },
  { value: 'Recusa do Paciente', label: 'Recusa', badgeBg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
  { value: 'Não Avaliado', label: 'Pendente', badgeBg: '#f8fafc', color: '#64748b', border: '#e2e8f0' }
];

export const ETIOLOGIAS_DRC_PADRAO = [
  'Nefropatia Diabética',
  'Nefroesclerose Hipertensiva',
  'Glomerulonefrite Crônica (GNC)',
  'Doença Renal Policística Autossômica Dominante (DRPAD)',
  'Nefropatia por IgA (Doença de Berger)',
  'Nefrite Lúpica',
  'Uropatia Obstrutiva',
  'Nefrite Tubulointersticial Crônica',
  'Mieloma Múltiplo',
  'Indeterminada'
];

export const ALLERGIES_PADRAO = [
  'Dipirona',
  'Penicilinas',
  'Sulfas',
  'AINEs',
  'Contraste Iodado',
  'Cefalosporinas',
  'Vancomicina',
  'Heparina (HIT)',
  'Látex',
  'Micropore',
  'Quinolonas',
  'Opioides',
  'Clorexidina',
  'Polissulfona'
];

export const TIPOS_ANTICOAGULACAO = [
  { value: 'heparina_padrao', label: 'Heparina Não Fracionada' },
  { value: 'enoxaparina', label: 'Enoxaparina (HBPM)' },
  { value: 'sem_heparina', label: 'Sem Heparina' },
  { value: 'citrato', label: 'Citrato Regional' },
  { value: 'outra', label: 'Personalizada' }
];

export const PRESETS_HEPARINA = [
  { 
    id: 'hep_padrao',
    label: '1.000 UI + 500 UI/h (Padrão)', 
    tipo: 'heparina_padrao', 
    doseAtaque: '1000', 
    doseManutencao: '500', 
    doseEnoxaparina: '',
    motivoSemHeparina: '',
    observacoes: 'Desligar infusão 1h antes do término.' 
  },
  { 
    id: 'hep_reforcada',
    label: '1.500 UI + 750 UI/h (Reforçada)', 
    tipo: 'heparina_padrao', 
    doseAtaque: '1500', 
    doseManutencao: '750', 
    doseEnoxaparina: '',
    motivoSemHeparina: '',
    observacoes: 'Desligar infusão 1h antes do término.' 
  },
  { 
    id: 'hep_baixa',
    label: '500 UI + 500 UI/h (Dose Baixa)', 
    tipo: 'heparina_padrao', 
    doseAtaque: '500', 
    doseManutencao: '500', 
    doseEnoxaparina: '',
    motivoSemHeparina: '',
    observacoes: 'Risco moderado de sangramento. Monitorar fístula.' 
  },
  { 
    id: 'enox_40',
    label: 'Enoxaparina 40 mg (Bólus Único)', 
    tipo: 'enoxaparina', 
    doseAtaque: '', 
    doseManutencao: '', 
    doseEnoxaparina: '40', 
    motivoSemHeparina: '',
    observacoes: 'Administrar na linha arterial no início da sessão.' 
  },
  { 
    id: 'enox_20',
    label: 'Enoxaparina 20 mg (Dose Reduzida)', 
    tipo: 'enoxaparina', 
    doseAtaque: '', 
    doseManutencao: '', 
    doseEnoxaparina: '20', 
    motivoSemHeparina: '',
    observacoes: 'Dose baixa. Administrar no início da diálise.' 
  },
  { 
    id: 'sem_heparina',
    label: 'Sem Heparina (Risco Hemorrágico)', 
    tipo: 'sem_heparina', 
    doseAtaque: '', 
    doseManutencao: '', 
    doseEnoxaparina: '',
    motivoSemHeparina: 'Risco hemorrágico / sangramento recente',
    observacoes: 'Lavagem com 100ml SF 0,9% a cada 30 minutos. Monitorar pressão venosa e capilar.' 
  }
];

export function getAnticoagulacaoInfo(patient) {
  const ac = patient?.anticoagulacao || {};
  const tipo = ac.tipo || (patient?.heparina ? 'heparina_padrao' : 'heparina_padrao');
  
  if (typeof patient?.heparina === 'string' && !ac.tipo) {
    const txt = patient.heparina.trim();
    if (txt.toLowerCase().includes('sem') || txt.toLowerCase() === 's/h') {
      return {
        tipo: 'sem_heparina',
        labelCurto: 'SEM HEPARINA',
        badgeText: 'SEM HEPARINA',
        textoCompleto: 'Sem Heparina',
        isSemHeparina: true,
        bg: '#fee2e2',
        color: '#991b1b',
        border: '#fecaca',
        observacoes: patient.heparinaMotivo || 'Risco de sangramento'
      };
    }
  }

  if (tipo === 'sem_heparina') {
    return {
      tipo: 'sem_heparina',
      labelCurto: 'SEM HEPARINA',
      badgeText: 'SEM HEPARINA',
      textoCompleto: `Sem Heparina (${ac.motivoSemHeparina || 'Lavagens salinas periódicas'})`,
      isSemHeparina: true,
      bg: '#fee2e2',
      color: '#991b1b',
      border: '#fecaca',
      motivo: ac.motivoSemHeparina || 'Risco hemorrágico',
      observacoes: ac.observacoes || 'Lavagem com SF 0,9% a cada 30 min.'
    };
  }

  if (tipo === 'enoxaparina') {
    const dose = ac.doseEnoxaparina || '40';
    return {
      tipo: 'enoxaparina',
      labelCurto: `Enoxaparina ${dose}mg`,
      badgeText: `Enoxa ${dose}mg`,
      textoCompleto: `Enoxaparina ${dose} mg (Bólus inicial)`,
      isSemHeparina: false,
      bg: '#f0fdf4',
      color: '#166534',
      border: '#bbf7d0',
      doseEnoxaparina: dose,
      observacoes: ac.observacoes || 'Administrar na linha arterial no início da sessão.'
    };
  }

  if (tipo === 'citrato') {
    return {
      tipo: 'citrato',
      labelCurto: 'Citrato',
      badgeText: 'Citrato Regional',
      textoCompleto: 'Anticoagulação Regional com Citrato',
      isSemHeparina: false,
      bg: '#fdf4ff',
      color: '#86198f',
      border: '#f5d0fe',
      observacoes: ac.observacoes || 'Monitorar cálcio iônico pré e pós-filtro.'
    };
  }

  // Heparina Não Fracionada Padrão (Default)
  const ataque = ac.doseAtaque || '1000';
  const manutencao = ac.doseManutencao || '500';
  
  return {
    tipo: 'heparina_padrao',
    labelCurto: `Heparina ${ataque}+${manutencao}/h`,
    badgeText: `Heparina ${ataque}+${manutencao}/h`,
    textoCompleto: `Heparina (Ataque ${ataque} UI + Manutenção ${manutencao} UI/h)`,
    isSemHeparina: false,
    bg: '#f1f5f9',
    color: '#334155',
    border: '#cbd5e1',
    doseAtaque: ataque,
    doseManutencao: manutencao,
    observacoes: ac.observacoes || 'Desligar infusão 30 a 60 min antes do término.'
  };
}

/**
 * Normaliza e gera um ID amigável a partir do nome
 */
export function generatePatientId(nome) {
  if (!nome) return `paciente-${Date.now()}`;
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") + `-${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * Calcula idade com base na data de nascimento (YYYY-MM-DD)
 */
export function calculateAge(birthDateStr) {
  if (!birthDateStr) return null;
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Escuta os pacientes em tempo real exclusivamente do Cloud Firestore com isolamento por médico
 * @param {string|Function} doctorIdOrCallback - ID do médico ou callback (compatibilidade reversa)
 * @param {Function} [callbackOrOnError] - Função de callback que recebe a lista de pacientes
 * @param {Function} [maybeOnError] - Função de tratamento de erro
 */
export function subscribeToPatients(doctorIdOrCallback, callbackOrOnError, maybeOnError) {
  let doctorId = null;
  let callback = null;
  let onError = null;

  if (typeof doctorIdOrCallback === 'function') {
    callback = doctorIdOrCallback;
    onError = callbackOrOnError;
  } else {
    doctorId = doctorIdOrCallback;
    callback = callbackOrOnError;
    onError = maybeOnError;
  }

  if (!db) {
    if (callback) callback([]);
    return () => {};
  }

  // Se doctorId foi explicitamente fornecido como vazio ou null para um médico logado
  if (doctorId !== null && doctorId !== undefined && typeof doctorId === 'string' && doctorId.trim() === '') {
    if (callback) callback([]);
    return () => {};
  }

  try {
    const colRef = collection(db, PATIENTS_COLLECTION);
    const q = doctorId 
      ? query(colRef, where("doctorId", "==", doctorId))
      : colRef;

    return onSnapshot(
      q, 
      (snapshot) => {
        let list = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        // Isolamento de segurança rigoroso em memória
        if (doctorId) {
          list = list.filter(p => p.doctorId === doctorId);
        }

        list.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
        if (callback) callback(list);
      },
      (error) => {
        console.error("Erro ao ler coleção 'patients' do Cloud Firestore:", error);
        if (onError) onError(error);
        if (callback) callback([]);
      }
    );
  } catch (err) {
    console.error("Falha ao configurar snapshot do Firestore:", err);
    if (callback) callback([]);
    return () => {};
  }
}

/**
 * Escuta um paciente específico em tempo real diretamente do Cloud Firestore
 */
export function subscribeToPatientById(id, callback, onError) {
  if (!db || !id) {
    if (callback) callback(null);
    return () => {};
  }

  const docRef = doc(db, PATIENTS_COLLECTION, id);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      } else {
        callback(null);
      }
    },
    (err) => {
      console.error("Erro ao escutar paciente no Firestore:", err);
      if (onError) onError(err);
      if (callback) callback(null);
    }
  );
}

/**
 * Busca um único paciente por ID no Cloud Firestore
 */
export async function getPatientById(id) {
  if (!db || !id) return null;
  try {
    const docRef = doc(db, PATIENTS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (err) {
    console.error("Erro ao buscar paciente no Firestore:", err);
  }
  return null;
}

/**
 * Cadastra ou Atualiza um paciente completo no Cloud Firestore
 */
export async function savePatient(patientData) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  
  const id = patientData.id || generatePatientId(patientData.nome);
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  
  const dataToSave = {
    ...patientData,
    id,
    atualizadoEm: new Date().toISOString()
  };

  if (!patientData.criadoEm) {
    dataToSave.criadoEm = new Date().toISOString();
  }

  await setDoc(docRef, dataToSave, { merge: true });
  return dataToSave;
}

/**
 * Consolida os exames mais recentes de um paciente a partir do histórico cronológico.
 * Como exames laboratoriais em nefrologia/hemodiálise possuem periodicidades distintas
 * (mensais, trimestrais, semestrais e anuais), esta função garante que cada exame
 * retenha o último resultado válido/coletado disponível.
 */
export function consolidatePatientExams(historicoExames = [], fallbackExames = {}) {
  const EXAM_KEYS = [
    'hb', 'ht', 'ist', 'ferritina', 'ferro', 'transferrina', 'leucocitos', 'plaquetas',
    'pth', 'fosforo', 'ca', 'vitD', 'fa',
    'k', 'na', 'hco3',
    'ktv', 'ureiaPre', 'ureiaPos', 'ur',
    'creatinina', 'albumina', 'pcr',
    'glicemia', 'hba1c', 'tgp', 'tgo',
    'hbsag', 'antiHbs', 'antiHcv', 'antiHbc', 'hiv'
  ];

  const ALIAS_MAP = {
    hemoglobina: 'hb',
    hematocrito: 'ht',
    calcio: 'ca',
    vitaminaD: 'vitD',
    fosfAlcalina: 'fa',
    potassio: 'k',
    sodio: 'na',
    bicarbonato: 'hco3',
    albuminaSerica: 'albumina',
    glicemiaJejum: 'glicemia',
    hba1cGlicada: 'hba1c'
  };

  const consolidados = {};
  const datas = {};

  const isValidValue = (v) => v !== null && v !== undefined && v !== '' && v !== '-';

  const sorted = Array.isArray(historicoExames)
    ? [...historicoExames].filter(item => item && typeof item === 'object').sort((a, b) => getExamTime(b?.dataExame) - getExamTime(a?.dataExame))
    : [];

  // 1. Percorre histórico do mais recente ao mais antigo
  for (const item of sorted) {
    if (!item || typeof item !== 'object') continue;
    const dataColeta = item.dataExame || null;

    // Campos diretos e canônicos
    for (const key of EXAM_KEYS) {
      if (consolidados[key] === undefined) {
        if (isValidValue(item[key])) {
          consolidados[key] = item[key];
          if (dataColeta) datas[key] = dataColeta;
        }
      }
    }

    // Tratamento de aliases comuns
    for (const [alias, canonical] of Object.entries(ALIAS_MAP)) {
      if (consolidados[canonical] === undefined && isValidValue(item[alias])) {
        consolidados[canonical] = item[alias];
        if (dataColeta) datas[canonical] = dataColeta;
      }
    }

    // Chaves adicionais
    for (const [k, v] of Object.entries(item)) {
      if (['id', '_originalIndex', 'dataExame', 'registradoEm', 'observacoes', 'hemocultura', 'medicamentos'].includes(k)) {
        continue;
      }
      if (consolidados[k] === undefined && isValidValue(v)) {
        consolidados[k] = v;
        if (dataColeta) datas[k] = dataColeta;
      }
    }
  }

  // 2. Fallback para valores já presentes em fallbackExames
  if (fallbackExames && typeof fallbackExames === 'object') {
    for (const [k, v] of Object.entries(fallbackExames)) {
      const canonicalKey = ALIAS_MAP[k] || k;
      if (consolidados[canonicalKey] === undefined && isValidValue(v)) {
        consolidados[canonicalKey] = v;
      }
    }
  }

  // Sincroniza aliases bidirecionais comuns (fa <-> fosfAlcalina)
  if (consolidados.fa && !consolidados.fosfAlcalina) consolidados.fosfAlcalina = consolidados.fa;
  if (consolidados.fosfAlcalina && !consolidados.fa) consolidados.fa = consolidados.fosfAlcalina;

  return { consolidados: consolidados || {}, datas: datas || {} };
}

/**
 * Adiciona ou atualiza um exame com data no histórico do paciente no Firestore
 */
export async function savePatientExam(patientId, examData, examIndex = null) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado no Firestore");

  const historico = Array.isArray(patient.historicoExames) ? [...patient.historicoExames] : [];

  const examRecord = {
    ...examData,
    dataExame: examData.dataExame || new Date().toISOString().split("T")[0],
    registradoEm: new Date().toISOString()
  };

  if (examIndex !== null && examIndex >= 0 && examIndex < historico.length) {
    // Atualiza exame existente
    historico[examIndex] = examRecord;
  } else {
    // Insere novo exame no início
    historico.unshift(examRecord);
  }

  // Ordena por data do mais recente para o mais antigo de forma 100% segura
  historico.sort((a, b) => getExamTime(b?.dataExame) - getExamTime(a?.dataExame));

  // Consolidação cumulativa: sempre retém o último resultado válido de cada exame
  const { consolidados } = consolidatePatientExams(historico, patient.exames);

  const updatePayload = {
    historicoExames: historico,
    exames: consolidados,
    medicamentos: (patient.medicamentos && (Array.isArray(patient.medicamentos) ? patient.medicamentos.length > 0 : Object.keys(patient.medicamentos).length > 0)) ? patient.medicamentos : (examRecord.medicamentos || []),
    atualizadoEm: new Date().toISOString()
  };

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, updatePayload);
  return { ...patient, ...updatePayload };
}

/**
 * Remove um exame do histórico do paciente no Firestore
 */
export async function deletePatientExam(patientId, examIndex) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient || !Array.isArray(patient.historicoExames)) return;

  const historico = [...patient.historicoExames];
  historico.splice(examIndex, 1);

  // Ordena por data do mais recente para o mais antigo de forma 100% segura
  historico.sort((a, b) => getExamTime(b?.dataExame) - getExamTime(a?.dataExame));

  // Recalcula a consolidação de exames após a remoção
  const { consolidados } = consolidatePatientExams(historico, {});

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    historicoExames: historico,
    exames: consolidados,
    atualizadoEm: new Date().toISOString()
  });
}

/**
 * Adiciona ou atualiza uma medicação no paciente no Firestore
 */
export async function savePatientMedication(patientId, medData, medId = null) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado no Firestore");

  let currentMeds = normalizeMedicamentosList(patient.medicamentos);
  const targetId = medId || medData.id || `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const medRecord = {
    ...medData,
    id: targetId,
    ativo: medData.ativo !== undefined ? medData.ativo : true,
    atualizadoEm: new Date().toISOString()
  };

  const existingIndex = currentMeds.findIndex(m => m.id === targetId);
  if (existingIndex !== -1) {
    currentMeds[existingIndex] = { ...currentMeds[existingIndex], ...medRecord };
  } else {
    currentMeds.unshift(medRecord);
  }

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    medicamentos: currentMeds,
    atualizadoEm: new Date().toISOString()
  });

  return currentMeds;
}

/**
 * Remove uma medicação do paciente no Firestore
 */
export async function deletePatientMedication(patientId, medId) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado no Firestore");

  let currentMeds = normalizeMedicamentosList(patient.medicamentos);
  currentMeds = currentMeds.filter(m => m.id !== medId);

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    medicamentos: currentMeds,
    atualizadoEm: new Date().toISOString()
  });

  return currentMeds;
}

/**
 * Alterna o status ativo/suspenso de uma medicação no Firestore
 */
export async function toggleMedicationStatus(patientId, medId, active) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado no Firestore");

  let currentMeds = normalizeMedicamentosList(patient.medicamentos);
  currentMeds = currentMeds.map(m => {
    if (m.id === medId) {
      return { ...m, ativo: active, atualizadoEm: new Date().toISOString() };
    }
    return m;
  });

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    medicamentos: currentMeds,
    atualizadoEm: new Date().toISOString()
  });

  return currentMeds;
}

/**
 * Adiciona ou edita uma evolução médica no prontuário do paciente no Firestore
 */
export async function savePatientEvolution(patientId, evolutionData, evolutionId = null) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado no Firestore");

  const evolucoes = Array.isArray(patient.evolucoes) ? [...patient.evolucoes] : [];
  const targetId = evolutionId || evolutionData.id || `evo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const evolutionRecord = {
    ...evolutionData,
    id: targetId,
    dataHora: evolutionData.dataHora || new Date().toISOString(),
    registradoEm: new Date().toISOString()
  };

  const existingIdx = evolucoes.findIndex(e => e.id === targetId);
  if (existingIdx !== -1) {
    evolucoes[existingIdx] = evolutionRecord;
  } else {
    evolucoes.unshift(evolutionRecord);
  }

  // Ordena por data e hora decrescente
  evolucoes.sort((a, b) => new Date(b.dataHora || 0) - new Date(a.dataHora || 0));

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    evolucoes,
    atualizadoEm: new Date().toISOString()
  });

  return evolucoes;
}

/**
 * Remove uma evolução do histórico do paciente no Firestore
 */
export async function deletePatientEvolution(patientId, evolutionId) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient || !Array.isArray(patient.evolucoes)) return;

  const evolucoes = patient.evolucoes.filter(e => e.id !== evolutionId);

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    evolucoes,
    atualizadoEm: new Date().toISOString()
  });

  return evolucoes;
}

/**
 * Opções padronizadas de motivos para desligamento do paciente do cadastro médico
 */
export const MOTIVOS_DESLIGAMENTO_OPTIONS = [
  { id: 'Transferência', label: 'Transferência', descricao: 'Transferido para outro serviço de diálise ou clínica' },
  { id: 'Outro Médico', label: 'Outro Médico', descricao: 'Paciente assumido por outro profissional nefrologista' },
  { id: 'Óbito', label: 'Óbito', descricao: 'Falecimento do paciente' },
  { id: 'Transplante', label: 'Transplante', descricao: 'Transplante renal bem-sucedido' },
  { id: 'Recuperação Renal', label: 'Recuperação Renal', descricao: 'Recuperação da função renal nativa' },
  { id: 'Abandono', label: 'Abandono', descricao: 'Desistência ou interrupção do tratamento' },
  { id: 'Troca de Turno', label: 'Troca de Turno', descricao: 'Transferência de escala fora do acompanhamento deste médico' },
  { id: 'Outro', label: 'Outro', descricao: 'Outro motivo clínico ou administrativo' }
];

/**
 * Desliga um paciente do cadastro médico no Cloud Firestore e registra na trilha de auditoria
 */
export async function dischargePatient(id, doctorId = null, patientName = '', dischargeData = {}) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  
  const motivo = typeof dischargeData === 'string' ? dischargeData : (dischargeData.motivo || 'Outro');
  const dataOcorrencia = typeof dischargeData === 'object' && dischargeData.data ? dischargeData.data : new Date().toISOString().split('T')[0];
  const observacoes = typeof dischargeData === 'object' && dischargeData.observacoes ? dischargeData.observacoes.trim() : '';

  const docRef = doc(db, PATIENTS_COLLECTION, id);
  await deleteDoc(docRef);

  // Atualiza contador no perfil do médico, se informado
  if (doctorId) {
    try {
      const docDoctorRef = doc(db, "doctors", doctorId);
      const snap = await getDoc(docDoctorRef);
      if (snap.exists()) {
        const cur = snap.data().pacientesCount || 0;
        await updateDoc(docDoctorRef, {
          pacientesCount: Math.max(0, cur - 1),
          atualizadoEm: new Date().toISOString()
        });
      }
    } catch (e) {
      console.warn("Não foi possível atualizar contagem de pacientes do médico:", e);
    }
  }

  // Registra trilha de auditoria e segurança
  try {
    const auditRef = doc(collection(db, "audit_logs"), `audit-discharge-${id}-${Date.now()}`);
    await setDoc(auditRef, {
      id: auditRef.id,
      timestamp: new Date().toISOString(),
      tipoAcao: 'PATIENT_DISCHARGED',
      descricao: `Paciente ${patientName || id} desligado do cadastro médico. Motivo: ${motivo}.`,
      targetDoctorId: doctorId || null,
      detalhes: { 
        patientId: id, 
        patientName, 
        motivo, 
        dataOcorrencia, 
        observacoes 
      }
    });
  } catch (e) {
    console.warn("Log de auditoria não pôde ser gravado:", e);
  }
}

/**
 * Alias retrocompatível para dischargePatient
 */
export async function deletePatient(id, doctorId = null, patientName = '', reason = 'Óbito') {
  return dischargePatient(id, doctorId, patientName, { motivo: reason });
}

/**
 * Sincroniza e Restaura a Base Completa de Demonstração Nefrológica no Firestore vinculada ao médico indicado
 * @param {string} [targetDoctorId='dr-marcelo'] - ID do médico destinatário da demonstração
 */
export async function seedDemoPatientsToFirestore(targetDoctorId = 'dr-marcelo') {
  if (!db) throw new Error("Cloud Firestore não conectado.");

  // 1. Busca pacientes legados existentes do médico para limpar registros obsoletos
  const colRef = collection(db, PATIENTS_COLLECTION);
  const q = query(colRef, where("doctorId", "==", targetDoctorId));
  const snap = await getDocs(q);

  const batch = writeBatch(db);
  const validDemoIds = new Set(DEMO_PATIENTS_DATA.map(p => p.id));

  // Remove pacientes que não pertencem ao novo conjunto de 60 pacientes (ex: antigos paciente-demo-1 a 6)
  snap.docs.forEach(docSnap => {
    if (!validDemoIds.has(docSnap.id)) {
      batch.delete(docSnap.ref);
    }
  });

  // 2. Grava os 60 novos pacientes
  DEMO_PATIENTS_DATA.forEach(patient => {
    const docRef = doc(db, PATIENTS_COLLECTION, patient.id);
    batch.set(docRef, {
      ...patient,
      doctorId: targetDoctorId,
      atualizadoEm: new Date().toISOString()
    }, { merge: true });
  });

  // 3. Atualiza o perfil do médico no Firestore se for o Dr. Marcelo
  if (targetDoctorId === 'dr-marcelo') {
    const docDoctorRef = doc(db, "doctors", "dr-marcelo");
    batch.set(docDoctorRef, {
      nome: "Dr. Marcelo Ramos",
      cpf: "348.912.756-82",
      clinicaPrincipal: "Clínica Renalis",
      hospitalVinculo: "Hospital Santa Casa",
      unidadeDialise: "Unidade de Hemodiálise Renalis",
      logoUrl: DR_MARCELO_LOGO,
      statusLicenca: "Ativo",
      tipoConta: "Médico Assinante",
      plano: "Profissional Ilimitado",
      modulos: {
        dialise: true,
        consultorio: true
      },
      pacientesCount: DEMO_PATIENTS_DATA.length,
      locaisAtuacao: [
        { 
          id: "loc-01", 
          nome: "Clínica Renalis", 
          tipo: "Clínica de Hemodiálise", 
          cidade: "São Paulo/SP", 
          turnos: "1º, 2º e 3º Turnos",
          diasSemana: "Seg/Qua/Sex",
          rtNome: "Dr. Marcelo Ramos",
          rtCrm: "654321/SP",
          telefoneEnfermagem: "(11) 97123-4567",
          status: "Ativo",
          criadoEm: "2026-08-01T00:00:00.000Z"
        },
        { 
          id: "loc-02", 
          nome: "Clínica Nefrovita", 
          tipo: "Clínica de Hemodiálise", 
          cidade: "São Paulo/SP", 
          turnos: "1º, 2º e 3º Turnos",
          diasSemana: "Ter/Qui/Sáb",
          rtNome: "Dr. Marcelo Ramos",
          rtCrm: "654321/SP",
          telefoneEnfermagem: "(11) 98888-1111",
          status: "Ativo",
          criadoEm: "2026-08-01T00:00:00.000Z"
        },
        { 
          id: "loc-03", 
          nome: "Clínica Hemovida", 
          tipo: "Clínica de Hemodiálise", 
          cidade: "São Paulo/SP", 
          turnos: "1º, 2º e 3º Turnos",
          diasSemana: "Seg a Sáb",
          rtNome: "Dr. Marcelo Ramos",
          rtCrm: "654321/SP",
          telefoneEnfermagem: "(11) 97777-2222",
          status: "Ativo",
          criadoEm: "2026-08-01T00:00:00.000Z"
        }
      ],
      atualizadoEm: new Date().toISOString()
    }, { merge: true });
  }

  await batch.commit();
  return DEMO_PATIENTS_DATA.length;
}

/**
 * Escuta em tempo real o catálogo unificado de alergias do Cloud Firestore
 */
export function subscribeToAllergiesCatalog(callback, onError) {
  if (!db) {
    if (callback) callback(ALLERGIES_PADRAO);
    return () => {};
  }

  const docRef = doc(db, METADATA_COLLECTION, ALLERGIES_DOC);
  return onSnapshot(
    docRef,
    (snap) => {
      let list = [...ALLERGIES_PADRAO];
      if (snap.exists() && Array.isArray(snap.data().allergies)) {
        const cloudList = snap.data().allergies;
        const set = new Set([...list, ...cloudList]);
        list = Array.from(set);
      } else {
        // Inicializa o catálogo padrão na primeira execução na nuvem
        setDoc(docRef, { allergies: ALLERGIES_PADRAO, atualizadoEm: new Date().toISOString() }, { merge: true }).catch(console.error);
      }
      list.sort((a, b) => a.localeCompare(b, 'pt-BR'));
      if (callback) callback(list);
    },
    (err) => {
      console.error("Erro ao escutar catálogo de alergias no Firestore:", err);
      if (onError) onError(err);
      if (callback) callback(ALLERGIES_PADRAO);
    }
  );
}

/**
 * Cadastra uma nova alergia no catálogo global do Cloud Firestore para ser reaproveitada por todos os pacientes
 */
export async function addGlobalAllergy(allergyName) {
  if (!db || !allergyName || !allergyName.trim()) return;
  const cleaned = allergyName.trim();
  const docRef = doc(db, METADATA_COLLECTION, ALLERGIES_DOC);
  await setDoc(docRef, {
    allergies: arrayUnion(cleaned),
    atualizadoEm: new Date().toISOString()
  }, { merge: true });
}

/**
 * Adiciona um registro ao histórico de peso do paciente no Cloud Firestore
 */
export async function addPatientWeightRecord(patientId, weightData) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado no Firestore");

  const historico = Array.isArray(patient.historicoPesos) ? [...patient.historicoPesos] : [];
  const pesoNum = parseFloat(String(weightData.peso).replace(',', '.'));
  if (isNaN(pesoNum) || pesoNum <= 0) {
    throw new Error("Valor de peso inválido");
  }

  const pesoSecoRef = patient.pesoSeco ? parseFloat(String(patient.pesoSeco).replace(',', '.')) : null;
  const ganho = (pesoSecoRef && !isNaN(pesoSecoRef)) ? parseFloat((pesoNum - pesoSecoRef).toFixed(2)) : null;

  const newRecord = {
    id: weightData.id || `peso-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    data: weightData.data || new Date().toISOString(),
    peso: pesoNum,
    tipo: weightData.tipo || 'Pré-HD',
    pesoSecoReferencia: pesoSecoRef,
    ganhoInterdialitico: ganho,
    observacoes: weightData.observacoes || '',
    registradoEm: new Date().toISOString()
  };

  historico.unshift(newRecord);
  historico.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    historicoPesos: historico,
    ultimoPesoAferido: pesoNum,
    atualizadoEm: new Date().toISOString()
  });

  return historico;
}

/**
 * Exclui um registro do histórico de peso do paciente no Firestore
 */
export async function deletePatientWeightRecord(patientId, weightId) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient || !Array.isArray(patient.historicoPesos)) return;

  const historico = patient.historicoPesos.filter(w => w.id !== weightId);
  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    historicoPesos: historico,
    atualizadoEm: new Date().toISOString()
  });

  return historico;
}

/**
 * Adiciona ou edita um laudo de hemocultura no histórico do paciente no Firestore
 */
export async function savePatientBloodCulture(patientId, cultureData, cultureId = null) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado no Firestore");

  const cultures = Array.isArray(patient.hemoculturas) ? [...patient.hemoculturas] : [];
  const targetId = cultureId || cultureData.id || `hemo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const cultureRecord = {
    id: targetId,
    dataColeta: cultureData.dataColeta || new Date().toISOString().slice(0, 16),
    sitioColeta: cultureData.sitioColeta || 'Cateter - Lúmen Venoso',
    resultado: cultureData.resultado || 'Aguardando Resultado',
    microrganismo: cultureData.microrganismo ? cultureData.microrganismo.trim() : '',
    sensibilidade: cultureData.sensibilidade ? cultureData.sensibilidade.trim() : '',
    resistencia: cultureData.resistencia ? cultureData.resistencia.trim() : '',
    dtpHoras: (cultureData.dtpHoras !== undefined && cultureData.dtpHoras !== null && cultureData.dtpHoras !== '') ? parseFloat(String(cultureData.dtpHoras).replace(',', '.')) : null,
    conduta: cultureData.conduta ? cultureData.conduta.trim() : '',
    registradoEm: new Date().toISOString()
  };

  const existingIdx = cultures.findIndex(c => c.id === targetId);
  if (existingIdx !== -1) {
    cultures[existingIdx] = cultureRecord;
  } else {
    cultures.unshift(cultureRecord);
  }

  cultures.sort((a, b) => new Date(b.dataColeta || 0) - new Date(a.dataColeta || 0));

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    hemoculturas: cultures,
    atualizadoEm: new Date().toISOString()
  });

  return cultures;
}

/**
 * Exclui uma hemocultura do histórico do paciente no Firestore
 */
export async function deletePatientBloodCulture(patientId, cultureId) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient || !Array.isArray(patient.hemoculturas)) return;

  const cultures = patient.hemoculturas.filter(c => c.id !== cultureId);
  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    hemoculturas: cultures,
    atualizadoEm: new Date().toISOString()
  });

  return cultures;
}

/**
 * Adiciona ou edita uma receita médica no prontuário do paciente no Cloud Firestore
 */
export async function savePatientPrescription(patientId, prescriptionData, prescriptionId = null) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado no Firestore");

  const receitas = Array.isArray(patient.receitas) ? [...patient.receitas] : [];
  const targetId = prescriptionId || prescriptionData.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const prescriptionRecord = {
    ...prescriptionData,
    id: targetId,
    dataEmissao: prescriptionData.dataEmissao || new Date().toISOString().split('T')[0],
    registradoEm: prescriptionData.registradoEm || new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  };

  const existingIdx = receitas.findIndex(r => r.id === targetId);
  if (existingIdx !== -1) {
    receitas[existingIdx] = prescriptionRecord;
  } else {
    receitas.unshift(prescriptionRecord);
  }

  receitas.sort((a, b) => new Date(b.dataEmissao || b.registradoEm || 0) - new Date(a.dataEmissao || a.registradoEm || 0));

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    receitas,
    atualizadoEm: new Date().toISOString()
  });

  return receitas;
}

/**
 * Exclui uma receita médica do histórico do paciente no Cloud Firestore
 */
export async function deletePatientPrescription(patientId, prescriptionId) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient || !Array.isArray(patient.receitas)) return [];

  const receitas = patient.receitas.filter(r => r.id !== prescriptionId);
  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    receitas,
    atualizadoEm: new Date().toISOString()
  });

  return receitas;
}

/**
 * Adiciona ou edita uma LME (Laudo de Medicamento de Alto Custo) no prontuário do paciente no Cloud Firestore
 */
export async function savePatientLme(patientId, lmeData, lmeId = null) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado no Firestore");

  const lmes = Array.isArray(patient.lmes) ? [...patient.lmes] : [];
  const targetId = lmeId || lmeData.id || `lme-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Cálculo da data de validade se não vier explicitada
  let dataValidade = lmeData.dataValidade;
  if (!dataValidade && lmeData.dataSolicitacao) {
    const d = new Date(lmeData.dataSolicitacao);
    const meses = Number(lmeData.vigenciaMeses || 6);
    d.setMonth(d.getMonth() + meses);
    dataValidade = d.toISOString().split('T')[0];
  }

  const lmeRecord = {
    ...lmeData,
    id: targetId,
    dataSolicitacao: lmeData.dataSolicitacao || new Date().toISOString().split('T')[0],
    dataValidade,
    vigenciaMeses: Number(lmeData.vigenciaMeses || 6),
    registradoEm: lmeData.registradoEm || new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  };

  const existingIdx = lmes.findIndex(l => l.id === targetId);
  if (existingIdx !== -1) {
    lmes[existingIdx] = lmeRecord;
  } else {
    lmes.unshift(lmeRecord);
  }

  // Ordena por data de solicitação mais recente
  lmes.sort((a, b) => new Date(b.dataSolicitacao || b.registradoEm || 0) - new Date(a.dataSolicitacao || a.registradoEm || 0));

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    lmes,
    atualizadoEm: new Date().toISOString()
  });

  // Trilha de auditoria no Cloud Firestore
  try {
    await logAuditEvent({
      tipoAcao: lmeId ? 'LME_UPDATE' : (lmeData.isRenovacao ? 'LME_RENEWED' : 'LME_CREATED'),
      descricao: `${lmeId ? 'Atualizada' : (lmeData.isRenovacao ? 'Renovada' : 'Emitida')} LME de ${lmeData.medicamentoNome || 'medicamento de alto custo'} para ${patient.nome}`,
      targetDoctorId: patient.doctorId || null,
      targetDoctorName: lmeData.medicoSolicitante?.nome || null,
      detalhes: {
        patientId,
        patientName: patient.nome,
        medicamentoId: lmeData.medicamentoId,
        medicamentoNome: lmeData.medicamentoNome,
        dataValidade
      }
    });
  } catch (err) {
    console.warn("Falha ao registrar log de auditoria da LME:", err);
  }

  return lmes;
}

/**
 * Exclui uma LME do prontuário do paciente no Cloud Firestore
 */
export async function deletePatientLme(patientId, lmeId) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient || !Array.isArray(patient.lmes)) return [];

  const lmeToDelete = patient.lmes.find(l => l.id === lmeId);
  const lmes = patient.lmes.filter(l => l.id !== lmeId);

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    lmes,
    atualizadoEm: new Date().toISOString()
  });

  // Trilha de auditoria no Cloud Firestore
  try {
    await logAuditEvent({
      tipoAcao: 'LME_DELETED',
      descricao: `Removida LME de ${lmeToDelete?.medicamentoNome || 'medicamento'} do paciente ${patient.nome}`,
      targetDoctorId: patient.doctorId || null,
      detalhes: {
        patientId,
        patientName: patient.nome,
        lmeId
      }
    });
  } catch (err) {
    console.warn("Falha ao registrar log de exclusão da LME:", err);
  }

  return lmes;
}

/**
 * Catálogo de tipos de eventos e intervenções no acesso vascular
 */
export const TIPOS_EVENTO_ACESSO = [
  { value: 'Confecção', label: 'Confecção', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  { value: 'Angioplastia', label: 'Angioplastia', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { value: 'Trombectomia', label: 'Trombectomia', color: '#c2410c', bg: '#fff7ed', border: '#ffedd5' },
  { value: 'Troca de Cateter', label: 'Troca Cateter', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  { value: 'Retirada de Cateter', label: 'Retirada Cateter', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  { value: 'Desobstrução (Alteplase)', label: 'Desobstrução', color: '#0d9488', bg: '#f0fdf4', border: '#99f6e4' },
  { value: 'Doppler / Exame', label: 'Doppler', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  { value: 'Revisão Cirúrgica', label: 'Revisão Cirúrgica', color: '#4338ca', bg: '#eef2ff', border: '#c7d2fe' },
  { value: 'Infecção / Cultura', label: 'Infecção', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  { value: 'Outro', label: 'Outro', color: '#475569', bg: '#f8fafc', border: '#e2e8f0' }
];

export const RESULTADOS_ACESSO = [
  { value: 'Sucesso', label: 'Sucesso' },
  { value: 'Parcial', label: 'Parcial' },
  { value: 'Insucesso', label: 'Insucesso' },
  { value: 'Estenose Dilatada', label: 'Estenose Dilatada' },
  { value: 'Trombo Removido', label: 'Trombo Removido' },
  { value: 'Sem Intercorrências', label: 'Sem Intercorrências' }
];

export const LOCALIZACOES_ACESSO_COMUNS = [
  'MSE (Radiocefálica)',
  'MSE (Braquiocefálica)',
  'MSE (Braquiobasílica)',
  'MSD (Radiocefálica)',
  'MSD (Braquiocefálica)',
  'MSD (Braquiobasílica)',
  'Jugular Interna Direita',
  'Jugular Interna Esquerda',
  'Femoral Direita',
  'Femoral Esquerda',
  'Subclávia Direita',
  'Subclávia Esquerda'
];

/**
 * Salva ou atualiza uma intervenção ou manutenção no histórico de acesso vascular
 */
export async function savePatientAccessIntervention(patientId, interventionData, interventionId = null, userEmail = '') {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado.");

  const historico = Array.isArray(patient.historicoAcesso) ? [...patient.historicoAcesso] : [];
  const targetId = interventionId || `acc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  const record = {
    ...interventionData,
    id: targetId,
    data: interventionData.data || new Date().toISOString().split('T')[0],
    tipoEvento: interventionData.tipoEvento || 'Outro',
    acesso: interventionData.acesso || patient.acessoVascular?.tipo || 'FAV',
    ladoMembro: interventionData.ladoMembro || patient.acessoVascular?.ladoMembro || '',
    profissional: interventionData.profissional || '',
    hospital: interventionData.hospital || '',
    desfecho: interventionData.desfecho || 'Sucesso',
    descricao: interventionData.descricao || '',
    conduta: interventionData.conduta || '',
    anexoUrl: interventionData.anexoUrl || '',
    registradoPor: userEmail || interventionData.registradoPor || 'Médico Responsável',
    criadoEm: interventionData.criadoEm || new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  };

  const existingIdx = historico.findIndex(item => item.id === targetId);
  if (existingIdx !== -1) {
    historico[existingIdx] = record;
  } else {
    historico.unshift(record);
  }

  // Ordena por data decrescente
  historico.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

  // Determina a última intervenção para exibir no resumo rápido
  const latest = historico[0];
  const acessoVascularAtual = {
    ...(patient.acessoVascular || {}),
    ultimaIntervencao: latest ? {
      id: latest.id,
      data: latest.data,
      tipoEvento: latest.tipoEvento,
      descricao: latest.descricao,
      desfecho: latest.desfecho
    } : null
  };

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    historicoAcesso: historico,
    acessoVascular: acessoVascularAtual,
    atualizadoEm: new Date().toISOString()
  });

  // Trilha de auditoria no Cloud Firestore
  try {
    await logAuditEvent({
      tipoAcao: interventionId ? 'ACCESS_INTERVENTION_UPDATED' : 'ACCESS_INTERVENTION_CREATED',
      descricao: `${interventionId ? 'Atualizada' : 'Registrada'} intervenção de acesso (${record.tipoEvento}) para ${patient.nome}`,
      targetDoctorId: patient.doctorId || null,
      detalhes: {
        patientId,
        patientName: patient.nome,
        interventionId: targetId,
        tipoEvento: record.tipoEvento,
        data: record.data,
        desfecho: record.desfecho
      }
    });
  } catch (err) {
    console.warn("Falha ao registrar log de auditoria da intervenção de acesso:", err);
  }

  return historico;
}

/**
 * Exclui uma intervenção de acesso do prontuário no Cloud Firestore
 */
export async function deletePatientAccessIntervention(patientId, interventionId) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient || !Array.isArray(patient.historicoAcesso)) return [];

  const itemToDelete = patient.historicoAcesso.find(item => item.id === interventionId);
  const historico = patient.historicoAcesso.filter(item => item.id !== interventionId);

  // Reordena e recalcula a última intervenção
  historico.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));
  const latest = historico[0];

  const acessoVascularAtual = {
    ...(patient.acessoVascular || {}),
    ultimaIntervencao: latest ? {
      id: latest.id,
      data: latest.data,
      tipoEvento: latest.tipoEvento,
      descricao: latest.descricao,
      desfecho: latest.desfecho
    } : null
  };

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    historicoAcesso: historico,
    acessoVascular: acessoVascularAtual,
    atualizadoEm: new Date().toISOString()
  });

  // Trilha de auditoria no Cloud Firestore
  try {
    await logAuditEvent({
      tipoAcao: 'ACCESS_INTERVENTION_DELETED',
      descricao: `Removida intervenção (${itemToDelete?.tipoEvento || 'Intervenção'}) do histórico de acesso de ${patient.nome}`,
      targetDoctorId: patient.doctorId || null,
      detalhes: {
        patientId,
        patientName: patient.nome,
        interventionId
      }
    });
  } catch (err) {
    console.warn("Falha ao registrar log de exclusão de intervenção de acesso:", err);
  }

  return historico;
}

/**
 * Atualiza os parâmetros vigentes do acesso vascular do paciente
 */
export async function updatePatientAccessVascular(patientId, acessoVascularData) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado.");

  const acessoAtual = patient.acessoVascular || {};
  const novoAcesso = {
    ...acessoAtual,
    ...acessoVascularData,
    tipo: acessoVascularData.tipo || acessoAtual.tipo || 'FAV',
    ladoMembro: acessoVascularData.ladoMembro !== undefined ? acessoVascularData.ladoMembro : (acessoAtual.ladoMembro || ''),
    fluxoSangue: acessoVascularData.fluxoSangue !== undefined ? Number(acessoVascularData.fluxoSangue) : (acessoAtual.fluxoSangue || 350),
    fluxoDialisato: acessoVascularData.fluxoDialisato !== undefined ? Number(acessoVascularData.fluxoDialisato) : (acessoAtual.fluxoDialisato || 500),
    agulha: acessoVascularData.agulha !== undefined ? acessoVascularData.agulha : (acessoAtual.agulha || '16G'),
    dataConfeccao: acessoVascularData.dataConfeccao !== undefined ? acessoVascularData.dataConfeccao : (acessoAtual.dataConfeccao || '')
  };

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    acessoVascular: novoAcesso,
    tipoAcesso: novoAcesso.tipo,
    atualizadoEm: new Date().toISOString()
  });

  try {
    await logAuditEvent({
      tipoAcao: 'ACCESS_PARAMETERS_UPDATED',
      descricao: `Atualizados parâmetros do acesso vascular (${novoAcesso.tipo}) de ${patient.nome}`,
      targetDoctorId: patient.doctorId || null,
      detalhes: {
        patientId,
        patientName: patient.nome,
        tipo: novoAcesso.tipo,
        ladoMembro: novoAcesso.ladoMembro,
        fluxoSangue: novoAcesso.fluxoSangue
      }
    });
  } catch (err) {
    console.warn("Falha ao registrar log de auditoria dos parâmetros de acesso:", err);
  }

  return novoAcesso;
}

/**
 * Atualiza campos parciais do prontuário do paciente diretamente no Cloud Firestore
 */
export async function updatePatientPartial(patientId, fieldsToUpdate = {}) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  if (!patientId) throw new Error("ID do paciente não informado.");

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  const dataToSave = {
    ...fieldsToUpdate,
    atualizadoEm: new Date().toISOString()
  };

  // Se foram alterados tipo de acesso ou posição, sincroniza o objeto estruturado acessoVascular
  if (fieldsToUpdate.tipoAcesso || fieldsToUpdate.posicaoAcesso) {
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const currentData = snap.data();
        dataToSave.acessoVascular = {
          ...(currentData.acessoVascular || {}),
          tipo: fieldsToUpdate.tipoAcesso || currentData.tipoAcesso || currentData.acessoVascular?.tipo || 'FAV',
          ladoMembro: fieldsToUpdate.posicaoAcesso || currentData.posicaoAcesso || currentData.acessoVascular?.ladoMembro || ''
        };
      }
    } catch (err) {
      console.warn("Sincronização de acessoVascular na atualização parcial:", err);
    }
  }

  await updateDoc(docRef, dataToSave);
  return dataToSave;
}




