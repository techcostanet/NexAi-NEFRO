import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Stethoscope, 
  Mail, 
  Phone, 
  Building2, 
  Award, 
  CheckCircle, 
  Save, 
  Loader2,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Building,
  Check,
  Edit2,
  ShieldCheck,
  PauseCircle,
  PlayCircle,
  X,
  PhoneCall,
  Calendar
} from 'lucide-react';
import { 
  subscribeDoctorProfile, 
  saveDoctorProfile, 
  addDoctorLocation, 
  updateDoctorLocation,
  toggleDoctorLocationStatus,
  removeDoctorLocation 
} from '../services/doctorService';
import { useAuth } from '../context/AuthContext';

export default function DoctorProfile() {
  const navigate = useNavigate();
  const { activeDoctorId } = useAuth();
  
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
    bio: '',
    locaisAtuacao: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Estado para Adicionar / Editar Local de Atuação
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [locationFormData, setLocationFormData] = useState({
    nome: '',
    tipo: 'Clínica de Hemodiálise',
    cidade: 'São Paulo/SP',
    endereco: '',
    diasSemana: 'Seg/Qua/Sex',
    turnos: '1º, 2º e 3º Turnos',
    rtNome: '',
    rtCrm: '',
    telefoneEnfermagem: '',
    status: 'Ativo'
  });

  const currentDoctorId = activeDoctorId;

  useEffect(() => {
    if (!currentDoctorId) return;
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

  const handleOpenAddLocation = () => {
    setEditingLocationId(null);
    setLocationFormData({
      nome: '',
      tipo: 'Clínica de Hemodiálise',
      cidade: profile.ufCrm ? `São Paulo/${profile.ufCrm}` : 'São Paulo/SP',
      endereco: '',
      diasSemana: 'Seg/Qua/Sex',
      turnos: '1º, 2º e 3º Turnos',
      rtNome: profile.nome || '',
      rtCrm: profile.crm ? `${profile.crm}/${profile.ufCrm || 'SP'}` : '',
      telefoneEnfermagem: '',
      status: 'Ativo'
    });
    setIsLocationModalOpen(true);
  };

  const handleOpenEditLocation = (loc) => {
    setEditingLocationId(loc.id);
    setLocationFormData({
      nome: loc.nome || '',
      tipo: loc.tipo || 'Clínica de Hemodiálise',
      cidade: loc.cidade || '',
      endereco: loc.endereco || '',
      diasSemana: loc.diasSemana || 'Seg/Qua/Sex',
      turnos: loc.turnos || '1º, 2º e 3º Turnos',
      rtNome: loc.rtNome || '',
      rtCrm: loc.rtCrm || '',
      telefoneEnfermagem: loc.telefoneEnfermagem || '',
      status: loc.status || 'Ativo'
    });
    setIsLocationModalOpen(true);
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!locationFormData.nome.trim()) return;

    try {
      let updatedLocais;
      if (editingLocationId) {
        updatedLocais = await updateDoctorLocation(currentDoctorId, editingLocationId, locationFormData);
        setFeedbackMessage({ type: 'success', text: 'Local de atendimento atualizado com sucesso!' });
      } else {
        updatedLocais = await addDoctorLocation(currentDoctorId, locationFormData);
        setFeedbackMessage({ type: 'success', text: 'Novo local de atendimento adicionado com sucesso!' });
      }
      setProfile(prev => ({ ...prev, locaisAtuacao: updatedLocais }));
      setIsLocationModalOpen(false);
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: 'Erro ao salvar local de atendimento.' });
    }
  };

  const handleToggleLocationStatus = async (loc) => {
    try {
      const updatedLocais = await toggleDoctorLocationStatus(currentDoctorId, loc.id);
      setProfile(prev => ({ ...prev, locaisAtuacao: updatedLocais }));
      const novoStatus = loc.status === 'Inativo' ? 'reativado' : 'pausado/desativado';
      setFeedbackMessage({ type: 'success', text: `Local "${loc.nome}" foi ${novoStatus}.` });
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: 'Erro ao alterar status do local.' });
    }
  };

  const handleRemoveLocation = async (locationId, locationNome) => {
    if (window.confirm(`Tem certeza que deseja excluir "${locationNome}" dos seus locais de atendimento?`)) {
      try {
        const updatedLocais = await removeDoctorLocation(currentDoctorId, locationId);
        setProfile(prev => ({ ...prev, locaisAtuacao: updatedLocais }));
        setFeedbackMessage({ type: 'success', text: 'Local de atendimento removido.' });
        setTimeout(() => setFeedbackMessage(null), 3500);
      } catch (err) {
        console.error(err);
        setFeedbackMessage({ type: 'error', text: 'Erro ao remover local de atendimento.' });
      }
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

  const locaisList = Array.isArray(profile.locaisAtuacao) ? profile.locaisAtuacao : [];
  const ativasCount = locaisList.filter(l => l.status !== 'Inativo').length;

  return (
    <div className="container" style={{ paddingBottom: '5rem', maxWidth: '880px' }}>
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
          <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.3px' }}>Perfil e Locais de Atuação</h1>
          <p className="text-muted text-sm mt-0.5">Gestão de credenciais médicas, RTs e unidades de atendimento na nuvem</p>
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
            <Stethoscope size={15} color="var(--primary)" /> {profile.especialidade || 'Nefrologia e Hemodiálise'}
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
            <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
              {ativasCount} Unidades Ativas ({locaisList.length} total)
            </span>
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL: LOCAIS DE ATUAÇÃO COM RT & CONTATOS */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <Building2 size={18} /> Meus Locais de Atuação & Clínicas
            </h3>
            <p className="text-muted text-xs mt-0.5">
              Cadastre onde você atende, configure o Responsável Técnico (RT), contato da enfermagem e turnos de atendimento
            </p>
          </div>

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleOpenAddLocation}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> Adicionar Local
          </button>
        </div>

        {/* Lista de Locais Cadastrados */}
        {locaisList.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-xl text-muted text-sm">
            Nenhum local de atuação cadastrado. Clique no botão acima para adicionar sua primeira clínica ou hospital.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {locaisList.map((loc) => {
              const isInactive = loc.status === 'Inativo';
              return (
                <div 
                  key={loc.id} 
                  className="bg-white rounded-2xl flex flex-col justify-between"
                  style={{ 
                    transition: 'all 0.2s ease',
                    opacity: isInactive ? 0.7 : 1,
                    background: isInactive ? '#f8fafc' : '#ffffff',
                    border: '1px solid var(--border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    padding: '1.25rem'
                  }}
                >
                  <div>
                    {/* Top Bar do Card */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1.5 pr-2">
                        <strong className="text-base block text-slate-800 font-bold leading-tight">{loc.nome}</strong>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loc.tipo}</span>
                          {isInactive && <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '6px', background: '#e2e8f0', color: '#475569', fontWeight: '600' }}>Inativo</span>}
                        </div>
                      </div>

                      {/* Ações: Pausar, Editar, Excluir */}
                      <div className="flex items-center gap-0.5 ml-auto">
                        <button 
                          type="button"
                          onClick={() => handleToggleLocationStatus(loc)}
                          title={isInactive ? "Reativar este local" : "Desativar/Pausar este local"}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition rounded-md hover:bg-blue-50"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          {isInactive ? <PlayCircle size={16} color="#16a34a" /> : <PauseCircle size={16} />}
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleOpenEditLocation(loc)}
                          title="Editar dados deste local"
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition rounded-md hover:bg-blue-50"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <Edit2 size={15} />
                        </button>

                        <button 
                          type="button" 
                          onClick={() => handleRemoveLocation(loc.id, loc.nome)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition rounded-md hover:bg-red-50"
                          title="Excluir este local"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Detalhes Clínicos do Local */}
                    <div className="flex flex-col gap-2.5 text-sm text-slate-600 mt-2">
                      {loc.rtNome && (
                        <div className="flex items-start gap-2">
                          <ShieldCheck size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700">RT: {loc.rtNome}</span>
                            {loc.rtCrm && <span className="text-xs text-muted">CRM: {loc.rtCrm}</span>}
                          </div>
                        </div>
                      )}

                      {loc.telefoneEnfermagem && (
                        <div className="flex items-center gap-2">
                          <PhoneCall size={15} color="var(--text-muted)" />
                          <span>{loc.telefoneEnfermagem}</span>
                        </div>
                      )}

                      {loc.turnos && (
                        <div className="flex items-start gap-2">
                          <Clock size={15} color="var(--text-muted)" style={{ marginTop: '2px' }} />
                          <span className="leading-snug">
                            {loc.diasSemana ? <><strong className="text-slate-600 font-medium">{loc.diasSemana}</strong><br/></> : ''}
                            <span className="text-xs text-slate-500">{loc.turnos}</span>
                          </span>
                        </div>
                      )}

                      {loc.cidade && (
                        <div className="flex items-start gap-2 pt-3 mt-1 border-t border-slate-100">
                          <MapPin size={15} color="var(--text-muted)" style={{ marginTop: '2px' }} />
                          <span className="text-xs text-slate-500 leading-relaxed">
                            {loc.cidade} {loc.endereco ? `— ${loc.endereco}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Identificação Profissional */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <User size={18} /> Identificação Profissional do Médico
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

        {/* Contato & Biografia */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <Building2 size={18} /> Contato & Biografia
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
              <label className="text-sm font-semibold mb-1 block">Telefone / WhatsApp Pessoal</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.telefone || ''} 
                placeholder="(11) 98765-4321"
                onChange={(e) => handleChange('telefone', e.target.value)} 
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

      {/* MODAL DE ADICIONAR / EDITAR LOCAL DE ATENDIMENTO */}
      {isLocationModalOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(15, 23, 42, 0.65)', 
            backdropFilter: 'blur(5px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setIsLocationModalOpen(false)}
        >
          <div 
            className="glass-panel animate-in"
            style={{ 
              background: '#ffffff', 
              width: '100%', 
              maxWidth: '580px', 
              maxHeight: '90vh', 
              overflowY: 'auto',
              padding: '1.75rem',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Building2 size={22} color="var(--primary)" />
                <h3 className="font-bold text-lg text-slate-800">
                  {editingLocationId ? 'Editar Local de Atendimento' : 'Novo Local de Atendimento'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">Nome do Local / Instituição *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Centro de Diálise Fresenius Zona Sul ou Hospital Santa Clara" 
                  value={locationFormData.nome}
                  onChange={(e) => setLocationFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Tipo de Unidade</label>
                  <select 
                    className="input-field"
                    value={locationFormData.tipo}
                    onChange={(e) => setLocationFormData(prev => ({ ...prev, tipo: e.target.value }))}
                  >
                    <option value="Clínica de Hemodiálise">🏥 Clínica de Hemodiálise</option>
                    <option value="Hospital Geral / UTI">🏨 Hospital Geral / UTI</option>
                    <option value="Consultório / Ambulatório">🩺 Consultório / Ambulatório</option>
                    <option value="Centro de Transplante">🏢 Centro de Transplante</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Status da Unidade</label>
                  <select 
                    className="input-field"
                    value={locationFormData.status}
                    onChange={(e) => setLocationFormData(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="Ativo">🟢 Ativo (Em atendimento)</option>
                    <option value="Inativo">⏸️ Inativo (Pausado / Sem ronda)</option>
                  </select>
                </div>
              </div>

              {/* Responsável Técnico e Enfermagem */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                  <ShieldCheck size={16} color="#2563eb" />
                  <span>Responsável Técnico (RT) & Contato de Apoio</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Nome do RT da Unidade</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ex: Dr. Carlos Andrade" 
                      value={locationFormData.rtNome}
                      onChange={(e) => setLocationFormData(prev => ({ ...prev, rtNome: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">CRM do RT</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ex: 145890/SP" 
                      value={locationFormData.rtCrm}
                      onChange={(e) => setLocationFormData(prev => ({ ...prev, rtCrm: e.target.value }))}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Telefone / WhatsApp da Enfermagem / Recepção</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ex: (11) 98888-2222 (Posto de Diálise)" 
                      value={locationFormData.telefoneEnfermagem}
                      onChange={(e) => setLocationFormData(prev => ({ ...prev, telefoneEnfermagem: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Turnos e Horários */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Dias de Atendimento</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: Seg/Qua/Sex ou Ter/Qui/Sáb" 
                    value={locationFormData.diasSemana}
                    onChange={(e) => setLocationFormData(prev => ({ ...prev, diasSemana: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Turnos / Horários de Ronda</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: 1º e 2º Turnos (Manhã)" 
                    value={locationFormData.turnos}
                    onChange={(e) => setLocationFormData(prev => ({ ...prev, turnos: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Cidade / UF</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: São Paulo/SP" 
                    value={locationFormData.cidade}
                    onChange={(e) => setLocationFormData(prev => ({ ...prev, cidade: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Endereço / Referência</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: Av. Paulista, 1000" 
                    value={locationFormData.endereco}
                    onChange={(e) => setLocationFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setIsLocationModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingLocationId ? 'Salvar Alterações' : 'Adicionar Local'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
