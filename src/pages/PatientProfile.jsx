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
  Building, 
  User, 
  Clock, 
  Loader2, 
  FileText, 
  CheckCircle2,
  Trash2,
  Sparkles,
  AlertCircle,
  Check,
  RotateCcw,
  Tag,
  Filter,
  HeartPulse,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { 
  subscribeToPatientById, 
  deletePatientExam,
  deletePatientMedication,
  toggleMedicationStatus
} from '../services/patientService';
import { normalizeMedicamentosList, getMedicationStatus } from '../data/dialysisMedications';
import PatientFormModal from '../components/PatientFormModal';
import ExamFormModal from '../components/ExamFormModal';
import MedicationModal from '../components/MedicationModal';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState(null);
  const [examIndexToEdit, setExamIndexToEdit] = useState(null);

  // Estados para Gestão de Medicamentos
  const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
  const [medicationToEdit, setMedicationToEdit] = useState(null);
  const [medFilter, setMedFilter] = useState('todos'); // 'todos' | 'continuo' | 'temporario' | 'alerta'

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPatientById(id, (data) => {
      setPatient(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

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

  // Funções de Ação para Medicamentos
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

  if (loading) {
    return (
      <div className="container flex items-center justify-center h-screen flex-col gap-4">
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        <p className="text-muted">Carregando dados do paciente...</p>
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

  // Alertas Clínicos Críticos Laboratoriais
  const hbBaixa = exames.hb !== null && exames.hb !== undefined && exames.hb < 10;
  const pthAlto = exames.pth !== null && exames.pth !== undefined && exames.pth > 600;
  const fosforoAlto = exames.fosforo !== null && exames.fosforo !== undefined && exames.fosforo > 5.5;
  const kAlto = exames.k !== null && exames.k !== undefined && exames.k > 5.5;
  const albuminaBaixa = exames.albumina !== null && exames.albumina !== undefined && exames.albumina < 3.8;
  const hco3Baixo = exames.hco3 !== null && exames.hco3 !== undefined && exames.hco3 < 22;

  const hasLabAlerts = hbBaixa || pthAlto || fosforoAlto || kAlto || albuminaBaixa || hco3Baixo;

  // Alertas de Medicamentos (Ciclos a vencer ou vencidos)
  const medAlerts = medicamentosList.filter(m => {
    if (!m.ativo) return false;
    const st = getMedicationStatus(m);
    return st.status === 'expirando' || st.status === 'expirado';
  });

  // Filtragem de Medicamentos na UI
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
    <div className="container" style={{ paddingBottom: '5rem', maxWidth: '1050px' }}>
      {/* Cabeçalho do Paciente com Espaçamento Amplo e Respiro Visual */}
      <header className="flex justify-between items-center mt-3 mb-6 flex-wrap gap-4" style={{ paddingBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
            title="Voltar para a lista de pacientes"
          >
            <ArrowLeft size={20} color="var(--primary)" />
          </button>
          
          <div>
            <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.3px', lineHeight: '1.2' }}>
              {patient.nome}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap text-sm text-muted">
              <span>{patient.clinica || 'Clínica Nefrológica NexAi'}</span>
              <span>•</span>
              <span className="font-semibold" style={{ color: 'var(--primary)' }}>{patient.turno}</span>
              {patient.idade ? <span>• {patient.idade} anos</span> : ''}
              {patient.dataNascimento ? <span>(Nasc: {new Date(patient.dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR')})</span> : ''}
              <span 
                style={{ 
                  fontSize: '0.72rem', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  background: 'rgba(16, 185, 129, 0.12)', 
                  color: '#059669', 
                  fontWeight: '600',
                  marginLeft: '4px'
                }}
              >
                {patient.status || 'Ativo'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="btn btn-outline" 
            onClick={() => setIsPatientModalOpen(true)}
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Edit size={16} color="var(--primary)" />
            <span>Editar Cadastro</span>
          </button>

          <button 
            className="btn btn-primary" 
            onClick={handleOpenNewExam}
            style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={16} />
            <span>Lançar Exame</span>
          </button>
        </div>
      </header>

      {/* Alertas Médicos de Parâmetros Fora da Meta */}
      {hasLabAlerts && (
        <div className="card-pastel-rose mb-4 animate-in" style={{ padding: '1.25rem', borderRadius: '16px' }}>
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{ color: '#b91c1c' }}>
            <AlertTriangle size={18} /> Alertas de Parâmetros Laboratoriais Críticos
          </h3>
          <div className="flex flex-col gap-1 text-sm" style={{ color: '#991b1b' }}>
            {hbBaixa && <div>• <strong>Hemoglobina Baixa:</strong> {exames.hb} g/dL (Meta: 10,0 a 12,0 g/dL)</div>}
            {pthAlto && <div>• <strong>PTH Elevado:</strong> {exames.pth} pg/mL (Meta: 150 a 600 pg/mL)</div>}
            {fosforoAlto && <div>• <strong>Fósforo Alto:</strong> {exames.fosforo} mg/dL (Meta: 3,5 a 5,5 mg/dL)</div>}
            {kAlto && <div>• <strong>Hipercalemia (Potássio Elevado):</strong> {exames.k} mEq/L (Meta: 3,5 a 5,5 mEq/L)</div>}
            {albuminaBaixa && <div>• <strong>Hipoalbuminemia (Desnutrição):</strong> {exames.albumina} g/dL (Meta: &ge; 3,8 g/dL)</div>}
            {hco3Baixo && <div>• <strong>Acidose Metabólica (Bicarbonato Baixo):</strong> {exames.hco3} mEq/L (Meta: 22 a 26 mEq/L)</div>}
          </div>
        </div>
      )}

      {/* Alerta de Medicamentos a Vencer ou Ciclos Encerrados */}
      {medAlerts.length > 0 && (
        <div className="card-pastel-amber mb-6 animate-in" style={{ padding: '1.25rem', borderRadius: '16px' }}>
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#92400e' }}>
              <Clock size={18} /> Alertas de Prescrições
            </h3>
            <span style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '12px', background: '#fef3c7', color: '#92400e', fontWeight: 'bold' }}>
              {medAlerts.length} {medAlerts.length === 1 ? 'pendência' : 'pendências'}
            </span>
          </div>
          <div className="flex flex-col gap-2 text-sm" style={{ color: '#78350f' }}>
            {medAlerts.map((m, idx) => {
              const st = getMedicationStatus(m);
              return (
                <div key={idx} className="flex justify-between items-center bg-white/70 p-2.5 rounded-xl flex-wrap gap-2">
                  <div>
                    <strong>{m.nome}</strong> ({m.dosagem} • {m.via})
                    <div style={{ fontSize: '0.75rem', color: '#854d0e', marginTop: '2px' }}>
                      {st.label} • Término: {m.dataFim ? new Date(m.dataFim + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="btn btn-outline" 
                      onClick={() => handleEditMedication(m)}
                      style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', background: '#ffffff', borderColor: '#fde68a', color: '#b45309' }}
                    >
                      Renovar Prescrição
                    </button>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => handleToggleMedicationActive(m)}
                      style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', background: '#ffffff', borderColor: '#fde68a', color: '#64748b' }}
                    >
                      Encerrar Ciclo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid Principal: Acesso Vascular (Azul Pastel) & Prescrições (Âmbar Pastel) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        {/* Acesso Vascular & Diálise (Azul Pastel) */}
        <section className="card-pastel-blue" style={{ padding: '1.4rem', borderRadius: '16px', height: 'fit-content' }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-base flex items-center gap-2" style={{ color: '#1d4ed8' }}>
              <Activity size={18} /> Acesso Vascular & Diálise
            </h2>
            <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
              Parâmetros
            </span>
          </div>
          <div className="flex flex-col gap-2.5 text-sm" style={{ color: '#1e3a8a' }}>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'rgba(191, 219, 254, 0.6)' }}>
              <span className="text-muted" style={{ color: '#475569' }}>Tipo de Acesso:</span>
              <strong className="font-semibold">{acessoVascular.tipo || 'Não informado'}</strong>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'rgba(191, 219, 254, 0.6)' }}>
              <span className="text-muted" style={{ color: '#475569' }}>Localização:</span>
              <strong className="font-semibold">{acessoVascular.ladoMembro || '-'}</strong>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'rgba(191, 219, 254, 0.6)' }}>
              <span className="text-muted" style={{ color: '#475569' }}>Fluxo de Sangue (Qb):</span>
              <strong className="font-semibold">{acessoVascular.fluxoSangue ? `${acessoVascular.fluxoSangue} ml/min` : '-'}</strong>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'rgba(191, 219, 254, 0.6)' }}>
              <span className="text-muted" style={{ color: '#475569' }}>Fluxo Dialisato (Qd):</span>
              <strong className="font-semibold">{acessoVascular.fluxoDialisato ? `${acessoVascular.fluxoDialisato} ml/min` : '-'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted" style={{ color: '#475569' }}>Calibre da Agulha:</span>
              <strong className="font-semibold">{acessoVascular.agulha || '-'}</strong>
            </div>
          </div>
        </section>

        {/* Prescrições & Medicamentos (Âmbar Pastel com Gestor Dinâmico) */}
        <section className="card-pastel-amber" style={{ padding: '1.4rem', borderRadius: '16px' }}>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <div>
              <h2 className="font-bold text-base flex items-center gap-2" style={{ color: '#b45309' }}>
                <Pill size={18} /> Prescrições & Medicamentos
              </h2>
              <p className="text-xs" style={{ color: '#92400e', marginTop: '2px' }}>
                Controle contínuo e ciclos com data de término
              </p>
            </div>
            
            <button 
              className="btn btn-primary" 
              onClick={handleOpenNewMedication}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: '#d97706' }}
            >
              <Plus size={14} /> Prescrever
            </button>
          </div>

          {/* Filtros rápidos de medicamentos */}
          {medicamentosList.length > 0 && (
            <div className="flex gap-1.5 mb-3 flex-wrap" style={{ fontSize: '0.72rem' }}>
              <button
                onClick={() => setMedFilter('todos')}
                style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: medFilter === 'todos' ? '#b45309' : '#fde68a',
                  background: medFilter === 'todos' ? '#d97706' : '#ffffff',
                  color: medFilter === 'todos' ? '#ffffff' : '#78350f',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Todos ({medicamentosList.length})
              </button>
              <button
                onClick={() => setMedFilter('continuo')}
                style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: medFilter === 'continuo' ? '#059669' : '#fde68a',
                  background: medFilter === 'continuo' ? '#059669' : '#ffffff',
                  color: medFilter === 'continuo' ? '#ffffff' : '#78350f',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Contínuos ({medicamentosList.filter(m => m.tipo === 'continuo' && m.ativo !== false).length})
              </button>
              <button
                onClick={() => setMedFilter('temporario')}
                style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: medFilter === 'temporario' ? '#2563eb' : '#fde68a',
                  background: medFilter === 'temporario' ? '#2563eb' : '#ffffff',
                  color: medFilter === 'temporario' ? '#ffffff' : '#78350f',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Ciclos com Prazo ({medicamentosList.filter(m => m.tipo === 'temporario' && m.ativo !== false).length})
              </button>
              {medAlerts.length > 0 && (
                <button
                  onClick={() => setMedFilter('alerta')}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: medFilter === 'alerta' ? '#dc2626' : '#fde68a',
                    background: medFilter === 'alerta' ? '#dc2626' : '#ffffff',
                    color: medFilter === 'alerta' ? '#ffffff' : '#dc2626',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ⚠️ Alertas ({medAlerts.length})
                </button>
              )}
            </div>
          )}

          {/* Lista de Medicamentos */}
          <div className="flex flex-col gap-2.5" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '2px' }}>
            {filteredMedicamentos.length === 0 ? (
              <div className="text-center py-6 text-muted bg-white/50 rounded-xl">
                <Pill size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                <p className="text-sm">Nenhum medicamento encontrado para este filtro.</p>
                <button 
                  className="btn btn-outline mt-2" 
                  onClick={handleOpenNewMedication}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem', background: '#ffffff' }}
                >
                  Prescrever Medicamento
                </button>
              </div>
            ) : (
              filteredMedicamentos.map((med, idx) => {
                const st = getMedicationStatus(med);
                return (
                  <div 
                    key={med.id || idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.88)',
                      borderRadius: '12px',
                      padding: '0.85rem',
                      border: `1px solid ${st.borderColor}`,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      opacity: med.ativo === false ? 0.65 : 1
                    }}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1.5 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>
                            {med.nome}
                          </strong>
                          {med.categoria && (
                            <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}>
                              {med.categoria}
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-semibold mt-0.5" style={{ color: '#b45309' }}>
                          {med.dosagem} {med.via ? `• ${med.via}` : ''} {med.frequencia ? `• ${med.frequencia}` : ''}
                        </div>
                      </div>

                      {/* Badge de Status Semafórico */}
                      <span 
                        style={{ 
                          fontSize: '0.72rem', 
                          padding: '3px 8px', 
                          borderRadius: '8px', 
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

                    {/* Datas de Vigência e Observações */}
                    <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t flex-wrap gap-2" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                      <div style={{ color: '#64748b' }}>
                        {med.tipo === 'temporario' && med.dataFim ? (
                          <span>
                            Período: <strong>{new Date(med.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR')}</strong> até <strong>{new Date(med.dataFim + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>
                          </span>
                        ) : (
                          <span>Início: {med.dataInicio ? new Date(med.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR') : 'Uso contínuo'}</span>
                        )}
                        {med.observacao && (
                          <div style={{ fontStyle: 'italic', color: '#78716c', marginTop: '2px' }}>
                            Obs: {med.observacao}
                          </div>
                        )}
                      </div>

                      {/* Ações de Edição e Exclusão */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleToggleMedicationActive(med)}
                          style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem', background: '#ffffff' }}
                          title={med.ativo ? "Suspender medicação" : "Reativar medicação"}
                        >
                          <RotateCcw size={12} color="var(--primary)" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleEditMedication(med)}
                          style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem', background: '#ffffff' }}
                          title="Editar prescrição"
                        >
                          <Edit size={12} color="var(--primary)" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleDeleteMedication(med.id)}
                          style={{ padding: '0.25rem 0.45rem', fontSize: '0.7rem', background: '#ffffff' }}
                          title="Excluir medicação"
                        >
                          <Trash2 size={12} color="var(--danger)" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Painel Laboratorial Mais Recente (Verde Menta Pastel com Categorias Completas) */}
      <section className="card-pastel-emerald mb-6" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: '#047857' }}>
              <Droplet size={20} color="#059669" /> Painel Laboratorial Mais Recente
            </h2>
            <p className="text-xs" style={{ color: '#065f46', marginTop: '2px' }}>
              Resultados completos dos últimos exames com metas clínicas nefrológicas
            </p>
          </div>
          <button className="btn btn-outline" onClick={handleOpenNewExam} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: 'white' }}>
            <Plus size={14} color="#047857" /> <span style={{ color: '#047857', fontWeight: '600' }}>Novo Resultado</span>
          </button>
        </div>

        {/* Grade de Indicadores Laboratoriais */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
          
          {/* Hemoglobina */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: hbBaixa ? 'rgba(254, 242, 242, 0.95)' : 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: hbBaixa ? '1px solid #fecaca' : '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Hemoglobina</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: hbBaixa ? '#dc2626' : '#1e293b' }}>
              {exames.hb !== null && exames.hb !== undefined ? `${exames.hb} g/dL` : '-'}
            </p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 10 - 12</span>
          </div>

          {/* Hematócrito */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Hematócrito</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: '#1e293b' }}>{exames.ht !== null && exames.ht !== undefined ? `${exames.ht}%` : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 30 - 36%</span>
          </div>

          {/* IST */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">IST</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: '#1e293b' }}>{exames.ist !== null && exames.ist !== undefined ? `${exames.ist}%` : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: &gt; 20%</span>
          </div>

          {/* Ferritina */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Ferritina</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: '#1e293b' }}>{exames.ferritina !== null && exames.ferritina !== undefined ? exames.ferritina : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>ng/mL</span>
          </div>

          {/* PTH */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: pthAlto ? 'rgba(254, 242, 242, 0.95)' : 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: pthAlto ? '1px solid #fecaca' : '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">PTH Intacto</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: pthAlto ? '#dc2626' : '#1e293b' }}>
              {exames.pth !== null && exames.pth !== undefined ? exames.pth : '-'}
            </p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 150 - 600</span>
          </div>

          {/* Fósforo */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: fosforoAlto ? 'rgba(254, 242, 242, 0.95)' : 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: fosforoAlto ? '1px solid #fecaca' : '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Fósforo</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: fosforoAlto ? '#dc2626' : '#1e293b' }}>
              {exames.fosforo !== null && exames.fosforo !== undefined ? exames.fosforo : '-'}
            </p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 3.5 - 5.5</span>
          </div>

          {/* Cálcio */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Cálcio</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: '#1e293b' }}>{exames.ca !== null && exames.ca !== undefined ? exames.ca : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>mg/dL</span>
          </div>

          {/* Vitamina D */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Vitamina D</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: '#1e293b' }}>{exames.vitD !== null && exames.vitD !== undefined ? exames.vitD : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>ng/mL</span>
          </div>

          {/* Fosfatase Alcalina */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Fosf. Alcalina</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: '#1e293b' }}>{exames.fa !== null && exames.fa !== undefined ? exames.fa : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>U/L</span>
          </div>

          {/* Potássio */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: kAlto ? 'rgba(254, 242, 242, 0.95)' : 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: kAlto ? '1px solid #fecaca' : '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Potássio (K⁺)</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: kAlto ? '#dc2626' : '#1e293b' }}>
              {exames.k !== null && exames.k !== undefined ? exames.k : '-'}
            </p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 3.5 - 5.5</span>
          </div>

          {/* Sódio */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Sódio (Na⁺)</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: '#1e293b' }}>{exames.na !== null && exames.na !== undefined ? exames.na : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>mEq/L</span>
          </div>

          {/* Bicarbonato */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: hco3Baixo ? 'rgba(254, 242, 242, 0.95)' : 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: hco3Baixo ? '1px solid #fecaca' : '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Bicarbonato</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: hco3Baixo ? '#dc2626' : '#1e293b' }}>
              {exames.hco3 !== null && exames.hco3 !== undefined ? exames.hco3 : '-'}
            </p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 22 - 26</span>
          </div>

          {/* Kt/V */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Kt/V</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: '#1e293b' }}>{exames.ktv !== null && exames.ktv !== undefined ? exames.ktv : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: &ge; 1.2</span>
          </div>

          {/* Albumina */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: albuminaBaixa ? 'rgba(254, 242, 242, 0.95)' : 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: albuminaBaixa ? '1px solid #fecaca' : '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Albumina</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: albuminaBaixa ? '#dc2626' : '#1e293b' }}>
              {exames.albumina !== null && exames.albumina !== undefined ? `${exames.albumina} g/dL` : '-'}
            </p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: &ge; 3.8</span>
          </div>

          {/* PCR */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">PCR</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: '#1e293b' }}>{exames.pcr !== null && exames.pcr !== undefined ? `${exames.pcr} mg/L` : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: &lt; 5.0</span>
          </div>

          {/* Creatinina */}
          <div className="glass-panel" style={{ padding: '0.85rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Creatinina</p>
            <p className="font-bold text-lg mt-0.5" style={{ color: '#1e293b' }}>{exames.creatinina !== null && exames.creatinina !== undefined ? exames.creatinina : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>mg/dL</span>
          </div>
        </div>
      </section>

      {/* Histórico Cronológico de Exames (Lavanda / Roxo Pastel) */}
      <section className="card-pastel-purple" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: '#6d28d9' }}>
              <Calendar size={20} color="#7c3aed" /> Histórico Cronológico de Exames
            </h2>
            <p className="text-xs" style={{ color: '#5b21b6', marginTop: '2px' }}>
              Lançamentos históricos com perfil laboratorial completo
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenNewExam} style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', background: '#7c3aed' }}>
            <Plus size={14} /> Adicionar Coleta
          </button>
        </div>

        {historicoExames.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <FileText size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p className="text-sm">Nenhum exame histórico detalhado registrado.</p>
            <button className="btn btn-outline mt-3" onClick={handleOpenNewExam} style={{ fontSize: '0.85rem' }}>
              Lançar Primeiro Exame
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '12px', border: '1px solid rgba(221, 214, 254, 0.7)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left', minWidth: '780px' }}>
              <thead>
                <tr style={{ background: 'rgba(245, 243, 255, 0.9)', borderBottom: '2px solid #ddd6fe' }}>
                  <th style={{ padding: '0.75rem 0.6rem', color: '#5b21b6' }}>Data</th>
                  <th style={{ padding: '0.75rem 0.6rem', color: '#5b21b6' }}>Hb (g/dL)</th>
                  <th style={{ padding: '0.75rem 0.6rem', color: '#5b21b6' }}>IST / Ferr</th>
                  <th style={{ padding: '0.75rem 0.6rem', color: '#5b21b6' }}>PTH (pg/mL)</th>
                  <th style={{ padding: '0.75rem 0.6rem', color: '#5b21b6' }}>P / Ca</th>
                  <th style={{ padding: '0.75rem 0.6rem', color: '#5b21b6' }}>K⁺ / HCO₃⁻</th>
                  <th style={{ padding: '0.75rem 0.6rem', color: '#5b21b6' }}>Kt/V</th>
                  <th style={{ padding: '0.75rem 0.6rem', color: '#5b21b6' }}>Albumina</th>
                  <th style={{ padding: '0.75rem 0.6rem', color: '#5b21b6' }}>PCR</th>
                  <th style={{ padding: '0.75rem 0.6rem', color: '#5b21b6', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {historicoExames.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(221, 214, 254, 0.4)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '0.75rem 0.6rem', fontWeight: '600', color: '#1e293b' }}>
                      {item.dataExame ? new Date(item.dataExame + 'T12:00:00').toLocaleDateString('pt-BR') : 'Data não inf.'}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', color: (item.hb && item.hb < 10) ? '#dc2626' : '#1e293b', fontWeight: (item.hb && item.hb < 10) ? '700' : 'normal' }}>
                      {item.hb ? `${item.hb}` : '-'} {item.ht ? `(${item.ht}%)` : ''}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      {item.ist ? `${item.ist}%` : '-'} / {item.ferritina || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', color: (item.pth && item.pth > 600) ? '#dc2626' : '#1e293b', fontWeight: (item.pth && item.pth > 600) ? '700' : 'normal' }}>
                      {item.pth || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      {item.fosforo || '-'} / {item.ca || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', color: (item.k && item.k > 5.5) ? '#dc2626' : '#1e293b', fontWeight: (item.k && item.k > 5.5) ? '700' : 'normal' }}>
                      {item.k || '-'} / {item.hco3 || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem' }}>{item.ktv || '-'}</td>
                    <td style={{ padding: '0.75rem 0.6rem', color: (item.albumina && item.albumina < 3.8) ? '#dc2626' : '#1e293b', fontWeight: (item.albumina && item.albumina < 3.8) ? '700' : 'normal' }}>
                      {item.albumina ? `${item.albumina} g/dL` : '-'}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem' }}>{item.pcr ? `${item.pcr}` : '-'}</td>
                    <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>
                      <div className="flex justify-end gap-1.5">
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleEditExam(item, idx)}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', background: 'white' }}
                          title="Editar este exame"
                        >
                          <Edit size={12} color="var(--primary)" />
                        </button>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleDeleteExam(idx)}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', background: 'white' }}
                          title="Excluir este registro"
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
      </section>

      {/* Modais */}
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
    </div>
  );
}
