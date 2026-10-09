/**
 * Utilitários para incorporação de logomarca e download de planilhas Excel (.xlsx) com ExcelJS
 */

/**
 * Extrai base64 limpo e extensão da imagem para o motor ExcelJS
 * @param {string} logoUrl URL base64 (data:image/...) ou URL HTTP
 * @returns {Promise<{ base64: string, extension: 'png' | 'jpeg' | 'gif' } | null>}
 */
export async function resolveImageForExcel(logoUrl) {
  if (!logoUrl || typeof logoUrl !== 'string') return null;

  // 1. Caso seja data URL (base64)
  const match = logoUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (match) {
    let rawExt = match[1].toLowerCase();
    let ext = 'png';
    if (rawExt === 'jpg' || rawExt === 'jpeg') ext = 'jpeg';
    else if (rawExt === 'gif') ext = 'gif';
    else ext = 'png';

    return {
      base64: match[2],
      extension: ext
    };
  }

  // 2. Caso seja URL remota HTTP/HTTPS (Firebase Storage ou CDN)
  if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
    try {
      const resp = await fetch(logoUrl);
      const blob = await resp.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result;
          if (typeof res === 'string') {
            const m = res.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
            if (m) {
              let ext = m[1].toLowerCase() === 'jpeg' || m[1].toLowerCase() === 'jpg' ? 'jpeg' : 'png';
              resolve({ base64: m[2], extension: ext });
              return;
            }
          }
          resolve(null);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('[excelLogoUtils] Erro ao carregar imagem remota para Excel:', err);
      return null;
    }
  }

  return null;
}

/**
 * Adiciona a logomarca do médico no topo de uma planilha Excel
 * @param {Object} workbook Instância de ExcelJS.Workbook
 * @param {Object} worksheet Instância de ExcelJS.Worksheet
 * @param {Object} logoData { base64, extension }
 * @param {Object} options Configurações de posicionamento e dimensões
 * @returns {number} ID da imagem adicionada ou null
 */
export function addDoctorLogoToExcelSheet(workbook, worksheet, logoData, options = {}) {
  if (!workbook || !worksheet || !logoData) return null;

  try {
    const imgId = workbook.addImage({
      base64: logoData.base64,
      extension: logoData.extension
    });

    const col = options.col !== undefined ? options.col : 0.1;
    const row = options.row !== undefined ? options.row : 0.1;
    const width = options.width || 140;
    const height = options.height || 48;

    worksheet.addImage(imgId, {
      tl: { col, row },
      ext: { width, height }
    });

    return imgId;
  } catch (err) {
    console.warn('[excelLogoUtils] Falha ao adicionar imagem à planilha:', err);
    return null;
  }
}

/**
 * Realiza o download seguro do arquivo Excel gerado pelo ExcelJS no navegador
 * @param {ArrayBuffer|Uint8Array} buffer Conteúdo binário da planilha
 * @param {string} fileName Nome do arquivo para download
 */
export function saveWorkbookBrowser(buffer, fileName) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
