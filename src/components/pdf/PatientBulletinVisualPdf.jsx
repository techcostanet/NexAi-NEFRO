import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Circle, Image } from '@react-pdf/renderer';
import { GOAL_STATUS } from '../../services/patientEducationService';
import { getVisualDataForCard } from '../patientBulletin/bulletinVisualCatalog';

/**
 * Utilitários de higienização de strings para o motor de PDF (Helvetica)
 * Impede que emojis ou caracteres UTF-4 quebrem no PDF nativo.
 */
function cleanPdfText(text) {
  if (!text) return '';
  return String(text)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '')
    .trim();
}


// ================= ÍCONES VETORIAIS NATIVOS SVG PARA REACT-PDF =================
const TrophyIcon = ({ size = 20, color = '#ffffff' }) => (
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

const HeartIcon = ({ size = 16, color = '#dc2626' }) => (
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

const DropletIcon = ({ size = 16, color = '#e11d48' }) => (
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

const BoneIcon = ({ size = 16, color = '#d97706' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const UtensilsIcon = ({ size = 16, color = '#7c3aed' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7 2v20" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const GlassWaterIcon = ({ size = 16, color = '#0284c7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5.116 4.104A1 1 0 0 1 6.11 3h11.78a1 1 0 0 1 .994 1.105L17.19 20.21A2 2 0 0 1 15.2 22H8.8a2 2 0 0 1-2-1.79z" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M6 12a5 5 0 0 1 6 0 5 5 0 0 0 6 0" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const BatteryChargingIcon = ({ size = 16, color = '#c026d3' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="m11 7-3 5h4l-3 5" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14.856 6H16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.935" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 14v-4" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5.14 18H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.936" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ThermometerIcon = ({ size = 16, color = '#e11d48' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const AppleIcon = ({ size = 16, color = '#0284c7' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 6.528V3a1 1 0 0 1 1-1h0" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LeafIcon = ({ size = 16, color = '#0d9488' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WindIcon = ({ size = 16, color = '#0d9488' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12.8 19.6A2 2 0 1 0 14 16H2" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M17.5 8a2.5 2.5 0 1 1 2 4H2" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9.8 4.4A2 2 0 1 1 11 8H2" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SunIcon = ({ size = 16, color = '#eab308' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={4} fill={color} stroke={color} strokeWidth={1} />
    <Path d="M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M6.34 17.66l-1.41 1.41 M19.07 4.93l-1.41 1.41" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const ZapIcon = ({ size = 16, color = '#ea580c' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={color} stroke={color} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MachineFilterIcon = ({ size = 16, color = '#059669' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M4 6h16 M4 12h16 M4 18h16" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Circle cx={8} cy={6} r={2} fill={color} />
    <Circle cx={16} cy={12} r={2} fill={color} />
    <Circle cx={10} cy={18} r={2} fill={color} />
  </Svg>
);

// Carinhas de Status Lúdico
const HappyFaceIcon = ({ size = 13, color = '#15803d' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill="#dcfce7" stroke={color} strokeWidth={2} />
    <Circle cx={9} cy={10} r={1.5} fill={color} />
    <Circle cx={15} cy={10} r={1.5} fill={color} />
    <Path d="M8 14s1.5 3 4 3 4-3 4-3" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const NeutralFaceIcon = ({ size = 13, color = '#b45309' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill="#fef3c7" stroke={color} strokeWidth={2} />
    <Circle cx={9} cy={10} r={1.5} fill={color} />
    <Circle cx={15} cy={10} r={1.5} fill={color} />
    <Path d="M8 15h8" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const AlertFaceIcon = ({ size = 13, color = '#b91c1c' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill="#fee2e2" stroke={color} strokeWidth={2} />
    <Circle cx={9} cy={9} r={1.5} fill={color} />
    <Circle cx={15} cy={9} r={1.5} fill={color} />
    <Path d="M16 16s-1.5-2-4-2-4 2-4 2" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const PillIcon = ({ size = 12, color = '#2563eb' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" fill="none" stroke={color} strokeWidth={2} />
    <Path d="m8.5 8.5 7 7" stroke={color} strokeWidth={2} />
  </Svg>
);

const StarIcon = ({ size = 10, color = '#eab308' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={color}
      stroke={color}
      strokeWidth={1}
    />
  </Svg>
);

const renderOrganIcon = (tema, color = '#2563eb') => {
  switch (tema) {
    case 'coracao': return <HeartIcon color={color} />;
    case 'sangue': return <DropletIcon color={color} />;
    case 'ossos': return <BoneIcon color={color} />;
    case 'nutricao': return <UtensilsIcon color={color} />;
    case 'sal': return <GlassWaterIcon color={color} />;
    case 'energia': return <BatteryChargingIcon color={color} />;
    case 'circulacao': return <ZapIcon color={color} />;
    case 'sol': return <SunIcon color={color} />;
    case 'filtro': return <MachineFilterIcon color={color} />;
    case 'acucar': return <AppleIcon color={color} />;
    case 'febre':
    case 'defesa': return <ThermometerIcon color={color} />;
    case 'figado': return <LeafIcon color={color} />;
    case 'leveza': return <WindIcon color={color} />;
    default: return <BoneIcon color={color} />;
  }
};

const renderFaceIcon = (humor) => {
  if (humor === 'feliz') return <HappyFaceIcon />;
  if (humor === 'atencao') return <NeutralFaceIcon />;
  return <AlertFaceIcon />;
};

const styles = StyleSheet.create({
  page: {
    padding: 22,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#bfdbfe',
    borderBottomStyle: 'dashed',
    paddingBottom: 6,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    maxHeight: 38,
    maxWidth: 90,
    objectFit: 'contain',
    marginRight: 10
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
    paddingHorizontal: 6,
    marginLeft: 6
  },
  pillBadgeText: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#1d4ed8'
  },
  patientNameRow: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2
  },
  headerRight: {
    textAlign: 'right',
    alignItems: 'flex-end'
  },
  monthRef: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#1e3a8a'
  },
  doctorRespText: {
    fontSize: 8,
    color: '#475569',
    marginTop: 1.5
  },
  doctorCrmText: {
    fontSize: 7.5,
    color: '#64748b',
    marginTop: 0.5
  },

  bannerCard: {
    backgroundColor: '#fefce8',
    borderWidth: 1.5,
    borderColor: '#facc15',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  trophyCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ca8a04',
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
    fontSize: 11.5,
    fontWeight: 'bold',
    color: '#854d0e'
  },
  starBadge: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#facc15',
    borderRadius: 10,
    paddingVertical: 1.5,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center'
  },
  starBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#a16207'
  },
  bannerMessage: {
    fontSize: 8,
    color: '#334155',
    lineHeight: 1.3,
    marginTop: 2.5
  },

  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  card: {
    borderWidth: 1.2,
    borderRadius: 8,
    padding: 6,
    marginBottom: 5
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  organTitle: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  organSubtitle: {
    fontSize: 7,
    color: '#64748b'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1
  },
  statusText: {
    fontSize: 7.5,
    fontWeight: 'bold',
    marginLeft: 3
  },

  messageBox: {
    backgroundColor: '#ffffff',
    borderWidth: 0.8,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    paddingVertical: 2.5,
    paddingHorizontal: 4,
    marginBottom: 2
  },
  messageText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e293b',
    lineHeight: 1.2
  },

  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tipText: {
    fontSize: 7,
    color: '#475569',
    flex: 1
  },
  techValue: {
    fontSize: 6.5,
    color: '#94a3b8',
    backgroundColor: '#f8fafc',
    paddingVertical: 0.5,
    paddingHorizontal: 3,
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#e2e8f0'
  },

  prescriptionBlock: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 6,
    marginBottom: 5
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  prescriptionTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  prescriptionSub: {
    fontSize: 6.5,
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4
  },
  medsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  medCard: {
    backgroundColor: '#ffffff',
    borderWidth: 0.8,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 3,
    marginBottom: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  medName: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  medPos: {
    fontSize: 6.5,
    color: '#475569'
  },
  medPeriod: {
    fontSize: 6,
    fontWeight: 'bold',
    color: '#1e40af',
    backgroundColor: '#eff6ff',
    paddingVertical: 1,
    paddingHorizontal: 3,
    borderRadius: 3
  },

  noteBlock: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.2,
    borderColor: '#86efac',
    borderRadius: 6,
    padding: 6,
    marginBottom: 6
  },
  noteTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 2
  },
  noteContent: {
    fontSize: 8,
    color: '#14532d',
    lineHeight: 1.3
  },

  footer: {
    borderTopWidth: 0.8,
    borderTopColor: '#cbd5e1',
    borderTopStyle: 'dashed',
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerLeftText: {
    fontSize: 7.5,
    color: '#1e40af',
    fontWeight: 'bold'
  },
  footerSubText: {
    fontSize: 6.5,
    color: '#94a3b8'
  },
  footerDoctor: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'right'
  },
  footerCrm: {
    fontSize: 6.5,
    color: '#64748b',
    textAlign: 'right'
  }
});

export default function PatientBulletinVisualPdf({
  bulletinData,
  doctorInfo,
  customNote = '',
  selectedCardIds = null,
  enabledTips = {},
  customTips = {},
  includePrescription = false,
  prescriptionItems = []
}) {
  if (!bulletinData) return null;

  const {
    pacienteNome,
    dataReferencia,
    cards = []
  } = bulletinData;

  const displayCards = Array.isArray(selectedCardIds)
    ? cards.filter(c => selectedCardIds.includes(c.id))
    : cards;

  const totalMetas = displayCards.length;
  const metasBatidas = displayCards.filter(c => c.status === GOAL_STATUS.CONQUISTA).length;
  const taxaSucesso = totalMetas > 0 ? Math.round((metasBatidas / totalMetas) * 100) : 100;

  const validPrescriptionItems = (Array.isArray(prescriptionItems) ? prescriptionItems : []).filter(
    it => it && it.medicamento && String(it.medicamento).trim() !== ''
  );
  const hasPrescription = Boolean(includePrescription && validPrescriptionItems.length > 0);

  const isCompact = hasPrescription && (totalMetas >= 8 || validPrescriptionItems.length >= 4);
  const isSingleColumn = totalMetas <= 2;
  const cardWidth = isSingleColumn ? '100%' : '49.2%';
  const medCardWidth = validPrescriptionItems.length <= 1 ? '100%' : '49.2%';

  const doctorName = cleanPdfText(doctorInfo?.nome || 'Dr(a). Medico(a) Responsavel');
  const doctorCrm = cleanPdfText(doctorInfo?.crm ? `CRM-${doctorInfo?.ufCrm || 'MG'} ${doctorInfo?.crm}` : 'Nefrologista Responsavel');
  const doctorClinica = cleanPdfText(doctorInfo?.clinicaPrincipal || 'Clinica de Hemodialise');

  const dataObj = dataReferencia ? new Date(dataReferencia + 'T12:00:00') : new Date();
  const mesAnoExtenso = dataObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const mesFormatado = cleanPdfText(mesAnoExtenso.charAt(0).toUpperCase() + mesAnoExtenso.slice(1));

  let trofeuTitulo = 'Campeao da Saude!';
  let trofeuMensagem = `Parabens! Voce alcancou ${metasBatidas} de ${totalMetas} vitorias de ouro neste mes! Seu esforco na dialise esta deixando seu corpo mais forte.`;
  if (taxaSucesso < 75 && taxaSucesso >= 45) {
    trofeuTitulo = 'Grandes Vitorias!';
    trofeuMensagem = `Muito bem! Voce conquistou ${metasBatidas} vitorias importantes! Com os cuidados das dicas, no proximo mes teremos ainda mais medalhas!`;
  } else if (taxaSucesso < 45) {
    trofeuTitulo = 'Estamos Juntos nessa Jornada!';
    trofeuMensagem = `Cada dia na maquina e um passo de vitoria. Toda a equipe esta de maos dadas com voce para proteger sua saude e bem-estar!`;
  }

  const hasCustomNote = customNote && customNote.trim() !== '';

  return (
    <Document title={`Boletim_Ilustrado_${cleanPdfText(pacienteNome)}.pdf`}>
      <Page size="A4" style={styles.page}>
        
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {doctorInfo?.logoUrl ? (
              <Image src={doctorInfo.logoUrl} style={styles.logo} />
            ) : null}
            <View style={styles.headerLeft}>
              <View style={styles.clinicRow}>
                <Text style={styles.clinicName}>{doctorClinica.toUpperCase()}</Text>
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>Boletim Ilustrado</Text>
                </View>
              </View>
              <Text style={styles.patientNameRow}>
                Paciente: {cleanPdfText(pacienteNome)}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.monthRef}>{mesFormatado}</Text>
            <Text style={styles.doctorRespText}>Medico: {doctorName}</Text>
            <Text style={styles.doctorCrmText}>{doctorCrm}</Text>
          </View>
        </View>

        {/* BANNER PLACAR DO CAMPEÃO */}
        <View style={styles.bannerCard}>
          <View style={styles.trophyCircle}>
            <TrophyIcon size={18} />
          </View>
          <View style={styles.bannerContent}>
            <View style={styles.bannerTopRow}>
              <Text style={styles.bannerTitle}>{trofeuTitulo}</Text>
              <View style={styles.starBadge}>
                <StarIcon size={8} />
                <Text style={[styles.starBadgeText, { marginLeft: 3 }]}>
                  {metasBatidas} de {totalMetas} Conquistas ({taxaSucesso}%)
                </Text>
              </View>
            </View>
            <Text style={styles.bannerMessage}>{trofeuMensagem}</Text>
          </View>
        </View>

        {/* GRADE DE CARTÕES LÚDICOS */}
        <View style={styles.cardsGrid}>
          {displayCards.map(card => {
            const visual = getVisualDataForCard(card);
            if (!visual) return null;

            const isTipEnabled = enabledTips[card.id] === true;
            const customTip = customTips[card.id];
            const tipContent = (customTip !== undefined && customTip.trim() !== '')
              ? cleanPdfText(customTip)
              : cleanPdfText(card.dica || visual.acaoTexto);

            return (
              <View
                key={card.id}
                style={[
                  styles.card,
                  {
                    width: cardWidth,
                    backgroundColor: visual.bgTema,
                    borderColor: visual.bordaTema,
                    padding: isTipEnabled ? 5 : 4
                  }
                ]}
              >
                {/* Linha do Órgão e Semáforo */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <View style={styles.iconCircle}>
                      {renderOrganIcon(visual.tema, visual.corTema)}
                    </View>
                    <View>
                      <Text style={styles.organTitle}>{cleanPdfText(visual.titulo)}</Text>
                      <Text style={styles.organSubtitle}>{cleanPdfText(visual.subtitulo)}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[styles.techValue, { marginRight: 4 }]}>
                      {cleanPdfText(card.valorFormatado)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: visual.bgStatus, borderColor: visual.bordaStatus }]}>
                      {renderFaceIcon(visual.humor)}
                      <Text style={[styles.statusText, { color: visual.corStatus }]}>
                        {cleanPdfText(visual.rotuloStatus)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Dica de Ação (SOMENTE SE O MÉDICO MARCAR EXIBIR) */}
                {isTipEnabled && Boolean(tipContent) && (
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>
                      "{tipContent}"
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* PRESCRIÇÃO LÚDICA */}
        {hasPrescription && (
          <View style={styles.prescriptionBlock}>
            <View style={styles.prescriptionHeader}>
              <Text style={styles.prescriptionTitle}>Seus Remedios de Uso Diario</Text>
              <Text style={styles.prescriptionSub}>Tome nos horarios certos</Text>
            </View>

            <View style={styles.medsGrid}>
              {validPrescriptionItems.map((item, idx) => (
                <View key={item.id || idx} style={[styles.medCard, { width: medCardWidth }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.medName}>{cleanPdfText(item.medicamento)}</Text>
                    <Text style={styles.medPos}>{cleanPdfText(item.posologia || 'Conforme orientacao')}</Text>
                  </View>
                  <Text style={styles.medPeriod}>{cleanPdfText(item.via || 'VO')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* RECADO DO MÉDICO */}
        {hasCustomNote && (
          <View style={styles.noteBlock}>
            <Text style={styles.noteTitle}>Recado do Medico para este mes:</Text>
            <Text style={styles.noteContent}>"{cleanPdfText(customNote)}"</Text>
          </View>
        )}

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerLeftText}>Toda a equipe de Dialise esta torcendo por voce!</Text>
            <Text style={styles.footerSubText}>Material educativo e de reforco positivo ao tratamento.</Text>
          </View>

          <View>
            <Text style={styles.footerDoctor}>{doctorName}</Text>
            <Text style={styles.footerCrm}>{doctorCrm} • Nefrologia</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
