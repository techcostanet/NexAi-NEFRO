import { parseLabiconReport } from '../src/services/examImportService.js';

// Test PDF 1 (05/10/2026 - 7 pages)
const pdf1Pages = [
  {
    pageNum: 1,
    lines: [
      "LABICON LABORATÓRIO",
      "Nome Social.:TANIA APARECIDA MACH CPF.........:647.971.636-15",
      "Nome........:TANIA APARECIDA MACHADO Data Nasc...:16/10/1964",
      "Solicitante.:Giselle Almeida de Faria Tavares Requisição..:1810053",
      "Convênio....:120-DIALIZE Entrada.....:01/10/2026",
      "Impresso em.:23/10/2026 06:41 RG..........:",
      "Pág.: 1 / 7",
      "Valores de Referência",
      "Material: Sangue total EDTA Coletado em: 05/10/2026 08:46 Método: Citometria de Fluxo",
      "HEMOGRAMA COMPLETO",
      "ERITROGRAMA",
      "HEMÁCIAS............: 4,91 milhões/mm 4,0 a 5,2 milhões/mm³",
      "HEMOGLOBINA.........: 14,5 g/dL 12,0 a 16,0 g/dL",
      "HEMATÓCRITO.........: 45,5 % 36,0 a 46,0 %",
      "VCM.................: 92,7 fL 80,0 a 100,0 fL",
      "HCM.................: 29,5 pg 26,0 a 34,0 pg",
      "CHCM................: 31,9 g/dL 31,0 a 37,0 g/dL",
      "RDW.................: 15,8 % 11,2 a 15,6 %",
      "LEUCOGRAMA",
      "LEUCÓCITOS..........: 6.510 /mm³ 5.000 a 10.000/mm3",
      "BASTONETES..........: 0,0 % 0 /mm³ 0 a 5% 0 a 500/mm3",
      "SEGMENTADOS.........: 61,9 % 4.030 /mm³ 36 a 70% 1.800 a 7.000/mm3",
      "EOSINÓFILOS.........: 2,6 % 169 /mm³ 0 a 6% 0 a 600/mm3",
      "BASÓFILOS...........: 0,7 % 46 /mm³ 0 a 2% 0 a 200/mm3",
      "LINFÓCITOS TÍPICOS..: 22,6 % 1.471 /mm³ 20 a 40% 1.000 a 4.000/mm3",
      "MONÓCITOS...........: 12,2 % 794 /mm³ 1 a 10% 50 a 1.000/mm3",
      "PLAQUETAS...........: 132.000 /mm³ 140.000 a 450.000/mm3"
    ]
  },
  {
    pageNum: 2,
    lines: [
      "CALCIO",
      "Material: Soro Coletado em: 05/10/2026 08:46 Método: Colorimétrico - Arsenazo III",
      "Resultado...........: 9,2 mg/dL Lactantes: 9,0 a 11,0 mg/dL",
      "FOSFATASE ALCALINA",
      "Resultado...........: 86 U/L Adultos: 27 a 100 U/L",
      "FOSFORO",
      "Resultado...........: 6,7 mg/dL Adultos: 2,5 a 4,8 mg/dL"
    ]
  },
  {
    pageNum: 3,
    lines: [
      "GLICEMIA EM JEJUM",
      "Resultado...........: 138 mg/dL De 65 a 99 mg/dL",
      "ÍNDICE DE SATURAÇÃO DA TRANSFERRINA",
      "Ferro sérico........................: 50 µg/dL",
      "Capacidade total de ligação do ferro: 249,0 µg/dL",
      "Índice de Saturação de Transferrina.: 20 % 15 a 60 %"
    ]
  },
  {
    pageNum: 4,
    lines: [
      "PROTEINAS TOTAIS E FRAÇÕES",
      "PROTEÍNAS TOTAIS....: 5,8 g/dL 6,5 a 8,2 g/dL",
      "ALBUMINA............: 4,0 g/dL 3,7 a 5,2 g/dL",
      "GLOBULINAS..........: 1,8 g/dL 1,8 a 4,4 g/dL",
      "TRANSAMINASE GLUTÂMICO PIRÚVICA- TGP",
      "Resultado...........: 13 U/L"
    ]
  },
  {
    pageNum: 5,
    lines: [
      "UREIA",
      "Resultado...........: 143 mg/dL Adultos: 15 a 40 mg/dL",
      "UREIA PÓS DIÁLISE",
      "Resultado...........: 30 mg/dL 15 a 40 mg/dL"
    ]
  },
  {
    pageNum: 6,
    lines: [
      "FERRITINA",
      "Resultado...........: 292,93 ng/mL",
      "POTÁSSIO",
      "Resultado...........: 5,8 mEq/L 3,5 a 5,1 mEq/L"
    ]
  },
  {
    pageNum: 7,
    lines: [
      "PARATORMONIO - PTH",
      "Resultado...........: 95,9 pg/mL",
      "SÓDIO",
      "Resultado...........: 139 mEq/L"
    ]
  }
];

