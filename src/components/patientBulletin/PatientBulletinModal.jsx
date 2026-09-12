import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Trophy, 
  Share2, 
  Check, 
  Calendar, 
  MessageSquareHeart, 
  Sparkles,
  Edit3,
  FileDown,
  Loader2
} from 'lucide-react';
import PatientBulletinPrintDocument from './PatientBulletinPrintDocument';
import PatientBulletinPdf from '../pdf/PatientBulletinPdf';
import { downloadPdfDocument } from '../../services/pdfService';
import { printElement } from '../../utils/printUtils';
import { evaluatePatientExamsForBulletin } from '../../services/patientEducationService';

export default function PatientBulletinModal({
  isOpen,
  onClose,
  patient,
  doctorInfo
}) {
  const [selectedExamIndex, setSelectedExamIndex] = useState(0);
  const [customNote, setCustomNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Ordena exames do histórico ou usa o atual
  const historico = useMemo(() => {
    if (!patient) return [];
    const h = Array.isArray(patient.historicoExames) ? [...patient.historicoExames] : [];
    if (h.length === 0 && patient.exames) {
      h.push({
        dataExame: patient.atualizadoEm ? patient.atualizadoEm.split('T')[0] : new Date().toISOString().split('T')[0],
        ...patient.exames
      });
    }
    return h.sort((a, b) => new Date(b.dataExame || 0) - new Date(a.dataExame || 0));
  }, [patient]);

  const exameSelecionado = historico[selectedExamIndex] || patient?.exames || {};
  const dataRef = exameSelecionado.dataExame || (patient?.atualizadoEm ? patient.atualizadoEm.split('T')[0] : null);

  const bulletinData = useMemo(() => {
    if (!patient) return null;
    return evaluatePatientExamsForBulletin(patient, exameSelecionado, dataRef);
  }, [patient, exameSelecionado, dataRef]);

  if (!isOpen || !patient) return null;

  const handleCopyWhatsApp = () => {
    if (!bulletinData) return;
    const { pacienteNome, totalMetas, metasBatidas, taxaSucesso, cards } = bulletinData;
    
    let text = `🎉 *Boletim de Saúde & Conquistas - NexAi-NEFRO*\n`;
    text += `Olá, *${pacienteNome}*! Aqui está o resultado dos seus exames mais recentes:\n\n`;
    text += `🏆 *Seu Desempenho:* ${metasBatidas} de ${totalMetas} metas alcançadas (${taxaSucesso}% de Sucesso!)\n\n`;
    
    cards.forEach(c => {
      const emoji = c.statusId === 'otimo' ? '🌟' : c.statusId === 'bom' ? '✅' : '⚠️';
      text += `${emoji} *${c.nome}:* ${c.valorFormatado} (Alvo: ${c.alvoTexto})\n_${c.feedbackTexto}_\n\n`;
    });

    if (customNote) {
      text += `💬 *Recado da Equipe Médica:*\n"${customNote}"\n\n`;
    }

    text += `🏥 _${doctorInfo?.clinicaPrincipal || 'Centro Nefrológico'} • Cuidando de você a cada sessão!_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const safeName = (patient.nome || 'Paciente').replace(/\s+/g, '_');
      const fileName = `Boletim_Saude_${safeName}.pdf`;
      await downloadPdfDocument(
        <PatientBulletinPdf
          bulletinData={bulletinData}
          doctorInfo={doctorInfo}
          customNote={customNote}
        />,
        fileName
      );
    } catch (err) {
      console.error('Falha ao baixar PDF do boletim:', err);
      printElement('printable-patient-bulletin-doc');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    printElement('printable-patient-bulletin-doc', `Boletim de Saúde - ${patient.nome || ''}`);
  };

  return (
    <div 
      className="patient-bulletin-modal-overlay"
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
        className="glass-panel animate-in patient-bulletin-modal-container" 
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
        {/* Barra superior de ações */}
        <div className="flex justify-between items-center mb-3 pb-3 border-b no-print" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div style={{ background: '#dbeafe', padding: '0.45rem', borderRadius: '10px' }}>
              <Trophy size={18} color="#2563eb" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 m-0">
                Boletim de Conquistas & Metas de Saúde
              </h2>
              <span className="text-xxs text-muted">
                Impressão A4 / PDF Oficial / WhatsApp
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleCopyWhatsApp}
              className="btn btn-outline"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '5px', borderColor: '#86efac', color: '#166534', background: '#f0fdf4' }}
              title="Copiar texto formatado para enviar no WhatsApp do paciente ou familiar"
            >
              {copied ? <Check size={14} color="#16a34a" /> : <Share2 size={14} />}
              <span>{copied ? 'Copiado p/ WhatsApp!' : 'WhatsApp'}</span>
            </button>

            <button 
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="btn btn-outline"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Baixar arquivo PDF nativo com alta fidelidade"
            >
              {isDownloadingPdf ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} color="#2563eb" />}
              <span>{isDownloadingPdf ? 'Gerando...' : 'Baixar PDF'}</span>
            </button>

            <button 
              type="button"
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Imprimir folha A4 ou salvar via navegador"
            >
              <Printer size={15} />
              <span>Imprimir A4 / PDF</span>
            </button>

            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-outline" 
              style={{ padding: '0.45rem', borderRadius: '50%' }}
              title="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Controles de Configuração do Boletim (Mês e Recadinho) */}
        <div className="no-print bg-slate-100 p-2.5 rounded-xl mb-3 flex justify-between items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <Calendar size={14} color="#2563eb" />
            <label className="font-semibold text-slate-700">Coleta Avaliada:</label>
            <select
              className="input-field"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem', width: '180px' }}
              value={selectedExamIndex}
              onChange={(e) => setSelectedExamIndex(Number(e.target.value))}
            >
              {historico.map((h, idx) => (
                <option key={idx} value={idx}>
                  {h.dataExame ? new Date(h.dataExame + 'T12:00:00').toLocaleDateString('pt-BR') : `Coleta ${idx + 1}`} {idx === 0 ? '(Mais Recente)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            onClick={() => setIsEditingNote(!isEditingNote)}
          >
            <MessageSquareHeart size={13} color="#2563eb" />
            <span>{customNote ? 'Editar Recado da Equipe' : '+ Escrever Recado p/ Paciente'}</span>
          </button>
        </div>

        {isEditingNote && (
          <div className="no-print bg-blue-50 border border-blue-200 p-3 rounded-xl mb-3 animate-in">
            <label className="text-xs font-bold text-blue-900 block mb-1">
              Escreva uma mensagem carinhosa para {patient.nome.split(' ')[0]}:
            </label>
            <textarea
              className="input-field"
              rows={2}
              style={{ fontSize: '0.8rem', width: '100%', resize: 'vertical' }}
              placeholder="Ex: Você está de parabéns pela disciplina! Vamos cuidar do potássio este mês e você vai voar! Abraço da equipe."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>
        )}

        {/* Visualização Prévia do Documento Oficial A4 */}
        <div id="printable-patient-bulletin-doc" className="printable-patient-bulletin-area" style={{
          background: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          <PatientBulletinPrintDocument 
            bulletinData={bulletinData}
            doctorInfo={doctorInfo}
            customNote={customNote}
          />
        </div>
      </div>
    </div>
  );
}
