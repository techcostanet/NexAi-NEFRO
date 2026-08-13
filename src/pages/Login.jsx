import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

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
      setError('Credenciais inválidas! Use os acessos de teste informados.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="glass-panel animate-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', margin: '1rem' }}>
        <div className="flex flex-col items-center mb-8">
          <div style={{ background: 'var(--primary)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: 'white' }}>
            <Activity size={32} />
          </div>
          <h1 className="text-2xl font-bold">NefroApp</h1>
          <p className="text-muted text-sm mt-2">Gestão Clínica Inteligente</p>
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

        <div className="mt-6 text-center">
          <p className="text-muted text-sm mb-2">
            <strong>Dra. Gisele:</strong> dra.gisele@nefroapp.com <br/> Senha: 123456
          </p>
          <p className="text-muted text-sm" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
            <strong>Painel Admin:</strong> admin@nefroapp.com <br/> Senha: admin123
          </p>
        </div>
      </div>
    </div>
  );
}
