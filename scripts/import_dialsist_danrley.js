import { db } from "../src/config/firebase.js";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";

// Metadados da Instituição extraídos do cabeçalho do PDF
export const INSTITUICAO_DIALIZE = {
  nomeClinica: "DIALIZE BETIM",
  hospitalNome: "HOSPITAL PUBLICO REGIONAL PREF. OSVALDO REZENDE FRANCO",
  endereco: "AV EDMEIA MATTOS LAZZAROTTI, 3800 LOJA 206 - JARDIM BRASILIA - Betim/MG - CEP: 32604-155",
  cnpj: "58.476.786/0001-06",
  telefone: "(31) 8109-0009",
  cidade: "Betim/MG",
  turnoPadrao: "1º Turno",
  diasSemanaPadrao: "Seg/Qua/Sex"
};

// 30 Pacientes transcritos fielmente da folha 1 do relatório Dialsist Web
export const PACIENTES_DIALSIST = [
  {
    num: 1,
    nome: "ALVIMAR SANTOS MUNIZ",
    cpf: "892.377.066-34",
    sexo: "Masculino",
    dataNascimento: "1962-03-10",
    idade: 64,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-07-11", tempo: "14m20d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-07-11", tempo: "14m20d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-06-07", tempoTotal: "15m23d" }
  },
  {
    num: 2,
    nome: "ANDRES FELIPE PARAMO RIVILLAS",
    cpf: "720.249.964-93",
    sexo: "Masculino",
    dataNascimento: "1999-06-19",
    idade: 27,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 3,
    nome: "ANGELA MARIA BARROSO DA SILVA",
    cpf: "063.284.116-85",
    sexo: "Feminino",
    dataNascimento: "1975-08-20",
    idade: 51,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 4,
    nome: "ARMANDO ALVES DE MOURA",
    cpf: "876.031.446-04",
    sexo: "Masculino",
    dataNascimento: "1951-10-28",
    idade: 74,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 5,
    nome: "BEATRIZ SILVA",
    cpf: "025.148.406-86",
    sexo: "Feminino",
    dataNascimento: "1964-03-14",
    idade: 62,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 6,
    nome: "CLEUSA ALVES DOS SANTOS",
    cpf: "027.699.916-98",
    sexo: "Feminino",
    dataNascimento: "1969-02-02",
    idade: 57,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 7,
    nome: "DJAIR RAIMUNDO DOS SANTOS",
    cpf: "599.718.946-53",
    sexo: "Masculino",
    dataNascimento: "1966-08-05",
    idade: 60,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2024-10-22", tempoTotal: "23m8d" }
  },
  {
    num: 8,
    nome: "EDVALDO BARBOSA DE SOUZA",
    cpf: "689.368.006-63",
    sexo: "Masculino",
    dataNascimento: "1971-02-25",
    idade: 55,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 9,
    nome: "ELAINE BATISTA ROCHA",
    cpf: "007.011.666-06",
    sexo: "Feminino",
    dataNascimento: "1975-09-07",
    idade: 51,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 10,
    nome: "ELIETE ROCHA DIAS",
    cpf: "612.382.446-53",
    sexo: "Feminino",
    dataNascimento: "1964-05-21",
    idade: 62,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-03-03", tempo: "18m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-03-03", tempo: "18m28d" },
    primeiroTratamento: { modalidade: "APD", dataInicio: "2024-11-14", tempoTotal: "22m15d" }
  },
  {
    num: 11,
    nome: "ERECLYDES MARTINHO MENDES",
    cpf: "186.527.436-49",
    sexo: "Masculino",
    dataNascimento: "1951-11-05",
    idade: 74,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 12,
    nome: "EULALIA RODRIGUES DOS REIS",
    cpf: "132.613.406-06",
    sexo: "Feminino",
    dataNascimento: "1998-02-07",
    idade: 28,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 13,
    nome: "HELIO RESENDE CAPAZ",
    cpf: "432.814.946-68",
    sexo: "Masculino",
    dataNascimento: "1960-04-05",
    idade: 66,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-02-21", tempo: "19m8d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-02-21", tempo: "19m8d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2024-12-22", tempoTotal: "21m8d" }
  },
  {
    num: 14,
    nome: "HUANDER DE FARIA EUZEBIO",
    cpf: "026.535.056-57",
    sexo: "Masculino",
    dataNascimento: "1976-09-20",
    idade: 50,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 15,
    nome: "JOSE DIAS DE SOUZA NETO",
    cpf: "892.396.956-72",
    sexo: "Masculino",
    dataNascimento: "1963-11-14",
    idade: 62,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 16,
    nome: "LOURDES MARIA EVANGELISTA VASCONCELOS",
    cpf: "726.306.636-04",
    sexo: "Feminino",
    dataNascimento: "1956-08-25",
    idade: 70,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-08-04", tempo: "13m26d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-08-04", tempo: "13m26d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-08-04", tempoTotal: "13m26d" }
  },
  {
    num: 17,
    nome: "MARIA APARECIDA INACIO PASSOS",
    cpf: "820.470.656-15",
    sexo: "Feminino",
    dataNascimento: "1971-11-11",
    idade: 54,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 18,
    nome: "MARIANA DE FREITAS CAMPOS",
    cpf: "028.554.346-61",
    sexo: "Feminino",
    dataNascimento: "1976-12-08",
    idade: 49,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2013-01-01", tempoTotal: "164m28d" }
  },
  {
    num: 19,
    nome: "NILDE GONCALVES DO NASCIMENTO",
    cpf: "695.245.566-34",
    sexo: "Feminino",
    dataNascimento: "1961-03-08",
    idade: 65,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 20,
    nome: "NILZETE LOPES DE ATAIDES",
    cpf: "084.400.736-66",
    sexo: "Feminino",
    dataNascimento: "1961-08-13",
    idade: 65,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 21,
    nome: "ODETE ALVES FERREIRA",
    cpf: "039.787.956-39",
    sexo: "Feminino",
    dataNascimento: "1958-12-26",
    idade: 67,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 22,
    nome: "PALOMA DIAS BATISTA GONCALVES",
    cpf: "119.743.306-64",
    sexo: "Feminino",
    dataNascimento: "1991-11-23",
    idade: 34,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 23,
    nome: "RAQUEL SILVA GOMES VASCONCELOS",
    cpf: "084.628.436-77",
    sexo: "Feminino",
    dataNascimento: "1984-03-07",
    idade: 42,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 24,
    nome: "RODRIGO WAGNER FARIA",
    cpf: "005.282.166-86",
    sexo: "Masculino",
    dataNascimento: "1978-08-14",
    idade: 48,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 25,
    nome: "RONIVON MARTINS DE OLIVEIRA",
    cpf: "814.155.246-53",
    sexo: "Masculino",
    dataNascimento: "1970-01-01",
    idade: 56,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 26,
    nome: "SILMARA CRISTINA DIAS",
    cpf: "083.673.006-29",
    sexo: "Feminino",
    dataNascimento: "1988-02-05",
    idade: 38,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 27,
    nome: "TARCISIO PIRES DO CARMO",
    cpf: "279.534.916-72",
    sexo: "Masculino",
    dataNascimento: "1954-02-13",
    idade: 72,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 28,
    nome: "WANDERSON APARECIDO DA SILVA",
    cpf: "812.070.346-49",
    sexo: "Masculino",
    dataNascimento: "1973-02-20",
    idade: 53,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 29,
    nome: "WILLIAN BAZILIO LIMA",
    cpf: "105.660.976-13",
    sexo: "Masculino",
    dataNascimento: "1992-10-22",
    idade: 33,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  },
  {
    num: 30,
    nome: "WILLIAN MARINS PERES",
    cpf: "039.804.816-97",
    sexo: "Masculino",
    dataNascimento: "1978-02-02",
    idade: 48,
    tipoPaciente: "Crônico",
    etiologiaDRC: "Doenca renal em estadio final",
    tratamentoAtual: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d", convenio: "SUS" },
    inicioClinica: { modalidade: "HD", dataInicio: "2025-01-01", tempo: "20m28d" },
    primeiroTratamento: { modalidade: "HD", dataInicio: "2025-01-01", tempoTotal: "20m28d" }
  }
];

