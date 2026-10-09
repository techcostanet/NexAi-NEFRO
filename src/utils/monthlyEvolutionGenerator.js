/**
 * monthlyEvolutionGenerator.js
 * 
 * Módulo inteligente para auditoria de conformidade de prontuário e geração
 * automatizada da Evolução Médica Mensal de Hemodiálise (Padrão SBN / KDIGO / RDC 11 ANVISA).
 */

import { calculateAge, consolidatePatientExams, ETIOLOGIAS_DRC_PADRAO, LOCALIZACOES_ACESSO_COMUNS } from '../services/patientService.js';
import { safeFormatDate, normalizeDateToString } from './dateUtils.js';
import { calculateCorrectedCalcium } from './examRanges.js';

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
      clinicalAlerts: []
    };
  }

  const missingFields = [];
  const clinicalAlerts = [];

  // 1. Peso Seco
  const pesoSecoNum = parseFloat(String(patient.pesoSeco || '').replace(',', '.'));
  if (isNaN(pesoSecoNum) || pesoSecoNum <= 0) {
    missingFields.push({
      key: 'pesoSeco',
      label: 'Peso Seco',
      type: 'number',
      step: '0.1',
      placeholder: 'Ex: 68.5',
      unit: 'kg',
      hint: 'Necessário para cálculo de ultrafiltração e avaliação volêmica.'
    });
  }

  // 2. Etiologia da DRC
  if (!patient.etiologiaDRC || !String(patient.etiologiaDRC).trim() || patient.etiologiaDRC === '-') {
    missingFields.push({
      key: 'etiologiaDRC',
      label: 'Etiologia da DRC',
      type: 'select',
      options: ETIOLOGIAS_DRC_PADRAO,
      hint: 'Diagnóstico nefrológico causal da insuficiência renal crônica.'
    });
  }

  // 3. Tipo de Acesso Vascular
  const tipoAcesso = patient.tipoAcesso || patient.acessoVascular?.tipo;
  if (!tipoAcesso || !String(tipoAcesso).trim() || tipoAcesso === '-') {
    missingFields.push({
      key: 'tipoAcesso',
      label: 'Tipo de Acesso',
      type: 'select',
      options: ['FAV', 'Permcath', 'Cateter Duplo Lúmen', 'Prótese'],
      hint: 'Tipo de acesso vascular em uso para a hemodiálise.'
    });
  }

  // 4. Localização / Posição do Acesso
  const posicaoAcesso = patient.posicaoAcesso || patient.acessoVascular?.ladoMembro;
  if (!posicaoAcesso || !String(posicaoAcesso).trim() || posicaoAcesso === '-') {
    missingFields.push({
      key: 'posicaoAcesso',
      label: 'Local do Acesso',
      type: 'select_or_text',
      options: LOCALIZACOES_ACESSO_COMUNS,
      placeholder: 'Ex: MSE (Radiocefálica)',
      hint: 'Membro ou sítio anatômico do acesso vascular.'
    });
  }

  // 5. Data de Início da TRS (Diálise)
  if (!patient.dataInicioDialise || !String(patient.dataInicioDialise).trim()) {
    missingFields.push({
      key: 'dataInicioDialise',
      label: 'Início da Diálise',
      type: 'date',
      hint: 'Data de início em TRS para cálculo cronológico do tempo de tratamento.'
    });
  }

  // 6. Turno de Hemodiálise
  if (!patient.turno || !String(patient.turno).trim()) {
    missingFields.push({
      key: 'turno',
      label: 'Turno',
      type: 'select',
      options: ['Manhã', 'Tarde', 'Noite'],
      hint: 'Turno habitual das sessões de hemodiálise.'
    });
  }

  // 7. Dias da Semana de Hemodiálise
  if (!patient.diaSemana || !String(patient.diaSemana).trim()) {
    missingFields.push({
      key: 'diaSemana',
      label: 'Dias da Semana',
      type: 'select',
      options: ['Seg/Qua/Sex', 'Ter/Qui/Sáb', 'Diário', '4x por semana'],
      hint: 'Escala semanal de diálise do paciente.'
    });
  }

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
    clinicalAlerts,
    consolidatedExams: consolidated
  };
}

