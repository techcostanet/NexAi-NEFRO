/**
 * monthlyEvolutionGenerator.js
 * 
 * Módulo inteligente para auditoria de conformidade de prontuário e geração
 * automatizada da Evolução Médica Mensal de Hemodiálise (Padrão SBN / KDIGO / RDC 11 ANVISA).
 * Suporta modelo configurável com reordenação e ativação/desativação de seções por médico.
 */

import { calculateAge, consolidatePatientExams, ETIOLOGIAS_DRC_PADRAO, LOCALIZACOES_ACESSO_COMUNS } from '../services/patientService.js';
import { safeFormatDate, normalizeDateToString } from './dateUtils.js';
import { calculateCorrectedCalcium } from './examRanges.js';

/**
 * Catálogo padrão de seções da Evolução Médica Mensal
 */
export const DEFAULT_EVOLUTION_SECTIONS = [
  { id: 'identificacao', label: 'Identificação e TRS', descricao: 'Idade, etiologia, tempo de diálise e rotina', ativo: true },
  { id: 'acessoVascular', label: 'Acesso Vascular', descricao: 'Tipo de acesso, localização, integridade e fluxo Qb', ativo: true },
  { id: 'estadoClinico', label: 'Estado Clínico e Volêmico', descricao: 'Peso seco meta, ganho ponderal, exame físico e alergias', ativo: true },
  { id: 'adequacao', label: 'Adequação Dialítica', descricao: 'Kt/V com meta KDIGO/SBN, URR e ureias pré/pós', ativo: true },
  { id: 'anemia', label: 'Anemia e Metabolismo Férreo', descricao: 'Hb, Ht, Ferritina, IST, Ferro e doses de EPO/Ferro', ativo: true },
  { id: 'dmo', label: 'Metabolismo Ósseo', descricao: 'PTH, Cálcio Corrigido, Fósforo, FA e quelantes/análogos', ativo: true },
  { id: 'eletrolitos', label: 'Eletrólitos e Ácido Básico', descricao: 'Potássio, Sódio e Bicarbonato séricos', ativo: true },
  { id: 'nutricao', label: 'Nutrição e Inflamação', descricao: 'Albumina, PCR, Glicemia, HbA1c e enzimas hepáticas', ativo: true },
  { id: 'sorologias', label: 'Sorologias Periódicas', descricao: 'Rastreio de Anti-HCV, HBsAg, Anti-HBs e HIV', ativo: true },
  { id: 'exames', label: 'Exames Consolidados', descricao: 'Quadro analítico completo com todos os últimos exames do prontuário', ativo: true },
  { id: 'transplante', label: 'Transplante Renal', descricao: 'Status em lista de espera ou contraindicações', ativo: true },
  { id: 'conduta', label: 'Conduta e Plano Terapêutico', descricao: 'Recomendações dialíticas, ponderais e medicamentosas', ativo: true }
];

/**
 * Extrai os exames consolidados e respectivas datas do paciente com segurança
 */
export function getConsolidatedPatientExams(patient) {
  if (!patient || typeof patient !== 'object') {
    return { consolidados: {}, datas: {} };
  }
  const raw = consolidatePatientExams(patient.historicoExames || [], patient.exames || {});
  const consolidados = (raw && typeof raw === 'object' && raw.consolidados) ? raw.consolidados : (raw || {});
  const datas = (raw && typeof raw === 'object' && raw.datas) ? raw.datas : {};
  return { consolidados, datas };
}

/**
 * Calcula o tempo decorrido de diálise em formato textual legível
 */
