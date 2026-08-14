import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, User, UserPlus, Filter, UserCog, Edit, ChevronRight, Activity, Calendar } from 'lucide-react';
import { subscribeToPatients } from '../services/patientService';
import { subscribeDoctorProfile } from '../services/doctorService';
import PatientFormModal from '../components/PatientFormModal';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState({ nome: 'Dra. Gisele', crm: '123456', ufCrm: 'SP' });
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurno, setFilterTurno] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);

  useEffect(() => {
    const unsubDoc = subscribeDoctorProfile('dra-gisele', (data) => {
      if (data) setDoctor(data);
    });

    const unsubPatients = subscribeToPatients((data) => {
      setPatients(data);
    });

    return () => {
      unsubDoc();
      unsubPatients();
    };
  }, []);

  const handleOpenNewPatient = () => {
    setPatientToEdit(null);
    setIsPatientModalOpen(true);
  };

  const handleEditPatient = (e, patient) => {
    e.stopPropagation();
    setPatientToEdit(patient);
    setIsPatientModalOpen(true);
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = (p.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.clinica || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurno = filterTurno === 'Todos' || p.turno === filterTurno;
    const matchesStatus = filterStatus === 'Todos' || (p.status || 'Ativo') === filterStatus;
    return matchesSearch && matchesTurno && matchesStatus;
  });

  const getStatusColor = (status = 'Ativo') => {
    switch (status) {
      case 'Ativo':
      case 'Em Tratamento':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: 'rgba(16, 185, 129, 0.25)' };
      case 'Internado':
        return { bg: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', border: 'rgba(239, 68, 68, 0.25)' };
      case 'Transferido':
      case 'Transplante':
        return { bg: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', border: 'rgba(37, 99, 235, 0.25)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', color: '#475569', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      {/* Cabeçalho do Médico */}
      <header className="flex justify-between items-center mt-4 mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold">Olá, {doctor.nome || 'Doutor(a)'}</h1>
          <p className="text-muted text-sm mt-0.5">
            {doctor.especialidade || 'Gestão Nefrológica'} • CRM {doctor.crm || '---'}/{doctor.ufCrm || 'UF'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="btn btn-outline" 
            onClick={() => navigate('/doctor/profile')}
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Ver e editar dados cadastrais do médico"
          >
            <UserCog size={16} color="var(--primary)" />
            <span>Dados do Médico</span>
          </button>

          <button 
            className="btn btn-primary" 
            onClick={handleOpenNewPatient}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={16} />
            <span>Novo Paciente</span>
          </button>

          <button 
            className="btn btn-outline" 
            onClick={() => navigate('/login')} 
            style={{ padding: '0.5rem' }}
            title="Sair do sistema"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Painel de Filtros e Busca */}
      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar por nome ou clínica..." 
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select 
            className="input-field" 
            style={{ width: 'auto', flex: '0 0 auto' }}
            value={filterTurno}
            onChange={(e) => setFilterTurno(e.target.value)}
          >
            <option value="Todos">Todos os Turnos</option>
            <option value="1º Turno">1º Turno</option>
            <option value="2º Turno">2º Turno</option>
            <option value="3º Turno">3º Turno</option>
            <option value="4º Turno">4º Turno</option>
            <option value="Diálise Peritoneal">Diálise Peritoneal</option>
          </select>

          <select 
            className="input-field" 
            style={{ width: 'auto', flex: '0 0 auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Todos">Todos os Status</option>
            <option value="Ativo">Ativos</option>
            <option value="Em Tratamento">Em Tratamento</option>
            <option value="Internado">Internados</option>
            <option value="Transferido">Transferidos</option>
            <option value="Transplante">Transplante</option>
            <option value="Inativo">Inativos</option>
          </select>
        </div>
      </div>

      {/* Contagem */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-xs text-muted font-semibold uppercase tracking-wider">
          Total de Pacientes: {filteredPatients.length}
        </span>
      </div>

      {/* Lista de Pacientes */}
      <div className="flex flex-col gap-3">
        {filteredPatients.length === 0 ? (
          <div className="glass-panel text-center" style={{ padding: '3rem 1rem' }}>
            <User size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p className="font-semibold">Nenhum paciente encontrado</p>
            <p className="text-muted text-sm mt-1">Cadastre um novo paciente ou ajuste os filtros acima.</p>
            <button className="btn btn-primary mt-4" onClick={handleOpenNewPatient}>
              <UserPlus size={16} /> Cadastrar Paciente
            </button>
          </div>
        ) : (
          filteredPatients.map(patient => {
            const statusStyle = getStatusColor(patient.status);
            return (
              <div 
                key={patient.id} 
                className="glass-panel animate-in" 
                style={{ 
                  padding: '1.25rem', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border)'
                }}
                onClick={() => navigate(`/patient/${patient.id}`)}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>
                      {patient.nome}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {patient.clinica || 'Clínica Nefrológica NexAi'} {patient.idade ? `• ${patient.idade} anos` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        background: statusStyle.bg, 
                        color: statusStyle.color, 
                        border: `1px solid ${statusStyle.border}`,
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontWeight: '600' 
                      }}
                    >
                      {patient.status || 'Ativo'}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        background: 'rgba(37, 99, 235, 0.1)', 
                        color: 'var(--primary)', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        fontWeight: '600' 
                      }}
                    >
                      {patient.turno}
                    </span>
                    <button 
                      className="btn btn-outline" 
                      onClick={(e) => handleEditPatient(e, patient)}
                      style={{ padding: '0.35rem', borderRadius: '8px' }}
                      title="Editar cadastro do paciente"
                    >
                      <Edit size={15} color="var(--primary)" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted mt-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <Activity size={15} color="var(--primary)" />
                    <span style={{ fontSize: '0.82rem' }}>
                      <strong>Acesso:</strong> {patient.acessoVascular?.tipo || 'Não informado'} 
                      {patient.acessoVascular?.fluxoSangue ? ` (${patient.acessoVascular.fluxoSangue} ml/min)` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1" style={{ color: 'var(--primary)', fontSize: '0.82rem', fontWeight: '600' }}>
                    <span>Ver Exames</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Cadastro/Edição de Paciente */}
      <PatientFormModal 
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        patientToEdit={patientToEdit}
      />
    </div>
  );
}
