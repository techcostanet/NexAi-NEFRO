import React from 'react';
import { X, Sparkles, CheckCircle2, Calendar, GitCommit } from 'lucide-react';
import { SYSTEM_CHANGELOG } from '../data/versions';
import { APP_VERSION } from '../version';

export default function ChangelogModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(15, 23, 42, 0.65)', 
        backdropFilter: 'blur(6px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-in" 
        style={{ 
          background: 'var(--surface-solid)', 
          width: '100%', 
          maxWidth: '650px', 
          maxHeight: '85vh', 
          overflowY: 'auto',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          borderRadius: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', padding: '0.6rem', borderRadius: '12px', color: 'white', display: 'flex' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Notas de Versão (Release Notes)</h2>
              <p className="text-muted text-xs">Histórico cronológico de melhorias e atualizações técnicas do NexAi-NEFRO</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-outline" 
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-6" style={{ position: 'relative', paddingLeft: '1rem' }}>
          {/* Linha vertical conectora */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '10px', 
              bottom: '10px', 
              left: '1.45rem', 
              width: '2px', 
              background: 'linear-gradient(to bottom, #2563eb, #e2e8f0)' 
            }} 
          />

          {SYSTEM_CHANGELOG.map((item, idx) => {
            const isCurrent = idx === 0;
            return (
              <div key={item.version} style={{ position: 'relative', paddingLeft: '2rem' }}>
                {/* Marcador da timeline */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: '-0.3rem', 
                    top: '2px', 
                    width: '18px', 
                    height: '18px', 
                    borderRadius: '50%', 
                    background: isCurrent ? '#2563eb' : '#94a3b8',
                    border: '3px solid white',
                    boxShadow: isCurrent ? '0 0 0 3px rgba(37, 99, 235, 0.25)' : 'none'
                  }} 
                />

                <div 
                  className="glass-panel" 
                  style={{ 
                    padding: '1.25rem', 
                    background: isCurrent ? 'rgba(239, 246, 255, 0.7)' : 'rgba(248, 250, 252, 0.7)',
                    borderColor: isCurrent ? '#bfdbfe' : 'var(--border)',
                    borderRadius: '14px'
                  }}
                >
                  <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span 
                        style={{ 
                          fontSize: '0.8rem', 
                          fontWeight: '700', 
                          background: isCurrent ? '#2563eb' : '#64748b', 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '8px' 
                        }}
                      >
                        v{item.version}
                      </span>
                      <h3 className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{item.title}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <Calendar size={12} />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-2 text-xs" style={{ listStyleType: 'none', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                    {item.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} style={{ lineHeight: '1.45', paddingLeft: '4px' }}>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-6 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <button type="button" className="btn btn-primary" onClick={onClose} style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
