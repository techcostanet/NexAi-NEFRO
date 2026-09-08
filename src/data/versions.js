export const SYSTEM_CHANGELOG = [
  {
    version: "1.1.43",
    date: "07/09/2026",
    title: "Receituário em 1 Única Folha A4 e Padronização Tipográfica ao Padrão do Sistema",
    highlights: [
      "📄 Garantia de impressão em 1 única folha A4: ajuste dimensional rigoroso com eliminação definitiva da quebra de página que empurrava a assinatura para a folha 2.",
      "🩺 Cabeçalho médico sempre visível: remoção de regras genéricas de ocultação no CSS de impressão que suprimiam o timbrado do médico.",
      "🎨 Padronização tipográfica e visual: histórico de receituários reformatado exatamente na mesma escala tipográfica, densidade, badges e botões da aba 'Evoluções Clínicas'.",
      "💊 Saneamento de fármacos: prevenção automática de duplicação de nomes de medicamentos (ex: 'Zolpidem Zolpidem') na importação e na exibição."
    ]
  },
  {
    version: "1.1.42",
    date: "07/09/2026",
    title: "Isolamento Estrito de Impressão A4, Layout Padrão CFM e Aba Simplificada",
    highlights: [
      "🖨️ Isolamento total da impressão de receituário: eliminação de todos os elementos de fundo do site, banners e barras de rolagem no PDF/A4.",
      "📄 Layout médico padrão CFM: receituário limpo, simples e objetivo, estritamente calibrado para 1 única folha sem excessos visuais.",
      "🎯 Alinhamento padrão da aba de receitas: botão '+ Nova Receita' reposicionado à direita no mesmo formato de 'Evoluções', além de atalho rápido '+ Receita' no topo do prontuário.",
      "✨ Interface limpa: remoção dos cards promocionais de opções, mantendo a tela do paciente despoluída e pronta para o histórico de receitas."
    ]
  },
  {
    version: "1.1.40",
    date: "07/09/2026",
    title: "Emissão de Receituário Médico, Controle Especial (2 Vias) e Impressão A4",
    highlights: [
      "📋 Nova aba e botão 'Receituário' na navegação clínica ao lado de Evoluções com contador dinâmico de receitas emitidas.",
      "⚡ Função 'Puxar Medicamentos Ativos' em 1 clique que importa prescrições em uso no paciente direto para o receituário sem redigitação.",
      "⚖️ Suporte integral aos modelos normativos CFM/ANVISA: Receita Simples (1 via), Controle Especial (2 vias - Portaria 344/98 com campos de Comprador/Farmácia), Antimicrobianos (2 vias - RDC 20/2011) e Alto Custo (LME/SUS).",
      "🖨️ Pré-visualização ao vivo em folha timbrada oficial A4 com regras avançadas de @media print e geração instantânea de PDF limpo.",
      "☁️ Persistência 100% Cloud Firestore com histórico de receitas emitidas, duplicação rápida para renovação e ações de exclusão segura."
    ]
  },
  {
    version: "1.1.34",
    date: "07/09/2026",
    title: "Gestão Financeira Dinâmica, Descontos Comerciais e Notas de Versão",
    highlights: [
      "💰 Sincronização em tempo real dos planos cadastrados na aba Financeiro com os formulários de cadastro e edição de médicos.",
      "🏷️ Novo campo de desconto comercial flexível (em R$ ou %) aplicável a cada cliente com cálculo automático do valor final cobrado.",
      "🔄 Modal de renovação atualizado com precificação dinâmica baseada nos planos ativos e suporte a desconto promocional.",
      "📜 Revisão e atualização completa do histórico de Notas de Versão (Release Notes) com todos os marcos evolutivos do sistema."
    ]
  },
  {
    version: "1.1.33",
    date: "07/09/2026",
    title: "Segurança de Licenças, Exclusão Administrativa e Base 100% Fictícia",
    highlights: [
      "🗑️ Ação de exclusão segura e definitiva de licenças médicas no Cloud Firestore com limpeza de vínculos e auditoria imutável.",
      "🚫 Remoção do botão de restauração da base no painel administrativo para proteger a integridade dos dados clínicos.",
      "🩺 Padronização rigorosa dos pacientes de demonstração do Dr. Marcelo Ramos para dados 100% indiscutivelmente fictícios e simulados."
    ]
  },
  {
    version: "1.1.32",
    date: "07/09/2026",
    title: "Harmonização Visual e Refinamento de Rótulos Clínicos",
    highlights: [
      "🎨 Harmonização visual: alinhamento ergonômico de seções no modal clínico e balanceamento estético do card de peso.",
      "✨ Limpeza de avisos redundantes e melhoria na densidade visual para acompanhamento ágil de pacientes."
    ]
  },
  {
    version: "1.1.31",
    date: "07/09/2026",
    title: "Estabilidade de Formulários e Resolução de Ícones",
    highlights: [
      "🔧 Correção e estabilização do modal de edição cadastral de pacientes e do formulário de pesagem pré/pós diálise.",
      "🛡️ Resolução de ícones e prevenção contra opções duplicadas em campos de seleção clínica."
    ]
  },
  {
    version: "1.1.30",
    date: "07/09/2026",
    title: "Transplante Renal, Controle de Peso (% PIDG) e Hemoculturas",
    highlights: [
      "🎗️ Módulo de transplante renal com badges clínicos coloridos, triagem e status em lista de espera.",
      "⚖️ Histórico e controle evolutivo de peso com percentual de ganho interdialítico (% PIDG) e alertas para > 4,5%.",
      "🧪 Catálogo dinâmico de alergias sincronizado em tempo real no Cloud Firestore.",
      "🩸 Módulo de hemoculturas e protocolo de Lock Terapia para vigilância de acessos vasculares e prevenção de bacteremia."
    ]
  },
  {
    version: "1.1.29",
    date: "02/09/2026",
    title: "Importador Inteligente Multi-formato (XLS, PDF, DOCX, Fotos)",
    highlights: [
      "📄 Importação inteligente de exames a partir de laudos laboratoriais em PDF, planilhas Excel (XLS), documentos e fotografias (OCR).",
      "🩺 Padronização de etiologias da DRC com seleção nefrológica padrão.",
      "📅 Ordenação cronológica decrescente automática no histórico laboratorial."
    ]
  },
  {
    version: "1.1.28",
    date: "02/09/2026",
    title: "Padronização de Acessos Vasculares e Ergonomia do Prontuário",
    highlights: [
      "💉 Conversão de campos de acesso vascular para seleção clínica rápida (FAV Braquiocefálica, Radiocefálica, CDL Permcath).",
      "📐 Harmonização dos layouts dos cards de diálise e parâmetros operacionais de fluxo sanguíneo e dialisato."
    ]
  },
  {
    version: "1.1.27",
    date: "01/09/2026",
    title: "Multi-Tenancy Rigoroso e Isolamento de Dados por Médico",
    highlights: [
      "🔒 Isolamento estrito de prontuários por doctorId no Cloud Firestore, garantindo privacidade e sigilo médico total.",
      "🚫 Bloqueio de acessos cruzados e listagem isolada para cada médico assinante ou residente."
    ]
  },
  {
    version: "1.1.26",
    date: "17/08/2026",
    title: "Landing Page de Alta Conversão & Checkout Self-Service",
    highlights: [
      "🌐 Lançamento da Landing Page institucional com apresentação moderna dos diferenciais da plataforma.",
      "💳 Checkout automatizado com integração de cobrança (Asaas / PIX), ativação imediata de 7 dias de Trial e onboarding instantâneo."
    ]
  },
  {
    version: "1.1.25",
    date: "16/08/2026",
    title: "Conformidade LGPD e Módulo Financeiro Interativo",
    highlights: [
      "🛡️ Adequação rigorosa às diretrizes da LGPD com auditoria imutável de acessos e impersonação no Cloud Firestore.",
      "💵 Módulo financeiro interativo para administração de planos, precificação e conectores de pagamento."
    ]
  },
  {
    version: "1.1.20",
    date: "15/08/2026",
    title: "Modernização do Prontuário Clínico com Abas Especializadas",
    highlights: [
      "📂 Reformulação completa do prontuário com abas dedicadas: Dados Clínicos, Histórico Laboratorial, Prescrições e Evoluções.",
      "🩺 Painel de adequação dialítica com cálculo de Kt/V e monitoramento de distúrbio mineral ósseo (PTH, Ca, P)."
    ]
  },
  {
    version: "1.1.14",
    date: "15/08/2026",
    title: "Gestão de Unidades e Multi-locais de Atuação Médica",
    highlights: [
      "🏢 Cadastro e gestão de múltiplas unidades de hemodiálise, hospitais de retaguarda e consultórios vinculados ao médico.",
      "👩‍⚕️ Indicação de Responsável Técnico (RT), turnos de diálise e telefones diretos da enfermagem."
    ]
  },
  {
    version: "1.1.12",
    date: "15/08/2026",
    title: "Painel Super Administrador SaaS & Gestão de Licenças",
    highlights: [
      "📊 Dashboard administrativo com métricas operacionais e financeiras SaaS: MRR, ARR, Churn Rate e contagem de assinantes.",
      "🔍 Trilha de auditoria em tempo real para rastreabilidade de todas as ações sensíveis no sistema."
    ]
  },
  {
    version: "1.1.10",
    date: "15/08/2026",
    title: "Arquitetura 100% Cloud (Firebase & Cloud Firestore)",
    highlights: [
      "☁️ Migração e conformidade plena com Cloud Firestore como fonte única da verdade (sem persistência local estática).",
      "⚡ Sincronização em tempo real via listeners nativos do Firestore para suporte multi-usuário."
    ]
  },
  {
    version: "1.1.6",
    date: "14/08/2026",
    title: "Catálogo de Medicamentos de Diálise & Alertas de Ciclos",
    highlights: [
      "💊 Catálogo especializado de medicamentos dialíticos (EPO, Noripurum, Sevelâmer, Paricalcitol, Sorcal).",
      "⏰ Alertas inteligentes de proximidade de término de ciclos de antimicrobianos e reposição férrica."
    ]
  },
  {
    version: "1.1.0",
    date: "13/08/2026",
    title: "Lançamento em Nuvem e Deploy Contínuo no Firebase Hosting",
    highlights: [
      "🚀 Entrada em produção oficial do NexAi-NEFRO no Firebase Hosting (https://nexai-nefro.web.app).",
      "🔄 Pipeline automatizado de releases com versionamento SemVer e sincronização remota com o GitHub."
    ]
  }
];
