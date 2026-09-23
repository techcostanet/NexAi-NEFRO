import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { savePatientExam } from './patientService.js';
import { db } from '../config/firebase.js';
import { collection, addDoc } from 'firebase/firestore';
import { HOMOLOGATED_LABS, detectLaboratoryProfile } from '../data/labProfiles.js';

// Configuração do Worker do PDF.js para ambiente Web/Vite
if (typeof window !== 'undefined' && pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

// Dicionário de Sinônimos de Exames Laboratoriais Nefrológicos
export const EXAM_ALIASES = {
  hb: ['hb', 'hgb', 'hemoglobina', 'hemoglobin', 'dosagem de hemoglobina', 'serie vermelha hemoglobina'],
  ht: ['ht', 'hct', 'hematocrito', 'hematocritos', 'hematocrito ht'],
  ferritina: ['ferritina', 'ferr', 'ferrit', 'ferritina serica'],
  ferro: ['ferro', 'ferro serico', 'fe', 'ferro total', 'dosagem de ferro'],
  transferrina: ['transferrina', 'transferrina serica'],
  ist: ['ist', 'sat transferrina', 'sat. trans', 'sat transf', 'saturacao transferrina', 'indice saturacao transferrina', 'sat de transferrina', 'indice de saturacao da transferrina', 'indice de saturacao de transferrina', 'saturacao da transferrina'],
  pth: ['pth', 'paratormonio', 'pth intacto', 'ipth', 'pth-intacto', 'paratormonio intacto', 'paratormonio - pth', 'paratormonio pth'],
  fosforo: ['fosforo', 'fosfato', 'p', 'po4', 'p serico', 'fosforo serico'],
  ca: ['calcio', 'calcio total', 'ca', 'ca total', 'calcio serico'],
  vitD: ['vit d', 'vitamina d', '25-oh vit d', '25 oh vitamina d', 'vitd', '25-hidroxivitamina d', 'vitamina d 25 dihidroxi', 'vitamina d 25-hidroxi', '25 dihidroxi'],
  fa: ['fa', 'fosfatase alcalina', 'fosf alcalina', 'f alc', 'fosf. alc.'],
  k: ['potassio', 'k', 'k+', 'potassio serico'],
  na: ['sodio', 'na', 'na+', 'sodio serico'],
  hco3: ['hco3', 'bicarbonato', 'reserva alcalina', 'gaso hco3', 'bicarbonato serico'],
  ktv: ['kt/v', 'ktv', 'kt_v', 'kt v', 'kt', 'adequacao dialitica', 'kt/v dialise', 'ktv sp'],
  ureiaPos: ['ureia pos', 'ureia pos-hd', 'ureia pos hd', 'ureia final', 'ur pos', 'ureia 2', 'ureia pos dialise', 'ureia pos-dialise', 'ureia pos dialitica'],
  ureiaPre: ['ureia pre', 'ureia pre-hd', 'ureia pre hd', 'ureia inicial', 'ur pre', 'ureia 1', 'ureia', 'ureia pre dialise', 'ureia pre dialitica'],
  creatinina: ['creatinina', 'cr', 'creat', 'creatina', 'creatinina serica'],
  albumina: ['albumina', 'alb', 'albumina serica'],
  pcr: ['pcr', 'proteina c reativa', 'pcr ultrassensivel', 'pcr us'],
  glicemia: ['glicemia', 'glicose', 'dextro', 'gli', 'glicemia em jejum', 'glicemia de jejum'],
  hba1c: ['hba1c', 'hemoglobina glicada', 'a1c', 'hb a1c', 'hemoglobina glicada - hba1c', 'hemoglobina glicada a1c', 'hemoglobina glicada a1', 'hemoglobina glicada (hba1c)', 'hemoglobina glicada (a1'],
  tgp: ['tgp', 'alt', 'transaminase glutamico piruvica', 'transaminase piruvica', 'alanina aminotransferase', 'alt/tgp', 'alt tgp', 'transaminase glutamico piruvica- tgp', 'transaminase glutamico piruvica - tgp'],
  tgo: ['tgo', 'ast', 'transaminase glutamico oxalacetica', 'transaminase oxalacetica', 'aspartato aminotransferase', 'ast/tgo', 'ast tgo'],
  aluminio: ['aluminio', 'aluminio serico', 'al'],
  leucocitos: ['leucocitos', 'serie branca leucocitos', 'leucocitos totais'],
  plaquetas: ['plaquetas', 'contagem de plaquetas', 'plaquetas totais'],
  hbsag: ['hbsag', 'hbsag hepatite b', 'hepatite b hbsag', 'antigeno australia', 'antigeno de superficie hepatite b'],
  antiHbs: ['anti hbs', 'anti-hbs', 'hbs anti', 'hbs, anti', 'hbs anti hepatite b', 'anticorpo anti hbs'],
  antiHcv: ['anti hcv', 'anti-hcv', 'hepatite c anti hcv', 'hepatite c - anti hcv'],
  antiHbc: ['anti hbc', 'anti-hbc', 'hbc anti'],
  hiv: ['hiv', 'anti hiv', 'anti-hiv', 'hiv 1 e 2']
};

/**
 * Remove acentos, pontuações e converte para minúsculas
 */
export function normalizeString(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrai número limpo de string de exame (ex: "10,5 g/dL" -> 10.5)
 */
export function parseExamNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;

  let str = String(val).trim();
  if (str === '-' || str === '—' || str === '–' || str === '/' || str.toLowerCase() === 'indet' || str.toLowerCase() === 'n/a') return null;

  // Se tiver formato brasileiro com milhar e decimal (ex: 1.035,60 ou 1.373,10 ou 208.000)
  if (/\d+\.\d{3},\d+/.test(str)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (/\d+,\d{3}\.\d+/.test(str)) {
    str = str.replace(/,/g, '');
  } else if (/^\d{1,3}\.\d{3}$/.test(str)) {
    // Milhar inteiro (ex: "208.000" para plaquetas ou "9.900" para leucócitos)
    str = str.replace(/\./g, '');
  } else {
    str = str.replace(',', '.');
  }

  const match = str.match(/-?\d+(?:\.\d+)?/);
  if (match) {
    const num = parseFloat(match[0]);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Mapeia cabeçalho de coluna ou título de laudo para chave de exame
 */
export function matchHeaderToExamKey(headerName) {
  const norm = normalizeString(headerName);
  if (!norm) return null;

  // Prioridade específica para Ureia Pós vs Ureia Pré (usando delimitador de palavra para evitar colisão com 'turbidimetria')
  const isUreia = /\b(?:ureia|ur)\b/i.test(norm) || norm.startsWith('ureia') || norm.startsWith('ur ');
  if (isUreia) {
    if (norm.includes('pos') || norm.includes('final') || norm.includes('pos-hd')) {
      return 'ureiaPos';
    }
    if (norm.includes('pre') || norm.includes('inicial') || norm.includes('pre-hd') || !norm.includes('pos')) {
      if (!norm.includes('cinetica') && !norm.includes('reducao')) {
        return 'ureiaPre';
      }
    }
  }

  // TGP / TGO
  if (norm.includes('tgp') || norm.includes('transaminase piruvica') || norm.includes('transaminase glutamico piruvica') || norm.includes('alanina amino')) {
    return 'tgp';
  }
  if (norm.includes('tgo') || norm.includes('transaminase oxalacetica') || norm.includes('transaminase glutamico oxalacetica') || norm.includes('aspartato amino')) {
    return 'tgo';
  }

  // Hemoglobina Glicada (deve vir antes de Hemoglobina simples)
  if (norm.includes('glicada') || norm.includes('hba1c') || norm.includes('a1c')) {
    return 'hba1c';
  }

  // Paratormônio (PTH)
  if (norm.includes('paratormonio') || norm.includes('pth')) {
    return 'pth';
  }

  // Fosfatase Alcalina
  if (norm.includes('fosfatase alcalina') || norm.includes('fosf alcalina') || norm === 'fa') {
    return 'fa';
  }

  // IST (deve vir estritamente ANTES de Transferrina simples, pois 'indice de saturacao da transferrina' contém 'transferrina')
  if (norm.includes('saturacao') || norm.includes('ist') || (norm.includes('indice') && norm.includes('transferrina'))) {
    return 'ist';
  }

  // Transferrina simples
  if (norm.includes('transferrina')) {
    return 'transferrina';
  }

  // Ferro vs Ferritina
  if (norm.includes('ferritina')) {
    return 'ferritina';
  }
  if (norm.includes('ferro') || norm.includes('ferro serico')) {
    return 'ferro';
  }

  // Vitamina D
  if (norm.includes('vitamina d') || norm.includes('vit d') || norm.includes('25 dihidroxi') || norm.includes('25 hidroxi') || norm.includes('hidroxivitamina')) {
    return 'vitD';
  }

  // Sorologias (Hepatite B, Hepatite C, HIV)
  if (norm.includes('anti hbs') || norm.includes('hbs anti') || norm.includes('anti-hbs') || norm.includes('hbs, anti') || (norm.includes('hbs') && norm.includes('anti'))) {
    return 'antiHbs';
  }
  if (norm.includes('hbsag') || norm.includes('antigeno de superficie') || (norm.includes('hepatite b') && !norm.includes('anti'))) {
    return 'hbsag';
  }
  if (norm.includes('anti hcv') || norm.includes('anti-hcv') || (norm.includes('hepatite c') && norm.includes('hcv'))) {
    return 'antiHcv';
  }
  if (norm.includes('anti hbc') || norm.includes('anti-hbc')) {
    return 'antiHbc';
  }
  if (norm.includes('hiv') || norm.includes('aids')) {
    return 'hiv';
  }

  // Alumínio
  if (norm.includes('aluminio')) {
    return 'aluminio';
  }

  // Cálcio vs Fósforo
  if (norm.includes('calcio')) {
    return 'ca';
  }
  if (norm.includes('fosforo') || norm.includes('fosfato')) {
    return 'fosforo';
  }

  // Potássio / Sódio
  if (norm.includes('potassio')) {
    return 'k';
  }
  if (norm.includes('sodio')) {
    return 'na';
  }

  // Glicose / Glicemia
  if (norm.includes('glicose') || norm.includes('glicemia')) {
    return 'glicemia';
  }

  // Hematócrito vs Hemoglobina
  if (norm.includes('hematocrito')) {
    return 'ht';
  }
  if (norm.includes('hemoglobina') && !norm.includes('glicada')) {
    return 'hb';
  }

  // Leucócitos & Plaquetas
  if (norm.includes('leucocitos')) {
    return 'leucocitos';
  }
  if (norm.includes('plaquetas') || norm.includes('plaquet')) {
    return 'plaquetas';
  }

  // Proteínas Totais / Albumina
  if (norm.includes('albumina')) {
    return 'albumina';
  }

  // 1. Prioridade: Correspondência Exata
  for (const [key, aliases] of Object.entries(EXAM_ALIASES)) {
    for (const alias of aliases) {
      if (norm === alias) return key;
    }
  }

  const tokens = norm.split(' ').filter(Boolean);

  // 2. Prioridade: Palavra isolada (token)
  for (const [key, aliases] of Object.entries(EXAM_ALIASES)) {
    for (const alias of aliases) {
      if (tokens.includes(alias)) return key;
    }
  }

  // 3. Prioridade: Substring apenas para termos longos (> 3 letras)
  for (const [key, aliases] of Object.entries(EXAM_ALIASES)) {
    for (const alias of aliases) {
      if (alias.length > 3 && norm.includes(alias)) {
        return key;
      }
    }
  }

  return null;
}

/**
 * Calcula similaridade fonética e por tokens entre dois nomes, com suporte avançado
 * a preposições brasileiras, iniciais (ex: J., M., C.) e abreviações (ex: Ap., Rodrig.).
 * Retorna valor entre 0 e 1
 */
export function calculateNameSimilarity(nameA, nameB) {
  const prepositions = new Set(['de', 'da', 'do', 'dos', 'das', 'e']);
  
  const cleanTokens = (str) => {
    return normalizeString(str)
      .split(' ')
      .filter(t => t.length > 0 && !prepositions.has(t));
  };

  const tokensA = cleanTokens(nameA);
  const tokensB = cleanTokens(nameB);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  if (tokensA.join(' ') === tokensB.join(' ')) return 1.0;

  // Função auxiliar de correspondência entre 2 tokens (suporta igualdade, prefixo/abreviação e iniciais)
  const matchTwoTokens = (t1, t2) => {
    if (t1 === t2) return 1.0;
    // Se um é inicial ou prefixo do outro (ex: 'ap' e 'aparecida', 'j' e 'junio', 'rodr' e 'rodrigues')
    if (t1.length >= 1 && t2.startsWith(t1)) return 0.92;
    if (t2.length >= 1 && t1.startsWith(t2)) return 0.92;
    return 0;
  };

  // 1. Primeiro nome (essencial na identificação de pacientes)
  const firstScore = matchTwoTokens(tokensA[0], tokensB[0]);
  if (firstScore === 0) {
    const strA = tokensA.join(' ');
    const strB = tokensB.join(' ');
    if (strB.includes(strA) || strA.includes(strB)) return 0.88;
    return 0.1;
  }

  // 2. Último sobrenome
  const lastA = tokensA[tokensA.length - 1];
  const lastB = tokensB[tokensB.length - 1];
  const lastScore = matchTwoTokens(lastA, lastB);

  // 3. Casamento ponderado de todos os tokens
  let matchedTokensCount = 0;
  tokensA.forEach(tA => {
    const bestTokenMatch = Math.max(0, ...tokensB.map(tB => matchTwoTokens(tA, tB)));
    if (bestTokenMatch > 0) matchedTokensCount += bestTokenMatch;
  });

  let overallScore = matchedTokensCount / Math.max(tokensA.length, tokensB.length);

  // Bônus se primeiro e último nome casarem com perfeição ou com inicial
  if (firstScore >= 0.9 && lastScore >= 0.9) {
    overallScore = Math.max(overallScore, 0.90);
  }

  // Verifica inclusão de substring direta
  const strA = tokensA.join(' ');
  const strB = tokensB.join(' ');
  if (strB.includes(strA) || strA.includes(strB)) {
    overallScore = Math.max(overallScore, 0.90);
  }

  return Math.min(1.0, overallScore);
}

/**
 * Encontra o paciente mais provável dentro da lista do médico
 * Suporta busca por CPF e similaridade por nome limpo
 */
export function matchPatientInList(scannedName, patientsList = []) {
  if (!scannedName || !patientsList || patientsList.length === 0) {
    return { patient: null, score: 0, status: 'NOT_FOUND' };
  }

  const rawScannedStr = String(scannedName);
  const scannedDigits = rawScannedStr.replace(/\D/g, '');

  // 1. Tenta correspondência exata por CPF (com ou sem pontuação)
  if (scannedDigits.length >= 11) {
    for (const patient of patientsList) {
      if (patient.cpf) {
        const patientCpfDigits = String(patient.cpf).replace(/\D/g, '');
        if (patientCpfDigits.length === 11 && scannedDigits.includes(patientCpfDigits)) {
          return { patient, score: 100, status: 'EXACT_OR_HIGH' };
        }
      }
    }
  }

  // 2. Limpa rótulos de cabeçalhos de prontuário
  let cleanName = rawScannedStr
    .replace(/(?:Nome|Nome Social|Paciente|Cliente)[\s.:_]+/gi, ' ')
    .replace(/(?:Data Nasc|Data|CPF|RG|Nasc|Sexo|Convenio|Entrada|Idade|Requisicao|Solicitante)[\s.:_].*$/gi, ' ')
    .trim();

  let bestMatch = null;
  let bestScore = 0;

  for (const patient of patientsList) {
    const score = calculateNameSimilarity(cleanName, patient.nome);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = patient;
    }
  }

  let status = 'NOT_FOUND';
  if (bestScore >= 0.85) {
    status = 'EXACT_OR_HIGH'; // 🟢 Alta confiança
  } else if (bestScore >= 0.55) {
    status = 'SUGGESTION';    // 🟡 Dúvida / sugestão
  }

  return {
    patient: bestScore >= 0.55 ? bestMatch : null,
    score: Math.round(bestScore * 100),
    status
  };
}

/**
 * Tenta extrair data do nome do arquivo ou cabeçalhos (ex: "01/08/2026", "Agosto 2026")
 */
export function detectDateFromText(text) {
  if (!text) return null;
  
  // Padrão DD/MM/YYYY ou DD-MM-YYYY
  const dateMatch = text.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/);
  if (dateMatch) {
    let [_, d, m, y] = dateMatch;
    if (y.length === 2) y = '20' + y;
    d = d.padStart(2, '0');
    m = m.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Padrão Mês + Ano por extenso (ex: "AGOSTO 2026" ou "AGOSTO/26")
  const meses = {
    janeiro: '01', jan: '01',
    fevereiro: '02', fev: '02',
    marco: '03', mar: '03',
    abril: '04', abr: '04',
    maio: '05', mai: '05',
    junho: '06', jun: '06',
    julho: '07', jul: '07',
    agosto: '08', ago: '08',
    setembro: '09', set: '09',
    outubro: '10', out: '10',
    novembro: '11', nov: '11',
    dezembro: '12', dez: '12'
  };

  const norm = normalizeString(text);
  for (const [mes, num] of Object.entries(meses)) {
    if (norm.includes(mes)) {
      const yearMatch = norm.match(/(20\d\d|\d{2})/);
      const year = yearMatch ? (yearMatch[0].length === 2 ? '20' + yearMatch[0] : yearMatch[0]) : new Date().getFullYear();
      return `${year}-${num}-01`;
    }
  }

  return null;
}

/**
 * Aplica cálculos clínicos inteligentes e automáticos (IST e Kt/V estimado)
 */
export function applyDerivedCalculations(exames = {}) {
  if (!exames) return exames;

  // 1. Cálculo automático de IST (%) se Ferro e Transferrina estiverem presentes
  if (exames.ist === undefined && exames.ferro && exames.transferrina) {
    const istCalc = (exames.ferro * 70.9) / exames.transferrina;
    exames.ist = Math.round(istCalc * 10) / 10;
  }

  // 2. Cálculo automático de Kt/V (Daugirdas sp) a partir de Ureia Pré e Pós
  if (exames.ktv === undefined && exames.ureiaPre && exames.ureiaPos) {
    const pre = Number(exames.ureiaPre);
    const pos = Number(exames.ureiaPos);
    if (pre > pos && pre > 0) {
      const r = pos / pre;
      if (r > 0.032) {
        const ktvEst = -Math.log(r - 0.032);
        exames.ktv = Math.round(ktvEst * 100) / 100;
      }
    }
  }

  return exames;
}

/**
 * 📊 PARSER EXCEL (.xlsx, .xls, .csv)
 */
export async function parseExcelFile(file, patientsList = []) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (!rawRows || rawRows.length === 0) {
    throw new Error('Planilha vazia ou sem dados legíveis.');
  }

  // Tenta detectar a data no nome do arquivo ou na planilha
  let detectedDate = detectDateFromText(file.name) || detectDateFromText(sheetName);

  // Encontra a linha de cabeçalho (que contenha "nome", "paciente" ou nomes de exames)
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i].map(c => normalizeString(String(c)));
    const hasNameCol = row.some(c => c === 'nome' || c === 'paciente' || c.includes('nome do paciente'));
    const hasExamCol = row.some(c => matchHeaderToExamKey(c) !== null);

    if (hasNameCol || hasExamCol) {
      headerIndex = i;
      break;
    }
    // Procura por data na linha antes do cabeçalho
    if (!detectedDate) {
      detectedDate = detectDateFromText(rawRows[i].join(' '));
    }
  }

  if (headerIndex === -1) {
    headerIndex = 0; // fallback para primeira linha
  }

  const headers = rawRows[headerIndex].map(h => String(h).trim());
  let nameColIdx = -1;
  const examColIndices = {}; // { 'hb': 2, 'ferritina': 4, ... }

  headers.forEach((h, idx) => {
    const norm = normalizeString(h);
    if (nameColIdx === -1 && (norm === 'nome' || norm === 'paciente' || norm.includes('nome') || norm.includes('paciente'))) {
      nameColIdx = idx;
      return;
    }

    const examKey = matchHeaderToExamKey(h);
    if (examKey && !examColIndices[examKey]) {
      examColIndices[examKey] = idx;
    }
  });

  if (nameColIdx === -1) {
    // Se não encontrou coluna explícita 'nome', assume a primeira coluna de texto
    nameColIdx = 0;
  }

  const results = [];
  const fallbackDate = detectedDate || new Date().toISOString().split('T')[0];

  for (let r = headerIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rawName = String(row[nameColIdx] || '').trim();
    if (!rawName || rawName.length < 3 || normalizeString(rawName) === 'total' || normalizeString(rawName).includes('media')) {
      continue;
    }

    const matched = matchPatientInList(rawName, patientsList);
    const exames = {};

    for (const [examKey, colIdx] of Object.entries(examColIndices)) {
      const val = parseExamNumber(row[colIdx]);
      if (val !== null) {
        exames[examKey] = val;
      }
    }

    // Se a linha tem exames ou nome válido
    if (rawName) {
      const finalExames = applyDerivedCalculations(exames);
      results.push({
        id: `import-${r}-${Date.now()}`,
        nomeArquivo: rawName,
        pacienteId: matched.patient?.id || '',
        pacienteNome: matched.patient?.nome || '',
        statusMatch: matched.status,
        confianca: matched.score,
        dataExame: fallbackDate,
        exames: finalExames,
        confirmado: matched.status === 'EXACT_OR_HIGH'
      });
    }
  }

  return {
    tipoArquivo: 'EXCEL',
    dataSugerida: fallbackDate,
    totalIdentificados: results.length,
    registros: results
  };
}

