import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  writeBatch 
} from "firebase/firestore";
import { db } from "../config/firebase.js";
import { normalizeMedicamentosList } from "../data/dialysisMedications.js";
import { DEMO_PATIENTS_DATA } from "../data/demoPatients.js";

const PATIENTS_COLLECTION = "patients";

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
 * Escuta todos os pacientes em tempo real exclusivamente do Cloud Firestore
 */
export function subscribeToPatients(callback, onError) {
  if (!db) {
    if (callback) callback([]);
    return () => {};
  }

  try {
    const colRef = collection(db, PATIENTS_COLLECTION);
    return onSnapshot(
      colRef, 
      (snapshot) => {
        const list = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
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

  // Ordena por data do mais recente para o mais antigo
  historico.sort((a, b) => new Date(b.dataExame || 0) - new Date(a.dataExame || 0));

  // O exame mais recente é colocado como os exames atuais do paciente
  const latestExam = historico[0] || examRecord;

  const updatePayload = {
    historicoExames: historico,
    exames: {
      hb: latestExam.hb !== undefined ? latestExam.hb : (patient.exames?.hb || null),
      ht: latestExam.ht !== undefined ? latestExam.ht : (patient.exames?.ht || null),
      ist: latestExam.ist !== undefined ? latestExam.ist : (patient.exames?.ist || null),
      ferritina: latestExam.ferritina !== undefined ? latestExam.ferritina : (patient.exames?.ferritina || null),
      pth: latestExam.pth !== undefined ? latestExam.pth : (patient.exames?.pth || null),
      fosforo: latestExam.fosforo !== undefined ? latestExam.fosforo : (patient.exames?.fosforo || null),
      ca: latestExam.ca !== undefined ? latestExam.ca : (patient.exames?.ca || null),
      vitD: latestExam.vitD !== undefined ? latestExam.vitD : (patient.exames?.vitD || null),
      fa: latestExam.fa !== undefined ? latestExam.fa : (patient.exames?.fa || null),
      k: latestExam.k !== undefined ? latestExam.k : (patient.exames?.k || null),
      na: latestExam.na !== undefined ? latestExam.na : (patient.exames?.na || null),
      hco3: latestExam.hco3 !== undefined ? latestExam.hco3 : (patient.exames?.hco3 || null),
      ktv: latestExam.ktv !== undefined ? latestExam.ktv : (patient.exames?.ktv || null),
      ureiaPre: latestExam.ureiaPre !== undefined ? latestExam.ureiaPre : (patient.exames?.ureiaPre || null),
      ureiaPos: latestExam.ureiaPos !== undefined ? latestExam.ureiaPos : (patient.exames?.ureiaPos || null),
      creatinina: latestExam.creatinina !== undefined ? latestExam.creatinina : (patient.exames?.creatinina || null),
      albumina: latestExam.albumina !== undefined ? latestExam.albumina : (patient.exames?.albumina || null),
      pcr: latestExam.pcr !== undefined ? latestExam.pcr : (patient.exames?.pcr || null),
      glicemia: latestExam.glicemia !== undefined ? latestExam.glicemia : (patient.exames?.glicemia || null),
      hba1c: latestExam.hba1c !== undefined ? latestExam.hba1c : (patient.exames?.hba1c || null)
    },
    medicamentos: (patient.medicamentos && (Array.isArray(patient.medicamentos) ? patient.medicamentos.length > 0 : Object.keys(patient.medicamentos).length > 0)) ? patient.medicamentos : (latestExam.medicamentos || []),
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

  const docRef = doc(db, PATIENTS_COLLECTION, patientId);
  await updateDoc(docRef, {
    historicoExames: historico,
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
 * Adiciona ou edita uma evolução médica / nota de ronda no paciente no Firestore
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
 * Exclui um paciente permanentemente do Cloud Firestore
 */
export async function deletePatient(id) {
  if (!db) throw new Error("Cloud Firestore não inicializado.");
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Sincroniza e Restaura a Base Completa de Demonstração Nefrológica no Firestore
 */
export async function seedDemoPatientsToFirestore() {
  if (!db) throw new Error("Cloud Firestore não conectado.");

  const batch = writeBatch(db);
  DEMO_PATIENTS_DATA.forEach(patient => {
    const docRef = doc(db, PATIENTS_COLLECTION, patient.id);
    batch.set(docRef, {
      ...patient,
      atualizadoEm: new Date().toISOString()
    }, { merge: true });
  });

  await batch.commit();
  return DEMO_PATIENTS_DATA.length;
}
