import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { safeFormatDateExtenso } from '../../utils/dateUtils';

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTextCol: {
    flex: 1
  },
  clinicName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
    letterSpacing: 0.3
  },
  clinicSub: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 2
  },
  docTitleBlock: {
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center'
  },
  docTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 0.8,
    textTransform: 'uppercase'
  },
  docSubtitle: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 3
  },
  patientBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16
  },
  patientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3
  },
  label: {
    color: '#64748b',
    fontSize: 8.5
  },
  value: {
    fontWeight: 'bold',
    color: '#0f172a',
    fontSize: 9.5
  },
  contentContainer: {
    flexGrow: 1,
    minHeight: 320,
    marginBottom: 16
  },
  paragraph: {
    fontSize: 10.5,
    lineHeight: 1.6,
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'justify'
  },
  examItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 4
  },
  bulletPoint: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#2563eb',
    marginRight: 8
  },
  examText: {
    fontSize: 10,
    color: '#1e293b',
    fontWeight: 'medium'
  },
  justificationBox: {
    marginTop: 14,
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6'
  },
  justificationLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 2
  },
  justificationText: {
    fontSize: 9,
    color: '#334155'
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    alignItems: 'center'
  },
  dateLocation: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 28,
    textAlign: 'center'
  },
  signatureLine: {
    width: 220,
    borderTopWidth: 1,
    borderTopColor: '#475569',
    marginBottom: 4
  },
  doctorName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  doctorCrm: {
    fontSize: 8.5,
    color: '#64748b',
    marginTop: 1
  }
});

