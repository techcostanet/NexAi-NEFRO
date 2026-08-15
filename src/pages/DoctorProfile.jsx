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
  Check
} from 'lucide-react';
import { 
  subscribeDoctorProfile, 
  saveDoctorProfile, 
  addDoctorLocation, 
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

  // Estado para Adicionar Novo Local de Atuação
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocNome, setNewLocNome] = useState('');
  const [newLocTipo, setNewLocTipo] = useState('Clínica de Hemodiálise');
  const [newLocCidade, setNewLocCidade] = useState('São Paulo/SP');
  const [newLocTurnos, setNewLocTurnos] = useState('1º, 2º e 3º Turnos');

  const currentDoctorId = activeDoctorId || 'dr-marcelo';

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
      setFeedbackMessage({ type: 'success', text: 'Dados cadastrais e locais de atendimento atualizados no Firestore!' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: 'Erro ao salvar no Firestore. Tente novamente.' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocNome.trim()) return;

    try {
      const updatedLocais = await addDoctorLocation(currentDoctorId, {
        nome: newLocNome.trim(),
        tipo: newLocTipo,
        cidade: newLocCidade.trim(),
        turnos: newLocTurnos.trim()
      });
      setProfile(prev => ({ ...prev, locaisAtuacao: updatedLocais }));
      setNewLocNome('');
      setIsAddingLocation(false);
      setFeedbackMessage({ type: 'success', text: 'Novo local de atendimento adicionado com sucesso!' });
      setTimeout(() => setFeedbackMessage(null), 3500);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: 'Erro ao adicionar local de atendimento.' });
    }
  };

  const handleRemoveLocation = async (locationId, locationNome) => {
    if (window.confirm(`Deseja remover "${locationNome}" dos seus locais de atendimento?`)) {
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

  return (
    <div className="container" style={{ paddingBottom: '5rem', maxWidth: '850px' }}>
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
          <p className="text-muted text-sm mt-0.5">Gestão de credenciais médicas e unidades de atendimento na nuvem</p>
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
              {locaisList.length} Unidades Cadastradas
            </span>
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL: LOCAIS DE ATUAÇÃO & UNIDADES */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <Building2 size={18} /> Meus Locais de Atuação & Clínicas
            </h3>
            <p className="text-muted text-xs mt-0.5">
              Cadastre onde você atende (Clínicas de Hemodiálise, Hospitais, Consultórios) para filtrar seus pacientes no Dashboard
            </p>
          </div>

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => setIsAddingLocation(!isAddingLocation)}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> {isAddingLocation ? 'Cancelar' : 'Adicionar Local'}
          </button>
        </div>

        {/* Formulário para Adicionar Local */}
        {isAddingLocation && (
          <form onSubmit={handleAddLocation} className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 animate-in flex flex-col gap-3">
            <h4 className="font-bold text-sm text-slate-800">Novo Local de Atendimento</h4>
            
            <div>
              <label className="text-xs font-semibold mb-1 block">Nome do Local / Instituição *</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ex: Centro de Diálise Fresenius Zona Sul ou Hospital Santa Clara" 
                value={newLocNome}
                onChange={(e) => setNewLocNome(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
              <div>
                <label className="text-xs font-semibold mb-1 block">Tipo de Unidade</label>
                <select 
                  className="input-field"
                  value={newLocTipo}
                  onChange={(e) => setNewLocTipo(e.target.value)}
                >
                  <option value="Clínica de Hemodiálise">🏥 Clínica de Hemodiálise</option>
                  <option value="Hospital Geral / UTI">🏨 Hospital Geral / UTI</option>
                  <option value="Consultório / Ambulatório">🩺 Consultório / Ambulatório</option>
                  <option value="Centro de Transplante">🏢 Centro de Transplante</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Cidade / UF</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="São Paulo/SP" 
                  value={newLocCidade}
                  onChange={(e) => setNewLocCidade(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Turnos / Horários de Ronda</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: 1º e 2º Turnos (Seg/Qua/Sex)" 
                  value={newLocTurnos}
                  onChange={(e) => setNewLocTurnos(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button type="button" className="btn btn-outline" onClick={() => setIsAddingLocation(false)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                Salvar Local
              </button>
            </div>
          </form>
        )}

        {/* Lista de Locais Cadastrados */}
        {locaisList.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-xl text-muted text-sm">
            Nenhum local de atuação cadastrado. Adicione seus hospitais e clínicas acima.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
            {locaisList.map((loc) => (
              <div 
                key={loc.id} 
                className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
                style={{ transition: 'all 0.15s' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        padding: '2px 7px', 
                        borderRadius: '6px', 
                        fontWeight: 'bold',
                        background: loc.tipo?.includes('Hemodiálise') ? '#dbeafe' : loc.tipo?.includes('Hospital') ? '#fee2e2' : '#ede9fe',
                        color: loc.tipo?.includes('Hemodiálise') ? '#1d4ed8' : loc.tipo?.includes('Hospital') ? '#b91c1c' : '#6d28d9'
                      }}
                    >
                      {loc.tipo}
                    </span>

                    <button 
                      type="button" 
                      onClick={() => handleRemoveLocation(loc.id, loc.nome)}
                      className="text-slate-400 hover:text-red-600 transition"
                      title="Excluir este local"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <strong className="text-sm block text-slate-800 mt-1">{loc.nome}</strong>
                  {loc.cidade && (
                    <div className="text-xs text-muted flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {loc.cidade}
                    </div>
                  )}
                  {loc.turnos && (
                    <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <Clock size={12} /> {loc.turnos}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
              <label className="text-sm font-semibold mb-1 block">Telefone / WhatsApp</label>
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
    </div>
  );
}
