import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Users, 
  Plus, 
  Shield, 
  Stethoscope, 
  Sparkles, 
  RotateCcw, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Building,
  Key,
  Database,
  Loader2,
  DollarSign,
  TrendingUp,
  CreditCard,
  Calendar,
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Edit,
  History,
  FileText,
  Search,
  CheckCircle2,
  Lock,
  Zap,
  Activity
} from 'lucide-react';
import { 
  subscribeDoctorsList, 
  saveDoctorProfile, 
  toggleDoctorLicenseStatus, 
  renewDoctorLicense 
} from '../services/doctorService';
import { seedDemoPatientsToFirestore } from '../services/patientService';
import { logAuditEvent, subscribeAuditLogs } from '../services/auditService';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { setActiveDoctorId, logout, currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('licenses'); // 'licenses' | 'audit' | 'financial'
  const [doctors, setDoctors] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewDoctor, setRenewDoctor] = useState(null);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewPaymentMethod, setRenewPaymentMethod] = useState('PIX');
  const [renewValue, setRenewValue] = useState(490.00);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyDoctor, setHistoryDoctor] = useState(null);

  // Form State para Nova / Editar Licença
  const [doctorForm, setDoctorForm] = useState({
    id: '',
    nome: '',
    cpf: '',
    crm: '',
    ufCrm: 'SP',
    rqe: '',
    especialidade: 'Nefrologia Clínica e Hemodiálise',
    email: '',
    telefone: '',
    clinicaPrincipal: '',
    statusLicenca: 'Ativo',
    plano: 'Mensal',
    valorMensalidade: 490.00,
    vigenciaMeses: 1
  });

  useEffect(() => {
    const unsubDocs = subscribeDoctorsList((list) => {
      setDoctors(list);
      setLoading(false);
    });

    const unsubAudit = subscribeAuditLogs((logs) => {
      setAuditLogs(logs);
      setAuditLoading(false);
    });

    return () => {
      unsubDocs();
      unsubAudit();
    };
  }, []);

  // Cálculo de Métricas Financeiras e Operacionais SaaS
  const activeDoctors = doctors.filter(d => d.statusLicenca === 'Ativo');
  const trialDoctors = doctors.filter(d => d.statusLicenca === 'Trial' || d.statusLicenca?.includes('Demonstração'));
  const suspendedDoctors = doctors.filter(d => d.statusLicenca === 'Suspenso');
  const cancelledDoctors = doctors.filter(d => d.statusLicenca === 'Cancelado');

  const mrr = activeDoctors.reduce((acc, doc) => {
    const val = Number(doc.valorMensalidade) || (doc.plano === 'Mensal' ? 490 : doc.plano === 'Anual' ? 408.33 : 0);
    return acc + val;
  }, 0);

  const arr = mrr * 12;
  const churnCount = suspendedDoctors.length + cancelledDoctors.length;
  const churnRate = doctors.length > 0 ? ((churnCount / doctors.length) * 100).toFixed(1) : '0.0';

  // Helper de cálculo de dias restantes da licença
  const getLicenseRemainingDays = (dataFim) => {
    if (!dataFim) return null;
    const end = new Date(dataFim);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Impersonação com Auditoria
  const handleAccessDoctor = async (doctor) => {
    try {
      await logAuditEvent({
        tipoAcao: 'IMPERSONATION',
        descricao: `Acesso administrativo auditado (impersonação) ao painel do médico ${doctor.nome} (CRM ${doctor.crm}/${doctor.ufCrm})`,
        targetDoctorId: doctor.id,
        targetDoctorName: doctor.nome,
        adminEmail: currentUser?.email || 'admin@nefroapp.com',
        detalhes: { doctorId: doctor.id, statusLicenca: doctor.statusLicenca }
      });
      setActiveDoctorId(doctor.id);
      navigate('/doctor');
    } catch (err) {
      console.error(err);
      setActiveDoctorId(doctor.id);
      navigate('/doctor');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleResetDemoData = async () => {
    if (window.confirm("Deseja restaurar a base de dados de demonstração no Cloud Firestore? Isso recriará os 6 pacientes clínicos com todos os exames, alertas e ciclos de medicação.")) {
      try {
        setSeeding(true);
        await seedDemoPatientsToFirestore();
        await logAuditEvent({
          tipoAcao: 'DEMO_RESET',
          descricao: 'Restauração da base completa de demonstração clínica no Firestore',
          adminEmail: currentUser?.email || 'admin@nefroapp.com'
        });
        setFeedback({ type: 'success', text: 'Base de demonstração restaurada com sucesso no Firestore!' });
        setTimeout(() => setFeedback(null), 5000);
      } catch (err) {
        console.error(err);
        setFeedback({ type: 'error', text: 'Falha ao restaurar dados no Firestore.' });
      } finally {
        setSeeding(false);
      }
    }
  };

  // Pausar / Reativar Licença
  const handleToggleStatus = async (doctor) => {
    const isCurrentlyActive = doctor.statusLicenca === 'Ativo' || doctor.statusLicenca === 'Trial';
    const targetStatus = isCurrentlyActive ? 'Suspenso' : 'Ativo';
    const confirmMsg = isCurrentlyActive 
      ? `Deseja suspender/pausar a licença de ${doctor.nome}? O acesso será bloqueado, mas todos os prontuários permanecerão intactos na nuvem.`
      : `Deseja reativar a licença de ${doctor.nome}? O acesso ao sistema será liberado imediatamente.`;

    if (window.confirm(confirmMsg)) {
      try {
        await toggleDoctorLicenseStatus(
          doctor.id, 
          targetStatus, 
          isCurrentlyActive ? 'Pausa solicitada pelo Super Administrador' : 'Reativação de licença',
          currentUser?.email || 'admin@nefroapp.com'
        );
        setFeedback({ 
          type: 'success', 
          text: `Licença de ${doctor.nome} alterada para '${targetStatus}' com sucesso!` 
        });
        setTimeout(() => setFeedback(null), 4000);
      } catch (err) {
        console.error(err);
        setFeedback({ type: 'error', text: 'Erro ao alterar status da licença.' });
      }
    }
  };

  // Abrir Modal de Nova Licença
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setDoctorForm({
      id: '',
      nome: '',
      cpf: '',
      crm: '',
      ufCrm: 'SP',
      rqe: '',
      especialidade: 'Nefrologia Clínica e Hemodiálise',
      email: '',
      telefone: '',
      clinicaPrincipal: '',
      statusLicenca: 'Ativo',
      plano: 'Mensal',
      valorMensalidade: 490.00,
      vigenciaMeses: 1
    });
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEditModal = (doctor) => {
    setModalMode('edit');
    setSelectedDoctor(doctor);
    setDoctorForm({
      id: doctor.id,
      nome: doctor.nome || '',
      cpf: doctor.cpf || '',
      crm: doctor.crm || '',
      ufCrm: doctor.ufCrm || 'SP',
      rqe: doctor.rqe || '',
      especialidade: doctor.especialidade || 'Nefrologia Clínica e Hemodiálise',
      email: doctor.email || '',
      telefone: doctor.telefone || '',
      clinicaPrincipal: doctor.clinicaPrincipal || '',
      statusLicenca: doctor.statusLicenca || 'Ativo',
      plano: doctor.plano || 'Mensal',
      valorMensalidade: doctor.valorMensalidade !== undefined ? doctor.valorMensalidade : 490.00,
      vigenciaMeses: 1
    });
    setIsModalOpen(true);
  };

  // Salvar Criação ou Edição
  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    if (!doctorForm.nome || !doctorForm.email) return;

    try {
      const isCreate = modalMode === 'create';
      const doctorId = isCreate ? ('doc-' + Date.now()) : doctorForm.id;
      
      const hoje = new Date();
      let dataInicio = selectedDoctor?.dataInicioAssinatura || hoje.toISOString();
      let dataFim = selectedDoctor?.dataFimAssinatura;

      if (isCreate || !dataFim) {
        const fim = new Date();
        fim.setMonth(fim.getMonth() + (Number(doctorForm.vigenciaMeses) || 1));
        dataFim = fim.toISOString();
      }

      const payload = {
        ...doctorForm,
        id: doctorId,
        titulo: 'Médico(a) Nefrologista',
        valorMensalidade: Number(doctorForm.valorMensalidade) || 0,
        dataInicioAssinatura: dataInicio,
        dataFimAssinatura: dataFim,
        atualizadoEm: new Date().toISOString()
      };

      if (isCreate) {
        payload.criadoEm = new Date().toISOString();
        payload.historicoPagamentos = [
          {
            id: `pag-${Date.now()}`,
            data: new Date().toISOString(),
            valor: payload.valorMensalidade,
            plano: `Plano ${payload.plano}`,
            status: "Pago",
            metodo: "PIX",
            referencia: "Contratação Inicial da Licença"
          }
        ];
      }

      await saveDoctorProfile(doctorId, payload);

      await logAuditEvent({
        tipoAcao: isCreate ? 'LICENSE_CREATED' : 'LICENSE_UPDATE',
        descricao: isCreate 
          ? `Nova licença criada para ${payload.nome} (CRM ${payload.crm}/${payload.ufCrm}, CPF ${payload.cpf || 'N/I'}) - Plano ${payload.plano}`
          : `Dados da licença de ${payload.nome} atualizados pelo administrador`,
        targetDoctorId: doctorId,
        targetDoctorName: payload.nome,
        adminEmail: currentUser?.email || 'admin@nefroapp.com'
      });

      setIsModalOpen(false);
      setFeedback({ 
        type: 'success', 
        text: isCreate ? 'Nova licença médica criada com sucesso no Firestore!' : 'Dados da licença atualizados com sucesso!' 
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Erro ao salvar licença no Firestore.' });
    }
  };

  // Abrir Modal de Renovação
  const handleOpenRenewModal = (doctor) => {
    setRenewDoctor(doctor);
    setRenewMonths(1);
    setRenewPaymentMethod('PIX');
    setRenewValue(490.00);
    setIsRenewModalOpen(true);
  };

  // Confirmar Renovação
  const handleConfirmRenew = async (e) => {
    e.preventDefault();
    if (!renewDoctor) return;

    try {
      await renewDoctorLicense(renewDoctor.id, Number(renewMonths), {
        valor: Number(renewValue),
        metodo: renewPaymentMethod,
        referencia: `Renovação +${renewMonths} mês(es) via ${renewPaymentMethod}`,
        adminEmail: currentUser?.email || 'admin@nefroapp.com'
      });

      setIsRenewModalOpen(false);
      setFeedback({ 
        type: 'success', 
        text: `Assinatura de ${renewDoctor.nome} renovada com sucesso por +${renewMonths} mês(es)!` 
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Erro ao renovar assinatura no Firestore.' });
    }
  };

  // Abrir Modal de Histórico de Pagamentos
  const handleOpenHistoryModal = (doctor) => {
    setHistoryDoctor(doctor);
    setIsHistoryModalOpen(true);
  };

  // Filtragem da Lista de Médicos
  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = 
      (d.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.crm || '').includes(searchTerm) ||
      (d.cpf || '').includes(searchTerm) ||
      (d.clinicaPrincipal || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'Todos') return matchesSearch;
    if (statusFilter === 'Ativo') return matchesSearch && d.statusLicenca === 'Ativo';
    if (statusFilter === 'Trial') return matchesSearch && (d.statusLicenca === 'Trial' || d.statusLicenca?.includes('Demonstração'));
    if (statusFilter === 'Suspenso') return matchesSearch && d.statusLicenca === 'Suspenso';
    if (statusFilter === 'Cancelado') return matchesSearch && d.statusLicenca === 'Cancelado';
    return matchesSearch;
  });

  return (
    <div className="container" style={{ paddingBottom: '5rem', maxWidth: '1180px' }}>
      
      {/* Cabeçalho do Super Admin */}
      <header className="flex justify-between items-center mt-3 mb-5 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div style={{ padding: '10px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', borderRadius: '14px', color: 'white', boxShadow: '0 8px 16px rgba(124, 58, 237, 0.25)' }}>
            <Shield size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.3px' }}>Painel Super Administrador</h1>
              <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                100% Cloud Firestore
              </span>
            </div>
            <p className="text-muted text-sm mt-0.5">Gestão de Licenças Médicas, Segurança, Auditoria e Finanças</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="btn btn-outline" 
            onClick={handleResetDemoData}
            disabled={seeding}
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem', borderColor: '#bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: '600' }}
            title="Restaura os 6 pacientes de teste com exames e prescrições completas"
          >
            {seeding ? <Loader2 className="animate-spin" size={15} /> : <RotateCcw size={15} />}
            <span>{seeding ? 'Restaurando...' : 'Restaurar Base de Demonstração'}</span>
          </button>

          <button 
            className="btn btn-outline" 
            onClick={handleLogout} 
            style={{ padding: '0.55rem', borderRadius: '12px' }}
            title="Sair do painel administrativo"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {feedback && (
        <div 
          className="glass-panel animate-in" 
          style={{ 
            padding: '1rem 1.25rem', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            background: feedback.type === 'error' ? 'rgba(254, 242, 242, 0.95)' : 'rgba(240, 253, 244, 0.95)',
            borderColor: feedback.type === 'error' ? '#fecaca' : '#bbf7d0',
            color: feedback.type === 'error' ? '#b91c1c' : '#047857',
            fontWeight: '600'
          }}
        >
          {feedback.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Cards de Métricas Financeiras & SaaS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Card MRR */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.8), rgba(255, 255, 255, 0.9))', border: '1px solid #bbf7d0' }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">MRR (Mensalidade Recorrente)</span>
            <div style={{ padding: '6px', background: '#dcfce7', borderRadius: '8px', color: '#15803d' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-muted mt-1 flex items-center gap-1">
            <TrendingUp size={13} color="#16a34a" />
            <span>ARR Projetado: <strong>R$ {arr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano</strong></span>
          </div>
        </div>

        {/* Card Médicos e Licenças */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8), rgba(255, 255, 255, 0.9))', border: '1px solid #bfdbfe' }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Médicos & Licenças</span>
            <div style={{ padding: '6px', background: '#dbeafe', borderRadius: '8px', color: '#1d4ed8' }}>
              <Stethoscope size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {doctors.length} <span className="text-xs font-normal text-muted">médicos cadastrados</span>
          </div>
          <div className="text-xs text-muted mt-1 flex items-center gap-2 flex-wrap">
            <span style={{ color: '#16a34a', fontWeight: '600' }}>● {activeDoctors.length} Ativos</span>
            <span style={{ color: '#2563eb', fontWeight: '600' }}>● {trialDoctors.length} Trial</span>
            <span style={{ color: '#d97706', fontWeight: '600' }}>● {suspendedDoctors.length} Pausados</span>
          </div>
        </div>

        {/* Card Conformidade e Auditoria */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(250, 245, 255, 0.8), rgba(255, 255, 255, 0.9))', border: '1px solid #e9d5ff' }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Segurança & Auditoria</span>
            <div style={{ padding: '6px', background: '#ede9fe', borderRadius: '8px', color: '#7c3aed' }}>
              <Lock size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {auditLogs.length} <span className="text-xs font-normal text-muted">eventos auditados</span>
          </div>
          <div className="text-xs text-muted mt-1 flex items-center gap-1">
            <CheckCircle2 size={13} color="#7c3aed" />
            <span>Trilha imutável gravada no Cloud Firestore</span>
          </div>
        </div>

        {/* Card Inadimplência / Churn */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.8), rgba(255, 255, 255, 0.9))', border: '1px solid #fecaca' }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Inadimplência / Churn</span>
            <div style={{ padding: '6px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {churnRate}% <span className="text-xs font-normal text-muted">({churnCount} suspensos/cancelados)</span>
          </div>
          <div className="text-xs text-muted mt-1">
            <span>Controle automático de suspensão sem perda de dados</span>
          </div>
        </div>
      </div>

      {/* Navegação por Abas no Painel */}
      <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap" style={{ borderColor: 'var(--border)' }}>
        <button
          className={`btn ${activeTab === 'licenses' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('licenses')}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Stethoscope size={16} />
          <span>Gestão de Licenças por Médico ({doctors.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('audit')}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Activity size={16} />
          <span>Trilha de Auditoria & Impersonação ({auditLogs.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'financial' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('financial')}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <CreditCard size={16} />
          <span>Módulo Financeiro & Gateways</span>
        </button>
      </div>

      {/* ================= ABA 1: GESTÃO DE LICENÇAS MÉDICAS ================= */}
      {activeTab === 'licenses' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-lg">Controle de Assinaturas & Licenças Médicas</h2>
              <p className="text-muted text-xs mt-0.5">Vínculo com CRM, CPF, vigência de contrato e controle de acesso</p>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleOpenCreateModal}
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Nova Licença Médica
            </button>
          </div>

          {/* Filtros e Busca */}
          <div className="flex gap-2 mb-4 flex-wrap items-center">
            <div style={{ position: 'relative', flex: '1 1 280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Buscar por nome, CRM, CPF ou clínica..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.3rem', fontSize: '0.85rem' }}
              />
            </div>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {['Todos', 'Ativo', 'Trial', 'Suspenso', 'Cancelado'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                    fontWeight: statusFilter === status ? 'bold' : '500',
                    background: statusFilter === status ? '#ffffff' : 'transparent',
                    color: statusFilter === status ? '#1e293b' : '#64748b',
                    boxShadow: statusFilter === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-muted">
              <Loader2 className="animate-spin mx-auto mb-2" size={28} color="var(--primary)" />
              <p className="text-sm">Carregando licenças médicas do Firestore...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Médico / Responsável</th>
                    <th style={{ padding: '0.85rem 1rem' }}>CRM / RQE / CPF</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Plano & Mensalidade</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Vigência & Vencimento</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Ações de Gestão</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-muted">
                        Nenhum médico encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredDoctors.map((docItem, idx) => {
                      const remainingDays = getLicenseRemainingDays(docItem.dataFimAssinatura);
                      const isSuspended = docItem.statusLicenca === 'Suspenso';
                      const isTrial = docItem.statusLicenca === 'Trial' || docItem.statusLicenca?.includes('Demonstração');

                      return (
                        <tr 
                          key={docItem.id || idx} 
                          style={{ 
                            borderBottom: '1px solid #f1f5f9', 
                            background: isSuspended ? 'rgba(254, 242, 242, 0.4)' : (docItem.id === 'dr-marcelo' ? 'rgba(239, 246, 255, 0.35)' : '#ffffff') 
                          }}
                        >
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div className="flex items-center gap-2.5">
                              <div style={{ padding: '6px', background: isSuspended ? '#fee2e2' : '#dbeafe', borderRadius: '8px', color: isSuspended ? '#dc2626' : '#2563eb' }}>
                                <Stethoscope size={16} />
                              </div>
                              <div>
                                <strong style={{ color: '#1e293b', fontSize: '0.88rem' }}>{docItem.nome}</strong>
                                <div className="text-xs text-muted">{docItem.email}</div>
                                {docItem.clinicaPrincipal && (
                                  <div className="text-xs" style={{ color: '#475569' }}>🏢 {docItem.clinicaPrincipal}</div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: '600', color: '#334155' }}>
                              CRM {docItem.crm}/{docItem.ufCrm}
                            </div>
                            {docItem.rqe && <div className="text-xs text-muted">RQE {docItem.rqe}</div>}
                            <div className="text-xs text-muted">CPF: {docItem.cpf || 'Não informado'}</div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: '600', color: '#0f172a' }}>
                              {docItem.plano || 'Mensal'}
                            </div>
                            <div className="text-xs text-muted">
                              {Number(docItem.valorMensalidade) > 0 
                                ? `R$ ${Number(docItem.valorMensalidade).toFixed(2)}/mês` 
                                : 'Gratuito (Demonstração)'}
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            {docItem.dataFimAssinatura ? (
                              <div>
                                <div className="text-xs text-slate-700 font-medium">
                                  Até {new Date(docItem.dataFimAssinatura).toLocaleDateString('pt-BR')}
                                </div>
                                {remainingDays !== null && (
                                  <span 
                                    style={{ 
                                      fontSize: '0.7rem', 
                                      padding: '2px 6px', 
                                      borderRadius: '6px', 
                                      fontWeight: '600',
                                      display: 'inline-block',
                                      marginTop: '2px',
                                      background: remainingDays > 15 ? '#dcfce7' : remainingDays > 0 ? '#fef3c7' : '#fee2e2',
                                      color: remainingDays > 15 ? '#15803d' : remainingDays > 0 ? '#b45309' : '#b91c1c'
                                    }}
                                  >
                                    {remainingDays > 0 ? `${remainingDays} dias restantes` : 'Expirada'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted">Sem expiração</span>
                            )}
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span 
                              style={{ 
                                fontSize: '0.72rem', 
                                padding: '3px 8px', 
                                borderRadius: '10px', 
                                fontWeight: 'bold',
                                background: docItem.statusLicenca === 'Ativo' ? '#dcfce7' : 
                                            isTrial ? '#dbeafe' : 
                                            isSuspended ? '#fee2e2' : '#f1f5f9',
                                color: docItem.statusLicenca === 'Ativo' ? '#15803d' : 
                                       isTrial ? '#1d4ed8' : 
                                       isSuspended ? '#b91c1c' : '#475569'
                              }}
                            >
                              {docItem.statusLicenca || 'Ativo'}
                            </span>
                          </td>

                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              {/* Botão Acessar / Impersonar */}
                              <button 
                                className="btn btn-outline" 
                                onClick={() => handleAccessDoctor(docItem)}
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#2563eb', borderColor: '#bfdbfe', background: '#eff6ff', fontWeight: '600' }}
                                title="Acessar com registro de auditoria na nuvem"
                              >
                                <ExternalLink size={13} /> Acessar
                              </button>

                              {/* Botão Pausar / Reativar */}
                              <button 
                                className="btn btn-outline" 
                                onClick={() => handleToggleStatus(docItem)}
                                style={{ 
                                  padding: '0.35rem 0.65rem', 
                                  fontSize: '0.75rem', 
                                  color: isSuspended ? '#16a34a' : '#d97706',
                                  borderColor: isSuspended ? '#bbf7d0' : '#fde68a',
                                  background: isSuspended ? '#f0fdf4' : '#fffbeb'
                                }}
                                title={isSuspended ? "Reativar licença médica" : "Pausar/Suspender licença (dados continuam seguros)"}
                              >
                                {isSuspended ? <PlayCircle size={13} /> : <PauseCircle size={13} />}
                                <span>{isSuspended ? 'Reativar' : 'Pausar'}</span>
                              </button>

                              {/* Botão Renovar */}
                              <button 
                                className="btn btn-outline" 
                                onClick={() => handleOpenRenewModal(docItem)}
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#7c3aed', borderColor: '#ddd6fe', background: '#f5f3ff' }}
                                title="Renovar assinatura da licença"
                              >
                                <RefreshCw size={13} /> Renovar
                              </button>

                              {/* Botão Histórico de Pagamentos */}
                              <button 
                                className="btn btn-outline" 
                                onClick={() => handleOpenHistoryModal(docItem)}
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', color: '#475569' }}
                                title="Ver histórico de transações e pagamentos"
                              >
                                <History size={13} />
                              </button>

                              {/* Botão Editar Cadastro */}
                              <button 
                                className="btn btn-outline" 
                                onClick={() => handleOpenEditModal(docItem)}
                                style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', color: '#475569' }}
                                title="Editar dados cadastrais e licença"
                              >
                                <Edit size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= ABA 2: TRILHA DE AUDITORIA & SEGURANÇA ================= */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Shield size={20} color="#7c3aed" /> Trilha de Auditoria & Conformidade
              </h2>
              <p className="text-muted text-xs mt-0.5">
                Logs imutáveis gravados no Firestore para rastrear impersonações, alterações de licença e acessos
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#ede9fe', color: '#6d28d9', padding: '4px 10px', borderRadius: '10px', fontWeight: '600' }}>
              Proteção de Dados Médicos
            </span>
          </div>

          {auditLoading ? (
            <div className="py-12 text-center text-muted">
              <Loader2 className="animate-spin mx-auto mb-2" size={28} color="#7c3aed" />
              <p className="text-sm">Carregando trilha de auditoria da nuvem...</p>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-12 text-center text-muted">
              <p className="text-sm">Nenhum evento registrado até o momento.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Data & Hora</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Tipo de Ação</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Descrição do Evento</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Admin Responsável</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Médico Alvo</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: '#64748b' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : 'Agora'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span 
                          style={{ 
                            fontSize: '0.7rem', 
                            padding: '2px 8px', 
                            borderRadius: '6px', 
                            fontWeight: 'bold',
                            background: log.tipoAcao === 'IMPERSONATION' ? '#fef3c7' :
                                        log.tipoAcao === 'LICENSE_PAUSED' ? '#fee2e2' :
                                        log.tipoAcao === 'LICENSE_RENEWED' ? '#dcfce7' : '#ede9fe',
                            color: log.tipoAcao === 'IMPERSONATION' ? '#b45309' :
                                   log.tipoAcao === 'LICENSE_PAUSED' ? '#b91c1c' :
                                   log.tipoAcao === 'LICENSE_RENEWED' ? '#15803d' : '#6d28d9'
                          }}
                        >
                          {log.tipoAcao}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#1e293b' }}>
                        {log.descricao}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                        {log.adminEmail || 'admin@nefroapp.com'}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '500', color: '#334155' }}>
                        {log.targetDoctorName || log.targetDoctorId || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= ABA 3: MÓDULO FINANCEIRO & GATEWAYS ================= */}
      {activeTab === 'financial' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <h2 className="font-bold text-lg mb-1 flex items-center gap-2">
            <CreditCard size={20} color="#16a34a" /> Configuração Financeira & Integração de Cobrança
          </h2>
          <p className="text-muted text-xs mb-5">
            Gestão de precificação recorrente por médico, controle de faturamento e integração com gateways
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            
            {/* Tabela de Planos Padrão */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#0f172a' }}>
                <Zap size={16} color="#eab308" /> Catálogo de Planos Médicos
              </h3>
              
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 flex justify-between items-center">
                  <div>
                    <strong className="text-sm block text-emerald-900">Plano Mensal Nefrologia</strong>
                    <span className="text-xs text-muted">Acesso ilimitado a prontuários e diálise</span>
                  </div>
                  <div className="text-right">
                    <strong className="text-sm block text-emerald-700">R$ 490,00</strong>
                    <span className="text-xs text-muted">por mês</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50 flex justify-between items-center">
                  <div>
                    <strong className="text-sm block text-blue-900">Plano Anual com Desconto</strong>
                    <span className="text-xs text-muted">Cobrança única anual (+2 meses grátis)</span>
                  </div>
                  <div className="text-right">
                    <strong className="text-sm block text-blue-700">R$ 4.900,00</strong>
                    <span className="text-xs text-muted">por ano</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 flex justify-between items-center">
                  <div>
                    <strong className="text-sm block text-purple-900">Plano Trial / Demonstração</strong>
                    <span className="text-xs text-muted">Avaliação médica por período determinado</span>
                  </div>
                  <div className="text-right">
                    <strong className="text-sm block text-purple-700">Gratuito</strong>
                    <span className="text-xs text-muted">Trial ativo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gateways de Pagamento */}
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#0f172a' }}>
                <Building size={16} color="#2563eb" /> Conectores de Gateways de Pagamento
              </h3>
              
              <div className="flex flex-col gap-2.5">
                <div className="p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                  <div>
                    <strong className="text-xs block text-slate-800">PIX Instantâneo Automático</strong>
                    <span className="text-xs text-muted">Geração de QR Code e confirmação imediata</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Ativo
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                  <div>
                    <strong className="text-xs block text-slate-800">Asaas / Mercado Pago / Stripe</strong>
                    <span className="text-xs text-muted">Cobrança recorrente em cartão de crédito</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Webhook Pronto
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                  <div>
                    <strong className="text-xs block text-slate-800">Suspensão Automática por Inadimplência</strong>
                    <span className="text-xs text-muted">Pausa o acesso após 5 dias de vencimento</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Configurado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: NOVA LICENÇA / EDITAR LICENÇA ================= */}
      {isModalOpen && (
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
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="glass-panel animate-in" 
            style={{ 
              background: 'var(--surface-solid)', 
              width: '100%', 
              maxWidth: '560px', 
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem', 
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-1">
              {modalMode === 'create' ? 'Cadastrar Nova Licença Médica' : 'Editar Licença Médica'}
            </h2>
            <p className="text-xs text-muted mb-4">
              {modalMode === 'create' ? 'Adiciona um novo médico assinante no Firestore' : `Atualiza dados de ${doctorForm.nome}`}
            </p>

            <form onSubmit={handleSaveDoctor} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Nome Completo do Médico *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Dr. Roberto Guimarães" 
                  value={doctorForm.nome}
                  onChange={(e) => setDoctorForm(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label className="text-xs font-semibold mb-1 block">CPF do Médico *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="000.000.000-00" 
                    value={doctorForm.cpf}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, cpf: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="(11) 98888-7777" 
                    value={doctorForm.telefone}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '0.6rem' }}>
                <div>
                  <label className="text-xs font-semibold mb-1 block">CRM *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: 112233" 
                    value={doctorForm.crm}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, crm: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">UF</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="SP" 
                    value={doctorForm.ufCrm}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, ufCrm: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">RQE</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: 45890" 
                    value={doctorForm.rqe}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, rqe: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Email de Acesso *</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="roberto@clinica.com" 
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Clínica / Serviço Principal</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Instituto de Nefrologia" 
                  value={doctorForm.clinicaPrincipal}
                  onChange={(e) => setDoctorForm(prev => ({ ...prev, clinicaPrincipal: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Plano Contratado</label>
                  <select 
                    className="input-field"
                    value={doctorForm.plano}
                    onChange={(e) => {
                      const p = e.target.value;
                      setDoctorForm(prev => ({ 
                        ...prev, 
                        plano: p,
                        valorMensalidade: p === 'Mensal' ? 490 : p === 'Anual' ? 4900 : 0
                      }));
                    }}
                  >
                    <option value="Mensal">Mensal (R$ 490/mês)</option>
                    <option value="Anual">Anual (R$ 4.900/ano)</option>
                    <option value="Demonstração">Demonstração / Trial</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Valor (R$)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={doctorForm.valorMensalidade}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, valorMensalidade: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Status</label>
                  <select 
                    className="input-field"
                    value={doctorForm.statusLicenca}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, statusLicenca: e.target.value }))}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Trial">Trial</option>
                    <option value="Suspenso">Suspenso</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {modalMode === 'create' && (
                <div>
                  <label className="text-xs font-semibold mb-1 block">Vigência Inicial (Meses)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    min="1" 
                    max="36" 
                    value={doctorForm.vigenciaMeses}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, vigenciaMeses: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'create' ? 'Cadastrar Licença' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RENOVAÇÃO DE ASSINATURA ================= */}
      {isRenewModalOpen && renewDoctor && (
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
          onClick={() => setIsRenewModalOpen(false)}
        >
          <div 
            className="glass-panel animate-in" 
            style={{ 
              background: 'var(--surface-solid)', 
              width: '100%', 
              maxWidth: '480px', 
              padding: '2rem', 
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-1">Renovar Licença Médica</h2>
            <p className="text-xs text-muted mb-4">
              Médico: <strong>{renewDoctor.nome}</strong> (CRM {renewDoctor.crm}/{renewDoctor.ufCrm})
            </p>

            <form onSubmit={handleConfirmRenew} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold mb-1 block">Período de Renovação</label>
                <select 
                  className="input-field"
                  value={renewMonths}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setRenewMonths(m);
                    setRenewValue(m === 12 ? 4900 : m * 490);
                  }}
                >
                  <option value="1">+1 Mês (R$ 490,00)</option>
                  <option value="3">+3 Meses (R$ 1.470,00)</option>
                  <option value="6">+6 Meses (R$ 2.940,00)</option>
                  <option value="12">+12 Meses / Anual (R$ 4.900,00)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label className="text-xs font-semibold mb-1 block">Método de Pagamento</label>
                  <select 
                    className="input-field"
                    value={renewPaymentMethod}
                    onChange={(e) => setRenewPaymentMethod(e.target.value)}
                  >
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Boleto Bancário">Boleto Bancário</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block">Valor Cobrado (R$)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={renewValue}
                    onChange={(e) => setRenewValue(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-muted">
                📌 A renovação registrará a transação no histórico financeiro e atualizará o status da licença para <strong>Ativo</strong>.
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <button type="button" className="btn btn-outline" onClick={() => setIsRenewModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar Renovação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: HISTÓRICO DE PAGAMENTOS ================= */}
      {isHistoryModalOpen && historyDoctor && (
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
          onClick={() => setIsHistoryModalOpen(false)}
        >
          <div 
            className="glass-panel animate-in" 
            style={{ 
              background: 'var(--surface-solid)', 
              width: '100%', 
              maxWidth: '560px', 
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '2rem', 
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-1">Histórico Financeiro da Licença</h2>
            <p className="text-xs text-muted mb-4">
              Médico: <strong>{historyDoctor.nome}</strong> (CRM {historyDoctor.crm}/{historyDoctor.ufCrm})
            </p>

            {(!historyDoctor.historicoPagamentos || historyDoctor.historicoPagamentos.length === 0) ? (
              <div className="py-8 text-center text-muted text-sm">
                Nenhum registro de pagamento anterior encontrado para esta conta.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {historyDoctor.historicoPagamentos.map((pag, idx) => (
                  <div key={pag.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                    <div>
                      <strong className="text-sm block text-slate-800">{pag.referencia || pag.plano || 'Mensalidade'}</strong>
                      <span className="text-xs text-muted">
                        📅 {pag.data ? new Date(pag.data).toLocaleDateString('pt-BR') : 'Data não informada'} • Método: {pag.metodo || 'PIX'}
                      </span>
                    </div>
                    <div className="text-right">
                      <strong className="text-sm block text-emerald-700">
                        R$ {Number(pag.valor || 0).toFixed(2)}
                      </strong>
                      <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {pag.status || 'Pago'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-4 pt-3 border-t">
              <button type="button" className="btn btn-primary" onClick={() => setIsHistoryModalOpen(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
