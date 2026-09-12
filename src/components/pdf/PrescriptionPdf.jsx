import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { safeFormatDateExtenso } from '../../utils/dateUtils';

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 36,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  header: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 8,
    marginBottom: 10
  },
  clinicName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
    letterSpacing: 0.3
  },
  clinicSub: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2
  },
  docTitleBlock: {
    marginTop: 6,
    marginBottom: 8,
    textAlign: 'center'
  },
  docTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: 0.5
  },
  docSubtitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 2
  },
  patientBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 8,
    marginBottom: 10
  },
  patientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  label: {
    color: '#64748b',
    fontSize: 8
  },
  value: {
    fontWeight: 'bold',
    color: '#0f172a',
    fontSize: 9
  },
  itemsContainer: {
    flexGrow: 1,
    minHeight: 280,
    marginBottom: 10
  },
  itemBlock: {
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0'
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3
  },
  itemIndexAndName: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemIndex: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginRight: 4
  },
  itemName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  itemDose: {
    fontSize: 8,
    color: '#2563eb',
    fontWeight: 'bold',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3
  },
  itemPosology: {
    fontSize: 8.5,
    color: '#334155',
    lineHeight: 1.3,
    paddingLeft: 12
  },
  itemObservation: {
    fontSize: 7.5,
    color: '#64748b',
    fontStyle: 'italic',
    paddingLeft: 12,
    marginTop: 2
  },
  twoViasBox: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    padding: 6,
    marginBottom: 10,
    backgroundColor: '#ffffff'
  },
  twoViasTitle: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#334155',
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 2
  },
  twoViasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  twoViasCol: {
    width: '48%'
  },
  signatureSection: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    alignItems: 'center'
  },
  signatureLine: {
    width: 220,
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
    marginBottom: 4
  },
  doctorName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  doctorCredentials: {
    fontSize: 8,
    color: '#475569',
    marginTop: 1
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 6,
    marginTop: 8,
    fontSize: 7,
    color: '#94a3b8'
  }
});

