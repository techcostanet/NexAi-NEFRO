import * as XLSX from 'xlsx';

/**
 * Categorias dos Relatórios Clínicos e Gerenciais
 */
export const REPORT_CATEGORIES = [
  { id: 'populacao', name: 'Censo Populacional', icon: 'Users', color: '#0284c7' },
  { id: 'acesso_dialise', name: 'Acessos Vasculares', icon: 'Activity', color: '#0d9488' },
  { id: 'laboratorio', name: 'Painel Laboratorial', icon: 'FlaskConical', color: '#7c3aed' },
  { id: 'farmacia_infeccao', name: 'Farmacoterapia', icon: 'Pill', color: '#e11d48' },
  { id: 'qualidade_transplante', name: 'Transplante Renal', icon: 'Award', color: '#d97706' }
];

/**
 * Catálogo Completo dos 20 Relatórios Especializados do NexAi-NEFRO
 */
export const REPORTS_CATALOG = [
  // ================= 1. GESTÃO POPULACIONAL & CENSO =================
  {
    id: 'censo_geral',
    title: 'Censo Geral de Pacientes em Hemodiálise',
    category: 'populacao',
    description: 'Relação cadastral completa com status ativo, unidade, turno, escala e tempo de tratamento.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 28 },
      { id: 'cpf', header: 'CPF', width: 16 },
      { id: 'idade', header: 'Idade', width: 10 },
      { id: 'sexo', header: 'Sexo', width: 8 },
      { id: 'clinica', header: 'Clínica', width: 24 },
      { id: 'turno', header: 'Turno', width: 14 },
      { id: 'diaSemana', header: 'Escala Semanal', width: 16 },
      { id: 'tipoAcesso', header: 'Acesso Vascular', width: 20 },
      { id: 'statusTransplante', header: 'Status Transplante', width: 22 },
      { id: 'tempoDialise', header: 'Tempo em HD', width: 16 }
    ]
  },
  {
    id: 'demografia_faixa_etaria',
    title: 'Perfil Demográfico e Faixas Etárias',
    category: 'populacao',
    description: 'Estratificação populacional por idade, sexo, tempo em diálise e dados sociodemográficos.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 28 },
      { id: 'idade', header: 'Idade (anos)', width: 12 },
      { id: 'faixaEtaria', header: 'Faixa Etária', width: 18 },
      { id: 'sexo', header: 'Sexo', width: 10 },
      { id: 'dataNascimento', header: 'Data Nasc.', width: 14 },
      { id: 'telefone', header: 'Telefone', width: 18 },
      { id: 'clinica', header: 'Unidade', width: 24 },
      { id: 'tempoDialiseMeses', header: 'Meses em HD', width: 14 }
    ]
  },
  {
    id: 'escala_turnos',
    title: 'Distribuição de Turnos, Cadeiras e Escalas',
    category: 'populacao',
    description: 'Mapeamento operacional de alocação de pacientes por turno e escala (Seg/Qua/Sex ou Ter/Qui/Sáb).',
    columns: [
      { id: 'clinica', header: 'Clínica', width: 24 },
      { id: 'turno', header: 'Turno', width: 14 },
      { id: 'diaSemana', header: 'Dias da Semana', width: 16 },
      { id: 'nome', header: 'Paciente', width: 28 },
      { id: 'tipoAcesso', header: 'Acesso', width: 20 },
      { id: 'pesoSeco', header: 'Peso Seco (kg)', width: 14 },
      { id: 'fluxoSangue', header: 'Qb Prescrito', width: 14 }
    ]
  },
  {
    id: 'etiologias_drc',
    title: 'Distribuição de Etiologias da DRC',
    category: 'populacao',
    description: 'Incidência de causas primárias de Doença Renal Crônica (DM, HAS, Glomerulopatias, DRPAD, etc.).',
    columns: [
      { id: 'nome', header: 'Paciente', width: 28 },
      { id: 'etiologiaDRC', header: 'Etiologia Primária', width: 28 },
      { id: 'idade', header: 'Idade', width: 10 },
      { id: 'sexo', header: 'Sexo', width: 8 },
      { id: 'tempoDialise', header: 'Tempo em HD', width: 16 },
      { id: 'clinica', header: 'Clínica', width: 24 },
      { id: 'comorbidades', header: 'Comorbidades', width: 26 }
    ]
  },

  // ================= 2. ACESSOS VASCULARES & TERAPIA DIALÍTICA =================
  {
    id: 'acessos_vasculares',
    title: 'Vigilância de Acessos Vasculares (FAV / Cateteres)',
    category: 'acesso_dialise',
    description: 'Monitoramento detalhado de fístulas arteriovenosas, próteses e cateteres centrais de longa permanência.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'tipoAcesso', header: 'Tipo de Acesso', width: 22 },
      { id: 'ladoMembro', header: 'Topografia', width: 20 },
      { id: 'dataConfeccao', header: 'Data Implante/Confecção', width: 18 },
      { id: 'fluxoSangue', header: 'Qb Médio (ml/min)', width: 16 },
      { id: 'agulha', header: 'Calibre Agulha', width: 14 },
      { id: 'alertaAcesso', header: 'Alerta de Risco', width: 20 },
      { id: 'clinica', header: 'Clínica', width: 22 }
    ]
  },
  {
    id: 'prescricoes_hd',
    title: 'Prescrições e Parâmetros Dialíticos Ativos',
    category: 'acesso_dialise',
    description: 'Parâmetros operacionais da hemodiálise: dialisador, fluxos Qb/Qd, heparina e tempo de tratamento.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'capilar', header: 'Dialisador', width: 20 },
      { id: 'fluxoSangue', header: 'Qb (ml/min)', width: 14 },
      { id: 'fluxoDialisato', header: 'Qd (ml/min)', width: 14 },
      { id: 'pesoSeco', header: 'Peso Seco (kg)', width: 14 },
      { id: 'duracaoSessao', header: 'Duração HD', width: 14 },
      { id: 'anticoagulacao', header: 'Anticoagulação', width: 18 },
      { id: 'turno', header: 'Turno', width: 14 }
    ]
  },
  {
    id: 'balanco_volemico',
    title: 'Balanço Volêmico e Ganho Interdialítico (PIDG)',
    category: 'acesso_dialise',
    description: 'Vigilância de hipervolemia e percentual de ganho de peso entre sessões (PIDG > 4.0% e > 5.0%).',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'pesoSeco', header: 'Peso Seco (kg)', width: 14 },
      { id: 'ultimoPeso', header: 'Último Peso Pré (kg)', width: 16 },
      { id: 'variacaoKg', header: 'Ganho (kg)', width: 12 },
      { id: 'percentualGanho', header: '% Ganho (PIDG)', width: 16 },
      { id: 'statusVolemico', header: 'Classificação Volêmica', width: 22 },
      { id: 'dataAfericao', header: 'Data Última Pesagem', width: 16 },
      { id: 'clinica', header: 'Unidade', width: 20 }
    ]
  },
  {
    id: 'intercorrencias_hd',
    title: 'Histórico de Intercorrências em Sessões de Hemodiálise',
    category: 'acesso_dialise',
    description: 'Registro de episódios de hipotensão sintomática, câimbras, calafrios, cefaleia e hipertensão em sessão.',
    columns: [
      { id: 'data', header: 'Data da Sessão', width: 14 },
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'tipoIntercorrencia', header: 'Intercorrência Registrada', width: 26 },
      { id: 'paPrePos', header: 'PA Pré / Pós', width: 16 },
      { id: 'ufRealizada', header: 'UF (ml)', width: 12 },
      { id: 'conduta', header: 'Conduta Médica Adotada', width: 32 },
      { id: 'medico', header: 'Médico Assistente', width: 22 }
    ]
  },

  // ================= 3. PAINEL LABORATORIAL & METAS CLÍNICAS =================
  {
    id: 'alertas_laboratoriais',
    title: 'Painel Geral de Alertas Laboratoriais Críticos',
    category: 'laboratorio',
    description: 'Pacientes com resultados críticos que demandam intervenção imediata (K > 5.5, Hb < 10, P > 5.5, PTH > 600).',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'clinica', header: 'Clínica', width: 20 },
      { id: 'turno', header: 'Turno', width: 12 },
      { id: 'alertasAtivos', header: 'Alertas Críticos Identificados', width: 34 },
      { id: 'k', header: 'K (mEq/L)', width: 12 },
      { id: 'hb', header: 'Hb (g/dL)', width: 12 },
      { id: 'fosforo', header: 'Fósforo (mg/dL)', width: 14 },
      { id: 'pth', header: 'PTH (pg/mL)', width: 14 },
      { id: 'ktv', header: 'Kt/V', width: 10 }
    ]
  },
  {
    id: 'perfil_anemia',
    title: 'Perfil de Anemia e Cinética do Ferro (KDIGO/SBN)',
    category: 'laboratorio',
    description: 'Avaliação da resposta eritropoiética, saturação de transferrina (IST), ferritina e uso de Alfaepoetina/Ferro.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'hb', header: 'Hb (g/dL)', width: 12 },
      { id: 'ht', header: 'Ht (%)', width: 10 },
      { id: 'ferritina', header: 'Ferritina (ng/mL)', width: 16 },
      { id: 'ist', header: 'IST (%)', width: 10 },
      { id: 'metaAnemia', header: 'Status Meta Hb', width: 18 },
      { id: 'reservaFerro', header: 'Estoque de Ferro', width: 20 },
      { id: 'epoEmUso', header: 'Alfaepoetina (EPO)', width: 18 },
      { id: 'ferroEmUso', header: 'Ferro IV (Noripurum)', width: 18 }
    ]
  },
  {
    id: 'metabolismo_osseo',
    title: 'Distúrbio Mineral e Ósseo na DRC (DMO-DRC)',
    category: 'laboratorio',
    description: 'Controle de Cálcio, Fósforo sérico, Produto Ca x P, PTH intacto, Fosfatase Alcalina e 25-OH Vitamina D.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'ca', header: 'Cálcio (mg/dL)', width: 14 },
      { id: 'fosforo', header: 'Fósforo (mg/dL)', width: 14 },
      { id: 'produtoCaP', header: 'Produto Ca x P', width: 14 },
      { id: 'pth', header: 'PTH (pg/mL)', width: 14 },
      { id: 'vitD', header: 'Vit D (ng/mL)', width: 12 },
      { id: 'fa', header: 'Fosfatase Alc.', width: 14 },
      { id: 'statusDMO', header: 'Avaliação DMO', width: 22 },
      { id: 'quelanteEmUso', header: 'Quelante de Fósforo', width: 22 }
    ]
  },
  {
    id: 'adequacao_dialitica',
    title: 'Adequação Dialítica e Depuração (Kt/V e UR%)',
    category: 'laboratorio',
    description: 'Dose de diálise fornecida, Kt/V Daugirdas II (alvo >= 1.20), Ureia Pré/Pós e Taxa de Redução de Ureia.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'ktv', header: 'Kt/V Único', width: 12 },
      { id: 'metaKtv', header: 'Meta Kt/V (≥1.2)', width: 16 },
      { id: 'ureiaPre', header: 'Ureia Pré (mg/dL)', width: 16 },
      { id: 'ureiaPos', header: 'Ureia Pós (mg/dL)', width: 16 },
      { id: 'taxaReducaoUreia', header: 'UR (%)', width: 12 },
      { id: 'creatinina', header: 'Creatinina', width: 12 },
      { id: 'clinica', header: 'Unidade', width: 20 }
    ]
  },
  {
    id: 'nutricao_inflamacao',
    title: 'Estado Nutricional e Marcadores Inflamatórios',
    category: 'laboratorio',
    description: 'Vigilância de desnutrição proteico-energética e inflamação crônica (Albumina, PCR, Peso Seco, IMC).',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'albumina', header: 'Albumina (g/dL)', width: 14 },
      { id: 'pcr', header: 'PCR (mg/L)', width: 12 },
      { id: 'pesoSeco', header: 'Peso Seco (kg)', width: 14 },
      { id: 'imc', header: 'IMC (kg/m²)', width: 12 },
      { id: 'statusNutricional', header: 'Estado Nutricional', width: 20 },
      { id: 'glicemia', header: 'Glicemia (mg/dL)', width: 14 },
      { id: 'hba1c', header: 'HbA1c (%)', width: 12 }
    ]
  },

  // ================= 4. FARMACOTERAPIA, CICLOS & CONTROLE INFECCIOSO =================
  {
    id: 'mapa_medicamentos',
    title: 'Mapa Farmacoterapêutico Geral de Medicamentos',
    category: 'farmacia_infeccao',
    description: 'Relação de todas as medicações em uso ativo por paciente, agrupadas por categoria terapêutica.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'medicamento', header: 'Medicamento', width: 26 },
      { id: 'categoria', header: 'Categoria Farmacológica', width: 22 },
      { id: 'dosagem', header: 'Dosagem Prescrita', width: 18 },
      { id: 'posologia', header: 'Posologia', width: 22 },
      { id: 'via', header: 'Via Adm.', width: 12 },
      { id: 'tipo', header: 'Tipo Ciclo', width: 14 }
    ]
  },
  {
    id: 'ciclos_medicamentos',
    title: 'Vigilância de Ciclos Medicamentosos a Vencer e Vencidos',
    category: 'farmacia_infeccao',
    description: 'Controle de ciclos temporários (antibioticoterapia, reposições de ferro, pulsoterapias) e datas limites.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'medicamento', header: 'Fármaco em Ciclo', width: 24 },
      { id: 'dosagem', header: 'Dose', width: 14 },
      { id: 'dataInicio', header: 'Início Ciclo', width: 14 },
      { id: 'dataFim', header: 'Término Previsto', width: 14 },
      { id: 'diasRestantes', header: 'Prazo Restante', width: 16 },
      { id: 'statusCiclo', header: 'Status Alerta', width: 18 }
    ]
  },
  {
    id: 'antibioticoterapia',
    title: 'Controle de Antimicrobianos em Curso na Hemodiálise',
    category: 'farmacia_infeccao',
    description: 'Relação rigorosa de antibióticos e antifúngicos em uso, dias de tratamento e indicação clínica.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'antibiotico', header: 'Antimicrobiano', width: 24 },
      { id: 'dosagem', header: 'Dose Prescrita', width: 16 },
      { id: 'via', header: 'Via', width: 10 },
      { id: 'dataInicio', header: 'Data Início', width: 14 },
      { id: 'dataFim', header: 'Data Término', width: 14 },
      { id: 'observacao', header: 'Indicação Clínica', width: 28 },
      { id: 'tipoAcesso', header: 'Acesso Atual', width: 18 }
    ]
  },
  {
    id: 'hemoculturas_lock',
    title: 'Hemoculturas e Protocolos de Lock Therapy',
    category: 'farmacia_infeccao',
    description: 'Acompanhamento microbiológico de bacteremias associadas a cateter, patógenos e selos antimicrobianos.',
    columns: [
      { id: 'dataColeta', header: 'Data Coleta', width: 14 },
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'sitio', header: 'Sítio de Coleta', width: 20 },
      { id: 'status', header: 'Resultado Cultura', width: 18 },
      { id: 'patogeno', header: 'Patógeno Isolado', width: 28 },
      { id: 'antibiograma', header: 'Sensibilidade', width: 28 },
      { id: 'tipoAcesso', header: 'Acesso Vascular', width: 18 }
    ]
  },
  {
    id: 'historico_receitas',
    title: 'Histórico e Rastreabilidade de Receituários Emitidos',
    category: 'farmacia_infeccao',
    description: 'Auditoria de receitas simples e de controle especial emitidas através da plataforma NexAi-NEFRO.',
    columns: [
      { id: 'dataEmissao', header: 'Data Emissão', width: 14 },
      { id: 'numeroReceita', header: 'Nº Receita', width: 16 },
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'tipoReceita', header: 'Tipo Receita', width: 18 },
      { id: 'totalItens', header: 'Qtd Itens', width: 12 },
      { id: 'resumoMedicamentos', header: 'Medicamentos Prescritos', width: 34 },
      { id: 'medico', header: 'Médico Emissor', width: 22 }
    ]
  },

  // ================= 5. TRANSPLANTE & INDICADORES SBN/KDQI =================
  {
    id: 'fila_transplante',
    title: 'Prontidão e Gestão de Fila de Transplante Renal',
    category: 'qualidade_transplante',
    description: 'Estratificação da elegibilidade para transplante: ativos em lista SNT, em avaliação, doador vivo e recusas.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'statusTransplante', header: 'Classificação Transplante', width: 24 },
      { id: 'idade', header: 'Idade', width: 10 },
      { id: 'tempoDialise', header: 'Tempo em HD', width: 16 },
      { id: 'tipoAcesso', header: 'Acesso Atual', width: 18 },
      { id: 'clinica', header: 'Clínica', width: 20 },
      { id: 'observacoes', header: 'Centro Transplantador', width: 30 }
    ]
  },
  {
    id: 'panorama_consolidado',
    title: 'Panorama Clínico Consolidado e Metas de Qualidade SBN/KDQI',
    category: 'qualidade_transplante',
    description: 'Score integral de conformidade clínica por paciente: metas de Hb (10-12), P (3.5-5.5), K (≤5.5), Kt/V (≥1.2) e FAV definitiva.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'scoreConformidade', header: 'Score Metas (% Alvos)', width: 20 },
      { id: 'statusGeral', header: 'Status Geral', width: 16 },
      { id: 'metaHb', header: 'Meta Hb', width: 12 },
      { id: 'metaFosforo', header: 'Meta P', width: 12 },
      { id: 'metaPotassio', header: 'Meta K', width: 12 },
      { id: 'metaKtv', header: 'Meta Kt/V', width: 12 },
      { id: 'acessoDefinitivo', header: 'Acesso Definitivo', width: 16 },
      { id: 'clinica', header: 'Unidade', width: 20 }
    ]
  }
];

