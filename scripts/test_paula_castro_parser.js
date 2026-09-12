import { normalizeString, parseExamNumber, matchHeaderToExamKey } from '../src/services/examImportService.js';

// Amostra de páginas simuladas extraídas do PDF do Paula Castro (Doc 1: 20/08/2026)
const doc1Pages = [
  // Página 1: Tipagem Sanguínea
  {
    pageNum: 1,
    lines: [
      "LABORATÓRIO DE ANÁLISES E PESQUISAS CLÍNICAS",
      "(2026 - 35665/FSRA/23) NEFRON",
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Médico: Não informado",
      "Data: 20/08/2026",
      "CNES: 2695022",
      "Data Nasc.:09/11/1954",
      "Grupo Sanguíneo, Fator RH e Du",
      "Material: SANGUE",
      "GRUPO SANGUÍNEO: \" O+ \"",
      "FATOR RH: \" POSITIVO \"",
      "Obs:",
      "Metodologia: Aglutinação",
      "( WCSA) Idade: 71a Data coleta: 20/08/2026",
      "Responsável: ROGÉRIO BATISTA MONTEIRO - CRFMG 8250 / Liberado: 21/08/2026 1516"
    ]
  },
  // Página 2: Glicose
  {
    pageNum: 2,
    lines: [
      "LABORATÓRIO DE ANÁLISES E PESQUISAS CLÍNICAS",
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Data Nasc.:09/11/1954",
      "Glicose Enzimático",
      "Material: SANGUE ( JPPC)",
      "Data coleta: 20/08/2026 Idade: 71a",
      "56 mg / dl",
      "Valor de referência: 60 a 99 mg / dl",
      "Responsável: ROGÉRIO BATISTA MONTEIRO - CRFMG 8250 / Liberado: 26/08/2026 1046"
    ]
  },
  // Página 3: Creatinina
  {
    pageNum: 3,
    lines: [
      "LABORATÓRIO DE ANÁLISES E PESQUISAS CLÍNICAS",
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Creatinina",
      "Material: SANGUE",
      "Método: Colorimétrico-Labtest",
      "Creatinina Sérica: 7,12 mg/dL",
      "Valores de referência : HOMEM : DE 0,70 A 1,30 mg/dL",
      "Filtração glomerular estimada: Adulto Não Negro: 7,0 ml / min / 1,73 m²"
    ]
  },
  // Página 5: Transaminase Pirúvica + Fosfatase Alcalina
  {
    pageNum: 5,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Transaminase Pirúvica Cinético UV",
      "Material: SANGUE",
      "33 U / l",
      "Valores de referência : Homens: 8 - 39 U / l",
      "Fosfatase Alcalina Cinético",
      "Material: SANGUE",
      "126 U / l",
      "Valores de referência: Adultos: 27 a 100 U / l"
    ]
  },
  // Página 6: Cálcio + Fósforo
  {
    pageNum: 6,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Cálcio Colorimétrico",
      "Material: SANGUE .",
      "7,8 mg/dL",
      "Valor de referência: Adultos: de 8,4 a 10,6 mg/dL",
      "Fósforo Fotométrico",
      "Material: SANGUE",
      "5,5 mg /dl",
      "Valores de referência: Adultos: de 2,5 a 4,8 mg / dl"
    ]
  },
  // Página 7: Proteínas Totais e Fracionadas
  {
    pageNum: 7,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Proteínas Totais e Fracionadas Colorimétrico",
      "Material: SANGUE",
      "Total: 6,5 g / dl",
      "Albumina: 3,6 g / dl",
      "Globulina: 2,9 g / dl",
      "Valores de referência: Albumina- Adultos: 3,5 a 5,5 g / dl"
    ]
  },
  // Página 8: Ferritina
  {
    pageNum: 8,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Ferritina Quimioluminescência",
      "Material: SANGUE",
      "173 ng/mL",
      "Valores de referência Adultos 30,00 a 400,00"
    ]
  },
  // Página 9: Transferrina + Potássio
  {
    pageNum: 9,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Transferrina Turbidimetria",
      "Material:SANGUE",
      "208 mg / dl",
      "Valores de referência: 200,0 a 360,0 mg / dl",
      "Potássio Eletrodo Seletivo",
      "Material: SANGUE",
      "Metodologia: Eletrodo seletivo",
      "4,6 mEq / L",
      "Valor de referência: de 3,6 a 5,4 mEq / l"
    ]
  },
  // Página 10: Paratormônio
  {
    pageNum: 10,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Paratormônio Quimioluminescência",
      "Material: SANGUE",
      "156,6 pg/ml",
      "Valor de referência: de 18,5 a 88,0 pg / ml"
    ]
  },
  // Página 15: Ferro Sérico + Alumínio
  {
    pageNum: 15,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Ferro Sérico Goodwin modificado",
      "Material: SANGUE",
      "39 mcg / dl",
      "Valor de referência: Homens: 65 a 170 mcg/dL",
      "Alumínio",
      "Material: SANGUE",
      "6,1 mcg/L",
      "Valor de referência: Inferior a 10,0 mcg/L"
    ]
  },
  // Página 16: Hemograma
  {
    pageNum: 16,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Hemograma Citometria Automação",
      "Material: SANGUE",
      "Série Vermelha Valores de Referência:",
      "Hemoglobina: 9,9 g/dL (13,5 a 18,0 g/dL) .",
      "Hemácias: 3.800.000 /mm3",
      "Hematócrito: 29,8 % (39 a 54 %)",
      "Série Branca",
      "Leucócitos: 9.900 /mm3 (4.000 a 10.500 /mm3)",
      "Contagem de Plaquetas: 208.000 /mm3 (150 mil a 450 mil /mm3)"
    ]
  },
  // Página 17: Uréia Pré + Uréia Pós
  {
    pageNum: 17,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Uréia Pré Enzimático",
      "Material: SANGUE",
      "120 mg / dl",
      "Valor de referência: Não se aplica. Paciente em tratamento Hemodialítico",
      "Uréia Pós Enzimático",
      "Material: SANGUE",
      "25 mg / dl",
      "Valor de referência: Não se aplica. Paciente em tratamento Hemodialítico"
    ]
  }
];

