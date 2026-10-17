import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { safeFormatDateExtenso } from '../../utils/dateUtils';
import { formatCurrencyBRL, numeroPorExtenso } from '../../utils/numberUtils';

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 44,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTextCol: {
    flex: 1
  },
  clinicName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e3a8a',
    letterSpacing: 0.4
  },
  clinicSub: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 3
  },
  receiptNumberBox: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  receiptNumberLabel: {
    fontSize: 7.5,
    color: '#64748b',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  receiptNumberValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e3a8a'
  },
  docTitleBlock: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center'
  },
  docTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  docSubtitle: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 4
  },
  valueHighlightBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  valueHighlightLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af'
  },
  valueHighlightNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a'
  },
  bodyContainer: {
    flexGrow: 1,
    paddingHorizontal: 8,
    marginBottom: 24
  },
  legalParagraph: {
    fontSize: 11,
    lineHeight: 1.8,
    color: '#1e293b',
    textAlign: 'justify',
    marginBottom: 20
  },
  bold: {
    fontWeight: 'bold',
    color: '#0f172a'
  },
  detailsGrid: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 12,
    marginTop: 12
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  detailLabel: {
    fontSize: 9,
    color: '#64748b'
  },
  detailValue: {
    fontSize: 9.5,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
    alignItems: 'center'
  },
  dateLocation: {
    fontSize: 9.5,
    color: '#475569',
    marginBottom: 36,
    textAlign: 'center'
  },
  signatureLine: {
    width: 240,
    borderTopWidth: 1,
    borderTopColor: '#475569',
    marginBottom: 4
  },
  doctorName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  doctorDetails: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'center'
  },
  legalNotice: {
    marginTop: 16,
    fontSize: 7.5,
    color: '#94a3b8',
    textAlign: 'center'
  }
});

export default function ConsultorioReceiptPdf({
  receiptData,
  patient,
  doctorInfo
}) {
  const valorNum = Number(receiptData?.valor) || 0;
  const valorFormatado = formatCurrencyBRL(valorNum);
  const extenso = receiptData?.valorExtenso || numeroPorExtenso(valorNum);
  const dataExtenso = safeFormatDateExtenso(receiptData?.data || new Date().toISOString());

  const getCity = () => {
    return doctorInfo?.locaisAtuacao?.[0]?.cidade || 'São Paulo/SP';
  };

  const receiptNum = receiptData?.numeroRecibo || `REC-${new Date().getFullYear()}-${String(receiptData?.id || Date.now()).slice(-4)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.headerTextCol}>
            <Text style={styles.clinicName}>
              {doctorInfo?.clinicaPrincipal || doctorInfo?.locaisAtuacao?.[0]?.nome || 'Consultório Nefrológico Especializado'}
            </Text>
            <Text style={styles.clinicSub}>
              {doctorInfo?.nome || 'Dr(a). Nefrologista'} • {doctorInfo?.especialidade || 'Nefrologia Clínica'}
            </Text>
          </View>

          <View style={styles.receiptNumberBox}>
            <Text style={styles.receiptNumberLabel}>Recibo Nº</Text>
            <Text style={styles.receiptNumberValue}>{receiptNum}</Text>
          </View>
        </View>

        {/* TÍTULO */}
        <View style={styles.docTitleBlock}>
          <Text style={styles.docTitle}>Recibo de Honorários Médicos</Text>
          <Text style={styles.docSubtitle}>
            Para fins de comprovação, reembolso junto a plano de saúde e declaração de IRPF (DMED)
          </Text>
        </View>

        {/* BOX VALOR DESTACADO */}
        <View style={styles.valueHighlightBox}>
          <Text style={styles.valueHighlightLabel}>VALOR RECEBIDO:</Text>
          <Text style={styles.valueHighlightNumber}>{valorFormatado}</Text>
        </View>

        {/* CORPO DO RECIBO */}
        <View style={styles.bodyContainer}>
          <Text style={styles.legalParagraph}>
            Recebi do(a) Sr(a). <Text style={styles.bold}>{patient?.nome || receiptData?.patientNome || 'Paciente'}</Text>, portador(a) do CPF nº <Text style={styles.bold}>{patient?.cpf || receiptData?.patientCpf || 'Não informado'}</Text>, a importância de <Text style={styles.bold}>{valorFormatado}</Text> (<Text style={{ fontStyle: 'italic', fontWeight: 'bold' }}>{extenso}</Text>), referente à prestação de serviços médicos especializados: <Text style={styles.bold}>{receiptData?.descricaoServico || 'Consulta Médica Especializada em Nefrologia'}</Text>, realizada em <Text style={styles.bold}>{safeFormatDateExtenso(receiptData?.dataConsulta || receiptData?.data)}</Text>.
          </Text>

          {/* DETALHES DE PAGAMENTO E FISCAIS */}
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Forma de Pagamento:</Text>
              <Text style={styles.detailValue}>{receiptData?.formaPagamento || 'PIX'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Beneficiário / Paciente:</Text>
              <Text style={styles.detailValue}>{patient?.nome || receiptData?.patientNome}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>CPF do Médico Emitente:</Text>
              <Text style={styles.detailValue}>{doctorInfo?.cpf || '348.912.756-82'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>CRM do Médico:</Text>
              <Text style={styles.detailValue}>{doctorInfo?.crm || '654321'}/{doctorInfo?.ufCrm || 'SP'}</Text>
            </View>
          </View>
        </View>

        {/* RODAPÉ E ASSINATURA */}
        <View style={styles.footer}>
          <Text style={styles.dateLocation}>
            {getCity()}, {dataExtenso}
          </Text>

          <View style={styles.signatureLine} />
          <Text style={styles.doctorName}>{doctorInfo?.nome || 'Dr. Marcelo Ramos'}</Text>
          <Text style={styles.doctorDetails}>
            Médico Nefrologista • CRM {doctorInfo?.crm || '654321'}/{doctorInfo?.ufCrm || 'SP'} {doctorInfo?.rqe ? `• RQE ${doctorInfo.rqe}` : ''}
          </Text>
          <Text style={styles.doctorDetails}>
            CPF: {doctorInfo?.cpf || '348.912.756-82'}
          </Text>

          <Text style={styles.legalNotice}>
            Este recibo é emitido em conformidade com a legislação tributária brasileira e normas do Conselho Federal de Medicina (CFM).
          </Text>
        </View>
      </Page>
    </Document>
  );
}
