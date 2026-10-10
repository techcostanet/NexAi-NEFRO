/**
 * versionUtils.js
 * Utilitários para conversão e humanização de notas de versão e changelogs.
 * Converte jargões técnicos (feat, fix, perf, etc.) em termos claros,
 * profissionais e amigáveis para médicos e usuários do sistema.
 */

/**
 * Remove prefixos de commits técnicos e humaniza o texto para leitura humana
 * @param {string} text - Texto bruto (ex: 'feat: modulo consultorio saas', 'fix: useMemo em LME')
 * @returns {string} Texto limpo e compreensível
 */
export function humanizeChangeText(text) {
  if (!text || typeof text !== 'string') return '';

  let clean = text.trim();

  // Remove emojis ou marcadores iniciais
  clean = clean.replace(/^[✨🚀📌🛠️🔧⚡🎨🔒•\-\s]+/, '');

  // Remove prefixos de conventional commits (feat:, fix:, bugfix:, chore:, etc.)
  clean = clean
    .replace(/^feat(?:\([^)]*\))?:\s*/i, '')
    .replace(/^fix(?:\([^)]*\))?:\s*/i, '')
    .replace(/^bugfix(?:\([^)]*\))?:\s*/i, '')
    .replace(/^perf(?:\([^)]*\))?:\s*/i, '')
    .replace(/^refactor(?:\([^)]*\))?:\s*/i, '')
    .replace(/^style(?:\([^)]*\))?:\s*/i, '')
    .replace(/^chore(?:\([^)]*\))?:\s*/i, '')
    .replace(/^docs(?:\([^)]*\))?:\s*/i, '')
    .replace(/^build(?:\([^)]*\))?:\s*/i, '')
    .trim();

  // Garante primeira letra maiúscula
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  // Remove excesso de reticências no meio ou fim
  clean = clean.replace(/\.{2,}$/, '...').replace(/\.$/, '');

  return clean;
}

/**
 * Classifica o tipo de alteração retornando metadados visuais (rótulo, cores e ícone)
 * @param {string} text - Título ou highlight da alteração
 * @returns {object} { type, label, badgeBg, badgeBorder, badgeColor, emoji }
 */
export function categorizeChange(text) {
  const lower = (text || '').toLowerCase();

  // 1. Correções e ajustes de bugs
  if (
    lower.startsWith('fix:') || 
    lower.includes('fix(') || 
    lower.includes('correcao') || 
    lower.includes('correção') || 
    lower.includes('corrigido') || 
    lower.includes('ajuste') || 
    lower.includes('resolvendo') || 
    lower.includes('bug') || 
    lower.includes('referenceerror') || 
    lower.includes('erro')
  ) {
    return {
      type: 'correcao',
      label: 'Correção',
      badgeBg: '#fef2f2',
      badgeBorder: '#fecaca',
      badgeColor: '#dc2626',
      emoji: '🛠️'
    };
  }

  // 2. Novas funcionalidades e recursos
  if (
    lower.startsWith('feat:') || 
    lower.includes('feat(') || 
    lower.includes('novo') || 
    lower.includes('nova') || 
    lower.includes('modulo') || 
    lower.includes('módulo') || 
    lower.includes('recurso') || 
    lower.includes('inclusao') || 
    lower.includes('inclusão') || 
    lower.includes('adiciona')
  ) {
    return {
      type: 'novidade',
      label: 'Novidade',
      badgeBg: '#eff6ff',
      badgeBorder: '#bfdbfe',
      badgeColor: '#1d4ed8',
      emoji: '🚀'
    };
  }

  // 3. Melhorias gerais e otimizações
  return {
    type: 'melhoria',
    label: 'Melhoria',
    badgeBg: '#f0fdf4',
    badgeBorder: '#bbf7d0',
    badgeColor: '#15803d',
    emoji: '✨'
  };
}

/**
 * Formata um item completo de release para exibição na UI
 */
export function formatVersionItem(item) {
  if (!item) return null;
  const cleanTitle = humanizeChangeText(item.title);
  const category = categorizeChange(item.title || (item.highlights && item.highlights[0]));

  const cleanHighlights = Array.isArray(item.highlights)
    ? item.highlights.map(h => {
        const cat = categorizeChange(h);
        const text = humanizeChangeText(h);
        return {
          original: h,
          text,
          category: cat
        };
      })
    : [];

  return {
    ...item,
    cleanTitle,
    category,
    cleanHighlights
  };
}