// Amostra de páginas simuladas do Doc 2: 01/09/2026 (Coleta 03/09/2026)
const doc2Pages = [
  // Página 1: Glicose
  {
    pageNum: 1,
    lines: [
      "LABORATÓRIO DE ANÁLISES E PESQUISAS CLÍNICAS",
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Data: 01/09/2026",
      "Data Nasc.:09/11/1954",
      "Glicose Enzimático",
      "Material: SANGUE",
      "Data coleta: 03/09/2026",
      "139 mg / dl",
      "Valor de referência: 60 a 99 mg / dl"
    ]
  },
  // Página 2: Hemoglobina Glicada
  {
    pageNum: 2,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Hemoglobina Glicada (HbA1c) HPLC",
      "Material: SANGUE TOTAL",
      "Data coleta: 03/09/2026",
      "7,2 %",
      "Glicemia média estimada: 161,0 mg/dl"
    ]
  },
  // Página 3: Creatinina
  {
    pageNum: 3,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Creatinina",
      "Material: SANGUE",
      "Creatinina Sérica: 7,09 mg/dL",
      "Valores de referência : HOMEM : DE 0,70 A 1,30 mg/dL"
    ]
  },
  // Página 4: Transaminase Pirúvica + Cálcio
  {
    pageNum: 4,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Transaminase Pirúvica Cinético UV",
      "Material: SANGUE",
      "23 U/L",
      "Valores de referência : Homens: 8 - 39 U/L",
      "Cálcio Colorimétrico",
      "Material: SANGUE .",
      "8,0 mg/dL",
      "Valor de referência: Adultos: de 8,4 a 10,6 mg/dL"
    ]
  },
  // Página 5: Fósforo + Proteínas Totais
  {
    pageNum: 5,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Fósforo Fotométrico",
      "Material: SANGUE",
      "5,9 mg /dl",
      "Valores de referência: Adultos: de 2,5 a 4,8 mg / dl",
      "Proteínas Totais e Fracionadas Colorimétrico",
      "Material: SANGUE",
      "Total: 5,7 g / dl",
      "Albumina: 3,2 g / dl"
    ]
  },
  // Página 6: Sódio
  {
    pageNum: 6,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Sódio Eletrodo Seletivo",
      "Material: SANGUE -",
      "139 mEq / L",
      "Valor de referência: de 136 a 145 mEq / l"
    ]
  },
  // Página 7: Potássio
  {
    pageNum: 7,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Potássio Eletrodo Seletivo",
      "Material: SANGUE",
      "4,9 mEq / L",
      "Valor de referência: de 3,6 a 5,4 mEq / l"
    ]
  },
  // Página 8: Hemoglobina + Uréia Pré
  {
    pageNum: 8,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Hemoglobina Citometria Automação",
      "Material: SANGUE",
      "8,1 g%",
      "Uréia Pré Enzimático",
      "Material: SANGUE",
      "121 mg / dl"
    ]
  },
  // Página 9: Uréia Pós + Hematócrito
  {
    pageNum: 9,
    lines: [
      "Nome: AGNALDO GONCALVES DOS SANTOS",
      "Uréia Pós Enzimático",
      "Material: SANGUE",
      "36 mg / dl",
      "Hematócrito",
      "Material: SANGUE",
      "24,6 %"
    ]
  }
];

