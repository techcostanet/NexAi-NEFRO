import * as XLSX from 'xlsx';
import React from 'react';
import { normalizeMedicamentosList } from '../data/dialysisMedications.js';
import { safeFormatDate } from '../utils/dateUtils.js';
import { downloadPdfDocument } from './pdfService.js';
import SystemExportPdf from '../components/pdf/SystemExportPdf.jsx';

/**
 * Utilitário de higienização de texto
 */
function cleanText(val, fallback = '---') {
  if (val === null || val === undefined) return fallback;
  const s = String(val).trim();
  return s.length > 0 ? s : fallback;
}

/**
 * Ajusta automaticamente a largura das colunas em uma planilha XLSX
 */
function applyAutoWidth(ws, aoa) {
  const colWidths = [];
  aoa.forEach((row) => {
    if (!Array.isArray(row)) return;
    row.forEach((cell, colIndex) => {
      const cellStr = cell !== null && cell !== undefined ? String(cell) : '';
      const len = cellStr.length;
      colWidths[colIndex] = Math.max(colWidths[colIndex] || 10, len + 3);
    });
  });
  ws['!cols'] = colWidths.map((w) => ({ wch: Math.min(Math.max(w, 10), 60) }));
}

/**
 * Filtra e consolida os dados do sistema com base no escopo e seleção
 */
export function prepareExportData({
  patients = [],
  doctor = {},
  locais = [],
  scope = 'total',
  filters = {},
  modules = {},
  selectedPatientIds = null
}) {
  let filteredPatients = Array.isArray(patients) ? [...patients] : [];

  // Se escopo for parcial, aplica filtros selecionados
  if (scope === 'partial') {
    if (filters.clinica && filters.clinica !== 'todos') {
      filteredPatients = filteredPatients.filter(p => p.clinica === filters.clinica);
    }
    if (filters.turno && filters.turno !== 'todos') {
      filteredPatients = filteredPatients.filter(p => p.turno === filters.turno);
    }
    if (filters.diaSemana && filters.diaSemana !== 'todos') {
      filteredPatients = filteredPatients.filter(p => p.diaSemana === filters.diaSemana);
    }
    if (filters.tipoAcesso && filters.tipoAcesso !== 'todos') {
      filteredPatients = filteredPatients.filter(p => {
        const tipo = p.tipoAcesso || p.acessoVascular?.tipo || '';
        return tipo === filters.tipoAcesso;
      });
    }
    if (filters.status && filters.status !== 'todos') {
      filteredPatients = filteredPatients.filter(p => p.status === filters.status);
    }
    if (selectedPatientIds && (selectedPatientIds instanceof Set ? selectedPatientIds.size > 0 : selectedPatientIds.length > 0)) {
      const idSet = selectedPatientIds instanceof Set ? selectedPatientIds : new Set(selectedPatientIds);
      filteredPatients = filteredPatients.filter(p => idSet.has(p.id));
    }
  }

  // Ordena pacientes alfabeticamente
  filteredPatients.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR'));

  // Métricas agregadas
  let totalExams = 0;
  let totalMedications = 0;
  let totalAccessInterventions = 0;
  let totalEvolutions = 0;
  let totalLmes = 0;

  filteredPatients.forEach(p => {
    if (Array.isArray(p.historicoExames)) totalExams += p.historicoExames.length;
    const meds = normalizeMedicamentosList(p.medicamentos);
    totalMedications += meds.length;
    if (Array.isArray(p.historicoAcesso)) totalAccessInterventions += p.historicoAcesso.length;
    if (Array.isArray(p.evolucoes)) totalEvolutions += p.evolucoes.length;
    if (Array.isArray(p.lmes)) totalLmes += p.lmes.length;
  });

  const clinicasSet = new Set();
  filteredPatients.forEach(p => {
    if (p.clinica) clinicasSet.add(p.clinica);
  });

  const activeLocais = Array.isArray(locais) ? locais : [];

  const defaultModules = {
    pacientes: true,
    exames: true,
    historicoExames: true,
    medicamentos: true,
    acessos: true,
    evolucoes: true,
    lme: true,
    locais: true
  };

  const activeModules = { ...defaultModules, ...(modules || {}) };

  const scopeLabel = scope === 'total'
    ? 'Integral (Todo o Sistema)'
    : `Parcial (${filteredPatients.length} pacientes selecionados)`;

  return {
    filteredPatients,
    doctor,
    locais: activeLocais,
    scope,
    scopeLabel,
    activeModules,
    stats: {
      totalPatients: filteredPatients.length,
      totalExams,
      totalMedications,
      totalAccessInterventions,
      totalEvolutions,
      totalLmes,
      clinicasCount: clinicasSet.size || activeLocais.length
    },
    emissionDate: new Date()
  };
}

