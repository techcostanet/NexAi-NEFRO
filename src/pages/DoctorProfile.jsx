import React, { useState, useEffect, useRef } from 'react';
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
  Calendar,
  Palette,
  KeyRound,
  Lock,
  Database,
  FileSpreadsheet,
  FileText,
  Download,
  Image as ImageIcon,
  Upload,
  ImagePlus,
  Sliders
} from 'lucide-react';
import { 
  subscribeDoctorProfile, 
  saveDoctorProfile, 
  saveDoctorLogo,
  addDoctorLocation, 
  updateDoctorLocation,
  toggleDoctorLocationStatus,
  removeDoctorLocation 
} from '../services/doctorService';
import { subscribeToPatients } from '../services/patientService';
import { exportSystemToExcel, exportSystemToPdf } from '../services/systemExportService';
import SystemExportModal from '../components/profile/SystemExportModal';
import EvolutionTemplateModal from '../components/EvolutionTemplateModal';
import { DEFAULT_EVOLUTION_SECTIONS } from '../utils/monthlyEvolutionGenerator';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { changeUserPassword, changeUserEmail } from '../services/authService';
import { optimizeLogoImage } from '../utils/imageUtils';

export default function DoctorProfile() {
  const navigate = useNavigate();
  const { activeDoctorId, currentUser } = useAuth();
  const { currentTheme, currentThemeId, changeTheme, themes } = useTheme();
  
  const [profile, setProfile] = useState({
    nome: '',
    titulo: '',
    crm: '',
    ufCrm: '',
    rqe: '',
    cns: '',
    especialidade: '',
    email: '',
    telefone: '',
    clinicaPrincipal: '',
    hospitalVinculo: '',
    unidadeDialise: '',
    bio: '',
    logoUrl: '',
    locaisAtuacao: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Estados para Troca de E-mail e Senha
  const [emailFormData, setEmailFormData] = useState({ novoEmail: '', senhaAtual: '' });
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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

  // Estados para Portabilidade e Exportação de Dados
  const [patients, setPatients] = useState([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isQuickExportingExcel, setIsQuickExportingExcel] = useState(false);
  const [isQuickExportingPdf, setIsQuickExportingPdf] = useState(false);

  const currentDoctorId = activeDoctorId;

  useEffect(() => {
    if (!currentDoctorId) return;
    const unsubscribeDoc = subscribeDoctorProfile(currentDoctorId, (data) => {
      setProfile(data);
      setLoading(false);
    });
    const unsubscribePatients = subscribeToPatients(currentDoctorId, (data) => {
      setPatients(data || []);
    });
    return () => {
      unsubscribeDoc();
      unsubscribePatients();
    };
  }, [currentDoctorId]);

  const handleQuickExportExcel = async () => {
    try {
      setIsQuickExportingExcel(true);
      const res = await exportSystemToExcel({
        patients,
        doctor: profile,
        locais: profile.locaisAtuacao || [],
        scope: 'total'
      });
      setFeedbackMessage({
        type: 'success',
        text: `Planilha Excel gerada com sucesso (${res.totalPatients} prontuários incluídos).`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: 'Erro ao gerar planilha Excel.' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setIsQuickExportingExcel(false);
    }
  };

  const handleQuickExportPdf = async () => {
    try {
      setIsQuickExportingPdf(true);
      const res = await exportSystemToPdf({
        patients,
        doctor: profile,
        locais: profile.locaisAtuacao || [],
        scope: 'total'
      });
      setFeedbackMessage({
        type: 'success',
        text: `Dossiê PDF gerado com sucesso (${res.totalPatients} prontuários diagramados).`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: 'Erro ao gerar dossiê PDF.' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setIsQuickExportingPdf(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const optimized = await optimizeLogoImage(file, 600, 300);
      
      await saveDoctorLogo(currentDoctorId, optimized.dataUrl);
      setProfile(prev => ({ ...prev, logoUrl: optimized.dataUrl }));

      setFeedbackMessage({
        type: 'success',
        text: 'Logomarca salva com sucesso no Firestore!'
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Erro ao processar imagem da logomarca.'
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm("Deseja realmente remover a logomarca do médico?")) return;
    try {
      setIsUploadingLogo(true);
      await saveDoctorLogo(currentDoctorId, "");
      setProfile(prev => ({ ...prev, logoUrl: "" }));
      setFeedbackMessage({
        type: 'success',
        text: 'Logomarca removida com sucesso.'
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao remover logomarca.'
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setIsUploadingLogo(false);
    }
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

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!emailFormData.novoEmail || !emailFormData.senhaAtual) {
      setFeedbackMessage({ type: 'error', text: 'Informe o novo e-mail e a senha atual para confirmar.' });
      return;
    }
    try {
      setIsUpdatingEmail(true);
      const res = await changeUserEmail(emailFormData.senhaAtual, emailFormData.novoEmail, currentDoctorId);
      setProfile(prev => ({ ...prev, email: emailFormData.novoEmail.trim().toLowerCase() }));
      setEmailFormData({ novoEmail: '', senhaAtual: '' });
      setFeedbackMessage({ type: 'success', text: res.message || 'E-mail atualizado com sucesso!' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: err.message || 'Erro ao atualizar e-mail.' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordFormData.novaSenha !== passwordFormData.confirmarSenha) {
      setFeedbackMessage({ type: 'error', text: 'A confirmação da nova senha não confere.' });
      return;
    }
    if (passwordFormData.novaSenha.length < 6) {
      setFeedbackMessage({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }
    try {
      setIsUpdatingPassword(true);
      const res = await changeUserPassword(passwordFormData.senhaAtual, passwordFormData.novaSenha);
      setPasswordFormData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
      setFeedbackMessage({ type: 'success', text: res.message || 'Senha atualizada com sucesso!' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ type: 'error', text: err.message || 'Erro ao alterar senha.' });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setIsUpdatingPassword(false);
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
          <p className="text-muted text-sm mt-0.5">Credenciais médicas e unidades de atendimento</p>
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
        {profile.logoUrl ? (
          <div 
            style={{ 
              width: '84px', 
              height: '84px', 
              borderRadius: '16px', 
              background: '#ffffff', 
              border: '2px solid rgba(37, 99, 235, 0.2)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              overflow: 'hidden'
            }}
          >
            <img 
              src={profile.logoUrl} 
              alt="Logomarca Médica" 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
            />
          </div>
        ) : (
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
        )}
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
            {profile.cns && (
              <span style={{ fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                CNS {profile.cns}
              </span>
            )}
            <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
              {ativasCount} Unidades Ativas ({locaisList.length} total)
            </span>
          </div>
        </div>
      </div>

      {/* SEÇÃO: LOGOMARCA MÉDICA (IDENTIDADE VISUAL EM RELATÓRIOS E PLANILHAS EXCEL) */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <ImageIcon size={18} /> Logomarca
            </h3>
            <p className="text-muted text-xs mt-0.5">
              Aplicada automaticamente em todos os relatórios PDF e planilhas Excel (exceto LME)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              ref={logoInputRef}
              type="file" 
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoFileChange}
              style={{ display: 'none' }} 
            />
            
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploadingLogo}
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isUploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              <span>{profile.logoUrl ? 'Alterar' : 'Upload'}</span>
            </button>

            {profile.logoUrl && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleRemoveLogo}
                disabled={isUploadingLogo}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: '#dc2626', borderColor: '#fca5a5' }}
              >
                <span>Remover</span>
              </button>
            )}
          </div>
        </div>

        {/* Pré-visualização da Logomarca */}
        {profile.logoUrl ? (
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
              Pré-visualização do Cabeçalho Timbrado
            </span>
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ maxHeight: '60px', maxWidth: '160px', display: 'flex', alignItems: 'center' }}>
                  <img 
                    src={profile.logoUrl} 
                    alt="Logomarca Médica" 
                    style={{ maxHeight: '56px', maxWidth: '150px', objectFit: 'contain' }} 
                  />
                </div>
                <div style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '1rem' }}>
                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                    {profile.nome || 'Médico Nefrologista'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                    CRM {profile.crm || '---'}/{profile.ufCrm || 'UF'}{profile.rqe ? ` • RQE ${profile.rqe}` : ''}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {profile.clinicaPrincipal || 'Clínica de Hemodiálise e Nefrologia'}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '10px', fontWeight: '600' }}>
                Ativa em Relatórios e Excel
              </span>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => logoInputRef.current?.click()}
            style={{ 
              border: '2px dashed #cbd5e1', 
              borderRadius: '12px', 
              padding: '1.75rem 1rem', 
              textAlign: 'center', 
              background: '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', marginBottom: '8px' }}>
              <ImagePlus size={24} color="#2563eb" />
            </div>
            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.88rem' }}>
              Adicionar Logomarca do Médico ou Clínica
            </div>
            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
              Clique aqui ou use o botão Upload acima (PNG com fundo transparente, JPG ou WebP)
            </p>
          </div>
        )}
      </div>

      {/* SEÇÃO: MODELO DE EVOLUÇÃO MÉDICA */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <FileText size={18} /> Modelo de Evolução
            </h3>
            <p className="text-muted text-xs mt-0.5">
              Personalize o título, as seções e a ordem das informações da evolução mensal
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsTemplateModalOpen(true)}
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sliders size={14} />
            <span>Configurar</span>
          </button>
        </div>

        {/* Resumo da Configuração Atual */}
        <div style={{ marginTop: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e3a8a', textTransform: 'uppercase' }}>
              {profile.configuracaoEvolucao?.titulo || 'EVOLUÇÃO MÉDICA MENSAL - HEMODIÁLISE CRÔNICA'}
            </span>
            <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '8px', fontWeight: '600' }}>
              {profile.configuracaoEvolucao ? 'Personalizado' : 'Padrão SBN'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {(profile.configuracaoEvolucao?.secoes || DEFAULT_EVOLUTION_SECTIONS)
              .filter(s => s.ativo !== false)
              .map((s, idx) => (
                <span key={s.id} style={{ fontSize: '0.72rem', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: '500' }}>
                  {idx + 1}. {s.label}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL: LOCAIS DE ATUAÇÃO COM RT & CONTATOS */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <Building2 size={18} /> Locais de Atuação
            </h3>
            <p className="text-muted text-xs mt-0.5">
              Unidades de diálise, hospitais e ambulatórios
            </p>
          </div>

          <button 
            type="button" 
            className="btn btn-primary"
            onClick={handleOpenAddLocation}
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> + Local
          </button>
        </div>

        {/* Lista de Locais Cadastrados */}
        {locaisList.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-xl text-muted text-sm">
            Nenhum local cadastrado.
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

      {/* SEÇÃO DE PORTABILIDADE E BACKUP GERAL DE DADOS CLÍNICOS */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.5rem', 
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.04), rgba(37, 99, 235, 0.08))',
          border: '1.5px solid #bfdbfe',
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.06)'
        }}
      >
        <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div 
              style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Database size={22} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                Portabilidade de Dados
              </h3>
              <p className="text-muted text-xs mt-0.5">
                Exportação integral ou personalizada dos prontuários em Excel e PDF para transição clínica
              </p>
            </div>
          </div>

          <span 
            style={{ 
              fontSize: '0.75rem', 
              background: '#eff6ff', 
              color: '#1d4ed8', 
              padding: '3px 10px', 
              borderRadius: '12px', 
              fontWeight: '700',
              border: '1px solid #bfdbfe'
            }}
          >
            {patients.length} Prontuários Disponíveis
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          Gere cópias autênticas e estruturadas de todos os registros clínicos sob sua responsabilidade técnica (dados cadastrais, últimos exames laboratoriais, histórico cronológico, prescrições ativas, acessos vasculares e evoluções). Ideal para segurança de dados, backup offline ou migração imediata para outro software.
        </p>

        {/* Botoes de Ação Rápida */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Botão Configurar / Exportar */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsExportModalOpen(true)}
            style={{
              padding: '0.55rem 1.1rem',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              borderRadius: '12px',
              fontWeight: '700',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
            title="Abrir opções de exportação integral ou personalizada"
          >
            <Download size={16} />
            <span>Exportar</span>
          </button>

          {/* Atalho Rápido Excel */}
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleQuickExportExcel}
            disabled={isQuickExportingExcel || isQuickExportingPdf || patients.length === 0}
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '12px',
              borderColor: '#86efac',
              background: '#f0fdf4',
              color: '#15803d',
              fontWeight: '600'
            }}
            title="Baixar planilha Excel (.xlsx) com todo o sistema em 1 clique"
          >
            {isQuickExportingExcel ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={16} color="#16a34a" />
            )}
            <span>{isQuickExportingExcel ? 'Gerando...' : 'Excel'}</span>
          </button>

          {/* Atalho Rápido PDF */}
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleQuickExportPdf}
            disabled={isQuickExportingExcel || isQuickExportingPdf || patients.length === 0}
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '12px',
              borderColor: '#bfdbfe',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontWeight: '600'
            }}
            title="Baixar dossiê PDF oficial com todo o sistema em 1 clique"
          >
            {isQuickExportingPdf ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} color="#2563eb" />
            )}
            <span>{isQuickExportingPdf ? 'Gerando...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Identificação Profissional */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <User size={18} /> Identificação Profissional do Médico
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="text-sm font-semibold mb-1 block">Nome Completo</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.nome || ''} 
                onChange={(e) => handleChange('nome', e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Título Profissional</label>
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
              <label className="text-sm font-semibold mb-1 block">RQE</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.rqe || ''} 
                placeholder="Ex: 98765"
                onChange={(e) => handleChange('rqe', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">CNS</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.cns || ''} 
                placeholder="Ex: 708401234567891"
                maxLength={15}
                onChange={(e) => handleChange('cns', e.target.value.replace(/\D/g, '').slice(0, 15))} 
                title="Cartão Nacional de Saúde (15 dígitos) - Exigido para LME"
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Especialidade</label>
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
            <Building2 size={18} /> Contato do Médico
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="text-sm font-semibold mb-1 block">Email</label>
              <input 
                type="email" 
                className="input-field" 
                value={profile.email || ''} 
                onChange={(e) => handleChange('email', e.target.value)} 
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Telefone</label>
              <input 
                type="text" 
                className="input-field" 
                value={profile.telefone || ''} 
                placeholder="(11) 98765-4321"
                onChange={(e) => handleChange('telefone', e.target.value)} 
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="text-sm font-semibold mb-1 block">Biografia</label>
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

        {/* Personalização Visual: Cores Pastéis */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <Palette size={18} /> Tema Visual do Sistema
            </h3>
            <span style={{ 
              fontSize: '0.75rem', 
              background: 'rgba(37, 99, 235, 0.1)', 
              color: 'var(--primary)', 
              padding: '3px 10px', 
              borderRadius: '12px', 
              fontWeight: '700' 
            }}>
              Ativo: {currentTheme.nome}
            </span>
          </div>
          <p className="text-xs text-muted mb-4">
            Personalize os tons de botões, destaques, ícones e cartões clínicos em toda a interface do Nex-Ai.NEFRO.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {themes.map((theme) => {
              const isSelected = currentThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => changeTheme(theme.id)}
                  style={{
                    background: isSelected ? theme.subtle : '#ffffff',
                    border: `2px solid ${isSelected ? theme.primary : theme.border}`,
                    borderRadius: '12px',
                    padding: '0.75rem 0.85rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 4px 12px ${theme.primary}20` : '0 1px 3px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: theme.previewGradient,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    {isSelected && <Check size={16} strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: '0.85rem', color: isSelected ? theme.primary : '#1e293b', display: 'block' }}>
                      {theme.nome}
                    </strong>
                    <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                      {theme.subtitulo}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Segurança da Conta: Alterar E-mail e Senha */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="mb-3">
            <h3 className="font-bold text-base flex items-center gap-2" style={{ color: 'var(--primary)' }}>
              <KeyRound size={18} /> Segurança da Conta
            </h3>
            <p className="text-xs text-muted mt-1">
              Altere suas credenciais de acesso de forma autônoma e segura. A confirmação da senha atual é obrigatória.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {/* Bloco 1: Alteração de E-mail */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} color="var(--primary)" />
                <strong className="text-sm text-slate-800">Alterar E-mail de Login</strong>
              </div>
              <p className="text-xs text-muted mb-3">
                E-mail em uso: <strong className="text-slate-800">{profile.email || currentUser?.email || 'Não informado'}</strong>
              </p>

              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="text-xs font-semibold mb-1 block text-slate-700">Novo E-mail</label>
                  <input
                    type="email"
                    className="input-field text-xs"
                    placeholder="exemplo@medico.com"
                    value={emailFormData.novoEmail}
                    onChange={(e) => setEmailFormData(prev => ({ ...prev, novoEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block text-slate-700">Senha Atual para Confirmação</label>
                  <input
                    type="password"
                    className="input-field text-xs"
                    placeholder="Sua senha atual"
                    value={emailFormData.senhaAtual}
                    onChange={(e) => setEmailFormData(prev => ({ ...prev, senhaAtual: e.target.value }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUpdateEmail}
                  className="btn btn-outline"
                  disabled={isUpdatingEmail}
                  style={{ 
                    padding: '0.45rem 0.9rem', 
                    fontSize: '0.8rem', 
                    alignSelf: 'flex-start',
                    borderColor: '#bfdbfe',
                    color: 'var(--primary)',
                    fontWeight: '600',
                    marginTop: '4px'
                  }}
                >
                  {isUpdatingEmail ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{isUpdatingEmail ? 'Salvando...' : 'Salvar Novo E-mail'}</span>
                </button>
              </div>
            </div>

            {/* Bloco 2: Alteração de Senha */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-2 mb-2">
                <Lock size={16} color="var(--primary)" />
                <strong className="text-sm text-slate-800">Alterar Senha de Acesso</strong>
              </div>
              <p className="text-xs text-muted mb-3">
                Mínimo de 6 caracteres recomendando letras e números.
              </p>

              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="text-xs font-semibold mb-1 block text-slate-700">Senha Atual</label>
                  <input
                    type="password"
                    className="input-field text-xs"
                    placeholder="Sua senha atual"
                    value={passwordFormData.senhaAtual}
                    onChange={(e) => setPasswordFormData(prev => ({ ...prev, senhaAtual: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block text-slate-700">Nova Senha</label>
                  <input
                    type="password"
                    className="input-field text-xs"
                    placeholder="Mínimo 6 caracteres"
                    value={passwordFormData.novaSenha}
                    onChange={(e) => setPasswordFormData(prev => ({ ...prev, novaSenha: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block text-slate-700">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    className="input-field text-xs"
                    placeholder="Repita a nova senha"
                    value={passwordFormData.confirmarSenha}
                    onChange={(e) => setPasswordFormData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  className="btn btn-outline"
                  disabled={isUpdatingPassword}
                  style={{ 
                    padding: '0.45rem 0.9rem', 
                    fontSize: '0.8rem', 
                    alignSelf: 'flex-start',
                    borderColor: '#bfdbfe',
                    color: 'var(--primary)',
                    fontWeight: '600',
                    marginTop: '4px'
                  }}
                >
                  {isUpdatingPassword ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>{isUpdatingPassword ? 'Salvando...' : 'Salvar'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/doctor')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Salvando...' : 'Salvar'}
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
                  {editingLocationId ? 'Editar Local' : 'Novo Local'}
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
                <label className="text-xs font-bold text-slate-700 mb-1 block">Nome da Unidade *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Centro de Diálise ou Hospital Central" 
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
                    <option value="Hospital Geral">🏨 Hospital Geral</option>
                    <option value="Ambulatório">🩺 Ambulatório</option>
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
                    <option value="Inativo">⏸️ Inativo</option>
                  </select>
                </div>
              </div>

              {/* Responsável Técnico e Enfermagem */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                  <ShieldCheck size={16} color="#2563eb" />
                  <span>Responsável Técnico (RT)</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Nome do RT</label>
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
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Contato da Enfermagem</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ex: (11) 98888-2222 (Posto)" 
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
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Turnos</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: 1º e 2º Turnos (Manhã)" 
                    value={locationFormData.turnos}
                    onChange={(e) => setLocationFormData(prev => ({ ...prev, turnos: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Cidade</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: São Paulo/SP" 
                    value={locationFormData.cidade}
                    onChange={(e) => setLocationFormData(prev => ({ ...prev, cidade: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 mb-1 block">Endereço</label>
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE PORTABILIDADE E EXPORTAÇÃO */}
      <SystemExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        patients={patients}
        doctor={profile}
        locais={locaisList}
      />

      {/* MODAL DE CONFIGURAÇÃO DE EVOLUÇÃO MÉDICA */}
      {isTemplateModalOpen && (
        <EvolutionTemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          doctorInfo={profile}
          onSaved={(newConfig) => {
            setProfile(prev => ({ ...prev, configuracaoEvolucao: newConfig }));
            setFeedbackMessage({ type: 'success', text: 'Padrão de evolução atualizado com sucesso!' });
            setTimeout(() => setFeedbackMessage(null), 4000);
          }}
        />
      )}
    </div>
  );
}