/**
 * 📄 PARSER WORD (.docx)
 */
export async function parseDocxFile(file, patientsList = []) {
  const arrayBuffer = await file.arrayBuffer();
  const { value: text } = await mammoth.extractRawText({ arrayBuffer });

  if (!text || text.trim().length === 0) {
    throw new Error('Documento Word vazio ou sem texto extraível.');
  }

  const detectedDate = detectDateFromText(file.name) || detectDateFromText(text) || new Date().toISOString().split('T')[0];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const results = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matched = matchPatientInList(line, patientsList);

    if (matched.status === 'EXACT_OR_HIGH' || matched.status === 'SUGGESTION') {
      // Coleta exames nas linhas seguintes
      const exames = {};
      let j = i + 1;
      while (j < lines.length && j < i + 15) {
        const nextLine = lines[j];
        const nextMatch = matchPatientInList(nextLine, patientsList);
        if (nextMatch.status === 'EXACT_OR_HIGH') break; // Próximo paciente

        // Tenta extrair pares Nome_Exame: Valor (ex: "Hb: 11.2", "Fósforo: 5.4")
        for (const [examKey, aliases] of Object.entries(EXAM_ALIASES)) {
          for (const alias of aliases) {
            const regex = new RegExp(`\\b${alias}\\b\\s*[:=-]?\\s*([\\d.,]+)`, 'i');
            const match = nextLine.match(regex);
            if (match) {
              const val = parseExamNumber(match[1]);
              if (val !== null) exames[examKey] = val;
            }
          }
        }
        j++;
      }

      const finalExames = applyDerivedCalculations(exames);
      results.push({
        id: `import-docx-${i}-${Date.now()}`,
        nomeArquivo: line,
        pacienteId: matched.patient?.id || '',
        pacienteNome: matched.patient?.nome || '',
        statusMatch: matched.status,
        confianca: matched.score,
        dataExame: detectedDate,
        exames: finalExames,
        confirmado: matched.status === 'EXACT_OR_HIGH'
      });

      i = j - 1;
    }
  }

  return {
    tipoArquivo: 'WORD',
    dataSugerida: detectedDate,
    totalIdentificados: results.length,
    registros: results
  };
}

