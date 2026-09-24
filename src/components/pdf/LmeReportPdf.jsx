import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { safeFormatDate, safeFormatDateExtenso } from '../../utils/dateUtils';

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 28,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  // Cabeçalho Oficial SUS
  susHeader: {
    borderWidth: 1,
    borderColor: '#0f172a',
    padding: 6,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    textAlign: 'center'
  },
  susTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#0f172a',
    letterSpacing: 0.4
  },
  susSub: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 2
  },
  lmeCodeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 3
  },
  lmeCodeText: {
    fontSize: 7,
    color: '#475569'
  },
  // Blocos e Seções
  boxSection: {
    borderWidth: 1,
    borderColor: '#0f172a',
    marginBottom: 6
  },
  sectionHeader: {
    backgroundColor: '#e2e8f0',
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a',
    borderBottomWidth: 0.8,
    borderBottomColor: '#0f172a',
    textTransform: 'uppercase'
  },
  sectionBody: {
    padding: 5
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3
  },
  col: {
    flexDirection: 'column'
  },
  label: {
    fontSize: 6.5,
    color: '#475569',
    textTransform: 'uppercase',
    marginBottom: 1
  },
  value: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  // Tabela de Medicamentos
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 0.5,
    borderBottomColor: '#94a3b8',
    paddingVertical: 3,
    paddingHorizontal: 4
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'center'
  },
  tableCellHeader: {
    fontSize: 7,
    fontWeight: 'bold',
    color: '#1e293b'
  },
  tableCell: {
    fontSize: 7.5,
    color: '#0f172a'
  },
  // Tabela de Exames
  examTable: {
    marginTop: 3,
    borderWidth: 0.5,
    borderColor: '#cbd5e1'
  },
  examRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 2.5,
    paddingHorizontal: 4
  },
  // Assinaturas
  signaturesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 6
  },
  signatureBox: {
    width: '46%',
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#0f172a',
    paddingTop: 4
  },
  signatureName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#0f172a'
  },
  signatureSub: {
    fontSize: 6.5,
    color: '#64748b',
    marginTop: 1
  },
  // Página 2: Relatório Médico Circunstanciado
  reportHeader: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#1e3a8a',
    paddingBottom: 6,
    marginBottom: 10
  },
  reportClinic: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e3a8a'
  },
  reportDocTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
    textTransform: 'uppercase',
    color: '#0f172a'
  },
  reportTextParagraph: {
    fontSize: 8.5,
    lineHeight: 1.45,
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'justify'
  }
});

