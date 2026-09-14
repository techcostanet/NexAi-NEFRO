import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// 60 Nomes civis brasileiros autênticos e respeitosos
const CLINICA_1_NAMES = [
  { nome: "Carlos Eduardo da Silva", sexo: "M", idade: 64, nasc: "1962-03-14", status: "Ativo" },
  { nome: "Maria de Fátima Oliveira", sexo: "F", idade: 59, nasc: "1967-08-22", status: "Ativo" },
  { nome: "Sebastião Ferreira Lima", sexo: "M", idade: 71, nasc: "1955-01-18", status: "Ativo" },
  { nome: "Francisca Alves Santos", sexo: "F", idade: 68, nasc: "1958-05-30", status: "Ativo" },
  { nome: "Antônio Carlos Pereira", sexo: "M", idade: 62, nasc: "1964-11-12", status: "Ativo" },
  { nome: "Neuza Maria de Souza", sexo: "F", idade: 73, nasc: "1953-09-05", status: "Ativo" },
  { nome: "José Ribamar Gonçalves", sexo: "M", idade: 67, nasc: "1959-04-19", status: "Ativo" },
  { nome: "Terezinha de Jesus Costa", sexo: "F", idade: 65, nasc: "1961-07-27", status: "Ativo" },
  { nome: "Raimundo Nonato Barbosa", sexo: "M", idade: 70, nasc: "1956-12-03", status: "Ativo" },
  { nome: "Benedita Soares Mendes", sexo: "F", idade: 76, nasc: "1950-02-14", status: "Ativo" },
  { nome: "Geraldo Magela Martins", sexo: "M", idade: 58, nasc: "1968-06-21", status: "Ativo" },
  { nome: "Marlene Aparecida Dias", sexo: "F", idade: 63, nasc: "1963-10-09", status: "Ativo" },
  { nome: "Paulo Roberto Carvalho", sexo: "M", idade: 61, nasc: "1965-03-25", status: "Ativo" },
  { nome: "Joana D'Arc Rodrigues", sexo: "F", idade: 56, nasc: "1970-11-17", status: "Em Tratamento" },
  { nome: "Manoel Francisco Ramos", sexo: "M", idade: 74, nasc: "1952-04-08", status: "Ativo" },
  { nome: "Ivone Gomes de Freitas", sexo: "F", idade: 69, nasc: "1957-08-11", status: "Ativo" },
  { nome: "Valdemar Lopes Cardoso", sexo: "M", idade: 66, nasc: "1960-01-29", status: "Ativo" },
  { nome: "Zilda da Conceição Pinto", sexo: "F", idade: 72, nasc: "1954-07-04", status: "Ativo" },
  { nome: "Darcy Silveira Santos", sexo: "M", idade: 65, nasc: "1961-09-18", status: "Transplantado" },
  { nome: "Cláudio Henrique Nogueira", sexo: "M", idade: 53, nasc: "1973-12-28", status: "Ativo" }
];

