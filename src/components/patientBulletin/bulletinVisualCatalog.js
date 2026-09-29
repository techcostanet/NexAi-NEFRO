/**
 * 🎨 CATÁLOGO VISUAL & LÚDICO DE SAÚDE NEFROLÓGICA (LETRAMENTO EM SAÚDE)
 * Desenvolvido para pacientes com baixa escolaridade formal, dificuldades de leitura
 * ou limitações visuais. Transforma termos laboratoriais complexos em figuras,
 * órgãos humanos reconhecíveis, semáforos de carinhas e dicas de ação práticas.
 */

import { GOAL_STATUS } from '../../services/patientEducationService';

export const VISUAL_INDICATORS = {
  k: {
    id: 'k',
    titulo: 'Coração',
    subtitulo: 'Ritmo e Batimentos',
    tema: 'coracao',
    emoji: '❤️',
    corTema: '#dc2626',
    bgTema: '#fef2f2',
    bordaTema: '#fecaca',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Coração calmo e batendo em ritmo perfeito!',
      acaoIcone: '👏',
      acaoTexto: 'Parabéns pelos cuidados com a alimentação!'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Potássio subiu um pouco. Cuidado com as frutas.',
      acaoIcone: '🍌',
      acaoTexto: 'Ferva as verduras em duas águas antes de comer.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '🚨',
      rotulo: 'Cuidado!',
      mensagem: 'Alerta de potássio alto! Perigo para o coração.',
      acaoIcone: '🚫',
      acaoTexto: 'Evite banana, água de coco, abacate e molho de tomate.'
    }
  },

  hb: {
    id: 'hb',
    titulo: 'Sangue',
    subtitulo: 'Energia e Força',
    tema: 'sangue',
    emoji: '🩸',
    corTema: '#e11d48',
    bgTema: '#fff1f2',
    bordaTema: '#fecdd3',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Sangue forte! Muita energia e disposição.',
      acaoIcone: '💪',
      acaoTexto: 'Continue mantendo o ferro em dia na máquina.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Sangue precisa de reforço para afastar o cansaço.',
      acaoIcone: '💉',
      acaoTexto: 'Não falte às sessões de ferro na diálise.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Anemia detectada. Sangue fraco pede atenção.',
      acaoIcone: '🩺',
      acaoTexto: 'Avise a equipe médica se tiver tontura ou fraqueza.'
    }
  },

  fosforo: {
    id: 'fosforo',
    titulo: 'Ossos',
    subtitulo: 'Proteção das Artérias',
    tema: 'ossos',
    emoji: '🦴',
    corTema: '#d97706',
    bgTema: '#fffbeb',
    bordaTema: '#fde68a',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Ossos firmes e artérias bem protegidas!',
      acaoIcone: '💊',
      acaoTexto: 'Continue tomando seu remédio junto da refeição.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Fósforo subiu um pouco. Cuidado com queijo amarelo.',
      acaoIcone: '🧀',
      acaoTexto: 'Tome o comprimido mastigado junto com o prato de comida.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Fósforo alto pode causar coceira e dor nos ossos.',
      acaoIcone: '🚫',
      acaoTexto: 'Evite refrigerantes escuros, salsicha e queijos amarelos.'
    }
  },

  ca: {
    id: 'ca',
    titulo: 'Cálcio',
    subtitulo: 'Dentes e Esqueleto',
    tema: 'ossos',
    emoji: '🦷',
    corTema: '#2563eb',
    bgTema: '#eff6ff',
    bordaTema: '#bfdbfe',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Cálcio excelente! Músculos e esqueleto sem dores.',
      acaoIcone: '✨',
      acaoTexto: 'Seu corpo está aproveitando muito bem o tratamento.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Cálcio precisa de ajuste com as orientações do médico.',
      acaoIcone: '💊',
      acaoTexto: 'Tome as medicações na dosagem combinada.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Cálcio fora do padrão. A equipe vai calibrar seus remédios.',
      acaoIcone: '🩺',
      acaoTexto: 'Não tome suplementos de cálcio por conta própria.'
    }
  },

  pth: {
    id: 'pth',
    titulo: 'Hormônio',
    subtitulo: 'Defesa dos Ossos',
    tema: 'ossos',
    emoji: '🛡️',
    corTema: '#8b5cf6',
    bgTema: '#f5f3ff',
    bordaTema: '#ddd6fe',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Hormônio dos ossos em equilíbrio perfeito!',
      acaoIcone: '👍',
      acaoTexto: 'Continue tomando as cápsulas nos dias certos.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Hormônio ósseo subiu. Vamos calibrar os remédios.',
      acaoIcone: '🍽️',
      acaoTexto: 'Controlar o fósforo na comida ajuda muito seu PTH.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'PTH alto enfraquece os ossos. Atenção redobrada.',
      acaoIcone: '💊',
      acaoTexto: 'Tome rigorosamente os remédios de suporte ósseo.'
    }
  },

  vitD: {
    id: 'vitD',
    titulo: 'Sol',
    subtitulo: 'Imunidade e Defesa',
    tema: 'sol',
    emoji: '☀️',
    corTema: '#eab308',
    bgTema: '#fefce8',
    bordaTema: '#fef08a',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Vitamina do sol protegendo sua imunidade!',
      acaoIcone: '☀️',
      acaoTexto: 'Imunidade fortalecida contra gripes e infecções.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Vitamina D um pouco baixa. Precisamos repor.',
      acaoIcone: '💧',
      acaoTexto: 'Tome as gotinhas de vitamina D receitadas.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Vitamina D baixa enfraquece suas defesas.',
      acaoIcone: '💊',
      acaoTexto: 'Tome sol de manhã e tome a vitamina prescrita.'
    }
  },

  ferritina: {
    id: 'ferritina',
    titulo: 'Energia',
    subtitulo: 'Estoque de Ferro',
    tema: 'energia',
    emoji: '🔋',
    corTema: '#c026d3',
    bgTema: '#fdf4ff',
    bordaTema: '#f5d0fe',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Estoque de ferro cheio para dar muita força!',
      acaoIcone: '⚡',
      acaoTexto: 'Suas aplicações de ferro na máquina deram resultado.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Estoque de ferro necessita de acompanhamento.',
      acaoIcone: '🩺',
      acaoTexto: 'A equipe médica vai dosar suas próximas ampolas.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Estoque de ferro baixo. Risco de cansaço extremo.',
      acaoIcone: '💉',
      acaoTexto: 'Garanta a aplicação de ferro na máquina de diálise.'
    }
  },

  ist: {
    id: 'ist',
    titulo: 'Circulação',
    subtitulo: 'Uso do Ferro',
    tema: 'energia',
    emoji: '⚡',
    corTema: '#ea580c',
    bgTema: '#fff7ed',
    bordaTema: '#fed7aa',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'O ferro está chegando rápido onde o sangue precisa!',
      acaoIcone: '🚀',
      acaoTexto: 'Corpo aproveitando 100% o tratamento.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Ferro em circulação suficiente. Vamos manter.',
      acaoIcone: '👍',
      acaoTexto: 'Siga as orientações da equipe de enfermagem.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Pouco ferro circulando para fabricar sangue.',
      acaoIcone: '💉',
      acaoTexto: 'A equipe médica programará nova aplicação na máquina.'
    }
  },

  ktv: {
    id: 'ktv',
    titulo: 'Máquina',
    subtitulo: 'Limpeza do Sangue',
    tema: 'filtro',
    emoji: '🧼',
    corTema: '#059669',
    bgTema: '#f0fdf4',
    bordaTema: '#bbf7d0',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Limpeza nota 10! A máquina filtrou todas as toxinas.',
      acaoIcone: '⭐',
      acaoTexto: 'Parabéns por cumprir todo o horário da sua diálise!'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'A máquina pode limpar mais se cumprir as 4 horas.',
      acaoIcone: '⏰',
      acaoTexto: 'Não peça para sair mais cedo da máquina de diálise.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Limpeza incompleta. Restaram impurezas no sangue.',
      acaoIcone: '⏰',
      acaoTexto: 'Cumpra sempre as 4 horas inteiras de tratamento.'
    }
  },

  ureia: {
    id: 'ureia',
    titulo: 'Filtro',
    subtitulo: 'Saída de Impurezas',
    tema: 'filtro',
    emoji: '🧼',
    corTema: '#059669',
    bgTema: '#f0fdf4',
    bordaTema: '#bbf7d0',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Mais de 65% das impurezas foram embora!',
      acaoIcone: '👏',
      acaoTexto: 'Sangue limpo garante sono tranquilo e apetite.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Filtração pode melhorar completando a sessão.',
      acaoIcone: '⏰',
      acaoTexto: 'Cuide bem da sua fístula e não aperte o braço.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Muitas toxinas retidas no corpo.',
      acaoIcone: '🩺',
      acaoTexto: 'Fale com a equipe sobre o fluxo da fístula/cateter.'
    }
  },

  albumina: {
    id: 'albumina',
    titulo: 'Alimento',
    subtitulo: 'Nutrição e Músculo',
    tema: 'nutricao',
    emoji: '🍲',
    corTema: '#7c3aed',
    bgTema: '#faf5ff',
    bordaTema: '#e9d5ff',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Nutrição de campeão! Músculos e pernas fortes.',
      acaoIcone: '🍳',
      acaoTexto: 'Continue comendo os alimentos recomendados pela nutri.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Seu corpo pede um pouco mais de alimentos nutritivos.',
      acaoIcone: '🥚',
      acaoTexto: 'Consuma ovos e carnes magras combinados com a nutricionista.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Nutrição em baixa. Risco de fraqueza e perda de músculo.',
      acaoIcone: '🍲',
      acaoTexto: 'Alimente-se bem e converse com a nutricionista da clínica.'
    }
  },

  na: {
    id: 'na',
    titulo: 'Sal',
    subtitulo: 'Pressão e Sede',
    tema: 'sal',
    emoji: '💧',
    corTema: '#0284c7',
    bgTema: '#f0f9ff',
    bordaTema: '#bae6fd',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Sal e água em equilíbrio! Menos sede e pressão boa.',
      acaoIcone: '🥛',
      acaoTexto: 'Parabéns por controlar o sal e os líquidos do dia.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Sódio pede moderação para não dar sede demais.',
      acaoIcone: '🧂',
      acaoTexto: 'Corte temperos prontos em cubo e salgadinhos.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Muito sal no sangue dá sede insuportável e inchaço.',
      acaoIcone: '🚫',
      acaoTexto: 'Evite embutidos (presunto, linguiça, mortadela).'
    }
  },

  hco3: {
    id: 'hco3',
    titulo: 'Leveza',
    subtitulo: 'Acidez do Sangue',
    tema: 'saude',
    emoji: '🌬️',
    corTema: '#0d9488',
    bgTema: '#f0fdfa',
    bordaTema: '#99f6e4',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Sangue livre de acidez! Sem sensação de cansaço.',
      acaoIcone: '✨',
      acaoTexto: 'Seu organismo está equilibrado e calmo.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Sangue com leve acidez. Pode dar indisposição.',
      acaoIcone: '💊',
      acaoTexto: 'Tome o bicarbonato receitado pela equipe médica.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Acidez elevada. Exige cuidado imediato.',
      acaoIcone: '🩺',
      acaoTexto: 'A equipe ajustará o banho da diálise na máquina.'
    }
  },

  glicemia: {
    id: 'glicemia',
    titulo: 'Açúcar',
    subtitulo: 'Controle do Diabetes',
    tema: 'acucar',
    emoji: '🩺',
    corTema: '#0284c7',
    bgTema: '#f0f9ff',
    bordaTema: '#bae6fd',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Açúcar controlado! Olhos e circulação agradecem.',
      acaoIcone: '👏',
      acaoTexto: 'Mantenha os remédios do diabetes nos horários certos.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Açúcar subiu um pouco. Cuidado com pão e doces.',
      acaoIcone: '🍎',
      acaoTexto: 'Prefira água e evite sucos açucarados ou refrigerantes.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Açúcar alterado no sangue. Risco de mal-estar.',
      acaoIcone: '🩺',
      acaoTexto: 'Meça a glicose em casa e avise a equipe médica.'
    }
  },

  pcr: {
    id: 'pcr',
    titulo: 'Defesa',
    subtitulo: 'Sem Inflamação',
    tema: 'defesa',
    emoji: '🛡️',
    corTema: '#e11d48',
    bgTema: '#fff1f2',
    bordaTema: '#fecdd3',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Corpo sereno e sem inflamação! Fístula saudável.',
      acaoIcone: '🚿',
      acaoTexto: 'Mantenha os cuidados diários de limpeza do seu braço.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Leve sinal de inflamação. Vamos acompanhar.',
      acaoIcone: '🩺',
      acaoTexto: 'Avise se sentir dor no dente, garganta ou fístula.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Inflamação ativa. A equipe cuidará imediatamente.',
      acaoIcone: '🚨',
      acaoTexto: 'Alerte a enfermagem sobre qualquer dor, calor ou febre.'
    }
  },

  tgp: {
    id: 'tgp',
    titulo: 'Fígado',
    subtitulo: 'Filtro Natural',
    tema: 'figado',
    emoji: '🍃',
    corTema: '#0d9488',
    bgTema: '#f0fdfa',
    bordaTema: '#99f6e4',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: 'Fígado saudável e protegido! Enzimas em ordem.',
      acaoIcone: '✨',
      acaoTexto: 'Seu filtro natural do corpo está trabalhando bem.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: 'Fígado pede atenção e cuidado.',
      acaoIcone: '🚫',
      acaoTexto: 'Evite remédios caseiros ou chás sem receita médica.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: 'Enzimas do fígado alteradas.',
      acaoIcone: '🩺',
      acaoTexto: 'Mostre seus remédios atuais para o nefrologista.'
    }
  }
};

