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
  { id: 'anemia', label: 'Anemia e Cinética do Ferro', descricao: 'Hb, Ht, Ferritina, IST e doses de Alfaepoetina/Noripurum', ativo: true },
  { id: 'dmo', label: 'Metabolismo Ósseo (DMO)', descricao: 'PTH, Cálcio Corrigido, Fósforo, FA e quelantes/análogos', ativo: true },
  { id: 'eletrolitos', label: 'Eletrólitos e Ácido-Básico', descricao: 'Potássio (alerta hipercalemia), Sódio e Bicarbonato', ativo: true },
  { id: 'nutricao', label: 'Nutrição e Inflamação', descricao: 'Albumina sérica e PCR com interpretação prognóstica', ativo: true },
  { id: 'sorologias', label: 'Sorologias Periódicas', descricao: 'Rastreio de Anti-HCV, HBsAg e HIV', ativo: true },
  { id: 'transplante', label: 'Transplante Renal', descricao: 'Status em lista de espera ou contraindicações', ativo: true },
  { id: 'conduta', label: 'Conduta e Plano Terapêutico', descricao: 'Recomendações dialíticas, ponderais e medicamentosas', ativo: true }
];

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
      allFields: []
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
  const consolidated = consolidatePatientExams(patient.historicoExames || [], patient.exames || {});
  
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
    consolidatedExams: consolidated
  };
}

/**
 * Construtores modulares de conteúdo para cada seção
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
    medicamentos 
  } = ctx;

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

      if (ktv) {
        const ktvNum = parseFloat(String(ktv).replace(',', '.'));
        const ktvStatus = ktvNum >= 1.20 ? 'adequado (meta KDIGO/SBN >= 1.20 atingida)' : 'abaixo da meta recomendada (meta >= 1.20), otimizar diálise';
        t += `• Kt/V: ${ktv} - ${ktvStatus}.\n`;
      }
      if (urr) t += `• Taxa de Redução de Ureia (URR): ${urr}%.\n`;
      if (ureiaPre && ureiaPos) t += `• Ureia Pré: ${ureiaPre} mg/dL | Ureia Pós: ${ureiaPos} mg/dL.\n`;
      if (!ktv && !urr && !ureiaPre) {
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

      let anemiaTxt = [];
      if (hb) anemiaTxt.push(`Hb: ${hb} g/dL`);
      if (ht) anemiaTxt.push(`Ht: ${ht}%`);
      if (ferritina) anemiaTxt.push(`Ferritina: ${ferritina} ng/mL`);
      if (ist) anemiaTxt.push(`IST: ${ist}%`);

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
        if (medEpo) tratamentos.push(`${medEpo.nome || 'Alfaepoetina'} ${medEpo.posologia || medEpo.dose || ''}`);
        if (medFerro) tratamentos.push(`${medFerro.nome || 'Noripurum'} ${medFerro.posologia || medFerro.dose || ''}`);
        t += `${tratamentos.join('; ')}.\n`;
      } else {
        t += `• Monitoramento sob protocolo institucional de anemia em TRS.\n`;
      }

      if (hb) {
        const hbNum = parseFloat(String(hb).replace(',', '.'));
        if (hbNum < 10.0) {
          t += `• Avaliação: Hemoglobina abaixo do alvo terapêutico (meta 10.0 a 11.5 g/dL); indicada titulação de dose de agente estimulador da eritropoese e/ou ferro endovenoso.\n`;
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
      const fa = consolidated.fa;
      const vitD = consolidated.vitD;

      let dmoTxt = [];
      if (pth) dmoTxt.push(`PTH: ${pth} pg/mL`);
      if (ca) dmoTxt.push(`Cálcio: ${ca} mg/dL`);
      if (fosforo) dmoTxt.push(`Fósforo: ${fosforo} mg/dL`);
      if (fa) dmoTxt.push(`Fosfatase Alcalina: ${fa} U/L`);
      if (vitD) dmoTxt.push(`Vitamina D (25-OH): ${vitD} ng/mL`);

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
        const nomes = medDmo.map(m => `${m.nome || m.medicamento} ${m.posologia || m.dose || ''}`).join('; ');
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
      if (k) eletroTxt.push(`Potássio (K): ${k} mEq/L`);
      if (na) eletroTxt.push(`Sódio (Na): ${na} mEq/L`);
      if (hco3) eletroTxt.push(`Bicarbonato: ${hco3} mEq/L`);

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

      let nutTxt = [];
      if (albumina) nutTxt.push(`Albumina: ${albumina} g/dL`);
      if (pcr) nutTxt.push(`PCR: ${pcr} mg/L`);

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
      t += `• Rastreio Sorológico Periódico: Anti-HCV (${antiHcv}), HBsAg (${hbsag}), HIV (${hiv}). Paciente alocado em sala/máquina habitual conforme rotina institucional.\n\n`;
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

  const consolidated = consolidatePatientExams(patient.historicoExames || [], patient.exames || {});
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
