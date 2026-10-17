import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  FileCheck, 
  Plus, 
  Filter, 
  FileDown, 
  Printer, 
  ExternalLink,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatCurrencyBRL } from '../../utils/numberUtils';
import { safeFormatDate } from '../../utils/dateUtils';
import { downloadPdfDocument } from '../../services/pdfService';
import ConsultorioReceiptPdf from './ConsultorioReceiptPdf';

export default function ConsultorioFinanceiroTab({
  appointments = [],
  documents = [],
  patients = [],
  doctorInfo = null,
  onOpenReceiptModal
}) {
  const currentMonthStr = useMemo(() => {
    return new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  }, []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [modalidadeFilter, setModalidadeFilter] = useState('Todos'); // 'Todos' | 'Particular' | 'Convênio'
  const [downloadingId, setDownloadingId] = useState(null);

  // Recibos emitidos salvos em consultorio_documents
  const receiptsList = useMemo(() => {
    return documents.filter(d => d.tipo === 'recibo');
  }, [documents]);

  // Mapa de recibos vinculados a consultas
  const receiptsMapByAppointment = useMemo(() => {
    const map = {};
    receiptsList.forEach(r => {
      if (r.appointmentId) {
        map[r.appointmentId] = r;
      }
    });
    return map;
  }, [receiptsList]);

  // Filtragem dos agendamentos pelo mês selecionado
  const monthAppointments = useMemo(() => {
    return appointments.filter(a => {
      if (!a.data) return false;
      const monthPrefix = a.data.slice(0, 7);
      if (selectedMonth !== 'Todos' && monthPrefix !== selectedMonth) return false;
      if (modalidadeFilter !== 'Todos' && a.modalidade !== modalidadeFilter) return false;
      return true;
    });
  }, [appointments, selectedMonth, modalidadeFilter]);

  // Indicadores Financeiros do Mês
  const stats = useMemo(() => {
    let totalFaturadoParticular = 0;
    let countParticular = 0;
    let countConvenio = 0;
    let countAtendidos = 0;

    monthAppointments.forEach(apt => {
      if (apt.status === 'Cancelado') return;

      if (apt.modalidade === 'Particular') {
        countParticular += 1;
        totalFaturadoParticular += (Number(apt.valor) || 0);
      } else {
        countConvenio += 1;
      }

      if (apt.status === 'Atendido') {
        countAtendidos += 1;
      }
    });

    const totalRecibosValor = receiptsList.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

    return {
      totalConsultas: monthAppointments.length,
      totalFaturadoParticular,
      countParticular,
      countConvenio,
      countAtendidos,
      totalRecibosEmitidos: receiptsList.length,
      totalRecibosValor
    };
  }, [monthAppointments, receiptsList]);

  // Distribuição por Convênios
  const convenioDistribution = useMemo(() => {
    const map = {};
    monthAppointments.forEach(a => {
      const name = a.modalidade === 'Particular' ? 'Particular' : (a.convenioNome || 'Convênio Outro');
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthAppointments]);

  // Baixar recibo direto da tabela
  const handleDownloadReceipt = async (receiptData, apt) => {
    try {
      setDownloadingId(receiptData.id || apt.id);
      const patientObj = {
        nome: receiptData.patientNome || apt.patientNome,
        cpf: receiptData.patientCpf || apt.patientCpf
      };
      const safeName = (patientObj.nome || 'Paciente').replace(/\s+/g, '_');
      const fileName = `Recibo_${safeName}_${receiptData.data || apt.data}.pdf`;

      await downloadPdfDocument(
        <ConsultorioReceiptPdf
          receiptData={receiptData}
          patient={patientObj}
          doctorInfo={doctorInfo}
        />,
        fileName
      );
    } catch (err) {
      console.error('Falha ao baixar recibo:', err);
      alert('Não foi possível gerar o PDF do recibo.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in">
      {/* BARRA DE FILTROS E EMISSÃO RÁPIDA */}
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
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Filter size={14} color="#2563eb" />
            <span>Mês:</span>
          </div>

          <input
            type="month"
            value={selectedMonth === 'Todos' ? '' : selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value || 'Todos')}
            className="form-control text-xs"
            style={{ padding: '4px 8px', borderRadius: '8px', maxWidth: '150px' }}
          />

          <div className="flex gap-1">
            {['Todos', 'Particular', 'Convênio'].map(mod => {
              const isSelected = modalidadeFilter === mod;
              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => setModalidadeFilter(mod)}
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
                  {mod}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenReceiptModal(null)}
          className="btn btn-primary"
          style={{
            padding: '0.45rem 1rem',
            fontSize: '0.82rem',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            borderColor: '#047857',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={15} />
          <span>Recibo</span>
        </button>
      </div>

      {/* CARDS DE RESUMO FINANCEIRO (ZERO BURACOS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Particular */}
        <div 
          className="glass-panel"
          style={{
            padding: '1.15rem',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #bbf7d0',
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.05)'
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-800">
              Faturamento Particular:
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
              <DollarSign size={17} />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-900">
            {formatCurrencyBRL(stats.totalFaturadoParticular)}
          </div>
          <div className="text-2xs text-emerald-700 mt-1 font-semibold">
            {stats.countParticular} consulta(s) particular
          </div>
        </div>

        {/* Card 2: Consultas Convênio */}
        <div 
          className="glass-panel"
          style={{
            padding: '1.15rem',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #bfdbfe',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.05)'
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-blue-800">
              Atendimentos Convênio:
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb' }}>
              <CreditCard size={17} />
            </div>
          </div>
          <div className="text-xl font-extrabold text-blue-900">
            {stats.countConvenio}
          </div>
          <div className="text-2xs text-blue-600 mt-1 font-semibold">
            Planos de saúde faturáveis
          </div>
        </div>

        {/* Card 3: Total Atendidos */}
        <div 
          className="glass-panel"
          style={{
            padding: '1.15rem',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-700">
              Consultas Realizadas:
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#f8fafc', color: '#475569' }}>
              <CheckCircle2 size={17} />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {stats.countAtendidos} <span className="text-xs text-slate-400 font-normal">/ {stats.totalConsultas}</span>
          </div>
          <div className="text-2xs text-slate-500 mt-1">
            Status 'Atendido' no período
          </div>
        </div>

        {/* Card 4: Recibos Emitidos */}
        <div 
          className="glass-panel"
          style={{
            padding: '1.15rem',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #fed7aa',
            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.05)'
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-amber-800">
              Recibos Emitidos:
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c' }}>
              <FileCheck size={17} />
            </div>
          </div>
          <div className="text-xl font-extrabold text-amber-900">
            {stats.totalRecibosEmitidos}
          </div>
          <div className="text-2xs text-amber-700 mt-1 font-semibold">
            Total comprovado: {formatCurrencyBRL(stats.totalRecibosValor)}
          </div>
        </div>
      </div>

      {/* DISTRIBUIÇÃO POR CONVÊNIO EM CHIPS */}
      {convenioDistribution.length > 0 && (
        <div 
          className="glass-panel"
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <span className="text-2xs font-bold uppercase text-slate-500 mr-1">
            Distribuição no Período:
          </span>
          {convenioDistribution.map(([name, count]) => (
            <span
              key={name}
              style={{
                fontSize: '0.74rem',
                fontWeight: '600',
                padding: '3px 8px',
                borderRadius: '8px',
                background: name === 'Particular' ? '#ecfdf5' : '#eff6ff',
                color: name === 'Particular' ? '#047857' : '#1d4ed8',
                border: '1px solid',
                borderColor: name === 'Particular' ? '#a7f3d0' : '#bfdbfe'
              }}
            >
              {name}: <strong>{count}</strong>
            </span>
          ))}
        </div>
      )}

      {/* TABELA DE CONSULTAS E RECIBOS */}
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
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Lançamentos de Consultas ({monthAppointments.length}):
          </span>
          <span className="text-2xs text-slate-500">
            Clique em 'Recibo' para emitir comprovante em PDF
          </span>
        </div>

        {monthAppointments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            Nenhum atendimento encontrado para o período selecionado.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 14px' }}>Data</th>
                  <th style={{ padding: '10px 14px' }}>Hora</th>
                  <th style={{ padding: '10px 14px' }}>Paciente</th>
                  <th style={{ padding: '10px 14px' }}>Modalidade</th>
                  <th style={{ padding: '10px 14px' }}>Valor</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Recibo</th>
                </tr>
              </thead>
              <tbody>
                {monthAppointments.map((apt) => {
                  const receipt = receiptsMapByAppointment[apt.id];
                  const hasReceipt = Boolean(receipt);

                  return (
                    <tr 
                      key={apt.id} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s'
                      }}
                      className="hover:bg-slate-50"
                    >
                      <td style={{ padding: '10px 14px', fontWeight: '600', color: '#1e293b' }}>
                        {safeFormatDate(apt.data)}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748b' }}>
                        {apt.hora}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{apt.patientNome}</div>
                        {apt.patientCpf && (
                          <div style={{ fontSize: '0.70rem', color: '#94a3b8' }}>CPF: {apt.patientCpf}</div>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span 
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: apt.modalidade === 'Particular' ? '#ecfdf5' : '#eff6ff',
                            color: apt.modalidade === 'Particular' ? '#047857' : '#1d4ed8'
                          }}
                        >
                          {apt.modalidade} {apt.convenioNome ? `(${apt.convenioNome})` : ''}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0f172a' }}>
                        {apt.modalidade === 'Particular' ? formatCurrencyBRL(apt.valor) : '-'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span 
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: apt.status === 'Atendido' ? '#f0fdf4' : '#f8fafc',
                            color: apt.status === 'Atendido' ? '#16a34a' : '#64748b'
                          }}
                        >
                          {apt.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        {hasReceipt ? (
                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(receipt, apt)}
                            disabled={downloadingId === receipt.id}
                            className="btn btn-outline"
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              color: '#059669',
                              borderColor: '#a7f3d0',
                              background: '#ecfdf5',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Baixar recibo em PDF"
                          >
                            <FileCheck size={12} />
                            <span>Baixar</span>
                          </button>
                        ) : apt.modalidade === 'Particular' ? (
                          <button
                            type="button"
                            onClick={() => onOpenReceiptModal(apt)}
                            className="btn btn-outline"
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              color: '#2563eb',
                              borderColor: '#bfdbfe',
                              background: '#eff6ff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Emitir recibo para este atendimento"
                          >
                            <Plus size={12} />
                            <span>Recibo</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.70rem', color: '#cbd5e1' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
