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
  if (exames.hb !== null && exames.hb !== undefined && exames.hb !== '') {
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
  if (exames.fosforo !== null && exames.fosforo !== undefined && exames.fosforo !== '') {
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
  if (exames.k !== null && exames.k !== undefined && exames.k !== '') {
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

  // ================= 4. CÁLCIO TOTAL (SAÚDE DOS OSSOS) =================
  if (exames.ca !== null && exames.ca !== undefined && exames.ca !== '') {
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

  // ================= 5. PTH (METABOLISMO ÓSSEO) =================
  if (exames.pth !== null && exames.pth !== undefined && exames.pth !== '') {
    const pth = Number(exames.pth);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (pth >= 150 && pth <= 300) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Hormônio ósseo em equilíbrio total! Seus ossos estão protegidos.';
      dica = 'Continue tomando seus remédios de suporte ósseo nos horários certos.';
    } else if (pth > 300 && pth <= 600) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Hormônio ósseo um pouco elevado. Vamos calibrar os remédios protetores.';
      dica = 'Mantenha o fósforo bem controlado nas refeições para ajudar seu PTH.';
    } else if (pth > 600) {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Atenção com os ossos: PTH elevado pede reforço no tratamento.';
      dica = 'Não deixe de tomar os medicamentos para tireoide/ossos prescritos pelo nefrologista.';
    } else { // pth < 150
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'PTH reduzido. A equipe médica irá adequar os remédios para estimular seus ossos.';
      dica = 'Converse com o médico sobre o ajuste de cálcio e vitamina D.';
    }

    cards.push({
      id: 'pth',
      categoria: 'Metabolismo Ósseo',
      subtitulo: 'Paratormônio (PTH)',
      valorFormatado: `${Math.round(pth)} pg/mL`,
      faixaMeta: 'Meta: 150 a 300 pg/mL',
      status,
      mensagem,
      dica,
      icone: 'Activity',
      corPrimaria: '#8b5cf6'
    });
  }

  // ================= 6. VITAMINA D (IMUNIDADE E OSSOS) =================
  if (exames.vitD !== null && exames.vitD !== undefined && exames.vitD !== '') {
    const vitD = Number(exames.vitD);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (vitD >= 30) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Vitamina do sol protegendo seus ossos e turbinando sua imunidade!';
      dica = 'Mantenha as doses de vitamina D prescritas na sua rotina.';
    } else if (vitD >= 20 && vitD < 30) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Vitamina D um pouco abaixo. Vamos repor para proteger sua imunidade.';
      dica = 'Tome as gotinhas ou cápsulas de vitamina D recomendadas pela equipe.';
    } else {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Vitamina D baixa. Seu corpo precisa de reposição para fortalecer os ossos.';
      dica = 'Tome sol moderado pela manhã e siga rigorosamente a suplementação prescrita.';
    }

    cards.push({
      id: 'vitD',
      categoria: 'Imunidade e Sol',
      subtitulo: 'Vitamina D (25-OH)',
      valorFormatado: `${vitD.toFixed(1).replace('.', ',')} ng/mL`,
      faixaMeta: 'Meta: ≥ 30 ng/mL',
      status,
      mensagem,
      dica,
      icone: 'ShieldCheck',
      corPrimaria: '#eab308'
    });
  }

  // ================= 7. FERRITINA (ESTOQUE DE FERRO) =================
  if (exames.ferritina !== null && exames.ferritina !== undefined && exames.ferritina !== '') {
    const fer = Number(exames.ferritina);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (fer >= 200 && fer <= 500) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Seu estoque de ferro está perfeito para produzir sangue de qualidade!';
      dica = 'Suas aplicações de ferro na diálise estão surtindo ótimo efeito.';
    } else if (fer > 500 && fer <= 800) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Bom estoque de ferro acumulado para sustentar sua energia.';
      dica = 'A equipe acompanhará o momento ideal de pausar ou manter o ferro na máquina.';
    } else if (fer < 200) {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Estoque de ferro baixo. Precisamos abastecer suas reservas de energia.';
      dica = 'Garanta a aplicação de ferro endovenoso na máquina sem faltar às sessões.';
    } else { // fer > 800
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Ferro muito acumulado. Vamos dar uma pausa nas aplicações da máquina.';
      dica = 'A equipe médica ajustará o ciclo de ferro conforme seus exames.';
    }

    cards.push({
      id: 'ferritina',
      categoria: 'Reserva de Ferro',
      subtitulo: 'Ferritina Sérica',
      valorFormatado: `${Math.round(fer)} ng/mL`,
      faixaMeta: 'Meta: 200 a 500 ng/mL',
      status,
      mensagem,
      dica,
      icone: 'Droplet',
      corPrimaria: '#c026d3'
    });
  }

  // ================= 8. IST (SATURAÇÃO DE TRANSFERRINA) =================
  if (exames.ist !== null && exames.ist !== undefined && exames.ist !== '') {
    const ist = Number(exames.ist);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (ist >= 20 && ist <= 50) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'O ferro está chegando rápido onde o sangue precisa!';
      dica = 'Seu organismo está aproveitando perfeitamente o ferro recebido.';
    } else if (ist < 20) {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Pouco ferro em circulação. Risco de cansaço e falta de ar.';
      dica = 'A equipe médica irá programar reforço de ferro durante a diálise.';
    } else { // ist > 50
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Ferro em circulação abundante. Vamos dosar as próximas aplicações.';
      dica = 'Aguarde a liberação da equipe antes de novas ampolas de ferro.';
    }

    cards.push({
      id: 'ist',
      categoria: 'Uso do Ferro',
      subtitulo: 'Saturação de Transferrina (IST)',
      valorFormatado: `${Math.round(ist)}%`,
      faixaMeta: 'Meta: 20 a 50%',
      status,
      mensagem,
      dica,
      icone: 'Zap',
      corPrimaria: '#ea580c'
    });
  }

  // ================= 9. KT/V OU CINÉTICA DE UREIA (LIMPEZA DO SANGUE) =================
  if (exames.ktv !== null && exames.ktv !== undefined && exames.ktv !== '') {
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
    const urPre = Number(exames.ureiaPre);
    const urPos = Number(exames.ureiaPos);
    if (urPre > 0) {
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
  }

  // ================= 10. ALBUMINA (NUTRIÇÃO, MÚSCULOS E IMUNIDADE) =================
  if (exames.albumina !== null && exames.albumina !== undefined && exames.albumina !== '') {
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
      categoria: 'Força e Nutrição',
      subtitulo: 'Albumina Sérica',
      valorFormatado: `${alb.toFixed(1).replace('.', ',')} g/dL`,
      faixaMeta: 'Meta: ≥ 3,8 g/dL',
      status,
      mensagem,
      dica,
      icone: 'Award',
      corPrimaria: '#7c3aed'
    });
  }

  // ================= 11. SÓDIO (EQUILÍBRIO DE ÁGUA E SEDE) =================
  if (exames.na !== null && exames.na !== undefined && exames.na !== '') {
    const na = Number(exames.na);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (na >= 135 && na <= 145) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Equilíbrio perfeito de sal e água! Menos sede e pressão sob controle.';
      dica = 'Continue moderando no sal da comida e evitando temperos prontos.';
    } else if (na > 145) {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Sódio elevado provoca muita sede e ganho de peso excessivo entre diálises.';
      dica = 'Corte embutidos e salgadinhos. Tempere com ervas naturais (orégano, alho e louro).';
    } else { // na < 135
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Sódio um pouco baixo. Vamos cuidar para evitar fraqueza ou câimbras.';
      dica = 'Siga as orientações de líquidos e dieta prescritas pela nutricionista.';
    }

    cards.push({
      id: 'na',
      categoria: 'Equilíbrio e Sede',
      subtitulo: 'Sódio Sérico',
      valorFormatado: `${Math.round(na)} mEq/L`,
      faixaMeta: 'Meta: 135 a 145 mEq/L',
      status,
      mensagem,
      dica,
      icone: 'Droplet',
      corPrimaria: '#0284c7'
    });
  }

  // ================= 12. BICARBONATO (EQUILÍBRIO ÁCIDO DO SANGUE) =================
  if (exames.hco3 !== null && exames.hco3 !== undefined && exames.hco3 !== '') {
    const hco3 = Number(exames.hco3);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (hco3 >= 22 && hco3 <= 26) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Sangue livre de acidez! Seus músculos e ossos estão protegidos.';
      dica = 'Tome o bicarbonato prescrito se indicado pela equipe médica.';
    } else if (hco3 < 22) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Sangue com leve acidez. Pode causar perda muscular e cansaço.';
      dica = 'Tome os comprimidos de bicarbonato prescritos pela equipe médica.';
    } else { // hco3 > 26
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Bicarbonato elevado. Vamos acompanhar com a equipe.';
      dica = 'Avise a equipe médica para calibrar o banho da diálise.';
    }

    cards.push({
      id: 'hco3',
      categoria: 'Acidez do Sangue',
      subtitulo: 'Bicarbonato (HCO3)',
      valorFormatado: `${hco3.toFixed(1).replace('.', ',')} mEq/L`,
      faixaMeta: 'Meta: 22 a 26 mEq/L',
      status,
      mensagem,
      dica,
      icone: 'ShieldCheck',
      corPrimaria: '#0d9488'
    });
  }

  // ================= 13. GLICEMIA (CONTROLE METABÓLICO) =================
  if (exames.glicemia !== null && exames.glicemia !== undefined && exames.glicemia !== '') {
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

  // ================= 14. PCR (PROTEÇÃO CONTRA INFLAMAÇÃO) =================
  if (exames.pcr !== null && exames.pcr !== undefined && exames.pcr !== '') {
    const pcr = Number(exames.pcr);
    let status = GOAL_STATUS.CONQUISTA;
    let mensagem = '';
    let dica = '';

    if (pcr <= 5.0) {
      status = GOAL_STATUS.CONQUISTA;
      mensagem = 'Corpo sereno e sem inflamação! Seu acesso vascular está saudável.';
      dica = 'Mantenha os cuidados diários de higiene com sua fístula ou cateter.';
    } else if (pcr > 5.0 && pcr <= 10.0) {
      status = GOAL_STATUS.QUASE_LA;
      mensagem = 'Leve inflamação detectada. Vamos investigar para proteger sua saúde.';
      dica = 'Avise a equipe se tiver febre, dor no acesso ou dor de dente.';
    } else {
      status = GOAL_STATUS.ATENCAO;
      mensagem = 'Inflamação ativa no sangue. A equipe médica dará atenção imediata.';
      dica = 'Comunique imediatamente qualquer secreção ou dor no cateter/fístula.';
    }

    cards.push({
      id: 'pcr',
      categoria: 'Proteção e Defesa',
      subtitulo: 'PCR (Inflamação)',
      valorFormatado: `${pcr.toFixed(1).replace('.', ',')} mg/L`,
      faixaMeta: 'Meta: Até 5,0 mg/L',
      status,
      mensagem,
      dica,
      icone: 'ShieldCheck',
      corPrimaria: '#e11d48'
    });
  }

  // ================= 15. FUNÇÃO HEPÁTICA (TGP / ALT) =================
  if (exames.tgp !== null && exames.tgp !== undefined && exames.tgp !== '') {
    const tgp = Number(exames.tgp);
    const status = tgp <= 45 ? GOAL_STATUS.CONQUISTA : GOAL_STATUS.QUASE_LA;

    cards.push({
      id: 'tgp',
      categoria: 'Saúde do Fígado',
      subtitulo: 'TGP (Enzimas Hepáticas)',
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
  let nivelTrofeu = 'OURO';

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
