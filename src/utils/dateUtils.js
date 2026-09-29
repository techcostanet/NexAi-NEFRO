/**
 * Utilitário de formatação e manipulação segura de datas para evitar quebras de tela por Invalid Date
 */

/**
 * Converte qualquer formato de data (Timestamp Firestore, Date, string ISO, string BR, number)
 * para timestamp numérico em milissegundos de forma 100% segura.
 */
export function getExamTime(val) {
  if (!val) return 0;
  try {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (val instanceof Date) return isNaN(val.getTime()) ? 0 : val.getTime();
    if (typeof val === 'object' && typeof val.toDate === 'function') {
      const d = val.toDate();
      return isNaN(d.getTime()) ? 0 : d.getTime();
    }
    if (typeof val === 'object' && val.seconds !== undefined) {
      return (Number(val.seconds) || 0) * 1000;
    }
    if (typeof val === 'string') {
      const clean = val.trim();
      if (!clean) return 0;
      if (clean.includes('/')) {
        const parts = clean.split('/');
        if (parts.length === 3) {
          const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), 12, 0, 0);
          return isNaN(d.getTime()) ? 0 : d.getTime();
        }
      }
      const d = new Date(clean.includes('T') ? clean : `${clean}T12:00:00`);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    }
    return 0;
  } catch (_) {
    return 0;
  }
}

/**
 * Normaliza qualquer formato de data para string YYYY-MM-DD
 */
export function normalizeDateToString(val) {
  if (!val) return '';
  try {
    if (typeof val === 'string') {
      const clean = val.trim();
      if (!clean) return '';
      if (clean.includes('/')) {
        const parts = clean.split('/');
        if (parts.length === 3) {
          const dd = parts[0].padStart(2, '0');
          const mm = parts[1].padStart(2, '0');
          const yyyy = parts[2];
          return `${yyyy}-${mm}-${dd}`;
        }
      }
      if (clean.includes('T')) return clean.split('T')[0];
      return clean.slice(0, 10);
    }
    if (typeof val === 'object' && typeof val.toDate === 'function') {
      return val.toDate().toISOString().split('T')[0];
    }
    if (typeof val === 'object' && val.seconds !== undefined) {
      return new Date(val.seconds * 1000).toISOString().split('T')[0];
    }
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? '' : val.toISOString().split('T')[0];
    }
    if (typeof val === 'number') {
      return new Date(val).toISOString().split('T')[0];
    }
    return String(val || '');
  } catch (_) {
    return String(val || '');
  }
}

/**
 * Formata data curta no formato DD/MM para tags de coletas
 */
export function formatShortColetaDate(val) {
  if (!val) return '';
  try {
    const iso = normalizeDateToString(val);
    if (iso && iso.includes('-')) {
      const parts = iso.split('-');
      if (parts.length >= 3) {
        return `${parts[2].slice(0, 2)}/${parts[1]}`;
      }
    }
    if (typeof val === 'string' && val.includes('/')) {
      const parts = val.trim().split('/');
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}`;
      }
    }
    return normalizeDateToString(val);
  } catch (_) {
    return '';
  }
}

export function safeFormatDate(val, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  if (!val) return '-';
  try {
    let d;
    if (val instanceof Date) {
      d = val;
    } else if (typeof val === 'object' && typeof val.toDate === 'function') {
      d = val.toDate();
    } else if (typeof val === 'object' && val.seconds !== undefined) {
      d = new Date(val.seconds * 1000);
    } else if (typeof val === 'number') {
      d = new Date(val);
    } else if (typeof val === 'string') {
      const clean = val.trim();
      if (!clean) return '-';
      if (clean.includes('/')) {
        const parts = clean.split('/');
        if (parts.length === 3) {
          d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]), 12, 0, 0);
        } else {
          d = new Date(clean);
        }
      } else if (clean.includes('T')) {
        d = new Date(clean);
      } else {
        d = new Date(`${clean}T12:00:00`);
      }
    } else {
      return '-';
    }

    if (!d || isNaN(d.getTime())) {
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
