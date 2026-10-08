/**
 * 🔬 Smart Lab Registry - Catálogo de Laboratórios & Layouts Homologados
 * NexAi-NEFRO Sistema de Aprendizado Contínuo de Exames
 */

export const HOMOLOGATED_LABS = [
  {
    id: 'labicon',
    nome: 'LABICON Laboratório',
    cnpj: '13.150.241/0001-69',
    cnes: '6855865',
    cidade: 'Contagem / MG',
    endereco: 'Rua Tiradentes, 2887, Bairro Industrial, Contagem/MG',
    responsavelTecnico: 'Isabel de Lourdes Araujo Gobira CRBM 04168',
    status: 'HOMOLOGADO',
    confianca: '100%',
    tipoLayout: 'LAUDO_CLINICO_MULTIPAGINAS',
    assinaturas: [
      'LABICON',
      'LABICON LABORATÓRIO',
      'LABICON LABORATORIO',
      '13.150.241/0001-69',
      '13150241000169',
      'CNES 6855865',
      'CNES: 6855865',
      'CRBM 04168',
      'CRBM-MG 4168',
      'CRBM-MG 04168',
      'CRBM 4168',
      'Isabel de Lourdes Araujo Gobira',
      'ISABEL ARAUJO GOBIRA',
      'AMANDA GONCALVES XAVIER',
      'AMANDA GONÇALVES XAVIER',
      'CRBM 18643',
      'CRBM-MG 18643',
      'CRBM-MG 30208',
      'CRBM-MG 13.696',
      'Rua Tiradentes, 2887',
      'Bairro Industrial, Contagem',
      'Contagem/MG',
      'Contagem / MG'
    ],
    examesHomologados: [
      'Hb', 'Ht', 'Leucócitos', 'Plaquetas', 'Ca', 'P', 'FA', 'Glicemia',
      'HbA1c', 'Ferro', 'IST', 'Alb', 'TGP', 'Ureia Pré', 'Ureia Pós',
      'Kt/V', 'Vit D', 'Ferritina', 'PTH', 'K⁺', 'Na⁺', 'HBsAg', 'Anti-HBs', 'Anti-HCV'
    ],
    totalExames: 24,
    dataHomologacao: '2026-09-23',
    descricao: 'Laudos clínicos multi-páginas de rotina mensal e trimestral em pacientes de hemodiálise da clínica DialiZe.'
  },
  {
    id: 'dialsist-mapao',
    nome: 'Dialsist Web / DialiZe (Mapa Mensal Colunar)',
    cnpj: 'Vários / Clínicas Próprias',
    cnes: 'Múltiplos',
    cidade: 'Nacional',
    responsavelTecnico: 'Sistema de Gestão Dialítica',
    status: 'HOMOLOGADO',
    confianca: '100%',
    tipoLayout: 'MAPAO_COLUNAR_DIALISE',
    assinaturas: [
      'MAPA EXAMES',
      'MAPAO EXAMES',
      'DIALSIST WEB',
      'SISTEMA DIALSIST',
      'DIALSIST',
      'ADEQUACAO DIALITICA',
      'MAPA DE EXAMES'
    ],
    examesHomologados: [
      'Hb', 'Ht', 'Ferro', 'Ferritina', 'IST', 'Transf',
      'Ca', 'P', 'Ca x P', 'PTH', 'Al', 'FA',
      'Creatinina', 'Ureia Pré', 'Ureia Pós', 'PRU', 'Kt/V', 'K⁺',
      'Alb', 'TGP', 'Glicemia', 'Vit D', 'HbA1c',
      'Na⁺', 'HBsAg', 'Anti-HBs', 'Anti-HCV', 'HIV'
    ],
    totalExames: 28,
    dataHomologacao: '2026-09-20',
    descricao: 'Tabelas e relatórios colunares mensais com exames fracionados de todos os pacientes de hemodiálise da clínica.'
  },
  {
    id: 'db-diagnosticos',
    nome: 'DB Diagnósticos do Brasil (Laboratório de Apoio)',
    cnpj: '04.054.414/0001-30',
    cnes: '4061934',
    cidade: 'São José dos Pinhais / PR e Goiânia / GO (Nacional)',
    responsavelTecnico: 'Corpo Técnico DB Diagnósticos',
    status: 'HOMOLOGADO',
    confianca: '100%',
    tipoLayout: 'LAUDO_CLINICO_MULTIPAGINAS',
    assinaturas: [
      'DIAGNOSTICOS DO BRASIL',
      'DIAGNÓSTICOS DO BRASIL',
      'DB DIAGNOSTICOS',
      'DB DIAGNÓSTICOS',
      'DBDIAGNOSTICOS.COM.BR',
      'DB AP. DE',
      'APOIO DB',
      'CNES: 4057619',
      'CNES: 4061934',
      '4061934',
      'COD. APOIADO',
      'CÓD. APOIADO',
      '50.914.934/0001-07',
      '43.272.843/0001-50',
      '44.203.391/0001-17',
      '49.157.120/0001-95'
    ],
    examesHomologados: [
      'K⁺', 'Na⁺', 'Ca', 'P', 'Ureia Pré', 'Ureia Pós',
      'Kt/V', 'UR%', 'Creatinina', 'Ferro', 'TIBC', 'IST',
      'TGP', 'TGO', 'FA', 'Alb', 'Glicemia', 'Ferritina',
      'PTH', 'Hb', 'Ht', 'Leucócitos', 'Plaquetas',
      'HbA1c', 'Vit D', 'Al', 'HCO₃⁻',
      'HBsAg', 'Anti-HBs', 'Anti-HCV', 'Anti-HBc', 'HIV'
    ],
    totalExames: 32,
    dataHomologacao: '2026-10-07',
    descricao: 'Laudos clínicos multi-páginas do laboratório de apoio DB Diagnósticos com gráficos temporais de evolução e rotina de nefrologia.'
  },
  {
    id: 'hermes-pardini',
    nome: 'Hermes Pardini / Grupo Fleury',
    cnpj: '19.378.769/0001-26',
    cnes: '2155829',
    cidade: 'Belo Horizonte / MG',
    responsavelTecnico: 'Corpo Clínico Hermes Pardini',
    status: 'HOMOLOGADO',
    confianca: '98%',
    tipoLayout: 'LAUDO_CLINICO_MULTIPAGINAS',
    assinaturas: [
      'HERMES PARDINI',
      'INSTITUTO HERMES PARDINI',
      'GRUPO FLEURY PARDINI'
    ],
    examesHomologados: [
      'Hb', 'Ht', 'Leucócitos', 'Plaquetas', 'Ureia Pré', 'Ureia Pós',
      'Creatinina', 'K⁺', 'Na⁺', 'Ca', 'P', 'PTH',
      'Ferritina', 'Ferro', 'IST', 'Vit D'
    ],
    totalExames: 16,
    dataHomologacao: '2026-09-15',
    descricao: 'Laudos ambulatoriais e hospitalares de alta precisão.'
  }
];

/**
 * Detecta se o texto ou conjunto de páginas pertence a um laboratório homologado
 */
export function detectLaboratoryProfile(fullText = '') {
  if (!fullText) return null;
  const upper = fullText.toUpperCase();

  // Prioriza laboratórios de análises clínicas específicos antes de layouts de mapas colunares
  const priorityOrder = ['db-diagnosticos', 'labicon', 'hermes-pardini', 'dialsist-mapao'];
  const orderedLabs = [...HOMOLOGATED_LABS].sort((a, b) => {
    const idxA = priorityOrder.indexOf(a.id);
    const idxB = priorityOrder.indexOf(b.id);
    return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });

  for (const lab of orderedLabs) {
    for (const sig of lab.assinaturas) {
      if (upper.includes(sig.toUpperCase())) {
        return lab;
      }
    }
  }

  return null;
}