const CLINICA_2_NAMES = [
  { nome: "Helena Maria Guimarães", sexo: "F", idade: 66, nasc: "1960-04-12", status: "Ativo" },
  { nome: "Severino dos Ramos Nascimento", sexo: "M", idade: 72, nasc: "1954-06-23", status: "Ativo" },
  { nome: "Dirce Aparecida Ferreira", sexo: "F", idade: 61, nasc: "1965-02-17", status: "Ativo" },
  { nome: "Vicente de Paula Rocha", sexo: "M", idade: 69, nasc: "1957-10-31", status: "Ativo" },
  { nome: "Otávio Augusto Alencar", sexo: "M", idade: 57, nasc: "1969-05-15", status: "Ativo" },
  { nome: "Creuza da Rocha Viana", sexo: "F", idade: 75, nasc: "1951-08-07", status: "Ativo" },
  { nome: "Luiz Gonzaga Teixeira", sexo: "M", idade: 68, nasc: "1958-11-20", status: "Ativo" },
  { nome: "Maria José Fagundes", sexo: "F", idade: 63, nasc: "1963-01-14", status: "Ativo" },
  { nome: "Milton Cezar Brandão", sexo: "M", idade: 60, nasc: "1966-07-19", status: "Ativo" },
  { nome: "Aparecida Bento da Silva", sexo: "F", idade: 70, nasc: "1956-03-08", status: "Ativo" },
  { nome: "Adailton Jorge de Souza", sexo: "M", idade: 65, nasc: "1961-12-16", status: "Ativo" },
  { nome: "Sueli Regina Fernandes", sexo: "F", idade: 58, nasc: "1968-09-24", status: "Ativo" },
  { nome: "Walter Prado dos Santos", sexo: "M", idade: 71, nasc: "1955-04-02", status: "Ativo" },
  { nome: "Eunice Xavier de Castro", sexo: "F", idade: 67, nasc: "1959-06-11", status: "Em Tratamento" },
  { nome: "Joeliton Ribeiro Lima", sexo: "M", idade: 54, nasc: "1972-02-28", status: "Ativo" },
  { nome: "Sebastiana Camargo Prado", sexo: "F", idade: 78, nasc: "1948-10-05", status: "Ativo" },
  { nome: "Nelson Peixoto de Abreu", sexo: "M", idade: 64, nasc: "1962-08-14", status: "Ativo" },
  { nome: "Irene Antunes Macedo", sexo: "F", idade: 62, nasc: "1964-05-19", status: "Ativo" },
  { nome: "Rubens de Albuquerque", sexo: "M", idade: 69, nasc: "1957-01-22", status: "Transplantado" },
  { nome: "Dinorá Correia Lima", sexo: "F", idade: 59, nasc: "1967-11-30", status: "Ativo" }
];

const CLINICA_3_NAMES = [
  { nome: "Fernando José de Miranda", sexo: "M", idade: 63, nasc: "1963-05-18", status: "Ativo" },
  { nome: "Conceição de Oliveira Prado", sexo: "F", idade: 71, nasc: "1955-09-26", status: "Ativo" },
  { nome: "Moacir Donizete Bastos", sexo: "M", idade: 67, nasc: "1959-03-11", status: "Ativo" },
  { nome: "Maria Madalena dos Anjos", sexo: "F", idade: 65, nasc: "1961-08-04", status: "Ativo" },
  { nome: "Gilberto Arruda Tavares", sexo: "M", idade: 58, nasc: "1968-02-14", status: "Ativo" },
  { nome: "Celina Pires de Camargo", sexo: "F", idade: 74, nasc: "1952-11-09", status: "Ativo" },
  { nome: "Wilson Tadeu Rezende", sexo: "M", idade: 66, nasc: "1960-07-21", status: "Ativo" },
  { nome: "Dulce Helena Pacheco", sexo: "F", idade: 60, nasc: "1966-04-15", status: "Ativo" },
  { nome: "Arnaldo Vieira de Mello", sexo: "M", idade: 70, nasc: "1956-10-02", status: "Ativo" },
  { nome: "Carmem Lúcia Figueiredo", sexo: "F", idade: 62, nasc: "1964-01-28", status: "Ativo" },
  { nome: "Osvaldo Mendes Barreto", sexo: "M", idade: 68, nasc: "1958-06-17", status: "Ativo" },
  { nome: "Hilda Fontes Pinheiro", sexo: "F", idade: 76, nasc: "1950-12-08", status: "Ativo" },
  { nome: "Anésio Gomes da Silva", sexo: "M", idade: 61, nasc: "1965-08-30", status: "Ativo" },
  { nome: "Maria Auxiliadora Bueno", sexo: "F", idade: 69, nasc: "1957-03-22", status: "Ativo" },
  { nome: "Décio Silveira Bueno", sexo: "M", idade: 73, nasc: "1953-05-09", status: "Ativo" },
  { nome: "Jandira Antunes Lemos", sexo: "F", idade: 64, nasc: "1962-11-04", status: "Em Tratamento" },
  { nome: "Juvenal Bento Rodrigues", sexo: "M", idade: 75, nasc: "1951-09-12", status: "Ativo" },
  { nome: "Sônia Maria da Silveira", sexo: "F", idade: 58, nasc: "1968-04-03", status: "Ativo" },
  { nome: "Edgar Queiroz Brandão", sexo: "M", idade: 67, nasc: "1959-12-19", status: "Ativo" },
  { nome: "Maria do Carmo Paes", sexo: "F", idade: 79, nasc: "1947-07-16", status: "Óbito" }
];