/**
 * Gera a redação clínica completa da Evolução Médica Mensal de Hemodiálise
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

  // Médicos e Credenciais
  const medicoNome = doctorInfo?.nome || patient.medicoResponsavel || 'Médico(a) Nefrologista';
  const crmFormatado = doctorInfo?.crm ? `CRM ${doctorInfo.crm}/${doctorInfo.ufCrm || 'SP'}` : '';

  // Data da Evolução (Hoje)
  const hoje = new Date();
  const dataHojeExtenso = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // 1. CABEÇALHO & IDENTIFICAÇÃO TRS
  let texto = `EVOLUÇÃO MÉDICA MENSAL - HEMODIÁLISE CRÔNICA\n`;
  texto += `Data da Avaliação: ${dataHojeExtenso} | Unidade: ${clinica}\n\n`;

  texto += `1. IDENTIFICAÇÃO E HISTÓRICO EM TRS:\n`;
  texto += `Paciente ${patient.nome || 'Identificado'}, ${idade ? `${idade} anos` : ''}, sexo ${patient.sexo === 'F' ? 'feminino' : 'masculino'}, portador de DRC estadio 5D secundária a ${etiologia}.\n`;
  texto += `Em programa regular de hemodiálise há ${tempoTRS}${dataInicioFormatada ? ` (início em ${dataInicioFormatada})` : ''}, mantendo regime de 3 sessões semanais de 4 horas (${diaSemana}, turno ${turno}).\n\n`;

  // 2. ACESSO VASCULAR
  texto += `2. ACESSO VASCULAR:\n`;
  texto += `Acesso vascular em uso: ${tipoAcesso} em ${posicaoAcesso}.\n`;
  texto += `Acesso pérvio e funcionante, com sopro e frêmito presentes e adequados, sem sinais de hiperfluxo, dilatações aneurismáticas com risco trófico ou sinais flogísticos locais. Punção habitual com agulhas ${agulha}, mantendo fluxo sanguíneo efetivo (Qb) de ${qb} mL/min e pressões venosa e arterial dentro dos parâmetros habituais do sistema.\n\n`;

  // 3. ESTADO VOLÊMICO E AVALIAÇÃO CLÍNICA
  texto += `3. ESTADO CLÍNICO E VOLÊMICO:\n`;
  texto += `Paciente clinicamente estável, afebril, eupnéico em ar ambiente, lúcido e orientado no tempo e espaço.\n`;
  texto += `Peso seco estimado e pactuado em ${pesoSeco} kg. `;
  
  // Cálculo de ganho interdialítico médio se houver histórico de peso
  if (Array.isArray(patient.historicoPesos) && patient.historicoPesos.length > 0) {
    const ultimosPesos = patient.historicoPesos.slice(0, 5);
    const mediaGanhos = ultimosPesos
      .map(p => parseFloat(p.ganhoInterdialitico || p.ganho || 0))
      .filter(g => g > 0);
    if (mediaGanhos.length > 0) {
      const media = (mediaGanhos.reduce((a, b) => a + b, 0) / mediaGanhos.length).toFixed(1);
      texto += `Ganho de peso interdialítico médio observado de ${media} kg. `;
    }
  }
  
  texto += `Sem queixas de cãibras musculares, sem hipotensão sintomática ou intercorrências intradialíticas graves no período. Ao exame físico: ausência de estertores pulmonares e sem edema periférico significativo de membros inferiores.\n`;
  
  if (Array.isArray(patient.alergias) && patient.alergias.length > 0) {
    texto += `Alergias relatadas: ${patient.alergias.join(', ')}.\n\n`;
  } else {
    texto += `Sem histórico de alergias medicamentosas registradas.\n\n`;
  }

  // 4. ADEQUAÇÃO DIALÍTICA
  texto += `4. ADEQUAÇÃO DIALÍTICA (DOSE DE DIÁLISE):\n`;
  const ktv = consolidated.ktv;
  const urr = consolidated.ur || consolidated.urr;
  const ureiaPre = consolidated.ureiaPre;
  const ureiaPos = consolidated.ureiaPos;

  if (ktv) {
    const ktvNum = parseFloat(String(ktv).replace(',', '.'));
    const ktvStatus = ktvNum >= 1.20 ? 'adequado (meta KDIGO/SBN >= 1.20 atingida)' : 'abaixo da meta recomendada (meta >= 1.20), otimizar diálise';
    texto += `• Kt/V: ${ktv} - ${ktvStatus}.\n`;
  }
  if (urr) texto += `• Taxa de Redução de Ureia (URR): ${urr}%.\n`;
  if (ureiaPre && ureiaPos) texto += `• Ureia Pré: ${ureiaPre} mg/dL | Ureia Pós: ${ureiaPos} mg/dL.\n`;
  if (!ktv && !urr && !ureiaPre) {
    texto += `• Rotina de adequação dialítica em acompanhamento regular conforme calendário mensal da unidade.\n`;
  }
  texto += `\n`;

  // 5. ANEMIA E CINÉTICA DO FERRO
  texto += `5. ANEMIA E METABOLISMO FÉRREO:\n`;
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
    texto += `• Parâmetros laboratoriais: ${anemiaTxt.join(' | ')}.\n`;
  }

  // Localiza medicações de anemia em uso
  const medicamentos = Array.isArray(patient.medicamentos) ? patient.medicamentos : [];
  const medEpo = medicamentos.find(m => {
    const n = (m.nome || m.medicamento || '').toLowerCase();
    return n.includes('epo') || n.includes('eritro') || n.includes('alfaepoetina');
  });
  const medFerro = medicamentos.find(m => {
    const n = (m.nome || m.medicamento || '').toLowerCase();
    return n.includes('ferro') || n.includes('noripurum') || n.includes('sacarato');
  });

  if (medEpo || medFerro) {
    texto += `• Terapêutica em curso: `;
    const tratamentos = [];
    if (medEpo) tratamentos.push(`${medEpo.nome || 'Alfaepoetina'} ${medEpo.posologia || medEpo.dose || ''}`);
    if (medFerro) tratamentos.push(`${medFerro.nome || 'Noripurum'} ${medFerro.posologia || medFerro.dose || ''}`);
    texto += `${tratamentos.join('; ')}.\n`;
  } else {
    texto += `• Monitoramento sob protocolo institucional de anemia em TRS.\n`;
  }

  if (hb) {
    const hbNum = parseFloat(String(hb).replace(',', '.'));
    if (hbNum < 10.0) {
      texto += `• Avaliação: Hemoglobina abaixo do alvo terapêutico (meta 10.0 a 11.5 g/dL); indicada titulação de dose de agente estimulador da eritropoese e/ou ferro endovenoso.\n`;
    } else if (hbNum > 12.0) {
      texto += `• Avaliação: Hemoglobina no limite superior alvo; avaliar ajuste cauteloso de eritropoetina para prevenir riscos trombóticos/cardiovasculares.\n`;
    } else {
      texto += `• Avaliação: Hemoglobina dentro da faixa alvo preconizada pela SBN/KDIGO (10.0 a 12.0 g/dL).\n`;
    }
  }
  texto += `\n`;

  // 6. METABOLISMO MINERAL E ÓSSEO (DMO-DRC)
  texto += `6. METABOLISMO MINERAL E ÓSSEO (DMO-DRC):\n`;
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
    texto += `• Parâmetros laboratoriais: ${dmoTxt.join(' | ')}.\n`;
  }

  // Cálcio corrigido pela albumina
  if (ca && consolidated.albumina) {
    const caCorr = calculateCorrectedCalcium(ca, consolidated.albumina);
    if (caCorr) {
      texto += `• Cálcio Corrigido pela Albumina: ${caCorr} mg/dL.\n`;
    }
  }

  // Medicações de DMO
  const medDmo = medicamentos.filter(m => {
    const n = (m.nome || m.medicamento || '').toLowerCase();
    return n.includes('sevelamer') || n.includes('carbonato') || n.includes('calcitriol') || 
           n.includes('paricalcitol') || n.includes('cinacalcete') || n.includes('quelante');
  });
  if (medDmo.length > 0) {
    const nomes = medDmo.map(m => `${m.nome || m.medicamento} ${m.posologia || m.dose || ''}`).join('; ');
    texto += `• Terapêutica ativa: ${nomes}.\n`;
  }

  if (fosforo) {
    const pNum = parseFloat(String(fosforo).replace(',', '.'));
    if (pNum > 5.5) {
      texto += `• Avaliação: Hiperfosfatemia; reforçadas orientações de restrição dietética e otimização da posologia do quelante de fósforo.\n`;
    }
  }
  texto += `\n`;

  // 7. ELETRÓLITOS, ÁCIDO-BÁSICO E NUTRIÇÃO
  texto += `7. ELETRÓLITOS, EQUILÍBRIO ÁCIDO-BÁSICO E NUTRIÇÃO:\n`;
  const k = consolidated.k;
  const na = consolidated.na;
  const hco3 = consolidated.hco3;
  const albumina = consolidated.albumina;
  const pcr = consolidated.pcr;

  let eletroTxt = [];
  if (k) eletroTxt.push(`Potássio (K): ${k} mEq/L`);
  if (na) eletroTxt.push(`Sódio (Na): ${na} mEq/L`);
  if (hco3) eletroTxt.push(`Bicarbonato: ${hco3} mEq/L`);
  if (albumina) eletroTxt.push(`Albumina: ${albumina} g/dL`);
  if (pcr) eletroTxt.push(`PCR: ${pcr} mg/L`);

  if (eletroTxt.length > 0) {
    texto += `• Parâmetros laboratoriais: ${eletroTxt.join(' | ')}.\n`;
  }

  if (k) {
    const kNum = parseFloat(String(k).replace(',', '.'));
    if (kNum > 5.5) {
      texto += `• Alerta Clínico: Potássio elevado (${k} mEq/L); reforçada orientação nutricional rigorosa para restrição de frutas/alimentos ricos em potássio.\n`;
    }
  }
  if (albumina) {
    const albNum = parseFloat(String(albumina).replace(',', '.'));
    if (albNum >= 3.8) {
      texto += `• Estado nutricional proteico preservado (Albumina >= 3.8 g/dL).\n`;
    } else {
      texto += `• Hipoalbuminemia leve/moderada; suporte nutricional orientado para aporte proteico adequado.\n`;
    }
  }
  texto += `\n`;

  // 8. RASTREIO SOROLÓGICO E TRANSPLANTE RENAL
  texto += `8. SOROLOGIAS E TRANSPLANTE RENAL:\n`;
  const antiHcv = consolidated.antiHcv || 'Não Reagente';
  const hbsag = consolidated.hbsag || 'Não Reagente';
  const hiv = consolidated.hiv || 'Não Reagente';
  texto += `• Rastreio Sorológico Periódico: Anti-HCV (${antiHcv}), HBsAg (${hbsag}), HIV (${hiv}). Paciente em sala/máquina habitual conforme rotina sorológica.\n`;

  if (patient.statusTransplante) {
    texto += `• Status de Transplante Renal: ${patient.statusTransplante}.\n`;
  }
  texto += `\n`;

  // 9. CONDUTA E PLANO TERAPÊUTICO
  texto += `9. CONDUTA E PLANO TERAPÊUTICO:\n`;
  texto += `1. Manter prescrição de hemodiálise: 3 sessões semanais de 4 horas, filtro biocompatível de alto fluxo, banho de bicarbonato padrão, Qb ${qb} mL/min, Qd 500 mL/min;\n`;
  texto += `2. Manter peso seco meta em ${pesoSeco} kg e monitorar tolerância clínica às taxas de ultrafiltração;\n`;
  texto += `3. Manter posologia das medicações prescritas de alto custo (agentes estimuladores da eritropoese, ferro e metabolismo ósseo);\n`;
  texto += `4. Cuidados contínuos e vigilância com o acesso vascular (${tipoAcesso} em ${posicaoAcesso});\n`;
  texto += `5. Reavaliação laboratorial e clínica periódica no próximo ciclo de rotina mensal da unidade de diálise.\n\n`;

  texto += `Evolução médica realizada por: ${medicoNome} - ${crmFormatado}`;

  return texto;
}
