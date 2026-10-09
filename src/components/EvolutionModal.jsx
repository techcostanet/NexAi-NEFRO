import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  FileText, 
  Loader2, 
  Sparkles, 
  Printer, 
  CheckCircle2, 
  Sliders,
  Copy,
  Check
} from 'lucide-react';
import { savePatientEvolution, addPatientWeightRecord, getPatientById } from '../services/patientService';
import { auditPatientEvolutionData, generateMonthlyEvolutionText } from '../utils/monthlyEvolutionGenerator';
import EvolutionChecklistModal from './EvolutionChecklistModal';
import EvolutionTemplateModal from './EvolutionTemplateModal';
import EvolutionPrintDocument from './EvolutionPrintDocument';
import { printElement } from '../utils/printUtils';

export default function EvolutionModal({ 
  isOpen, 
  onClose, 
  patient = null,
  patientId, 
  evolutionToEdit = null, 
  doctorInfo = null,
  onSaved 
}) {
  const [currentPatient, setCurrentPatient] = useState(patient);
  const [currentDoctorInfo, setCurrentDoctorInfo] = useState(doctorInfo);
  const [formData, setFormData] = useState({
    dataHora: '',
    tipoAtendimento: 'Hemodiálise',
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
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // Controla inicialização única para nunca sobrescrever a conduta gerada
  const initializedRef = useRef(false);

  // Sincroniza o paciente completo para alimentar o motor de evolução
  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false;
      return;
    }

    if (patient) {
      setCurrentPatient(patient);
    } else if (patientId) {
      getPatientById(patientId).then(p => {
        if (p) setCurrentPatient(p);
      });
    }
  }, [patient, patientId, isOpen]);

  useEffect(() => {
    if (doctorInfo) {
      setCurrentDoctorInfo(doctorInfo);
    }
  }, [doctorInfo]);

  // Inicializa o formulário exatamente uma vez ao abrir o modal
  useEffect(() => {
    if (!isOpen) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (evolutionToEdit) {
      setFormData({
        id: evolutionToEdit.id,
        dataHora: evolutionToEdit.dataHora ? evolutionToEdit.dataHora.slice(0, 16) : new Date().toISOString().slice(0, 16),
        tipoAtendimento: (evolutionToEdit.tipoAtendimento === 'Ronda de Hemodiálise' ? 'Hemodiálise' : evolutionToEdit.tipoAtendimento) || 'Hemodiálise',
        intercorrencias: evolutionToEdit.intercorrencias || 'Nenhuma',
        paPre: evolutionToEdit.paPre || '',
        paPos: evolutionToEdit.paPos || '',
        pesoPre: evolutionToEdit.pesoPre || '',
        pesoPos: evolutionToEdit.pesoPos || '',
        ufRetirada: evolutionToEdit.ufRetirada || '',
        qbEfetivo: evolutionToEdit.qbEfetivo || '',
        condutaClinica: evolutionToEdit.condutaClinica || '',
        medicoNome: evolutionToEdit.medicoNome || currentDoctorInfo?.nome || doctorInfo?.nome || 'Médico(a) Responsável',
        medicoCrm: evolutionToEdit.medicoCrm || (currentDoctorInfo?.crm ? `${currentDoctorInfo.crm}/${currentDoctorInfo?.ufCrm || 'SP'}` : '')
      });
    } else {
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      
      setFormData({
        dataHora: localIso,
        tipoAtendimento: 'Hemodiálise',
        intercorrencias: 'Nenhuma',
        paPre: '130/80',
        paPos: '120/80',
        pesoPre: (patient?.pesoSeco || currentPatient?.pesoSeco) ? String(patient?.pesoSeco || currentPatient?.pesoSeco) : '',
        pesoPos: '',
        ufRetirada: '2000',
        qbEfetivo: (patient?.acessoVascular?.fluxoSangue || currentPatient?.acessoVascular?.fluxoSangue) ? String(patient?.acessoVascular?.fluxoSangue || currentPatient?.acessoVascular?.fluxoSangue) : '300',
        condutaClinica: '',
        medicoNome: currentDoctorInfo?.nome || doctorInfo?.nome || 'Médico(a) Responsável',
        medicoCrm: currentDoctorInfo?.crm ? `${currentDoctorInfo.crm}/${currentDoctorInfo.ufCrm || 'SP'}` : (doctorInfo?.crm ? `${doctorInfo.crm}/${doctorInfo.ufCrm || 'SP'}` : '')
      });
    }
    setError('');
    setFeedbackMsg('');
  }, [isOpen, evolutionToEdit]);

  if (!isOpen) return null;

  // Disparo do Motor de Evolução com Auditoria Prévia
  // SEMPRE abre o modal de auditoria / confirmação de parâmetros (mesmo se 100%)
  const handleGenerateEvolution = () => {
    setError('');
    const targetPatient = currentPatient || patient;
    if (!targetPatient) {
      setError('Aguardando carregamento da ficha do paciente...');
      return;
    }

    const audit = auditPatientEvolutionData(targetPatient);
    setAuditResult(audit);
    setIsChecklistOpen(true);
  };

  const executeGeneration = (targetPatient, doctorOverride = null) => {
    const docToUse = doctorOverride || currentDoctorInfo || doctorInfo;
    const generatedText = generateMonthlyEvolutionText(targetPatient, docToUse, {
      qbEfetivo: formData.qbEfetivo || (targetPatient?.acessoVascular?.fluxoSangue ? String(targetPatient.acessoVascular.fluxoSangue) : '350'),
      pesoSeco: targetPatient?.pesoSeco
    });

    setFormData(prev => ({
      ...prev,
      condutaClinica: generatedText || prev.condutaClinica,
      pesoPre: prev.pesoPre || (targetPatient?.pesoSeco ? String(targetPatient.pesoSeco) : prev.pesoPre),
      qbEfetivo: prev.qbEfetivo || (targetPatient?.acessoVascular?.fluxoSangue ? String(targetPatient.acessoVascular.fluxoSangue) : '350')
    }));

    setFeedbackMsg('Evolução gerada com sucesso! Pronto para revisão ou cópia.');
    setTimeout(() => setFeedbackMsg(''), 5000);
  };

  const handleChecklistCompleted = (updatedFields) => {
    const basePatient = currentPatient || patient || {};
    const mergedPatient = {
      ...basePatient,
      ...updatedFields,
      acessoVascular: {
        ...(basePatient?.acessoVascular || {}),
        tipo: updatedFields.tipoAcesso || basePatient?.tipoAcesso || 'FAV',
        ladoMembro: updatedFields.posicaoAcesso || basePatient?.posicaoAcesso || ''
      }
    };
    setCurrentPatient(mergedPatient);
    executeGeneration(mergedPatient);
  };

  const handleDoctorConfigUpdated = (newConfig) => {
    const updatedDoc = {
      ...(currentDoctorInfo || doctorInfo || {}),
      configuracaoEvolucao: newConfig
    };
    setCurrentDoctorInfo(updatedDoc);
    setFeedbackMsg('Padrão de evolução atualizado.');
    setTimeout(() => setFeedbackMsg(''), 3500);

    // Se já havia gerado ou se o modal estiver aberto, pode re-executar com o novo modelo
    if (formData.condutaClinica && currentPatient) {
      executeGeneration(currentPatient, updatedDoc);
    }
  };

  const handleCopy = async () => {
    if (!formData.condutaClinica.trim()) {
      setError('Gere ou preencha a evolução antes de copiar.');
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(formData.condutaClinica);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = formData.condutaClinica;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setFeedbackMsg('Evolução copiada com sucesso para a área de transferência!');
      setTimeout(() => {
        setCopied(false);
        setFeedbackMsg('');
      }, 3500);
    } catch (err) {
      console.warn("Falha ao copiar:", err);
      setError('Não foi possível copiar automaticamente para a área de transferência.');
    }
  };

  const handlePrint = async () => {
    if (!formData.condutaClinica.trim()) {
      setError('Preencha a evolução clínica antes de imprimir.');
      return;
    }
    await printElement('printable-evolution-modal-area', `NexAi-NEFRO - Evolucao - ${currentPatient?.nome || 'Paciente'}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.condutaClinica.trim()) {
      setError('Por favor, gere ou descreva a evolução e a conduta médica antes de salvar.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const targetPatId = patientId || currentPatient?.id;
      await savePatientEvolution(targetPatId, formData, evolutionToEdit?.id);

      // Sincroniza aferição de peso com o histórico ponderal do paciente
      if (formData.pesoPre && !isNaN(parseFloat(String(formData.pesoPre).replace(',', '.')))) {
        try {
          await addPatientWeightRecord(targetPatId, {
            data: formData.dataHora,
            peso: formData.pesoPre,
            tipo: formData.tipoAtendimento === 'Internação' ? 'Internação' : 'Pré-HD',
            observacoes: `Evolução: ${formData.tipoAtendimento} (PA: ${formData.paPre || '-'})`
          });
        } catch (wErr) {
          console.warn("Registro automático de peso na evolução:", wErr);
        }
      }

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
    <>
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
            background: 'var(--surface-solid, #ffffff)', 
            width: '100%', 
            maxWidth: '680px', 
            maxHeight: '92vh', 
            overflowY: 'auto', 
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            borderRadius: '20px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabeçalho */}
          <div className="flex justify-between items-center mb-4 border-b pb-3" style={{ borderColor: 'var(--border, #e2e8f0)' }}>
            <div className="flex items-center gap-2">
              <FileText size={22} color="var(--primary, #2563eb)" />
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {evolutionToEdit ? 'Editar Evolução' : 'Nova Evolução'}
                </h2>
                {currentPatient?.nome && (
                  <p className="text-xs text-slate-500">
                    Paciente: <strong>{currentPatient.nome}</strong>
                  </p>
                )}
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
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {feedbackMsg && (
            <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#15803d', padding: '0.65rem 0.85rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} />
              <span>{feedbackMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label className="text-xs font-semibold mb-1 block text-slate-700">Data e Hora *</label>
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
                  <option value="Hemodiálise">🏥 Sessão de Hemodiálise</option>
                  <option value="Internação">🛏️ Internação</option>
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
                Sinais Vitais
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

            {/* Texto da Evolução e Conduta com Botões de Copiar, Configurar e Gerar */}
            <div>
              <div className="flex justify-between items-center mb-1.5 flex-wrap gap-1">
                <label className="text-xs font-semibold block text-slate-700">
                  Evolução Clínica *
                </label>

                <div className="flex items-center gap-1.5">
                  <button 
                    type="button" 
                    onClick={handleCopy}
                    disabled={!formData.condutaClinica.trim()}
                    className="btn btn-outline"
                    style={{
                      padding: '0.28rem 0.65rem',
                      fontSize: '0.74rem',
                      color: copied ? '#15803d' : '#334155',
                      borderColor: copied ? '#86efac' : '#cbd5e1',
                      background: copied ? '#f0fdf4' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: '600',
                      borderRadius: '8px'
                    }}
                    title="Copiar texto da evolução para colar em outros sistemas"
                  >
                    {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="btn btn-outline"
                    style={{
                      padding: '0.28rem 0.65rem',
                      fontSize: '0.74rem',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: '600',
                      borderRadius: '8px'
                    }}
                    title="Personalizar seções e sequência da evolução"
                  >
                    <Sliders size={13} />
                    <span>Configurar</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={handleGenerateEvolution}
                    className="btn btn-outline"
                    style={{
                      padding: '0.28rem 0.75rem',
                      fontSize: '0.74rem',
                      color: '#2563eb',
                      borderColor: '#bfdbfe',
                      background: '#eff6ff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: '700',
                      borderRadius: '8px'
                    }}
                    title="Audita prontuário e abre revisão de parâmetros para gerar"
                  >
                    <Sparkles size={13} color="#2563eb" />
                    <span>Gerar</span>
                  </button>
                </div>
              </div>

              <textarea 
                className="input-field" 
                rows={12}
                placeholder="Evolução clínica, estabilidade hemodinâmica e conduta..."
                value={formData.condutaClinica}
                onChange={(e) => setFormData(prev => ({ ...prev, condutaClinica: e.target.value }))}
                required
                style={{ resize: 'vertical', lineHeight: '1.5', fontSize: '0.82rem', fontFamily: 'monospace' }}
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
                <label className="text-xs text-muted block mb-0.5">CRM</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.medicoCrm}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicoCrm: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t mt-1">
              <div className="flex items-center gap-1.5">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={handleCopy}
                  disabled={!formData.condutaClinica.trim()}
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                  title="Copiar texto da evolução"
                >
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>

                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={handlePrint}
                  disabled={!formData.condutaClinica.trim()}
                  style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                  title="Imprimir evolução médica em folha A4"
                >
                  <Printer size={15} />
                  <span>Imprimir</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button type="button" className="btn btn-outline" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>{saving ? 'Gravando...' : 'Salvar'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Auditoria e Preenchimento Rápido (Quick Fill / Revisão 100%) */}
      {isChecklistOpen && (
        <EvolutionChecklistModal 
          isOpen={isChecklistOpen}
          onClose={() => setIsChecklistOpen(false)}
          patient={currentPatient}
          doctorInfo={currentDoctorInfo || doctorInfo}
          auditResult={auditResult}
          onComplete={handleChecklistCompleted}
          onDoctorConfigUpdated={handleDoctorConfigUpdated}
        />
      )}

      {/* Modal de Configuração do Modelo do Médico */}
      {isTemplateModalOpen && (
        <EvolutionTemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          doctorInfo={currentDoctorInfo || doctorInfo}
          onSaved={handleDoctorConfigUpdated}
        />
      )}

      {/* Área Oculta para Impressão Isolada de Alta Precisão */}
      <div style={{ display: 'none' }}>
        <div id="printable-evolution-modal-area">
          <EvolutionPrintDocument 
            evolution={formData}
            patient={currentPatient || {}}
            doctorInfo={currentDoctorInfo || doctorInfo}
          />
        </div>
      </div>
    </>
  );
}
