import { parseLabiconReport } from '../src/services/examImportService.js';
import { detectLaboratoryProfile } from '../src/data/labProfiles.js';

const esterPages = [
  {
    pageNum: 1,
    lines: [
      "LABICON LABORATÓRIO",
      "Nome Social.:ESTER GUIMARAES DE S CPF.........:081.327.366-80",
      "Nome........:ESTER GUIMARAES DE SOUZA Data Nasc...:12/12/1983",
      "Solicitante.:Camila Duque Fagundes de Figueiredo Requisição..:1809922",
      "Convênio....:120-DIALIZE Entrada.....:01/10/2026",
      "Impresso em.:16/10/2026 19:41 RG..........:",
      "Pág.: 1 / 7",
      "A aceitação deste resultado está condicionada à verificação de sua autenticidade com o laudo original ou através da internet no endereço:",
      "Valores de Referência",
      "Material: Sangue total EDTA Coletado em: 15/10/2026 16:01 Método: Citometria de Fluxo",
      "HEMOGRAMA COMPLETO",
      "ERITROGRAMA",
      "HEMÁCIAS............: 3,25 milhões/mm 4,0 a 5,2 milhões/mm³",
      "HEMOGLOBINA.........: 9,4 g/dL 12,0 a 16,0 g/dL",
      "HEMATÓCRITO.........: 26,0 % 36,0 a 46,0 %",
      "VCM.................: 80,0 fL 80,0 a 100,0 fL",
      "HCM.................: 28,9 pg 26,0 a 34,0 pg",
      "CHCM................: 36,2 g/dL 31,0 a 37,0 g/dL",
      "RDW.................: 14,5 % 11,2 a 15,6 %",
      "LEUCOGRAMA",
      "LEUCÓCITOS..........: 8.940 /mm³ 5.000 a 10.000/mm3",
      "BASTONETES..........: 0,0 % 0 /mm³ 0 a 5% 0 a 500/mm3",
      "SEGMENTADOS.........: 47,7 % 4.264 /mm³ 36 a 70% 1.800 a 7.000/mm3",
      "EOSINÓFILOS.........: 3,6 % 322 /mm³ 0 a 6% 0 a 600/mm3",
      "BASÓFILOS...........: 1,1 % 98 /mm³ 0 a 2% 0 a 200/mm3",
      "LINFÓCITOS TÍPICOS..: 40,1 % 3.585 /mm³ 20 a 40% 1.000 a 4.000/mm3",
      "MONÓCITOS...........: 7,5 % 671 /mm³ 1 a 10% 50 a 1.000/mm3",
      "PLAQUETAS...........: 347.000 /mm³ 140.000 a 450.000/mm3",
      "Liberado eletronicamente em:15/10/2026 20:59 por ISABEL ARAUJO GOBIRA CRBM-MG 4168",
      "Este exame possui assinatura eletrônica avançada: d65ca2b2838f9b64c1e9010722e697cb2180eda108e8e850d2252b2daf486f05",
      "CNPJ 13.150.241/0001-69 CNES 6855865",
      "RT Isabel de Lourdes Araujo Gobira CRBM 04168",
      "ENDEREÇO Rua Tiradentes, 2887, Bairro Industrial, Contagem/MG | CEP 32.230-020"
    ]
  },
  {
    pageNum: 2,
    lines: [
      "LABICON LABORATÓRIO",
      "Nome Social.:ESTER GUIMARAES DE S CPF.........:081.327.366-80",
      "Nome........:ESTER GUIMARAES DE SOUZA Data Nasc...:12/12/1983",
      "Solicitante.:Camila Duque Fagundes de Figueiredo Requisição..:1809922",
      "Convênio....:120-DIALIZE Entrada.....:01/10/2026",
      "Impresso em.:16/10/2026 19:41 RG..........:",
      "Pág.: 2 / 7",
      "A aceitação deste resultado está condicionada à verificação de sua autenticidade com o laudo original ou através da internet no endereço:",
      "Valores de Referência",
      "Material: Soro Coletado em: 15/10/2026 16:01 Método: Colorimétrico - Arsenazo III",
      "CALCIO",
      "Resultado...........: 9,7 mg/dL Lactantes: 9,0 a 11,0 mg/dL",
      "Adultos: 8,8 a 11,0 mg/dL",
      "Resultados Anteriores:",
      "04/09/2026 06/08/2026 04/06/2026",
      "9,1 mg/dL 9,0 mg/dL 10,2 mg/dL",
      "Liberado eletronicamente em:15/10/2026 19:50 por ISABEL ARAUJO GOBIRA CRBM-MG 4168",
      "Este exame possui assinatura eletrônica avançada: 3b06a2d48c25049e15863a635002128969a022248227f44527a83656308369d2",
      "CNPJ 13.150.241/0001-69 CNES 6855865",
      "RT Isabel de Lourdes Araujo Gobira CRBM 04168",
      "ENDEREÇO Rua Tiradentes, 2887, Bairro Industrial, Contagem/MG | CEP 32.230-020"
    ]
  },
  {
    pageNum: 3,
    lines: [
      "LABICON LABORATÓRIO",
      "Nome Social.:ESTER GUIMARAES DE S CPF.........:081.327.366-80",
      "Nome........:ESTER GUIMARAES DE SOUZA Data Nasc...:12/12/1983",
      "Solicitante.:Camila Duque Fagundes de Figueiredo Requisição..:1809922",
      "Convênio....:120-DIALIZE Entrada.....:01/10/2026",
      "Impresso em.:16/10/2026 19:41 RG..........:",
      "Pág.: 3 / 7",
      "A aceitação deste resultado está condicionada à verificação de sua autenticidade com o laudo original ou através da internet no endereço:",
      "Valores de Referência",
      "Material: Soro Coletado em: 15/10/2026 16:01 Método: Cinético - Colorimétrico",
      "CREATININA",
      "Resultado...........: 6,00 mg/dL Adultos:",
      "Homens: 0,70 a 1,20 mg/dL",
      "Mulheres: 0,50 a 1,00 mg/dL",
      "Resultados Anteriores:",
      "04/09/2026 06/08/2026 04/06/2026",
      "6,29 mg/dL 4,63 mg/dL 5,08 mg/dL",
      "Liberado eletronicamente em:15/10/2026 19:50 por ISABEL ARAUJO GOBIRA CRBM-MG 4168",
      "Este exame possui assinatura eletrônica avançada: 02f587352058ef4ce4a7b4e3ecb0a6b730bf65897824bfd133e3839799758376",
      "CNPJ 13.150.241/0001-69 CNES 6855865",
      "RT Isabel de Lourdes Araujo Gobira CRBM 04168",
      "ENDEREÇO Rua Tiradentes, 2887, Bairro Industrial, Contagem/MG | CEP 32.230-020"
    ]
  },
  {
    pageNum: 4,
    lines: [
      "LABICON LABORATÓRIO",
      "Nome Social.:ESTER GUIMARAES DE S CPF.........:081.327.366-80",
      "Nome........:ESTER GUIMARAES DE SOUZA Data Nasc...:12/12/1983",
      "Solicitante.:Camila Duque Fagundes de Figueiredo Requisição..:1809922",
      "Convênio....:120-DIALIZE Entrada.....:01/10/2026",
      "Impresso em.:16/10/2026 19:41 RG..........:",
      "Pág.: 4 / 7",
      "A aceitação deste resultado está condicionada à verificação de sua autenticidade com o laudo original ou através da internet no endereço:",
      "Valores de Referência",
      "Material: Soro Coletado em: 15/10/2026 16:01 Método: Cinética IFCC",
      "FOSFATASE ALCALINA",
      "Resultado...........: 373 U/L Adultos: 27 a 100 U/L",
      "OBSERVAÇÃO..........: Resultado confirmado em mesma amostra e tecnicamente validado em conformidade com o controle de qualidade.",
      "Resultados Anteriores:",
      "09/07/2026 23/04/2026",
      "617 U/L 463 U/L",
      "Liberado eletronicamente em:16/10/2026 17:01 por AMANDA GONÇALVES XAVIER CRBM 18643",
      "Este exame possui assinatura eletrônica avançada: 5d45d1bf521944237932cc84524e7b9f175491694372c173cfa2e517a27cb216",
      "Valores de Referência",
      "Material: Soro Coletado em: 15/10/2026 16:01 Método: UV Ponto Final",
      "FOSFORO",
      "Resultado...........: 8,7 mg/dL Adultos: 2,5 a 4,8 mg/dL",
      "Observação..........: Resultado confirmado em mesma amostra e tecnicamente validado em conformidade com o controle de qualidade.",
      "Resultados Anteriores:",
      "04/09/2026 06/08/2026 04/06/2026",
      "5,8 mg/dL 6,7 mg/dL 6,5 mg/dL",
      "Liberado eletronicamente em:16/10/2026 17:01 por AMANDA GONÇALVES XAVIER CRBM 18643",
      "Este exame possui assinatura eletrônica avançada: 159811427d4f7c7ebe7e71219d4fc86138511bd08207e8f93715b6407f86c40a",
      "Valores de Referência",
      "Material: Soro Coletado em: 15/10/2026 16:01 Método: Enzimático colorimétrico",
      "GLICEMIA EM JEJUM",
      "Resultado...........: 70 mg/dL De 65 a 99 mg/dL",
      "Resultados Anteriores:",
      "06/08/2026 09/07/2026 04/06/2026",
      "77 mg/dL 145 mg/dL 80 mg/dL",
      "Liberado eletronicamente em:15/10/2026 19:50 por ISABEL ARAUJO GOBIRA CRBM-MG 4168",
      "Este exame possui assinatura eletrônica avançada: 2020553421dcfb0853595e13ff9ec921a89791d3746a5150dfcee82508de2142",
      "CNPJ 13.150.241/0001-69 CNES 6855865",
      "RT Isabel de Lourdes Araujo Gobira CRBM 04168",
      "ENDEREÇO Rua Tiradentes, 2887, Bairro Industrial, Contagem/MG | CEP 32.230-020"
    ]
  },
  {
    pageNum: 5,
    lines: [
      "LABICON LABORATÓRIO",
      "Nome Social.:ESTER GUIMARAES DE S CPF.........:081.327.366-80",
      "Nome........:ESTER GUIMARAES DE SOUZA Data Nasc...:12/12/1983",
      "Solicitante.:SOLICITACAO PROPRIA Requisição..:1809922",
      "Convênio....:120-DIALIZE / APD Entrada.....:01/10/2026",
      "Impresso em.:16/10/2026 19:41 RG..........:",
      "Pág.: 5 / 7",
      "A aceitação deste resultado está condicionada à verificação de sua autenticidade com o laudo original ou através da internet no endereço:",
      "Valores de Referência",
      "Material: Soro Coletado em: 16/10/2026 11:57 Método: Cálculo Baseado no Ferro e Cap. Total de Ligação",
      "ÍNDICE DE SATURAÇÃO DA TRANSFERRINA",
      "Ferro sérico.......................: 49 µg/dL RECÉM-NASCIDO: 100 a 250 µg/dL",
      "LACTANTE: 40 a 100 µg/dL",
      "CRIANÇA: 50 a 120 µg/dL",
      "ADULTO:",
      "HOMENS: 65 a 170 µg/dL",
      "MULHERES: 50 a 170 µg/dL",
      "Capacidade total de ligação do ferr: 198,0 µg/dL 250,0 A 410,0 µg/dL",
      "Índice de Saturação de Transferrina: 25 % 15 a 60 %",
      "Resultado confirmado em mesma amostra e tecnicamente validado em conformidade com o controle de qualidade.",
      "Liberado eletronicamente em:16/10/2026 19:39 por AMANDA GONÇALVES XAVIER CRBM 18643",
      "Este exame possui assinatura eletrônica avançada: 760d6aefac1d138e139a0d6fd2d04ecc4d79426ca6a60d3d1f2c8ab63e623012",
      "Valores de Referência",
      "Material: Soro Coletado em: 15/10/2026 16:01 Método: Colorimétrico",
      "PROTEINAS TOTAIS E FRAÇÕES",
      "PROTEÍNAS TOTAIS....: 8,9 g/dL 6,5 a 8,2 g/dL",
      "ALBUMINA............: 3,6 g/dL 3,7 a 5,2 g/dL",
      "GLOBULINAS..........: 5,3 g/dL 1,8 a 4,4 g/dL",
      "RELAÇÃO A/G.........: 0,7 Superior ou igual a 1,1",
      "Liberado eletronicamente em:15/10/2026 19:50 por ISABEL ARAUJO GOBIRA CRBM-MG 4168",
      "Este exame possui assinatura eletrônica avançada: 2cafb159ecd350072bb840955148ce8ebeb7bf7696d5714e723a631c4c75b3ec",
      "CNPJ 13.150.241/0001-69 CNES 6855865",
      "RT Isabel de Lourdes Araujo Gobira CRBM 04168",
      "ENDEREÇO Rua Tiradentes, 2887, Bairro Industrial, Contagem/MG | CEP 32.230-020"
    ]
  },
  {
    pageNum: 6,
    lines: [
      "LABICON LABORATÓRIO",
      "Nome Social.:ESTER GUIMARAES DE S CPF.........:081.327.366-80",
      "Nome........:ESTER GUIMARAES DE SOUZA Data Nasc...:12/12/1983",
      "Solicitante.:SOLICITACAO PROPRIA Requisição..:1809922",
      "Convênio....:120-DIALIZE / APD Entrada.....:01/10/2026",
      "Impresso em.:16/10/2026 19:41 RG..........:",
      "Pág.: 6 / 7",
      "A aceitação deste resultado está condicionada à verificação de sua autenticidade com o laudo original ou através da internet no endereço:",
      "Valores de Referência",
      "Material: Soro Coletado em: 15/10/2026 16:01 Método: Cinética de tempo fixo",
      "UREIA",
      "Resultado...........: 104 mg/dL Adultos: 15 a 40 mg/dL",
      "OBS: Resultado confirmado em mesma amostra e tecnicamente validado em conformidade com o controle de qualidade.",
      "Resultados Anteriores:",
      "23/04/2026",
      "135 mg/dL",
      "Liberado eletronicamente em:15/10/2026 19:50 por ISABEL ARAUJO GOBIRA CRBM-MG 4168",
      "Este exame possui assinatura eletrônica avançada: d259cce54f6bc919874e9d33fba542a22d7a520a74f0f720c035a7928be31506",
      "FERRITINA",
      "Exame em Andamento...",
      "Valores de Referência",
      "Material: Soro Coletado em: 15/10/2026 16:01 Método: Eletrodo seletivo",
      "POTÁSSIO",
      "Resultado...........: 4,1 mEq/L 3,5 a 5,1 mEq/L",
      "Exame realizado em parceria com laboratório de apoio DB - CNES: 4057619",
      "Resultados Anteriores:",
      "04/09/2026 06/08/2026 09/07/2026",
      "5,6 mEq/L 5,7 mEq/L 4,8 mEq/L",
      "Liberado eletronicamente em:16/10/2026 16:19 por ISABEL ARAUJO GOBIRA CRBM-MG 4168",
      "Este exame possui assinatura eletrônica avançada: 59b133e8f900316e255d2217ffdd0c4a49d2b56a10d16262ab3ba41ae62f86d9",
      "CNPJ 13.150.241/0001-69 CNES 6855865",
      "RT Isabel de Lourdes Araujo Gobira CRBM 04168",
      "ENDEREÇO Rua Tiradentes, 2887, Bairro Industrial, Contagem/MG | CEP 32.230-020"
    ]
  },
  {
    pageNum: 7,
    lines: [
      "LABICON LABORATÓRIO",
      "Nome Social.:ESTER GUIMARAES DE S CPF.........:081.327.366-80",
      "Nome........:ESTER GUIMARAES DE SOUZA Data Nasc...:12/12/1983",
      "Solicitante.:Camila Duque Fagundes de Figueiredo Requisição..:1809922",
      "Convênio....:120-DIALIZE Entrada.....:01/10/2026",
      "Impresso em.:16/10/2026 19:41 RG..........:",
      "Pág.: 7 / 7",
      "A aceitação deste resultado está condicionada à verificação de sua autenticidade com o laudo original ou através da internet no endereço:",
      "PARATORMONIO - PTH",
      "Exame em Andamento...",
      "Valores de Referência",
      "Material: Soro Coletado em: 15/10/2026 16:01 Método: Eletrodo seletivo",
      "SÓDIO",
      "Resultado...........: 136 mEq/L Adultos...........: 136 a 145 mEq/L",
      "Exame realizado em parceria com laboratório de apoio DB - CNES: 4057619",
      "Resultados Anteriores:",
      "04/09/2026 06/08/2026 09/07/2026",
      "141 mEq/L 138 mEq/L 135 mEq/L",
      "Liberado eletronicamente em:16/10/2026 16:19 por ISABEL ARAUJO GOBIRA CRBM-MG 4168",
      "Este exame possui assinatura eletrônica avançada: 6c679b9ce6662b4f192d6aee2ddf6d9769b25316431e67b87f65c6ada5c042c6",
      "CNPJ 13.150.241/0001-69 CNES 6855865",
      "RT Isabel de Lourdes Araujo Gobira CRBM 04168",
      "ENDEREÇO Rua Tiradentes, 2887, Bairro Industrial, Contagem/MG | CEP 32.230-020"
    ]
  }
];

const mockPatients = [
  {
    id: "ester-guimaraes-de-souza-gi00",
    nome: "Ester Guimarães de Souza",
    cpf: "081.327.366-80",
    clinica: "Dialize Betim",
    doctorId: "doc-1788294320148"
  }
];

const allText = esterPages.flatMap(p => p.lines).join(' ').toUpperCase();
const detectedLab = detectLaboratoryProfile(allText);
console.log("Laboratório Detectado:", detectedLab?.nome || "NÃO DETECTADO", `(${detectedLab?.id})`);

const parsed = parseLabiconReport(esterPages, mockPatients, null);
console.log("Total Registros:", parsed.registros.length);
if (parsed.registros.length > 0) {
  const reg = parsed.registros[0];
  console.log("Paciente:", reg.pacienteNome, `(ID: ${reg.pacienteId})`);
  console.log("CPF:", reg.cpf);
  console.log("Status Match:", reg.statusMatch);
  console.log("Data Exame:", reg.dataExame);
  console.log("Exames Extraídos:", JSON.stringify(reg.exames, null, 2));
}
