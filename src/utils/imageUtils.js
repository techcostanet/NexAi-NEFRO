/**
 * Utilitários para processamento e otimização de imagens no cliente
 */

/**
 * Otimiza e redimensiona a logomarca do médico para tamanho ideal em relatórios (PNG/JPEG)
 * Preserva proporção e canal alfa/transparência para logotipos em PNG ou SVG.
 * @param {File} file Arquivo de imagem selecionado pelo usuário
 * @param {number} maxWidth Largura máxima permitida (default: 500px)
 * @param {number} maxHeight Altura máxima permitida (default: 250px)
 * @returns {Promise<{ dataUrl: string, blob: Blob, width: number, height: number, sizeBytes: number }>}
 */
export function optimizeLogoImage(file, maxWidth = 500, maxHeight = 250) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Selecione um arquivo de imagem válido (PNG, JPG, WebP ou SVG).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo de imagem.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Falha ao decodificar a imagem selecionada.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcula fator de escala preservando aspecto original
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        // Preserva transparência ou limpa canvas
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const isPng = file.type === 'image/png' || file.type === 'image/svg+xml' || file.type === 'image/webp';
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const quality = isPng ? undefined : 0.90;
        const dataUrl = canvas.toDataURL(mimeType, quality);

        canvas.toBlob((blob) => {
          if (!blob) {
            return reject(new Error('Erro ao gerar blob da imagem comprimida.'));
          }
          resolve({
            dataUrl,
            blob,
            width,
            height,
            sizeBytes: blob.size
          });
        }, mimeType, quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
