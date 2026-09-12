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
  Trash2,
  FileText,
  Search,
  CheckCircle2,
  Lock,
  Zap,
  Activity,
  Sliders,
  Settings
} from 'lucide-react';
import { 
  subscribeDoctorsList, 
  saveDoctorProfile, 
  toggleDoctorLicenseStatus, 
  renewDoctorLicense,
  deleteDoctor 
} from '../services/doctorService';
import { 
  subscribeSystemPlans, 
  deleteSystemPlan, 
  toggleSystemPlanStatus, 
  subscribeGatewayConfig 
} from '../services/financialService';
import { logAuditEvent, subscribeAuditLogs } from '../services/auditService';
import { useAuth } from '../context/AuthContext';
import PlanModal from '../components/PlanModal';
import GatewayModal from '../components/GatewayModal';
import BrandLogo from '../components/BrandLogo';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('licenses'); // 'licenses' | 'audit' | 'financial'
  const [doctors, setDoctors] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [systemPlans, setSystemPlans] = useState([]);
  const [gatewayConfig, setGatewayConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Modais de Licença Médica
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

  // Modais Financeiros (CRUD Planos & Gateways)
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState(null);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);

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
    plano: 'Plano Mensal Nefrologia',
    valorBase: 99.90,
    descontoTipo: 'nenhum', // 'nenhum' | 'fixo' | 'porcentagem'
    descontoValor: 0,
    valorMensalidade: 99.90,
    vigenciaMeses: 1
  });

  useEffect(() => {
    const unsubDocs = subscribeDoctorsList((list) => {
      setDoctors(list || []);
      setLoading(false);
    });

    const unsubAudit = subscribeAuditLogs((logs) => {
      setAuditLogs(logs || []);
      setAuditLoading(false);
    });

    const unsubPlans = subscribeSystemPlans((plans) => {
      setSystemPlans(plans || []);
    });

    const unsubGateways = subscribeGatewayConfig((config) => {
      setGatewayConfig(config || {});
    });

    return () => {
      unsubDocs();
      unsubAudit();
      unsubPlans();
      unsubGateways();
    };
  }, []);

  // Cálculo de Métricas Financeiras e Operacionais SaaS
  const activeDoctors = doctors.filter(d => d.statusLicenca === 'Ativo');
  const trialDoctors = doctors.filter(d => d.statusLicenca === 'Trial' || d.statusLicenca?.includes('Demonstração'));
  const suspendedDoctors = doctors.filter(d => d.statusLicenca === 'Suspenso');
  const cancelledDoctors = doctors.filter(d => d.statusLicenca === 'Cancelado');

  const mrr = activeDoctors.reduce((acc, doc) => {
    const val = Number(doc.valorMensalidade) !== undefined && !isNaN(Number(doc.valorMensalidade))
      ? Number(doc.valorMensalidade) 
      : (doc.plano?.toLowerCase().includes('anual') ? 82.50 : 99.90);
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Excluir Licença Médica com Confirmação e Auditoria
  const handleDeleteDoctor = async (doctor) => {
    const isMainDemo = doctor.id === 'dr-marcelo';
    const confirmMsg = isMainDemo
      ? `ATENÇÃO: '${doctor.nome}' é o usuário de demonstração. Deseja realmente excluí-lo do sistema?`
      : `ATENÇÃO: Tem certeza de que deseja excluir permanentemente a licença e dados do médico ${doctor.nome} (CRM ${doctor.crm}/${doctor.ufCrm})? Esta ação removerá o acesso e os dados no Firestore.`;

    if (window.confirm(confirmMsg)) {
      try {
        await deleteDoctor(doctor.id, currentUser?.email || 'admin@nefroapp.com');
        setFeedback({ 
          type: 'success', 
          text: `Licença de ${doctor.nome} excluída com sucesso do Cloud Firestore!` 
        });
        setTimeout(() => setFeedback(null), 4000);
      } catch (err) {
        console.error("Erro ao excluir médico:", err);
        setFeedback({ type: 'error', text: 'Falha ao excluir licença médica no Firestore.' });
      }
    }
  };

  // Pausar / Reativar Licença
  const handleToggleStatus = async (doctor) => {
    const isCurrentlyActive = doctor.statusLicenca === 'Ativo' || doctor.statusLicenca === 'Trial';
    const targetStatus = isCurrentlyActive ? 'Suspenso' : 'Ativo';
    const confirmMsg = isCurrentlyActive 
      ? `Deseja suspender/pausar a licença de ${doctor.nome}? O acesso será bloqueado temporariamente com segurança.`
      : `Deseja reativar a licença de ${doctor.nome}? O acesso ao sistema será liberado imediatamente.`;

    if (window.confirm(confirmMsg)) {
      try {
        await toggleDoctorLicenseStatus(
          doctor.id, 
          targetStatus, 
          isCurrentlyActive ? 'Pausa administrativa de licença' : 'Reativação de licença',
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

  // Helper para cálculo automático do valor com desconto
  const calculateFinalPrice = (base, tipo, desc) => {
    const numBase = Math.max(0, Number(base) || 0);
    const numDesc = Math.max(0, Number(desc) || 0);
    if (tipo === 'fixo') {
      return Math.max(0, Number((numBase - numDesc).toFixed(2)));
    } else if (tipo === 'porcentagem') {
      const discountAmount = (numBase * Math.min(100, numDesc)) / 100;
      return Math.max(0, Number((numBase - discountAmount).toFixed(2)));
    }
    return numBase;
  };

  // Abrir Modal de Nova Licença
  const handleOpenCreateModal = () => {
    setModalMode('create');
    const defaultPlan = systemPlans.find(p => p.status === 'Ativo' && p.intervalo === 'mensal') || systemPlans[0];
    const initialPrice = defaultPlan ? Number(defaultPlan.valor) : 99.90;
    const initialPlanName = defaultPlan ? defaultPlan.nome : 'Plano Mensal Nefrologia';

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
      plano: initialPlanName,
      valorBase: initialPrice,
      descontoTipo: 'nenhum',
      descontoValor: 0,
      valorMensalidade: initialPrice,
      vigenciaMeses: defaultPlan?.intervalo === 'anual' ? 12 : 1
    });
    setIsModalOpen(true);
  };

  // Abrir Modal de Edição
  const handleOpenEditModal = (doctor) => {
    setModalMode('edit');
    setSelectedDoctor(doctor);

    const matchedPlan = systemPlans.find(p => 
      p.nome === doctor.plano || 
      p.id === doctor.plano ||
      (doctor.plano?.toLowerCase().includes('mensal') && (p.id === 'plano-mensal' || p.intervalo === 'mensal')) ||
      (doctor.plano?.toLowerCase().includes('anual') && (p.id === 'plano-anual' || p.intervalo === 'anual')) ||
      ((doctor.plano?.toLowerCase().includes('trial') || doctor.plano?.toLowerCase().includes('demo')) && (p.id === 'plano-trial' || p.intervalo === 'trial'))
    );

    const resolvedPlanName = matchedPlan ? matchedPlan.nome : (doctor.plano || 'Plano Mensal Nefrologia');

    const valorBase = (doctor.valorBase !== undefined && doctor.valorBase !== null)
      ? Number(doctor.valorBase) 
      : (matchedPlan ? Number(matchedPlan.valor) : (Number(doctor.valorMensalidade) || 99.90));
    
    let valorAtual = Number(doctor.valorMensalidade);
    if (!doctor.descontoTipo && (valorAtual === 490 || isNaN(valorAtual) || valorAtual === undefined)) {
      valorAtual = valorBase;
    }

    let descontoTipo = doctor.descontoTipo || 'nenhum';
    let descontoValor = Number(doctor.descontoValor) || 0;
    if (descontoTipo === 'nenhum' && valorBase > valorAtual && valorAtual > 0 && valorAtual !== 490) {
      descontoTipo = 'fixo';
      descontoValor = Number((valorBase - valorAtual).toFixed(2));
    }

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
      plano: resolvedPlanName,
      valorBase: valorBase,
      descontoTipo: descontoTipo,
      descontoValor: descontoValor,
      valorMensalidade: valorAtual,
      vigenciaMeses: 1
    });
    setIsModalOpen(true);
  };

  // Mudança de Plano no Modal do Médico
  const handlePlanChange = (newPlanName) => {
    const matched = systemPlans.find(p => p.nome === newPlanName || p.id === newPlanName);
    let newBase = 0;
    let newVigencia = doctorForm.vigenciaMeses;

    if (matched) {
      newBase = Number(matched.valor) || 0;
      if (modalMode === 'create') {
        newVigencia = matched.intervalo === 'anual' ? 12 : 1;
      }
    } else if (newPlanName === 'Demonstração') {
      newBase = 0;
    } else {
      newBase = Number(doctorForm.valorBase) || 99.90;
    }

    const finalVal = calculateFinalPrice(newBase, doctorForm.descontoTipo, doctorForm.descontoValor);

    setDoctorForm(prev => ({
      ...prev,
      plano: newPlanName,
      valorBase: newBase,
      valorMensalidade: finalVal,
      vigenciaMeses: newVigencia
    }));
  };

  // Mudança do Tipo de Desconto
  const handleDiscountTypeChange = (newTipo) => {
    const finalVal = calculateFinalPrice(doctorForm.valorBase, newTipo, doctorForm.descontoValor);
    setDoctorForm(prev => ({
      ...prev,
      descontoTipo: newTipo,
      valorMensalidade: finalVal
    }));
  };

  // Mudança do Valor do Desconto
  const handleDiscountValueChange = (valStr) => {
    const num = Math.max(0, parseFloat(valStr) || 0);
    const finalVal = calculateFinalPrice(doctorForm.valorBase, doctorForm.descontoTipo, num);
    setDoctorForm(prev => ({
      ...prev,
      descontoValor: num,
      valorMensalidade: finalVal
    }));
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
        valorBase: Number(doctorForm.valorBase) || 0,
        descontoTipo: doctorForm.descontoTipo || 'nenhum',
        descontoValor: Number(doctorForm.descontoValor) || 0,
        valorMensalidade: Number(doctorForm.valorMensalidade) || 0,
        dataInicioAssinatura: dataInicio,
        dataFimAssinatura: dataFim,
        atualizadoEm: new Date().toISOString()
      };

      if (isCreate) {
        payload.criadoEm = new Date().toISOString();
        payload.pacientesCount = 0;
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

    const monthlyPlan = systemPlans.find(p => p.status === 'Ativo' && p.intervalo === 'mensal');
    const baseRate = Number(doctor.valorMensalidade) > 0 
      ? Number(doctor.valorMensalidade)
      : (monthlyPlan ? Number(monthlyPlan.valor) : 99.90);

    setRenewValue(baseRate);
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

  // Ações do Módulo Financeiro
  const handleOpenCreatePlan = () => {
    setPlanToEdit(null);
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan) => {
    setPlanToEdit(plan);
    setIsPlanModalOpen(true);
  };

  const handleTogglePlan = async (plan) => {
    try {
      const next = await toggleSystemPlanStatus(plan.id, plan.status, plan.nome, currentUser?.email);
      setFeedback({ type: 'success', text: `Plano '${plan.nome}' agora está ${next}.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Erro ao alterar status do plano.' });
    }
  };

  const handleDeletePlan = async (plan) => {
    if (window.confirm(`Deseja realmente remover o plano '${plan.nome}' do catálogo?`)) {
      try {
        await deleteSystemPlan(plan.id, plan.nome, currentUser?.email);
        setFeedback({ type: 'success', text: `Plano '${plan.nome}' removido com sucesso!` });
        setTimeout(() => setFeedback(null), 3000);
      } catch (err) {
        console.error(err);
        setFeedback({ type: 'error', text: 'Erro ao remover plano.' });
      }
    }
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
        <div className="flex items-center gap-3.5">
          <BrandLogo 
            size="lg" 
            showText={false}
            onClick={() => navigate('/')}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight" style={{ color: '#0f172a' }}>
                Nex-<span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 900 }}>Ai</span>.NEFRO
              </span>
              <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                Super Admin
              </span>
            </div>
            <p className="text-muted text-sm mt-0.5">Gestão de Licenças Médicas, Auditoria & Finanças</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            <span className="text-xs font-bold uppercase tracking-wider text-muted">MRR (Mensal)</span>
            <div style={{ padding: '6px', background: '#dcfce7', borderRadius: '8px', color: '#15803d' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-muted mt-1 flex items-center gap-1">
            <TrendingUp size={13} color="#16a34a" />
            <span>ARR: <strong>R$ {arr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano</strong></span>
          </div>
        </div>

        {/* Card Médicos e Licenças */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8), rgba(255, 255, 255, 0.9))', border: '1px solid #bfdbfe' }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Licenças</span>
            <div style={{ padding: '6px', background: '#dbeafe', borderRadius: '8px', color: '#1d4ed8' }}>
              <Stethoscope size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {doctors.length} <span className="text-xs font-normal text-muted">cadastradas</span>
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
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Auditoria</span>
            <div style={{ padding: '6px', background: '#ede9fe', borderRadius: '8px', color: '#7c3aed' }}>
              <Lock size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {auditLogs.length} <span className="text-xs font-normal text-muted">eventos</span>
          </div>
          <div className="text-xs text-muted mt-1 flex items-center gap-1">
            <CheckCircle2 size={13} color="#7c3aed" />
            <span>Trilha imutável no Cloud Firestore</span>
          </div>
        </div>

        {/* Card Inadimplência */}
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.8), rgba(255, 255, 255, 0.9))', border: '1px solid #fecaca' }}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Inadimplência</span>
            <div style={{ padding: '6px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {churnRate}% <span className="text-xs font-normal text-muted">({churnCount} suspensos)</span>
          </div>
          <div className="text-xs text-muted mt-1">
            <span>Controle automático de suspensão</span>
          </div>
        </div>
      </div>

      {/* Navegação por Abas no Painel (Títulos de 1 Palavra) */}
      <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap" style={{ borderColor: 'var(--border)' }}>
        <button
          className={`btn ${activeTab === 'licenses' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('licenses')}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Stethoscope size={16} />
          <span>Licenças ({doctors.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('audit')}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Activity size={16} />
          <span>Auditoria ({auditLogs.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'financial' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('financial')}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <CreditCard size={16} />
          <span>Financeiro</span>
        </button>
      </div>

      {/* ================= ABA 1: LICENÇAS (100% LGPD COMPLIANT) ================= */}
      {activeTab === 'licenses' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-lg">Licenças</h2>
              <p className="text-muted text-xs mt-0.5">Gestão de assinaturas médicas, CRM e vigências contratuais</p>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={handleOpenCreateModal}
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Nova Licença
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
                    <th style={{ padding: '0.85rem 1rem' }}>Médico</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Registro</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Plano</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Vigência</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Ações</th>
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
                            <div className="text-xs text-muted flex items-center gap-1.5 flex-wrap">
                              <span>
                                {Number(docItem.valorMensalidade) > 0 
                                  ? `R$ ${Number(docItem.valorMensalidade).toFixed(2)}/mês` 
                                  : 'Gratuito (Trial)'}
                              </span>
                              {docItem.descontoTipo && docItem.descontoTipo !== 'nenhum' && Number(docItem.descontoValor) > 0 && (
                                <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  {docItem.descontoTipo === 'porcentagem' 
                                    ? `-${docItem.descontoValor}% desc.` 
                                    : `-R$ ${Number(docItem.descontoValor).toFixed(2)} desc.`}
                                </span>
                              )}
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
                                title={isSuspended ? "Reativar licença médica" : "Pausar/Suspender licença"}
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

                              {/* Botão Excluir Licença */}
                              <button 
                                className="btn btn-outline" 
                                onClick={() => handleDeleteDoctor(docItem)}
                                style={{ 
                                  padding: '0.35rem 0.5rem', 
                                  fontSize: '0.75rem', 
                                  color: '#dc2626', 
                                  borderColor: '#fecaca', 
                                  background: '#fef2f2' 
                                }}
                                title="Excluir licença médica permanentemente"
                              >
                                <Trash2 size={13} />
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

      {/* ================= ABA 2: AUDITORIA ================= */}
      {activeTab === 'audit' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Shield size={20} color="#7c3aed" /> Auditoria
              </h2>
              <p className="text-muted text-xs mt-0.5">
                Logs imutáveis no Firestore para rastreabilidade de licenças, pagamentos e acessos
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#ede9fe', color: '#6d28d9', padding: '4px 10px', borderRadius: '10px', fontWeight: '600' }}>
              LGPD & Segurança
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
                    <th style={{ padding: '0.75rem 1rem' }}>Data</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Ação</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Descrição</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Responsável</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Alvo</th>
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
                            background: log.tipoAcao === 'LICENSE_PAUSED' ? '#fee2e2' :
                                        log.tipoAcao === 'LICENSE_RENEWED' ? '#dcfce7' : '#ede9fe',
                            color: log.tipoAcao === 'LICENSE_PAUSED' ? '#b91c1c' :
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

      {/* ================= ABA 3: FINANCEIRO (CRUD DINÂMICO DE PLANOS & GATEWAYS) ================= */}
      {activeTab === 'financial' && (
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div className="flex justify-between items-center mb-5 flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <CreditCard size={20} color="#16a34a" /> Financeiro
              </h2>
              <p className="text-muted text-xs mt-0.5">
                Gestão de planos, precificação e conectores de pagamento no Cloud Firestore
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-outline" 
                onClick={() => setIsGatewayModalOpen(true)}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Settings size={15} /> Configurar Gateways
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleOpenCreatePlan}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={15} /> Novo Plano
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            
            {/* Seção 1: Planos */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#0f172a' }}>
                    <Zap size={16} color="#eab308" /> Planos
                  </h3>
                  <span className="text-xs text-muted">{systemPlans.length} planos cadastrados</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {systemPlans.map((plan) => {
                    const isInactive = plan.status === 'Inativo';
                    return (
                      <div 
                        key={plan.id} 
                        className="p-3.5 rounded-xl border transition-all"
                        style={{
                          background: isInactive ? '#f8fafc' : plan.destaque ? 'rgba(239, 246, 255, 0.6)' : '#ffffff',
                          borderColor: isInactive ? '#e2e8f0' : plan.destaque ? '#bfdbfe' : '#e2e8f0',
                          opacity: isInactive ? 0.7 : 1
                        }}
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-sm text-slate-900">{plan.nome}</strong>
                              {plan.destaque && (
                                <span style={{ fontSize: '0.65rem', background: '#dbeafe', color: '#1d4ed8', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  Destaque
                                </span>
                              )}
                              <span 
                                style={{ 
                                  fontSize: '0.65rem', 
                                  background: plan.status === 'Ativo' ? '#dcfce7' : '#fee2e2', 
                                  color: plan.status === 'Ativo' ? '#15803d' : '#b91c1c', 
                                  padding: '1px 5px', 
                                  borderRadius: '4px', 
                                  fontWeight: 'bold' 
                                }}
                              >
                                {plan.status}
                              </span>
                            </div>
                            <span className="text-xs text-muted block mt-0.5">{plan.descricao}</span>
                          </div>
                          
                          <div className="text-right">
                            <strong className="text-sm block" style={{ color: Number(plan.valor) === 0 ? '#7c3aed' : '#059669' }}>
                              {Number(plan.valor) === 0 ? 'Gratuito' : `R$ ${Number(plan.valor).toFixed(2)}`}
                            </strong>
                            <span className="text-xs text-muted">/{plan.intervalo}</span>
                          </div>
                        </div>

                        {/* Recursos do Plano */}
                        {Array.isArray(plan.recursos) && plan.recursos.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                            {plan.recursos.map((rec, i) => (
                              <span key={i} style={{ fontSize: '0.68rem', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                                ✓ {rec}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Ações de Edição e Exclusão */}
                        <div className="flex justify-end gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleTogglePlan(plan)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                          >
                            {plan.status === 'Ativo' ? 'Pausar' : 'Ativar'}
                          </button>
                          
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleOpenEditPlan(plan)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                          >
                            <Edit size={12} /> Editar
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => handleDeletePlan(plan)}
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', color: '#dc2626' }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Seção 2: Gateways */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#0f172a' }}>
                    <Building size={16} color="#2563eb" /> Gateways
                  </h3>
                  <span className="text-xs text-muted">Cloud Firestore</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {/* Card PIX */}
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-xs block text-emerald-900 font-bold">PIX Instantâneo</strong>
                      <span style={{ fontSize: '0.7rem', background: gatewayConfig.pix?.ativo ? '#dcfce7' : '#fee2e2', color: gatewayConfig.pix?.ativo ? '#15803d' : '#b91c1c', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {gatewayConfig.pix?.ativo ? 'Ativo' : 'Desativado'}
                      </span>
                    </div>
                    <div className="text-xs text-muted">Chave: <strong>{gatewayConfig.pix?.chavePix || 'CNPJ Cadastrado'}</strong></div>
                    <div className="text-xs text-muted">Banco: {gatewayConfig.pix?.banco || 'Cora / BB'}</div>
                  </div>

                  {/* Card Cartão / Asaas */}
                  <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-xs block text-indigo-900 font-bold">Cartão & Recorrência</strong>
                      <span style={{ fontSize: '0.7rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {gatewayConfig.cartao?.provedor || 'Asaas'} ({gatewayConfig.cartao?.ambiente || 'sandbox'})
                      </span>
                    </div>
                    <div className="text-xs text-muted">Status: <strong>{gatewayConfig.cartao?.ativo ? 'Integrado e Ativo' : 'Pausado'}</strong></div>
                    <div className="text-xs text-muted">Webhook: {gatewayConfig.cartao?.webhookUrl || 'Configurado'}</div>
                  </div>

                  {/* Card Regras de Inadimplência */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-xs block text-slate-800 font-bold">Inadimplência & Suspensão</strong>
                      <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                        {gatewayConfig.regrasCobranca?.suspensaoAutomatica ? 'Automático' : 'Manual'}
                      </span>
                    </div>
                    <div className="text-xs text-muted">
                      Tolerância: <strong>{gatewayConfig.regrasCobranca?.diasTolerancia || 5} dias</strong> após o vencimento
                    </div>
                    <div className="text-xs text-muted">
                      Notificações: {gatewayConfig.regrasCobranca?.notificarEmail ? 'E-mail ativado' : 'Desativado'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t">
                <button
                  type="button"
                  className="btn btn-outline w-full"
                  onClick={() => setIsGatewayModalOpen(true)}
                  style={{ fontSize: '0.8rem', padding: '0.45rem' }}
                >
                  <Sliders size={14} /> Editar Chaves e Parâmetros
                </button>
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
              {modalMode === 'create' ? 'Cadastrar Licença' : 'Editar Licença'}
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
                  <label className="text-xs font-semibold mb-1 block">Telefone</label>
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
                <label className="text-xs font-semibold mb-1 block">Clínica Principal</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Instituto de Nefrologia" 
                  value={doctorForm.clinicaPrincipal}
                  onChange={(e) => setDoctorForm(prev => ({ ...prev, clinicaPrincipal: e.target.value }))}
                />
              </div>

              {/* Seleção Dinâmica do Plano e Desconto */}
              <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/30 flex flex-col gap-3">
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.6rem' }}>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Plano Contratado (Aba Financeiro)</label>
                    <select 
                      className="input-field"
                      value={doctorForm.plano}
                      onChange={(e) => handlePlanChange(e.target.value)}
                    >
                      {systemPlans.map(plan => (
                        <option key={plan.id} value={plan.nome}>
                          {plan.nome} — R$ {Number(plan.valor).toFixed(2)} ({plan.intervalo || 'mensal'})
                        </option>
                      ))}
                      <option value="Personalizado">Plano Personalizado / Avulso</option>
                      <option value="Demonstração">Plano Demonstração (Gratuito)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block">Valor de Tabela (R$)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={doctorForm.valorBase}
                      disabled
                      style={{ background: '#f8fafc', color: '#64748b' }}
                      title="Valor original definido no plano da aba Financeiro"
                    />
                  </div>
                </div>

                {/* Módulo de Desconto Comercial */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '0.6rem' }}>
                  <div>
                    <label className="text-xs font-semibold mb-1 block">Aplicar Desconto?</label>
                    <select 
                      className="input-field"
                      value={doctorForm.descontoTipo}
                      onChange={(e) => handleDiscountTypeChange(e.target.value)}
                    >
                      <option value="nenhum">Sem Desconto</option>
                      <option value="fixo">Desconto em R$ (Fixo)</option>
                      <option value="porcentagem">Desconto em % (Percentual)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block">
                      {doctorForm.descontoTipo === 'porcentagem' ? 'Desconto (%)' : 'Desconto (R$)'}
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0"
                      className="input-field" 
                      disabled={doctorForm.descontoTipo === 'nenhum'}
                      placeholder={doctorForm.descontoTipo === 'porcentagem' ? 'Ex: 10%' : 'Ex: 15.00'}
                      value={doctorForm.descontoValor}
                      onChange={(e) => handleDiscountValueChange(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: '#1e40af' }}>
                      Valor Final Cobrado (R$) *
                    </label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="input-field" 
                      style={{ fontWeight: 'bold', color: '#1e40af', borderColor: '#93c5fd', background: '#eff6ff' }}
                      value={doctorForm.valorMensalidade}
                      onChange={(e) => setDoctorForm(prev => ({ ...prev, valorMensalidade: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {/* Resumo do Desconto */}
                {doctorForm.descontoTipo !== 'nenhum' && Number(doctorForm.descontoValor) > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                    <span>🏷️</span>
                    <span>
                      {doctorForm.descontoTipo === 'porcentagem'
                        ? `Desconto de ${doctorForm.descontoValor}% aplicado (Economia de R$ ${((Number(doctorForm.valorBase) * Number(doctorForm.descontoValor)) / 100).toFixed(2)}) → Cobrança mensal: R$ ${Number(doctorForm.valorMensalidade).toFixed(2)}`
                        : `Desconto de R$ ${Number(doctorForm.descontoValor).toFixed(2)} aplicado sobre o valor de tabela → Cobrança mensal: R$ ${Number(doctorForm.valorMensalidade).toFixed(2)}`}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Status da Licença</label>
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
            <h2 className="text-xl font-bold mb-1">Renovar Licença</h2>
            <p className="text-xs text-muted mb-4">
              Médico: <strong>{renewDoctor.nome}</strong> (CRM {renewDoctor.crm}/{renewDoctor.ufCrm})
            </p>

            <form onSubmit={handleConfirmRenew} className="flex flex-col gap-3.5">
              {/* Seleção do Período com valores dinâmicos dos planos */}
              <div>
                <label className="text-xs font-semibold mb-1 block">Período de Renovação</label>
                {(() => {
                  const monthlyRate = Number(renewDoctor.valorMensalidade) > 0
                    ? Number(renewDoctor.valorMensalidade)
                    : (systemPlans.find(p => p.status === 'Ativo' && p.intervalo === 'mensal')?.valor || 99.90);
                  const annualRate = systemPlans.find(p => p.status === 'Ativo' && p.intervalo === 'anual')?.valor || (monthlyRate * 10);
                  
                  return (
                    <select 
                      className="input-field"
                      value={renewMonths}
                      onChange={(e) => {
                        const m = Number(e.target.value);
                        setRenewMonths(m);
                        setRenewValue(m === 12 ? annualRate : Number((m * monthlyRate).toFixed(2)));
                      }}
                    >
                      <option value="1">+1 Mês (R$ {monthlyRate.toFixed(2)})</option>
                      <option value="3">+3 Meses (R$ {(monthlyRate * 3).toFixed(2)})</option>
                      <option value="6">+6 Meses (R$ {(monthlyRate * 6).toFixed(2)})</option>
                      <option value="12">+12 Meses / Anual com Bônus (R$ {annualRate.toFixed(2)})</option>
                    </select>
                  );
                })()}
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
                  <label className="text-xs font-semibold mb-1 block">Valor Cobrado com Desconto (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
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
            <h2 className="text-xl font-bold mb-1">Histórico Financeiro</h2>
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

      {/* ================= MODAL: PLANOS (CRUD) ================= */}
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        planToEdit={planToEdit}
        adminEmail={currentUser?.email || 'admin@nefroapp.com'}
        onSaved={() => {
          setFeedback({ type: 'success', text: planToEdit ? 'Plano atualizado no Firestore!' : 'Novo plano criado com sucesso!' });
          setTimeout(() => setFeedback(null), 3000);
        }}
      />

      {/* ================= MODAL: CONFIGURAÇÃO DE GATEWAYS ================= */}
      <GatewayModal
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
        currentConfig={gatewayConfig}
        adminEmail={currentUser?.email || 'admin@nefroapp.com'}
        onSaved={() => {
          setFeedback({ type: 'success', text: 'Configurações de gateways atualizadas no Firestore!' });
          setTimeout(() => setFeedback(null), 3000);
        }}
      />

    </div>
  );
}
