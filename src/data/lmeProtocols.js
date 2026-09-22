/**
 * Catálogo Oficial do Componente Especializado da Assistência Farmacêutica (CEAF / LME / SUS)
 * Especialidade: Nefrologia Clínica & Terapia Renal Substitutiva (Hemodiálise e DP)
 * Baseado nos Protocolos Clínicos e Diretrizes Terapêuticas (PCDT) do Ministério da Saúde
 */

export const LME_MEDICAMENTOS = [
  {
    id: 'alfaepoetina',
    nome: 'Alfaepoetina (Eritropoietina Humana Recombinante - EPO)',
    nomeComercial: 'Hemax, Eprex, Eritromax',
    concentracoes: [
      { id: 'epo_4000', label: '4.000 UI / mL (Frasco-ampola injetável)', dosePadrao: '4.000 UI' },
      { id: 'epo_2000', label: '2.000 UI / mL (Frasco-ampola injetável)', dosePadrao: '2.000 UI' },
      { id: 'epo_10000', label: '10.000 UI / mL (Frasco-ampola injetável)', dosePadrao: '10.000 UI' }
    ],
    cidPrincipal: 'N18.0',
    cidDescricao: 'Doença renal em estágio terminal',
    cidSecundario: 'D63.8',
    cidSecundarioDescricao: 'Anemia em outras doenças crônicas classificadas em outra parte',
    viaAdministracao: 'Subcutânea (SC) / Intravenosa (IV)',
    posologiaSugerida: '4.000 UI por via subcutânea, 3 vezes por semana, imediatamente após as sessões de hemodiálise.',
    quantidadeMensalPadrao: 12,
    vigenciaPadraoMeses: 6,
    indicacaoClinica: 'Tratamento da anemia da doença renal crônica em pacientes submetidos a hemodiálise periódica ou pré-diálise.',
    examesObrigatorios: [
      { key: 'hb', nome: 'Hemoglobina (Hb)', unidade: 'g/dL', cortePcdt: 'Alvo: 10,0 a 12,0 g/dL (ou Hb < 10 para início)' },
      { key: 'ht', nome: 'Hematócrito (Ht)', unidade: '%', cortePcdt: 'Alvo: 30 a 36%' },
      { key: 'ferritina', nome: 'Ferritina Sérica', unidade: 'ng/mL', cortePcdt: '> 100 ng/mL (ideal > 200 ng/mL em HD)' },
      { key: 'ist', nome: 'Índice de Saturação de Transferrina (IST)', unidade: '%', cortePcdt: '> 20% (estoque de ferro adequado)' }
    ],
    avaliarElegibilidade: (exames) => {
      const alertas = [];
      const conformidades = [];

      const hb = typeof exames?.hb === 'number' ? exames.hb : parseFloat(String(exames?.hb || '').replace(',', '.'));
      const ferritina = typeof exames?.ferritina === 'number' ? exames.ferritina : parseFloat(String(exames?.ferritina || '').replace(',', '.'));
      const ist = typeof exames?.ist === 'number' ? exames.ist : parseFloat(String(exames?.ist || '').replace(',', '.'));

      if (!isNaN(hb)) {
        if (hb > 12.5) {
          alertas.push({
            tipo: 'alerta',
            param: 'Hemoglobina',
            mensagem: `Hb atual está em ${hb} g/dL (acima da meta recomendada pelo PCDT de 10-12 g/dL). Risco de recusa ou recomendação de redução de dose pelo auditor.`
          });
        } else if (hb < 10.0) {
          conformidades.push(`Hb em ${hb} g/dL: Paciente em faixa de indicação plena de agente estimulador da eritropoiese.`);
        } else {
          conformidades.push(`Hb em ${hb} g/dL: Faixa terapêutica de manutenção (10-12 g/dL).`);
        }
      } else {
        alertas.push({ tipo: 'pendente', param: 'Hemoglobina', mensagem: 'Exame de Hemoglobina recente não informado.' });
      }

      if (!isNaN(ferritina)) {
        if (ferritina < 100) {
          alertas.push({
            tipo: 'critico',
            param: 'Ferritina',
            mensagem: `Ferritina em ${ferritina} ng/mL (abaixo de 100 ng/mL). O PCDT exige correção concomitante da carência de ferro (Noripurum) para autorizar a EPO.`
          });
        } else {
          conformidades.push(`Ferritina em ${ferritina} ng/mL: Estoque tecidual de ferro adequado (> 100 ng/mL).`);
        }
      } else {
        alertas.push({ tipo: 'pendente', param: 'Ferritina', mensagem: 'Exame de Ferritina recente não informado.' });
      }

      if (!isNaN(ist)) {
        if (ist < 20) {
          alertas.push({
            tipo: 'critico',
            param: 'IST',
            mensagem: `IST em ${ist}% (abaixo de 20%). Paciente com deficiência funcional de ferro. Indicar reposição com Sacarato de Ferro concomitante.`
          });
        } else {
          conformidades.push(`IST em ${ist}%: Saturação de transferrina adequada (≥ 20%).`);
        }
      } else {
        alertas.push({ tipo: 'pendente', param: 'IST', mensagem: 'Índice de Saturação de Transferrina (IST) não informado.' });
      }

      return { alertas, conformidades, elegivel: alertas.filter(a => a.tipo === 'critico').length === 0 };
    }
  },
  {
    id: 'sacarato_ferro',
    nome: 'Sacarato de Hidróxido de Ferro (Ferro EV)',
    nomeComercial: 'Noripurum Endovenoso',
    concentracoes: [
      { id: 'ferro_100', label: '100 mg / 5 mL (Ampola injetável EV)', dosePadrao: '100 mg' }
    ],
    cidPrincipal: 'N18.0',
    cidDescricao: 'Doença renal em estágio terminal',
    cidSecundario: 'D50.8',
    cidSecundarioDescricao: 'Outras anemias por deficiência de ferro',
    viaAdministracao: 'Intravenosa (IV) durante a sessão de hemodiálise',
    posologiaSugerida: '100 mg diluídos em 100 mL de SF 0,9% IV, infundidos na linha venosa durante a hemodiálise, 1 vez por semana, até completar dose acumulada de 1.000 mg.',
    quantidadeMensalPadrao: 4,
    vigenciaPadraoMeses: 3,
    indicacaoClinica: 'Reposição de estoques de ferro na DRC dialítica associada a anemia refratária a ferro oral ou com deficiência absoluta/funcional de ferro.',
    examesObrigatorios: [
      { key: 'ferritina', nome: 'Ferritina Sérica', unidade: 'ng/mL', cortePcdt: '< 500 ng/mL (indicação se < 200 em HD)' },
      { key: 'ist', nome: 'Índice de Saturação de Transferrina (IST)', unidade: '%', cortePcdt: '< 20% (deficiência de ferro comprovada)' },
      { key: 'hb', nome: 'Hemoglobina (Hb)', unidade: 'g/dL', cortePcdt: '< 11,0 g/dL' }
    ],
    avaliarElegibilidade: (exames) => {
      const alertas = [];
      const conformidades = [];

      const ferritina = typeof exames?.ferritina === 'number' ? exames.ferritina : parseFloat(String(exames?.ferritina || '').replace(',', '.'));
      const ist = typeof exames?.ist === 'number' ? exames.ist : parseFloat(String(exames?.ist || '').replace(',', '.'));

      if (!isNaN(ferritina)) {
        if (ferritina > 800) {
          alertas.push({
            tipo: 'alerta',
            param: 'Ferritina',
            mensagem: `Ferritina em ${ferritina} ng/mL (sobrecarga potencial de ferro). O PCDT contraindica ou exige justificativa especial para reposição com Ferritina > 800-1000 ng/mL.`
          });
        } else {
          conformidades.push(`Ferritina em ${ferritina} ng/mL: Permite reposição com segurança.`);
        }
      }

      if (!isNaN(ist)) {
        if (ist < 20) {
          conformidades.push(`IST em ${ist}%: Critério clássico de reposição venosa do PCDT atendido (IST < 20%).`);
        } else if (ist > 50) {
          alertas.push({
            tipo: 'critico',
            param: 'IST',
            mensagem: `IST em ${ist}% (acima de 50%). Alto risco de toxicidade por ferro livre circulante.`
          });
        }
      }

      return { alertas, conformidades, elegivel: alertas.filter(a => a.tipo === 'critico').length === 0 };
    }
  },
  {
    id: 'sevelamer',
    nome: 'Carbonato / Cloridrato de Sevelâmer',
    nomeComercial: 'Renagel, Renvela',
    concentracoes: [
      { id: 'sevelamer_800', label: '800 mg (Comprimido revestido)', dosePadrao: '800 mg' }
    ],
    cidPrincipal: 'N18.0',
    cidDescricao: 'Doença renal em estágio terminal',
    cidSecundario: 'E83.3',
    cidSecundarioDescricao: 'Distúrbios do metabolismo do fósforo e das fosfatases',
    viaAdministracao: 'Oral (VO) junto às principais refeições',
    posologiaSugerida: 'Tomar 1 a 2 comprimidos de 800 mg por via oral 3 vezes ao dia, imediatamente antes ou durante as principais refeições.',
    quantidadeMensalPadrao: 180,
    vigenciaPadraoMeses: 6,
    indicacaoClinica: 'Controle da hiperfosfatemia na Doença Renal Crônica em diálise quando quelantes contendo cálcio são contraindicados ou ineficazes.',
    examesObrigatorios: [
      { key: 'fosforo', nome: 'Fósforo Sérico (P)', unidade: 'mg/dL', cortePcdt: '> 5,5 mg/dL (hiperfosfatemia persistente)' },
      { key: 'ca', nome: 'Cálcio Sérico Total (Ca)', unidade: 'mg/dL', cortePcdt: '> 9,5 a 10,2 mg/dL (risco de hipercalcemia com quelante cálcico)' },
      { key: 'caxp', nome: 'Produto Ca x P', unidade: 'mg²/dL²', cortePcdt: '> 55 mg²/dL² (elevado risco cardiovascular)' }
    ],
    avaliarElegibilidade: (exames) => {
      const alertas = [];
      const conformidades = [];

      const p = typeof exames?.fosforo === 'number' ? exames.fosforo : parseFloat(String(exames?.fosforo || exames?.p || '').replace(',', '.'));
      const ca = typeof exames?.ca === 'number' ? exames.ca : parseFloat(String(exames?.ca || '').replace(',', '.'));

      if (!isNaN(p)) {
        if (p > 5.5) {
          conformidades.push(`Fósforo sérico em ${p} mg/dL: Hiperfosfatemia comprovada (> 5,5 mg/dL), preenchendo o critério do PCDT.`);
        } else {
          alertas.push({
            tipo: 'alerta',
            param: 'Fósforo',
            mensagem: `Fósforo sérico em ${p} mg/dL (abaixo de 5,5 mg/dL). O auditor pode exigir comprovação de refratariedade ou hipercalcemia prévia.`
          });
        }
      } else {
        alertas.push({ tipo: 'pendente', param: 'Fósforo', mensagem: 'Dosagem de Fósforo recente não informada.' });
      }

      if (!isNaN(ca) && !isNaN(p)) {
        const prod = ca * p;
        if (prod > 55) {
          conformidades.push(`Produto Ca x P em ${prod.toFixed(1)}: Elevado risco de calcificação extra-esquelética, justificando quelante não cálcico.`);
        }
      }

      return { alertas, conformidades, elegivel: alertas.filter(a => a.tipo === 'critico').length === 0 };
    }
  },
  {
    id: 'cinacalcete',
    nome: 'Cloridrato de Cinacalcete',
    nomeComercial: 'Sensipar, Mimpara',
    concentracoes: [
      { id: 'cinacalcete_30', label: '30 mg (Comprimido revestido)', dosePadrao: '30 mg' },
      { id: 'cinacalcete_60', label: '60 mg (Comprimido revestido)', dosePadrao: '60 mg' }
    ],
    cidPrincipal: 'N18.0',
    cidDescricao: 'Doença renal em estágio terminal',
    cidSecundario: 'E21.1',
    cidSecundarioDescricao: 'Outro hiperparatireoidismo secundário',
    viaAdministracao: 'Oral (VO) junto à refeição',
    posologiaSugerida: 'Tomar 1 comprimido de 30 mg por via oral 1 vez ao dia, junto com uma refeição.',
    quantidadeMensalPadrao: 30,
    vigenciaPadraoMeses: 6,
    indicacaoClinica: 'Hiperparatireoidismo secundário grave em pacientes renais crônicos em diálise refratários ao tratamento com análogos de vitamina D ou com hipercalcemia associada.',
    examesObrigatorios: [
      { key: 'pth', nome: 'Paratormônio Intacto (PTHi)', unidade: 'pg/mL', cortePcdt: '> 600 a 800 pg/mL (refratário)' },
      { key: 'ca', nome: 'Cálcio Sérico Total (Ca)', unidade: 'mg/dL', cortePcdt: '≥ 8,4 mg/dL (evitar hipocalcemia)' },
      { key: 'fosforo', nome: 'Fósforo Sérico (P)', unidade: 'mg/dL', cortePcdt: 'Monitorar distúrbio mineral' }
    ],
    avaliarElegibilidade: (exames) => {
      const alertas = [];
      const conformidades = [];

      const pth = typeof exames?.pth === 'number' ? exames.pth : parseFloat(String(exames?.pth || '').replace(',', '.'));
      const ca = typeof exames?.ca === 'number' ? exames.ca : parseFloat(String(exames?.ca || '').replace(',', '.'));

      if (!isNaN(pth)) {
        if (pth > 600) {
          conformidades.push(`PTHi em ${pth} pg/mL: Hiperparatireoidismo secundário grave comprovado (> 600 pg/mL).`);
        } else {
          alertas.push({
            tipo: 'alerta',
            param: 'PTHi',
            mensagem: `PTHi em ${pth} pg/mL (abaixo de 600 pg/mL). Verifique se o protocolo local exige PTH > 600 ou 800 pg/mL para início.`
          });
        }
      } else {
        alertas.push({ tipo: 'pendente', param: 'PTHi', mensagem: 'Dosagem de PTH recente não informada.' });
      }

      if (!isNaN(ca)) {
        if (ca < 8.4) {
          alertas.push({
            tipo: 'critico',
            param: 'Cálcio',
            mensagem: `Cálcio sérico em ${ca} mg/dL (hipocalcemia < 8,4 mg/dL). O Cinacalcete reduz o cálcio sérico e está contraindicado até a correção.`
          });
        } else {
          conformidades.push(`Cálcio sérico em ${ca} mg/dL: Nível seguro para introdução de calcimimético.`);
        }
      }

      return { alertas, conformidades, elegivel: alertas.filter(a => a.tipo === 'critico').length === 0 };
    }
  },
  {
    id: 'paricalcitol',
    nome: 'Paricalcitol (Análogo Seletivo de Vitamina D)',
    nomeComercial: 'Zemplar',
    concentracoes: [
      { id: 'paricalcitol_5', label: '5 mcg / mL (Ampola injetável)', dosePadrao: '5 mcg' }
    ],
    cidPrincipal: 'N18.0',
    cidDescricao: 'Doença renal em estágio terminal',
    cidSecundario: 'E21.1',
    cidSecundarioDescricao: 'Hiperparatireoidismo secundário da DRC',
    viaAdministracao: 'Intravenosa (IV) pós-hemodiálise',
    posologiaSugerida: 'Administrar 1 ampola (5 mcg) por via intravenosa no final da sessão de hemodiálise, 3 vezes por semana.',
    quantidadeMensalPadrao: 12,
    vigenciaPadraoMeses: 6,
    indicacaoClinica: 'Prevenção e tratamento do hiperparatireoidismo secundário associado à DRC em estágio 5 em hemodiálise.',
    examesObrigatorios: [
      { key: 'pth', nome: 'Paratormônio Intacto (PTHi)', unidade: 'pg/mL', cortePcdt: '> 300 a 600 pg/mL' },
      { key: 'ca', nome: 'Cálcio Sérico (Ca)', unidade: 'mg/dL', cortePcdt: '< 10,2 mg/dL (evitar hipercalcemia)' },
      { key: 'fosforo', nome: 'Fósforo Sérico (P)', unidade: 'mg/dL', cortePcdt: '< 5,5 a 6,0 mg/dL' }
    ],
    avaliarElegibilidade: (exames) => {
      const alertas = [];
      const conformidades = [];

      const pth = typeof exames?.pth === 'number' ? exames.pth : parseFloat(String(exames?.pth || '').replace(',', '.'));
      const ca = typeof exames?.ca === 'number' ? exames.ca : parseFloat(String(exames?.ca || '').replace(',', '.'));

      if (!isNaN(pth) && pth > 300) {
        conformidades.push(`PTHi em ${pth} pg/mL: Indica tratamento com ativador seletivo do VDR.`);
      }
      if (!isNaN(ca) && ca > 10.2) {
        alertas.push({
          tipo: 'critico',
          param: 'Cálcio',
          mensagem: `Cálcio sérico em ${ca} mg/dL (hipercalcemia). Risco de aumento do produto Ca x P.`
        });
      }

      return { alertas, conformidades, elegivel: alertas.filter(a => a.tipo === 'critico').length === 0 };
    }
  },
  {
    id: 'calcitriol',
    nome: 'Calcitriol (1,25-diidroxivitamina D3)',
    nomeComercial: 'Rocaltrol',
    concentracoes: [
      { id: 'calcitriol_025', label: '0,25 mcg (Cápsula gelatinosa mole)', dosePadrao: '0,25 mcg' },
      { id: 'calcitriol_1mcg_ev', label: '1 mcg / mL (Ampola injetável EV)', dosePadrao: '1 mcg' }
    ],
    cidPrincipal: 'N18.0',
    cidDescricao: 'Doença renal em estágio terminal',
    cidSecundario: 'E21.1',
    cidSecundarioDescricao: 'Hiperparatireoidismo secundário',
    viaAdministracao: 'Oral (VO) ou Intravenosa (IV)',
    posologiaSugerida: 'Tomar 1 cápsula de 0,25 mcg por via oral 1 vez ao dia (ou dose em pulso pós-diálise).',
    quantidadeMensalPadrao: 30,
    vigenciaPadraoMeses: 6,
    indicacaoClinica: 'Tratamento do hiperparatireoidismo secundário e osteodistrofia renal em pacientes com insuficiência renal crônica.',
    examesObrigatorios: [
      { key: 'pth', nome: 'Paratormônio (PTHi)', unidade: 'pg/mL', cortePcdt: '> 300 pg/mL' },
      { key: 'ca', nome: 'Cálcio Sérico', unidade: 'mg/dL', cortePcdt: '< 9,5 mg/dL' },
      { key: 'fosforo', nome: 'Fósforo Sérico', unidade: 'mg/dL', cortePcdt: '< 5,5 mg/dL' }
    ],
    avaliarElegibilidade: (exames) => {
      const alertas = [];
      const conformidades = [];
      const ca = typeof exames?.ca === 'number' ? exames.ca : parseFloat(String(exames?.ca || '').replace(',', '.'));
      if (!isNaN(ca) && ca > 10.0) {
        alertas.push({ tipo: 'critico', param: 'Cálcio', mensagem: `Cálcio sérico elevado (${ca} mg/dL). Risco de hipercalcemia aditiva.` });
      }
      return { alertas, conformidades, elegivel: alertas.filter(a => a.tipo === 'critico').length === 0 };
    }
  }
];

