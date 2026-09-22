import React, { useState } from 'react';
import { UserX, AlertTriangle, Loader2, X } from 'lucide-react';
import { deletePatient } from '../services/patientService.js';

export default function ConfirmDeceasedModal({
  isOpen,
  onClose,
  patient,
  onSuccess
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !patient) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      await deletePatient(patient.id, patient.doctorId, patient.nome, 'OBITO');
      if (onSuccess) {
        onSuccess(patient);
      }
      onClose();
    } catch (err) {
      console.error("Erro ao remover paciente por óbito:", err);
      setError(err.message || 'Erro ao remover paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: '480px',
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
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <UserX size={26} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight" style={{ lineHeight: '1.2' }}>
              Confirmar Desligamento por Óbito
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Retirada definitiva do cadastro do paciente
            </p>
          </div>
        </div>

        {/* Mensagem de Erro se houver */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.65rem 0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8rem' }}>
            {error}
          </div>
        )}

        {/* Card do Paciente */}
        <div 
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
            {patient.nome}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 flex-wrap">
            {patient.clinica && <span>🏥 {patient.clinica}</span>}
            {patient.turno && <span>• ⏰ {patient.turno}</span>}
            {patient.cpf && <span>• CPF: {patient.cpf}</span>}
          </div>
        </div>

        {/* Alerta de Diretriz Clínica */}
        <div 
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}
        >
          <AlertTriangle size={18} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.80rem', color: '#92400e', lineHeight: '1.4' }}>
            <strong>Atenção:</strong> Conforme solicitado, ao confirmar o óbito, todos os dados clínicos, exames laboratoriais e prescrições deste paciente serão <strong>permanentemente excluídos</strong> da nuvem.
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
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Removendo...</span>
              </>
            ) : (
              <>
                <UserX size={16} />
                <span>Confirmar Óbito e Remover</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