const res1 = parseLabiconReport(pdf1Pages);
console.log('=== RESULTADO PDF 1 (05/10/2026) ===');
console.log(JSON.stringify(res1.registros[0]?.exames, null, 2));

// Test PDF 2 (07/09/2026 - Isolated Hb/Ht)
const pdf2Pages = [
  {
    pageNum: 1,
    lines: [
      "LABICON LABORATÓRIO",
      "Nome Social.:TANIA APARECIDA MACH CPF.........:647.971.636-15",
      "Nome........:TANIA APARECIDA MACHADO Data Nasc...:16/10/1964",
      "Solicitante.:Giselle Almeida de Faria Tavares Requisição..:1772369",
      "Convênio....:120-DIALIZE Entrada.....:01/09/2026",
      "Material: Sangue total EDTA Coletado em: 07/09/2026 09:23 Método: Citometria de Fluxo",
      "DOSAGEM DE HEMOGLOBINA",
      "Hemoglobina.........: 13,7 g/dL Mulheres: 12,0 a 15,5 g/dL",
      "HEMATOCRITO",
      "HEMATÓCRITO.........: 43,4 % Mulheres : 35,0 a 45,0 %",
      "CALCIO",
      "Resultado...........: 8,9 mg/dL"
    ]
  },
  {
    pageNum: 2,
    lines: [
      "CREATININA",
      "Resultado...........: 8,86 mg/dL"
    ]
  },
  {
    pageNum: 3,
    lines: [
      "FOSFORO",
      "Resultado...........: 7,2 mg/dL",
      "GLICEMIA EM JEJUM",
      "Resultado...........: 123 mg/dL"
    ]
  },
  {
    pageNum: 4,
    lines: [
      "TRANSAMINASE GLUTÂMICO PIRÚVICA- TGP",
      "Resultado...........: 15 U/L",
      "UREIA",
      "Resultado...........: 204 mg/dL",
      "UREIA PÓS DIÁLISE",
      "Resultado...........: 57 mg/dL"
    ]
  },
  {
    pageNum: 5,
    lines: [
      "POTÁSSIO",
      "Resultado...........: 6,8 mEq/L",
      "SÓDIO",
      "Resultado...........: 137 mEq/L"
    ]
  }
];

const res2 = parseLabiconReport(pdf2Pages);
console.log('=== RESULTADO PDF 2 (07/09/2026) ===');
console.log(JSON.stringify(res2.registros[0]?.exames, null, 2));

// Test PDF 3 (03/08/2026 - with HbA1c)
const pdf3Pages = [
  {
    pageNum: 1,
    lines: [
      "LABICON LABORATÓRIO",
      "Nome Social.:TANIA APARECIDA MACH CPF.........:647.971.636-15",
      "Nome........:TANIA APARECIDA MACHADO Data Nasc...:16/10/1964",
      "Solicitante.:Giselle Almeida de Faria Tavares Requisição..:1732634",
      "Convênio....:120-DIALIZE Entrada.....:01/08/2026",
      "Material: Sangue total EDTA Coletado em: 03/08/2026 08:56 Método: Citometria de Fluxo",
      "DOSAGEM DE HEMOGLOBINA",
      "Hemoglobina.........: 10,8 g/dL Mulheres: 12,0 a 15,5 g/dL",
      "HEMATOCRITO",
      "HEMATÓCRITO.........: 33,0 % Mulheres : 35,0 a 45,0 %",
      "CALCIO",
      "Resultado...........: 9,6 mg/dL"
    ]
  },
  {
    pageNum: 2,
    lines: [
      "FOSFORO",
      "Resultado...........: 5,8 mg/dL",
      "GLICEMIA EM JEJUM",
      "Resultado...........: 134 mg/dL"
    ]
  },
  {
    pageNum: 3,
    lines: [
      "TRANSAMINASE GLUTÂMICO PIRÚVICA- TGP",
      "Resultado...........: 44 U/L",
      "UREIA",
      "Resultado...........: 162 mg/dL",
      "UREIA PÓS DIÁLISE",
      "Resultado...........: 49 mg/dL"
    ]
  },
  {
    pageNum: 4,
    lines: [
      "POTÁSSIO",
      "Resultado...........: 6,7 mEq/L",
      "SÓDIO",
      "Resultado...........: 134 mEq/L"
    ]
  },
  {
    pageNum: 5,
    lines: [
      "HEMOGLOBINA GLICADA - HBA1C",
      "Hemoglobina Glicada (A1: 6,7 % Normal: Menor que 5,7%",
      "Glicemia média estimada: 146 mg/dL"
    ]
  }
];