/**
 * Gera texto formal de Relatório Médico Circunstanciado / Justificativa Clínica
 * para o Componente Especializado do SUS
 */
export function buildLmeClinicalReportText({
  patient,
  medicamentoData,
  concentracao,
  posologia,
  exames,
  doctorInfo,
  tempoTratamento = 'tratamento dialítico contínuo'
}) {
  const nomePaciente = patient?.nome || 'Paciente';
  const idade = patient?.idade ? `${patient.idade} anos` : '';
  const clinica = patient?.clinica || 'Clínica de Hemodiálise';
  const tempoDialise = patient?.dataInicioDialise ? `desde ${patient.dataInicioDialise}` : tempoTratamento;
  const etiologia = patient?.etiologiaDRC || 'Doença Renal Crônica Estágio 5';

  const medNome = medicamentoData?.nome || 'Medicamento Solicitado';
  const cidPrincipal = medicamentoData?.cidPrincipal || 'N18.0';
  const cidSecundario = medicamentoData?.cidSecundario ? ` e ${medicamentoData.cidSecundario}` : '';

  let examesTexto = '';
  if (exames && Object.keys(exames).length > 0) {
    const lista = [];
    if (exames.hb) lista.push(`Hemoglobina: ${exames.hb} g/dL`);
    if (exames.ht) lista.push(`Hematócrito: ${exames.ht}%`);
    if (exames.ferritina) lista.push(`Ferritina: ${exames.ferritina} ng/mL`);
    if (exames.ist) lista.push(`IST: ${exames.ist}%`);
    if (exames.fosforo) lista.push(`Fósforo: ${exames.fosforo} mg/dL`);
    if (exames.ca) lista.push(`Cálcio Total: ${exames.ca} mg/dL`);
    if (exames.pth) lista.push(`PTH Intacto: ${exames.pth} pg/mL`);
    if (exames.ktv) lista.push(`Kt/V: ${exames.ktv}`);
    examesTexto = `Resultados laboratoriais comprobatórios recentes: ${lista.join(' | ')}.`;
  }

  return `O(A) paciente ${nomePaciente}${idade ? `, ${idade}` : ''}, encontra-se sob meus cuidados nefrológicos em programa regular de hemodiálise periódica 3 vezes por semana na unidade ${clinica} (${tempoDialise}), portador(a) de Doença Renal Crônica Terminal (CID-10: ${cidPrincipal}${cidSecundario}), decorrente de ${etiologia}.

No momento, apresenta indicação clínica precisa e inequívoca para uso de ${medNome} (${concentracao?.label || ''}), na posologia de: ${posologia}, em conformidade com as diretrizes do Protocolo Clínico e Diretrizes Terapêuticas (PCDT) do Ministério da Saúde.

${examesTexto}

O tratamento é indispensável para o controle clínico rigoroso, estabilização metabólica e prevenção de morbimortalidade cardiovascular e hematológica associada à insuficiência renal crônica terminal em diálise. Solicito deferimento da presente LME para fornecimento do medicamento supracitado.`;
}
