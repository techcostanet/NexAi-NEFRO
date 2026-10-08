import { 
  collection, 
  doc, 
  getDocs,
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

const COLLECTION_NAME = 'appointments';

export const APPOINTMENT_STATUSES = [
  { value: 'Agendado', label: 'Agendado', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { value: 'Confirmado', label: 'Confirmado', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  { value: 'Aguardando', label: 'Aguardando', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { value: 'Atendido', label: 'Atendido', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  { value: 'Faltou', label: 'Faltou', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  { value: 'Cancelado', label: 'Cancelado', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' }
];

export const APPOINTMENT_TYPES = [
  { value: 'Primeira Vez', label: 'Primeira Vez' },
  { value: 'Retorno', label: 'Retorno' },
  { value: 'Encaixe', label: 'Encaixe' },
  { value: 'Avaliação Pré-Transplante', label: 'Pré-Transplante' },
  { value: 'Conservador DRC', label: 'Conservador DRC' }
];

/**
 * Escuta em tempo real os agendamentos de um médico específico
 */
export function subscribeDoctorAppointments(doctorId, callback) {
  if (!doctorId) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('doctorId', '==', doctorId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        // Ordena por data e hora no cliente para garantir consistência
        list.sort((a, b) => {
          const dtA = `${a.data || ''} ${a.hora || ''}`;
          const dtB = `${b.data || ''} ${b.hora || ''}`;
          return dtA.localeCompare(dtB);
        });

        callback(list);
      },
      (error) => {
        console.error('Erro no listener de agendamentos do Firestore:', error);
        callback([]);
      }
    );
  } catch (err) {
    console.error('Falha ao inicializar listener de agendamentos:', err);
    callback([]);
    return () => {};
  }
}

/**
 * Cria um novo agendamento no Cloud Firestore
 */
export async function createAppointment(appointmentData) {
  const payload = {
    ...appointmentData,
    status: appointmentData.status || 'Agendado',
    tipo: appointmentData.tipo || 'Retorno',
    modalidade: appointmentData.modalidade || 'Particular',
    valor: Number(appointmentData.valor) || 0,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
  return { id: docRef.id, ...payload };
}

/**
 * Atualiza dados de um agendamento existente
 */
export async function updateAppointment(appointmentId, updates) {
  if (!appointmentId) throw new Error('ID do agendamento é obrigatório');
  const docRef = doc(db, COLLECTION_NAME, appointmentId);
  const payload = {
    ...updates,
    atualizadoEm: new Date().toISOString()
  };
  await updateDoc(docRef, payload);
  return { id: appointmentId, ...payload };
}

/**
 * Atualiza o status de uma consulta de forma rápida
 */
export async function updateAppointmentStatus(appointmentId, newStatus) {
  return updateAppointment(appointmentId, { status: newStatus });
}

/**
 * Remove um agendamento do Cloud Firestore
 */
export async function deleteAppointment(appointmentId) {
  if (!appointmentId) throw new Error('ID do agendamento é obrigatório');
  const docRef = doc(db, COLLECTION_NAME, appointmentId);
  await deleteDoc(docRef);
  return true;
}

/**
 * Cria agendamentos de demonstração no Cloud Firestore caso a agenda do médico esteja vazia
 */
export async function seedDemoAppointmentsIfEmpty(doctorId = 'dr-marcelo') {
  if (!doctorId || !db) return;
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Consulta se já existem agendamentos para o médico
    const q = query(
      collection(db, COLLECTION_NAME),
      where('doctorId', '==', doctorId)
    );
    
    const snap = await getDocs(q);
    
    if (!snap.empty) return; // Já possui agendamentos

    const demoItems = [
      {
        doctorId,
        patientNome: 'Mariana Vasconcelos',
        patientTelefone: '(11) 98765-4321',
        patientCpf: '234.567.890-12',
        data: todayStr,
        hora: '08:30',
        tipo: 'Primeira Vez',
        status: 'Atendido',
        modalidade: 'Particular',
        convenioNome: '',
        valor: 450.00,
        observacoes: 'Investigação de proteinúria isolada e microhematúria em check-up de rotina.',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      },
      {
        doctorId,
        patientNome: 'Carlos Eduardo Mendes',
        patientTelefone: '(11) 99123-4567',
        patientCpf: '345.678.901-23',
        data: todayStr,
        hora: '09:30',
        tipo: 'Retorno',
        status: 'Aguardando',
        modalidade: 'Particular',
        convenioNome: '',
        valor: 380.00,
        observacoes: 'Seguimento de DRC Estágio 3b, ajuste de medicação anti-hipertensiva e metas de fósforo.',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      },
      {
        doctorId,
        patientNome: 'Beatriz Souza Lima',
        patientTelefone: '(11) 97654-3210',
        patientCpf: '456.789.012-34',
        data: todayStr,
        hora: '10:30',
        tipo: 'Retorno',
        status: 'Confirmado',
        modalidade: 'Convênio',
        convenioNome: 'Unimed Pleno',
        valor: 0.00,
        observacoes: 'Conferência de curva de função renal e sedimentoscopia urinária.',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      },
      {
        doctorId,
        patientNome: 'Fernando Augusto Ribeiro',
        patientTelefone: '(11) 98234-5678',
        patientCpf: '567.890.123-45',
        data: todayStr,
        hora: '14:00',
        tipo: 'Avaliação Pré-Transplante',
        status: 'Agendado',
        modalidade: 'Particular',
        convenioNome: '',
        valor: 500.00,
        observacoes: 'Triagem clínica e imunológica para preparo de transplante com doador vivo.',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      },
      {
        doctorId,
        patientNome: 'Luciana Ramos Dias',
        patientTelefone: '(11) 99876-5432',
        patientCpf: '678.901.234-56',
        data: todayStr,
        hora: '15:30',
        tipo: 'Conservador DRC',
        status: 'Agendado',
        modalidade: 'Particular',
        convenioNome: '',
        valor: 380.00,
        observacoes: 'Manejo conservador para retardo da progressão de nefropatia diabética.',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      }
    ];

    for (const item of demoItems) {
      await addDoc(collection(db, COLLECTION_NAME), item);
    }
  } catch (err) {
    console.warn('Falha no seed de agendamentos de demonstração:', err);
  }
}