export { doc1Pages, doc2Pages };

// Test Runner
console.log("================================================================================");
console.log("🧪 EXECUTANDO TESTE DE VALIDAÇÃO: MODELO DE LAUDOS PAULA CASTRO (NEFRON)");
console.log("================================================================================");

import { applyDerivedCalculations } from '../src/services/examImportService.js';

function simulatePdfExtraction(pages) {
  let pagePatientName = null;
  let pageDate = null;
  const exames = {};

  for (const page of pages) {
    const lines = page.lines;

    for (const line of lines) {
      if (!pagePatientName) {
        const matchNome = line.match(/(?:Nome|Paciente|Cliente)[\s.:_]+([A-ZÀ-Úa-z\s]+?)(?=\s*(?:Data|CPF|RG|Nasc|Sexo|Convenio|Entrada|Idade|$))/i);
        if (matchNome && matchNome[1].trim().length >= 3 && !matchNome[1].toLowerCase().includes('social')) {
          pagePatientName = matchNome[1].trim();
        }
      }

      if (!pageDate) {
        const matchColeta = line.match(/(?:Coletado\s+em|Data\s+(?:da\s+)?coleta|Data\s*coleta)[\s.:_]+(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i);
        if (matchColeta) {
          let [_, d, m, y] = matchColeta[1].match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})/);
          if (y.length === 2) y = '20' + y;
          pageDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
      }
    }

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

    let currentExamKey = null;
    let inReferenceSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const normLine = normalizeString(line);

      if (normLine.includes('resultados anteriores') || normLine.includes('historico de resultados')) {
        inReferenceSection = true;
        currentExamKey = null;
        continue;
      }

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

      if (line.includes('GRUPO SANGUÍNEO') || line.includes('GRUPO SANGUINEO')) {
        const match = line.match(/GRUPO\s+SANGU[IÍ]NEO[\s.:_]+["']?\s*([ABO0][\+-]?)\s*["']?/i);
        if (match) exames.grupoSanguineo = match[1].replace('0', 'O');
      }
      if (line.includes('FATOR RH')) {
        const match = line.match(/FATOR\s+RH[\s.:_]+["']?\s*([A-Za-z]+)\s*["']?/i);
        if (match) exames.fatorRh = match[1];
      }

      if (/AMOSTRA\s+N[AÃ]O\s+REAGENTE\s+PARA\s+HIV/i.test(line)) exames.hiv = 'Não Reagente';
      if (/AMOSTRA\s+N[AÃ]O\s+REAGENTE\s+PARA\s+HbsAg/i.test(line)) exames.hbsag = 'Não Reagente';
      if (/AMOSTRA\s+N[AÃ]O\s+REAGENTE\s+PARA\s+ANTI-HCV/i.test(line)) exames.antiHcv = 'Não Reagente';
      if (/AMOSTRA\s+N[AÃ]O\s+REAGENTE\s+PARA\s+O\s+ANTI-HBC/i.test(line)) exames.antiHbc = 'Não Reagente';

      const potentialExamKey = matchHeaderToExamKey(line);
      if (potentialExamKey) {
        currentExamKey = potentialExamKey;
        inReferenceSection = false;
      }

      if (!inReferenceSection) {
        const matchAlb = line.match(/(?:^|\b)Albumina[\s.:_]+([0-9]+[.,]?[0-9]*)/i);
        if (matchAlb && exames.albumina === undefined) {
          const v = parseExamNumber(matchAlb[1]);
          if (v !== null) exames.albumina = v;
        }

        const matchCr = line.match(/(?:^|\b)Creatinina(?:\s*S[eé]rica)?[\s.:_]+([0-9]+[.,]?[0-9]*)/i);
        if (matchCr && exames.creatinina === undefined) {
          const v = parseExamNumber(matchCr[1]);
          if (v !== null) exames.creatinina = v;
        }

        const matchHb = line.match(/(?:^|\b)Hemoglobina[\s.:_]+([0-9]+[.,]?[0-9]*)/i);
        if (matchHb && exames.hb === undefined && !normLine.includes('glicada')) {
          const v = parseExamNumber(matchHb[1]);
          if (v !== null) exames.hb = v;
        }

        const matchHt = line.match(/(?:^|\b)Hemat[oó]crito[\s.:_]+([0-9]+[.,]?[0-9]*)/i);
        if (matchHt && exames.ht === undefined) {
          const v = parseExamNumber(matchHt[1]);
          if (v !== null) exames.ht = v;
        }

        const matchLeu = line.match(/(?:^|\b)Leuc[oó]citos[\s.:_]+([0-9.]+)/i);
        if (matchLeu && exames.leucocitos === undefined) {
          const v = parseExamNumber(matchLeu[1]);
          if (v !== null) exames.leucocitos = v;
        }

        const matchPlq = line.match(/(?:^|\b)(?:Plaquetas|Contagem\s*de\s*Plaquetas)[\s.:_]+([0-9.]+)/i);
        if (matchPlq && exames.plaquetas === undefined) {
          const v = parseExamNumber(matchPlq[1]);
          if (v !== null) exames.plaquetas = v;
        }

        const matchUreiaPre = line.match(/(?:^|\b)Ur[eé]ia\s*Pr[eé][\s.:_]+([0-9]+[.,]?[0-9]*)/i);
        if (matchUreiaPre && exames.ureiaPre === undefined) {
          const v = parseExamNumber(matchUreiaPre[1]);
          if (v !== null) exames.ureiaPre = v;
        }
        const matchUreiaPos = line.match(/(?:^|\b)Ur[eé]ia\s*P[oó]s[\s.:_]+([0-9]+[.,]?[0-9]*)/i);
        if (matchUreiaPos && exames.ureiaPos === undefined) {
          const v = parseExamNumber(matchUreiaPos[1]);
          if (v !== null) exames.ureiaPos = v;
        }
      }

      if (currentExamKey && !inReferenceSection && exames[currentExamKey] === undefined) {
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
              exames[currentExamKey] = val;
              currentExamKey = null;
            }
          }
        }
      }
    }
  }

  const finalExames = applyDerivedCalculations(exames);
  return {
    pagePatientName,
    pageDate,
    exames: finalExames
  };
}

