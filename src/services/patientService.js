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
import { db } from "../config/firebase";
import localPatients from "../data/patients_db.json";
import { normalizeMedicamentosList } from "../data/dialysisMedications";

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
 * Escuta todos os pacientes em tempo real do Firestore
 */
export function subscribeToPatients(callback, onError) {
  if (!db) {
    if (callback) callback(localPatients, true);
    return () => {};
  }

  try {
    const colRef = collection(db, PATIENTS_COLLECTION);
    return onSnapshot(
      colRef, 
      (snapshot) => {
        if (snapshot.empty) {
          callback(localPatients, true);
        } else {
          const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          list.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
          callback(list, false);
        }
      },
      (error) => {
        console.warn("Erro ao ler do Firestore (usando fallback local):", error);
        if (onError) onError(error);
        if (callback) callback(localPatients, true);
      }
    );
  } catch (err) {
    console.error("Falha ao configurar snapshot do Firestore:", err);
    if (callback) callback(localPatients, true);
    return () => {};
  }
}

/**
 * Escuta um paciente específico em tempo real
 */
export function subscribeToPatientById(id, callback, onError) {
  if (!db) {
    const p = localPatients.find(item => item.id === id) || null;
    if (callback) callback(p);
    return () => {};
  }

  const docRef = doc(db, PATIENTS_COLLECTION, id);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      } else {
        const fallback = localPatients.find(item => item.id === id) || null;
        callback(fallback);
      }
    },
    (err) => {
      console.warn("Erro ao escutar paciente:", err);
      if (onError) onError(err);
      const fallback = localPatients.find(item => item.id === id) || null;
      if (callback) callback(fallback);
    }
  );
}

/**
 * Busca um único paciente por ID
 */
export async function getPatientById(id) {
  if (db) {
    try {
      const docRef = doc(db, PATIENTS_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
    } catch (err) {
      console.warn("Erro ao buscar paciente no Firestore:", err);
    }
  }
  return localPatients.find(p => p.id === id) || null;
}

/**
 * Cadastra ou Atualiza um paciente completo
 */
export async function savePatient(patientData) {
  if (!db) throw new Error("Firestore não inicializado");
  
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
 * Adiciona ou atualiza um exame com data no histórico do paciente
 */
export async function savePatientExam(patientId, examData, examIndex = null) {
  if (!db) throw new Error("Firestore não inicializado");
  
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado");

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
 * Remove um exame do histórico
 */
export async function deletePatientExam(patientId, examIndex) {
  if (!db) throw new Error("Firestore não inicializado");
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
 * Adiciona ou atualiza uma medicação no paciente
 */
export async function savePatientMedication(patientId, medData, medId = null) {
  if (!db) throw new Error("Firestore não inicializado");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado");

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
 * Remove uma medicação do paciente
 */
export async function deletePatientMedication(patientId, medId) {
  if (!db) throw new Error("Firestore não inicializado");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado");

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
 * Alterna o status ativo/suspenso de uma medicação
 */
export async function toggleMedicationStatus(patientId, medId, active) {
  if (!db) throw new Error("Firestore não inicializado");
  const patient = await getPatientById(patientId);
  if (!patient) throw new Error("Paciente não encontrado");

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
 * Exclui um paciente do Firestore
 */
export async function deletePatient(id) {
  if (!db) throw new Error("Firestore não inicializado");
  const docRef = doc(db, PATIENTS_COLLECTION, id);
  await deleteDoc(docRef);
}

/**
 * Sincroniza/Importa dados iniciais locais para o Firestore
 */
export async function seedFirestoreWithLocalData() {
  if (!db) throw new Error("Firestore não conectado");

  const batchSize = 400;
  const chunks = [];
  
  for (let i = 0; i < localPatients.length; i += batchSize) {
    chunks.push(localPatients.slice(i, i + batchSize));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach(patient => {
      const docRef = doc(db, PATIENTS_COLLECTION, patient.id);
      // Cria histórico inicial com os exames atuais
      const patientWithHistory = {
        ...patient,
        status: patient.status || "Ativo",
        clinica: patient.clinica || "Clínica Nefrológica NexAi",
        hospital: patient.hospital || "Hospital de Nefrologia",
        historicoExames: [
          {
            dataExame: "2026-08-01",
            ...patient.exames,
            medicamentos: patient.medicamentos || {}
          }
        ]
      };
      batch.set(docRef, patientWithHistory, { merge: true });
    });
    await batch.commit();
  }

  return localPatients.length;
}
