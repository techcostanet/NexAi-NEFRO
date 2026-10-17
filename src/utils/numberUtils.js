/**
 * Utilitários para formatação de números e valores monetários em Real (BRL)
 * Inclui conversão para valor por extenso formal para recibos médicos.
 */

export function formatCurrencyBRL(val) {
  const num = Number(val) || 0;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const UNIDADES = [
  '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
  'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'
];

const DEZENAS = [
  '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'
];

const CENTENAS = [
  '', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'
];

function converterCentena(n) {
  if (n === 0) return '';
  if (n === 100) return 'cem';

  const c = Math.floor(n / 100);
  const restoC = n % 100;
  const parts = [];

  if (c > 0) parts.push(CENTENAS[c]);

  if (restoC > 0) {
    if (restoC < 20) {
      parts.push(UNIDADES[restoC]);
    } else {
      const d = Math.floor(restoC / 10);
      const u = restoC % 10;
      if (u > 0) {
        parts.push(`${DEZENAS[d]} e ${UNIDADES[u]}`);
      } else {
        parts.push(DEZENAS[d]);
      }
    }
  }

  return parts.join(' e ');
}

/**
 * Converte valor numérico em reais para extenso (ex: 450.50 -> "quatrocentos e cinquenta reais e cinquenta centavos")
 */
export function numeroPorExtenso(valor) {
  const num = Math.abs(Number(valor) || 0);
  if (num === 0) return 'zero reais';

  const inteiro = Math.floor(num);
  const centavos = Math.round((num - inteiro) * 100);

  const partes = [];

  // Milhares (até 999.999)
  const milhares = Math.floor(inteiro / 1000);
  const unidadesResto = inteiro % 1000;

  if (milhares > 0) {
    if (milhares === 1) {
      partes.push('mil');
    } else {
      partes.push(`${converterCentena(milhares)} mil`);
    }
  }

  if (unidadesResto > 0) {
    partes.push(converterCentena(unidadesResto));
  }

  let textoReais = '';
  if (inteiro > 0) {
    const palavraReais = inteiro === 1 ? 'real' : 'reais';
    textoReais = `${partes.join(' e ')} ${palavraReais}`;
  }

  let textoCentavos = '';
  if (centavos > 0) {
    const palavraCentavos = centavos === 1 ? 'centavo' : 'centavos';
    textoCentavos = `${converterCentena(centavos)} ${palavraCentavos}`;
  }

  if (textoReais && textoCentavos) {
    return `${textoReais} e ${textoCentavos}`;
  }
  return textoReais || textoCentavos || 'zero reais';
}
