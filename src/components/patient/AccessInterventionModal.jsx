import React, { useState, useEffect } from 'react';
import { X, Calendar, Activity, User, Building2, FileText, CheckCircle2, AlertCircle, Link } from 'lucide-react';
import { TIPOS_EVENTO_ACESSO, RESULTADOS_ACESSO, LOCALIZACOES_ACESSO_COMUNS } from '../../services/patientService.js';

export default function AccessInterventionModal({
  isOpen,
  onClose,
  onSave,
  interventionToEdit = null,
  patient = null,
  currentUser = null
}) {
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    tipoEvento: 'Angioplastia',
    acesso: 'FAV',
    ladoMembro: '',
    profissional: '',
    hospital: '',
    desfecho: 'Sucesso',
    descricao: '',
    conduta: '',
    anexoUrl: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (interventionToEdit) {
      setFormData({
        data: interventionToEdit.data || new Date().toISOString().split('T')[0],
        tipoEvento: interventionToEdit.tipoEvento || 'Angioplastia',
        acesso: interventionToEdit.acesso || patient?.acessoVascular?.tipo || 'FAV',
        ladoMembro: interventionToEdit.ladoMembro || patient?.acessoVascular?.ladoMembro || '',
        profissional: interventionToEdit.profissional || '',
        hospital: interventionToEdit.hospital || '',
        desfecho: interventionToEdit.desfecho || 'Sucesso',
        descricao: interventionToEdit.descricao || '',
        conduta: interventionToEdit.conduta || '',
        anexoUrl: interventionToEdit.anexoUrl || ''
      });
    } else {
      setFormData({
        data: new Date().toISOString().split('T')[0],
        tipoEvento: 'Angioplastia',
        acesso: patient?.acessoVascular?.tipo || 'FAV',
        ladoMembro: patient?.acessoVascular?.ladoMembro || '',
        profissional: currentUser?.nome ? `Dr(a). ${currentUser.nome}` : '',
        hospital: patient?.hospital || patient?.clinica || '',
        desfecho: 'Sucesso',
        descricao: '',
        conduta: '',
        anexoUrl: ''
      });
    }
    setError('');
  }, [interventionToEdit, patient, currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.data) {
      setError('Informe a data do procedimento.');
      return;
    }
    if (!formData.descricao.trim()) {
      setError('Descreva brevemente o procedimento ou manutenção.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await onSave(formData, interventionToEdit?.id || null);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar intervenção:', err);
      setError('Falha ao salvar no prontuário. Tente novamente.');
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
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
              <Activity size={20} />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-800">
                {interventionToEdit ? 'Editar Intervenção' : 'Registrar Intervenção'}
              </h2>
              <p className="text-xs text-slate-500">
                Histórico clínico e cirúrgico do acesso vascular
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

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Grid: Data, Tipo e Acesso */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Data do Evento *
              </label>
              <div className="relative">
                <input 
                  type="date"
                  className="input-field w-full text-xs"
                  value={formData.data}
                  onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Tipo de Evento *
              </label>
              <select
                className="input-field w-full text-xs"
                value={formData.tipoEvento}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoEvento: e.target.value }))}
              >
                {TIPOS_EVENTO_ACESSO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Acesso
              </label>
              <select
                className="input-field w-full text-xs"
                value={formData.acesso}
                onChange={(e) => setFormData(prev => ({ ...prev, acesso: e.target.value }))}
              >
                <option value="FAV">FAV (Fístula)</option>
                <option value="Permcath">Permcath</option>
                <option value="Cateter Duplo Lúmen">Cateter Duplo Lúmen</option>
                <option value="Prótese PTFE">Prótese PTFE</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          {/* Grid: Membro/Localização e Desfecho */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Localização Anatômica
              </label>
              <input 
                type="text"
                list="locais-comuns-list"
                className="input-field w-full text-xs"
                placeholder="Ex: MSE (Radiocefálica), Jugular D"
                value={formData.ladoMembro}
                onChange={(e) => setFormData(prev => ({ ...prev, ladoMembro: e.target.value }))}
              />
              <datalist id="locais-comuns-list">
                {LOCALIZACOES_ACESSO_COMUNS.map(loc => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Desfecho do Procedimento
              </label>
              <select
                className="input-field w-full text-xs"
                value={formData.desfecho}
                onChange={(e) => setFormData(prev => ({ ...prev, desfecho: e.target.value }))}
              >
                {RESULTADOS_ACESSO.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Profissional e Hospital */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Profissional Executante
              </label>
              <input 
                type="text"
                className="input-field w-full text-xs"
                placeholder="Ex: Dr. Marcelo (Vascular), Dra. Ana"
                value={formData.profissional}
                onChange={(e) => setFormData(prev => ({ ...prev, profissional: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Hospital ou Serviço
              </label>
              <input 
                type="text"
                className="input-field w-full text-xs"
                placeholder="Ex: Hospital Santa Casa, Hemodinâmica"
                value={formData.hospital}
                onChange={(e) => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
              />
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Descrição do Procedimento *
            </label>
            <textarea
              className="input-field w-full text-xs"
              rows={3}
              placeholder="Ex: Realizada angioplastia transluminal percutânea com balão 6x40mm em estenose de arco cefálico. Bom frêmito e restauração de fluxo imediato sem complicações."
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              required
            />
          </div>

          {/* Conduta / Instruções para Hemodiálise */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Conduta para Hemodiálise
            </label>
            <textarea
              className="input-field w-full text-xs"
              rows={2}
              placeholder="Ex: Liberada para hemodiálise na sessão regular. Evitar garroteamento excessivo nas primeiras 48h. Manter curativo limpo e seco."
              value={formData.conduta}
              onChange={(e) => setFormData(prev => ({ ...prev, conduta: e.target.value }))}
            />
          </div>

          {/* Link para Laudo ou Anexo */}
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Link de Laudo ou Exame (Opcional)
            </label>
            <input 
              type="url"
              className="input-field w-full text-xs"
              placeholder="https://exemplo.com/laudo-doppler.pdf"
              value={formData.anexoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, anexoUrl: e.target.value }))}
            />
          </div>

          {/* Footer com Botões Concisos */}
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
