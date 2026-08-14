/**
 * Catálogo de Medicamentos Especializados para Pacientes Dialíticos e Renais Crônicos
 */

export const DIALYSIS_MEDICATIONS_CATALOG = [
  // --- ERITROPOIESE E ANEMIA ---
  {
    nome: 'Alfaepoetina (EPO)',
    nomeComercial: 'Eprex, Hemax, Eritromax',
    categoria: 'Eritropoiese & Anemia',
    tipoPadrao: 'continuo',
    viaPadrao: 'SC pós-HD',
    viasDisponiveis: ['SC pós-HD', 'EV pós-HD', 'SC', 'EV'],
    dosagensSugeridas: ['2.000 UI', '4.000 UI', '6.000 UI', '8.000 UI', '10.000 UI', '20.000 UI', '40.000 UI'],
    frequenciasSugeridas: ['3x por semana (pós-HD)', '2x por semana', '1x por semana', 'A cada 15 dias', '1x por mês'],
    indicacao: 'Tratamento da anemia da Doença Renal Crônica (Meta Hb 10-12 g/dL)'
  },
  {
    nome: 'Mircera (Metoxipolietilenoglicol-epoetina beta)',
    nomeComercial: 'Mircera',
    categoria: 'Eritropoiese & Anemia',
    tipoPadrao: 'continuo',
    viaPadrao: 'SC',
    viasDisponiveis: ['SC', 'EV pós-HD', 'EV'],
    dosagensSugeridas: ['50 mcg', '75 mcg', '100 mcg', '150 mcg', '200 mcg', '250 mcg'],
    frequenciasSugeridas: ['1x por mês', 'A cada 15 dias'],
    indicacao: 'Estimulador contínuo do receptor de eritropoietina (ação prolongada)'
  },
  {
    nome: 'Sacarato de Hidróxido Férrico (Noripurum)',
    nomeComercial: 'Noripurum',
    categoria: 'Eritropoiese & Anemia',
    tipoPadrao: 'temporario',
    viaPadrao: 'EV pós-HD',
    viasDisponiveis: ['EV pós-HD', 'EV em infusão'],
    dosagensSugeridas: ['100 mg (1 ampola)', '200 mg (2 ampolas)', '50 mg (1/2 ampola)'],
    frequenciasSugeridas: ['1x por semana (pós-HD)', '2x por semana (pós-HD)', '3x por semana (pós-HD)', 'Dose única semanal'],
    duracaoSugeridaDias: 28, // 4 semanas geralmente
    indicacao: 'Reposição de ferro para atingir Ferritina > 200 ng/mL e IST > 20%'
  },
  {
    nome: 'Carboximaltose Férrica (Ferinject)',
    nomeComercial: 'Ferinject',
    categoria: 'Eritropoiese & Anemia',
    tipoPadrao: 'temporario',
    viaPadrao: 'EV',
    viasDisponiveis: ['EV pós-HD', 'EV em infusão'],
    dosagensSugeridas: ['500 mg', '1.000 mg'],
    frequenciasSugeridas: ['Dose única', '1x a cada 15 dias'],
    duracaoSugeridaDias: 14,
    indicacao: 'Ferro parenteral de alta dose para correção rápida de déficit férrico'
  },
  {
    nome: 'Ácido Fólico',
    nomeComercial: 'Folacin, Endofolin',
    categoria: 'Eritropoiese & Anemia',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO'],
    dosagensSugeridas: ['5 mg'],
    frequenciasSugeridas: ['1x ao dia', '3x por semana'],
    indicacao: 'Suplementação vitamínica para suporte da eritropoiese em diálise'
  },

  // --- METABOLISMO MINERAL E ÓSSEO (DMO-DRC) & QUELANTES ---
  {
    nome: 'Cloridrato / Carbonato de Sevelâmer',
    nomeComercial: 'Renagel, Renvela',
    categoria: 'Metabolismo Ósseo & Quelantes',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO (às refeições)',
    viasDisponiveis: ['VO (às refeições)'],
    dosagensSugeridas: ['800 mg', '1.600 mg', '2.400 mg'],
    frequenciasSugeridas: ['1 cp 3x ao dia (com almoço e jantar)', '2 cps 3x ao dia (às refeições)', '1 cp 2x ao dia'],
    indicacao: 'Quelante de fósforo não cálcico para controle da hiperfosfatemia'
  },
  {
    nome: 'Carbonato de Cálcio',
    nomeComercial: 'Calcium Sandoz, Calcitran, Osteocrem',
    categoria: 'Metabolismo Ósseo & Quelantes',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO (às refeições)',
    viasDisponiveis: ['VO (às refeições)'],
    dosagensSugeridas: ['500 mg', '1.000 mg', '1.250 mg'],
    frequenciasSugeridas: ['1 cp 3x ao dia às refeições', '1 cp 2x ao dia às refeições', '1 cp no almoço e jantar'],
    indicacao: 'Quelante de fósforo à base de cálcio'
  },
  {
    nome: 'Acetato de Cálcio',
    nomeComercial: 'PhosLo, Roycal',
    categoria: 'Metabolismo Ósseo & Quelantes',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO (às refeições)',
    viasDisponiveis: ['VO (às refeições)'],
    dosagensSugeridas: ['667 mg', '1.334 mg'],
    frequenciasSugeridas: ['1 cp 3x ao dia às refeições', '2 cps 3x ao dia às refeições'],
    indicacao: 'Quelante de fósforo à base de cálcio de alta avidez'
  },
  {
    nome: 'Calcitriol (1,25-di-hidroxivitamina D3)',
    nomeComercial: 'Rocaltrol, Sigmatriol',
    categoria: 'Metabolismo Ósseo & Quelantes',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO', 'EV pós-HD'],
    dosagensSugeridas: ['0.25 mcg', '0.50 mcg', '1.0 mcg', '2.0 mcg'],
    frequenciasSugeridas: ['1x ao dia à noite', '3x por semana pós-HD', 'A cada 2 dias'],
    indicacao: 'Controle de Hiperparatireoidismo Secundário e hipocalcemia'
  },
  {
    nome: 'Paricalcitol (Zemplar)',
    nomeComercial: 'Zemplar',
    categoria: 'Metabolismo Ósseo & Quelantes',
    tipoPadrao: 'continuo',
    viaPadrao: 'EV pós-HD',
    viasDisponiveis: ['EV pós-HD', 'VO'],
    dosagensSugeridas: ['2 mcg', '5 mcg', '1 mcg', '2.5 mcg'],
    frequenciasSugeridas: ['3x por semana (pós-HD)', '2x por semana (pós-HD)', '1x por semana'],
    indicacao: 'Ativador seletivo do receptor da vitamina D para redução do PTH'
  },
  {
    nome: 'Cloridrato de Cinacalcete',
    nomeComercial: 'Mimpara, Sensipar',
    categoria: 'Metabolismo Ósseo & Quelantes',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO (com alimento)',
    viasDisponiveis: ['VO (com alimento)'],
    dosagensSugeridas: ['30 mg', '60 mg', '90 mg'],
    frequenciasSugeridas: ['1x ao dia (junto à principal refeição)', 'A cada 2 dias'],
    indicacao: 'Calcimimético para hiperparatireoidismo secundário severo'
  },
  {
    nome: 'Colecalciferol (Vitamina D3)',
    nomeComercial: 'Depura, Addera D3',
    categoria: 'Metabolismo Ósseo & Quelantes',
    tipoPadrao: 'temporario',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO'],
    dosagensSugeridas: ['7.000 UI', '10.000 UI', '50.000 UI'],
    frequenciasSugeridas: ['1x por semana', '1x a cada 15 dias', '1x ao dia'],
    duracaoSugeridaDias: 60,
    indicacao: 'Correção de hipovitaminose D (25-OH-Vitamina D < 30 ng/mL)'
  },

  // --- CONTROLE DE POTÁSSIO ---
  {
    nome: 'Poliestirenossulfonato de Cálcio (Sorcal)',
    nomeComercial: 'Sorcal',
    categoria: 'Controle de Potássio',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO', 'Via Retal (Enema)'],
    dosagensSugeridas: ['15 g (1 envelope)', '30 g (2 envelopes)', '7.5 g (1/2 envelope)'],
    frequenciasSugeridas: ['1x a 2x ao dia dissolvido em água', '3x ao dia entre refeições', 'SOS se K+ > 5.5 mEq/L'],
    indicacao: 'Resina trocadora de cátions para tratamento e prevenção da hipercalemia'
  },
  {
    nome: 'Patiromer (Veltassa)',
    nomeComercial: 'Veltassa',
    categoria: 'Controle de Potássio',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO'],
    dosagensSugeridas: ['8.4 g', '16.8 g', '25.2 g'],
    frequenciasSugeridas: ['1x ao dia'],
    indicacao: 'Ligante polimérico de potássio sem sódio'
  },

  // --- CARDIOVASCULAR E ANTI-HIPERTENSIVOS ---
  {
    nome: 'Losartana Potássica',
    nomeComercial: 'Cozaar, Aradois',
    categoria: 'Cardiovascular & Anti-hipertensivos',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO'],
    dosagensSugeridas: ['25 mg', '50 mg', '100 mg'],
    frequenciasSugeridas: ['1x ao dia pela manhã', '1x ao dia à noite', '12/12h'],
    indicacao: 'Bloqueador do receptor de angiotensina II (BRA)'
  },
  {
    nome: 'Besilato de Anlodipino',
    nomeComercial: 'Norvasc, Cordarex',
    categoria: 'Cardiovascular & Anti-hipertensivos',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO'],
    dosagensSugeridas: ['2.5 mg', '5 mg', '10 mg'],
    frequenciasSugeridas: ['1x ao dia à noite', '1x ao dia pela manhã', '12/12h'],
    indicacao: 'Bloqueador dos canais de cálcio (pouco dialisável, seguro na DRC)'
  },
  {
    nome: 'Carvedilol',
    nomeComercial: 'Coreg, Divacon',
    categoria: 'Cardiovascular & Anti-hipertensivos',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO'],
    dosagensSugeridas: ['3.125 mg', '6.25 mg', '12.5 mg', '25 mg'],
    frequenciasSugeridas: ['12/12h com alimentos', '1x ao dia'],
    indicacao: 'Betabloqueador com ação vasodilatadora alfa-1'
  },
  {
    nome: 'Cloridrato de Hidralazina',
    nomeComercial: 'Apresolina, Nepress',
    categoria: 'Cardiovascular & Anti-hipertensivos',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO', 'EV'],
    dosagensSugeridas: ['25 mg', '50 mg'],
    frequenciasSugeridas: ['8/8h', '12/12h', '6/6h'],
    indicacao: 'Vasodilatador direto periférico para hipertensão arterial resistente'
  },
  {
    nome: 'Clonidina (Cloridrato)',
    nomeComercial: 'Atensina',
    categoria: 'Cardiovascular & Anti-hipertensivos',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO'],
    dosagensSugeridas: ['0.100 mg', '0.150 mg', '0.200 mg'],
    frequenciasSugeridas: ['12/12h', '8/8h', '1x à noite'],
    indicacao: 'Agonista alfa-2 adrenérgico central'
  },
  {
    nome: 'Atenolol',
    nomeComercial: 'Atenol, Angipress',
    categoria: 'Cardiovascular & Anti-hipertensivos',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO'],
    dosagensSugeridas: ['25 mg', '50 mg', '100 mg'],
    frequenciasSugeridas: ['1x ao dia pós-HD', 'A cada 48h pós-HD'],
    indicacao: 'Betabloqueador cardioseletivo hidrossolúvel'
  },
  {
    nome: 'Furosemida (se diurese residual)',
    nomeComercial: 'Lasix',
    categoria: 'Cardiovascular & Anti-hipertensivos',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO', 'EV'],
    dosagensSugeridas: ['40 mg', '80 mg', '120 mg', '240 mg'],
    frequenciasSugeridas: ['1x ao dia pela manhã', '12/12h'],
    indicacao: 'Diurético de alça para preservação de débito urinário residual'
  },

  // --- ANTIMICROBIANOS E ANTIBIÓTICOS (CICLOS TEMPORÁRIOS) ---
  {
    nome: 'Cefazolina Sódica',
    nomeComercial: 'Kefazol',
    categoria: 'Antimicrobianos (Ciclos)',
    tipoPadrao: 'temporario',
    viaPadrao: 'EV pós-HD',
    viasDisponiveis: ['EV pós-HD', 'EV'],
    dosagensSugeridas: ['1.0 g', '1.5 g', '2.0 g'],
    frequenciasSugeridas: ['A cada sessão de HD (3x/semana pós-HD)', 'A cada 48h'],
    duracaoSugeridaDias: 14,
    indicacao: 'Infecções de acesso vascular (FAV ou CDL) por Gram-positivos sensíveis'
  },
  {
    nome: 'Vancomicina (Cloridrato)',
    nomeComercial: 'Vancocina, Vancocid',
    categoria: 'Antimicrobianos (Ciclos)',
    tipoPadrao: 'temporario',
    viaPadrao: 'EV pós-HD (infusão lenta)',
    viasDisponiveis: ['EV pós-HD (infusão lenta)', 'EV'],
    dosagensSugeridas: ['500 mg', '1.0 g', '1.5 g', '20 mg/kg'],
    frequenciasSugeridas: ['Dose de ataque 20mg/kg + manutenção pós-HD guiada por nível sérico', '1x por semana pós-HD', 'A cada sessão de HD'],
    duracaoSugeridaDias: 21,
    indicacao: 'Bacteremia relacionada a cateter por MRSA ou Staphylococcus epidermidis'
  },
  {
    nome: 'Ceftazidima',
    nomeComercial: 'Fortaz',
    categoria: 'Antimicrobianos (Ciclos)',
    tipoPadrao: 'temporario',
    viaPadrao: 'EV pós-HD',
    viasDisponiveis: ['EV pós-HD', 'EV'],
    dosagensSugeridas: ['1.0 g', '2.0 g'],
    frequenciasSugeridas: ['A cada sessão de HD (3x/semana pós-HD)'],
    duracaoSugeridaDias: 14,
    indicacao: 'Cobertura para Gram-negativos e Pseudomonas em infecções de diálise'
  },
  {
    nome: 'Ciprofloxacino (Cloridrato)',
    nomeComercial: 'Cipro, Quinoflox',
    categoria: 'Antimicrobianos (Ciclos)',
    tipoPadrao: 'temporario',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO', 'EV'],
    dosagensSugeridas: ['250 mg', '500 mg'],
    frequenciasSugeridas: ['12/12h', '1x ao dia pós-HD'],
    duracaoSugeridaDias: 7,
    indicacao: 'Infecções respiratórias, urinárias residuais ou tecidos moles'
  },
  {
    nome: 'Amicacina (Sulfato)',
    nomeComercial: 'Novamin',
    categoria: 'Antimicrobianos (Ciclos)',
    tipoPadrao: 'temporario',
    viaPadrao: 'EV pós-HD',
    viasDisponiveis: ['EV pós-HD', 'EV'],
    dosagensSugeridas: ['250 mg', '500 mg', '7.5 mg/kg'],
    frequenciasSugeridas: ['Pós-HD a cada sessão'],
    duracaoSugeridaDias: 10,
    indicacao: 'Aminoglicosídeo para infecções graves por bacilos Gram-negativos'
  },

  // --- ANTICOAGULAÇÃO E OUTROS ---
  {
    nome: 'Heparina Sódica (na diálise)',
    nomeComercial: 'Hepamex, Heparin',
    categoria: 'Anticoagulação & Outros',
    tipoPadrao: 'continuo',
    viaPadrao: 'EV no circuito de diálise',
    viasDisponiveis: ['EV no circuito de diálise', 'EV em bolus inicial + contínuo', 'SC'],
    dosagensSugeridas: ['2.500 UI', '5.000 UI', '7.500 UI', '10.000 UI'],
    frequenciasSugeridas: ['Por sessão de HD (bolus inicial e/ou contínuo)'],
    indicacao: 'Prevenção de trombose do circuito extracorpóreo de hemodiálise'
  },
  {
    nome: 'Enoxaparina Sódica',
    nomeComercial: 'Clexane, Versa',
    categoria: 'Anticoagulação & Outros',
    tipoPadrao: 'temporario',
    viaPadrao: 'SC',
    viasDisponiveis: ['SC', 'EV no circuito'],
    dosagensSugeridas: ['20 mg', '40 mg', '1 mg/kg dose reduzida'],
    frequenciasSugeridas: ['1x ao dia (ajustar ClCr)', 'Antes da sessão de HD'],
    duracaoSugeridaDias: 10,
    indicacao: 'Heparina de baixo peso molecular'
  },
  {
    nome: 'Complexo B + Vitamina C (Dialyvit / Suplemento Dialítico)',
    nomeComercial: 'Dialyvit, Nephrovit, Complexo B',
    categoria: 'Anticoagulação & Outros',
    tipoPadrao: 'continuo',
    viaPadrao: 'VO',
    viasDisponiveis: ['VO'],
    dosagensSugeridas: ['1 comprimido', '1 cápsula'],
    frequenciasSugeridas: ['1x ao dia após refeição', 'Pós-sessão de HD'],
    indicacao: 'Reposição de vitaminas hidrossolúveis perdidas durante o processo dialítico'
  }
];

