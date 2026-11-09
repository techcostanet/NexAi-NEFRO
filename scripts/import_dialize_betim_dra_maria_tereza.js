import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  writeBatch 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA0TDoy1FJOBYRQNPIrHcBwk0_rCejVHdM",
  authDomain: "nexai-nefro.firebaseapp.com",
  projectId: "nexai-nefro",
  storageBucket: "nexai-nefro.firebasestorage.app",
  messagingSenderId: "1085284590267",
  appId: "1:1085284590267:web:8950b5a287c77fea107f9e",
  measurementId: "G-0ZQJ0WEWQW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const DOCTOR_ID = "dra-maria-tereza";
export const CLINICA_NOME = "Dialize Betim";
export const HOSPITAL_NOME = "HOSPITAL PUBLICO REGIONAL PREF. OSVALDO REZENDE FRANCO";

function parseDateBR(str) {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    let year = parts[2];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }
  return str;
}

function calculateAge(birthDateStr) {
  if (!birthDateStr) return null;
  const today = new Date('2026-11-09');
  const birth = new Date(birthDateStr);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function generatePatientId(nome) {
  const clean = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `paciente-${clean}`;
}

// 30 Pacientes do PDF 1 (Nome, Endereço, Telefone)
export const PACIENTES_ARQUIVO_1 = [
  {
    nome: "ADELINA FERREIRA DE ALMEIDA PEREIRA",
    cpf: "369.434.362-87",
    dataNascimento: "1962-05-01",
    mae: "MARIA ALVES DE ALMEIDA",
    endereco: "Antúrio, 35, CRUZEIRO DO SUL, Betim - MG Brasil CEP: 32672-790",
    telefone: "(31) 97152-0821 - CELULAR",
    telefones: ["(31) 97152-0821"],
    cns: "702807656675969",
    sexo: "Feminino"
  },
  {
    nome: "ADELMARIA ALVES PEREIRA SILVA",
    cpf: "068.638.836-43",
    dataNascimento: "1967-03-26",
    mae: "ILMA ALVES FARIAS",
    endereco: "JOSE GONCALVES , 38, NOVO HORIZONTE, CASA Betim - MG Brasil CEP: 32606-100",
    telefone: "(31) 98400-9766 - CELULAR DA PACIENTE",
    telefones: ["(31) 98400-9766", "(37) 99664-9637", "(31) 98931-5396"],
    cns: "700506927193057",
    sexo: "Feminino"
  },
  {
    nome: "ANTONIA GILDETE ALVES LOPES",
    cpf: "038.422.833-00",
    dataNascimento: "1989-06-02",
    mae: "EDILEUZA ALVES SOUSA LOPES",
    endereco: "Manoel da Silva Pereira, 58, CHACARA, Betim - MG Brasil CEP: 32671-252",
    telefone: "(31) 98770-0620 - CELULAR",
    telefones: ["(31) 98770-0620"],
    cns: "709707002948190",
    sexo: "Feminino"
  },
  {
    nome: "ANTONIO VICENTE DE JESUS",
    cpf: "660.720.426-00",
    dataNascimento: "1960-10-02",
    mae: "GENI MARIA DA COSTA",
    endereco: "Junquilhas, 5, JARDIM DAS ALTEROSAS , Betim - MG Brasil CEP: 32673-202",
    telefone: "(31) 99658-6470 - CELULAR",
    telefones: ["(31) 99658-6470", "(31) 99677-5014"],
    cns: "700801922092581",
    sexo: "Masculino"
  },
  {
    nome: "BRUNO XAVIER DE SOUZA",
    cpf: "065.810.286-90",
    dataNascimento: "1984-01-21",
    mae: "MARINALVA FRANCISCA XAVIER DE SOUZA",
    endereco: "Pedro Alves, 76, ITACOLOMI, Betim - MG Brasil CEP: 32672-602",
    telefone: "",
    telefones: [],
    cns: "708601110657190",
    sexo: "Masculino"
  },
  {
    nome: "CAMILA FARIA MACIEL",
    cpf: "081.107.136-70",
    dataNascimento: "1988-02-03",
    mae: "SELMA FARIA MACIEL",
    endereco: "Clarisse Lispector, 104, SAO PEDRO, Esmeraldas - MG Brasil CEP: 32809-352",
    telefone: "(31) 99152-8151 - CELULAR",
    telefones: ["(31) 3522-5939", "(31) 99152-8151", "(31) 98974-9096"],
    cns: "708605542659084",
    sexo: "Feminino"
  },
  {
    nome: "CLAUDIA DUARTE DOS SANTOS",
    cpf: "089.513.126-90",
    dataNascimento: "1986-07-30",
    mae: "MARIA DOS ANJOS GOMES DUARTE",
    endereco: "SAO SILVESTRE, 653, PRESIDENTE KENNEDY, Betim - MG Brasil CEP: 32665-606",
    telefone: "(31) 99277-6454 - CELULAR",
    telefones: ["(31) 99277-6454"],
    cns: "704103192232478",
    sexo: "Feminino"
  },
  {
    nome: "EDUARDO LEANDRO GONCALVES",
    cpf: "037.071.666-35",
    dataNascimento: "1979-08-18",
    mae: "DASDORES DE FATIMA LEANDRO SILVA",
    endereco: "MANOEL CAMPOLINA VIANA DE SA, 419, SAO JOSE, CASA Esmeraldas - MG Brasil CEP: 32800-730",
    telefone: "(31) 99939-8417 - CELULAR DO PACIENTE",
    telefones: ["(31) 99695-4889", "(31) 99939-8417", "(31) 97513-2437"],
    cns: "702002849478289",
    sexo: "Masculino"
  },
  {
    nome: "ELIANE APARECIDA FERREIRA",
    cpf: "034.667.426-33",
    dataNascimento: "1972-05-26",
    mae: "MARIA PERPETUO SOCORRO LEOCADIO",
    endereco: "Angola, 576, Bom Retiro, Betim - MG Brasil CEP: 32606-150",
    telefone: "(31) 98370-6219 - CELULAR",
    telefones: ["(31) 98370-6219"],
    cns: "708009365026725",
    sexo: "Feminino"
  },
  {
    nome: "ELIANE ARAUJO DA SILVA BENTO",
    cpf: "036.279.226-70",
    dataNascimento: "1977-11-09",
    mae: "NOEMIA ARAUJO TOMAZ",
    endereco: "Dois, 185, Parque das Acacias, Betim - MG Brasil CEP: 32675-752",
    telefone: "(31) 98519-7379 - CELULAR",
    telefones: ["(31) 98519-7379", "(31) 98416-7835"],
    cns: "706703714730920",
    sexo: "Feminino"
  },
  {
    nome: "ELIAS VIEIRA DA SILVA",
    cpf: "667.722.306-04",
    dataNascimento: "1967-08-19",
    mae: "IZETE FELIZ GOMES VIEIRA",
    endereco: "ANTONIO BATISTA DUARTE, 272, CIDADE NOVA II , Juatuba - MG Brasil CEP: 35675-000",
    telefone: "(31) 97352-9325 - CELULAR",
    telefones: ["(31) 97352-9325", "(31) 98297-5468", "(31) 99299-7297"],
    cns: "704807008422741",
    sexo: "Masculino"
  },
  {
    nome: "ELIENE FREITAS ALMEIDA DE SOUSA",
    cpf: "127.506.776-02",
    dataNascimento: "1991-10-10",
    mae: "EVANILDA PIRES DE OLIVEIRA",
    endereco: "CALDAS, 41, VILA CRISTINA, CX 2 Betim - MG Brasil CEP: 32675-440",
    telefone: "(31) 99509-4149 - CELULAR DA PACIENTE",
    telefones: ["(31) 99509-4149", "(31) 99849-2418", "(31) 97248-4207"],
    cns: "706501360943195",
    sexo: "Feminino"
  },
  {
    nome: "EXPEDITO BASTOS",
    cpf: "522.385.986-34",
    dataNascimento: "1947-05-11",
    mae: "CARMELITA CANDIDA DE JESUS",
    endereco: "Geraldo Campos, 42, Bandeirinhas, Betim - MG Brasil CEP: 32657-180",
    telefone: "(31) 99624-1655 - CELULAR",
    telefones: ["(31) 99624-1655"],
    cns: "707303011360870",
    sexo: "Masculino"
  },
  {
    nome: "GABRIELY PEREIRA DIAS",
    cpf: "021.411.266-73",
    dataNascimento: "1999-02-19",
    mae: "RUTH EMARILENE DIAS SILVA",
    endereco: "Castro Alves, 104, JARDIM TERESOPOLIS, Betim - MG Brasil CEP: 32681-700",
    telefone: "(31) 99258-0068 - CELULAR paciente",
    telefones: ["(31) 3591-7963", "(31) 99258-0068"],
    cns: "702405082185125",
    sexo: "Feminino"
  },
  {
    nome: "GERALDO LUIZ DA SILVA",
    cpf: "520.288.956-91",
    dataNascimento: "1952-05-21",
    mae: "DINORA AUXILIADORA DA SILVA",
    endereco: "Presidente Artur Bernardes, 203, CENTRO, Esmeraldas - MG Brasil CEP: 32800-150",
    telefone: "(31) 97226-2718 - CELULAR",
    telefones: ["(31) 97226-2718"],
    cns: "700509374509156",
    sexo: "Masculino"
  },
  {
    nome: "IZENILCE BATISTA BORGES",
    cpf: "761.770.256-68",
    dataNascimento: "1963-12-05",
    mae: "MINERVINA BATISTA BORGES",
    endereco: "Tião Medonho, 91, PARQUE, Betim - MG Brasil CEP: 32671-418",
    telefone: "(31) 97320-5881 - CELULAR ESPOSO",
    telefones: ["(31) 97320-5881", "(31) 99602-1172"],
    cns: "700603935642570",
    sexo: "Feminino"
  },
  {
    nome: "JEOZADAQUE JUNIO PEREIRA DIAS",
    cpf: "114.313.716-70",
    dataNascimento: "1993-09-02",
    mae: "ELZA HONORIA PEREIRA",
    endereco: "JULIO CESAR DE FREITAS, 612, BOM RETIRO , Betim - MG Brasil CEP: 32606-184",
    telefone: "(31) 97256-8101 - CELULAR",
    telefones: ["(31) 97256-8101"],
    cns: "700500966283457",
    sexo: "Masculino"
  },
  {
    nome: "JESIO DE JESUS RIBEIRO",
    cpf: "099.417.526-48",
    dataNascimento: "1989-08-30",
    mae: "VALDETE DE JESUS MENDES RIBEIRO",
    endereco: "Rio Madeira , 1959, Guanabara, Betim - MG Brasil CEP: 32667-025",
    telefone: "(31) 98990-9028 - RESIDENCIAL",
    telefones: ["(31) 98990-9028"],
    cns: "704808547086641",
    sexo: "Masculino"
  },
  {
    nome: "JESUS DOS SANTOS DE PAULO",
    cpf: "664.505.946-91",
    dataNascimento: "1966-01-13",
    mae: "ELZA MARIA DE PAULO",
    endereco: "Barcarena, 215, JARDIM DAS , Betim - MG Brasil CEP: 32670-658",
    telefone: "(31) 99182-1660 - RESIDENCIAL",
    telefones: ["(31) 99182-1660"],
    cns: "708400774148663",
    sexo: "Masculino"
  },
  {
    nome: "JORGE SALVIANO FILHO",
    cpf: "953.158.886-49",
    dataNascimento: "1969-08-01",
    mae: "MARIA ANTONIA DE ALMEIDA",
    endereco: "Antônio Quirino da Silva 750 até 99999, 1070, Ingá, Betim - MG Brasil CEP: 32604-570",
    telefone: "(31) 3532-5395 - RESIDENCIAL",
    telefones: ["(31) 3532-5395"],
    cns: "702404544228627",
    sexo: "Masculino"
  },
  {
    nome: "MARLON FELICIO DOS SANTOS",
    cpf: "103.837.536-35",
    dataNascimento: "1991-12-16",
    mae: "ELIETE MARIA FELICIO DOS SANTOS",
    endereco: "Padre Airton Freire de Lima, 596, GUANABARA, Betim - MG Brasil CEP: 32667-190",
    telefone: "(31) 99467-2314 - CELULAR PACIENTE",
    telefones: ["(31) 99467-2314"],
    cns: "708109543832233",
    sexo: "Masculino"
  },
  {
    nome: "ODETE DIAS",
    cpf: "026.689.016-42",
    dataNascimento: "1952-08-28",
    mae: "MARIA AUREA FERNANDES DOS SANTOS",
    endereco: "Baturité, 41, JARDIM TERESOPOLIS, AP 302 BL 12 Betim - MG Brasil CEP: 32681-414",
    telefone: "",
    telefones: [],
    cns: "700005364224400",
    sexo: "Feminino"
  },
  {
    nome: "OLGA MARIA ALMEIDA FIGUEIREDO",
    cpf: "907.710.366-04",
    dataNascimento: "1965-01-22",
    mae: "CECILIA DOS ANJOS FREITAS",
    endereco: "NOSSA SENHORA DO ROSARIO, 373, AZURITA, CS A Mateus Leme - MG Brasil CEP: 35670-000",
    telefone: "(31) 99842-6351 - CELULAR olga paciente",
    telefones: ["(31) 99842-6351"],
    cns: "702007391138488",
    sexo: "Feminino"
  },
  {
    nome: "PAULO SILVINO AMBROZIO",
    cpf: "710.501.916-68",
    dataNascimento: "1967-09-28",
    mae: "IVOLINA DE JESUS",
    endereco: "Leozino de Oliveira 1/449, 187, FILADELFIA, 1/499 Betim - MG Brasil CEP: 32670-154",
    telefone: "",
    telefones: [],
    cns: "707009815806833",
    sexo: "Masculino"
  },
  {
    nome: "REGINA PATRICIA SOUZA NASCIMENTO",
    cpf: "062.113.076-16",
    dataNascimento: "1982-10-08",
    mae: "CLEMILDES DE SOUZA NASCIMENTO",
    endereco: "TAPAJOS, 4390, AMARANTE, Betim - MG Brasil CEP: 32676-040",
    telefone: "(31) 97147-8193 - CELULAR REGINA(PACIENTE)",
    telefones: ["(31) 9965-2399", "(31) 99334-1856", "(31) 97147-8193"],
    cns: "700805975574088",
    sexo: "Feminino"
  },
  {
    nome: "SILMA FERREIRA DE SOUZA",
    cpf: "092.356.486-10",
    dataNascimento: "1967-06-02",
    mae: "MARIA DOS ANJOS LEITE DE OLIVEIRA",
    endereco: "ONZE, 18, TIJUCO, Esmeraldas - MG Brasil CEP: 32816-282",
    telefone: "(31) 97326-8203 - CELULAR PACIENTE",
    telefones: ["(31) 97326-8203"],
    cns: "700005774870000",
    sexo: "Feminino"
  },
  {
    nome: "SOLANGE RODRIGUES CALDEIRA DE SA",
    cpf: "080.919.686-71",
    dataNascimento: "1979-12-09",
    mae: "TEREZA MARIA DE JESUS RODRIGUES",
    endereco: "São Marcos, 82, BANDEIRINHAS, Betim - MG Brasil CEP: 32657-454",
    telefone: "(31) 99652-2282 - CELULAR",
    telefones: ["(31) 99652-2282"],
    cns: "700506901318960",
    sexo: "Feminino"
  },
  {
    nome: "SONIA MARIA MOREIRA",
    cpf: "502.441.836-00",
    dataNascimento: "1963-08-08",
    mae: "MARIA TEREZINHA MOREIRA",
    endereco: "NOSSO SENHOR BONFIM, 662, CENTRO, Piedade Dos Gerais - MG Brasil CEP: 35476-000",
    telefone: "(31) 98386-6020 - CELULAR",
    telefones: ["(31) 98386-6020"],
    cns: "702205134502810",
    sexo: "Feminino"
  },
  {
    nome: "VALERIA PEREIRA DA SILVA",
    cpf: "051.810.456-77",
    dataNascimento: "1980-09-29",
    mae: "MARIA DE LOURDES PEREIRA",
    endereco: "SEIS, 132, NOVA CEASA, Esmeraldas - MG Brasil CEP: 32811-400",
    telefone: "(31) 99630-0525 - CELULAR TELEFONE DE GILBERTO",
    telefones: ["(31) 99630-0525", "(31) 99910-3746"],
    cns: "705805450997130",
    sexo: "Feminino"
  },
  {
    nome: "VILMA SOARES DE MEDEIROS",
    cpf: "385.012.366-91",
    dataNascimento: "1953-11-27",
    mae: "CAROLINA DE MEDEIROS",
    endereco: "ODETE PINHEIRO SILVA, 73, CIDADE CLUBE RESIDENCIA, Igarape - MG Brasil CEP: 32515-182",
    telefone: "(31) 99715-7769 - RESIDENCIAL",
    telefones: ["(31) 99715-7769"],
    cns: "703407241258318",
    sexo: "Feminino"
  }
];

// 7 Pacientes extras que constam exclusivamente no PDF 2 (Mapa Exames)
export const PACIENTES_EXTRAS_ARQUIVO_2 = [
  {
    nome: "AURIZELIA MARIA MARTINS COSTA",
    sexo: "Feminino"
  },
  {
    nome: "DIOCEZIO SOUZA DE MORAIS",
    sexo: "Masculino"
  },
  {
    nome: "EDSON RODRIGUES",
    sexo: "Masculino"
  },
  {
    nome: "NELSON PEREIRA",
    sexo: "Masculino"
  },
  {
    nome: "PAULO DA CRUZ MOUTINHO",
    sexo: "Masculino"
  },
  {
    nome: "RONALDO SILVA RODRIGUES AZEVEDO",
    sexo: "Masculino"
  },
  {
    nome: "WAGNER MOREIRA DE OLIVEIRA",
    sexo: "Masculino"
  }
];

import { EXAMES_POR_PACIENTE } from './data_mapa_exames_betim.js';

export async function runImport() {
  console.log("Iniciando importação de pacientes e exames para Dra. Maria Tereza...");

  // 1. Preparar lista unificada dos 37 pacientes
  const listaUnificada = [];

  for (const p of PACIENTES_ARQUIVO_1) {
    const idadeCalculada = calculateAge(p.dataNascimento);
    listaUnificada.push({
      ...p,
      idade: idadeCalculada,
      sexo: p.sexo === 'Feminino' || p.sexo === 'F' ? 'F' : 'M',
      origem: 'PDF 1 + PDF 2 (Dados Cadastrais Completos + Histórico de Exames)'
    });
  }

  for (const p of PACIENTES_EXTRAS_ARQUIVO_2) {
    listaUnificada.push({
      nome: p.nome,
      cpf: '',
      dataNascimento: null,
      idade: null,
      mae: '',
      endereco: '',
      telefone: '',
      telefones: [],
      cns: '',
      sexo: p.sexo === 'Feminino' || p.sexo === 'F' ? 'F' : 'M',
      origem: 'PDF 2 Exclusivo (Histórico Laboratorial Completo / Sem Demografia Prévia)'
    });
  }

  console.log(`Total de pacientes para importar: ${listaUnificada.length}`);

  const batch = writeBatch(db);
  let totalExamesCount = 0;
  const now = new Date().toISOString();

  for (const p of listaUnificada) {
    const id = generatePatientId(p.nome);
    const examesBrutos = EXAMES_POR_PACIENTE[p.nome] || [];
    totalExamesCount += examesBrutos.length;

    // Ordenar histórico do mais recente ao mais antigo
    const historicoExames = [...examesBrutos].sort((a, b) => new Date(b.dataExame) - new Date(a.dataExame));

    // Consolidar valores laboratoriais mais recentes
    const consolidados = {};
    const datas = {};

    for (const item of historicoExames) {
      for (const [k, v] of Object.entries(item)) {
        if (['id', 'dataExame', 'registradoEm'].includes(k)) continue;
        if (consolidados[k] === undefined && v !== null && v !== undefined && v !== '' && v !== '-') {
          consolidados[k] = v;
          if (item.dataExame) datas[k] = item.dataExame;
        }
      }
    }

    if (consolidados.fa && !consolidados.fosfAlcalina) consolidados.fosfAlcalina = consolidados.fa;
    if (consolidados.fosfAlcalina && !consolidados.fa) consolidados.fa = consolidados.fosfAlcalina;

    const patientDoc = {
      id,
      doctorId: DOCTOR_ID,
      activeTenantId: DOCTOR_ID,
      nome: p.nome,
      cpf: p.cpf || '',
      cns: p.cns || '',
      dataNascimento: p.dataNascimento || null,
      idade: p.idade || null,
      sexo: p.sexo,
      mae: p.mae || '',
      endereco: p.endereco || '',
      telefone: p.telefone || '',
      telefones: p.telefones || [],
      clinica: CLINICA_NOME,
      hospital: HOSPITAL_NOME,
      convenio: 'SUS',
      modalidade: 'HD',
      turno: '1º Turno',
      diaSemana: 'Seg/Qua/Sex',
      status: 'Ativo',
      statusTransplante: 'Não Avaliado',
      etiologiaDRC: 'Doença renal em estágio final',
      tipoAcesso: 'FAV',
      dataCriacaoAcesso: null,
      posicaoAcesso: 'MSE',
      pesoSeco: 65,
      altura: 165,
      alergias: [],
      medicamentos: [],
      anticoagulacao: {
        tipo: 'heparina_padrao',
        doseAtaque: 1000,
        doseManutencao: 500,
        observacoes: 'Heparinização padrão.'
      },
      acessoVascular: {
        tipo: 'FAV',
        ladoMembro: 'MSE',
        fluxoSangue: 350,
        fluxoDialisato: 500,
        agulha: '16G'
      },
      observacoesClinicas: `Paciente cadastrado via importação de prontuário Dialsist / Dialize Betim. ${p.origem}`,
      exames: consolidados,
      examesDatas: datas,
      historicoExames,
      criadoEm: now,
      atualizadoEm: now
    };

    const docRef = doc(db, 'patients', id);
    batch.set(docRef, patientDoc, { merge: true });
    console.log(`+ Paciente preparado: ${p.nome} (${historicoExames.length} exames) -> ID: ${id}`);
  }

  // Atualizar cadastro do médico (Dra. Maria Tereza)
  const doctorRef = doc(db, 'doctors', DOCTOR_ID);
  const doctorSnap = await getDoc(doctorRef);
  if (doctorSnap.exists()) {
    const dData = doctorSnap.data();
    const locais = Array.isArray(dData.locaisAtuacao) ? [...dData.locaisAtuacao] : [];
    let idx = locais.findIndex(l => (l.nome || '').toUpperCase().includes('DIALIZE'));
    if (idx >= 0) {
      locais[idx] = {
        ...locais[idx],
        pacientesCount: listaUnificada.length,
        hospitalVinculo: HOSPITAL_NOME,
        atualizadoEm: now
      };
    } else {
      locais.push({
        id: 'loc-betim-01',
        nome: CLINICA_NOME,
        tipo: 'Clínica de Hemodiálise',
        status: 'Ativo',
        cidade: 'Betim/MG',
        hospitalVinculo: HOSPITAL_NOME,
        turnos: '1º, 2º e 3º Turnos',
        diasSemana: 'Seg/Qua/Sex',
        pacientesCount: listaUnificada.length,
        rtNome: 'Dra. Maria Tereza',
        criadoEm: now
      });
    }

    batch.update(doctorRef, {
      pacientesCount: listaUnificada.length,
      hospitalVinculo: HOSPITAL_NOME,
      locaisAtuacao: locais,
      atualizadoEm: now
    });
  }

  // Registrar trilha de auditoria
  const auditId = `audit-${Date.now()}-import-betim`;
  const auditRef = doc(db, 'audit_logs', auditId);
  batch.set(auditRef, {
    id: auditId,
    timestamp: now,
    tipoAcao: 'PATIENTS_IMPORTED',
    descricao: `Importação completa de ${listaUnificada.length} pacientes e ${totalExamesCount} exames do Dialsist / Dialize Betim para Dra. Maria Tereza`,
    adminEmail: 'mariaterezaalvesfranca@gmail.com',
    targetDoctorId: DOCTOR_ID,
    targetDoctorName: 'Dra. Maria Tereza',
    detalhes: {
      totalPacientes: listaUnificada.length,
      totalExames: totalExamesCount,
      pacientesArquivo1: PACIENTES_ARQUIVO_1.length,
      pacientesExtrasArquivo2: PACIENTES_EXTRAS_ARQUIVO_2.length
    }
  });

  console.log("\nEnviando commit batch para o Cloud Firestore...");
  await batch.commit();
  console.log(`✅ Sucesso! ${listaUnificada.length} pacientes e ${totalExamesCount} exames gravados no Cloud Firestore.`);
}

runImport().catch(err => {
  console.error("❌ Erro durante a importação:", err);
  process.exit(1);
});

