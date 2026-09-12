import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const PASTEL_THEMES = [
  {
    id: 'azul_sereno',
    nome: 'Azul Sereno',
    subtitulo: 'Padrão Nefrológico',
    primary: '#2563eb',
    light: '#60a5fa',
    subtle: '#eff6ff',
    border: '#bfdbfe',
    badge: '#dbeafe',
    badgeText: '#1e40af',
    previewGradient: 'linear-gradient(135deg, #2563eb, #60a5fa)'
  },
  {
    id: 'verde_esmeralda',
    nome: 'Verde Esmeralda',
    subtitulo: 'Equilíbrio & Saúde',
    primary: '#059669',
    light: '#34d399',
    subtle: '#ecfdf5',
    border: '#a7f3d0',
    badge: '#d1fae5',
    badgeText: '#065f46',
    previewGradient: 'linear-gradient(135deg, #059669, #34d399)'
  },
  {
    id: 'lavanda_suave',
    nome: 'Lavanda & Púrpura',
    subtitulo: 'Foco & Harmonia',
    primary: '#7c3aed',
    light: '#a78bfa',
    subtle: '#f5f3ff',
    border: '#ddd6fe',
    badge: '#ede9fe',
    badgeText: '#5b21b6',
    previewGradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)'
  },
  {
    id: 'turquesa_clinico',
    nome: 'Turquesa Clínico',
    subtitulo: 'Clareza Hospitalar',
    primary: '#0891b2',
    light: '#38bdf8',
    subtle: '#ecfeff',
    border: '#a5f3fc',
    badge: '#cffafe',
    badgeText: '#155e75',
    previewGradient: 'linear-gradient(135deg, #0891b2, #38bdf8)'
  },
  {
    id: 'pessego_coral',
    nome: 'Pêssego & Coral',
    subtitulo: 'Acolhimento Humano',
    primary: '#e11d48',
    light: '#fb7185',
    subtle: '#fff1f2',
    border: '#fecdd3',
    badge: '#ffe4e6',
    badgeText: '#9f1239',
    previewGradient: 'linear-gradient(135deg, #e11d48, #fb7185)'
  },
  {
    id: 'ambar_clinico',
    nome: 'Âmbar Clínico',
    subtitulo: 'Atenção & Calor',
    primary: '#d97706',
    light: '#fbbf24',
    subtle: '#fffbeb',
    border: '#fde68a',
    badge: '#fef3c7',
    badgeText: '#92400e',
    previewGradient: 'linear-gradient(135deg, #d97706, #fbbf24)'
  },
  {
    id: 'grafite_cirurgico',
    nome: 'Grafite Cirúrgico',
    subtitulo: 'Minimalismo & Sobriedade',
    primary: '#475569',
    light: '#94a3b8',
    subtle: '#f8fafc',
    border: '#cbd5e1',
    badge: '#f1f5f9',
    badgeText: '#1e293b',
    previewGradient: 'linear-gradient(135deg, #475569, #94a3b8)'
  }
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { activeDoctorId } = useAuth();
  const [currentThemeId, setCurrentThemeId] = useState('azul_sereno');

  const applyThemeToDocument = (theme) => {
    if (!theme) return;
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--primary-light', theme.light);
    root.style.setProperty('--primary-subtle', theme.subtle);
    root.style.setProperty('--primary-border', theme.border);
  };

  // Carrega o tema do médico no Firestore sempre que o médico ativo mudar
  useEffect(() => {
    if (!activeDoctorId || !db) return;

    const loadDoctorTheme = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'doctors', activeDoctorId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.temaCores) {
            setCurrentThemeId(data.temaCores);
            const found = PASTEL_THEMES.find(t => t.id === data.temaCores);
            if (found) {
              applyThemeToDocument(found);
            }
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar tema personalizado:', err);
      }
    };

    loadDoctorTheme();
  }, [activeDoctorId]);

  const changeTheme = async (themeId) => {
    const selected = PASTEL_THEMES.find(t => t.id === themeId);
    if (!selected) return;

    setCurrentThemeId(themeId);
    applyThemeToDocument(selected);

    // Salva no perfil do médico no Firestore
    if (activeDoctorId && db) {
      try {
        await setDoc(doc(db, 'doctors', activeDoctorId), {
          temaCores: themeId,
          atualizadoEm: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn('Erro ao persistir tema no Firestore:', err);
      }
    }
  };

  const currentTheme = PASTEL_THEMES.find(t => t.id === currentThemeId) || PASTEL_THEMES[0];

  return (
    <ThemeContext.Provider value={{ currentTheme, currentThemeId, changeTheme, themes: PASTEL_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
}