export function calculateDialysisDurationText(startDateStr) {
  if (!startDateStr) return null;
  const start = new Date(startDateStr);
  const now = new Date();
  if (isNaN(start.getTime())) return null;

  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months--;

  if (months <= 0) {
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} dia${diffDays === 1 ? '' : 's'}`;
  }
  if (months < 12) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
}

/**
 * Audita a integridade do prontuário do paciente para geração da evolução mensal.
 * Retorna se está apto, score de completude e lista de campos pendentes para preenchimento rápido.
 */
export function auditPatientEvolutionData(patient) {
  if (!patient || typeof patient !== 'object') {
    return {
      isComplete: false,
      score: 0,
      missingFields: [],
      clinicalAlerts: [],
      allFields: [],
      consolidatedExams: {},
      examDates: {}
    };
  }

  const missingFields = [];
  const clinicalAlerts = [];
  const allFields = [];

  // 1. Peso Seco
  const pesoSecoNum = parseFloat(String(patient.pesoSeco || '').replace(',', '.'));
  const isPesoSecoOk = !isNaN(pesoSecoNum) && pesoSecoNum > 0;
  const pesoField = {
    key: 'pesoSeco',
    label: 'Peso Seco',
    type: 'number',
    step: '0.1',
    placeholder: 'Ex: 68.5',
    unit: 'kg',
    hint: 'Necessário para cálculo de ultrafiltração e avaliação volêmica.',
    isMissing: !isPesoSecoOk,
    currentValue: patient.pesoSeco || ''
  };
  allFields.push(pesoField);
  if (!isPesoSecoOk) missingFields.push(pesoField);

  // 2. Etiologia da DRC
  const isEtiologiaOk = patient.etiologiaDRC && String(patient.etiologiaDRC).trim() && patient.etiologiaDRC !== '-';
  const etiologiaField = {
    key: 'etiologiaDRC',
    label: 'Etiologia da DRC',
    type: 'select',
    options: ETIOLOGIAS_DRC_PADRAO,
    hint: 'Diagnóstico nefrológico causal da insuficiência renal crônica.',
    isMissing: !isEtiologiaOk,
    currentValue: patient.etiologiaDRC || 'Nefropatia Diabética'
  };
  allFields.push(etiologiaField);
  if (!isEtiologiaOk) missingFields.push(etiologiaField);

  // 3. Tipo de Acesso Vascular
  const tipoAcesso = patient.tipoAcesso || patient.acessoVascular?.tipo;
  const isTipoAcessoOk = tipoAcesso && String(tipoAcesso).trim() && tipoAcesso !== '-';
  const tipoAcessoField = {
    key: 'tipoAcesso',
    label: 'Tipo de Acesso',
    type: 'select',
    options: ['FAV', 'Permcath', 'Cateter Duplo Lúmen', 'Prótese'],
    hint: 'Tipo de acesso vascular em uso para a hemodiálise.',
    isMissing: !isTipoAcessoOk,
    currentValue: tipoAcesso || 'FAV'
  };
  allFields.push(tipoAcessoField);
  if (!isTipoAcessoOk) missingFields.push(tipoAcessoField);

  // 4. Localização / Posição do Acesso
  const posicaoAcesso = patient.posicaoAcesso || patient.acessoVascular?.ladoMembro;
  const isPosicaoAcessoOk = posicaoAcesso && String(posicaoAcesso).trim() && posicaoAcesso !== '-';
  const posicaoField = {
    key: 'posicaoAcesso',
    label: 'Local do Acesso',
    type: 'select_or_text',
    options: LOCALIZACOES_ACESSO_COMUNS,
    placeholder: 'Ex: MSE (Radiocefálica)',
    hint: 'Membro ou sítio anatômico do acesso vascular.',
    isMissing: !isPosicaoAcessoOk,
    currentValue: posicaoAcesso || 'MSE (Radiocefálica)'
  };
  allFields.push(posicaoField);
  if (!isPosicaoAcessoOk) missingFields.push(posicaoField);

  // 5. Data de Início da TRS (Diálise)
  const isDataInicioOk = patient.dataInicioDialise && String(patient.dataInicioDialise).trim();
  const dataInicioField = {
    key: 'dataInicioDialise',
    label: 'Início da Diálise',
    type: 'date',
    hint: 'Data de início em TRS para cálculo cronológico do tempo de tratamento.',
    isMissing: !isDataInicioOk,
    currentValue: patient.dataInicioDialise || ''
  };
  allFields.push(dataInicioField);
  if (!isDataInicioOk) missingFields.push(dataInicioField);

  // 6. Turno de Hemodiálise
  const isTurnoOk = patient.turno && String(patient.turno).trim();
  const turnoField = {
    key: 'turno',
    label: 'Turno',
    type: 'select',
    options: ['Manhã', 'Tarde', 'Noite'],
    hint: 'Turno habitual das sessões de hemodiálise.',
    isMissing: !isTurnoOk,
    currentValue: patient.turno || 'Manhã'
  };
  allFields.push(turnoField);
  if (!isTurnoOk) missingFields.push(turnoField);

  // 7. Dias da Semana de Hemodiálise
  const isDiaSemanaOk = patient.diaSemana && String(patient.diaSemana).trim();
  const diaSemanaField = {
    key: 'diaSemana',
    label: 'Dias da Semana',
    type: 'select',
    options: ['Seg/Qua/Sex', 'Ter/Qui/Sáb', 'Diário', '4x por semana'],
    hint: 'Escala semanal de diálise do paciente.',
    isMissing: !isDiaSemanaOk,
    currentValue: patient.diaSemana || 'Seg/Qua/Sex'
  };
  allFields.push(diaSemanaField);
  if (!isDiaSemanaOk) missingFields.push(diaSemanaField);

  // Verificação de Exames Recentes (Alertas Clínicos Não Bloqueantes)
  const { consolidados: consolidated, datas: examDates } = getConsolidatedPatientExams(patient);
  
  if (!consolidated.ktv && !consolidated.ureiaPre) {
    clinicalAlerts.push('Adequação: Sem registro recente de Kt/V ou Ureia no prontuário.');
  }
  if (!consolidated.hb) {
    clinicalAlerts.push('Anemia: Hemoglobina mais recente não localizada.');
  }
  if (!consolidated.pth) {
    clinicalAlerts.push('DMO-DRC: Dosagem de PTH pendente.');
  }
  if (!consolidated.fosforo) {
    clinicalAlerts.push('Metabolismo Ósseo: Fósforo sérico pendente.');
  }
  if (!consolidated.k) {
    clinicalAlerts.push('Eletrólitos: Potássio sérico recente não localizado.');
  }

  const TOTAL_CRITICAL_ITEMS = 7;
  const completedItems = TOTAL_CRITICAL_ITEMS - missingFields.length;
  const score = Math.round((completedItems / TOTAL_CRITICAL_ITEMS) * 100);

  return {
    isComplete: missingFields.length === 0,
    score,
    missingFields,
    allFields,
    clinicalAlerts,
    consolidatedExams: consolidated,
    examDates: examDates
  };
}

/**
 * Construtores modulares de conteúdo para cada seção da evolução
 */
function buildSectionBlock(sectionId, num, ctx) {
  const { 
    patient, 
    idade, 
    tempoTRS, 
    dataInicioFormatada, 
    etiologia, 
    diaSemana, 
    turno, 
    tipoAcesso, 
    posicaoAcesso, 
    agulha, 
    qb, 
    pesoSeco, 
    consolidated, 
    examDates = {},
    medicamentos 
  } = ctx;

  const formatDateSuffix = (key) => {
    return examDates[key] ? ` (${safeFormatDate(examDates[key])})` : '';
  };

  switch (sectionId) {
    case 'identificacao': {
      let t = `${num}. IDENTIFICAÇÃO E HISTÓRICO EM TRS:\n`;
      t += `Paciente ${patient.nome || 'Identificado'}, ${idade ? `${idade} anos` : ''}, sexo ${patient.sexo === 'F' ? 'feminino' : 'masculino'}, portador de DRC estadio 5D secundária a ${etiologia}.\n`;
      t += `Em programa regular de hemodiálise há ${tempoTRS}${dataInicioFormatada ? ` (início em ${dataInicioFormatada})` : ''}, mantendo regime de 3 sessões semanais de 4 horas (${diaSemana}, turno ${turno}).\n\n`;
      return t;
    }

    case 'acessoVascular': {
      let t = `${num}. ACESSO VASCULAR:\n`;
      t += `Acesso vascular em uso: ${tipoAcesso} em ${posicaoAcesso}.\n`;
      t += `Acesso pérvio e funcionante, com sopro e frêmito presentes e adequados, sem sinais de hiperfluxo, dilatações aneurismáticas com risco trófico ou sinais flogísticos locais. Punção habitual com agulhas ${agulha}, mantendo fluxo sanguíneo efetivo (Qb) de ${qb} mL/min e pressões do circuito dentro da normalidade.\n\n`;
      return t;
    }

    case 'estadoClinico': {
      let t = `${num}. ESTADO CLÍNICO E VOLÊMICO:\n`;
      t += `Paciente clinicamente estável, afebril, eupnéico em ar ambiente, lúcido e orientado no tempo e espaço.\n`;
      t += `Peso seco estimado e pactuado em ${pesoSeco} kg. `;
      if (Array.isArray(patient.historicoPesos) && patient.historicoPesos.length > 0) {
        const ultimosPesos = patient.historicoPesos.slice(0, 5);
        const mediaGanhos = ultimosPesos
          .map(p => parseFloat(p.ganhoInterdialitico || p.ganho || 0))
          .filter(g => g > 0);
        if (mediaGanhos.length > 0) {
          const media = (mediaGanhos.reduce((a, b) => a + b, 0) / mediaGanhos.length).toFixed(1);
          t += `Ganho de peso interdialítico médio observado de ${media} kg. `;
        }
      }
      t += `Sem queixas de cãibras musculares, sem hipotensão sintomática ou intercorrências intradialíticas no período. Ao exame físico: ausência de estertores pulmonares e sem edema periférico significativo.\n`;
      if (Array.isArray(patient.alergias) && patient.alergias.length > 0) {
        t += `Alergias relatadas: ${patient.alergias.join(', ')}.\n\n`;
      } else {
        t += `Sem histórico de alergias medicamentosas registradas.\n\n`;
      }
      return t;
    }

    case 'adequacao': {
      let t = `${num}. ADEQUAÇÃO DIALÍTICA (DOSE DE DIÁLISE):\n`;
      const ktv = consolidated.ktv;
      const urr = consolidated.ur || consolidated.urr;
      const ureiaPre = consolidated.ureiaPre;
      const ureiaPos = consolidated.ureiaPos;
      const creatinina = consolidated.creatinina;

      const adeqTxt = [];
      if (ktv) {
        const ktvNum = parseFloat(String(ktv).replace(',', '.'));
        const ktvStatus = ktvNum >= 1.20 ? 'adequado (meta KDIGO/SBN >= 1.20 atingida)' : 'abaixo da meta recomendada (meta >= 1.20)';
        adeqTxt.push(`Kt/V: ${ktv}${formatDateSuffix('ktv')} - ${ktvStatus}`);
      }
      if (urr) {
        adeqTxt.push(`Taxa de Redução de Ureia (URR): ${urr}%${formatDateSuffix('ur') || formatDateSuffix('urr')}`);
      }
      if (ureiaPre || ureiaPos) {
        const dPre = formatDateSuffix('ureiaPre');
        const dPos = formatDateSuffix('ureiaPos');
        adeqTxt.push(`Ureia Pré: ${ureiaPre || '-'} mg/dL${dPre} | Ureia Pós: ${ureiaPos || '-'} mg/dL${dPos}`);
      }
      if (creatinina) {
        adeqTxt.push(`Creatinina Sérica: ${creatinina} mg/dL${formatDateSuffix('creatinina')}`);
      }

      if (adeqTxt.length > 0) {
        adeqTxt.forEach(item => {
          t += `• ${item}.\n`;
        });
      } else {
        t += `• Rotina de adequação dialítica em acompanhamento regular conforme calendário mensal da unidade.\n`;
      }
      t += `\n`;
      return t;
    }

    case 'anemia': {
      let t = `${num}. ANEMIA E METABOLISMO FÉRREO:\n`;
      const hb = consolidated.hb;
      const ht = consolidated.ht;
      const ferritina = consolidated.ferritina;
      const ist = consolidated.ist;
      const ferro = consolidated.ferro;
      const transferrina = consolidated.transferrina;
      const leucocitos = consolidated.leucocitos;
      const plaquetas = consolidated.plaquetas;

      let anemiaTxt = [];
      if (hb) anemiaTxt.push(`Hb: ${hb} g/dL${formatDateSuffix('hb')}`);
      if (ht) anemiaTxt.push(`Ht: ${ht}%${formatDateSuffix('ht')}`);
      if (ferritina) anemiaTxt.push(`Ferritina: ${ferritina} ng/mL${formatDateSuffix('ferritina')}`);
      if (ist) anemiaTxt.push(`IST: ${ist}%${formatDateSuffix('ist')}`);
      if (ferro) anemiaTxt.push(`Ferro Sérico: ${ferro} mcg/dL${formatDateSuffix('ferro')}`);
      if (transferrina) anemiaTxt.push(`Transferrina: ${transferrina} mg/dL${formatDateSuffix('transferrina')}`);
      if (leucocitos) anemiaTxt.push(`Leucócitos: ${leucocitos}/mm³${formatDateSuffix('leucocitos')}`);
      if (plaquetas) anemiaTxt.push(`Plaquetas: ${plaquetas}/mm³${formatDateSuffix('plaquetas')}`);

      if (anemiaTxt.length > 0) {
        t += `• Parâmetros laboratoriais: ${anemiaTxt.join(' | ')}.\n`;
      }

      const medEpo = medicamentos.find(m => {
        const n = (m.nome || m.medicamento || '').toLowerCase();
        return n.includes('epo') || n.includes('eritro') || n.includes('alfaepoetina');
      });
      const medFerro = medicamentos.find(m => {
        const n = (m.nome || m.medicamento || '').toLowerCase();
        return n.includes('ferro') || n.includes('noripurum') || n.includes('sacarato');
      });

      if (medEpo || medFerro) {
        t += `• Terapêutica em curso: `;
        const tratamentos = [];
        if (medEpo) tratamentos.push(`${medEpo.nome || 'Alfaepoetina'} ${medEpo.posologia || medEpo.dose || medEpo.dosagem || ''}`);
        if (medFerro) tratamentos.push(`${medFerro.nome || 'Noripurum'} ${medFerro.posologia || medFerro.dose || medFerro.dosagem || ''}`);
        t += `${tratamentos.join('; ')}.\n`;
      } else {
        t += `• Monitoramento sob protocolo institucional de anemia em TRS.\n`;
      }

      if (hb) {
        const hbNum = parseFloat(String(hb).replace(',', '.'));
        if (hbNum < 10.0) {
          t += `• Avaliação: Hemoglobina abaixo do alvo terapêutico (meta 10.0 a 12.0 g/dL); indicada titulação de dose de agente estimulador da eritropoese e/ou ferro endovenoso.\n`;
        } else if (hbNum > 12.0) {
          t += `• Avaliação: Hemoglobina no limite superior alvo; avaliar ajuste cauteloso de eritropoetina para prevenir riscos cardiovasculares.\n`;
        } else {
          t += `• Avaliação: Hemoglobina dentro da faixa alvo preconizada pela SBN/KDIGO (10.0 a 12.0 g/dL).\n`;
        }
      }
      t += `\n`;
      return t;
    }

    case 'dmo': {
      let t = `${num}. METABOLISMO MINERAL E ÓSSEO (DMO-DRC):\n`;
      const pth = consolidated.pth;
      const ca = consolidated.ca;
      const fosforo = consolidated.fosforo;
      const fa = consolidated.fa || consolidated.fosfAlcalina;
      const vitD = consolidated.vitD || consolidated.vitaminaD;

      let dmoTxt = [];
      if (pth) dmoTxt.push(`PTH: ${pth} pg/mL${formatDateSuffix('pth')}`);
      if (ca) dmoTxt.push(`Cálcio: ${ca} mg/dL${formatDateSuffix('ca')}`);
      if (fosforo) dmoTxt.push(`Fósforo: ${fosforo} mg/dL${formatDateSuffix('fosforo')}`);
      if (fa) dmoTxt.push(`Fosfatase Alcalina: ${fa} U/L${formatDateSuffix('fa') || formatDateSuffix('fosfAlcalina')}`);
      if (vitD) dmoTxt.push(`Vitamina D (25-OH): ${vitD} ng/mL${formatDateSuffix('vitD') || formatDateSuffix('vitaminaD')}`);

      if (dmoTxt.length > 0) {
        t += `• Parâmetros laboratoriais: ${dmoTxt.join(' | ')}.\n`;
      }

      if (ca && consolidated.albumina) {
        const caCorr = calculateCorrectedCalcium(ca, consolidated.albumina);
        if (caCorr) {
          t += `• Cálcio Corrigido pela Albumina: ${caCorr} mg/dL.\n`;
        }
      }

      const medDmo = medicamentos.filter(m => {
        const n = (m.nome || m.medicamento || '').toLowerCase();
        return n.includes('sevelamer') || n.includes('carbonato') || n.includes('calcitriol') || 
               n.includes('paricalcitol') || n.includes('cinacalcete') || n.includes('quelante');
      });
      if (medDmo.length > 0) {
        const nomes = medDmo.map(m => `${m.nome || m.medicamento} ${m.posologia || m.dose || m.dosagem || ''}`).join('; ');
        t += `• Terapêutica ativa: ${nomes}.\n`;
      }

      if (fosforo) {
        const pNum = parseFloat(String(fosforo).replace(',', '.'));
        if (pNum > 5.5) {
          t += `• Avaliação: Hiperfosfatemia; reforçadas orientações de restrição dietética e otimização da posologia do quelante de fósforo.\n`;
        }
      }
      t += `\n`;
      return t;
    }

    case 'eletrolitos': {
      let t = `${num}. ELETRÓLITOS E EQUILÍBRIO ÁCIDO-BÁSICO:\n`;
      const k = consolidated.k;
      const na = consolidated.na;
      const hco3 = consolidated.hco3;

      let eletroTxt = [];
      if (k) eletroTxt.push(`Potássio (K): ${k} mEq/L${formatDateSuffix('k')}`);
      if (na) eletroTxt.push(`Sódio (Na): ${na} mEq/L${formatDateSuffix('na')}`);
      if (hco3) eletroTxt.push(`Bicarbonato: ${hco3} mEq/L${formatDateSuffix('hco3')}`);

      if (eletroTxt.length > 0) {
        t += `• Parâmetros laboratoriais: ${eletroTxt.join(' | ')}.\n`;
      }

      if (k) {
        const kNum = parseFloat(String(k).replace(',', '.'));
        if (kNum > 5.5) {
          t += `• Alerta Clínico: Potássio elevado (${k} mEq/L); reforçada orientação nutricional rigorosa para restrição de alimentos ricos em potássio.\n`;
        }
      }
      t += `\n`;
      return t;
    }

    case 'nutricao': {
      let t = `${num}. NUTRIÇÃO E INFLAMAÇÃO:\n`;
      const albumina = consolidated.albumina;
      const pcr = consolidated.pcr;
      const glicemia = consolidated.glicemia;
      const hba1c = consolidated.hba1c;
      const tgp = consolidated.tgp;
      const tgo = consolidated.tgo;

      let nutTxt = [];
      if (albumina) nutTxt.push(`Albumina: ${albumina} g/dL${formatDateSuffix('albumina')}`);
      if (pcr) nutTxt.push(`PCR: ${pcr} mg/L${formatDateSuffix('pcr')}`);
      if (glicemia) nutTxt.push(`Glicemia: ${glicemia} mg/dL${formatDateSuffix('glicemia')}`);
      if (hba1c) nutTxt.push(`HbA1c: ${hba1c}%${formatDateSuffix('hba1c')}`);
      if (tgp) nutTxt.push(`TGP: ${tgp} U/L${formatDateSuffix('tgp')}`);
      if (tgo) nutTxt.push(`TGO: ${tgo} U/L${formatDateSuffix('tgo')}`);

      if (nutTxt.length > 0) {
        t += `• Marcadores séricos: ${nutTxt.join(' | ')}.\n`;
      }

      if (albumina) {
        const albNum = parseFloat(String(albumina).replace(',', '.'));
        if (albNum >= 3.8) {
          t += `• Estado nutricional proteico preservado (Albumina >= 3.8 g/dL).\n`;
        } else {
          t += `• Hipoalbuminemia leve/moderada; suporte nutricional orientado para aporte proteico adequado.\n`;
        }
      }
      t += `\n`;
      return t;
    }

    case 'sorologias': {
      let t = `${num}. RASTREIO SOROLÓGICO:\n`;
      const antiHcv = consolidated.antiHcv || 'Não Reagente';
      const hbsag = consolidated.hbsag || 'Não Reagente';
      const hiv = consolidated.hiv || 'Não Reagente';
      const antiHbs = consolidated.antiHbs || null;
      const antiHbc = consolidated.antiHbc || null;

      let soroList = [
        `Anti-HCV: ${antiHcv}${formatDateSuffix('antiHcv')}`,
        `HBsAg: ${hbsag}${formatDateSuffix('hbsag')}`,
        `HIV: ${hiv}${formatDateSuffix('hiv')}`
      ];
      if (antiHbs) soroList.push(`Anti-HBs: ${antiHbs}${formatDateSuffix('antiHbs')}`);
      if (antiHbc) soroList.push(`Anti-HBc: ${antiHbc}${formatDateSuffix('antiHbc')}`);

      t += `• Rastreio Sorológico Periódico: ${soroList.join(' | ')}. Paciente alocado em sala e máquina habitual conforme rotina institucional.\n\n`;
      return t;
    }

    case 'exames': {
      let t = `${num}. QUADRO LABORATORIAL CONSOLIDADO (ÚLTIMOS RESULTADOS):\n`;
      const linhas = [];

      // Anemia e Cinética do Ferro
      const hbTxt = consolidated.hb ? `Hb: ${consolidated.hb} g/dL${formatDateSuffix('hb')}` : null;
      const htTxt = consolidated.ht ? `Ht: ${consolidated.ht}%${formatDateSuffix('ht')}` : null;
      const ferTxt = consolidated.ferritina ? `Ferritina: ${consolidated.ferritina} ng/mL${formatDateSuffix('ferritina')}` : null;
      const istTxt = consolidated.ist ? `IST: ${consolidated.ist}%${formatDateSuffix('ist')}` : null;
      const ferroTxt = consolidated.ferro ? `Ferro: ${consolidated.ferro} mcg/dL${formatDateSuffix('ferro')}` : null;
      const plaqTxt = consolidated.plaquetas ? `Plaquetas: ${consolidated.plaquetas}/mm³${formatDateSuffix('plaquetas')}` : null;
      const leucTxt = consolidated.leucocitos ? `Leucócitos: ${consolidated.leucocitos}/mm³${formatDateSuffix('leucocitos')}` : null;
      const anemiaPartes = [hbTxt, htTxt, ferTxt, istTxt, ferroTxt, leucTxt, plaqTxt].filter(Boolean);
      if (anemiaPartes.length > 0) {
        linhas.push(`• Série Vermelha e Ferro: ${anemiaPartes.join(' | ')}`);
      }

      // Metabolismo Ósseo e Mineral
      const pthTxt = consolidated.pth ? `PTH: ${consolidated.pth} pg/mL${formatDateSuffix('pth')}` : null;
      const caTxt = consolidated.ca ? `Cálcio: ${consolidated.ca} mg/dL${formatDateSuffix('ca')}` : null;
      const pTxt = consolidated.fosforo ? `Fósforo: ${consolidated.fosforo} mg/dL${formatDateSuffix('fosforo')}` : null;
      const faTxt = (consolidated.fa || consolidated.fosfAlcalina) ? `FA: ${consolidated.fa || consolidated.fosfAlcalina} U/L${formatDateSuffix('fa') || formatDateSuffix('fosfAlcalina')}` : null;
      const vitDTxt = (consolidated.vitD || consolidated.vitaminaD) ? `Vit D: ${consolidated.vitD || consolidated.vitaminaD} ng/mL${formatDateSuffix('vitD') || formatDateSuffix('vitaminaD')}` : null;
      const dmoPartes = [pthTxt, caTxt, pTxt, faTxt, vitDTxt].filter(Boolean);
      if (dmoPartes.length > 0) {
        linhas.push(`• Metabolismo Ósseo: ${dmoPartes.join(' | ')}`);
      }

      // Adequação e Renal
      const ktvTxt = consolidated.ktv ? `Kt/V: ${consolidated.ktv}${formatDateSuffix('ktv')}` : null;
      const urrTxt = (consolidated.ur || consolidated.urr) ? `URR: ${consolidated.ur || consolidated.urr}%${formatDateSuffix('ur') || formatDateSuffix('urr')}` : null;
      const uPreTxt = consolidated.ureiaPre ? `Ureia Pré: ${consolidated.ureiaPre} mg/dL${formatDateSuffix('ureiaPre')}` : null;
      const uPosTxt = consolidated.ureiaPos ? `Ureia Pós: ${consolidated.ureiaPos} mg/dL${formatDateSuffix('ureiaPos')}` : null;
      const creatTxt = consolidated.creatinina ? `Creatinina: ${consolidated.creatinina} mg/dL${formatDateSuffix('creatinina')}` : null;
      const adeqPartes = [ktvTxt, urrTxt, uPreTxt, uPosTxt, creatTxt].filter(Boolean);
      if (adeqPartes.length > 0) {
        linhas.push(`• Adequação Dialítica: ${adeqPartes.join(' | ')}`);
      }

      // Eletrólitos
      const kTxt = consolidated.k ? `K: ${consolidated.k} mEq/L${formatDateSuffix('k')}` : null;
      const naTxt = consolidated.na ? `Na: ${consolidated.na} mEq/L${formatDateSuffix('na')}` : null;
      const hco3Txt = consolidated.hco3 ? `Bicarbonato: ${consolidated.hco3} mEq/L${formatDateSuffix('hco3')}` : null;
      const eletroPartes = [kTxt, naTxt, hco3Txt].filter(Boolean);
      if (eletroPartes.length > 0) {
        linhas.push(`• Eletrólitos: ${eletroPartes.join(' | ')}`);
      }

      // Nutrição e Metabolismo
      const albTxt = consolidated.albumina ? `Albumina: ${consolidated.albumina} g/dL${formatDateSuffix('albumina')}` : null;
      const pcrTxt = consolidated.pcr ? `PCR: ${consolidated.pcr} mg/L${formatDateSuffix('pcr')}` : null;
      const glicTxt = consolidated.glicemia ? `Glicemia: ${consolidated.glicemia} mg/dL${formatDateSuffix('glicemia')}` : null;
      const glicadaTxt = consolidated.hba1c ? `HbA1c: ${consolidated.hba1c}%${formatDateSuffix('hba1c')}` : null;
      const tgpTxt = consolidated.tgp ? `TGP: ${consolidated.tgp} U/L${formatDateSuffix('tgp')}` : null;
      const tgoTxt = consolidated.tgo ? `TGO: ${consolidated.tgo} U/L${formatDateSuffix('tgo')}` : null;
      const nutPartes = [albTxt, pcrTxt, glicTxt, glicadaTxt, tgpTxt, tgoTxt].filter(Boolean);
      if (nutPartes.length > 0) {
        linhas.push(`• Nutrição e Metabolismo: ${nutPartes.join(' | ')}`);
      }

      if (linhas.length > 0) {
        t += linhas.join('\n') + '\n\n';
      } else {
        t += `• Sem exames laboratoriais consolidados registrados no prontuário.\n\n`;
      }
      return t;
    }

    case 'transplante': {
      if (!patient.statusTransplante) return '';
      let t = `${num}. SEGUIMENTO DE TRANSPLANTE RENAL:\n`;
      t += `• Status no programa de transplante: ${patient.statusTransplante}.\n\n`;
      return t;
    }

    case 'conduta': {
      let t = `${num}. CONDUTA E PLANO TERAPÊUTICO:\n`;
      t += `1. Manter prescrição de hemodiálise: 3 sessões semanais de 4 horas, filtro biocompatível de alto fluxo, banho de bicarbonato padrão, Qb ${qb} mL/min, Qd 500 mL/min;\n`;
      t += `2. Manter peso seco meta em ${pesoSeco} kg e monitorar tolerância clínica às taxas de ultrafiltração;\n`;
      t += `3. Manter posologia das medicações prescritas de alto custo (agentes estimuladores da eritropoese, ferro e metabolismo ósseo);\n`;
      t += `4. Cuidados contínuos e vigilância com o acesso vascular (${tipoAcesso} em ${posicaoAcesso});\n`;
      t += `5. Reavaliação laboratorial e clínica periódica no próximo ciclo de rotina mensal da unidade de diálise.\n\n`;
      return t;
    }

    default:
      return '';
  }
}

/**
 * Gera a redação clínica completa da Evolução Médica Mensal de Hemodiálise
 * de acordo com as preferências, seções ativas e sequência configuradas pelo médico.
 */
export function generateMonthlyEvolutionText(patient, doctorInfo = null, customParams = {}) {
  if (!patient) return '';

  const { consolidados: consolidated, datas: examDates } = getConsolidatedPatientExams(patient);
  const idade = patient.idade || calculateAge(patient.dataNascimento) || (patient.dataNascimento ? `${calculateAge(patient.dataNascimento)} anos` : '');
  const tempoTRS = calculateDialysisDurationText(patient.dataInicioDialise) || 'tempo não especificado';
  const dataInicioFormatada = patient.dataInicioDialise ? safeFormatDate(patient.dataInicioDialise) : '';
  const pesoSeco = patient.pesoSeco || customParams.pesoSeco || '-';
  const tipoAcesso = patient.tipoAcesso || patient.acessoVascular?.tipo || 'FAV';
  const posicaoAcesso = patient.posicaoAcesso || patient.acessoVascular?.ladoMembro || 'membro superior';
  const qb = patient.acessoVascular?.fluxoSangue || customParams.qbEfetivo || '350';
  const agulha = patient.acessoVascular?.agulha || '16G';
  const turno = patient.turno || 'Manhã';
  const diaSemana = patient.diaSemana || 'Seg/Qua/Sex';
  const etiologia = patient.etiologiaDRC || 'Doença Renal Crônica estadio 5D';
  const clinica = patient.clinica || doctorInfo?.clinicaPrincipal || 'Unidade de Diálise';
  const medicamentos = Array.isArray(patient.medicamentos) ? patient.medicamentos : [];

  // Médicos e Credenciais
  const medicoNome = doctorInfo?.nome || patient.medicoResponsavel || 'Médico(a) Nefrologista';
  const crmFormatado = doctorInfo?.crm ? `CRM ${doctorInfo.crm}/${doctorInfo.ufCrm || 'SP'}` : '';

  // Data da Evolução (Hoje)
  const hoje = new Date();
  const dataHojeExtenso = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Configurações do Médico no Cloud Firestore
  const savedConfig = doctorInfo?.configuracaoEvolucao || {};
  const tituloDocumento = savedConfig.titulo || 'EVOLUÇÃO MÉDICA MENSAL - HEMODIÁLISE CRÔNICA';
  const sectionsList = Array.isArray(savedConfig.secoes) && savedConfig.secoes.length > 0
    ? savedConfig.secoes
    : DEFAULT_EVOLUTION_SECTIONS;

  let texto = `${tituloDocumento}\n`;
  texto += `Data da Avaliação: ${dataHojeExtenso} | Unidade: ${clinica}\n\n`;

  const context = {
    patient,
    idade,
    tempoTRS,
    dataInicioFormatada,
    etiologia,
    diaSemana,
    turno,
    tipoAcesso,
    posicaoAcesso,
    agulha,
    qb,
    pesoSeco,
    consolidated,
    examDates,
    medicamentos
  };

  let sectionCounter = 1;
  sectionsList.forEach(sec => {
    if (sec.ativo !== false) {
      const block = buildSectionBlock(sec.id, sectionCounter, context);
      if (block && block.trim()) {
        texto += block;
        sectionCounter++;
      }
    }
  });

  texto += `Evolução médica realizada por: ${medicoNome} - ${crmFormatado}`;

  return texto;
}

