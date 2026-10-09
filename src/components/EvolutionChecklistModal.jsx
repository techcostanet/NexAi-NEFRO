import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Loader2, 
  Sparkles,
  Scale,
  Calendar,
  Clock,
  Activity,
  HeartPulse,
  Info,
  Sliders,
  Check
} from 'lucide-react';
import { updatePatientPartial, ETIOLOGIAS_DRC_PADRAO, LOCALIZACOES_ACESSO_COMUNS } from '../services/patientService';
import EvolutionTemplateModal from './EvolutionTemplateModal';

export default function EvolutionChecklistModal({
  isOpen,
  onClose,
  patient,
  doctorInfo,
  auditResult,
  onComplete,
  onDoctorConfigUpdated
}) {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !patient) return;

    // Inicializa valores a partir do paciente ou padrões
    const initial = {
      pesoSeco: patient.pesoSeco !== undefined && patient.pesoSeco !== null ? String(patient.pesoSeco) : '',
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
  const isAllComplete = score === 100;

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAndGenerate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    // Extrai valores com fallbacks seguros para nunca impedir a geração
    const parsedPeso = parseFloat(String(formData.pesoSeco || '').replace(',', '.'));
    const validPeso = (!isNaN(parsedPeso) && parsedPeso > 0) ? parsedPeso : (parseFloat(patient.pesoSeco) || 70);

    const payload = {
      pesoSeco: validPeso,
      etiologiaDRC: formData.etiologiaDRC || patient.etiologiaDRC || 'Nefropatia Diabética',
      tipoAcesso: formData.tipoAcesso || patient.tipoAcesso || patient.acessoVascular?.tipo || 'FAV',
      posicaoAcesso: formData.posicaoAcesso || patient.posicaoAcesso || patient.acessoVascular?.ladoMembro || 'MSE (Radiocefálica)',
      dataInicioDialise: formData.dataInicioDialise || patient.dataInicioDialise || '',
      turno: formData.turno || patient.turno || 'Manhã',
      diaSemana: formData.diaSemana || patient.diaSemana || 'Seg/Qua/Sex'
    };

    try {
      setSaving(true);

      // Grava no Cloud Firestore de forma persistente se houver ID
      if (patient?.id) {
        try {
          await updatePatientPartial(patient.id, payload);
        } catch (dbErr) {
          console.warn("Falha ao salvar dados parciais no Firestore, prosseguindo com a geração:", dbErr);
        }
      }

      if (onComplete) {
        onComplete(payload);
      }
      onClose();
    } catch (err) {
      console.error("Erro ao gerar evolução a partir do checklist:", err);
      // Mesmo em erro inesperado, tenta invocar onComplete
      if (onComplete) {
        onComplete(payload);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.72)', 
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
            maxWidth: '660px', 
            maxHeight: '92vh', 
            overflowY: 'auto', 
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
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
                background: isAllComplete 
                  ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' 
                  : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isAllComplete ? '#059669' : '#2563eb'
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {isAllComplete ? 'Revisão de Parâmetros' : 'Auditoria de Prontuário'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isAllComplete 
                    ? 'Dados auditados. Revise os parâmetros abaixo antes de gerar.' 
                    : 'Complete as pendências para gerar a evolução com conformidade.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => setIsTemplateModalOpen(true)}
                className="btn btn-outline"
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontWeight: '600',
                  color: '#475569'
                }}
                title="Configurar seções e ordem do seu modelo de evolução"
              >
                <Sliders size={13} />
                <span>Configurar</span>
              </button>

              <button 
                type="button" 
                onClick={onClose} 
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Card de Score de Conformidade */}
          <div style={{
            background: isAllComplete ? 'rgba(34, 197, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
            border: `1px solid ${isAllComplete ? '#bbf7d0' : '#fde68a'}`,
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
                  color: isAllComplete ? '#15803d' : '#b45309'
                }}>
                  {isAllComplete ? 'Prontuário 100% Completo' : `Completude do Prontuário: ${score}%`}
                </span>
                {isAllComplete && <Check size={14} className="text-emerald-600 font-bold" />}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0 0' }}>
                {isAllComplete
                  ? 'Todos os parâmetros críticos estão preenchidos e validados.'
                  : `Restam ${missingFields.length} ${missingFields.length === 1 ? 'dado essencial pendente' : 'dados essenciais pendentes'}.`}
              </p>
            </div>

            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: isAllComplete ? '#dcfce7' : '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '0.9rem',
              color: isAllComplete ? '#15803d' : '#b45309',
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
            <div className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1 flex justify-between items-center">
              <span>Parâmetros de Alimentação da Evolução</span>
              <span className="text-[11px] text-slate-400 font-normal">Editável a qualquer momento</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.85rem' }}>
              {/* 1. Peso Seco */}
              <div className={`p-3 rounded-xl border ${missingFields.some(f => f.key === 'pesoSeco') ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Scale size={14} className={missingFields.some(f => f.key === 'pesoSeco') ? 'text-amber-600' : 'text-blue-600'} />
                    <span>Peso Seco (kg) *</span>
                  </label>
                  {!missingFields.some(f => f.key === 'pesoSeco') && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Conforme
                    </span>
                  )}
                </div>
                <input 
                  type="number" 
                  step="0.1" 
                  className="input-field" 
                  placeholder="Ex: 68.5"
                  value={formData.pesoSeco}
                  onChange={(e) => handleChange('pesoSeco', e.target.value)}
                />
                <span className="text-[11px] text-slate-500 block mt-1">Alvo ponderal para taxa de ultrafiltração.</span>
              </div>

              {/* 2. Etiologia da DRC */}
              <div className={`p-3 rounded-xl border ${missingFields.some(f => f.key === 'etiologiaDRC') ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Activity size={14} className={missingFields.some(f => f.key === 'etiologiaDRC') ? 'text-amber-600' : 'text-blue-600'} />
                    <span>Etiologia da DRC *</span>
                  </label>
                  {!missingFields.some(f => f.key === 'etiologiaDRC') && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Conforme
                    </span>
                  )}
                </div>
                <select 
                  className="input-field"
                  value={formData.etiologiaDRC}
                  onChange={(e) => handleChange('etiologiaDRC', e.target.value)}
                >
                  {ETIOLOGIAS_DRC_PADRAO.map(eti => (
                    <option key={eti} value={eti}>{eti}</option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-500 block mt-1">Diagnóstico causal da perda renal.</span>
              </div>

              {/* 3. Tipo de Acesso Vascular */}
              <div className={`p-3 rounded-xl border ${missingFields.some(f => f.key === 'tipoAcesso') ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <HeartPulse size={14} className={missingFields.some(f => f.key === 'tipoAcesso') ? 'text-amber-600' : 'text-blue-600'} />
                    <span>Tipo de Acesso *</span>
                  </label>
                  {!missingFields.some(f => f.key === 'tipoAcesso') && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Conforme
                    </span>
                  )}
                </div>
                <select 
                  className="input-field"
                  value={formData.tipoAcesso}
                  onChange={(e) => handleChange('tipoAcesso', e.target.value)}
                >
                  <option value="FAV">FAV (Fístula Arteriovenosa)</option>
                  <option value="Permcath">Permcath (Cateter Longa Permanência)</option>
                  <option value="Cateter Duplo Lúmen">Cateter Duplo Lúmen (Curta Permanência)</option>
                  <option value="Prótese">Prótese Vascular (PTFE)</option>
                </select>
                <span className="text-[11px] text-slate-500 block mt-1">Acesso vascular em uso regular.</span>
              </div>

              {/* 4. Localização do Acesso */}
              <div className={`p-3 rounded-xl border ${missingFields.some(f => f.key === 'posicaoAcesso') ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <HeartPulse size={14} className={missingFields.some(f => f.key === 'posicaoAcesso') ? 'text-amber-600' : 'text-blue-600'} />
                    <span>Localização do Acesso *</span>
                  </label>
                  {!missingFields.some(f => f.key === 'posicaoAcesso') && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Conforme
                    </span>
                  )}
                </div>
                <select 
                  className="input-field"
                  value={formData.posicaoAcesso}
                  onChange={(e) => handleChange('posicaoAcesso', e.target.value)}
                >
                  {LOCALIZACOES_ACESSO_COMUNS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                  <option value="Outro membro/sítio">Outro membro/sítio</option>
                </select>
                <span className="text-[11px] text-slate-500 block mt-1">Membro ou vaso canalizado.</span>
              </div>

              {/* 5. Início da Diálise */}
              <div className={`p-3 rounded-xl border ${missingFields.some(f => f.key === 'dataInicioDialise') ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar size={14} className={missingFields.some(f => f.key === 'dataInicioDialise') ? 'text-amber-600' : 'text-blue-600'} />
                    <span>Início da Diálise *</span>
                  </label>
                  {!missingFields.some(f => f.key === 'dataInicioDialise') && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Conforme
                    </span>
                  )}
                </div>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formData.dataInicioDialise}
                  onChange={(e) => handleChange('dataInicioDialise', e.target.value)}
                />
                <span className="text-[11px] text-slate-500 block mt-1">Data de início em TRS para cálculo cronológico.</span>
              </div>

              {/* 6. Turno */}
              <div className={`p-3 rounded-xl border ${missingFields.some(f => f.key === 'turno') ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock size={14} className={missingFields.some(f => f.key === 'turno') ? 'text-amber-600' : 'text-blue-600'} />
                    <span>Turno *</span>
                  </label>
                  {!missingFields.some(f => f.key === 'turno') && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Conforme
                    </span>
                  )}
                </div>
                <select 
                  className="input-field"
                  value={formData.turno}
                  onChange={(e) => handleChange('turno', e.target.value)}
                >
                  <option value="Manhã">Manhã (1º Turno)</option>
                  <option value="Tarde">Tarde (2º Turno)</option>
                  <option value="Noite">Noite (3º Turno)</option>
                </select>
                <span className="text-[11px] text-slate-500 block mt-1">Turno de atendimento na clínica.</span>
              </div>

              {/* 7. Dias da Semana */}
              <div className={`p-3 rounded-xl border ${missingFields.some(f => f.key === 'diaSemana') ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50/50'}`}>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar size={14} className={missingFields.some(f => f.key === 'diaSemana') ? 'text-amber-600' : 'text-blue-600'} />
                    <span>Escala Semanal *</span>
                  </label>
                  {!missingFields.some(f => f.key === 'diaSemana') && (
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Conforme
                    </span>
                  )}
                </div>
                <select 
                  className="input-field"
                  value={formData.diaSemana}
                  onChange={(e) => handleChange('diaSemana', e.target.value)}
                >
                  <option value="Seg/Qua/Sex">Seg/Qua/Sex</option>
                  <option value="Ter/Qui/Sáb">Ter/Qui/Sáb</option>
                  <option value="Diário">Diário</option>
                  <option value="4x por semana">4x por semana</option>
                </select>
                <span className="text-[11px] text-slate-500 block mt-1">Dias fixos de hemodiálise.</span>
              </div>
            </div>

            {/* Avisos Clínicos Laboratoriais (se houver) */}
            {clinicalAlerts.length > 0 && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.75rem 0.9rem',
                marginTop: '0.4rem'
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
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.35rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                <span>{saving ? 'Gravando...' : 'Gerar'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Configuração do Padrão de Evolução do Médico */}
      {isTemplateModalOpen && (
        <EvolutionTemplateModal 
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          doctorInfo={doctorInfo}
          onSaved={(newConfig) => {
            if (onDoctorConfigUpdated) {
              onDoctorConfigUpdated(newConfig);
            }
          }}
        />
      )}
    </>
  );
}
