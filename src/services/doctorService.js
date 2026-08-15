import { doc, getDoc, setDoc, getDocs, collection, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase.js";
import { logAuditEvent } from "./auditService.js";

const DOCTORS_COLLECTION = "doctors";
export const DEFAULT_DOCTOR_ID = "dr-marcelo";

export const DEFAULT_DOCTORS = [
  {
    id: "dr-marcelo",
    nome: "Dr. Marcelo Ramos",
    titulo: "Médico Nefrologista & Intensivista",
    cpf: "123.456.789-00",
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
    statusLicenca: "Trial",
    tipoConta: "Medico / Demonstração",
    plano: "Demonstração",
    valorMensalidade: 0,
    dataInicioAssinatura: "2026-08-01T00:00:00.000Z",
    dataFimAssinatura: "2026-12-31T23:59:59.000Z",
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
        nome: "Centro Nefrológico NexAi & Hospital do Rim", 
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
        nome: "Hospital Estadual de Nefrologia", 
        tipo: "Hospital Geral", 
        cidade: "São Paulo/SP", 
        turnos: "Interconsultas e UTI",
        diasSemana: "Diário",
        rtNome: "Dr. Roberto Silveira",
        rtCrm: "112233/SP",
        telefoneEnfermagem: "(11) 98888-1111",
        status: "Ativo",
        criadoEm: "2026-08-01T00:00:00.000Z"
      },
      { 
        id: "loc-03", 
        nome: "Consultório Privado Dr. Marcelo", 
        tipo: "Ambulatório", 
        cidade: "São Paulo/SP", 
        turnos: "Manhã e Tarde",
        diasSemana: "Ter/Qui",
        rtNome: "Dr. Marcelo Ramos",
        rtCrm: "654321/SP",
        telefoneEnfermagem: "(11) 97123-4567",
        status: "Ativo",
        criadoEm: "2026-08-01T00:00:00.000Z"
      }
    ],
    pacientesCount: 6,
    criadoEm: "2026-08-01T00:00:00.000Z"
  },
  {
    id: "dra-gisele",
    nome: "Dra. Gisele",
    titulo: "Médica Nefrologista",
    cpf: "987.654.321-11",
    crm: "123456",
    ufCrm: "SP",
    rqe: "98765",
    especialidade: "Nefrologia Clínica e Hemodiálise",
    email: "dra.gisele@nefroapp.com",
    telefone: "(11) 98765-4321",
    clinicaPrincipal: "Dialize Betim",
    hospitalVinculo: "Hospital Geral de Nefrologia",
    unidadeDialise: "Unidade de Diálise 1 e 2",
    bio: "Especialista em Terapia Renal Substitutiva (TRS), acompanhamento de fístulas arteriovenosas e controle do distúrbio mineral e ósseo da DRC.",
    statusLicenca: "Ativo",
    tipoConta: "Médico Assinante",
    plano: "Mensal",
    valorMensalidade: 490.00,
    dataInicioAssinatura: "2026-07-15T00:00:00.000Z",
    dataFimAssinatura: "2026-09-15T23:59:59.000Z",
    historicoPagamentos: [
      {
        id: "pag-gis-01",
        data: "2026-07-15T14:30:00.000Z",
        valor: 490.00,
        plano: "Plano Mensal Nefrologia",
        status: "Pago",
        metodo: "PIX",
        referencia: "Mensalidade Jul/Ago 2026"
      },
      {
        id: "pag-gis-02",
        data: "2026-08-15T11:00:00.000Z",
        valor: 490.00,
        plano: "Plano Mensal Nefrologia",
        status: "Pago",
        metodo: "Cartão de Crédito",
        referencia: "Mensalidade Ago/Set 2026"
      }
    ],
    locaisAtuacao: [
      { 
        id: "loc-04", 
        nome: "Dialize Betim", 
        tipo: "Clínica de Hemodiálise", 
        cidade: "Betim/MG", 
        turnos: "1º, 2º e 3º Turnos",
        diasSemana: "Seg/Qua/Sex",
        rtNome: "Dra. Gisele",
        rtCrm: "123456/SP",
        telefoneEnfermagem: "(11) 98765-4321",
        status: "Ativo",
        criadoEm: "2026-07-15T00:00:00.000Z"
      },
      { 
        id: "loc-05", 
        nome: "Hospital Geral de Nefrologia", 
        tipo: "Hospital Geral", 
        cidade: "São Paulo/SP", 
        turnos: "Plantão e Interconsulta",
        diasSemana: "Ter/Qui/Sáb",
        rtNome: "Dr. Fernando Duarte",
        rtCrm: "78910/SP",
        telefoneEnfermagem: "(11) 97777-3333",
        status: "Ativo",
        criadoEm: "2026-07-15T00:00:00.000Z"
      }
    ],
    pacientesCount: 15,
    criadoEm: "2026-07-15T00:00:00.000Z"
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


