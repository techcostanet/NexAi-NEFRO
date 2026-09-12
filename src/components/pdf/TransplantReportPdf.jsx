import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { safeFormatDate } from '../../utils/dateUtils';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 8,
    marginBottom: 10
  },
  brand: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a'
  },
  subBrand: {
    fontSize: 7.5,
    color: '#64748b',
    marginTop: 2
  },
  emissionInfo: {
    fontSize: 7.5,
    color: '#64748b',
    textAlign: 'right'
  },
  titleBlock: {
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 4
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 0.3
  },
  subtitle: {
    fontSize: 8,
    color: '#2563eb',
    marginTop: 2,
    fontWeight: 'bold'
  },
  section: {
    marginBottom: 10,
    borderWidth: 0.8,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 8,
    backgroundColor: '#fafbfc'
  },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textTransform: 'uppercase',
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 3
  },
  grid3: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  col3: {
    width: '33.3%',
    marginBottom: 4
  },
  grid4: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  col4: {
    width: '25%',
    marginBottom: 4
  },
  label: {
    color: '#64748b',
    fontSize: 7.5
  },
  val: {
    fontWeight: 'bold',
    color: '#0f172a'
  },
  medItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9'
  },
  signatureBlock: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10
  },
  sigLine: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
    marginBottom: 3
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 4,
    fontSize: 7,
    color: '#94a3b8'
  }
});