const ETIOLOGIAS = [
  "Diabetes Mellitus / Nefropatia Diabética",
  "Hipertensão Arterial Sistêmica (HAS)",
  "Glomerulonefrite Crônica (GNC)",
  "Doença Renal Policística Autossômica Dominante (DRPAD)",
  "Nefropatia Lúpica / Doenças Autoimunes",
  "Uropatia Obstrutiva / Litíase Renal",
  "Nefrite Túbulo-Intersticial Crônica (NTIC)",
  "Doença Renal Indeterminada / Desconhecida"
];

const HOSPITAIS = [
  "Hospital Santa Casa",
  "Hospital das Clínicas",
  "Hospital São Lucas",
  "Hospital Madre Teresa"
];

const ALERGIAS_POOL = [
  ["Nega alergias conhecidas"],
  ["Dipirona"],
  ["Nega alergias conhecidas"],
  ["Penicilina"],
  ["Nega alergias conhecidas"],
  ["Iodo / Contrastes Iodados"],
  ["AINEs (Anti-inflamatórios)"],
  ["Sulfas"]
];

function generateCPF(seed) {
  const n1 = 300 + (seed % 600);
  const n2 = 100 + ((seed * 7) % 800);
  const n3 = 100 + ((seed * 13) % 800);
  const d = String((seed * 3) % 90 + 10).padStart(2, '0');
  return `${String(n1).padStart(3, '0')}.${String(n2).padStart(3, '0')}.${String(n3).padStart(3, '0')}-${d}`;
}

function generatePhone(seed) {
  const num = 980000000 + (seed * 123456) % 19000000;
  const numStr = String(num);
  return `(11) ${numStr.slice(0, 5)}-${numStr.slice(5)}`;
}

