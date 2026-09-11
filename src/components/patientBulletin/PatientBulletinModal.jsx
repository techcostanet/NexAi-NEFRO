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
  Edit3
} from 'lucide-react';
import PatientBulletinPrintDocument from './PatientBulletinPrintDocument';
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

  // Lista de coletas disponíveis para gerar o boletim
  const historico = useMemo(() => {
    if (!patient) return [];
    if (Array.isArray(patient.historicoExames) && patient.historicoExames.length > 0) {
      return patient.historicoExames;
    }
    if (patient.exames && Object.keys(patient.exames).length > 0) {
      return [{ ...patient.exames, dataExame: patient.exames.dataExame || new Date().toISOString().split('T')[0] }];
    }
    return [];
  }, [patient]);

  // Exame selecionado para avaliação
  const selectedExam = historico[selectedExamIndex] || patient?.exames || {};

  // Avaliação automatizada com inteligência clínica humanizada
  const bulletinData = useMemo(() => {
    if (!patient) return null;
    return evaluatePatientExamsForBulletin(patient, selectedExam);
  }, [patient, selectedExam]);

  if (!isOpen || !patient || !bulletinData) return null;

  // Copia resumo carinhoso para WhatsApp
  const handleCopyWhatsApp = () => {
    const primeiroNome = patient.nome.split(' ')[0];
    const dataObj = selectedExam.dataExame ? new Date(selectedExam.dataExame + 'T12:00:00') : new Date();
    const mesFormatado = dataObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    let msg = `🌟 *BOLETIM DE SAÚDE & CONQUISTAS* 🌟\n`;
    msg += `Olá, *${primeiroNome}*! Aqui está o resumo das suas conquistas nos exames de *${mesFormatado}*:\n\n`;
    msg += `🏆 *Seu Placar:* ${bulletinData.metasBatidas} de ${bulletinData.totalMetas} metas alcançadas com louvor! (${bulletinData.taxaSucesso}%)\n\n`;

    bulletinData.cards.forEach(c => {
      const emoji = c.status === 'CONQUISTA' ? '🟢' : (c.status === 'QUASE_LA' ? '🟡' : '🔴');
      msg += `${emoji} *${c.categoria}* (${c.valorFormatado})\n`;
      msg += `"${c.mensagem}"\n`;
      msg += `💡 _Dica: ${c.dica}_\n\n`;
    });

    if (customNote) {
      msg += `✍️ *Recadinho da Equipe:* ${customNote}\n\n`;
    }

    msg += `Conte sempre com toda a nossa equipe de Nefrologia! Juntos cuidando de você com carinho. ❤️🩺`;

    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
          maxWidth: '840px', 
          maxHeight: '95vh', 
          overflowY: 'auto', 
          padding: '1.25rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          borderRadius: '16px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de ações (oculta na impressão) */}
        <div className="flex justify-between items-center mb-3 pb-3 border-b no-print" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div style={{ background: '#dbeafe', padding: '6px', borderRadius: '10px', color: '#2563eb' }}>
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 leading-tight">
                Boletim de Saúde & Conquistas do Paciente
              </h2>
              <span className="text-[11px] text-muted">
                Relatório humanizado, colorido e motivacional calibrado para 1 folha A4
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
              onClick={() => window.print()}
              className="btn btn-primary"
              style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Imprimir folha A4 ou salvar em PDF limpo"
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditingNote(!isEditingNote)}
              className="btn btn-outline"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Edit3 size={13} color="#2563eb" />
              <span>{isEditingNote ? 'Fechar Edição do Recadinho' : 'Editar Recadinho da Equipe'}</span>
            </button>
          </div>
        </div>

        {/* Painel de Edição do Recadinho Especial (quando ativado) */}
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
        <div style={{
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
