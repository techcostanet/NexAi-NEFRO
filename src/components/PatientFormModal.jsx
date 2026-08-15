import React, { useState, useEffect } from 'react';
import { X, Save, User, Activity, Building, Calendar, Loader2 } from 'lucide-react';
import { savePatient, calculateAge } from '../services/patientService';

export default function PatientFormModal({ isOpen, onClose, patientToEdit, onSaved, locaisAtuacao = [] }) {
  const [customClinic, setCustomClinic] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    clinica: 'Clínica Nefrológica NexAi',
    hospital: 'Hospital de Nefrologia',
    turno: '3º Turno',
    dataNascimento: '',
    idade: '',
    status: 'Ativo',
    acessoVascular: {
      tipo: 'FAV',
      fluxoSangue: '',
      fluxoDialisato: '',
      agulha: '16G',
      dataConfeccao: '',
      ladoMembro: 'MSE'
    },
    exames: {},
    medicamentos: {}
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const defaultClinic = (locaisAtuacao && locaisAtuacao.length > 0) ? locaisAtuacao[0].nome : 'Clínica Nefrológica NexAi';
    if (patientToEdit) {
      const isKnown = locaisAtuacao.some(l => l.nome === patientToEdit.clinica);
      setCustomClinic(!isKnown && !!patientToEdit.clinica);
      setFormData({
        id: patientToEdit.id,
        nome: patientToEdit.nome || '',
        clinica: patientToEdit.clinica || defaultClinic,
        hospital: patientToEdit.hospital || 'Hospital de Nefrologia',
        turno: patientToEdit.turno || '3º Turno',
        dataNascimento: patientToEdit.dataNascimento || '',
        idade: patientToEdit.idade !== undefined && patientToEdit.idade !== null ? patientToEdit.idade : (calculateAge(patientToEdit.dataNascimento) || ''),
        status: patientToEdit.status || 'Ativo',
        acessoVascular: {
          tipo: patientToEdit.acessoVascular?.tipo || 'FAV',
          fluxoSangue: patientToEdit.acessoVascular?.fluxoSangue || '',
          fluxoDialisato: patientToEdit.acessoVascular?.fluxoDialisato || '',
          agulha: patientToEdit.acessoVascular?.agulha || '',
          dataConfeccao: patientToEdit.acessoVascular?.dataConfeccao || '',
          ladoMembro: patientToEdit.acessoVascular?.ladoMembro || ''
        },
        exames: patientToEdit.exames || {},
        medicamentos: patientToEdit.medicamentos || {},
        historicoExames: patientToEdit.historicoExames || []
      });
    } else {
      setCustomClinic(false);
      setFormData({
        nome: '',
        clinica: defaultClinic,
        hospital: 'Hospital de Nefrologia',
        turno: '3º Turno',
        dataNascimento: '',
        idade: '',
        status: 'Ativo',
        acessoVascular: {
          tipo: 'FAV',
          fluxoSangue: '300',
          fluxoDialisato: '500',
          agulha: '16G',
          dataConfeccao: '',
          ladoMembro: 'MSE'
        },
        exames: {},
        medicamentos: {},
        historicoExames: []
      });
    }
    setError('');
  }, [patientToEdit, isOpen, locaisAtuacao]);

  if (!isOpen) return null;

  const handleBirthDateChange = (val) => {
    const calculated = calculateAge(val);
    setFormData(prev => ({
      ...prev,
      dataNascimento: val,
      idade: calculated !== null ? calculated : prev.idade
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      setError('O nome do paciente é obrigatório.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const payload = {
        ...formData,
        nome: formData.nome.trim().toUpperCase(),
        idade: formData.idade ? Number(formData.idade) : (calculateAge(formData.dataNascimento) || null),
        acessoVascular: {
          ...formData.acessoVascular,
          fluxoSangue: formData.acessoVascular.fluxoSangue ? Number(formData.acessoVascular.fluxoSangue) : null,
          fluxoDialisato: formData.acessoVascular.fluxoDialisato ? Number(formData.acessoVascular.fluxoDialisato) : null
        }
      };

      const saved = await savePatient(payload);
      if (onSaved) onSaved(saved);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar paciente no Firestore. Tente novamente.');
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
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <User size={22} color="var(--primary)" />
            <h2 className="text-xl font-bold">
              {patientToEdit ? 'Editar Dados do Paciente' : 'Novo Paciente'}
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-outline" 
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Dados Pessoais & Clínicos */}
          <div>
            <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3">Identificação & Vínculo</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="text-sm font-semibold mb-1 block">Nome Completo *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Nome do paciente" 
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Unidade de Atendimento *</label>
                {locaisAtuacao && locaisAtuacao.length > 0 && !customClinic ? (
                  <div className="flex flex-col gap-1">
                    <select 
                      className="input-field"
                      value={formData.clinica}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setCustomClinic(true);
                          setFormData(prev => ({ ...prev, clinica: '' }));
                        } else {
                          setFormData(prev => ({ ...prev, clinica: e.target.value }));
                        }
                      }}
                    >
                      {locaisAtuacao.map(loc => (
                        <option key={loc.id} value={loc.nome}>
                          {loc.tipo?.includes('Hemodiálise') ? '🏥' : loc.tipo?.includes('Hospital') ? '🏨' : '🩺'} {loc.nome} {loc.status === 'Inativo' ? '(Inativo)' : ''}
                        </option>
                      ))}
                      <option value="__custom__">➕ Outro local (digitar)...</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ex: Centro de Diálise NexAi"
                      value={formData.clinica}
                      onChange={(e) => setFormData(prev => ({ ...prev, clinica: e.target.value }))}
                    />
                    {locaisAtuacao && locaisAtuacao.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setCustomClinic(false);
                          setFormData(prev => ({ ...prev, clinica: locaisAtuacao[0]?.nome || '' }));
                        }}
                        className="text-xs text-blue-600 hover:underline mt-1 block"
                      >
                        ← Selecionar da lista de locais
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Hospital de Retaguarda</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.hospital}
                  placeholder="Ex: Hospital do Rim"
                  onChange={(e) => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Turno</label>
                <select 
                  className="input-field" 
                  value={formData.turno}
                  onChange={(e) => setFormData(prev => ({ ...prev, turno: e.target.value }))}
                >
                  <option value="1º Turno">1º Turno (Manhã)</option>
                  <option value="2º Turno">2º Turno (Tarde)</option>
                  <option value="3º Turno">3º Turno (Noite)</option>
                  <option value="4º Turno">4º Turno</option>
                  <option value="Diálise Peritoneal">Diálise Peritoneal</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Status</label>
                <select 
                  className="input-field" 
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Em Tratamento">Em Tratamento</option>
                  <option value="Internado">Internado</option>
                  <option value="Transferido">Transferido</option>
                  <option value="Transplante">Transplante</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Data de Nascimento</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formData.dataNascimento}
                  onChange={(e) => handleBirthDateChange(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Idade (anos)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Ex: 58"
                  value={formData.idade}
                  onChange={(e) => setFormData(prev => ({ ...prev, idade: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Acesso Vascular */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity size={16} color="var(--primary)" /> Acesso Vascular
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="text-sm font-semibold mb-1 block">Tipo de Acesso</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: FAV BCE 15/10/2024, CDL..." 
                  value={formData.acessoVascular.tipo}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    acessoVascular: { ...prev.acessoVascular, tipo: e.target.value } 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Localização do Acesso</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: MSE, MSD, VJI D" 
                  value={formData.acessoVascular.ladoMembro}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    acessoVascular: { ...prev.acessoVascular, ladoMembro: e.target.value } 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Fluxo de Sangue (ml/min)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Ex: 350" 
                  value={formData.acessoVascular.fluxoSangue}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    acessoVascular: { ...prev.acessoVascular, fluxoSangue: e.target.value } 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Fluxo Dialisato (ml/min)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Ex: 500" 
                  value={formData.acessoVascular.fluxoDialisato}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    acessoVascular: { ...prev.acessoVascular, fluxoDialisato: e.target.value } 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Calibre da Agulha</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: 15G, 16G, 17G" 
                  value={formData.acessoVascular.agulha}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    acessoVascular: { ...prev.acessoVascular, agulha: e.target.value } 
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Salvando...' : 'Salvar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
