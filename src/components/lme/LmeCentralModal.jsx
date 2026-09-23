import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  Download, 
  RotateCcw, 
  ExternalLink,
  Calendar,
  Pill,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getPatientsWithLmeAlerts } from '../../services/lmeService.js';
import { downloadPdfDocument } from '../../services/pdfService.js';
import { safeFormatDate } from '../../utils/dateUtils.js';
import LmeReportPdf from '../pdf/LmeReportPdf.jsx';

export default function LmeCentralModal({
  isOpen,
  onClose,
  patients = [],
  doctorInfo = {},
  onOpenPatientLme
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [tabFilter, setTabFilter] = useState('a_vencer'); // 'todas', 'a_vencer', 'vencido', 'vigente'
  const [downloadingId, setDownloadingId] = useState(null);

  const lmeStats = getPatientsWithLmeAlerts(patients);
  const allLmes = lmeStats.allLmes || [];

  // Filtragem
  const filteredLmes = allLmes.filter(item => {
    const pName = (item.patient?.nome || '').toLowerCase();
    const pCpf = (item.patient?.cpf || '').toLowerCase();
    const mName = (item.medicamentoNome || '').toLowerCase();
    const s = searchTerm.toLowerCase().trim();

    const matchesSearch = pName.includes(s) || pCpf.includes(s) || mName.includes(s);
    if (!matchesSearch) return false;

    if (tabFilter === 'a_vencer') return item.expStatus.status === 'a_vencer';
    if (tabFilter === 'vencido') return item.expStatus.status === 'vencido';
    if (tabFilter === 'vigente') return item.expStatus.status === 'vigente';
    return true;
  });

  const handleDownloadPdf = async (lmeItem) => {
    try {
      setDownloadingId(lmeItem.id);
      const safePatient = (lmeItem.patient?.nome || 'Paciente').replace(/\s+/g, '_');
      const safeMed = (lmeItem.medicamentoNome || 'LME').replace(/\s+/g, '_');
      const fileName = `LME_${safeMed}_${safePatient}.pdf`;

      await downloadPdfDocument(
        <LmeReportPdf
          patient={lmeItem.patient}
          doctorInfo={doctorInfo}
          lmeData={lmeItem}
          clinicalReportText={lmeItem.justificativaClinica || ''}
        />,
        fileName
      );
    } catch (err) {
      console.error(err);
      alert('Falha ao gerar PDF da LME: ' + err.message);
    } finally {
      setDownloadingId(null);
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
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '0.75rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-in"
        style={{
          background: 'var(--surface-solid)',
          width: '100%',
          maxWidth: '1050px',
          height: '92vh',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          borderRadius: '20px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center pb-3 border-b mb-3" style={{ borderColor: 'var(--border)', flexShrink: 0 }}>
          <div className="flex items-center gap-2.5">
            <div style={{ background: '#f5f3ff', padding: '8px', borderRadius: '12px', color: '#7c3aed' }}>
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight" style={{ margin: 0 }}>
                Central de LMEs
              </h2>
              <p className="text-xs text-muted" style={{ margin: 0 }}>
                Vigilância ativa de renovações semestrais e trimestrais da Farmácia de Minas / SES
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-outline" 
            style={{ padding: '0.4rem', borderRadius: '50%' }}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cards de Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem', flexShrink: 0 }}>
          <div 
            onClick={() => setTabFilter('a_vencer')}
            style={{ 
              background: tabFilter === 'a_vencer' ? '#fef3c7' : '#fffbeb', 
              border: '1px solid', 
              borderColor: tabFilter === 'a_vencer' ? '#f59e0b' : '#fde68a',
              borderRadius: '12px', 
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <div className="flex justify-between items-center text-amber-800">
              <span className="text-xs font-bold uppercase tracking-wider">A Vencer (≤ 30d)</span>
              <Clock size={16} />
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-1">
              {lmeStats.expiring.length}
            </div>
            <span className="text-2xs text-amber-700">Renovação preventiva necessária</span>
          </div>

          <div 
            onClick={() => setTabFilter('vencido')}
            style={{ 
              background: tabFilter === 'vencido' ? '#fee2e2' : '#fef2f2', 
              border: '1px solid', 
              borderColor: tabFilter === 'vencido' ? '#ef4444' : '#fca5a5',
              borderRadius: '12px', 
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <div className="flex justify-between items-center text-red-800">
              <span className="text-xs font-bold uppercase tracking-wider">Vencidas</span>
              <AlertTriangle size={16} />
            </div>
            <div className="text-2xl font-bold text-red-900 mt-1">
              {lmeStats.expired.length}
            </div>
            <span className="text-2xs text-red-700">Risco iminente de suspensão SUS</span>
          </div>

          <div 
            onClick={() => setTabFilter('vigente')}
            style={{ 
              background: tabFilter === 'vigente' ? '#dcfce7' : '#f0fdf4', 
              border: '1px solid', 
              borderColor: tabFilter === 'vigente' ? '#22c55e' : '#bbf7d0',
              borderRadius: '12px', 
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <div className="flex justify-between items-center text-emerald-800">
              <span className="text-xs font-bold uppercase tracking-wider">Vigentes</span>
              <CheckCircle2 size={16} />
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              {allLmes.filter(l => l.expStatus.status === 'vigente').length}
            </div>
            <span className="text-2xs text-emerald-700">Tratamento regular em dia</span>
          </div>

          <div 
            onClick={() => setTabFilter('todas')}
            style={{ 
              background: tabFilter === 'todas' ? '#e0e7ff' : '#f8fafc', 
              border: '1px solid', 
              borderColor: tabFilter === 'todas' ? '#6366f1' : '#cbd5e1',
              borderRadius: '12px', 
              padding: '0.75rem 1rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <div className="flex justify-between items-center text-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider">Total Geral</span>
              <Pill size={16} />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {allLmes.length}
            </div>
            <span className="text-2xs text-slate-500">LMEs ativas no sistema</span>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="flex justify-between items-center gap-3 flex-wrap mb-3" style={{ flexShrink: 0 }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Buscar paciente, medicamento ou CPF..." 
              style={{ paddingLeft: '2rem', fontSize: '0.82rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <button 
              type="button" 
              onClick={() => setTabFilter('a_vencer')}
              className="btn btn-outline"
              style={{ 
                fontSize: '0.78rem', 
                padding: '4px 10px',
                borderRadius: '8px',
                background: tabFilter === 'a_vencer' ? '#fef3c7' : 'transparent',
                borderColor: tabFilter === 'a_vencer' ? '#f59e0b' : '#cbd5e1',
                color: tabFilter === 'a_vencer' ? '#92400e' : '#475569',
                fontWeight: tabFilter === 'a_vencer' ? 'bold' : 'normal'
              }}
            >
              ⚠️ A Vencer ({lmeStats.expiring.length})
            </button>
            <button 
              type="button" 
              onClick={() => setTabFilter('vencido')}
              className="btn btn-outline"
              style={{ 
                fontSize: '0.78rem', 
                padding: '4px 10px',
                borderRadius: '8px',
                background: tabFilter === 'vencido' ? '#fee2e2' : 'transparent',
                borderColor: tabFilter === 'vencido' ? '#ef4444' : '#cbd5e1',
                color: tabFilter === 'vencido' ? '#991b1b' : '#475569',
                fontWeight: tabFilter === 'vencido' ? 'bold' : 'normal'
              }}
            >
              🔴 Vencidas ({lmeStats.expired.length})
            </button>
            <button 
              type="button" 
              onClick={() => setTabFilter('vigente')}
              className="btn btn-outline"
              style={{ 
                fontSize: '0.78rem', 
                padding: '4px 10px',
                borderRadius: '8px',
                background: tabFilter === 'vigente' ? '#dcfce7' : 'transparent',
                borderColor: tabFilter === 'vigente' ? '#22c55e' : '#cbd5e1',
                color: tabFilter === 'vigente' ? '#166534' : '#475569',
                fontWeight: tabFilter === 'vigente' ? 'bold' : 'normal'
              }}
            >
              🟢 Vigentes
            </button>
            <button 
              type="button" 
              onClick={() => setTabFilter('todas')}
              className="btn btn-outline"
              style={{ 
                fontSize: '0.78rem', 
                padding: '4px 10px',
                borderRadius: '8px',
                background: tabFilter === 'todas' ? '#f1f5f9' : 'transparent',
                borderColor: tabFilter === 'todas' ? '#64748b' : '#cbd5e1',
                color: tabFilter === 'todas' ? '#0f172a' : '#475569',
                fontWeight: tabFilter === 'todas' ? 'bold' : 'normal'
              }}
            >
              Todas ({allLmes.length})
            </button>
          </div>
        </div>

        {/* Tabela de LMEs com Rolagem Independente */}
        <div 
          className="custom-scrollbar"
          style={{
            flex: '1 1 0%',
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'auto',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            background: '#ffffff'
          }}
        >
          {filteredLmes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
              <FileText size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem' }} />
              <p className="text-sm font-semibold">Nenhuma LME encontrada com o filtro selecionado.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10, borderBottom: '1.5px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Paciente</th>
                  <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Medicamento</th>
                  <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Vigência</th>
                  <th style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>Status</th>
                  <th style={{ padding: '0.65rem 0.85rem', color: '#475569', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLmes.map(item => {
                  const isDownloading = downloadingId === item.id;
                  const exp = item.expStatus;

                  return (
                    <tr 
                      key={item.id}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                    >
                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div 
                          className="font-bold text-slate-800 hover:text-blue-600 cursor-pointer flex items-center gap-1.5"
                          onClick={() => {
                            onClose();
                            navigate(`/patient/${item.patient?.id}`);
                          }}
                        >
                          <span>{item.patient?.nome}</span>
                          <ExternalLink size={12} color="#94a3b8" />
                        </div>
                        <div className="text-2xs text-muted">
                          {item.patient?.clinica || 'DialiZe Betim'} • CPF: {item.patient?.cpf || 'Não inf.'}
                        </div>
                      </td>

                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div className="font-semibold text-slate-900">{item.medicamentoNome}</div>
                        <div className="text-2xs text-blue-700">{item.concentracaoLabel || ''}</div>
                        <div className="text-2xs text-muted truncate" style={{ maxWidth: '280px' }}>
                          {item.posologia}
                        </div>
                      </td>

                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <div className="flex items-center gap-1 text-slate-700">
                          <Calendar size={12} color="#64748b" />
                          <span>{safeFormatDate(item.dataSolicitacao)} até {safeFormatDate(item.dataValidade)}</span>
                        </div>
                        <div className="text-2xs text-muted">
                          Período: {item.vigenciaMeses || 6} meses
                        </div>
                      </td>

                      <td style={{ padding: '0.65rem 0.85rem' }}>
                        <span 
                          style={{ 
                            fontSize: '0.72rem', 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            background: exp.bg, 
                            color: exp.color, 
                            border: `1px solid ${exp.border || '#cbd5e1'}`, 
                            fontWeight: '700',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {exp.status === 'vencido' ? <AlertTriangle size={12} /> : exp.status === 'a_vencer' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                          <span>{exp.label}</span>
                        </span>
                      </td>

                      <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            type="button" 
                            className="btn btn-outline"
                            onClick={() => {
                              onClose();
                              if (onOpenPatientLme) onOpenPatientLme(item.patient, item, true);
                              navigate(`/patient/${item.patient?.id}`);
                            }}
                            style={{ 
                              fontSize: '0.75rem', 
                              padding: '3px 8px', 
                              borderRadius: '8px', 
                              borderColor: '#bbf7d0', 
                              background: '#f0fdf4', 
                              color: '#15803d',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '600'
                            }}
                            title="Renovar LME com os novos exames do paciente"
                          >
                            <RotateCcw size={12} />
                            <span>Renovar</span>
                          </button>

                          <button 
                            type="button" 
                            className="btn btn-outline"
                            onClick={() => handleDownloadPdf(item)}
                            disabled={isDownloading}
                            style={{ fontSize: '0.75rem', padding: '3px 7px', borderRadius: '8px', color: '#2563eb' }}
                            title="Baixar PDF Oficial da LME e Relatório"
                          >
                            {isDownloading ? <Loader2 className="animate-spin" size={13} /> : <Download size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Rodapé */}
        <div 
          className="flex justify-between items-center pt-3 border-t mt-3 flex-wrap" 
          style={{ borderColor: 'var(--border)', flexShrink: 0 }}
        >
          <span className="text-xs text-muted">
            Exibindo <strong>{filteredLmes.length}</strong> de {allLmes.length} LMEs cadastradas
          </span>

          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={onClose}
            style={{ fontSize: '0.82rem', borderRadius: '10px' }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
