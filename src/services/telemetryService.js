import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase.js";

export const EXCLUDED_DEMO_DOCTOR_ID = "dr-marcelo";

/**
 * Módulos funcionais monitorados no NexAi-NEFRO
 */
export const SYSTEM_MODULES = [
  { id: 'prescricoes', nome: 'Prescrições Dialíticas', icon: 'FileText', color: '#2563eb' },
  { id: 'lme', nome: 'LME Alto Custo SUS', icon: 'FileCheck', color: '#16a34a' },
  { id: 'exames', nome: 'Exames Laboratoriais', icon: 'FlaskConical', color: '#0891b2' },
  { id: 'prontuario', nome: 'Prontuário e Evoluções', icon: 'Stethoscope', color: '#7c3aed' },
  { id: 'medicamentos', nome: 'Medicamentos e Fármacos', icon: 'Pill', color: '#ea580c' },
  { id: 'acessos', nome: 'Acessos e Hemoculturas', icon: 'ShieldAlert', color: '#dc2626' },
  { id: 'pesagens', nome: 'Pesagens e Controle Hídrico', icon: 'Scale', color: '#059669' },
  { id: 'transplante', nome: 'Transplante e Desfechos', icon: 'Activity', color: '#4f46e5' }
];

/**
 * Calcula a telemetria de uso dos módulos pelos médicos clientes reais,
 * com exclusão rigorosa da conta de demonstração (Dr. Marcelo Ramos).
 * 
 * @param {Array} auditLogs - Lista de logs da coleção audit_logs
 * @param {Array} patientsList - Lista de pacientes ativos no Firestore
 * @returns {Object} Estatísticas de uso por módulo e ranking
 */
export function calculateTelemetryStats(auditLogs = [], patientsList = []) {
  // 1. Filtragem estrita: Remove eventos da conta de demonstração dr-marcelo
  const realLogs = (auditLogs || []).filter(log => {
    const docId = log.targetDoctorId || log.doctorId || '';
    const adminEmail = (log.adminEmail || '').toLowerCase();
    const docName = (log.targetDoctorName || '').toLowerCase();
    return (
      docId !== EXCLUDED_DEMO_DOCTOR_ID &&
      !adminEmail.includes('dr.marcelo') &&
      !adminEmail.includes('demo@nefroapp') &&
      !docName.includes('marcelo ramos')
    );
  });

  // 2. Filtragem de pacientes de médicos reais (excluindo os 60 pacientes padrão de dr-marcelo)
  const realPatients = (patientsList || []).filter(p => {
    const docId = p.doctorId || '';
    return docId !== EXCLUDED_DEMO_DOCTOR_ID && docId !== 'demo' && !p.id?.startsWith('demo-');
  });

  const moduleCounts = {
    prescricoes: 0,
    lme: 0,
    exames: 0,
    prontuario: 0,
    medicamentos: 0,
    acessos: 0,
    pesagens: 0,
    transplante: 0
  };

  // Contabilização de ações nos logs de auditoria de médicos reais
  realLogs.forEach(log => {
    const tipo = (log.tipoAcao || '').toUpperCase();
    const desc = (log.descricao || '').toLowerCase();

    if (tipo.includes('LME') || desc.includes('lme')) {
      moduleCounts.lme += 1;
    } else if (tipo.includes('PRESC') || desc.includes('prescri') || desc.includes('dialítico')) {
      moduleCounts.prescricoes += 1;
    } else if (tipo.includes('EXAM') || desc.includes('exame') || desc.includes('laborat')) {
      moduleCounts.exames += 1;
    } else if (tipo.includes('EVOLUTION') || desc.includes('evoluç') || desc.includes('prontuário')) {
      moduleCounts.prontuario += 1;
    } else if (tipo.includes('MED') || desc.includes('medicamento')) {
      moduleCounts.medicamentos += 1;
    } else if (tipo.includes('CULTURE') || desc.includes('hemocultura') || desc.includes('acesso')) {
      moduleCounts.acessos += 1;
    } else if (tipo.includes('WEIGHT') || desc.includes('peso') || desc.includes('pesagem')) {
      moduleCounts.pesagens += 1;
    } else if (tipo.includes('TRANSPLANT') || tipo.includes('DISCHARGE') || desc.includes('transplante') || desc.includes('desligamento')) {
      moduleCounts.transplante += 1;
    }
  });

  // Contabilização direta a partir dos prontuários de pacientes reais cadastrados
  realPatients.forEach(p => {
    if (Array.isArray(p.prescricoes)) moduleCounts.prescricoes += p.prescricoes.length;
    if (Array.isArray(p.lmes)) moduleCounts.lme += p.lmes.length;
    if (Array.isArray(p.historicoExames)) moduleCounts.exames += p.historicoExames.length;
    if (Array.isArray(p.evolucoes)) moduleCounts.prontuario += p.evolucoes.length;
    if (Array.isArray(p.medicamentos)) moduleCounts.medicamentos += p.medicamentos.length;
    if (Array.isArray(p.hemoculturas)) moduleCounts.acessos += p.hemoculturas.length;
    if (Array.isArray(p.historicoPeso)) moduleCounts.pesagens += p.historicoPeso.length;
    if (p.statusTransplante || p.desfecho) moduleCounts.transplante += 1;
  });

  const totalActions = Object.values(moduleCounts).reduce((acc, val) => acc + val, 0);

  // Mapear com nomes, cores e cálculo de porcentagem
  const ranking = SYSTEM_MODULES.map(mod => {
    const count = moduleCounts[mod.id] || 0;
    const percentage = totalActions > 0 ? Number(((count / totalActions) * 100).toFixed(1)) : 0;
    return {
      ...mod,
      count,
      percentage
    };
  }).sort((a, b) => b.count - a.count);

  const topModule = ranking[0] || null;

  return {
    totalActions,
    realPatientsCount: realPatients.length,
    realLogsCount: realLogs.length,
    ranking,
    topModule,
    excludedAccount: "Dr. Marcelo Ramos (dr-marcelo)"
  };
}

/**
 * Busca todos os pacientes de médicos reais no Firestore para telemetria agregada
 */
export async function fetchRealPatientsForTelemetry() {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, "patients"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return list.filter(p => p.doctorId !== EXCLUDED_DEMO_DOCTOR_ID && !p.id?.startsWith('demo-'));
  } catch (err) {
    console.warn("Falha ao buscar pacientes para telemetria:", err);
    return [];
  }
}
