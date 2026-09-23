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
      mensagem = 'Sangue forte! Sua energia e disposição estão bem protegidas.';
      dica = 'Mantenha o ferro e eritropoietina em dia nas sessões de diálise.';
    } else if (hb >= 9.0 && hb < 10.0) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Falta pouco! Seu sangue precisa de reforço para você não sentir cansaço.';
      dica = 'Não deixe de receber as doses de ferro na máquina prescritas pela equipe.';
    } else if (hb < 9.0) {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Atenção com anemia: seu sangue está fraco e pede reforço imediato.';
      dica = 'Avise a equipe se sentir tontura e garanta o ferro na máquina.';
    } else { // hb > 12.0
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Sangue concentrado. Vamos acompanhar para manter no ponto certo.';
      dica = 'Beba os líquidos na medida certa orientada pela sua equipe.';
    }

    cards.push({
      id: 'hb',
      categoria: 'Energia e Sangue',
      subtitulo: 'Hemoglobina (Anemia)',
      valorFormatado: `${hb.toFixed(1).replace('.', ',')} g/dL`,
      faixaMeta: 'Meta: 10,0 a 12,0 g/dL',
      status,
      mensagem,
      dica,
      icone: 'Droplet',
      corPrimaria: '#e11d48'
    });
  }

  // ================= 2. FÓSFORO (OSSOS FIRMES E PROTEÇÃO DAS ARTÉRIAS) =================
  if (exames.fosforo !== null && exames.fosforo !== undefined) {
    const p = Number(exames.fosforo);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (p >= 3.5 && p <= 5.5) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Ossos e artérias protegidos! Seu fósforo está excelente.';
      dica = 'Continue tomando seu quelante exatamente no meio das refeições.';
    } else if (p > 5.5 && p <= 7.0) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Fósforo subiu um pouco. Cuidado com queijos amarelos e refrigerantes escuros.';
      dica = 'Tome o comprimido quelante junto com a comida para ele agir no estômago.';
    } else if (p > 7.0) {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Atenção: fósforo alto! Risco de dor nos ossos e coceira na pele.';
      dica = 'Evite embutidos (salsicha, linguiça), refrigerantes de cola e queijos amarelos.';
    } else { // p < 3.5
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Fósforo baixo. Sua alimentação precisa de mais nutrientes saudáveis.';
      dica = 'Consuma as carnes magras e ovos cozidos recomendados pela nutricionista.';
    }

    cards.push({
      id: 'fosforo',
      categoria: 'Ossos e Artérias',
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
      mensagem = 'Coração seguro! Seu potássio está na faixa perfeita.';
      dica = 'Parabéns pelo cuidado com as frutas e verduras no dia a dia!';
    } else if (k > 5.5 && k <= 6.2) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Potássio subiu um pouco. Cuidado redobrado com frutas e verduras.';
      dica = 'Ferva os legumes e verduras em duas águas antes de temperar.';
    } else if (k > 6.2) {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Atenção urgente: potássio alto! Perigo imediato para o seu coração.';
      dica = 'Evite banana, água de coco, carambola, abacate e extrato de tomate.';
    } else { // k < 3.5
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Potássio baixo. O coração também precisa dele equilibrado.';
      dica = 'A nutricionista pode indicar uma fruta segura para equilibrar seus sais.';
    }

    cards.push({
      id: 'k',
      categoria: 'Ritmo do Coração',
      subtitulo: 'Potássio Sérico',
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
      mensagem = 'Cálcio perfeito! Ossos e músculos fortes sem dores.';
      dica = 'Tome sua vitamina D nos dias combinados com a equipe médica.';
    } else if (ca < 8.8) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Cálcio um pouco baixo. Vamos ajustar as medicações de suporte.';
      dica = 'Siga a orientação médica sobre reposição de cálcio e vitamina D.';
    } else { // ca > 10.2
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Cálcio elevado. Vamos adequar seus medicamentos para proteger seus vasos.';
      dica = 'Não tome suplementos ou antiácidos de cálcio por conta própria.';
    }

    cards.push({
      id: 'ca',
      categoria: 'Saúde dos Ossos',
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
      mensagem = 'Limpeza nota 10! A máquina filtrou o sangue com máxima eficácia.';
      dica = 'Parabéns por cumprir todo o horário das suas sessões de diálise!';
    } else {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Podemos filtrar mais toxinas. Complete sempre todo o tempo da máquina.';
      dica = 'Procure completar todas as 4 horas de sessão e cuide bem do seu acesso.';
    }

    cards.push({
      id: 'ktv',
      categoria: 'Filtração e Limpeza',
      subtitulo: 'Dose da Diálise (Kt/V)',
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
      categoria: 'Filtração e Limpeza',
      subtitulo: 'Redução de Ureia na Máquina',
      valorFormatado: `${Math.round(urReducao)}% depurada`,
      faixaMeta: 'Meta: ≥ 65% de redução',
      status,
      mensagem: status === GOAL_STATUS.CONQUISTA 
        ? 'Excelente limpeza! A diálise retirou as impurezas com grande eficácia.'
        : 'Podemos filtrar mais impurezas completando sempre todo o horário da sessão.',
      dica: 'Não reduza o tempo de diálise e mantenha a circulação da fístula livre sem apertos.',
      icone: 'Zap',
      corPrimaria: '#059669'
    });
  }

  // ================= 6. ALBUMINA (NUTRIÇÃO, MÚSCULOS E IMUNIDADE) =================
  if (exames.albumina !== null && exames.albumina !== undefined) {
    const alb = Number(exames.albumina);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (alb >= 3.8) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Nutrição de campeão! Seus músculos e imunidade estão firmes e fortes.';
      dica = 'Continue comendo as boas fontes de proteína indicadas pela nutricionista.';
    } else {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Seu corpo pede reforço nutritivo para manter a força e as defesas.';
      dica = 'Converse com a nutricionista para incluir alimentos proteicos na sua rotina.';
    }

    cards.push({
      id: 'albumina',
      categoria: 'Força e Imunidade',
      subtitulo: 'Albumina (Nutrição)',
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
      mensagem = 'Açúcar controlado! Seus olhos, nervos e circulação agradecem.';
      dica = 'Mantenha os hábitos saudáveis e remédios do diabetes nos horários certos.';
    } else if (gli > 125 && gli <= 180) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Açúcar subiu um pouco. Cuidado com doces, pães e refrigerantes.';
      dica = 'Evite refrigerantes normais e açúcares. Prefira água e refeições equilibradas.';
    } else if (gli > 180) {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Atenção: açúcar alto no sangue. Mantenha os remédios em dia.';
      dica = 'Meça a glicose regularmente e converse com o médico sobre o tratamento.';
    } else { // gli < 70
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Atenção: açúcar muito baixo. Cuidado com tontura ou suor frio.';
      dica = 'Nunca fique muito tempo sem comer e tenha sempre orientação de lanche.';
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
      subtitulo: 'TGP (Função do Fígado)',
      valorFormatado: `${Math.round(tgp)} U/L`,
      faixaMeta: 'Meta: Até 45 U/L',
      status,
      mensagem: status === GOAL_STATUS.CONQUISTA 
        ? 'Fígado saudável e protegido! Suas enzimas estão em ordem.'
        : 'Fígado requer atenção. Vamos acompanhar com cuidado.',
      dica: 'Evite remédios ou chás caseiros sem perguntar para o médico.',
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
