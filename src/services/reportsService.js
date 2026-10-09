import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { resolveImageForExcel, addDoctorLogoToExcelSheet, saveWorkbookBrowser } from '../utils/excelLogoUtils.js';
import { getAnticoagulacaoInfo } from './patientService.js';
import { getLmeExpirationStatus } from './lmeService.js';

/**
 * Categorias dos Relatórios Clínicos e Gerenciais (Regra de Poucas Palavras)
 */
export const REPORT_CATEGORIES = [
  { id: 'populacao', name: 'Censo', icon: 'Users', color: '#0284c7' },
  { id: 'acesso_dialise', name: 'Diálise', icon: 'Activity', color: '#0d9488' },
  { id: 'laboratorio', name: 'Exames', icon: 'FlaskConical', color: '#7c3aed' },
  { id: 'farmacia_infeccao', name: 'Farmácia', icon: 'Pill', color: '#e11d48' },
  { id: 'qualidade_transplante', name: 'Transplante', icon: 'Award', color: '#d97706' },
  { id: 'gestao', name: 'Gestão', icon: 'FileText', color: '#059669' }
];

/**
 * Catálogo Completo dos 26 Relatórios Especializados do Nex-Ai.NEFRO
 */
export const REPORTS_CATALOG = [
  // ================= 1. CENSO =================
  {
    id: 'censo_geral',
    title: 'Censo Geral',
    category: 'populacao',
    description: 'Relação cadastral ativa, unidade, turno, escala e tempo de tratamento.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 28 },
      { id: 'cpf', header: 'CPF', width: 16 },
      { id: 'idade', header: 'Idade', width: 10 },
      { id: 'sexo', header: 'Sexo', width: 8 },
      { id: 'clinica', header: 'Unidade', width: 24 },
      { id: 'turno', header: 'Turno', width: 14 },
      { id: 'diaSemana', header: 'Escala', width: 16 },
      { id: 'tipoAcesso', header: 'Acesso', width: 20 },
      { id: 'statusTransplante', header: 'Transplante', width: 22 },
      { id: 'tempoDialise', header: 'Tempo em HD', width: 16 }
    ]
  },
  {
    id: 'demografia_faixa_etaria',
    title: 'Demografia',
    category: 'populacao',
    description: 'Estratificação por faixas de idade, sexo e meses em hemodiálise.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 28 },
      { id: 'idade', header: 'Idade', width: 10 },
      { id: 'faixaEtaria', header: 'Faixa Etária', width: 18 },
      { id: 'sexo', header: 'Sexo', width: 10 },
      { id: 'dataNascimento', header: 'Nascimento', width: 14 },
      { id: 'telefone', header: 'Telefone', width: 18 },
      { id: 'clinica', header: 'Unidade', width: 24 },
      { id: 'tempoDialiseMeses', header: 'Meses em HD', width: 14 }
    ]
  },
  {
    id: 'escala_turnos',
    title: 'Turnos e Escalas',
    category: 'populacao',
    description: 'Mapeamento operacional de alocação por turno e dias da semana.',
    columns: [
      { id: 'clinica', header: 'Unidade', width: 24 },
      { id: 'turno', header: 'Turno', width: 14 },
      { id: 'diaSemana', header: 'Escala', width: 16 },
      { id: 'nome', header: 'Paciente', width: 28 },
      { id: 'tipoAcesso', header: 'Acesso', width: 20 },
      { id: 'pesoSeco', header: 'Peso Seco', width: 14 },
      { id: 'fluxoSangue', header: 'Qb', width: 14 }
    ]
  },
  {
    id: 'etiologias_drc',
    title: 'Etiologias DRC',
    category: 'populacao',
    description: 'Causas primárias da doença renal crônica e comorbidades associadas.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 28 },
      { id: 'etiologiaDRC', header: 'Etiologia', width: 28 },
      { id: 'idade', header: 'Idade', width: 10 },
      { id: 'sexo', header: 'Sexo', width: 8 },
      { id: 'tempoDialise', header: 'Tempo em HD', width: 16 },
      { id: 'clinica', header: 'Unidade', width: 24 },
      { id: 'comorbidades', header: 'Comorbidades', width: 26 }
    ]
  },

  // ================= 2. DIÁLISE =================
  {
    id: 'acessos_vasculares',
    title: 'Acessos Vasculares',
    category: 'acesso_dialise',
    description: 'Vigilância de fístulas arteriovenosas, próteses e cateteres centrais.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'tipoAcesso', header: 'Acesso', width: 22 },
      { id: 'ladoMembro', header: 'Local', width: 18 },
      { id: 'dataConfeccao', header: 'Data Implante', width: 16 },
      { id: 'fluxoSangue', header: 'Qb Prescrito', width: 14 },
      { id: 'agulha', header: 'Agulha', width: 12 },
      { id: 'alertaAcesso', header: 'Condição', width: 22 },
      { id: 'clinica', header: 'Unidade', width: 22 }
    ]
  },
  {
    id: 'prescricoes_hd',
    title: 'Prescrições HD',
    category: 'acesso_dialise',
    description: 'Parâmetros dialíticos ativos: capilar, fluxos Qb/Qd, tempo e peso seco.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'capilar', header: 'Dialisador', width: 20 },
      { id: 'fluxoSangue', header: 'Qb', width: 14 },
      { id: 'fluxoDialisato', header: 'Qd', width: 14 },
      { id: 'pesoSeco', header: 'Peso Seco', width: 14 },
      { id: 'duracaoSessao', header: 'Duração', width: 14 },
      { id: 'anticoagulacao', header: 'Anticoagulação', width: 20 },
      { id: 'turno', header: 'Turno', width: 14 }
    ]
  },
  {
    id: 'anticoagulacao_hd',
    title: 'Anticoagulação',
    category: 'acesso_dialise',
    description: 'Protocolos de heparina padrão, enoxaparina e segurança sem heparina.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'protocolo', header: 'Protocolo', width: 20 },
      { id: 'doseAtaque', header: 'Ataque', width: 14 },
      { id: 'doseManutencao', header: 'Manutenção', width: 16 },
      { id: 'statusSeguranca', header: 'Segurança', width: 22 },
      { id: 'motivo', header: 'Justificativa Clínica', width: 28 },
      { id: 'clinica', header: 'Unidade', width: 20 }
    ]
  },
  {
    id: 'balanco_volemico',
    title: 'Balanço Volêmico',
    category: 'acesso_dialise',
    description: 'Monitoramento de peso interdialítico e percentual de ganho volêmico.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'pesoSeco', header: 'Peso Seco', width: 14 },
      { id: 'ultimoPeso', header: 'Último Peso', width: 14 },
      { id: 'variacaoKg', header: 'Ganho (kg)', width: 12 },
      { id: 'percentualGanho', header: '% Ganho', width: 14 },
      { id: 'statusVolemico', header: 'Classificação', width: 22 },
      { id: 'dataAfericao', header: 'Data Pesagem', width: 14 },
      { id: 'clinica', header: 'Unidade', width: 20 }
    ]
  },
  {
    id: 'intercorrencias_hd',
    title: 'Intercorrências',
    category: 'acesso_dialise',
    description: 'Histórico de eventos clínicos e hipotensões durante sessões de hemodiálise.',
    columns: [
      { id: 'data', header: 'Data', width: 14 },
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'tipoIntercorrencia', header: 'Intercorrência', width: 24 },
      { id: 'paPrePos', header: 'PA Pré e Pós', width: 16 },
      { id: 'ufRealizada', header: 'UF Retirada', width: 14 },
      { id: 'conduta', header: 'Conduta Adotada', width: 30 },
      { id: 'medico', header: 'Médico', width: 22 }
    ]
  },

  // ================= 3. EXAMES =================
  {
    id: 'alertas_laboratoriais',
    title: 'Alertas Laboratoriais',
    category: 'laboratorio',
    description: 'Resultados críticos fora da faixa de segurança clínica.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'clinica', header: 'Unidade', width: 20 },
      { id: 'turno', header: 'Turno', width: 12 },
      { id: 'alertasAtivos', header: 'Alertas Críticos', width: 34 },
      { id: 'k', header: 'K (mEq/L)', width: 12 },
      { id: 'hb', header: 'Hb (g/dL)', width: 12 },
      { id: 'fosforo', header: 'P (mg/dL)', width: 12 },
      { id: 'pth', header: 'PTH (pg/mL)', width: 14 },
      { id: 'ktv', header: 'Kt/V', width: 10 }
    ]
  },
  {
    id: 'perfil_anemia',
    title: 'Anemia e Ferro',
    category: 'laboratorio',
    description: 'Avaliação de hemoglobina, saturação de transferrina e ferritina.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'hb', header: 'Hb (g/dL)', width: 12 },
      { id: 'ht', header: 'Ht (%)', width: 10 },
      { id: 'ferritina', header: 'Ferritina', width: 14 },
      { id: 'ist', header: 'IST (%)', width: 10 },
      { id: 'metaAnemia', header: 'Meta Hb', width: 16 },
      { id: 'reservaFerro', header: 'Estoque Ferro', width: 20 },
      { id: 'epoEmUso', header: 'Alfaepoetina', width: 16 },
      { id: 'ferroEmUso', header: 'Ferro IV', width: 16 }
    ]
  },
  {
    id: 'metabolismo_osseo',
    title: 'Metabolismo Ósseo',
    category: 'laboratorio',
    description: 'Controle de cálcio, cálcio corrigido pela albumina, fósforo, PTH e FA.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'ca', header: 'Cálcio', width: 12 },
      { id: 'caCorrigido', header: 'Ca Corrigido', width: 14 },
      { id: 'fosforo', header: 'Fósforo', width: 12 },
      { id: 'produtoCaP', header: 'Ca x P', width: 12 },
      { id: 'pth', header: 'PTH', width: 14 },
      { id: 'fa', header: 'FA (U/L)', width: 12 },
      { id: 'vitD', header: 'Vit D', width: 12 },
      { id: 'statusDMO', header: 'Avaliação DMO', width: 20 },
      { id: 'quelanteEmUso', header: 'Quelante', width: 20 }
    ]
  },
  {
    id: 'adequacao_dialitica',
    title: 'Adequação Dialítica',
    category: 'laboratorio',
    description: 'Depuração fornecida: Kt/V Daugirdas II, ureia pré e pós, e taxa de redução UR%.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'ktv', header: 'Kt/V Único', width: 12 },
      { id: 'metaKtv', header: 'Meta Kt/V', width: 16 },
      { id: 'ureiaPre', header: 'Ureia Pré', width: 14 },
      { id: 'ureiaPos', header: 'Ureia Pós', width: 14 },
      { id: 'taxaReducaoUreia', header: 'UR (%)', width: 12 },
      { id: 'creatinina', header: 'Creatinina', width: 12 },
      { id: 'clinica', header: 'Unidade', width: 20 }
    ]
  },
  {
    id: 'gasometria_acido_basico',
    title: 'Equilíbrio Ácido-Básico',
    category: 'laboratorio',
    description: 'Bicarbonato sérico, pH e vigilância de acidose metabólica crônica.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'hco3', header: 'Bicarbonato (mEq/L)', width: 18 },
      { id: 'classificacao', header: 'Status Ácido-Básico', width: 22 },
      { id: 'ph', header: 'pH Sérico', width: 12 },
      { id: 'condutaBanho', header: 'Conduta no Banho', width: 22 },
      { id: 'reposicaoOral', header: 'Reposição Oral', width: 22 },
      { id: 'clinica', header: 'Unidade', width: 20 }
    ]
  },
  {
    id: 'nutricao_inflamacao',
    title: 'Nutrição e Inflamação',
    category: 'laboratorio',
    description: 'Vigilância de desnutrição proteico-energética, PCR e controle glicêmico.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'albumina', header: 'Albumina (g/dL)', width: 16 },
      { id: 'pcr', header: 'PCR (mg/L)', width: 14 },
      { id: 'pesoSeco', header: 'Peso Seco', width: 14 },
      { id: 'imc', header: 'IMC (kg/m²)', width: 14 },
      { id: 'statusNutricional', header: 'Nutrição', width: 20 },
      { id: 'glicemia', header: 'Glicemia', width: 14 },
      { id: 'hba1c', header: 'HbA1c (%)', width: 12 }
    ]
  },

  // ================= 4. FARMÁCIA =================
  {
    id: 'mapa_medicamentos',
    title: 'Mapa Farmacológico',
    category: 'farmacia_infeccao',
    description: 'Prescrições farmacológicas ativas, doses e vias de administração.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'medicamento', header: 'Medicamento', width: 26 },
      { id: 'categoria', header: 'Categoria', width: 20 },
      { id: 'dosagem', header: 'Dosagem', width: 16 },
      { id: 'posologia', header: 'Posologia', width: 20 },
      { id: 'via', header: 'Via', width: 10 },
      { id: 'tipo', header: 'Tipo', width: 14 }
    ]
  },
  {
    id: 'ciclos_medicamentosos',
    title: 'Ciclos Medicamentosos',
    category: 'farmacia_infeccao',
    description: 'Prazos de tratamentos temporários a vencer e ciclos vencidos.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'medicamento', header: 'Fármaco', width: 24 },
      { id: 'dosagem', header: 'Dose', width: 14 },
      { id: 'dataInicio', header: 'Início', width: 14 },
      { id: 'dataFim', header: 'Término', width: 14 },
      { id: 'diasRestantes', header: 'Prazo', width: 16 },
      { id: 'statusCiclo', header: 'Status', width: 18 }
    ]
  },
  {
    id: 'antibioticoterapia',
    title: 'Antimicrobianos',
    category: 'farmacia_infeccao',
    description: 'Antibióticos em curso, vias pós-HD e indicação clínica.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'antibiotico', header: 'Antimicrobiano', width: 24 },
      { id: 'dosagem', header: 'Dose', width: 14 },
      { id: 'via', header: 'Via', width: 10 },
      { id: 'dataInicio', header: 'Início', width: 14 },
      { id: 'dataFim', header: 'Término', width: 14 },
      { id: 'observacao', header: 'Indicação', width: 28 },
      { id: 'tipoAcesso', header: 'Acesso', width: 18 }
    ]
  },
  {
    id: 'hemoculturas_lock',
    title: 'Hemoculturas e Lock',
    category: 'farmacia_infeccao',
    description: 'Culturas microbiológicas, patógenos isolados e selos antimicrobianos.',
    columns: [
      { id: 'dataColeta', header: 'Data Coleta', width: 14 },
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'sitio', header: 'Sítio Coleta', width: 18 },
      { id: 'status', header: 'Resultado', width: 16 },
      { id: 'patogeno', header: 'Patógeno Isolado', width: 28 },
      { id: 'antibiograma', header: 'Sensibilidade', width: 28 },
      { id: 'tipoAcesso', header: 'Acesso', width: 18 }
    ]
  },
  {
    id: 'historico_receitas',
    title: 'Histórico de Receitas',
    category: 'farmacia_infeccao',
    description: 'Auditoria de receitas simples e controle especial emitidas pelo sistema.',
    columns: [
      { id: 'dataEmissao', header: 'Data Emissão', width: 14 },
      { id: 'numeroReceita', header: 'Nº Receita', width: 16 },
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'tipoReceita', header: 'Tipo Receita', width: 18 },
      { id: 'totalItens', header: 'Itens', width: 10 },
      { id: 'resumoMedicamentos', header: 'Medicamentos Prescritos', width: 34 },
      { id: 'medico', header: 'Médico', width: 22 }
    ]
  },

  // ================= 5. TRANSPLANTE =================
  {
    id: 'fila_transplante',
    title: 'Fila de Transplante',
    category: 'qualidade_transplante',
    description: 'Elegibilidade no SNT, pacientes em avaliação e contraindicações.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'statusTransplante', header: 'Classificação Transplante', width: 24 },
      { id: 'idade', header: 'Idade', width: 10 },
      { id: 'tempoDialise', header: 'Tempo em HD', width: 16 },
      { id: 'tipoAcesso', header: 'Acesso', width: 18 },
      { id: 'clinica', header: 'Unidade', width: 20 },
      { id: 'observacoes', header: 'Centro Transplantador', width: 28 }
    ]
  },
  {
    id: 'panorama_consolidado',
    title: 'Metas Clínicas',
    category: 'qualidade_transplante',
    description: 'Score de metas KDIGO e SBN: Hb, fósforo, potássio, Kt/V e FAV definitiva.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'scoreConformidade', header: 'Score Metas', width: 18 },
      { id: 'statusGeral', header: 'Status Geral', width: 18 },
      { id: 'metaHb', header: 'Hb', width: 10 },
      { id: 'metaFosforo', header: 'P', width: 10 },
      { id: 'metaPotassio', header: 'K', width: 10 },
      { id: 'metaKtv', header: 'Kt/V', width: 10 },
      { id: 'acessoDefinitivo', header: 'Acesso', width: 14 },
      { id: 'clinica', header: 'Unidade', width: 20 }
    ]
  },

  // ================= 6. GESTÃO =================
  {
    id: 'lme_altocusto',
    title: 'LME e Alto Custo',
    category: 'gestao',
    description: 'Gestão de laudos LME e medicamentos CEAF (Epoetina, Noripurum, Sevelamer).',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'medicamento', header: 'Medicamento CEAF', width: 26 },
      { id: 'dataSolicitacao', header: 'Data Laudo', width: 14 },
      { id: 'dataValidade', header: 'Validade LME', width: 14 },
      { id: 'diasRestantes', header: 'Prazo', width: 14 },
      { id: 'statusLme', header: 'Status LME', width: 20 },
      { id: 'cnsPaciente', header: 'CNS Paciente', width: 18 },
      { id: 'clinica', header: 'Unidade', width: 20 }
    ]
  },
  {
    id: 'desligamentos_historico',
    title: 'Desligamentos e Saídas',
    category: 'gestao',
    description: 'Histórico de saídas do programa: óbitos, transplantes e transferências.',
    columns: [
      { id: 'data', header: 'Data Saída', width: 14 },
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'motivo', header: 'Motivo Desligamento', width: 22 },
      { id: 'tempoHD', header: 'Tempo em TRS', width: 16 },
      { id: 'observacoes', header: 'Anotações Clínicas', width: 28 },
      { id: 'clinica', header: 'Unidade', width: 20 },
      { id: 'medico', header: 'Responsável', width: 20 }
    ]
  },
  {
    id: 'vigilancia_sorologias',
    title: 'Vigilância Sorológica',
    category: 'gestao',
    description: 'Rastreio sanitário (RDC 11 Anvisa): Hepatite B, Hepatite C e HIV.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 26 },
      { id: 'hbsag', header: 'HBsAg', width: 14 },
      { id: 'antiHbs', header: 'Anti-HBs', width: 14 },
      { id: 'antiHcv', header: 'Anti-HCV', width: 14 },
      { id: 'hiv', header: 'HIV', width: 12 },
      { id: 'statusVacinal', header: 'Imunidade Hep B', width: 20 },
      { id: 'alocacaoSala', header: 'Isolamento Sanitário', width: 22 },
      { id: 'clinica', header: 'Unidade', width: 20 }
    ]
  },
  {
    id: 'convenios_operadoras',
    title: 'Convênios e Operadoras',
    category: 'gestao',
    description: 'Distribuição dos pacientes por operadoras de saúde, planos e SUS.',
    columns: [
      { id: 'nome', header: 'Paciente', width: 28 },
      { id: 'convenio', header: 'Convênio / Operadora', width: 24 },
      { id: 'numeroCarteira', header: 'Nº Carteira / CNS', width: 20 },
      { id: 'cpf', header: 'CPF', width: 16 },
      { id: 'turno', header: 'Turno', width: 14 },
      { id: 'diaSemana', header: 'Escala', width: 16 },
      { id: 'clinica', header: 'Unidade', width: 22 }
    ]
  }
];

