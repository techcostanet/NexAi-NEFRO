import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Circle } from '@react-pdf/renderer';

/**
 * Utilitários de higienização de strings para o motor de PDF (Helvetica)
 * Impede que caracteres especiais / emojis UTF-4 quebrem como "<Æ" no PDF
 */
function cleanPdfText(text) {
  if (!text) return '';
  return String(text)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '')
    .trim();
}

/**
 * Remove duplicações como "Meta: Meta: 10,0 a 12,0 g/dL"
 */
function cleanMetaText(meta) {
  if (!meta) return '';
  const cleaned = String(meta).replace(/^Meta:\s*/i, '').trim();
  return `Meta: ${cleaned}`;
}

// ================= ÍCONES VETORIAIS NATIVOS SVG PARA REACT-PDF =================
const TrophyIcon = ({ size = 18, color = '#ffffff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34 M6 4h12a2 2 0 0 1 2 2v3a8 8 0 0 1-8 8 8 8 0 0 1-8-8V6a2 2 0 0 1 2-2z"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const DropletIcon = ({ size = 13, color = '#e11d48' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const HeartIcon = ({ size = 13, color = '#dc2626' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ActivityIcon = ({ size = 13, color = '#d97706' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22 12h-4l-3 9L9 3l-3 9H2"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ZapIcon = ({ size = 13, color = '#059669' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShieldCheckIcon = ({ size = 13, color = '#0d9488' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="m9 12 2 2 4-4"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AwardIcon = ({ size = 13, color = '#7c3aed' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={8} r={6} fill="none" stroke={color} strokeWidth={2} />
    <Path
      d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StethoscopeIcon = ({ size = 14, color = '#16a34a' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3 M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4 M20 10v2a2 2 0 1 0 4 0v-2a2 2 0 1 0-4 0"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StarIcon = ({ size = 9, color = '#15803d' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={color}
      stroke={color}
      strokeWidth={1}
    />
  </Svg>
);

const StatusDot = ({ color = '#16a34a', size = 5.5 }) => (
  <Svg width={size} height={size} viewBox="0 0 10 10">
    <Circle cx={5} cy={5} r={4.5} fill={color} />
  </Svg>
);

const renderPdfIcon = (iconName, color = '#2563eb') => {
  switch (iconName) {
    case 'Droplet': return <DropletIcon color={color} />;
    case 'Heart': return <HeartIcon color={color} />;
    case 'Zap': return <ZapIcon color={color} />;
    case 'ShieldCheck': return <ShieldCheckIcon color={color} />;
    case 'Award': return <AwardIcon color={color} />;
    case 'Activity':
    default:
      return <ActivityIcon color={color} />;
  }
};

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 6,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flex: 1
  },
  clinicRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  clinicName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af',
    letterSpacing: 0.3
  },
  pillBadge: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    paddingVertical: 1,
    paddingHorizontal: 5,
    marginLeft: 6
  },
  pillBadgeText: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#1e40af'
  },
  docTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2
  },
  patientNameRow: {
    fontSize: 9.5,
    color: '#475569',
    marginTop: 2
  },
  headerRight: {
    textAlign: 'right',
    alignItems: 'flex-end'
  },
  monthRef: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  doctorRespText: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 1.5
  },
  doctorCrmText: {
    fontSize: 7.5,
    color: '#94a3b8',
    marginTop: 0.5
  },

  bannerCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  trophyCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9
  },
  bannerContent: {
    flex: 1
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bannerTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af'
  },
  goalsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderWidth: 1
  },
  goalsBadgeText: {
    fontSize: 8,
    fontWeight: 'bold'
  },
  bannerMessage: {
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.3,
    marginTop: 3
  },

  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  card: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 7,
    marginBottom: 6
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  cardLeftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  cardTitleBlock: {
    marginLeft: 5
  },
  cardCategoryName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 1.1
  },
  cardSubtitleName: {
    fontSize: 7,
    color: '#64748b'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    borderRadius: 5
  },
  statusBadgeText: {
    fontSize: 7,
    fontWeight: 'bold',
    marginLeft: 3
  },
  cardValueRow: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 4,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3
  },
  cardValueText: {
    fontSize: 9.5,
    fontWeight: 'bold'
  },
  cardTargetText: {
    fontSize: 7.5,
    color: '#64748b',
    fontStyle: 'italic'
  },
  cardMessage: {
    fontSize: 7.5,
    color: '#334155',
    lineHeight: 1.25
  },
  cardTipBox: {
    backgroundColor: '#fef9c3',
    borderLeftWidth: 2,
    borderLeftColor: '#eab308',
    padding: 2.5,
    paddingLeft: 4,
    borderRadius: 2,
    marginTop: 3
  },
  cardTipText: {
    fontSize: 6.8,
    color: '#713f12',
    lineHeight: 1.2
  },

  orientationBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 6,
    padding: 7,
    marginBottom: 6
  },
  orientationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  orientationTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#166534',
    marginLeft: 4
  },
  orientationText: {
    fontSize: 8,
    color: '#14532d',
    lineHeight: 1.35,
    fontWeight: 'bold'
  },

  footerSection: {
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    borderTopStyle: 'dashed',
    paddingTop: 5,
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerLeft: {
    flex: 1
  },
  footerIssueText: {
    fontSize: 7.5,
    color: '#64748b'
  },
  footerDisclaimerText: {
    fontSize: 6.5,
    color: '#94a3b8',
    marginTop: 1
  },
  footerRight: {
    textAlign: 'right',
    alignItems: 'flex-end'
  },
  doctorSigName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  doctorSigSub: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 0.5
  }
});