export default function LmeReportPdf({
  patient = {},
  doctorInfo = {},
  lmeData = {},
  clinicalReportText = ''
}) {
  const dataHoje = safeFormatDate(new Date().toISOString().split('T')[0]);
  const dataExtenso = safeFormatDateExtenso(new Date().toISOString().split('T')[0]);

  const exames = lmeData?.examesUtilizados || {};
  const examesEntries = Object.entries(exames).filter(([_, item]) => {
    const val = typeof item === 'object' ? item.valor : item;
    return val !== undefined && val !== null && val !== '';
  });

  const getExamLabel = (key) => {
    const map = {
      hb: 'Hemoglobina (Hb)',
      ht: 'Hematócrito (Ht)',
      ferritina: 'Ferritina Sérica',
      ist: 'Índice Sat. Transferrina (IST)',
      fosforo: 'Fósforo Sérico (P)',
      ca: 'Cálcio Total (Ca)',
      caxp: 'Produto Ca x P',
      pth: 'Paratormônio Intacto (PTHi)',
      ktv: 'Adequação Kt/V'
    };
    return map[key] || key.toUpperCase();
  };

  const getExamParamPcdt = (key) => {
    const map = {
      hb: 'Alvo: 10,0 a 12,0 g/dL',
      ht: 'Alvo: 30 a 36%',
      ferritina: 'Alvo: > 100 ng/mL (HD > 200)',
      ist: 'Alvo: > 20%',
      fosforo: 'Alvo: < 5,5 mg/dL',
      ca: 'Alvo: 8,5 a 10,2 mg/dL',
      caxp: 'Alvo: < 55 mg²/dL²',
      pth: 'Alvo: 150 a 300 / < 600',
      ktv: 'Alvo: ≥ 1,20'
    };
    return map[key] || '-';
  };

  return (
    <Document title={`LME_${patient?.nome || 'Paciente'}_${lmeData?.medicamentoNome || 'Medicamento'}`}>
      
      {/* =========================================================================
          PÁGINA 1: FORMULÁRIO OFICIAL LME PADRÃO MINISTÉRIO DA SAÚDE / SUS
         ========================================================================= */}
      <Page size="A4" style={styles.page}>
        
        {/* Cabeçalho SUS */}
        <View style={styles.susHeader}>
          <Text style={styles.susTitle}>SISTEMA ÚNICO DE SAÚDE - SUS | MINISTÉRIO DA SAÚDE</Text>
          <Text style={styles.susSub}>LAUDO PARA SOLICITAÇÃO, AVALIAÇÃO E AUTORIZAÇÃO DE MEDICAMENTOS (LME)</Text>
          <View style={styles.lmeCodeBox}>
            <Text style={styles.lmeCodeText}>COMPONENTE ESPECIALIZADO DA ASSISTÊNCIA FARMACÊUTICA (CEAF)</Text>
            <Text style={styles.lmeCodeText}>Emissão: {safeFormatDate(lmeData?.dataSolicitacao) || dataHoje}</Text>
          </View>
        </View>

        {/* 1. DADOS DO PACIENTE */}
        <View style={styles.boxSection}>
          <Text style={styles.sectionHeader}>1. Identificação do Paciente</Text>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={[styles.col, { width: '55%' }]}>
                <Text style={styles.label}>Nome Completo do Paciente</Text>
                <Text style={styles.value}>{patient?.nome || 'Não informado'}</Text>
              </View>
              <View style={[styles.col, { width: '25%' }]}>
                <Text style={styles.label}>Cartão Nacional de Saúde (CNS)</Text>
                <Text style={styles.value}>{patient?.cns || patient?.cartaoSus || 'Pendente / Cadastro SUS'}</Text>
              </View>
              <View style={[styles.col, { width: '20%' }]}>
                <Text style={styles.label}>CPF</Text>
                <Text style={styles.value}>{patient?.cpf || 'Não informado'}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.col, { width: '50%' }]}>
                <Text style={styles.label}>Nome da Mãe</Text>
                <Text style={styles.value}>{patient?.nomeMae || 'Não informado'}</Text>
              </View>
              <View style={[styles.col, { width: '20%' }]}>
                <Text style={styles.label}>Data de Nasc.</Text>
                <Text style={styles.value}>{safeFormatDate(patient?.dataNascimento) || '-'}</Text>
              </View>
              <View style={[styles.col, { width: '15%' }]}>
                <Text style={styles.label}>Idade / Sexo</Text>
                <Text style={styles.value}>{patient?.idade ? `${patient.idade} anos` : '-'} / {patient?.sexo || '-'}</Text>
              </View>
              <View style={[styles.col, { width: '15%' }]}>
                <Text style={styles.label}>Telefone</Text>
                <Text style={styles.value}>{patient?.telefone || '-'}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.col, { width: '55%' }]}>
                <Text style={styles.label}>Endereço Residencial (Rua, Número, Bairro)</Text>
                <Text style={[styles.value, { fontSize: 7.5 }]}>{patient?.endereco || 'Endereço residencial cadastrado na unidade'}</Text>
              </View>
              <View style={[styles.col, { width: '25%' }]}>
                <Text style={styles.label}>Município / UF</Text>
                <Text style={styles.value}>{patient?.cidade || 'Betim'} / {patient?.uf || 'MG'}</Text>
              </View>
              <View style={[styles.col, { width: '20%' }]}>
                <Text style={styles.label}>Peso Seco / Altura</Text>
                <Text style={styles.value}>{patient?.pesoSeco ? `${patient.pesoSeco} kg` : '-'} / {patient?.altura ? `${patient.altura} cm` : '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. DIAGNÓSTICO & CLÍNICA */}
        <View style={styles.boxSection}>
          <Text style={styles.sectionHeader}>2. Diagnóstico Clínico e Unidade Solicitante</Text>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={[styles.col, { width: '45%' }]}>
                <Text style={styles.label}>CID-10 Principal</Text>
                <Text style={styles.value}>
                  {lmeData?.cidPrincipal || 'N18.0'} - {lmeData?.cidDescricao || 'Doença renal em estágio terminal'}
                </Text>
              </View>
              <View style={[styles.col, { width: '30%' }]}>
                <Text style={styles.label}>CID-10 Secundário / Associado</Text>
                <Text style={styles.value}>
                  {lmeData?.cidSecundario ? `${lmeData.cidSecundario} - ${lmeData.cidSecundarioDescricao || ''}` : 'Não aplicável'}
                </Text>
              </View>
              <View style={[styles.col, { width: '25%' }]}>
                <Text style={styles.label}>Unidade Dialítica / Clínica</Text>
                <Text style={styles.value}>{patient?.clinica || 'DialiZe Betim'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. MEDICAMENTO SOLICITADO */}
        <View style={styles.boxSection}>
          <Text style={styles.sectionHeader}>3. Medicamento Solicitado (Componente Especializado)</Text>
          <View style={styles.sectionBody}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, { width: '40%' }]}>Fármaco / Princípio Ativo</Text>
              <Text style={[styles.tableCellHeader, { width: '25%' }]}>Concentração / Apresentação</Text>
              <Text style={[styles.tableCellHeader, { width: '15%' }]}>Qtd. Mensal</Text>
              <Text style={[styles.tableCellHeader, { width: '20%' }]}>Período Solicitado</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '40%', fontWeight: 'bold' }]}>
                {lmeData?.medicamentoNome || 'Alfaepoetina'}
              </Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>
                {lmeData?.concentracaoLabel || '4.000 UI'}
              </Text>
              <Text style={[styles.tableCell, { width: '15%', fontWeight: 'bold' }]}>
                {lmeData?.quantidadeMensal || 12} un/mês
              </Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>
                {lmeData?.vigenciaMeses || 6} meses ({Number(lmeData?.quantidadeMensal || 12) * Number(lmeData?.vigenciaMeses || 6)} total)
              </Text>
            </View>

            <View style={{ marginTop: 4 }}>
              <Text style={styles.label}>Posologia Prescrita</Text>
              <Text style={[styles.value, { fontSize: 8, color: '#1e3a8a' }]}>
                {lmeData?.posologia || 'Conforme prescrição médica nefrológica'}
              </Text>
            </View>

            <View style={{ marginTop: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={[styles.col, { width: '48%' }]}>
                <Text style={styles.label}>Data Início da Vigência</Text>
                <Text style={styles.value}>{safeFormatDate(lmeData?.dataSolicitacao) || dataHoje}</Text>
              </View>
              <View style={[styles.col, { width: '48%' }]}>
                <Text style={styles.label}>Data Prevista para Renovação / Término</Text>
                <Text style={styles.value}>{safeFormatDate(lmeData?.dataValidade) || '6 meses'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. EXAMES LABORATORIAIS COMPROBATÓRIOS (PCDT) */}
        <View style={styles.boxSection}>
          <Text style={styles.sectionHeader}>4. Exames Comprobatórios Recentes (Conforme PCDT do SUS)</Text>
          <View style={styles.sectionBody}>
            {examesEntries.length === 0 ? (
              <Text style={{ fontSize: 7.5, color: '#64748b', fontStyle: 'italic' }}>
                Nenhum exame laboratorial específico anexado a esta solicitação.
              </Text>
            ) : (
              <View style={styles.examTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCellHeader, { width: '40%' }]}>Exame Obrigatório</Text>
                  <Text style={[styles.tableCellHeader, { width: '25%' }]}>Resultado Obtido</Text>
                  <Text style={[styles.tableCellHeader, { width: '20%' }]}>Data da Coleta</Text>
                  <Text style={[styles.tableCellHeader, { width: '15%' }]}>Meta PCDT</Text>
                </View>
                {examesEntries.map(([key, item]) => {
                  const val = typeof item === 'object' ? item.valor : item;
                  const dataEx = typeof item === 'object' ? item.data : '';
                  return (
                    <View key={key} style={styles.examRow}>
                      <Text style={[styles.tableCell, { width: '40%', fontWeight: 'bold' }]}>
                        {getExamLabel(key)}
                      </Text>
                      <Text style={[styles.tableCell, { width: '25%', color: '#1e3a8a', fontWeight: 'bold' }]}>
                        {String(val)}
                      </Text>
                      <Text style={[styles.tableCell, { width: '20%' }]}>
                        {safeFormatDate(dataEx) || dataHoje}
                      </Text>
                      <Text style={[styles.tableCell, { width: '15%', fontSize: 7, color: '#64748b' }]}>
                        {getExamParamPcdt(key)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* 5. IDENTIFICAÇÃO DO MÉDICO SOLICITANTE */}
        <View style={styles.boxSection}>
          <Text style={styles.sectionHeader}>5. Identificação e Assinatura do Médico Solicitante</Text>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
              <View style={[styles.col, { width: '36%' }]}>
                <Text style={styles.label}>Nome do Médico(a)</Text>
                <Text style={styles.value}>{doctorInfo?.nome || lmeData?.medicoSolicitante?.nome || 'Dr(a). Médico(a)'}</Text>
              </View>
              <View style={[styles.col, { width: '20%' }]}>
                <Text style={styles.label}>CRM / UF</Text>
                <Text style={styles.value}>
                  {doctorInfo?.crm || lmeData?.medicoSolicitante?.crm || '—'} / {doctorInfo?.ufCrm || lmeData?.medicoSolicitante?.ufCrm || 'SP'}
                </Text>
              </View>
              <View style={[styles.col, { width: '24%' }]}>
                <Text style={styles.label}>CNS do Médico (Cartão SUS)</Text>
                <Text style={styles.value}>{lmeData?.medicoSolicitante?.cns || doctorInfo?.cns || '—'}</Text>
              </View>
              <View style={[styles.col, { width: '20%' }]}>
                <Text style={styles.label}>CPF do Médico</Text>
                <Text style={styles.value}>{doctorInfo?.cpf || lmeData?.medicoSolicitante?.cpf || '-'}</Text>
              </View>
            </View>

            <View style={styles.signaturesContainer}>
              <View style={styles.signatureBox}>
                <Text style={styles.signatureName}>{patient?.nome || 'Paciente / Responsável'}</Text>
                <Text style={styles.signatureSub}>Assinatura do Paciente ou Responsável Legal</Text>
              </View>
              <View style={styles.signatureBox}>
                <Text style={styles.signatureName}>{doctorInfo?.nome || lmeData?.medicoSolicitante?.nome || 'Médico Nefrologista'}</Text>
                <Text style={styles.signatureSub}>
                  CRM {doctorInfo?.crm || lmeData?.medicoSolicitante?.crm || ''}/{doctorInfo?.ufCrm || lmeData?.medicoSolicitante?.ufCrm || 'SP'}
                  {(lmeData?.medicoSolicitante?.cns || doctorInfo?.cns) ? ` • CNS ${lmeData?.medicoSolicitante?.cns || doctorInfo?.cns}` : ''} • Carimbo e Assinatura
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={{ textAlign: 'center', fontSize: 6.5, color: '#94a3b8', marginTop: 4 }}>
          Documento emitido eletronicamente via Nex-Ai.NEFRO • Sistema de Gestão Nefrológica Cloud
        </Text>
      </Page>

      {/* =========================================================================
          PÁGINA 2: RELATÓRIO MÉDICO CIRCUNSTANCIADO & JUSTIFICATIVA CLÍNICA
         ========================================================================= */}
      <Page size="A4" style={styles.page}>
        
        {/* Cabeçalho da Clínica */}
        <View style={styles.reportHeader}>
          <Text style={styles.reportClinic}>{patient?.clinica || 'DialiZe Betim - Terapia Renal Substitutiva'}</Text>
          <Text style={{ fontSize: 7.5, color: '#64748b', marginTop: 1 }}>
            Serviço de Nefrologia Clínica e Diálise • Responsável Técnico: {doctorInfo?.nome || 'Nefrologista'}
          </Text>
        </View>

        <Text style={styles.reportDocTitle}>
          RELATÓRIO MÉDICO CIRCUNSTANCIADO - CEAF / SUS
        </Text>
        <Text style={{ fontSize: 8, color: '#64748b', textAlign: 'center', marginBottom: 12, fontWeight: 'bold' }}>
          JUSTIFICATIVA CLÍNICA PARA FORNECIMENTO DE MEDICAMENTO DE ALTO CUSTO
        </Text>

        <View style={[styles.boxSection, { backgroundColor: '#f8fafc', padding: 8, marginBottom: 12 }]}>
          <View style={styles.row}>
            <Text style={{ width: '65%', fontSize: 8, fontWeight: 'bold' }}>
              Paciente: {patient?.nome} (CNS: {patient?.cns || patient?.cartaoSus || 'SUS'})
            </Text>
            <Text style={{ width: '35%', fontSize: 8, textAlign: 'right' }}>
              CPF: {patient?.cpf || '-'} • Idade: {patient?.idade || '-'} anos
            </Text>
          </View>
          <View style={[styles.row, { marginTop: 3 }]}>
            <Text style={{ width: '100%', fontSize: 8, color: '#334155' }}>
              Diagnóstico: {lmeData?.cidPrincipal || 'N18.0'} ({lmeData?.cidDescricao || 'DRC Terminal'})
              {patient?.etiologiaDRC ? ` • Etiologia: ${patient.etiologiaDRC}` : ''}
            </Text>
          </View>
        </View>

        {/* Texto da Justificativa Clínica */}
        <Text style={styles.reportTextParagraph}>
          {clinicalReportText || `O(A) paciente supramencionado(a) encontra-se em programa crônico e ambulatorial de hemodiálise periódica 3 vezes por semana sob meus cuidados clínicos na unidade ${patient?.clinica || 'de nefrologia'}. Trata-se de paciente portador(a) de Doença Renal Crônica em estágio terminal (CID-10: ${lmeData?.cidPrincipal || 'N18.0'}), dependente de terapia renal substitutiva.`}
        </Text>

        <Text style={styles.reportTextParagraph}>
          Conforme diretrizes vigentes do Protocolo Clínico e Diretrizes Terapêuticas (PCDT) do Ministério da Saúde para o Componente Especializado da Assistência Farmacêutica, foi prescrito o fármaco {lmeData?.medicamentoNome || 'indicado'} ({lmeData?.concentracaoLabel || ''}), na posologia de: {lmeData?.posologia || 'conforme prescrição'}.
        </Text>

        <Text style={styles.reportTextParagraph}>
          A manutenção rigorosa da terapêutica é indispensável para evitar o agravamento do quadro clínico, prevenir internações de urgência por instabilidade clínica e garantir a sobrevida do(a) paciente. Declaro, para os devidos fins legais e auditoria médica da Secretaria de Estado de Saúde, que o(a) paciente preenche integralmente os critérios de inclusão preconizados no protocolo clínico do SUS.
        </Text>

        <View style={{ marginTop: 24, textAlign: 'right' }}>
          <Text style={{ fontSize: 8.5, color: '#334155', marginBottom: 20 }}>
            {patient?.cidade || 'Betim'} - {patient?.uf || 'MG'}, {dataExtenso}.
          </Text>

          <View style={{ alignItems: 'flex-end' }}>
            <View style={{ width: '240px', borderTopWidth: 1, borderTopColor: '#0f172a', paddingTop: 4, textAlign: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#0f172a' }}>
                {doctorInfo?.nome || lmeData?.medicoSolicitante?.nome || 'Dra. Camila Duque'}
              </Text>
              <Text style={{ fontSize: 7.5, color: '#64748b', marginTop: 1 }}>
                CRM {doctorInfo?.crm || lmeData?.medicoSolicitante?.crm || ''}/{doctorInfo?.ufCrm || lmeData?.medicoSolicitante?.ufCrm || 'SP'}
                {(lmeData?.medicoSolicitante?.cns || doctorInfo?.cns) ? ` • CNS ${lmeData?.medicoSolicitante?.cns || doctorInfo?.cns}` : ''}
              </Text>
              <Text style={{ fontSize: 7, color: '#64748b' }}>
                {doctorInfo?.titulo || 'Médico Nefrologista'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ position: 'absolute', bottom: 20, left: 28, right: 28, textAlign: 'center' }}>
          <Text style={{ fontSize: 6.5, color: '#94a3b8' }}>
            Nex-Ai.NEFRO • Sistema Inteligente de Nefrologia Clínica • Relatório gerado com respaldo nos dados de exames do prontuário
          </Text>
        </View>

      </Page>
    </Document>
  );
}
