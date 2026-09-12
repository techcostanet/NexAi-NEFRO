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
  ChevronRight,
  UploadCloud,
  HeartHandshake,
  Bug,
  Printer, 
  FileDown, 
  TrendingUp, 
  CheckSquare, 
  Sparkles, 
  Save, 
  X,
  FileCheck,
  Eye,
  Copy,
  Trophy
} from 'lucide-react';
import { 
  subscribeToPatientById, 
  deletePatientExam,
  deletePatientMedication,
  toggleMedicationStatus,
  deletePatientEvolution,
  deletePatientPrescription,
  addPatientWeightRecord,
  deletePatientWeightRecord,
  deletePatientBloodCulture,
  STATUS_TRANSPLANTE_OPTIONS
} from '../services/patientService';
import { subscribeDoctorProfile } from '../services/doctorService';
import { normalizeMedicamentosList, getMedicationStatus } from '../data/dialysisMedications';
import { useAuth } from '../context/AuthContext';
import PatientFormModal from '../components/PatientFormModal';
import ExamFormModal from '../components/ExamFormModal';
import MedicationModal from '../components/MedicationModal';
import EvolutionModal from '../components/EvolutionModal';
import ExamImportModal from '../components/ExamImportModal';
import PrescriptionModal from '../components/PrescriptionModal';
import PrescriptionPrintModal from '../components/PrescriptionPrintModal';
import PatientBulletinModal from '../components/patientBulletin/PatientBulletinModal';
import TransplantReportPdf from '../components/pdf/TransplantReportPdf';
import { downloadPdfDocument } from '../services/pdfService';
import { printElement } from '../utils/printUtils';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeDoctorId, userRole } = useAuth();
  
  const [patient, setPatient] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'exams' | 'medications' | 'evolutions'
  
  // Modais
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState(null);
  const [examIndexToEdit, setExamIndexToEdit] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState(null);
  const [medFilter, setMedFilter] = useState('todos'); // 'todos' | 'continuo' | 'temporario' | 'alerta' | 'inativos'

  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  const [evolutionToEdit, setEvolutionToEdit] = useState(null);

  // Modais de Receituário / Emissão de Receitas
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescriptionToEdit, setPrescriptionToEdit] = useState(null);
  const [prescriptionInitialTipo, setPrescriptionInitialTipo] = useState('simples');
  const [isPrescriptionPrintModalOpen, setIsPrescriptionPrintModalOpen] = useState(false);
  const [prescriptionToPrint, setPrescriptionToPrint] = useState(null);

  // Novos Modais para Peso, Transplante e Lock Therapy
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [weightFormData, setWeightFormData] = useState({
    data: new Date().toISOString().slice(0, 16),
    peso: '',
    tipo: 'Pré-HD',
    observacoes: ''
  });
  const [savingWeight, setSavingWeight] = useState(false);
  const [isTransplantReportOpen, setIsTransplantReportOpen] = useState(false);
  const [isLockTherapyModalOpen, setIsLockTherapyModalOpen] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [isBulletinModalOpen, setIsBulletinModalOpen] = useState(false);
  const [isDownloadingTransplantPdf, setIsDownloadingTransplantPdf] = useState(false);

  const handleDownloadTransplantPdf = async () => {
    try {
      setIsDownloadingTransplantPdf(true);
      const safeName = (patient?.nome || 'Paciente').replace(/\s+/g, '_');
      const fileName = `Laudo_Transplante_${safeName}.pdf`;
      await downloadPdfDocument(
        <TransplantReportPdf
          patient={patient}
          doctorInfo={doctorInfo}
          statusTransplante={statusTransplante}
          acessoVascular={acessoVascular}
          exames={exames}
          hemoculturas={hemoculturas}
          medicamentosList={medicamentosList}
          ultimoPeso={ultimoPeso}
        />,
        fileName
      );
    } catch (err) {
      console.error('Falha ao baixar PDF do transplante:', err);
      printElement('printable-transplant-report-doc');
    } finally {
      setIsDownloadingTransplantPdf(false);
    }
  };

  const handlePrintTransplant = () => {
    printElement('printable-transplant-report-doc', `Laudo Transplante - ${patient?.nome || ''}`);
  };

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPatientById(id, (data) => {
      if (data) {
        // Validação de isolamento: se for médico, apenas acessa seus próprios pacientes
        if (userRole !== 'admin' && activeDoctorId && data.doctorId && data.doctorId !== activeDoctorId) {
          console.warn("Acesso bloqueado: o paciente pertence a outro médico.");
          setPatient(null);
          setLoading(false);
          navigate('/doctor');
          return;
        }
        setPatient(data);
      } else {
        setPatient(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, activeDoctorId, userRole, navigate]);

  useEffect(() => {
    if (!activeDoctorId) return;
    const unsubDoc = subscribeDoctorProfile(activeDoctorId, (data) => {
      if (data) setDoctorInfo(data);
    });
    return () => unsubDoc();
  }, [activeDoctorId]);

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

  // Ações de Peso & Evolução Ponderal
  const handleSaveWeight = async (e) => {
    e.preventDefault();
    if (!weightFormData.peso) return;
    try {
      setSavingWeight(true);
      await addPatientWeightRecord(patient.id, weightFormData);
      setIsWeightModalOpen(false);
      setWeightFormData({
        data: new Date().toISOString().slice(0, 16),
        peso: '',
        tipo: 'Pré-HD',
        observacoes: ''
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar aferição de peso no Firestore.');
    } finally {
      setSavingWeight(false);
    }
  };

  const handleDeleteWeight = async (weightId) => {
    if (window.confirm("Deseja realmente excluir esta aferição de peso do histórico?")) {
      await deletePatientWeightRecord(patient.id, weightId);
    }
  };

  const handleDeleteBloodCulture = async (cultureId) => {
    if (window.confirm("Deseja realmente excluir este laudo de hemocultura?")) {
      await deletePatientBloodCulture(patient.id, cultureId);
    }
  };

  // Handlers de Receituário Médico
  const handleOpenNewPrescription = (tipo = 'simples') => {
    setPrescriptionToEdit(null);
    setPrescriptionInitialTipo(tipo);
    setIsPrescriptionModalOpen(true);
  };

  const handleEditPrescription = (rec) => {
    setPrescriptionToEdit(rec);
    setPrescriptionInitialTipo(rec.tipoReceita || 'simples');
    setIsPrescriptionModalOpen(true);
  };

  const handleViewPrescription = (rec) => {
    setPrescriptionToPrint(rec);
    setIsPrescriptionPrintModalOpen(true);
  };

  const handleDuplicatePrescription = (rec) => {
    setPrescriptionToEdit({
      ...rec,
      id: null,
      numeroReceita: null,
      dataEmissao: new Date().toISOString().split('T')[0]
    });
    setPrescriptionInitialTipo(rec.tipoReceita || 'simples');
    setIsPrescriptionModalOpen(true);
  };

  const handleSavedPrescription = (savedDoc, openPrint = false) => {
    if (openPrint && savedDoc) {
      setPrescriptionToPrint(savedDoc);
      setIsPrescriptionPrintModalOpen(true);
    }
  };

  const handleDeletePrescription = async (prescriptionId) => {
    if (window.confirm("Deseja realmente excluir esta receita médica do histórico do paciente?")) {
      try {
        await deletePatientPrescription(patient.id, prescriptionId);
      } catch (err) {
        console.error("Erro ao excluir receita:", err);
        alert("Erro ao excluir receita médica.");
      }
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
  
  // Ordena histórico cronológico: coletas mais recentes no topo, preservando o índice original para edições e exclusões
  const sortedHistoricoExames = [...historicoExames]
    .map((item, originalIndex) => ({ ...item, _originalIndex: originalIndex }))
    .sort((a, b) => new Date(b.dataExame || 0) - new Date(a.dataExame || 0));

  const evolucoes = Array.isArray(patient.evolucoes) ? patient.evolucoes : [];
  const receitas = Array.isArray(patient.receitas) ? patient.receitas : [];
  const historicoPesos = Array.isArray(patient.historicoPesos) ? patient.historicoPesos : [];
  const hemoculturas = Array.isArray(patient.hemoculturas) ? patient.hemoculturas : [];

  // Status de Transplante Renal
  const statusTransplante = patient.statusTransplante || patient.status || 'Não Avaliado';
  const transplantOpt = STATUS_TRANSPLANTE_OPTIONS.find(o => o.value === statusTransplante) || {
    value: statusTransplante,
    label: statusTransplante,
    badgeBg: '#f1f5f9',
    color: '#475569',
    border: '#cbd5e1'
  };

  // Cálculos de Ganho Interdialítico & Evolução de Peso (Melhoria 1)
  const ultimoPeso = historicoPesos.length > 0 ? historicoPesos[0].peso : (patient.ultimoPesoAferido || null);
  const pesoSecoNum = patient.pesoSeco ? parseFloat(String(patient.pesoSeco).replace(',', '.')) : null;
  const ganhoKg = (ultimoPeso && pesoSecoNum) ? parseFloat((ultimoPeso - pesoSecoNum).toFixed(2)) : null;
  const pidgPct = (ganhoKg !== null && pesoSecoNum && pesoSecoNum > 0) ? parseFloat(((ganhoKg / pesoSecoNum) * 100).toFixed(1)) : null;
  const isHipervolemia = pidgPct !== null && pidgPct > 4.5;
  const isHipotensaoRisco = ganhoKg !== null && ganhoKg < 0;

  // Hemocultura Crítica / Positiva Recente
  const hasPositiveCulture = hemoculturas.some(h => h.resultado === 'Positiva');

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
      <header className="glass-panel mt-3 mb-5" style={{ borderRadius: '20px', background: 'rgba(255, 255, 255, 0.95)', padding: '1.5rem 1.75rem', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)' }}>
        <div className="flex justify-between items-start flex-wrap gap-4">
          
          <div className="flex items-start gap-4">
            <button 
              type="button"
              className="btn btn-outline" 
              onClick={() => {
                navigate('/doctor');
              }} 
              style={{ 
                padding: '0.65rem', 
                borderRadius: '12px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginTop: '2px',
                border: '1px solid #e2e8f0',
                background: '#ffffff'
              }}
              title="Voltar para a lista de pacientes"
            >
              <ArrowLeft size={18} color="var(--primary)" />
            </button>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight" style={{ lineHeight: '1.25' }}>
                  {patient.nome}
                </h1>
                
                <span 
                  style={{ 
                    fontSize: '0.75rem', 
                    padding: '3px 12px', 
                    borderRadius: '20px', 
                    background: transplantOpt.badgeBg, 
                    color: transplantOpt.color, 
                    border: `1px solid ${transplantOpt.border}`, 
                    fontWeight: '700', 
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="Status no Transplante Renal"
                >
                  <HeartHandshake size={14} />
                  <span>Tx: {transplantOpt.label}</span>
                </span>

                <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: '600', whiteSpace: 'nowrap' }}>
                  {patient.turno || '3º Turno'}
                </span>
              </div>

              <div className="flex items-center gap-3.5 mt-2.5 flex-wrap text-sm text-slate-600 font-medium">
                <span className="flex items-center gap-1.5" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={15} color="#2563eb" style={{ flexShrink: 0 }} />
                  <strong className="text-slate-800">{patient.clinica || 'Dialize Betim'}</strong>
                </span>
                
                {patient.idade && (
                  <span className="text-slate-500">• {patient.idade} anos {patient.sexo ? `(${patient.sexo})` : ''}</span>
                )}
                
                {patient.dataNascimento && (
                  <span className="text-slate-500">• Nasc: {new Date(patient.dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                )}

                {patient.etiologiaDRC ? (
                  <span 
                    className="text-slate-500 cursor-pointer hover:text-blue-600 transition-colors" 
                    onClick={() => setIsPatientModalOpen(true)}
                    title="Clique para editar a etiologia da DRC"
                  >
                    • Etiologia: <strong className="text-slate-700 hover:text-blue-700">{patient.etiologiaDRC}</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsPatientModalOpen(true)}
                    className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-colors"
                    title="Definir etiologia da DRC"
                  >
                    + Definir Etiologia
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Ações Rápidas no Cabeçalho */}
          <div className="flex items-center gap-1.5 flex-wrap" style={{ gap: '0.35rem' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => setIsPatientModalOpen(true)}
              style={{ padding: '0.42rem 0.72rem', fontSize: '0.80rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', borderRadius: '10px', borderColor: '#cbd5e1', background: '#f8fafc', color: '#334155' }}
              title="Editar cadastro completo do paciente"
            >
              <Edit size={14} color="#475569" />
              <span>Editar</span>
            </button>

            <button 
              className="btn btn-outline" 
              onClick={() => setIsWeightModalOpen(true)}
              style={{ padding: '0.42rem 0.72rem', fontSize: '0.80rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', borderRadius: '10px', borderColor: '#a7f3d0', background: '#ecfdf5', color: '#065f46' }}
              title="Registrar pesagem e acompanhar evolução"
            >
              <Scale size={14} color="#059669" />
              <span>+ Peso</span>
            </button>

            <button 
              className="btn btn-outline" 
              onClick={() => setIsChecklistModalOpen(true)}
              style={{ padding: '0.42rem 0.72rem', fontSize: '0.80rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', borderRadius: '10px', borderColor: '#ddd6fe', background: '#f5f3ff', color: '#6d28d9' }}
              title="Checklist e Prontidão de Transplante Renal"
            >
              <CheckSquare size={14} color="#7c3aed" />
              <span>Prontidão Tx</span>
            </button>

            <button 
              className="btn btn-outline" 
              onClick={() => setIsTransplantReportOpen(true)}
              style={{ padding: '0.42rem 0.72rem', fontSize: '0.80rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', borderRadius: '10px', borderColor: '#bfdbfe', background: '#eff6ff', color: '#1d4ed8' }}
              title="Emitir Laudo Médico e Relatório de Transplante em PDF"
            >
              <Printer size={14} color="#2563eb" />
              <span>Laudo Tx</span>
            </button>

            <button 
              className="btn btn-outline" 
              onClick={() => setIsBulletinModalOpen(true)}
              style={{ padding: '0.42rem 0.72rem', fontSize: '0.80rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', borderRadius: '10px', borderColor: '#fde68a', background: '#fffbeb', color: '#b45309' }}
              title="Gerar e imprimir Boletim de Saúde & Conquistas para entregar ao paciente"
            >
              <Trophy size={14} color="#d97706" />
              <span>Boletim do Paciente</span>
            </button>

            <button 
              className="btn btn-outline" 
              onClick={handleOpenNewExam}
              style={{ padding: '0.42rem 0.72rem', fontSize: '0.80rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', borderRadius: '10px', borderColor: '#86efac', background: '#f0fdf4', color: '#15803d' }}
              title="Lançar novos exames laboratoriais e microbiologia"
            >
              <FlaskConical size={14} color="#16a34a" />
              <span>Exames</span>
            </button>

            <button 
              className="btn btn-outline" 
              onClick={() => setIsImportModalOpen(true)}
              style={{ padding: '0.42rem 0.72rem', fontSize: '0.80rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', borderRadius: '10px', borderColor: '#bae6fd', background: '#f0f9ff', color: '#0369a1' }}
              title="Importar laudo em PDF, Excel ou foto para este paciente"
            >
              <UploadCloud size={14} color="#0284c7" />
              <span>Importar</span>
            </button>

            <button 
              className="btn btn-outline" 
              onClick={handleOpenNewMedication}
              style={{ padding: '0.42rem 0.72rem', fontSize: '0.80rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', borderRadius: '10px', borderColor: '#fed7aa', background: '#fff7ed', color: '#c2410c' }}
              title="Prescrever medicamentos"
            >
              <Pill size={14} color="#ea580c" />
              <span>Prescrever</span>
            </button>

            <button 
              className="btn btn-outline" 
              onClick={() => handleOpenNewPrescription('simples')}
              style={{ padding: '0.42rem 0.72rem', fontSize: '0.80rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', borderRadius: '10px', borderColor: '#c7d2fe', background: '#eef2ff', color: '#4338ca' }}
              title="Emitir nova receita médica"
            >
              <FileCheck size={14} color="#4f46e5" />
              <span>+ Receita</span>
            </button>

            <button 
              className="btn btn-outline" 
              onClick={handleOpenNewEvolution}
              style={{ padding: '0.42rem 0.72rem', fontSize: '0.80rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap', borderRadius: '10px', borderColor: '#93c5fd', background: '#eff6ff', color: '#1d4ed8' }}
              title="Nova evolução médica"
            >
              <Plus size={14} color="#1d4ed8" />
              <span>+ Evolução</span>
            </button>
          </div>
        </div>

        {/* Alertas Críticos Globais do Paciente */}
        {(hasLabAlerts || medAlerts.length > 0 || hasPositiveCulture || isHipervolemia) && (
          <div className="mt-4 pt-4 border-t flex flex-col gap-2.5" style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
            {hasPositiveCulture && (
              <div 
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: '14px',
                  background: '#fef2f2',
                  border: '1px solid #f87171',
                  color: '#991b1b',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Bug size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span style={{ lineHeight: '1.4' }}>
                    <strong style={{ color: '#b91c1c' }}>🚨 Infecção de Acesso:</strong> Hemocultura positiva ({hemoculturas.find(h => h.resultado === 'Positiva')?.microrganismo || 'Patógeno isolado'}). Checar lock therapy e antibioticoterapia.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsLockTherapyModalOpen(true)}
                    className="btn"
                    style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', fontSize: '0.75rem', padding: '4px 9px', borderRadius: '8px', fontWeight: 'bold' }}
                  >
                    Lock Therapy →
                  </button>
                  <button 
                    onClick={() => setActiveTab('exams')}
                    style={{ background: 'transparent', border: 'none', color: '#991b1b', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Ver Culturas
                  </button>
                </div>
              </div>
            )}

            {isHipervolemia && (
              <div 
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '14px',
                  background: '#fff7ed',
                  border: '1px solid #fed7aa',
                  color: '#c2410c',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <AlertTriangle size={18} color="#ea580c" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Atenção Volêmica:</strong> Ganho interdialítico de <strong>+{ganhoKg} kg ({pidgPct}%)</strong>. Risco de hipertensão e congestão.
                </span>
              </div>
            )}
            {hasLabAlerts && (
              <div 
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: '14px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                  <span style={{ lineHeight: '1.4' }}>
                    <strong style={{ color: '#b91c1c' }}>Atenção Laboratorial:</strong> {hbBaixa ? 'Hb < 10,0 • ' : ''}{pthAlto ? 'PTH > 600 • ' : ''}{fosforoAlto ? 'Fósforo > 5,5 • ' : ''}{kAlto ? 'Potássio > 5,5 • ' : ''}{albuminaBaixa ? 'Albumina < 3,8 • ' : ''}{hco3Baixo ? 'Acidose (HCO₃ < 22)' : ''}
                  </span>
                </div>
                <button 
                  onClick={() => setActiveTab('exams')}
                  className="hover:underline"
                  style={{ 
                    background: 'rgba(220, 38, 38, 0.08)', 
                    color: '#991b1b', 
                    border: '1px solid rgba(220, 38, 38, 0.2)', 
                    cursor: 'pointer', 
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Ver Exames →
                </button>
              </div>
            )}

            {medAlerts.length > 0 && (
              <div 
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: '14px',
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Clock size={18} color="#d97706" style={{ flexShrink: 0 }} />
                  <span style={{ lineHeight: '1.4' }}>
                    <strong style={{ color: '#b45309' }}>Alertas de Prescrição:</strong> {medAlerts.length} medicamento(s) com ciclo encerrado ou a vencer nos próximos dias.
                  </span>
                </div>
                <button 
                  onClick={() => setActiveTab('medications')}
                  className="hover:underline"
                  style={{ 
                    background: 'rgba(217, 119, 6, 0.08)', 
                    color: '#92400e', 
                    border: '1px solid rgba(217, 119, 6, 0.2)', 
                    cursor: 'pointer', 
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}
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

        <button
          className={`btn ${activeTab === 'receitas' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('receitas')}
          style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          title="Emissão e Histórico de Receituários Médicos (Simples, Controle Especial, Antimicrobianos)"
        >
          <FileCheck size={16} />
          <span>Receituário</span>
          {receitas.length > 0 && (
            <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', background: activeTab === 'receitas' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeTab === 'receitas' ? '#ffffff' : '#475569', fontWeight: 'bold' }}>
              {receitas.length}
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

            {/* Card Dados Cadastrais & Clínicos (100% Editável) */}
            <section className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px' }}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <User size={16} color="var(--primary)" />
                  <span>Dados Clínicos & Identificação</span>
                </h2>
                <button 
                  type="button"
                  onClick={() => setIsPatientModalOpen(true)}
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '8px' }}
                  title="Editar todos os dados clínicos e identificação"
                >
                  <Edit size={12} color="var(--primary)" />
                  <span>Editar Dados</span>
                </button>
              </div>

              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-muted">Status Transplante:</span>
                  <span style={{ fontSize: '0.72rem', padding: '1px 8px', borderRadius: '8px', background: transplantOpt.badgeBg, color: transplantOpt.color, border: `1px solid ${transplantOpt.border}`, fontWeight: 'bold' }}>
                    {transplantOpt.label}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-muted">Etiologia DRC:</span>
                  <strong className="text-slate-800 font-semibold">{patient.etiologiaDRC || 'Não informada'}</strong>
                </div>
                <div className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
                  <span className="text-muted">Peso Seco Alvo:</span>
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
                <div className="flex justify-between items-start">
                  <span className="text-muted">Alergias:</span>
                  <div className="text-right flex flex-wrap justify-end gap-1 max-w-[65%]">
                    {Array.isArray(patient.alergias) && patient.alergias.length > 0 ? (
                      patient.alergias.map((al, idx) => (
                        <span key={idx} style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '6px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', fontWeight: 'bold' }}>
                          {al}
                        </span>
                      ))
                    ) : (
                      <span className="text-emerald-700 font-semibold">🟢 Nega alergias</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Card Controle Ponderal & Histórico de Peso (Requisito 2 + Melhoria 1 + Melhoria 5) */}
            <section className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px' }}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Scale size={16} color="#059669" />
                  <span>Controle Ponderal & Peso ({historicoPesos.length})</span>
                </h2>
                <button 
                  type="button"
                  onClick={() => setIsWeightModalOpen(true)}
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '8px', color: '#059669', borderColor: '#a7f3d0', background: '#ecfdf5' }}
                  title="Lançar novo peso do paciente"
                >
                  <Plus size={12} />
                  <span>Registrar Peso</span>
                </button>
              </div>

              {/* Destaque Atual: Último Peso vs Peso Seco */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <div 
                  className="p-2 rounded-xl text-center flex flex-col justify-center items-center"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', minHeight: '68px' }}
                >
                  <span className="text-muted block mb-0.5 font-medium" style={{ fontSize: '0.70rem', lineHeight: '1.2' }}>Último Peso</span>
                  <strong className="font-bold text-slate-800" style={{ fontSize: '0.90rem', lineHeight: '1.2' }}>
                    {ultimoPeso ? `${ultimoPeso} kg` : '-'}
                  </strong>
                  <span className="text-slate-400 mt-0.5" style={{ fontSize: '0.65rem', lineHeight: '1.2' }}>
                    {ultimoPeso ? 'Aferido' : 'Sem registro'}
                  </span>
                </div>

                <div 
                  className="p-2 rounded-xl text-center flex flex-col justify-center items-center"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', minHeight: '68px' }}
                >
                  <span className="text-muted block mb-0.5 font-medium" style={{ fontSize: '0.70rem', lineHeight: '1.2' }}>Meta Peso Seco</span>
                  <strong className="font-bold text-slate-700" style={{ fontSize: '0.90rem', lineHeight: '1.2' }}>
                    {patient.pesoSeco ? `${patient.pesoSeco} kg` : '-'}
                  </strong>
                  <span className="text-slate-400 mt-0.5" style={{ fontSize: '0.65rem', lineHeight: '1.2' }}>Alvo nefrológico</span>
                </div>

                <div 
                  className="p-2 rounded-xl text-center flex flex-col justify-center items-center"
                  style={{ 
                    background: ganhoKg !== null && isHipervolemia ? '#fef2f2' : (ganhoKg !== null && isHipotensaoRisco ? '#eff6ff' : '#f8fafc'), 
                    border: `1px solid ${ganhoKg !== null && isHipervolemia ? '#fecaca' : (ganhoKg !== null && isHipotensaoRisco ? '#bfdbfe' : '#e2e8f0')}`,
                    minHeight: '68px'
                  }}
                >
                  <span className="text-muted block mb-0.5 font-medium" style={{ fontSize: '0.70rem', lineHeight: '1.2' }}>Ganho (PIDG)</span>
                  {ganhoKg !== null ? (
                    <strong className="font-bold" style={{ fontSize: '0.90rem', lineHeight: '1.2', color: isHipervolemia ? '#dc2626' : (isHipotensaoRisco ? '#2563eb' : '#059669') }}>
                      {ganhoKg > 0 ? `+${ganhoKg}` : ganhoKg} kg
                    </strong>
                  ) : (
                    <strong className="font-bold text-slate-400" style={{ fontSize: '0.90rem', lineHeight: '1.2' }}>-</strong>
                  )}
                  <span className="mt-0.5" style={{ fontSize: '0.65rem', lineHeight: '1.2', color: ganhoKg !== null ? (isHipervolemia ? '#dc2626' : '#64748b') : '#94a3b8' }}>
                    {ganhoKg !== null ? `${pidgPct}%` : 'Pendente'}
                  </span>
                </div>
              </div>

              {/* Mini gráfico visual de tendência ponderal (Melhoria 5) */}
              {historicoPesos.length > 1 && (
                <div className="mb-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-slate-500 uppercase flex items-center gap-1" style={{ fontSize: '0.65rem' }}>
                      <TrendingUp size={11} color="var(--primary)" /> Tendência das Últimas Pesagens
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.65rem' }}>Meta: {patient.pesoSeco || '-'}kg</span>
                  </div>
                  <div className="flex items-end justify-between gap-1.5 h-16 pt-2 px-1">
                    {historicoPesos.slice(0, 6).reverse().map((rec, i) => {
                      const minP = Math.min(...historicoPesos.slice(0, 6).map(r => r.peso), pesoSecoNum || 50) - 1;
                      const maxP = Math.max(...historicoPesos.slice(0, 6).map(r => r.peso), pesoSecoNum || 70) + 1;
                      const range = maxP - minP || 1;
                      const heightPct = Math.max(15, Math.min(100, ((rec.peso - minP) / range) * 100));
                      const isOver = pesoSecoNum && rec.peso > pesoSecoNum + 2.5;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="font-bold text-slate-700" style={{ fontSize: '0.60rem' }}>{rec.peso}</span>
                          <div 
                            style={{ 
                              width: '100%', 
                              height: `${heightPct}%`, 
                              background: isOver ? '#fb7185' : '#38bdf8', 
                              borderRadius: '4px 4px 0 0',
                              transition: 'height 0.3s'
                            }} 
                            title={`${new Date(rec.data).toLocaleDateString('pt-BR')} - ${rec.peso}kg (${rec.tipo})`}
                          />
                          <span className="text-muted" style={{ fontSize: '0.58rem' }}>{new Date(rec.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Histórico Cronológico de Pesagens */}
              {historicoPesos.length === 0 ? (
                <div className="text-center py-4 text-xs text-muted">
                  Nenhuma pesagem registrada.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {historicoPesos.map((rec) => (
                    <div 
                      key={rec.id} 
                      className="p-1.5 px-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-800">{rec.peso} kg</strong>
                          <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: '#e2e8f0', color: '#334155' }}>
                            {rec.tipo}
                          </span>
                        </div>
                        <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                          {new Date(rec.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                          {rec.observacoes ? ` • ${rec.observacoes}` : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {rec.ganhoInterdialitico !== null && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: rec.ganhoInterdialitico > 2.5 ? '#dc2626' : '#059669' }}>
                            {rec.ganhoInterdialitico > 0 ? `+${rec.ganhoInterdialitico}` : rec.ganhoInterdialitico} kg
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteWeight(rec.id)}
                          className="text-slate-400 hover:text-red-600 transition"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                          title="Excluir esta pesagem"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
            <section className="glass-panel" style={{ padding: '1.35rem', borderRadius: '18px' }}>
              <div className="flex justify-between items-center mb-3.5">
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '0.85rem 0.6rem', 
                    borderRadius: '14px', 
                    background: hbBaixa ? '#fef2f2' : '#f8fafc', 
                    border: `1px solid ${hbBaixa ? '#fecaca' : '#e2e8f0'}`,
                    textAlign: 'center',
                    minHeight: '84px'
                  }}
                >
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                    Hemoglobina
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: hbBaixa ? '#dc2626' : '#0f172a', lineHeight: 1.2 }}>
                    {exames.hb || '-'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px', fontWeight: '500' }}>
                    g/dL
                  </span>
                </div>

                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '0.85rem 0.6rem', 
                    borderRadius: '14px', 
                    background: pthAlto ? '#fef2f2' : '#f8fafc', 
                    border: `1px solid ${pthAlto ? '#fecaca' : '#e2e8f0'}`,
                    textAlign: 'center',
                    minHeight: '84px'
                  }}
                >
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                    PTH Intacto
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: pthAlto ? '#dc2626' : '#0f172a', lineHeight: 1.2 }}>
                    {exames.pth || '-'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px', fontWeight: '500' }}>
                    pg/mL
                  </span>
                </div>

                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '0.85rem 0.6rem', 
                    borderRadius: '14px', 
                    background: fosforoAlto ? '#fef2f2' : '#f8fafc', 
                    border: `1px solid ${fosforoAlto ? '#fecaca' : '#e2e8f0'}`,
                    textAlign: 'center',
                    minHeight: '84px'
                  }}
                >
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                    Fósforo
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: fosforoAlto ? '#dc2626' : '#0f172a', lineHeight: 1.2 }}>
                    {exames.fosforo || '-'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px', fontWeight: '500' }}>
                    mg/dL
                  </span>
                </div>

                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '0.85rem 0.6rem', 
                    borderRadius: '14px', 
                    background: kAlto ? '#fef2f2' : '#f8fafc', 
                    border: `1px solid ${kAlto ? '#fecaca' : '#e2e8f0'}`,
                    textAlign: 'center',
                    minHeight: '84px'
                  }}
                >
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                    Potássio (K⁺)
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: kAlto ? '#dc2626' : '#0f172a', lineHeight: 1.2 }}>
                    {exames.k || '-'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px', fontWeight: '500' }}>
                    mEq/L
                  </span>
                </div>

                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '0.85rem 0.6rem', 
                    borderRadius: '14px', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    textAlign: 'center',
                    minHeight: '84px'
                  }}
                >
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                    Kt/V
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', lineHeight: 1.2 }}>
                    {exames.ktv || '-'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px', fontWeight: '500' }}>
                    Meta ≥ 1.2
                  </span>
                </div>

                <div 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: '0.85rem 0.6rem', 
                    borderRadius: '14px', 
                    background: albuminaBaixa ? '#fef2f2' : '#f8fafc', 
                    border: `1px solid ${albuminaBaixa ? '#fecaca' : '#e2e8f0'}`,
                    textAlign: 'center',
                    minHeight: '84px'
                  }}
                >
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                    Albumina
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: albuminaBaixa ? '#dc2626' : '#0f172a', lineHeight: 1.2 }}>
                    {exames.albumina || '-'}
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '3px', fontWeight: '500' }}>
                    g/dL
                  </span>
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
              <p className="text-xs text-muted">Metas KDIGO/SBN</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                className="btn btn-outline" 
                onClick={() => setIsBulletinModalOpen(true)}
                style={{ 
                  padding: '0.45rem 0.95rem', 
                  fontSize: '0.8rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  borderColor: '#fde68a',
                  background: '#fffbeb',
                  color: '#b45309',
                  fontWeight: '600'
                }}
                title="Emitir e imprimir Boletim de Saúde & Conquistas para o paciente"
              >
                <Trophy size={14} color="#d97706" />
                <span>Boletim do Paciente</span>
              </button>

              <button 
                className="btn btn-outline" 
                onClick={() => setIsImportModalOpen(true)}
                style={{ 
                  padding: '0.45rem 0.95rem', 
                  fontSize: '0.8rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '5px',
                  borderColor: '#bfdbfe',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  fontWeight: '600'
                }}
                title="Importar laudo em PDF, foto ou planilha para este paciente"
              >
                <UploadCloud size={14} color="#2563eb" />
                <span>Importar Laudo</span>
              </button>

              <button className="btn btn-primary" onClick={handleOpenNewExam} style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Plus size={14} />
                <span>Novo Registro de Exame</span>
              </button>
            </div>
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

            {/* 5. Glicemia & Função Hepática (TGP / TGO) */}
            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.95)' }}>
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-teal-800 mb-2.5" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Activity size={15} color="#0d9488" style={{ flexShrink: 0 }} />
                <span>Glicemia & Função Hepática</span>
              </div>
              
              <div className="flex flex-col gap-1.5 text-xs">
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">Glicemia Jejum:</span>
                  <strong className="text-slate-800">{exames.glicemia ? `${exames.glicemia} mg/dL` : '-'} <span className="text-muted font-normal text-2xs">(70-100)</span></strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">HbA1c (%):</span>
                  <strong className="text-slate-800">{exames.hba1c ? `${exames.hba1c}%` : '-'} <span className="text-muted font-normal text-2xs">(&lt;7.0%)</span></strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">TGP (ALT):</span>
                  <strong style={{ color: (exames.tgp && exames.tgp > 45) ? '#dc2626' : '#1e293b', fontWeight: 'bold' }}>
                    {exames.tgp ? `${exames.tgp} U/L` : '-'} <span className="text-muted font-normal text-2xs">(&lt;45)</span>
                  </strong>
                </div>
                <div className="flex justify-between items-center p-1.5 rounded-lg bg-slate-50">
                  <span className="text-muted">TGO (AST):</span>
                  <strong className="text-slate-800">{exames.tgo ? `${exames.tgo} U/L` : '-'} <span className="text-muted font-normal text-2xs">(&lt;35)</span></strong>
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
                      <th style={{ padding: '0.65rem 0.8rem', color: '#475569' }}>Glic / TGP</th>
                      <th style={{ padding: '0.65rem 0.8rem', textAlign: 'right', color: '#475569' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHistoricoExames.map((item, idx) => (
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
                        <td style={{ padding: '0.65rem 0.8rem' }}>
                          {item.glicemia ? `${item.glicemia}` : '-'} / {item.tgp ? `${item.tgp} U/L` : '-'}
                        </td>
                        <td style={{ padding: '0.65rem 0.8rem', textAlign: 'right' }}>
                          <div className="flex justify-end gap-1">
                            <button 
                              className="btn btn-outline" 
                              onClick={() => handleEditExam(item, item._originalIndex)}
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem' }}
                              title="Editar este exame"
                            >
                              <Edit size={12} color="var(--primary)" />
                            </button>
                            <button 
                              className="btn btn-outline" 
                              onClick={() => handleDeleteExam(item._originalIndex)}
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

          {/* Módulo de Vigilância Microbiológica & Hemoculturas do Acesso (Requisito 6 + Melhoria 4) */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '16px', background: '#fffbeb', border: '1px solid #fde68a' }}>
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Bug size={18} color="#b45309" />
                <h3 className="font-bold text-sm text-slate-800">
                  Microbiologia & Hemoculturas do Acesso Vascular ({hemoculturas.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLockTherapyModalOpen(true)}
                  className="btn btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderColor: '#f59e0b', color: '#b45309', background: '#fef3c7' }}
                  title="Calculadora e Protocolo de Selo de Cateter"
                >
                  <Sparkles size={13} />
                  <span>Protocolo Lock Therapy</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenNewExam}
                  className="btn btn-primary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                >
                  + Lançar Cultura
                </button>
              </div>
            </div>

            {hemoculturas.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted">
                Nenhum laudo de hemocultura lançado para este paciente. Ao registrar exames, preencha o bloco de Microbiologia.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {hemoculturas.map((cult) => {
                  const isPos = cult.resultado === 'Positiva';
                  const isAguardando = cult.resultado === 'Aguardando Resultado';

                  return (
                    <div 
                      key={cult.id} 
                      className="p-3 rounded-xl border flex flex-col gap-2 text-xs"
                      style={{ 
                        background: isPos ? '#fef2f2' : (isAguardando ? '#fffbeb' : '#f0fdf4'),
                        borderColor: isPos ? '#fecaca' : (isAguardando ? '#fde68a' : '#bbf7d0')
                      }}
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span 
                            style={{ 
                              fontSize: '0.7rem', 
                              padding: '2px 8px', 
                              borderRadius: '8px', 
                              fontWeight: 'bold',
                              background: isPos ? '#fee2e2' : (isAguardando ? '#fef3c7' : '#dcfce7'),
                              color: isPos ? '#991b1b' : (isAguardando ? '#92400e' : '#15803d')
                            }}
                          >
                            {cult.resultado}
                          </span>
                          <strong className="text-slate-800">
                            Coleta: {new Date(cult.dataColeta).toLocaleString('pt-BR')}
                          </strong>
                          <span className="text-slate-500">• Sítio: <strong>{cult.sitioColeta}</strong></span>
                          {cult.dtpHoras !== null && cult.dtpHoras !== undefined && (
                            <span style={{ padding: '1px 6px', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontWeight: 'bold' }}>
                              DTP: {cult.dtpHoras}h {cult.dtpHoras > 2 ? '(Critério: Foco em Cateter)' : ''}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteBloodCulture(cult.id)}
                          className="text-slate-400 hover:text-red-600 transition"
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          title="Excluir este laudo de hemocultura"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      {cult.microrganismo && (
                        <div className="flex items-center gap-2 text-slate-800">
                          <Bug size={14} color="#dc2626" />
                          <span>Patógeno Isolado: <strong className="text-red-700 font-bold">{cult.microrganismo}</strong></span>
                        </div>
                      )}

                      {(cult.sensibilidade || cult.resistencia) && (
                        <div className="p-2 rounded-lg bg-white/70 border border-slate-200 flex flex-col gap-1">
                          {cult.sensibilidade && (
                            <span className="text-emerald-800">
                              <strong>Sensível a:</strong> {cult.sensibilidade}
                            </span>
                          )}
                          {cult.resistencia && (
                            <span className="text-rose-800">
                              <strong>Resistente a:</strong> {cult.resistencia}
                            </span>
                          )}
                        </div>
                      )}

                      {cult.conduta && (
                        <div className="text-slate-700 bg-white/60 p-2 rounded-lg border border-slate-200">
                          <strong>Conduta Clínica / Selo:</strong> {cult.conduta}
                        </div>
                      )}
                    </div>
                  );
                })}
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
              <p className="text-xs text-muted">Uso contínuo e ciclos temporários</p>
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

      {/* ================= ABA 4: EVOLUÇÕES CLÍNICAS ================= */}
      {activeTab === 'evolucoes' && (
        <div className="flex flex-col gap-4 animate-in">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} color="var(--primary)" />
                <span>Evoluções Clínicas</span>
              </h2>
              <p className="text-xs text-muted">Evoluções e intercorrências</p>
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
                      <span 
                        style={{ 
                          fontSize: '0.72rem', 
                          padding: '2px 8px', 
                          borderRadius: '8px', 
                          background: evo.tipoAtendimento === 'Internação' ? '#f3e8ff' : '#eff6ff', 
                          color: evo.tipoAtendimento === 'Internação' ? '#7e22ce' : '#1e40af', 
                          border: evo.tipoAtendimento === 'Internação' ? '1px solid #e9d5ff' : 'none',
                          fontWeight: '600' 
                        }}
                      >
                        {evo.tipoAtendimento === 'Internação' ? '🛏️ Internação' : (evo.tipoAtendimento === 'Ronda de Hemodiálise' ? 'Hemodiálise' : (evo.tipoAtendimento || 'Hemodiálise'))}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        type="button"
                        className="btn btn-outline" 
                        onClick={() => handleEditEvolution(evo)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                        title="Editar evolução"
                      >
                        <Edit size={12} color="var(--primary)" />
                      </button>
                      <button 
                        type="button"
                        className="btn btn-outline" 
                        onClick={() => handleDeleteEvolution(evo.id)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                        title="Excluir evolução"
                      >
                        <Trash2 size={12} color="var(--danger)" />
                      </button>
                    </div>
                  </div>

                  {/* Parâmetros Vitais da Sessão */}
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

      {/* ================= ABA 5: RECEITUÁRIO MÉDICO ================= */}
      {activeTab === 'receitas' && (
        <div className="flex flex-col gap-4 animate-in">
          {/* Cabeçalho da Aba - Padrão alinhado à direita idêntico às outras abas */}
          <div className="flex justify-between items-center gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileCheck size={18} color="var(--primary)" />
                <span>Receituário & Prescrições Médicas</span>
              </h2>
              <p className="text-xs text-muted">Receituários emitidos</p>
            </div>

            <button 
              className="btn btn-primary shrink-0" 
              onClick={() => handleOpenNewPrescription('simples')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Plus size={14} />
              <span>Nova Receita</span>
            </button>
          </div>

          {/* Histórico de Receitas Emitidas (Tela limpa para visualização de receitas futuras) */}
          {receitas.length === 0 ? (
            <div className="glass-panel text-center py-12 px-4 rounded-2xl border border-slate-200 text-slate-500">
              <FileCheck size={32} className="opacity-40 mx-auto mb-2" />
              <p className="text-sm text-muted mb-3">Nenhum receituário registrado para este paciente.</p>
              <button 
                className="btn btn-outline" 
                onClick={() => handleOpenNewPrescription('simples')}
                style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
              >
                Emitir Primeira Receita
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider flex justify-between items-center px-1">
                <span>Histórico de Receituários Emitidos ({receitas.length})</span>
                <span className="text-xxs font-normal text-slate-400">Gravado no Cloud Firestore</span>
              </div>

              {receitas.map((rec) => {
                const itensCount = Array.isArray(rec.itens) ? rec.itens.length : 0;
                const isEspecial = rec.tipoReceita === 'controle_especial';
                const isAnti = rec.tipoReceita === 'antimicrobiano';
                const isAltoCusto = rec.tipoReceita === 'alto_custo';

                const borderLeftColor = isEspecial ? '#9333ea' : (isAnti ? '#d97706' : (isAltoCusto ? '#059669' : 'var(--primary)'));
                const badgeBg = isEspecial ? '#f3e8ff' : (isAnti ? '#fffbeb' : (isAltoCusto ? '#ecfdf5' : '#eff6ff'));
                const badgeColor = isEspecial ? '#7e22ce' : (isAnti ? '#b45309' : (isAltoCusto ? '#047857' : '#1e40af'));
                const badgeBorder = isEspecial ? '1px solid #e9d5ff' : (isAnti ? '1px solid #fde68a' : (isAltoCusto ? '1px solid #a7f3d0' : 'none'));

                const tipoLabel = isEspecial 
                  ? 'Controle Especial (2 Vias)' 
                  : (isAnti 
                      ? 'Antimicrobianos (2 Vias)' 
                      : (isAltoCusto 
                          ? 'Alto Custo (LME)' 
                          : 'Receituário Simples'));

                return (
                  <div 
                    key={rec.id} 
                    className="glass-panel" 
                    style={{ padding: '1.25rem', borderRadius: '16px', borderLeft: `4px solid ${borderLeftColor}` }}
                  >
                    {/* Linha Superior: Data, Badge e Botões de Ação Padronizados */}
                    <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <FileCheck size={15} color="var(--primary)" />
                        <strong className="text-sm text-slate-800">
                          {new Date(rec.dataEmissao + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </strong>
                        <span 
                          style={{ 
                            fontSize: '0.72rem', 
                            padding: '2px 8px', 
                            borderRadius: '8px', 
                            background: badgeBg, 
                            color: badgeColor, 
                            border: badgeBorder,
                            fontWeight: '600' 
                          }}
                        >
                          {tipoLabel}
                        </span>
                      </div>

                      {/* Botões de Ação Padronizados ao estilo Evoluções */}
                      <div className="flex items-center gap-1.5">
                        <button 
                          type="button"
                          onClick={() => handleViewPrescription(rec)}
                          className="btn btn-primary"
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Imprimir ou salvar em PDF"
                        >
                          <Printer size={12} />
                          <span>Imprimir / PDF</span>
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleViewPrescription(rec)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                          title="Visualizar documento em folha A4"
                        >
                          <Eye size={12} color="var(--primary)" />
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleDuplicatePrescription(rec)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                          title="Duplicar / Renovar receita"
                        >
                          <Copy size={12} color="var(--primary)" />
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleEditPrescription(rec)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                          title="Editar receita"
                        >
                          <Edit size={12} color="var(--primary)" />
                        </button>

                        <button 
                          type="button"
                          onClick={() => handleDeletePrescription(rec.id)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem' }}
                          title="Excluir receita do histórico"
                        >
                          <Trash2 size={12} color="var(--danger)" />
                        </button>
                      </div>
                    </div>

                    {/* Resumo dos medicamentos prescritos - Padrão idêntico aos parâmetros de Evoluções */}
                    <div className="flex items-center gap-2 text-xs text-muted mb-2 flex-wrap font-medium p-2 bg-slate-50 rounded-xl">
                      <span>{itensCount} {itensCount === 1 ? 'medicamento prescrito' : 'medicamentos prescritos'}:</span>
                      {Array.isArray(rec.itens) && rec.itens.map((item, idx) => {
                        const rawName = item.medicamento || item.nome || '';
                        const parts = rawName.trim().split(/\s+/);
                        const cleanName = (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) ? parts[0] : rawName;
                        return (
                          <span key={idx} className="bg-white text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 text-xxs font-semibold">
                            {cleanName}{item.quantidade ? ` • ${item.quantidade}` : ''}
                          </span>
                        );
                      })}
                    </div>

                    {/* Orientações (se houver) */}
                    {rec.observacoesGerais && (
                      <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed mb-2 px-1 italic">
                        {rec.observacoesGerais}
                      </p>
                    )}

                    {/* Rodapé Padronizado idêntico a Evoluções */}
                    <div className="text-xs text-muted mt-3 pt-2 border-t flex justify-between items-center" style={{ borderColor: 'var(--border)' }}>
                      <span>Responsável: <strong>{rec.medico?.nome || doctorInfo?.nome || 'Dr(a). Médico(a) Responsável'}</strong> (CRM-{rec.medico?.ufCrm || doctorInfo?.ufCrm || 'MG'} {rec.medico?.crm || doctorInfo?.crm || '------'}) • Validade: {rec.validadeDias || 180} dias</span>
                      <span style={{ fontSize: '0.68rem' }}>Gravado no Cloud Firestore</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAIS ================= */}
      <PrescriptionModal 
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        patient={patient}
        doctorInfo={doctorInfo}
        prescriptionToEdit={prescriptionToEdit}
        initialTipo={prescriptionInitialTipo}
        onSaved={handleSavedPrescription}
      />

      <PrescriptionPrintModal
        isOpen={isPrescriptionPrintModalOpen}
        onClose={() => setIsPrescriptionPrintModalOpen(false)}
        prescription={prescriptionToPrint}
        patient={patient}
        doctorInfo={doctorInfo}
      />

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
        doctorInfo={doctorInfo}
      />

      <ExamImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        patients={[patient]}
        doctorId={patient.doctorId || activeDoctorId}
        preselectedPatientId={patient.id}
      />

      <PatientBulletinModal 
        isOpen={isBulletinModalOpen}
        onClose={() => setIsBulletinModalOpen(false)}
        patient={patient}
        doctorInfo={doctorInfo}
      />
      {/* ================= MODAL: REGISTRAR PESO & EVOLUÇÃO PONDERAL (Requisito 2) ================= */}
      {isWeightModalOpen && (
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
          onClick={() => setIsWeightModalOpen(false)}
        >
          <div 
            className="glass-panel animate-in" 
            style={{ 
              background: 'var(--surface-solid)', 
              width: '100%', 
              maxWidth: '480px', 
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              borderRadius: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Scale size={20} color="#059669" />
                <h2 className="text-base font-bold">Registrar Pesagem do Paciente</h2>
              </div>
              <button 
                type="button" 
                onClick={() => setIsWeightModalOpen(false)} 
                className="btn btn-outline" 
                style={{ padding: '0.35rem', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block text-slate-700">Data e Hora da Pesagem *</label>
                <input 
                  type="datetime-local" 
                  className="input-field text-xs" 
                  value={weightFormData.data}
                  onChange={(e) => setWeightFormData(prev => ({ ...prev, data: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="text-xs font-semibold mb-1 block text-slate-700">Peso Aferido (kg) *</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="input-field text-sm font-bold" 
                    placeholder="Ex: 68.5"
                    value={weightFormData.peso}
                    onChange={(e) => setWeightFormData(prev => ({ ...prev, peso: e.target.value }))}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block text-slate-700">Momento da Aferição</label>
                  <select 
                    className="input-field text-xs"
                    value={weightFormData.tipo}
                    onChange={(e) => setWeightFormData(prev => ({ ...prev, tipo: e.target.value }))}
                  >
                    <option value="Pré-HD">Pré-Hemodiálise</option>
                    <option value="Pós-HD">Pós-Hemodiálise</option>
                    <option value="Consulta">Consulta Ambulatorial</option>
                    <option value="Internação">Durante Internação</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              {/* Cálculo em tempo real de Ganho Interdialítico */}
              {weightFormData.peso && pesoSecoNum && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-muted block">Meta Peso Seco:</span>
                    <strong>{pesoSecoNum} kg</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-muted block">Variação / Ganho:</span>
                    <strong style={{ 
                      color: (parseFloat(weightFormData.peso) - pesoSecoNum) > 3.0 ? '#dc2626' : '#059669' 
                    }}>
                      {(parseFloat(weightFormData.peso) - pesoSecoNum) > 0 ? '+' : ''}
                      {(parseFloat(weightFormData.peso) - pesoSecoNum).toFixed(2)} kg 
                      ({(((parseFloat(weightFormData.peso) - pesoSecoNum) / pesoSecoNum) * 100).toFixed(1)}%)
                    </strong>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold mb-1 block text-slate-700">Observações Clínicas (Opcional)</label>
                <input 
                  type="text" 
                  className="input-field text-xs" 
                  placeholder="Ex: Paciente com edema MMII (+/4+), eupneico..."
                  value={weightFormData.observacoes}
                  onChange={(e) => setWeightFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsWeightModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingWeight}>
                  {savingWeight ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>{savingWeight ? 'Gravando...' : 'Salvar Pesagem'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LAUDO DE ENCAMINHAMENTO PARA TRANSPLANTE EM PDF (Melhoria 3) ================= */}
      {isTransplantReportOpen && (
        <div 
          className="transplant-modal-overlay"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(15, 23, 42, 0.75)', 
            backdropFilter: 'blur(6px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setIsTransplantReportOpen(false)}
        >
          <div 
            className="glass-panel animate-in transplant-modal-container" 
            style={{ 
              background: '#ffffff', 
              color: '#0f172a',
              width: '100%', 
              maxWidth: '820px', 
              maxHeight: '92vh', 
              overflowY: 'auto', 
              padding: '2.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              borderRadius: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Barra superior de ações do relatório */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b no-print" style={{ borderColor: '#e2e8f0' }}>
              <div className="flex items-center gap-2">
                <Printer size={20} color="#2563eb" />
                <strong className="text-base">Laudo Médico de Encaminhamento ao Transplante Renal</strong>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={handleDownloadTransplantPdf}
                  disabled={isDownloadingTransplantPdf}
                  className="btn btn-outline"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Baixar arquivo PDF nativo com alta fidelidade"
                >
                  {isDownloadingTransplantPdf ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} color="#2563eb" />}
                  <span>{isDownloadingTransplantPdf ? 'Gerando...' : 'Baixar PDF'}</span>
                </button>
                <button 
                  type="button"
                  onClick={handlePrintTransplant}
                  className="btn btn-primary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  title="Imprimir folha A4 ou salvar via navegador"
                >
                  <Printer size={15} />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setIsTransplantReportOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '0.45rem', borderRadius: '50%' }}
                  title="Fechar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Documento Timbrado */}
            <div id="printable-transplant-report-doc" className="printable-transplant-area transplant-a4-sheet p-6 bg-white border border-slate-200 rounded-xl flex flex-col gap-5 text-sm" style={{ fontFamily: 'system-ui, sans-serif' }}>
              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-black text-blue-900 tracking-tight">NexAi-NEFRO</h1>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                    Sistema de Prontuário Eletrônico & Gestão Dialítica em Nuvem
                  </span>
                  <span className="text-xs text-slate-600">Unidade: {patient.clinica || 'Centro Nefrológico'} • Hospital: {patient.hospital || 'Hospital do Rim'}</span>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span>Data de Emissão: <strong>{new Date().toLocaleDateString('pt-BR')}</strong></span>
                  <span className="block mt-1">Status: <strong>{statusTransplante}</strong></span>
                </div>
              </div>

              {/* 1. Identificação do Paciente */}
              <div>
                <h3 className="font-bold text-xs uppercase text-slate-700 tracking-wider mb-2 border-b pb-1">
                  1. Identificação do Paciente Candidato
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div>Nome: <strong className="text-slate-900">{patient.nome}</strong></div>
                  <div>Nascimento: <strong>{patient.dataNascimento ? new Date(patient.dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</strong></div>
                  <div>Idade: <strong>{patient.idade ? `${patient.idade} anos` : '-'}</strong></div>
                  <div>Etiologia DRC: <strong>{patient.etiologiaDRC || 'Não informada'}</strong></div>
                  <div>Início Diálise: <strong>{patient.dataInicioDialise ? new Date(patient.dataInicioDialise + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}</strong></div>
                  <div>Turno Atual: <strong>{patient.turno || '3º Turno'}</strong></div>
                </div>
              </div>

              {/* 2. Parâmetros do Acesso Vascular */}
              <div>
                <h3 className="font-bold text-xs uppercase text-slate-700 tracking-wider mb-2 border-b pb-1">
                  2. Acesso Vascular & Parâmetros
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div>Tipo de Acesso: <strong>{acessoVascular.tipo || 'FAV'}</strong></div>
                  <div>Membro/Local: <strong>{acessoVascular.ladoMembro || '-'}</strong></div>
                  <div>Fluxo Sangue (Qb): <strong>{acessoVascular.fluxoSangue ? `${acessoVascular.fluxoSangue} ml/min` : '-'}</strong></div>
                  <div>Peso Seco Alvo: <strong>{patient.pesoSeco ? `${patient.pesoSeco} kg` : '-'}</strong></div>
                  <div>Último Peso Aferido: <strong>{ultimoPeso ? `${ultimoPeso} kg` : '-'}</strong></div>
                  <div>Alergias: <strong>{Array.isArray(patient.alergias) && patient.alergias.length > 0 ? patient.alergias.join(', ') : 'Nega alergias'}</strong></div>
                </div>
              </div>

              {/* 3. Perfil Laboratorial e Microbiologia Recente */}
              <div>
                <h3 className="font-bold text-xs uppercase text-slate-700 tracking-wider mb-2 border-b pb-1">
                  3. Laboratório & Microbiologia
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontSize: '0.78rem' }} className="mb-2">
                  <div>Hb: <strong>{exames.hb ? `${exames.hb} g/dL` : '-'}</strong></div>
                  <div>Ht: <strong>{exames.ht ? `${exames.ht}%` : '-'}</strong></div>
                  <div>Ferritina: <strong>{exames.ferritina ? `${exames.ferritina} ng/mL` : '-'}</strong></div>
                  <div>IST: <strong>{exames.ist ? `${exames.ist}%` : '-'}</strong></div>
                  <div>PTH: <strong>{exames.pth ? `${exames.pth} pg/mL` : '-'}</strong></div>
                  <div>Fósforo: <strong>{exames.fosforo ? `${exames.fosforo} mg/dL` : '-'}</strong></div>
                  <div>Cálcio: <strong>{exames.ca ? `${exames.ca} mg/dL` : '-'}</strong></div>
                  <div>Potássio: <strong>{exames.k ? `${exames.k} mEq/L` : '-'}</strong></div>
                  <div>Kt/V: <strong>{exames.ktv || '-'}</strong></div>
                  <div>Albumina: <strong>{exames.albumina ? `${exames.albumina} g/dL` : '-'}</strong></div>
                  <div>Creatinina: <strong>{exames.creatinina ? `${exames.creatinina} mg/dL` : '-'}</strong></div>
                  <div>PCR: <strong>{exames.pcr ? `${exames.pcr} mg/L` : '-'}</strong></div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <strong>Histórico de Hemoculturas:</strong>{' '}
                  {hemoculturas.length === 0 ? (
                    'Sem hemoculturas positivas recentes.'
                  ) : (
                    hemoculturas.map(h => `${new Date(h.dataColeta).toLocaleDateString('pt-BR')}: ${h.resultado} (${h.microrganismo || h.sitioColeta})`).join(' • ')
                  )}
                </div>
              </div>

              {/* 4. Prescrições em Uso */}
              <div>
                <h3 className="font-bold text-xs uppercase text-slate-700 tracking-wider mb-2 border-b pb-1">
                  4. Prescrições Ativas
                </h3>
                <div className="flex flex-col gap-1 text-xs">
                  {medicamentosList.filter(m => m.ativo !== false).length === 0 ? (
                    <span className="text-muted">Nenhuma medicação ativa.</span>
                  ) : (
                    medicamentosList.filter(m => m.ativo !== false).map((med, i) => (
                      <div key={i} className="flex justify-between border-b pb-1">
                        <span>• <strong>{med.nome}</strong> - {med.dosagem} ({med.via || 'Via padrão'})</span>
                        <span className="text-slate-500">{med.frequencia}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Assinatura Médica */}
              <div className="mt-8 pt-8 border-t flex justify-between items-end text-center">
                <div className="text-xs text-slate-400 text-left">
                  Prontuário autêntico emitido via Cloud Firestore<br />
                  NexAi-NEFRO Software Médico
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-56 border-b border-slate-400 mb-1" />
                  <strong className="text-sm text-slate-800">{doctorInfo?.nome || 'Médico(a) Nefrologista Responsável'}</strong>
                  <span className="text-xs text-slate-500">CRM {doctorInfo?.crm || ''}/{doctorInfo?.ufCrm || 'SP'} • RQE {doctorInfo?.rqe || 'Nefrologia'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CHECKLIST & PRONTIDÃO DE TRANSPLANTE (Melhoria 2) ================= */}
      {isChecklistModalOpen && (
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
          onClick={() => setIsChecklistModalOpen(false)}
        >
          <div 
            className="glass-panel animate-in" 
            style={{ 
              background: 'var(--surface-solid)', 
              width: '100%', 
              maxWidth: '600px', 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              borderRadius: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <CheckSquare size={22} color="#7c3aed" />
                <div>
                  <h2 className="text-base font-bold">Checklist de Prontidão Pré-Transplante Renal</h2>
                  <span className="text-xs text-muted">Exames obrigatórios preconizados pelo Sistema Nacional de Transplantes</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsChecklistModalOpen(false)} 
                className="btn btn-outline" 
                style={{ padding: '0.35rem', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex justify-between items-center">
                <span>Status Atual do Paciente:</span>
                <span className="font-bold px-2 py-1 bg-white rounded-lg border border-purple-300">
                  {statusTransplante}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  { label: "Sorologia HIV 1 e 2 (Elisa / Quimioluminescência)", validade: "Semestral" },
                  { label: "Sorologias Hepatite B (HBsAg, Anti-HBs, Anti-HBc total)", validade: "Semestral" },
                  { label: "Sorologia Hepatite C (Anti-HCV)", validade: "Semestral" },
                  { label: "Sorologia Chagas (Doença de Chagas) e HTLV I/II", validade: "Anual" },
                  { label: "Sorologia Citomegalovírus (CMV IgG e IgM)", validade: "Anual" },
                  { label: "Tipagem Sanguínea ABO e Fator Rh (Duas amostras independentes)", validade: "Definitiva" },
                  { label: "Painel Imunológico de Anticorpos Citotóxicos (PRA Classe I e II)", validade: "Trimestral" },
                  { label: "Eletrocardiograma (ECG) + Ecocardiograma Transtorácico (ECO)", validade: "Anual" },
                  { label: "Radiografia de Tórax em PA e Perfil", validade: "Anual" },
                  { label: "Ultrassonografia de Rins e Vias Urinárias", validade: "Anual" },
                  { label: "Parecer de Higiene Odontológica (Ausência de focos sépticos)", validade: "Anual" },
                  { label: "Avaliação da Equipe Psicossocial e Termo de Consentimento", validade: "Definitiva" },
                ].map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} color="#059669" />
                      <span className="font-medium text-slate-800">{item.label}</span>
                    </div>
                    <span className="text-2xs text-muted">{item.validade}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsChecklistModalOpen(false)}
                >
                  Concluir Conferência
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PROTOCOLO LOCK THERAPY (Melhoria 4) ================= */}
      {isLockTherapyModalOpen && (
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
          onClick={() => setIsLockTherapyModalOpen(false)}
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
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              borderRadius: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Bug size={20} color="#b45309" />
                <div>
                  <h2 className="text-base font-bold">Selo de Cateter (Lock Therapy)</h2>
                  <span className="text-xs text-muted">Protocolos intraluminais</span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsLockTherapyModalOpen(false)} 
                className="btn btn-outline" 
                style={{ padding: '0.35rem', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <strong>Protocolo:</strong> Infundir o volume de priming do cateter ao final da sessão. <strong>Aspirar e descartar</strong> antes da próxima diálise.
              </div>

              <div className="flex flex-col gap-2">
                <div className="p-3 rounded-xl border bg-slate-50 flex flex-col gap-1">
                  <strong className="text-slate-800 text-sm">Opção 1: Vancomicina + Heparina (Gram-positivos / MRSA)</strong>
                  <span className="text-slate-600">• Vancomicina: Concentração final 5 mg/ml</span>
                  <span className="text-slate-600">• Heparina: 5.000 UI/ml (relação 1:1)</span>
                  <span className="text-muted text-xxs">Preparo: 0,5 ml de Vancomicina (50 mg/ml) + 0,5 ml de Heparina (5.000 UI/ml) + 4 ml de SF 0,9%.</span>
                </div>

                <div className="p-3 rounded-xl border bg-slate-50 flex flex-col gap-1">
                  <strong className="text-slate-800 text-sm">Opção 2: Cefazolina + Heparina (MSSA sensível)</strong>
                  <span className="text-slate-600">• Cefazolina: Concentração final 10 mg/ml</span>
                  <span className="text-slate-600">• Heparina: 5.000 UI/ml</span>
                </div>

                <div className="p-3 rounded-xl border bg-slate-50 flex flex-col gap-1">
                  <strong className="text-slate-800 text-sm">Opção 3: Gentamicina + Heparina (Gram-negativos / Pseudomonas)</strong>
                  <span className="text-slate-600">• Gentamicina: Concentração final 1 mg/ml</span>
                  <span className="text-slate-600">• Heparina: 2.500 a 5.000 UI/ml</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsLockTherapyModalOpen(false)}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
