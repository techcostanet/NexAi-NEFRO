import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  FileDown, 
  Trash2, 
  FlaskConical, 
  ShieldCheck, 
  Clock, 
  Stethoscope, 
  DollarSign,
  Loader2
} from 'lucide-react';
import { safeFormatDate } from '../../utils/dateUtils';
import { formatCurrencyBRL } from '../../utils/numberUtils';
import { downloadPdfDocument } from '../../services/pdfService';
import { deleteConsultorioDocument } from '../../services/consultorioService';
import ConsultorioDocumentPdf from './ConsultorioDocumentPdf';
import ConsultorioReceiptPdf from './ConsultorioReceiptPdf';

export default function ConsultorioDocumentosTab({
  documents = [],
  patients = [],
  doctorInfo = null,
  onOpenNewDocument
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [downloadingId, setDownloadingId] = useState(null);

  // Filtragem
  const filteredDocuments = useMemo(() => {
    return documents.filter(docItem => {
      if (typeFilter !== 'Todos' && docItem.tipo !== typeFilter) return false;
      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      const pNome = (docItem.patientNome || '').toLowerCase();
      const pCpf = (docItem.patientCpf || '').toLowerCase();
      const dTipo = (docItem.tipo || '').toLowerCase();
      return pNome.includes(term) || pCpf.includes(term) || dTipo.includes(term);
    });
  }, [documents, typeFilter, searchTerm]);

  // Ícone por tipo
  const getTypeBadge = (tipo) => {
    switch (tipo) {
      case 'exames':
        return { label: 'Exames', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: FlaskConical };
      case 'atestado':
        return { label: 'Atestado', bg: '#fef2f2', color: '#dc2626', border: '#fecaca', icon: ShieldCheck };
      case 'comparecimento':
        return { label: 'Comparecimento', bg: '#f8fafc', color: '#475569', border: '#e2e8f0', icon: Clock };
      case 'parecer':
        return { label: 'Parecer', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', icon: Stethoscope };
      case 'recibo':
        return { label: 'Recibo', bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', icon: DollarSign };
      default:
        return { label: 'Documento', bg: '#f8fafc', color: '#64748b', border: '#cbd5e1', icon: FileText };
    }
  };

  // Baixar documento em PDF
  const handleDownload = async (docItem) => {
    try {
      setDownloadingId(docItem.id);
      const patientObj = { nome: docItem.patientNome, cpf: docItem.patientCpf };
      const safeName = (docItem.patientNome || 'Paciente').replace(/\s+/g, '_');
      const fileName = `${docItem.tipo.toUpperCase()}_${safeName}_${docItem.data}.pdf`;

      if (docItem.tipo === 'recibo') {
        await downloadPdfDocument(
          <ConsultorioReceiptPdf
            receiptData={docItem}
            patient={patientObj}
            doctorInfo={doctorInfo}
          />,
          fileName
        );
      } else {
        await downloadPdfDocument(
          <ConsultorioDocumentPdf
            documentData={docItem}
            patient={patientObj}
            doctorInfo={doctorInfo}
          />,
          fileName
        );
      }
    } catch (err) {
      console.error('Falha ao baixar PDF:', err);
      alert('Não foi possível gerar o arquivo PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Excluir documento
  const handleDelete = async (docItem) => {
    if (window.confirm(`Deseja remover este documento (${docItem.tipo}) de ${docItem.patientNome}?`)) {
      try {
        await deleteConsultorioDocument(docItem.id);
      } catch (err) {
        alert('Erro ao excluir documento: ' + err.message);
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in">
      {/* BARRA SUPERIOR DE AÇÃO E FILTROS */}
      <div 
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          background: 'var(--surface-solid)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div className="flex items-center gap-2 flex-wrap" style={{ flex: 1 }}>
          <div className="relative" style={{ minWidth: '220px', flex: '1 1 220px' }}>
            <Search 
              size={14} 
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por paciente ou CPF..."
              className="form-control text-xs"
              style={{ paddingLeft: '32px', borderRadius: '10px' }}
            />
          </div>

          <div className="flex gap-1 flex-wrap">
            {['Todos', 'exames', 'atestado', 'comparecimento', 'parecer', 'recibo'].map(tipo => {
              const isSelected = typeFilter === tipo;
              const labelMap = {
                Todos: 'Todos',
                exames: 'Exames',
                atestado: 'Atestado',
                comparecimento: 'Comparecimento',
                parecer: 'Parecer',
                recibo: 'Recibo'
              };
              return (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setTypeFilter(tipo)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: isSelected ? '700' : '500',
                    background: isSelected ? '#2563eb' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#64748b',
                    border: '1px solid',
                    borderColor: isSelected ? '#2563eb' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {labelMap[tipo]}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenNewDocument()}
          className="btn btn-primary"
          style={{
            padding: '0.45rem 1.15rem',
            fontSize: '0.82rem',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={15} />
          <span>Documento</span>
        </button>
      </div>

      {/* LISTAGEM DE DOCUMENTOS */}
      <div 
        className="glass-panel"
        style={{
          borderRadius: '16px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Documentos Emitidos ({filteredDocuments.length}):
          </span>
          <span className="text-2xs text-slate-500">
            Armazenamento permanente e emissão em PDF vetorial
          </span>
        </div>

        {filteredDocuments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            Nenhum documento encontrado com os filtros atuais.
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {filteredDocuments.map(docItem => {
              const badge = getTypeBadge(docItem.tipo);
              const Icon = badge.icon;

              return (
                <div 
                  key={docItem.id}
                  style={{
                    padding: '0.9rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    transition: 'background 0.15s'
                  }}
                  className="hover:bg-slate-50"
                >
                  {/* Tipo & Paciente */}
                  <div className="flex items-center gap-3">
                    <div 
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.74rem',
                        fontWeight: '700'
                      }}
                    >
                      <Icon size={14} />
                      <span>{badge.label}</span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {docItem.patientNome}
                      </div>
                      <div className="text-2xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Emissão: {safeFormatDate(docItem.data)}</span>
                        {docItem.patientCpf && <span>• CPF: {docItem.patientCpf}</span>}
                        {docItem.tipo === 'recibo' && (
                          <span className="font-bold text-emerald-700">
                            • {formatCurrencyBRL(docItem.valor)} ({docItem.formaPagamento})
                          </span>
                        )}
                        {docItem.tipo === 'exames' && (
                          <span className="text-blue-600">
                            • {docItem.kitNome || `${docItem.exames?.length || 0} exames`}
                          </span>
                        )}
                        {docItem.tipo === 'atestado' && (
                          <span className="text-red-600">
                            • {docItem.diasRepouso} dia(s) {docItem.cid ? `(CID ${docItem.cid})` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(docItem)}
                      disabled={downloadingId === docItem.id}
                      className="btn btn-outline"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        color: '#2563eb',
                        borderColor: '#bfdbfe',
                        background: '#eff6ff'
                      }}
                      title="Baixar em PDF"
                    >
                      {downloadingId === docItem.id ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
                      <span>Baixar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(docItem)}
                      className="btn btn-outline"
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        color: '#dc2626',
                        borderColor: '#fecaca'
                      }}
                      title="Excluir documento"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
