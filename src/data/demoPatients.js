/**
 * Base de Pacientes de Demonstração Completa e Realística para Apresentação
 * DADOS 100% FICTÍCIOS E SIMULADOS PARA TESTES E DEMONSTRAÇÃO DO SISTEMA
 * Cobre 100% dos recursos clínicos, turnos, acessos vasculares, exames e alertas de medicamentos.
 */

const getTodayOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const DEMO_PATIENTS_DATA = [
  {
    id: "paciente-demo-1",
    nome: "[DEMO] PACIENTE MODELO 01 - ADEQUAÇÃO DIALÍTICA (DADO FICTÍCIO)",
    cpf: "000.111.222-01 (Fictício)",
    telefone: "(11) 90000-0001 (Teste)",
    clinica: "Clínica Nefrológica Virtual Modelo (Demonstração)",
    hospital: "Hospital Escola Simulado NexAi (Demonstração)",
    turno: "1º Turno",
    diaSemana: "Seg/Qua/Sex",
    dataNascimento: "1962-04-18",
    idade: 64,
    sexo: "M",
    status: "Ativo em Lista de Espera",
    statusTransplante: "Ativo em Lista de Espera",
    etiologiaDRC: "Nefropatia Diabética",
    pesoSeco: 68.5,
    altura: 172,
    dataInicioDialise: "2023-01-15",
    alergias: ["Dipirona"],
    contatoEmergencia: {
      nome: "Contato Simulado Alfa (Teste)",
      telefone: "(11) 90000-9991",
      parentesco: "Fictício"
    },
    observacoesClinicas: "DADOS 100% FICTÍCIOS PARA SIMULAÇÃO DO SISTEMA. Paciente modelo para adequação dialítica com Kt/V alvo atingido e FAV braquiocefálica pérvia.",
    historicoPesos: [
      { id: "w-1-1", data: "2026-08-10", peso: 70.2, pesoSeco: 68.5, variacaoKg: 1.7, percentualGanho: 2.48, momento: "Pré-diálise", conduta: "Ultrafiltração programada 1700ml sem intercorrências." },
      { id: "w-1-2", data: "2026-08-08", peso: 69.8, pesoSeco: 68.5, variacaoKg: 1.3, percentualGanho: 1.90, momento: "Pré-diálise", conduta: "Peso pós atingiu peso seco 68.5 kg." },
      { id: "w-1-3", data: "2026-08-05", peso: 70.5, pesoSeco: 68.5, variacaoKg: 2.0, percentualGanho: 2.92, momento: "Pré-diálise", conduta: "UF 2000ml bem tolerada." }
    ],
    hemoculturas: [
      { id: "hc-1-1", dataColeta: "2026-07-15", sitio: "Sangue Periférico", status: "Negativa", patogeno: "Nenhum crescimento bacteriano após 5 dias", antibiograma: "Sem crescimento" }
    ],
    acessoVascular: {
      tipo: "FAV Braquiocefálica",
      ladoMembro: "MSE (Membro Superior Esquerdo)",
      fluxoSangue: 380,
      fluxoDialisato: 500,
      agulha: "15G",
      dataConfeccao: "2023-05-10"
    },
    exames: {
      hb: 11.4,
      ht: 34.5,
      ist: 28,
      ferritina: 420,
      pth: 280,
      fosforo: 4.6,
      ca: 9.1,
      vitD: 38,
      fa: 82,
      k: 4.8,
      na: 138,
      hco3: 23,
      ktv: 1.48,
      ureiaPre: 115,
      ureiaPos: 32,
      creatinina: 9.2,
      albumina: 4.2,
      pcr: 2.8,
      glicemia: 92,
      hba1c: 5.6
    },
    medicamentos: [
      {
        id: "med-demo-1-1",
        nome: "Alfaepoetina (EPO)",
        categoria: "Eritropoiese & Anemia",
        dosagem: "4.000 UI",
        via: "SC pós-HD",
        frequencia: "3x por semana (pós-HD)",
        tipo: "continuo",
        dataInicio: "2025-01-10",
        dataFim: null,
        observacao: "Manutenção de meta de Hb entre 10 e 12 g/dL",
        ativo: true
      },
      {
        id: "med-demo-1-2",
        nome: "Carbonato de Cálcio",
        categoria: "Metabolismo Ósseo & Quelantes",
        dosagem: "500 mg",
        via: "VO (às refeições)",
        frequencia: "1 cp 3x ao dia às refeições",
        tipo: "continuo",
        dataInicio: "2025-02-01",
        dataFim: null,
        observacao: "Tomar no início das refeições para quelação ideal",
        ativo: true
      },
      {
        id: "med-demo-1-3",
        nome: "Complexo B + Vitamina C (Dialyvit / Suplemento Dialítico)",
        categoria: "Anticoagulação & Outros",
        dosagem: "1 comprimido",
        via: "VO",
        frequencia: "1x ao dia após refeição",
        tipo: "continuo",
        dataInicio: "2025-01-10",
        dataFim: null,
        observacao: "Reposição vitamínica pós-diálise",
        ativo: true
      }
    ],
    historicoExames: [
      {
        dataExame: "2026-08-05",
        hb: 11.4,
        ht: 34.5,
        ist: 28,
        ferritina: 420,
        pth: 280,
        fosforo: 4.6,
        ca: 9.1,
        vitD: 38,
        fa: 82,
        k: 4.8,
        na: 138,
        hco3: 23,
        ktv: 1.48,
        albumina: 4.2,
        pcr: 2.8,
        observacoes: "Paciente estável, boa adesão à dieta e sem intercorrências."
      },
      {
        dataExame: "2026-07-02",
        hb: 11.1,
        ht: 33.8,
        ist: 26,
        ferritina: 390,
        pth: 295,
        fosforo: 4.8,
        ca: 9.0,
        vitD: 35,
        fa: 80,
        k: 4.9,
        na: 139,
        hco3: 22,
        ktv: 1.45,
        albumina: 4.1,
        pcr: 2.5,
        observacoes: "Ajuste fino de EPO mantido em 4000 UI."
      }
    ]
  },
  {
    id: "paciente-demo-2",
    nome: "[DEMO] PACIENTE MODELO 02 - PROTOCOLO DE ANEMIA (DADO FICTÍCIO)",
    cpf: "000.222.333-02 (Fictício)",
    telefone: "(11) 90000-0002 (Teste)",
    clinica: "Clínica Nefrológica Virtual Modelo (Demonstração)",
    hospital: "Hospital Escola Simulado NexAi (Demonstração)",
    turno: "2º Turno",
    diaSemana: "Seg/Qua/Sex",
    dataNascimento: "1968-11-23",
    idade: 57,
    sexo: "F",
    status: "Encaminhado / Em Avaliação",
    statusTransplante: "Encaminhado / Em Avaliação",
    etiologiaDRC: "Hipertensão Arterial Sistêmica (HAS)",
    pesoSeco: 62.0,
    altura: 160,
    dataInicioDialise: "2024-02-10",
    alergias: ["Penicilina / Amoxicilina", "Contraste Iodado"],
    contatoEmergencia: {
      nome: "Contato Simulado Beta (Teste)",
      telefone: "(11) 90000-9992",
      parentesco: "Fictício"
    },
    observacoesClinicas: "DADOS 100% FICTÍCIOS PARA SIMULAÇÃO DO SISTEMA. Paciente modelo para vigilância de anemia ferropriva com ciclo de Noripurum.",
    historicoPesos: [
      { id: "w-2-1", data: "2026-08-10", peso: 63.5, pesoSeco: 62.0, variacaoKg: 1.5, percentualGanho: 2.42, momento: "Pré-diálise", conduta: "UF de 1500ml." },
      { id: "w-2-2", data: "2026-08-08", peso: 64.0, pesoSeco: 62.0, variacaoKg: 2.0, percentualGanho: 3.23, momento: "Pré-diálise", conduta: "Orientada restrição hídrica interdialítica." }
    ],
    hemoculturas: [],
    acessoVascular: {
      tipo: "FAV Radiocefálica",
      ladoMembro: "MSD (Membro Superior Direito)",
      fluxoSangue: 320,
      fluxoDialisato: 500,
      agulha: "16G",
      dataConfeccao: "2024-02-15"
    },
    exames: {
      hb: 9.2, // CRÍTICO BAIXO
      ht: 27.8,
      ist: 14, // BAIXO
      ferritina: 110, // BAIXO
      pth: 410,
      fosforo: 5.1,
      ca: 8.9,
      vitD: 26,
      fa: 95,
      k: 5.0,
      na: 139,
      hco3: 22,
      ktv: 1.35,
      creatinina: 7.8,
      albumina: 3.9,
      pcr: 4.5
    },
    medicamentos: [
      {
        id: "med-demo-2-1",
        nome: "Sacarato de Hidróxido Férrico (Noripurum)",
        categoria: "Eritropoiese & Anemia",
        dosagem: "100 mg (1 ampola)",
        via: "EV pós-HD",
        frequencia: "1x por semana (pós-HD)",
        tipo: "temporario",
        dataInicio: getTodayOffset(-25),
        dataFim: getTodayOffset(3), // VENCE EM 3 DIAS!
        observacao: "Ciclo de reposição férrica de 4 semanas para IST < 20%",
        ativo: true
      },
      {
        id: "med-demo-2-2",
        nome: "Alfaepoetina (EPO)",
        categoria: "Eritropoiese & Anemia",
        dosagem: "8.000 UI",
        via: "SC pós-HD",
        frequencia: "3x por semana (pós-HD)",
        tipo: "continuo",
        dataInicio: "2025-03-01",
        dataFim: null,
        observacao: "Dose ajustada para correção da anemia",
        ativo: true
      },
      {
        id: "med-demo-2-3",
        nome: "Losartana Potássica",
        categoria: "Cardiovascular & Anti-hipertensivos",
        dosagem: "50 mg",
        via: "VO",
        frequencia: "1x ao dia pela manhã",
        tipo: "continuo",
        dataInicio: "2024-06-01",
        dataFim: null,
        observacao: "Controle pressórico interdialítico",
        ativo: true
      }
    ],
    historicoExames: [
      {
        dataExame: "2026-08-01",
        hb: 9.2,
        ht: 27.8,
        ist: 14,
        ferritina: 110,
        pth: 410,
        fosforo: 5.1,
        ca: 8.9,
        vitD: 26,
        fa: 95,
        k: 5.0,
        ktv: 1.35,
        albumina: 3.9,
        observacoes: "Anemia ferropriva diagnosticada. Iniciado ciclo de Noripurum 100mg pós-HD."
      }
    ]
  },
  {
    id: "paciente-demo-3",
    nome: "[DEMO] PACIENTE MODELO 03 - HIPERPARATIREOIDISMO DMO (DADO FICTÍCIO)",
    cpf: "000.333.444-03 (Fictício)",
    telefone: "(11) 90000-0003 (Teste)",
    clinica: "Clínica Nefrológica Virtual Modelo (Demonstração)",
    hospital: "Hospital Escola Simulado NexAi (Demonstração)",
    turno: "3º Turno",
    diaSemana: "Ter/Qui/Sáb",
    dataNascimento: "1974-09-05",
    idade: 51,
    sexo: "M",
    status: "Doador Vivo em Investigação",
    statusTransplante: "Doador Vivo em Investigação",
    etiologiaDRC: "Glomerulonefrite Crônica (GNC)",
    pesoSeco: 76.0,
    altura: 178,
    dataInicioDialise: "2022-10-05",
    alergias: ["Sulfa / Sulfametoxazol"],
    contatoEmergencia: {
      nome: "Contato Simulado Gama (Teste)",
      telefone: "(11) 90000-9993",
      parentesco: "Fictício"
    },
    observacoesClinicas: "DADOS 100% FICTÍCIOS PARA SIMULAÇÃO DO SISTEMA. Paciente modelo para controle de DMO-DRC com hiperparatireoidismo severo.",
    historicoPesos: [
      { id: "w-3-1", data: "2026-08-10", peso: 79.8, pesoSeco: 76.0, variacaoKg: 3.8, percentualGanho: 5.00, momento: "Pré-diálise", conduta: "Ganho interdialítico excessivo (>4.5%). Programada UF 3500ml escalonada com perfil sódico." }
    ],
    hemoculturas: [],
    acessoVascular: {
      tipo: "FAV Braquiocefálica",
      ladoMembro: "MSE (Membro Superior Esquerdo)",
      fluxoSangue: 350,
      fluxoDialisato: 500,
      agulha: "16G",
      dataConfeccao: "2022-11-20"
    },
    exames: {
      hb: 10.8,
      ht: 32.0,
      ist: 24,
      ferritina: 350,
      pth: 890, // CRÍTICO ALTO
      fosforo: 6.4, // ALTO
      ca: 9.8,
      vitD: 22,
      fa: 165, // ALTO
      k: 5.2,
      na: 140,
      hco3: 23,
      ktv: 1.42,
      creatinina: 10.5,
      albumina: 4.0,
      pcr: 3.2
    },
    medicamentos: [
      {
        id: "med-demo-3-1",
        nome: "Cloridrato / Carbonato de Sevelâmer",
        categoria: "Metabolismo Ósseo & Quelantes",
        dosagem: "800 mg",
        via: "VO (às refeições)",
        frequencia: "2 cps 3x ao dia (com almoço e jantar)",
        tipo: "continuo",
        dataInicio: "2025-04-10",
        dataFim: null,
        observacao: "Quelante de alta potência para fósforo > 6.0 mg/dL",
        ativo: true
      },
      {
        id: "med-demo-3-2",
        nome: "Paricalcitol (Zemplar)",
        categoria: "Metabolismo Ósseo & Quelantes",
        dosagem: "5 mcg",
        via: "EV pós-HD",
        frequencia: "3x por semana (pós-HD)",
        tipo: "continuo",
        dataInicio: "2025-05-15",
        dataFim: null,
        observacao: "Supressão seletiva de PTH para hiperparatireoidismo severo",
        ativo: true
      },
      {
        id: "med-demo-3-3",
        nome: "Cloridrato de Cinacalcete",
        categoria: "Metabolismo Ósseo & Quelantes",
        dosagem: "30 mg",
        via: "VO (com alimento)",
        frequencia: "1x ao dia (junto à principal refeição)",
        tipo: "continuo",
        dataInicio: "2025-06-01",
        dataFim: null,
        observacao: "Calcimimético para controle adjuvante de PTH elevado",
        ativo: true
      }
    ],
    historicoExames: [
      {
        dataExame: "2026-08-08",
        hb: 10.8,
        ht: 32.0,
        ist: 24,
        ferritina: 350,
        pth: 890,
        fosforo: 6.4,
        ca: 9.8,
        vitD: 22,
        fa: 165,
        k: 5.2,
        ktv: 1.42,
        albumina: 4.0,
        observacoes: "Quadro de DMO-DRC de alto turnover. Intensificada terapia com Paricalcitol e Cinacalcete."
      }
    ]
  },
  {
    id: "paciente-demo-4",
    nome: "[DEMO] PACIENTE MODELO 04 - CATETER PERMCATH & LOCK (DADO FICTÍCIO)",
    cpf: "000.444.555-04 (Fictício)",
    telefone: "(11) 90000-0004 (Teste)",
    clinica: "Clínica Nefrológica Virtual Modelo (Demonstração)",
    hospital: "Hospital Escola Simulado NexAi (Demonstração)",
    turno: "1º Turno",
    diaSemana: "Seg/Qua/Sex",
    dataNascimento: "1955-03-12",
    idade: 71,
    sexo: "F",
    status: "Suspenso / Inativo em Lista",
    statusTransplante: "Suspenso / Inativo em Lista",
    etiologiaDRC: "Doença Renal Policística Autossômica Dominante (DRPAD)",
    pesoSeco: 54.0,
    altura: 155,
    dataInicioDialise: "2025-09-01",
    alergias: ["Vancomicina"],
    contatoEmergencia: {
      nome: "Contato Simulado Delta (Teste)",
      telefone: "(11) 90000-9994",
      parentesco: "Fictício"
    },
    observacoesClinicas: "DADOS 100% FICTÍCIOS PARA SIMULAÇÃO DO SISTEMA. Paciente modelo para vigilância de acesso venoso central tunelizado e lock terapia.",
    historicoPesos: [
      { id: "w-4-1", data: "2026-08-09", peso: 55.4, pesoSeco: 54.0, variacaoKg: 1.4, percentualGanho: 2.59, momento: "Pré-diálise", conduta: "Estável clinicamente." }
    ],
    hemoculturas: [
      { 
        id: "hc-4-1", 
        dataColeta: "2026-08-02", 
        sitio: "Permcath (Lúmen Arterial/Venoso)", 
        status: "Positiva", 
        patogeno: "Staphylococcus aureus (MRSA)", 
        tempoPositividade: "8.5", 
        dtpHours: "2.8", 
        antibiograma: "Sensível: Vancomicina, Daptomicina, Linezolida. Resistente: Oxacilina, Cefazolina.", 
        lockTherapy: "Vancomicina 5mg/mL + Heparina 5000UI/mL instalada pós-HD", 
        conduta: "Permcath mantido sob Lock Terapia rigorosa. Hemocultura de controle em 7 dias." 
      }
    ],
    acessoVascular: {
      tipo: "CDL Permcath Longa Permanência",
      ladoMembro: "VJI Direita (Veia Jugular Interna D)",
      fluxoSangue: 280,
      fluxoDialisato: 500,
      agulha: "Cateter",
      dataConfeccao: "2025-10-04"
    },
    exames: {
      hb: 10.1,
      ht: 30.5,
      ist: 22,
      ferritina: 580,
      pth: 340,
      fosforo: 4.2,
      ca: 8.8,
      vitD: 32,
      fa: 78,
      k: 4.6,
      na: 137,
      hco3: 24,
      ktv: 1.28,
      creatinina: 6.4,
      albumina: 3.4, // HIPOALBUMINEMIA
      pcr: 18.5 // PCR ELEVADO (INFLAMAÇÃO)
    },
    medicamentos: [
      {
        id: "med-demo-4-1",
        nome: "Cefazolina Sódica",
        categoria: "Antimicrobianos (Ciclos)",
        dosagem: "1.5 g",
        via: "EV pós-HD",
        frequencia: "A cada sessão de HD (3x/semana pós-HD)",
        tipo: "temporario",
        dataInicio: getTodayOffset(-16),
        dataFim: getTodayOffset(-2), // CICLO ENCERRADO HÁ 2 DIAS!
        observacao: "Tratamento de infecção de óstio de Permcath. Solicitar hemoculturas de controle.",
        ativo: true
      },
      {
        id: "med-demo-4-2",
        nome: "Heparina Sódica (na diálise)",
        categoria: "Anticoagulação & Outros",
        dosagem: "5.000 UI",
        via: "EV no circuito de diálise",
        frequencia: "Por sessão de HD (bolus inicial e/ou contínuo)",
        tipo: "continuo",
        dataInicio: "2025-10-04",
        dataFim: null,
        observacao: "Anticoagulação para preservação das linhas do dialisador",
        ativo: true
      }
    ],
    historicoExames: [
      {
        dataExame: "2026-08-04",
        hb: 10.1,
        ht: 30.5,
        ist: 22,
        ferritina: 580,
        pth: 340,
        fosforo: 4.2,
        ca: 8.8,
        k: 4.6,
        ktv: 1.28,
        albumina: 3.4,
        pcr: 18.5,
        observacoes: "Paciente em término de ciclo de Cefazolina para infecção de cateter. PCR em queda."
      }
    ]
  },
  {
    id: "paciente-demo-5",
    nome: "[DEMO] PACIENTE MODELO 05 - HIPERCALEMIA CRÍTICA (DADO FICTÍCIO)",
    cpf: "000.555.666-05 (Fictício)",
    telefone: "(11) 90000-0005 (Teste)",
    clinica: "Clínica Nefrológica Virtual Modelo (Demonstração)",
    hospital: "Hospital Escola Simulado NexAi (Demonstração)",
    turno: "2º Turno",
    diaSemana: "Ter/Qui/Sáb",
    dataNascimento: "1958-07-30",
    idade: 68,
    sexo: "M",
    status: "Contraindicado Clínico",
    statusTransplante: "Contraindicado Clínico",
    etiologiaDRC: "Nefroesclerose Hipertensiva",
    pesoSeco: 72.0,
    altura: 174,
    dataInicioDialise: "2023-07-20",
    alergias: [],
    contatoEmergencia: {
      nome: "Contato Simulado Epsilon (Teste)",
      telefone: "(11) 90000-9995",
      parentesco: "Fictício"
    },
    observacoesClinicas: "DADOS 100% FICTÍCIOS PARA SIMULAÇÃO DO SISTEMA. Paciente modelo para alerta de hipercalemia e conduta de resina de troca.",
    historicoPesos: [
      { id: "w-5-1", data: "2026-08-09", peso: 74.2, pesoSeco: 72.0, variacaoKg: 2.2, percentualGanho: 3.05, momento: "Pré-diálise", conduta: "Controle hidroeletrolítico." }
    ],
    hemoculturas: [],
    acessoVascular: {
      tipo: "FAV Radiocefálica",
      ladoMembro: "MSE (Membro Superior Esquerdo)",
      fluxoSangue: 340,
      fluxoDialisato: 500,
      agulha: "16G",
      dataConfeccao: "2023-08-14"
    },
    exames: {
      hb: 11.0,
      ht: 33.0,
      ist: 26,
      ferritina: 390,
      pth: 290,
      fosforo: 4.9,
      ca: 9.0,
      vitD: 35,
      fa: 70,
      k: 6.1, // HIPERCALEMIA CRÍTICA
      na: 136,
      hco3: 19, // ACIDOSE METABÓLICA
      ktv: 1.32,
      ureiaPre: 145,
      ureiaPos: 42,
      creatinina: 8.9,
      albumina: 3.7,
      pcr: 2.1
    },
    medicamentos: [
      {
        id: "med-demo-5-1",
        nome: "Poliestirenossulfonato de Cálcio (Sorcal)",
        categoria: "Controle de Potássio",
        dosagem: "15 g (1 envelope)",
        via: "VO",
        frequencia: "1x a 2x ao dia dissolvido em água",
        tipo: "continuo",
        dataInicio: "2026-08-01",
        dataFim: null,
        observacao: "Resina trocadora para redução de K+ sérico crítico",
        ativo: true
      },
      {
        id: "med-demo-5-2",
        nome: "Besilato de Anlodipino",
        categoria: "Cardiovascular & Anti-hipertensivos",
        dosagem: "5 mg",
        via: "VO",
        frequencia: "1x ao dia à noite",
        tipo: "continuo",
        dataInicio: "2025-01-20",
        dataFim: null,
        observacao: "Controle pressórico",
        ativo: true
      },
      {
        id: "med-demo-5-3",
        nome: "Carvedilol",
        categoria: "Cardiovascular & Anti-hipertensivos",
        dosagem: "12.5 mg",
        via: "VO",
        frequencia: "12/12h com alimentos",
        tipo: "continuo",
        dataInicio: "2025-01-20",
        dataFim: null,
        observacao: "Cardioproteção e anti-hipertensivo",
        ativo: true
      }
    ],
    historicoExames: [
      {
        dataExame: "2026-08-07",
        hb: 11.0,
        ht: 33.0,
        ist: 26,
        ferritina: 390,
        pth: 290,
        fosforo: 4.9,
        ca: 9.0,
        k: 6.1,
        hco3: 19,
        ktv: 1.32,
        albumina: 3.7,
        observacoes: "Hipercalemia crítica e acidose metabólica. Orientada restrição alimentar de frutas e iniciado Sorcal."
      }
    ]
  },
  {
    id: "paciente-demo-6",
    nome: "[DEMO] PACIENTE MODELO 06 - DIÁLISE PERITONEAL APD (DADO FICTÍCIO)",
    cpf: "000.666.777-06 (Fictício)",
    telefone: "(11) 90000-0006 (Teste)",
    clinica: "Clínica Nefrológica Virtual Modelo (Demonstração)",
    hospital: "Hospital Escola Simulado NexAi (Demonstração)",
    turno: "Diálise Peritoneal",
    diaSemana: "Diário",
    dataNascimento: "1965-01-14",
    idade: 61,
    sexo: "F",
    status: "Encaminhar / Em Triagem",
    statusTransplante: "Encaminhar / Em Triagem",
    etiologiaDRC: "Nefropatia Diabética",
    pesoSeco: 59.5,
    altura: 162,
    dataInicioDialise: "2024-04-01",
    alergias: ["AINEs (Anti-inflamatórios)"],
    contatoEmergencia: {
      nome: "Contato Simulado Zeta (Teste)",
      telefone: "(11) 90000-9996",
      parentesco: "Fictício"
    },
    observacoesClinicas: "DADOS 100% FICTÍCIOS PARA SIMULAÇÃO DO SISTEMA. Paciente modelo para seguimento de Diálise Peritoneal Ambulatorial Contínua (DPAC/APD).",
    historicoPesos: [
      { id: "w-6-1", data: "2026-08-10", peso: 59.8, pesoSeco: 59.5, variacaoKg: 0.3, percentualGanho: 0.50, momento: "Pré-diálise", conduta: "Adequada volemia em Diálise Peritoneal." }
    ],
    hemoculturas: [],
    acessoVascular: {
      tipo: "Cateter Tenckhoff Abdominal",
      ladoMembro: "Fossa Ilíaca Esquerda",
      fluxoSangue: null,
      fluxoDialisato: null,
      agulha: "DPAC 4 trocas diárias de 2L",
      dataConfeccao: "2024-04-20"
    },
    exames: {
      hb: 11.6,
      ht: 35.0,
      ist: 31,
      ferritina: 410,
      pth: 220,
      fosforo: 4.4,
      ca: 9.3,
      vitD: 42,
      fa: 65,
      k: 4.2,
      na: 141,
      hco3: 25,
      ktv: 1.85,
      creatinina: 6.1,
      albumina: 4.3,
      pcr: 1.2,
      glicemia: 92,
      hba1c: 5.8
    },
    medicamentos: [
      {
        id: "med-demo-6-1",
        nome: "Alfaepoetina (EPO)",
        categoria: "Eritropoiese & Anemia",
        dosagem: "2.000 UI",
        via: "SC",
        frequencia: "1x por semana",
        tipo: "continuo",
        dataInicio: "2025-06-10",
        dataFim: null,
        observacao: "Manutenção na Diálise Peritoneal",
        ativo: true
      },
      {
        id: "med-demo-6-2",
        nome: "Carbonato de Cálcio",
        categoria: "Metabolismo Ósseo & Quelantes",
        dosagem: "500 mg",
        via: "VO (às refeições)",
        frequencia: "1 cp no almoço e jantar",
        tipo: "continuo",
        dataInicio: "2025-06-10",
        dataFim: null,
        observacao: "Controle de fosfatemia na DP",
        ativo: true
      }
    ],
    historicoExames: [
      {
        dataExame: "2026-08-06",
        hb: 11.6,
        ht: 35.0,
        ist: 31,
        ferritina: 410,
        pth: 220,
        fosforo: 4.4,
        ca: 9.3,
        k: 4.2,
        ktv: 1.85,
        albumina: 4.3,
        pcr: 1.2,
        observacoes: "Excelente adequação peritoneal semanal. Sem sinais de peritonite ou infecção de túnel."
      }
    ]
  }
];
