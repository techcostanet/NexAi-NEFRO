import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  RotateCcw, 
  Download, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Pill,
  Loader2
} from 'lucide-react';
import { getLmeExpirationStatus } from '../../services/lmeService.js';
import { deletePatientLme } from '../../services/patientService.js';
import { downloadPdfDocument } from '../../services/pdfService.js';
import { safeFormatDate } from '../../utils/dateUtils.js';
import LmeReportPdf from '../pdf/LmeReportPdf.jsx';

export default function LmePatientSection({
  patient,
  doctorInfo,
  onOpenNewLme,
  onEditLme,
  onRenewLme
}) {
  const [downloadingId, setDownloadingId] = useState(null);
  const lmes = Array.isArray(patient?.lmes) ? patient.lmes : [];

  const handleDelete = async (lmeId, medNome) => {
    if (window.confirm(`Deseja realmente remover o registro de LME de ${medNome || 'medicamento'} deste paciente?`)) {
      try {
        await deletePatientLme(patient.id, lmeId);
      } catch (err) {
        alert('Erro ao excluir LME: ' + err.message);
      }
    }
  };

  const handleDownloadPdf = async (lme) => {
    try {
      setDownloadingId(lme.id);
      const safePatient = (patient.nome || 'Paciente').replace(/\s+/g, '_');
      const safeMed = (lme.medicamentoNome || 'LME').replace(/\s+/g, '_');
      const fileName = `LME_${safeMed}_${safePatient}.pdf`;

      await downloadPdfDocument(
        <LmeReportPdf
          patient={patient}
          doctorInfo={doctorInfo}
          lmeData={lme}
          clinicalReportText={lme.justificativaClinica || ''}
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

  return (
    <div className="glass-panel" style={{ borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
      {/* Cabeçalho da Seção */}
      <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div style={{ background: '#eff6ff', padding: '7px', borderRadius: '10px', color: '#2563eb' }}>
            <FileText size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800" style={{ margin: 0 }}>
                Medicamentos de Alto Custo (LME)
              </h3>
              <span style={{ fontSize: '0.70rem', background: '#f1f5f9', color: '#475569', padding: '1px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                {lmes.length} cadastrada(s)
              </span>
            </div>
            <p className="text-xs text-muted" style={{ margin: 0 }}>
              Controle de vigência (3 a 6 meses), auditoria de exames e renovação para Farmácia de Minas / SES
            </p>
          </div>
        </div>

        <button 
          type="button"
          className="btn btn-outline"
          onClick={onOpenNewLme}
          style={{ 
            padding: '0.45rem 0.85rem', 
            fontSize: '0.80rem', 
            fontWeight: '600', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '5px', 
            borderRadius: '10px',
            borderColor: '#bfdbfe',
            background: '#eff6ff',
            color: '#1d4ed8'
          }}
          title="Emitir nova LME com exames recentes do paciente"
        >
          <Plus size={15} />
          <span>+ LME</span>
        </button>
      </div>

      {/* Lista de LMEs ou Estado Vazio */}
      {lmes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: '#2563eb' }}>
            <Pill size={22} />
          </div>
          <h4 className="text-sm font-bold text-slate-700 mb-1">Nenhuma LME cadastrada para este paciente</h4>
          <p className="text-xs text-muted max-w-md mx-auto mb-3">
            Gere o laudo oficial do SUS preenchido com dados cadastrais e exames mais recentes (Hb, Ferritina, IST, PTH, etc.) em 1 clique.
          </p>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={onOpenNewLme}
            style={{ fontSize: '0.80rem', padding: '0.45rem 1rem' }}
          >
            + LME
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '0.85rem' }}>
          {lmes.map(lme => {
            const exp = getLmeExpirationStatus(lme);
            const isDownloading = downloadingId === lme.id;

            return (
              <div 
                key={lme.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid',
                  borderColor: exp.status === 'vencido' ? '#fca5a5' : exp.status === 'a_vencer' ? '#fde68a' : '#e2e8f0',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.65rem'
                }}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span 
                      style={{ 
                        fontSize: '0.70rem', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        background: exp.bg, 
                        color: exp.color, 
                        border: `1px solid ${exp.border || '#cbd5e1'}`, 
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {exp.status === 'vencido' ? <AlertTriangle size={12} /> : exp.status === 'a_vencer' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                      <span>{exp.label}</span>
                    </span>

                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>
                      {lme.vigenciaMeses || 6} meses
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800" style={{ lineHeight: '1.25' }}>
                    {lme.medicamentoNome}
                  </h4>
                  <div className="text-xs text-blue-700 font-semibold mt-0.5">
                    {lme.concentracaoLabel || ''}
                  </div>

                  <p className="text-2xs text-slate-600 mt-1.5" style={{ background: '#f8fafc', padding: '4px 6px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                    <strong>Posologia:</strong> {lme.posologia || 'Não informada'}
                  </p>

                  <div className="flex items-center gap-3 text-2xs text-muted mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      Início: {safeFormatDate(lme.dataSolicitacao)}
                    </span>
                    <span className="flex items-center gap-1 font-semibold" style={{ color: exp.color }}>
                      Vencimento: {safeFormatDate(lme.dataValidade)}
                    </span>
                  </div>
                </div>

                {/* Ações da LME */}
                <div className="flex justify-between items-center pt-2 border-t mt-1" style={{ borderColor: '#f1f5f9' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => onRenewLme(lme)}
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
                    title="Renovar LME atualizando com os novos exames do paciente"
                  >
                    <RotateCcw size={12} />
                    <span>Renovar</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => handleDownloadPdf(lme)}
                      disabled={isDownloading}
                      style={{ fontSize: '0.75rem', padding: '3px 7px', borderRadius: '8px', color: '#2563eb' }}
                      title="Baixar PDF Oficial com Laudo e Relatório"
                    >
                      {isDownloading ? <Loader2 className="animate-spin" size={13} /> : <Download size={13} />}
                    </button>

                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => onEditLme(lme)}
                      style={{ fontSize: '0.75rem', padding: '3px 7px', borderRadius: '8px', color: '#475569' }}
                      title="Editar dados desta LME"
                    >
                      <Edit size={13} />
                    </button>

                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => handleDelete(lme.id, lme.medicamentoNome)}
                      style={{ fontSize: '0.75rem', padding: '3px 7px', borderRadius: '8px', color: '#dc2626', borderColor: '#fecaca' }}
                      title="Excluir LME"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
