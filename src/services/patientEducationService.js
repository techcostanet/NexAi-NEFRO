/**
 * 🌟 SERVIÇO DE EDUCAÇÃO EM SAÚDE E BOLETIM MOTIVACIONAL DO PACIENTE
 * Transforma parâmetros laboratoriais nefrológicos complexos (KDIGO/SBN)
 * em conquistas visuais, linguagem empática, reforço positivo e dicas práticas
 * acessíveis para todas as idades (crianças, adultos e idosos).
 */

export const GOAL_STATUS = {
  CONQUISTA: 'CONQUISTA',         // 🟢 Meta batida com louvor
  QUASE_LA: 'QUASE_LA',           // 🟡 Próximo da meta / em progresso
  ATENCAO: 'ATENCAO'              // 🔴 Ponto de atenção amiga / cuidado especial
};

/**
 * Avalia um conjunto de exames e retorna os cartões educativos com frases e dicas
 */
export function evaluatePatientExamsForBulletin(patient, selectedExam = null) {
  const exames = selectedExam || patient?.exames || {};
  const cards = [];

  // ================= 1. HEMOGLOBINA / ANEMIA (ENERGIA & SANGUE FORTE) =================
  if (exames.hb !== null && exames.hb !== undefined) {
    const hb = Number(exames.hb);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (hb >= 10.0 && hb <= 12.0) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Parabéns! Seu sangue está forte e sua energia protegida para o dia a dia. Continue assim!';
      dica = 'Mantenha suas aplicações de ferro e eritropoietina em dia após as sessões para sustentar essa disposição.';
    } else if (hb >= 9.0 && hb < 10.0) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Falta muito pouco! Seu sangue precisa de um pequeno reforço para você ter ainda mais disposição.';
      dica = 'Não deixe de receber as doses de ferro e eritropoietina nos dias prescritos na clínica de diálise.';
    } else if (hb < 9.0) {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Atenção com sua energia: seu sangue está pedindo reforço. Estamos juntos para recuperar sua força!';
      dica = 'Avise a equipe médica se sentir cansaço ou sono fora do comum e garanta o recebimento do seu ferro na máquina.';
    } else { // hb > 12.0
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Seu sangue está bem concentrado! Vamos acompanhar de perto para mantê-lo na faixa perfeita.';
      dica = 'Beba água dentro do limite prescrito pela sua equipe para manter o sangue fluido e bem equilibrado.';
    }

    cards.push({
      id: 'hb',
      categoria: 'Energia & Disposição',
      subtitulo: 'Hemoglobina (Força do Sangue)',
      valorFormatado: `${hb.toFixed(1).replace('.', ',')} g/dL`,
      faixaMeta: 'Meta: 10,0 a 12,0 g/dL',
      status,
      mensagem,
      dica,
      icone: 'Droplet',
      corPrimaria: '#e11d48'
    });
  }

  // ================= 2. FÓSFORO (OSSOS FIRMES & PROTEÇÃO DAS ARTÉRIAS) =================
  if (exames.fosforo !== null && exames.fosforo !== undefined) {
    const p = Number(exames.fosforo);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (p >= 3.5 && p <= 5.5) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Sensacional! Fósforo na meta protege seus ossos contra dores e deixa seus vasos sanguíneos limpos e flexíveis.';
      dica = 'Continue tomando seu quelante exatamente DURANTE as refeições (na primeira garfada) para manter essa nota 10!';
    } else if (p > 5.5 && p <= 7.0) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'O fósforo subiu um pouquinho este mês. Com pequenos ajustes à mesa, ele volta rapidinho para a meta!';
      dica = 'Evite refrigerantes escuros (cola), queijos amarelos e embutidos (salsicha, presunto). Tome o quelante junto com a comida.';
    } else if (p > 7.0) {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Atenção carinhosa com os ossos: o fósforo está elevado. Vamos unir forças para protegê-los!';
      dica = 'Nunca tome o quelante com a barriga vazia — ele precisa mastigar junto com a comida para funcionar no estômago.';
    } else { // p < 3.5
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Fósforo um pouco baixo. Vamos cuidar para sua alimentação ficar bem equilibrada, nutritiva e saborosa.';
      dica = 'Consuma as proteínas saudáveis indicadas pela nutricionista (ovos cozidos, carnes magras) para fortalecer seu corpo.';
    }

    cards.push({
      id: 'fosforo',
      categoria: 'Ossos & Artérias',
      subtitulo: 'Fósforo Sérico',
      valorFormatado: `${p.toFixed(1).replace('.', ',')} mg/dL`,
      faixaMeta: 'Meta: 3,5 a 5,5 mg/dL',
      status,
      mensagem,
      dica,
      icone: 'Activity',
      corPrimaria: '#d97706'
    });
  }

  // ================= 3. POTÁSSIO (RITMO SEGURO DO CORAÇÃO) =================
  if (exames.k !== null && exames.k !== undefined) {
    const k = Number(exames.k);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (k >= 3.5 && k <= 5.5) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Excelente! Seu coração está batendo com segurança máxima, tranquilidade e no compasso certo.';
      dica = 'Parabéns pelo cuidado com as frutas e verduras! Mantenha esse método de preparo dos alimentos.';
    } else if (k > 5.5 && k <= 6.2) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Cuidado amigo com o coração: o potássio subiu um pouco. Vamos redobrar o carinho no preparo dos vegetais.';
      dica = 'Ferva os legumes e verduras em duas águas: ferva, escorra a água e ferva de novo antes de temperar.';
    } else if (k > 6.2) {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Atenção prioritária: seu potássio está alto e o coração pede descanso e proteção imediata!';
      dica = 'Evite temporariamente água de coco, carambola, banana prata, abacate e extrato de tomate até o próximo exame.';
    } else { // k < 3.5
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Potássio um pouco baixo. O coração também precisa dele na medida certa para bater com vigor.';
      dica = 'A nutricionista pode sugerir uma fruta gostosa no seu dia a dia para equilibrar seus eletrólitos.';
    }

    cards.push({
      id: 'k',
      categoria: 'Ritmo do Coração',
      subtitulo: 'Potássio Sérico (K⁺)',
      valorFormatado: `${k.toFixed(1).replace('.', ',')} mEq/L`,
      faixaMeta: 'Meta: 3,5 a 5,5 mEq/L',
      status,
      mensagem,
      dica,
      icone: 'Heart',
      corPrimaria: '#dc2626'
    });
  }

  // ================= 4. CÁLCIO & PTH (PROTEÇÃO ÓSSEA & ARTICULAR) =================
  if (exames.ca !== null && exames.ca !== undefined) {
    const ca = Number(exames.ca);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (ca >= 8.8 && ca <= 10.2) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Muito bem! Seus ossos, dentes e músculos têm todo o cálcio necessário para funcionarem sem dor.';
      dica = 'Tome sua vitamina D ou ativadores nos dias combinados com a equipe para fixar bem o cálcio no esqueleto.';
    } else if (ca < 8.8) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'O cálcio está ligeiramente baixo. Vamos ajustar os remédios de suporte ósseo para você se sentir 100%.';
      dica = 'Siga a orientação médica sobre reposição de cálcio e vitamina D — nunca tome remédios por conta própria.';
    } else { // ca > 10.2
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Cálcio um pouco elevado no sangue. Vamos dosar certinho suas medicações para protegê-lo.';
      dica = 'Avise seu médico se estiver tomando comprimidos efervescentes ou suplementos de cálcio além dos prescritos.';
    }

    cards.push({
      id: 'ca',
      categoria: 'Saúde Mineral',
      subtitulo: 'Cálcio Total',
      valorFormatado: `${ca.toFixed(1).replace('.', ',')} mg/dL`,
      faixaMeta: 'Meta: 8,8 a 10,2 mg/dL',
      status,
      mensagem,
      dica,
      icone: 'ShieldCheck',
      corPrimaria: '#2563eb'
    });
  }

  // ================= 5. KT/V OU CINÉTICA DE UREIA (LIMPEZA DO SANGUE) =================
  if (exames.ktv !== null && exames.ktv !== undefined) {
    const ktv = Number(exames.ktv);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (ktv >= 1.20) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Nota 10 na Limpeza! Sua sessão de diálise filtrou o sangue com máxima pureza e eficácia.';
      dica = 'Parabéns por cumprir todo o horário das suas sessões de diálise sem sair antes do tempo!';
    } else {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Podemos filtrar ainda mais! Vamos garantir que cada minuto na máquina trabalhe a seu favor.';
      dica = 'Procure completar todas as 4 horas de sessão e cuide bem do seu acesso vascular (FAV ou cateter).';
    }

    cards.push({
      id: 'ktv',
      categoria: 'Filtração & Limpeza',
      subtitulo: 'Kt/V Único (Dose de Diálise)',
      valorFormatado: `${ktv.toFixed(2).replace('.', ',')}`,
      faixaMeta: 'Meta: ≥ 1,20 por sessão',
      status,
      mensagem,
      dica,
      icone: 'Zap',
      corPrimaria: '#059669'
    });
  } else if (exames.ureiaPre && exames.ureiaPos) {
    // Estimativa por Ureia se não tiver Kt/V direto
    const urPre = Number(exames.ureiaPre);
    const urPos = Number(exames.ureiaPos);
    const urReducao = ((urPre - urPos) / urPre) * 100;
    const status = urReducao >= 65 ? GOAL_STATUS.CONQUISTA : GOAL_STATUS.QUASE_LA;

    cards.push({
      id: 'ureia',
      categoria: 'Filtração & Limpeza',
      subtitulo: 'Redução de Ureia na Máquina',
      valorFormatado: `${Math.round(urReducao)}% depurada`,
      faixaMeta: 'Meta: ≥ 65% de redução',
      status,
      mensagem: status === GOAL_STATUS.CONQUISTA 
        ? 'Excelente limpeza! A diálise removeu as toxinas com grande eficiência.'
        : 'Podemos depurar mais toxinas completando sempre o horário integral da sessão.',
      dica: 'Não reduza o tempo de diálise e mantenha a circulação da fístula sempre livre sem apertos.',
      icone: 'Zap',
      corPrimaria: '#059669'
    });
  }

  // ================= 6. ALBUMINA (NUTRIÇÃO, MÚSCULOS & IMUNIDADE) =================
  if (exames.albumina !== null && exames.albumina !== undefined) {
    const alb = Number(exames.albumina);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (alb >= 3.8) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Nutrição de campeão! Seus músculos continuam firmes e sua imunidade pronta para te proteger.';
      dica = 'Continue comendo boas fontes de proteína indicadas pela nutricionista (claras de ovo, peixes, aves).';
    } else {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Seu corpo precisa de um reforço de nutrientes para manter os músculos e a defesa bem fortes.';
      dica = 'Converse com a nutricionista da clínica para incluir suplementos proteicos apropriados para quem faz diálise.';
    }

    cards.push({
      id: 'albumina',
      categoria: 'Força & Imunidade',
      subtitulo: 'Albumina (Estado Nutricional)',
      valorFormatado: `${alb.toFixed(1).replace('.', ',')} g/dL`,
      faixaMeta: 'Meta: ≥ 3,8 g/dL',
      status,
      mensagem,
      dica,
      icone: 'Award',
      corPrimaria: '#7c3aed'
    });
  }

  // ================= 7. GLICEMIA (CONTROLE METABÓLICO) =================
  if (exames.glicemia !== null && exames.glicemia !== undefined) {
    const gli = Number(exames.glicemia);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (gli >= 70 && gli <= 125) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Açúcar sob controle absoluto! Você está protegendo sua visão, circulação e seus vasos sanguíneos.';
      dica = 'Mantenha os bons hábitos alimentares e seus remédios de controle glicêmico nos horários certos.';
    } else if (gli > 125 && gli <= 180) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'O açúcar no sangue subiu um pouco. Vamos alinhar a alimentação para voltar ao equilíbrio perfeito!';
      dica = 'Evite doces, bolachas recheadas e pão em excesso. Prefira alimentos integrais recomendados pela nutri.';
    } else if (gli > 180) {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Glicose elevada: seu corpo está pedindo atenção com a alimentação e o ajuste dos remédios.';
      dica = 'Cheque a glicemia antes das refeições e converse com o médico sobre o ajuste de insulina ou comprimidos.';
    } else { // gli < 70
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Glicose muito baixa: tome cuidado com tonturas ou tremores. O corpo precisa de energia!';
      dica = 'Nunca fique longos períodos sem comer e tenha sempre uma orientação de lanchinho para diálise.';
    }

    cards.push({
      id: 'glicemia',
      categoria: 'Controle de Açúcar',
      subtitulo: 'Glicemia de Jejum',
      valorFormatado: `${Math.round(gli)} mg/dL`,
      faixaMeta: 'Meta: 70 a 125 mg/dL',
      status,
      mensagem,
      dica,
      icone: 'Activity',
      corPrimaria: '#0284c7'
    });
  }

  // ================= 8. FUNÇÃO HEPÁTICA (TGP / ALT) =================
  if (exames.tgp !== null && exames.tgp !== undefined) {
    const tgp = Number(exames.tgp);
    const status = tgp <= 45 ? GOAL_STATUS.CONQUISTA : GOAL_STATUS.QUASE_LA;

    cards.push({
      id: 'tgp',
      categoria: 'Saúde do Fígado',
      subtitulo: 'TGP (ALT) - Função Hepática',
      valorFormatado: `${Math.round(tgp)} U/L`,
      faixaMeta: 'Meta: Até 45 U/L',
      status,
      mensagem: status === GOAL_STATUS.CONQUISTA 
        ? 'Fígado saudável e protegido! Suas enzimas hepáticas estão em perfeito estado.'
        : 'Enzima do fígado um pouco elevada. Vamos investigar e proteger seu sistema hepático.',
      dica: 'Evite medicamentos por conta própria (como anti-inflamatórios ou chás caseiros) e mantenha a vacinação em dia.',
      icone: 'ShieldCheck',
      corPrimaria: '#0d9488'
    });
  }

  // ================= CÁLCULO DO PLACAR DE CONQUISTAS =================
  const totalMetas = cards.length;
  const metasBatidas = cards.filter(c => c.status === GOAL_STATUS.CONQUISTA).length;
  const metasQuaseLa = cards.filter(c => c.status === GOAL_STATUS.QUASE_LA).length;
  const taxaSucesso = totalMetas > 0 ? (metasBatidas / totalMetas) * 100 : 100;

  let tituloPlacar = 'Show de Dedicação!';
  let mensagemGeral = '';
  let nivelTrofeu = 'OURO'; // 'OURO' | 'PRATA' | 'INCENTIVO'

  if (taxaSucesso >= 75) {
    nivelTrofeu = 'OURO';
    tituloPlacar = 'Desempenho Campeão! 🏆';
    mensagemGeral = `Sensacional! Você atingiu ${metasBatidas} de ${totalMetas} metas de saúde com louvor neste mês. Seu esforço e disciplina nas sessões de diálise estão transformando sua qualidade de vida!`;
  } else if (taxaSucesso >= 45) {
    nivelTrofeu = 'PRATA';
    tituloPlacar = 'Grandes Conquistas! 🌟';
    mensagemGeral = `Muito bem! Você conquistou vitórias importantes neste mês (${metasBatidas} metas batidas). Com pequenos ajustes na rotina e nas dicas da equipe, no próximo mês chegaremos ainda mais longe!`;
  } else {
    nivelTrofeu = 'INCENTIVO';
    tituloPlacar = 'Estamos Juntos nessa Jornada! 💪';
    mensagemGeral = `Cada mês é uma nova oportunidade de recomeço e vitória. Toda a nossa equipe de Nefrologia está de mãos dadas com você para alcançarmos o melhor bem-estar possível!`;
  }

  return {
    pacienteNome: patient?.nome || 'Paciente',
    dataReferencia: exames.dataExame || new Date().toISOString().split('T')[0],
    totalMetas,
    metasBatidas,
    metasQuaseLa,
    taxaSucesso: Math.round(taxaSucesso),
    nivelTrofeu,
    tituloPlacar,
    mensagemGeral,
    cards
  };
}