/**
 * 📊 PARSER MAPA EXAMES COLUNAR (Sistema Dialsist Web / DialiZe)
 * Processa relatórios colunares mensais de hemodiálise com coletas fracionadas em múltiplos dias
 */
export function parseDialsistExamMap(pagesLines, patientsList = [], detectedGlobalDate = null, fileName = '') {
  const DIALSIST_COL_MAP = {
    'HB': 'hb', 'HCT': 'ht', 'FE': 'ferro', 'FERRIT': 'ferritina', 'ISTR': 'ist', 'TRANSF': 'transferrina',
    'CAS': 'ca', 'P': 'fosforo', 'CAXP': 'caxp', 'PTH': 'pth', 'ALU': 'aluminio', 'FALC': 'fa',
    'CR': 'creatinina', 'U1': 'ureiaPre', 'U2': 'ureiaPos', 'PRU': 'pru', 'KTV': 'ktv', 'K': 'k',
    'ALB': 'albumina', 'TGP': 'tgp', 'GLIC': 'glicemia', 'VITD': 'vitD', 'HEM G': 'hba1c',
    'SODIO': 'na', 'HBSA': 'hbsag', 'HBSAG': 'hbsag', 'HBS': 'antiHbs', 'HCV': 'antiHcv', 'HIV': 'hiv'
  };

  // Coleta todas as linhas válidas de tabelas em todas as páginas
  const allRows = [];
  let periodDate = detectedGlobalDate;

  pagesLines.forEach(({ pageNum, items, lines }) => {
    // Tenta detectar período no cabeçalho (ex: "Período 01/09/2026 a 30/09/2026")
    if (!periodDate) {
      const headerText = (lines || []).slice(0, 10).join(' ');
      const mPeriod = headerText.match(/Per[ií]odo\s+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})\s+a\s+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i);
      if (mPeriod) {
        let [_, d, m, y] = mPeriod[1].match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/);
        if (y.length === 2) y = '20' + y;
        periodDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }

    if (!items || items.length === 0) return;

    // Localiza a linha de cabeçalho na página (procurando item 'Nome' à esquerda)
    const headerItemNome = items.find(it => it.str.trim() === 'Nome' && it.transform[4] < 45);
    const headerY = headerItemNome ? Math.round(headerItemNome.transform[5]) : 474;

    const headerItems = items.filter(it => Math.abs(it.transform[5] - headerY) <= 3 && it.str.trim());
    headerItems.sort((a, b) => a.transform[4] - b.transform[4]);

    // Agrupa itens em linhas abaixo do cabeçalho
    const lineBuckets = {};
    items.forEach(it => {
      const str = it.str.trim();
      if (!str) return;
      const y = Math.round(it.transform[5]);
      if (y >= (headerY - 4) || y < 45) return; // ignora acima do cabeçalho e rodapé inferior

      const closeY = Object.keys(lineBuckets).find(k => Math.abs(k - y) <= 3);
      const key = closeY || y;
      if (!lineBuckets[key]) lineBuckets[key] = [];
      lineBuckets[key].push({ str, x: Math.round(it.transform[4]) });
    });

    const sortedYs = Object.keys(lineBuckets).sort((a, b) => b - a);
    sortedYs.forEach(y => {
      const row = lineBuckets[y].sort((a, b) => a.x - b.x);
      const lineText = row.map(r => r.str).join(' ');

      // Filtra estritamente linhas de estatísticas / rodapé
      if (
        lineText.includes('Total de pacientes') || 
        lineText.includes('Média') || 
        lineText.includes('Mediana') || 
        lineText.includes('Desvio padrão') || 
        lineText.includes('Total de exames') || 
        lineText.includes('Legenda:') ||
        lineText.includes('Minimo') ||
        lineText.includes('Máximo') ||
        lineText.includes('Obs.:')
      ) {
        return;
      }

      // Separa partes do nome (x < 60) e data de coleta (60 <= x <= 95)
      const namePart = row.filter(it => it.x < 60).map(it => it.str).join(' ');
      const date = row.find(it => it.x >= 60 && it.x <= 95 && /\d{2}\/\d{2}\/\d{2}/.test(it.str))?.str || '';
      const values = row.filter(it => it.x > 95);

      if (namePart || date || values.length > 0) {
        allRows.push({ pageNum, y, namePart, date, values, headerItems });
      }
    });
  });

  // Agrupamento dos registros colunares por paciente
  const rawPatients = [];
  let current = null;

  for (let i = 0; i < allRows.length; i++) {
    const r = allRows[i];
    let isNew = false;

    if (!current) {
      isNew = true;
    } else if (r.namePart) {
      const prevDate = current.dates[current.dates.length - 1];
      if (r.date && prevDate) {
        const [d1] = r.date.split('/').map(Number);
        const [d2] = prevDate.split('/').map(Number);
        // Em mapas do Dialsist, cada novo paciente reinicia a sequência de datas de coleta do mês
        if (d1 <= d2) {
          isNew = true;
        }
      }
    }

    if (isNew) {
      if (current) rawPatients.push(current);
      current = {
        nameParts: r.namePart ? [r.namePart] : [],
        dates: r.date ? [r.date] : [],
        rows: [r]
      };
    } else {
      if (r.namePart) current.nameParts.push(r.namePart);
      if (r.date) current.dates.push(r.date);
      current.rows.push(r);
    }
  }
  if (current) rawPatients.push(current);

  // Consolidação clínica dos exames de cada paciente no mês
  const results = [];
  rawPatients.forEach((p, idx) => {
    let fullName = p.nameParts.join(' ').trim();
    fullName = fullName.replace(/\b(Minimo|Maximo|Mediana|Media)\b/gi, '').trim();
    if (!fullName || fullName.length < 3) return;

    const matched = matchPatientInList(fullName, patientsList);

    const exames = {};
    p.rows.forEach(r => {
      r.values.forEach(v => {
        let closestCol = null;
        let minDiff = 999;
        r.headerItems.forEach(h => {
          const diff = Math.abs(v.x - h.transform[4]);
          if (diff < minDiff) {
            minDiff = diff;
            closestCol = h.str.trim();
          }
        });

        if (minDiff <= 18 && DIALSIST_COL_MAP[closestCol]) {
          const key = DIALSIST_COL_MAP[closestCol];
          const rawStr = v.str.trim();

          // Sorologias qualitativas
          if (['hbsag', 'antiHbs', 'antiHcv', 'hiv'].includes(key)) {
            if (rawStr === 'NR') exames[key] = 'Não Reagente';
            else if (rawStr === 'R') exames[key] = 'Reagente';
            else if (rawStr === 'IN') exames[key] = 'Indeterminado';
          } else {
            const num = parseFloat(rawStr.replace(',', '.'));
            if (!isNaN(num) && exames[key] === undefined) {
              exames[key] = num;
            }
          }
        }
      });
    });

    // Se o exame tiver U1 e U2 mas não tiver Kt/V ou IST, aplica cálculos derivados
    const finalExames = applyDerivedCalculations(exames);

    // Formata data do exame a partir da data de coleta mais recente
    let finalDate = periodDate || new Date().toISOString().split('T')[0];
    if (p.dates.length > 0) {
      const lastD = p.dates[p.dates.length - 1];
      const matchD = lastD.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
      if (matchD) {
        let [_, d, m, y] = matchD;
        if (y.length === 2) y = '20' + y;
        finalDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
    }

    results.push({
      id: `import-dialsist-row-${idx}-${Date.now()}`,
      nomeArquivo: fullName,
      cpf: matched.patient?.cpf || null,
      pacienteId: matched.patient?.id || '',
      pacienteNome: matched.patient?.nome || '',
      statusMatch: matched.status,
      confianca: matched.score,
      dataExame: finalDate,
      exames: finalExames,
      confirmado: matched.status === 'EXACT_OR_HIGH'
    });
  });

  return {
    tipoArquivo: 'PDF - Mapa Exames (Dialsist Web)',
    dataSugerida: periodDate || (results[0]?.dataExame) || new Date().toISOString().split('T')[0],
    totalIdentificados: results.length,
    registros: results
  };
}

