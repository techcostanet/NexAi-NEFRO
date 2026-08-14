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
  Loader2
} from 'lucide-react';
import { subscribeDoctorsList, saveDoctorProfile } from '../services/doctorService';
import { seedDemoPatientsToFirestore } from '../services/patientService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Modal para Nova Licença
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    nome: '',
    crm: '',
    ufCrm: 'SP',
    especialidade: 'Nefrologia Clínica e Hemodiálise',
    email: '',
    clinicaPrincipal: '',
    statusLicenca: 'Ativo'
  });

  useEffect(() => {
    const unsub = subscribeDoctorsList((list) => {
      setDoctors(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAccessDoctor = (doctor) => {
    localStorage.setItem('activeDoctorId', doctor.id);
    localStorage.setItem('userRole', 'doctor');
    navigate('/doctor');
  };

  const handleResetDemoData = async () => {
    if (window.confirm("Deseja restaurar a base de dados de demonstração no Firestore? Isso recriará os 6 pacientes clínicos com todos os exames, alertas e ciclos de medicação.")) {
      try {
        setSeeding(true);
        await seedDemoPatientsToFirestore();
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

  const handleCreateLicense = async (e) => {
    e.preventDefault();
    if (!newDoctor.nome || !newDoctor.email) return;

    try {
      const id = 'doc-' + Date.now();
      await saveDoctorProfile(id, {
        ...newDoctor,
        id,
        titulo: 'Médico(a) Nefrologista',
        criadoEm: new Date().toISOString()
      });
      setIsModalOpen(false);
      setNewDoctor({
        nome: '',
        crm: '',
        ufCrm: 'SP',
        especialidade: 'Nefrologia Clínica e Hemodiálise',
        email: '',
        clinicaPrincipal: '',
        statusLicenca: 'Ativo'
      });
      setFeedback({ type: 'success', text: 'Nova licença médica criada com sucesso!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Erro ao criar licença médica.' });
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem', maxWidth: '1050px' }}>
      {/* Cabeçalho do Admin */}
      <header className="flex justify-between items-center mt-3 mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div style={{ padding: '10px', background: 'rgba(109, 40, 217, 0.12)', borderRadius: '12px' }}>
            <Shield size={26} color="#6d28d9" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.3px' }}>Painel Super Administrador</h1>
            <p className="text-muted text-sm">Gestão de Licenças Médicas, Acessos e Base de Demonstração</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="btn btn-outline" 
            onClick={handleResetDemoData}
            disabled={seeding}
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.82rem', borderColor: '#bfdbfe', background: '#eff6ff', color: '#1d4ed8', fontWeight: '600' }}
            title="Recria os 6 pacientes de demonstração com alertas e medicamentos completos"
          >
            {seeding ? <Loader2 className="animate-spin" size={15} /> : <RotateCcw size={15} />}
            <span>{seeding ? 'Restaurando...' : 'Restaurar Base de Demonstração'}</span>
          </button>

          <button 
            className="btn btn-outline" 
            onClick={() => navigate('/login')} 
            style={{ padding: '0.55rem', borderRadius: '12px' }}
            title="Sair do painel"
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

      {/* Card Informativo com Credenciais de Acesso */}
      <div className="card-pastel-purple mb-6" style={{ padding: '1.4rem', borderRadius: '16px' }}>
        <h2 className="font-bold text-base mb-2 flex items-center gap-2" style={{ color: '#5b21b6' }}>
          <Key size={18} /> Como Acessar o Sistema e Apresentar a Clientes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
          <div className="bg-white/80 p-3 rounded-xl border border-purple-200">
            <strong className="text-sm block" style={{ color: '#6d28d9' }}>🧑‍⚕️ Médico de Demonstração (Completo)</strong>
            <div className="text-xs text-muted mt-1 leading-relaxed">
              • <strong>Email:</strong> <code>dr.marcelo@nefroapp.com</code><br/>
              • <strong>Senha:</strong> <code>123456</code><br/>
              • <em>Contém 6 pacientes completos, ciclos a vencer, alertas de diálise e todos os exames preenchidos.</em>
            </div>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-purple-200">
            <strong className="text-sm block" style={{ color: '#6d28d9' }}>🛡️ Super Administrador</strong>
            <div className="text-xs text-muted mt-1 leading-relaxed">
              • <strong>Email:</strong> <code>admin@nefroapp.com</code><br/>
              • <strong>Senha:</strong> <code>admin123</code><br/>
              • <em>Permite gerenciar licenças, impersonar qualquer médico e restaurar a base quando quiser.</em>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Médicos e Assinantes */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-bold text-lg">Contas Médicas & Licenças Ativas</h2>
            <p className="text-muted text-xs mt-0.5">Médicos cadastrados na nuvem Firestore</p>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={() => setIsModalOpen(true)}
            style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
          >
            <Plus size={15} /> Nova Licença Médica
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted">
            <Loader2 className="animate-spin mx-auto mb-2" size={28} color="var(--primary)" />
            <p className="text-sm">Carregando licenças do Firestore...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Médico / Responsável</th>
                  <th style={{ padding: '0.85rem 1rem' }}>CRM / RQE</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Clínica / Instituição</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((docItem, idx) => (
                  <tr key={docItem.id || idx} style={{ borderBottom: '1px solid #f1f5f9', background: docItem.id === 'dr-marcelo' ? 'rgba(239, 246, 255, 0.4)' : '#ffffff' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div className="flex items-center gap-2">
                        <Stethoscope size={16} color="var(--primary)" />
                        <div>
                          <strong style={{ color: '#1e293b' }}>{docItem.nome}</strong>
                          <div className="text-xs text-muted">{docItem.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      CRM {docItem.crm}/{docItem.ufCrm} {docItem.rqe ? `• RQE ${docItem.rqe}` : ''}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {docItem.clinicaPrincipal || 'Clínica NexAi'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span 
                        style={{ 
                          fontSize: '0.72rem', 
                          padding: '3px 8px', 
                          borderRadius: '10px', 
                          fontWeight: 'bold',
                          background: docItem.statusLicenca?.includes('Demonstração') ? '#dbeafe' : '#dcfce7',
                          color: docItem.statusLicenca?.includes('Demonstração') ? '#1d4ed8' : '#15803d'
                        }}
                      >
                        {docItem.statusLicenca || 'Ativo'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline" 
                        onClick={() => handleAccessDoctor(docItem)}
                        style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', background: '#ffffff', color: 'var(--primary)', fontWeight: '600' }}
                        title="Acessar como este médico para testar o sistema"
                      >
                        <ExternalLink size={13} /> Acessar Painel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Cadastro de Nova Licença */}
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
              maxWidth: '500px', 
              padding: '2rem', 
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-1">Cadastrar Nova Licença Médica</h2>
            <p className="text-xs text-muted mb-4">Adiciona um novo médico assinante no Firestore</p>

            <form onSubmit={handleCreateLicense} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold mb-1 block">Nome do Médico *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Dr. Roberto Guimarães" 
                  value={newDoctor.nome}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="text-xs font-semibold mb-1 block">CRM *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: 112233" 
                    value={newDoctor.crm}
                    onChange={(e) => setNewDoctor(prev => ({ ...prev, crm: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block">UF</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="SP" 
                    value={newDoctor.ufCrm}
                    onChange={(e) => setNewDoctor(prev => ({ ...prev, ufCrm: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Email de Acesso *</label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="roberto@clinica.com" 
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block">Clínica / Serviço</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Instituto de Diálise" 
                  value={newDoctor.clinicaPrincipal}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, clinicaPrincipal: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Cadastrar Licença
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
