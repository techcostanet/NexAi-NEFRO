import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Plus, Shield } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <header className="flex justify-between items-center mt-4 mb-8">
        <div className="flex items-center gap-2">
          <Shield size={28} style={{ color: 'var(--primary)' }} />
          <h1 className="text-xl">Super Admin</h1>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/login')} style={{ padding: '0.5rem' }}>
          <LogOut size={20} />
        </button>
      </header>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 className="font-bold text-lg mb-4">Gestão de Licenças (Clínicas)</h2>
        <p className="text-muted text-sm mb-6">Gerencie os assinantes do NexAi-NEFRO.</p>
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Clientes Ativos</h3>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            <Plus size={18} /> Nova Licença
          </button>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(0,0,0,0.02)' }}>
              <tr>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Clínica</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Status</th>
                <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Dra. Gisele (Consultório)</td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ background: 'var(--secondary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem' }}>Ativo</span>
                </td>
                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>Gerenciar Acessos</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