/**
 * Exporta os prontuários e registros em planilha Excel (.xlsx) estruturada multi-abas
 */
export function exportSystemToExcel(options = {}) {
  const data = prepareExportData(options);
  const { filteredPatients, doctor, locais, stats, scopeLabel, activeModules, emissionDate } = data;

  const wb = XLSX.utils.book_new();
  const dateFormatted = emissionDate.toLocaleString('pt-BR');
  const dateStamp = emissionDate.toISOString().slice(0, 10);
  const doctorName = doctor.nome || 'Médico Nefrologista';
  const doctorCrm = doctor.crm ? `${doctor.crm}/${doctor.ufCrm || 'SP'}` : '---';

  // ==========================================
  // ABA 1: RESUMO DO SISTEMA E CLÍNICAS
  // ==========================================
  const resumoAoa = [
    ['Nex-Ai.NEFRO — PLATAFORMA DE GESTÃO CLÍNICA NEFROLÓGICA'],
    ['RELATÓRIO OFICIAL DE PORTABILIDADE E BACKUP DE DADOS CLÍNICOS'],
    ['Em conformidade com a Resolução CFM nº 1.821/2007 e LGPD (Lei nº 13.709/2018 - Art. 18, V)'],
    [],
    ['DADOS DO MÉDICO RESPONSÁVEL:'],
    ['Médico Titular:', doctorName],
    ['CRM / UF:', doctorCrm],
    ['RQE:', doctor.rqe || '---'],
    ['CNS:', doctor.cns || '---'],
    ['Especialidade:', doctor.especialidade || 'Nefrologia e Hemodiálise'],
    ['E-mail:', doctor.email || '---'],
    ['Telefone:', doctor.telefone || '---'],
    ['Clínica Principal:', doctor.clinicaPrincipal || '---'],
    [],
    ['PARÂMETROS DA EXPORTAÇÃO:'],
    ['Data e Hora da Emissão:', dateFormatted],
    ['Escopo da Exportação:', scopeLabel],
    ['Total de Prontuários Exportados:', stats.totalPatients],
    ['Total de Exames Históricos:', stats.totalExams],
    ['Total de Prescrições Medicamentosas:', stats.totalMedications],
    ['Total de Intervenções de Acesso:', stats.totalAccessInterventions],
    ['Total de Evoluções Clínicas:', stats.totalEvolutions],
    ['Total de Laudos LME:', stats.totalLmes],
    [],
    ['LOCAIS DE ATUAÇÃO E UNIDADES DE DIÁLISE CADASTRADAS:']
  ];

  resumoAoa.push([
    'Nome da Unidade',
    'Tipo',
    'Cidade',
    'Endereço',
    'Dias de Atendimento',
    'Turnos',
    'Responsável Técnico (RT)',
    'CRM RT',
    'Contato Enfermagem',
    'Status'
  ]);

  if (locais.length === 0) {
    resumoAoa.push([doctor.clinicaPrincipal || 'Clínica Principal', 'Clínica de Hemodiálise', 'São Paulo/SP', '---', 'Seg/Qua/Sex e Ter/Qui/Sáb', '1º, 2º e 3º Turnos', doctorName, doctorCrm, '---', 'Ativo']);
  } else {
    locais.forEach(l => {
      resumoAoa.push([
        l.nome || '---',
        l.tipo || 'Clínica de Hemodiálise',
        l.cidade || '---',
        l.endereco || '---',
        l.diasSemana || '---',
        l.turnos || '---',
        l.rtNome || doctorName,
        l.rtCrm || doctorCrm,
        l.telefoneEnfermagem || '---',
        l.status || 'Ativo'
      ]);
    });
  }

  const wsResumo = XLSX.utils.aoa_to_sheet(resumoAoa);
  applyAutoWidth(wsResumo, resumoAoa);
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo e Unidades');

  // ==========================================
  // ABA 2: PACIENTES E CADASTRO CLÍNICO
  // ==========================================
  if (activeModules.pacientes) {
    const pacientesAoa = [
      [
        'ID Prontuário',
        'Nome Completo',
        'Sexo',
        'Data Nascimento',
        'Idade',
        'CPF',
        'Telefone',
        'E-mail',
        'Endereço',
        'Contato Emergência (Nome)',
        'Contato Emergência (Tel)',
        'Contato Emergência (Grau)',
        'Convênio',
        'Unidade / Clínica',
        'Hospital de Vínculo',
        'Turno',
        'Dias da Semana',
        'Modalidade Dialítica',
        'Status do Paciente',
        'Status de Transplante',
        'Etiologia da DRC',
        'Data Início TRS',
        'Peso Seco (kg)',
        'Altura (cm)',
        'Alergias Conhecidas',
        'Tipo de Anticoagulação',
        'Dose Ataque Heparina (UI)',
        'Dose Manutenção Heparina (UI/h)',
        'Observações de Anticoagulação',
        'Tipo de Acesso Vascular',
        'Membro / Topografia',
        'Data Confecção Acesso',
        'Fluxo de Sangue (Qb ml/min)',
        'Fluxo de Dialisato (Qd ml/min)',
        'Calibre Agulha',
        'Observações Clínicas Gerais'
      ]
    ];

    filteredPatients.forEach(p => {
      const acesso = p.acessoVascular || {};
      const antico = p.anticoagulacao || {};
      const em = p.contatoEmergencia || {};
      const alergiasStr = Array.isArray(p.alergias) ? p.alergias.join(', ') : cleanText(p.alergias);

      pacientesAoa.push([
        cleanText(p.id),
        cleanText(p.nome),
        cleanText(p.sexo),
        cleanText(p.dataNascimento),
        p.idade ?? '---',
        cleanText(p.cpf),
        cleanText(p.telefone),
        cleanText(p.email),
        cleanText(p.endereco),
        cleanText(em.nome),
        cleanText(em.telefone),
        cleanText(em.parentesco),
        cleanText(p.convenio, 'SUS'),
        cleanText(p.clinica),
        cleanText(p.hospital),
        cleanText(p.turno),
        cleanText(p.diaSemana),
        cleanText(p.modalidade, 'HD'),
        cleanText(p.status, 'Ativo'),
        cleanText(p.statusTransplante, 'Não Avaliado'),
        cleanText(p.etiologiaDRC),
        cleanText(p.dataInicioDialise),
        p.pesoSeco ?? '---',
        p.altura ?? '---',
        alergiasStr,
        cleanText(antico.tipo || p.tipoAnticoagulacao, 'heparina_padrao'),
        antico.doseAtaque ?? '---',
        antico.doseManutencao ?? '---',
        cleanText(antico.observacoes),
        cleanText(acesso.tipo || p.tipoAcesso),
        cleanText(acesso.ladoMembro || p.posicaoAcesso),
        cleanText(acesso.dataConfeccao || p.dataCriacaoAcesso),
        acesso.fluxoSangue ?? '---',
        acesso.fluxoDialisato ?? '---',
        cleanText(acesso.agulha),
        cleanText(p.observacoesClinicas)
      ]);
    });

    const wsPacientes = XLSX.utils.aoa_to_sheet(pacientesAoa);
    applyAutoWidth(wsPacientes, pacientesAoa);
    XLSX.utils.book_append_sheet(wb, wsPacientes, 'Pacientes');
  }

  // ==========================================
  // ABA 3: LABORATÓRIO CONSOLIDADO
  // ==========================================
  if (activeModules.exames) {
    const labAoa = [
      [
        'Paciente',
        'CPF',
        'Unidade / Clínica',
        'Turno',
        'Dias',
        'Data do Último Exame',
        'Hb (g/dL)',
        'Ht (%)',
        'Ferritina (ng/mL)',
        'IST (%)',
        'PTH (pg/mL)',
        'Cálcio (mg/dL)',
        'Fósforo (mg/dL)',
        'Vitamina D (ng/mL)',
        'Fosfatase Alcalina (U/L)',
        'Potássio (mEq/L)',
        'Sódio (mEq/L)',
        'Bicarbonato (mEq/L)',
        'Kt/V',
        'Ureia Pré (mg/dL)',
        'Ureia Pós (mg/dL)',
        'Creatinina (mg/dL)',
        'Albumina (g/dL)',
        'PCR (mg/L)',
        'Glicemia (mg/dL)',
        'HbA1c (%)'
      ]
    ];

    filteredPatients.forEach(p => {
      const ex = p.exames || {};
      const ultExame = Array.isArray(p.historicoExames) && p.historicoExames.length > 0
        ? p.historicoExames[0].dataExame
        : '---';

      labAoa.push([
        cleanText(p.nome),
        cleanText(p.cpf),
        cleanText(p.clinica),
        cleanText(p.turno),
        cleanText(p.diaSemana),
        cleanText(ultExame),
        ex.hb ?? '---',
        ex.ht ?? '---',
        ex.ferritina ?? '---',
        ex.ist ?? '---',
        ex.pth ?? '---',
        ex.ca ?? '---',
        ex.fosforo ?? '---',
        ex.vitD ?? '---',
        ex.fa ?? '---',
        ex.k ?? '---',
        ex.na ?? '---',
        ex.hco3 ?? '---',
        ex.ktv ?? '---',
        ex.ureiaPre ?? '---',
        ex.ureiaPos ?? '---',
        ex.creatinina ?? '---',
        ex.albumina ?? '---',
        ex.pcr ?? '---',
        ex.glicemia ?? '---',
        ex.hba1c ?? '---'
      ]);
    });

    const wsLab = XLSX.utils.aoa_to_sheet(labAoa);
    applyAutoWidth(wsLab, labAoa);
    XLSX.utils.book_append_sheet(wb, wsLab, 'Laboratório Consolidado');
  }

  // ==========================================
  // ABA 4: HISTÓRICO DE EXAMES CRONOLÓGICO
  // ==========================================
  if (activeModules.historicoExames) {
    const histAoa = [
      [
        'Data da Coleta',
        'Paciente',
        'CPF',
        'Unidade / Clínica',
        'Hb (g/dL)',
        'Ht (%)',
        'Ferritina (ng/mL)',
        'IST (%)',
        'PTH (pg/mL)',
        'Cálcio (mg/dL)',
        'Fósforo (mg/dL)',
        'Vitamina D (ng/mL)',
        'Fosfatase Alcalina (U/L)',
        'Potássio (mEq/L)',
        'Sódio (mEq/L)',
        'Bicarbonato (mEq/L)',
        'Kt/V',
        'Ureia Pré (mg/dL)',
        'Ureia Pós (mg/dL)',
        'Creatinina (mg/dL)',
        'Albumina (g/dL)',
        'PCR (mg/L)',
        'Observações do Laudo'
      ]
    ];

    filteredPatients.forEach(p => {
      const hist = Array.isArray(p.historicoExames) ? p.historicoExames : [];
      hist.forEach(h => {
        histAoa.push([
          cleanText(h.dataExame),
          cleanText(p.nome),
          cleanText(p.cpf),
          cleanText(p.clinica),
          h.hb ?? '---',
          h.ht ?? '---',
          h.ferritina ?? '---',
          h.ist ?? '---',
          h.pth ?? '---',
          h.ca ?? '---',
          h.fosforo ?? '---',
          h.vitD ?? '---',
          h.fa ?? '---',
          h.k ?? '---',
          h.na ?? '---',
          h.hco3 ?? '---',
          h.ktv ?? '---',
          h.ureiaPre ?? '---',
          h.ureiaPos ?? '---',
          h.creatinina ?? '---',
          h.albumina ?? '---',
          h.pcr ?? '---',
          cleanText(h.observacoes)
        ]);
      });
    });

    const wsHist = XLSX.utils.aoa_to_sheet(histAoa);
    applyAutoWidth(wsHist, histAoa);
    XLSX.utils.book_append_sheet(wb, wsHist, 'Histórico Exames');
  }

  // ==========================================
  // ABA 5: PRESCRIÇÕES E MEDICAMENTOS
  // ==========================================
  if (activeModules.medicamentos) {
    const medsAoa = [
      [
        'Paciente',
        'CPF',
        'Unidade / Clínica',
        'Turno',
        'Medicamento',
        'Categoria Terapêutica',
        'Dosagem',
        'Via de Administração',
        'Posologia / Frequência',
        'Tipo de Ciclo',
        'Data Início',
        'Data Término',
        'Status (Ativo/Suspenso)',
        'Observações Farmacológicas'
      ]
    ];

    filteredPatients.forEach(p => {
      const meds = normalizeMedicamentosList(p.medicamentos);
      meds.forEach(m => {
        medsAoa.push([
          cleanText(p.nome),
          cleanText(p.cpf),
          cleanText(p.clinica),
          cleanText(p.turno),
          cleanText(m.nome),
          cleanText(m.categoria, 'Geral'),
          cleanText(m.dosagem),
          cleanText(m.via, 'VO'),
          cleanText(m.frequencia),
          cleanText(m.tipo, 'continuo'),
          cleanText(m.dataInicio),
          cleanText(m.dataFim),
          m.ativo !== false ? 'Ativo' : 'Suspenso',
          cleanText(m.observacao || m.observacoes)
        ]);
      });
    });

    const wsMeds = XLSX.utils.aoa_to_sheet(medsAoa);
    applyAutoWidth(wsMeds, medsAoa);
    XLSX.utils.book_append_sheet(wb, wsMeds, 'Prescrições');
  }

  // ==========================================
  // ABA 6: ACESSOS VASCULARES E INTERVENÇÕES
  // ==========================================
  if (activeModules.acessos) {
    const acessosAoa = [
      [
        'Paciente',
        'CPF',
        'Unidade / Clínica',
        'Tipo de Acesso Atual',
        'Membro / Topografia',
        'Data de Confecção',
        'Fluxo de Sangue (Qb)',
        'Fluxo de Dialisato (Qd)',
        'Agulha Recomendada',
        'Data do Procedimento / Doppler',
        'Tipo de Evento',
        'Desfecho Clínico',
        'Profissional Executante',
        'Hospital / Clínica do Evento',
        'Descrição e Achados do Procedimento',
        'Conduta Pós-Intervenção'
      ]
    ];

    filteredPatients.forEach(p => {
      const ac = p.acessoVascular || {};
      const hist = Array.isArray(p.historicoAcesso) ? p.historicoAcesso : [];

      if (hist.length === 0) {
        acessosAoa.push([
          cleanText(p.nome),
          cleanText(p.cpf),
          cleanText(p.clinica),
          cleanText(ac.tipo || p.tipoAcesso),
          cleanText(ac.ladoMembro || p.posicaoAcesso),
          cleanText(ac.dataConfeccao || p.dataCriacaoAcesso),
          ac.fluxoSangue ?? '---',
          ac.fluxoDialisato ?? '---',
          cleanText(ac.agulha),
          '---',
          'Cadastro Inicial',
          'Acesso Ativo',
          '---',
          '---',
          'Sem intervenções ou dopplers registrados.',
          '---'
        ]);
      } else {
        hist.forEach(ev => {
          acessosAoa.push([
            cleanText(p.nome),
            cleanText(p.cpf),
            cleanText(p.clinica),
            cleanText(ev.acesso || ac.tipo || p.tipoAcesso),
            cleanText(ev.ladoMembro || ac.ladoMembro || p.posicaoAcesso),
            cleanText(ac.dataConfeccao || p.dataCriacaoAcesso),
            ac.fluxoSangue ?? '---',
            ac.fluxoDialisato ?? '---',
            cleanText(ac.agulha),
            cleanText(ev.data),
            cleanText(ev.tipoEvento),
            cleanText(ev.desfecho),
            cleanText(ev.profissional),
            cleanText(ev.hospital),
            cleanText(ev.descricao),
            cleanText(ev.conduta)
          ]);
        });
      }
    });

    const wsAcessos = XLSX.utils.aoa_to_sheet(acessosAoa);
    applyAutoWidth(wsAcessos, acessosAoa);
    XLSX.utils.book_append_sheet(wb, wsAcessos, 'Acessos Vasculares');
  }

  // ==========================================
  // ABA 7: EVOLUÇÕES CLÍNICAS
  // ==========================================
  if (activeModules.evolucoes) {
    const evoAoa = [
      [
        'Data e Hora',
        'Paciente',
        'CPF',
        'Unidade / Clínica',
        'Tipo de Atendimento',
        'PA Pré-HD',
        'PA Pós-HD',
        'Peso Pré-HD (kg)',
        'UF Retirada (ml)',
        'Qb Efetivo (ml/min)',
        'Intercorrências Registradas',
        'Conduta Médica e Avaliação Clínica',
        'Médico Responsável',
        'CRM do Médico'
      ]
    ];

    filteredPatients.forEach(p => {
      const evos = Array.isArray(p.evolucoes) ? p.evolucoes : [];
      evos.forEach(e => {
        evoAoa.push([
          cleanText(e.dataHora),
          cleanText(p.nome),
          cleanText(p.cpf),
          cleanText(p.clinica),
          cleanText(e.tipoAtendimento, 'Avaliação Mensal'),
          cleanText(e.paPre),
          cleanText(e.paPos),
          e.pesoPre ?? '---',
          e.ufRetirada ?? '---',
          e.qbEfetivo ?? '---',
          cleanText(e.intercorrencias, 'Nenhuma'),
          cleanText(e.condutaClinica || e.descricao),
          cleanText(e.medicoNome || doctorName),
          cleanText(e.medicoCrm || doctorCrm)
        ]);
      });
    });

    const wsEvo = XLSX.utils.aoa_to_sheet(evoAoa);
    applyAutoWidth(wsEvo, evoAoa);
    XLSX.utils.book_append_sheet(wb, wsEvo, 'Evoluções Médicas');
  }

  // ==========================================
  // ABA 8: LAUDOS LME / CEAF
  // ==========================================
  if (activeModules.lme) {
    const lmeAoa = [
      [
        'Paciente',
        'CPF',
        'Unidade / Clínica',
        'Medicamento Solicitado',
        'Posologia / Esquema Terapêutico',
        'Quantidade Mensal',
        'Vigência (Meses)',
        'Data da Solicitação',
        'Data de Validade',
        'CID-10',
        'Justificativa Clínica e PCDT',
        'Médico Solicitante',
        'CRM',
        'CNS'
      ]
    ];

    filteredPatients.forEach(p => {
      const lmes = Array.isArray(p.lmes) ? p.lmes : [];
      lmes.forEach(l => {
        const medSol = l.medicoSolicitante || {};
        lmeAoa.push([
          cleanText(p.nome),
          cleanText(p.cpf),
          cleanText(p.clinica),
          cleanText(l.medicamentoNome),
          cleanText(l.posologia),
          l.quantidadeMensal ?? '---',
          l.vigenciaMeses ?? 6,
          cleanText(l.dataSolicitacao),
          cleanText(l.dataValidade),
          cleanText(l.cid10, 'N18.0'),
          cleanText(l.justificativaClinica),
          cleanText(medSol.nome || doctorName),
          cleanText(medSol.crm || doctorCrm),
          cleanText(medSol.cns || doctor.cns)
        ]);
      });
    });

    const wsLme = XLSX.utils.aoa_to_sheet(lmeAoa);
    applyAutoWidth(wsLme, lmeAoa);
    XLSX.utils.book_append_sheet(wb, wsLme, 'Laudos LME');
  }

  // Disparo do Download do Arquivo XLSX
  const cleanScope = scope === 'total' ? 'Integral' : 'Parcial';
  const fileName = `NexAi-NEFRO-Portabilidade-${cleanScope}-${dateStamp}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return {
    success: true,
    fileName,
    totalPatients: filteredPatients.length
  };
}

/**
 * Exporta os prontuários e registros em Dossiê PDF Vetorial em Alta Resolução
 */
export async function exportSystemToPdf(options = {}) {
  const data = prepareExportData(options);
  const { filteredPatients, doctor, locais, stats, scope, scopeLabel, activeModules, emissionDate } = data;

  const dateStamp = emissionDate.toISOString().slice(0, 10);
  const cleanScope = scope === 'total' ? 'Integral' : 'Parcial';
  const fileName = `NexAi-NEFRO-Portabilidade-${cleanScope}-${dateStamp}.pdf`;

  const docJsx = React.createElement(SystemExportPdf, {
    patients: filteredPatients,
    doctor,
    locais,
    stats,
    scopeLabel,
    activeModules,
    emissionDate
  });

  await downloadPdfDocument(docJsx, fileName);

  return {
    success: true,
    fileName,
    totalPatients: filteredPatients.length
  };
}