/**
 * Retorna os dados lúdicos de um cartão a partir de seu ID e status atual
 */
export function getVisualDataForCard(card) {
  if (!card) return null;
  const config = VISUAL_INDICATORS[card.id] || {
    id: card.id,
    titulo: card.subtitulo || card.categoria || 'Saúde',
    subtitulo: card.categoria || '',
    tema: 'saude',
    emoji: '⭐',
    corTema: card.corPrimaria || '#2563eb',
    bgTema: '#eff6ff',
    bordaTema: '#bfdbfe',
    conquista: {
      humor: 'feliz',
      carinha: '😃',
      rotulo: 'Tudo Certo!',
      mensagem: card.mensagem || 'Resultado excelente!',
      acaoIcone: '👏',
      acaoTexto: card.dica || 'Continue com o ótimo cuidado.'
    },
    quaseLa: {
      humor: 'atencao',
      carinha: '😐',
      rotulo: 'Quase Lá!',
      mensagem: card.mensagem || 'Resultado próximo da meta.',
      acaoIcone: '💡',
      acaoTexto: card.dica || 'Pequenos ajustes farão diferença.'
    },
    atencao: {
      humor: 'alerta',
      carinha: '⚠️',
      rotulo: 'Cuidado!',
      mensagem: card.mensagem || 'Requer atenção médica especial.',
      acaoIcone: '🩺',
      acaoTexto: card.dica || 'Siga a orientação da equipe.'
    }
  };

  const isConquista = card.status === GOAL_STATUS.CONQUISTA;
  const isQuaseLa = card.status === GOAL_STATUS.QUASE_LA;

  const stateData = isConquista 
    ? config.conquista 
    : (isQuaseLa ? config.quaseLa : config.atencao);

  const corStatus = isConquista ? '#16a34a' : (isQuaseLa ? '#d97706' : '#dc2626');
  const bgStatus = isConquista ? '#dcfce7' : (isQuaseLa ? '#fef3c7' : '#fee2e2');
  const bordaStatus = isConquista ? '#86efac' : (isQuaseLa ? '#fde68a' : '#fca5a5');

  return {
    ...config,
    humor: stateData.humor,
    carinha: stateData.carinha,
    rotuloStatus: stateData.rotulo,
    mensagem: stateData.mensagem,
    acaoIcone: stateData.acaoIcone,
    acaoTexto: stateData.acaoTexto,
    corStatus,
    bgStatus,
    bordaStatus,
    isConquista,
    isQuaseLa,
    valorTecnico: card.valorFormatado,
    faixaMeta: card.faixaMeta
  };
}