export default function PrescriptionPdf({
  prescription,
  patient,
  doctorInfo,
  currentVia = 1
}) {
  if (!prescription || !patient) return null;

  const docInfo = prescription.medico || doctorInfo || {};
  const doctorName = docInfo.nome || 'Dr(a). Médico(a) Responsável';
  const doctorCrm = docInfo.crm ? `CRM/${docInfo.ufCrm || 'SP'} ${docInfo.crm}` : 'CRM/SP';
  const doctorRqe = docInfo.rqe ? ` • RQE: ${docInfo.rqe}` : '';
  const doctorEspecialidade = docInfo.especialidade || docInfo.titulo || 'Nefrologia Clínica';
  const clinicaNome = docInfo.clinica || docInfo.clinicaPrincipal || patient.clinica || 'Clínica de Nefrologia';
  const enderecoClinica = docInfo.endereco || 'Atendimento Especializado em Nefrologia';

  const tipoReceita = prescription.tipoReceita || 'simples';
  const isControleEspecial = tipoReceita === 'controle_especial';
  const isAntimicrobiano = tipoReceita === 'antimicrobiano';
  const itens = Array.isArray(prescription.itens) ? prescription.itens : [];

  const dataFormatada = safeFormatDateExtenso(prescription.dataEmissao);

  const getTitulo = () => {
    switch (tipoReceita) {
      case 'controle_especial': return 'RECEITUÁRIO DE CONTROLE ESPECIAL';
      case 'antimicrobiano': return 'RECEITUÁRIO DE ANTIMICROBIANOS';
      case 'alto_custo': return 'RECEITA MÉDICA - COMPONENTE ESPECIALIZADO (LME)';
      default: return 'RECEITUÁRIO MÉDICO';
    }
  };

  const subtituloVia = (isControleEspecial || isAntimicrobiano)
    ? (currentVia === 1 ? '1ª VIA - RETENÇÃO DA FARMÁCIA' : '2ª VIA - ORIENTAÇÃO DO PACIENTE')
    : null;

  return (
    <Document title={`Receituario_${patient.nome}_${prescription.id || 'Nefro'}`}>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.clinicName}>{clinicaNome.toUpperCase()}</Text>
          <Text style={styles.clinicSub}>{enderecoClinica} • {doctorEspecialidade}</Text>
        </View>

        {/* Título do Documento */}
        <View style={styles.docTitleBlock}>
          <Text style={styles.docTitle}>{getTitulo()}</Text>
          {subtituloVia && <Text style={styles.docSubtitle}>{subtituloVia}</Text>}
        </View>

        {/* Dados do Paciente */}
        <View style={styles.patientBox}>
          <View style={styles.patientRow}>
            <Text><Text style={styles.label}>Paciente: </Text><Text style={styles.value}>{patient.nome?.toUpperCase()}</Text></Text>
            <Text><Text style={styles.label}>Data: </Text><Text style={styles.value}>{dataFormatada}</Text></Text>
          </View>
          <View style={styles.patientRow}>
            <Text><Text style={styles.label}>CPF: </Text><Text style={styles.value}>{patient.cpf || 'Não informado'}</Text></Text>
            <Text><Text style={styles.label}>Idade / Sexo: </Text><Text style={styles.value}>{patient.idade ? `${patient.idade} anos` : '--'} / {patient.sexo || '--'}</Text></Text>
          </View>
          {patient.endereco && (
            <View style={{ marginTop: 2 }}>
              <Text><Text style={styles.label}>Endereço: </Text><Text style={styles.value}>{patient.endereco}</Text></Text>
            </View>
          )}
        </View>

        {/* Lista de Medicamentos */}
        <View style={styles.itemsContainer}>
          {itens.length === 0 ? (
            <Text style={{ fontStyle: 'italic', color: '#94a3b8', textAlign: 'center', marginTop: 30 }}>
              Nenhum medicamento prescrito nesta receita.
            </Text>
          ) : (
            itens.map((it, idx) => (
              <View key={idx} style={styles.itemBlock}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemIndexAndName}>
                    <Text style={styles.itemIndex}>{idx + 1}.</Text>
                    <Text style={styles.itemName}>{it.nome} {it.concentracao || ''} {it.formaFarmaceutica ? `(${it.formaFarmaceutica})` : ''}</Text>
                  </View>
                  {it.quantidade && <Text style={styles.itemDose}>{it.quantidade}</Text>}
                </View>
                <Text style={styles.itemPosology}>Uso: {it.posologia || 'Conforme orientação médica'}</Text>
                {it.orientacoes && (
                  <Text style={styles.itemObservation}>Obs: {it.orientacoes}</Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Bloco de Duas Vias (Controle Especial / Antimicrobiano) */}
        {(isControleEspecial || isAntimicrobiano) && currentVia === 1 && (
          <View style={styles.twoViasBox}>
            <Text style={styles.twoViasTitle}>Identificação do Comprador (Preenchimento da Farmácia)</Text>
            <View style={styles.twoViasGrid}>
              <View style={styles.twoViasCol}>
                <Text style={{ fontSize: 7, color: '#64748b' }}>Comprador: _____________________________________</Text>
                <Text style={{ fontSize: 7, color: '#64748b', marginTop: 3 }}>RG / Órgão: __________________ Tel: _____________</Text>
                <Text style={{ fontSize: 7, color: '#64748b', marginTop: 3 }}>Endereço: ______________________________________</Text>
              </View>
              <View style={styles.twoViasCol}>
                <Text style={{ fontSize: 7, color: '#64748b' }}>Farmacêutico(a): _______________________________</Text>
                <Text style={{ fontSize: 7, color: '#64748b', marginTop: 3 }}>CRF: ________________ Assinatura: _______________</Text>
                <Text style={{ fontSize: 7, color: '#64748b', marginTop: 3 }}>Data de Dispensação: _____ / _____ / 202___</Text>
              </View>
            </View>
          </View>
        )}

        {/* Seção de Assinatura */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureLine} />
          <Text style={styles.doctorName}>{doctorName}</Text>
          <Text style={styles.doctorCredentials}>{doctorEspecialidade} • {doctorCrm}{doctorRqe}</Text>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>NexAi-NEFRO • Prontuário Eletrônico em Nuvem</Text>
          <Text>Documento Médico Oficial • Emissão Digital</Text>
        </View>
      </Page>
    </Document>
  );
}