/**
 * Filtra a lista de pacientes conforme os critérios selecionados pelo usuário
 */
export function filterPatientsForReport(patients = [], filters = {}) {
  const {
    unidade = 'todos',
    turno = 'todos',
    diaSemana = 'todos',
    tipoAcesso = 'todos',
    statusTransplante = 'todos',
    comAlertaApenas = false,
    busca = ''
  } = filters;

  const searchNormalized = busca ? busca.trim().toLowerCase() : '';

  return patients.filter(p => {
    // 1. Busca por nome, CPF ou clínica
    if (searchNormalized) {
      const matchNome = (p.nome || '').toLowerCase().includes(searchNormalized);
      const matchCpf = (p.cpf || '').toLowerCase().includes(searchNormalized);
      const matchClinica = (p.clinica || '').toLowerCase().includes(searchNormalized);
      if (!matchNome && !matchCpf && !matchClinica) return false;
    }

    // 2. Unidade / Clínica
    if (unidade && unidade !== 'todos') {
      if ((p.clinica || '') !== unidade) return false;
    }

    // 3. Turno
    if (turno && turno !== 'todos') {
      if ((p.turno || '') !== turno) return false;
    }

    // 4. Dias da Semana
    if (diaSemana && diaSemana !== 'todos') {
      if ((p.diaSemana || '') !== diaSemana) return false;
    }

    // 5. Tipo de Acesso
    if (tipoAcesso && tipoAcesso !== 'todos') {
      const pAcesso = p.acessoVascular?.tipo || p.tipoAcesso || '';
      if (!pAcesso.toLowerCase().includes(tipoAcesso.toLowerCase())) return false;
    }

    // 6. Status Transplante
    if (statusTransplante && statusTransplante !== 'todos') {
      const pStatusTx = p.statusTransplante || p.status || '';
      if (pStatusTx !== statusTransplante) return false;
    }

    // 7. Apenas com Alertas
    if (comAlertaApenas) {
      const hasAlert = checkPatientHasAlerts(p);
      if (!hasAlert) return false;
    }

    return true;
  });
}

