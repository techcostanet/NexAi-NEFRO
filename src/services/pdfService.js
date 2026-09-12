import { pdf } from '@react-pdf/renderer';

/**
 * Utilitário central de geração e exportação de PDFs vetoriais oficiais
 * Baseado em @react-pdf/renderer
 */

export async function downloadPdfDocument(documentJsx, fileName = 'documento.pdf') {
  try {
    const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    const blob = await pdf(documentJsx).toBlob();
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = cleanFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);

    return true;
  } catch (error) {
    console.error('[pdfService] Erro ao gerar PDF:', error);
    throw error;
  }
}

export async function openPdfPreview(documentJsx) {
  try {
    const blob = await pdf(documentJsx).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);

    return true;
  } catch (error) {
    console.error('[pdfService] Erro ao abrir pré-visualização de PDF:', error);
    throw error;
  }
}
