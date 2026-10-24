import React from 'react';
import { 
  Trophy, 
  Heart, 
  Droplet, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Award
} from 'lucide-react';
import { GOAL_STATUS } from '../../services/patientEducationService';
import { normalizeDateToString } from '../../utils/dateUtils';

/**
 * 📄 DOCUMENTO IMPRESSO OFICIAL: BOLETIM DE CONQUISTAS & METAS DE SAÚDE DO PACIENTE
 * Calibrado com precisão para 1 ÚNICA FOLHA A4 COLORIDA, legível para todas as idades.
 */
function cleanMetaText(meta) {
  if (!meta) return '';
  const cleaned = String(meta).replace(/^Meta:\s*/i, '').trim();
  return `Meta: ${cleaned}`;
}

export default function PatientBulletinPrintDocument({
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
    tituloPlacar,
    mensagemGeral,
    cards = []
  } = bulletinData;

  // Filtra cartões conforme seleção estrita do médico (sem fallback forçado)
  const displayCards = Array.isArray(selectedCardIds)
    ? cards.filter(c => selectedCardIds.includes(c.id))
    : cards;

  const totalMetas = displayCards.length;
  const metasBatidas = displayCards.filter(c => c.status === GOAL_STATUS.CONQUISTA).length;
  const taxaSucesso = totalMetas > 0 ? Math.round((metasBatidas / totalMetas) * 100) : 100;

  // Itens de prescrição ativos
  const validPrescriptionItems = (Array.isArray(prescriptionItems) ? prescriptionItems : []).filter(
    it => it && it.medicamento && String(it.medicamento).trim() !== ''
  );
  const hasPrescription = Boolean(includePrescription && validPrescriptionItems.length > 0);
  const totalMeds = hasPrescription ? validPrescriptionItems.length : 0;

  // Mensagem dinâmica coerente com os cartões selecionados
  let mensagemFinal = mensagemGeral;
  if (totalMetas > 0) {
    if (taxaSucesso >= 75) {
      mensagemFinal = `Sensacional! Você atingiu ${metasBatidas} de ${totalMetas} metas de saúde com louvor neste mês. Seu esforço e disciplina nas sessões de diálise estão transformando sua qualidade de vida!`;
    } else if (taxaSucesso >= 45) {
      mensagemFinal = `Muito bem! Você conquistou vitórias importantes neste mês (${metasBatidas} metas batidas). Com pequenos ajustes na rotina e nas dicas da equipe, no próximo mês chegaremos ainda mais longe!`;
    } else {
      mensagemFinal = `Cada mês é uma nova oportunidade de recomeço e vitória. Toda a nossa equipe de Nefrologia está de mãos dadas com você para alcançarmos o melhor bem-estar possível!`;
    }
  }

  // Calibra a densidade para acomodar metas + prescrição em 1 folha A4 com proporção balanceada
  const isCompact = hasPrescription && (totalMetas >= 8 || totalMeds >= 4);
  const isSpacious = totalMetas <= 4 && (!hasPrescription || totalMeds <= 2);
  const isSingleColumn = totalMetas <= 2;

  // 3 Níveis de tamanho de fontes: 'padrao' | 'medio' | 'grande' (Acessibilidade Visual)
  const isMedio = fontSizeLevel === 'medio';
  const isGrande = fontSizeLevel === 'grande';

  const fontSizes = {
    clinicName: isGrande ? '15px' : (isMedio ? '14px' : '13px'),
    bulletinTag: isGrande ? '12px' : (isMedio ? '11px' : '10px'),
    mainTitle: isGrande ? '22px' : (isMedio ? '20px' : '18px'),
    patientLabel: isGrande ? '14px' : (isMedio ? '13px' : '12px'),
    patientName: isGrande ? '16px' : (isMedio ? '14.5px' : '13px'),
    dateRef: isGrande ? '14px' : (isMedio ? '13px' : '12px'),
    docName: isGrande ? '12px' : (isMedio ? '11px' : '10px'),
    docCrm: isGrande ? '10.5px' : (isMedio ? '9.5px' : '9px'),

    trophyIcon: isGrande ? (isSpacious ? 24 : 22) : (isMedio ? (isSpacious ? 22 : 20) : (isSpacious ? 20 : 18)),
    trophyCircle: isGrande ? (isSpacious ? '46px' : '42px') : (isMedio ? (isSpacious ? '42px' : '38px') : (isSpacious ? '40px' : '36px')),
    bannerTitle: isGrande ? '15px' : (isMedio ? '14px' : (isSpacious ? '13px' : '12px')),
    bannerBadge: isGrande ? '13.5px' : (isMedio ? '12.5px' : (isSpacious ? '12px' : '11px')),
    bannerText: isGrande ? '13px' : (isMedio ? '11.5px' : (isSpacious ? '11px' : '10px')),

    cardIcon: isGrande ? (isSpacious ? 19 : 17) : (isMedio ? (isSpacious ? 17 : 15) : (isSpacious ? 16 : 14)),
    cardTitle: isGrande ? (isSpacious ? '14px' : '12.5px') : (isMedio ? (isSpacious ? '13px' : '11.5px') : (isSpacious ? '12px' : '10.5px')),
    cardBadge: isGrande ? (isSpacious ? '12px' : '11px') : (isMedio ? (isSpacious ? '11px' : '10px') : (isSpacious ? '10px' : '9px')),
    cardResult: isGrande ? (isSpacious ? '14.5px' : '13px') : (isMedio ? (isSpacious ? '13px' : '11.5px') : (isSpacious ? '12px' : '10.5px')),
    cardMeta: isGrande ? (isSpacious ? '11px' : '10px') : (isMedio ? (isSpacious ? '10px' : '9px') : (isSpacious ? '9px' : '8px')),
    cardTip: isGrande ? (isSpacious ? '12px' : '11px') : (isMedio ? (isSpacious ? '10.5px' : '9.5px') : (isSpacious ? '9.5px' : '8.5px')),

    prescHeader: isGrande ? '13.5px' : (isMedio ? '12px' : (isCompact ? '10px' : (isSpacious ? '11.5px' : '10.5px'))),
    prescBadge: isGrande ? '10px' : (isMedio ? '9px' : (isCompact ? '7.5px' : '8.5px')),
    prescMed: isGrande ? '12px' : (isMedio ? '10.5px' : (isCompact ? '9px' : (isSpacious ? '10.5px' : '9.5px'))),
    prescPoso: isGrande ? '10.5px' : (isMedio ? '9.5px' : (isCompact ? '8px' : (isSpacious ? '9px' : '8.5px'))),
    prescVia: isGrande ? '9.5px' : (isMedio ? '8.5px' : (isCompact ? '7px' : '8px')),

    noteHeader: isGrande ? '13.5px' : (isMedio ? '12px' : (isSpacious ? '12px' : '10.5px')),
    noteText: isGrande ? '13px' : (isMedio ? '11px' : (isSpacious ? '11px' : '9.5px')),

    footerText: isGrande ? '10.5px' : (isMedio ? '9.5px' : '9px'),
    footerSub: isGrande ? '9.5px' : (isMedio ? '8.5px' : '8px'),
    footerDoc: isGrande ? '11.5px' : (isMedio ? '10px' : '9px'),
    footerCrm: isGrande ? '10px' : (isMedio ? '9px' : '8.5px')
  };

  const doctorName = doctorInfo?.nome || 'Dr(a). Médico(a) Responsável';
  const doctorCrm = doctorInfo?.crm ? `CRM-${doctorInfo?.ufCrm || 'MG'} ${doctorInfo?.crm}` : 'Nefrologista Responsável';
  const doctorClinica = patient?.clinica || bulletinData?.pacienteClinica || bulletinData?.clinicaNome || doctorInfo?.clinicaPrincipal || 'Clínica de Hemodiálise';

  const cleanDateRef = normalizeDateToString(dataReferencia);
  const dataObj = cleanDateRef ? new Date(cleanDateRef + 'T12:00:00') : new Date();
  const mesAnoExtenso = dataObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const mesFormatado = mesAnoExtenso.charAt(0).toUpperCase() + mesAnoExtenso.slice(1);

  // Mapeia ícones por string
  const renderIcon = (iconName, color, iconSize = 16) => {
    const props = { size: iconSize, color };
    switch (iconName) {
      case 'Droplet': return <Droplet {...props} />;
      case 'Heart': return <Heart {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Award': return <Award {...props} />;
      default: return <Activity {...props} />;
    }
  };

  const hasCustomNote = customNote && customNote.trim() !== '';

  return (
    <div className="printable-patient-bulletin-area">
      <div className="patient-bulletin-a4-sheet" style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#1e293b',
        background: '#ffffff',
        width: '100%',
        maxWidth: '740px',
        margin: '0 auto',
        padding: isGrande ? '12px 14px' : (isSpacious ? '14px 18px' : '10px 14px'),
        boxSizing: 'border-box'
      }}>
        
        {/* ================= CABEÇALHO DO BOLETIM ================= */}
        <div style={{
          borderBottom: '2px solid #e2e8f0',
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
                <span style={{ fontSize: fontSizes.clinicName, fontWeight: '800', color: '#1e40af', letterSpacing: '0.5px' }}>
                  {doctorClinica.toUpperCase()}
                </span>
                <span style={{ fontSize: fontSizes.bulletinTag, background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '8px', fontWeight: 'bold' }}>
                  Boletim Nefrológico
                </span>
              </div>
              <h1 style={{ margin: '2px 0 0 0', fontSize: fontSizes.mainTitle, fontWeight: '900', color: '#0f172a', letterSpacing: '-0.3px' }}>
                Boletim de Saúde
              </h1>
              <div style={{ fontSize: fontSizes.patientLabel, color: '#475569', marginTop: '2px' }}>
                Paciente: <strong style={{ color: '#0f172a', fontSize: fontSizes.patientName }}>{pacienteNome}</strong>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: fontSizes.dateRef, fontWeight: '700', color: '#1e293b' }}>
              {mesFormatado}
            </div>
            <div style={{ fontSize: fontSizes.docName, color: '#64748b' }}>
              Resp: <strong>{doctorName}</strong>
            </div>
            <div style={{ fontSize: fontSizes.docCrm, color: '#94a3b8' }}>
              {doctorCrm}
            </div>
          </div>
        </div>

        {/* ================= BANNER PLACAR DE CONQUISTAS ================= */}
        {totalMetas > 0 ? (
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: isGrande ? '10px 14px' : (isSpacious ? '10px 14px' : '8px 12px'),
            marginBottom: isSpacious ? '10px' : '7px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              background: '#3b82f6',
              color: '#ffffff',
              borderRadius: '50%',
              width: fontSizes.trophyCircle,
              height: fontSizes.trophyCircle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
            }}>
              <Trophy size={fontSizes.trophyIcon} color="#ffffff" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: fontSizes.bannerTitle, color: '#1e40af' }}>
                  {tituloPlacar}
                </strong>
                <span style={{
                  fontSize: fontSizes.bannerBadge,
                  fontWeight: '800',
                  color: taxaSucesso >= 70 ? '#15803d' : '#b45309',
                  background: taxaSucesso >= 70 ? '#dcfce7' : '#fef3c7',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  🌟 {metasBatidas} de {totalMetas} Metas Batidas ({taxaSucesso}%)
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: fontSizes.bannerText, color: '#334155', lineHeight: '1.35' }}>
                {mensagemFinal}
              </p>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#f8fafc',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '10px',
            padding: '16px',
            textAlign: 'center',
            marginBottom: '12px',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📋</div>
            <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>
              Nenhum exame selecionado para o boletim
            </strong>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Selecione as metas desejadas no painel à esquerda para compor o boletim do paciente.
            </span>
          </div>
        )}

        {/* ================= GRADE DE EXAMES E METAS ================= */}
        {totalMetas > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isSingleColumn ? '1fr' : '1fr 1fr',
            gap: isGrande ? '8px' : (isSpacious ? '8px' : '6px'),
            marginBottom: isSpacious ? '10px' : '6px'
          }}>
            {displayCards.map(card => {
              const isConquista = card.status === GOAL_STATUS.CONQUISTA;
              const isQuaseLa = card.status === GOAL_STATUS.QUASE_LA;

              const bgCard = isConquista ? '#f8fafc' : (isQuaseLa ? '#fffbeb' : '#fef2f2');
              const borderCard = isConquista ? '#e2e8f0' : (isQuaseLa ? '#fde68a' : '#fecaca');
              const badgeBg = isConquista ? '#ecfdf5' : (isQuaseLa ? '#fef3c7' : '#fee2e2');
              const badgeColor = isConquista ? '#166534' : (isQuaseLa ? '#92400e' : '#991b1b');
              const badgeText = isConquista ? '🟢 Conquista!' : (isQuaseLa ? '🟡 Quase Lá!' : '🔴 Atenção');

              // Verifica se a dica está habilitada individualmente
              const isTipEnabled = enabledTips[card.id] === true;
              const rawTip = customTips[card.id] !== undefined ? customTips[card.id] : (card.dica || card.mensagem);
              const tipContent = rawTip ? String(rawTip).replace(/^["']|["']$/g, '').trim() : '';

              return (
                <div 
                  key={card.id}
                  style={{
                    background: bgCard,
                    border: `1px solid ${borderCard}`,
                    borderRadius: '8px',
                    padding: isGrande ? '8px 11px' : (isSpacious ? '7px 10px' : '5px 8px'),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isGrande ? '4px' : (isSpacious ? '3px' : '2px'),
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid'
                  }}
                >
                  {/* Linha 1: Nome do Exame, Ícone e Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {renderIcon(card.icone, card.corPrimaria, fontSizes.cardIcon)}
                      <strong style={{ fontSize: fontSizes.cardTitle, color: '#0f172a', display: 'block', lineHeight: '1.15' }}>
                        {card.subtitulo || card.categoria}
                      </strong>
                    </div>

                    <span style={{
                      fontSize: fontSizes.cardBadge,
                      fontWeight: '700',
                      background: badgeBg,
                      color: badgeColor,
                      padding: isSpacious ? '2px 7px' : '1px 5px',
                      borderRadius: '5px',
                      whiteSpace: 'nowrap'
                    }}>
                      {badgeText}
                    </span>
                  </div>

                  {/* Linha 2: Valor Atual e Faixa Meta */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    background: 'rgba(255, 255, 255, 0.75)',
                    padding: isGrande ? '4px 7px' : (isSpacious ? '3px 6px' : '2px 5px'),
                    borderRadius: '4px'
                  }}>
                    <span style={{ fontSize: fontSizes.cardResult, fontWeight: '800', color: isConquista ? '#0f172a' : '#b45309' }}>
                      Resultado: {card.valorFormatado}
                    </span>
                    <span style={{ fontSize: fontSizes.cardMeta, color: '#64748b', fontStyle: 'italic' }}>
                      {cleanMetaText(card.faixaMeta)}
                    </span>
                  </div>

                  {/* Linha 3: Dica de Hábito / Conduta (somente exibida quando o médico marcar "Exibir") */}
                  {isTipEnabled && Boolean(tipContent) && (
                    <p style={{
                      margin: '1px 0 0 0',
                      fontSize: fontSizes.cardTip,
                      color: '#334155',
                      lineHeight: '1.25'
                    }}>
                      "{tipContent}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ================= PRESCRIÇÃO MÉDICA ATUALIZADA (SÓ EXIBE SE HABILITADA) ================= */}
        {hasPrescription && (
          <div style={{
            background: '#f8fafc',
            border: '1.5px solid #cbd5e1',
            borderRadius: '8px',
            padding: isGrande ? '7px 11px' : (isCompact ? '5px 8px' : (isSpacious ? '8px 12px' : '6px 10px')),
            marginBottom: isCompact ? '5px' : (isSpacious ? '8px' : '6px'),
            breakInside: 'avoid',
            pageBreakInside: 'avoid'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCompact ? '3px' : '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ fontSize: fontSizes.prescHeader, lineHeight: 1 }}>💊</span>
                <strong style={{ fontSize: fontSizes.prescHeader, color: '#1e293b' }}>
                  Prescrição Médica Atualizada
                </strong>
              </div>
              <span style={{ fontSize: fontSizes.prescBadge, color: '#64748b', fontWeight: '600' }}>
                Uso Orientado • Em Vigor
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: validPrescriptionItems.length <= 1 ? '1fr' : '1fr 1fr',
              gap: isCompact ? '4px' : (isSpacious ? '6px' : '5px')
            }}>
              {validPrescriptionItems.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '5px',
                    padding: isGrande ? '5px 8px' : (isCompact ? '3px 6px' : '4px 7px'),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: fontSizes.prescMed, color: '#0f172a', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.medicamento}
                    </strong>
                    <span style={{ fontSize: fontSizes.prescPoso, color: '#475569', display: 'block', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.posologia || 'Conforme orientação médica'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{
                      fontSize: fontSizes.prescVia,
                      fontWeight: '700',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      border: '1px solid #bfdbfe'
                    }}>
                      {item.via || 'VO'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= RECOMENDAÇÃO / CONDUTA MÉDICA (SÓ EXIBE SE O MÉDICO PREENCHEU) ================= */}
        {hasCustomNote && (
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '8px',
            padding: isGrande ? '10px 14px' : (isSpacious ? '10px 14px' : '7px 11px'),
            marginBottom: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <span style={{ fontSize: fontSizes.noteHeader, lineHeight: 1 }}>💚🩺</span>
              <strong style={{ fontSize: fontSizes.noteHeader, color: '#166534' }}>
                Orientação do Médico para este Mês:
              </strong>
            </div>
            <p style={{
              margin: '0',
              fontSize: fontSizes.noteText,
              color: '#14532d',
              lineHeight: '1.35',
              fontWeight: '600'
            }}>
              {customNote.trim()}
            </p>
          </div>
        )}

        {/* ================= RODAPÉ INSTITUCIONAL & ASSINATURA ================= */}
        <div style={{
          borderTop: '1px dashed #cbd5e1',
          paddingTop: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: fontSizes.footerText,
          color: '#64748b'
        }}>
          <div>
            <span>Emitido em: <strong>{new Date().toLocaleDateString('pt-BR')}</strong> • Nex-Ai.NEFRO</span>
            <span style={{ display: 'block', color: '#94a3b8', fontSize: fontSizes.footerSub }}>
              Este boletim é um material educativo de apoio e reforço positivo ao tratamento.
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontWeight: '700', color: '#1e293b', fontSize: fontSizes.footerDoc }}>
              {doctorName}
            </span>
            <span style={{ fontSize: fontSizes.footerCrm, color: '#64748b' }}>
              {doctorCrm} • Nefrologia
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