/**
 * 🔬 PARSER CIRÚRGICO ESPECIALISTA - LABICON LABORATÓRIO (Perfil Homologado)
 * Processa laudos individuais e multi-páginas do Labicon com 100% de precisão nos 22+ parâmetros
 */
export function parseLabiconReport(pagesLines, patientsList = [], detectedGlobalDate = null) {
  const patientBuckets = [];
  let currentBucket = null;

  for (const { pageNum, lines } of pagesLines) {
    let pageCpf = null;
    let pageNome = null;
    let pageDate = null;
    let pageReq = null;

    for (const line of lines) {
      if (!pageCpf) {
        const m = line.match(/CPF[.:_\s]+(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{11})/i);
        if (m) pageCpf = m[1].trim();
      }
      if (!pageNome) {
        const m = line.match(/(?:^|\s)Nome[.:_\s]+([A-ZÀ-Úa-z\s]+?)(?=\s*(?:Data|CPF|RG|Nasc|Sexo|Convenio|Entrada|Idade|Requisicao|Solicitante|$))/i);
        if (m && m[1].trim().length >= 3 && !m[1].toLowerCase().includes("social")) {
          pageNome = m[1].trim();
        }
      }
      if (!pageReq) {
        const m = line.match(/Requisi[çc][aã]o[.:_\s]+(\d+)/i);
        if (m) pageReq = m[1].trim();
      }
      if (!pageDate) {
        const m = line.match(/Coletado\s+em[.:_\s]+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i);
        if (m) {
          let [_, d, mo, y] = m[1].match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/);
          if (y.length === 2) y = "20" + y;
          pageDate = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
      }
    }

    if (!pageDate) {
      for (const line of lines) {
        const m = line.match(/Entrada[.:_\s]+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i);
        if (m) {
          let [_, d, mo, y] = m[1].match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/);
          if (y.length === 2) y = "20" + y;
          pageDate = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
          break;
        }
      }
    }

    const isDifferent = currentBucket && (
      (pageCpf && currentBucket.cpf && pageCpf.replace(/\D/g, '') !== currentBucket.cpf.replace(/\D/g, '')) ||
      (pageReq && currentBucket.requisicao && pageReq !== currentBucket.requisicao) ||
      (pageNome && currentBucket.nome && calculateNameSimilarity(pageNome, currentBucket.nome) < 0.6)
    );

    if (!currentBucket || isDifferent) {
      currentBucket = {
        cpf: pageCpf,
        nome: pageNome,
        requisicao: pageReq,
        dataExame: pageDate || detectedGlobalDate || new Date().toISOString().split("T")[0],
        allLines: [...lines]
      };
      patientBuckets.push(currentBucket);
    } else {
      if (pageCpf && !currentBucket.cpf) currentBucket.cpf = pageCpf;
      if (pageNome && !currentBucket.nome) currentBucket.nome = pageNome;
      if (pageDate && !currentBucket.dataExame) currentBucket.dataExame = pageDate;
      currentBucket.allLines.push(...lines);
    }
  }

  // Agora extrai os exames para cada bucket de paciente
  const registros = [];
  patientBuckets.forEach((bucket, idx) => {
    const exames = {};
    let activeExamKey = null;

    for (let i = 0; i < bucket.allLines.length; i++) {
      const line = bucket.allLines[i];
      const normLine = line.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

      // Encerra exame ativo ao encontrar blocos de histórico anterior ou assinaturas
      if (
        normLine.includes("RESULTADOS ANTERIORES") || 
        normLine.includes("LIBERADO ELETRONICAMENTE") || 
        normLine.includes("ESTE EXAME POSSUI ASSINATURA") ||
        normLine.includes("RT ISABEL DE LOURDES")
      ) {
        activeExamKey = null;
        continue;
      }

      // Hemograma
      const matchHb = line.match(/(?:^|\b)HEMOGLOBINA[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
      if (matchHb && exames.hb === undefined && !normLine.includes("GLICADA")) {
        exames.hb = parseExamNumber(matchHb[1]);
      }
      const matchHt = line.match(/(?:^|\b)HEMAT[OÓ]CRITO[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
      if (matchHt && exames.ht === undefined) {
        exames.ht = parseExamNumber(matchHt[1]);
      }
      const matchLeu = line.match(/(?:^|\b)LEUC[OÓ]CITOS[.:_\s]+([0-9.]+)/i);
      if (matchLeu && exames.leucocitos === undefined) {
        exames.leucocitos = parseExamNumber(matchLeu[1]);
      }
      const matchPlq = line.match(/(?:^|\b)PLAQUETAS[.:_\s]+([0-9.]+)/i);
      if (matchPlq && exames.plaquetas === undefined) {
        exames.plaquetas = parseExamNumber(matchPlq[1]);
      }

      // Ferro e IST
      const matchFerro = line.match(/Ferro\s*s[eé]rico[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
      if (matchFerro && exames.ferro === undefined) {
        exames.ferro = parseExamNumber(matchFerro[1]);
      }
      const matchIst = line.match(/[IÍ]ndice\s*de\s*Satura[çc][aã]o\s*(?:da|de)?\s*Transferrina[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
      if (matchIst && exames.ist === undefined) {
        exames.ist = parseExamNumber(matchIst[1]);
      }

      // Albumina
      const matchAlb = line.match(/ALBUMINA[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
      if (matchAlb && exames.albumina === undefined) {
        exames.albumina = parseExamNumber(matchAlb[1]);
      }

      // Hemoglobina Glicada HbA1c
      const matchHba1c = line.match(/Hemoglobina\s+Glicada[^%]*?[.:_\s]+([0-9]+[.,]?[0-9]*)\s*%/i);
      if (matchHba1c && exames.hba1c === undefined) {
        exames.hba1c = parseExamNumber(matchHba1c[1]);
      }

      // Cabeçalhos de Exames
      if (normLine === "CALCIO" || normLine.startsWith("CALCIO ")) {
        activeExamKey = "ca";
        continue;
      }
      if (normLine === "FOSFATASE ALCALINA" || normLine.startsWith("FOSFATASE ALCALINA ")) {
        activeExamKey = "fa";
        continue;
      }
      if (normLine === "FOSFORO" || normLine.startsWith("FOSFORO ")) {
        activeExamKey = "fosforo";
        continue;
      }
      if (normLine === "GLICEMIA EM JEJUM" || normLine.startsWith("GLICEMIA EM JEJUM ")) {
        activeExamKey = "glicemia";
        continue;
      }
      if (normLine.includes("TRANSAMINASE GLUTAMICO PIRUVICA") || normLine.includes("TGP")) {
        activeExamKey = "tgp";
        continue;
      }
      if (normLine.includes("UREIA POS DIALISE") || normLine.includes("UREIA POS-DIALISE")) {
        activeExamKey = "ureiaPos";
        continue;
      }
      if (normLine === "UREIA" || normLine.startsWith("UREIA ")) {
        activeExamKey = "ureiaPre";
        continue;
      }
      if (normLine.includes("VITAMINA D") || normLine.includes("25 DIHIDROXI")) {
        activeExamKey = "vitD";
        continue;
      }
      if (normLine.includes("FERRITINA")) {
        activeExamKey = "ferritina";
        continue;
      }
      if (normLine.includes("POTASSIO") || normLine.includes("POTÁSSIO")) {
        activeExamKey = "k";
        continue;
      }
      if (normLine.includes("PARATORMONIO") || normLine.includes("PTH")) {
        activeExamKey = "pth";
        continue;
      }
      if (normLine === "SODIO" || normLine === "SÓDIO") {
        activeExamKey = "na";
        continue;
      }
      if (normLine.includes("HBSAG")) {
        activeExamKey = "hbsag";
        continue;
      }
      if (normLine.includes("HBS, ANTI") || normLine.includes("ANTI HBS") || normLine.includes("HBS ANTI")) {
        activeExamKey = "antiHbs";
        continue;
      }
      if (normLine.includes("ANTI HCV") || normLine.includes("HEPATITE C")) {
        activeExamKey = "antiHcv";
        continue;
      }

      // Resultados de exame ativo
      if (activeExamKey) {
        if (["hbsag", "antiHbs", "antiHcv"].includes(activeExamKey)) {
          if (/Resultado[.:_\s]+N[aã]o\s+reagente/i.test(line)) {
            exames[activeExamKey] = "Não Reagente";
            activeExamKey = null;
            continue;
          }
          if (/Resultado[.:_\s]+Reagente/i.test(line)) {
            exames[activeExamKey] = "Reagente";
            activeExamKey = null;
            continue;
          }
        }

        const matchRes = line.match(/Resultado[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
        if (matchRes) {
          const val = parseExamNumber(matchRes[1]);
          if (val !== null) {
            exames[activeExamKey] = val;
            activeExamKey = null; // Fecha imediatamente para evitar leituras de resultados anteriores
            continue;
          }
        }
      }
    }

    const finalExames = applyDerivedCalculations(exames);
    const matched = matchPatientInList(bucket.cpf ? `${bucket.nome} CPF ${bucket.cpf}` : bucket.nome, patientsList);

    registros.push({
      id: `import-labicon-${idx}-${Date.now()}`,
      nomeArquivo: bucket.nome || `Paciente Labicon ${idx + 1}`,
      cpf: bucket.cpf || null,
      pacienteId: matched.patient?.id || "",
      pacienteNome: matched.patient?.nome || "",
      statusMatch: matched.status,
      confianca: matched.score,
      dataExame: bucket.dataExame,
      exames: finalExames,
      confirmado: matched.status === "EXACT_OR_HIGH"
    });
  });

  return {
    laboratorio: {
      id: "labicon",
      nome: "LABICON Laboratório",
      confianca: "100%",
      homologado: true
    },
    dataSugerida: registros[0]?.dataExame || detectedGlobalDate || new Date().toISOString().split("T")[0],
    registros
  };
}

/**
 * 📑 PARSER PDF UNIVERSAL (.pdf)
 * Suporta Laudos Clínicos Individuais/Multi-páginas (Labicon, Hermes Pardini, DB, Fleury, etc.)
 * e Mapões/Tabelas Consolidadas de Diálise (Sistema Dialsist Web / DialiZe)
 */
export async function parsePdfFile(file, patientsList = []) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  // Extrai linhas ordenadas espacialmente para cada página
  const pagesLines = [];
  let detectedGlobalDate = detectDateFromText(file.name) || null;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    // Agrupa itens por linha com tolerância de Y (+- 3px)
    const lineBuckets = [];
    textContent.items.forEach(item => {
      const y = item.transform[5];
      let bucket = lineBuckets.find(b => Math.abs(b.y - y) <= 3.5);
      if (!bucket) {
        bucket = { y, items: [] };
        lineBuckets.push(bucket);
      }
      bucket.items.push(item);
    });

    // Ordena linhas de cima para baixo
    lineBuckets.sort((a, b) => b.y - a.y);

    // Ordena itens de cada linha da esquerda para a direita e monta o texto
    const lines = lineBuckets.map(bucket => {
      bucket.items.sort((a, b) => a.transform[4] - b.transform[4]);
      return bucket.items.map(it => it.str).join(' ').trim();
    }).filter(Boolean);

    pagesLines.push({ pageNum, lines, items: textContent.items });
  }

  const allLines = pagesLines.flatMap(p => p.lines);
  const fullTextUpper = allLines.join(' ').toUpperCase();

  // ================= ESTRATÉGIA -1: DETECÇÃO DE LABORATÓRIO HOMOLOGADO (SMART LAB REGISTRY) =================
  const homologatedLab = detectLaboratoryProfile(fullTextUpper);
  if (homologatedLab && homologatedLab.id === 'labicon') {
    const labiconResult = parseLabiconReport(pagesLines, patientsList, detectedGlobalDate);
    if (labiconResult && labiconResult.registros?.length > 0) {
      return {
        tipoArquivo: `PDF - ${homologatedLab.nome} (Homologado)`,
        laboratorioDetectado: homologatedLab,
        dataSugerida: labiconResult.dataSugerida,
        totalIdentificados: labiconResult.registros.length,
        registros: labiconResult.registros
      };
    }
  }

  // ================= ESTRATÉGIA 0: MAPA EXAMES COLUNAR (SISTEMA DIALSIST / DIALIZE) =================
  const isDialsistMap = (homologatedLab && homologatedLab.id === 'dialsist-mapao') ||
                        fullTextUpper.includes('MAPA EXAMES') || 
                        fullTextUpper.includes('DIALSIST') || 
                        fullTextUpper.includes('DIALIZE') ||
                        (fullTextUpper.includes('NOME') && fullTextUpper.includes('DATA') && fullTextUpper.includes('KTV') && fullTextUpper.includes('CAS'));

  if (isDialsistMap) {
    const dialsistResult = parseDialsistExamMap(pagesLines, patientsList, detectedGlobalDate, file?.name || '');
    if (dialsistResult.registros.length > 0) {
      dialsistResult.laboratorioDetectado = homologatedLab || { id: 'dialsist-mapao', nome: 'Dialsist Web / DialiZe', homologado: true };
      return dialsistResult;
    }
  }

  // ================= ESTRATÉGIA 1: LAUDO CLÍNICO LABORATORIAL =================
  // Identifica se o documento é estruturado como laudo médico (cabeçalho com nome/CPF do paciente e blocos de exames)
  const isClinicalReport = fullTextUpper.includes('RESULTADO') || 
                          fullTextUpper.includes('LAUDO') || 
                          fullTextUpper.includes('LABORAT') || 
                          fullTextUpper.includes('VALORES DE REFER') ||
                          fullTextUpper.includes('COLETADO EM');

  if (isClinicalReport) {
    // Agrupa laudos por paciente (trata páginas 1 a N do mesmo paciente como 1 único registro)
    const patientReports = [];
    let currentReport = null;

    for (const { pageNum, lines } of pagesLines) {
      let pagePatientName = null;
      let pageCpf = null;
      let pageDate = null;

      // 1. Extração do Cabeçalho da Página
      for (const line of lines) {
        // Detecta CPF
        if (!pageCpf) {
          const matchCpf = line.match(/(?:CPF)[\s.:_]+(\d{3}\.?\d{3}\.?\d{3}-?\d{2}|\d{11})/i);
          if (matchCpf) pageCpf = matchCpf[1].trim();
        }

        // Detecta Nome do Paciente no cabeçalho (dando prioridade ao Nome oficial sobre Nome Social)
        const matchNomeOficial = line.match(/(?:^|\s)Nome[\s.:_]+([A-ZÀ-Úa-z\s]+?)(?=\s*(?:Data|CPF|RG|Nasc|Sexo|Convenio|Entrada|Idade|Requisicao|Solicitante|$))/i);
        if (matchNomeOficial && matchNomeOficial[1].trim().length >= 3 && !matchNomeOficial[1].toLowerCase().includes('social')) {
          pagePatientName = matchNomeOficial[1].trim();
        } else if (!pagePatientName) {
          const matchNomeGen = line.match(/(?:Nome\s+Social|Paciente|Cliente)[\s.:_]+([A-ZÀ-Úa-z\s]+?)(?=\s*(?:Data|CPF|RG|Nasc|Sexo|Convenio|Entrada|Idade|Requisicao|Solicitante|$))/i);
          if (matchNomeGen && matchNomeGen[1].trim().length >= 3) {
            pagePatientName = matchNomeGen[1].trim();
          }
        }

        // Detecta Data da Coleta (prioridade máxima para Data Coleta)
        if (!pageDate) {
          const matchColeta = line.match(/(?:Coletado\s+em|Data\s+(?:da\s+)?coleta|Data\s*coleta)[\s.:_]+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i);
          if (matchColeta) {
            let [_, d, m, y] = matchColeta[1].match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/);
            if (y.length === 2) y = '20' + y;
            pageDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          }
        }
      }

      // Se ainda não encontrou nome por rótulo, verifica as 10 primeiras linhas contra a lista de pacientes
      if (!pagePatientName && patientsList && patientsList.length > 0) {
        for (let i = 0; i < Math.min(lines.length, 10); i++) {
          const cand = lines[i].trim();
          if (cand.length >= 4 && !cand.includes(':') && !cand.includes('LABORAT')) {
            const m = matchPatientInList(cand, patientsList);
            if (m.status === 'EXACT_OR_HIGH') {
              pagePatientName = m.patient.nome;
              break;
            }
          }
        }
      }

      // Fallback de data para Entrada ou Data do Laudo (ignorando estritamente Data Nasc)
      if (!pageDate) {
        for (const line of lines) {
          if (/Data\s*Nasc/i.test(line)) continue;
          const matchEntrada = line.match(/(?:Entrada|Data)[\s.:_]+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i);
          if (matchEntrada) {
            let [_, d, m, y] = matchEntrada[1].match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/);
            if (y.length === 2) y = '20' + y;
            pageDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            break;
          }
        }
      }

      if (pageDate && !detectedGlobalDate) {
        detectedGlobalDate = pageDate;
      }

      // Se detectou paciente ou se é a primeira página
      const matched = matchPatientInList(pageCpf ? `${pagePatientName || ''} CPF ${pageCpf}` : (pagePatientName || ''), patientsList);

      // Verifica se a página identifica um NOVO paciente diferente
      const isDifferentPatient = currentReport && (
        (pageCpf && currentReport.cpf && pageCpf.replace(/\D/g, '') !== currentReport.cpf.replace(/\D/g, '')) ||
        (matched.patient && currentReport.pacienteId && matched.patient.id !== currentReport.pacienteId) ||
        (pagePatientName && currentReport.nomeArquivo && calculateNameSimilarity(pagePatientName, currentReport.nomeArquivo) < 0.6)
      );

      const isSamePatient = currentReport && !isDifferentPatient;

      if (!isSamePatient) {
        currentReport = {
          id: `import-pdf-report-${pageNum}-${Date.now()}`,
          nomeArquivo: pagePatientName || (matched.patient ? matched.patient.nome : `Paciente Página ${pageNum}`),
          cpf: pageCpf,
          pacienteId: matched.patient?.id || '',
          pacienteNome: matched.patient?.nome || '',
          statusMatch: matched.status,
          confianca: matched.score,
          dataExame: pageDate || detectedGlobalDate || new Date().toISOString().split('T')[0],
          exames: {},
          confirmado: matched.status === 'EXACT_OR_HIGH'
        };
        patientReports.push(currentReport);
      } else {
        // Se a página anterior não tinha associado mas esta identificou melhor
        if (!currentReport.pacienteId && matched.patient) {
          currentReport.pacienteId = matched.patient.id;
          currentReport.pacienteNome = matched.patient.nome;
          currentReport.statusMatch = matched.status;
          currentReport.confianca = matched.score;
          currentReport.confirmado = matched.status === 'EXACT_OR_HIGH';
        }
        if (pageDate && (!currentReport.dataExame || currentReport.dataExame === new Date().toISOString().split('T')[0])) {
          currentReport.dataExame = pageDate;
        }
      }

      // 2. Extração de Blocos de Exames na Página
      let currentExamKey = null;
      let inReferenceSection = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const normLine = normalizeString(line);

        // Se encontrou seção de histórico / resultados anteriores, reseta exame ativo
        if (normLine.includes('resultados anteriores') || normLine.includes('historico de resultados')) {
          inReferenceSection = true;
          currentExamKey = null;
          continue;
        }

        // Se entrou em seção de valores de referência, notas ou assinaturas
        if (
          normLine.startsWith('ref:') ||
          normLine.includes('filtracao glomerular estimada') ||
          normLine.startsWith('nota:') ||
          normLine.startsWith('notas:') ||
          normLine.startsWith('responsavel:') ||
          normLine.startsWith('assinado digitalmente') ||
          normLine.startsWith('liberado eletronicamente') ||
          normLine.startsWith('este exame possui assinatura')
        ) {
          inReferenceSection = true;
          currentExamKey = null;
        }

        // A linha "valores de referencia" não deve travar o bloco se vier no topo (como no Labicon)
        if (normLine === 'valores de referencia' || normLine === 'valor de referencia') {
          continue;
        }

        // Detecta Tipagem Sanguínea
        if (line.includes('GRUPO SANGUÍNEO') || line.includes('GRUPO SANGUINEO')) {
          const match = line.match(/GRUPO\s+SANGU[IÍ]NEO[\s.:_]+["']?\s*([ABO0][\+-]?)\s*["']?/i);
          if (match) currentReport.exames.grupoSanguineo = match[1].replace('0', 'O');
        }
        if (line.includes('FATOR RH')) {
          const match = line.match(/FATOR\s+RH[\s.:_]+["']?\s*([A-Za-z]+)\s*["']?/i);
          if (match) currentReport.exames.fatorRh = match[1];
        }

        // Detecta Sorologias qualitativas em texto livre
        if (/AMOSTRA\s+N[AÃ]O\s+REAGENTE\s+PARA\s+HIV/i.test(line)) currentReport.exames.hiv = 'Não Reagente';
        if (/AMOSTRA\s+N[AÃ]O\s+REAGENTE.*(?:HbsAg|HEPATITE\s+B)/i.test(line)) currentReport.exames.hbsag = 'Não Reagente';
        if (/AMOSTRA\s+N[AÃ]O\s+REAGENTE.*(?:ANTI-HCV|HEPATITE\s+C)/i.test(line)) currentReport.exames.antiHcv = 'Não Reagente';
        if (/AMOSTRA\s+N[AÃ]O\s+REAGENTE.*(?:ANTI-HBC)/i.test(line)) currentReport.exames.antiHbc = 'Não Reagente';

        // Detecta cabeçalho de exame
        const potentialExamKey = matchHeaderToExamKey(line);
        if (potentialExamKey) {
          currentExamKey = potentialExamKey;
          inReferenceSection = false;
        }

        // 1. Extração direta de linhas no formato específico
        if (!inReferenceSection) {
          // Hemoglobina no hemograma ou laudo individual
          const matchHb = line.match(/(?:^|\b)Hemoglobina[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
          if (matchHb && currentReport.exames.hb === undefined && !normLine.includes('glicada')) {
            const v = parseExamNumber(matchHb[1]);
            if (v !== null) currentReport.exames.hb = v;
          }

          // Hematócrito no hemograma ou laudo individual
          const matchHt = line.match(/(?:^|\b)Hemat[oó]crito[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
          if (matchHt && currentReport.exames.ht === undefined) {
            const v = parseExamNumber(matchHt[1]);
            if (v !== null) currentReport.exames.ht = v;
          }

          // Hemoglobina Glicada - HbA1c (ex: "Hemoglobina Glicada (A1: 6,3 %", "HbA1c: 6,3 %")
          const matchHba1c = line.match(/(?:Hemoglobina\s+Glicada|Hb\s*A1c|HbA1c)[^%]*?([0-9]+[.,]?[0-9]*)\s*%/i);
          if (matchHba1c && currentReport.exames.hba1c === undefined) {
            const v = parseExamNumber(matchHba1c[1]);
            if (v !== null) currentReport.exames.hba1c = v;
          }

          // Ferro sérico (ex: "Ferro sérico.......................: 32 µg/dL")
          const matchFerro = line.match(/(?:^|\b)Ferro(?:\s*s[eé]rico)?[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
          if (matchFerro && currentReport.exames.ferro === undefined && !normLine.includes('capacidade')) {
            const v = parseExamNumber(matchFerro[1]);
            if (v !== null) currentReport.exames.ferro = v;
          }

          // Índice de Saturação de Transferrina (ex: "Índice de Saturação de Transferrina: 11 %")
          const matchIst = line.match(/(?:[IÍ]ndice\s*de\s*Satura[çc][aã]o\s*(?:da|de)?\s*Transferrina|Satura[çc][aã]o\s*(?:da|de)?\s*Transferrina|IST)[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
          if (matchIst && currentReport.exames.ist === undefined) {
            const v = parseExamNumber(matchIst[1]);
            if (v !== null) currentReport.exames.ist = v;
          }

          // Albumina (em Proteínas Totais ou isolada)
          const matchAlb = line.match(/(?:^|\b)Albumina[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
          if (matchAlb && currentReport.exames.albumina === undefined) {
            const v = parseExamNumber(matchAlb[1]);
            if (v !== null) currentReport.exames.albumina = v;
          }

          // Creatinina Sérica
          const matchCr = line.match(/(?:^|\b)Creatinina(?:\s*S[eé]rica)?[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
          if (matchCr && currentReport.exames.creatinina === undefined) {
            const v = parseExamNumber(matchCr[1]);
            if (v !== null) currentReport.exames.creatinina = v;
          }

          // Leucócitos
          const matchLeu = line.match(/(?:^|\b)Leuc[oó]citos[.:_\s]+([0-9.]+)/i);
          if (matchLeu && currentReport.exames.leucocitos === undefined) {
            const v = parseExamNumber(matchLeu[1]);
            if (v !== null) currentReport.exames.leucocitos = v;
          }

          // Plaquetas
          const matchPlq = line.match(/(?:^|\b)(?:Plaquetas|Contagem\s*de\s*Plaquetas)[.:_\s]+([0-9.]+)/i);
          if (matchPlq && currentReport.exames.plaquetas === undefined) {
            const v = parseExamNumber(matchPlq[1]);
            if (v !== null) currentReport.exames.plaquetas = v;
          }

          // Ureia Pré / Ureia Pós inline
          const matchUreiaPre = line.match(/(?:^|\b)Ur[eé]ia\s*Pr[eé][.:_\s]+([0-9]+[.,]?[0-9]*)/i);
          if (matchUreiaPre && currentReport.exames.ureiaPre === undefined) {
            const v = parseExamNumber(matchUreiaPre[1]);
            if (v !== null) currentReport.exames.ureiaPre = v;
          }
          const matchUreiaPos = line.match(/(?:^|\b)Ur[eé]ia\s*P[oó]s(?:\s*di[aá]lise)?[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
          if (matchUreiaPos && currentReport.exames.ureiaPos === undefined) {
            const v = parseExamNumber(matchUreiaPos[1]);
            if (v !== null) currentReport.exames.ureiaPos = v;
          }

          // Sorologias qualitativas quando há exame ativo
          if (currentExamKey && ['hbsag', 'antiHbs', 'antiHcv', 'antiHbc', 'hiv'].includes(currentExamKey)) {
            if (/Resultado[.:_\s]+N[aã]o\s+reagente/i.test(line) || /^N[aã]o\s+reagente\b/i.test(line.trim())) {
              currentReport.exames[currentExamKey] = 'Não Reagente';
              currentExamKey = null;
            } else if (/Resultado[.:_\s]+Reagente/i.test(line) || /^Reagente\b/i.test(line.trim())) {
              currentReport.exames[currentExamKey] = 'Reagente';
              currentExamKey = null;
            }
          }
        }

        // 2. Extração de valor sozinho ou na linha de "Resultado: ..." para o exame ativo
        if (currentExamKey && !inReferenceSection && currentReport.exames[currentExamKey] === undefined) {
          const isMetadataLine = normLine.startsWith('material') || 
                                 normLine.startsWith('metodo') || 
                                 normLine.startsWith('metodologia') ||
                                 normLine.startsWith('data coleta') ||
                                 normLine.startsWith('liberado') || 
                                 normLine.startsWith('solicitante') || 
                                 normLine.startsWith('convenio');

          if (!isMetadataLine) {
            // Suporta "Resultado...........: 8,9 mg/dL Lactantes: 9,0 a 11,0 mg/dL"
            const resultMatch = line.match(/(?:^|\b)(?:Resultado|Valor)[.:_\s]+([0-9]+[.,]?[0-9]*)/i);
            const unitMatch = line.match(/^([0-9]+[.,]?[0-9]*)\s*(?:g\s*\/\s*d[lL]|mg\s*\/\s*d[lL]|mcg\s*\/\s*d[lL]|mcg\s*\/\s*[lL]|ng\s*\/\s*m[lL]|pg\s*\/\s*m[lL]|m[eE]q\s*\/\s*[lL]|U\s*\/\s*[lL]|g%|%)(?:\s|$)/i);

            const chosenMatch = resultMatch || unitMatch;
            if (chosenMatch) {
              const val = parseExamNumber(chosenMatch[1]);
              if (val !== null) {
                currentReport.exames[currentExamKey] = val;
                currentExamKey = null; // Reseta para evitar capturar referências subsequentes
              }
            }
          }
        }
      }
    }

    // Pós-processamento: cálculos automáticos de nefrologia (IST e Kt/V) para cada laudo
    patientReports.forEach(report => {
      // 1. Cálculo automático de IST (%) se Ferro e Transferrina estiverem presentes
      if (report.exames.ist === undefined && report.exames.ferro && report.exames.transferrina) {
        const istCalc = (report.exames.ferro * 70.9) / report.exames.transferrina;
        report.exames.ist = Math.round(istCalc * 10) / 10;
      }

      // 2. Cálculo automático de Kt/V (Daugirdas sp) a partir de Ureia Pré e Pós
      if (report.exames.ktv === undefined && report.exames.ureiaPre && report.exames.ureiaPos) {
        const pre = Number(report.exames.ureiaPre);
        const pos = Number(report.exames.ureiaPos);
        if (pre > pos && pre > 0) {
          const r = pos / pre;
          if (r > 0.032) {
            const ktvEst = -Math.log(r - 0.032);
            report.exames.ktv = Math.round(ktvEst * 100) / 100;
          }
        }
      }
    });

    // Se encontrou laudos com exames ou pacientes
    if (patientReports.length > 0 && patientReports.some(r => Object.keys(r.exames).length > 0)) {
      return {
        tipoArquivo: homologatedLab ? `PDF - ${homologatedLab.nome}` : 'PDF',
        laboratorioDetectado: homologatedLab || null,
        dataSugerida: detectedGlobalDate || new Date().toISOString().split('T')[0],
        totalIdentificados: patientReports.length,
        registros: patientReports
      };
    }
  }

  // ================= ESTRATÉGIA 2: MAPÃO OU TABELA CONSOLIDADA EM PDF =================
  const results = [];
  const fallbackDate = detectedGlobalDate || new Date().toISOString().split('T')[0];

  for (const { pageNum, lines } of pagesLines) {
    for (let l = 0; l < lines.length; l++) {
      const lineStr = lines[l];
      if (lineStr.length < 3) continue;

      const matched = matchPatientInList(lineStr, patientsList);
      if (matched.status === 'EXACT_OR_HIGH' || (matched.status === 'SUGGESTION' && matched.score >= 70)) {
        const exames = {};

        // Busca exames na mesma linha ou nas 2 linhas adjacentes
        const contextLines = [lineStr, lines[l + 1] || '', lines[l + 2] || ''].join(' ');

        for (const [examKey, aliases] of Object.entries(EXAM_ALIASES)) {
          for (const alias of aliases) {
            const regex = new RegExp(`\\b${alias}\\b\\s*[:=-]?\\s*([\\d.,]+)`, 'i');
            const match = contextLines.match(regex);
            if (match) {
              const val = parseExamNumber(match[1]);
              if (val !== null && exames[examKey] === undefined) {
                exames[examKey] = val;
              }
            }
          }
        }

        const finalExames = applyDerivedCalculations(exames);
        results.push({
          id: `import-pdf-table-${pageNum}-${l}-${Date.now()}`,
          nomeArquivo: lineStr.split(/\d/)[0].trim() || lineStr,
          pacienteId: matched.patient?.id || '',
          pacienteNome: matched.patient?.nome || '',
          statusMatch: matched.status,
          confianca: matched.score,
          dataExame: fallbackDate,
          exames: finalExames,
          confirmado: matched.status === 'EXACT_OR_HIGH'
        });
      }
    }
  }

  return {
    tipoArquivo: homologatedLab ? `PDF - ${homologatedLab.nome}` : 'PDF',
    laboratorioDetectado: homologatedLab || null,
    dataSugerida: fallbackDate,
    totalIdentificados: results.length,
    registros: results
  };
}

/**
 * 🖼️ PARSER IMAGEM / OCR (.jpg, .png, .jpeg, .webp)
 */
export async function parseImageFile(file, patientsList = [], onProgress = () => {}) {
  onProgress(10, 'Iniciando motor de OCR óptico...');
  const worker = await createWorker('por');
  
  onProgress(40, 'Processando imagem e extraindo texto...');
  const ret = await worker.recognize(file);
  await worker.terminate();

  const text = ret.data.text;
  onProgress(80, 'Estruturando dados e buscando pacientes...');

  if (!text || text.trim().length === 0) {
    throw new Error('Nenhum texto pôde ser reconhecido na imagem. Tente uma foto com iluminação mais clara.');
  }

  const detectedDate = detectDateFromText(file.name) || detectDateFromText(text) || new Date().toISOString().split('T')[0];
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);

  const results = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matched = matchPatientInList(line, patientsList);

    if (matched.status === 'EXACT_OR_HIGH' || matched.status === 'SUGGESTION') {
      const exames = {};

      // Analisa até 10 linhas seguintes procurando valores de exames
      for (let j = i; j < Math.min(lines.length, i + 10); j++) {
        const subLine = lines[j];
        for (const [examKey, aliases] of Object.entries(EXAM_ALIASES)) {
          for (const alias of aliases) {
            const regex = new RegExp(`\\b${alias}\\b\\s*[:=-]?\\s*([\\d.,]+)`, 'i');
            const match = subLine.match(regex);
            if (match && !exames[examKey]) {
              const val = parseExamNumber(match[1]);
              if (val !== null) exames[examKey] = val;
            }
          }
        }
      }

      const finalExames = applyDerivedCalculations(exames);
      results.push({
        id: `import-img-${i}-${Date.now()}`,
        nomeArquivo: line,
        pacienteId: matched.patient?.id || '',
        pacienteNome: matched.patient?.nome || '',
        statusMatch: matched.status,
        confianca: matched.score,
        dataExame: detectedDate,
        exames: finalExames,
        confirmado: matched.status === 'EXACT_OR_HIGH'
      });
    }
  }

  // Se não encontrou nenhum paciente pelo OCR de linhas, mas há pacientes, oferece como rascunho de paciente avulso
  if (results.length === 0 && text) {
    const exames = {};
    for (const [examKey, aliases] of Object.entries(EXAM_ALIASES)) {
      for (const alias of aliases) {
        const regex = new RegExp(`\\b${alias}\\b\\s*[:=-]?\\s*([\\d.,]+)`, 'i');
        const match = text.match(regex);
        if (match && !exames[examKey]) {
          const val = parseExamNumber(match[1]);
          if (val !== null) exames[examKey] = val;
        }
      }
    }

    if (Object.keys(exames).length > 0) {
      const finalExames = applyDerivedCalculations(exames);
      results.push({
        id: `import-img-single-${Date.now()}`,
        nomeArquivo: 'Laudo Fotográfico (Selecionar Paciente)',
        pacienteId: patientsList[0]?.id || '',
        pacienteNome: patientsList[0]?.nome || '',
        statusMatch: 'SUGGESTION',
        confianca: 50,
        dataExame: detectedDate,
        exames: finalExames,
        confirmado: false
      });
    }
  }

  onProgress(100, 'Processamento concluído!');
  return {
    tipoArquivo: 'IMAGEM',
    dataSugerida: detectedDate,
    totalIdentificados: results.length,
    registros: results
  };
}

/**
 * Ponto de entrada centralizado para qualquer formato de arquivo
 */
export async function parseExamFile(file, patientsList = [], onProgress = () => {}) {
  const fileName = (file.name || '').toLowerCase();

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
    onProgress(50, 'Lendo dados da planilha Excel/CSV...');
    return await parseExcelFile(file, patientsList);
  }

  if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    onProgress(50, 'Processando documento Word...');
    return await parseDocxFile(file, patientsList);
  }

  if (fileName.endsWith('.pdf')) {
    onProgress(50, 'Extraindo relatórios e tabelas do PDF...');
    return await parsePdfFile(file, patientsList);
  }

  if (/\.(png|jpe?g|webp|bmp|gif)$/i.test(fileName)) {
    return await parseImageFile(file, patientsList, onProgress);
  }

  throw new Error(`Formato de arquivo não suportado (${fileName}). Use .xlsx, .xls, .pdf, .docx ou fotos/imagens.`);
}

/**
 * Gravação em lote com segurança no Cloud Firestore
 */
export async function commitImportedExams(doctorId, confirmedRecords, doctorName = 'Médico') {
  if (!confirmedRecords || confirmedRecords.length === 0) {
    return { success: true, count: 0 };
  }

  let successCount = 0;
  const errors = [];

  for (const record of confirmedRecords) {
    if (!record.pacienteId || !record.confirmado) continue;

    try {
      await savePatientExam(record.pacienteId, {
        ...record.exames,
        dataExame: record.dataExame || new Date().toISOString().split('T')[0],
        origem: 'IMPORTADOR_AUTOMATICO',
        nomeArquivoFonte: record.nomeArquivo
      });
      successCount++;
    } catch (err) {
      console.error(`Erro ao salvar exames do paciente ${record.pacienteNome}:`, err);
      errors.push({ pacienteNome: record.pacienteNome, erro: err.message });
    }
  }

  // Registra auditoria de conformidade no Cloud Firestore
  try {
    if (db) {
      await addDoc(collection(db, 'audit_logs'), {
        timestamp: new Date().toISOString(),
        tipoAcao: 'EXAMS_BATCH_IMPORT',
        descricao: `Importação automática de exames para ${successCount} paciente(s)`,
        targetDoctorId: doctorId,
        targetDoctorName: doctorName,
        detalhes: {
          totalProcessado: confirmedRecords.length,
          sucesso: successCount,
          erros: errors.length
        }
      });
    }
  } catch (auditErr) {
    console.warn('Erro ao gravar log de auditoria da importação:', auditErr);
  }

  return {
    success: true,
    count: successCount,
    errors
  };
}
