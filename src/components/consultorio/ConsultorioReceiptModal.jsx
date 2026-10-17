import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Printer, 
  FileDown, 
  DollarSign, 
  Loader2, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { createConsultorioDocument } from '../../services/consultorioService';
import { downloadPdfDocument } from '../../services/pdfService';
import { printElement } from '../../utils/printUtils';
import { formatCurrencyBRL, numeroPorExtenso } from '../../utils/numberUtils';
import ConsultorioReceiptPdf from './ConsultorioReceiptPdf';

export default function ConsultorioReceiptModal({
  isOpen,
  onClose,
  patient = null,
  appointment = null,
  doctorInfo = null,
  onSuccess
}) {
  const [patientNome, setPatientNome] = useState('');
  const [patientCpf, setPatientCpf] = useState('');
  const [valor, setValor] = useState('400.00');
  const [valorExtenso, setValorExtenso] = useState('quatrocentos reais');
  const [dataConsulta, setDataConsulta] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [descricaoServico, setDescricaoServico] = useState('Consulta Médica Especializada em Nefrologia');

  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const initialNome = appointment?.patientNome || patient?.nome || '';
    const initialCpf = appointment?.patientCpf || patient?.cpf || '';
    const initialValor = appointment?.valor !== undefined ? String(appointment?.valor) : '400.00';
    const initialDate = appointment?.data || new Date().toISOString().split('T')[0];

    setPatientNome(initialNome);
    setPatientCpf(initialCpf);
    setValor(initialValor);
    setValorExtenso(numeroPorExtenso(Number(initialValor) || 0));
    setDataConsulta(initialDate);
    setFormaPagamento('PIX');
    setDescricaoServico('Consulta Médica Especializada em Nefrologia');
    setError('');
  }, [isOpen, patient, appointment]);

  // Recalcula valor por extenso quando o valor muda
  const handleValorChange = (e) => {
    const val = e.target.value;
    setValor(val);
    const num = Number(val) || 0;
    setValorExtenso(numeroPorExtenso(num));
  };

  const buildPayload = () => {
    return {
      tipo: 'recibo',
      patientId: appointment?.patientId || patient?.id || null,
      patientNome: patientNome.trim(),
      patientCpf: patientCpf.trim(),
      doctorId: doctorInfo?.id || 'dr-marcelo',
      appointmentId: appointment?.id || null,
      valor: Number(valor) || 0,
      valorExtenso: valorExtenso.trim(),
      data: dataConsulta,
      dataConsulta,
      formaPagamento,
      descricaoServico: descricaoServico.trim()
    };
  };

  const handleSave = async () => {
    if (!patientNome.trim()) {
      setError('Informe o nome do paciente.');
      return;
    }
    if (!valor || Number(valor) <= 0) {
      setError('Informe um valor válido para o recibo.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const payload = buildPayload();
      await createConsultorioDocument(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao emitir recibo:', err);
      setError('Falha ao salvar recibo no Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!patientNome.trim()) {
      setError('Informe o nome do paciente.');
      return;
    }

    try {
      setDownloading(true);
      const payload = buildPayload();
      const patientObj = { nome: patientNome, cpf: patientCpf };
      const safeName = patientNome.replace(/\s+/g, '_');
      const fileName = `Recibo_${safeName}_${dataConsulta}.pdf`;

      await downloadPdfDocument(
        <ConsultorioReceiptPdf
          receiptData={payload}
          patient={patientObj}
          doctorInfo={doctorInfo}
        />,
        fileName
      );
    } catch (err) {
      console.error('Erro ao baixar recibo em PDF:', err);
      setError('Falha ao gerar arquivo PDF do recibo.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    printElement('printable-consultorio-receipt', `Recibo - ${patientNome}`);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay animate-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div 
        className="glass-panel"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* CABEÇALHO */}
        <div 
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900" style={{ margin: 0 }}>
                Recibo de Consulta Particular
              </h2>
              <p className="text-xs text-slate-500" style={{ margin: 0 }}>
                Comprovante oficial com CPF/CRM para reembolso e IRPF
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '6px', borderRadius: '8px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* CORPO */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }} className="flex flex-col gap-3.5">
          {error && (
            <div 
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nome do Paciente:
              </label>
              <input
                type="text"
                value={patientNome}
                onChange={(e) => setPatientNome(e.target.value)}
                placeholder="Nome completo do paciente"
                className="form-control text-xs w-full"
                style={{ padding: '0.45rem', borderRadius: '8px' }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                CPF do Paciente:
              </label>
              <input
                type="text"
                value={patientCpf}
                onChange={(e) => setPatientCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="form-control text-xs w-full"
                style={{ padding: '0.45rem', borderRadius: '8px' }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Data do Atendimento:
              </label>
              <input
                type="date"
                value={dataConsulta}
                onChange={(e) => setDataConsulta(e.target.value)}
                className="form-control text-xs w-full"
                style={{ padding: '0.45rem', borderRadius: '8px' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Valor Recebido (R$):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valor}
                onChange={handleValorChange}
                className="form-control text-xs w-full"
                style={{ padding: '0.45rem', borderRadius: '8px', fontWeight: 'bold' }}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Forma de Pagamento:
              </label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="form-control text-xs w-full"
                style={{ padding: '0.45rem', borderRadius: '8px' }}
              >
                <option value="PIX">PIX</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Transferência Bancária">Transferência Bancária</option>
              </select>
            </div>
          </div>

          {/* PREVIEW DO VALOR POR EXTENSO */}
          <div 
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}
          >
            <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
              Valor por Extenso:
            </span>
            <span className="text-xs font-semibold text-slate-800 italic">
              "{valorExtenso}"
            </span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Descrição do Serviço:
            </label>
            <input
              type="text"
              value={descricaoServico}
              onChange={(e) => setDescricaoServico(e.target.value)}
              className="form-control text-xs w-full"
              style={{ padding: '0.45rem', borderRadius: '8px' }}
            />
          </div>

          {/* DADOS FISCAIS DO MÉDICO */}
          <div 
            style={{
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              background: '#f1f5f9',
              fontSize: '0.75rem',
              color: '#475569'
            }}
          >
            Médico: <strong>{doctorInfo?.nome || 'Dr. Marcelo Ramos'}</strong> • CRM {doctorInfo?.crm}/{doctorInfo?.ufCrm || 'SP'} • CPF: {doctorInfo?.cpf || '348.912.756-82'}
          </div>

          {/* ELEMENTO OCULTO PARA IMPRESSÃO NATIVA */}
          <div id="printable-consultorio-receipt" style={{ display: 'none' }}>
            <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif' }}>
              <h2 style={{ textAlign: 'center' }}>RECIBO DE HONORÁRIOS MÉDICOS</h2>
              <hr />
              <p>Recebi de <strong>{patientNome}</strong>, CPF: <strong>{patientCpf}</strong>, a quantia de <strong>{formatCurrencyBRL(valor)}</strong> ({valorExtenso}), referente a {descricaoServico}.</p>
              <p>Data: {dataConsulta}</p>
              <br /><br />
              <p style={{ textAlign: 'center' }}>__________________________________________<br />{doctorInfo?.nome}<br />CRM {doctorInfo?.crm}/{doctorInfo?.ufCrm} • CPF: {doctorInfo?.cpf}</p>
            </div>
          </div>
        </div>

        {/* RODAPÉ DO MODAL (REGRA DE 1 PALAVRA) */}
        <div 
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1rem', borderRadius: '10px' }}
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-outline"
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={15} />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="btn btn-outline"
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                borderColor: '#a7f3d0',
                background: '#ecfdf5',
                color: '#047857',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {downloading ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
              <span>Baixar</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderColor: '#047857',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
