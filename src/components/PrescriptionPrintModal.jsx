import React, { useState } from 'react';
import { X, Printer, FileCheck } from 'lucide-react';
import PrescriptionPrintDocument from './PrescriptionPrintDocument';

export default function PrescriptionPrintModal({
  isOpen,
  onClose,
  prescription,
  patient,
  doctorInfo
}) {
  const [currentVia, setCurrentVia] = useState(1);

  if (!isOpen || !prescription || !patient) return null;

  const isTwoVias = prescription.tipoReceita === 'controle_especial' || prescription.tipoReceita === 'antimicrobiano';

  return (
    <div 
      className="prescription-print-modal-overlay"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(15, 23, 42, 0.75)', 
        backdropFilter: 'blur(6px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 99999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-in prescription-print-modal-container" 
        style={{ 
          background: '#f8fafc', 
          width: '100%', 
          maxWidth: '820px', 
          maxHeight: '94vh', 
          overflowY: 'auto', 
          padding: '1.25rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          borderRadius: '16px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de ações (oculta na impressão) */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b no-print" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <FileCheck size={20} color="var(--primary)" />
            <div>
              <strong className="text-sm text-slate-800 block">Receituário Médico</strong>
              <span className="text-[11px] text-muted">Pronto para impressão em 1 folha A4</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isTwoVias && (
              <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md transition-all ${
                    currentVia === 1 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => setCurrentVia(1)}
                >
                  1ª Via (Farmácia)
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-md transition-all ${
                    currentVia === 2 ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => setCurrentVia(2)}
                >
                  2ª Via (Paciente)
                </button>
              </div>
            )}

            <button 
              type="button"
              onClick={() => window.print()}
              className="btn btn-primary"
              style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={15} />
              <span>Imprimir / Salvar PDF</span>
            </button>

            <button 
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              style={{ padding: '0.45rem', borderRadius: '50%' }}
              title="Fechar visualização"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Folha A4 Única Isolada para Impressão */}
        <div className="printable-prescription-area flex justify-center">
          <PrescriptionPrintDocument
            prescription={prescription}
            patient={patient}
            doctorInfo={doctorInfo}
            currentVia={currentVia}
          />
        </div>
      </div>
    </div>
  );
}
