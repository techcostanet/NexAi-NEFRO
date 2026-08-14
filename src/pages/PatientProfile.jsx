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
  Trash2
} from 'lucide-react';
import { subscribeToPatientById, deletePatientExam } from '../services/patientService';
import PatientFormModal from '../components/PatientFormModal';
import ExamFormModal from '../components/ExamFormModal';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examToEdit, setExamToEdit] = useState(null);
  const [examIndexToEdit, setExamIndexToEdit] = useState(null);

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
  const medicamentos = patient.medicamentos || {};
  const historicoExames = Array.isArray(patient.historicoExames) ? patient.historicoExames : [];

  // Alertas Clínicos
  const hbBaixa = exames.hb !== null && exames.hb !== undefined && exames.hb < 10;
  const pthAlto = exames.pth !== null && exames.pth !== undefined && exames.pth > 600;
  const fosforoAlto = exames.fosforo !== null && exames.fosforo !== undefined && exames.fosforo > 5.5;

  return (
    <div className="container" style={{ paddingBottom: '5rem', maxWidth: '1000px' }}>
      {/* Cabeçalho do Paciente */}
      <header className="flex justify-between items-center mt-4 mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button className="btn btn-outline" onClick={() => navigate('/doctor')} style={{ padding: '0.5rem' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{patient.nome}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-sm text-muted">
              <span>{patient.clinica || 'Clínica NexAi'}</span>
              <span>•</span>
              <span className="font-semibold text-primary" style={{ color: 'var(--primary)' }}>{patient.turno}</span>
              {patient.idade ? <span>• {patient.idade} anos</span> : ''}
              {patient.dataNascimento ? <span>(Nasc: {new Date(patient.dataNascimento + 'T12:00:00').toLocaleDateString('pt-BR')})</span> : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="btn btn-outline" 
            onClick={() => setIsPatientModalOpen(true)}
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
          >
            <Edit size={16} color="var(--primary)" />
            <span>Editar Cadastro</span>
          </button>

          <button 
            className="btn btn-primary" 
            onClick={handleOpenNewExam}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Lançar Exame</span>
          </button>
        </div>
      </header>

      {/* Alertas Médicos em Destaque */}
      {(hbBaixa || pthAlto || fosforoAlto) && (
        <div className="glass-panel mb-6 animate-in" style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.25)' }}>
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{ color: 'var(--danger)' }}>
            <AlertTriangle size={18} /> Alertas de Parâmetros Fora da Meta
          </h3>
          <div className="flex flex-col gap-1.5 text-sm" style={{ color: 'var(--danger)' }}>
            {hbBaixa && <div>• <strong>Hemoglobina Crítica:</strong> {exames.hb} g/dL (Meta recomendada: 10,0 a 12,0 g/dL)</div>}
            {pthAlto && <div>• <strong>PTH Elevado:</strong> {exames.pth} pg/mL (Meta recomendada: 150 a 600 pg/mL)</div>}
            {fosforoAlto && <div>• <strong>Fósforo Alto:</strong> {exames.fosforo} mg/dL (Meta recomendada: 3,5 a 5,5 mg/dL)</div>}
          </div>
        </div>
      )}

      {/* Grid Principal: Acesso Vascular & Resumo Atual */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Acesso Vascular */}
        <section className="glass-panel" style={{ padding: '1.25rem' }}>
          <h2 className="font-semibold text-base mb-3 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
            <Activity size={18} /> Acesso Vascular & Diálise
          </h2>
          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted">Tipo de Acesso:</span>
              <span className="font-semibold">{acessoVascular.tipo || 'Não informado'}</span>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted">Membro / Local:</span>
              <span className="font-semibold">{acessoVascular.ladoMembro || '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted">Fluxo de Sangue (Qb):</span>
              <span className="font-semibold">{acessoVascular.fluxoSangue ? `${acessoVascular.fluxoSangue} ml/min` : '-'}</span>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted">Fluxo Dialisato (Qd):</span>
              <span className="font-semibold">{acessoVascular.fluxoDialisato ? `${acessoVascular.fluxoDialisato} ml/min` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Calibre Agulha:</span>
              <span className="font-semibold">{acessoVascular.agulha || '-'}</span>
            </div>
          </div>
        </section>

        {/* Medicações Atuais */}
        <section className="glass-panel" style={{ padding: '1.25rem' }}>
          <h2 className="font-semibold text-base mb-3 flex items-center gap-2" style={{ color: 'var(--warning)' }}>
            <Pill size={18} /> Prescrições & Medicamentos
          </h2>
          <ul className="text-sm flex flex-col gap-2" style={{ listStyleType: 'none' }}>
            {medicamentos.epo && <li className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}><span className="text-muted">EPO:</span> <strong className="font-semibold">{medicamentos.epo}</strong></li>}
            {medicamentos.nor && <li className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}><span className="text-muted">Noripurum:</span> <strong className="font-semibold">{medicamentos.nor}</strong></li>}
            {medicamentos.paricalcitol && <li className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}><span className="text-muted">Paricalcitol:</span> <strong className="font-semibold">{medicamentos.paricalcitol}</strong></li>}
            {medicamentos.cinacalcete && <li className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}><span className="text-muted">Cinacalcete:</span> <strong className="font-semibold">{medicamentos.cinacalcete}</strong></li>}
            {medicamentos.sevelamer && <li className="flex justify-between border-b pb-1.5" style={{ borderColor: 'var(--border)' }}><span className="text-muted">Sevelamer:</span> <strong className="font-semibold">{medicamentos.sevelamer}</strong></li>}
            {medicamentos.caco3 && <li className="flex justify-between"><span className="text-muted">Carbonato Cálcio:</span> <strong className="font-semibold">{medicamentos.caco3}</strong></li>}
            
            {(!medicamentos.epo && !medicamentos.nor && !medicamentos.paricalcitol && !medicamentos.cinacalcete && !medicamentos.sevelamer && !medicamentos.caco3) && (
              <li className="text-muted text-sm italic py-2">Nenhuma medicação registrada no momento.</li>
            )}
          </ul>
        </section>
      </div>

      {/* Resultados dos Últimos Exames */}
      <section className="glass-panel mb-6" style={{ padding: '1.5rem' }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Droplet size={20} style={{ color: 'var(--secondary)' }} /> Painel Laboratorial Mais Recente
          </h2>
          <button className="btn btn-outline" onClick={handleOpenNewExam} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            <Plus size={14} /> Novo Resultado
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: hbBaixa ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.5)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Hemoglobina</p>
            <p className="font-bold text-lg mt-1" style={{ color: hbBaixa ? 'var(--danger)' : 'var(--text-main)' }}>
              {exames.hb !== null && exames.hb !== undefined ? `${exames.hb} g/dL` : '-'}
            </p>
            <span className="text-xs text-muted">Meta: 10 - 12</span>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.5)' }}>
            <p className="text-muted text-xs uppercase font-semibold">IST</p>
            <p className="font-bold text-lg mt-1">{exames.ist !== null && exames.ist !== undefined ? `${exames.ist}%` : '-'}</p>
            <span className="text-xs text-muted">Meta: &gt; 20%</span>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.5)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Ferritina</p>
            <p className="font-bold text-lg mt-1">{exames.ferritina !== null && exames.ferritina !== undefined ? exames.ferritina : '-'}</p>
            <span className="text-xs text-muted">ng/mL</span>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: pthAlto ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.5)' }}>
            <p className="text-muted text-xs uppercase font-semibold">PTH</p>
            <p className="font-bold text-lg mt-1" style={{ color: pthAlto ? 'var(--danger)' : 'var(--text-main)' }}>
              {exames.pth !== null && exames.pth !== undefined ? exames.pth : '-'}
            </p>
            <span className="text-xs text-muted">pg/mL</span>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: fosforoAlto ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.5)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Fósforo</p>
            <p className="font-bold text-lg mt-1" style={{ color: fosforoAlto ? 'var(--danger)' : 'var(--text-main)' }}>
              {exames.fosforo !== null && exames.fosforo !== undefined ? exames.fosforo : '-'}
            </p>
            <span className="text-xs text-muted">mg/dL</span>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.5)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Cálcio</p>
            <p className="font-bold text-lg mt-1">{exames.ca !== null && exames.ca !== undefined ? exames.ca : '-'}</p>
            <span className="text-xs text-muted">mg/dL</span>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.5)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Vitamina D</p>
            <p className="font-bold text-lg mt-1">{exames.vitD !== null && exames.vitD !== undefined ? exames.vitD : '-'}</p>
            <span className="text-xs text-muted">ng/mL</span>
          </div>

          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.5)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Kt/V</p>
            <p className="font-bold text-lg mt-1">{exames.ktv !== null && exames.ktv !== undefined ? exames.ktv : '-'}</p>
            <span className="text-xs text-muted">Adequação</span>
          </div>
        </div>
      </section>

      {/* Histórico Completo de Exames com Data e Ações */}
      <section className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Calendar size={20} color="var(--primary)" /> Histórico Cronológico de Exames
            </h2>
            <p className="text-muted text-xs mt-0.5">Todos os lançamentos laboratoriais registrados para este paciente</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenNewExam} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Data</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Hb</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>IST</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Ferritina</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>PTH</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Fósforo</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Cálcio</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Vit. D</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {historicoExames.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600' }}>
                      {item.dataExame ? new Date(item.dataExame + 'T12:00:00').toLocaleDateString('pt-BR') : 'Data não inf.'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: (item.hb && item.hb < 10) ? 'var(--danger)' : 'inherit', fontWeight: (item.hb && item.hb < 10) ? '700' : 'normal' }}>
                      {item.hb || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{item.ist ? `${item.ist}%` : '-'}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{item.ferritina || '-'}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: (item.pth && item.pth > 600) ? 'var(--danger)' : 'inherit', fontWeight: (item.pth && item.pth > 600) ? '700' : 'normal' }}>
                      {item.pth || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{item.fosforo || '-'}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{item.ca || '-'}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>{item.vitD || '-'}</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                      <div className="flex justify-end gap-1">
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleEditExam(item, idx)}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}
                          title="Editar este exame"
                        >
                          <Edit size={13} color="var(--primary)" />
                        </button>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleDeleteExam(idx)}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem' }}
                          title="Excluir este registro"
                        >
                          <Trash2 size={13} color="var(--danger)" />
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
    </div>
  );
}
