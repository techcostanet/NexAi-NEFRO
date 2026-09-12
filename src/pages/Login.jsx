import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { APP_VERSION } from '../version';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const authResult = await login(email, password);
      if (authResult.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/doctor');
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError(err.message || 'Credenciais inválidas! Verifique seu e-mail e senha.');
    } finally {
      setIsSubmitting(false);
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
        <div className="flex flex-col items-center justify-center text-center mb-6 w-full">
          <BrandLogo 
            size="xl"
            direction="vertical"
            subtitle="Software de Gestão Nefrológica Especializada"
            className="cursor-pointer justify-center text-center"
            onClick={() => navigate('/')}
          />
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-main)' }}>Email</label>
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

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-2" 
            style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </button>
        </form>

        {/* Link para Landing Page / Novos Clientes */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600 mb-2 font-medium">Não possui licença?</p>
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="btn btn-outline w-full text-xs font-bold py-2 text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100 transition"
          >
            Conhecer Planos ➡️
          </button>
        </div>

        <div className="mt-5 text-center">
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Versão {APP_VERSION} • Cloud Firestore
          </span>
        </div>
      </div>
    </div>
  );
}
