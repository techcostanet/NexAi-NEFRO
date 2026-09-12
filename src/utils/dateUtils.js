/**
 * Utilitário de formatação segura de datas para evitar quebras de tela por Invalid Date
 */

export function safeFormatDate(val, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  if (!val) return '-';
  try {
    let d;
    if (val instanceof Date) {
      d = val;
    } else if (typeof val === 'string') {
      const clean = val.trim();
      if (!clean) return '-';
      if (clean.includes('T')) {
        d = new Date(clean);
      } else {
        d = new Date(`${clean}T12:00:00`);
      }
    } else if (typeof val === 'number') {
      d = new Date(val);
    } else {
      return '-';
    }

    if (isNaN(d.getTime())) {
      return typeof val === 'string' ? val : '-';
    }
    return d.toLocaleDateString('pt-BR', options);
  } catch (e) {
    return typeof val === 'string' ? val : '-';
  }
}

export function safeFormatDateExtenso(val) {
  return safeFormatDate(val, {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}
