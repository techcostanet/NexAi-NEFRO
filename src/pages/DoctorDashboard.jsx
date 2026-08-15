import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Search, 
  User, 
  UserPlus, 
  Filter, 
  UserCog, 
  Edit, 
  ChevronRight, 
  Activity, 
  Calendar, 
  Sparkles,
  Pill,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { subscribeToPatients } from '../services/patientService';
import { subscribeDoctorProfile } from '../services/doctorService';
import { normalizeMedicamentosList, getMedicationStatus } from '../data/dialysisMedications';
import PatientFormModal from '../components/PatientFormModal';
import ChangelogModal from '../components/ChangelogModal';
import { useAuth } from '../context/AuthContext';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { activeDoctorId, logout } = useAuth();
  const [doctor, setDoctor] = useState({ nome: 'Dr. Marcelo Ramos', crm: '654321', ufCrm: 'SP' });
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurno, setFilterTurno] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterMedAlert, setFilterMedAlert] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  const currentDoctorId = activeDoctorId || 'dr-marcelo';

  useEffect(() => {
    const unsubDoc = subscribeDoctorProfile(currentDoctorId, (data) => {
      if (data) setDoctor(data);
    });

    const unsubPatients = subscribeToPatients((data) => {
      setPatients(data);
    });

    return () => {
      unsubDoc();
      unsubPatients();
    };
  }, [currentDoctorId]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleOpenNewPatient = () => {
    setPatientToEdit(null);
    setIsPatientModalOpen(true);
  };

  const handleEditPatient = (e, patient) => {
    e.stopPropagation();
    setPatientToEdit(patient);
    setIsPatientModalOpen(true);
  };

  // Helper para verificar alertas de medicação no paciente
  const getPatientMedicationAlerts = (patient) => {
    const meds = normalizeMedicamentosList(patient.medicamentos);
    const expiring = [];
    const expired = [];
    
    meds.forEach(m => {
      if (m.ativo !== false) {
        const st = getMedicationStatus(m);
        if (st.status === 'expirando') expiring.push(m);
        if (st.status === 'expirado') expired.push(m);
      }
    });

    return {
      totalMeds: meds.filter(m => m.ativo !== false).length,
      expiring,
      expired,
      hasAlerts: expiring.length > 0 || expired.length > 0
    };
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = (p.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.clinica || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurno = filterTurno === 'Todos' || p.turno === filterTurno;
    const matchesStatus = filterStatus === 'Todos' || (p.status || 'Ativo') === filterStatus;
    
    if (filterMedAlert) {
      const medAlerts = getPatientMedicationAlerts(p);
      return matchesSearch && matchesTurno && matchesStatus && medAlerts.hasAlerts;
    }

    return matchesSearch && matchesTurno && matchesStatus;
  });

  const getStatusStyle = (status = 'Ativo') => {
    switch (status) {
      case 'Ativo':
      case 'Em Tratamento':
        return { bg: 'rgba(240, 253, 244, 0.95)', color: '#047857', border: '#bbf7d0' };
      case 'Internado':
        return { bg: 'rgba(254, 242, 242, 0.95)', color: '#b91c1c', border: '#fecaca' };
      case 'Transferido':
      case 'Transplante':
        return { bg: 'rgba(245, 243, 255, 0.95)', color: '#6d28d9', border: '#ddd6fe' };
      default:
        return { bg: 'rgba(248, 250, 252, 0.95)', color: '#475569', border: '#cbd5e1' };
    }
  };

  // Contagem global de pacientes com alertas de medicação
  const patientsWithMedAlertsCount = patients.filter(p => getPatientMedicationAlerts(p).hasAlerts).length;

  return (
    <div className="container" style={{ paddingBottom: '5rem', maxWidth: '1100px' }}>
      {/* Cabeçalho do Médico com Notas de Versão Centralizadas */}
      <header className="flex justify-between items-center mt-2 mb-6 flex-wrap gap-4" style={{ position: 'relative' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.3px' }}>
            Olá, {doctor.nome || 'Doutor(a)'}
          </h1>
          <p className="text-muted text-sm mt-1">
            {doctor.especialidade || 'Gestão Nefrológica'} • CRM {doctor.crm || '---'}/{doctor.ufCrm || 'UF'}
          </p>
        </div>

        {/* Botão Central de Notas de Versão */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => setIsChangelogOpen(true)}
            style={{ 
              padding: '0.4rem 1rem', 
              fontSize: '0.8rem', 
              borderRadius: '20px', 
              background: 'rgba(239, 246, 255, 0.95)', 
              borderColor: '#bfdbfe',
              color: '#1d4ed8',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)'
            }}
            title="Ver Notas de Versão e atualizações do sistema"
          >
            <Sparkles size={14} color="#2563eb" />
            <span>Notas de Versão (Release Notes)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="btn btn-outline" 
            onClick={() => navigate('/doctor/profile')}
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Ver e editar dados cadastrais do médico"
          >
            <UserCog size={16} color="var(--primary)" />
            <span>Dados do Médico</span>
          </button>

          <button 
            className="btn btn-primary" 
            onClick={handleOpenNewPatient}
            disabled={doctor.statusLicenca === 'Suspenso' || doctor.statusLicenca === 'Cancelado'}
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={16} />
            <span>Novo Paciente</span>
          </button>

          <button 
            className="btn btn-outline" 
            onClick={handleLogout} 
            style={{ padding: '0.55rem', borderRadius: '12px' }}
            title="Sair do sistema"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {(doctor.statusLicenca === 'Suspenso' || doctor.statusLicenca === 'Cancelado') && (
        <div 
          className="glass-panel mb-4 animate-in" 
          style={{ 
            padding: '1rem 1.25rem', 
            background: 'rgba(254, 242, 242, 0.95)', 
            border: '1px solid #fecaca', 
            color: '#b91c1c', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px' 
          }}
        >
          <AlertTriangle size={22} color="#dc2626" />
          <div>
            <strong className="block text-sm">Atenção: Licença Médica Temporariamente {doctor.statusLicenca}</strong>
            <span className="text-xs">Seus dados clínicos e prontuários estão preservados com segurança na nuvem. Entre em contato com a administração para reativação da licença.</span>
          </div>
        </div>
      )}

      {/* Painel de Filtros e Busca com Toque Pastel Suave */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '16px' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
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

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
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

          {/* Filtro Rápido para Alertas de Medicamentos */}
          <button
            type="button"
            onClick={() => setFilterMedAlert(!filterMedAlert)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '12px',
              border: '1px solid',
              borderColor: filterMedAlert ? '#d97706' : '#e2e8f0',
              background: filterMedAlert ? '#fef3c7' : '#ffffff',
              color: filterMedAlert ? '#b45309' : '#64748b',
              fontWeight: '600',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            title="Filtrar pacientes com medicamentos vencendo ou vencidos"
          >
            <Clock size={15} color={filterMedAlert ? '#b45309' : '#64748b'} />
            <span>Ciclos a Vencer {patientsWithMedAlertsCount > 0 ? `(${patientsWithMedAlertsCount})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Contagem */}
      <div className="flex justify-between items-center mb-3 px-1">
        <span className="text-xs text-muted font-semibold uppercase tracking-wider">
          Total de Pacientes: {filteredPatients.length}
        </span>
        {filterMedAlert && (
          <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 'bold' }}>
            Exibindo apenas pacientes com ciclos/prazos de medicamentos pendentes
          </span>
        )}
      </div>

      {/* Lista de Pacientes em Grid de Cards com Visual Refinado */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {filteredPatients.length === 0 ? (
          <div className="glass-panel text-center" style={{ gridColumn: '1 / -1', padding: '3.5rem 1rem', borderRadius: '16px' }}>
            <User size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p className="font-semibold text-lg">Nenhum paciente encontrado</p>
            <p className="text-muted text-sm mt-1">Cadastre um novo paciente ou ajuste os filtros acima.</p>
            <button className="btn btn-primary mt-4" onClick={handleOpenNewPatient}>
              <UserPlus size={16} /> Cadastrar Paciente
            </button>
          </div>
        ) : (
          filteredPatients.map(patient => {
            const statusTheme = getStatusStyle(patient.status);
            const medInfo = getPatientMedicationAlerts(patient);

            return (
              <div 
                key={patient.id} 
                className="glass-panel animate-in" 
                style={{ 
                  padding: '1.25rem', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  border: medInfo.hasAlerts ? '1px solid #fde68a' : '1px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: medInfo.hasAlerts ? '0 4px 16px rgba(217, 119, 6, 0.06)' : '0 4px 16px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onClick={() => navigate(`/patient/${patient.id}`)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.08)';
                  e.currentTarget.style.borderColor = '#bfdbfe';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.03)';
                  e.currentTarget.style.borderColor = medInfo.hasAlerts ? '#fde68a' : 'rgba(226, 232, 240, 0.9)';
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-base" style={{ color: 'var(--text-main)', lineHeight: '1.3' }}>
                      {patient.nome}
                    </h3>
                    <button 
                      className="btn btn-outline" 
                      onClick={(e) => handleEditPatient(e, patient)}
                      style={{ padding: '0.35rem', borderRadius: '8px', flexShrink: 0 }}
                      title="Editar cadastro do paciente"
                    >
                      <Edit size={14} color="var(--primary)" />
                    </button>
                  </div>

                  <p className="text-xs text-muted mb-3">
                    {patient.clinica || 'Clínica NexAi'} {patient.idade ? `• ${patient.idade} anos` : ''}
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        background: statusTheme.bg, 
                        color: statusTheme.color, 
                        border: `1px solid ${statusTheme.border}`,
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        fontWeight: '600' 
                      }}
                    >
                      {patient.status || 'Ativo'}
                    </span>
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        background: 'rgba(239, 246, 255, 0.9)', 
                        color: '#1d4ed8', 
                        border: '1px solid #bfdbfe',
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        fontWeight: '600' 
                      }}
                    >
                      {patient.turno}
                    </span>

                    {medInfo.totalMeds > 0 && (
                      <span 
                        style={{ 
                          fontSize: '0.72rem', 
                          background: '#fffbeb', 
                          color: '#b45309', 
                          border: '1px solid #fef3c7',
                          padding: '2px 8px', 
                          borderRadius: '10px', 
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Pill size={11} /> {medInfo.totalMeds} {medInfo.totalMeds === 1 ? 'med' : 'meds'}
                      </span>
                    )}
                  </div>

                  {/* Indicador de Alerta de Medicamentos */}
                  {medInfo.hasAlerts && (
                    <div 
                      style={{ 
                        fontSize: '0.72rem', 
                        background: medInfo.expired.length > 0 ? 'rgba(254, 242, 242, 0.9)' : 'rgba(254, 243, 199, 0.9)',
                        color: medInfo.expired.length > 0 ? '#b91c1c' : '#92400e',
                        border: `1px solid ${medInfo.expired.length > 0 ? '#fecaca' : '#fde68a'}`,
                        padding: '3px 8px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '0.75rem'
                      }}
                    >
                      <Clock size={12} />
                      <span>
                        {medInfo.expired.length > 0 ? `${medInfo.expired.length} ciclo encerrado` : `${medInfo.expiring.length} medicação a vencer`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted pt-2.5 border-t" style={{ borderColor: 'rgba(226, 232, 240, 0.8)' }}>
                  <div className="flex items-center gap-1.5 truncate mr-2">
                    <Activity size={14} color="var(--primary)" />
                    <span className="truncate">
                      {patient.acessoVascular?.tipo || 'Acesso não inf.'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1" style={{ color: 'var(--primary)', fontWeight: '600', flexShrink: 0 }}>
                    <span>Prontuário</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modais */}
      <PatientFormModal 
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        patientToEdit={patientToEdit}
      />

      <ChangelogModal 
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </div>
  );
}
