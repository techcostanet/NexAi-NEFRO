import React from 'react';
import { 
  Trophy, 
  Heart, 
  Droplet, 
  Bone,
  Utensils,
  GlassWater,
  BatteryCharging,
  Zap,
  Filter,
  Apple,
  Thermometer,
  Leaf,
  Wind,
  Sun,
  Pill,
  Sparkles
} from 'lucide-react';
import { GOAL_STATUS } from '../../services/patientEducationService';
import { getVisualDataForCard } from './bulletinVisualCatalog';
import { normalizeDateToString } from '../../utils/dateUtils';

const renderVisualDocIcon = (tema, color, size = 18) => {
  const props = { size, color, strokeWidth: 2.2 };
  switch (tema) {
    case 'coracao': return <Heart {...props} />;
    case 'sangue': return <Droplet {...props} />;
    case 'ossos': return <Bone {...props} />;
    case 'nutricao': return <Utensils {...props} />;
    case 'sal': return <GlassWater {...props} />;
    case 'energia': return <BatteryCharging {...props} />;
    case 'circulacao': return <Zap {...props} />;
    case 'sol': return <Sun {...props} />;
    case 'filtro': return <Filter {...props} />;
    case 'acucar': return <Apple {...props} />;
    case 'febre':
    case 'defesa': return <Thermometer {...props} />;
    case 'figado': return <Leaf {...props} />;
    case 'leveza': return <Wind {...props} />;
    default: return <Bone {...props} />;
  }
};

/**
 * 🎨 DOCUMENTO IMPRESSO LÚDICO: BOLETIM VISUAL & PICTOGRÁFICO DE SAÚDE
 * Calibrado especialmente para pacientes com baixa escolaridade formal,
 * dificuldades de leitura ou limitações visuais.
 * Transforma números laboratoriais em órgãos, semáforos de carinhas e figuras de ação.
 * Rigorosamente calibrado para 1 ÚNICA FOLHA A4.
 */
