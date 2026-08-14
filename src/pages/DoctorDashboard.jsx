import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, User, Cloud, CloudOff, RefreshCw, CheckCircle } from 'lucide-react';
import { subscribeToPatients, seedFirestoreWithLocalData } from '../services/patientService';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurno, setFilterTurno] = useState('Todos');
  const [isLocalFallback, setIsLocalFallback] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToPatients((data, isFallback) => {
      setPatients(data);
      setIsLocalFallback(isFallback);
    });

    return () => unsubscribe();
  }, []);

  const handleSyncToFirestore = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('Sincronizando...');
      const count = await seedFirestoreWithLocalData();
      setSyncStatus(`Sucesso! ${count} pacientes enviados ao Firestore.`);
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (err) {
      console.error(err);
      setSyncStatus('Erro ao enviar dados. Verifique as regras do Firestore.');
      setTimeout(() => setSyncStatus(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = (p.nome || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurno = filterTurno === 'Todos' || p.turno === filterTurno;
    return matchesSearch && matchesTurno;
  });

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <header className="flex justify-between items-center mt-4 mb-6">
        <div>
          <h1 className="text-xl font-bold">Olá, Dra. Gisele</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted text-sm">Visão Geral dos Pacientes</p>
            <span 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '0.72rem', 
                padding: '2px 8px', 
                borderRadius: '12px',
                background: isLocalFallback ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                color: isLocalFallback ? '#b45309' : '#15803d',
                fontWeight: '600'
              }}
              title={isLocalFallback ? "Exibindo dados locais de contingência" : "Conectado ao Cloud Firestore em tempo real"}
            >
              {isLocalFallback ? <CloudOff size={12} /> : <Cloud size={12} />}
              {isLocalFallback ? "Base Local" : "Cloud Firestore"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="btn btn-outline" 
            onClick={handleSyncToFirestore} 
            disabled={isSyncing}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Subir base de dados para o Firebase Firestore"
          >
            <RefreshCw size={15} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Enviando..." : "Subir ao Firestore"}
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/login')} style={{ padding: '0.5rem' }}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {syncStatus && (
        <div 
          className="glass-panel animate-in" 
          style={{ 
            padding: '0.75rem 1rem', 
            marginBottom: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            background: syncStatus.includes('Erro') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
            borderColor: syncStatus.includes('Erro') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'
          }}
        >
          <CheckCircle size={16} color={syncStatus.includes('Erro') ? '#ef4444' : '#22c55e'} />
          <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{syncStatus}</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Buscar paciente..." 
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="input-field" 
          style={{ width: 'auto', flex: '0 0 auto' }}
          value={filterTurno}
          onChange={(e) => setFilterTurno(e.target.value)}
        >
          <option value="Todos">Todos os Turnos</option>
          <option value="2º Turno">2º Turno</option>
          <option value="3º Turno">3º Turno</option>
        </select>
      </div>

      <div className="flex flex-col gap-4">
        {filteredPatients.length === 0 ? (
          <p className="text-center text-muted mt-8">Nenhum paciente encontrado.</p>
        ) : (
          filteredPatients.map(patient => (
            <div 
              key={patient.id} 
              className="glass-panel animate-in" 
              style={{ padding: '1.25rem', cursor: 'pointer', transition: 'transform 0.2s ease' }}
              onClick={() => navigate(`/patient/${patient.id}`)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">{patient.nome}</h3>
                <span style={{ fontSize: '0.75rem', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '600' }}>
                  {patient.turno}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <User size={16} />
                <span>Acesso: {patient.acessoVascular?.tipo || 'Não informado'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
