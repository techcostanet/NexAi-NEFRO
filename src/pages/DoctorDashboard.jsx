import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, User, Filter } from 'lucide-react';
import patientsData from '../data/patients_db.json';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurno, setFilterTurno] = useState('Todos');

  const filteredPatients = patientsData.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurno = filterTurno === 'Todos' || p.turno === filterTurno;
    return matchesSearch && matchesTurno;
  });

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <header className="flex justify-between items-center mt-4 mb-8">
        <div>
          <h1 className="text-xl">Olá, Dra. Gisele</h1>
          <p className="text-muted text-sm">Visão Geral dos Pacientes</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/login')} style={{ padding: '0.5rem' }}>
          <LogOut size={20} />
        </button>
      </header>

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
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
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
                <span>Acesso: {patient.acessoVascular.tipo}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
