import React from 'react';

export default function KidneyIcon({ size = 32, color = "currentColor", className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.9" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Rim Esquerdo */}
      <path d="M7.2 4.2C4.5 4.5 3 7.2 3 11.2C3 15.5 5.2 18.8 8.2 18.8C10.2 18.8 10.8 16 9.8 13.8C8.8 11.6 9.8 7.5 8.8 5.6C8.4 4.8 7.8 4.3 7.2 4.2Z" />
      
      {/* Rim Direito */}
      <path d="M16.8 4.2C19.5 4.5 21 7.2 21 11.2C21 15.5 18.8 18.8 15.8 18.8C13.8 18.8 13.2 16 14.2 13.8C15.2 11.6 14.2 7.5 15.2 5.6C15.6 4.8 16.2 4.3 16.8 4.2Z" />
      
      {/* Artéria / Veia Renal central sutil */}
      <path d="M9.8 12.5C11 12.5 11.5 13 12 14" opacity="0.75" />
      <path d="M14.2 12.5C13 12.5 12.5 13 12 14" opacity="0.75" />
      
      {/* Ureteres estilizados */}
      <path d="M11.5 14.5V20.5" opacity="0.6" />
      <path d="M12.5 14.5V20.5" opacity="0.6" />
    </svg>
  );
}
