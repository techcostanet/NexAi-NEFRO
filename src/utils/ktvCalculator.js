/**
 * 🧮 Calculadora Clínica de Adequação Dialítica (spKt/V - Daugirdas de 2ª Geração & PRU)
 * Padrão-ouro oficial KDOQI / Sociedade Brasileira de Nefrologia (SBN)
 */

/**
 * Calcula o spKt/V de Daugirdas de 2ª Geração e a PRU (Percentual de Redução de Ureia)
 *
 * Fórmula:
 * spKt/V = -ln(R - 0.008 * t) + (4 - 3.5 * R) * (UF / W)
 *
 * @param {Object} params
 * @param {number|string} params.ureiaPre - Ureia pré-diálise (mg/dL)
 * @param {number|string} params.ureiaPos - Ureia pós-diálise (mg/dL)
 * @param {number|string} params.pesoPre - Peso pré-diálise no dia da coleta (kg)
 * @param {number|string} params.pesoPos - Peso pós-diálise no dia da coleta (kg)
 * @param {number|string} [params.duracaoHoras=4.0] - Duração da sessão em horas (ex: 4.0)
 * @returns {Object} { ktv, pru, uf, r, status, cor, descricao, valido }
 */
export function calculateDaugirdasKtv({
  ureiaPre,
  ureiaPos,
  pesoPre,
  pesoPos,
  duracaoHoras = 4.0
}) {
  const pre = parseFloat(String(ureiaPre).replace(',', '.'));
  const pos = parseFloat(String(ureiaPos).replace(',', '.'));
  const pPre = parseFloat(String(pesoPre).replace(',', '.'));
  const pPos = parseFloat(String(pesoPos).replace(',', '.'));
  const t = parseFloat(String(duracaoHoras).replace(',', '.')) || 4.0;

  // Validações básicas de consistência numérica
  if (isNaN(pre) || isNaN(pos) || pre <= 0 || pos <= 0) {
    return {
      ktv: null,
      pru: null,
      uf: null,
      status: 'Incompleto',
      cor: 'gray',
      descricao: 'Informe as dosagens de Ureia Pré e Ureia Pós.',
      valido: false
    };
  }

  if (pos >= pre) {
    return {
      ktv: null,
      pru: null,
      uf: null,
      status: 'Inconsistente',
      cor: 'red',
      descricao: 'A Ureia Pós-diálise deve ser estritamente menor que a Ureia Pré-diálise.',
      valido: false
    };
  }

  const r = pos / pre;
  const pruCalc = Math.round((1 - r) * 1000) / 10; // Ex: 71.4%

  // Ultrafiltração e peso pós
  let uf = 0;
  let w = pPos;

  if (!isNaN(pPre) && !isNaN(pPos) && pPre >= pPos && pPos > 0) {
    uf = Math.max(0, pPre - pPos);
    w = pPos;
  } else if (!isNaN(pPos) && pPos > 0) {
    w = pPos;
  }

  // Componente 1: Remoção convectiva e difusiva por ln
  const argLn = r - 0.008 * t;
  if (argLn <= 0) {
    return {
      ktv: null,
      pru: pruCalc,
      uf: uf,
      status: 'Erro no Cálculo',
      cor: 'red',
      descricao: 'Valores fora da faixa operacional da equação de Daugirdas.',
      valido: false
    };
  }

  let ktvCalc = -Math.log(argLn);

  // Componente 2: Correção volumétrica pela ultrafiltração (UF / W)
  if (w > 0 && uf >= 0) {
    const fatorUf = (4 - 3.5 * r) * (uf / w);
    ktvCalc += fatorUf;
  }

  const ktvFinal = Math.round(ktvCalc * 100) / 100;

  // Classificação clínica KDOQI / SBN (para 3 sessões semanais)
  let status = 'Adequado';
  let cor = 'green';
  let descricao = 'Dose de diálise adequada (Kt/V ≥ 1.20)';

  if (ktvFinal < 1.0) {
    status = 'Inadequado';
    cor = 'red';
    descricao = 'Subdiálise (Kt/V < 1.00). Necessita revisão de prescrição ou acesso.';
  } else if (ktvFinal < 1.20) {
    status = 'Limítrofe';
    cor = 'amber';
    descricao = 'Dose limítrofe (1.00 ≤ Kt/V < 1.20). Meta recomendada ≥ 1.20.';
  } else if (ktvFinal >= 1.40) {
    status = 'Excelente';
    cor = 'emerald';
    descricao = 'Excelente depuração dialítica (Kt/V ≥ 1.40).';
  }

  return {
    ktv: ktvFinal,
    pru: pruCalc,
    uf: Math.round(uf * 10) / 10,
    r: Math.round(r * 1000) / 1000,
    status,
    cor,
    descricao,
    valido: true
  };
}