/**
 * Calcula o status de um medicamento com base nas datas e tipo
 * @param {Object} med - Objeto do medicamento
 * @returns {{ status: 'continuo'|'ativo'|'expirando'|'expirado'|'inativo', diasRestantes: number|null, label: string, color: string, badgeBg: string, borderColor: string, needsReview?: boolean }}
 */
export function getMedicationStatus(med) {
  if (!med) {
    return { status: 'inativo', diasRestantes: null, label: 'Inativo', color: '#64748b', badgeBg: '#f1f5f9', borderColor: '#cbd5e1' };
  }

  if (med.ativo === false) {
    return { status: 'inativo', diasRestantes: null, label: 'Suspenso / Finalizado', color: '#64748b', badgeBg: '#f1f5f9', borderColor: '#cbd5e1' };
  }

  if (med.tipo === 'continuo' || !med.dataFim) {
    return { 
      status: 'continuo', 
      diasRestantes: null, 
      label: 'Uso Contínuo', 
      color: '#059669', 
      badgeBg: 'rgba(240, 253, 244, 0.95)', 
      borderColor: '#bbf7d0' 
    };
  }

  // Tratamento temporário / com data de término
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataFim = new Date(med.dataFim + 'T00:00:00');
  const diffTime = dataFim.getTime() - hoje.getTime();
  const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diasRestantes < 0) {
    const diasVencido = Math.abs(diasRestantes);
    return {
      status: 'expirado',
      diasRestantes,
      label: `Ciclo Encerrado (há ${diasVencido} ${diasVencido === 1 ? 'dia' : 'dias'})`,
      color: '#dc2626',
      badgeBg: 'rgba(254, 242, 242, 0.95)',
      borderColor: '#fecaca',
      needsReview: true
    };
  }

  if (diasRestantes === 0) {
    return {
      status: 'expirando',
      diasRestantes: 0,
      label: 'Termina Hoje!',
      color: '#d97706',
      badgeBg: 'rgba(254, 243, 199, 0.95)',
      borderColor: '#fde68a',
      needsReview: true
    };
  }

  if (diasRestantes <= 5) {
    return {
      status: 'expirando',
      diasRestantes,
      label: `Vence em ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'}`,
      color: '#d97706',
      badgeBg: 'rgba(254, 243, 199, 0.95)',
      borderColor: '#fde68a',
      needsReview: true
    };
  }

  return {
    status: 'ativo',
    diasRestantes,
    label: `Ciclo Ativo (${diasRestantes} dias restantes)`,
    color: '#2563eb',
    badgeBg: 'rgba(239, 246, 255, 0.95)',
    borderColor: '#bfdbfe'
  };
}

