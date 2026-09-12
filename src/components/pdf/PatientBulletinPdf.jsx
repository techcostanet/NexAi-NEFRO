import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#2563eb',
    paddingBottom: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  clinicName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af'
  },
  docTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 2
  },
  patientName: {
    fontSize: 9,
    color: '#475569',
    marginTop: 2
  },
  badgeCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  scoreNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1d4ed8'
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  card: {
    width: '48.5%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f8fafc'
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  cardName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  cardValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1e40af'
  },
  cardTarget: {
    fontSize: 7.5,
    color: '#64748b',
    marginBottom: 3
  },
  cardFeedback: {
    fontSize: 7.5,
    color: '#334155',
    lineHeight: 1.25,
    marginBottom: 2
  },
  cardTip: {
    fontSize: 7,
    color: '#15803d',
    fontStyle: 'italic'
  },
  noteBox: {
    borderWidth: 1,
    borderColor: '#93c5fd',
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12
  },
  noteTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 2
  },
  noteContent: {
    fontSize: 8,
    color: '#1e293b',
    fontStyle: 'italic',
    lineHeight: 1.3
  },
  signatureSection: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  sigLine: {
    width: 180,
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
    marginBottom: 3
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#94a3b8'
  }
});

export default function PatientBulletinPdf({
  bulletinData,
  doctorInfo,
  customNote = ''
}) {
  if (!bulletinData) return null;

  const {
    pacienteNome,
    dataReferencia,
    totalMetas = 5,
    metasBatidas = 0,
    taxaSucesso = 0,
    tituloPlacar = 'Metas de Saúde',
    mensagemGeral = '',
    cards = []
  } = bulletinData;

  const docName = doctorInfo?.nome || 'Dr(a). Médico(a) Nefrologista';
  const docCrm = doctorInfo?.crm ? `CRM/${doctorInfo?.ufCrm || 'SP'} ${doctorInfo?.crm}` : 'Nefrologia Clínica';
  const clinica = doctorInfo?.clinicaPrincipal || 'Clínica Nefrológica';

  const dataObj = dataReferencia ? new Date(dataReferencia + 'T12:00:00') : new Date();
  const mesFormatado = dataObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Document title={`Boletim_Saude_${pacienteNome}`}>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.clinicName}>{clinica.toUpperCase()}</Text>
            <Text style={styles.docTitle}>Boletim de Saúde</Text>
            <Text style={styles.patientName}>Paciente: <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>{pacienteNome?.toUpperCase()}</Text></Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 8, color: '#64748b' }}>Referência Mensal</Text>
            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#1e40af' }}>{mesFormatado}</Text>
          </View>
        </View>

        {/* Placar de Metas */}
        <View style={styles.badgeCard}>
          <View>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e3a8a' }}>{tituloPlacar}</Text>
            <Text style={{ fontSize: 8, color: '#475569', marginTop: 2 }}>{mensagemGeral}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.scoreNumber}>{metasBatidas} de {totalMetas} Metas</Text>
            <Text style={{ fontSize: 8, color: '#2563eb', fontWeight: 'bold' }}>{taxaSucesso}% de Sucesso</Text>
          </View>
        </View>

        {/* Grade de Metas Clínicas */}
        <View style={styles.cardsGrid}>
          {cards.slice(0, 6).map((card, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardName}>{card.nome}</Text>
                <Text style={styles.cardValue}>{card.valorFormatado}</Text>
              </View>
              <Text style={styles.cardTarget}>Meta: {card.alvoTexto}</Text>
              <Text style={styles.cardFeedback}>{card.feedbackTexto}</Text>
              {card.dicaPratica && (
                <Text style={styles.cardTip}>💡 {card.dicaPratica}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Recado Carinhoso / Orientação Especial */}
        {customNote ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteTitle}>Recado Especial da Equipe Médica:</Text>
            <Text style={styles.noteContent}>"{customNote}"</Text>
          </View>
        ) : null}

        {/* Assinatura */}
        <View style={styles.signatureSection}>
          <View>
            <Text style={{ fontSize: 7.5, color: '#64748b' }}>Cuidar da saúde é uma vitória diária!</Text>
            <Text style={{ fontSize: 7, color: '#94a3b8' }}>Nex-Ai.NEFRO • Acompanhamento Dialítico Integrado</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.sigLine} />
            <Text style={{ fontSize: 8.5, fontWeight: 'bold' }}>{docName}</Text>
            <Text style={{ fontSize: 7.5, color: '#475569' }}>{docCrm}</Text>
          </View>
        </View>

        {/* Rodapé fixo */}
        <View style={styles.footer} fixed>
          <Text>Boletim de Orientação em Saúde • Não substitui consulta médica</Text>
          <Text>Nex-Ai.NEFRO</Text>
        </View>
      </Page>
    </Document>
  );
}
