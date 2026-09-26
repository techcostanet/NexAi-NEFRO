import React, { useState, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Trophy, 
  Share2, 
  Check, 
  Calendar, 
  FileDown, 
  Loader2, 
  Filter, 
  CheckSquare, 
  Square, 
  Stethoscope, 
  Eraser,
  Lightbulb,
  Edit3
} from 'lucide-react';
import PatientBulletinPrintDocument from './PatientBulletinPrintDocument';
import PatientBulletinPdf from '../pdf/PatientBulletinPdf';
import { downloadPdfDocument } from '../../services/pdfService';
import { printElement } from '../../utils/printUtils';
import { evaluatePatientExamsForBulletin, GOAL_STATUS } from '../../services/patientEducationService';

const QUICK_PRESETS = [
  { label: '🍌 Potássio / Frutas', text: 'Atenção com frutas ricas em potássio (banana, água de coco, abacate e molho de tomate).' },
  { label: '💊 Quelante nas Refeições', text: 'Tome o quelante de fósforo mastigado junto com a comida para proteger seus ossos e artérias.' },
  { label: '🩸 Ferro na Máquina', text: 'Mantenha em dia as aplicações de ferro e eritropoietina na máquina para tratar a anemia.' },
  { label: '💧 Líquidos e Sal', text: 'Cuidado com o ganho de peso entre as diálises. Modere o consumo de líquidos e sal no dia a dia.' },
  { label: '⏰ Horário Integral', text: 'Cumpra sempre as 4 horas completas de sessão na máquina para garantir máxima limpeza do sangue.' },
  { label: '👏 Parabéns pelas Metas', text: 'Parabéns pela dedicação e disciplina! Seus resultados mostram sua grande vitória este mês.' }
];