export default function ConsultorioDocumentPdf({
  documentData,
  patient,
  doctorInfo
}) {
  const docType = documentData?.tipo || 'exames';
  const dataExtenso = safeFormatDateExtenso(documentData?.data || new Date().toISOString());

  const docTitleMap = {
    exames: 'Solicitação de Exames Laboratoriais',
    atestado: 'Atestado Médico',
    comparecimento: 'Declaração de Comparecimento',
    parecer: 'Parecer Nefrológico'
  };

  const getCity = () => {
    return doctorInfo?.locaisAtuacao?.[0]?.cidade || 'São Paulo/SP';
  };

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
              {doctorInfo?.nome || 'Dr(a). Nefrologista'} • CRM {doctorInfo?.crm}/{doctorInfo?.ufCrm || 'SP'} • {doctorInfo?.especialidade || 'Nefrologia Clínica'}
            </Text>
          </View>
        </View>

        {/* TÍTULO */}
        <View style={styles.docTitleBlock}>
          <Text style={styles.docTitle}>{docTitleMap[docType] || 'Documento Médico'}</Text>
          {documentData?.subtitulo && (
            <Text style={styles.docSubtitle}>{documentData.subtitulo}</Text>
          )}
        </View>

        {/* DADOS DO PACIENTE */}
        <View style={styles.patientBox}>
          <View style={styles.patientRow}>
            <Text style={styles.label}>PACIENTE:</Text>
            <Text style={styles.value}>{patient?.nome || documentData?.patientNome || 'Paciente'}</Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.label}>CPF:</Text>
            <Text style={styles.value}>{patient?.cpf || documentData?.patientCpf || 'Não informado'}</Text>
          </View>
          <View style={styles.patientRow}>
            <Text style={styles.label}>DATA DE EMISSÃO:</Text>
            <Text style={styles.value}>{safeFormatDateExtenso(documentData?.data || new Date().toISOString())}</Text>
          </View>
        </View>

        {/* CONTEÚDO PRINCIPAL CONFORME O TIPO */}
        <View style={styles.contentContainer}>
          {/* TIPO: EXAMES */}
          {docType === 'exames' && (
            <View>
              <Text style={{ fontSize: 9.5, color: '#475569', marginBottom: 12 }}>
                Solicito por gentileza a realização dos seguintes exames laboratoriais / diagnósticos:
              </Text>
              
              {Array.isArray(documentData?.exames) && documentData.exames.map((ex, idx) => (
                <View key={idx} style={styles.examItem}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.examText}>{ex}</Text>
                </View>
              ))}

              {documentData?.justificativa && (
                <View style={styles.justificationBox}>
                  <Text style={styles.justificationLabel}>INDICAÇÃO CLÍNICA / JUSTIFICATIVA:</Text>
                  <Text style={styles.justificationText}>{documentData.justificativa}</Text>
                </View>
              )}
            </View>
          )}

          {/* TIPO: ATESTADO */}
          {docType === 'atestado' && (
            <View style={{ paddingTop: 16 }}>
              <Text style={styles.paragraph}>
                Atesto para os devidos fins que o(a) Sr(a). <Text style={{ fontWeight: 'bold' }}>{patient?.nome || documentData?.patientNome}</Text>, portador(a) do CPF nº <Text style={{ fontWeight: 'bold' }}>{patient?.cpf || documentData?.patientCpf || '---'}</Text>, esteve sob meus cuidados médicos especializados nesta data e necessita de <Text style={{ fontWeight: 'bold' }}>{documentData?.diasRepouso || 1} ({documentData?.diasRepousoExtenso || 'um'}) dia(s)</Text> de afastamento de suas atividades habituais e laborais, a partir desta data, para recuperação de sua saúde.
              </Text>

              {documentData?.cid && (
                <Text style={{ fontSize: 9, color: '#64748b', marginTop: 10 }}>
                  Diagnóstico (CID-10): {documentData.cid} {documentData?.cidConsentimento ? '(Informado com consentimento expresso do paciente)' : ''}
                </Text>
              )}

              {documentData?.observacoes && (
                <Text style={{ fontSize: 9.5, color: '#334155', marginTop: 12, lineHeight: 1.5 }}>
                  Observações complementares: {documentData.observacoes}
                </Text>
              )}
            </View>
          )}

          {/* TIPO: DECLARAÇÃO DE COMPARECIMENTO */}
          {docType === 'comparecimento' && (
            <View style={{ paddingTop: 16 }}>
              <Text style={styles.paragraph}>
                Declaro para os devidos fins de comprovação que o(a) Sr(a). <Text style={{ fontWeight: 'bold' }}>{documentData?.paraAcompanhante ? documentData?.nomeAcompanhante : (patient?.nome || documentData?.patientNome)}</Text>, 
                {documentData?.paraAcompanhante 
                  ? ` na condição de acompanhante do(a) paciente ${patient?.nome || documentData?.patientNome}, portador(a) do CPF nº ${patient?.cpf || documentData?.patientCpf || '---'},` 
                  : ` portador(a) do CPF nº ${patient?.cpf || documentData?.patientCpf || '---'},`} compareceu a este serviço médico especializado em consulta no dia <Text style={{ fontWeight: 'bold' }}>{safeFormatDateExtenso(documentData?.data)}</Text>, no período das <Text style={{ fontWeight: 'bold' }}>{documentData?.horaInicio || '09:00'}</Text> às <Text style={{ fontWeight: 'bold' }}>{documentData?.horaFim || '10:00'}</Text>.
              </Text>

              {documentData?.observacoes && (
                <Text style={{ fontSize: 9.5, color: '#334155', marginTop: 12 }}>
                  Observações: {documentData.observacoes}
                </Text>
              )}
            </View>
          )}

          {/* TIPO: PARECER NEFROLÓGICO */}
          {docType === 'parecer' && (
            <View style={{ paddingTop: 10 }}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e3a8a', marginBottom: 6 }}>
                AVALIAÇÃO E CONDUTA NEFROLÓGICA:
              </Text>
              <Text style={styles.paragraph}>
                {documentData?.textoParecer || 'Paciente em acompanhamento nefrológico ambulatorial. Função renal avaliada sem contraindicações absolutas no momento, recomendando-se hidratação volêmica adequada, vigilância de débito urinário e evitar agentes comprovadamente nefrotóxicos (ex: AINEs e contrastes iodados hiperosmolares sem preparo prévio).'}
              </Text>

              {documentData?.conclusao && (
                <View style={styles.justificationBox}>
                  <Text style={styles.justificationLabel}>CONCLUSÃO / RECOMENDAÇÃO:</Text>
                  <Text style={styles.justificationText}>{documentData.conclusao}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* RODAPÉ E ASSINATURA */}
        <View style={styles.footer}>
          <Text style={styles.dateLocation}>
            {getCity()}, {dataExtenso}
          </Text>

          <View style={styles.signatureLine} />
          <Text style={styles.doctorName}>{doctorInfo?.nome || 'Dr. Marcelo Ramos'}</Text>
          <Text style={styles.doctorCrm}>
            CRM {doctorInfo?.crm || '654321'}/{doctorInfo?.ufCrm || 'SP'} {doctorInfo?.rqe ? `• RQE ${doctorInfo.rqe}` : ''}
          </Text>
          <Text style={{ fontSize: 7.5, color: '#94a3b8', marginTop: 2 }}>
            {doctorInfo?.especialidade || 'Nefrologia'} • Documento assinado eletronicamente via NexAi-NEFRO
          </Text>
        </View>
      </Page>
    </Document>
  );
}
