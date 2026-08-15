import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWithFirebaseAuth, logoutFirebaseAuth, subscribeToAuthState } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'doctor'
  const [activeDoctorId, setActiveDoctorId] = useState('dr-marcelo');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuta alterações de estado de autenticação no Firebase Auth
    const unsubscribe = subscribeToAuthState((userData) => {
      if (userData) {
        setCurrentUser(userData.firebaseUser || userData);
        setUserRole(userData.role || 'doctor');
        if (userData.doctorId) {
          setActiveDoctorId(userData.doctorId);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const authResult = await loginWithFirebaseAuth(email, password);
      setCurrentUser(authResult.user);
      setUserRole(authResult.role);
      if (authResult.doctorId) {
        setActiveDoctorId(authResult.doctorId);
      }
      return authResult;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutFirebaseAuth();
      setCurrentUser(null);
      setUserRole(null);
      setActiveDoctorId('dr-marcelo');
    } finally {
      setLoading(false);
    }
  };

  const selectDoctor = (doctorId) => {
    setActiveDoctorId(doctorId);
  };

  const value = {
    currentUser,
    userRole,
    activeDoctorId,
    loading,
    login,
    logout,
    setActiveDoctorId: selectDoctor
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
