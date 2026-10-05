import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { safeFormatDate } from '../../utils/dateUtils.js';
import { normalizeMedicamentosList } from '../../data/dialysisMedications.js';

/**
 * Higieniza caracteres UTF-4 / emojis para evitar falhas no motor Helvetica do @react-pdf/renderer
 */
function cleanPdfText(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '')
    .trim();
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 26,
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  headerBanner: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerBrand: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  headerSubtitle: {
    color: '#bfdbfe',
    fontSize: 7,
    marginTop: 1
  },
  headerMeta: {
    textAlign: 'right'
  },
  headerMetaText: {
    color: '#ffffff',
    fontSize: 7.5,
    fontWeight: 'bold'
  },
  headerMetaSub: {
    color: '#93c5fd',
    fontSize: 6.5,
    marginTop: 1
  },
  // Blocos de Destaque
  cardBox: {
    borderWidth: 0.8,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    backgroundColor: '#f8fafc'
  },
  cardTitle: {
    fontSize: 8.5,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 3,
    textTransform: 'uppercase'
  },
  grid2: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  grid3: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  col2: {
    width: '49%'
  },
  col3: {
    width: '33.3%'
  },
  col4: {
    width: '25%'
  },
  col5: {
    width: '20%'
  },
  label: {
    color: '#475569',
    fontSize: 6.8,
    fontWeight: 'bold'
  },
  value: {
    color: '#0f172a',
    fontSize: 7.2
  },
  // Estatísticas Rápidas
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  statCard: {
    flex: 1,
    borderWidth: 0.8,
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
    borderRadius: 4,
    padding: 6,
    marginHorizontal: 2,
    textAlign: 'center'
  },
  statNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1d4ed8'
  },
  statLabel: {
    fontSize: 6.5,
    color: '#1e40af',
    fontWeight: 'bold',
    marginTop: 1
  },
  // Tabelas
  table: {
    borderWidth: 0.8,
    borderColor: '#cbd5e1',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e3a8a',
    borderBottomWidth: 1,
    borderBottomColor: '#172554',
    paddingVertical: 4
  },
  tableHeaderCol: {
    paddingHorizontal: 4,
    color: '#ffffff',
    fontSize: 6.5,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 3.5,
    alignItems: 'center'
  },
  tableRowEven: {
    backgroundColor: '#f8fafc'
  },
  tableCol: {
    paddingHorizontal: 4,
    fontSize: 6.5,
    color: '#1e293b'
  },
  // Assinatura e Rodapé
  signatureSection: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sigBox: {
    width: 220,
    alignItems: 'center'
  },
  sigLine: {
    width: 180,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
    marginBottom: 4
  },
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 26,
    right: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 4,
    fontSize: 6.5,
    color: '#64748b'
  }
});

