import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Stethoscope, Mail, Phone, Building2, Award, CheckCircle, Save, Loader2 } from 'lucide-react';
import { subscribeDoctorProfile, saveDoctorProfile } from '../services/doctorService';

export default function DoctorProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    nome: '',
    titulo: '',
    crm: '',
    ufCrm: '',
    rqe: '',
    especialidade: '',
    email: '',
    telefone: '',
    clinicaPrincipal: '',
    hospitalVinculo: '',
    unidadeDialise: '',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const currentDoctorId = localStorage.getItem('activeDoctorId') || 'dr-marcelo';

  useEffect(() => {
    const unsubscribe = subscribeDoctorProfile(currentDoctorId, (data) => {
      setProfile(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentDoctorId]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await saveDoctorProfile(currentDoctorId, profile);
      setFeedbackMessage({ type: 'success', text: 'Dados cadastrais atualizados com sucesso no Firestore!' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: 'Erro ao salvar no Firestore. Tente novamente.' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center h-screen flex-col gap-4">
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        <p className="text-muted">Carregando dados cadastrais...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '5rem', maxWidth: '800px' }}>
      <header className="flex items-center mt-3 mb-6" style={{ gap: '1.5rem' }}>
        <button 
          className="btn btn-outline" 
          onClick={() => navigate('/doctor')} 
          style={{ 
            padding: '0.65rem', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
          title="Voltar ao Painel"
        >
          <ArrowLeft size={20} color="var(--primary)" />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.3px' }}>Perfil e Dados Cadastrais</h1>
          <p className="text-muted text-sm mt-0.5">Informações profissionais e institucionais do médico</p>
        </div>
      </header>

      {feedbackMessage && (
        <div 
          className="glass-panel animate-in" 
          style={{ 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            background: feedbackMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            borderColor: feedbackMessage.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'
          }}
        >
          <CheckCircle size={18} color={feedbackMessage.type === 'error' ? '#ef4444' : '#22c55e'} />
          <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Cartão de Resumo */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
        <div 
          style={{ 
            width: '68px', 
            height: '68px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
            fontSize: '1.5rem',
            fontWeight: 'bold'
          }}
        >
          {profile.nome ? profile.nome.replace('Dra. ', '').replace('Dr. ', '').charAt(0) : 'M'}
        </div>
        <div style={{ flex: '1 1 250px' }}>
          <h2 className="text-xl font-bold">{profile.nome || 'Médico Nefrologista'}</h2>
          <p className="text-muted text-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <Stethoscope size={15} color="var(--primary)" /> {profile.especialidade || 'Nefrologia'}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
              CRM {profile.crm || '---'}/{profile.ufCrm || 'UF'}
            </span>
            {profile.rqe && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                RQE {profile.rqe}
              </span>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Identificação Profissional */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <User size={18} /> Identificação Profissional
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="text-sm font-semibold mb-1 block">Nome Completo / Como deseja ser chamado</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.nome || ''} 
                onChange={(e) => handleChange('nome', e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Título / Cargo</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.titulo || ''} 
                placeholder="Ex: Médica Nefrologista"
                onChange={(e) => handleChange('titulo', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">CRM</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.crm || ''} 
                placeholder="Ex: 123456"
                onChange={(e) => handleChange('crm', e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">UF do CRM</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.ufCrm || ''} 
                placeholder="Ex: SP"
                maxLength={2}
                onChange={(e) => handleChange('ufCrm', e.target.value.toUpperCase())} 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">RQE (Registro de Especialista)</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.rqe || ''} 
                placeholder="Ex: 98765"
                onChange={(e) => handleChange('rqe', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Especialidade Principal</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.especialidade || ''} 
                placeholder="Ex: Nefrologia e Hemodiálise"
                onChange={(e) => handleChange('especialidade', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Contato & Atuação */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <Building2 size={18} /> Contato & Locais de Atendimento
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="text-sm font-semibold mb-1 block">Email Profissional</label>
              <input 
                type="email" 
                className="input-field" 
                value={profile.email || ''} 
                onChange={(e) => handleChange('email', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Telefone / WhatsApp</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.telefone || ''} 
                placeholder="(11) 98765-4321"
                onChange={(e) => handleChange('telefone', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Clínica Principal</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.clinicaPrincipal || ''} 
                placeholder="Nome da clínica de diálise"
                onChange={(e) => handleChange('clinicaPrincipal', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Hospital de Vínculo</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.hospitalVinculo || ''} 
                placeholder="Hospital de referência"
                onChange={(e) => handleChange('hospitalVinculo', e.target.value)} 
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="text-sm font-semibold mb-1 block">Unidade de Diálise / Turnos Atendidos</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.unidadeDialise || ''} 
                placeholder="Ex: Turnos 2 e 3 - Unidade Centro"
                onChange={(e) => handleChange('unidadeDialise', e.target.value)} 
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="text-sm font-semibold mb-1 block">Biografia / Observações Clínicas</label>
              <textarea 
                className="input-field" 
                rows={3}
                value={profile.bio || ''} 
                placeholder="Informações adicionais do médico..."
                onChange={(e) => handleChange('bio', e.target.value)} 
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/doctor')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
