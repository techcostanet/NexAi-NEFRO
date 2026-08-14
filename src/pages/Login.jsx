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
    e.preventDefault();
    setError('');

    if (email === 'admin@nefroapp.com' && password === 'admin123') {
      navigate('/admin');
    } else if (email === 'dra.gisele@nefroapp.com' && password === '123456') {
      navigate('/doctor');
    } else {
      setError('Credenciais inválidas! Verifique seu email e senha.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen" style={{ minHeight: '100vh' }}>
      <div className="glass-panel animate-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', margin: '1rem' }}>
        <div className="flex flex-col items-center mb-8">
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
          <h1 className="text-2xl font-bold text-center">NexAi-NEFRO</h1>
          <p className="text-muted text-sm mt-1">Gestão Nefrológica</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-main)' }}>Email</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="dr.exemplo@clinica.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--text-main)' }}>Senha</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn btn-primary w-full mt-4">
            Entrar
          </button>
        </form>

        <div className="mt-8 text-center" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
            Versão {APP_VERSION}
          </span>
        </div>
      </div>
    </div>
  );
}
