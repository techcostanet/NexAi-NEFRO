import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWithFirebaseAuth, logoutFirebaseAuth, subscribeToAuthState, updateActiveTenant } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'admin' | 'doctor'
  const [activeDoctorId, setActiveDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuta alterações de estado de autenticação no Firebase Auth
    const unsubscribe = subscribeToAuthState((userData) => {
      if (userData) {
        setCurrentUser(userData.firebaseUser || userData);
        setUserRole(userData.role || 'doctor');
        
        const tenantToUse = userData.activeTenantId || userData.doctorId;
        if (tenantToUse) {
          setActiveDoctorId(tenantToUse);
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
      setCurrentUser(authResult.firebaseUser || authResult);
      setUserRole(authResult.role);
      
      const tenantToUse = authResult.activeTenantId || authResult.doctorId;
      if (tenantToUse) {
        setActiveDoctorId(tenantToUse);
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
      setActiveDoctorId(null);
    } finally {
      setLoading(false);
    }
  };

  const selectDoctor = async (doctorId) => {
    setActiveDoctorId(doctorId);
    if (currentUser?.uid) {
      await updateActiveTenant(currentUser.uid, doctorId);
    }
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