export default function PatientBulletinVisualDocument({
  bulletinData,
  patient,
  doctorInfo,
  customNote = '',
  selectedCardIds = null,
  enabledTips = {},
  customTips = {},
  includePrescription = false,
  prescriptionItems = [],
  fontSizeLevel = 'padrao'
}) {
  if (!bulletinData) return null;

  const {
    pacienteNome,
    dataReferencia,
    cards = []
  } = bulletinData;

  // Filtra cartões conforme seleção do médico
  const displayCards = Array.isArray(selectedCardIds)
    ? cards.filter(c => selectedCardIds.includes(c.id))
    : cards;

  const totalMetas = displayCards.length;
  const metasBatidas = displayCards.filter(c => c.status === GOAL_STATUS.CONQUISTA).length;
  const taxaSucesso = totalMetas > 0 ? Math.round((metasBatidas / totalMetas) * 100) : 100;

  // Prescrição válida
  const validPrescriptionItems = (Array.isArray(prescriptionItems) ? prescriptionItems : []).filter(
    it => it && it.medicamento && String(it.medicamento).trim() !== ''
  );
  const hasPrescription = Boolean(includePrescription && validPrescriptionItems.length > 0);
  const totalMeds = hasPrescription ? validPrescriptionItems.length : 0;

  // Densidade A4
  const isCompact = hasPrescription && (totalMetas >= 8 || totalMeds >= 4);
  const isSpacious = totalMetas <= 4 && (!hasPrescription || totalMeds <= 2);
  const isSingleColumn = totalMetas <= 2;

  // 3 Níveis de fontes: 'padrao' | 'medio' | 'grande' (Acessibilidade Visual Lúdica)
  const isMedio = fontSizeLevel === 'medio';
  const isGrande = fontSizeLevel === 'grande';

  const visualSizes = {
    clinicName: isGrande ? '15px' : (isMedio ? '14px' : '13px'),
    bulletinTag: isGrande ? '12px' : (isMedio ? '11px' : '10px'),
    patientLabel: isGrande ? '14px' : (isMedio ? '13px' : '12px'),
    patientName: isGrande ? '22px' : (isMedio ? '20px' : '18px'),
    dateRef: isGrande ? '14px' : (isMedio ? '13px' : '12px'),
    docName: isGrande ? '12px' : (isMedio ? '11px' : '10px'),
    docCrm: isGrande ? '10.5px' : (isMedio ? '9.5px' : '9px'),

    trophyTitle: isGrande ? '16px' : (isMedio ? '15px' : (isSpacious ? '14px' : '13px')),
    trophyBadge: isGrande ? '13px' : (isMedio ? '12px' : '11px'),
    trophyMsg: isGrande ? '13px' : (isMedio ? '11.5px' : (isSpacious ? '11px' : '10px')),
    trophyIcon: isGrande ? (isSpacious ? 28 : 24) : (isMedio ? (isSpacious ? 26 : 22) : (isSpacious ? 24 : 20)),
    trophyCircle: isGrande ? (isSpacious ? '52px' : '46px') : (isMedio ? (isSpacious ? '48px' : '42px') : (isSpacious ? '46px' : '40px')),

    cardIconCircle: isGrande ? (isSpacious ? '40px' : '36px') : (isMedio ? (isSpacious ? '36px' : '32px') : (isSpacious ? '34px' : '30px')),
    cardIcon: isGrande ? (isSpacious ? 22 : 20) : (isMedio ? (isSpacious ? 20 : 18) : (isSpacious ? 19 : 17)),
    cardTitle: isGrande ? (isSpacious ? '15px' : '13.5px') : (isMedio ? (isSpacious ? '14px' : '12.5px') : (isSpacious ? '13px' : '11.5px')),
    cardSub: isGrande ? (isSpacious ? '11.5px' : '10.5px') : (isMedio ? (isSpacious ? '10.5px' : '9.5px') : (isSpacious ? '9.5px' : '8.5px')),
    cardValueBadge: isGrande ? '9.5px' : (isMedio ? '8.5px' : '7.5px'),
    cardStatusFace: isGrande ? (isSpacious ? '18px' : '16px') : (isMedio ? (isSpacious ? '16px' : '14px') : (isSpacious ? '14px' : '12px')),
    cardStatusText: isGrande ? (isSpacious ? '12px' : '11px') : (isMedio ? (isSpacious ? '11px' : '10px') : (isSpacious ? '10px' : '9px')),
    cardTipText: isGrande ? (isSpacious ? '12px' : '11px') : (isMedio ? (isSpacious ? '10.5px' : '9.5px') : (isSpacious ? '9.5px' : '8.5px')),

    prescHeader: isGrande ? '14px' : (isMedio ? '12.5px' : (isCompact ? '10.5px' : (isSpacious ? '12px' : '11px'))),
    prescPeriodTitle: isGrande ? '12px' : (isMedio ? '10.5px' : '9.5px'),
    prescMedName: isGrande ? '12.5px' : (isMedio ? '11px' : (isCompact ? '9px' : (isSpacious ? '10.5px' : '9.5px'))),
    prescPoso: isGrande ? '11px' : (isMedio ? '9.5px' : (isCompact ? '8px' : (isSpacious ? '9px' : '8.5px'))),
    prescVia: isGrande ? '9.5px' : (isMedio ? '8.5px' : '7.5px'),

    noteTitle: isGrande ? '13.5px' : (isMedio ? '12px' : (isSpacious ? '12px' : '10.5px')),
    noteContent: isGrande ? '13px' : (isMedio ? '11.5px' : (isSpacious ? '11px' : '9.5px')),

    footerDoctor: isGrande ? '12px' : (isMedio ? '11px' : '10px'),
    footerCrm: isGrande ? '10.5px' : (isMedio ? '9.5px' : '8.5px'),
    footerNote: isGrande ? '10px' : (isMedio ? '9px' : '8px')
  };

  const doctorName = doctorInfo?.nome || 'Dr(a). Médico(a) Responsável';
  const doctorCrm = doctorInfo?.crm ? `CRM-${doctorInfo?.ufCrm || 'MG'} ${doctorInfo?.crm}` : 'Nefrologista Responsável';
  const doctorClinica = patient?.clinica || bulletinData?.pacienteClinica || bulletinData?.clinicaNome || doctorInfo?.clinicaPrincipal || 'Clínica de Hemodiálise';

  const cleanDateRef = normalizeDateToString(dataReferencia);
  const dataObj = cleanDateRef ? new Date(cleanDateRef + 'T12:00:00') : new Date();
  const mesAnoExtenso = dataObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const mesFormatado = mesAnoExtenso.charAt(0).toUpperCase() + mesAnoExtenso.slice(1);

  // Mensagem lúdica do troféu
  let trofeuTitulo = 'Campeão da Saúde! 🏆';
  let trofeuMensagem = `Parabéns! Você alcançou ${metasBatidas} de ${totalMetas} vitórias de ouro neste mês! Seu esforço em cada sessão de diálise está deixando seu corpo mais forte.`;
  if (taxaSucesso < 75 && taxaSucesso >= 45) {
    trofeuTitulo = 'Grandes Vitórias! 🌟';
    trofeuMensagem = `Muito bem! Você conquistou ${metasBatidas} vitórias importantes! Com os cuidados das dicas abaixo, no próximo mês vamos ganhar ainda mais medalhas!`;
  } else if (taxaSucesso < 45) {
    trofeuTitulo = 'Estamos Juntos com Você! 💪';
    trofeuMensagem = `Cada dia na máquina é um passo de vitória. Toda a equipe está de mãos dadas com você para proteger sua vida e seu bem-estar!`;
  }

  // Agrupamento lúdico de remédios por período do dia (se houver prescrição)
  const categorizePeriod = (posologia = '') => {
    const text = posologia.toLowerCase();
    if (text.includes('noite') || text.includes('jantar') || text.includes('dormir') || text.includes('20h') || text.includes('22h')) {
      return 'noite';
    }
    if (text.includes('almoço') || text.includes('meio-dia') || text.includes('12h') || text.includes('14h') || text.includes('refeição') || text.includes('refeicoes')) {
      return 'tarde';
    }
    return 'manha';
  };

  const hasCustomNote = customNote && customNote.trim() !== '';

  return (
    <div className="printable-patient-bulletin-area">
      <div className="patient-bulletin-a4-sheet" style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#0f172a',
        background: '#ffffff',
        width: '100%',
        maxWidth: '740px',
        margin: '0 auto',
        padding: isGrande ? '12px 14px' : (isSpacious ? '14px 18px' : '10px 14px'),
        boxSizing: 'border-box'
      }}>

        {/* ================= CABEÇALHO LÚDICO ACOLHEDOR ================= */}
        <div style={{
          borderBottom: '2px dashed #93c5fd',
          paddingBottom: '8px',
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {doctorInfo?.logoUrl && (
              <img 
                src={doctorInfo.logoUrl} 
                alt="Logomarca Médica" 
                style={{ maxHeight: isGrande ? '48px' : '44px', maxWidth: '100px', objectFit: 'contain' }} 
              />
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: visualSizes.clinicName, fontWeight: '900', color: '#1e40af', letterSpacing: '0.5px' }}>
                  {doctorClinica.toUpperCase()}
                </span>
                <span style={{ 
                  fontSize: visualSizes.bulletinTag, 
                  background: '#dbeafe', 
                  color: '#1d4ed8', 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontWeight: '800',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Sparkles size={11} color="#2563eb" /> Boletim Ilustrado
                </span>
              </div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: visualSizes.patientLabel, color: '#475569', fontWeight: '600' }}>Paciente:</span>
              <h1 style={{ margin: 0, fontSize: visualSizes.patientName, fontWeight: '900', color: '#0f172a', letterSpacing: '-0.3px' }}>
                {pacienteNome}
              </h1>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: visualSizes.dateRef, fontWeight: '800', color: '#1e3a8a' }}>
              {mesFormatado}
            </div>
            <div style={{ fontSize: visualSizes.docName, color: '#475569', marginTop: '1px' }}>
              Médico: <strong>{doctorName}</strong>
            </div>
            <div style={{ fontSize: visualSizes.docCrm, color: '#64748b' }}>
              {doctorCrm}
            </div>
          </div>
        </div>

        {/* ================= PLACAR DO CAMPEÃO (MEDALHÃO DE ESTRELAS) ================= */}
        {totalMetas > 0 ? (
          <div style={{
            background: 'linear-gradient(135deg, #fefce8 0%, #ecfdf5 50%, #eff6ff 100%)',
            border: '2px solid #facc15',
            borderRadius: '12px',
            padding: isGrande ? '10px 14px' : (isSpacious ? '10px 14px' : '7px 12px'),
            marginBottom: isSpacious ? '10px' : '7px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 6px -1px rgba(250, 204, 21, 0.2)'
          }}>
            {/* Medalha Dourada com Estrela */}
            <div style={{
              background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
              color: '#ffffff',
              borderRadius: '50%',
              width: visualSizes.trophyCircle,
              height: visualSizes.trophyCircle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(202, 138, 4, 0.35)',
              border: '2px solid #ffffff'
            }}>
              <Trophy size={visualSizes.trophyIcon} color="#ffffff" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                <strong style={{ fontSize: visualSizes.trophyTitle, color: '#854d0e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {trofeuTitulo}
                </strong>

                {/* Estrelinhas de Sucesso */}
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #facc15',
                  padding: '2px 8px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: visualSizes.trophyBadge, fontWeight: '900', color: '#a16207' }}>
                    ⭐ {metasBatidas} de {totalMetas} Conquistas ({taxaSucesso}%)
                  </span>
                </div>
              </div>

              <p style={{ margin: '2px 0 0 0', fontSize: visualSizes.trophyMsg, color: '#334155', lineHeight: '1.35', fontWeight: '500' }}>
                {trofeuMensagem}
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#f8fafc',
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            marginBottom: '10px',
            color: '#64748b'
          }}>
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>🎨</span>
            <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>
              Nenhum exame selecionado para o boletim ilustrado
            </strong>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Marque os itens desejados no painel à esquerda para montar os cartões visuais.
            </span>
          </div>
        )}

        {/* ================= GRADE PICTOGRÁFICA DE SAÚDE ================= */}
        {totalMetas > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isSingleColumn ? '1fr' : '1fr 1fr',
            gap: isGrande ? '8px' : (isSpacious ? '8px' : '6px'),
            marginBottom: isSpacious ? '10px' : '6px'
          }}>
            {displayCards.map(card => {
              const visual = getVisualDataForCard(card);
              if (!visual) return null;

              // Dica personalizada ou do catálogo (SOMENTE SE HABILITADA PELO MÉDICO)
              const isTipEnabled = enabledTips[card.id] === true;
              const customTip = customTips[card.id];
              const tipContent = (customTip !== undefined && customTip.trim() !== '')
                ? customTip.replace(/^["']|["']$/g, '').trim()
                : (card.dica || visual.acaoTexto);

              return (
                <div
                  key={card.id}
                  style={{
                    background: visual.bgTema,
                    border: `1.5px solid ${visual.bordaTema}`,
                    borderRadius: '10px',
                    padding: isTipEnabled ? (isGrande ? '8px 11px' : (isSpacious ? '7px 10px' : '5px 8px')) : (isGrande ? '7px 11px' : (isSpacious ? '6px 10px' : '4px 8px')),
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: isTipEnabled ? (isGrande ? '5px' : (isSpacious ? '4px' : '3px')) : '0px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid'
                  }}
                >
                  {/* Linha Principal: Figura do Órgão + Nome Lúdico + Valor Técnico + Semáforo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      {/* Ícone Lúdico em Círculo Colorido */}
                      <div style={{
                        background: '#ffffff',
                        border: `1.5px solid ${visual.corTema}`,
                        borderRadius: '50%',
                        width: visualSizes.cardIconCircle,
                        height: visualSizes.cardIconCircle,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)'
                      }}>
                        {renderVisualDocIcon(visual.tema, visual.corTema, visualSizes.cardIcon)}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        {/* Nome do Órgão / Sistema em Letra Grande */}
                        <strong style={{ fontSize: visualSizes.cardTitle, color: '#0f172a', display: 'block', lineHeight: 1.15 }}>
                          {visual.titulo}
                        </strong>
                        <span style={{ fontSize: visualSizes.cardSub, color: '#64748b', fontWeight: '600' }}>
                          {visual.subtitulo}
                        </span>
                      </div>
                    </div>

                    {/* Lado Direito: Valor Técnico + Semáforo de Carinha Universal */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{
                        fontSize: visualSizes.cardValueBadge,
                        color: '#64748b',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontWeight: 'bold'
                      }}>
                        {card.valorFormatado}
                      </span>

                      <div style={{
                        background: visual.bgStatus,
                        border: `1.5px solid ${visual.bordaStatus}`,
                        color: visual.corStatus,
                        padding: isGrande ? '4px 9px' : (isSpacious ? '3px 8px' : '2px 6px'),
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{ fontSize: visualSizes.cardStatusFace, lineHeight: 1 }}>
                          {visual.carinha}
                        </span>
                        <strong style={{ fontSize: visualSizes.cardStatusText, letterSpacing: '0.2px' }}>
                          {visual.rotuloStatus}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Linha de Dica (SOMENTE SE O MÉDICO MARCAR "EXIBIR") */}
                  {isTipEnabled && Boolean(tipContent) && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid rgba(226, 232, 240, 0.9)',
                      borderRadius: '6px',
                      padding: isGrande ? '4px 8px' : (isSpacious ? '3px 7px' : '2px 6px'),
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      marginTop: '2px'
                    }}>
                      <span style={{ fontSize: isGrande ? '14px' : (isSpacious ? '12px' : '11px'), flexShrink: 0 }}>
                        {visual.acaoIcone}
                      </span>
                      <p style={{
                        margin: 0,
                        fontSize: visualSizes.cardTipText,
                        color: '#1e293b',
                        fontWeight: '600',
                        lineHeight: 1.25
                      }}>
                        "{tipContent}"
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

        {/* ================= CARTELA LÚDICA DE REMÉDIOS (QUANDO HABILITADA) ================= */}
        {hasPrescription && (
          <div style={{
            background: '#f8fafc',
            border: '2px solid #cbd5e1',
            borderRadius: '10px',
            padding: isGrande ? '8px 12px' : (isCompact ? '5px 8px' : (isSpacious ? '8px 12px' : '6px 10px')),
            marginBottom: isCompact ? '5px' : (isSpacious ? '8px' : '6px'),
            breakInside: 'avoid',
            pageBreakInside: 'avoid'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: isSpacious ? '15px' : '13px', lineHeight: 1 }}>💊</span>
                <strong style={{ fontSize: visualSizes.prescHeader, color: '#1e293b' }}>
                  Seus Remédios de Uso Diário
                </strong>
              </div>
              <span style={{ fontSize: visualSizes.prescPeriodTitle, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 6px', borderRadius: '8px', fontWeight: 'bold' }}>
                Tome nos horários certos
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: validPrescriptionItems.length <= 1 ? '1fr' : '1fr 1fr',
              gap: isCompact ? '4px' : (isSpacious ? '6px' : '5px')
            }}>
              {validPrescriptionItems.map((item, idx) => {
                const period = categorizePeriod(item.posologia);
                const periodIcon = period === 'manha' ? '☀️ Manhã' : (period === 'tarde' ? '🍽️ Almoço' : '🌙 Noite');
                const periodBg = period === 'manha' ? '#fefce8' : (period === 'tarde' ? '#fff7ed' : '#f5f3ff');
                const periodBorder = period === 'manha' ? '#fef08a' : (period === 'tarde' ? '#fed7aa' : '#ddd6fe');
                const periodColor = period === 'manha' ? '#854d0e' : (period === 'tarde' ? '#9a3412' : '#5b21b6');

                return (
                  <div
                    key={item.id || idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: isGrande ? '5px 8px' : (isCompact ? '3px 6px' : '4px 7px'),
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: isGrande ? '14px' : '12px' }}>💊</span>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: visualSizes.prescMedName, color: '#0f172a', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.medicamento}
                        </strong>
                        <span style={{ fontSize: visualSizes.prescPoso, color: '#475569', display: 'block', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.posologia || 'Conforme orientação médica'}
                        </span>
                      </div>
                    </div>

                    <span style={{
                      fontSize: visualSizes.prescVia,
                      fontWeight: '800',
                      background: periodBg,
                      border: `1px solid ${periodBorder}`,
                      color: periodColor,
                      padding: '1px 5px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {periodIcon}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= RECADO DO MÉDICO (BALÃO DE FALA CARINHOSO) ================= */}
        {hasCustomNote && (
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '2px solid #86efac',
            borderRadius: '10px',
            padding: isGrande ? '10px 14px' : (isSpacious ? '8px 12px' : '6px 10px'),
            marginBottom: '8px',
            breakInside: 'avoid',
            pageBreakInside: 'avoid'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <span style={{ fontSize: isGrande ? '18px' : (isSpacious ? '16px' : '14px'), lineHeight: 1 }}>🩺💬</span>
              <strong style={{ fontSize: visualSizes.noteTitle, color: '#166534' }}>
                Recado do Dr(a). {doctorName} para você este mês:
              </strong>
            </div>
            <p style={{
              margin: 0,
              fontSize: visualSizes.noteContent,
              color: '#14532d',
              lineHeight: '1.35',
              fontWeight: '700'
            }}>
              "{customNote.trim()}"
            </p>
          </div>
        )}

        {/* ================= RODAPÉ ACOLHEDOR & ASSINATURA ================= */}
        <div style={{
          borderTop: '1px dashed #cbd5e1',
          paddingTop: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: visualSizes.footerNote,
          color: '#64748b'
        }}>
          <div>
            <span style={{ fontWeight: '700', color: '#1e40af' }}>
              ❤️ Toda a nossa equipe de Diálise está torcendo por você!
            </span>
            <span style={{ display: 'block', color: '#94a3b8', fontSize: '8px' }}>
              Guarde este boletim na sua casa ou na porta da geladeira para lembrar das suas vitórias.
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontWeight: '800', color: '#1e293b', fontSize: visualSizes.footerDoctor }}>
              {doctorName}
            </span>
            <span style={{ fontSize: visualSizes.footerCrm, color: '#64748b' }}>
              {doctorCrm} • Nefrologia
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
