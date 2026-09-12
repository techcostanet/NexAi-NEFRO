import React, { useState } from 'react';

/**
 * 🌟 BrandIcon: Ícone 3D Isométrico com Cruz Médica central e Efeito Hover Interativo
 * Baseado na nova identidade visual: Cubo 3D em gradiente Azul/Púrpura/Magenta
 * com faces facetadas, cruz médica central (+) branca e brilho suave.
 */
export function BrandIcon({ size = 36, className = '', isHovered = false }) {
  return (
    <div 
      className={`brand-icon-wrapper ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        transform: isHovered ? 'translateY(-2px) scale(1.08) rotate(4deg)' : 'translateY(0) scale(1) rotate(0deg)',
        filter: isHovered 
          ? 'drop-shadow(0 6px 18px rgba(99, 102, 241, 0.65)) drop-shadow(0 2px 10px rgba(217, 70, 239, 0.5))' 
          : 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.35)) drop-shadow(0 2px 6px rgba(168, 85, 247, 0.25))',
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Gradiente da Face Superior: Céu -> Azul Real */}
          <linearGradient id="facetTopGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* Gradiente da Face Esquerda: Azul Royal Profundo */}
          <linearGradient id="facetLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="50%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          {/* Gradiente da Face Direita: Violeta -> Magenta Vibrante */}
          <linearGradient id="facetRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="60%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>

          {/* Sombra suave interna da cruz */}
          <filter id="crossGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Grupo do Cubo Isométrico */}
        <g strokeLinejoin="round" strokeLinecap="round">
          {/* Face Superior (Top Diamond) */}
          <path
            d="M 50 12 L 84 29 L 50 49 L 16 29 Z"
            fill="url(#facetTopGrad)"
            stroke="#60a5fa"
            strokeWidth="1.2"
            opacity="0.98"
          />

          {/* Face Esquerda (Left Diamond) */}
          <path
            d="M 16 29 L 50 49 L 50 88 L 16 68 Z"
            fill="url(#facetLeftGrad)"
            stroke="#2563eb"
            strokeWidth="1.2"
          />

          {/* Face Direita (Right Diamond) */}
          <path
            d="M 50 49 L 84 29 L 84 68 L 50 88 Z"
            fill="url(#facetRightGrad)"
            stroke="#a855f7"
            strokeWidth="1.2"
          />

          {/* Brilho da Aresta Central */}
          <line
            x1="50"
            y1="49"
            x2="50"
            y2="88"
            stroke="#ffffff"
            strokeWidth="1"
            strokeOpacity="0.25"
          />
        </g>

        {/* Cruz Médica (+) Central Branca */}
        <g 
          filter="url(#crossGlow)"
          style={{
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            transformOrigin: '50px 50px',
            transition: 'transform 0.3s ease'
          }}
        >
          {/* Barra Horizontal */}
          <rect
            x="36"
            y="46.5"
            width="28"
            height="7"
            rx="3.5"
            fill="#ffffff"
          />
          {/* Barra Vertical */}
          <rect
            x="46.5"
            y="36"
            width="7"
            height="28"
            rx="3.5"
            fill="#ffffff"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * 🏷️ BrandLogo: Componente Oficial da Marca Nex-Ai.NEFRO
 * Exibe a logomarca completa (Ícone 3D + Tipografia Nex-Ai.NEFRO) com animação ao passar o mouse.
 */
export default function BrandLogo({
  size = 'md',             // 'sm' | 'md' | 'lg' | 'xl'
  showText = true,
  textColor = 'dark',      // 'dark' | 'light'
  subtitle = null,
  versionBadge = null,
  className = '',
  onClick = null,
  direction = 'horizontal' // 'horizontal' | 'vertical'
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Mapeamento de tamanhos
  const sizeMap = {
    xs: { icon: 22, text: 'text-sm', sub: 'text-[0.65rem]', gap: 'gap-1.5' },
    sm: { icon: 28, text: 'text-base', sub: 'text-xs', gap: 'gap-2' },
    md: { icon: 36, text: 'text-xl', sub: 'text-xs', gap: 'gap-2.5' },
    lg: { icon: 48, text: 'text-2xl', sub: 'text-sm', gap: 'gap-3' },
    xl: { icon: 60, text: 'text-3xl', sub: 'text-base', gap: 'gap-3.5' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const isLight = textColor === 'light';
  const baseTextColor = isLight ? '#ffffff' : '#0f172a';

  return (
    <div
      className={`brand-logo-container flex ${direction === 'vertical' ? 'flex-col items-center text-center' : 'items-center'} ${currentSize.gap} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        display: 'inline-flex'
      }}
    >
      {/* Ícone 3D com Efeito Hover */}
      <BrandIcon size={currentSize.icon} isHovered={isHovered} />

      {/* Tipografia da Marca Nex-Ai.NEFRO */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span
              className={`font-extrabold tracking-tight ${currentSize.text}`}
              style={{
                color: baseTextColor,
                letterSpacing: '-0.4px',
                transition: 'color 0.25s ease'
              }}
            >
              Nex-
              <span
                style={{
                  background: isHovered
                    ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #ec4899 100%)'
                    : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #d946ef 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                  transition: 'all 0.35s ease'
                }}
              >
                Ai
              </span>
              .NEFRO
            </span>

            {versionBadge && (
              <span
                style={{
                  fontSize: '0.68rem',
                  background: isLight ? 'rgba(255,255,255,0.18)' : '#eff6ff',
                  color: isLight ? '#ffffff' : '#1d4ed8',
                  border: isLight ? '1px solid rgba(255,255,255,0.3)' : '1px solid #bfdbfe',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontWeight: '700'
                }}
              >
                {versionBadge}
              </span>
            )}
          </div>

          {subtitle && (
            <span
              className={currentSize.sub}
              style={{
                color: isLight ? 'rgba(255,255,255,0.7)' : 'var(--text-muted, #64748b)',
                marginTop: '2px',
                fontWeight: 500
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