const res3 = parseLabiconReport(pdf3Pages);
console.log('=== RESULTADO PDF 3 (03/08/2026) ===');
console.log(JSON.stringify(res3.registros[0]?.exames, null, 2));

// Test PDF 4 (06/07/2026 - with Serologies, Vit D, etc.)
const pdf4Pages = [
  {
    pageNum: 1,
    lines: [
      "LABICON LABORATÓRIO",
      "Nome Social.:TANIA APARECIDA MACH CPF.........:647.971.636-15",
      "Nome........:TANIA APARECIDA MACHADO Data Nasc...:16/10/1964",
      "Solicitante.:SEM SOLICITANTE NO PEDIDO-CRBM-2-MG Requisição..:1693670",
      "Convênio....:120-DIALIZE / HD - S1T1 Entrada.....:06/07/2026",
      "Material: Sangue total EDTA Coletado em: 06/07/2026 09:26 Método: Citometria de Fluxo",
      "HEMOGRAMA COMPLETO",
      "HEMÁCIAS............: 2,98 milhões/mm",
      "HEMOGLOBINA.........: 9,6 g/dL",
      "HEMATÓCRITO.........: 29,5 %",
      "LEUCÓCITOS..........: 6.740 /mm³",
      "PLAQUETAS...........: 120.000 /mm³"
    ]
  },
  {
    pageNum: 2,
    lines: [
      "CALCIO",
      "Resultado...........: 10,5 mg/dL",
      "FOSFATASE ALCALINA",
      "Resultado...........: 54 U/L",
      "FOSFORO",
      "Resultado...........: 5,8 mg/dL"
    ]
  },
  {
    pageNum: 3,
    lines: [
      "GLICEMIA EM JEJUM",
      "Resultado...........: 186 mg/dL",
      "ÍNDICE DE SATURAÇÃO DA TRANSFERRINA",
      "Ferro sérico.......................: 78 µg/dL",
      "Capacidade total de ligação do ferr: 415,0 µg/dL",
      "Índice de Saturação de Transferrina: 19 %"
    ]
  },
  {
    pageNum: 4,
    lines: [
      "PROTEINAS TOTAIS E FRAÇÕES",
      "PROTEÍNAS TOTAIS....: 5,6 g/dL",
      "ALBUMINA............: 3,8 g/dL",
      "TRANSAMINASE GLUTÂMICO PIRÚVICA- TGP",
      "Resultado...........: 18 U/L"
    ]
  },
  {
    pageNum: 5,
    lines: [
      "UREIA",
      "Resultado...........: 159 mg/dL",
      "UREIA PÓS DIÁLISE",
      "Resultado...........: 33 mg/dL"
    ]
  },
  {
    pageNum: 6,
    lines: [
      "VITAMINA D 25 DIHIDROXI",
      "Resultado...........: 36 ng/mL"
    ]
  },
  {
    pageNum: 7,
    lines: [
      "HBSAG (HEPATITE B)",
      "Leitura.............: 0,29 Não Reagente.: Inferior a 0,90",
      "Resultado...........: Não reagente"
    ]
  },
  {
    pageNum: 8,
    lines: [
      "FERRITINA",
      "Resultado...........: 219,72 ng/mL",
      "HBS, ANTI (HEPATITE B)",
      "Leitura.............: 494,15 mUI/mL Não Reagente: Inferior a 10,00 mUI/mL",
      "Resultado...........: Reagente"
    ]
  },
  {
    pageNum: 9,
    lines: [
      "HEPATITE C - ANTI HCV",
      "Leitura.............: 0,04 Não reagente: Inferior a 1,00",
      "Resultado...........: Não reagente"
    ]
  },
  {
    pageNum: 10,
    lines: [
      "POTÁSSIO",
      "Resultado...........: 5,6 mEq/L",
      "PARATORMONIO - PTH",
      "Resultado...........: 276,9 pg/mL",
      "SÓDIO",
      "Resultado...........: 141 mEq/L"
    ]
  },
  {
    pageNum: 11,
    lines: [
      "HEMOGLOBINA GLICADA - HBA1C",
      "Hemoglobina Glicada (A1: 6,1 % Normal: Menor que 5,7%"
    ]
  }
];

const res4 = parseLabiconReport(pdf4Pages);
console.log('=== RESULTADO PDF 4 (06/07/2026) ===');
console.log(JSON.stringify(res4.registros[0]?.exames, null, 2));
