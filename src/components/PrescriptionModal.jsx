import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  FileCheck, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertTriangle, 
  Loader2, 
  Pill, 
  Printer 
} from 'lucide-react';
import { DIALYSIS_MEDICATIONS_CATALOG, normalizeMedicamentosList } from '../data/dialysisMedications';
import { savePatientPrescription } from '../services/patientService';

export default function PrescriptionModal({ 
  isOpen, 
  onClose, 
  patient, 
  doctorInfo = null, 
  prescriptionToEdit = null, 
  initialTipo = 'simples',
  onSaved 
}) {
  const [formData, setFormData] = useState({
    dataEmissao: new Date().toISOString().split('T')[0],
    tipoReceita: 'simples',
    validadeDias: 180,
    subtitulo: '',
    observacoesGerais: '',
    incluirAlergias: true,
    medicoNome: '',
    medicoCrm: '',
    itens: []
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Inicializa o formulário com dados do paciente e médico
  useEffect(() => {
    if (!isOpen) return;

    if (prescriptionToEdit) {
      setFormData({
        id: prescriptionToEdit.id,
        numeroReceita: prescriptionToEdit.numeroReceita || '',
        dataEmissao: prescriptionToEdit.dataEmissao || new Date().toISOString().split('T')[0],
        tipoReceita: prescriptionToEdit.tipoReceita || 'simples',
        validadeDias: prescriptionToEdit.validadeDias || 180,
        subtitulo: prescriptionToEdit.subtitulo || '',
        observacoesGerais: prescriptionToEdit.observacoesGerais || '',
        incluirAlergias: prescriptionToEdit.incluirAlergias !== false,
        medicoNome: prescriptionToEdit.medico?.nome || doctorInfo?.nome || 'Dr. Marcelo Ramos',
        medicoCrm: prescriptionToEdit.medico?.crm 
          ? `${prescriptionToEdit.medico.crm}/${prescriptionToEdit.medico.ufCrm || 'SP'}`
          : (doctorInfo?.crm ? `${doctorInfo.crm}/${doctorInfo.ufCrm || 'SP'}` : '654321/SP'),
        itens: Array.isArray(prescriptionToEdit.itens) ? [...prescriptionToEdit.itens] : []
      });
    } else {
      setFormData({
        dataEmissao: new Date().toISOString().split('T')[0],
        tipoReceita: initialTipo || 'simples',
        validadeDias: initialTipo === 'antimicrobiano' ? 10 : (initialTipo === 'controle_especial' ? 30 : 180),
        subtitulo: '',
        observacoesGerais: 'Manter controle hídrico e adesão nutricional.',
        incluirAlergias: true,
        medicoNome: doctorInfo?.nome || 'Dr. Marcelo Ramos',
        medicoCrm: doctorInfo?.crm ? `${doctorInfo.crm}/${doctorInfo.ufCrm || 'SP'}` : '654321/SP',
        itens: [
          {
            id: `item-${Date.now()}-1`,
            medicamento: '',
            quantidade: 'Uso Contínuo (3 caixas)',
            posologia: 'Tomar 1 comprimido por via oral ao dia.',
            via: 'VO'
          }
        ]
      });
    }
    setError('');
    setSuccessNotice('');
  }, [prescriptionToEdit, isOpen, doctorInfo, initialTipo]);

  if (!isOpen || !patient) return null;

  // Atualiza a validade padrão ao trocar o tipo de receita
  const handleTipoChange = (newTipo) => {
    let defaultValidade = 180;
    if (newTipo === 'controle_especial') defaultValidade = 30;
    if (newTipo === 'antimicrobiano') defaultValidade = 10;
    if (newTipo === 'alto_custo') defaultValidade = 90;

    setFormData(prev => ({
      ...prev,
      tipoReceita: newTipo,
      validadeDias: defaultValidade
    }));
  };

  // 1-Clique: Importar Medicamentos Ativos do Paciente
  const handleImportActiveMeds = () => {
    const ativas = normalizeMedicamentosList(patient?.medicamentos).filter(m => m.ativo !== false);
    if (ativas.length === 0) {
      setError('O paciente não possui medicamentos ativos cadastrados na aba Prescrições.');
      return;
    }

    const novos = ativas.map((m, idx) => {
      const nomeLimpo = (m.nome || '').trim();
      const dosagemLimpa = (m.dosagem || '').trim();
      const alreadyHasDosage = dosagemLimpa && nomeLimpo.toLowerCase().includes(dosagemLimpa.toLowerCase());
      const medFinal = dosagemLimpa && !alreadyHasDosage ? `${nomeLimpo} ${dosagemLimpa}` : nomeLimpo;

      return {
        id: `item-${Date.now()}-${idx}`,
        medicamento: medFinal,
        quantidade: m.tipo === 'continuo' ? 'Uso Contínuo (3 caixas)' : '1 caixa',
        posologia: m.frequencia ? `Tomar/aplicar ${m.frequencia}.` : 'Conforme orientação médica.',
        via: m.via || 'VO'
      };
    });

    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens.filter(it => it.medicamento.trim() !== ''), ...novos]
    }));

    setSuccessNotice(`⚡ ${novos.length} medicamentos ativos importados!`);
    setTimeout(() => setSuccessNotice(''), 3500);
  };

  // Adicionar novo item
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      itens: [
        ...prev.itens,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          medicamento: '',
          quantidade: '1 caixa',
          posologia: 'Tomar 1 comprimido ao dia.',
          via: 'VO'
        }
      ]
    }));
  };

  // Atualizar campo de um item
  const handleUpdateItem = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.map(it => it.id === id ? { ...it, [field]: value } : it)
    }));
  };

  // Remover item
  const handleRemoveItem = (id) => {
    setFormData(prev => ({
      ...prev,
      itens: prev.itens.filter(it => it.id !== id)
    }));
  };

  // Salvar no Cloud Firestore
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (formData.itens.length === 0) {
      setError('Por favor, adicione ao menos um medicamento à receita.');
      return;
    }

    const emptyDrug = formData.itens.find(it => !it.medicamento || !it.medicamento.trim());
    if (emptyDrug) {
      setError('Por favor, preencha o nome de todos os medicamentos.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Separa CRM e UF
      let crmNum = doctorInfo?.crm || '654321';
      let crmUf = doctorInfo?.ufCrm || 'SP';
      if (formData.medicoCrm.includes('/')) {
        const parts = formData.medicoCrm.split('/');
        crmNum = parts[0].trim();
        crmUf = parts[1].trim();
      }

      const payload = {
        tipoReceita: formData.tipoReceita,
        dataEmissao: formData.dataEmissao,
        validadeDias: parseInt(formData.validadeDias, 10) || 180,
        subtitulo: formData.subtitulo || '',
        observacoesGerais: formData.observacoesGerais || '',
        incluirAlergias: formData.incluirAlergias,
        itens: formData.itens,
        medico: {
          id: doctorInfo?.id || 'dr-marcelo',
          nome: formData.medicoNome || doctorInfo?.nome || 'Dr. Marcelo Ramos',
          crm: crmNum,
          ufCrm: crmUf,
          rqe: doctorInfo?.rqe || '45890',
          especialidade: doctorInfo?.especialidade || 'Nefrologia Clínica',
          clinica: doctorInfo?.clinicaPrincipal || patient.clinica || 'Clínica Nefrológica Nex-Ai.NEFRO',
          endereco: doctorInfo?.endereco || 'São Paulo - SP',
          telefone: doctorInfo?.telefone || ''
        },
        paciente: {
          id: patient.id,
          nome: patient.nome,
          cpf: patient.cpf || '',
          idade: patient.idade || '',
          endereco: patient.endereco || ''
        }
      };

      const updatedReceitas = await savePatientPrescription(patient.id, payload, prescriptionToEdit?.id);

      // Encontra a receita recém salva/atualizada
      const savedDoc = updatedReceitas && updatedReceitas.length > 0 ? updatedReceitas[0] : payload;

      if (onSaved) onSaved(savedDoc, true);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar receita médica no Cloud Firestore.');
    } finally {
      setSaving(false);
    }
  };

  const ativasCount = normalizeMedicamentosList(patient?.medicamentos).filter(m => m.ativo !== false).length;

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
        {/* Cabeçalho Padronizado do Modal (Idêntico ao EvolutionModal) */}
        <div className="flex justify-between items-center mb-4 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <FileCheck size={22} color="var(--primary)" />
            <div>
              <h2 className="text-lg font-bold">
                {prescriptionToEdit ? 'Editar Receituário' : 'Nova Receita'}
              </h2>
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

        {successNotice && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#047857', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {successNotice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Linha 1: Data e Tipo de Receituário */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label className="text-xs font-semibold mb-1 block text-slate-700">Data da Receita *</label>
              <input 
                type="date" 
                className="input-field" 
                value={formData.dataEmissao}
                onChange={(e) => setFormData(prev => ({ ...prev, dataEmissao: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block text-slate-700">Tipo de Receita *</label>
              <select 
                className="input-field"
                value={formData.tipoReceita}
                onChange={(e) => handleTipoChange(e.target.value)}
              >
                <option value="simples">📄 Receita Simples (Uso Contínuo)</option>
                <option value="controle_especial">📋 Controle Especial (Portaria 344 - 2 Vias)</option>
                <option value="antimicrobiano">💊 Antimicrobianos (RDC 20 - 2 Vias)</option>
                <option value="alto_custo">📑 Componente Especializado / Alto Custo (LME)</option>
              </select>
            </div>
          </div>

          {/* Atalho: Importar Medicamentos Ativos */}
          {ativasCount > 0 && (
            <div className="flex justify-between items-center bg-blue-50/70 border border-blue-200 px-3 py-2 rounded-xl">
              <span className="text-xs text-blue-900 font-medium">
                <strong>{ativasCount}</strong> medicações ativas no prontuário.
              </span>
              <button
                type="button"
                onClick={handleImportActiveMeds}
                className="btn btn-primary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Sparkles size={13} />
                <span>Puxar Ativas</span>
              </button>
            </div>
          )}

          {/* Card: Medicamentos Prescritos (Simples e Direto) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Medicamentos Prescritos ({formData.itens.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn btn-outline"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '3px' }}
              >
                <Plus size={13} />
                <span>Adicionar Medicamento</span>
              </button>
            </div>

            {/* Datalist com sugestões do catálogo nefrológico */}
            <datalist id="dialysis-meds-datalist">
              {DIALYSIS_MEDICATIONS_CATALOG.map((m, idx) => (
                <option key={idx} value={`${m.nome}${m.dosagensSugeridas?.[0] ? ` ${m.dosagensSugeridas[0]}` : ''}`} />
              ))}
            </datalist>

            {formData.itens.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted">
                Nenhum medicamento na lista. Clique em "Adicionar Medicamento" ou "Puxar Ativas".
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {formData.itens.map((item, idx) => (
                  <div key={item.id || idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-red-600 transition"
                        title="Remover medicamento"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">Medicamento e Concentração *</label>
                        <input
                          type="text"
                          list="dialysis-meds-datalist"
                          className="input-field"
                          style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
                          placeholder="Ex: Cloridrato de Sevelâmer 800mg"
                          value={item.medicamento}
                          onChange={(e) => handleUpdateItem(item.id, 'medicamento', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">Quantidade / Duração</label>
                        <input
                          type="text"
                          className="input-field"
                          style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
                          placeholder="Ex: 3 caixas / Uso Contínuo"
                          value={item.quantidade}
                          onChange={(e) => handleUpdateItem(item.id, 'quantidade', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-600 font-semibold block mb-0.5">Posologia e Instruções de Uso *</label>
                      <input
                        type="text"
                        className="input-field"
                        style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem' }}
                        placeholder="Ex: Tomar 2 comprimidos VO junto às principais refeições (almoço e jantar)."
                        value={item.posologia}
                        onChange={(e) => handleUpdateItem(item.id, 'posologia', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recomendações e Orientações Médicas */}
          <div>
            <label className="text-xs font-semibold mb-1 block text-slate-700">Recomendações e Orientações Médicas (Opcional)</label>
            <textarea 
              className="input-field" 
              rows={2}
              placeholder="Instruções sobre dieta renal, restrição hídrica, cuidados com a fístula/cateter ou retornos..."
              value={formData.observacoesGerais}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoesGerais: e.target.value }))}
              style={{ resize: 'vertical', fontSize: '0.85rem' }}
            />
          </div>

          {/* Médico Responsável e CRM */}
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

          {/* Rodapé: Ações */}
          <div className="flex justify-end gap-2 pt-2 border-t mt-1">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              <span>{saving ? 'Gravando...' : (prescriptionToEdit ? 'Salvar Alterações' : 'Salvar e Gerar Receita')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