/**
 * Verifica se um paciente possui alertas críticos ativos (lab, medicamento a vencer, acesso de risco, etc.)
 */
export function checkPatientHasAlerts(patient) {
  const ex = patient.exames || {};
  if (ex.hb && (Number(ex.hb) < 10.0 || Number(ex.hb) > 13.0)) return true;
  if (ex.k && (Number(ex.k) > 5.5 || Number(ex.k) < 3.5)) return true;
  if (ex.fosforo && Number(ex.fosforo) > 5.5) return true;
  if (ex.pth && (Number(ex.pth) > 600 || Number(ex.pth) < 100)) return true;
  if (ex.ktv && Number(ex.ktv) < 1.2) return true;

  // Cateter duplo lúmen temporário é alerta de risco infeccioso
  const tipoAcesso = (patient.acessoVascular?.tipo || patient.tipoAcesso || '').toLowerCase();
  if (tipoAcesso.includes('duplo lúmen') || tipoAcesso.includes('cdl') || tipoAcesso.includes('provisório')) return true;

  // Medicamentos vencendo ou vencidos
  if (Array.isArray(patient.medicamentos)) {
    const today = new Date().toISOString().split('T')[0];
    const hasMedAlert = patient.medicamentos.some(m => {
      if (!m.ativo || !m.dataFim) return false;
      const diffDays = Math.ceil((new Date(m.dataFim) - new Date(today)) / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });
    if (hasMedAlert) return true;
  }

  return false;
}

/**
 * Utilitário para formatar tempo de hemodiálise
 */
function formatDialysisDuration(dataInicioStr) {
  if (!dataInicioStr) return 'Não informado';
  const start = new Date(dataInicioStr);
  if (isNaN(start.getTime())) return 'Não informado';
  const now = new Date();
  const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (diffMonths < 1) return 'Menos de 1 mês';
  if (diffMonths < 12) return `${diffMonths} meses`;
  const years = Math.floor(diffMonths / 12);
  const remMonths = diffMonths % 12;
  return remMonths > 0 ? `${years}a ${remMonths}m` : `${years} anos`;
}

/**
 * Gera as linhas de dados e KPIs resumidos para qualquer um dos 20 relatórios
 */
export function generateReportData(reportId, filteredPatients = []) {
  switch (reportId) {
    // ----------------------------------------------------
    // 1. Censo Geral
    // ----------------------------------------------------
    case 'censo_geral': {
      const rows = filteredPatients.map(p => ({
        nome: p.nome || 'Paciente sem nome',
        cpf: p.cpf || 'Não informado',
        idade: p.idade ? `${p.idade} anos` : 'N/I',
        sexo: p.sexo || 'N/I',
        clinica: p.clinica || 'Não informada',
        turno: p.turno || '1º Turno',
        diaSemana: p.diaSemana || 'Seg/Qua/Sex',
        tipoAcesso: p.acessoVascular?.tipo || p.tipoAcesso || 'Não informado',
        statusTransplante: p.statusTransplante || p.status || 'Não Avaliado',
        tempoDialise: formatDialysisDuration(p.dataInicioDialise)
      }));

      const kpis = [
        { label: 'Total de Pacientes', value: rows.length },
        { label: 'Fístulas (FAV)', value: rows.filter(r => r.tipoAcesso.toLowerCase().includes('fav') || r.tipoAcesso.toLowerCase().includes('fístula')).length },
        { label: 'Cateteres Centrais', value: rows.filter(r => r.tipoAcesso.toLowerCase().includes('cath') || r.tipoAcesso.toLowerCase().includes('cateter') || r.tipoAcesso.toLowerCase().includes('cdl')).length },
        { label: 'Ativos em Lista Tx', value: rows.filter(r => r.statusTransplante.toLowerCase().includes('lista')).length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 2. Demografia & Faixa Etária
    // ----------------------------------------------------
    case 'demografia_faixa_etaria': {
      let menor40 = 0, de40a59 = 0, de60a74 = 0, maior75 = 0;

      const rows = filteredPatients.map(p => {
        const age = p.idade || 0;
        let faixa = 'Indeterminada';
        if (age > 0) {
          if (age < 40) { faixa = '< 40 anos'; menor40++; }
          else if (age <= 59) { faixa = '40 a 59 anos'; de40a59++; }
          else if (age <= 74) { faixa = '60 a 74 anos'; de60a74++; }
          else { faixa = '≥ 75 anos (Idoso frágil)'; maior75++; }
        }

        let mesesHd = 'N/I';
        if (p.dataInicioDialise) {
          const start = new Date(p.dataInicioDialise);
          if (!isNaN(start.getTime())) {
            const now = new Date();
            mesesHd = Math.max(0, (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()));
          }
        }

        return {
          nome: p.nome || 'Paciente',
          idade: p.idade || 'N/I',
          faixaEtaria: faixa,
          sexo: p.sexo === 'M' ? 'Masculino' : p.sexo === 'F' ? 'Feminino' : (p.sexo || 'N/I'),
          dataNascimento: p.dataNascimento || 'N/I',
          telefone: p.telefone || 'N/I',
          clinica: p.clinica || 'N/I',
          tempoDialiseMeses: mesesHd !== 'N/I' ? `${mesesHd} meses` : 'N/I'
        };
      });

      const kpis = [
        { label: 'Total Avaliado', value: rows.length },
        { label: 'Idosos (≥60 anos)', value: `${de60a74 + maior75} (${rows.length ? Math.round(((de60a74 + maior75)/rows.length)*100) : 0}%)` },
        { label: 'Adultos (40-59)', value: de40a59 },
        { label: 'Jovens (<40)', value: menor40 }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 3. Distribuição de Turnos & Escalas
    // ----------------------------------------------------
    case 'escala_turnos': {
      const rows = filteredPatients.map(p => ({
        clinica: p.clinica || 'Clínica Principal',
        turno: p.turno || '1º Turno',
        diaSemana: p.diaSemana || 'Seg/Qua/Sex',
        nome: p.nome || 'Paciente',
        tipoAcesso: p.acessoVascular?.tipo || p.tipoAcesso || 'N/I',
        pesoSeco: p.pesoSeco ? `${p.pesoSeco} kg` : 'N/I',
        fluxoSangue: p.acessoVascular?.fluxoSangue ? `${p.acessoVascular.fluxoSangue} ml/min` : 'N/I'
      }));

      // Ordenar por clínica, diaSemana, turno
      rows.sort((a, b) => a.diaSemana.localeCompare(b.diaSemana) || a.turno.localeCompare(b.turno) || a.nome.localeCompare(b.nome));

      const segQuaSex = rows.filter(r => r.diaSemana.includes('Seg')).length;
      const terQuiSab = rows.filter(r => r.diaSemana.includes('Ter')).length;

      const kpis = [
        { label: 'Total em Escala', value: rows.length },
        { label: 'Escala Seg/Qua/Sex', value: segQuaSex },
        { label: 'Escala Ter/Qui/Sáb', value: terQuiSab },
        { label: 'Unidades Ativas', value: new Set(rows.map(r => r.clinica)).size }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 4. Etiologias da DRC
    // ----------------------------------------------------
    case 'etiologias_drc': {
      const counts = {};
      const rows = filteredPatients.map(p => {
        const etio = p.etiologiaDRC || 'Indeterminada / Causa Desconhecida';
        counts[etio] = (counts[etio] || 0) + 1;
        return {
          nome: p.nome || 'Paciente',
          etiologiaDRC: etio,
          idade: p.idade ? `${p.idade}a` : 'N/I',
          sexo: p.sexo || 'N/I',
          tempoDialise: formatDialysisDuration(p.dataInicioDialise),
          clinica: p.clinica || 'N/I',
          comorbidades: Array.isArray(p.alergias) && p.alergias.length > 0 ? p.alergias.join(', ') : 'Sem registros'
        };
      });

      rows.sort((a, b) => a.etiologiaDRC.localeCompare(b.etiologiaDRC) || a.nome.localeCompare(b.nome));

      const dmCount = counts['Nefropatia Diabética'] || 0;
      const hasCount = counts['Nefroesclerose Hipertensiva'] || counts['Hipertensão Arterial Sistêmica (HAS)'] || 0;

      const kpis = [
        { label: 'Total de Pacientes', value: rows.length },
        { label: 'Nefropatia Diabética', value: `${dmCount} (${rows.length ? Math.round((dmCount/rows.length)*100) : 0}%)` },
        { label: 'Hipertensão (HAS)', value: `${hasCount} (${rows.length ? Math.round((hasCount/rows.length)*100) : 0}%)` },
        { label: 'Outras Etiologias', value: rows.length - dmCount - hasCount }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 5. Acessos Vasculares
    // ----------------------------------------------------
    case 'acessos_vasculares': {
      let favCount = 0, permCount = 0, cdlCount = 0;

      const rows = filteredPatients.map(p => {
        const av = p.acessoVascular || {};
        const tipo = av.tipo || p.tipoAcesso || 'Não informado';
        const tipoLower = tipo.toLowerCase();

        let alerta = 'Adequado';
        if (tipoLower.includes('duplo lúmen') || tipoLower.includes('cdl') || tipoLower.includes('provisório')) {
          alerta = '⚠️ CDL Provisório (Alto Risco)';
          cdlCount++;
        } else if (tipoLower.includes('permcath') || tipoLower.includes('longa')) {
          alerta = 'Permcath (Vigilância Infecciosa)';
          permCount++;
        } else if (tipoLower.includes('fav') || tipoLower.includes('fístula')) {
          alerta = '✓ FAV Pérvia (Padrão Ouro)';
          favCount++;
        } else {
          alerta = 'Em acompanhamento';
        }

        return {
          nome: p.nome || 'Paciente',
          tipoAcesso: tipo,
          ladoMembro: av.ladoMembro || 'Não informado',
          dataConfeccao: av.dataConfeccao || 'N/I',
          fluxoSangue: av.fluxoSangue ? `${av.fluxoSangue} ml/min` : 'N/I',
          agulha: av.agulha || 'N/I',
          alertaAcesso: alerta,
          clinica: p.clinica || 'N/I'
        };
      });

      const taxaFav = rows.length ? Math.round((favCount / rows.length) * 100) : 0;

      const kpis = [
        { label: 'Taxa de FAV (Padrão Ouro)', value: `${taxaFav}% (${favCount}/${rows.length})` },
        { label: 'Permcath de Longa', value: permCount },
        { label: 'Cateter Duplo Lúmen (CDL)', value: cdlCount },
        { label: 'Meta SBN (> 80% FAV)', value: taxaFav >= 80 ? '✓ Atingida' : '⚠️ Abaixo da Meta' }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 6. Prescrições Dialíticas
    // ----------------------------------------------------
    case 'prescricoes_hd': {
      const rows = filteredPatients.map(p => {
        const av = p.acessoVascular || {};
        return {
          nome: p.nome || 'Paciente',
          capilar: p.capilar || p.prescricaoDialise?.capilar || 'Polissulfona 1.8m²',
          fluxoSangue: av.fluxoSangue ? `${av.fluxoSangue} ml/min` : '350 ml/min',
          fluxoDialisato: av.fluxoDialisato ? `${av.fluxoDialisato} ml/min` : '500 ml/min',
          pesoSeco: p.pesoSeco ? `${p.pesoSeco} kg` : 'N/I',
          duracaoSessao: p.tempoSessao || '4 horas (240 min)',
          anticoagulacao: p.heparina || 'Heparina Não Fracionada',
          turno: p.turno || '1º Turno'
        };
      });

      const kpis = [
        { label: 'Prescrições Ativas', value: rows.length },
        { label: 'Qb Médio', value: '350 ml/min' },
        { label: 'Qd Padrão', value: '500 ml/min' },
        { label: 'Tempo Padrão', value: '4h / 3x sem' }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 7. Balanço Volêmico & Ganho Interdialítico
    // ----------------------------------------------------
    case 'balanco_volemico': {
      let alertaGrave = 0, alertaModerado = 0, noAlvo = 0;

      const rows = filteredPatients.map(p => {
        const pesos = Array.isArray(p.historicoPesos) && p.historicoPesos.length > 0
          ? p.historicoPesos[0]
          : null;

        const pesoSeco = p.pesoSeco || (pesos?.pesoSeco) || null;
        const pesoPre = pesos?.peso || null;

        let varKg = 'N/I';
        let pidg = 'N/I';
        let status = 'Sem pesagem recente';

        if (pesoSeco && pesoPre) {
          const diff = Number((pesoPre - pesoSeco).toFixed(2));
          const pct = Number(((diff / pesoSeco) * 100).toFixed(2));
          varKg = `${diff > 0 ? '+' : ''}${diff} kg`;
          pidg = `${pct}%`;

          if (pct > 5.0) {
            status = '🚨 Sobrecarga Grave (>5%)';
            alertaGrave++;
          } else if (pct > 4.0) {
            status = '⚠️ Ganho Elevado (4-5%)';
            alertaModerado++;
          } else if (pct >= 0) {
            status = '✓ No Alvo Volêmico (<4%)';
            noAlvo++;
          } else {
            status = 'Abaixo do Peso Seco';
          }
        }

        return {
          nome: p.nome || 'Paciente',
          pesoSeco: pesoSeco ? `${pesoSeco} kg` : 'N/I',
          ultimoPeso: pesoPre ? `${pesoPre} kg` : 'N/I',
          variacaoKg: varKg,
          percentualGanho: pidg,
          statusVolemico: status,
          dataAfericao: pesos?.data || 'N/I',
          clinica: p.clinica || 'N/I'
        };
      });

      const kpis = [
        { label: 'Total com Pesagem', value: rows.filter(r => r.percentualGanho !== 'N/I').length },
        { label: 'No Alvo (<4% PIDG)', value: noAlvo },
        { label: 'Ganho Elevado (4-5%)', value: alertaModerado },
        { label: 'Sobrecarga Grave (>5%)', value: alertaGrave }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 8. Histórico de Intercorrências em Sessão
    // ----------------------------------------------------
    case 'intercorrencias_hd': {
      const rows = [];

      filteredPatients.forEach(p => {
        if (Array.isArray(p.evolucoes)) {
          p.evolucoes.forEach(evo => {
            if (evo.intercorrencias && evo.intercorrencias !== 'Nenhuma' && evo.intercorrencias.trim() !== '') {
              rows.push({
                data: evo.data || 'N/I',
                nome: p.nome || 'Paciente',
                tipoIntercorrencia: evo.intercorrencias,
                paPrePos: `${evo.paPre || 'N/I'} / ${evo.paPos || 'N/I'}`,
                ufRealizada: evo.ufRetirada ? `${evo.ufRetirada} ml` : 'N/I',
                conduta: evo.condutaClinica || 'Ajuste de conduta realizado',
                medico: evo.medicoNome || 'Nefrologista Responsável'
              });
            }
          });
        }
      });

      // Ordenar por data decrescente
      rows.sort((a, b) => b.data.localeCompare(a.data));

      const hipotensao = rows.filter(r => r.tipoIntercorrencia.toLowerCase().includes('hipotens')).length;
      const caimbra = rows.filter(r => r.tipoIntercorrencia.toLowerCase().includes('câimbra') || r.tipoIntercorrencia.toLowerCase().includes('caimbra')).length;

      const kpis = [
        { label: 'Total Intercorrências', value: rows.length },
        { label: 'Hipotensão Sintomática', value: hipotensao },
        { label: 'Câimbras Musculares', value: caimbra },
        { label: 'Outros Eventos', value: rows.length - hipotensao - caimbra }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 9. Painel Geral de Alertas Laboratoriais Críticos
    // ----------------------------------------------------
    case 'alertas_laboratoriais': {
      const rows = [];

      filteredPatients.forEach(p => {
        const ex = p.exames || {};
        const alertas = [];

        if (ex.k) {
          if (Number(ex.k) > 5.5) alertas.push(`🚨 Hipercalemia (${ex.k} mEq/L)`);
          else if (Number(ex.k) < 3.5) alertas.push(`⚠️ Hipocalemia (${ex.k} mEq/L)`);
        }
        if (ex.hb) {
          if (Number(ex.hb) < 10.0) alertas.push(`🚨 Anemia Crítica (${ex.hb} g/dL)`);
          else if (Number(ex.hb) > 13.0) alertas.push(`⚠️ Hb Elevada (${ex.hb} g/dL)`);
        }
        if (ex.fosforo && Number(ex.fosforo) > 5.5) {
          alertas.push(`⚠️ Hiperfosfatemia (${ex.fosforo} mg/dL)`);
        }
        if (ex.pth) {
          if (Number(ex.pth) > 600) alertas.push(`🚨 HPTS Grave (${ex.pth} pg/mL)`);
          else if (Number(ex.pth) < 100) alertas.push(`⚠️ Doença Óssea Adinâmica (${ex.pth} pg/mL)`);
        }
        if (ex.ktv && Number(ex.ktv) < 1.2) {
          alertas.push(`⚠️ Subdiálise (Kt/V ${ex.ktv})`);
        }

        if (alertas.length > 0) {
          rows.push({
            nome: p.nome || 'Paciente',
            clinica: p.clinica || 'N/I',
            turno: p.turno || 'N/I',
            alertasAtivos: alertas.join(' | '),
            k: ex.k ? `${ex.k}` : '-',
            hb: ex.hb ? `${ex.hb}` : '-',
            fosforo: ex.fosforo ? `${ex.fosforo}` : '-',
            pth: ex.pth ? `${ex.pth}` : '-',
            ktv: ex.ktv ? `${ex.ktv}` : '-'
          });
        }
      });

      const kpis = [
        { label: 'Pacientes com Alertas', value: rows.length },
        { label: 'Alertas de Potássio (K)', value: rows.filter(r => r.alertasAtivos.includes('Hipercalemia') || r.alertasAtivos.includes('Hipocalemia')).length },
        { label: 'Alertas de Anemia (Hb)', value: rows.filter(r => r.alertasAtivos.includes('Anemia')).length },
        { label: 'Alertas de Fósforo (P)', value: rows.filter(r => r.alertasAtivos.includes('Hiperfosfatemia')).length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 10. Perfil de Anemia & Cinética do Ferro
    // ----------------------------------------------------
    case 'perfil_anemia': {
      let noAlvoHb = 0, subAlvoHb = 0, acimaAlvoHb = 0;

      const rows = filteredPatients.map(p => {
        const ex = p.exames || {};
        const hb = Number(ex.hb) || null;
        const ist = Number(ex.ist) || null;
        const ferritina = Number(ex.ferritina) || null;

        let metaHb = 'Sem exame recente';
        if (hb) {
          if (hb >= 10.0 && hb <= 12.0) {
            metaHb = '✓ No Alvo (10-12)';
            noAlvoHb++;
          } else if (hb < 10.0) {
            metaHb = '🚨 Sub-alvo (< 10.0)';
            subAlvoHb++;
          } else {
            metaHb = '⚠️ Elevado (> 12.0)';
            acimaAlvoHb++;
          }
        }

        let reserva = 'Não avaliada';
        if (ist && ferritina) {
          if (ist < 20 || ferritina < 200) {
            reserva = '🚨 Ferropenia (IST<20% ou Fer<200)';
          } else if (ferritina > 800) {
            reserva = '⚠️ Sobrecarga de Ferro';
          } else {
            reserva = '✓ Reserva Adequada';
          }
        }

        const meds = Array.isArray(p.medicamentos) ? p.medicamentos : [];
        const epoMed = meds.find(m => m.ativo && (m.nome.toLowerCase().includes('epo') || m.nome.toLowerCase().includes('alfaepoetina')));
        const ferroMed = meds.find(m => m.ativo && (m.nome.toLowerCase().includes('noripurum') || m.nome.toLowerCase().includes('férrico') || m.nome.toLowerCase().includes('ferro')));

        return {
          nome: p.nome || 'Paciente',
          hb: hb ? `${hb} g/dL` : 'N/I',
          ht: ex.ht ? `${ex.ht}%` : 'N/I',
          ferritina: ferritina ? `${ferritina} ng/mL` : 'N/I',
          ist: ist ? `${ist}%` : 'N/I',
          metaAnemia: metaHb,
          reservaFerro: reserva,
          epoEmUso: epoMed ? `${epoMed.dosagem || 'Prescrito'}` : 'Não prescrito',
          ferroEmUso: ferroMed ? `${ferroMed.dosagem || 'Prescrito'}` : 'Não prescrito'
        };
      });

      const totalAvaliados = noAlvoHb + subAlvoHb + acimaAlvoHb;
      const pctNoAlvo = totalAvaliados ? Math.round((noAlvoHb / totalAvaliados) * 100) : 0;

      const kpis = [
        { label: 'Conformidade Hb (10-12)', value: `${pctNoAlvo}% (${noAlvoHb}/${totalAvaliados})` },
        { label: 'Hb Crítica (<10 g/dL)', value: subAlvoHb },
        { label: 'Hb > 12 g/dL', value: acimaAlvoHb },
        { label: 'Meta KDIGO/SBN', value: pctNoAlvo >= 70 ? '✓ Padrão Excelência' : '⚠️ Oportunidade Melhoria' }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 11. Metabolismo Ósseo e Mineral (DMO-DRC)
    // ----------------------------------------------------
    case 'metabolismo_osseo': {
      let pNoAlvo = 0, pAlto = 0;

      const rows = filteredPatients.map(p => {
        const ex = p.exames || {};
        const ca = Number(ex.ca) || null;
        const pVal = Number(ex.fosforo) || null;
        const pth = Number(ex.pth) || null;

        let prodCaP = 'N/I';
        if (ca && pVal) {
          prodCaP = (ca * pVal).toFixed(1);
        }

        let statusDmo = 'Acompanhamento de rotina';
        if (pVal) {
          if (pVal >= 3.5 && pVal <= 5.5) {
            pNoAlvo++;
          } else if (pVal > 5.5) {
            pAlto++;
            statusDmo = '⚠️ Hiperfosfatemia';
          }
        }
        if (pth && pth > 600) {
          statusDmo = '🚨 HPTS Severo (PTH > 600)';
        }

        const meds = Array.isArray(p.medicamentos) ? p.medicamentos : [];
        const quelante = meds.find(m => m.ativo && (
          m.nome.toLowerCase().includes('carbonato') ||
          m.nome.toLowerCase().includes('sevelamer') ||
          m.nome.toLowerCase().includes('calcitriol') ||
          m.nome.toLowerCase().includes('cinacalcet') ||
          m.categoria?.toLowerCase().includes('ósseo')
        ));

        return {
          nome: p.nome || 'Paciente',
          ca: ca ? `${ca} mg/dL` : 'N/I',
          fosforo: pVal ? `${pVal} mg/dL` : 'N/I',
          produtoCaP: prodCaP !== 'N/I' ? prodCaP : 'N/I',
          pth: pth ? `${pth} pg/mL` : 'N/I',
          vitD: ex.vitD ? `${ex.vitD} ng/mL` : 'N/I',
          fa: ex.fa ? `${ex.fa} U/L` : 'N/I',
          statusDMO: statusDmo,
          quelanteEmUso: quelante ? `${quelante.nome} (${quelante.dosagem || ''})` : 'Nenhum'
        };
      });

      const totalP = pNoAlvo + pAlto;
      const kpis = [
        { label: 'Fósforo no Alvo (3.5-5.5)', value: `${totalP ? Math.round((pNoAlvo / totalP) * 100) : 0}% (${pNoAlvo}/${totalP})` },
        { label: 'Hiperfosfatemia (P > 5.5)', value: pAlto },
        { label: 'PTH Crítico (>600)', value: rows.filter(r => r.statusDMO.includes('HPTS')).length },
        { label: 'Pacientes c/ Quelante', value: rows.filter(r => r.quelanteEmUso !== 'Nenhum').length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 12. Adequação Dialítica (Kt/V e UR%)
    // ----------------------------------------------------
    case 'adequacao_dialitica': {
      let ktvAdequado = 0, ktvInadequado = 0;

      const rows = filteredPatients.map(p => {
        const ex = p.exames || {};
        const ktv = Number(ex.ktv) || null;
        const pre = Number(ex.ureiaPre) || null;
        const pos = Number(ex.ureiaPos) || null;

        let meta = 'Sem Kt/V recente';
        if (ktv) {
          if (ktv >= 1.20) {
            meta = '✓ Adequado (≥ 1.20)';
            ktvAdequado++;
          } else {
            meta = '🚨 Inadequado (< 1.20)';
            ktvInadequado++;
          }
        }

        let ur = 'N/I';
        if (pre && pos && pre > pos) {
          ur = `${Math.round(((pre - pos) / pre) * 100)}%`;
        }

        return {
          nome: p.nome || 'Paciente',
          ktv: ktv ? `${ktv}` : 'N/I',
          metaKtv: meta,
          ureiaPre: pre ? `${pre} mg/dL` : 'N/I',
          ureiaPos: pos ? `${pos} mg/dL` : 'N/I',
          taxaReducaoUreia: ur,
          creatinina: ex.creatinina ? `${ex.creatinina} mg/dL` : 'N/I',
          clinica: p.clinica || 'N/I'
        };
      });

      const totalKtv = ktvAdequado + ktvInadequado;
      const pctKtv = totalKtv ? Math.round((ktvAdequado / totalKtv) * 100) : 0;

      const kpis = [
        { label: 'Adequação Kt/V (≥1.20)', value: `${pctKtv}% (${ktvAdequado}/${totalKtv})` },
        { label: 'Subdiálise (Kt/V < 1.20)', value: ktvInadequado },
        { label: 'Kt/V Médio', value: totalKtv ? (rows.filter(r => r.ktv !== 'N/I').reduce((acc, r) => acc + parseFloat(r.ktv), 0) / totalKtv).toFixed(2) : 'N/I' },
        { label: 'Meta SBN / KDQI', value: pctKtv >= 85 ? '✓ Meta Superada' : '⚠️ Atenção Clínica' }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 13. Estado Nutricional & Marcadores Inflamatórios
    // ----------------------------------------------------
    case 'nutricao_inflamacao': {
      let hipoalbumina = 0, inflamado = 0;

      const rows = filteredPatients.map(p => {
        const ex = p.exames || {};
        const alb = Number(ex.albumina) || null;
        const pcr = Number(ex.pcr) || null;
        const peso = Number(p.pesoSeco) || null;
        const altM = p.altura ? Number(p.altura) / 100 : null;

        let imc = 'N/I';
        if (peso && altM && altM > 0) {
          imc = (peso / (altM * altM)).toFixed(1);
        }

        let statusNutri = 'Eutrófico';
        if (alb) {
          if (alb < 3.8) {
            statusNutri = '🚨 Hipoalbuminemia (< 3.8)';
            hipoalbumina++;
          } else if (alb >= 4.0) {
            statusNutri = '✓ Nutrição Excelente (≥ 4.0)';
          }
        }
        if (pcr && pcr > 5.0) {
          inflamado++;
        }

        return {
          nome: p.nome || 'Paciente',
          albumina: alb ? `${alb} g/dL` : 'N/I',
          pcr: pcr ? `${pcr} mg/L` : 'N/I',
          pesoSeco: peso ? `${peso} kg` : 'N/I',
          imc: imc !== 'N/I' ? `${imc}` : 'N/I',
          statusNutricional: statusNutri,
          glicemia: ex.glicemia ? `${ex.glicemia} mg/dL` : 'N/I',
          hba1c: ex.hba1c ? `${ex.hba1c}%` : 'N/I'
        };
      });

      const kpis = [
        { label: 'Hipoalbuminemia (<3.8 g/dL)', value: hipoalbumina },
        { label: 'Inflamação Ativa (PCR > 5)', value: inflamado },
        { label: 'Pacientes Avaliados', value: rows.length },
        { label: 'Meta Albumina (≥4.0)', value: rows.filter(r => r.statusNutricional.includes('Excelente')).length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 14. Mapa Geral de Farmacoterapia
    // ----------------------------------------------------
    case 'mapa_medicamentos': {
      const rows = [];

      filteredPatients.forEach(p => {
        const meds = Array.isArray(p.medicamentos) ? p.medicamentos.filter(m => m.ativo !== false) : [];
        meds.forEach(m => {
          rows.push({
            nome: p.nome || 'Paciente',
            medicamento: m.nome || 'Medicamento',
            categoria: m.categoria || 'Geral',
            dosagem: m.dosagem || 'Conforme prescrição',
            posologia: m.frequencia || 'Uso contínuo',
            via: m.via || 'VO',
            tipo: m.tipo === 'temporario' ? 'Temporário (Ciclo)' : 'Uso Contínuo'
          });
        });
      });

      rows.sort((a, b) => a.nome.localeCompare(b.nome) || a.medicamento.localeCompare(b.medicamento));

      const kpis = [
        { label: 'Total Itens Prescritos', value: rows.length },
        { label: 'Pacientes com Fármacos', value: new Set(rows.map(r => r.nome)).size },
        { label: 'Uso Contínuo', value: rows.filter(r => r.tipo.includes('Contínuo')).length },
        { label: 'Ciclos Temporários', value: rows.filter(r => r.tipo.includes('Temporário')).length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 15. Vigilância de Ciclos a Vencer e Vencidos
    // ----------------------------------------------------
    case 'ciclos_medicamentos': {
      const rows = [];
      const today = new Date().toISOString().split('T')[0];

      filteredPatients.forEach(p => {
        const meds = Array.isArray(p.medicamentos) ? p.medicamentos.filter(m => m.ativo && m.dataFim) : [];
        meds.forEach(m => {
          const diffDays = Math.ceil((new Date(m.dataFim) - new Date(today)) / (1000 * 60 * 60 * 24));
          let status = 'No prazo';
          if (diffDays < 0) {
            status = `🚨 Vencido há ${Math.abs(diffDays)} dias`;
          } else if (diffDays === 0) {
            status = '🚨 Vence HOJE';
          } else if (diffDays <= 7) {
            status = `⚠️ Vence em ${diffDays} dias`;
          }

          rows.push({
            nome: p.nome || 'Paciente',
            medicamento: m.nome || 'Fármaco',
            dosagem: m.dosagem || 'N/I',
            dataInicio: m.dataInicio || 'N/I',
            dataFim: m.dataFim || 'N/I',
            diasRestantes: diffDays < 0 ? `${diffDays}d` : `${diffDays}d restantes`,
            statusCiclo: status
          });
        });
      });

      rows.sort((a, b) => parseInt(a.diasRestantes) - parseInt(b.diasRestantes));

      const vencidos = rows.filter(r => r.statusCiclo.includes('Vencido')).length;
      const prestesAVencer = rows.filter(r => r.statusCiclo.includes('Vence')).length;

      const kpis = [
        { label: 'Total Ciclos Temporários', value: rows.length },
        { label: 'Ciclos Já Vencidos', value: vencidos },
        { label: 'Vencendo nos Próx. 7 Dias', value: prestesAVencer },
        { label: 'Ciclos Regulares', value: rows.length - vencidos - prestesAVencer }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 16. Controle de Antimicrobianos em Curso
    // ----------------------------------------------------
    case 'antibioticoterapia': {
      const rows = [];
      const ATB_KEYWORDS = ['céfalo', 'cefazolina', 'vancomicina', 'amikacina', 'ciprofloxacino', 'meropenem', 'tazocil', 'piperacilina', 'gentamicina', 'oxacilina', 'daptomicina', 'sulfametoxazol', 'antibiótico', 'antimicrobiano'];

      filteredPatients.forEach(p => {
        const meds = Array.isArray(p.medicamentos) ? p.medicamentos.filter(m => m.ativo) : [];
        meds.forEach(m => {
          const isAtb = m.categoria?.toLowerCase().includes('antibiótico') ||
            m.categoria?.toLowerCase().includes('antimicrobiano') ||
            ATB_KEYWORDS.some(k => (m.nome || '').toLowerCase().includes(k));

          if (isAtb) {
            rows.push({
              nome: p.nome || 'Paciente',
              antibiotico: m.nome || 'Antimicrobiano',
              dosagem: m.dosagem || 'N/I',
              via: m.via || 'EV pós-HD',
              dataInicio: m.dataInicio || 'N/I',
              dataFim: m.dataFim || 'Em acompanhamento',
              observacao: m.observacao || 'Tratamento de infecção associada à hemodiálise',
              tipoAcesso: p.acessoVascular?.tipo || p.tipoAcesso || 'N/I'
            });
          }
        });
      });

      const kpis = [
        { label: 'Pacientes em Uso de ATB', value: new Set(rows.map(r => r.nome)).size },
        { label: 'Tratamentos Ativos', value: rows.length },
        { label: 'Uso em Cateter (Permcath/CDL)', value: rows.filter(r => r.tipoAcesso.toLowerCase().includes('cat')).length },
        { label: 'Vigilância CCIH', value: 'Monitoramento Contínuo' }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 17. Hemoculturas & Protocolos de Lock Therapy
    // ----------------------------------------------------
    case 'hemoculturas_lock': {
      const rows = [];

      filteredPatients.forEach(p => {
        if (Array.isArray(p.hemoculturas)) {
          p.hemoculturas.forEach(hc => {
            rows.push({
              dataColeta: hc.dataColeta || 'N/I',
              nome: p.nome || 'Paciente',
              sitio: hc.sitio || 'Acesso / Sangue Periférico',
              status: hc.status || 'Pendente',
              patogeno: hc.patogeno || 'Sem crescimento',
              antibiograma: hc.antibiograma || 'Em análise',
              tipoAcesso: p.acessoVascular?.tipo || p.tipoAcesso || 'N/I'
            });
          });
        }
      });

      rows.sort((a, b) => b.dataColeta.localeCompare(a.dataColeta));

      const positivas = rows.filter(r => (r.status || '').toLowerCase().includes('positiv') || (r.patogeno && !r.patogeno.toLowerCase().includes('nenhum') && !r.patogeno.toLowerCase().includes('sem crescimento'))).length;

      const kpis = [
        { label: 'Total Coletas Registradas', value: rows.length },
        { label: 'Culturas Positivas', value: positivas },
        { label: 'Culturas Negativas', value: rows.length - positivas },
        { label: 'Protocolo Lock Ativo', value: 'Conforme CCIH' }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 18. Histórico de Receituários Emitidos
    // ----------------------------------------------------
    case 'historico_receitas': {
      const rows = [];

      filteredPatients.forEach(p => {
        if (Array.isArray(p.receitas)) {
          p.receitas.forEach(rec => {
            const medicamentosStr = Array.isArray(rec.itens)
              ? rec.itens.map(it => `${it.medicamentoNome || it.nome} (${it.posologia || it.quantidade})`).join('; ')
              : 'Nenhum medicamento listado';

            rows.push({
              dataEmissao: rec.dataEmissao || 'N/I',
              numeroReceita: rec.numeroReceita || rec.id?.slice(-8).toUpperCase() || 'N/I',
              nome: p.nome || 'Paciente',
              tipoReceita: rec.tipoReceita === 'controle_especial' ? 'Controle Especial (2 Vias)' : 'Receita Simples (Ambulatorial)',
              totalItens: Array.isArray(rec.itens) ? rec.itens.length : 0,
              resumoMedicamentos: medicamentosStr,
              medico: rec.medicoNome || 'Médico Nefrologista'
            });
          });
        }
      });

      rows.sort((a, b) => b.dataEmissao.localeCompare(a.dataEmissao));

      const especiais = rows.filter(r => r.tipoReceita.includes('Controle Especial')).length;

      const kpis = [
        { label: 'Total Receitas Emitidas', value: rows.length },
        { label: 'Receitas Simples', value: rows.length - especiais },
        { label: 'Controle Especial', value: especiais },
        { label: 'Pacientes Prescritos', value: new Set(rows.map(r => r.nome)).size }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 19. Prontidão & Fila de Transplante Renal
    // ----------------------------------------------------
    case 'fila_transplante': {
      const counts = {};

      const rows = filteredPatients.map(p => {
        const st = p.statusTransplante || p.status || 'Não Avaliado';
        counts[st] = (counts[st] || 0) + 1;

        return {
          nome: p.nome || 'Paciente',
          statusTransplante: st,
          idade: p.idade ? `${p.idade} anos` : 'N/I',
          tempoDialise: formatDialysisDuration(p.dataInicioDialise),
          tipoAcesso: p.acessoVascular?.tipo || p.tipoAcesso || 'N/I',
          clinica: p.clinica || 'N/I',
          observacoes: p.observacoesClinicas || 'Sem anotações de transplante'
        };
      });

      rows.sort((a, b) => a.statusTransplante.localeCompare(b.statusTransplante) || a.nome.localeCompare(b.nome));

      const ativoLista = counts['Ativo em Lista de Espera'] || 0;
      const emAvaliacao = (counts['Encaminhado / Em Avaliação'] || 0) + (counts['Encaminhar / Em Triagem'] || 0);
      const transplantados = counts['Já Transplantado'] || 0;

      const kpis = [
        { label: 'Ativos em Lista SNT', value: `${ativoLista} (${rows.length ? Math.round((ativoLista/rows.length)*100) : 0}%)` },
        { label: 'Em Avaliação / Triagem', value: emAvaliacao },
        { label: 'Já Transplantados', value: transplantados },
        { label: 'Total Mapeado', value: rows.length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 20. Panorama Consolidado & Indicadores SBN/KDQI
    // ----------------------------------------------------
    case 'panorama_consolidado':
    default: {
      let highPerformers = 0;

      const rows = filteredPatients.map(p => {
        const ex = p.exames || {};
        let metasAtingidas = 0;
        const totalMetas = 5;

        // 1. Hb entre 10 e 12
        const hb = Number(ex.hb);
        const metaHb = (hb >= 10.0 && hb <= 12.0);
        if (metaHb) metasAtingidas++;

        // 2. Fósforo entre 3.5 e 5.5
        const pVal = Number(ex.fosforo);
        const metaP = (pVal >= 3.5 && pVal <= 5.5);
        if (metaP) metasAtingidas++;

        // 3. Potássio <= 5.5 e >= 3.5
        const kVal = Number(ex.k);
        const metaK = (kVal >= 3.5 && kVal <= 5.5);
        if (metaK) metasAtingidas++;

        // 4. Kt/V >= 1.2
        const ktv = Number(ex.ktv);
        const metaKtv = (ktv >= 1.20);
        if (metaKtv) metasAtingidas++;

        // 5. Acesso definitivo (FAV ou prótese)
        const tipoAcesso = (p.acessoVascular?.tipo || p.tipoAcesso || '').toLowerCase();
        const favDefinitiva = tipoAcesso.includes('fav') || tipoAcesso.includes('fístula') || tipoAcesso.includes('prótese');
        if (favDefinitiva) metasAtingidas++;

        const scorePct = Math.round((metasAtingidas / totalMetas) * 100);
        if (scorePct >= 80) highPerformers++;

        let status = 'Atenção Clínica';
        if (scorePct >= 80) status = '✓ Meta Excelente (≥80%)';
        else if (scorePct >= 60) status = 'Bom Controle (60-79%)';
        else status = '🚨 Fora de Metas (<60%)';

        return {
          nome: p.nome || 'Paciente',
          scoreConformidade: `${scorePct}% (${metasAtingidas}/5)`,
          statusGeral: status,
          metaHb: metaHb ? '✓ Alvo' : hb ? 'Fora' : 'N/I',
          metaFosforo: metaP ? '✓ Alvo' : pVal ? 'Fora' : 'N/I',
          metaPotassio: metaK ? '✓ Alvo' : kVal ? 'Fora' : 'N/I',
          metaKtv: metaKtv ? '✓ Alvo' : ktv ? 'Fora' : 'N/I',
          acessoDefinitivo: favDefinitiva ? '✓ FAV' : 'Cateter',
          clinica: p.clinica || 'N/I'
        };
      });

      rows.sort((a, b) => parseInt(b.scoreConformidade) - parseInt(a.scoreConformidade));

      const pctExcelencia = rows.length ? Math.round((highPerformers / rows.length) * 100) : 0;

      const kpis = [
        { label: 'Pacientes em Excelência (≥80%)', value: `${pctExcelencia}% (${highPerformers}/${rows.length})` },
        { label: 'Metas SBN Monitoradas', value: 'Hb, P, K, Kt/V, Acesso' },
        { label: 'Total de Pacientes', value: rows.length },
        { label: 'Índice Geral de Qualidade', value: pctExcelencia >= 75 ? 'Excelente' : 'Regular' }
      ];

      return { rows, kpis };
    }
  }
}

/**
 * Exporta o relatório filtrado diretamente para uma planilha Excel (.xlsx) estruturada
 */
export function exportReportToExcel(report, rows = [], kpis = [], metadata = {}) {
  const doctorName = metadata.doctorName || 'Médico Nefrologista';
  const doctorCrm = metadata.doctorCrm ? `CRM/${metadata.doctorUf || 'SP'} ${metadata.doctorCrm}` : '';
  const emissionDate = new Date().toLocaleString('pt-BR');

  // Cabeçalho institucional do Excel
  const aoa = [
    ['NexAi-NEFRO — PLATAFORMA ESPECIALIZADA EM GESTÃO CLÍNICA NEFROLÓGICA'],
    [report.title.toUpperCase()],
    [`Emitido em: ${emissionDate}`, `Médico Responsável: ${doctorName} ${doctorCrm}`, `Clínica: ${metadata.clinica || 'Geral'}`],
    [`Filtros Aplicados: ${metadata.filtersDesc || 'Todos os registros do serviço'}`],
    []
  ];

  // Bloco de KPIs se existirem
  if (kpis && kpis.length > 0) {
    aoa.push(['RESUMO EXECUTIVO / INDICADORES CLÍNICOS:']);
    const kpiRow1 = kpis.map(k => k.label);
    const kpiRow2 = kpis.map(k => k.value);
    aoa.push(kpiRow1);
    aoa.push(kpiRow2);
    aoa.push([]);
  }

  // Cabeçalhos das Colunas
  const headerCols = report.columns.map(c => c.header);
  aoa.push(headerCols);

  // Linhas com os dados
  rows.forEach(r => {
    const rowData = report.columns.map(c => r[c.id] ?? '');
    aoa.push(rowData);
  });

  // Criar planilha
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Definir larguras de colunas
  ws['!cols'] = report.columns.map(c => ({
    wch: Math.max((c.width || 18), (c.header.length + 3))
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório Clínico');

  // Gerar nome de arquivo amigável e limpo
  const cleanId = report.id.replace(/_/g, '-');
  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `nexai-relatorio-${cleanId}-${dateStamp}.xlsx`;

  XLSX.writeFile(wb, fileName);
}
