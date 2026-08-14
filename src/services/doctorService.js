import { doc, getDoc, setDoc, getDocs, collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase.js";

const DOCTORS_COLLECTION = "doctors";
export const DEFAULT_DOCTOR_ID = "dr-marcelo";

export const DEFAULT_DOCTORS = [
  {
    id: "dr-marcelo",
    nome: "Dr. Marcelo Ramos",
    titulo: "Médico Nefrologista & Intensivista",
    crm: "654321",
    ufCrm: "SP",
    rqe: "45890",
    especialidade: "Nefrologia Clínica, Hemodiálise e Transplante Renal",
    email: "dr.marcelo@nefroapp.com",
    telefone: "(11) 97123-4567",
    clinicaPrincipal: "Centro Nefrológico NexAi & Hospital do Rim",
    hospitalVinculo: "Hospital Estadual de Nefrologia",
    unidadeDialise: "Unidade de Hemodiálise e Diálise Peritoneal",
    bio: "Coordenador Clínico de Terapia Renal com foco em adequação dialítica (Kt/V), vigilância de acessos vasculares (FAV/Permcath) e controle de distúrbio mineral ósseo e anemia.",
    statusLicenca: "Demonstração Ativa",
    tipoConta: "Medico / Demonstração",
    pacientesCount: 6,
    criadoEm: "2026-08-01T00:00:00.000Z"
  },
  {
    id: "dra-gisele",
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
    bio: "Especialista em Terapia Renal Substitutiva (TRS), acompanhamento de fístulas arteriovenosas e controle do distúrbio mineral e ósseo da DRC.",
    statusLicenca: "Ativo",
    tipoConta: "Médico Assinante",
    pacientesCount: 15,
    criadoEm: "2026-07-15T00:00:00.000Z"
  }
];

/**
 * Escuta todos os médicos cadastrados (Para o Painel de Administração)
 */
export function subscribeDoctorsList(callback) {
  if (!db) {
    if (callback) callback(DEFAULT_DOCTORS);
    return () => {};
  }

  const colRef = collection(db, DOCTORS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Inicializa com os médicos padrão no Firestore
        DEFAULT_DOCTORS.forEach(docData => {
          const docRef = doc(db, DOCTORS_COLLECTION, docData.id);
          setDoc(docRef, docData, { merge: true }).catch(console.error);
        });
        if (callback) callback(DEFAULT_DOCTORS);
      } else {
        const list = snapshot.docs.map(snap => ({ id: snap.id, ...snap.data() }));
        if (callback) callback(list);
      }
    },
    (err) => {
      console.warn("Erro ao buscar lista de médicos:", err);
      if (callback) callback(DEFAULT_DOCTORS);
    }
  );
}

/**
 * Escuta dados cadastrais de um médico específico em tempo real
 */
export function subscribeDoctorProfile(doctorId = DEFAULT_DOCTOR_ID, callback) {
  if (!db) {
    const fallback = DEFAULT_DOCTORS.find(d => d.id === doctorId) || DEFAULT_DOCTORS[0];
    if (callback) callback(fallback);
    return () => {};
  }

  const docRef = doc(db, DOCTORS_COLLECTION, doctorId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      } else {
        const defaultDoc = DEFAULT_DOCTORS.find(d => d.id === doctorId) || DEFAULT_DOCTORS[0];
        setDoc(docRef, defaultDoc, { merge: true }).catch(console.error);
        callback(defaultDoc);
      }
    },
    (err) => {
      console.warn("Erro ao ler perfil do médico no Firestore:", err);
      const fallback = DEFAULT_DOCTORS.find(d => d.id === doctorId) || DEFAULT_DOCTORS[0];
      if (callback) callback(fallback);
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
    id: doctorId,
    atualizadoEm: new Date().toISOString()
  };
  await setDoc(docRef, updatedData, { merge: true });
  return updatedData;
}
