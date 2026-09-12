/**
 * Utilitário de Impressão Isolada de Alta Precisão para Aplicações Web / Clínicas
 * 
 * Clona o elemento selecionado para um iframe isolado com todos os estilos da aplicação.
 * Elimina 100% de páginas em branco causadas por modais, overflow: hidden, position: fixed
 * e conflitos de temas escuros/claros no navegador.
 */

export function printElement(elementOrId, documentTitle = 'NexAi-NEFRO - Documento') {
  return new Promise((resolve) => {
    let targetEl = null;

    if (typeof elementOrId === 'string') {
      targetEl = document.getElementById(elementOrId);
    } else if (elementOrId && elementOrId.nodeType) {
      targetEl = elementOrId;
    }

    if (!targetEl) {
      console.warn('[printElement] Elemento para impressão não encontrado. Usando fallback window.print().');
      window.print();
      resolve(false);
      return;
    }

    // Cria iframe temporário e oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.setAttribute('aria-hidden', 'true');

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      document.body.removeChild(iframe);
      resolve(false);
      return;
    }

    // Coleta todas as folhas de estilo da página atual
    let stylesHtml = '';
    const styleTags = document.querySelectorAll('style, link[rel="stylesheet"]');
    styleTags.forEach((tag) => {
      stylesHtml += tag.outerHTML;
    });

    // Injeta estrutura HTML limpa e isolada no iframe
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <title>${documentTitle}</title>
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            html, body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              font-size: 11pt;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              width: 100% !important;
              height: auto !important;
              overflow: visible !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            .no-print {
              display: none !important;
            }
            table {
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            thead {
              display: table-header-group;
            }
            tfoot {
              display: table-footer-group;
            }
            .avoid-break {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          <div class="print-isolated-wrapper">
            ${targetEl.outerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Aguarda carregamento de estilos/fontes e dispara a impressão
    const triggerPrint = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (err) {
          console.error('[printElement] Erro ao disparar impressão:', err);
          window.print();
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            resolve(true);
          }, 1000);
        }
      }, 350);
    };

    if (iframe.contentWindow) {
      iframe.contentWindow.onload = triggerPrint;
      // Fallback caso onload já tenha disparado
      setTimeout(triggerPrint, 500);
    } else {
      triggerPrint();
    }
  });
}
