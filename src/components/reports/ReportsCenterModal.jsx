import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Printer,
  Search,
  Filter,
  RotateCcw,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
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
import ReportPrintDocument from './ReportPrintDocument.jsx';
import { printElement } from '../../utils/printUtils.js';

export default function ReportsCenterModal({
  isOpen,
  onClose,
  patients = [],
  doctor = {},
  locaisList = []
}) {
  if (!isOpen) return null;

  // Estado do Relatório Ativo
  const [selectedReportId, setSelectedReportId] = useState('censo_geral');
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'print_preview'

  // Estados dos Filtros Clínicos / Operacionais
  const [filters, setFilters] = useState({
    unidade: 'todos',
    turno: 'todos',
    diaSemana: 'todos',
    tipoAcesso: 'todos',
    statusTransplante: 'todos',
    comAlertaApenas: false,
    busca: ''
  });

  const [isFilterBarExpanded, setIsFilterBarExpanded] = useState(true);

  // Lista única de Clínicas / Unidades extraídas dos locais cadastrados e dos pacientes
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
    if (Array.isArray(patients)) {
      patients.forEach(p => {
        if (p.clinica) setClinicas.add(p.clinica);
      });
    }
    return Array.from(setClinicas).filter(Boolean);
  }, [locaisList, doctor, patients]);

  // Encontra o relatório selecionado no catálogo
  const currentReport = useMemo(() => {
    return REPORTS_CATALOG.find(r => r.id === selectedReportId) || REPORTS_CATALOG[0];
  }, [selectedReportId]);

  // Filtra pacientes de acordo com os filtros globais aplicados
  const filteredPatients = useMemo(() => {
    return filterPatientsForReport(patients, filters);
  }, [patients, filters]);

  // Gera dados tabulares e KPIs para o relatório ativo
  const { rows, kpis } = useMemo(() => {
    return generateReportData(currentReport.id, filteredPatients);
  }, [currentReport.id, filteredPatients]);

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
    if (filters.comAlertaApenas) descParts.push('Apenas c/ Alertas');
    if (filters.busca) descParts.push(`Busca: "${filters.busca}"`);

    const filtersDesc = descParts.length > 0 ? descParts.join(' | ') : 'Todos os registros do serviço';

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
      case 'populacao': return <Users size={16} color="#0284c7" />;
      case 'acesso_dialise': return <Activity size={16} color="#0d9488" />;
      case 'laboratorio': return <FlaskConical size={16} color="#7c3aed" />;
      case 'farmacia_infeccao': return <Pill size={16} color="#e11d48" />;
      case 'qualidade_transplante': return <Award size={16} color="#d97706" />;
      default: return <FileText size={16} color="#64748b" />;
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
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35)',
          border: '1px solid #cbd5e1'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ================= MODAL HEADER ================= */}
        <div style={{
          padding: '1.1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, #f8fafc, #f1f5f9)'
        }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}>
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                  Central de Relatórios Clínicos
                </h2>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  background: '#e0f2fe',
                  color: '#0369a1',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  20 Relatórios Especializados
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.80rem', color: '#64748b' }}>
                Metas KDIGO/SBN, vigilância dialítica e transplante.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Alternador de visualização rápida */}
            <div style={{
              display: 'flex',
              background: '#e2e8f0',
              padding: '3px',
              borderRadius: '10px',
              gap: '2px'
            }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'table' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <SlidersHorizontal size={14} />
                <span>Modo Tabela</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('print_preview')}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'print_preview' ? '#ffffff' : 'transparent',
                  color: viewMode === 'print_preview' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'print_preview' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Eye size={14} />
                <span>Prévia Impressa</span>
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
          {/* ---------------- BARRA LATERAL (CATÁLOGO DOS 20 RELATÓRIOS) ---------------- */}
          <div style={{
            width: '320px',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            background: '#fafafa',
            flexShrink: 0
          }}>
            {/* Campo de Busca Rápida de Relatórios */}
            <div style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Buscar relatório..."
                  value={reportSearchQuery}
                  onChange={e => setReportSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 32px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.8rem',
                    background: '#ffffff',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Filtro por Categoria */}
              <div style={{ display: 'flex', gap: '4px', marginTop: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('todos')}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedCategory === 'todos' ? '#0f172a' : '#e2e8f0',
                    color: selectedCategory === 'todos' ? '#ffffff' : '#475569',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Todos (20)
                </button>
                {REPORT_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      background: selectedCategory === cat.id ? '#0284c7' : '#e2e8f0',
                      color: selectedCategory === cat.id ? '#ffffff' : '#475569',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista dos Relatórios Rolável */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {REPORT_CATEGORIES.map(cat => {
                const catReports = sidebarReports.filter(r => r.category === cat.id);
                if (catReports.length === 0) return null;

                return (
                  <div key={cat.id} style={{ marginBottom: '12px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      color: cat.color,
                      letterSpacing: '0.4px'
                    }}>
                      {getCategoryIcon(cat.id)}
                      <span>{cat.name}</span>
                      <span style={{
                        marginLeft: 'auto',
                        background: '#f1f5f9',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontSize: '0.65rem',
                        color: '#64748b'
                      }}>
                        {catReports.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                      {catReports.map(rep => {
                        const isSelected = rep.id === selectedReportId;
                        return (
                          <button
                            key={rep.id}
                            type="button"
                            onClick={() => setSelectedReportId(rep.id)}
                            style={{
                              textAlign: 'left',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: isSelected ? '1px solid #bae6fd' : '1px solid transparent',
                              background: isSelected ? '#e0f2fe' : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px'
                            }}
                          >
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{
                                fontSize: '0.8rem',
                                fontWeight: isSelected ? '700' : '500',
                                color: isSelected ? '#0369a1' : '#1e293b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {rep.title}
                              </div>
                              <div style={{
                                fontSize: '0.68rem',
                                color: isSelected ? '#0284c7' : '#64748b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {rep.columns.length} colunas • {rep.description.slice(0, 38)}...
                              </div>
                            </div>
                            {isSelected && <ChevronRight size={14} color="#0369a1" />}
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
            {/* Topo do Relatório: Título e Botões de Exportação */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              background: '#ffffff'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: '#f1f5f9',
                    color: '#475569'
                  }}>
                    {REPORT_CATEGORIES.find(c => c.id === currentReport.category)?.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>•</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                    {rows.length} {rows.length === 1 ? 'registro encontrado' : 'registros encontrados'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: '4px 0 2px 0' }}>
                  {currentReport.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  {currentReport.description}
                </p>
              </div>

              {/* Botões de Ação de Exportação */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="btn"
                  style={{
                    padding: '0.55rem 1rem',
                    fontSize: '0.84rem',
                    background: '#107c41',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(16, 124, 65, 0.2)'
                  }}
                  title="Exportar planilha Excel estruturada com colunas e cabeçalhos oficiais (.xlsx)"
                >
                  <FileSpreadsheet size={16} />
                  <span>Exportar XLS (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="btn btn-primary"
                  style={{
                    padding: '0.55rem 1.1rem',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '10px'
                  }}
                  title="Gerar visualização em folha timbrada para imprimir ou salvar como PDF"
                >
                  <Printer size={16} />
                  <span>Imprimir Relatório</span>
                </button>
              </div>
            </div>

            {/* BARRA DE FILTROS CLÍNICOS E OPERACIONAIS */}
            <div style={{
              padding: '0.75rem 1.5rem',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isFilterBarExpanded ? '10px' : '0' }}>
                <div className="flex items-center gap-2">
                  <Filter size={15} color="#0284c7" />
                  <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>
                    Filtros Clínicos
                  </span>
                  {hasActiveFilters && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      background: '#fef3c7',
                      color: '#b45309',
                      padding: '1px 6px',
                      borderRadius: '8px',
                      border: '1px solid #fde68a'
                    }}>
                      Filtros Ativos
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
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RotateCcw size={12} />
                      <span>Limpar Filtros</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsFilterBarExpanded(prev => !prev)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.75rem',
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                  gap: '8px',
                  alignItems: 'center'
                }}>
                  {/* Filtro: Unidade / Clínica */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Unidade / Clínica
                    </label>
                    <select
                      value={filters.unidade}
                      onChange={e => handleFilterChange('unidade', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="todos">Todas as Unidades</option>
                      {clinicasOptions.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro: Turno */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Turno de Diálise
                    </label>
                    <select
                      value={filters.turno}
                      onChange={e => handleFilterChange('turno', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="todos">Todos os Turnos</option>
                      <option value="1º Turno">1º Turno</option>
                      <option value="2º Turno">2º Turno</option>
                      <option value="3º Turno">3º Turno</option>
                      <option value="4º Turno">4º Turno</option>
                    </select>
                  </div>

                  {/* Filtro: Escala Semanal */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Escala Semanal
                    </label>
                    <select
                      value={filters.diaSemana}
                      onChange={e => handleFilterChange('diaSemana', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="todos">Todas as Escalas</option>
                      <option value="Seg/Qua/Sex">Seg / Qua / Sex</option>
                      <option value="Ter/Qui/Sáb">Ter / Qui / Sáb</option>
                    </select>
                  </div>

                  {/* Filtro: Tipo de Acesso */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Acesso Vascular
                    </label>
                    <select
                      value={filters.tipoAcesso}
                      onChange={e => handleFilterChange('tipoAcesso', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="todos">Todos os Acessos</option>
                      <option value="fav">FAV (Fístula Arteriovenosa)</option>
                      <option value="permcath">Permcath (Longa Permanência)</option>
                      <option value="duplo lúmen">CDL (Duplo Lúmen)</option>
                      <option value="prótese">Prótese Vascular</option>
                    </select>
                  </div>

                  {/* Filtro: Status Transplante */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Transplante Renal
                    </label>
                    <select
                      value={filters.statusTransplante}
                      onChange={e => handleFilterChange('statusTransplante', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="todos">Todos os Status</option>
                      <option value="Ativo em Lista de Espera">Ativo em Lista de Espera</option>
                      <option value="Encaminhado / Em Avaliação">Em Avaliação Pré-Tx</option>
                      <option value="Encaminhar / Em Triagem">Em Triagem</option>
                      <option value="Doador Vivo em Investigação">Doador Vivo</option>
                      <option value="Contraindicado Clínico">Contraindicado Clínico</option>
                      <option value="Já Transplantado">Já Transplantado</option>
                    </select>
                  </div>

                  {/* Filtro: Busca Livre */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '600', color: '#475569', marginBottom: '2px' }}>
                      Busca Rápida
                    </label>
                    <input
                      type="text"
                      placeholder="Nome ou CPF..."
                      value={filters.busca}
                      onChange={e => handleFilterChange('busca', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.75rem',
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Filtro Checkbox: Apenas c/ Alertas */}
                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', color: '#b91c1c' }}>
                      <input
                        type="checkbox"
                        checked={filters.comAlertaApenas}
                        onChange={e => handleFilterChange('comAlertaApenas', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>Apenas c/ Alertas Críticos</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* INDICADORES EXECUTIVOS / KPIS */}
            {kpis && kpis.length > 0 && (
              <div style={{
                padding: '0.75rem 1.5rem',
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(kpis.length, 4)}, 1fr)`,
                gap: '12px',
                background: '#ffffff',
                borderBottom: '1px solid #f1f5f9'
              }}>
                {kpis.map((kpi, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: 'rgba(239, 246, 255, 0.65)',
                      border: '1px solid #bfdbfe',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '0.68rem', fontWeight: '700', textTransform: 'uppercase', color: '#1e40af', letterSpacing: '0.3px' }}>
                      {kpi.label}
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e3a8a', marginTop: '2px' }}>
                      {kpi.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ÁREA DE VISUALIZAÇÃO: TABELA INTERATIVA OU PRÉVIA DE IMPRESSÃO */}
            <div style={{ flex: 1, overflowY: 'auto', background: viewMode === 'table' ? '#ffffff' : '#e2e8f0', padding: viewMode === 'table' ? '0' : '20px' }}>
              {viewMode === 'table' ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10, borderBottom: '2px solid #cbd5e1' }}>
                    <tr>
                      <th style={{ padding: '8px 12px', textAlign: 'center', width: '40px', color: '#64748b', fontWeight: '700' }}>#</th>
                      {currentReport.columns.map(col => (
                        <th
                          key={col.id}
                          style={{
                            padding: '8px 12px',
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
                          <Info size={32} color="#94a3b8" style={{ margin: '0 auto 8px auto' }} />
                          <p style={{ margin: 0, fontWeight: '600' }}>Nenhum paciente ou dado encontrado para os filtros selecionados.</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                            Tente ajustar ou limpar os filtros de unidade, turno ou status.
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
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                          onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'}
                        >
                          <td style={{ padding: '8px 12px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>
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
                                  padding: '8px 12px',
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
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
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
