import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Table, 
  TrendingUp, 
  LayoutGrid, 
  CheckSquare, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Sparkles,
  Activity,
  Droplet
} from 'lucide-react';
import { evaluateExam, parseExamNumber } from '../../utils/examRanges.js';

/**
 * Metadados dos biomarcadores para gráficos e matriz de metas
 */
const BIOMARKERS_CONFIG = [
  { key: 'hb', label: 'Hemoglobina', shortLabel: 'Hb', unit: 'g/dL', targetMin: 10.0, targetMax: 12.0, targetText: '10.0 a 12.0 g/dL' },
  { key: 'pth', label: 'PTH Intacto', shortLabel: 'PTH', unit: 'pg/mL', targetMin: 150, targetMax: 600, targetText: '150 a 600 pg/mL' },
  { key: 'fosforo', label: 'Fósforo', shortLabel: 'Fósforo', unit: 'mg/dL', targetMin: 3.5, targetMax: 5.5, targetText: '3.5 a 5.5 mg/dL' },
  { key: 'k', label: 'Potássio', shortLabel: 'Potássio', unit: 'mEq/L', targetMin: 3.5, targetMax: 5.5, targetText: '3.5 a 5.5 mEq/L' },
  { key: 'ktv', label: 'Kt/V Daugirdas', shortLabel: 'Kt/V', unit: '', targetMin: 1.20, targetMax: 2.20, targetText: '≥ 1.20' },
  { key: 'ferritina', label: 'Ferritina', shortLabel: 'Ferritina', unit: 'ng/mL', targetMin: 200, targetMax: 800, targetText: '200 a 800 ng/mL' },
  { key: 'ist', label: 'IST', shortLabel: 'IST', unit: '%', targetMin: 20, targetMax: 50, targetText: '20% a 50%' },
  { key: 'ca', label: 'Cálcio Total', shortLabel: 'Cálcio', unit: 'mg/dL', targetMin: 8.5, targetMax: 10.2, targetText: '8.5 a 10.2 mg/dL' },
  { key: 'albumina', label: 'Albumina', shortLabel: 'Albumina', unit: 'g/dL', targetMin: 3.8, targetMax: 5.0, targetText: '≥ 3.8 g/dL' },
  { key: 'glicemia', label: 'Glicemia', shortLabel: 'Glicemia', unit: 'mg/dL', targetMin: 70, targetMax: 130, targetText: '70 a 130 mg/dL' },
  { key: 'tgp', label: 'TGP (ALT)', shortLabel: 'TGP', unit: 'U/L', targetMin: 0, targetMax: 45, targetText: '< 45 U/L' }
];

/**
 * Componente de Badge Clínico Compacto
 */
function ExamBadge({ examKey, value, suffix = '', title = '' }) {
  if (value === null || value === undefined || value === '' || value === '-') {
    return <span style={{ color: '#94a3b8' }}>-</span>;
  }
  const evalResult = evaluateExam(examKey, value);
  const formattedText = `${value}${suffix}`;

  if (evalResult.status === 'neutro') {
    return <span style={{ color: '#475569' }}>{formattedText}</span>;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2px 6px',
        borderRadius: '6px',
        fontSize: '0.80rem',
        fontWeight: 'bold',
        background: evalResult.bg,
        border: `1px solid ${evalResult.border}`,
        color: evalResult.color,
        lineHeight: '1.2',
        whiteSpace: 'nowrap'
      }}
      title={title || `${evalResult.label}: ${formattedText}`}
    >
      {formattedText}
    </span>
  );
}

/**
 * Formata data de exame para exibição limpa
 */
function formatExamDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
  } catch (_) {
    return dateStr;
  }
}

