import React, { useState } from 'react';

/**
 * 🌟 BrandIcon: Ícone 3D Isométrico com Símbolo de Nefrologia (Rins Anatômicos) e Efeito Hover Interativo
 * O símbolo anatômico de nefrologia é posicionado no centro exato do cubo 3D isométrico.
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

          {/* Sombra suave e contraste do símbolo nefrológico */}
          <filter id="nefroGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Grupo do Cubo Isométrico 3D */}
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

        {/* Símbolo da Nefrologia (Rins Anatômicos) no Centro Exato do Cubo */}
        <svg x="23" y="23" width="54" height="54" viewBox="0 0 24 24" overflow="visible">
          <g 
            stroke="#ffffff" 
            strokeWidth="2.1" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            filter="url(#nefroGlow)"
          >
            {/* Rim Esquerdo */}
            <path 
              d="M7.2 4.2C4.5 4.5 3 7.2 3 11.2C3 15.5 5.2 18.8 8.2 18.8C10.2 18.8 10.8 16 9.8 13.8C8.8 11.6 9.8 7.5 8.8 5.6C8.4 4.8 7.8 4.3 7.2 4.2Z" 
              fill="rgba(255, 255, 255, 0.3)"
            />
            
            {/* Rim Direito */}
            <path 
              d="M16.8 4.2C19.5 4.5 21 7.2 21 11.2C21 15.5 18.8 18.8 15.8 18.8C13.8 18.8 13.2 16 14.2 13.8C15.2 11.6 14.2 7.5 15.2 5.6C15.6 4.8 16.2 4.3 16.8 4.2Z" 
              fill="rgba(255, 255, 255, 0.3)"
            />
            
            {/* Artéria / Veia Renal central */}
            <path d="M9.8 12.5C11 12.5 11.5 13 12 14" opacity="0.95" fill="none" strokeWidth="2.0" />
            <path d="M14.2 12.5C13 12.5 12.5 13 12 14" opacity="0.95" fill="none" strokeWidth="2.0" />
            
            {/* Ureteres */}
            <path d="M11.5 14.5V20.5" opacity="0.9" fill="none" strokeWidth="2.0" />
            <path d="M12.5 14.5V20.5" opacity="0.9" fill="none" strokeWidth="2.0" />
          </g>
        </svg>
      </svg>
    </div>
  );
}

/**
 * 🏷️ BrandLogo: Componente Oficial da Marca Nex-Ai.NEFRO
 * Exibe a logomarca completa (Ícone 3D com Rins + Tipografia Nex-Ai.NEFRO) com alinhamento perfeito (horizontal ou vertical).
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
    xl: { icon: 64, text: 'text-3xl', sub: 'text-sm', gap: 'gap-3.5' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const isLight = textColor === 'light';
  const baseTextColor = isLight ? '#ffffff' : '#0f172a';
  const isVertical = direction === 'vertical';

  return (
    <div
      className={`brand-logo-container flex ${isVertical ? 'flex-col items-center justify-center text-center' : 'items-center'} ${currentSize.gap} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        display: isVertical ? 'flex' : 'inline-flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: isVertical ? 'center' : 'left',
        width: isVertical ? '100%' : 'auto',
        margin: isVertical ? '0 auto' : undefined
      }}
    >
      {/* Ícone 3D com Símbolo de Nefrologia */}
      <BrandIcon size={currentSize.icon} isHovered={isHovered} />

      {/* Tipografia da Marca Nex-Ai.NEFRO */}
      {showText && (
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            lineHeight: 1.15,
            alignItems: isVertical ? 'center' : 'flex-start',
            justifyContent: 'center',
            textAlign: isVertical ? 'center' : 'left',
            width: isVertical ? '100%' : 'auto'
          }}
        >
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: isVertical ? 'center' : 'flex-start',
              gap: '6px',
              textAlign: isVertical ? 'center' : 'left',
              width: '100%'
            }}
          >
            <span
              className={`font-extrabold tracking-tight ${currentSize.text}`}
              style={{
                color: baseTextColor,
                letterSpacing: '-0.4px',
                textAlign: isVertical ? 'center' : 'left',
                display: 'inline-block'
              }}
            >
              Nex-
              <span
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #d946ef 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                  display: 'inline-block',
                  filter: isHovered ? 'brightness(1.25) drop-shadow(0 0 6px rgba(168, 85, 247, 0.45))' : 'none',
                  transform: isHovered ? 'translateY(-1px)' : 'none',
                  transition: 'filter 0.25s ease, transform 0.25s ease'
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
                marginTop: '5px',
                fontWeight: 500,
                textAlign: isVertical ? 'center' : 'left',
                display: 'block',
                width: '100%'
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
