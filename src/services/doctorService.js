import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

const DOCTORS_COLLECTION = "doctors";
const DEFAULT_DOCTOR_ID = "dra-gisele";

export const INITIAL_DOCTOR_PROFILE = {
  id: DEFAULT_DOCTOR_ID,
  nome: "Dra. Gisele",
  titulo: "Médica Nefrologista",
  crm: "123456",
  ufCrm: "SP",
  rqe: "98765",
  especialidade: "Nefrologia Clínica e Hemodiálise",
  email: "dra.gisele@nefroapp.com",
  telefone: "(11) 98765-4321",
  clinicaPrincipal: "Clínica Nefrológica NexAi",
  hospitalVinculo: "Hospital Geral de Nefrologia",
  unidadeDialise: "Unidade de Diálise 1 e 2",
  bio: "Especialista em Terapia Renal Substitutiva (TRS), acompanhamento de fístulas arteriovenosas e controle do distúrbio mineral e ósseo da DRC."
};

/**
 * Escuta dados cadastrais do médico em tempo real
 */
export function subscribeDoctorProfile(doctorId = DEFAULT_DOCTOR_ID, callback) {
  if (!db) {
    if (callback) callback(INITIAL_DOCTOR_PROFILE);
    return () => {};
  }

  const docRef = doc(db, DOCTORS_COLLECTION, doctorId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      } else {
        // Se ainda não existir no Firestore, inicializa com o padrão
        setDoc(docRef, INITIAL_DOCTOR_PROFILE, { merge: true }).catch(console.error);
        callback(INITIAL_DOCTOR_PROFILE);
      }
    },
    (err) => {
      console.warn("Erro ao ler perfil do médico no Firestore:", err);
      if (callback) callback(INITIAL_DOCTOR_PROFILE);
    }
  );
}

/**
 * Salva ou atualiza os dados cadastrais do médico
 */
export async function saveDoctorProfile(doctorId = DEFAULT_DOCTOR_ID, data) {
  if (!db) throw new Error("Firestore não inicializado");
  const docRef = doc(db, DOCTORS_COLLECTION, doctorId);
  const updatedData = {
    ...data,
    atualizadoEm: new Date().toISOString()
  };
  await setDoc(docRef, updatedData, { merge: true });
  return updatedData;
}
