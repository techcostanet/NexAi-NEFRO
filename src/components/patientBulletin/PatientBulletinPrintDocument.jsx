import React from 'react';
import { 
  Trophy, 
  Heart, 
  Droplet, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Award, 
  HeartHandshake
} from 'lucide-react';
import { GOAL_STATUS } from '../../services/patientEducationService';

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
  doctorInfo,
  customNote = '',
  selectedCardIds = null,
  showTips = true,
  customTips = {},
  disabledTips = {}
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

  // Ajusta densidade visual se houver poucas metas (1 a 4) para maximizar legibilidade
  const isSpacious = totalMetas <= 4;
  const isSingleColumn = totalMetas <= 2;

  const doctorName = doctorInfo?.nome || 'Dr(a). Médico(a) Responsável';
  const doctorCrm = doctorInfo?.crm ? `CRM-${doctorInfo?.ufCrm || 'MG'} ${doctorInfo?.crm}` : 'Nefrologista Responsável';
  const doctorClinica = doctorInfo?.clinicaPrincipal || 'Clínica de Hemodiálise';

  const dataObj = dataReferencia ? new Date(dataReferencia + 'T12:00:00') : new Date();
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
        padding: isSpacious ? '16px 20px' : '12px 18px',
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e40af', letterSpacing: '0.5px' }}>
                {doctorClinica.toUpperCase()}
              </span>
              <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '8px', fontWeight: 'bold' }}>
                Boletim Nefrológico
              </span>
            </div>
            <h1 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.3px' }}>
              Boletim de Saúde
            </h1>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
              Paciente: <strong style={{ color: '#0f172a', fontSize: '13px' }}>{pacienteNome}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>
              {mesFormatado}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              Resp: <strong>{doctorName}</strong>
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8' }}>
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
            padding: isSpacious ? '10px 14px' : '8px 12px',
            marginBottom: isSpacious ? '12px' : '9px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              background: '#3b82f6',
              color: '#ffffff',
              borderRadius: '50%',
              width: isSpacious ? '42px' : '38px',
              height: isSpacious ? '42px' : '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
            }}>
              <Trophy size={isSpacious ? 22 : 20} color="#ffffff" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: isSpacious ? '13px' : '12px', color: '#1e40af' }}>
                  {tituloPlacar}
                </strong>
                <span style={{
                  fontSize: isSpacious ? '12px' : '11px',
                  fontWeight: '800',
                  color: taxaSucesso >= 70 ? '#15803d' : '#b45309',
                  background: taxaSucesso >= 70 ? '#dcfce7' : '#fef3c7',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  🌟 {metasBatidas} de {totalMetas} Metas Batidas ({taxaSucesso}%)
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: isSpacious ? '11px' : '10px', color: '#334155', lineHeight: '1.35' }}>
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
            gap: isSpacious ? '10px' : '7px',
            marginBottom: isSpacious ? '12px' : '8px'
          }}>
            {displayCards.map(card => {
              const isConquista = card.status === GOAL_STATUS.CONQUISTA;
              const isQuaseLa = card.status === GOAL_STATUS.QUASE_LA;

              const bgCard = isConquista ? '#f8fafc' : (isQuaseLa ? '#fffbeb' : '#fef2f2');
              const borderCard = isConquista ? '#e2e8f0' : (isQuaseLa ? '#fde68a' : '#fecaca');
              const badgeBg = isConquista ? '#ecfdf5' : (isQuaseLa ? '#fef3c7' : '#fee2e2');
              const badgeColor = isConquista ? '#166534' : (isQuaseLa ? '#92400e' : '#991b1b');
              const badgeText = isConquista ? '🟢 Conquista!' : (isQuaseLa ? '🟡 Quase Lá!' : '🔴 Atenção');

              // Verifica se a dica está habilitada individualmente e se há texto personalizado
              const isTipDisabledForCard = disabledTips[card.id] === true;
              const tipContent = customTips[card.id] !== undefined ? customTips[card.id] : card.dica;
              const showCardTip = showTips && !isTipDisabledForCard && Boolean(tipContent && tipContent.trim());

              return (
                <div 
                  key={card.id}
                  style={{
                    background: bgCard,
                    border: `1px solid ${borderCard}`,
                    borderRadius: '8px',
                    padding: isSpacious ? '10px 12px' : '7px 9px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isSpacious ? '5px' : '4px',
                    breakInside: 'avoid',
                    pageBreakInside: 'avoid'
                  }}
                >
                  {/* Linha 1: Título, Ícone e Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {renderIcon(card.icone, card.corPrimaria, isSpacious ? 18 : 15)}
                      <div>
                        <strong style={{ fontSize: isSpacious ? '12.5px' : '11px', color: '#0f172a', display: 'block', lineHeight: '1.1' }}>
                          {card.categoria}
                        </strong>
                        <span style={{ fontSize: isSpacious ? '10px' : '9px', color: '#64748b' }}>
                          {card.subtitulo}
                        </span>
                      </div>
                    </div>

                    <span style={{
                      fontSize: isSpacious ? '10.5px' : '9.5px',
                      fontWeight: '700',
                      background: badgeBg,
                      color: badgeColor,
                      padding: isSpacious ? '2px 8px' : '1px 6px',
                      borderRadius: '6px',
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
                    padding: isSpacious ? '4px 8px' : '2px 6px',
                    borderRadius: '5px',
                    marginTop: '1px'
                  }}>
                    <span style={{ fontSize: isSpacious ? '12.5px' : '11px', fontWeight: '800', color: isConquista ? '#0f172a' : '#b45309' }}>
                      Resultado: {card.valorFormatado}
                    </span>
                    <span style={{ fontSize: isSpacious ? '9.5px' : '8.5px', color: '#64748b', fontStyle: 'italic' }}>
                      {cleanMetaText(card.faixaMeta)}
                    </span>
                  </div>

                  {/* Linha 3: Mensagem Direta e Humanizada */}
                  <p style={{ margin: '0', fontSize: isSpacious ? '10.5px' : '9.5px', color: '#334155', lineHeight: '1.3' }}>
                    "{card.mensagem}"
                  </p>

                  {/* Linha 4: Dica de Ouro Personalizada do Médico ou do Sistema */}
                  {showCardTip && (
                    <div style={{
                      background: 'rgba(254, 240, 138, 0.25)',
                      borderLeft: '2px solid #eab308',
                      padding: isSpacious ? '3px 6px' : '2px 5px',
                      fontSize: isSpacious ? '9.5px' : '9px',
                      color: '#713f12',
                      lineHeight: '1.25',
                      borderRadius: '0 4px 4px 0',
                      marginTop: '2px'
                    }}>
                      <strong>💡 Dica:</strong> {tipContent}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ================= RECOMENDAÇÃO / CONDUTA MÉDICA (SÓ EXIBE SE O MÉDICO PREENCHEU) ================= */}
        {hasCustomNote && (
          <div style={{
            background: '#f0fdf4',
            border: '1.5px solid #86efac',
            borderRadius: '8px',
            padding: isSpacious ? '10px 14px' : '7px 11px',
            marginBottom: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <span style={{ fontSize: isSpacious ? '15px' : '13px', lineHeight: 1 }}>💚🩺</span>
              <strong style={{ fontSize: isSpacious ? '12px' : '10.5px', color: '#166534' }}>
                Orientação do Médico para este Mês:
              </strong>
            </div>
            <p style={{
              margin: '0',
              fontSize: isSpacious ? '11px' : '9.5px',
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
          fontSize: '9px',
          color: '#64748b'
        }}>
          <div>
            <span>Emitido em: <strong>{new Date().toLocaleDateString('pt-BR')}</strong> • Nex-Ai.NEFRO</span>
            <span style={{ display: 'block', color: '#94a3b8', fontSize: '8px' }}>
              Este boletim é um material educativo de apoio e reforço positivo ao tratamento.
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontWeight: '700', color: '#1e293b' }}>
              {doctorName}
            </span>
            <span style={{ fontSize: '8.5px', color: '#64748b' }}>
              {doctorCrm} • Nefrologia
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