function generateId(nome) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") + `-${Math.random().toString(36).substring(2, 6)}`;
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

export async function executeImport(dryRun = false) {
  const doctorId = "doc-85719-mg";
  console.log(`\n🚀 Executando importação para ${doctorId} (DryRun: ${dryRun})...`);

  // 1. Atualizar clínica DIALIZE BETIM em locaisAtuacao do Dr. Danrley
  const docRef = doc(db, "doctors", doctorId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    throw new Error(`Médico ${doctorId} não encontrado no Cloud Firestore.`);
  }

  const doctorData = docSnap.data();
  console.log(`Médico encontrado: ${doctorData.nome}`);

  const locais = Array.isArray(doctorData.locaisAtuacao) ? [...doctorData.locaisAtuacao] : [];
  let dializeIndex = locais.findIndex(l => (l.nome || "").toUpperCase().includes("DIALIZE"));

  if (dializeIndex >= 0) {
    locais[dializeIndex] = {
      ...locais[dializeIndex],
      nome: INSTITUICAO_DIALIZE.nomeClinica,
      tipo: "Clínica de Hemodiálise",
      status: "Ativo",
      cidade: INSTITUICAO_DIALIZE.cidade,
      endereco: INSTITUICAO_DIALIZE.endereco,
      cnpj: INSTITUICAO_DIALIZE.cnpj,
      telefoneEnfermagem: INSTITUICAO_DIALIZE.telefone,
      hospitalVinculo: INSTITUICAO_DIALIZE.hospitalNome,
      turnos: "1º Turno (06:00 - 10:00)",
      diasSemana: INSTITUICAO_DIALIZE.diasSemanaPadrao,
      rtNome: doctorData.nome,
      rtCrm: `${doctorData.crm || '85719'}/${doctorData.ufCrm || 'MG'}`,
      pacientesCount: 30,
      atualizadoEm: new Date().toISOString()
    };
  } else {
    locais.push({
      id: `loc-dialize-betim-danrley`,
      nome: INSTITUICAO_DIALIZE.nomeClinica,
      tipo: "Clínica de Hemodiálise",
      status: "Ativo",
      cidade: INSTITUICAO_DIALIZE.cidade,
      endereco: INSTITUICAO_DIALIZE.endereco,
      cnpj: INSTITUICAO_DIALIZE.cnpj,
      telefoneEnfermagem: INSTITUICAO_DIALIZE.telefone,
      hospitalVinculo: INSTITUICAO_DIALIZE.hospitalNome,
      turnos: "1º Turno (06:00 - 10:00)",
      diasSemana: INSTITUICAO_DIALIZE.diasSemanaPadrao,
      rtNome: doctorData.nome,
      rtCrm: `${doctorData.crm || '85719'}/${doctorData.ufCrm || 'MG'}`,
      pacientesCount: 30,
      criadoEm: new Date().toISOString()
    });
  }

  // 2. Buscar pacientes existentes do Dr. Danrley
  const qDanrley = query(collection(db, "patients"), where("doctorId", "==", doctorId));
  const snapExisting = await getDocs(qDanrley);
  const existingMap = new Map();
  snapExisting.docs.forEach(d => {
    const data = d.data();
    const cleanNome = (data.nome || "").trim().toUpperCase();
    existingMap.set(cleanNome, { id: d.id, ...data });
  });

  console.log(`Pacientes pré-existentes do Dr. Danrley: ${existingMap.size}`);

  let updatedCount = 0;
  let createdCount = 0;

  for (const p of PACIENTES_DIALSIST) {
    const cleanNome = p.nome.trim().toUpperCase();
    const existing = existingMap.get(cleanNome);

    const isEliete = cleanNome.includes("ELIETE");
    const modalidadePrimaria = isEliete ? "APD" : "HD";

    const patientData = {
      doctorId,
      nome: p.nome,
      cpf: p.cpf,
      sexo: p.sexo,
      dataNascimento: p.dataNascimento,
      idade: p.idade,
      tipoPaciente: p.tipoPaciente,
      etiologiaDRC: p.etiologiaDRC,
      clinica: INSTITUICAO_DIALIZE.nomeClinica,
      hospital: INSTITUICAO_DIALIZE.hospitalNome,
      turno: INSTITUICAO_DIALIZE.turnoPadrao,
      diaSemana: INSTITUICAO_DIALIZE.diasSemanaPadrao,
      convenio: "SUS",
      modalidade: p.tratamentoAtual.modalidade || "HD",
      dataInicioClinica: p.inicioClinica.dataInicio,
      tempoNaClinica: p.inicioClinica.tempo,
      dataInicioDialise: p.primeiroTratamento.dataInicio,
      tempoTotalTratamento: p.primeiroTratamento.tempoTotal,
      tempoTratamentoAtual: p.tratamentoAtual.tempo,
      tratamentoAtual: p.tratamentoAtual,
      inicioClinica: p.inicioClinica,
      primeiroTratamento: p.primeiroTratamento,
      status: existing?.status || "Ativo",
      statusTransplante: existing?.statusTransplante || existing?.status || "Não Avaliado",
      pesoSeco: existing?.pesoSeco || null,
      acessoVascular: existing?.acessoVascular || {
        tipo: isEliete ? "Cateter Peritoneal" : "FAV",
        ladoMembro: isEliete ? "Abdominal / Peritoneal" : "MSE",
        fluxoSangue: isEliete ? "" : "300",
        fluxoDialisato: isEliete ? "" : "500",
        agulha: isEliete ? "" : "16G",
        dataConfeccao: ""
      },
      anticoagulacao: existing?.anticoagulacao || {
        tipo: isEliete ? "sem_heparina" : "heparina_padrao",
        doseAtaque: isEliete ? "" : "1000",
        doseManutencao: isEliete ? "" : "500",
        doseEnoxaparina: isEliete ? "" : "40",
        motivoSemHeparina: isEliete ? "Diálise Peritoneal (Sem Heparina sistêmica)" : "",
        observacoes: isEliete ? "Diálise Peritoneal Automatizada (APD)" : "Desligar infusão 45 min antes do término da diálise."
      },
      exames: existing?.exames || {},
      medicamentos: existing?.medicamentos || {},
      historicoExames: existing?.historicoExames || [],
      historicoPesos: existing?.historicoPesos || [],
      hemoculturas: existing?.hemoculturas || [],
      receitas: existing?.receitas || [],
      evolucoes: existing?.evolucoes || [],
      alergias: existing?.alergias || [],
      atualizadoEm: new Date().toISOString()
    };

    if (existing) {
      const patientId = existing.id;
      patientData.id = patientId;
      console.log(`[ATUALIZAR] ${p.num}. ${p.nome} (ID: ${patientId}, CPF: ${p.cpf})`);
      if (!dryRun) {
        await updateDoc(doc(db, "patients", patientId), patientData);
        await sleep(150); // backoff para respeitar cota
      }
      updatedCount++;
    } else {
      const newId = generateId(p.nome);
      patientData.id = newId;
      patientData.criadoEm = new Date().toISOString();
      console.log(`[CRIAR] ${p.num}. ${p.nome} (Novo ID: ${newId}, CPF: ${p.cpf})`);
      if (!dryRun) {
        await setDoc(doc(db, "patients", newId), patientData);
        await sleep(150); // backoff para respeitar cota
      }
      createdCount++;
    }
  }

  // 3. Atualizar estatísticas no documento do Dr. Danrley
  const totalPacientes = (existingMap.size - updatedCount) + (updatedCount + createdCount);
  console.log(`\nTotal atualizado de pacientes do Dr. Danrley: ${totalPacientes}`);

  if (!dryRun) {
    await updateDoc(docRef, {
      locaisAtuacao: locais,
      pacientesCount: totalPacientes,
      hospitalVinculo: INSTITUICAO_DIALIZE.hospitalNome,
      atualizadoEm: new Date().toISOString()
    });

    // 4. Registrar trilha de auditoria
    const auditId = `audit-${Date.now()}-import-dialsist`;
    await setDoc(doc(db, "audit_logs", auditId), {
      id: auditId,
      timestamp: new Date().toISOString(),
      tipoAcao: "PATIENT_IMPORT",
      descricao: `Importação de 30 pacientes do Sistema Dialsist Web para Dr. Danrley na unidade DIALIZE BETIM (${INSTITUICAO_DIALIZE.hospitalNome})`,
      adminEmail: "admin@nefroapp.com",
      targetDoctorId: doctorId,
      targetDoctorName: doctorData.nome,
      detalhes: {
        totalImportados: 30,
        criados: createdCount,
        atualizados: updatedCount,
        totalGeralMedico: totalPacientes,
        clinica: INSTITUICAO_DIALIZE.nomeClinica,
        hospital: INSTITUICAO_DIALIZE.hospitalNome
      }
    });
  }

  console.log(`\n🎉 Concluído com Sucesso!`);
  console.log(`   - Atualizados: ${updatedCount}`);
  console.log(`   - Novos Criados: ${createdCount}`);
  console.log(`   - Total Dialsist: ${updatedCount + createdCount}`);
  console.log(`   - Total no Perfil do Médico: ${totalPacientes}`);
}

if (process.argv[1]?.endsWith('import_dialsist_danrley.js')) {
  const isDry = process.argv.includes('--dry-run');
  executeImport(isDry).then(() => process.exit(0)).catch(err => {
    console.error("❌ Erro ao importar:", err);
    process.exit(1);
  });
}
