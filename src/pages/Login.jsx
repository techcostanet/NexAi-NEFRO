import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KidneyIcon from '../components/KidneyIcon';
import { APP_VERSION } from '../version';

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
        setError('Senha incorreta para a conta informada.');
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
      setError('Credenciais inválidas! Verifique seu e-mail e senha.');
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
          <p className="text-muted text-sm mt-0.5">Gestão Nefrológica</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-main)' }}>Email de Acesso</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="seu.email@exemplo.com" 
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

        <div className="mt-6 text-center">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Versão {APP_VERSION} • Produção Cloud Firestore
          </span>
        </div>
      </div>
    </div>
  );
}