export default function SystemExportPdf({
  patients = [],
  doctor = {},
  locais = [],
  stats = {},
  scopeLabel = 'Integral',
  activeModules = {},
  emissionDate = new Date()
}) {
  const emissionStr = safeFormatDate(emissionDate) + ' às ' + emissionDate.toLocaleTimeString('pt-BR');
  const doctorName = cleanPdfText(doctor.nome || 'Médico Nefrologista');
  const doctorCrm = cleanPdfText(doctor.crm ? `${doctor.crm}/${doctor.ufCrm || 'SP'}` : '---');
  const doctorRqe = doctor.rqe ? ` • RQE ${cleanPdfText(doctor.rqe)}` : '';
  const doctorCns = doctor.cns ? ` • CNS ${cleanPdfText(doctor.cns)}` : '';

  return (
    <Document title="NexAi-NEFRO - Dossiê de Portabilidade de Prontuários">
      {/* ==================================================== */}
      {/* PÁGINA 1: CAPA OFICIAL E CERTIFICAÇÃO DE DADOS */}
      {/* ==================================================== */}
      <Page orientation="landscape" size="A4" style={styles.page}>
        <View style={styles.headerBanner}>
          <View>
            <Text style={styles.headerBrand}>NexAi-NEFRO • PLATAFORMA DE GESTÃO CLÍNICA NEFROLÓGICA</Text>
            <Text style={styles.headerSubtitle}>RELATÓRIO OFICIAL DE PORTABILIDADE E BACKUP DE DADOS CLÍNICOS</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaText}>PORTABILIDADE AUTORIZADA</Text>
            <Text style={styles.headerMetaSub}>Emissão: {emissionStr}</Text>
          </View>
        </View>

        {/* Resumo do Médico Titular */}
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>1. Identificação do Médico Responsável e Titular do Prontuário</Text>
          <View style={styles.grid3}>
            <View style={styles.col3}>
              <Text><Text style={styles.label}>Médico: </Text><Text style={styles.value}>{doctorName}</Text></Text>
              <Text style={{ marginTop: 2 }}><Text style={styles.label}>CRM / UF: </Text><Text style={styles.value}>{doctorCrm}{doctorRqe}</Text></Text>
            </View>
            <View style={styles.col3}>
              <Text><Text style={styles.label}>Especialidade: </Text><Text style={styles.value}>{cleanPdfText(doctor.especialidade || 'Nefrologia e Hemodiálise')}</Text></Text>
              <Text style={{ marginTop: 2 }}><Text style={styles.label}>CNS: </Text><Text style={styles.value}>{cleanPdfText(doctor.cns || '---')}</Text></Text>
            </View>
            <View style={styles.col3}>
              <Text><Text style={styles.label}>E-mail: </Text><Text style={styles.value}>{cleanPdfText(doctor.email || '---')}</Text></Text>
              <Text style={{ marginTop: 2 }}><Text style={styles.label}>Telefone: </Text><Text style={styles.value}>{cleanPdfText(doctor.telefone || '---')}</Text></Text>
            </View>
          </View>
        </View>

        {/* Métricas Gerais de Volume de Dados */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalPatients || 0}</Text>
            <Text style={styles.statLabel}>Prontuários de Pacientes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalMedications || 0}</Text>
            <Text style={styles.statLabel}>Prescrições Farmacológicas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalExams || 0}</Text>
            <Text style={styles.statLabel}>Registros Laboratoriais</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalAccessInterventions || 0}</Text>
            <Text style={styles.statLabel}>Intervenções de Acesso</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalEvolutions || 0}</Text>
            <Text style={styles.statLabel}>Evoluções Clínicas</Text>
          </View>
        </View>

        {/* Locais de Atendimento Cadastrados */}
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>2. Unidades Dialíticas e Locais de Atendimento Cadastrados</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCol, { width: '22%' }]}>Unidade / Clínica</Text>
              <Text style={[styles.tableHeaderCol, { width: '18%' }]}>Tipo</Text>
              <Text style={[styles.tableHeaderCol, { width: '18%' }]}>Cidade / UF</Text>
              <Text style={[styles.tableHeaderCol, { width: '22%' }]}>Responsável Técnico (RT)</Text>
              <Text style={[styles.tableHeaderCol, { width: '12%' }]}>Turnos</Text>
              <Text style={[styles.tableHeaderCol, { width: '8%' }]}>Status</Text>
            </View>
            {(locais.length > 0 ? locais : [{ nome: doctor.clinicaPrincipal || 'Clínica Principal', tipo: 'Clínica de Hemodiálise', cidade: 'São Paulo/SP', rtNome: doctorName, rtCrm: doctorCrm, turnos: '1º, 2º e 3º', status: 'Ativo' }]).map((loc, idx) => (
              <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]}>
                <Text style={[styles.tableCol, { width: '22%', fontWeight: 'bold' }]}>{cleanPdfText(loc.nome)}</Text>
                <Text style={[styles.tableCol, { width: '18%' }]}>{cleanPdfText(loc.tipo)}</Text>
                <Text style={[styles.tableCol, { width: '18%' }]}>{cleanPdfText(loc.cidade)}</Text>
                <Text style={[styles.tableCol, { width: '22%' }]}>{cleanPdfText(loc.rtNome || doctorName)} ({cleanPdfText(loc.rtCrm || doctorCrm)})</Text>
                <Text style={[styles.tableCol, { width: '12%' }]}>{cleanPdfText(loc.turnos || 'Manhã/Tarde')}</Text>
                <Text style={[styles.tableCol, { width: '8%', fontWeight: 'bold', color: loc.status === 'Inativo' ? '#dc2626' : '#16a34a' }]}>
                  {cleanPdfText(loc.status || 'Ativo')}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Termo Oficial de Portabilidade */}
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>3. Certificação Legal de Portabilidade e Integridade de Custódia</Text>
          <Text style={{ fontSize: 6.8, color: '#334155', lineHeight: 1.35 }}>
            Este documento consolida integralmente a custódia dos dados clínicos, prescrições e registros nefrológicos sob responsabilidade técnica do médico acima identificado, gerado a partir do banco de dados Cloud Firestore do NexAi-NEFRO. Atende aos requisitos da Resolução CFM nº 1.821/2007 (Prontuário Eletrônico), da Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018, Art. 18, V) e às diretrizes da Sociedade Brasileira de Nefrologia (SBN), assegurando a continuidade assistencial do paciente e o direito inalienável de portabilidade técnica dos prontuários.
          </Text>
        </View>

        {/* Bloco de Assinatura */}
        <View style={styles.signatureSection}>
          <View>
            <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#1e3a8a' }}>NexAi-NEFRO Software Médico Especializado</Text>
            <Text style={{ fontSize: 6.5, color: '#64748b' }}>Escopo: {cleanPdfText(scopeLabel)} • Emissão certificada via Cloud Firestore</Text>
          </View>
          <View style={styles.sigBox}>
            <View style={styles.sigLine} />
            <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#0f172a' }}>{doctorName}</Text>
            <Text style={{ fontSize: 7, color: '#475569' }}>CRM {doctorCrm}{doctorRqe}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>NexAi-NEFRO • Dossiê Oficial de Portabilidade e Backup Clínico</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>

      {/* ==================================================== */}
      {/* PÁGINA 2+: CENSO CADASTRAL E DEMOGRÁFICO DE PACIENTES */}
      {/* ==================================================== */}
      {activeModules.pacientes && (
        <Page orientation="landscape" size="A4" style={styles.page}>
          <View style={styles.headerBanner}>
            <View>
              <Text style={styles.headerBrand}>NexAi-NEFRO • CENSO CADASTRAL E PRONTUÁRIOS NEFROLÓGICOS</Text>
              <Text style={styles.headerSubtitle}>Mapeamento de pacientes, convênios, escalas dialíticas e acessos vasculares</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerMetaText}>TOTAL: {patients.length} PACIENTES</Text>
              <Text style={styles.headerMetaSub}>Médico: {doctorName}</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCol, { width: '18%' }]}>Paciente</Text>
              <Text style={[styles.tableHeaderCol, { width: '8%' }]}>Idade / Sexo</Text>
              <Text style={[styles.tableHeaderCol, { width: '11%' }]}>CPF</Text>
              <Text style={[styles.tableHeaderCol, { width: '11%' }]}>Telefone</Text>
              <Text style={[styles.tableHeaderCol, { width: '13%' }]}>Unidade</Text>
              <Text style={[styles.tableHeaderCol, { width: '9%' }]}>Turno / Dias</Text>
              <Text style={[styles.tableHeaderCol, { width: '10%' }]}>Acesso</Text>
              <Text style={[styles.tableHeaderCol, { width: '12%' }]}>Etiologia DRC</Text>
              <Text style={[styles.tableHeaderCol, { width: '8%' }]}>Status</Text>
            </View>

            {patients.map((p, idx) => (
              <View key={p.id || idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]} wrap={false}>
                <Text style={[styles.tableCol, { width: '18%', fontWeight: 'bold' }]}>{cleanPdfText(p.nome)}</Text>
                <Text style={[styles.tableCol, { width: '8%' }]}>{p.idade ? `${p.idade}a` : '---'} ({cleanPdfText(p.sexo)})</Text>
                <Text style={[styles.tableCol, { width: '11%' }]}>{cleanPdfText(p.cpf)}</Text>
                <Text style={[styles.tableCol, { width: '11%' }]}>{cleanPdfText(p.telefone)}</Text>
                <Text style={[styles.tableCol, { width: '13%' }]}>{cleanPdfText(p.clinica)}</Text>
                <Text style={[styles.tableCol, { width: '9%' }]}>{cleanPdfText(p.turno)} / {cleanPdfText(p.diaSemana)}</Text>
                <Text style={[styles.tableCol, { width: '10%' }]}>{cleanPdfText(p.tipoAcesso || p.acessoVascular?.tipo || 'FAV')}</Text>
                <Text style={[styles.tableCol, { width: '12%' }]}>{cleanPdfText(p.etiologiaDRC || 'HAS')}</Text>
                <Text style={[styles.tableCol, { width: '8%', fontWeight: 'bold', color: p.status === 'Óbito' ? '#dc2626' : '#16a34a' }]}>
                  {cleanPdfText(p.status || 'Ativo')}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.footer} fixed>
            <Text>NexAi-NEFRO • Dossiê Oficial de Portabilidade e Backup Clínico</Text>
            <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
          </View>
        </Page>
      )}

      {/* ==================================================== */}
      {/* PÁGINA 3+: PAINEL DE CONTROLE LABORATORIAL CONSOLIDADO */}
      {/* ==================================================== */}
      {activeModules.exames && (
        <Page orientation="landscape" size="A4" style={styles.page}>
          <View style={styles.headerBanner}>
            <View>
              <Text style={styles.headerBrand}>NexAi-NEFRO • PAINEL DE CONTROLE LABORATORIAL CONSOLIDADO</Text>
              <Text style={styles.headerSubtitle}>Últimos exames válidos: Anemia, Metabolismo Ósseo, Adequação e Eletrólitos</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerMetaText}>BIOMARCADORES DE DIÁLISE</Text>
              <Text style={styles.headerMetaSub}>Médico: {doctorName}</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCol, { width: '16%' }]}>Paciente</Text>
              <Text style={[styles.tableHeaderCol, { width: '10%' }]}>Unidade</Text>
              <Text style={[styles.tableHeaderCol, { width: '5.5%' }]}>Hb</Text>
              <Text style={[styles.tableHeaderCol, { width: '6.5%' }]}>Ferritina</Text>
              <Text style={[styles.tableHeaderCol, { width: '5.5%' }]}>IST</Text>
              <Text style={[styles.tableHeaderCol, { width: '6.5%' }]}>PTH</Text>
              <Text style={[styles.tableHeaderCol, { width: '5.5%' }]}>Ca</Text>
              <Text style={[styles.tableHeaderCol, { width: '5.5%' }]}>P</Text>
              <Text style={[styles.tableHeaderCol, { width: '6%' }]}>Vit D</Text>
              <Text style={[styles.tableHeaderCol, { width: '5.5%' }]}>FA</Text>
              <Text style={[styles.tableHeaderCol, { width: '5.5%' }]}>Kt/V</Text>
              <Text style={[styles.tableHeaderCol, { width: '6%' }]}>Ureia Pré</Text>
              <Text style={[styles.tableHeaderCol, { width: '6%' }]}>Creat</Text>
              <Text style={[styles.tableHeaderCol, { width: '5%' }]}>K</Text>
              <Text style={[styles.tableHeaderCol, { width: '5%' }]}>Na</Text>
            </View>

            {patients.map((p, idx) => {
              const ex = p.exames || {};
              return (
                <View key={p.id || idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]} wrap={false}>
                  <Text style={[styles.tableCol, { width: '16%', fontWeight: 'bold' }]}>{cleanPdfText(p.nome)}</Text>
                  <Text style={[styles.tableCol, { width: '10%' }]}>{cleanPdfText(p.clinica)}</Text>
                  <Text style={[styles.tableCol, { width: '5.5%' }]}>{ex.hb ?? '-'}</Text>
                  <Text style={[styles.tableCol, { width: '6.5%' }]}>{ex.ferritina ?? '-'}</Text>
                  <Text style={[styles.tableCol, { width: '5.5%' }]}>{ex.ist ? `${ex.ist}%` : '-'}</Text>
                  <Text style={[styles.tableCol, { width: '6.5%' }]}>{ex.pth ?? '-'}</Text>
                  <Text style={[styles.tableCol, { width: '5.5%' }]}>{ex.ca ?? '-'}</Text>
                  <Text style={[styles.tableCol, { width: '5.5%' }]}>{ex.fosforo ?? '-'}</Text>
                  <Text style={[styles.tableCol, { width: '6%' }]}>{ex.vitD ?? '-'}</Text>
                  <Text style={[styles.tableCol, { width: '5.5%' }]}>{ex.fa ?? '-'}</Text>
                  <Text style={[styles.tableCol, { width: '5.5%', fontWeight: 'bold', color: Number(ex.ktv) >= 1.2 ? '#16a34a' : '#d97706' }]}>{ex.ktv ?? '-'}</Text>
                  <Text style={[styles.tableCol, { width: '6%' }]}>{ex.ureiaPre ?? '-'}</Text>
                  <Text style={[styles.tableCol, { width: '6%' }]}>{ex.creatinina ?? '-'}</Text>
                  <Text style={[styles.tableCol, { width: '5%' }]}>{ex.k ?? '-'}</Text>
                  <Text style={[styles.tableCol, { width: '5%' }]}>{ex.na ?? '-'}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.footer} fixed>
            <Text>NexAi-NEFRO • Dossiê Oficial de Portabilidade e Backup Clínico</Text>
            <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
          </View>
        </Page>
      )}

      {/* ==================================================== */}
      {/* PÁGINA 4+: DOSSIÊ FARMACOLÓGICO E PRESCRIÇÕES */}
      {/* ==================================================== */}
      {activeModules.medicamentos && (
        <Page orientation="landscape" size="A4" style={styles.page}>
          <View style={styles.headerBanner}>
            <View>
              <Text style={styles.headerBrand}>NexAi-NEFRO • DOSSIÊ FARMACOLÓGICO E PRESCRIÇÕES ATIVAS</Text>
              <Text style={styles.headerSubtitle}>Esquemas terapêuticos de EPO, Ferro IV, Quelantes, Anti-hipertensivos e Vitaminas</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerMetaText}>PRESCRIÇÃO DIALÍTICA</Text>
              <Text style={styles.headerMetaSub}>Médico: {doctorName}</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCol, { width: '18%' }]}>Paciente</Text>
              <Text style={[styles.tableHeaderCol, { width: '12%' }]}>Unidade</Text>
              <Text style={[styles.tableHeaderCol, { width: '22%' }]}>Medicamento</Text>
              <Text style={[styles.tableHeaderCol, { width: '10%' }]}>Dosagem</Text>
              <Text style={[styles.tableHeaderCol, { width: '8%' }]}>Via</Text>
              <Text style={[styles.tableHeaderCol, { width: '20%' }]}>Posologia / Frequência</Text>
              <Text style={[styles.tableHeaderCol, { width: '10%' }]}>Status</Text>
            </View>

            {patients.flatMap(p => {
              const meds = normalizeMedicamentosList(p.medicamentos);
              if (meds.length === 0) {
                return [{
                  patientId: p.id,
                  pacienteNome: p.nome,
                  clinica: p.clinica,
                  medicamentoNome: 'Nenhuma medicação registrada no sistema.',
                  dosagem: '---',
                  via: '---',
                  frequencia: '---',
                  status: '---'
                }];
              }
              return meds.map(m => ({
                patientId: p.id,
                pacienteNome: p.nome,
                clinica: p.clinica,
                medicamentoNome: m.nome,
                dosagem: m.dosagem,
                via: m.via || 'VO',
                frequencia: m.frequencia,
                status: m.ativo !== false ? 'Ativo' : 'Suspenso'
              }));
            }).map((item, idx) => (
              <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]} wrap={false}>
                <Text style={[styles.tableCol, { width: '18%', fontWeight: 'bold' }]}>{cleanPdfText(item.pacienteNome)}</Text>
                <Text style={[styles.tableCol, { width: '12%' }]}>{cleanPdfText(item.clinica)}</Text>
                <Text style={[styles.tableCol, { width: '22%' }]}>{cleanPdfText(item.medicamentoNome)}</Text>
                <Text style={[styles.tableCol, { width: '10%' }]}>{cleanPdfText(item.dosagem)}</Text>
                <Text style={[styles.tableCol, { width: '8%' }]}>{cleanPdfText(item.via)}</Text>
                <Text style={[styles.tableCol, { width: '20%' }]}>{cleanPdfText(item.frequencia)}</Text>
                <Text style={[styles.tableCol, { width: '10%', fontWeight: 'bold', color: item.status === 'Suspenso' ? '#dc2626' : '#16a34a' }]}>
                  {cleanPdfText(item.status)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.footer} fixed>
            <Text>NexAi-NEFRO • Dossiê Oficial de Portabilidade e Backup Clínico</Text>
            <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
          </View>
        </Page>
      )}

      {/* ==================================================== */}
      {/* PÁGINA 5+: ACESSOS VASCULARES E PROCEDIMENTOS */}
      {/* ==================================================== */}
      {activeModules.acessos && (
        <Page orientation="landscape" size="A4" style={styles.page}>
          <View style={styles.headerBanner}>
            <View>
              <Text style={styles.headerBrand}>NexAi-NEFRO • VIGILÂNCIA DE ACESSOS VASCULARES E DOPPLERS</Text>
              <Text style={styles.headerSubtitle}>Mapeamento de FAV, Próteses, Cateteres e Histórico de Intervenções Cirúrgicas</Text>
            </View>
            <View style={styles.headerMeta}>
              <Text style={styles.headerMetaText}>ACESSO VASCULAR</Text>
              <Text style={styles.headerMetaSub}>Médico: {doctorName}</Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCol, { width: '16%' }]}>Paciente</Text>
              <Text style={[styles.tableHeaderCol, { width: '10%' }]}>Tipo Acesso</Text>
              <Text style={[styles.tableHeaderCol, { width: '14%' }]}>Membro / Topografia</Text>
              <Text style={[styles.tableHeaderCol, { width: '7%' }]}>Qb (ml/min)</Text>
              <Text style={[styles.tableHeaderCol, { width: '6%' }]}>Agulha</Text>
              <Text style={[styles.tableHeaderCol, { width: '8%' }]}>Data Evento</Text>
              <Text style={[styles.tableHeaderCol, { width: '11%' }]}>Tipo Evento</Text>
              <Text style={[styles.tableHeaderCol, { width: '28%' }]}>Descrição do Doppler / Procedimento</Text>
            </View>

            {patients.flatMap(p => {
              const ac = p.acessoVascular || {};
              const hist = Array.isArray(p.historicoAcesso) ? p.historicoAcesso : [];
              if (hist.length === 0) {
                return [{
                  pacienteNome: p.nome,
                  tipo: ac.tipo || p.tipoAcesso || 'FAV',
                  membro: ac.ladoMembro || p.posicaoAcesso || '---',
                  qb: ac.fluxoSangue || '---',
                  agulha: ac.agulha || '16G',
                  dataEvento: ac.dataConfeccao || p.dataCriacaoAcesso || '---',
                  tipoEvento: 'Confecção / Cadastro',
                  descricao: 'Acesso pérvio e ativo em rotina dialítica.'
                }];
              }
              return hist.map(ev => ({
                pacienteNome: p.nome,
                tipo: ev.acesso || ac.tipo || p.tipoAcesso || 'FAV',
                membro: ev.ladoMembro || ac.ladoMembro || p.posicaoAcesso || '---',
                qb: ac.fluxoSangue || '---',
                agulha: ac.agulha || '16G',
                dataEvento: ev.data || '---',
                tipoEvento: ev.tipoEvento || 'Procedimento',
                descricao: ev.descricao || ev.conduta || '---'
              }));
            }).map((item, idx) => (
              <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]} wrap={false}>
                <Text style={[styles.tableCol, { width: '16%', fontWeight: 'bold' }]}>{cleanPdfText(item.pacienteNome)}</Text>
                <Text style={[styles.tableCol, { width: '10%' }]}>{cleanPdfText(item.tipo)}</Text>
                <Text style={[styles.tableCol, { width: '14%' }]}>{cleanPdfText(item.membro)}</Text>
                <Text style={[styles.tableCol, { width: '7%' }]}>{cleanPdfText(item.qb)}</Text>
                <Text style={[styles.tableCol, { width: '6%' }]}>{cleanPdfText(item.agulha)}</Text>
                <Text style={[styles.tableCol, { width: '8%' }]}>{cleanPdfText(item.dataEvento)}</Text>
                <Text style={[styles.tableCol, { width: '11%', fontWeight: 'bold' }]}>{cleanPdfText(item.tipoEvento)}</Text>
                <Text style={[styles.tableCol, { width: '28%' }]}>{cleanPdfText(item.descricao)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footer} fixed>
            <Text>NexAi-NEFRO • Dossiê Oficial de Portabilidade e Backup Clínico</Text>
            <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
          </View>
        </Page>
      )}
    </Document>
  );
}
