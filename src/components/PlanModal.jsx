import React, { useState, useEffect } from 'react';
import { X, Save, Zap, Loader2 } from 'lucide-react';
import { saveSystemPlan } from '../services/financialService';

export default function PlanModal({ isOpen, onClose, planToEdit = null, adminEmail = 'admin@nefroapp.com', onSaved }) {
  const [formData, setFormData] = useState({
    id: '',
    nome: '',
    descricao: '',
    valor: 490.00,
    intervalo: 'mensal', // 'mensal' | 'anual' | 'trial'
    status: 'Ativo',
    destaque: false,
    recursosText: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (planToEdit) {
      setFormData({
        id: planToEdit.id || '',
        nome: planToEdit.nome || '',
        descricao: planToEdit.descricao || '',
        valor: planToEdit.valor !== undefined ? planToEdit.valor : 490.00,
        intervalo: planToEdit.intervalo || 'mensal',
        status: planToEdit.status || 'Ativo',
        destaque: !!planToEdit.destaque,
        recursosText: Array.isArray(planToEdit.recursos) ? planToEdit.recursos.join('\n') : ''
      });
    } else {
      setFormData({
        id: '',
        nome: '',
        descricao: '',
        valor: 490.00,
        intervalo: 'mensal',
        status: 'Ativo',
        destaque: false,
        recursosText: 'Prontuários Ilimitados\nControle de Diálise & Prescrições\nAlertas Laboratoriais e Ciclos'
      });
    }
    setError('');
  }, [isOpen, planToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      setError('Por favor, informe o nome do plano.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const recursosArray = formData.recursosText
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      const payload = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        valor: Number(formData.valor) || 0,
        intervalo: formData.intervalo,
        status: formData.status,
        destaque: formData.destaque,
        recursos: recursosArray
      };

      await saveSystemPlan(payload, planToEdit?.id, adminEmail);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar plano no Cloud Firestore.');
    } finally {
      setSaving(false);
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
        backgroundColor: 'rgba(15, 23, 42, 0.65)', 
        backdropFilter: 'blur(6px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-in" 
        style={{ 
          background: 'var(--surface-solid)', 
          width: '100%', 
          maxWidth: '520px', 
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem', 
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Zap size={22} color="#eab308" />
            <div>
              <h2 className="text-lg font-bold">
                {planToEdit ? 'Editar Plano de Assinatura' : 'Criar Novo Plano Médico'}
              </h2>
              <span className="text-xs text-muted">Configuração salva no Cloud Firestore</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold mb-1 block">Nome do Plano *</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Plano Mensal Nefrologia" 
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block">Descrição Curta</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Ex: Acesso completo a prontuários e diálise" 
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="text-xs font-semibold mb-1 block">Valor (R$) *</label>
              <input 
                type="number" 
                step="0.01" 
                className="input-field" 
                placeholder="490.00" 
                value={formData.valor}
                onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block">Ciclo de Cobrança</label>
              <select 
                className="input-field"
                value={formData.intervalo}
                onChange={(e) => setFormData(prev => ({ ...prev, intervalo: e.target.value }))}
              >
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
                <option value="trial">Trial (Demonstração)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="text-xs font-semibold mb-1 block">Status</label>
              <select 
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="Ativo">🟢 Ativo (Disponível)</option>
                <option value="Inativo">🔴 Inativo (Oculto)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input 
                  type="checkbox" 
                  checked={formData.destaque}
                  onChange={(e) => setFormData(prev => ({ ...prev, destaque: e.target.checked }))}
                />
                <span>Destacar Plano (Recomendado)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block">Recursos e Benefícios (1 por linha)</label>
            <textarea 
              className="input-field" 
              rows={3}
              placeholder="Recurso 1&#10;Recurso 2&#10;Recurso 3"
              value={formData.recursosText}
              onChange={(e) => setFormData(prev => ({ ...prev, recursosText: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t mt-1">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              <span>{saving ? 'Salvando...' : 'Salvar Plano'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
