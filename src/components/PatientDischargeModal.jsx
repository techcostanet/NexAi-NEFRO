import React, { useState } from 'react';
import { UserMinus, AlertTriangle, Loader2, X, Calendar, FileText } from 'lucide-react';
import { dischargePatient, MOTIVOS_DESLIGAMENTO_OPTIONS } from '../services/patientService.js';

export default function PatientDischargeModal({
  isOpen,
  onClose,
  patient,
  onSuccess
}) {
  const [motivo, setMotivo] = useState('Transferência');
  const [dataOcorrencia, setDataOcorrencia] = useState(new Date().toISOString().split('T')[0]);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !patient) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      await dischargePatient(patient.id, patient.doctorId, patient.nome, {
        motivo,
        data: dataOcorrencia,
        observacoes
      });

      if (onSuccess) {
        onSuccess(patient, { motivo, data: dataOcorrencia, observacoes });
      }
      onClose();
    } catch (err) {
      console.error("Erro ao desligar paciente:", err);
      setError(err.message || 'Erro ao processar desligamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const currentMotivoObj = MOTIVOS_DESLIGAMENTO_OPTIONS.find(m => m.id === motivo) || MOTIVOS_DESLIGAMENTO_OPTIONS[0];

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
      onClick={() => !loading && onClose()}
    >
      <div 
        className="glass-panel animate-in"
        style={{
          background: 'var(--surface-solid, #ffffff)',
          width: '100%',
          maxWidth: '520px',
          borderRadius: '20px',
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: loading ? 'not-allowed' : 'pointer',
            padding: '4px'
          }}
          title="Fechar"
        >
          <X size={18} />
        </button>

        {/* Ícone e Cabeçalho */}
        <div className="flex items-start gap-3.5 mb-4">
          <div 
            style={{
              padding: '12px',
              borderRadius: '14px',
              background: '#fff1f2',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <UserMinus size={24} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight" style={{ lineHeight: '1.2', margin: 0 }}>
              Desligar Paciente
            </h3>
            <p className="text-xs text-slate-500 mt-1" style={{ margin: 0 }}>
              Retirada do paciente da sua coorte de atendimento
            </p>
          </div>
        </div>

        {/* Mensagem de Erro se houver */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.65rem 0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        {/* Card Resumo do Paciente */}
        <div 
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '3px' }}>
            {patient.nome}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
            {patient.clinica && <span>🏥 {patient.clinica}</span>}
            {patient.turno && <span>• ⏰ {patient.turno}</span>}
            {patient.cpf && <span>• CPF: {patient.cpf}</span>}
          </div>
        </div>

        {/* Formulário de Desligamento */}
        <div className="flex flex-col gap-3.5 mb-4">
          {/* Seletor de Motivo */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Motivo do Desligamento *
            </label>
            <select
              className="input-field"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={loading}
              style={{ width: '100%', fontSize: '0.88rem', fontWeight: '600' }}
            >
              {MOTIVOS_DESLIGAMENTO_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            {currentMotivoObj && (
              <span className="text-[11px] text-slate-500 block mt-1">
                ℹ️ {currentMotivoObj.descricao}
              </span>
            )}
          </div>

          {/* Campo Data da Ocorrência */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Data da Ocorrência
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                className="input-field"
                value={dataOcorrencia}
                onChange={(e) => setDataOcorrencia(e.target.value)}
                disabled={loading}
                style={{ width: '100%', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Campo Observações Opcionais */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Observações Clínicas (Opcional)
            </label>
            <textarea
              className="input-field"
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={loading}
              placeholder="Ex: Encaminhado com laudo para Hospital X; ou alta da diálise por melhora da creatinina..."
              style={{ width: '100%', fontSize: '0.82rem', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Alerta de Confirmação */}
        <div 
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '0.75rem 0.95rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}
        >
          <AlertTriangle size={17} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.78rem', color: '#92400e', lineHeight: '1.35' }}>
            Ao confirmar, o paciente será desvinculado e retirado da lista ativa do seu cadastro médico.
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '0.55rem 1.1rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              borderRadius: '10px'
            }}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              borderRadius: '10px',
              background: '#e11d48',
              color: '#ffffff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.25)'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Desligando...</span>
              </>
            ) : (
              <>
                <UserMinus size={16} />
                <span>Desligar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