export default function ExamHistorySection({
  historicoExames = [],
  sortedHistoricoExames = [],
  onEditExam,
  onDeleteExam
}) {
  // Estado da visualização ativa: 'tabela' é o padrão garantido
  const [viewMode, setViewMode] = useState('tabela');
  // Parâmetro selecionado na aba de Tendência
  const [selectedBioKey, setSelectedBioKey] = useState('hb');

  // Coletas cronológicas em ordem temporal crescente (antiga -> mais recente) para gráficos
  const chronologicalExamsAsc = useMemo(() => {
    return [...sortedHistoricoExames].reverse();
  }, [sortedHistoricoExames]);

  // Configuração ativa para gráfico
  const currentBio = BIOMARKERS_CONFIG.find(b => b.key === selectedBioKey) || BIOMARKERS_CONFIG[0];

  // Dados filtrados do biomarcador ativo com valores válidos
  const chartPoints = useMemo(() => {
    return chronologicalExamsAsc
      .map(item => {
        const rawVal = item[currentBio.key];
        const numVal = parseExamNumber(rawVal);
        return {
          dateStr: item.dataExame,
          formattedDate: formatExamDate(item.dataExame),
          rawVal,
          numVal,
          evalResult: rawVal !== null && rawVal !== undefined ? evaluateExam(currentBio.key, rawVal) : null,
          originalIndex: item._originalIndex
        };
      })
      .filter(p => p.numVal !== null);
  }, [chronologicalExamsAsc, currentBio]);

  // Estatísticas do biomarcador ativo
  const bioStats = useMemo(() => {
    if (chartPoints.length === 0) return null;
    const values = chartPoints.map(p => p.numVal);
    const latest = chartPoints[chartPoints.length - 1];
    const previous = chartPoints.length > 1 ? chartPoints[chartPoints.length - 2] : null;
    const first = chartPoints[0];
    const delta = previous ? Number((latest.numVal - previous.numVal).toFixed(2)) : 0;
    const deltaTotal = Number((latest.numVal - first.numVal).toFixed(2));
    const average = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    return {
      latest,
      previous,
      delta,
      deltaTotal,
      average,
      minVal,
      maxVal,
      count: chartPoints.length
    };
  }, [chartPoints]);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px', background: 'var(--surface-solid)' }}>
      {/* CABEÇALHO COM SEGMENTED PILL CONTROL E LEGENDA */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Calendar size={18} color="var(--primary)" />
          <h3 className="font-bold text-sm text-slate-800" style={{ margin: 0 }}>
            Histórico Cronológico de Coletas ({historicoExames.length})
          </h3>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Segmented Pill Control (1 palavra por botão) */}
          <div 
            style={{ 
              display: 'inline-flex', 
              background: '#f1f5f9', 
              padding: '3px', 
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('tabela')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: viewMode === 'tabela' ? '700' : '500',
                background: viewMode === 'tabela' ? '#ffffff' : 'transparent',
                color: viewMode === 'tabela' ? '#2563eb' : '#64748b',
                boxShadow: viewMode === 'tabela' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Visualização tabular compacta com ordenação decrescente (Padrão)"
            >
              <Table size={13} />
              <span>Tabela</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('tendencia')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: viewMode === 'tendencia' ? '700' : '500',
                background: viewMode === 'tendencia' ? '#ffffff' : 'transparent',
                color: viewMode === 'tendencia' ? '#2563eb' : '#64748b',
                boxShadow: viewMode === 'tendencia' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Curvas gráficas temporais e metas KDQI"
            >
              <TrendingUp size={13} />
              <span>Tendência</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: viewMode === 'cards' ? '700' : '500',
                background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                color: viewMode === 'cards' ? '#2563eb' : '#64748b',
                boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Linha do tempo em blocos cronológicos com metas e alertas"
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('metas')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: viewMode === 'metas' ? '700' : '500',
                background: viewMode === 'metas' ? '#ffffff' : 'transparent',
                color: viewMode === 'metas' ? '#2563eb' : '#64748b',
                boxShadow: viewMode === 'metas' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Matriz comparativa de biomarcadores com indicador de variação Delta"
            >
              <CheckSquare size={13} />
              <span>Metas</span>
            </button>
          </div>

          {/* Legenda de Metas */}
          <div className="flex items-center gap-1.5" style={{ fontSize: '0.70rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
              🟢 Na Meta
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
              🟡 Atenção
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
              🔴 Crítico
            </span>
          </div>
        </div>
      </div>

      {historicoExames.length === 0 ? (
        <div className="text-center py-8 text-muted text-xs">
          Nenhum exame histórico detalhado registrado para este paciente.
        </div>
      ) : (
        <>
          {/* ============================================================== */}
          {/* 1. VISUALIZAÇÃO PADRÃO: TABELA COMPACTA (O MAIS NOVO NO TOPO)  */}
          {/* ============================================================== */}
          {viewMode === 'tabela' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>Data</th>
                    <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>Hb</th>
                    <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>IST/Ferritina</th>
                    <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>PTH</th>
                    <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>P Ca</th>
                    <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>Potássio</th>
                    <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>Kt/V</th>
                    <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>Albumina</th>
                    <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>Glic TGP</th>
                    <th style={{ padding: '0.65rem 0.8rem', textAlign: 'right', color: '#475569' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistoricoExames.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.65rem 0.8rem', fontWeight: 'bold', color: '#1e293b', whiteSpace: 'nowrap' }}>
                        {formatExamDate(item.dataExame)}
                      </td>
                      <td style={{ padding: '0.65rem 0.8rem' }}>
                        <ExamBadge examKey="hb" value={item.hb} />
                      </td>
                      <td style={{ padding: '0.65rem 0.8rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ExamBadge examKey="ist" value={item.ist} suffix="%" />
                          <span style={{ color: '#cbd5e1' }}>/</span>
                          <ExamBadge examKey="ferritina" value={item.ferritina} />
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 0.8rem' }}>
                        <ExamBadge examKey="pth" value={item.pth} />
                      </td>
                      <td style={{ padding: '0.65rem 0.8rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ExamBadge examKey="fosforo" value={item.fosforo} />
                          <span style={{ color: '#cbd5e1' }}>/</span>
                          <ExamBadge examKey="ca" value={item.ca} />
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 0.8rem' }}>
                        <ExamBadge examKey="k" value={item.k} />
                      </td>
                      <td style={{ padding: '0.65rem 0.8rem' }}>
                        <ExamBadge examKey="ktv" value={item.ktv} />
                      </td>
                      <td style={{ padding: '0.65rem 0.8rem' }}>
                        <ExamBadge examKey="albumina" value={item.albumina} suffix=" g/dL" />
                      </td>
                      <td style={{ padding: '0.65rem 0.8rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ExamBadge examKey="glicemia" value={item.glicemia} />
                          <span style={{ color: '#cbd5e1' }}>/</span>
                          <ExamBadge examKey="tgp" value={item.tgp} suffix=" U/L" />
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 0.8rem', textAlign: 'right' }}>
                        <div className="flex justify-end gap-1">
                          <button 
                            className="btn btn-outline" 
                            onClick={() => onEditExam(item, item._originalIndex)}
                            style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem' }}
                            title="Editar este exame"
                          >
                            <Edit size={12} color="var(--primary)" />
                          </button>
                          <button 
                            className="btn btn-outline" 
                            onClick={() => onDeleteExam(item._originalIndex)}
                            style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem' }}
                            title="Excluir este exame"
                          >
                            <Trash2 size={12} color="var(--danger)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. VISUALIZAÇÃO: TENDÊNCIA (GRÁFICO VETORIAL & METAS KDOQI)    */}
          {/* ============================================================== */}
          {viewMode === 'tendencia' && (
            <div className="flex flex-col gap-4">
              {/* Seletor de Biomarcador em Chips de 1 palavra */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {BIOMARKERS_CONFIG.map(b => {
                  const isSelected = b.key === selectedBioKey;
                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => setSelectedBioKey(b.key)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: isSelected ? '700' : '500',
                        background: isSelected ? '#eff6ff' : '#f8fafc',
                        color: isSelected ? '#1d4ed8' : '#475569',
                        border: `1px solid ${isSelected ? '#bfdbfe' : '#e2e8f0'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {b.shortLabel}
                    </button>
                  );
                })}
              </div>

              {chartPoints.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted bg-slate-50 rounded-xl border border-slate-200">
                  Nenhum registro com valor para {currentBio.label} nas coletas deste paciente.
                </div>
              ) : (
                <div>
                  {/* Cartão de Métricas Resumo do Parâmetro */}
                  <div 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                      gap: '0.75rem',
                      marginBottom: '1rem'
                    }}
                  >
                    <div className="p-3 rounded-xl border bg-white flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <span className="text-2xs text-muted block">Último Resultado</span>
                        <strong className="text-sm block" style={{ color: bioStats?.latest?.evalResult?.color || '#0f172a' }}>
                          {bioStats?.latest?.rawVal} {currentBio.unit}
                        </strong>
                      </div>
                      <span 
                        style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: 'bold', 
                          padding: '2px 6px', 
                          borderRadius: '6px',
                          background: bioStats?.latest?.evalResult?.bg || '#f1f5f9',
                          color: bioStats?.latest?.evalResult?.color || '#475569'
                        }}
                      >
                        {bioStats?.latest?.evalResult?.label || 'Na Meta'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border bg-white flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <span className="text-2xs text-muted block">Variação (Delta)</span>
                        <div className="flex items-center gap-1">
                          {bioStats?.delta > 0 ? (
                            <ArrowUpRight size={14} color={bioStats.latest.evalResult?.status === 'bom' ? '#16a34a' : '#ea580c'} />
                          ) : bioStats?.delta < 0 ? (
                            <ArrowDownRight size={14} color="#2563eb" />
                          ) : (
                            <Minus size={14} color="#64748b" />
                          )}
                          <strong className="text-sm" style={{ color: '#0f172a' }}>
                            {bioStats?.delta > 0 ? `+${bioStats.delta}` : bioStats?.delta} {currentBio.unit}
                          </strong>
                        </div>
                      </div>
                      <span className="text-2xs text-muted">vs. coleta anterior</span>
                    </div>

                    <div className="p-3 rounded-xl border bg-white flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <span className="text-2xs text-muted block">Média no Período</span>
                        <strong className="text-sm text-slate-800">
                          {bioStats?.average} {currentBio.unit}
                        </strong>
                      </div>
                      <span className="text-2xs text-muted">{bioStats?.count} coletas</span>
                    </div>

                    <div className="p-3 rounded-xl border bg-emerald-50/40 border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-2xs text-emerald-800 font-semibold block">Alvo KDOQI / SBN</span>
                        <strong className="text-sm text-emerald-900">
                          {currentBio.targetText}
                        </strong>
                      </div>
                      <Sparkles size={16} color="#059669" />
                    </div>
                  </div>

                  {/* Gráfico Vetorial SVG com Faixa de Meta */}
                  <div className="p-4 rounded-xl border bg-white" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-700">
                        Evolução Temporal: {currentBio.label} ({chartPoints.length} medições)
                      </span>
                      <span className="text-2xs text-muted">Ordem cronológica (mais antiga → mais recente)</span>
                    </div>

                    <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                      {(() => {
                        const width = 640;
                        const height = 180;
                        const paddingX = 40;
                        const paddingTop = 25;
                        const paddingBottom = 30;

                        // Determina escala vertical
                        const allVals = chartPoints.map(p => p.numVal);
                        const min = Math.min(...allVals, currentBio.targetMin !== undefined ? currentBio.targetMin : 0);
                        const max = Math.max(...allVals, currentBio.targetMax !== undefined ? currentBio.targetMax : 10);
                        const margin = (max - min) * 0.15 || 1;
                        const scaleMin = Math.max(0, min - margin);
                        const scaleMax = max + margin;

                        const getY = (val) => {
                          const ratio = (val - scaleMin) / (scaleMax - scaleMin || 1);
                          return height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
                        };

                        const getX = (idx) => {
                          if (chartPoints.length <= 1) return width / 2;
                          return paddingX + (idx / (chartPoints.length - 1)) * (width - 2 * paddingX);
                        };

                        const pointsStr = chartPoints.map((p, idx) => `${getX(idx)},${getY(p.numVal)}`).join(' ');

                        // Faixa de meta retangular
                        const hasTargetBand = currentBio.targetMin !== undefined && currentBio.targetMax !== undefined;
                        const targetYTop = hasTargetBand ? getY(currentBio.targetMax) : 0;
                        const targetYBottom = hasTargetBand ? getY(currentBio.targetMin) : 0;
                        const targetBandHeight = Math.max(2, targetYBottom - targetYTop);

                        return (
                          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            <defs>
                              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>

                            {/* Faixa de Meta Terapêutica (Verde Suave) */}
                            {hasTargetBand && (
                              <g>
                                <rect
                                  x={paddingX}
                                  y={targetYTop}
                                  width={width - 2 * paddingX}
                                  height={targetBandHeight}
                                  fill="#dcfce7"
                                  opacity="0.55"
                                  rx="4"
                                />
                                <text
                                  x={width - paddingX - 6}
                                  y={targetYTop + 11}
                                  fill="#15803d"
                                  fontSize="9"
                                  fontWeight="600"
                                  textAnchor="end"
                                >
                                  Meta KDQI: {currentBio.targetText}
                                </text>
                              </g>
                            )}

                            {/* Linhas de Grade Horizontais */}
                            <line x1={paddingX} y1={paddingTop} x2={width - paddingX} y2={paddingTop} stroke="#f1f5f9" strokeDasharray="3 3" />
                            <line x1={paddingX} y1={height - paddingBottom} x2={width - paddingX} y2={height - paddingBottom} stroke="#cbd5e1" strokeWidth="1" />

                            {/* Curva e Preenchimento com Gradiente */}
                            {chartPoints.length > 1 && (
                              <>
                                <polygon
                                  points={`${getX(0)},${height - paddingBottom} ${pointsStr} ${getX(chartPoints.length - 1)},${height - paddingBottom}`}
                                  fill="url(#chartGradient)"
                                />
                                <polyline
                                  fill="none"
                                  stroke="#2563eb"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  points={pointsStr}
                                />
                              </>
                            )}

                            {/* Marcadores de Dados (Círculos Coloridos com Rótulos) */}
                            {chartPoints.map((p, idx) => {
                              const cx = getX(idx);
                              const cy = getY(p.numVal);
                              const dotColor = p.evalResult?.color || '#2563eb';
                              const dotBg = p.evalResult?.bg || '#eff6ff';

                              return (
                                <g key={idx}>
                                  <circle cx={cx} cy={cy} r="6" fill={dotBg} stroke={dotColor} strokeWidth="2.5" />
                                  <circle cx={cx} cy={cy} r="2.5" fill={dotColor} />

                                  {/* Rótulo do Valor Acima */}
                                  <text
                                    x={cx}
                                    y={cy - 9}
                                    fill={dotColor}
                                    fontSize="10"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                  >
                                    {p.rawVal}
                                  </text>

                                  {/* Rótulo da Data Abaixo */}
                                  <text
                                    x={cx}
                                    y={height - paddingBottom + 16}
                                    fill="#64748b"
                                    fontSize="9"
                                    textAnchor="middle"
                                  >
                                    {p.formattedDate}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. VISUALIZAÇÃO: CARDS (LINHA DO TEMPO EM BLOCOS COMPLETOS)    */}
          {/* ============================================================== */}
          {viewMode === 'cards' && (
            <div className="flex flex-col gap-3">
              {sortedHistoricoExames.map((item, idx) => {
                const isLatest = idx === 0;

                // Calcula metas batidas na coleta
                const evaluatedList = [
                  evaluateExam('hb', item.hb),
                  evaluateExam('ist', item.ist),
                  evaluateExam('ferritina', item.ferritina),
                  evaluateExam('pth', item.pth),
                  evaluateExam('fosforo', item.fosforo),
                  evaluateExam('ca', item.ca),
                  evaluateExam('k', item.k),
                  evaluateExam('ktv', item.ktv),
                  evaluateExam('albumina', item.albumina)
                ].filter(e => e.status !== 'neutro');

                const totalValidos = evaluatedList.length;
                const naMetaCount = evaluatedList.filter(e => e.status === 'bom').length;
                const criticosCount = evaluatedList.filter(e => e.status === 'ruim').length;
                const taxaSucesso = totalValidos > 0 ? Math.round((naMetaCount / totalValidos) * 100) : 100;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border transition-all"
                    style={{
                      background: isLatest ? 'linear-gradient(to bottom, #f8fafc, #ffffff)' : '#ffffff',
                      borderColor: isLatest ? '#93c5fd' : '#e2e8f0',
                      boxShadow: isLatest ? '0 4px 12px rgba(37, 99, 235, 0.06)' : 'none'
                    }}
                  >
                    {/* Cabeçalho do Card */}
                    <div className="flex justify-between items-center mb-3 pb-2 border-b flex-wrap gap-2" style={{ borderColor: '#f1f5f9' }}>
                      <div className="flex items-center gap-2">
                        <span 
                          style={{ 
                            fontSize: '0.70rem', 
                            background: isLatest ? '#dbeafe' : '#f1f5f9', 
                            color: isLatest ? '#1e40af' : '#475569', 
                            padding: '2px 8px', 
                            borderRadius: '8px', 
                            fontWeight: 'bold' 
                          }}
                        >
                          {isLatest ? 'Coleta Mais Recente' : `Coleta ${sortedHistoricoExames.length - idx}`}
                        </span>
                        <strong className="text-sm text-slate-800">
                          {formatExamDate(item.dataExame)}
                        </strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {totalValidos > 0 && (
                          <span 
                            style={{ 
                              fontSize: '0.70rem', 
                              background: taxaSucesso >= 75 ? '#dcfce7' : taxaSucesso >= 50 ? '#fef3c7' : '#fee2e2',
                              color: taxaSucesso >= 75 ? '#15803d' : taxaSucesso >= 50 ? '#b45309' : '#b91c1c',
                              padding: '2px 8px', 
                              borderRadius: '8px', 
                              fontWeight: 'bold' 
                            }}
                          >
                            🌟 {naMetaCount}/{totalValidos} Metas ({taxaSucesso}%)
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          <button 
                            type="button"
                            className="btn btn-outline" 
                            onClick={() => onEditExam(item, item._originalIndex)}
                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                            title="Editar coleta"
                          >
                            <Edit size={12} color="var(--primary)" />
                          </button>
                          <button 
                            type="button"
                            className="btn btn-outline" 
                            onClick={() => onDeleteExam(item._originalIndex)}
                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                            title="Excluir coleta"
                          >
                            <Trash2 size={12} color="var(--danger)" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Blocos de Biomarcadores */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                      {/* Bloco 1: Anemia & Ferro */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-xs">
                        <span className="font-bold text-2xs uppercase tracking-wider text-rose-800 flex items-center gap-1">
                          <Droplet size={11} /> Anemia e Ferro
                        </span>
                        <div className="flex justify-between items-center">
                          <span className="text-muted">Hemoglobina:</span>
                          <ExamBadge examKey="hb" value={item.hb} suffix=" g/dL" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted">IST (%):</span>
                          <ExamBadge examKey="ist" value={item.ist} suffix="%" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted">Ferritina:</span>
                          <ExamBadge examKey="ferritina" value={item.ferritina} suffix=" ng/mL" />
                        </div>
                      </div>

                      {/* Bloco 2: Distúrbio Mineral Ósseo */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-xs">
                        <span className="font-bold text-2xs uppercase tracking-wider text-amber-800 flex items-center gap-1">
                          <Activity size={11} /> Metabolismo Ósseo
                        </span>
                        <div className="flex justify-between items-center">
                          <span className="text-muted">PTH Intacto:</span>
                          <ExamBadge examKey="pth" value={item.pth} suffix=" pg/mL" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted">Fósforo:</span>
                          <ExamBadge examKey="fosforo" value={item.fosforo} suffix=" mg/dL" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted">Cálcio Total:</span>
                          <ExamBadge examKey="ca" value={item.ca} suffix=" mg/dL" />
                        </div>
                      </div>

                      {/* Bloco 3: Diálise & Nutrição */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex flex-col gap-1.5 text-xs">
                        <span className="font-bold text-2xs uppercase tracking-wider text-blue-800 flex items-center gap-1">
                          <CheckCircle2 size={11} /> Diálise e Nutrição
                        </span>
                        <div className="flex justify-between items-center">
                          <span className="text-muted">Kt/V:</span>
                          <ExamBadge examKey="ktv" value={item.ktv} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted">Potássio:</span>
                          <ExamBadge examKey="k" value={item.k} suffix=" mEq/L" />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted">Albumina:</span>
                          <ExamBadge examKey="albumina" value={item.albumina} suffix=" g/dL" />
                        </div>
                      </div>
                    </div>

                    {/* Alerta Clínico se houver itens críticos */}
                    {criticosCount > 0 && (
                      <div className="flex items-center gap-1.5 mt-2.5 p-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-2xs font-semibold">
                        <AlertCircle size={13} color="#dc2626" />
                        <span>Atenção Clínica: {criticosCount} parâmetro(s) crítico(s) nesta coleta exigem reavaliação terapêutica.</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. VISUALIZAÇÃO: METAS (MATRIZ COMPARATIVA COM INDICADOR DELTA) */}
          {/* ============================================================== */}
          {viewMode === 'metas' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.80rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.65rem 0.8rem', color: '#0f172a', fontWeight: 'bold', minWidth: '130px' }}>
                      Biomarcador
                    </th>
                    <th style={{ padding: '0.65rem 0.8rem', color: '#475569', minWidth: '110px' }}>
                      Meta KDOQI
                    </th>
                    {sortedHistoricoExames.map((item, colIdx) => (
                      <th key={colIdx} style={{ padding: '0.65rem 0.8rem', color: '#0f172a', textAlign: 'center', minWidth: '110px' }}>
                        <div>{formatExamDate(item.dataExame)}</div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 'normal', color: colIdx === 0 ? '#2563eb' : '#64748b' }}>
                          {colIdx === 0 ? 'Mais Recente' : `Anterior`}
                        </span>
                      </th>
                    ))}
                    <th style={{ padding: '0.65rem 0.8rem', color: '#475569', textAlign: 'center', minWidth: '90px' }}>
                      Evolução
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {BIOMARKERS_CONFIG.map((bio) => {
                    // Valores em ordem cronológica (sortedHistoricoExames está mais novo -> mais antigo)
                    const vals = sortedHistoricoExames.map(item => item[bio.key]);
                    const hasAnyVal = vals.some(v => v !== null && v !== undefined && v !== '');
                    if (!hasAnyVal) return null;

                    const latestVal = parseExamNumber(vals[0]);
                    const prevVal = vals.length > 1 ? parseExamNumber(vals[1]) : null;
                    const delta = (latestVal !== null && prevVal !== null) ? Number((latestVal - prevVal).toFixed(2)) : null;

                    return (
                      <tr key={bio.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.65rem 0.8rem', fontWeight: '600', color: '#1e293b' }}>
                          {bio.label} {bio.unit && <span className="text-2xs text-muted font-normal">({bio.unit})</span>}
                        </td>
                        <td style={{ padding: '0.65rem 0.8rem', color: '#059669', fontWeight: '600', fontSize: '0.75rem' }}>
                          {bio.targetText}
                        </td>

                        {sortedHistoricoExames.map((item, colIdx) => {
                          const val = item[bio.key];
                          const nextVal = sortedHistoricoExames[colIdx + 1] ? sortedHistoricoExames[colIdx + 1][bio.key] : null;
                          const currentNum = parseExamNumber(val);
                          const nextNum = parseExamNumber(nextVal);
                          const itemDelta = (currentNum !== null && nextNum !== null) ? Number((currentNum - nextNum).toFixed(2)) : null;

                          return (
                            <td key={colIdx} style={{ padding: '0.65rem 0.8rem', textAlign: 'center' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <ExamBadge examKey={bio.key} value={val} />
                                {itemDelta !== null && itemDelta !== 0 && (
                                  <span 
                                    style={{ 
                                      fontSize: '0.65rem', 
                                      fontWeight: '600',
                                      color: itemDelta > 0 ? '#1d4ed8' : '#64748b',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '1px'
                                    }}
                                  >
                                    {itemDelta > 0 ? `+${itemDelta}` : `${itemDelta}`}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}

                        <td style={{ padding: '0.65rem 0.8rem', textAlign: 'center' }}>
                          {delta !== null ? (
                            <span 
                              style={{ 
                                fontSize: '0.70rem', 
                                padding: '2px 6px', 
                                borderRadius: '6px', 
                                fontWeight: 'bold',
                                background: delta > 0 ? '#eff6ff' : delta < 0 ? '#f0fdf4' : '#f8fafc',
                                color: delta > 0 ? '#1e40af' : delta < 0 ? '#15803d' : '#64748b'
                              }}
                            >
                              {delta > 0 ? `↑ Subiu` : delta < 0 ? `↓ Caiu` : `= Estável`}
                            </span>
                          ) : (
                            <span className="text-2xs text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
