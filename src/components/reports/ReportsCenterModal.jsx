import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Printer,
  Search,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  Users,
  Activity,
  FlaskConical,
  Pill,
  Award,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import {
  REPORTS_CATALOG,
  REPORT_CATEGORIES,
  filterPatientsForReport,
  generateReportData,
  exportReportToExcel
} from '../../services/reportsService.js';
import { subscribeAuditLogs } from '../../services/auditService.js';
import ReportPrintDocument from './ReportPrintDocument.jsx';
import { printElement } from '../../utils/printUtils.js';

export default function ReportsCenterModal({
  isOpen,
  onClose,
  patients = [],
  doctor = {},
  locaisList = [],
  doctorId = null
}) {
  if (!isOpen) return null;

  // Identificador do médico ativo para isolamento absoluto multi-tenant
  const effectiveDoctorId = doctorId || doctor?.id || doctor?.uid || (doctor?.nome ? 'dr-marcelo' : null);

  // Estado do Relatório Ativo
  const [selectedReportId, setSelectedReportId] = useState('censo_geral');
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'print_preview'
  const [auditLogs, setAuditLogs] = useState([]);

  // Estados dos Filtros
  const [filters, setFilters] = useState({
    unidade: 'todos',
    turno: 'todos',
    diaSemana: 'todos',
    tipoAcesso: 'todos',
    statusTransplante: 'todos',
    anticoagulacao: 'todos',
    convenio: 'todos',
    comAlertaApenas: false,
    busca: ''
  });

  const [isFilterBarExpanded, setIsFilterBarExpanded] = useState(true);

  // Escuta logs de auditoria em tempo real quando o modal está aberto, filtrando estritamente pelo médico ativo
  useEffect(() => {
    if (!isOpen) return;
    const unsub = subscribeAuditLogs((logs) => {
      setAuditLogs(logs || []);
    }, 60, effectiveDoctorId);
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [isOpen, effectiveDoctorId]);

  // Barreira multi-tenant: descarta qualquer registro de paciente com doctorId divergente
  const safePatients = useMemo(() => {
    if (!Array.isArray(patients)) return [];
    if (!effectiveDoctorId) return patients;
    return patients.filter(p => !p.doctorId || p.doctorId === effectiveDoctorId);
  }, [patients, effectiveDoctorId]);

  // Lista única de Clínicas / Unidades extraídas dos locais cadastrados e dos pacientes do médico
  const clinicasOptions = useMemo(() => {
    const setClinicas = new Set();
    if (Array.isArray(locaisList)) {
      locaisList.forEach(l => {
        if (l.nome) setClinicas.add(l.nome);
      });
    }
    if (doctor.clinicaPrincipal) {
      setClinicas.add(doctor.clinicaPrincipal);
    }
    if (Array.isArray(safePatients)) {
      safePatients.forEach(p => {
        if (p.clinica) setClinicas.add(p.clinica);
      });
    }
    return Array.from(setClinicas).filter(Boolean);
  }, [locaisList, doctor, safePatients]);

  // Encontra o relatório selecionado no catálogo
  const currentReport = useMemo(() => {
    return REPORTS_CATALOG.find(r => r.id === selectedReportId) || REPORTS_CATALOG[0];
  }, [selectedReportId]);

  // Filtra pacientes de acordo com os filtros globais aplicados e isolamento médico
  const filteredPatients = useMemo(() => {
    return filterPatientsForReport(safePatients, filters, effectiveDoctorId);
  }, [safePatients, filters, effectiveDoctorId]);

  // Gera dados tabulares e KPIs para o relatório ativo com blindagem multi-tenant
  const { rows, kpis } = useMemo(() => {
    return generateReportData(currentReport.id, filteredPatients, auditLogs, effectiveDoctorId);
  }, [currentReport.id, filteredPatients, auditLogs, effectiveDoctorId]);

  // Lista de relatórios filtrados na barra lateral
  const sidebarReports = useMemo(() => {
    const q = reportSearchQuery.trim().toLowerCase();
    return REPORTS_CATALOG.filter(r => {
      if (selectedCategory !== 'todos' && r.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      );
    });
  }, [reportSearchQuery, selectedCategory]);

  // Handlers de Filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      unidade: 'todos',
      turno: 'todos',
      diaSemana: 'todos',
      tipoAcesso: 'todos',
      statusTransplante: 'todos',
      anticoagulacao: 'todos',
      convenio: 'todos',
      comAlertaApenas: false,
      busca: ''
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.unidade !== 'todos' ||
      filters.turno !== 'todos' ||
      filters.diaSemana !== 'todos' ||
      filters.tipoAcesso !== 'todos' ||
      filters.statusTransplante !== 'todos' ||
      filters.anticoagulacao !== 'todos' ||
      filters.convenio !== 'todos' ||
      filters.comAlertaApenas ||
      filters.busca.trim() !== ''
    );
  }, [filters]);

  // Exportação para Excel (.xlsx)
  const handleExportExcel = () => {
    const descParts = [];
    if (filters.unidade !== 'todos') descParts.push(`Unidade: ${filters.unidade}`);
    if (filters.turno !== 'todos') descParts.push(`Turno: ${filters.turno}`);
    if (filters.diaSemana !== 'todos') descParts.push(`Escala: ${filters.diaSemana}`);
    if (filters.tipoAcesso !== 'todos') descParts.push(`Acesso: ${filters.tipoAcesso}`);
    if (filters.anticoagulacao !== 'todos') descParts.push(`Anticoagulação: ${filters.anticoagulacao}`);
    if (filters.convenio !== 'todos') descParts.push(`Convênio: ${filters.convenio}`);
    if (filters.comAlertaApenas) descParts.push('Com Alertas');
    if (filters.busca) descParts.push(`Busca: "${filters.busca}"`);

    const filtersDesc = descParts.length > 0 ? descParts.join(' • ') : 'Todos os registros';

    exportReportToExcel(currentReport, rows, kpis, {
      doctorName: doctor.nome,
      doctorCrm: doctor.crm,
      doctorUf: doctor.ufCrm,
      clinica: filters.unidade !== 'todos' ? filters.unidade : doctor.clinicaPrincipal,
      filtersDesc
    });
  };

  // Impressão / Exportação para PDF
  const handlePrintPdf = () => {
    setViewMode('print_preview');
    setTimeout(() => {
      printElement('printable-report-center-doc', `Relatorio_${currentReport?.id || 'Clinico'}`);
    }, 300);
  };

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 'populacao': return <Users size={15} color="#0284c7" />;
      case 'acesso_dialise': return <Activity size={15} color="#0d9488" />;
      case 'laboratorio': return <FlaskConical size={15} color="#7c3aed" />;
      case 'farmacia_infeccao': return <Pill size={15} color="#e11d48" />;
      case 'qualidade_transplante': return <Award size={15} color="#d97706" />;
      case 'gestao': return <FileText size={15} color="#059669" />;
      default: return <FileText size={15} color="#64748b" />;
    }
  };

  return (
    <div
      className="reports-center-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-in reports-center-modal-container"
        style={{
          background: '#ffffff',
          width: '96vw',
          maxWidth: '1440px',
          height: '92vh',
          maxHeight: '94vh',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35)',
          border: '1px solid #cbd5e1'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ================= MODAL HEADER (MINIMALISTA) ================= */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc'
        }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 3px 10px rgba(37, 99, 235, 0.2)'
            }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.2px' }}>
                  Central de Relatórios
                </h2>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}>
                  {REPORTS_CATALOG.length}
                </span>
              </div>
              <p style={{ margin: '1px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Vigilância clínica e indicadores nefrológicos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Alternador de visualização rápida */}
            <div style={{
              display: 'flex',
              background: '#e2e8f0',
              padding: '2px',
              borderRadius: '8px',
              gap: '2px'
            }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <SlidersHorizontal size={13} />
                <span>Tabela</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('print_preview')}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'print_preview' ? '#ffffff' : 'transparent',
                  color: viewMode === 'print_preview' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'print_preview' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Eye size={13} />
                <span>Impresso</span>
              </button>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ================= CORPO PRINCIPAL DO MODAL ================= */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* ---------------- BARRA LATERAL (CATÁLOGO DOS 26 RELATÓRIOS) ---------------- */}
          <div style={{
            width: '280px',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            background: '#fafafa',
            flexShrink: 0
          }}>
            {/* Campo de Busca Rápida */}
            <div style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '9px', top: '9px' }} />
                <input
                  type="text"
                  placeholder="Buscar relatório..."
                  value={reportSearchQuery}
                  onChange={e => setReportSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 8px 7px 30px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.78rem',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Filtro por Categoria (Pills Limpos) */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '8px', overflowX: 'auto', paddingBottom: '3px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('todos')}
                  style={{
                    padding: '3px 7px',
                    fontSize: '0.68rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedCategory === 'todos' ? '#0f172a' : '#e2e8f0',
                    color: selectedCategory === 'todos' ? '#ffffff' : '#475569',
                    whiteSpace: 'nowrap',
                    fontWeight: '600'
                  }}
                >
                  Todos
                </button>
                {REPORT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '3px 7px',
                      fontSize: '0.68rem',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: selectedCategory === cat.id ? '#0284c7' : '#e2e8f0',
                      color: selectedCategory === cat.id ? '#ffffff' : '#475569',
                      whiteSpace: 'nowrap',
                      fontWeight: '600'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista dos Relatórios Rolável (Livre de poluição visual) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
              {REPORT_CATEGORIES.map(cat => {
                const catReports = sidebarReports.filter(r => r.category === cat.id);
                if (catReports.length === 0) return null;

                return (
                  <div key={cat.id} style={{ marginBottom: '10px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 6px',
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      color: cat.color,
                      letterSpacing: '0.3px'
                    }}>
                      {getCategoryIcon(cat.id)}
                      <span>{cat.name}</span>
                      <span style={{
                        marginLeft: 'auto',
                        background: '#f1f5f9',
                        padding: '1px 5px',
                        borderRadius: '8px',
                        fontSize: '0.62rem',
                        color: '#64748b'
                      }}>
                        {catReports.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                      {catReports.map(rep => {
                        const isSelected = rep.id === selectedReportId;
                        return (
                          <button
                            key={rep.id}
                            type="button"
                            onClick={() => setSelectedReportId(rep.id)}
                            style={{
                              textAlign: 'left',
                              padding: '7px 9px',
                              borderRadius: '6px',
                              border: isSelected ? '1px solid #bae6fd' : '1px solid transparent',
                              background: isSelected ? '#e0f2fe' : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.12s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '6px'
                            }}
                          >
                            <span style={{
                              fontSize: '0.78rem',
                              fontWeight: isSelected ? '700' : '500',
                              color: isSelected ? '#0369a1' : '#1e293b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {rep.title}
                            </span>
                            {isSelected && <ChevronRight size={13} color="#0369a1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---------------- CONTEÚDO PRINCIPAL (RELATÓRIO ATIVO) ---------------- */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#ffffff' }}>
            {/* Topo do Relatório: Título e Botões de Exportação (Ultra-direto) */}
            <div style={{
              padding: '0.85rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              background: '#ffffff'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    color: '#475569'
                  }}>
                    {REPORT_CATEGORIES.find(c => c.id === currentReport.category)?.name}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>•</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                    {rows.length} {rows.length === 1 ? 'paciente' : 'pacientes'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: '3px 0 1px 0' }}>
                  {currentReport.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                  {currentReport.description}
                </p>
              </div>

              {/* Botões de Ação de Exportação (Regra de Poucas Palavras) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="btn"
                  style={{
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.8rem',
                    background: '#107c41',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(16, 124, 65, 0.2)'
                  }}
                  title="Exportar planilha Excel (.xlsx)"
                >
                  <FileSpreadsheet size={15} />
                  <span>Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="btn btn-primary"
                  style={{
                    padding: '0.45rem 0.95rem',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    borderRadius: '8px'
                  }}
                  title="Imprimir ou salvar PDF"
                >
                  <Printer size={15} />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>

            {/* BARRA DE FILTROS OBJETIVA */}
            <div style={{
              padding: '0.65rem 1.25rem',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isFilterBarExpanded ? '8px' : '0' }}>
                <div className="flex items-center gap-2">
                  <Filter size={14} color="#0284c7" />
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a' }}>
                    Filtros
                  </span>
                  {hasActiveFilters && (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      background: '#fef3c7',
                      color: '#b45309',
                      padding: '1px 5px',
                      borderRadius: '6px',
                      border: '1px solid #fde68a'
                    }}>
                      Ativos
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <RotateCcw size={11} />
                      <span>Limpar</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFilterBarExpanded(prev => !prev)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {isFilterBarExpanded ? 'Recolher' : 'Expandir'}
                  </button>
                </div>
              </div>

              {isFilterBarExpanded && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '6px',
                  alignItems: 'center'
                }}>
                  {/* Filtro: Unidade */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Unidade
                    </label>
                    <select
                      value={filters.unidade}
                      onChange={e => handleFilterChange('unidade', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        borderRadius: '5px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="todos">Todas</option>
                      {clinicasOptions.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro: Turno */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Turno
                    </label>
                    <select
                      value={filters.turno}
                      onChange={e => handleFilterChange('turno', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        borderRadius: '5px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="todos">Todos</option>
                      <option value="1º Turno">1º Turno</option>
                      <option value="2º Turno">2º Turno</option>
                      <option value="3º Turno">3º Turno</option>
                      <option value="4º Turno">4º Turno</option>
                    </select>
                  </div>

                  {/* Filtro: Escala */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Escala
                    </label>
                    <select
                      value={filters.diaSemana}
                      onChange={e => handleFilterChange('diaSemana', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        borderRadius: '5px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="todos">Todas</option>
                      <option value="Seg/Qua/Sex">Seg Qua Sex</option>
                      <option value="Ter/Qui/Sáb">Ter Qui Sáb</option>
                    </select>
                  </div>

                  {/* Filtro: Acesso */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Acesso
                    </label>
                    <select
                      value={filters.tipoAcesso}
                      onChange={e => handleFilterChange('tipoAcesso', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        borderRadius: '5px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="todos">Todos</option>
                      <option value="fav">FAV</option>
                      <option value="permcath">Permcath</option>
                      <option value="duplo lúmen">CDL Provisório</option>
                      <option value="prótese">Prótese</option>
                    </select>
                  </div>

                  {/* Filtro: Transplante */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Transplante
                    </label>
                    <select
                      value={filters.statusTransplante}
                      onChange={e => handleFilterChange('statusTransplante', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        borderRadius: '5px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="todos">Todos</option>
                      <option value="Ativo em Lista de Espera">Lista Ativa</option>
                      <option value="Encaminhado / Em Avaliação">Em Avaliação</option>
                      <option value="Encaminhar / Em Triagem">Triagem</option>
                      <option value="Doador Vivo em Investigação">Doador Vivo</option>
                      <option value="Contraindicação Provisória">Contraindicação Provisória</option>
                      <option value="Contraindicação Definitiva">Contraindicação Definitiva</option>
                      <option value="Já Transplantado">Transplantado</option>
                    </select>
                  </div>

                  {/* Filtro: Anticoagulação */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Anticoagulação
                    </label>
                    <select
                      value={filters.anticoagulacao}
                      onChange={e => handleFilterChange('anticoagulacao', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        borderRadius: '5px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="todos">Todas</option>
                      <option value="heparina_padrao">HNF Padrão</option>
                      <option value="enoxaparina">Enoxaparina</option>
                      <option value="sem_heparina">Sem Heparina</option>
                    </select>
                  </div>

                  {/* Filtro: Convênio */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Convênio
                    </label>
                    <select
                      value={filters.convenio}
                      onChange={e => handleFilterChange('convenio', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        borderRadius: '5px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="todos">Todos</option>
                      <option value="sus">SUS</option>
                      <option value="convenio">Saúde Suplementar</option>
                    </select>
                  </div>

                  {/* Filtro: Busca */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Busca
                    </label>
                    <input
                      type="text"
                      placeholder="Nome ou CPF..."
                      value={filters.busca}
                      onChange={e => handleFilterChange('busca', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '5px 7px',
                        borderRadius: '5px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Filtro Checkbox: Alertas */}
                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600', color: '#b91c1c' }}>
                      <input
                        type="checkbox"
                        checked={filters.comAlertaApenas}
                        onChange={e => handleFilterChange('comAlertaApenas', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>Alertas</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* INDICADORES KPIS (RESUMO EXECUTIVO) */}
            {kpis && kpis.length > 0 && (
              <div style={{
                padding: '0.6rem 1.25rem',
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(kpis.length, 4)}, 1fr)`,
                gap: '8px',
                background: '#ffffff',
                borderBottom: '1px solid #f1f5f9'
              }}>
                {kpis.map((kpi, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: 'rgba(239, 246, 255, 0.65)',
                      border: '1px solid #bfdbfe',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: '#1e40af', letterSpacing: '0.2px' }}>
                      {kpi.label}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e3a8a', marginTop: '1px' }}>
                      {kpi.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ÁREA DE VISUALIZAÇÃO: TABELA INTERATIVA OU PRÉVIA DE IMPRESSÃO */}
            <div style={{ flex: 1, overflowY: 'auto', background: viewMode === 'table' ? '#ffffff' : '#e2e8f0', padding: viewMode === 'table' ? '0' : '16px' }}>
              {viewMode === 'table' ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10, borderBottom: '2px solid #cbd5e1' }}>
                    <tr>
                      <th style={{ padding: '7px 10px', textAlign: 'center', width: '35px', color: '#64748b', fontWeight: '700' }}>#</th>
                      {currentReport.columns.map(col => (
                        <th
                          key={col.id}
                          style={{
                            padding: '7px 10px',
                            textAlign: 'left',
                            color: '#334155',
                            fontWeight: '700',
                            borderRight: '1px solid #f1f5f9'
                          }}
                        >
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={currentReport.columns.length + 1} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                          <Info size={28} color="#94a3b8" style={{ margin: '0 auto 6px auto' }} />
                          <p style={{ margin: 0, fontWeight: '600' }}>Nenhum dado encontrado para os filtros selecionados.</p>
                          <p style={{ margin: '3px 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
                            Ajuste os filtros de unidade, turno ou busca.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      rows.map((row, idx) => (
                        <tr
                          key={idx}
                          style={{
                            background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.1s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                          onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'}
                        >
                          <td style={{ padding: '7px 10px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>
                            {idx + 1}
                          </td>
                          {currentReport.columns.map(col => {
                            const val = row[col.id] ?? '-';
                            const isAlert = typeof val === 'string' && (val.includes('🚨') || val.includes('⚠️') || val.includes('Fora') || val.includes('Inadequado'));
                            const isSuccess = typeof val === 'string' && (val.includes('✓') || val.includes('Alvo') || val.includes('Adequado'));

                            return (
                              <td
                                key={col.id}
                                style={{
                                  padding: '7px 10px',
                                  color: isAlert ? '#b91c1c' : isSuccess ? '#15803d' : '#1e293b',
                                  fontWeight: isAlert ? '700' : isSuccess ? '600' : 'normal',
                                  borderRight: '1px solid #f8fafc'
                                }}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                /* MODO PRÉVIA DE IMPRESSÃO */
                <div 
                  id="printable-report-center-doc"
                  className="report-print-container report-a4-sheet"
                  style={{
                    maxWidth: '1100px',
                    margin: '0 auto',
                    background: '#ffffff',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    overflow: 'visible'
                  }}
                >
                  <ReportPrintDocument
                    report={currentReport}
                    rows={rows}
                    kpis={kpis}
                    filters={filters}
                    doctor={doctor}
                    selectedClinica={filters.unidade !== 'todos' ? filters.unidade : doctor.clinicaPrincipal}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
