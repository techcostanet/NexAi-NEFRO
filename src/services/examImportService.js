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
  hb: ['hb', 'hgb', 'hemoglobina', 'hemoglobin', 'dosagem de hemoglobina'],
  ht: ['ht', 'hct', 'hematocrito', 'hematocritos'],
  ferritina: ['ferritina', 'ferr', 'ferrit', 'ferritina serica'],
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
  ureiaPos: ['ureia pos', 'ureia pos-hd', 'ureia pos hd', 'ureia final', 'ur pos', 'ureia 2', 'ureia pos dialise', 'ureia pos-dialise'],
  ureiaPre: ['ureia pre', 'ureia pre-hd', 'ureia pre hd', 'ureia inicial', 'ur pre', 'ureia 1', 'ureia'],
  creatinina: ['creatinina', 'cr', 'creat', 'creatina'],
  albumina: ['albumina', 'alb', 'albumina serica'],
  pcr: ['pcr', 'proteina c reativa', 'pcr ultrassensivel', 'pcr us'],
  glicemia: ['glicemia', 'glicose', 'dextro', 'gli', 'glicemia em jejum', 'glicemia de jejum'],
  hba1c: ['hba1c', 'hemoglobina glicada', 'a1c', 'hb a1c', 'hemoglobina glicada - hba1c', 'hemoglobina glicada a1c', 'hemoglobina glicada a1'],
  tgp: ['tgp', 'alt', 'transaminase glutamico piruvica', 'transaminase piruvica', 'alanina aminotransferase', 'alt/tgp', 'alt tgp'],
  tgo: ['tgo', 'ast', 'transaminase glutamico oxalacetica', 'transaminase oxalacetica', 'aspartato aminotransferase', 'ast/tgo', 'ast tgo']
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

  // Se tiver formato brasileiro com milhar e decimal (ex: 1.035,60 ou 1.373,10)
  if (/\d+\.\d{3},\d+/.test(str)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (/\d+,\d{3}\.\d+/.test(str)) {
    str = str.replace(/,/g, '');
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

  // Prioridade específica para Ureia Pós vs Ureia Pré
  if (norm.includes('pos') && (norm.includes('ureia') || norm.includes('ur'))) {
    return 'ureiaPos';
  }
  if ((norm.includes('ureia') || norm.includes('ur')) && !norm.includes('pos')) {
    return 'ureiaPre';
  }

  // TGP / TGO
  if (norm.includes('tgp') || norm.includes('transaminase glutamico piruvica') || norm.includes('alanina amino')) {
    return 'tgp';
  }
  if (norm.includes('tgo') || norm.includes('transaminase glutamico oxalacetica') || norm.includes('aspartato amino')) {
    return 'tgo';
  }

  // Hemoglobina Glicada
  if (norm.includes('glicada') || norm.includes('hba1c') || norm.includes('a1c')) {
    return 'hba1c';
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
      results.push({
        id: `import-${r}-${Date.now()}`,
        nomeArquivo: rawName,
        pacienteId: matched.patient?.id || '',
        pacienteNome: matched.patient?.nome || '',
        statusMatch: matched.status,
        confianca: matched.score,
        dataExame: fallbackDate,
        exames,
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

      results.push({
        id: `import-docx-${i}-${Date.now()}`,
        nomeArquivo: line,
        pacienteId: matched.patient?.id || '',
        pacienteNome: matched.patient?.nome || '',
        statusMatch: matched.status,
        confianca: matched.score,
        dataExame: detectedDate,
        exames,
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

        // Detecta Data da Coleta
        if (!pageDate) {
          const matchColeta = line.match(/(?:Coletado em|Data da Coleta)[\s.:_]+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i);
          if (matchColeta) {
            let [_, d, m, y] = matchColeta[1].match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/);
            if (y.length === 2) y = '20' + y;
            pageDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          }
        }
      }

      // Fallback de data para Entrada
      if (!pageDate) {
        for (const line of lines) {
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
        (pagePatientName && currentReport.nomeArquivo && calculateNameSimilarity(pagePatientName, currentReport.nomeArquivo) >= 0.8)
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
        if (pageDate && !currentReport.dataExame) {
          currentReport.dataExame = pageDate;
        }
      }

      // 2. Extração de Blocos de Exames na Página
      let currentExamKey = null;
      let inPreviousResults = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const normLine = normalizeString(line);

        // Se encontrou seção de histórico / resultados anteriores, reseta exame ativo
        if (normLine.includes('resultados anteriores') || normLine.includes('historico de resultados')) {
          inPreviousResults = true;
          currentExamKey = null;
          continue;
        }

        // Ignora metadados de cabeçalho
        const isMetadataLine = normLine.startsWith('material') || 
                               normLine.startsWith('metodo') || 
                               normLine.startsWith('liberado') || 
                               normLine.startsWith('valores de referencia') || 
                               normLine.startsWith('solicitante') || 
                               normLine.startsWith('convenio') || 
                               normLine.startsWith('impresso') || 
                               normLine.startsWith('este exame');

        if (!isMetadataLine) {
          const potentialExamKey = matchHeaderToExamKey(line);
          if (potentialExamKey) {
            currentExamKey = potentialExamKey;
            inPreviousResults = false;
          }
        }

        // Se temos um exame ativo aguardando resultado
        if (currentExamKey && !inPreviousResults) {
          // Formato A/B: Linha contendo "Resultado: X" ou "<NomeExame>: X"
          const resultMatch = line.match(/(?:Resultado|Hemoglobina|Hemat[oó]crito|Ureia|Pot[aá]ssio|S[oó]dio|Glicemia|TGP|TGO|C[aá]lcio|F[oó]sforo)[^0-9:]*[:.]+\s*([0-9]+[.,]?[0-9]*)/i) ||
                              line.match(/Hemoglobina\s*Glicada\s*\(?[^:]*[:.]+\s*([0-9]+[.,]?[0-9]*)/i) ||
                              line.match(/^(?:Resultado|Valor)[\s.:_]*([0-9]+[.,]?[0-9]*)/i);

          if (resultMatch && currentReport.exames[currentExamKey] === undefined) {
            const val = parseExamNumber(resultMatch[1]);
            if (val !== null) {
              currentReport.exames[currentExamKey] = val;
              currentExamKey = null; // Bloqueia para não capturar linhas de resultados anteriores
              continue;
            }
          }

          // Formato C: Linha com apenas o valor com unidade (ex: "8,7 mg/dL" ou "28,5 %")
          const unitOnlyMatch = line.match(/^([0-9]+[.,]?[0-9]*)\s*(?:g\/dL|mg\/dL|%|mEq\/L|U\/L|pg\/mL|ng\/mL|mg\/L)\b/i);
          if (unitOnlyMatch && currentReport.exames[currentExamKey] === undefined) {
            const val = parseExamNumber(unitOnlyMatch[1]);
            if (val !== null) {
              currentReport.exames[currentExamKey] = val;
              currentExamKey = null;
              continue;
            }
          }
        }
      }
    }

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

        results.push({
          id: `import-pdf-table-${pageNum}-${l}-${Date.now()}`,
          nomeArquivo: lineStr.split(/\d/)[0].trim() || lineStr,
          pacienteId: matched.patient?.id || '',
          pacienteNome: matched.patient?.nome || '',
          statusMatch: matched.status,
          confianca: matched.score,
          dataExame: fallbackDate,
          exames,
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

      results.push({
        id: `import-img-${i}-${Date.now()}`,
        nomeArquivo: line,
        pacienteId: matched.patient?.id || '',
        pacienteNome: matched.patient?.nome || '',
        statusMatch: matched.status,
        confianca: matched.score,
        dataExame: detectedDate,
        exames,
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
      results.push({
        id: `import-img-single-${Date.now()}`,
        nomeArquivo: 'Laudo Fotográfico (Selecionar Paciente)',
        pacienteId: patientsList[0]?.id || '',
        pacienteNome: patientsList[0]?.nome || '',
        statusMatch: 'SUGGESTION',
        confianca: 50,
        dataExame: detectedDate,
        exames,
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