/**
 * Normaliza qualquer formato de medicamentos (legado de objeto ou array dinâmico)
 * @param {Object|Array} rawMedicamentos 
 * @returns {Array} Lista padronizada de medicamentos
 */
export function normalizeMedicamentosList(rawMedicamentos) {
  if (!rawMedicamentos) return [];

  // Se já for array
  if (Array.isArray(rawMedicamentos)) {
    return rawMedicamentos.filter(m => m && (m.nome || m.dosagem));
  }

  // Se for o formato de objeto legado { epo: "4000 UI", nor: "100mg", ... }
  if (typeof rawMedicamentos === 'object') {
    const list = [];
    const legacyMap = {
      epo: { nome: 'Alfaepoetina (EPO)', via: 'SC pós-HD', frequencia: '3x por semana', categoria: 'Eritropoiese & Anemia' },
      nor: { nome: 'Sacarato de Hidróxido Férrico (Noripurum)', via: 'EV pós-HD', frequencia: '1x por semana', categoria: 'Eritropoiese & Anemia' },
      paricalcitol: { nome: 'Paricalcitol (Zemplar)', via: 'EV pós-HD', frequencia: '3x por semana', categoria: 'Metabolismo Ósseo & Quelantes' },
      cinacalcete: { nome: 'Cloridrato de Cinacalcete', via: 'VO', frequencia: '1x ao dia', categoria: 'Metabolismo Ósseo & Quelantes' },
      sevelamer: { nome: 'Cloridrato / Carbonato de Sevelâmer', via: 'VO (às refeições)', frequencia: '3x ao dia', categoria: 'Metabolismo Ósseo & Quelantes' },
      caco3: { nome: 'Carbonato de Cálcio', via: 'VO (às refeições)', frequencia: '3x ao dia', categoria: 'Metabolismo Ósseo & Quelantes' }
    };

    Object.entries(rawMedicamentos).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value.trim() !== '') {
        const meta = legacyMap[key] || { nome: key.toUpperCase(), via: 'VO', frequencia: 'Uso contínuo', categoria: 'Geral' };
        list.push({
          id: `legacy-${key}-${Date.now()}`,
          nome: meta.nome,
          dosagem: value.trim(),
          via: meta.via,
          frequencia: meta.frequencia,
          categoria: meta.categoria,
          tipo: 'continuo',
          ativo: true,
          dataInicio: new Date().toISOString().split('T')[0]
        });
      } else if (value && typeof value === 'object' && value.nome) {
        list.push(value);
      }
    });

    return list;
  }

  return [];
}
