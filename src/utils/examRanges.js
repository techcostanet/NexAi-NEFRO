/**
 * 🧪 DIRETRIZES E PARÂMETROS LABORATORIAIS EM NEFROLOGIA (KDIGO / SBN)
 * Classificação clínica tricolor:
 * 🟢 BOM (Verde): Dentro da meta terapêutica
 * 🟡 MÉDIO (Amarelo): Limítrofe / Atenção moderada
 * 🔴 RUIM (Vermelho): Crítico / Muito alterado / Fora da meta
 * ⚪ NEUTRO: Sem exame informado ou valor não numérico
 */

export const EXAM_STATUS_STYLES = {
  bom: {
    status: 'bom',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    color: '#15803d',
    label: 'Na Meta'
  },
  medio: {
    status: 'medio',
    bg: '#fffbeb',
    border: '#fde68a',
    color: '#b45309',
    label: 'Atenção'
  },
  ruim: {
    status: 'ruim',
    bg: '#fef2f2',
    border: '#fecaca',
    color: '#dc2626',
    label: 'Crítico'
  },
  neutro: {
    status: 'neutro',
    bg: '#f8fafc',
    border: '#e2e8f0',
    color: '#64748b',
    label: '-'
  }
};

/**
 * Converte valor para número de forma segura (trata vírgula e strings)
 */
export function parseExamNumber(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;
  const clean = String(val).replace(',', '.').trim();
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

/**
 * Avalia o resultado de um exame conforme diretrizes nefrológicas
 * @param {string} examKey - Chave do exame (ex: 'hb', 'pth', 'fosforo', 'k', 'ca', 'ktv', 'albumina', 'ist', 'ferritina', 'glicemia', 'tgp')
 * @param {number|string} rawValue - Valor do exame
 * @returns {object} { status, bg, border, color, label, numValue }
 */
export function evaluateExam(examKey, rawValue) {
  const num = parseExamNumber(rawValue);
  if (num === null) {
    return { ...EXAM_STATUS_STYLES.neutro, numValue: null };
  }

  const key = (examKey || '').toLowerCase();

  switch (key) {
    // Hemoglobina (Meta KDIGO/SBN: 10.0 a 12.0 g/dL)
    case 'hb':
    case 'hemoglobina': {
      if (num >= 10.0 && num <= 12.0) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if ((num >= 9.0 && num < 10.0) || (num > 12.0 && num <= 13.0)) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // Potássio (Meta: 3.5 a 5.5 mEq/L)
    case 'k':
    case 'potassio': {
      if (num >= 3.5 && num <= 5.5) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if ((num > 5.5 && num <= 6.0) || (num >= 3.0 && num < 3.5)) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // PTH Intacto (Meta SBN/KDIGO em diálise: 150 a 600 pg/mL)
    case 'pth':
    case 'pthintacto': {
      if (num >= 150 && num <= 600) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if ((num > 600 && num <= 800) || (num >= 100 && num < 150)) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // Fósforo Sérico (Meta: 3.5 a 5.5 mg/dL)
    case 'fosforo':
    case 'p': {
      if (num >= 3.5 && num <= 5.5) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if ((num > 5.5 && num <= 6.5) || (num >= 2.5 && num < 3.5)) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // Cálcio Total (Meta: 8.5 a 10.2 mg/dL)
    case 'ca':
    case 'calcio': {
      if (num >= 8.5 && num <= 10.2) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if ((num >= 8.0 && num < 8.5) || (num > 10.2 && num <= 10.8)) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // Kt/V Dialítico (Meta: ≥ 1.20)
    case 'ktv': {
      if (num >= 1.20) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if (num >= 1.00 && num < 1.20) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // Albumina Sérica (Meta: ≥ 3.8 g/dL)
    case 'albumina':
    case 'alb': {
      if (num >= 3.8) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if (num >= 3.5 && num < 3.8) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // Índice de Saturação de Transferrina (Meta: 20% a 50%)
    case 'ist': {
      if (num >= 20 && num <= 50) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if ((num >= 15 && num < 20) || (num > 50 && num <= 60)) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // Ferritina Sérica (Meta em diálise: 200 a 800 ng/mL)
    case 'ferritina': {
      if (num >= 200 && num <= 800) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if ((num >= 100 && num < 200) || (num > 800 && num <= 1200)) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // Glicemia de Jejum (Meta: 70 a 130 mg/dL)
    case 'glicemia':
    case 'glic': {
      if (num >= 70 && num <= 130) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if (num > 130 && num <= 180) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // TGP / ALT (Meta: ≤ 45 U/L)
    case 'tgp':
    case 'alt': {
      if (num <= 45) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if (num > 45 && num <= 65) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // Bicarbonato Sérico / HCO3 (Meta: ≥ 22 mEq/L)
    case 'hco3':
    case 'bicarbonato': {
      if (num >= 22) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if (num >= 19 && num < 22) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // Hematócrito (Meta: 30% a 36%)
    case 'ht':
    case 'hematocrito': {
      if (num >= 30 && num <= 36) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if ((num >= 27 && num < 30) || (num > 36 && num <= 40)) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    // Proteína C Reativa / PCR (Meta: ≤ 5.0 mg/L)
    case 'pcr': {
      if (num <= 5.0) {
        return { ...EXAM_STATUS_STYLES.bom, numValue: num };
      }
      if (num > 5.0 && num <= 10.0) {
        return { ...EXAM_STATUS_STYLES.medio, numValue: num };
      }
      return { ...EXAM_STATUS_STYLES.ruim, numValue: num };
    }

    default:
      return { ...EXAM_STATUS_STYLES.neutro, numValue: num };
  }
}