export default function PatientBulletinModal({
  isOpen,
  onClose,
  patient,
  doctorInfo
}) {
  const [selectedExamIndex, setSelectedExamIndex] = useState(0);
  const [selectedCardIds, setSelectedCardIds] = useState(null);
  const [showTips, setShowTips] = useState(true);
  const [customTips, setCustomTips] = useState({});
  const [disabledTips, setDisabledTips] = useState({});
  const [editingTipCardId, setEditingTipCardId] = useState(null);
  const [customNote, setCustomNote] = useState('');
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

  const exameSelecionado = useMemo(() => {
    return historico[selectedExamIndex] || patient?.exames || {};
  }, [historico, selectedExamIndex, patient]);

  const dataRef = exameSelecionado.dataExame || (patient?.atualizadoEm ? patient.atualizadoEm.split('T')[0] : null);

  const bulletinData = useMemo(() => {
    if (!patient) return null;
    return evaluatePatientExamsForBulletin(patient, exameSelecionado, dataRef);
  }, [patient, exameSelecionado, dataRef]);

  // Lista de todos os IDs de cartões gerados para o exame
  const allCardIds = useMemo(() => {
    return bulletinData?.cards?.map(c => c.id) || [];
  }, [bulletinData]);

  // IDs ativos: se null, seleciona todos inicialmente. Se array (inclusive vazio []), respeita estritamente
  const activeCardIds = useMemo(() => {
    if (selectedCardIds === null) return allCardIds;
    return selectedCardIds;
  }, [selectedCardIds, allCardIds]);

  if (!isOpen || !patient) return null;

  // Toggle individual de card
  const toggleCard = (id) => {
    if (activeCardIds.includes(id)) {
      setSelectedCardIds(activeCardIds.filter(x => x !== id));
      if (editingTipCardId === id) setEditingTipCardId(null);
    } else {
      setSelectedCardIds([...activeCardIds, id]);
    }
  };

  // Selecionar apenas metas críticas / quase lá
  const handleSelectCritical = () => {
    if (!bulletinData?.cards) return;
    const critical = bulletinData.cards
      .filter(c => c.status === GOAL_STATUS.ATENCAO || c.status === GOAL_STATUS.QUASE_LA)
      .map(c => c.id);
    setSelectedCardIds(critical.length > 0 ? critical : allCardIds);
  };

  const handleSelectAll = () => {
    setSelectedCardIds([...allCardIds]);
  };

  const handleClearSelection = () => {
    setSelectedCardIds([]);
    setEditingTipCardId(null);
  };

  const handleAddPreset = (text) => {
    setCustomNote(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return text;
      if (trimmed.includes(text)) return trimmed;
      return `${trimmed} ${text}`;
    });
  };

  const handleCopyWhatsApp = () => {
    if (!bulletinData) return;
    const { pacienteNome, cards, dataReferencia } = bulletinData;
    const filtered = cards.filter(c => activeCardIds.includes(c.id));
    const total = filtered.length;
    const batidas = filtered.filter(c => c.status === GOAL_STATUS.CONQUISTA).length;
    const taxa = total > 0 ? Math.round((batidas / total) * 100) : 100;

    const clinica = doctorInfo?.clinicaPrincipal || 'CLÍNICA RENALIS';
    const doctorName = doctorInfo?.nome || 'Dr. Marcelo Ramos';
    const doctorCrm = doctorInfo?.crm ? `CRM-${doctorInfo?.ufCrm || 'SP'} ${doctorInfo?.crm}` : 'CRM-SP 654321';

    const dataObj = dataReferencia ? new Date(dataReferencia + 'T12:00:00') : new Date();
    const mesFormatado = dataObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const mesCapitalizado = mesFormatado.charAt(0).toUpperCase() + mesFormatado.slice(1);

    let tituloPlacar = 'Desempenho Campeão! 🏆';
    let mensagemGeral = `Sensacional! Você atingiu ${batidas} de ${total} metas de saúde com louvor neste mês. Seu esforço e disciplina nas sessões de diálise estão transformando sua qualidade de vida!`;
    if (taxa < 75 && taxa >= 45) {
      tituloPlacar = 'Grandes Conquistas! 🌟';
      mensagemGeral = `Muito bem! Você conquistou vitórias importantes neste mês (${batidas} metas batidas). Com pequenos ajustes na rotina e nas dicas da equipe, no próximo mês chegaremos ainda mais longe!`;
    } else if (taxa < 45) {
      tituloPlacar = 'Estamos Juntos nessa Jornada! 💪';
      mensagemGeral = `Cada mês é uma nova oportunidade de recomeço e vitória. Toda a nossa equipe de Nefrologia está de mãos dadas com você para alcançarmos o melhor bem-estar possível!`;
    }

    let text = `🏥 *${clinica.toUpperCase()}* • _Boletim Nefrológico_\n`;
    text += `📋 *Boletim de Saúde*\n`;
    text += `👤 *Paciente:* ${pacienteNome}\n`;
    text += `📅 *Referência:* ${mesCapitalizado}\n`;
    text += `👨‍⚕️ *Resp:* ${doctorName} (${doctorCrm})\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (total > 0) {
      text += `🏆 *${tituloPlacar}*\n`;
      text += `🌟 *${batidas} de ${total} Metas Batidas (${taxa}% de Sucesso)*\n`;
      text += `"${mensagemGeral}"\n\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `*METAS DE SAÚDE AVALIADAS:*\n\n`;

      filtered.forEach(c => {
        const isConquista = c.status === GOAL_STATUS.CONQUISTA;
        const isQuaseLa = c.status === GOAL_STATUS.QUASE_LA;
        const statusBadge = isConquista ? '🟢 Conquista!' : isQuaseLa ? '🟡 Quase Lá!' : '🔴 Atenção';

        const metaLimpa = c.faixaMeta ? (c.faixaMeta.startsWith('Meta:') ? c.faixaMeta : `Meta: ${c.faixaMeta}`) : '';

        text += `${statusBadge} *${c.categoria}*\n`;
        if (c.subtitulo) text += `📌 _${c.subtitulo}_\n`;
        text += `📊 *Resultado:* ${c.valorFormatado} | _${metaLimpa}_\n`;
        text += `💬 "${c.mensagem}"\n`;

        const isTipDisabled = disabledTips[c.id] === true;
        const tipContent = customTips[c.id] !== undefined ? customTips[c.id] : c.dica;
        if (showTips && !isTipDisabled && tipContent && tipContent.trim()) {
          text += `💡 _Dica: ${tipContent}_\n`;
        }
        text += `\n`;
      });
    }

    if (customNote && customNote.trim()) {
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `💚🩺 *Orientação do Médico para este Mês:*\n`;
      text += `"${customNote.trim()}"\n\n`;
    }

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✨ _Nex-Ai.NEFRO • Cuidando de você e da sua saúde a cada sessão!_`;

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
          selectedCardIds={activeCardIds}
          showTips={showTips}
          customTips={customTips}
          disabledTips={disabledTips}
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
        backgroundColor: 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(8px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 99999, 
        padding: '0.75rem'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-in patient-bulletin-modal-container" 
        style={{ 
          background: '#ffffff', 
          width: '96vw', 
          maxWidth: '1240px', 
          height: '92vh', 
          display: 'flex', 
          flexDirection: 'column', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', 
          borderRadius: '16px', 
          overflow: 'hidden' 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= BARRA SUPERIOR DE CABEÇALHO ================= */}
        <div className="flex justify-between items-center px-4 py-3 border-b no-print" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
          <div className="flex items-center gap-2.5">
            <div style={{ background: '#dbeafe', padding: '0.5rem', borderRadius: '10px' }}>
              <Trophy size={18} color="#2563eb" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800 m-0">
                  Boletim de Saúde do Paciente
                </h2>
                <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                  {patient.nome}
                </span>
              </div>
              <span className="text-xxs text-muted block">
                Painel do Médico • Escolha o que sai na impressão e personalize a conduta
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleCopyWhatsApp}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px', borderColor: '#86efac', color: '#166534', background: '#f0fdf4' }}
              title="Copiar texto formatado para enviar no WhatsApp"
            >
              {copied ? <Check size={14} color="#16a34a" /> : <Share2 size={14} />}
              <span>{copied ? 'Copiado!' : 'WhatsApp'}</span>
            </button>

            <button 
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="btn btn-outline"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Baixar arquivo PDF nativo"
            >
              {isDownloadingPdf ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} color="#2563eb" />}
              <span>{isDownloadingPdf ? 'Gerando...' : 'PDF'}</span>
            </button>

            <button 
              type="button"
              onClick={handlePrint}
              className="btn btn-primary"
              style={{ padding: '0.4rem 1rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Imprimir folha A4"
            >
              <Printer size={14} />
              <span>Imprimir</span>
            </button>

            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-outline" 
              style={{ padding: '0.4rem', borderRadius: '50%', marginLeft: '4px' }}
              title="Fechar"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ================= CORPO PRINCIPAL (2 COLUNAS: SIDEBAR + PREVIEW) ================= */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* ----- COLUNA ESQUERDA: BARRA LATERAL DE CONFIGURAÇÃO DO MÉDICO ----- */}
          <div 
            className="no-print"
            style={{
              width: '390px',
              minWidth: '350px',
              borderRight: '1px solid #e2e8f0',
              background: '#f8fafc',
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {/* Seletor de Coleta */}
            <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar size={13} color="#2563eb" />
                <label className="text-xs font-bold text-slate-700">Mês / Coleta Avaliada:</label>
              </div>
              <select
                className="input-field w-full"
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
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

            {/* Seleção de Indicadores que vão para o Boletim */}
            <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <Filter size={13} color="#2563eb" />
                  <label className="text-xs font-bold text-slate-700">Metas no Boletim:</label>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>
                  {activeCardIds.length} de {allCardIds.length} selecionadas
                </span>
              </div>

              {/* Botões Rápidos de Seleção */}
              <div className="flex gap-1.5 mb-2.5">
                <button
                  type="button"
                  onClick={handleSelectCritical}
                  className="btn btn-outline flex-1"
                  style={{ padding: '0.25rem 0.4rem', fontSize: '0.7rem', borderColor: '#fca5a5', color: '#b91c1c', background: '#fff5f5' }}
                  title="Marca apenas metas em atenção ou quase lá"
                >
                  ⚡ Focar Críticos
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                  title="Selecionar todos os exames"
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                  title="Desmarcar todos"
                >
                  Limpar
                </button>
              </div>

              {/* Lista de Checkboxes dos Cards com Gaveta de Dica Customizada */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '250px', overflowY: 'auto' }}>
                {(bulletinData?.cards || []).map(card => {
                  const isChecked = activeCardIds.includes(card.id);
                  const isConquista = card.status === GOAL_STATUS.CONQUISTA;
                  const isAtenção = card.status === GOAL_STATUS.ATENCAO;

                  const badgeColor = isConquista ? '#166534' : (isAtenção ? '#991b1b' : '#92400e');
                  const badgeBg = isConquista ? '#ecfdf5' : (isAtenção ? '#fef2f2' : '#fef3c7');
                  const badgeText = isConquista ? '🟢 Ok' : (isAtenção ? '🔴 Atenção' : '🟡 Quase');

                  const isEditingThisTip = editingTipCardId === card.id;
                  const hasCustomTip = customTips[card.id] !== undefined && customTips[card.id] !== card.dica;
                  const isTipDisabled = disabledTips[card.id] === true;

                  return (
                    <div key={card.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div
                        onClick={() => toggleCard(card.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          background: isChecked ? '#f0fdf4' : '#ffffff',
                          border: isChecked ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flex: 1, minWidth: 0 }}>
                          {isChecked ? (
                            <CheckSquare size={14} color="#16a34a" />
                          ) : (
                            <Square size={14} color="#94a3b8" />
                          )}
                          <span style={{ fontSize: '0.75rem', fontWeight: isChecked ? '700' : '500', color: isChecked ? '#0f172a' : '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {card.subtitulo || card.categoria}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#1e293b' }}>
                            {card.valorFormatado}
                          </span>
                          <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '1px 5px', borderRadius: '4px', background: badgeBg, color: badgeColor }}>
                            {badgeText}
                          </span>

                          {/* Botão de personalização da dica da meta */}
                          {isChecked && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTipCardId(isEditingThisTip ? null : card.id);
                              }}
                              style={{
                                padding: '2px 5px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: isEditingThisTip ? '#eff6ff' : (hasCustomTip ? '#fef3c7' : '#f8fafc'),
                                cursor: 'pointer',
                                fontSize: '0.65rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                color: isTipDisabled ? '#94a3b8' : (hasCustomTip ? '#b45309' : '#475569')
                              }}
                              title={isTipDisabled ? 'Dica oculta' : (hasCustomTip ? 'Dica personalizada pelo médico' : 'Personalizar dica deste exame')}
                            >
                              <Lightbulb size={11} color={isTipDisabled ? '#94a3b8' : (hasCustomTip ? '#d97706' : '#2563eb')} />
                              <span>{hasCustomTip ? 'Editada' : 'Dica'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Gaveta de edição da dica da meta */}
                      {isChecked && isEditingThisTip && (
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          marginLeft: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '5px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#334155' }}>
                              Dica de Hábito • {card.subtitulo}:
                            </span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.65rem', color: '#64748b' }}>
                              <input
                                type="checkbox"
                                checked={!isTipDisabled}
                                onChange={(e) => {
                                  setDisabledTips({ ...disabledTips, [card.id]: !e.target.checked });
                                }}
                              />
                              Exibir
                            </label>
                          </div>

                          {!isTipDisabled && (
                            <>
                              <textarea
                                className="input-field w-full"
                                rows={2}
                                style={{ fontSize: '0.72rem', padding: '4px 6px' }}
                                placeholder={`Dica padrão: ${card.dica}`}
                                value={customTips[card.id] !== undefined ? customTips[card.id] : card.dica}
                                onChange={(e) => {
                                  setCustomTips({ ...customTips, [card.id]: e.target.value });
                                }}
                              />
                              {hasCustomTip && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = { ...customTips };
                                    delete updated[card.id];
                                    setCustomTips(updated);
                                  }}
                                  style={{
                                    alignSelf: 'flex-start',
                                    background: 'none',
                                    border: 'none',
                                    color: '#2563eb',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: 0
                                  }}
                                >
                                  Restaurar dica padrão do sistema
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controle Mestre de Dicas dos Cartões */}
            <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <label 
                style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer' }}
                onClick={() => setShowTips(!showTips)}
              >
                {showTips ? <CheckSquare size={15} color="#2563eb" /> : <Square size={15} color="#94a3b8" />}
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Exibir Dicas de Hábitos nos Cartões</span>
                  <span className="text-xxs text-muted block">
                    {showTips ? 'Dicas ativadas (visual educativo completo)' : 'Dicas ocultas (visual mais limpo e focado na sua conduta)'}
                  </span>
                </div>
              </label>
            </div>

            {/* Observação / Conduta Médica do Mês (Inicia em Branco por Padrão) */}
            <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Stethoscope size={13} color="#2563eb" />
                  <label className="text-xs font-bold text-slate-800">Orientação Médica do Mês:</label>
                </div>
                {customNote && (
                  <button
                    type="button"
                    onClick={() => setCustomNote('')}
                    className="text-xxs text-red-600 hover:underline flex items-center gap-0.5"
                    title="Limpar recomendação médica"
                  >
                    <Eraser size={11} /> Limpar
                  </button>
                )}
              </div>

              {/* Textarea para recomendação médica */}
              <textarea
                className="input-field w-full mb-2"
                rows={3}
                style={{ fontSize: '0.78rem', resize: 'vertical' }}
                placeholder="Escreva a recomendação para o paciente..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />

              {/* Textos Rápidos (Presets Clínicos) */}
              <div>
                <span className="text-xxs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Textos Rápidos (Clique para inserir):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {QUICK_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddPreset(preset.text)}
                      className="btn btn-outline"
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.67rem',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        textAlign: 'left',
                        whiteSpace: 'nowrap'
                      }}
                      title={preset.text}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ----- COLUNA DIREITA: LIVE PREVIEW DA FOLHA A4 EM TEMPO REAL ("O QUE MARCAR, APARECE") ----- */}
          <div 
            style={{
              flex: 1,
              background: '#f1f5f9',
              overflowY: 'auto',
              padding: '1.25rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start'
            }}
          >
            <div 
              id="printable-patient-bulletin-doc" 
              className="printable-patient-bulletin-area" 
              style={{
                background: '#ffffff',
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '740px',
                border: '1px solid #e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              <PatientBulletinPrintDocument 
                bulletinData={bulletinData}
                doctorInfo={doctorInfo}
                customNote={customNote}
                selectedCardIds={activeCardIds}
                showTips={showTips}
                customTips={customTips}
                disabledTips={disabledTips}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
