import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { savePatientExam } from './patientService.js';
import { db } from '../config/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

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
  ist: ['ist', 'sat transferrina', 'sat. trans', 'sat transf', 'saturacao transferrina', 'indice saturacao transferrina', 'sat de transferrina'],
  pth: ['pth', 'paratormonio', 'pth intacto', 'ipth', 'pth-intacto', 'paratormonio intacto'],
  fosforo: ['fosforo', 'fosfato', 'p', 'po4', 'p serico', 'fosforo serico'],
  ca: ['calcio', 'calcio total', 'ca', 'ca total', 'calcio serico'],
  vitD: ['vit d', 'vitamina d', '25-oh vit d', '25 oh vitamina d', 'vitd', '25-hidroxivitamina d'],
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
  hba1c: ['hba1c', 'hemoglobina glicada', 'a1c', 'hb a1c', 'hemoglobina glicada - hba1c', 'hemoglobina glicada a1c', 'hemoglobina glicada a1', 'hemoglobina glicada (hba1c)'],
  tgp: ['tgp', 'alt', 'transaminase glutamico piruvica', 'transaminase piruvica', 'alanina aminotransferase', 'alt/tgp', 'alt tgp'],
  tgo: ['tgo', 'ast', 'transaminase glutamico oxalacetica', 'transaminase oxalacetica', 'aspartato aminotransferase', 'ast/tgo', 'ast tgo'],
  aluminio: ['aluminio', 'aluminio serico', 'al'],
  leucocitos: ['leucocitos', 'serie branca leucocitos', 'leucocitos totais'],
  plaquetas: ['plaquetas', 'contagem de plaquetas', 'plaquetas totais']
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

  // Hemoglobina Glicada
  if (norm.includes('glicada') || norm.includes('hba1c') || norm.includes('a1c')) {
    return 'hba1c';
  }

  // Paratormônio
  if (norm.includes('paratormonio') || norm.includes('pth')) {
    return 'pth';
  }

  // Fosfatase Alcalina
  if (norm.includes('fosfatase alcalina') || norm.includes('fosf alcalina') || norm === 'fa') {
    return 'fa';
  }

  // Ferro vs Ferritina
  if (norm.includes('ferritina')) {
    return 'ferritina';
  }
  if (norm.includes('ferro') || norm.includes('ferro serico')) {
    return 'ferro';
  }

  // Transferrina
  if (norm.includes('transferrina')) {
    return 'transferrina';
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
 * Calcula similaridade fonética e por tokens entre dois nomes
 * Retorna valor entre 0 e 1
 */
export function calculateNameSimilarity(nameA, nameB) {
  const a = normalizeString(nameA);
  const b = normalizeString(nameB);

  if (!a || !b) return 0;
  if (a === b) return 1.0;

  const tokensA = a.split(' ').filter(t => t.length > 1);
  const tokensB = b.split(' ').filter(t => t.length > 1);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  // Primeiro nome é prioritário
  const firstNameMatch = tokensA[0] === tokensB[0];
  let matchedTokens = 0;

  tokensA.forEach(tA => {
    // Correspondência exata ou inicial (ex: "A." para "Alves")
    const match = tokensB.some(tB => tB === tA || (tA.length === 1 && tB.startsWith(tA)) || (tB.length === 1 && tA.startsWith(tB)));
    if (match) matchedTokens++;
  });

  const tokenScore = (matchedTokens / Math.max(tokensA.length, tokensB.length));

  if (firstNameMatch && tokenScore >= 0.5) {
    return Math.min(1.0, 0.5 + (tokenScore * 0.5));
  }

  // Verifica inclusão direta (ex: "Alan Alves" está contido em "Alan Alves Teixeira")
  if (b.includes(a) || a.includes(b)) {
    return 0.90;
  }

  return tokenScore * 0.8;
}

/**
 * Encontra o paciente mais provável dentro da lista do médico
 * Suporta busca por CPF e similaridade por nome limpo
 */
export function matchPatientInList(scannedName, patientsList = []) {
  if (!scannedName || !patientsList || patientsList.length === 0) {
    return { patient: null, score: 0, status: 'NOT_FOUND' };
  }

  // 1. Tenta correspondência exata por CPF se houver dígitos suficientes
  const cpfDigits = String(scannedName).replace(/\D/g, '');
  if (cpfDigits.length === 11) {
    const cpfMatch = patientsList.find(p => p.cpf && String(p.cpf).replace(/\D/g, '') === cpfDigits);
    if (cpfMatch) {
      return { patient: cpfMatch, score: 100, status: 'EXACT_OR_HIGH' };
    }
  }

  // 2. Limpa rótulos de cabeçalhos de prontuário
  let cleanName = String(scannedName)
    .replace(/(?:Nome|Nome Social|Paciente|Cliente)[\s.:_]+/gi, ' ')
    .replace(/(?:Data Nasc|Data|CPF|RG|Nasc|Sexo|Convenio|Entrada|Idade)[\s.:_].*$/gi, ' ')
    .trim();

  let bestMatch = null;
  let bestScore = 0;

  for (const patient of patientsList) {
    // Verifica se o CPF do paciente está contido no texto escaneado
    if (patient.cpf) {
      const patientCpfDigits = String(patient.cpf).replace(/\D/g, '');
      if (patientCpfDigits.length === 11 && String(scannedName).includes(patientCpfDigits)) {
        return { patient, score: 100, status: 'EXACT_OR_HIGH' };
      }
    }

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
 * 📑 PARSER PDF UNIVERSAL (.pdf)
 * Suporta Laudos Clínicos Individuais/Multi-páginas (Labicon, Hermes Pardini, DB, Fleury, etc.)
 * e Mapões/Tabelas Consolidadas de Diálise
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

    pagesLines.push({ pageNum, lines });
  }

  // ================= ESTRATÉGIA 1: LAUDO CLÍNICO LABORATORIAL =================
  // Identifica se o documento é estruturado como laudo médico (cabeçalho com nome/CPF do paciente e blocos de exames)
  const allLines = pagesLines.flatMap(p => p.lines);
  const fullTextUpper = allLines.join(' ').toUpperCase();
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
        // Detecta Paciente no cabeçalho
        if (!pagePatientName) {
          const matchNome = line.match(/(?:Nome|Paciente|Cliente)[\s.:_]+([A-ZÀ-Úa-z\s]+?)(?=\s*(?:Data|CPF|RG|Nasc|Sexo|Convenio|Entrada|Idade|$))/i);
          if (matchNome && matchNome[1].trim().length >= 3 && !matchNome[1].toLowerCase().includes('social')) {
            pagePatientName = matchNome[1].trim();
          }
        }

        // Detecta CPF
        if (!pageCpf) {
          const matchCpf = line.match(/(?:CPF)[\s.:_]+([\d.\/-]+)/i);
          if (matchCpf) pageCpf = matchCpf[1].trim();
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

      // Verifica se é continuação do mesmo paciente da página anterior
      const isSamePatient = currentReport && (
        (pageCpf && currentReport.cpf && pageCpf.replace(/\D/g, '') === currentReport.cpf.replace(/\D/g, '')) ||
        (matched.patient && currentReport.pacienteId === matched.patient.id) ||
        (pagePatientName && currentReport.nomeArquivo && calculateNameSimilarity(pagePatientName, currentReport.nomeArquivo) >= 0.75)
      );

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
          normLine.startsWith('valor de referencia') || 
          normLine.startsWith('valores de referencia') ||
          normLine.startsWith('ref:') ||
          normLine.includes('filtracao glomerular estimada') ||
          normLine.startsWith('nota:') ||
          normLine.startsWith('notas:') ||
          normLine.startsWith('responsavel:') ||
          normLine.startsWith('assinado digitalmente')
        ) {
          inReferenceSection = true;
          currentExamKey = null;
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

        // Detecta Sorologias qualitativas
        if (/AMOSTRA\s+N[AÃ]O\s+REAGENTE\s+PARA\s+HIV/i.test(line)) currentReport.exames.hiv = 'Não Reagente';
        if (/AMOSTRA\s+N[AÃ]O\s+REAGENTE\s+PARA\s+HbsAg/i.test(line)) currentReport.exames.hbsag = 'Não Reagente';
        if (/AMOSTRA\s+N[AÃ]O\s+REAGENTE\s+PARA\s+ANTI-HCV/i.test(line)) currentReport.exames.antiHcv = 'Não Reagente';
        if (/AMOSTRA\s+N[AÃ]O\s+REAGENTE\s+PARA\s+O\s+ANTI-HBC/i.test(line)) currentReport.exames.antiHbc = 'Não Reagente';

        // Detecta cabeçalho de exame
        const potentialExamKey = matchHeaderToExamKey(line);
        if (potentialExamKey) {
          currentExamKey = potentialExamKey;
          inReferenceSection = false;
        }

        // 1. Extração direta de linhas no formato "Exame: Valor" (ex: Hemoglobina, Creatinina Sérica, Albumina)
        if (!inReferenceSection) {
          // Albumina (em Proteínas Totais ou isolada)
          const matchAlb = line.match(/(?:^|\b)Albumina[\s.:_]+([0-9]+[.,]?[0-9]*)/i);
          if (matchAlb && currentReport.exames.albumina === undefined) {
            const v = parseExamNumber(matchAlb[1]);
            if (v !== null) currentReport.exames.albumina = v;
          }

          // Creatinina Sérica
          const matchCr = line.match(/(?:^|\b)Creatinina(?:\s*S[eé]rica)?[\s.:_]+([0-9]+[.,]?[0-9]*)/i);
          if (matchCr && currentReport.exames.creatinina === undefined) {
            const v = parseExamNumber(matchCr[1]);
            if (v !== null) currentReport.exames.creatinina = v;
          }

          // Hemoglobina no hemograma
          const matchHb = line.match(/(?:^|\b)Hemoglobina[\s.:_]+([0-9]+[.,]?[0-9]*)/i);
          if (matchHb && currentReport.exames.hb === undefined && !normLine.includes('glicada')) {
            const v = parseExamNumber(matchHb[1]);
            if (v !== null) currentReport.exames.hb = v;
          }

          // Hematócrito no hemograma
          const matchHt = line.match(/(?:^|\b)Hemat[oó]crito[\s.:_]+([0-9]+[.,]?[0-9]*)/i);
          if (matchHt && currentReport.exames.ht === undefined) {
            const v = parseExamNumber(matchHt[1]);
            if (v !== null) currentReport.exames.ht = v;
          }

          // Leucócitos
          const matchLeu = line.match(/(?:^|\b)Leuc[oó]citos[\s.:_]+([0-9.]+)/i);
          if (matchLeu && currentReport.exames.leucocitos === undefined) {
            const v = parseExamNumber(matchLeu[1]);
            if (v !== null) currentReport.exames.leucocitos = v;
          }

          // Plaquetas
          const matchPlq = line.match(/(?:^|\b)(?:Plaquetas|Contagem\s*de\s*Plaquetas)[\s.:_]+([0-9.]+)/i);
          if (matchPlq && currentReport.exames.plaquetas === undefined) {
            const v = parseExamNumber(matchPlq[1]);
            if (v !== null) currentReport.exames.plaquetas = v;
          }

          // Ureia Pré / Ureia Pós inline
          const matchUreiaPre = line.match(/(?:^|\b)Ur[eé]ia\s*Pr[eé][\s.:_]+([0-9]+[.,]?[0-9]*)/i);
          if (matchUreiaPre && currentReport.exames.ureiaPre === undefined) {
            const v = parseExamNumber(matchUreiaPre[1]);
            if (v !== null) currentReport.exames.ureiaPre = v;
          }
          const matchUreiaPos = line.match(/(?:^|\b)Ur[eé]ia\s*P[oó]s[\s.:_]+([0-9]+[.,]?[0-9]*)/i);
          if (matchUreiaPos && currentReport.exames.ureiaPos === undefined) {
            const v = parseExamNumber(matchUreiaPos[1]);
            if (v !== null) currentReport.exames.ureiaPos = v;
          }
        }

        // 2. Extração de valor sozinho na linha para o exame ativo (ex: "56 mg / dl", "33 U / l", "7,2 %")
        if (currentExamKey && !inReferenceSection && currentReport.exames[currentExamKey] === undefined) {
          const isMetadataLine = normLine.startsWith('material') || 
                                 normLine.startsWith('metodo') || 
                                 normLine.startsWith('metodologia') ||
                                 normLine.startsWith('data coleta') ||
                                 normLine.startsWith('liberado') || 
                                 normLine.startsWith('solicitante') || 
                                 normLine.startsWith('convenio');

          if (!isMetadataLine) {
            const unitMatch = line.match(/^([0-9]+[.,]?[0-9]*)\s*(?:g\s*\/\s*d[lL]|mg\s*\/\s*d[lL]|mcg\s*\/\s*d[lL]|mcg\s*\/\s*[lL]|ng\s*\/\s*m[lL]|pg\s*\/\s*m[lL]|m[eE]q\s*\/\s*[lL]|U\s*\/\s*[lL]|g%|%)(?:\s|$)/i);
            const resultMatch = line.match(/^(?:Resultado|Valor)[\s.:_]*([0-9]+[.,]?[0-9]*)/i);

            const chosenMatch = unitMatch || resultMatch;
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
        tipoArquivo: 'PDF',
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
    tipoArquivo: 'PDF',
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
