import React, { useState, useEffect } from 'react';
import { X, Sliders, CheckCircle2, AlertCircle } from 'lucide-react';
import { LOCALIZACOES_ACESSO_COMUNS } from '../../services/patientService.js';

export default function AccessParametersModal({
  isOpen,
  onClose,
  onSave,
  patient = null
}) {
  const [formData, setFormData] = useState({
    tipo: 'FAV',
    ladoMembro: '',
    fluxoSangue: 350,
    fluxoDialisato: 500,
    agulha: '16G',
    dataConfeccao: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (patient?.acessoVascular) {
      setFormData({
        tipo: patient.acessoVascular.tipo || 'FAV',
        ladoMembro: patient.acessoVascular.ladoMembro || '',
        fluxoSangue: patient.acessoVascular.fluxoSangue || 350,
        fluxoDialisato: patient.acessoVascular.fluxoDialisato || 500,
        agulha: patient.acessoVascular.agulha || '16G',
        dataConfeccao: patient.acessoVascular.dataConfeccao || ''
      });
    }
    setError('');
  }, [patient, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar parâmetros de acesso:', err);
      setError('Falha ao salvar parâmetros. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        className="modal-container"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-800">
                Parâmetros do Acesso
              </h2>
              <p className="text-xs text-slate-500">
                Configuração clínica e hemodinâmica vigente
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Tipo de Acesso
              </label>
              <select
                className="input-field w-full text-xs"
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
              >
                <option value="FAV">FAV (Fístula)</option>
                <option value="Permcath">Permcath</option>
                <option value="Cateter Duplo Lúmen">Cateter Duplo Lúmen</option>
                <option value="Prótese PTFE">Prótese PTFE</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Data Confecção ou Implante
              </label>
              <input 
                type="date"
                className="input-field w-full text-xs"
                value={formData.dataConfeccao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataConfeccao: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Localização Anatômica
            </label>
            <input 
              type="text"
              list="param-locais-list"
              className="input-field w-full text-xs"
              placeholder="Ex: MSE (Radiocefálica), Jugular D"
              value={formData.ladoMembro}
              onChange={(e) => setFormData(prev => ({ ...prev, ladoMembro: e.target.value }))}
            />
            <datalist id="param-locais-list">
              {LOCALIZACOES_ACESSO_COMUNS.map(loc => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Qb Sangue (ml/min)
              </label>
              <input 
                type="number"
                className="input-field w-full text-xs"
                value={formData.fluxoSangue}
                onChange={(e) => setFormData(prev => ({ ...prev, fluxoSangue: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Qd Dialisato (ml/min)
              </label>
              <input 
                type="number"
                className="input-field w-full text-xs"
                value={formData.fluxoDialisato}
                onChange={(e) => setFormData(prev => ({ ...prev, fluxoDialisato: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Agulha ou Calibre
              </label>
              <input 
                type="text"
                className="input-field w-full text-xs"
                placeholder="Ex: 15G, 16G"
                value={formData.agulha}
                onChange={(e) => setFormData(prev => ({ ...prev, agulha: e.target.value }))}
              />
            </div>
          </div>

          <div 
            style={{
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ 
                padding: '0.5rem 1.5rem', 
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{saving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
