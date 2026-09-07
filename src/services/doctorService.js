import { doc, getDoc, setDoc, getDocs, collection, onSnapshot, updateDoc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "../config/firebase.js";
import { logAuditEvent } from "./auditService.js";

const DOCTORS_COLLECTION = "doctors";
export const DEFAULT_DOCTOR_ID = "dr-marcelo";

export const DEFAULT_DOCTORS = [
  {
    id: "dr-marcelo",
    nome: "Dr. Marcelo Ramos (Demonstração)",
    titulo: "Médico Nefrologista & Intensivista",
    cpf: "000.123.456-00 (Fictício)",
    crm: "654321",
    ufCrm: "SP",
    rqe: "45890",
    especialidade: "Nefrologia Clínica, Hemodiálise e Transplante Renal",
    email: "dr.marcelo@nefroapp.com",
    telefone: "(11) 97123-4567",
    clinicaPrincipal: "Clínica Nefrológica Virtual Modelo (Demonstração)",
    hospitalVinculo: "Hospital Escola Simulado NexAi (Demonstração)",
    unidadeDialise: "Unidade de Hemodiálise e Diálise Peritoneal Simulada",
    bio: "Perfil demonstrativo para apresentação e testes clínicos do NexAi-NEFRO. Contém pacientes fictícios de simulação de adequação dialítica, acessos vasculares e condutas nefrológicas.",
    statusLicenca: "Trial",
    tipoConta: "Medico / Demonstração",
    plano: "Demonstração",
    valorMensalidade: 0,
    dataInicioAssinatura: "2026-08-01T00:00:00.000Z",
    dataFimAssinatura: "2027-12-31T23:59:59.000Z",
    historicoPagamentos: [
      {
        id: "pag-demo-01",
        data: "2026-08-01T10:00:00.000Z",
        valor: 0,
        plano: "Demonstração Completa",
        status: "Pago",
        metodo: "Cortesia Demonstração",
        referencia: "Ciclo Inicial Trial"
      }
    ],
    locaisAtuacao: [
      { 
        id: "loc-01", 
        nome: "Clínica Nefrológica Virtual Modelo (Demonstração)", 
        tipo: "Clínica de Hemodiálise", 
        cidade: "São Paulo/SP", 
        turnos: "1º, 2º e 3º Turnos",
        diasSemana: "Seg/Qua/Sex",
        rtNome: "Dr. Marcelo Ramos (Demonstração)",
        rtCrm: "654321/SP",
        telefoneEnfermagem: "(11) 90000-0000",
        status: "Ativo",
        criadoEm: "2026-08-01T00:00:00.000Z"
      },
      { 
        id: "loc-02", 
        nome: "Hospital Escola Simulado NexAi (Demonstração)", 
        tipo: "Hospital Geral", 
        cidade: "São Paulo/SP", 
        turnos: "Interconsultas e UTI",
        diasSemana: "Diário",
        rtNome: "Dr. Roberto Silveira (Simulado)",
        rtCrm: "112233/SP",
        telefoneEnfermagem: "(11) 90000-1111",
        status: "Ativo",
        criadoEm: "2026-08-01T00:00:00.000Z"
      },
      { 
        id: "loc-03", 
        nome: "Consultório Ambulatorial Simulado (Demonstração)", 
        tipo: "Ambulatório", 
        cidade: "São Paulo/SP", 
        turnos: "Manhã e Tarde",
        diasSemana: "Ter/Qui",
        rtNome: "Dr. Marcelo Ramos (Demonstração)",
        rtCrm: "654321/SP",
        telefoneEnfermagem: "(11) 90000-2222",
        status: "Ativo",
        criadoEm: "2026-08-01T00:00:00.000Z"
      }
    ],
    pacientesCount: 6,
    criadoEm: "2026-08-01T00:00:00.000Z"
  }
];

/**
 * Escuta todos os médicos cadastrados em tempo real no Cloud Firestore
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
        // Inicializa com os médicos padrão no Firestore se vazio
        DEFAULT_DOCTORS.forEach(docData => {
          const docRef = doc(db, DOCTORS_COLLECTION, docData.id);
          setDoc(docRef, docData, { merge: true }).catch(console.error);
        });
        if (callback) callback(DEFAULT_DOCTORS);
      } else {
        const list = snapshot.docs.map(snap => ({ id: snap.id, ...snap.data() }));
        list.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
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
 * Escuta dados cadastrais e de licença de um médico específico em tempo real
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
 * Salva ou atualiza os dados cadastrais e financeiros do médico no Firestore
 */
export async function saveDoctorProfile(doctorId, data) {
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

/**
 * Altera o status da licença médica com registro imutável na trilha de auditoria
 * @param {string} doctorId - ID do médico
 * @param {string} newStatus - 'Ativo' | 'Trial' | 'Suspenso' | 'Cancelado'
 * @param {string} [motivo] - Justificativa da alteração
 * @param {string} [adminEmail] - E-mail do administrador
 */
export async function toggleDoctorLicenseStatus(doctorId, newStatus, motivo = "", adminEmail = "admin@nefroapp.com") {
  if (!db) throw new Error("Firestore não inicializado");
  const docRef = doc(db, DOCTORS_COLLECTION, doctorId);
  const snap = await getDoc(docRef);
  
  if (!snap.exists()) {
    throw new Error("Médico não encontrado no Firestore.");
  }

  const docData = snap.data();
  const oldStatus = docData.statusLicenca || "Ativo";

  await updateDoc(docRef, {
    statusLicenca: newStatus,
    atualizadoEm: new Date().toISOString()
  });

  const tipoAcao = newStatus === 'Suspenso' ? 'LICENSE_PAUSED' : 
                   newStatus === 'Ativo' ? 'LICENSE_REACTIVATED' : 'LICENSE_UPDATE';

  await logAuditEvent({
    tipoAcao,
    descricao: `Alteração de status da licença de ${docData.nome}: de '${oldStatus}' para '${newStatus}'. ${motivo ? `Motivo: ${motivo}` : ''}`,
    targetDoctorId: doctorId,
    targetDoctorName: docData.nome,
    adminEmail,
    detalhes: { oldStatus, newStatus, motivo }
  });

  return { ...docData, statusLicenca: newStatus };
}

/**
 * Renova a vigência da assinatura do médico e adiciona um lançamento no histórico de pagamentos
 * @param {string} doctorId - ID do médico
 * @param {number} mesesAdicionais - 1 para mensal, 12 para anual
 * @param {Object} paymentInfo - { valor, metodo, referencia, adminEmail }
 */
export async function renewDoctorLicense(doctorId, mesesAdicionais = 1, paymentInfo = {}) {
  if (!db) throw new Error("Firestore não inicializado");
  const docRef = doc(db, DOCTORS_COLLECTION, doctorId);
  const snap = await getDoc(docRef);
  
  if (!snap.exists()) {
    throw new Error("Médico não encontrado no Firestore.");
  }

  const docData = snap.data();
  const hoje = new Date();
  
  // Se a assinatura atual já expirou, calcula a partir de hoje; se ainda vigora, soma ao término atual
  let baseDate = new Date();
  if (docData.dataFimAssinatura) {
    const currentEnd = new Date(docData.dataFimAssinatura);
    if (currentEnd > hoje) {
      baseDate = currentEnd;
    }
  }

  const novaDataFim = new Date(baseDate);
  novaDataFim.setMonth(novaDataFim.getMonth() + mesesAdicionais);

  const novoPagamento = {
    id: `pag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    data: new Date().toISOString(),
    valor: paymentInfo.valor !== undefined ? Number(paymentInfo.valor) : (mesesAdicionais === 12 ? 4900.00 : 490.00),
    plano: mesesAdicionais === 12 ? "Plano Anual Nefrologia" : "Plano Mensal Nefrologia",
    status: "Pago",
    metodo: paymentInfo.metodo || "PIX",
    referencia: paymentInfo.referencia || `Renovação por +${mesesAdicionais} mês(es)`
  };

  const historico = Array.isArray(docData.historicoPagamentos) ? [...docData.historicoPagamentos] : [];
  historico.unshift(novoPagamento);

  const payload = {
    statusLicenca: "Ativo",
    dataFimAssinatura: novaDataFim.toISOString(),
    historicoPagamentos: historico,
    atualizadoEm: new Date().toISOString()
  };

  await updateDoc(docRef, payload);

  await logAuditEvent({
    tipoAcao: 'LICENSE_RENEWED',
    descricao: `Renovação de licença para ${docData.nome}: +${mesesAdicionais} mês(es) (Vencimento: ${novaDataFim.toLocaleDateString('pt-BR')}) - Valor: R$ ${novoPagamento.valor.toFixed(2)}`,
    targetDoctorId: doctorId,
    targetDoctorName: docData.nome,
    adminEmail: paymentInfo.adminEmail || "admin@nefroapp.com",
    detalhes: { mesesAdicionais, novaDataFim: novaDataFim.toISOString(), pagamento: novoPagamento }
  });

  return { ...docData, ...payload };
}

/**
 * Adiciona um novo local de atuação / clínica ao perfil do médico no Firestore
 */
export async function addDoctorLocation(doctorId, locationData) {
  if (!db) throw new Error("Firestore não inicializado");
  const docRef = doc(db, DOCTORS_COLLECTION, doctorId);
  const snap = await getDoc(docRef);
  
  if (!snap.exists()) throw new Error("Médico não encontrado");
  const docData = snap.data();

  const locais = Array.isArray(docData.locaisAtuacao) ? [...docData.locaisAtuacao] : [];
  const newLoc = {
    id: `loc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    nome: locationData.nome.trim(),
    tipo: locationData.tipo || "Clínica de Hemodiálise",
    cidade: locationData.cidade || "",
    endereco: locationData.endereco || "",
    turnos: locationData.turnos || "Todos os Turnos",
    diasSemana: locationData.diasSemana || "Seg/Qua/Sex",
    rtNome: locationData.rtNome || "",
    rtCrm: locationData.rtCrm || "",
    telefoneEnfermagem: locationData.telefoneEnfermagem || "",
    status: locationData.status || "Ativo",
    criadoEm: new Date().toISOString()
  };

  locais.push(newLoc);

  await updateDoc(docRef, {
    locaisAtuacao: locais,
    atualizadoEm: new Date().toISOString()
  });

  return locais;
}

/**
 * Atualiza um local de atuação existente no Firestore
 */
export async function updateDoctorLocation(doctorId, locationId, updatedData) {
  if (!db) throw new Error("Firestore não inicializado");
  const docRef = doc(db, DOCTORS_COLLECTION, doctorId);
  const snap = await getDoc(docRef);
  
  if (!snap.exists()) throw new Error("Médico não encontrado");
  const docData = snap.data();

  const locais = Array.isArray(docData.locaisAtuacao) ? [...docData.locaisAtuacao] : [];
  const index = locais.findIndex(l => l.id === locationId);
  
  if (index === -1) throw new Error("Local de atuação não encontrado");

  locais[index] = {
    ...locais[index],
    ...updatedData,
    id: locationId,
    atualizadoEm: new Date().toISOString()
  };

  await updateDoc(docRef, {
    locaisAtuacao: locais,
    atualizadoEm: new Date().toISOString()
  });

  return locais;
}

/**
 * Alterna o status do local de atuação entre 'Ativo' e 'Inativo'
 */
export async function toggleDoctorLocationStatus(doctorId, locationId) {
  if (!db) throw new Error("Firestore não inicializado");
  const docRef = doc(db, DOCTORS_COLLECTION, doctorId);
  const snap = await getDoc(docRef);
  
  if (!snap.exists()) throw new Error("Médico não encontrado");
  const docData = snap.data();

  const locais = Array.isArray(docData.locaisAtuacao) ? [...docData.locaisAtuacao] : [];
  const index = locais.findIndex(l => l.id === locationId);
  
  if (index === -1) throw new Error("Local de atuação não encontrado");

  const statusAtual = locais[index].status || 'Ativo';
  const novoStatus = statusAtual === 'Ativo' ? 'Inativo' : 'Ativo';

  locais[index] = {
    ...locais[index],
    status: novoStatus,
    atualizadoEm: new Date().toISOString()
  };

  await updateDoc(docRef, {
    locaisAtuacao: locais,
    atualizadoEm: new Date().toISOString()
  });

  return locais;
}

/**
 * Remove um local de atuação do perfil do médico no Firestore
 */
export async function removeDoctorLocation(doctorId, locationId) {
  if (!db) throw new Error("Firestore não inicializado");
  const docRef = doc(db, DOCTORS_COLLECTION, doctorId);
  const snap = await getDoc(docRef);
  
  if (!snap.exists()) throw new Error("Médico não encontrado");
  const docData = snap.data();

  let locais = Array.isArray(docData.locaisAtuacao) ? [...docData.locaisAtuacao] : [];
  locais = locais.filter(l => l.id !== locationId);

  await updateDoc(docRef, {
    locaisAtuacao: locais,
    atualizadoEm: new Date().toISOString()
  });

  return locais;
}

/**
 * Exclui permanentemente uma licença médica e seus registros vinculados no Cloud Firestore
 * @param {string} doctorId - ID do médico a ser removido
 * @param {string} [adminEmail='admin@nefroapp.com'] - E-mail do administrador executor
 */
export async function deleteDoctor(doctorId, adminEmail = "admin@nefroapp.com") {
  if (!db) throw new Error("Firestore não inicializado");
  
  const docRef = doc(db, DOCTORS_COLLECTION, doctorId);
  const snap = await getDoc(docRef);
  const docData = snap.exists() ? snap.data() : { nome: doctorId };

  // 1. Excluir da coleção doctors
  await deleteDoc(docRef);

  // 2. Excluir usuários associados na coleção users
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const batch = writeBatch(db);
    let countUsers = 0;
    usersSnap.forEach(uDoc => {
      const uData = uDoc.data();
      if (uData.doctorId === doctorId || uData.activeTenantId === doctorId) {
        batch.delete(doc(db, "users", uDoc.id));
        countUsers++;
      }
    });
    if (countUsers > 0) {
      await batch.commit();
    }
  } catch (err) {
    console.warn("Aviso ao remover usuários vinculados:", err);
  }

  // 3. Excluir pacientes associados na coleção patients
  try {
    const patientsSnap = await getDocs(collection(db, "patients"));
    const pBatch = writeBatch(db);
    let countPatients = 0;
    patientsSnap.forEach(pDoc => {
      const pData = pDoc.data();
      if (pData.doctorId === doctorId) {
        pBatch.delete(doc(db, "patients", pDoc.id));
        countPatients++;
      }
    });
    if (countPatients > 0) {
      await pBatch.commit();
    }
  } catch (err) {
    console.warn("Aviso ao remover pacientes vinculados:", err);
  }

  // 4. Registrar evento de auditoria imutável
  await logAuditEvent({
    tipoAcao: 'LICENSE_DELETED',
    descricao: `Licença de ${docData.nome || doctorId} excluída permanentemente pelo administrador`,
    targetDoctorId: doctorId,
    targetDoctorName: docData.nome || doctorId,
    adminEmail,
    detalhes: { doctorId, deletedDoctor: docData }
  });

  return true;
}
