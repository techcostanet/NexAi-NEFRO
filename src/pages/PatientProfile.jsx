import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Activity, 
  Droplet, 
  Pill, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Calendar, 
  Building2, 
  User, 
  Clock, 
  Loader2, 
  FileText, 
  CheckCircle2,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Scale,
  Phone,
  AlertCircle,
  FlaskConical,
  ChevronRight
} from 'lucide-react';
import { 
  subscribeToPatientById, 
  deletePatientExam,
  deletePatientMedication,
  toggleMedicationStatus,
  deletePatientEvolution
} from '../services/patientService';
import { normalizeMedicamentosList, getMedicationStatus } from '../data/dialysisMedications';
import { useAuth } from '../context/AuthContext';
import PatientFormModal from '../components/PatientFormModal';
import ExamFormModal from '../components/ExamFormModal';
import MedicationModal from '../components/MedicationModal';
import EvolutionModal from '../components/EvolutionModal';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeDoctorId } = useAuth();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'exams' | 'medications' | 'evolutions'
  
  // Modais
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState(null);
  const [examIndexToEdit, setExamIndexToEdit] = useState(null);

  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState(null);
  const [medFilter, setMedFilter] = useState('todos'); // 'todos' | 'continuo' | 'temporario' | 'alerta' | 'inativos'

  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  const [evolutionToEdit, setEvolutionToEdit] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPatientById(id, (data) => {
      setPatient(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // Ações de Exames
  const handleOpenNewExam = () => {
    setExamToEdit(null);
    setExamIndexToEdit(null);
    setIsExamModalOpen(true);
  };

  const handleEditExam = (exam, index) => {
    setExamToEdit(exam);
    setExamIndexToEdit(index);
    setIsExamModalOpen(true);
  };

  const handleDeleteExam = async (index) => {
    if (window.confirm("Deseja realmente remover este registro de exame?")) {
      await deletePatientExam(patient.id, index);
    }
  };

  // Ações de Medicamentos
  const handleOpenNewMedication = () => {
    setMedicationToEdit(null);
    setIsMedicationModalOpen(true);
  };

  const handleEditMedication = (med) => {
    setMedicationToEdit(med);
    setIsMedicationModalOpen(true);
  };

  const handleDeleteMedication = async (medId) => {
    if (window.confirm("Deseja realmente excluir esta prescrição?")) {
      await deletePatientMedication(patient.id, medId);
    }
  };

  const handleToggleMedicationActive = async (med) => {
    const nextActive = !med.ativo;
    const msg = nextActive ? "Reativar esta prescrição?" : "Suspender/finalizar esta prescrição?";
    if (window.confirm(msg)) {
      await toggleMedicationStatus(patient.id, med.id, nextActive);
    }
  };

  // Ações de Evolução
  const handleOpenNewEvolution = () => {
    setEvolutionToEdit(null);
    setIsEvolutionModalOpen(true);
  };

  const handleEditEvolution = (evo) => {
    setEvolutionToEdit(evo);
    setIsEvolutionModalOpen(true);
  };

  const handleDeleteEvolution = async (evoId) => {
    if (window.confirm("Deseja realmente excluir este registro de evolução médica?")) {
      await deletePatientEvolution(patient.id, evoId);
    }
  };

  if (loading) {
    return (
      <div className="container flex items-center justify-center h-screen flex-col gap-4">
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        <p className="text-muted text-sm">Carregando prontuário eletrônico...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container flex items-center justify-center h-screen flex-col gap-4">
        <h2>Paciente não encontrado</h2>
        <button className="btn btn-outline" onClick={() => navigate('/doctor')}>Voltar ao Painel</button>
      </div>
    );
  }

  const exames = patient.exames || {};
  const acessoVascular = patient.acessoVascular || {};
  const medicamentosList = normalizeMedicamentosList(patient.medicamentos);
  const historicoExames = Array.isArray(patient.historicoExames) ? patient.historicoExames : [];
  const evolucoes = Array.isArray(patient.evolucoes) ? patient.evolucoes : [];

  // Alertas Laboratoriais
  const hbBaixa = exames.hb !== null && exames.hb !== undefined && exames.hb < 10;
  const pthAlto = exames.pth !== null && exames.pth !== undefined && exames.pth > 600;
  const fosforoAlto = exames.fosforo !== null && exames.fosforo !== undefined && exames.fosforo > 5.5;
  const kAlto = exames.k !== null && exames.k !== undefined && exames.k > 5.5;
  const albuminaBaixa = exames.albumina !== null && exames.albumina !== undefined && exames.albumina < 3.8;
  const hco3Baixo = exames.hco3 !== null && exames.hco3 !== undefined && exames.hco3 < 22;
  const hasLabAlerts = hbBaixa || pthAlto || fosforoAlto || kAlto || albuminaBaixa || hco3Baixo;

  // Alertas de Medicamentos
  const medAlerts = medicamentosList.filter(m => {
    if (!m.ativo) return false;
    const st = getMedicationStatus(m);
    return st.status === 'expirando' || st.status === 'expirado';
  });

  // Filtragem de Medicamentos
  const filteredMedicamentos = medicamentosList.filter(med => {
    if (medFilter === 'todos') return true;
    if (medFilter === 'continuo') return med.tipo === 'continuo' && med.ativo !== false;
    if (medFilter === 'temporario') return med.tipo === 'temporario' && med.ativo !== false;
    if (medFilter === 'alerta') {
      const st = getMedicationStatus(med);
      return st.status === 'expirando' || st.status === 'expirado';
    }
    if (medFilter === 'inativos') return med.ativo === false;
    return true;
  });

  return (
    <div className="container" style={{ paddingBottom: '5rem', maxWidth: '1100px' }}>
      
      {/* ================= CABEÇALHO CLÍNICO DO PACIENTE ================= */}
      <header className="glass-panel mt-3 mb-4 p-4" style={{ borderRadius: '18px', background: 'rgba(255, 255, 255, 0.92)' }}>
        <div className="flex justify-between items-start flex-wrap gap-4">
          
          <div className="flex items-start gap-3.5">
            <button 
              className="btn btn-outline mt-0.5" 
              onClick={() => navigate('/doctor')} 
              style={{ padding: '0.6rem', borderRadius: '12px' }}
              title="Voltar para a lista de pacientes"
            >
              <ArrowLeft size={18} color="var(--primary)" />
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {patient.nome}
                </h1>
                
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  {patient.status || 'Ativo'}
                </span>

                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  {patient.turno || '3º Turno'}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-muted font-medium">
                <span className="flex items-center gap-1.5" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building2 size={14} color="#2563eb" style={{ flexShrink: 0 }} />
                  <strong>{patient.clinica || 'Dialize Betim'}</strong>
                </span>
                
                {patient.idade && (
                  <span>• {patient.idade} anos {patient.sexo ? `(${patient.sexo})` : ''}</span>
                )}
                
                {patient.dataNascimento && (
                  <span>• Nasc: {new Date(patient.dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                )}

                {patient.etiologiaDRC && (
                  <span>• Etiologia: <strong>{patient.etiologiaDRC}</strong></span>
                )}
              </div>
            </div>
          </div>

          {/* Ações Rápidas no Cabeçalho */}
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              className="btn btn-outline" 
              onClick={() => setIsPatientModalOpen(true)}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              title="Editar cadastro do paciente"
            >
              <Edit size={14} color="var(--primary)" />
              <span>Editar</span>
            </button>

            <button 
              className="btn btn-outline" 
              onClick={handleOpenNewExam}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              title="Lançar novos exames"
            >
              <FlaskConical size={14} color="#059669" />
              <span>Exames</span>
            </button>

            <button 
              className="btn btn-outline" 
              onClick={handleOpenNewMedication}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              title="Prescrever medicamentos"
            >
              <Pill size={14} color="#d97706" />
              <span>Prescrever</span>
            </button>

            <button 
              className="btn btn-primary" 
              onClick={handleOpenNewEvolution}
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              title="Nova evolução médica"
            >
              <Plus size={14} />
              <span>Evolução</span>
            </button>
          </div>
        </div>

        {/* Alertas Críticos Globais do Paciente */}
        {(hasLabAlerts || medAlerts.length > 0) && (
          <div className="mt-3 pt-3 border-t flex flex-col gap-2" style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
            {hasLabAlerts && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} color="#dc2626" />
                  <span>
                    <strong>Atenção Laboratorial:</strong> {hbBaixa ? 'Hb < 10,0 • ' : ''}{pthAlto ? 'PTH > 600 • ' : ''}{fosforoAlto ? 'Fósforo > 5,5 • ' : ''}{kAlto ? 'Potássio > 5,5 • ' : ''}{albuminaBaixa ? 'Albumina < 3,8 • ' : ''}{hco3Baixo ? 'Acidose (HCO₃ < 22)' : ''}
                  </span>
                </div>
                <button 
                  onClick={() => setActiveTab('exams')}
                  className="font-bold underline text-red-900 hover:text-red-700"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  Ver Exames →
                </button>
              </div>
            )}

            {medAlerts.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} color="#d97706" />
                  <span>
                    <strong>Alertas de Prescrição:</strong> {medAlerts.length} medicamento(s) com ciclo encerrado ou a vencer nos próximos dias.
                  </span>
                </div>
                <button 
                  onClick={() => setActiveTab('medications')}
                  className="font-bold underline text-amber-950 hover:text-amber-800"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  Gerenciar Prescrições →
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ================= BARRA DE ABAS CLÍNICAS ================= */}
      <div className="flex gap-2 mb-4 border-b pb-2 flex-wrap" style={{ borderColor: 'var(--border)' }}>
        <button
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('overview')}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <Activity size={16} />
          <span>Resumo</span>
        </button>

        <button
          className={`btn ${activeTab === 'exams' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('exams')}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <FlaskConical size={16} />
          <span>Exames</span>
          {historicoExames.length > 0 && (
            <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: activeTab === 'exams' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeTab === 'exams' ? '#ffffff' : '#475569', fontWeight: 'bold' }}>
              {historicoExames.length}
            </span>
          )}
        </button>

        <button
          className={`btn ${activeTab === 'medications' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('medications')}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <Pill size={16} />
          <span>Prescrições</span>
          {medicamentosList.length > 0 && (
            <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: activeTab === 'medications' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeTab === 'medications' ? '#ffffff' : '#475569', fontWeight: 'bold' }}>
              {medicamentosList.filter(m => m.ativo !== false).length}
            </span>
          )}
        </button>

        <button
          className={`btn ${activeTab === 'evolucoes' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('evolucoes')}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
        >
          <FileText size={16} />
          <span>Evoluções</span>
          {evolucoes.length > 0 && (
            <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: activeTab === 'evolucoes' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeTab === 'evolucoes' ? '#ffffff' : '#475569', fontWeight: 'bold' }}>
              {evolucoes.length}
            </span>
          )}
        </button>
      </div>

      {/* ================= ABA 1: VISÃO GERAL ================= */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          
          {/* Coluna Esquerda: Acesso Vascular & Dados Vitais */}
          <div className="flex flex-col gap-4">
            
            {/* Card Acesso Vascular & Parâmetros Dialíticos */}
            <section className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px' }}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Activity size={16} color="var(--primary)" />
                  <span>Acesso Vascular & Parâmetros Dialíticos</span>
                </h2>
                <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '8px', fontWeight: '600' }}>
                  {acessoVascular.tipo || 'FAV'}
                </span>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-muted">Tipo de Acesso:</span>
                  <strong className="text-slate-800 font-semibold">{acessoVascular.tipo || 'Não informado'}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-muted">Localização:</span>
                  <strong className="text-slate-800 font-semibold">{acessoVascular.ladoMembro || '-'}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-muted">Fluxo de Sangue (Qb):</span>
                  <strong className="text-slate-800 font-semibold">{acessoVascular.fluxoSangue ? `${acessoVascular.fluxoSangue} ml/min` : '-'}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-muted">Fluxo Dialisato (Qd):</span>
                  <strong className="text-slate-800 font-semibold">{acessoVascular.fluxoDialisato ? `${acessoVascular.fluxoDialisato} ml/min` : '-'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Calibre da Agulha:</span>
                  <strong className="text-slate-800 font-semibold">{acessoVascular.agulha || '-'}</strong>
                </div>
              </div>
            </section>

            {/* Card Dados Cadastrais & Clínicos */}
            <section className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px' }}>
              <h2 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                <User size={16} color="var(--primary)" />
                <span>Dados Clínicos & Identificação</span>
              </h2>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-muted">Etiologia DRC:</span>
                  <strong className="text-slate-800 font-semibold">{patient.etiologiaDRC || 'Não informada'}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-muted">Peso Seco:</span>
                  <strong className="text-slate-800 font-semibold">{patient.pesoSeco ? `${patient.pesoSeco} kg` : '-'}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-muted">Início da Diálise:</span>
                  <strong className="text-slate-800 font-semibold">{patient.dataInicioDialise ? new Date(patient.dataInicioDialise + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-muted">Hospital de Retaguarda:</span>
                  <strong className="text-slate-800 font-semibold">{patient.hospital || 'Hospital Geral'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Alergias:</span>
                  <strong className="text-slate-800 font-semibold">{Array.isArray(patient.alergias) && patient.alergias.length > 0 ? patient.alergias.join(', ') : 'Nega alergias'}</strong>
                </div>
              </div>
            </section>
          </div>

          {/* Coluna Direita: Prescrições Ativas & Resumo Laboratorial */}
          <div className="flex flex-col gap-4">
            
            {/* Prescrições em Uso */}
            <section className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px' }}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Pill size={16} color="#d97706" />
                  <span>Prescrições Ativas ({medicamentosList.filter(m => m.ativo !== false).length})</span>
                </h2>
                <button 
                  onClick={handleOpenNewMedication} 
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  + Prescrever
                </button>
              </div>

              {medicamentosList.filter(m => m.ativo !== false).length === 0 ? (
                <div className="text-center py-6 text-muted text-xs">
                  Nenhuma medicação ativa no momento.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {medicamentosList.filter(m => m.ativo !== false).slice(0, 4).map((med, idx) => {
                    const st = getMedicationStatus(med);
                    return (
                      <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-slate-800 block">{med.nome}</strong>
                          <span className="text-muted">{med.dosagem} {med.via ? `• ${med.via}` : ''}</span>
                        </div>
                        <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '6px', background: st.badgeBg, color: st.color, fontWeight: 'bold' }}>
                          {st.label}
                        </span>
                      </div>
                    );
                  })}
                  {medicamentosList.filter(m => m.ativo !== false).length > 4 && (
                    <button 
                      onClick={() => setActiveTab('medications')}
                      className="text-xs text-center text-blue-600 hover:underline pt-1 font-semibold"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      Ver todas as {medicamentosList.filter(m => m.ativo !== false).length} prescrições →
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Resumo de Indicadores Laboratoriais Chave */}
            <section className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px' }}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <FlaskConical size={16} color="#059669" />
                  <span>Resumo Laboratorial Mais Recente</span>
                </h2>
                <button 
                  onClick={() => setActiveTab('exams')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Painel Completo →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-muted text-xs block" style={{ fontSize: '0.68rem' }}>Hemoglobina</span>
                  <strong className="text-sm font-bold block" style={{ color: hbBaixa ? '#dc2626' : '#1e293b' }}>
                    {exames.hb || '-'}
                  </strong>
                  <span className="text-muted" style={{ fontSize: '0.62rem' }}>g/dL</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-muted text-xs block" style={{ fontSize: '0.68rem' }}>PTH Intacto</span>
                  <strong className="text-sm font-bold block" style={{ color: pthAlto ? '#dc2626' : '#1e293b' }}>
                    {exames.pth || '-'}
                  </strong>
                  <span className="text-muted" style={{ fontSize: '0.62rem' }}>pg/mL</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-muted text-xs block" style={{ fontSize: '0.68rem' }}>Fósforo</span>
                  <strong className="text-sm font-bold block" style={{ color: fosforoAlto ? '#dc2626' : '#1e293b' }}>
                    {exames.fosforo || '-'}
                  </strong>
                  <span className="text-muted" style={{ fontSize: '0.62rem' }}>mg/dL</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-muted text-xs block" style={{ fontSize: '0.68rem' }}>Potássio (K⁺)</span>
                  <strong className="text-sm font-bold block" style={{ color: kAlto ? '#dc2626' : '#1e293b' }}>
                    {exames.k || '-'}
                  </strong>
                  <span className="text-muted" style={{ fontSize: '0.62rem' }}>mEq/L</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-muted text-xs block" style={{ fontSize: '0.68rem' }}>Kt/V</span>
                  <strong className="text-sm font-bold block text-slate-800">
                    {exames.ktv || '-'}
                  </strong>
                  <span className="text-muted" style={{ fontSize: '0.62rem' }}>Meta ≥ 1.2</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-muted text-xs block" style={{ fontSize: '0.68rem' }}>Albumina</span>
                  <strong className="text-sm font-bold block" style={{ color: albuminaBaixa ? '#dc2626' : '#1e293b' }}>
                    {exames.albumina || '-'}
                  </strong>
                  <span className="text-muted" style={{ fontSize: '0.62rem' }}>g/dL</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ================= ABA 2: EXAMES & LABORATÓRIO (PAINÉIS BALANCEADOS + HISTÓRICO) ================= */}
      {activeTab === 'exams' && (
        <div className="flex flex-col gap-5 animate-in">
          
          {/* Cabeçalho da Aba */}
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FlaskConical size={18} color="var(--primary)" />
                <span>Painel Laboratorial & Metas Nefrológicas</span>
              </h2>
              <p className="text-xs text-muted">Resultados mais recentes agrupados por perfil clínico funcional</p>
            </div>
            
            <button className="btn btn-primary" onClick={handleOpenNewExam} style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Plus size={14} />
              <span>Novo Registro de Exame</span>
            </button>
          </div>

          {/* 4 Painéis Temáticos Perfeitamente Balanceados (Sem vazios) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            
            {/* 1. Anemia & Perfil de Ferro */}
            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-800 mb-2.5" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Droplet size={15} color="#e11d48" style={{ flexShrink: 0 }} />
                <span>Anemia & Perfil de Ferro</span>
              </div>
              
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Hemoglobina:</span>
                  <strong style={{ color: hbBaixa ? '#dc2626' : '#1e293b', fontWeight: 'bold' }}>
                    {exames.hb ? `${exames.hb} g/dL` : '-'} <span className="text-muted font-normal text-2xs">(10-12)</span>
                  </strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Hematócrito:</span>
                  <strong className="text-slate-800">{exames.ht ? `${exames.ht}%` : '-'} <span className="text-muted font-normal text-2xs">(30-36%)</span></strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">IST:</span>
                  <strong className="text-slate-800">{exames.ist ? `${exames.ist}%` : '-'} <span className="text-muted font-normal text-2xs">(&gt;20%)</span></strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Ferritina:</span>
                  <strong className="text-slate-800">{exames.ferritina ? `${exames.ferritina} ng/mL` : '-'}</strong>
                </div>
              </div>
            </div>

            {/* 2. Metabolismo Mineral & Ósseo (DMO) */}
            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800 mb-2.5" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Activity size={15} color="#d97706" style={{ flexShrink: 0 }} />
                <span>Distúrbio Mineral Ósseo</span>
              </div>
              
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">PTH Intacto:</span>
                  <strong style={{ color: pthAlto ? '#dc2626' : '#1e293b', fontWeight: 'bold' }}>
                    {exames.pth ? `${exames.pth} pg/mL` : '-'} <span className="text-muted font-normal text-2xs">(150-600)</span>
                  </strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Fósforo:</span>
                  <strong style={{ color: fosforoAlto ? '#dc2626' : '#1e293b', fontWeight: 'bold' }}>
                    {exames.fosforo ? `${exames.fosforo} mg/dL` : '-'} <span className="text-muted font-normal text-2xs">(3.5-5.5)</span>
                  </strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Cálcio:</span>
                  <strong className="text-slate-800">{exames.ca ? `${exames.ca} mg/dL` : '-'}</strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Vitamina D:</span>
                  <strong className="text-slate-800">{exames.vitD ? `${exames.vitD} ng/mL` : '-'}</strong>
                </div>
              </div>
            </div>

            {/* 3. Eletrólitos & Gasometria */}
            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-blue-800 mb-2.5" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <HeartPulse size={15} color="#2563eb" style={{ flexShrink: 0 }} />
                <span>Eletrólitos & Gasometria</span>
              </div>
              
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Potássio (K⁺):</span>
                  <strong style={{ color: kAlto ? '#dc2626' : '#1e293b', fontWeight: 'bold' }}>
                    {exames.k ? `${exames.k} mEq/L` : '-'} <span className="text-muted font-normal text-2xs">(3.5-5.5)</span>
                  </strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Sódio (Na⁺):</span>
                  <strong className="text-slate-800">{exames.na ? `${exames.na} mEq/L` : '-'}</strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Bicarbonato:</span>
                  <strong style={{ color: hco3Baixo ? '#dc2626' : '#1e293b', fontWeight: 'bold' }}>
                    {exames.hco3 ? `${exames.hco3} mEq/L` : '-'} <span className="text-muted font-normal text-2xs">(22-26)</span>
                  </strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Fosf. Alcalina:</span>
                  <strong className="text-slate-800">{exames.fa ? `${exames.fa} U/L` : '-'}</strong>
                </div>
              </div>
            </div>

            {/* 4. Adequação Dialítica, Nutrição & Inflamação */}
            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-800 mb-2.5" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldCheck size={15} color="#059669" style={{ flexShrink: 0 }} />
                <span>Adequação & Nutrição</span>
              </div>
              
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Kt/V Dialítico:</span>
                  <strong className="text-slate-800 font-bold">
                    {exames.ktv || '-'} <span className="text-muted font-normal text-2xs">(&ge;1.2)</span>
                  </strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Albumina:</span>
                  <strong style={{ color: albuminaBaixa ? '#dc2626' : '#1e293b', fontWeight: 'bold' }}>
                    {exames.albumina ? `${exames.albumina} g/dL` : '-'} <span className="text-muted font-normal text-2xs">(&ge;3.8)</span>
                  </strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">PCR:</span>
                  <strong className="text-slate-800">{exames.pcr ? `${exames.pcr} mg/L` : '-'} <span className="text-muted font-normal text-2xs">(&lt;5.0)</span></strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Creatinina:</span>
                  <strong className="text-slate-800">{exames.creatinina ? `${exames.creatinina} mg/dL` : '-'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Histórico Cronológico de Coletas */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px' }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Calendar size={16} color="var(--primary)" />
                <span>Histórico Cronológico de Coletas ({historicoExames.length})</span>
              </h3>
            </div>

            {historicoExames.length === 0 ? (
              <div className="text-center py-8 text-muted text-xs">
                Nenhum exame histórico detalhado registrado para este paciente.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>Data</th>
                      <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>Hb</th>
                      <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>IST/Ferritina</th>
                      <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>PTH</th>
                      <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>P/Ca</th>
                      <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>Potássio</th>
                      <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>Kt/V</th>
                      <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>Albumina</th>
                      <th style={{ padding: '0.65rem 0.8rem', textAlign: 'right', color: '#475569' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicoExames.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '0.65rem 0.8rem', fontWeight: 'bold', color: '#1e293b' }}>
                          {item.dataExame ? new Date(item.dataExame + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.8rem', color: (item.hb && item.hb < 10) ? '#dc2626' : '#1e293b', fontWeight: (item.hb && item.hb < 10) ? 'bold' : 'normal' }}>
                          {item.hb || '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.8rem' }}>
                          {item.ist ? `${item.ist}%` : '-'} / {item.ferritina || '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.8rem', color: (item.pth && item.pth > 600) ? '#dc2626' : '#1e293b', fontWeight: (item.pth && item.pth > 600) ? 'bold' : 'normal' }}>
                          {item.pth || '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.8rem' }}>
                          {item.fosforo || '-'} / {item.ca || '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.8rem', color: (item.k && item.k > 5.5) ? '#dc2626' : '#1e293b', fontWeight: (item.k && item.k > 5.5) ? 'bold' : 'normal' }}>
                          {item.k || '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.8rem' }}>{item.ktv || '-'}</td>
                        <td style={{ padding: '0.65rem 0.8rem' }}>{item.albumina ? `${item.albumina} g/dL` : '-'}</td>
                        <td style={{ padding: '0.65rem 0.8rem', textAlign: 'right' }}>
                          <div className="flex justify-end gap-1">
                            <button 
                              className="btn btn-outline" 
                              onClick={() => handleEditExam(item, idx)}
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem' }}
                              title="Editar este exame"
                            >
                              <Edit size={12} color="var(--primary)" />
                            </button>
                            <button 
                              className="btn btn-outline" 
                              onClick={() => handleDeleteExam(idx)}
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem' }}
                              title="Excluir este exame"
                            >
                              <Trash2 size={12} color="var(--danger)" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= ABA 3: PRESCRIÇÕES & MEDICAMENTOS ================= */}
      {activeTab === 'medications' && (
        <div className="flex flex-col gap-4 animate-in">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Pill size={18} color="#d97706" />
                <span>Gestão Farmacológica & Prescrições</span>
              </h2>
              <p className="text-xs text-muted">Controle de medicações de uso contínuo e ciclos com prazo determinado</p>
            </div>
            
            <button className="btn btn-primary" onClick={handleOpenNewMedication} style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Plus size={14} />
              <span>Nova Prescrição</span>
            </button>
          </div>

          {/* Filtros da Lista de Medicamentos */}
          <div className="flex gap-2 flex-wrap text-xs">
            <button
              onClick={() => setMedFilter('todos')}
              className={`btn ${medFilter === 'todos' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
            >
              Todos ({medicamentosList.length})
            </button>
            <button
              onClick={() => setMedFilter('continuo')}
              className={`btn ${medFilter === 'continuo' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
            >
              Contínuos ({medicamentosList.filter(m => m.tipo === 'continuo' && m.ativo !== false).length})
            </button>
            <button
              onClick={() => setMedFilter('temporario')}
              className={`btn ${medFilter === 'temporario' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
            >
              Ciclos com Prazo ({medicamentosList.filter(m => m.tipo === 'temporario' && m.ativo !== false).length})
            </button>
            {medAlerts.length > 0 && (
              <button
                onClick={() => setMedFilter('alerta')}
                style={{
                  padding: '0.35rem 0.8rem',
                  fontSize: '0.75rem',
                  borderRadius: '12px',
                  border: '1px solid #f87171',
                  background: medFilter === 'alerta' ? '#dc2626' : '#fee2e2',
                  color: medFilter === 'alerta' ? '#ffffff' : '#991b1b',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ⚠️ Alertas ({medAlerts.length})
              </button>
            )}
            <button
              onClick={() => setMedFilter('inativos')}
              className={`btn ${medFilter === 'inativos' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem' }}
            >
              Suspensos ({medicamentosList.filter(m => m.ativo === false).length})
            </button>
          </div>

          {/* Grade de Cartões de Medicamentos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {filteredMedicamentos.length === 0 ? (
              <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p className="text-sm">Nenhum medicamento encontrado neste filtro.</p>
              </div>
            ) : (
              filteredMedicamentos.map((med, idx) => {
                const st = getMedicationStatus(med);
                return (
                  <div 
                    key={med.id || idx}
                    className="glass-panel"
                    style={{
                      padding: '1.1rem',
                      borderRadius: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      opacity: med.ativo === false ? 0.65 : 1
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div>
                          <strong className="text-sm text-slate-800 block">
                            {med.nome}
                          </strong>
                          {med.categoria && (
                            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}>
                              {med.categoria}
                            </span>
                          )}
                        </div>

                        <span 
                          style={{ 
                            fontSize: '0.7rem', 
                            padding: '2px 8px', 
                            borderRadius: '6px', 
                            background: st.badgeBg, 
                            color: st.color, 
                            fontWeight: 'bold',
                            border: `1px solid ${st.borderColor}`,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {st.label}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-amber-900 mt-1">
                        {med.dosagem} {med.via ? `• ${med.via}` : ''} {med.frequencia ? `• ${med.frequencia}` : ''}
                      </div>

                      <div className="text-xs text-muted mt-2">
                        {med.tipo === 'temporario' && med.dataFim ? (
                          <span>Vigência: <strong>{new Date(med.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')}</strong> até <strong>{new Date(med.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}</strong></span>
                        ) : (
                          <span>Início: {med.dataInicio ? new Date(med.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR') : 'Uso contínuo'}</span>
                        )}
                        {med.observacao && (
                          <div className="italic text-slate-500 mt-1">
                            Obs: {med.observacao}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end items-center gap-1.5 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => handleToggleMedicationActive(med)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                        title={med.ativo ? "Suspender prescrição" : "Reativar prescrição"}
                      >
                        <RotateCcw size={12} />
                        <span>{med.ativo ? 'Suspender' : 'Reativar'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => handleEditMedication(med)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                        title="Editar prescrição"
                      >
                        <Edit size={12} color="var(--primary)" />
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => handleDeleteMedication(med.id)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                        title="Excluir prescrição"
                      >
                        <Trash2 size={12} color="var(--danger)" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= ABA 4: EVOLUÇÕES & RONDA DE DIÁLISE ================= */}
      {activeTab === 'evolucoes' && (
        <div className="flex flex-col gap-4 animate-in">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} color="var(--primary)" />
                <span>Evoluções Clínicas & Rondas de Hemodiálise</span>
              </h2>
              <p className="text-xs text-muted">Histórico de anotações médicas, intercorrências e condutas na sessão</p>
            </div>

            <button className="btn btn-primary" onClick={handleOpenNewEvolution} style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Plus size={14} />
              <span>Registrar Evolução</span>
            </button>
          </div>

          {evolucoes.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '16px' }}>
              <FileText size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
              <p className="text-sm">Nenhuma evolução registrada para este paciente.</p>
              <button className="btn btn-outline mt-3" onClick={handleOpenNewEvolution} style={{ fontSize: '0.8rem' }}>
                Registrar Primeira Evolução
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {evolucoes.map((evo) => (
                <div 
                  key={evo.id} 
                  className="glass-panel" 
                  style={{ padding: '1.25rem', borderRadius: '16px', borderLeft: '4px solid var(--primary)' }}
                >
                  <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={15} color="var(--primary)" />
                      <strong className="text-sm text-slate-800">
                        {new Date(evo.dataHora).toLocaleString('pt-BR')}
                      </strong>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '8px', background: '#eff6ff', color: '#1e40af', fontWeight: '600' }}>
                        {evo.tipoAtendimento || 'Ronda de Hemodiálise'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        className="btn btn-outline" 
                        onClick={() => handleEditEvolution(evo)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                      >
                        <Edit size={12} color="var(--primary)" />
                      </button>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => handleDeleteEvolution(evo.id)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                      >
                        <Trash2 size={12} color="var(--danger)" />
                      </button>
                    </div>
                  </div>

                  {/* Parâmetros Vitais da Ronda */}
                  <div className="flex items-center gap-3 text-xs text-muted mb-2 flex-wrap font-medium p-2 bg-slate-50 rounded-xl">
                    {evo.paPre && <span>PA Pré: <strong>{evo.paPre}</strong></span>}
                    {evo.paPos && <span>• PA Pós: <strong>{evo.paPos}</strong></span>}
                    {evo.pesoPre && <span>• Peso Pré: <strong>{evo.pesoPre} kg</strong></span>}
                    {evo.ufRetirada && <span>• UF: <strong>{evo.ufRetirada} ml</strong></span>}
                    {evo.qbEfetivo && <span>• Qb: <strong>{evo.qbEfetivo} ml/min</strong></span>}
                    {evo.intercorrencias && evo.intercorrencias !== 'Nenhuma' && (
                      <span className="text-red-700 font-bold">
                        • ⚠️ Intercorrência: {evo.intercorrencias}
                      </span>
                    )}
                  </div>

                  {/* Texto da Conduta */}
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {evo.condutaClinica}
                  </p>

                  <div className="text-xs text-muted mt-3 pt-2 border-t flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
                    <span>Responsável: <strong>{evo.medicoNome || 'Médico Nefrologista'}</strong> ({evo.medicoCrm || 'CRM/SP'})</span>
                    <span style={{ fontSize: '0.68rem' }}>Gravado no Cloud Firestore</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAIS ================= */}
      <PatientFormModal 
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        patientToEdit={patient}
      />

      <ExamFormModal 
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        patientId={patient.id}
        examToEdit={examToEdit}
        examIndex={examIndexToEdit}
      />

      <MedicationModal 
        isOpen={isMedicationModalOpen}
        onClose={() => setIsMedicationModalOpen(false)}
        patientId={patient.id}
        medicationToEdit={medicationToEdit}
      />

      <EvolutionModal 
        isOpen={isEvolutionModalOpen}
        onClose={() => setIsEvolutionModalOpen(false)}
        patientId={patient.id}
        evolutionToEdit={evolutionToEdit}
      />
    </div>
  );
}
