import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Loader2, 
  Sparkles,
  Scale,
  Calendar,
  Clock,
  Activity,
  HeartPulse,
  Info
} from 'lucide-react';
import { updatePatientPartial, ETIOLOGIAS_DRC_PADRAO, LOCALIZACOES_ACESSO_COMUNS } from '../services/patientService';

export default function EvolutionChecklistModal({
  isOpen,
  onClose,
  patient,
  auditResult,
  onComplete
}) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !patient) return;

    // Inicializa valores a partir do paciente ou padrões
    const initial = {
      pesoSeco: patient.pesoSeco || '',
      etiologiaDRC: patient.etiologiaDRC || 'Nefropatia Diabética',
      tipoAcesso: patient.tipoAcesso || patient.acessoVascular?.tipo || 'FAV',
      posicaoAcesso: patient.posicaoAcesso || patient.acessoVascular?.ladoMembro || 'MSE (Radiocefálica)',
      dataInicioDialise: patient.dataInicioDialise || '',
      turno: patient.turno || 'Manhã',
      diaSemana: patient.diaSemana || 'Seg/Qua/Sex'
    };

    setFormData(initial);
    setError('');
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  const missingFields = auditResult?.missingFields || [];
  const clinicalAlerts = auditResult?.clinicalAlerts || [];
  const score = auditResult?.score || 0;

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAndGenerate = async (e) => {
    e.preventDefault();
    setError('');

    // Validação dos campos críticos
    if (missingFields.some(f => f.key === 'pesoSeco')) {
      const peso = parseFloat(String(formData.pesoSeco).replace(',', '.'));
      if (isNaN(peso) || peso <= 0) {
        setError('Por favor, informe um peso seco válido (maior que zero).');
        return;
      }
    }

    if (missingFields.some(f => f.key === 'dataInicioDialise')) {
      if (!formData.dataInicioDialise) {
        setError('Por favor, selecione a data de início da diálise.');
        return;
      }
    }

    try {
      setSaving(true);
      // Prepara objeto com apenas os campos preenchidos
      const payload = {};
      missingFields.forEach(field => {
        if (field.key === 'pesoSeco') {
          payload.pesoSeco = parseFloat(String(formData.pesoSeco).replace(',', '.'));
        } else {
          payload[field.key] = formData[field.key];
        }
      });

      // Atualiza o documento mestre do paciente no Cloud Firestore
      await updatePatientPartial(patient.id, payload);

      if (onComplete) {
        onComplete(payload);
      }
      onClose();
    } catch (err) {
      console.error("Erro ao salvar dados pendentes no Firestore:", err);
      setError('Erro ao salvar informações no Cloud Firestore. Tente novamente.');
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
        backgroundColor: 'rgba(15, 23, 42, 0.7)', 
        backdropFilter: 'blur(6px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 10001,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-in" 
        style={{ 
          background: 'var(--surface-solid, #ffffff)', 
          width: '100%', 
          maxWidth: '620px', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          borderRadius: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-4 border-b pb-3" style={{ borderColor: 'var(--border, #e2e8f0)' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Auditoria de Prontuário
              </h2>
              <p className="text-xs text-slate-500">
                Complete as pendências para gerar a evolução com máxima conformidade.
              </p>
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

        {/* Card de Score de Conformidade */}
        <div style={{
          background: score >= 80 ? 'rgba(34, 197, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          border: `1px solid ${score >= 80 ? '#bbf7d0' : '#fde68a'}`,
          borderRadius: '14px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <div className="flex items-center gap-2">
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: score >= 80 ? '#15803d' : '#b45309'
              }}>
                Completude do Prontuário: {score}%
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0 0' }}>
              {missingFields.length === 1 
                ? 'Resta apenas 1 dado essencial pendente.' 
                : `Restam ${missingFields.length} dados essenciais pendentes para a evolução.`}
            </p>
          </div>

          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: score >= 80 ? '#dcfce7' : '#fef3c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '0.9rem',
            color: score >= 80 ? '#15803d' : '#b45309',
            flexShrink: 0
          }}>
            {score}%
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSaveAndGenerate} className="flex flex-col gap-3">
          <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1">
            Preenchimento Rápido no Prontuário
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {/* 1. Peso Seco */}
            {missingFields.some(f => f.key === 'pesoSeco') && (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Scale size={14} className="text-amber-600" />
                  <span>Peso Seco (kg) *</span>
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="input-field" 
                  placeholder="Ex: 68.5"
                  value={formData.pesoSeco}
                  onChange={(e) => handleChange('pesoSeco', e.target.value)}
                  required
                  autoFocus
                />
                <span className="text-[11px] text-slate-500 block mt-1">Alvo ponderal para taxa de ultrafiltração.</span>
              </div>
            )}

            {/* 2. Etiologia da DRC */}
            {missingFields.some(f => f.key === 'etiologiaDRC') && (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Activity size={14} className="text-amber-600" />
                  <span>Etiologia da DRC *</span>
                </label>
                <select 
                  className="input-field"
                  value={formData.etiologiaDRC}
                  onChange={(e) => handleChange('etiologiaDRC', e.target.value)}
                  required
                >
                  {ETIOLOGIAS_DRC_PADRAO.map(eti => (
                    <option key={eti} value={eti}>{eti}</option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 block mt-1">Diagnóstico causal da perda renal.</span>
              </div>
            )}

            {/* 3. Tipo de Acesso Vascular */}
            {missingFields.some(f => f.key === 'tipoAcesso') && (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <HeartPulse size={14} className="text-amber-600" />
                  <span>Tipo de Acesso *</span>
                </label>
                <select 
                  className="input-field"
                  value={formData.tipoAcesso}
                  onChange={(e) => handleChange('tipoAcesso', e.target.value)}
                  required
                >
                  <option value="FAV">FAV (Fístula Arteriovenosa)</option>
                  <option value="Permcath">Permcath (Cateter Longa Permanência)</option>
                  <option value="Cateter Duplo Lúmen">Cateter Duplo Lúmen (Curta Permanência)</option>
                  <option value="Prótese">Prótese Vascular (PTFE)</option>
                </select>
                <span className="text-[11px] text-slate-500 block mt-1">Acesso vascular em uso regular.</span>
              </div>
            )}

            {/* 4. Localização do Acesso */}
            {missingFields.some(f => f.key === 'posicaoAcesso') && (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <HeartPulse size={14} className="text-amber-600" />
                  <span>Localização do Acesso *</span>
                </label>
                <select 
                  className="input-field"
                  value={formData.posicaoAcesso}
                  onChange={(e) => handleChange('posicaoAcesso', e.target.value)}
                  required
                >
                  {LOCALIZACOES_ACESSO_COMUNS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                  <option value="Outro membro/sítio">Outro membro/sítio</option>
                </select>
                <span className="text-[11px] text-slate-500 block mt-1">Membro ou vaso canalizado.</span>
              </div>
            )}

            {/* 5. Início da Diálise */}
            {missingFields.some(f => f.key === 'dataInicioDialise') && (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Calendar size={14} className="text-amber-600" />
                  <span>Início da Diálise *</span>
                </label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formData.dataInicioDialise}
                  onChange={(e) => handleChange('dataInicioDialise', e.target.value)}
                  required
                />
                <span className="text-[11px] text-slate-500 block mt-1">Data de início em TRS para cálculo do tempo crônico.</span>
              </div>
            )}

            {/* 6. Turno */}
            {missingFields.some(f => f.key === 'turno') && (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Clock size={14} className="text-amber-600" />
                  <span>Turno *</span>
                </label>
                <select 
                  className="input-field"
                  value={formData.turno}
                  onChange={(e) => handleChange('turno', e.target.value)}
                  required
                >
                  <option value="Manhã">Manhã (1º Turno)</option>
                  <option value="Tarde">Tarde (2º Turno)</option>
                  <option value="Noite">Noite (3º Turno)</option>
                </select>
                <span className="text-[11px] text-slate-500 block mt-1">Turno de atendimento na clínica.</span>
              </div>
            )}

            {/* 7. Dias da Semana */}
            {missingFields.some(f => f.key === 'diaSemana') && (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                  <Calendar size={14} className="text-amber-600" />
                  <span>Escala Semanal *</span>
                </label>
                <select 
                  className="input-field"
                  value={formData.diaSemana}
                  onChange={(e) => handleChange('diaSemana', e.target.value)}
                  required
                >
                  <option value="Seg/Qua/Sex">Seg/Qua/Sex</option>
                  <option value="Ter/Qui/Sáb">Ter/Qui/Sáb</option>
                  <option value="Diário">Diário</option>
                  <option value="4x por semana">4x por semana</option>
                </select>
                <span className="text-[11px] text-slate-500 block mt-1">Dias fixos de hemodiálise.</span>
              </div>
            )}
          </div>

          {/* Avisos Clínicos Laboratoriais (se houver) */}
          {clinicalAlerts.length > 0 && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.75rem 0.9rem',
              marginTop: '0.5rem'
            }}>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                <Info size={14} className="text-blue-600" />
                <span>Observações de Rotina Laboratorial</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-0.5 list-disc list-inside">
                {clinicalAlerts.map((alert, idx) => (
                  <li key={idx}>{alert}</li>
                ))}
              </ul>
              <span className="text-[10px] text-slate-400 block mt-1">
                * Os exames ausentes serão citados na evolução conforme o cronograma mensal regular da clínica.
              </span>
            </div>
          )}

          {/* Botões do Rodapé */}
          <div className="flex justify-end gap-2 pt-3 border-t mt-3" style={{ borderColor: 'var(--border, #e2e8f0)' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={onClose}
              disabled={saving}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              <span>{saving ? 'Salvando...' : 'Completar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
