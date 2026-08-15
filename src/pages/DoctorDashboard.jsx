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
  AlertTriangle,
  Building2,
  MapPin
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
  
  const [doctor, setDoctor] = useState({ 
    nome: 'Carregando...', 
    crm: '', 
    ufCrm: '',
    locaisAtuacao: []
  });
  
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocal, setFilterLocal] = useState('Todos');
  const [filterTurno, setFilterTurno] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterMedAlert, setFilterMedAlert] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

  const currentDoctorId = activeDoctorId;

  useEffect(() => {
    if (!currentDoctorId) return;

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

  const locaisList = Array.isArray(doctor.locaisAtuacao) ? doctor.locaisAtuacao : [];

  // Filtragem completa de pacientes
  const filteredPatients = patients.filter(p => {
    const matchesSearch = (p.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.clinica || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por Local de Atuação
    const matchesLocal = filterLocal === 'Todos' || 
                         p.clinica === filterLocal || 
                         (p.clinica && p.clinica.toLowerCase().includes(filterLocal.toLowerCase()));

    const matchesTurno = filterTurno === 'Todos' || p.turno === filterTurno;
    const matchesStatus = filterStatus === 'Todos' || (p.status || 'Ativo') === filterStatus;
    
    if (filterMedAlert) {
      const medAlerts = getPatientMedicationAlerts(p);
      return matchesSearch && matchesLocal && matchesTurno && matchesStatus && medAlerts.hasAlerts;
    }

    return matchesSearch && matchesLocal && matchesTurno && matchesStatus;
  });

  const getStatusStyle = (status = 'Ativo') => {
    switch (status) {
      case 'Ativo':
        return { background: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' };
      case 'Em Tratamento':
        return { background: '#fef3c7', color: '#b45309', borderColor: '#fde68a' };
      case 'Internado':
        return { background: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' };
      case 'Transferido':
        return { background: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' };
      case 'Transplante':
        return { background: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' };
      case 'Inativo':
        return { background: '#f8fafc', color: '#64748b', borderColor: '#cbd5e1' };
      default:
        return { background: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' };
    }
  };

  const getTurnoStyle = (turno = '1º Turno') => {
    switch (turno) {
      case '1º Turno':
        return { background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' };
      case '2º Turno':
        return { background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' };
      case '3º Turno':
        return { background: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' };
      case '4º Turno':
        return { background: '#faf5ff', color: '#6b21a8', borderColor: '#e9d5ff' };
      case 'Diálise Peritoneal':
        return { background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' };
      default:
        return { background: '#f8fafc', color: '#334155', borderColor: '#e2e8f0' };
    }
  };

  // Contagem de alertas globais
  const totalAlerts = patients.reduce((acc, p) => {
    const alerts = getPatientMedicationAlerts(p);
    return alerts.hasAlerts ? acc + 1 : acc;
  }, 0);

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      
      {/* Cabeçalho */}
      <header className="flex justify-between items-center mt-3 mb-4 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.3px' }}>
              Olá, {doctor.nome || 'Médico'}
            </h1>
            <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
              100% Cloud
            </span>
          </div>
          <p className="text-muted text-sm mt-0.5">
            {doctor.especialidade || 'Nefrologia Clínica e Hemodiálise'} • CRM {doctor.crm}/{doctor.ufCrm}
          </p>
        </div>

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
            <span>Notas de Versão</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="btn btn-outline" 
            onClick={() => navigate('/doctor/profile')}
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Ver e editar dados cadastrais e locais de atendimento"
          >
            <UserCog size={16} color="var(--primary)" />
            <span>Dados & Locais</span>
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

      {/* BARRA DE SELEÇÃO RÁPIDA DE LOCAL DE ATUAÇÃO */}
      <div 
        className="glass-panel mb-4" 
        style={{ 
          padding: '0.85rem 1.25rem', 
          borderRadius: '16px', 
          background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.85), rgba(255, 255, 255, 0.95))',
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-blue-900 mr-1">
            <Building2 size={16} color="#2563eb" />
            <span>Unidade de Trabalho:</span>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setFilterLocal('Todos')}
              style={{
                padding: '5px 12px',
                borderRadius: '10px',
                fontSize: '0.8rem',
                fontWeight: filterLocal === 'Todos' ? 'bold' : '500',
                background: filterLocal === 'Todos' ? '#2563eb' : '#ffffff',
                color: filterLocal === 'Todos' ? '#ffffff' : '#475569',
                border: '1px solid',
                borderColor: filterLocal === 'Todos' ? '#2563eb' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: filterLocal === 'Todos' ? '0 2px 6px rgba(37,99,235,0.25)' : 'none'
              }}
            >
              🏢 Todas as Unidades ({patients.length})
            </button>

            {locaisList.filter(loc => loc.status !== 'Inativo' || filterLocal === loc.nome).map(loc => {
              const count = patients.filter(p => p.clinica === loc.nome || (p.clinica && p.clinica.toLowerCase().includes(loc.nome.toLowerCase()))).length;
              const isSelected = filterLocal === loc.nome;
              const isInactive = loc.status === 'Inativo';
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setFilterLocal(loc.nome)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 'bold' : '500',
                    background: isSelected ? '#2563eb' : isInactive ? '#f1f5f9' : '#ffffff',
                    color: isSelected ? '#ffffff' : isInactive ? '#94a3b8' : '#475569',
                    border: '1px solid',
                    borderColor: isSelected ? '#2563eb' : isInactive ? '#cbd5e1' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: isSelected ? '0 2px 6px rgba(37,99,235,0.25)' : 'none'
                  }}
                  title={isInactive ? "Unidade inativa/pausada" : `${loc.tipo} • RT: ${loc.rtNome || 'Não inf.'}`}
                >
                  <span>{loc.tipo?.includes('Hemodiálise') ? '🏥' : loc.tipo?.includes('Hospital') ? '🏨' : '🩺'}</span>
                  <span>{loc.nome} {isInactive ? '(Pausado)' : ''}</span>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    padding: '1px 6px', 
                    borderRadius: '6px', 
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#64748b',
                    fontWeight: 'bold'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/doctor/profile')}
          className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          title="Cadastrar novas clínicas ou hospitais"
        >
          <span>Gerenciar Locais</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Painel de Filtros e Busca */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(255, 255, 255, 0.85)', borderRadius: '16px' }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar por nome do paciente..." 
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

          <button 
            type="button"
            className="btn"
            onClick={() => setFilterMedAlert(!filterMedAlert)}
            style={{ 
              padding: '0.55rem 0.85rem',
              fontSize: '0.85rem',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid',
              background: filterMedAlert ? '#fef3c7' : '#ffffff',
              borderColor: filterMedAlert ? '#f59e0b' : 'var(--border)',
              color: filterMedAlert ? '#b45309' : 'var(--text-main)',
              fontWeight: filterMedAlert ? 'bold' : '500',
              cursor: 'pointer'
            }}
            title="Mostrar apenas pacientes com ciclos de medicação a vencer ou expirados"
          >
            <Clock size={16} color={filterMedAlert ? '#b45309' : '#64748b'} />
            <span>Ciclos a Vencer ({totalAlerts})</span>
          </button>
        </div>
      </div>

      {/* Indicador de Unidade Selecionada */}
      <div className="flex justify-between items-center mb-3 text-xs text-muted font-semibold">
        <span>
          {filterLocal === 'Todos' ? 'Todos os Pacientes' : `Unidade: ${filterLocal}`} • Exibindo <strong>{filteredPatients.length}</strong> de {patients.length} pacientes
        </span>
      </div>

      {/* Grid de Pacientes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
        {filteredPatients.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Nenhum paciente encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          filteredPatients.map(patient => {
            const statusStyle = getStatusStyle(patient.status);
            const turnoStyle = getTurnoStyle(patient.turno);
            const medInfo = getPatientMedicationAlerts(patient);

            return (
              <div 
                key={patient.id} 
                className="patient-card glass-panel"
                onClick={() => navigate(`/patient/${patient.id}`)}
                style={{ 
                  cursor: 'pointer',
                  position: 'relative',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem'
                }}
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-base text-slate-800 tracking-tight" title={patient.nome}>
                      {patient.nome}
                    </h3>
                    <button 
                      className="btn btn-outline" 
                      onClick={(e) => handleEditPatient(e, patient)}
                      style={{ padding: '0.25rem', borderRadius: '8px', border: 'none', background: 'transparent' }}
                      title="Editar cadastro do paciente"
                    >
                      <Edit size={16} color="var(--text-muted)" />
                    </button>
                  </div>
                  
                  <div className="text-xs text-muted flex items-center gap-1 mb-2 font-medium">
                    <Building2 size={13} color="#2563eb" />
                    <span>{patient.clinica || 'Clínica Não Informada'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        border: '1px solid',
                        fontWeight: '600',
                        ...statusStyle
                      }}
                    >
                      {patient.status || 'Ativo'}
                    </span>

                    <span 
                      style={{ 
                        fontSize: '0.72rem', 
                        padding: '2px 8px', 
                        borderRadius: '10px', 
                        border: '1px solid',
                        fontWeight: '500',
                        ...turnoStyle
                      }}
                    >
                      {patient.turno || '3º Turno'}
                    </span>

                    {medInfo.totalMeds > 0 && (
                      <span 
                        style={{ 
                          fontSize: '0.72rem', 
                          padding: '2px 8px', 
                          borderRadius: '10px', 
                          border: '1px solid',
                          background: '#fffbeb',
                          borderColor: '#fef3c7',
                          color: '#b45309',
                          fontWeight: '500',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <Pill size={11} /> {medInfo.totalMeds} meds
                      </span>
                    )}
                  </div>

                  {medInfo.hasAlerts && (
                    <div 
                      className="mt-2.5 p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold"
                      style={{ 
                        background: medInfo.expired.length > 0 ? '#fee2e2' : '#fef3c7',
                        color: medInfo.expired.length > 0 ? '#b91c1c' : '#b45309',
                        border: '1px solid',
                        borderColor: medInfo.expired.length > 0 ? '#fecaca' : '#fde68a'
                      }}
                    >
                      <AlertTriangle size={13} />
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
        locaisAtuacao={doctor.locaisAtuacao || []}
      />

      <ChangelogModal 
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />
    </div>
  );
}
