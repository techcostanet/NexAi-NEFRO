import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Calendar, Wrench, Rocket, Zap, Filter } from 'lucide-react';
import { SYSTEM_CHANGELOG } from '../data/versions';
import { APP_VERSION } from '../version';
import { formatVersionItem } from '../utils/versionUtils';

export default function ChangelogModal({ isOpen, onClose }) {
  const [filterType, setFilterType] = useState('todos'); // 'todos' | 'novidade' | 'correcao' | 'melhoria'

  if (!isOpen) return null;

  const formattedList = SYSTEM_CHANGELOG.map(formatVersionItem).filter(Boolean);

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'correcao':
        return <Wrench size={13} className="shrink-0" />;
      case 'novidade':
        return <Rocket size={13} className="shrink-0" />;
      case 'melhoria':
      default:
        return <CheckCircle2 size={13} className="shrink-0" />;
    }
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(15, 23, 42, 0.7)', 
        backdropFilter: 'blur(8px)', 
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
          background: 'var(--surface-solid, #ffffff)', 
          width: '100%', 
          maxWidth: '680px', 
          maxHeight: '88vh', 
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          position: 'relative',
          borderRadius: '24px',
          border: '1px solid rgba(226, 232, 240, 0.9)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div 
          style={{ 
            padding: '1.5rem 1.75rem 1.25rem',
            borderBottom: '1px solid var(--border, #e2e8f0)',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
          }}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', 
                  padding: '0.65rem', 
                  borderRadius: '14px', 
                  color: 'white', 
                  display: 'flex',
                  boxShadow: '0 6px 14px rgba(37, 99, 235, 0.3)'
                }}
              >
                <Sparkles size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Atualizações do Sistema</h2>
                  <span 
                    style={{ 
                      fontSize: '0.72rem', 
                      background: '#eff6ff', 
                      color: '#1d4ed8', 
                      border: '1px solid #bfdbfe', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontWeight: '700' 
                    }}
                  >
                    v{APP_VERSION} Atual
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Acompanhe as melhorias, novidades e correções disponibilizadas na sua plataforma
                </p>
              </div>
            </div>

            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-outline" 
              style={{ 
                padding: '0.45rem', 
                borderRadius: '50%',
                color: '#64748b'
              }}
              title="Fechar janela"
            >
              <X size={18} />
            </button>
          </div>

          {/* Filtros Visuais por Categoria */}
          <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterType('todos')}
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filterType === 'todos' ? '#2563eb' : '#e2e8f0',
                background: filterType === 'todos' ? '#2563eb' : '#f8fafc',
                color: filterType === 'todos' ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Todas as Versões
            </button>

            <button
              type="button"
              onClick={() => setFilterType('novidade')}
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filterType === 'novidade' ? '#bfdbfe' : '#e2e8f0',
                background: filterType === 'novidade' ? '#eff6ff' : '#f8fafc',
                color: filterType === 'novidade' ? '#1d4ed8' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <Rocket size={12} />
              <span>Novidades</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('correcao')}
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filterType === 'correcao' ? '#fecaca' : '#e2e8f0',
                background: filterType === 'correcao' ? '#fef2f2' : '#f8fafc',
                color: filterType === 'correcao' ? '#dc2626' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <Wrench size={12} />
              <span>Correções</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('melhoria')}
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: filterType === 'melhoria' ? '#bbf7d0' : '#e2e8f0',
                background: filterType === 'melhoria' ? '#f0fdf4' : '#f8fafc',
                color: filterType === 'melhoria' ? '#15803d' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={12} />
              <span>Melhorias</span>
            </button>
          </div>
        </div>

        {/* Linha do Tempo / Lista com Scroll */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '1.5rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'relative'
          }}
        >
          {formattedList.map((item, idx) => {
            const isCurrent = idx === 0;

            // Se houver filtro ativo, verifica se esta versão possui destaques compatíveis
            const filteredHighlights = filterType === 'todos' 
              ? item.cleanHighlights 
              : item.cleanHighlights.filter(h => h.category.type === filterType);

            if (filterType !== 'todos' && filteredHighlights.length === 0 && item.category.type !== filterType) {
              return null;
            }

            const highlightsToRender = filteredHighlights.length > 0 ? filteredHighlights : item.cleanHighlights;

            return (
              <div 
                key={item.version || idx}
                style={{ 
                  borderRadius: '16px',
                  background: isCurrent ? 'linear-gradient(135deg, rgba(239, 246, 255, 0.6) 0%, rgba(248, 250, 252, 0.9) 100%)' : '#ffffff',
                  border: isCurrent ? '1.5px solid #bfdbfe' : '1px solid #e2e8f0',
                  boxShadow: isCurrent ? '0 8px 20px rgba(37, 99, 235, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.02)',
                  padding: '1.25rem',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Cabeçalho do Card de Versão */}
                <div className="flex justify-between items-center flex-wrap gap-2 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: '800', 
                        background: isCurrent ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#64748b', 
                        color: '#ffffff', 
                        padding: '3px 10px', 
                        borderRadius: '10px',
                        letterSpacing: '0.3px',
                        boxShadow: isCurrent ? '0 3px 8px rgba(37, 99, 235, 0.3)' : 'none'
                      }}
                    >
                      v{item.version}
                    </span>

                    {/* Badge da Categoria Principal */}
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        background: item.category.badgeBg,
                        border: `1px solid ${item.category.badgeBorder}`,
                        color: item.category.badgeColor,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {getCategoryIcon(item.category.type)}
                      <span>{item.category.label}</span>
                    </span>

                    {isCurrent && (
                      <span 
                        style={{ 
                          fontSize: '0.68rem', 
                          fontWeight: '700', 
                          background: '#ecfdf5', 
                          color: '#047857', 
                          border: '1px solid #a7f3d0', 
                          padding: '2px 7px', 
                          borderRadius: '8px' 
                        }}
                      >
                        Versão Atual
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Calendar size={13} />
                    <span>{item.date}</span>
                  </div>
                </div>

                {/* Título Humanizado da Versão */}
                <h3 
                  className="font-bold text-sm text-slate-800 mb-2" 
                  style={{ lineHeight: '1.4' }}
                >
                  {item.cleanTitle}
                </h3>

                {/* Lista de Destaques / Mudanças com Badges Específicos */}
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100">
                  {highlightsToRender.map((h, hIdx) => {
                    const cat = h.category;
                    return (
                      <div 
                        key={hIdx} 
                        className="flex items-start gap-2.5 text-xs text-slate-700"
                        style={{ lineHeight: '1.5' }}
                      >
                        <span 
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            padding: '1px 6px',
                            borderRadius: '6px',
                            background: cat.badgeBg,
                            border: `1px solid ${cat.badgeBorder}`,
                            color: cat.badgeColor,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginTop: '2px',
                            flexShrink: 0
                          }}
                        >
                          {getCategoryIcon(cat.type)}
                          <span>{cat.label}</span>
                        </span>
                        
                        <span className="flex-1 font-medium text-slate-700">
                          {h.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé do Modal */}
        <div 
          style={{ 
            padding: '1rem 1.75rem', 
            borderTop: '1px solid var(--border, #e2e8f0)',
            background: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span className="text-xs text-slate-400">
            Atualizações em tempo real • Nuvem Firebase
          </span>

          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onClose} 
            style={{ 
              padding: '0.45rem 1.4rem', 
              fontSize: '0.85rem',
              borderRadius: '10px'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