export default function TransplantReportPdf({
  patient,
  doctorInfo,
  statusTransplante,
  acessoVascular = {},
  exames = {},
  hemoculturas = [],
  medicamentosList = [],
  ultimoPeso = null
}) {
  if (!patient) return null;

  const dataEmissao = new Date().toLocaleDateString('pt-BR');
  const doctorName = doctorInfo?.nome || 'Dr(a). Médico(a) Nefrologista';
  const doctorCrm = doctorInfo?.crm ? `CRM/${doctorInfo?.ufCrm || 'SP'} ${doctorInfo?.crm}` : 'CRM/SP';
  const doctorRqe = doctorInfo?.rqe ? ` • RQE: ${doctorInfo?.rqe}` : '';

  return (
    <Document title={`Laudo_Transplante_${patient.nome}`}>
      <Page size="A4" style={styles.page}>
        {/* Topo */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Nex-Ai.NEFRO</Text>
            <Text style={styles.subBrand}>Prontuário Eletrônico em Nuvem</Text>
            <Text style={{ fontSize: 7.5, color: '#475569', marginTop: 1 }}>
              Unidade: {patient.clinica || 'Centro Nefrológico'} • Hospital: {patient.hospital || 'Hospital Vinculado'}
            </Text>
          </View>
          <View style={styles.emissionInfo}>
            <Text>Data: {dataEmissao}</Text>
            <Text style={{ color: '#2563eb', fontWeight: 'bold', marginTop: 2 }}>Status: {statusTransplante || 'Em Triagem'}</Text>
          </View>
        </View>

        {/* Título */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>LAUDO MÉDICO DE ENCAMINHAMENTO AO TRANSPLANTE RENAL</Text>
          <Text style={styles.subtitle}>Relatório Clínico Oficial para Inscrição em Lista de Espera</Text>
        </View>

        {/* 1. Identificação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Identificação do Paciente Candidato</Text>
          <View style={styles.grid3}>
            <View style={styles.col3}><Text><Text style={styles.label}>Nome: </Text><Text style={styles.val}>{patient.nome?.toUpperCase()}</Text></Text></View>
            <View style={styles.col3}><Text><Text style={styles.label}>CPF: </Text><Text style={styles.val}>{patient.cpf || 'Não informado'}</Text></Text></View>
            <View style={styles.col3}><Text><Text style={styles.label}>Idade / Sexo: </Text><Text style={styles.val}>{patient.idade ? `${patient.idade} anos` : '--'} / {patient.sexo || '--'}</Text></Text></View>
            <View style={styles.col3}><Text><Text style={styles.label}>Etiologia DRC: </Text><Text style={styles.val}>{patient.etiologiaDRC || 'Não informada'}</Text></Text></View>
            <View style={styles.col3}><Text><Text style={styles.label}>Início Diálise: </Text><Text style={styles.val}>{safeFormatDate(patient.dataInicioDialise)}</Text></Text></View>
            <View style={styles.col3}><Text><Text style={styles.label}>Turno: </Text><Text style={styles.val}>{patient.turno || '1º Turno'}</Text></Text></View>
          </View>
        </View>

        {/* 2. Acesso Vascular */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Acesso Vascular</Text>
          <View style={styles.grid3}>
            <View style={styles.col3}><Text><Text style={styles.label}>Acesso: </Text><Text style={styles.val}>{acessoVascular.tipo || 'FAV'}</Text></Text></View>
            <View style={styles.col3}><Text><Text style={styles.label}>Membro/Local: </Text><Text style={styles.val}>{acessoVascular.ladoMembro || '-'}</Text></Text></View>
            <View style={styles.col3}><Text><Text style={styles.label}>Fluxo (Qb): </Text><Text style={styles.val}>{acessoVascular.fluxoSangue ? `${acessoVascular.fluxoSangue} ml/min` : '-'}</Text></Text></View>
            <View style={styles.col3}><Text><Text style={styles.label}>Peso Seco: </Text><Text style={styles.val}>{patient.pesoSeco ? `${patient.pesoSeco} kg` : '-'}</Text></Text></View>
            <View style={styles.col3}><Text><Text style={styles.label}>Último Peso: </Text><Text style={styles.val}>{ultimoPeso ? `${ultimoPeso} kg` : '-'}</Text></Text></View>
            <View style={styles.col3}><Text><Text style={styles.label}>Alergias: </Text><Text style={styles.val}>{Array.isArray(patient.alergias) && patient.alergias.length > 0 ? patient.alergias.join(', ') : 'Nega alergias'}</Text></Text></View>
          </View>
        </View>

        {/* 3. Laboratório Recente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Perfil Laboratorial</Text>
          <View style={styles.grid4}>
            <View style={styles.col4}><Text><Text style={styles.label}>Hb: </Text><Text style={styles.val}>{exames.hb ? `${exames.hb} g/dL` : '-'}</Text></Text></View>
            <View style={styles.col4}><Text><Text style={styles.label}>Ht: </Text><Text style={styles.val}>{exames.ht ? `${exames.ht}%` : '-'}</Text></Text></View>
            <View style={styles.col4}><Text><Text style={styles.label}>Ferritina: </Text><Text style={styles.val}>{exames.ferritina ? `${exames.ferritina} ng/mL` : '-'}</Text></Text></View>
            <View style={styles.col4}><Text><Text style={styles.label}>IST: </Text><Text style={styles.val}>{exames.ist ? `${exames.ist}%` : '-'}</Text></Text></View>
            <View style={styles.col4}><Text><Text style={styles.label}>PTH: </Text><Text style={styles.val}>{exames.pth ? `${exames.pth} pg/mL` : '-'}</Text></Text></View>
            <View style={styles.col4}><Text><Text style={styles.label}>Fósforo: </Text><Text style={styles.val}>{exames.fosforo ? `${exames.fosforo} mg/dL` : '-'}</Text></Text></View>
            <View style={styles.col4}><Text><Text style={styles.label}>Cálcio: </Text><Text style={styles.val}>{exames.ca ? `${exames.ca} mg/dL` : '-'}</Text></Text></View>
            <View style={styles.col4}><Text><Text style={styles.label}>Potássio: </Text><Text style={styles.val}>{exames.k ? `${exames.k} mEq/L` : '-'}</Text></Text></View>
            <View style={styles.col4}><Text><Text style={styles.label}>Kt/V: </Text><Text style={styles.val}>{exames.ktv || '-'}</Text></Text></View>
            <View style={styles.col4}><Text><Text style={styles.label}>Albumina: </Text><Text style={styles.val}>{exames.albumina ? `${exames.albumina} g/dL` : '-'}</Text></Text></View>
            <View style={styles.col4}><Text><Text style={styles.label}>Creatinina: </Text><Text style={styles.val}>{exames.creatinina ? `${exames.creatinina} mg/dL` : '-'}</Text></Text></View>
            <View style={styles.col4}><Text><Text style={styles.label}>PCR: </Text><Text style={styles.val}>{exames.pcr ? `${exames.pcr} mg/L` : '-'}</Text></Text></View>
          </View>
          <View style={{ marginTop: 4, backgroundColor: '#ffffff', padding: 4, borderRadius: 3, borderWidth: 0.5, borderColor: '#e2e8f0' }}>
            <Text style={{ fontSize: 7, color: '#475569' }}>
              <Text style={{ fontWeight: 'bold' }}>Hemoculturas: </Text>
              {hemoculturas.length === 0 ? 'Sem registros de hemoculturas positivas recentes.' : hemoculturas.map(h => `${new Date(h.dataColeta).toLocaleDateString('pt-BR')}: ${h.resultado}`).join(' • ')}
            </Text>
          </View>
        </View>

        {/* 4. Prescrições em Uso */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Medicamentos em Uso Regular</Text>
          {medicamentosList.filter(m => m.ativo !== false).length === 0 ? (
            <Text style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhuma medicação ativa informada.</Text>
          ) : (
            medicamentosList.filter(m => m.ativo !== false).slice(0, 8).map((med, i) => (
              <View key={i} style={styles.medItem}>
                <Text><Text style={{ fontWeight: 'bold' }}>• {med.nome}</Text> - {med.dosagem} ({med.via || 'VO'})</Text>
                <Text style={{ color: '#64748b' }}>{med.frequencia}</Text>
              </View>
            ))
          )}
        </View>

        {/* Assinatura */}
        <View style={styles.signatureBlock}>
          <View>
            <Text style={{ fontSize: 7, color: '#94a3b8' }}>Prontuário autêntico e laudo emitido via Cloud Firestore</Text>
            <Text style={{ fontSize: 7, color: '#94a3b8' }}>Nex-Ai.NEFRO Software Médico</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.sigLine} />
            <Text style={{ fontWeight: 'bold', fontSize: 9 }}>{doctorName}</Text>
            <Text style={{ fontSize: 7.5, color: '#475569' }}>{doctorCrm}{doctorRqe}</Text>
          </View>
        </View>

        {/* Rodapé fixo */}
        <View style={styles.footer} fixed>
          <Text>Nex-Ai.NEFRO • Sistema Especializado de Nefrologia</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
