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
      '13.150.241/0001-69',
      'CNES 6855865',
      'CRBM 04168',
      'Isabel de Lourdes Araujo Gobira',
      'CRBM-MG 30208',
      'CRBM-MG 18643',
      'CRBM-MG 13.696'
    ],
    examesHomologados: [
      'Hemograma Completo (Hb, Ht, Leucócitos, Plaquetas, VCM, HCM, CHCM, RDW)',
      'Dosagem Isolada de Hemoglobina & Hematócrito',
      'Cálcio Sérico',
      'Fósforo Sérico',
      'Fosfatase Alcalina (FA)',
      'Glicemia de Jejum',
      'Hemoglobina Glicada (HbA1c)',
      'Ferro Sérico',
      'Índice de Saturação de Transferrina (IST %)',
      'Proteínas Totais e Albumina',
      'Transaminase Glutâmico Pirúvica (TGP / ALT)',
      'Ureia Pré-diálise',
      'Ureia Pós-diálise',
      'Kt/V Daugirdas Calculado Automaticamente',
      'Vitamina D 25-Dihidroxi',
      'Ferritina',
      'Paratormônio (PTH Intacto)',
      'Potássio (K+)',
      'Sódio (Na+)',
      'HBsAg (Hepatite B)',
      'Anti-HBs (Hepatite B - Quantitativo / Qualitativo)',
      'Anti-HCV (Hepatite C)'
    ],
    totalExames: 22,
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
      'DIALSIST',
      'DIALIZE',
      'ADEQUACAO DIALITICA'
    ],
    examesHomologados: [
      'Hb', 'Ht', 'Ferro', 'Ferritina', 'IST', 'Transferrina',
      'Cálcio', 'Fósforo', 'Ca x P', 'PTH', 'Alumínio', 'FA',
      'Creatinina', 'Ureia 1 (Pré)', 'Ureia 2 (Pós)', 'PRU', 'Kt/V', 'Potássio (K)',
      'Albumina', 'TGP', 'Glicemia', 'Vitamina D', 'Hemoglobina Glicada',
      'Sódio', 'HBsAg', 'Anti-HBs', 'Anti-HCV', 'HIV'
    ],
    totalExames: 28,
    dataHomologacao: '2026-09-20',
    descricao: 'Tabelas e relatórios colunares mensais com exames fracionados de todos os pacientes de hemodiálise da clínica.'
  },
  {
    id: 'db-diagnosticos',
    nome: 'DB Diagnósticos do Brasil (Laboratório de Apoio)',
    cnpj: '04.054.414/0001-30',
    cnes: '4057619',
    cidade: 'São José dos Pinhais / PR (Nacional)',
    responsavelTecnico: 'Corpo Técnico DB',
    status: 'HOMOLOGADO',
    confianca: '98%',
    tipoLayout: 'LAUDO_CLINICO_MULTIPAGINAS',
    assinaturas: [
      'DIAGNOSTICOS DO BRASIL',
      'DB DIAGNOSTICOS',
      'APOIO DB',
      'CNES: 4057619'
    ],
    examesHomologados: [
      'Sorologias (HBsAg, Anti-HBs, Anti-HCV, Anti-HBc, HIV)',
      'PTH Intacto',
      'Vitamina D 25-OH',
      'Ferritina',
      'Alumínio Sérico',
      'Potássio e Eletrólitos'
    ],
    totalExames: 12,
    dataHomologacao: '2026-09-21',
    descricao: 'Laboratório de apoio especializado integrado a laudos de rotina de nefrologia.'
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
      'Hemograma Completo', 'Ureia Pré/Pós', 'Creatinina', 'Potássio', 'Sódio',
      'Cálcio Total e Iônico', 'Fósforo', 'PTH', 'Ferritina', 'Ferro', 'IST', 'Vitamina D'
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

  for (const lab of HOMOLOGATED_LABS) {
    for (const sig of lab.assinaturas) {
      if (upper.includes(sig.toUpperCase())) {
        return lab;
      }
    }
  }

  return null;
}