function buildPatient(item, index, clinicName, clinicNum) {
  const idNum = String(index + 1).padStart(2, '0');
  const id = `paciente-demo-${idNum}`;
  const seed = index + 1;

  const etiologia = ETIOLOGIAS[seed % ETIOLOGIAS.length];
  const hospital = HOSPITAIS[seed % HOSPITAIS.length];
  const turno = (seed % 3 === 1) ? "1º Turno" : (seed % 3 === 2) ? "2º Turno" : "3º Turno";
  const diaSemana = (seed % 2 === 0) ? "Seg/Qua/Sex" : "Ter/Qui/Sáb";

  // Acessos: ~70% FAV, ~18% Permcath, ~8% Prótese, ~4% CDL
  let acessoTipo = "FAV";
  let acessoLado = "MSE";
  let agulha = "15G";
  let fluxoQb = 350 + (seed % 6) * 10;

  if (seed % 10 === 4 || seed % 10 === 9) {
    acessoTipo = "Permcath";
    acessoLado = (seed % 2 === 0) ? "Jugular Interna Direita (JID)" : "Jugular Interna Esquerda (JIE)";
    agulha = "14.5 Fr";
    fluxoQb = 300 + (seed % 4) * 10;
  } else if (seed % 10 === 7) {
    acessoTipo = "Prótese";
    acessoLado = "MSE";
    agulha = "16G";
    fluxoQb = 340;
  } else if (seed === 14 || seed === 34) {
    acessoTipo = "CDL";
    acessoLado = "Jugular Interna";
    agulha = "12 Fr";
    fluxoQb = 280;
  } else {
    acessoTipo = "FAV";
    acessoLado = (seed % 3 === 0) ? "MSD" : "MSE";
    agulha = (seed % 2 === 0) ? "15G" : "16G";
  }

  // Perfis laboratoriais ricos e diversificados
  let hb = 11.2 + ((seed % 7) - 3) * 0.3; // 10.3 a 12.1
  let pth = 240 + ((seed * 29) % 320); // 240 a 560
  let fosforo = 4.4 + ((seed * 7) % 18) * 0.1; // 4.4 a 6.1
  let k = 4.7 + ((seed * 3) % 12) * 0.1; // 4.7 a 5.8
  let ktv = 1.38 + ((seed * 5) % 30) * 0.01; // 1.38 a 1.67
  let ferritina = 350 + ((seed * 43) % 400); // 350 a 750
  let ist = 26 + (seed % 14); // 26 a 39
  let albumina = 3.9 + ((seed % 6) * 0.1); // 3.9 a 4.4

  // Injetar alguns casos clínicos reais específicos para demonstrar alertas:
  if (seed === 3 || seed === 25 || seed === 48) {
    // Alerta Anemia
    hb = 9.2;
    ferritina = 180;
    ist = 18;
  }
  if (seed === 8 || seed === 31 || seed === 52) {
    // Alerta Hiperparatireoidismo
    pth = 740;
    fosforo = 6.2;
  }
  if (seed === 12 || seed === 44) {
    // Alerta Hipercalemia
    k = 5.8;
  }
  if (seed === 17 || seed === 38) {
    // Alerta Hipoalbuminemia
    albumina = 3.4;
  }

  const pesoSeco = 55 + ((seed * 17) % 32) + (seed % 2 === 0 ? 0.5 : 0);
  const altura = 155 + ((seed * 11) % 28);
  const alergias = ALERGIAS_POOL[seed % ALERGIAS_POOL.length];

  // Prescrições com mix de contínuas, ciclos temporários normais, expirando e expirados
  const medicamentos = [
    {
      id: `med-${idNum}-1`,
      nome: "Alfaepoetina (EPO)",
      categoria: "Eritropoiese & Anemia",
      dosagem: hb < 10 ? "8.000 UI" : "4.000 UI",
      via: "SC pós-HD",
      frequencia: "3x por semana (pós-HD)",
      tipo: "continuo",
      dataInicio: "2025-01-10",
      dataFim: null,
      observacao: "Meta terapêutica de Hb entre 10 e 12 g/dL",
      ativo: true
    },
    {
      id: `med-${idNum}-2`,
      nome: fosforo > 5.5 ? "Cloridrato de Sevelâmer" : "Carbonato de Cálcio",
      categoria: "Metabolismo Ósseo & Quelantes",
      dosagem: fosforo > 5.5 ? "800 mg" : "500 mg",
      via: "VO às refeições",
      frequencia: "1 comprimido 3x ao dia no início das refeições",
      tipo: "continuo",
      dataInicio: "2025-02-15",
      dataFim: null,
      observacao: "Tomar durante as refeições para quelação ideal de fósforo",
      ativo: true
    },
    {
      id: `med-${idNum}-3`,
      nome: "Complexo B + Vitamina C (Dialyvit)",
      categoria: "Anticoagulação & Outros",
      dosagem: "1 comprimido",
      via: "VO",
      frequencia: "1x ao dia após diálise",
      tipo: "continuo",
      dataInicio: "2025-01-10",
      dataFim: null,
      observacao: "Suplementação vitamínica dialítica",
      ativo: true
    }
  ];

  // Adicionar ciclo temporário de ferro endovenoso ou antibiótico
  if (seed % 3 === 1) {
    // Ciclo ativo com término futuro
    medicamentos.push({
      id: `med-${idNum}-4`,
      nome: "Sacarato de Hidróxido de Ferro (Noripurum IV)",
      categoria: "Eritropoiese & Anemia",
      dosagem: "100 mg",
      via: "IV em bomba durante HD",
      frequencia: "1 ampola 1x por semana pós-HD",
      tipo: "temporario",
      dataInicio: "2026-09-01",
      dataFim: "2026-09-29",
      observacao: "Ciclo de 5 doses para reposição de estoques de ferro",
      ativo: true
    });
  } else if (seed % 3 === 2) {
    // Ciclo que expira nos próximos 3 dias (Dispara alerta amarelo no dashboard!)
    medicamentos.push({
      id: `med-${idNum}-4`,
      nome: "Sacarato de Hidróxido de Ferro (Noripurum IV)",
      categoria: "Eritropoiese & Anemia",
      dosagem: "100 mg",
      via: "IV durante HD",
      frequencia: "1x por semana",
      tipo: "temporario",
      dataInicio: "2026-08-15",
      dataFim: "2026-09-17", // Vence em 3 dias da data atual
      observacao: "Penúltima dose do ciclo de manutenção de ferro",
      ativo: true
    });
  } else {
    // Ciclo expirado recentemente (Dispara alerta vermelho de ciclo encerrado!)
    medicamentos.push({
      id: `med-${idNum}-4`,
      nome: "Sacarato de Hidróxido de Ferro (Noripurum IV)",
      categoria: "Eritropoiese & Anemia",
      dosagem: "100 mg",
      via: "IV durante HD",
      frequencia: "1x por semana",
      tipo: "temporario",
      dataInicio: "2026-08-01",
      dataFim: "2026-09-08", // Expirado há 6 dias
      observacao: "Ciclo concluído. Solicitar nova cinética de ferro no próximo mês.",
      ativo: true
    });
  }

  // Adicionar medicação de Hipertensão ou PTH alto
  if (pth > 600) {
    medicamentos.push({
      id: `med-${idNum}-5`,
      nome: "Calcitriol (Vitamina D Ativa)",
      categoria: "Metabolismo Ósseo & Quelantes",
      dosagem: "1.0 mcg",
      via: "IV pós-HD",
      frequencia: "3x por semana pós-diálise",
      tipo: "continuo",
      dataInicio: "2025-06-01",
      dataFim: null,
      observacao: "Supressão de PTH elevado",
      ativo: true
    });
  } else {
    medicamentos.push({
      id: `med-${idNum}-5`,
      nome: "Besilato de Anlodipino",
      categoria: "Anticoagulação & Outros",
      dosagem: "5 mg",
      via: "VO",
      frequencia: "1x ao dia pela manhã",
      tipo: "continuo",
      dataInicio: "2025-03-10",
      dataFim: null,
      observacao: "Controle pressórico interdialítico",
      ativo: true
    });
  }

  // Algum medicamento suspenso para demonstrar o filtro "Suspensos"
  if (seed % 4 === 0) {
    medicamentos.push({
      id: `med-${idNum}-6`,
      nome: "Losartana Potássica",
      categoria: "Anticoagulação & Outros",
      dosagem: "50 mg",
      via: "VO",
      frequencia: "1 comprimido ao dia",
      tipo: "continuo",
      dataInicio: "2024-10-01",
      dataFim: null,
      observacao: "Suspenso por episódio de hipercalemia e hipotensão pós-HD",
      ativo: false
    });
  }

  // Histórico com 3 a 4 coletas anteriores cronológicas
  const historicoExames = [
    {
      dataExame: "2026-08-10",
      hb: Number(hb.toFixed(1)),
      ht: Number((hb * 3).toFixed(1)),
      ist: ist,
      ferritina: ferritina,
      pth: pth,
      fosforo: Number(fosforo.toFixed(1)),
      ca: 9.1,
      vitD: 36,
      fa: 82,
      k: Number(k.toFixed(1)),
      na: 138,
      hco3: 23,
      ktv: Number(ktv.toFixed(2)),
      ureiaPre: 120,
      ureiaPos: 35,
      creatinina: 9.6,
      albumina: Number(albumina.toFixed(1)),
      pcr: 2.6,
      observacoes: "Paciente estável com boa adesão terapêutica."
    },
    {
      dataExame: "2026-07-08",
      hb: Number((hb - 0.3).toFixed(1)),
      ht: Number(((hb - 0.3) * 3).toFixed(1)),
      ist: ist - 2,
      ferritina: ferritina - 30,
      pth: pth + 15,
      fosforo: Number((fosforo + 0.2).toFixed(1)),
      ca: 9.0,
      vitD: 34,
      fa: 80,
      k: Number((k + 0.1).toFixed(1)),
      na: 139,
      hco3: 22,
      ktv: Number((ktv - 0.03).toFixed(2)),
      ureiaPre: 125,
      ureiaPos: 38,
      creatinina: 9.8,
      albumina: Number((albumina - 0.1).toFixed(1)),
      pcr: 2.9,
      observacoes: "Rotina mensal de controle dialítico."
    },
    {
      dataExame: "2026-06-05",
      hb: Number((hb - 0.6).toFixed(1)),
      ht: Number(((hb - 0.6) * 3).toFixed(1)),
      ist: ist - 4,
      ferritina: ferritina - 60,
      pth: pth + 25,
      fosforo: Number((fosforo - 0.1).toFixed(1)),
      ca: 8.9,
      vitD: 31,
      fa: 84,
      k: Number((k - 0.2).toFixed(1)),
      na: 137,
      hco3: 21,
      ktv: Number((ktv - 0.05).toFixed(2)),
      ureiaPre: 130,
      ureiaPos: 40,
      creatinina: 10.1,
      albumina: Number(albumina.toFixed(1)),
      pcr: 3.2,
      observacoes: "Ajuste de doses de eritropoietina e quelantes."
    }
  ];

  // 2 a 3 Evoluções clínicas médicas assinadas
  const evolucoes = [
    {
      id: `evo-${idNum}-1`,
      dataHora: `2026-09-${String(10 + (seed % 3)).padStart(2, '0')}T09:30:00.000Z`,
      tipoAtendimento: "Hemodiálise",
      paPre: "135/85 mmHg",
      paPos: "125/80 mmHg",
      pesoPre: Number((pesoSeco + 2.2).toFixed(1)),
      ufRetirada: 2200,
      qbEfetivo: fluxoQb,
      intercorrencias: seed % 7 === 0 ? "Câimbras leves em panturrilhas ao término da 3ª hora de HD, aliviadas com massagem local e elevação de membros." : "Nenhuma",
      condutaClinica: `Paciente comparece lúcido e orientado para sessão programada de hemodiálise. Acesso vascular (${acessoTipo} em ${acessoLado}) pérvio, com excelente frêmito sisto-diastólico e sem sinais flogísticos locais. Fluxo de sangue estável em ${fluxoQb} ml/min. Sessão concluída com alcance integral da meta de ultrafiltração. Prescrição medicamentosa mantida. Orientada ingesta hídrica controlada para o período interdialítico.`,
      medicoNome: "Dr. Marcelo Ramos",
      medicoCrm: "654321/SP"
    },
    {
      id: `evo-${idNum}-2`,
      dataHora: `2026-09-02T10:15:00.000Z`,
      tipoAtendimento: "Avaliação Mensal",
      paPre: "140/90 mmHg",
      paPos: "130/80 mmHg",
      pesoPre: Number((pesoSeco + 2.4).toFixed(1)),
      ufRetirada: 2400,
      qbEfetivo: fluxoQb,
      intercorrencias: "Nenhuma",
      condutaClinica: `Avaliação médica mensal de adequação dialítica e vigilância metabólica. Revisão laboratorial completa: Kt/V em ${ktv.toFixed(2)} confirmando excelente dose dialítica. Hemoglobina em ${hb.toFixed(1)} g/dL em resposta favorável à terapia eritropoiética. Perfil mineral-ósseo sob monitoramento com ajustes dietéticos. Paciente bem adaptado à rotina na ${clinicName}.`,
      medicoNome: "Dr. Marcelo Ramos",
      medicoCrm: "654321/SP"
    }
  ];

  return {
    id,
    doctorId: "dr-marcelo",
    nome: item.nome,
    sexo: item.sexo,
    dataNascimento: item.nasc,
    idade: item.idade,
    cpf: generateCPF(seed),
    telefone: generatePhone(seed),
    email: `${item.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ".")}${seed}@gmail.com`,
    endereco: `Av. Paulista, ${1000 + seed * 25} - Bela Vista, São Paulo - SP`,
    contatoEmergencia: {
      nome: item.sexo === 'M' ? `Maria Helena ${item.nome.split(' ').slice(-1)[0]}` : `Carlos Roberto ${item.nome.split(' ').slice(-1)[0]}`,
      telefone: generatePhone(seed + 88),
      parentesco: item.sexo === 'M' ? "Esposa" : "Esposo"
    },
    clinica: clinicName,
    hospital,
    turno,
    diaSemana,
    status: item.status,
    etiologiaDRC: etiologia,
    pesoSeco,
    altura,
    dataInicioDialise: `202${(seed % 4) + 1}-0${(seed % 9) + 1}-15`,
    alergias,
    observacoesClinicas: `Paciente portador de DRC estágio 5D secundária a ${etiologia}. Em acompanhamento regular na ${clinicName} com rotina de 3 sessões semanais de 4 horas.`,
    acessoVascular: {
      tipo: acessoTipo,
      ladoMembro: acessoLado,
      fluxoSangue: fluxoQb,
      fluxoDialisato: 500,
      agulha,
      dataConfeccao: `202${(seed % 3) + 2}-0${(seed % 9) + 1}-10`
    },
    exames: {
      hb: Number(hb.toFixed(1)),
      ht: Number((hb * 3).toFixed(1)),
      ist,
      ferritina,
      pth,
      fosforo: Number(fosforo.toFixed(1)),
      ca: 9.1,
      vitD: 36,
      fa: 82,
      k: Number(k.toFixed(1)),
      na: 138,
      hco3: 23,
      ktv: Number(ktv.toFixed(2)),
      ureiaPre: 120,
      ureiaPos: 35,
      creatinina: 9.6,
      albumina: Number(albumina.toFixed(1)),
      pcr: 2.6,
      glicemia: etiologia.includes('Diabetes') ? 142 : 94,
      hba1c: etiologia.includes('Diabetes') ? 7.2 : 5.4
    },
    medicamentos,
    historicoExames,
    evolucoes
  };
}

