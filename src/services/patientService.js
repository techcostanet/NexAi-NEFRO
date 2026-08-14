import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  writeBatch 
} from "firebase/firestore";
import { db } from "../config/firebase";
import localPatients from "../data/patients_db.json";

const PATIENTS_COLLECTION = "patients";

/**
 * Escuta pacientes em tempo real do Firestore
 */
export function subscribeToPatients(callback, onError) {
  if (!db) {
    if (callback) callback(localPatients);
    return () => {};
  }

  try {
    const colRef = collection(db, PATIENTS_COLLECTION);
    return onSnapshot(
      colRef, 
      (snapshot) => {
        if (snapshot.empty) {
          // Se ainda não foi populado no Firestore, retorna lista local
          callback(localPatients, true);
        } else {
          const list = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          // Ordena por nome
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
 * Busca um único paciente por ID do Firestore com fallback local
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
 * Salva ou atualiza um paciente no Firestore
 */
export async function savePatient(patient) {
  if (!db) throw new Error("Firestore não inicializado");
  const docRef = doc(db, PATIENTS_COLLECTION, patient.id);
  await setDoc(docRef, patient, { merge: true });
  return patient;
}

/**
 * Sincroniza/Importa todos os dados locais do patients_db.json para o Firestore
 */
export async function seedFirestoreWithLocalData() {
  if (!db) throw new Error("Firestore não conectado");

  const batchSize = 400; // Limite de 500 operações por batch do Firestore
  const chunks = [];
  
  for (let i = 0; i < localPatients.length; i += batchSize) {
    chunks.push(localPatients.slice(i, i + batchSize));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach(patient => {
      const docRef = doc(db, PATIENTS_COLLECTION, patient.id);
      batch.set(docRef, patient, { merge: true });
    });
    await batch.commit();
  }

  return localPatients.length;
}