// 1. Validação Documento 1
const doc1Result = simulatePdfExtraction(doc1Pages);
console.log("\n📄 Laudo 1 (Coleta 20/08/2026):");
console.log(`Paciente: ${doc1Result.pagePatientName}`);
console.log(`Data: ${doc1Result.pageDate}`);
console.log("Exames Extraídos:", doc1Result.exames);

const expectedDoc1 = {
  glicemia: 56,
  creatinina: 7.12,
  tgp: 33,
  fa: 126,
  ca: 7.8,
  fosforo: 5.5,
  albumina: 3.6,
  ferritina: 173,
  transferrina: 208,
  k: 4.6,
  pth: 156.6,
  ferro: 39,
  ist: 13.3,
  aluminio: 6.1,
  hb: 9.9,
  ht: 29.8,
  ureiaPre: 120,
  ureiaPos: 25,
  ktv: 1.74,
  grupoSanguineo: "O+"
};

let errorsDoc1 = 0;
for (const [key, val] of Object.entries(expectedDoc1)) {
  if (doc1Result.exames[key] !== val) {
    console.error(`❌ [DOC 1] Falha em ${key}: esperado ${val}, obteve ${doc1Result.exames[key]}`);
    errorsDoc1++;
  }
}

if (errorsDoc1 === 0 && doc1Result.pagePatientName === "AGNALDO GONCALVES DOS SANTOS" && doc1Result.pageDate === "2026-08-20") {
  console.log("✅ [DOC 1] Todos os 20 exames e metadados foram 100% extraídos com sucesso!");
} else {
  console.error(`❌ [DOC 1] Falhas detectadas: ${errorsDoc1}`);
  process.exit(1);
}

// 2. Validação Documento 2
const doc2Result = simulatePdfExtraction(doc2Pages);
console.log("\n📄 Laudo 2 (Coleta 03/09/2026):");
console.log(`Paciente: ${doc2Result.pagePatientName}`);
console.log(`Data: ${doc2Result.pageDate}`);
console.log("Exames Extraídos:", doc2Result.exames);

const expectedDoc2 = {
  glicemia: 139,
  hba1c: 7.2,
  creatinina: 7.09,
  tgp: 23,
  ca: 8.0,
  fosforo: 5.9,
  albumina: 3.2,
  na: 139,
  k: 4.9,
  hb: 8.1,
  ht: 24.6,
  ureiaPre: 121,
  ureiaPos: 36,
  ktv: 1.33
};

let errorsDoc2 = 0;
for (const [key, val] of Object.entries(expectedDoc2)) {
  if (doc2Result.exames[key] !== val) {
    console.error(`❌ [DOC 2] Falha em ${key}: esperado ${val}, obteve ${doc2Result.exames[key]}`);
    errorsDoc2++;
  }
}

if (errorsDoc2 === 0 && doc2Result.pagePatientName === "AGNALDO GONCALVES DOS SANTOS" && doc2Result.pageDate === "2026-09-03") {
  console.log("✅ [DOC 2] Todos os exames e metadados foram 100% extraídos com sucesso!");
} else {
  console.error(`❌ [DOC 2] Falhas detectadas: ${errorsDoc2}`);
  process.exit(1);
}

console.log("\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO! MODELO PAULA CASTRO APRENDIDO!");

