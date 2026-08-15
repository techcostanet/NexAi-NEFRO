import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfile from './pages/DoctorProfile';
import PatientProfile from './pages/PatientProfile';
import ChangelogModal from './components/ChangelogModal';
import { APP_VERSION } from './version';
import { Sparkles, Loader2 } from 'lucide-react';

function AppContent() {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Autenticando sessão segura...</p>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/doctor" element={<DoctorDashboard />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
              <Route path="/patient/:id" element={<PatientProfile />} />
            </Routes>
          </div>

        
        <footer style={{ 
          textAlign: 'center', 
          padding: '0.85rem', 
          fontSize: '0.75rem', 
          color: 'var(--text-muted)', 
          borderTop: '1px solid var(--border)',
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <span>NexAi-NEFRO • Gestão Nefrológica</span>
          <span>•</span>
          <button 
            onClick={() => setIsChangelogOpen(true)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--primary)', 
              fontWeight: '600', 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem'
            }}
          >
            <Sparkles size={12} />
            <span>v{APP_VERSION} • Notas de Versão</span>
          </button>
        </footer>

        <ChangelogModal 
          isOpen={isChangelogOpen}
          onClose={() => setIsChangelogOpen(false)}
        />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
