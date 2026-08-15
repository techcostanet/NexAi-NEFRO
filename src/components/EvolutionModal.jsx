import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Activity, AlertTriangle, Clock, User, Loader2 } from 'lucide-react';
import { savePatientEvolution } from '../services/patientService';

export default function EvolutionModal({ 
  isOpen, 
  onClose, 
  patientId, 
  evolutionToEdit = null, 
  doctorInfo = null,
  onSaved 
}) {
  const [formData, setFormData] = useState({
    dataHora: '',
    tipoAtendimento: 'Ronda de Hemodiálise',
    intercorrencias: 'Nenhuma',
    paPre: '',
    paPos: '',
    pesoPre: '',
    pesoPos: '',
    ufRetirada: '',
    qbEfetivo: '',
    condutaClinica: '',
    medicoNome: '',
    medicoCrm: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (evolutionToEdit) {
      setFormData({
        id: evolutionToEdit.id,
        dataHora: evolutionToEdit.dataHora ? evolutionToEdit.dataHora.slice(0, 16) : new Date().toISOString().slice(0, 16),
        tipoAtendimento: evolutionToEdit.tipoAtendimento || 'Ronda de Hemodiálise',
        intercorrencias: evolutionToEdit.intercorrencias || 'Nenhuma',
        paPre: evolutionToEdit.paPre || '',
        paPos: evolutionToEdit.paPos || '',
        pesoPre: evolutionToEdit.pesoPre || '',
        pesoPos: evolutionToEdit.pesoPos || '',
        ufRetirada: evolutionToEdit.ufRetirada || '',
        qbEfetivo: evolutionToEdit.qbEfetivo || '',
        condutaClinica: evolutionToEdit.condutaClinica || '',
        medicoNome: evolutionToEdit.medicoNome || doctorInfo?.nome || 'Médico Nefrologista',
        medicoCrm: evolutionToEdit.medicoCrm || doctorInfo?.crm ? `${doctorInfo.crm}/${doctorInfo.ufCrm || 'SP'}` : ''
      });
    } else {
      const now = new Date();
      // Formato YYYY-MM-DDTHH:MM para input datetime-local
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      
      setFormData({
        dataHora: localIso,
        tipoAtendimento: 'Ronda de Hemodiálise',
        intercorrencias: 'Nenhuma',
        paPre: '130/80',
        paPos: '120/80',
        pesoPre: '',
        pesoPos: '',
        ufRetirada: '2000',
        qbEfetivo: '300',
        condutaClinica: '',
        medicoNome: doctorInfo?.nome || 'Dra. Gisele',
        medicoCrm: doctorInfo?.crm ? `${doctorInfo.crm}/${doctorInfo.ufCrm || 'SP'}` : '123456/SP'
      });
    }
    setError('');
  }, [evolutionToEdit, isOpen, doctorInfo]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.condutaClinica.trim()) {
      setError('Por favor, descreva a evolução e a conduta médica.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await savePatientEvolution(patientId, formData, evolutionToEdit?.id);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar evolução médica no Cloud Firestore.');
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
          maxWidth: '650px', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          padding: '1.75rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          borderRadius: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <FileText size={22} color="var(--primary)" />
            <div>
              <h2 className="text-lg font-bold">
                {evolutionToEdit ? 'Editar Evolução Médica' : 'Nova Evolução da Ronda de Hemodiálise'}
              </h2>
              <span className="text-xs text-muted">Registro clínico oficial no Cloud Firestore</span>
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label className="text-xs font-semibold mb-1 block text-slate-700">Data e Hora da Ronda *</label>
              <input 
                type="datetime-local" 
                className="input-field" 
                value={formData.dataHora}
                onChange={(e) => setFormData(prev => ({ ...prev, dataHora: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block text-slate-700">Tipo de Atendimento</label>
              <select 
                className="input-field"
                value={formData.tipoAtendimento}
                onChange={(e) => setFormData(prev => ({ ...prev, tipoAtendimento: e.target.value }))}
              >
                <option value="Ronda de Hemodiálise">🏥 Ronda de Hemodiálise</option>
                <option value="Consulta Ambulatorial">🩺 Consulta Ambulatorial</option>
                <option value="Interconsulta Hospitalar">🏨 Interconsulta Hospitalar</option>
                <option value="Avaliação de Acesso Vascular">🩸 Avaliação de Acesso</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block text-slate-700">Intercorrências da Sessão</label>
            <select 
              className="input-field"
              value={formData.intercorrencias}
              onChange={(e) => setFormData(prev => ({ ...prev, intercorrencias: e.target.value }))}
            >
              <option value="Nenhuma">🟢 Nenhuma intercorrência (Sessão estável)</option>
              <option value="Hipotensão Intradilítica">⚠️ Hipotensão Intradilítica</option>
              <option value="Coagulação de Sistema / Capilar">🩸 Coagulação de Sistema</option>
              <option value="Câimbras Musculares Intensas">⚡ Câimbras Musculares</option>
              <option value="Febre / Calafrios (Suspeita Infecciosa)">🌡️ Febre ou Calafrios</option>
              <option value="Sangramento no Sítio de Punção">🩹 Sangramento em Acesso</option>
              <option value="Outra Intercorrência">ℹ️ Outra intercorrência</option>
            </select>
          </div>

          {/* Parâmetros Dialíticos da Sessão */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Parâmetros e Sinais Vitais da Sessão
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.5rem' }}>
              <div>
                <label className="text-xs text-muted block mb-0.5">PA Pré</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="130/80" 
                  value={formData.paPre}
                  onChange={(e) => setFormData(prev => ({ ...prev, paPre: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-0.5">PA Pós</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="120/80" 
                  value={formData.paPos}
                  onChange={(e) => setFormData(prev => ({ ...prev, paPos: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-0.5">Peso Pré (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="input-field" 
                  placeholder="Ex: 72.5" 
                  value={formData.pesoPre}
                  onChange={(e) => setFormData(prev => ({ ...prev, pesoPre: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-0.5">UF (ml)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Ex: 2200" 
                  value={formData.ufRetirada}
                  onChange={(e) => setFormData(prev => ({ ...prev, ufRetirada: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-0.5">Qb (ml/min)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Ex: 300" 
                  value={formData.qbEfetivo}
                  onChange={(e) => setFormData(prev => ({ ...prev, qbEfetivo: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Texto da Evolução e Conduta */}
          <div>
            <label className="text-xs font-semibold mb-1 block text-slate-700">Evolução Clínica & Conduta Médica *</label>
            <textarea 
              className="input-field" 
              rows={4}
              placeholder="Descreva o estado clínico do paciente durante a ronda, estabilidade hemodinâmica, ajustes em prescrições ou encaminhamentos..."
              value={formData.condutaClinica}
              onChange={(e) => setFormData(prev => ({ ...prev, condutaClinica: e.target.value }))}
              required
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="text-xs text-muted block mb-0.5">Médico Responsável</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.medicoNome}
                onChange={(e) => setFormData(prev => ({ ...prev, medicoNome: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-0.5">CRM / UF</label>
              <input 
                type="text" 
                className="input-field" 
                value={formData.medicoCrm}
                onChange={(e) => setFormData(prev => ({ ...prev, medicoCrm: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t mt-1">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? 'Salvando...' : 'Salvar Evolução'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
