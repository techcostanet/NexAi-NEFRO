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
  Sparkles
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

      {/* Alertas Médicos em Destaque (Card Rosa/Coral Pastel) */}
      {(hbBaixa || pthAlto || fosforoAlto) && (
        <div className="card-pastel-rose mb-6 animate-in" style={{ padding: '1.25rem', borderRadius: '16px' }}>
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2" style={{ color: '#b91c1c' }}>
            <AlertTriangle size={18} /> Alertas de Parâmetros Fora da Meta
          </h3>
          <div className="flex flex-col gap-1.5 text-sm" style={{ color: '#991b1b' }}>
            {hbBaixa && <div>• <strong>Hemoglobina Crítica:</strong> {exames.hb} g/dL (Meta recomendada: 10,0 a 12,0 g/dL)</div>}
            {pthAlto && <div>• <strong>PTH Elevado:</strong> {exames.pth} pg/mL (Meta recomendada: 150 a 600 pg/mL)</div>}
            {fosforoAlto && <div>• <strong>Fósforo Alto:</strong> {exames.fosforo} mg/dL (Meta recomendada: 3,5 a 5,5 mg/dL)</div>}
          </div>
        </div>
      )}

      {/* Grid Principal: Acesso Vascular (Azul Pastel) & Prescrições (Âmbar Pastel) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Acesso Vascular & Diálise (Azul Pastel) */}
        <section className="card-pastel-blue" style={{ padding: '1.4rem', borderRadius: '16px' }}>
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
              <span className="text-muted" style={{ color: '#475569' }}>Membro / Local:</span>
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

        {/* Prescrições & Medicamentos (Âmbar Pastel) */}
        <section className="card-pastel-amber" style={{ padding: '1.4rem', borderRadius: '16px' }}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-base flex items-center gap-2" style={{ color: '#b45309' }}>
              <Pill size={18} /> Prescrições & Medicamentos
            </h2>
            <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
              Ajuste Atual
            </span>
          </div>
          <ul className="text-sm flex flex-col gap-2" style={{ listStyleType: 'none', color: '#78350f' }}>
            {medicamentos.epo && (
              <li className="flex justify-between border-b pb-1.5" style={{ borderColor: 'rgba(254, 240, 138, 0.6)' }}>
                <span className="text-muted" style={{ color: '#78716c' }}>EPO:</span> 
                <strong className="font-semibold">{medicamentos.epo}</strong>
              </li>
            )}
            {medicamentos.nor && (
              <li className="flex justify-between border-b pb-1.5" style={{ borderColor: 'rgba(254, 240, 138, 0.6)' }}>
                <span className="text-muted" style={{ color: '#78716c' }}>Noripurum:</span> 
                <strong className="font-semibold">{medicamentos.nor}</strong>
              </li>
            )}
            {medicamentos.paricalcitol && (
              <li className="flex justify-between border-b pb-1.5" style={{ borderColor: 'rgba(254, 240, 138, 0.6)' }}>
                <span className="text-muted" style={{ color: '#78716c' }}>Paricalcitol:</span> 
                <strong className="font-semibold">{medicamentos.paricalcitol}</strong>
              </li>
            )}
            {medicamentos.cinacalcete && (
              <li className="flex justify-between border-b pb-1.5" style={{ borderColor: 'rgba(254, 240, 138, 0.6)' }}>
                <span className="text-muted" style={{ color: '#78716c' }}>Cinacalcete:</span> 
                <strong className="font-semibold">{medicamentos.cinacalcete}</strong>
              </li>
            )}
            {medicamentos.sevelamer && (
              <li className="flex justify-between border-b pb-1.5" style={{ borderColor: 'rgba(254, 240, 138, 0.6)' }}>
                <span className="text-muted" style={{ color: '#78716c' }}>Sevelamer:</span> 
                <strong className="font-semibold">{medicamentos.sevelamer}</strong>
              </li>
            )}
            {medicamentos.caco3 && (
              <li className="flex justify-between">
                <span className="text-muted" style={{ color: '#78716c' }}>Carbonato Cálcio:</span> 
                <strong className="font-semibold">{medicamentos.caco3}</strong>
              </li>
            )}
            
            {(!medicamentos.epo && !medicamentos.nor && !medicamentos.paricalcitol && !medicamentos.cinacalcete && !medicamentos.sevelamer && !medicamentos.caco3) && (
              <li className="text-muted text-sm italic py-2">Nenhuma medicação registrada no momento.</li>
            )}
          </ul>
        </section>
      </div>

      {/* Painel Laboratorial Mais Recente (Verde Menta Pastel) */}
      <section className="card-pastel-emerald mb-6" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: '#047857' }}>
              <Droplet size={20} color="#059669" /> Painel Laboratorial Mais Recente
            </h2>
            <p className="text-xs" style={{ color: '#065f46', marginTop: '2px' }}>
              Resultados dos últimos exames com faixas de metas clínicas
            </p>
          </div>
          <button className="btn btn-outline" onClick={handleOpenNewExam} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: 'white' }}>
            <Plus size={14} color="#047857" /> <span style={{ color: '#047857', fontWeight: '600' }}>Novo Resultado</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
          <div className="glass-panel" style={{ padding: '0.9rem', textAlign: 'center', background: hbBaixa ? 'rgba(254, 242, 242, 0.9)' : 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: hbBaixa ? '1px solid #fecaca' : '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Hemoglobina</p>
            <p className="font-bold text-lg mt-1" style={{ color: hbBaixa ? '#dc2626' : '#1e293b' }}>
              {exames.hb !== null && exames.hb !== undefined ? `${exames.hb} g/dL` : '-'}
            </p>
            <span className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>Meta: 10 - 12</span>
          </div>

          <div className="glass-panel" style={{ padding: '0.9rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">IST</p>
            <p className="font-bold text-lg mt-1" style={{ color: '#1e293b' }}>{exames.ist !== null && exames.ist !== undefined ? `${exames.ist}%` : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>Meta: &gt; 20%</span>
          </div>

          <div className="glass-panel" style={{ padding: '0.9rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Ferritina</p>
            <p className="font-bold text-lg mt-1" style={{ color: '#1e293b' }}>{exames.ferritina !== null && exames.ferritina !== undefined ? exames.ferritina : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>ng/mL</span>
          </div>

          <div className="glass-panel" style={{ padding: '0.9rem', textAlign: 'center', background: pthAlto ? 'rgba(254, 242, 242, 0.9)' : 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: pthAlto ? '1px solid #fecaca' : '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">PTH</p>
            <p className="font-bold text-lg mt-1" style={{ color: pthAlto ? '#dc2626' : '#1e293b' }}>
              {exames.pth !== null && exames.pth !== undefined ? exames.pth : '-'}
            </p>
            <span className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>pg/mL</span>
          </div>

          <div className="glass-panel" style={{ padding: '0.9rem', textAlign: 'center', background: fosforoAlto ? 'rgba(254, 242, 242, 0.9)' : 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: fosforoAlto ? '1px solid #fecaca' : '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Fósforo</p>
            <p className="font-bold text-lg mt-1" style={{ color: fosforoAlto ? '#dc2626' : '#1e293b' }}>
              {exames.fosforo !== null && exames.fosforo !== undefined ? exames.fosforo : '-'}
            </p>
            <span className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>mg/dL</span>
          </div>

          <div className="glass-panel" style={{ padding: '0.9rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Cálcio</p>
            <p className="font-bold text-lg mt-1" style={{ color: '#1e293b' }}>{exames.ca !== null && exames.ca !== undefined ? exames.ca : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>mg/dL</span>
          </div>

          <div className="glass-panel" style={{ padding: '0.9rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Vitamina D</p>
            <p className="font-bold text-lg mt-1" style={{ color: '#1e293b' }}>{exames.vitD !== null && exames.vitD !== undefined ? exames.vitD : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>ng/mL</span>
          </div>

          <div className="glass-panel" style={{ padding: '0.9rem', textAlign: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '12px', border: '1px solid rgba(187, 247, 208, 0.6)' }}>
            <p className="text-muted text-xs uppercase font-semibold">Kt/V</p>
            <p className="font-bold text-lg mt-1" style={{ color: '#1e293b' }}>{exames.ktv !== null && exames.ktv !== undefined ? exames.ktv : '-'}</p>
            <span className="text-xs text-muted" style={{ fontSize: '0.7rem' }}>Adequação</span>
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
              Lançamentos históricos organizados do mais recente para o mais antigo
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
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(245, 243, 255, 0.9)', borderBottom: '2px solid #ddd6fe' }}>
                  <th style={{ padding: '0.85rem 0.75rem', color: '#5b21b6' }}>Data</th>
                  <th style={{ padding: '0.85rem 0.75rem', color: '#5b21b6' }}>Hb</th>
                  <th style={{ padding: '0.85rem 0.75rem', color: '#5b21b6' }}>IST</th>
                  <th style={{ padding: '0.85rem 0.75rem', color: '#5b21b6' }}>Ferritina</th>
                  <th style={{ padding: '0.85rem 0.75rem', color: '#5b21b6' }}>PTH</th>
                  <th style={{ padding: '0.85rem 0.75rem', color: '#5b21b6' }}>Fósforo</th>
                  <th style={{ padding: '0.85rem 0.75rem', color: '#5b21b6' }}>Cálcio</th>
                  <th style={{ padding: '0.85rem 0.75rem', color: '#5b21b6' }}>Vit. D</th>
                  <th style={{ padding: '0.85rem 0.75rem', color: '#5b21b6', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {historicoExames.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(221, 214, 254, 0.4)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '0.8rem 0.75rem', fontWeight: '600', color: '#1e293b' }}>
                      {item.dataExame ? new Date(item.dataExame + 'T12:00:00').toLocaleDateString('pt-BR') : 'Data não inf.'}
                    </td>
                    <td style={{ padding: '0.8rem 0.75rem', color: (item.hb && item.hb < 10) ? '#dc2626' : '#1e293b', fontWeight: (item.hb && item.hb < 10) ? '700' : 'normal' }}>
                      {item.hb || '-'}
                    </td>
                    <td style={{ padding: '0.8rem 0.75rem' }}>{item.ist ? `${item.ist}%` : '-'}</td>
                    <td style={{ padding: '0.8rem 0.75rem' }}>{item.ferritina || '-'}</td>
                    <td style={{ padding: '0.8rem 0.75rem', color: (item.pth && item.pth > 600) ? '#dc2626' : '#1e293b', fontWeight: (item.pth && item.pth > 600) ? '700' : 'normal' }}>
                      {item.pth || '-'}
                    </td>
                    <td style={{ padding: '0.8rem 0.75rem' }}>{item.fosforo || '-'}</td>
                    <td style={{ padding: '0.8rem 0.75rem' }}>{item.ca || '-'}</td>
                    <td style={{ padding: '0.8rem 0.75rem' }}>{item.vitD || '-'}</td>
                    <td style={{ padding: '0.8rem 0.75rem', textAlign: 'right' }}>
                      <div className="flex justify-end gap-1.5">
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleEditExam(item, idx)}
                          style={{ padding: '0.3rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', background: 'white' }}
                          title="Editar este exame"
                        >
                          <Edit size={13} color="var(--primary)" />
                        </button>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleDeleteExam(idx)}
                          style={{ padding: '0.3rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', background: 'white' }}
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