export default function PatientBulletinPdf({
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
    pacienteNome = 'Paciente',
    dataReferencia,
    tituloPlacar = 'Metas de Saúde',
    mensagemGeral = '',
    cards = []
  } = bulletinData;

  // Filtra cartões conforme seleção estrita do médico
  const displayCards = Array.isArray(selectedCardIds)
    ? cards.filter(c => selectedCardIds.includes(c.id))
    : cards;

  const totalMetas = displayCards.length;
  const metasBatidas = displayCards.filter(c => c.status === 'CONQUISTA' || c.statusId === 'otimo').length;
  const taxaSucesso = totalMetas > 0 ? Math.round((metasBatidas / totalMetas) * 100) : 100;

  const isSingleColumn = totalMetas <= 2;
  const cardWidth = isSingleColumn ? '100%' : '48.5%';

  const docName = doctorInfo?.nome || 'Dr. Marcelo Ramos';
  const docCrm = doctorInfo?.crm ? `CRM-${doctorInfo?.ufCrm || 'SP'} ${doctorInfo?.crm}` : 'CRM-SP 654321';
  const clinica = doctorInfo?.clinicaPrincipal || 'CLÍNICA RENALIS';

  const dataObj = dataReferencia ? new Date(dataReferencia + 'T12:00:00') : new Date();
  const mesFormatado = dataObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const mesCapitalizado = mesFormatado.charAt(0).toUpperCase() + mesFormatado.slice(1);
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  const cleanTitle = cleanPdfText(tituloPlacar) || 'Desempenho Campeão!';

  let cleanMsg = cleanPdfText(mensagemGeral);
  if (totalMetas > 0) {
    if (taxaSucesso >= 75) {
      cleanMsg = `Sensacional! Você atingiu ${metasBatidas} de ${totalMetas} metas de saúde com louvor neste mês. Seu esforço e disciplina nas sessões de diálise estão transformando sua qualidade de vida!`;
    } else if (taxaSucesso >= 45) {
      cleanMsg = `Muito bem! Você conquistou vitórias importantes neste mês (${metasBatidas} metas batidas). Com pequenos ajustes na rotina e nas dicas da equipe, no próximo mês chegaremos ainda mais longe!`;
    } else {
      cleanMsg = `Cada mês é uma nova oportunidade de recomeço e vitória. Toda a nossa equipe de Nefrologia está de mãos dadas com você para alcançarmos o melhor bem-estar possível!`;
    }
  }

  const badgeBg = taxaSucesso >= 70 ? '#dcfce7' : '#fef3c7';
  const badgeBorder = taxaSucesso >= 70 ? '#bbf7d0' : '#fde68a';
  const badgeColor = taxaSucesso >= 70 ? '#15803d' : '#b45309';

  const hasCustomNote = customNote && customNote.trim() !== '';

  return (
    <Document title={`Boletim_Saude_${cleanPdfText(pacienteNome).replace(/\s+/g, '_')}`}>
      <Page size="A4" style={styles.page}>
        
        {/* ================= 1. CABEÇALHO IDÊNTICO À TELA ================= */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.clinicRow}>
              <Text style={styles.clinicName}>{clinica.toUpperCase()}</Text>
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText}>Boletim Nefrológico</Text>
              </View>
            </View>
            <Text style={styles.docTitle}>Boletim de Saúde</Text>
            <Text style={styles.patientNameRow}>
              Paciente: <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>{pacienteNome}</Text>
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.monthRef}>{mesCapitalizado}</Text>
            <Text style={styles.doctorRespText}>
              Resp: <Text style={{ fontWeight: 'bold', color: '#1e293b' }}>{docName}</Text>
            </Text>
            <Text style={styles.doctorCrmText}>{docCrm}</Text>
          </View>
        </View>

        {/* ================= 2. BANNER DE CONQUISTAS ================= */}
        {totalMetas > 0 ? (
          <View style={styles.bannerCard}>
            <View style={styles.trophyCircle}>
              <TrophyIcon size={18} color="#ffffff" />
            </View>

            <View style={styles.bannerContent}>
              <View style={styles.bannerTopRow}>
                <Text style={styles.bannerTitle}>{cleanTitle}</Text>
                <View style={[styles.goalsBadge, { backgroundColor: badgeBg, borderColor: badgeBorder }]}>
                  <StarIcon size={8.5} color={badgeColor} />
                  <Text style={[styles.goalsBadgeText, { color: badgeColor, marginLeft: 3 }]}>
                    {metasBatidas} de {totalMetas} Metas Batidas ({taxaSucesso}%)
                  </Text>
                </View>
              </View>
              <Text style={styles.bannerMessage}>{cleanMsg}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.bannerCard, { backgroundColor: '#f8fafc', borderColor: '#cbd5e1', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 9, color: '#64748b', textAlign: 'center' }}>
              Nenhum exame selecionado para o boletim.
            </Text>
          </View>
        )}

        {/* ================= 3. GRADE DE METAS CLÍNICAS ================= */}
        {totalMetas > 0 && (
          <View style={styles.cardsGrid}>
            {displayCards.map((card, idx) => {
              const isConquista = card.status === 'CONQUISTA' || card.statusId === 'otimo';
              const isQuaseLa = card.status === 'QUASE_LA' || card.statusId === 'atencao';

              const bgCard = isConquista ? '#f8fafc' : (isQuaseLa ? '#fffbeb' : '#fef2f2');
              const borderCard = isConquista ? '#e2e8f0' : (isQuaseLa ? '#fde68a' : '#fecaca');
              const statusBg = isConquista ? '#ecfdf5' : (isQuaseLa ? '#fef3c7' : '#fee2e2');
              const statusColor = isConquista ? '#166534' : (isQuaseLa ? '#92400e' : '#991b1b');
              const statusText = isConquista ? 'Conquista!' : (isQuaseLa ? 'Quase Lá!' : 'Atenção');
              const dotColor = isConquista ? '#16a34a' : (isQuaseLa ? '#d97706' : '#dc2626');

              const isTipDisabledForCard = disabledTips[card.id] === true;
              const tipContent = customTips[card.id] !== undefined ? customTips[card.id] : card.dica;
              const showCardTip = showTips && !isTipDisabledForCard && Boolean(tipContent && tipContent.trim());

              return (
                <View 
                  key={idx} 
                  style={[
                    styles.card, 
                    { 
                      width: cardWidth, 
                      backgroundColor: bgCard, 
                      borderColor: borderCard 
                    }
                  ]}
                >
                  {/* Linha 1: Ícone Categoria + Títulos + Badge de Status */}
                  <View style={styles.cardTitleRow}>
                    <View style={styles.cardLeftHeader}>
                      {renderPdfIcon(card.icone, card.corPrimaria || '#2563eb')}
                      <View style={styles.cardTitleBlock}>
                        <Text style={styles.cardCategoryName}>{cleanPdfText(card.categoria || card.nome)}</Text>
                        <Text style={styles.cardSubtitleName}>{cleanPdfText(card.subtitulo)}</Text>
                      </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                      <StatusDot color={dotColor} size={5} />
                      <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusText}</Text>
                    </View>
                  </View>

                  {/* Linha 2: Resultado e Meta */}
                  <View style={styles.cardValueRow}>
                    <Text style={[styles.cardValueText, { color: isConquista ? '#0f172a' : '#b45309' }]}>
                      Resultado: {cleanPdfText(card.valorFormatado)}
                    </Text>
                    <Text style={styles.cardTargetText}>
                      {cleanMetaText(card.faixaMeta || card.alvoTexto)}
                    </Text>
                  </View>

                  {/* Linha 3: Frase de Feedback Acolhedor */}
                  <Text style={styles.cardMessage}>
                    "{cleanPdfText(card.mensagem || card.feedbackTexto)}"
                  </Text>

                  {/* Linha 4: Dica Prática do Médico ou Sistema */}
                  {showCardTip && (
                    <View style={styles.cardTipBox}>
                      <Text style={styles.cardTipText}>
                        Dica: {cleanPdfText(tipContent)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ================= 4. ORIENTAÇÃO DO MÉDICO (SÓ EXIBE SE PREENCHIDO) ================= */}
        {hasCustomNote && (
          <View style={styles.orientationBox}>
            <View style={styles.orientationHeader}>
              <StethoscopeIcon size={13} color="#16a34a" />
              <Text style={styles.orientationTitle}>Orientação do Médico para este Mês:</Text>
            </View>
            <Text style={styles.orientationText}>
              {cleanPdfText(customNote)}
            </Text>
          </View>
        )}

        {/* ================= 5. RODAPÉ INSTITUCIONAL ================= */}
        <View style={styles.footerSection}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerIssueText}>
              Emitido em: <Text style={{ fontWeight: 'bold' }}>{dataHoje}</Text> • Nex-Ai.NEFRO
            </Text>
            <Text style={styles.footerDisclaimerText}>
              Este boletim é um material educativo de apoio e reforço positivo ao tratamento.
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.doctorSigName}>{docName}</Text>
            <Text style={styles.doctorSigSub}>{docCrm} • Nefrologia</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