/**
 * Filtra a lista de pacientes conforme os critérios selecionados pelo usuário,
 * garantindo isolamento estrito multi-tenant por médico responsável.
 */
export function filterPatientsForReport(patients = [], filters = {}, currentDoctorId = null) {
  const {
    unidade = 'todos',
    turno = 'todos',
    diaSemana = 'todos',
    tipoAcesso = 'todos',
    statusTransplante = 'todos',
    anticoagulacao = 'todos',
    convenio = 'todos',
    comAlertaApenas = false,
    busca = ''
  } = filters;

  const searchNormalized = busca ? busca.trim().toLowerCase() : '';

  return patients.filter(p => {
    // 0. Isolamento Multi-Tenant estrito por médico responsável
    if (currentDoctorId && p.doctorId && p.doctorId !== currentDoctorId) {
      return false;
    }

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

    // 7. Anticoagulação
    if (anticoagulacao && anticoagulacao !== 'todos') {
      const acInfo = getAnticoagulacaoInfo(p);
      if (anticoagulacao === 'sem_heparina' && !acInfo.isSemHeparina) return false;
      if (anticoagulacao === 'enoxaparina' && acInfo.tipo !== 'enoxaparina') return false;
      if (anticoagulacao === 'heparina_padrao' && (acInfo.isSemHeparina || acInfo.tipo === 'enoxaparina')) return false;
    }

    // 8. Convênio / Operadora
    if (convenio && convenio !== 'todos') {
      const pConv = (p.convenio || p.planoSaude || 'SUS').toLowerCase();
      if (convenio === 'sus' && !pConv.includes('sus')) return false;
      if (convenio === 'convenio' && pConv.includes('sus')) return false;
    }

    // 9. Apenas com Alertas
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

  // Protocolo sem heparina é alerta de alto risco
  const acInfo = getAnticoagulacaoInfo(patient);
  if (acInfo.isSemHeparina) return true;

  // LME vencendo ou vencida
  if (Array.isArray(patient.lmes)) {
    const hasLmeAlert = patient.lmes.some(lme => {
      const st = getLmeExpirationStatus(lme);
      return st.status === 'vencido' || st.status === 'a_vencer';
    });
    if (hasLmeAlert) return true;
  }

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
 * Gera as linhas de dados e KPIs resumidos para qualquer um dos 26 relatórios
 * @param {string} reportId - ID do relatório
 * @param {Array} filteredPatients - Pacientes previamente filtrados
 * @param {Array} auditLogs - Logs de auditoria para relatórios históricos
 * @param {string|null} currentDoctorId - ID do médico para garantir isolamento multi-tenant absoluto
 */
export function generateReportData(reportId, filteredPatients = [], auditLogs = [], currentDoctorId = null) {
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
        { label: 'Total', value: rows.length },
        { label: 'Fístulas (FAV)', value: rows.filter(r => r.tipoAcesso.toLowerCase().includes('fav') || r.tipoAcesso.toLowerCase().includes('fístula')).length },
        { label: 'Cateteres', value: rows.filter(r => r.tipoAcesso.toLowerCase().includes('cath') || r.tipoAcesso.toLowerCase().includes('cateter') || r.tipoAcesso.toLowerCase().includes('cdl')).length },
        { label: 'Lista Tx', value: rows.filter(r => r.statusTransplante.toLowerCase().includes('lista')).length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 2. Demografia
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
          else { faixa = '≥ 75 anos'; maior75++; }
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
        { label: 'Avaliados', value: rows.length },
        { label: 'Idosos (≥60)', value: `${de60a74 + maior75} (${rows.length ? Math.round(((de60a74 + maior75)/rows.length)*100) : 0}%)` },
        { label: 'Adultos (40-59)', value: de40a59 },
        { label: 'Jovens (<40)', value: menor40 }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 3. Turnos e Escalas
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

      rows.sort((a, b) => a.diaSemana.localeCompare(b.diaSemana) || a.turno.localeCompare(b.turno) || a.nome.localeCompare(b.nome));

      const segQuaSex = rows.filter(r => r.diaSemana.includes('Seg')).length;
      const terQuiSab = rows.filter(r => r.diaSemana.includes('Ter')).length;

      const kpis = [
        { label: 'Total', value: rows.length },
        { label: 'Seg Qua Sex', value: segQuaSex },
        { label: 'Ter Qui Sáb', value: terQuiSab },
        { label: 'Unidades', value: new Set(rows.map(r => r.clinica)).size }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 4. Etiologias DRC
    // ----------------------------------------------------
    case 'etiologias_drc': {
      const counts = {};
      const rows = filteredPatients.map(p => {
        const etio = p.etiologiaDRC || 'Indeterminada';
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
        { label: 'Total', value: rows.length },
        { label: 'Diabetes', value: `${dmCount} (${rows.length ? Math.round((dmCount/rows.length)*100) : 0}%)` },
        { label: 'Hipertensão', value: `${hasCount} (${rows.length ? Math.round((hasCount/rows.length)*100) : 0}%)` },
        { label: 'Outras Causas', value: rows.length - dmCount - hasCount }
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
          alerta = '⚠️ CDL Provisório';
          cdlCount++;
        } else if (tipoLower.includes('permcath') || tipoLower.includes('longa')) {
          alerta = 'Permcath';
          permCount++;
        } else if (tipoLower.includes('fav') || tipoLower.includes('fístula')) {
          alerta = '✓ FAV Pérvia';
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
        { label: 'Taxa FAV', value: `${taxaFav}% (${favCount}/${rows.length})` },
        { label: 'Permcath', value: permCount },
        { label: 'CDL Temporário', value: cdlCount },
        { label: 'Meta SBN (≥80% FAV)', value: taxaFav >= 80 ? '✓ Atingida' : '⚠️ Abaixo' }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 6. Prescrições HD
    // ----------------------------------------------------
    case 'prescricoes_hd': {
      const rows = filteredPatients.map(p => {
        const av = p.acessoVascular || {};
        const acInfo = getAnticoagulacaoInfo(p);

        return {
          nome: p.nome || 'Paciente',
          capilar: p.capilar || p.prescricaoDialise?.capilar || 'Polissulfona 1.8m²',
          fluxoSangue: av.fluxoSangue ? `${av.fluxoSangue} ml/min` : '350 ml/min',
          fluxoDialisato: av.fluxoDialisato ? `${av.fluxoDialisato} ml/min` : '500 ml/min',
          pesoSeco: p.pesoSeco ? `${p.pesoSeco} kg` : 'N/I',
          duracaoSessao: p.tempoSessao || '4 horas',
          anticoagulacao: acInfo.labelCurto,
          turno: p.turno || '1º Turno'
        };
      });

      const kpis = [
        { label: 'Prescrições Ativas', value: rows.length },
        { label: 'Qb Médio', value: '350 ml/min' },
        { label: 'Qd Padrão', value: '500 ml/min' },
        { label: 'Tempo Médio', value: '4 horas' }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 7. Anticoagulação (NOVO)
    // ----------------------------------------------------
    case 'anticoagulacao_hd': {
      let semHeparinaCount = 0, enoxaCount = 0, hnfCount = 0;

      const rows = filteredPatients.map(p => {
        const acInfo = getAnticoagulacaoInfo(p);
        let proto = 'HNF Padrão';
        let doseAtq = `${acInfo.doseAtaque || 1000} UI`;
        let doseManut = `${acInfo.doseManutencao || 500} UI/h`;
        let status = 'Regular';
        let just = acInfo.observacoes || 'Manutenção habitual de patência do circuito';

        if (acInfo.isSemHeparina) {
          proto = 'SEM HEPARINA';
          doseAtq = '-';
          doseManut = '-';
          status = '🚨 Risco Hemorrágico';
          just = acInfo.motivo || 'Risco de sangramento ativo ou pós-operatório';
          semHeparinaCount++;
        } else if (acInfo.tipo === 'enoxaparina') {
          proto = 'Enoxaparina (HBPM)';
          doseAtq = `${acInfo.doseEnoxaparina || 40} mg`;
          doseManut = 'Dose única';
          status = '✓ HBPM Ativa';
          enoxaCount++;
        } else {
          hnfCount++;
        }

        return {
          nome: p.nome || 'Paciente',
          protocolo: proto,
          doseAtaque: doseAtq,
          doseManutencao: doseManut,
          statusSeguranca: status,
          motivo: just,
          clinica: p.clinica || 'N/I'
        };
      });

      const kpis = [
        { label: 'Total', value: rows.length },
        { label: 'HNF Padrão', value: hnfCount },
        { label: 'Enoxaparina', value: enoxaCount },
        { label: 'Sem Heparina', value: semHeparinaCount }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 8. Balanço Volêmico
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
        let status = 'Sem aferição recente';

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
            status = '✓ No Alvo (<4%)';
            noAlvo++;
          } else {
            status = 'Abaixo do Seco';
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
        { label: 'Com Pesagem', value: rows.filter(r => r.percentualGanho !== 'N/I').length },
        { label: 'No Alvo (<4%)', value: noAlvo },
        { label: 'Ganho Elevado (4-5%)', value: alertaModerado },
        { label: 'Grave (>5%)', value: alertaGrave }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 9. Intercorrências
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
                medico: evo.medicoNome || 'Nefrologista'
              });
            }
          });
        }
      });

      rows.sort((a, b) => b.data.localeCompare(a.data));

      const hipotensao = rows.filter(r => r.tipoIntercorrencia.toLowerCase().includes('hipotens')).length;
      const caimbra = rows.filter(r => r.tipoIntercorrencia.toLowerCase().includes('câimbra') || r.tipoIntercorrencia.toLowerCase().includes('caimbra')).length;

      const kpis = [
        { label: 'Total Registros', value: rows.length },
        { label: 'Hipotensão', value: hipotensao },
        { label: 'Câimbras', value: caimbra },
        { label: 'Outros Eventos', value: rows.length - hipotensao - caimbra }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 10. Alertas Laboratoriais
    // ----------------------------------------------------
    case 'alertas_laboratoriais': {
      const rows = [];

      filteredPatients.forEach(p => {
        const ex = p.exames || {};
        const alertas = [];

        if (ex.k) {
          if (Number(ex.k) > 5.5) alertas.push(`🚨 K ${ex.k}`);
          else if (Number(ex.k) < 3.5) alertas.push(`⚠️ K baixo ${ex.k}`);
        }
        if (ex.hb) {
          if (Number(ex.hb) < 10.0) alertas.push(`🚨 Hb ${ex.hb}`);
          else if (Number(ex.hb) > 13.0) alertas.push(`⚠️ Hb ${ex.hb}`);
        }
        if (ex.fosforo && Number(ex.fosforo) > 5.5) {
          alertas.push(`⚠️ P ${ex.fosforo}`);
        }
        if (ex.pth) {
          if (Number(ex.pth) > 600) alertas.push(`🚨 PTH ${ex.pth}`);
          else if (Number(ex.pth) < 100) alertas.push(`⚠️ PTH baixo ${ex.pth}`);
        }
        if (ex.ktv && Number(ex.ktv) < 1.2) {
          alertas.push(`⚠️ Kt/V ${ex.ktv}`);
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
        { label: 'Com Alertas', value: rows.length },
        { label: 'Potássio (K)', value: rows.filter(r => r.alertasAtivos.includes('K')).length },
        { label: 'Anemia (Hb)', value: rows.filter(r => r.alertasAtivos.includes('Hb')).length },
        { label: 'Fósforo (P)', value: rows.filter(r => r.alertasAtivos.includes('P ')).length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 11. Anemia e Ferro
    // ----------------------------------------------------
    case 'perfil_anemia': {
      let noAlvoHb = 0, subAlvoHb = 0, acimaAlvoHb = 0;

      const rows = filteredPatients.map(p => {
        const ex = p.exames || {};
        const hb = Number(ex.hb) || null;
        const ist = Number(ex.ist) || null;
        const ferritina = Number(ex.ferritina) || null;

        let metaHb = 'Sem exame';
        if (hb) {
          if (hb >= 10.0 && hb <= 12.0) {
            metaHb = '✓ No Alvo';
            noAlvoHb++;
          } else if (hb < 10.0) {
            metaHb = '🚨 Sub-alvo';
            subAlvoHb++;
          } else {
            metaHb = '⚠️ Elevado';
            acimaAlvoHb++;
          }
        }

        let reserva = 'Não avaliada';
        if (ist && ferritina) {
          if (ist < 20 || ferritina < 200) {
            reserva = '🚨 Ferropenia';
          } else if (ferritina > 800) {
            reserva = '⚠️ Sobrecarga';
          } else {
            reserva = '✓ Adequado';
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
        { label: 'Conformidade Hb', value: `${pctNoAlvo}% (${noAlvoHb}/${totalAvaliados})` },
        { label: 'Hb < 10 g/dL', value: subAlvoHb },
        { label: 'Hb > 12 g/dL', value: acimaAlvoHb },
        { label: 'Meta KDIGO', value: pctNoAlvo >= 70 ? '✓ Excelente' : '⚠️ Regular' }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 12. Metabolismo Ósseo (Com Ca Corrigido e FA)
    // ----------------------------------------------------
    case 'metabolismo_osseo': {
      let pNoAlvo = 0, pAlto = 0;

      const rows = filteredPatients.map(p => {
        const ex = p.exames || {};
        const ca = Number(ex.ca) || null;
        const alb = Number(ex.albumina) || null;
        const pVal = Number(ex.fosforo) || null;
        const pth = Number(ex.pth) || null;

        // Cálculo de Cálcio Corrigido pela Albumina: Ca + 0.8 * (4 - Alb)
        let caCorrigidoStr = 'N/I';
        if (ca && alb) {
          const calcCorr = ca + 0.8 * (4.0 - alb);
          caCorrigidoStr = `${calcCorr.toFixed(1)} mg/dL`;
        } else if (ca) {
          caCorrigidoStr = `${ca} mg/dL`;
        }

        let prodCaP = 'N/I';
        if (ca && pVal) {
          prodCaP = (ca * pVal).toFixed(1);
        }

        let statusDmo = 'Rotina';
        if (pVal) {
          if (pVal >= 3.5 && pVal <= 5.5) {
            pNoAlvo++;
          } else if (pVal > 5.5) {
            pAlto++;
            statusDmo = '⚠️ Hiperfosfatemia';
          }
        }
        if (pth && pth > 600) {
          statusDmo = '🚨 HPTS Severo';
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
          caCorrigido: caCorrigidoStr,
          fosforo: pVal ? `${pVal} mg/dL` : 'N/I',
          produtoCaP: prodCaP !== 'N/I' ? prodCaP : 'N/I',
          pth: pth ? `${pth} pg/mL` : 'N/I',
          fa: ex.fa ? `${ex.fa} U/L` : 'N/I',
          vitD: ex.vitD ? `${ex.vitD} ng/mL` : 'N/I',
          statusDMO: statusDmo,
          quelanteEmUso: quelante ? `${quelante.nome} (${quelante.dosagem || ''})` : 'Nenhum'
        };
      });

      const totalP = pNoAlvo + pAlto;
      const kpis = [
        { label: 'Fósforo no Alvo', value: `${totalP ? Math.round((pNoAlvo / totalP) * 100) : 0}% (${pNoAlvo}/${totalP})` },
        { label: 'Fósforo > 5.5', value: pAlto },
        { label: 'PTH > 600', value: rows.filter(r => r.statusDMO.includes('HPTS')).length },
        { label: 'Com Quelante', value: rows.filter(r => r.quelanteEmUso !== 'Nenhum').length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 13. Adequação Dialítica (Com Kt/V e UR%)
    // ----------------------------------------------------
    case 'adequacao_dialitica': {
      let ktvAdequado = 0, ktvInadequado = 0;

      const rows = filteredPatients.map(p => {
        const ex = p.exames || {};
        const ktv = Number(ex.ktv) || null;
        const pre = Number(ex.ureiaPre) || null;
        const pos = Number(ex.ureiaPos) || null;

        let meta = 'Sem exame';
        if (ktv) {
          if (ktv >= 1.20) {
            meta = '✓ Adequado (≥1.2)';
            ktvAdequado++;
          } else {
            meta = '🚨 Inadequado (<1.2)';
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
        { label: 'Adequação Kt/V', value: `${pctKtv}% (${ktvAdequado}/${totalKtv})` },
        { label: 'Subdiálise (<1.2)', value: ktvInadequado },
        { label: 'Kt/V Médio', value: totalKtv ? (rows.filter(r => r.ktv !== 'N/I').reduce((acc, r) => acc + parseFloat(r.ktv), 0) / totalKtv).toFixed(2) : 'N/I' },
        { label: 'Meta SBN', value: pctKtv >= 85 ? '✓ Atingida' : '⚠️ Atenção' }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 14. Equilíbrio Ácido-Básico (NOVO)
    // ----------------------------------------------------
    case 'gasometria_acido_basico': {
      let noAlvoHco3 = 0, acidoseCount = 0, alcaloseCount = 0;

      const rows = filteredPatients.map(p => {
        const ex = p.exames || {};
        const hco3Val = Number(ex.hco3 || ex.bicarbonato) || null;
        const phVal = Number(ex.ph) || null;

        let statusAb = 'Sem gasometria';
        let banho = 'Padrão (32 mEq/L)';
        let reposicao = 'Não necessária';

        if (hco3Val) {
          if (hco3Val >= 22.0 && hco3Val <= 26.0) {
            statusAb = '✓ Normal (22-26)';
            noAlvoHco3++;
          } else if (hco3Val < 22.0) {
            statusAb = '🚨 Acidose Metabólica';
            banho = 'Elevar Banho (35-38 mEq/L)';
            reposicao = hco3Val < 20 ? 'Bicarbonato 500mg VO' : 'Monitorar pré-HD';
            acidoseCount++;
          } else {
            statusAb = '⚠️ Alcalose Metabólica';
            banho = 'Reduzir Banho (30 mEq/L)';
            alcaloseCount++;
          }
        }

        return {
          nome: p.nome || 'Paciente',
          hco3: hco3Val ? `${hco3Val} mEq/L` : 'N/I',
          classificacao: statusAb,
          ph: phVal ? `${phVal}` : 'N/I',
          condutaBanho: banho,
          reposicaoOral: reposicao,
          clinica: p.clinica || 'N/I'
        };
      });

      const totalHco3 = noAlvoHco3 + acidoseCount + alcaloseCount;
      const kpis = [
        { label: 'No Alvo (22-26)', value: `${totalHco3 ? Math.round((noAlvoHco3 / totalHco3) * 100) : 0}% (${noAlvoHco3}/${totalHco3})` },
        { label: 'Acidose (<22)', value: acidoseCount },
        { label: 'Alcalose (>26)', value: alcaloseCount },
        { label: 'Avaliados', value: totalHco3 }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 15. Nutrição e Inflamação
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
            statusNutri = '🚨 Hipoalbuminemia';
            hipoalbumina++;
          } else if (alb >= 4.0) {
            statusNutri = '✓ Eutrófico (≥4.0)';
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
        { label: 'Hipoalbuminemia', value: hipoalbumina },
        { label: 'PCR Elevada (>5)', value: inflamado },
        { label: 'Albumina ≥ 4.0', value: rows.filter(r => r.statusNutricional.includes('Eutrófico')).length },
        { label: 'Avaliados', value: rows.length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 16. Mapa Farmacológico
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
            dosagem: m.dosagem || 'Conforme receita',
            posologia: m.frequencia || 'Uso contínuo',
            via: m.via || 'VO',
            tipo: m.tipo === 'temporario' ? 'Temporário' : 'Contínuo'
          });
        });
      });

      rows.sort((a, b) => a.nome.localeCompare(b.nome) || a.medicamento.localeCompare(b.medicamento));

      const kpis = [
        { label: 'Total Itens', value: rows.length },
        { label: 'Pacientes', value: new Set(rows.map(r => r.nome)).size },
        { label: 'Uso Contínuo', value: rows.filter(r => r.tipo === 'Contínuo').length },
        { label: 'Temporários', value: rows.filter(r => r.tipo === 'Temporário').length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 17. Ciclos Medicamentosos
    // ----------------------------------------------------
    case 'ciclos_medicamentosos': {
      const rows = [];
      const today = new Date().toISOString().split('T')[0];

      filteredPatients.forEach(p => {
        const meds = Array.isArray(p.medicamentos) ? p.medicamentos.filter(m => m.ativo && m.dataFim) : [];
        meds.forEach(m => {
          const diffDays = Math.ceil((new Date(m.dataFim) - new Date(today)) / (1000 * 60 * 60 * 24));
          let status = 'Vigente';
          if (diffDays < 0) {
            status = `🚨 Vencido há ${Math.abs(diffDays)}d`;
          } else if (diffDays === 0) {
            status = '🚨 Vence hoje';
          } else if (diffDays <= 7) {
            status = `⚠️ Vence em ${diffDays}d`;
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
        { label: 'Total Ciclos', value: rows.length },
        { label: 'Vencidos', value: vencidos },
        { label: 'Vencendo em 7d', value: prestesAVencer },
        { label: 'Regulares', value: rows.length - vencidos - prestesAVencer }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 18. Antimicrobianos
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
              dataFim: m.dataFim || 'Em curso',
              observacao: m.observacao || 'Infecção em hemodiálise',
              tipoAcesso: p.acessoVascular?.tipo || p.tipoAcesso || 'N/I'
            });
          }
        });
      });

      const kpis = [
        { label: 'Pacientes em Uso', value: new Set(rows.map(r => r.nome)).size },
        { label: 'Tratamentos Ativos', value: rows.length },
        { label: 'Em Cateter', value: rows.filter(r => r.tipoAcesso.toLowerCase().includes('cat')).length },
        { label: 'Em Fístula', value: rows.filter(r => r.tipoAcesso.toLowerCase().includes('fav')).length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 19. Hemoculturas e Lock
    // ----------------------------------------------------
    case 'hemoculturas_lock': {
      const rows = [];

      filteredPatients.forEach(p => {
        if (Array.isArray(p.hemoculturas)) {
          p.hemoculturas.forEach(hc => {
            rows.push({
              dataColeta: hc.dataColeta || 'N/I',
              nome: p.nome || 'Paciente',
              sitio: hc.sitio || 'Acesso',
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
        { label: 'Coletas', value: rows.length },
        { label: 'Positivas', value: positivas },
        { label: 'Negativas', value: rows.length - positivas },
        { label: 'Em Análise', value: rows.filter(r => (r.status || '').includes('Pendente')).length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 20. Histórico de Receitas
    // ----------------------------------------------------
    case 'historico_receitas': {
      const rows = [];

      filteredPatients.forEach(p => {
        if (Array.isArray(p.receitas)) {
          p.receitas.forEach(rec => {
            const medicamentosStr = Array.isArray(rec.itens)
              ? rec.itens.map(it => `${it.medicamentoNome || it.nome} (${it.posologia || it.quantidade})`).join('; ')
              : 'Nenhum medicamento';

            rows.push({
              dataEmissao: rec.dataEmissao || 'N/I',
              numeroReceita: rec.numeroReceita || rec.id?.slice(-8).toUpperCase() || 'N/I',
              nome: p.nome || 'Paciente',
              tipoReceita: rec.tipoReceita === 'controle_especial' ? 'Controle Especial' : 'Simples',
              totalItens: Array.isArray(rec.itens) ? rec.itens.length : 0,
              resumoMedicamentos: medicamentosStr,
              medico: rec.medicoNome || 'Nefrologista'
            });
          });
        }
      });

      rows.sort((a, b) => b.dataEmissao.localeCompare(a.dataEmissao));

      const especiais = rows.filter(r => r.tipoReceita === 'Controle Especial').length;

      const kpis = [
        { label: 'Receitas Emitidas', value: rows.length },
        { label: 'Simples', value: rows.length - especiais },
        { label: 'Controle Especial', value: especiais },
        { label: 'Pacientes', value: new Set(rows.map(r => r.nome)).size }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 21. Fila de Transplante
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
          observacoes: p.observacoesClinicas || 'Sem anotações'
        };
      });

      rows.sort((a, b) => a.statusTransplante.localeCompare(b.statusTransplante) || a.nome.localeCompare(b.nome));

      const ativoLista = counts['Ativo em Lista de Espera'] || 0;
      const emAvaliacao = (counts['Encaminhado / Em Avaliação'] || 0) + (counts['Encaminhar / Em Triagem'] || 0);
      const contraindicado = (counts['Contraindicação Provisória'] || 0) + (counts['Contraindicação Definitiva'] || 0);

      const kpis = [
        { label: 'Lista Ativa', value: `${ativoLista} (${rows.length ? Math.round((ativoLista/rows.length)*100) : 0}%)` },
        { label: 'Em Avaliação', value: emAvaliacao },
        { label: 'Contraindicação', value: contraindicado },
        { label: 'Total', value: rows.length }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 22. Metas Clínicas (Panorama Consolidado)
    // ----------------------------------------------------
    case 'panorama_consolidado': {
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

        // 3. Potássio entre 3.5 e 5.5
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

        let status = 'Regular';
        if (scorePct >= 80) status = '✓ Excelente (≥80%)';
        else if (scorePct >= 60) status = 'Bom (60-79%)';
        else status = '🚨 Fora (<60%)';

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
        { label: 'Excelência (≥80%)', value: `${pctExcelencia}% (${highPerformers}/${rows.length})` },
        { label: 'Metas Avaliadas', value: 'Hb, P, K, Kt/V, FAV' },
        { label: 'Total', value: rows.length },
        { label: 'Índice de Qualidade', value: pctExcelencia >= 75 ? 'Excelente' : 'Regular' }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 23. LME e Alto Custo (NOVO)
    // ----------------------------------------------------
    case 'lme_altocusto': {
      const rows = [];
      let vigentes = 0, aVencer = 0, vencidos = 0;

      filteredPatients.forEach(p => {
        const lmes = Array.isArray(p.lmes) ? p.lmes : [];
        if (lmes.length > 0) {
          lmes.forEach(lme => {
            const exp = getLmeExpirationStatus(lme);
            let statusLabel = '✓ Válido';
            if (exp.status === 'vencido') {
              statusLabel = `🚨 Vencido (${exp.diasVencido || 0}d)`;
              vencidos++;
            } else if (exp.status === 'a_vencer') {
              statusLabel = `⚠️ Vence em ${exp.diasRestantes}d`;
              aVencer++;
            } else {
              vigentes++;
            }

            rows.push({
              nome: p.nome || 'Paciente',
              medicamento: lme.medicamentoNome || 'Medicamento CEAF',
              dataSolicitacao: lme.dataSolicitacao || 'N/I',
              dataValidade: lme.dataValidade || 'N/I',
              diasRestantes: exp.diasRestantes !== undefined ? `${exp.diasRestantes}d` : 'N/I',
              statusLme: statusLabel,
              cnsPaciente: p.cns || 'Não cadastrado',
              clinica: p.clinica || 'N/I'
            });
          });
        }
      });

      rows.sort((a, b) => parseInt(a.diasRestantes) - parseInt(b.diasRestantes));

      const kpis = [
        { label: 'LMEs Ativas', value: rows.length },
        { label: 'Válidas', value: vigentes },
        { label: 'Vencendo em 30d', value: aVencer },
        { label: 'Vencidas', value: vencidos }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 24. Desligamentos e Saídas (NOVO)
    // ----------------------------------------------------
    case 'desligamentos_historico': {
      const rows = [];

      // 1. Coleta de logs de auditoria de desligamento estritamente pertinentes ao médico ativo
      if (Array.isArray(auditLogs)) {
        auditLogs.forEach(log => {
          // Bloqueio multi-tenant: se o log pertencer explicitamente a outro médico, descarta
          if (currentDoctorId && log.targetDoctorId && log.targetDoctorId !== currentDoctorId) {
            return;
          }

          if (log.tipoAcao === 'PATIENT_DISCHARGED' || (log.descricao || '').includes('desligado')) {
            const det = log.detalhes || {};
            // Proteção adicional se os detalhes referenciarem outro médico
            if (currentDoctorId && det.doctorId && det.doctorId !== currentDoctorId) {
              return;
            }

            rows.push({
              data: det.dataOcorrencia || (log.timestamp ? log.timestamp.split('T')[0] : 'N/I'),
              nome: det.patientName || log.descricao.replace(/Paciente\s+(.*?)\s+desligado.*/i, '$1') || 'Paciente',
              motivo: det.motivo || 'Desligamento',
              tempoHD: 'TRS Encerrada',
              observacoes: det.observacoes || log.descricao || '-',
              clinica: 'Registrado em Prontuário',
              medico: log.targetDoctorName || 'Médico Responsável'
            });
          }
        });
      }

      // 2. Coleta de pacientes com status inativo no prontuário do médico ativo
      filteredPatients.forEach(p => {
        if (currentDoctorId && p.doctorId && p.doctorId !== currentDoctorId) return;

        if (p.status === 'Desligado' || p.status === 'Óbito' || p.status === 'Transplantado') {
          // Evita duplicatas se já veio pelo auditLog
          const exists = rows.some(r => r.nome.toLowerCase() === (p.nome || '').toLowerCase());
          if (!exists) {
            rows.push({
              data: p.dataDesligamento || p.atualizadoEm?.split('T')[0] || 'N/I',
              nome: p.nome || 'Paciente',
              motivo: p.motivoDesligamento || p.status,
              tempoHD: formatDialysisDuration(p.dataInicioDialise),
              observacoes: p.observacoesClinicas || '-',
              clinica: p.clinica || 'N/I',
              medico: 'Médico Assistente'
            });
          }
        }
      });

      rows.sort((a, b) => b.data.localeCompare(a.data));

      const obitos = rows.filter(r => r.motivo.toLowerCase().includes('óbito') || r.motivo.toLowerCase().includes('obito')).length;
      const transplantes = rows.filter(r => r.motivo.toLowerCase().includes('transplante')).length;
      const transferencias = rows.filter(r => r.motivo.toLowerCase().includes('transfer')).length;

      const kpis = [
        { label: 'Total Saídas', value: rows.length },
        { label: 'Óbitos', value: obitos },
        { label: 'Transplantes', value: transplantes },
        { label: 'Transferências', value: transferencias }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 25. Vigilância Sorológica (NOVO)
    // ----------------------------------------------------
    case 'vigilancia_sorologias': {
      let reagentesHbsAg = 0, imunesHbs = 0, suscetiveis = 0;

      const rows = filteredPatients.map(p => {
        const ex = p.exames || {};
        const hbsag = ex.hbsag || 'Não Reagente';
        const antiHbs = ex.antiHbs || 'N/I';
        const antiHcv = ex.antiHcv || 'Não Reagente';
        const hiv = ex.hiv || 'Não Reagente';

        const isHbsAgReagente = hbsag.toLowerCase().includes('reagente') && !hbsag.toLowerCase().includes('não');
        if (isHbsAgReagente) reagentesHbsAg++;

        let statusVac = 'Não avaliado';
        const numAntiHbs = parseFloat(String(antiHbs).replace(/[^\d.-]/g, ''));
        if (!isNaN(numAntiHbs)) {
          if (numAntiHbs >= 10) {
            statusVac = '✓ Imune (≥10 UI/L)';
            imunesHbs++;
          } else {
            statusVac = '⚠️ Suscetível (<10)';
            suscetiveis++;
          }
        } else if (antiHbs.toLowerCase().includes('reagente') && !antiHbs.toLowerCase().includes('não')) {
          statusVac = '✓ Imune';
          imunesHbs++;
        }

        let isolamento = 'Sala Geral';
        if (isHbsAgReagente) {
          isolamento = '🚨 Sala Amarela (Exclusiva)';
        }

        return {
          nome: p.nome || 'Paciente',
          hbsag: isHbsAgReagente ? '🚨 REAGENTE' : hbsag,
          antiHbs: antiHbs,
          antiHcv: antiHcv,
          hiv: hiv,
          statusVacinal: statusVac,
          alocacaoSala: isolamento,
          clinica: p.clinica || 'N/I'
        };
      });

      const kpis = [
        { label: 'Monitorados', value: rows.length },
        { label: 'Imunes Hep B', value: imunesHbs },
        { label: 'Suscetíveis', value: suscetiveis },
        { label: 'HBsAg Reagente', value: reagentesHbsAg }
      ];

      return { rows, kpis };
    }

    // ----------------------------------------------------
    // 26. Convênios e Operadoras (NOVO)
    // ----------------------------------------------------
    case 'convenios_operadoras': {
      let susCount = 0, convenioCount = 0;

      const rows = filteredPatients.map(p => {
        const conv = p.convenio || p.planoSaude || 'SUS';
        const isSus = conv.toLowerCase().includes('sus');
        if (isSus) susCount++;
        else convenioCount++;

        return {
          nome: p.nome || 'Paciente',
          convenio: isSus ? 'SUS (Público)' : conv,
          numeroCarteira: p.carteirinha || p.cns || p.cpf || 'N/I',
          cpf: p.cpf || 'Não informado',
          turno: p.turno || '1º Turno',
          diaSemana: p.diaSemana || 'Seg/Qua/Sex',
          clinica: p.clinica || 'N/I'
        };
      });

      rows.sort((a, b) => a.convenio.localeCompare(b.convenio) || a.nome.localeCompare(b.nome));

      const kpis = [
        { label: 'Total', value: rows.length },
        { label: 'Atendimentos SUS', value: `${susCount} (${rows.length ? Math.round((susCount/rows.length)*100) : 0}%)` },
        { label: 'Saúde Suplementar', value: convenioCount },
        { label: 'Operadoras', value: new Set(rows.map(r => r.convenio)).size }
      ];

      return { rows, kpis };
    }

    default: {
      return generateReportData('censo_geral', filteredPatients, auditLogs);
    }
  }
}

/**
 * Exporta o relatório filtrado diretamente para uma planilha Excel (.xlsx) estruturada
 * com incorporação da logomarca oficial do médico nefrologista
 */
export async function exportReportToExcel(report, rows = [], kpis = [], metadata = {}) {
  const doctorName = metadata.doctorName || 'Médico Nefrologista';
  const doctorCrm = metadata.doctorCrm ? `CRM/${metadata.doctorUf || 'SP'} ${metadata.doctorCrm}` : '';
  const emissionDate = new Date().toLocaleString('pt-BR');
  const cleanId = (report.id || 'relatorio').replace(/_/g, '-');
  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `relatorio-${cleanId}-${dateStamp}.xlsx`;

  try {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'NexAi-NEFRO';
    wb.lastModifiedBy = doctorName;
    wb.created = new Date();
    wb.modified = new Date();

    const safeSheetTitle = (report.title || 'Relatório').slice(0, 31).replace(/[\\/?*\[\]:]/g, ' ');
    const ws = wb.addWorksheet(safeSheetTitle, {
      views: [{ showGridLines: true }]
    });

    const hasLogo = Boolean(metadata.doctorLogo);
    let logoData = null;
    if (hasLogo) {
      logoData = await resolveImageForExcel(metadata.doctorLogo);
    }

    let currentRow = 1;

    // Se houver logomarca do médico, insere no topo
    if (logoData) {
      ws.getRow(1).height = 48;
      addDoctorLogoToExcelSheet(wb, ws, logoData, {
        col: 0.1,
        row: 0.1,
        width: 140,
        height: 44
      });
      currentRow = 2;
    }

    // Título institucional
    const brandRow = ws.getRow(currentRow++);
    brandRow.getCell(1).value = 'Nex-Ai.NEFRO — PLATAFORMA ESPECIALIZADA EM GESTÃO CLÍNICA NEFROLÓGICA';
    brandRow.getCell(1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };

    // Título do Relatório
    const titleRow = ws.getRow(currentRow++);
    titleRow.getCell(1).value = report.title.toUpperCase();
    titleRow.getCell(1).font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FF0284C7' } };

    // Metadados de Emissão
    const metaRow = ws.getRow(currentRow++);
    metaRow.getCell(1).value = `Emitido em: ${emissionDate}   •   Médico: ${doctorName} ${doctorCrm}   •   Unidade: ${metadata.clinica || 'Geral'}`;
    metaRow.getCell(1).font = { name: 'Calibri', size: 9.5, italic: true, color: { argb: 'FF475569' } };

    // Filtros
    const filterRow = ws.getRow(currentRow++);
    filterRow.getCell(1).value = `Filtros: ${metadata.filtersDesc || 'Todos os registros'}`;
    filterRow.getCell(1).font = { name: 'Calibri', size: 9, color: { argb: 'FF64748B' } };

    // Linha de respiro
    currentRow++;

    // Bloco de KPIs se existirem
    if (kpis && kpis.length > 0) {
      const kpiHeaderRow = ws.getRow(currentRow++);
      kpiHeaderRow.getCell(1).value = 'RESUMO CLÍNICO / INDICADORES:';
      kpiHeaderRow.getCell(1).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0369A1' } };

      const kpiLabels = ws.getRow(currentRow++);
      const kpiValues = ws.getRow(currentRow++);
      kpiLabels.height = 18;
      kpiValues.height = 22;

      kpis.forEach((k, i) => {
        const colIdx = i + 1;
        const labelCell = kpiLabels.getCell(colIdx);
        labelCell.value = k.label;
        labelCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF334155' } };
        labelCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF1F5F9' }
        };
        labelCell.alignment = { horizontal: 'center', vertical: 'middle' };

        const valCell = kpiValues.getCell(colIdx);
        valCell.value = k.value;
        valCell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0284C7' } };
        valCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' }
        };
        valCell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      currentRow++; // Respiro pós KPI
    }

    // Cabeçalho da Tabela
    const tableHeaderRow = ws.getRow(currentRow++);
    tableHeaderRow.height = 24;
    report.columns.forEach((colDef, idx) => {
      const cell = tableHeaderRow.getCell(idx + 1);
      cell.value = colDef.header;
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0284C7' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF0284C7' } },
        bottom: { style: 'medium', color: { argb: 'FF0369A1' } }
      };
    });

    // Linhas com dados
    rows.forEach((r, rIdx) => {
      const dataRow = ws.getRow(currentRow++);
      dataRow.height = 20;
      const isEven = rIdx % 2 === 0;

      report.columns.forEach((colDef, cIdx) => {
        const cell = dataRow.getCell(cIdx + 1);
        const rawVal = r[colDef.id] ?? '';
        cell.value = rawVal;
        cell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF1E293B' } };
        cell.alignment = { vertical: 'middle', horizontal: typeof rawVal === 'number' ? 'right' : 'left' };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFFFFFFF' : 'FFF8FAFC' }
        };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });
    });

    // Auto-largura de colunas
    report.columns.forEach((colDef, idx) => {
      const col = ws.getColumn(idx + 1);
      const headerLen = colDef.header ? colDef.header.length : 10;
      const baseWidth = colDef.width ? Math.round(colDef.width * 0.95) : 18;
      col.width = Math.max(baseWidth, headerLen + 5);
    });

    const buffer = await wb.xlsx.writeBuffer();
    saveWorkbookBrowser(buffer, fileName);
    return;
  } catch (excelJsError) {
    console.warn('[reportsService] Erro ao exportar com ExcelJS, aplicando fallback SheetJS:', excelJsError);
  }

  // Fallback seguro via SheetJS
  const aoa = [
    ['Nex-Ai.NEFRO — PLATAFORMA ESPECIALIZADA EM GESTÃO CLÍNICA NEFROLÓGICA'],
    [report.title.toUpperCase()],
    [`Emitido em: ${emissionDate}`, `Médico: ${doctorName} ${doctorCrm}`, `Unidade: ${metadata.clinica || 'Geral'}`],
    [`Filtros: ${metadata.filtersDesc || 'Todos os registros'}`],
    []
  ];

  if (kpis && kpis.length > 0) {
    aoa.push(['RESUMO CLÍNICO / INDICADORES:']);
    const kpiRow1 = kpis.map(k => k.label);
    const kpiRow2 = kpis.map(k => k.value);
    aoa.push(kpiRow1);
    aoa.push(kpiRow2);
    aoa.push([]);
  }

  const headerCols = report.columns.map(c => c.header);
  aoa.push(headerCols);

  rows.forEach(r => {
    const rowData = report.columns.map(c => r[c.id] ?? '');
    aoa.push(rowData);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = report.columns.map(c => ({
    wch: Math.max((c.width || 18), (c.header.length + 3))
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
  XLSX.writeFile(wb, fileName);
}
