import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorProfile from './pages/DoctorProfile';
import PatientProfile from './pages/PatientProfile';
import { APP_VERSION } from './version';

function App() {
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
          padding: '0.75rem', 
          fontSize: '0.75rem', 
          color: 'var(--text-muted)', 
          borderTop: '1px solid var(--border)',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(8px)'
        }}>
          NexAi-NEFRO • v{APP_VERSION} • Gestão Nefrológica
        </footer>
      </div>
    </Router>
  );
}

export default App;
