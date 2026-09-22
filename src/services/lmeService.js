import { LME_MEDICAMENTOS, buildLmeClinicalReportText } from '../data/lmeProtocols.js';

/**
 * Serviço de Inteligência de Negócio e Gestão de LME (Alto Custo / CEAF)
 */

/**
 * Extrai os exames laboratoriais mais recentes do prontuário para o formulário LME
 */
export function extractLatestExamsForLme(patient) {
  const current = patient?.exames || {};
  const historico = Array.isArray(patient?.historicoExames) ? patient.historicoExames : [];
  const latestHist = historico.length > 0 ? historico[0] : null;

  const defaultDate = latestHist?.data || patient?.atualizadoEm?.split('T')[0] || new Date().toISOString().split('T')[0];

  const getVal = (key, fallbackKey) => {
    if (current[key] !== undefined && current[key] !== null && current[key] !== '') return current[key];
    if (fallbackKey && current[fallbackKey] !== undefined && current[fallbackKey] !== null && current[fallbackKey] !== '') return current[fallbackKey];
    if (latestHist?.exames?.[key] !== undefined && latestHist?.exames?.[key] !== null) return latestHist.exames[key];
    return '';
  };

  const getExamDate = (key) => {
    // Procura no histórico recente se há data específica deste exame
    for (const h of historico) {
      if (h.exames && (h.exames[key] !== undefined && h.exames[key] !== null && h.exames[key] !== '')) {
        return h.data || defaultDate;
      }
    }
    return defaultDate;
  };

  const hb = getVal('hb');
  const ht = getVal('ht');
  const ferritina = getVal('ferritina');
  const ist = getVal('ist');
  const fosforo = getVal('fosforo', 'p');
  const ca = getVal('ca');
  const pth = getVal('pth');
  const ktv = getVal('ktv');

  let caxp = '';
  const numCa = parseFloat(String(ca).replace(',', '.'));
  const numP = parseFloat(String(fosforo).replace(',', '.'));
  if (!isNaN(numCa) && !isNaN(numP)) {
    caxp = (numCa * numP).toFixed(1);
  }

  return {
    hb: { valor: hb, data: getExamDate('hb') },
    ht: { valor: ht, data: getExamDate('ht') },
    ferritina: { valor: ferritina, data: getExamDate('ferritina') },
    ist: { valor: ist, data: getExamDate('ist') },
    fosforo: { valor: fosforo, data: getExamDate('fosforo') },
    ca: { valor: ca, data: getExamDate('ca') },
    caxp: { valor: caxp, data: defaultDate },
    pth: { valor: pth, data: getExamDate('pth') },
    ktv: { valor: ktv, data: getExamDate('ktv') }
  };
}

/**
 * Calcula o status de validade e tempo restante de uma LME
 */
export function getLmeExpirationStatus(lme) {
  if (!lme) return { status: 'desconhecido', label: 'Não informado', diasRestantes: 0, color: '#64748b', bg: '#f1f5f9' };

  let dataFim = lme.dataValidade;
  if (!dataFim && lme.dataSolicitacao) {
    const meses = Number(lme.vigenciaMeses || 6);
    const d = new Date(lme.dataSolicitacao);
    d.setMonth(d.getMonth() + meses);
    dataFim = d.toISOString().split('T')[0];
  }

  if (!dataFim) {
    return { status: 'indefinido', label: 'Sem data de validade', diasRestantes: 0, color: '#64748b', bg: '#f1f5f9' };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [ano, mes, dia] = dataFim.split('-').map(Number);
  const dataVal = new Date(ano, mes - 1, dia);
  dataVal.setHours(0, 0, 0, 0);

  const diffMs = dataVal.getTime() - hoje.getTime();
  const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) {
    const diasVencido = Math.abs(diasRestantes);
    return {
      status: 'vencido',
      label: diasVencido === 0 ? 'Vence hoje' : `Vencida há ${diasVencido}d`,
      diasRestantes,
      diasVencido,
      color: '#dc2626',
      bg: '#fee2e2',
      border: '#fca5a5'
    };
  }

  if (diasRestantes <= 30) {
    return {
      status: 'a_vencer',
      label: diasRestantes === 0 ? 'Vence hoje' : `Vence em ${diasRestantes}d`,
      diasRestantes,
      color: '#d97706',
      bg: '#fef3c7',
      border: '#fde68a'
    };
  }

  return {
    status: 'vigente',
    label: `${diasRestantes} dias restantes`,
    diasRestantes,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0'
  };
}

/**
 * Avalia elegibilidade prévia aos critérios normativos do PCDT / Ministério da Saúde
 */
export function evaluateLmePcdtCriteria(medicamentoId, examesValores) {
  const med = LME_MEDICAMENTOS.find(m => m.id === medicamentoId);
  if (!med || !med.avaliarElegibilidade) {
    return { alertas: [], conformidades: [], elegivel: true };
  }

  // Prepara mapa simples de valores numéricos
  const plainExames = {};
  Object.keys(examesValores || {}).forEach(k => {
    const item = examesValores[k];
    plainExames[k] = (item && typeof item === 'object' && 'valor' in item) ? item.valor : item;
  });

  return med.avaliarElegibilidade(plainExames);
}

/**
 * Retorna lista consolidada de todos os pacientes com alertas de LME (vencidas ou a vencer em <= 30 dias)
 */
export function getPatientsWithLmeAlerts(patients = []) {
  const expiring = [];
  const expired = [];
  const activeLmesList = [];

  patients.forEach(patient => {
    const lmes = Array.isArray(patient?.lmes) ? patient.lmes : [];
    lmes.forEach(lme => {
      const expStatus = getLmeExpirationStatus(lme);
      const lmeWithPatient = { ...lme, patient, expStatus };
      
      activeLmesList.push(lmeWithPatient);

      if (expStatus.status === 'vencido') {
        expired.push(lmeWithPatient);
      } else if (expStatus.status === 'a_vencer') {
        expiring.push(lmeWithPatient);
      }
    });
  });

  return {
    totalLmes: activeLmesList.length,
    expiring,
    expired,
    totalAlerts: expiring.length + expired.length,
    allLmes: activeLmesList
  };
}

export { LME_MEDICAMENTOS, buildLmeClinicalReportText };
