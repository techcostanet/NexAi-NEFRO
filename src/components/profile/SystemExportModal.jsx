import React, { useState, useMemo } from 'react';
import {
  X,
  FileSpreadsheet,
  FileText,
  Database,
  Search,
  Users,
  Building2,
  Clock,
  Activity,
  Pill,
  Syringe,
  Loader2,
  Check,
  CheckSquare,
  Square,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { exportSystemToExcel, exportSystemToPdf } from '../../services/systemExportService.js';

export default function SystemExportModal({
  isOpen,
  onClose,
  patients = [],
  doctor = {},
  locais = []
}) {
  const [exportScope, setExportScope] = useState('total'); // 'total' | 'partial'
  const [selectedClinica, setSelectedClinica] = useState('todos');
  const [selectedTurno, setSelectedTurno] = useState('todos');
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [manualSelectionMode, setManualSelectionMode] = useState(false);
  const [selectedPatientIds, setSelectedPatientIds] = useState(new Set());
  
  // Módulos clínicos para exportação
  const [modules, setModules] = useState({
    pacientes: true,
    exames: true,
    historicoExames: true,
    medicamentos: true,
    acessos: true,
    evolucoes: true,
    lme: true
  });

  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Lista única de Clínicas / Unidades
  const clinicasList = useMemo(() => {
    const setClinicas = new Set();
    if (Array.isArray(locais)) {
      locais.forEach(l => {
        if (l.nome) setClinicas.add(l.nome);
      });
    }
    if (doctor.clinicaPrincipal) {
      setClinicas.add(doctor.clinicaPrincipal);
    }
    if (Array.isArray(patients)) {
      patients.forEach(p => {
        if (p.clinica) setClinicas.add(p.clinica);
      });
    }
    return Array.from(setClinicas).filter(Boolean);
  }, [locais, doctor, patients]);

  // Pacientes filtrados por clínica e turno
  const filteredPatients = useMemo(() => {
    let list = Array.isArray(patients) ? [...patients] : [];
    if (exportScope === 'partial') {
      if (selectedClinica !== 'todos') {
        list = list.filter(p => p.clinica === selectedClinica);
      }
      if (selectedTurno !== 'todos') {
        list = list.filter(p => p.turno === selectedTurno);
      }
    }
    return list;
  }, [patients, exportScope, selectedClinica, selectedTurno]);

  // Pacientes visíveis na lista de busca manual
  const searchFilteredPatients = useMemo(() => {
    const q = patientSearchTerm.trim().toLowerCase();
    if (!q) return filteredPatients;
    return filteredPatients.filter(p => {
      const nome = (p.nome || '').toLowerCase();
      const cpf = (p.cpf || '').replace(/\D/g, '');
      const cleanQ = q.replace(/\D/g, '');
      return nome.includes(q) || (cleanQ && cpf.includes(cleanQ));
    });
  }, [filteredPatients, patientSearchTerm]);

  // Pacientes efetivamente selecionados para o arquivo final
  const finalPatientsToExport = useMemo(() => {
    if (exportScope === 'total') return patients;
    if (manualSelectionMode) {
      return filteredPatients.filter(p => selectedPatientIds.has(p.id));
    }
    return filteredPatients;
  }, [exportScope, manualSelectionMode, filteredPatients, selectedPatientIds, patients]);

  const toggleModule = (modKey) => {
    setModules(prev => ({ ...prev, [modKey]: !prev[modKey] }));
  };

  const toggleSelectPatient = (id) => {
    setSelectedPatientIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFilteredPatients = () => {
    const next = new Set();
    filteredPatients.forEach(p => next.add(p.id));
    setSelectedPatientIds(next);
  };

  const clearAllSelectedPatients = () => {
    setSelectedPatientIds(new Set());
  };

  // Handler para Exportação em Excel
  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      setFeedback(null);
      const res = await exportSystemToExcel({
        patients: finalPatientsToExport,
        doctor,
        locais,
        scope: exportScope,
        filters: { clinica: selectedClinica, turno: selectedTurno },
        modules
      });
      setFeedback({
        type: 'success',
        text: `Planilha Excel gerada com sucesso (${res.totalPatients} prontuários incluídos).`
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error('Erro ao gerar Excel:', err);
      setFeedback({
        type: 'error',
        text: 'Falha ao gerar planilha Excel. Tente novamente.'
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Handler para Exportação em PDF
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      setFeedback(null);
      const res = await exportSystemToPdf({
        patients: finalPatientsToExport,
        doctor,
        locais,
        scope: exportScope,
        filters: { clinica: selectedClinica, turno: selectedTurno },
        modules
      });
      setFeedback({
        type: 'success',
        text: `Dossiê PDF gerado com sucesso (${res.totalPatients} prontuários diagramados).`
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setFeedback({
        type: 'error',
        text: 'Falha ao diagramar dossiê em PDF. Tente novamente.'
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(15, 23, 42, 0.7)', 
        backdropFilter: 'blur(6px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-in"
        style={{ 
          background: '#ffffff', 
          width: '100%', 
          maxWidth: '780px', 
          maxHeight: '92vh', 
          overflowY: 'auto',
          padding: '1.75rem',
          borderRadius: '24px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-start border-b pb-3.5" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div 
              style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-800 leading-tight">Portabilidade de Dados</h2>
              <p className="text-xs text-muted mt-0.5">
                Exportação de prontuários em Excel e PDF para transição clínica
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 transition"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            title="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Feedback de Sucesso ou Erro */}
        {feedback && (
          <div 
            style={{ 
              padding: '0.85rem 1rem', 
              borderRadius: '12px', 
              fontSize: '0.82rem', 
              fontWeight: '600',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              background: feedback.type === 'error' ? '#fef2f2' : '#f0fdf4',
              color: feedback.type === 'error' ? '#b91c1c' : '#15803d',
              border: `1px solid ${feedback.type === 'error' ? '#fecaca' : '#bbf7d0'}`
            }}
          >
            {feedback.type === 'error' ? <X size={16} /> : <Check size={16} />}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* 1. SELEÇÃO DO ESCOPO: INTEGRAL VS PARCIAL */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Escopo da Exportação
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => {
                setExportScope('total');
                setManualSelectionMode(false);
              }}
              style={{
                background: exportScope === 'total' ? '#eff6ff' : '#ffffff',
                border: `2px solid ${exportScope === 'total' ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: '14px',
                padding: '0.9rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <div 
                style={{ 
                  marginTop: '2px', 
                  color: exportScope === 'total' ? '#2563eb' : '#94a3b8' 
                }}
              >
                {exportScope === 'total' ? <CheckSquare size={18} /> : <Square size={18} />}
              </div>
              <div>
                <strong className="text-sm block text-slate-800 font-bold">Todo o Sistema</strong>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Exporta todos os {patients.length} pacientes, exames e cadastros
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setExportScope('partial')}
              style={{
                background: exportScope === 'partial' ? '#eff6ff' : '#ffffff',
                border: `2px solid ${exportScope === 'partial' ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: '14px',
                padding: '0.9rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <div 
                style={{ 
                  marginTop: '2px', 
                  color: exportScope === 'partial' ? '#2563eb' : '#94a3b8' 
                }}
              >
                {exportScope === 'partial' ? <CheckSquare size={18} /> : <Square size={18} />}
              </div>
              <div>
                <strong className="text-sm block text-slate-800 font-bold">Personalizada</strong>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  Filtre por clínica, turno, módulos e pacientes específicos
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. FILTROS CONDICIONAIS (APENAS SE ESCOPO FOR PARCIAL) */}
        {exportScope === 'partial' && (
          <div 
            style={{ 
              background: '#f8fafc', 
              padding: '1.1rem', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Unidade de Atendimento
                </label>
                <select
                  className="input-field text-xs"
                  value={selectedClinica}
                  onChange={(e) => setSelectedClinica(e.target.value)}
                >
                  <option value="todos">Todas as Unidades ({patients.length})</option>
                  {clinicasList.map(c => {
                    const count = patients.filter(p => p.clinica === c).length;
                    return (
                      <option key={c} value={c}>{c} ({count} pacientes)</option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">
                  Turno de Diálise
                </label>
                <select
                  className="input-field text-xs"
                  value={selectedTurno}
                  onChange={(e) => setSelectedTurno(e.target.value)}
                >
                  <option value="todos">Todos os Turnos</option>
                  <option value="1º Turno">1º Turno (Manhã)</option>
                  <option value="2º Turno">2º Turno (Tarde)</option>
                  <option value="3º Turno">3º Turno (Noite)</option>
                  <option value="4º Turno">4º Turno (Noturno)</option>
                </select>
              </div>
            </div>

            {/* Alternância de Seleção de Pacientes */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Pacientes Abrangidos: <strong className="text-blue-700">{filteredPatients.length} prontuários</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setManualSelectionMode(!manualSelectionMode);
                      if (!manualSelectionMode) selectAllFilteredPatients();
                    }}
                    style={{
                      fontSize: '0.75rem',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe',
                      background: manualSelectionMode ? '#eff6ff' : '#ffffff',
                      color: '#1d4ed8',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {manualSelectionMode ? 'Usar Todos os Filtrados' : 'Selecionar Manualmente'}
                  </button>
                </div>
              </div>

              {/* Lista Seletiva de Pacientes */}
              {manualSelectionMode && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="relative">
                    <input
                      type="text"
                      className="input-field text-xs"
                      placeholder="Pesquisar paciente por nome ou CPF..."
                      value={patientSearchTerm}
                      onChange={(e) => setPatientSearchTerm(e.target.value)}
                      style={{ paddingLeft: '28px' }}
                    />
                    <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 px-1">
                    <span>Selecionados: <strong>{selectedPatientIds.size} de {filteredPatients.length}</strong></span>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={selectAllFilteredPatients}
                        style={{ border: 'none', background: 'transparent', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Marcar Todos
                      </button>
                      <button 
                        type="button" 
                        onClick={clearAllSelectedPatients}
                        style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Desmarcar Todos
                      </button>
                    </div>
                  </div>

                  <div 
                    style={{ 
                      maxHeight: '130px', 
                      overflowY: 'auto', 
                      background: '#ffffff', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '10px',
                      padding: '0.35rem'
                    }}
                  >
                    {searchFilteredPatients.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">Nenhum paciente localizado.</div>
                    ) : (
                      searchFilteredPatients.map(p => {
                        const isChecked = selectedPatientIds.has(p.id);
                        return (
                          <div 
                            key={p.id}
                            onClick={() => toggleSelectPatient(p.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              background: isChecked ? '#eff6ff' : 'transparent',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {isChecked ? <CheckSquare size={14} color="#2563eb" /> : <Square size={14} color="#94a3b8" />}
                              <span className="font-semibold text-slate-800">{p.nome}</span>
                            </div>
                            <span className="text-slate-400 text-xs">{p.clinica} • {p.turno}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. SELEÇÃO DE MÓDULOS DE DADOS */}
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
            Módulos Clínicos Incluídos
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
            {[
              { id: 'pacientes', label: 'Pacientes', desc: 'Dados Cadastrais e DRC' },
              { id: 'exames', label: 'Laboratório', desc: 'Últimos Exames Válidos' },
              { id: 'historicoExames', label: 'Histórico', desc: 'Série Temporal de Exames' },
              { id: 'medicamentos', label: 'Prescrições', desc: 'Medicamentos Ativos e Doses' },
              { id: 'acessos', label: 'Acessos', desc: 'FAV, Próteses e Dopplers' },
              { id: 'evolucoes', label: 'Evoluções', desc: 'Consultas e Condutas' },
              { id: 'lme', label: 'LME', desc: 'Processos de Alto Custo' }
            ].map(m => {
              const active = modules[m.id];
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleModule(m.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '10px',
                    background: active ? '#f0fdf4' : '#f8fafc',
                    border: `1px solid ${active ? '#bbf7d0' : '#e2e8f0'}`,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ color: active ? '#16a34a' : '#94a3b8' }}>
                    {active ? <CheckSquare size={16} /> : <Square size={16} />}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: active ? '#15803d' : '#475569', display: 'block' }}>
                      {m.label}
                    </strong>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                      {m.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. RESUMO DOS DADOS A EXPORTAR */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #1e3a8a08, #2563eb0c)', 
            padding: '0.85rem 1rem', 
            borderRadius: '14px', 
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} color="#2563eb" />
            <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1e3a8a' }}>
              Prontuários para Extração: <strong>{finalPatientsToExport.length} pacientes</strong>
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Formato estruturado compatível com Excel, LibreOffice e PDF/A
          </span>
        </div>

        {/* 5. AÇÕES DE EXPORTAÇÃO (RODAPÉ) */}
        <div className="flex justify-between items-center pt-2 border-t flex-wrap gap-2">
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={onClose}
            disabled={isExportingExcel || isExportingPdf}
            style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}
          >
            Fechar
          </button>

          <div className="flex items-center gap-2.5">
            {/* Botão EXCEL */}
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isExportingExcel || isExportingPdf || finalPatientsToExport.length === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.6rem 1.15rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                borderRadius: '12px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                cursor: (isExportingExcel || isExportingPdf || finalPatientsToExport.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (isExportingExcel || isExportingPdf || finalPatientsToExport.length === 0) ? 0.6 : 1,
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                transition: 'all 0.2s ease'
              }}
              title="Baixar planilha Excel (.xlsx) com múltiplas abas formatadas"
            >
              {isExportingExcel ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={16} />
              )}
              <span>{isExportingExcel ? 'Gerando...' : 'Excel'}</span>
            </button>

            {/* Botão PDF */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingExcel || isExportingPdf || finalPatientsToExport.length === 0}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.6rem 1.15rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                borderRadius: '12px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                cursor: (isExportingExcel || isExportingPdf || finalPatientsToExport.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (isExportingExcel || isExportingPdf || finalPatientsToExport.length === 0) ? 0.6 : 1,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s ease'
              }}
              title="Baixar dossiê oficial em PDF vetorizado em alta resolução"
            >
              {isExportingPdf ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <FileText size={16} />
              )}
              <span>{isExportingPdf ? 'Gerando...' : 'PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