function main() {
  console.log("Gerando 60 pacientes de demonstração clínica hiper-realistas...");

  const patients = [];

  // Clínica 1: Clínica Renalis (1-20)
  CLINICA_1_NAMES.forEach((item, idx) => {
    patients.push(buildPatient(item, idx, "Clínica Renalis", 1));
  });

  // Clínica 2: Clínica Nefrovita (21-40)
  CLINICA_2_NAMES.forEach((item, idx) => {
    patients.push(buildPatient(item, idx + 20, "Clínica Nefrovita", 2));
  });

  // Clínica 3: Clínica Hemovida (41-60)
  CLINICA_3_NAMES.forEach((item, idx) => {
    patients.push(buildPatient(item, idx + 40, "Clínica Hemovida", 3));
  });

  console.log(`Total de pacientes gerados: ${patients.length}`);

  const content = `/**
 * Base de Pacientes de Demonstração Completa e Realística para Apresentação
 * Cobre 100% dos recursos clínicos, turnos, acessos vasculares, exames e alertas de medicamentos.
 * 60 Pacientes distribuídos igualmente em 3 Clínicas:
 * - Clínica Renalis (20 pacientes)
 * - Clínica Nefrovita (20 pacientes)
 * - Clínica Hemovida (20 pacientes)
 */

export const DEMO_PATIENTS_DATA = ${JSON.stringify(patients, null, 2)};
`;

  const outputPath = path.join(rootDir, 'src', 'data', 'demoPatients.js');
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`✅ Arquivo gravado com sucesso em: ${outputPath}`);
}

main();
