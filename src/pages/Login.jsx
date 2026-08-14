import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KidneyIcon from '../components/KidneyIcon';
import { APP_VERSION } from '../version';
import { Sparkles, Shield, User, Stethoscope } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e?.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (cleanEmail === 'admin@nefroapp.com' && (cleanPass === 'admin123' || cleanPass === 'admin')) {
      localStorage.setItem('userRole', 'admin');
      navigate('/admin');
    } else if (cleanEmail === 'dr.marcelo@nefroapp.com' || cleanEmail === 'demo@nefroapp.com' || cleanEmail === 'demo') {
      if (cleanPass === '123456' || cleanPass === 'demo123' || cleanPass === 'demo' || cleanPass === '123') {
        localStorage.setItem('activeDoctorId', 'dr-marcelo');
        localStorage.setItem('userRole', 'doctor');
        navigate('/doctor');
      } else {
        setError('Senha incorreta para a conta de demonstração.');
      }
    } else if (cleanEmail === 'dra.gisele@nefroapp.com') {
      if (cleanPass === '123456' || cleanPass === '123') {
        localStorage.setItem('activeDoctorId', 'dra-gisele');
        localStorage.setItem('userRole', 'doctor');
        navigate('/doctor');
      } else {
        setError('Senha incorreta para esta conta.');
      }
    } else {
      setError('Credenciais inválidas! Utilize os acessos rápidos abaixo ou verifique email/senha.');
    }
  };

  const quickFill = (userEmail, userPass, doctorId = null) => {
    setEmail(userEmail);
    setPassword(userPass);
    if (userEmail.includes('admin')) {
      localStorage.setItem('userRole', 'admin');
      navigate('/admin');
    } else {
      localStorage.setItem('activeDoctorId', doctorId || 'dr-marcelo');
      localStorage.setItem('userRole', 'doctor');
      navigate('/doctor');
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '1.5rem 1rem' }}>
      <div 
        className="glass-panel animate-in" 
        style={{ 
          padding: '2.5rem', 
          width: '100%', 
          maxWidth: '440px', 
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
          borderRadius: '24px'
        }}
      >
        <div className="flex flex-col items-center mb-6">
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
              padding: '1rem', 
              borderRadius: '50%', 
              marginBottom: '1rem', 
              color: 'white',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <KidneyIcon size={34} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-center" style={{ letterSpacing: '-0.3px' }}>NexAi-NEFRO</h1>
          <p className="text-muted text-sm mt-0.5">Gestão Nefrológica & Diálise 100% Cloud</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-main)' }}>Email de Acesso</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="dr.marcelo@nefroapp.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-main)' }}>Senha</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.82rem', textAlign: 'center', fontWeight: '500' }}>{error}</p>}

          <button type="submit" className="btn btn-primary w-full mt-2" style={{ padding: '0.75rem' }}>
            Acessar Sistema
          </button>
        </form>

        {/* Seção de Atalhos Rápidos para Apresentação a Clientes */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <span className="text-xs text-muted uppercase font-bold block text-center mb-2.5 tracking-wider">
            Acessos Rápidos (Demonstração)
          </span>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => quickFill('dr.marcelo@nefroapp.com', '123456', 'dr-marcelo')}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '12px',
                border: '1px solid #bfdbfe',
                background: 'rgba(239, 246, 255, 0.9)',
                color: '#1d4ed8',
                fontSize: '0.82rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div className="flex items-center gap-2">
                <Stethoscope size={16} />
                <span>Dr. Marcelo Ramos (Demonstração)</span>
              </div>
              <span style={{ fontSize: '0.7rem', background: '#dbeafe', padding: '2px 6px', borderRadius: '6px' }}>Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => quickFill('dra.gisele@nefroapp.com', '123456', 'dra-gisele')}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.82rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Dra. Gisele (Consultório)</span>
              </div>
              <span style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '6px' }}>Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => quickFill('admin@nefroapp.com', 'admin123')}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '12px',
                border: '1px solid #ddd6fe',
                background: 'rgba(245, 243, 255, 0.9)',
                color: '#6d28d9',
                fontSize: '0.82rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>Painel Super Admin</span>
              </div>
              <span style={{ fontSize: '0.7rem', background: '#ede9fe', padding: '2px 6px', borderRadius: '6px' }}>Gestão</span>
            </button>
          </div>
        </div>

        <div className="mt-5 text-center">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Versão {APP_VERSION} • Produção Cloud Firestore
          </span>
        </div>
      </div>
    </div>
  );
}
