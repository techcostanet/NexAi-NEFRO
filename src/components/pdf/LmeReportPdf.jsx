import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Circle, Rect, Polygon, Line } from '@react-pdf/renderer';
import { safeFormatDate } from '../../utils/dateUtils';
import { 
  isAnemiaAgravo, 
  isDmoAgravo, 
  getMedicamentoOfficialLabel 
} from '../../data/lmeProtocols';

/**
 * Utilitários de higienização de strings para o motor de PDF (Helvetica)
 */
function cleanPdfText(text) {
  if (!text) return '';
  return String(text)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}]/gu, '')
    .trim();
}

function formatCpf(cpf) {
  if (!cpf) return '';
  const digits = String(cpf).replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf;
}

function formatPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
}

// =========================================================================
// ÍCONES VETORIAIS NATIVOS SVG PARA REACT-PDF (100% OFFLINE E VETORIAL)
// =========================================================================

const BrasaoMinasGerais = ({ size = 36 }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    {/* Ramo esquerdo verde */}
    <Path d="M 50,85 C 30,85 15,65 15,45 C 15,30 25,18 35,15 C 32,22 34,30 38,36 C 30,42 25,52 28,62 C 32,72 40,80 50,85 Z" fill="#15803d" />
    {/* Ramo direito verde */}
    <Path d="M 50,85 C 70,85 85,65 85,45 C 85,30 75,18 65,15 C 68,22 66,30 62,36 C 70,42 75,52 72,62 C 68,72 60,80 50,85 Z" fill="#15803d" />
    {/* Frutos de café vermelhos nos ramos */}
    <Circle cx="22" cy="40" r="3" fill="#dc2626" />
    <Circle cx="20" cy="50" r="3" fill="#dc2626" />
    <Circle cx="26" cy="62" r="3" fill="#dc2626" />
    <Circle cx="78" cy="40" r="3" fill="#dc2626" />
    <Circle cx="80" cy="50" r="3" fill="#dc2626" />
    <Circle cx="74" cy="62" r="3" fill="#dc2626" />
    {/* Círculo central com raios dourados */}
    <Circle cx="50" cy="45" r="22" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
    {/* Estrela vermelha de 5 pontas */}
    <Polygon points="50,25 56,38 70,39 59,49 63,63 50,54 37,63 41,49 30,39 44,38" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
    {/* Fita inferior vermelha */}
    <Path d="M 20,82 C 35,78 65,78 80,82 L 85,92 C 70,88 30,88 15,92 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
    {/* Laço central da fita */}
    <Rect x="44" y="80" width="12" height="10" rx="2" fill="#b91c1c" />
  </Svg>
);

const LogoSus = ({ width = 46, height = 22 }) => (
  <Svg width={width} height={height} viewBox="0 0 90 44">
    {/* Cruz do SUS */}
    <Rect x="4" y="16" width="36" height="12" fill="#0284c7" />
    <Rect x="16" y="4" width="12" height="36" fill="#0284c7" />
    <Rect x="12" y="12" width="20" height="20" fill="#0284c7" />
    {/* Letras SUS */}
    <Path d="M 48,10 C 44,10 42,12 42,15 C 42,22 52,19 52,26 C 52,30 48,32 44,32 C 40,32 38,30 38,27" fill="none" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
    <Path d="M 58,10 L 58,26 C 58,30 60,32 64,32 C 68,32 70,30 70,26 L 70,10" fill="none" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
    <Path d="M 86,10 C 82,10 80,12 80,15 C 80,22 90,19 90,26 C 90,30 86,32 82,32 C 78,32 76,30 76,27" fill="none" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
  </Svg>
);

const WarningTriangle = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Polygon points="12,2 23,21 1,21" fill="#dc2626" />
    <Line x1="12" y1="8" x2="12" y2="14" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
    <Circle cx="12" cy="18" r="1.2" fill="#ffffff" />
  </Svg>
);

const Checkbox = ({ checked = false, label = '', style = {}, textStyle = {} }) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
    <View style={{
      width: 9,
      height: 9,
      borderWidth: 0.8,
      borderColor: '#000000',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 4,
      backgroundColor: '#ffffff'
    }}>
      {checked ? <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#000000', marginTop: -1 }}>X</Text> : null}
    </View>
    {label ? <Text style={[{ fontSize: 7.5, color: '#000000' }, textStyle]}>{label}</Text> : null}
  </View>
);

// Cabeçalho Oficial do Governo do Estado de Minas Gerais
const HeaderGovernoMG = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
    <BrasaoMinasGerais size={36} />
    <View style={{ marginLeft: 8, alignItems: 'flex-start' }}>
      <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: '#000000', letterSpacing: 0.2 }}>
        GOVERNO DO ESTADO DE MINAS GERAIS
      </Text>
      <Text style={{ fontSize: 7.5, color: '#1e293b' }}>
        SECRETARIA DE ESTADO DE SAÚDE
      </Text>
      <Text style={{ fontSize: 7.5, color: '#1e293b' }}>
        SUPERINTENDÊNCIA DE ASSISTÊNCIA FARMACÊUTICA
      </Text>
    </View>
  </View>
);

// =========================================================================
// ESTILOS GERAIS COMPARTILHADOS (PADRÃO OFICIAL GOV / SUS)
// =========================================================================

const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 26,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#000000',
    backgroundColor: '#ffffff'
  },
  pageBorderBox: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 12,
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  titleH1: {
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
    marginBottom: 4
  },
  titleH2: {
    fontSize: 10,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#000000',
    marginBottom: 16
  },
  sectionTitleBox: {
    backgroundColor: '#d1d5db',
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 3,
    paddingHorizontal: 6,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 8.5,
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  sectionHeaderBar: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    fontWeight: 'bold',
    fontSize: 7.5,
    textTransform: 'uppercase'
  },
  borderedBox: {
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 4
  },
  gridCell: {
    borderWidth: 0.8,
    borderColor: '#000000',
    padding: 2.5
  },
  labelMini: {
    fontSize: 6.5,
    color: '#334155',
    textTransform: 'uppercase',
    marginBottom: 1
  },
  labelStrong: {
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#000000'
  },
  valueStrong: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#000000'
  }
});

// =========================================================================
// PÁGINA 1: ORIENTAÇÕES BÁSICAS PARA SOLICITAÇÃO DE MEDICAMENTOS (FARMÁCIA DE MINAS)
// =========================================================================
function PageOrientacoesBasicas({ isDmo = false }) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.pageBorderBox}>
        <HeaderGovernoMG />

        <Text style={styles.titleH1}>FARMÁCIA DE MINAS</Text>
        <Text style={styles.titleH2}>
          ORIENTAÇÕES BÁSICAS PARA SOLICITAÇÃO DE{'\n'}
          MEDICAMENTOS DO COMPONENTE ESPECIALIZADO
        </Text>

        <View style={{ marginTop: 8, gap: 12, fontSize: 8.5, lineHeight: 1.45 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ fontWeight: 'bold', marginRight: 6 }}>✓</Text>
            <Text style={{ flex: 1 }}>
              O Sr(a). deverá providenciar todos os itens indicados na “Relação de documentos e exames para solicitação de medicamentos”.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ fontWeight: 'bold', marginRight: 6 }}>✓</Text>
            <View style={{ flex: 1 }}>
              <Text>Observe que alguns deles devem ser preenchidos e assinados pelo seu médico:</Text>
              <View style={{ marginLeft: 16, marginTop: 4, gap: 2 }}>
                <Text>o Laudo de solicitação, avaliação e autorização de medicamentos (LME);</Text>
                <Text>o Prescrição médica;</Text>
                <Text>o Relatório médico e/ou Formulário Específico; e</Text>
                <Text>o Termo de Conhecimento de Risco (se houver) e/ou Termo de Esclarecimento e Responsabilidade (se houver).</Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ fontWeight: 'bold', marginRight: 6 }}>✓</Text>
            <Text style={{ flex: 1 }}>
              De posse de todos os documentos necessários, o Sr(a). ou seu representante deve dirigir-se à Coordenação de Assistência Farmacêutica (CAF) de sua regional de saúde, ou à farmácia de seu município.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ fontWeight: 'bold', marginRight: 6 }}>✓</Text>
            <Text style={{ flex: 1 }}>
              A SES-MG estima um prazo médio de 30 dias para avaliação de sua solicitação.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ fontWeight: 'bold', marginRight: 6 }}>✓</Text>
            <Text style={{ flex: 1 }}>
              Baixe o Aplicativo MG-App em seu celular e acompanhe a situação da análise de sua solicitação. Você também poderá acessar o Portal MG (https://cidadao.mg.gov.br).
            </Text>
          </View>

          {/* Bloco de Agendamento da Regional de Belo Horizonte */}
          <View style={{
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: '#000000',
            padding: 8,
            marginVertical: 4,
            alignItems: 'center',
            backgroundColor: '#ffffff'
          }}>
            <Text style={{ fontSize: 8, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
              ATENÇÃO: Se o Sr(a). reside em um dos municípios pertencentes à Regional de Saúde de Belo Horizonte, deverá agendar o atendimento via internet para protocolar sua solicitação de medicamentos.
            </Text>
            <Text style={{ fontSize: 8, textAlign: 'center', marginBottom: 4 }}>
              Acesse o Aplicativo MG App → Saúde → Solicitar Medicamentos → Agendar abertura de solicitação de medicamento especializado (Regional de BH)
            </Text>
            {isDmo && (
              <Text style={{ fontSize: 7.5, fontStyle: 'italic', textAlign: 'center', color: '#334155' }}>
                Observação: Para solicitações de Calcitriol pós-procedimento de paratireoidectomia não é necessário realizar o agendamento para o atendimento.
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Text style={{ fontWeight: 'bold', marginRight: 6 }}>✓</Text>
            <Text style={{ flex: 1 }}>
              Em caso de dúvidas, procure o farmacêutico de sua regional ou de seu município.
            </Text>
          </View>
        </View>
      </View>
    </Page>
  );
}

// =========================================================================
// PÁGINA 2: RELAÇÃO DE DOCUMENTOS E EXAMES PARA SOLICITAÇÃO DE MEDICAMENTO(S)
// =========================================================================
function PageRelacaoDocumentosExames({ isAnemia, isDmo, dataEmissao }) {
  const agravoTitle = isAnemia 
    ? 'ANEMIA NA DOENÇA RENAL CRÔNICA' 
    : 'DISTÚRBIO MINERAL E ÓSSEO NA DOENÇA RENAL CRÔNICA';

  return (
    <Page size="A4" style={styles.page}>
      <HeaderGovernoMG />

      <Text style={{ fontSize: 9.5, fontWeight: 'bold', textAlign: 'center', marginBottom: 6, textTransform: 'uppercase' }}>
        RELAÇÃO DE DOCUMENTOS E EXAMES PARA SOLICITAÇÃO DE MEDICAMENTO(S)
      </Text>

      {/* Agravo */}
      <View style={{ backgroundColor: '#d1d5db', borderWidth: 1, borderColor: '#000000', paddingVertical: 3, paddingHorizontal: 6, marginBottom: 4 }}>
        <Text style={{ fontSize: 9, fontWeight: 'bold', textAlign: 'center' }}>{agravoTitle}</Text>
      </View>

      {isDmo && (
        <View style={{ borderWidth: 1, borderColor: '#000000', padding: 3, marginBottom: 4, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7 }}>
          <Text style={{ fontWeight: 'bold' }}>Medicamentos com restrição de idade:</Text>
          <Text>Cinacalcete e Paricalcitol - Idade mínima: 18 anos</Text>
          <Text>Sevelâmer - Idade mínima: 1 ano</Text>
        </View>
      )}

      {/* 1. DOCUMENTOS PESSOAIS */}
      <View style={styles.borderedBox}>
        <View style={styles.sectionHeaderBar}>
          <Text style={{ fontWeight: 'bold', fontSize: 7.5 }}>DOCUMENTOS PESSOAIS A SEREM APRESENTADOS</Text>
        </View>
        <View style={{ padding: 4, gap: 2 }}>
          <Checkbox checked={true} label="Cópia da Carteira de Identidade (ou Documento de Identificação com foto)" />
          <Checkbox checked={true} label="Cópia do Cadastro de Pessoa Física (CPF)" />
          <Checkbox checked={true} label="Cópia do Cartão Nacional de Saúde (CNS)" />
          <Checkbox checked={true} label="Cópia do Comprovante de Residência" />
        </View>
      </View>

      {/* 2. DOCUMENTOS A SEREM EMITIDOS PELO MÉDICO */}
      <View style={styles.borderedBox}>
        <View style={styles.sectionHeaderBar}>
          <Text style={{ fontWeight: 'bold', fontSize: 7.5 }}>DOCUMENTOS A SEREM EMITIDOS PELO MÉDICO</Text>
        </View>
        <View style={{ flexDirection: 'row', borderTopWidth: 0.5, borderColor: '#000000' }}>
          {/* Coluna 1: Solicitação Inicial */}
          <View style={{ width: '34%', borderRightWidth: 0.8, borderColor: '#000000', padding: 4 }}>
            <Text style={{ fontSize: 7.5, fontWeight: 'bold', marginBottom: 3 }}>→ SOLICITAÇÃO INICIAL</Text>
            <Checkbox checked={true} label="LME - Laudo para Solicitação de Medicamentos do CEAF" style={{ marginBottom: 2 }} />
            <Checkbox checked={true} label="Prescrição Médica" style={{ marginBottom: 2 }} />
            <Checkbox 
              checked={true} 
              label={isAnemia ? "Formulário Específico: Alfaepoetina e/ou Sacarato de Hidróxido Férrico" : "Formulário Específico: Distúrbio Mineral e Ósseo na DRC"} 
            />
          </View>
          {/* Coluna 2: Renovação */}
          <View style={{ width: '33%', borderRightWidth: 0.8, borderColor: '#000000', padding: 4 }}>
            <Text style={{ fontSize: 7.5, fontWeight: 'bold', marginBottom: 3 }}>→ RENOVAÇÃO E MONITORIZAÇÃO DO TRATAMENTO (A CADA 6 MESES)</Text>
            <Checkbox checked={false} label="LME - Laudo para Solicitação de Medicamentos do CEAF" style={{ marginBottom: 2 }} />
            <Checkbox checked={false} label="Prescrição Médica" />
          </View>
          {/* Coluna 3: Reavaliação */}
          <View style={{ width: '33%', padding: 4 }}>
            <Text style={{ fontSize: 7.5, fontWeight: 'bold', marginBottom: 3 }}>→ REAVALIAÇÃO (TROCA OU INCLUSÃO DE NOVO MEDICAMENTO)</Text>
            <Checkbox checked={false} label="LME - Laudo para Solicitação de Medicamentos do CEAF" style={{ marginBottom: 2 }} />
            <Checkbox checked={false} label="Prescrição Médica" style={{ marginBottom: 2 }} />
            <Checkbox 
              checked={false} 
              label={isAnemia ? "Formulário Específico: Alfaepoetina e/ou Sacarato de Hidróxido Férrico" : "Formulário Específico: Distúrbio Mineral e Ósseo na DRC"} 
            />
          </View>
        </View>
      </View>

      {/* 2.1 NUTRICIONISTA (SE DMO) */}
      {isDmo && (
        <View style={styles.borderedBox}>
          <View style={styles.sectionHeaderBar}>
            <Text style={{ fontWeight: 'bold', fontSize: 7.5 }}>DOCUMENTO EMITIDO PELO NUTRICIONISTA RESPONSÁVEL PELO PACIENTE</Text>
          </View>
          <View style={{ flexDirection: 'row', padding: 4 }}>
            <View style={{ width: '50%', borderRightWidth: 0.8, borderColor: '#000000', paddingRight: 4 }}>
              <Text style={{ fontSize: 7, fontWeight: 'bold' }}>→ SOLICITAÇÃO INICIAL</Text>
              <Text style={{ fontSize: 7, fontStyle: 'italic', marginTop: 1 }}>Para Sevelâmer</Text>
              <Checkbox checked={false} label="Relatório de Acompanhamento" />
            </View>
            <View style={{ width: '50%', paddingLeft: 4 }}>
              <Text style={{ fontSize: 7, fontWeight: 'bold' }}>→ REAVALIAÇÃO (TROCA OU INCLUSÃO DE NOVO MEDICAMENTO)</Text>
              <Text style={{ fontSize: 7, fontStyle: 'italic', marginTop: 1 }}>Para Sevelâmer</Text>
              <Checkbox checked={false} label="Relatório de Acompanhamento" />
            </View>
          </View>
        </View>
      )}

      {/* 3. EXAMES */}
      <View style={styles.borderedBox}>
        <View style={styles.sectionHeaderBar}>
          <Text style={{ fontWeight: 'bold', fontSize: 7.5 }}>EXAMES</Text>
        </View>

        {isAnemia ? (
          <View style={{ padding: 4, gap: 4 }}>
            <View>
              <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>→ SOLICITAÇÃO INICIAL: EXAMES GERAIS</Text>
              <Checkbox checked={true} label="Hemograma ou Hemoglobina (Validade 1 mês)" style={{ marginTop: 1 }} />
              <Checkbox checked={true} label="Ferritina Sérica (Validade 3 meses)" style={{ marginTop: 1 }} />
              <Checkbox checked={true} label="Índice de Saturação de Transferrina - IST (Validade 3 meses)" style={{ marginTop: 1 }} />
            </View>

            <View style={{ borderTopWidth: 0.5, borderColor: '#000000', paddingTop: 2 }}>
              <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>→ SOLICITAÇÃO INICIAL: EXAMES ESPECÍFICOS CONFORME MEDICAMENTO REQUERIDO</Text>
              <Text style={{ fontSize: 7, fontStyle: 'italic', marginTop: 1 }}>Não se aplica</Text>
            </View>

            <View style={{ borderTopWidth: 0.5, borderColor: '#000000', paddingTop: 2 }}>
              <Text style={{ fontSize: 7.5, fontWeight: 'bold', marginBottom: 2 }}>→ MONITORIZAÇÃO DO TRATAMENTO (A CADA 6 MESES)</Text>
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: '50%' }}>
                  <Text style={{ fontSize: 7, fontWeight: 'bold' }}>Para Alfaepoetina</Text>
                  <Checkbox checked={false} label="Hemograma ou Hemoglobina (Validade 1 mês)" style={{ marginTop: 1 }} />
                </View>
                <View style={{ width: '50%' }}>
                  <Text style={{ fontSize: 7, fontWeight: 'bold' }}>Para Sacarato de Hidróxido Férrico</Text>
                  <Checkbox checked={false} label="Ferritina Sérica (Validade 3 meses)" style={{ marginTop: 1 }} />
                  <Checkbox checked={false} label="Índice de Saturação de Transferrina - IST (Validade 3 meses)" style={{ marginTop: 1 }} />
                </View>
              </View>
            </View>

            <View style={{ borderTopWidth: 0.5, borderColor: '#000000', paddingTop: 2 }}>
              <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>→ REAVALIAÇÃO (TROCA OU INCLUSÃO DE NOVO MEDICAMENTO): EXAMES ESPECÍFICOS</Text>
              <Text style={{ fontSize: 7, fontStyle: 'italic' }}>Para Alfaepoetina ou Sacarato de Hidróxido Férrico</Text>
              <Checkbox checked={false} label="Hemograma ou Hemoglobina (Validade 1 mês)" style={{ marginTop: 1 }} />
              <Checkbox checked={false} label="Ferritina Sérica (Validade 3 meses)" style={{ marginTop: 1 }} />
              <Checkbox checked={false} label="Índice de Saturação de Transferrina - IST (Validade 3 meses)" style={{ marginTop: 1 }} />
            </View>
          </View>
        ) : (
          <View style={{ padding: 4, gap: 4 }}>
            <View>
              <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>→ SOLICITAÇÃO INICIAL: EXAMES GERAIS</Text>
              <Text style={{ fontSize: 7, fontStyle: 'italic', marginTop: 1 }}>Não se aplica</Text>
            </View>

            <View style={{ borderTopWidth: 0.5, borderColor: '#000000', paddingTop: 2 }}>
              <Text style={{ fontSize: 7.5, fontWeight: 'bold', marginBottom: 2 }}>
                → SOLICITAÇÃO INICIAL / REAVALIAÇÃO: EXAMES ESPECÍFICOS CONFORME MEDICAMENTO
              </Text>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                <View style={{ width: '48%', borderWidth: 0.5, borderColor: '#cbd5e1', padding: 3 }}>
                  <Text style={{ fontSize: 7, fontWeight: 'bold' }}>Para Calcitriol e Paricalcitol</Text>
                  <Checkbox checked={true} label="Fósforo (Validade 3 meses)" style={{ marginTop: 1 }} />
                  <Checkbox checked={true} label="Cálcio (Validade 3 meses)" style={{ marginTop: 1 }} />
                  <Checkbox checked={true} label="Albumina (Validade 3 meses)" style={{ marginTop: 1 }} />
                  <Checkbox checked={true} label="PTH (Validade 6 meses)" style={{ marginTop: 1 }} />
                </View>

                <View style={{ width: '48%', borderWidth: 0.5, borderColor: '#cbd5e1', padding: 3 }}>
                  <Text style={{ fontSize: 7, fontWeight: 'bold' }}>Para Cinacalcete</Text>
                  <Checkbox checked={false} label="Cálcio (Validade 3 meses)" style={{ marginTop: 1 }} />
                  <Checkbox checked={false} label="Albumina (Validade 3 meses)" style={{ marginTop: 1 }} />
                  <Checkbox checked={false} label="PTH (Validade 6 meses)" style={{ marginTop: 1 }} />
                </View>

                <View style={{ width: '48%', borderWidth: 0.5, borderColor: '#cbd5e1', padding: 3 }}>
                  <Text style={{ fontSize: 7, fontWeight: 'bold' }}>Para Sevelâmer (Adultos / Crianças)</Text>
                  <Checkbox checked={false} label="Fósforo (Validade 3 meses)" style={{ marginTop: 1 }} />
                  <Checkbox checked={false} label="Cálcio (Validade 3 meses)" style={{ marginTop: 1 }} />
                  <Checkbox checked={false} label="Albumina (Validade 3 meses)" style={{ marginTop: 1 }} />
                  <Checkbox checked={false} label="PTH (Validade 6 meses)" style={{ marginTop: 1 }} />
                </View>

                <View style={{ width: '48%', borderWidth: 0.5, borderColor: '#cbd5e1', padding: 3 }}>
                  <Text style={{ fontSize: 7, fontWeight: 'bold' }}>Para Desferroxamina</Text>
                  <Checkbox checked={false} label="Alumínio sérico (Validade 3 meses)" style={{ marginTop: 1 }} />
                  <Checkbox checked={false} label="Teste excesso alumínio (Validade 3 meses)" style={{ marginTop: 1 }} />
                  <Checkbox checked={false} label="Laudo Biópsia Óssea (Se tiver)" style={{ marginTop: 1 }} />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* 4. OBSERVAÇÕES PARA DISPENSAÇÃO */}
      <View style={styles.borderedBox}>
        <View style={styles.sectionHeaderBar}>
          <Text style={{ fontWeight: 'bold', fontSize: 7.5 }}>OBSERVAÇÕES PARA DISPENSAÇÃO</Text>
        </View>
        <View style={{ padding: 3 }}>
          <Text style={{ fontSize: 7, fontStyle: 'italic' }}>Não se aplica</Text>
        </View>
      </View>

      {/* Rodapé de Conferência */}
      <View style={{ borderWidth: 1, borderColor: '#000000', padding: 4, marginTop: 4 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>DATA: {dataEmissao || '____/____/________'}</Text>
          <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>LOCAL: BETIM - MG</Text>
          <LogoSus width={40} height={18} />
        </View>
        <View style={{ borderTopWidth: 0.8, borderColor: '#000000', paddingTop: 2, alignItems: 'center' }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase' }}>
            NOME LEGÍVEL DO RESPONSÁVEL PELA CONFERÊNCIA
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 6.5, color: '#475569', marginTop: 4 }}>
        Atualizado em 21/05/2025
      </Text>
    </Page>
  );
}

// =========================================================================
// PÁGINA 3: LAUDO DE SOLICITAÇÃO, AVALIAÇÃO E AUTORIZAÇÃO DE MEDICAMENTOS (LME OFICIAL 23 CAMPOS)
// =========================================================================
function PageLmeNacional23Campos({
  patient,
  doctorInfo,
  lmeData,
  estabelecimento,
  dataSolicitacao
}) {
  const cnes = estabelecimento?.cnes || '5920574';
  const clinica = estabelecimento?.nome || patient?.clinica || 'DIALIZE SAUDE';
  const peso = patient?.pesoSeco || patient?.peso || '';
  const altura = patient?.altura || '';
  const qtdMensal = lmeData?.quantidadeMensal || 12;

  const isPreta = (patient?.racaCor || '').toLowerCase().includes('pret');
  const isParda = (patient?.racaCor || '').toLowerCase().includes('pard') || (!isPreta && true);

  const docNumero = patient?.cpf || patient?.cns || '';

  return (
    <Page size="A4" style={styles.page}>
      {/* Cabeçalho SUS */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <LogoSus width={42} height={20} />
          <View style={{ marginLeft: 6 }}>
            <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>Sistema Único de Saúde</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>Sistema Único de Saúde</Text>
          <Text style={{ fontSize: 7 }}>Ministério da Saúde</Text>
          <Text style={{ fontSize: 7 }}>Secretaria de Estado da Saúde</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#000000', marginBottom: 2 }}>
        <Text style={{ fontSize: 8.5, fontWeight: 'bold', textAlign: 'center', paddingVertical: 1.5 }}>
          COMPONENTE ESPECIALIZADO DA ASSISTÊNCIA FARMACÊUTICA
        </Text>
        <Text style={{ fontSize: 8, fontWeight: 'bold', textAlign: 'center', paddingBottom: 1.5 }}>
          LAUDO DE SOLICITAÇÃO, AVALIAÇÃO E AUTORIZAÇÃO DE MEDICAMENTO(S)
        </Text>
        <Text style={{ fontSize: 8, fontWeight: 'bold', textAlign: 'center', paddingBottom: 1.5 }}>
          SOLICITAÇÃO DE MEDICAMENTO(S)
        </Text>
        <View style={{ backgroundColor: '#e2e8f0', borderTopWidth: 1, borderColor: '#000000', paddingVertical: 1.5 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold', textAlign: 'center' }}>
            CAMPOS DE PREENCHIMENTO EXCLUSIVO PELO MÉDICO SOLICITANTE
          </Text>
        </View>
      </View>

      {/* Grid Principal com Bordas Nítidas */}
      <View style={{ borderWidth: 1, borderColor: '#000000' }}>
        {/* Row 1: CNES e Estabelecimento */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 0.8, borderColor: '#000000' }}>
          <View style={[styles.gridCell, { width: '30%', borderRightWidth: 0.8 }]}>
            <Text style={styles.labelMini}>1. Número do CNES*</Text>
            <Text style={styles.valueStrong}>{cnes}</Text>
          </View>
          <View style={[styles.gridCell, { width: '70%' }]}>
            <Text style={styles.labelMini}>2. Nome do Estabelecimento de Saúde Solicitante</Text>
            <Text style={styles.valueStrong}>{clinica}</Text>
          </View>
        </View>

        {/* Row 2: Nome do Paciente e Peso */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 0.8, borderColor: '#000000' }}>
          <View style={[styles.gridCell, { width: '75%', borderRightWidth: 0.8 }]}>
            <Text style={styles.labelMini}>3.1 Nome civil completo do Paciente*</Text>
            <Text style={styles.valueStrong}>{cleanPdfText(patient?.nome)}</Text>
          </View>
          <View style={[styles.gridCell, { width: '25%' }]}>
            <Text style={styles.labelMini}>5. Peso do Paciente (Kg)*</Text>
            <Text style={styles.valueStrong}>{peso ? `${peso} kg` : ''}</Text>
          </View>
        </View>

        {/* Row 3: Nome Social e Altura */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 0.8, borderColor: '#000000' }}>
          <View style={[styles.gridCell, { width: '75%', borderRightWidth: 0.8 }]}>
            <Text style={styles.labelMini}>3.2 Nome social do Paciente</Text>
            <Text style={styles.valueStrong}>{cleanPdfText(patient?.nomeSocial) || ''}</Text>
          </View>
          <View style={[styles.gridCell, { width: '25%' }]}>
            <Text style={styles.labelMini}>6. Altura do Paciente (cm)*</Text>
            <Text style={styles.valueStrong}>{altura ? `${altura} cm` : ''}</Text>
          </View>
        </View>

        {/* Row 4: Nome da Mãe */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 2.5 }}>
          <Text style={styles.labelMini}>4. Nome da Mãe do Paciente*</Text>
          <Text style={styles.valueStrong}>{cleanPdfText(patient?.nomeMae) || 'BENEDITA DA SILVA'}</Text>
        </View>

        {/* Row 5: Medicamentos e Quantidade Solicitada (Tabela com 6 meses) */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000' }}>
          {/* Header da Tabela */}
          <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottomWidth: 0.8, borderColor: '#000000' }}>
            <View style={{ width: '65%', borderRightWidth: 0.8, borderColor: '#000000', padding: 2.5 }}>
              <Text style={[styles.labelStrong, { fontSize: 7 }]}>7. Medicamentos*</Text>
            </View>
            <View style={{ width: '35%' }}>
              <Text style={[styles.labelStrong, { fontSize: 7, textAlign: 'center', borderBottomWidth: 0.5, borderColor: '#000000', paddingVertical: 1 }]}>
                8. Quantidade Solicitada*
              </Text>
              <View style={{ flexDirection: 'row' }}>
                {['1° mês', '2° mês', '3° mês', '4° mês', '5° mês', '6° mês'].map((m, idx) => (
                  <View key={idx} style={{ width: '16.66%', borderRightWidth: idx < 5 ? 0.5 : 0, borderColor: '#000000', paddingVertical: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 5.5, fontWeight: 'bold' }}>{m}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Linha 1: Medicamento Solicitado */}
          <View style={{ flexDirection: 'row', borderBottomWidth: 0.5, borderColor: '#000000', minHeight: 18, alignItems: 'center' }}>
            <View style={{ width: '65%', borderRightWidth: 0.8, borderColor: '#000000', padding: 2.5, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 7, fontWeight: 'bold', width: 14 }}>1</Text>
              <Text style={{ fontSize: 7.5, fontWeight: 'bold', flex: 1 }}>{lmeData?.medicamentoOficialLabel || lmeData?.medicamentoNome}</Text>
            </View>
            <View style={{ width: '35%', flexDirection: 'row' }}>
              {[1, 2, 3, 4, 5, 6].map((i, idx) => (
                <View key={idx} style={{ width: '16.66%', borderRightWidth: idx < 5 ? 0.5 : 0, borderColor: '#000000', paddingVertical: 2, alignItems: 'center' }}>
                  <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>{qtdMensal}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Linhas 2 a 6: Vazias */}
          {[2, 3, 4, 5, 6].map((rowIdx) => (
            <View key={rowIdx} style={{ flexDirection: 'row', borderBottomWidth: rowIdx < 6 ? 0.5 : 0, borderColor: '#000000', height: 14, alignItems: 'center' }}>
              <View style={{ width: '65%', borderRightWidth: 0.8, borderColor: '#000000', paddingHorizontal: 2.5 }}>
                <Text style={{ fontSize: 6.5, color: '#64748b' }}>{rowIdx}</Text>
              </View>
              <View style={{ width: '35%', flexDirection: 'row', height: '100%' }}>
                {[1, 2, 3, 4, 5, 6].map((_, idx) => (
                  <View key={idx} style={{ width: '16.66%', borderRightWidth: idx < 5 ? 0.5 : 0, borderColor: '#000000' }} />
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Row 6: CID-10 e Diagnóstico */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 0.8, borderColor: '#000000' }}>
          <View style={[styles.gridCell, { width: '25%', borderRightWidth: 0.8 }]}>
            <Text style={styles.labelMini}>9. CID-10*</Text>
            <Text style={styles.valueStrong}>{lmeData?.cidPrincipal || 'N18.0'}</Text>
          </View>
          <View style={[styles.gridCell, { width: '75%' }]}>
            <Text style={styles.labelMini}>10. Diagnóstico</Text>
            <Text style={styles.valueStrong}>{lmeData?.cidDescricao || 'Doença renal em estádio final'}</Text>
          </View>
        </View>

        {/* Row 7: Anamnese */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3, minHeight: 32 }}>
          <Text style={styles.labelMini}>11. Anamnese*</Text>
          <Text style={[styles.valueStrong, { fontSize: 8, marginTop: 2, lineHeight: 1.3 }]}>
            {cleanPdfText(lmeData?.anamneseTexto) || 'Paciente DRC em hemodiálise evolui com anemia secundária a doença de base'}
          </Text>
        </View>

        {/* Row 8: Tratamento Prévio */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 2.5 }}>
          <Text style={styles.labelMini}>12. Paciente realizou tratamento prévio ou está em tratamento na doença?*</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 1 }}>
            <Checkbox checked={false} label="NÃO" style={{ marginRight: 12 }} />
            <Checkbox checked={true} label={`SIM. Relatar: ${lmeData?.tratamentoPrevio || 'Hemodiálise e Dieta'}`} />
          </View>
        </View>

        {/* Row 9: Atestado de Capacidade */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 2.5 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold', textAlign: 'center', marginBottom: 2 }}>13. Atestado de Capacidade*</Text>
          <Text style={{ fontSize: 6.5, color: '#1e293b', marginBottom: 2, textAlign: 'justify' }}>
            A solicitação do medicamento deverá ser realizada pelo paciente. Entretanto, fica dispensada a obrigatoriedade da presença física do paciente considerado incapaz de acordo com os artigos 3° e 4° do Código Civil. O paciente é considerado incapaz?
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Checkbox checked={true} label="NÃO" style={{ marginRight: 12 }} />
            <Checkbox checked={false} label="SIM. Indicar o nome do responsável pelo paciente, o qual poderá realizar a solicitação:" />
          </View>
        </View>

        {/* Row 10: Dados do Médico Solicitante e Assinatura */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 0.8, borderColor: '#000000' }}>
          <View style={{ width: '68%', borderRightWidth: 0.8, borderColor: '#000000' }}>
            <View style={{ padding: 2.5, borderBottomWidth: 0.8, borderColor: '#000000' }}>
              <Text style={styles.labelMini}>14. Nome do médico solicitante*</Text>
              <Text style={styles.valueStrong}>{cleanPdfText(doctorInfo?.nome || 'Giselle Almeida de Faria Tavares')}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: '60%', padding: 2.5, borderRightWidth: 0.8, borderColor: '#000000' }}>
                <Text style={styles.labelMini}>15. N° do Cartão Nacional de Saúde (CNS) do médico*</Text>
                <Text style={styles.valueStrong}>{doctorInfo?.cns || lmeData?.medicoSolicitante?.cns || '898004770672707'}</Text>
              </View>
              <View style={{ width: '40%', padding: 2.5 }}>
                <Text style={styles.labelMini}>16. Data da Solicitação*</Text>
                <Text style={styles.valueStrong}>{safeFormatDate(dataSolicitacao)}</Text>
              </View>
            </View>
          </View>
          <View style={{ width: '32%', padding: 3, justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.labelMini}>17. Assinatura e carimbo do médico*</Text>
            <View style={{ borderTopWidth: 0.8, borderColor: '#000000', width: '90%', marginTop: 24, paddingTop: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 6.5, color: '#64748b' }}>Carimbo / Assinatura</Text>
            </View>
          </View>
        </View>

        {/* Row 11: Responsável pelo Preenchimento */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 2.5 }}>
          <Text style={styles.labelMini}>18. CAMPOS ABAIXO PREENCHIDOS POR*:</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 1 }}>
            <Checkbox checked={false} label="Paciente" />
            <Checkbox checked={false} label="Mãe do Paciente" />
            <Checkbox checked={false} label="Responsável (Descrito no item 13)" />
            <Checkbox checked={true} label="Médico Solicitante" />
          </View>
        </View>

        {/* Row 12: Raça/Cor e Telefones */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 0.8, borderColor: '#000000' }}>
          <View style={{ width: '60%', borderRightWidth: 0.8, borderColor: '#000000', padding: 2.5 }}>
            <Text style={styles.labelMini}>19. Raça/Cor/Etnia informado pelo Paciente Responsável*</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 1 }}>
              <Checkbox checked={false} label="Branca" />
              <Checkbox checked={isPreta} label="Preta" />
              <Checkbox checked={isParda} label="Parda" />
              <Checkbox checked={false} label="Amarela" />
              <Checkbox checked={false} label="Indígena" />
            </View>
          </View>
          <View style={{ width: '40%', padding: 2.5 }}>
            <Text style={styles.labelMini}>20. Telefone(s) para contato do paciente</Text>
            <Text style={styles.valueStrong}>{formatPhone(patient?.telefone) || '(31) 98732-2786'}</Text>
          </View>
        </View>

        {/* Row 13: Documento, E-mail e Assinatura */}
        <View style={{ flexDirection: 'row' }}>
          <View style={{ width: '60%', borderRightWidth: 0.8, borderColor: '#000000' }}>
            <View style={{ padding: 2.5, borderBottomWidth: 0.8, borderColor: '#000000' }}>
              <Text style={styles.labelMini}>21. Número do documento do Paciente</Text>
              <Text style={styles.valueStrong}>CPF: {docNumero}</Text>
            </View>
            <View style={{ padding: 2.5 }}>
              <Text style={styles.labelMini}>22. Correio Eletrônico do paciente</Text>
              <Text style={{ fontSize: 7 }}>{patient?.email || ''}</Text>
            </View>
          </View>
          <View style={{ width: '40%', padding: 3, justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.labelMini}>23. Assinatura do responsável pelo preenchimento*</Text>
            <View style={{ borderTopWidth: 0.8, borderColor: '#000000', width: '90%', marginTop: 18, paddingTop: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 6.5, color: '#64748b' }}>Assinatura</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 6.5, fontWeight: 'bold', color: '#000000', marginTop: 4 }}>
        *CAMPOS DE PREENCHIMENTO OBRIGATÓRIO
      </Text>
    </Page>
  );
}

// =========================================================================
// PÁGINA 4: FORMULÁRIO ESPECÍFICO – ALFAEPOETINA (ANEMIA)
// =========================================================================
function PageFormularioAlfaepoetina({
  patient,
  doctorInfo,
  lmeData,
  estabelecimento,
  dataSolicitacao
}) {
  const clinica = estabelecimento?.nome || 'Dialize - Betim- MG';
  const idade = patient?.idade || 77;
  const doencaBase = lmeData?.doencaBase || patient?.etiologiaDRC || 'Doença Renal do Diabetes';
  const estagio = lmeData?.estagioDRC || '5D';
  const doseSolicitada = lmeData?.doseSolicitadaTexto || '3000ui 3 vezes por semana';

  const [ano, mes, dia] = (dataSolicitacao || new Date().toISOString().split('T')[0]).split('-');

  return (
    <Page size="A4" style={styles.page}>
      <HeaderGovernoMG />

      <Text style={{ fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 6, textTransform: 'uppercase' }}>
        FORMULÁRIO ESPECÍFICO – ALFAEPOETINA
      </Text>

      <View style={{ borderWidth: 1, borderColor: '#000000' }}>
        {/* 1 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>1   NOME CIVIL DO(A) PACIENTE: {cleanPdfText(patient?.nome)}</Text>
          <Text style={{ fontSize: 7, fontWeight: 'bold', marginTop: 1 }}>    NOME SOCIAL DO(A) PACIENTE: {cleanPdfText(patient?.nomeSocial) || ''}</Text>
        </View>

        {/* 2 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>2   CENTRO DE DIÁLISE: {clinica}</Text>
        </View>

        {/* 3 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>3   IDADE DO PACIENTE: {idade} anos</Text>
        </View>

        {/* 4 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>4   DOENÇA DE BASE QUE DETERMINA A DRC: {doencaBase}</Text>
        </View>

        {/* 5 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>5   ESTÁGIO DA DRC: {estagio}</Text>
        </View>

        {/* 6 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 2 }}>6   TIPO DE TRATAMENTO:</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <Checkbox checked={false} label="Conservador" />
            <Checkbox checked={false} label="Diálise peritoneal" />
            <Checkbox checked={true} label="Hemodiálise" />
          </View>
        </View>

        {/* 7 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', marginRight: 12 }}>
              7   INFORMAR SE O PACIENTE ESTÁ RECEBENDO TRANSFUSÃO DE SANGUE:
            </Text>
            <Checkbox checked={false} label="SIM" style={{ marginRight: 12 }} />
            <Checkbox checked={true} label="NÃO" />
          </View>
        </View>

        {/* 8 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', marginRight: 12 }}>
              8   INFORMAR SE É O PRIMEIRO TRATAMENTO COM ALFAEPOETINA:
            </Text>
            <Checkbox checked={true} label="SIM" style={{ marginRight: 12 }} />
            <Checkbox checked={false} label="NÃO" />
          </View>
          <Text style={{ fontSize: 6.5, color: '#334155', marginBottom: 1 }}>SE NÃO, INFORMAR:</Text>
          <Text style={{ fontSize: 6.5, color: '#334155', marginBottom: 2 }}>
            A) ANTES DO INÍCIO DO TRATAMENTO: HEMÁCIAS: ____________ HEMATÓCRITO: ____________ HEMOGLOBINA: ____________
          </Text>
          <Text style={{ fontSize: 6.5, color: '#334155', marginBottom: 2 }}>
            HÁ QUANTO TEMPO INTERROMPEU O TRATAMENTO? ____________________ MOTIVO: _________________________________
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 6.5, color: '#334155', marginRight: 6 }}>B) USOU O MEDICAMENTO FORNECIDO PELO SUS?</Text>
            <Checkbox checked={false} label="SIM" style={{ marginRight: 8 }} />
            <Checkbox checked={false} label="NÃO" />
          </View>
        </View>

        {/* 9: Dose e Tabela de Esquemas Sugeridos */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 3 }}>
            9   INFORMAR A DOSE SOLICITADA: {doseSolicitada}
          </Text>
          <Text style={{ fontSize: 6.5, color: '#334155', marginBottom: 2 }}>Esquemas Terapêuticos Sugeridos:</Text>

          <View style={{ borderWidth: 0.8, borderColor: '#000000' }}>
            {/* Header Tabela */}
            <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottomWidth: 0.8, borderColor: '#000000' }}>
              <View style={{ width: '22%', borderRightWidth: 0.8, borderColor: '#000000', padding: 2, alignItems: 'center' }}>
                <Text style={{ fontSize: 6, fontWeight: 'bold', textAlign: 'center' }}>PESO DO PACIENTE</Text>
              </View>
              <View style={{ width: '18%', borderRightWidth: 0.8, borderColor: '#000000', padding: 2, alignItems: 'center' }}>
                <Text style={{ fontSize: 6, fontWeight: 'bold', textAlign: 'center' }}>DOSE INICIAL</Text>
              </View>
              <View style={{ width: '20%', borderRightWidth: 0.8, borderColor: '#000000', padding: 2, alignItems: 'center' }}>
                <Text style={{ fontSize: 6, fontWeight: 'bold', textAlign: 'center' }}>DOSE DE MANUTENÇÃO 01</Text>
              </View>
              <View style={{ width: '20%', borderRightWidth: 0.8, borderColor: '#000000', padding: 2, alignItems: 'center' }}>
                <Text style={{ fontSize: 6, fontWeight: 'bold', textAlign: 'center' }}>DOSE DE MANUTENÇÃO 02</Text>
              </View>
              <View style={{ width: '20%', padding: 2, alignItems: 'center' }}>
                <Text style={{ fontSize: 6, fontWeight: 'bold', textAlign: 'center' }}>DOSE DE MANUTENÇÃO 03</Text>
              </View>
            </View>

            {/* Linhas */}
            {[
              { peso: '20 – 30 Kg', ini: '1.000 UI x 3', m1: '1.000 UI x 2', m2: '1.000 UI x 1' },
              { peso: '30,1 – 50 Kg', ini: '2.000 UI x 3', m1: '2.000 UI x 2', m2: '1.000 UI x 2' },
              { peso: '50,1 – 65 Kg', ini: '3.000 UI x 3', m1: '3.000 UI x 2', m2: '2.000 UI x 2' },
              { peso: 'Acima de 65 Kg', ini: '4.000 UI x 3', m1: '4.000 UI x 2', m2: '3.000 UI x 2' }
            ].map((row, idx) => (
              <View key={idx} style={{ flexDirection: 'row', borderBottomWidth: idx < 3 ? 0.5 : 0, borderColor: '#000000', height: 11, alignItems: 'center' }}>
                <View style={{ width: '22%', borderRightWidth: 0.8, borderColor: '#000000', paddingHorizontal: 2 }}>
                  <Text style={{ fontSize: 6 }}>{row.peso}</Text>
                </View>
                <View style={{ width: '18%', borderRightWidth: 0.8, borderColor: '#000000', paddingHorizontal: 2 }}>
                  <Text style={{ fontSize: 6 }}>{row.ini}</Text>
                </View>
                <View style={{ width: '20%', borderRightWidth: 0.8, borderColor: '#000000', paddingHorizontal: 2 }}>
                  <Text style={{ fontSize: 6 }}>{row.m1}</Text>
                </View>
                <View style={{ width: '20%', borderRightWidth: 0.8, borderColor: '#000000', paddingHorizontal: 2 }}>
                  <Text style={{ fontSize: 6 }}>{row.m2}</Text>
                </View>
                <View style={{ width: '20%', paddingHorizontal: 2 }}>
                  {idx === 0 ? <Text style={{ fontSize: 5.5, fontStyle: 'italic', textAlign: 'center' }}>OUTRA PRESCRIÇÃO (CONSULTAR PCDT)</Text> : null}
                </View>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: 6, fontWeight: 'bold', marginTop: 2 }}>
            Atenção! Dose máxima: 300UI/Kg/semana por via subcutânea ou 450UI/Kg/semana por via intravenosa.
          </Text>
        </View>

        {/* 10 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3, minHeight: 28 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>10   OUTRAS INFORMAÇÕES:</Text>
          <Text style={{ fontSize: 7, marginTop: 1 }}>{cleanPdfText(lmeData?.outrasInformacoes) || ''}</Text>
        </View>

        {/* 11 */}
        <View style={{ padding: 4 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 4 }}>
            11   Assumo integral responsabilidade pela veracidade das informações prestadas.
          </Text>
          <Text style={{ fontSize: 7, marginBottom: 16 }}>
            Data de preenchimento: {dia} / {mes} / {ano}
          </Text>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%', borderTopWidth: 0.8, borderColor: '#000000', paddingTop: 2, alignItems: 'center' }}>
              <Text style={{ fontSize: 7 }}>Médico</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 6.5, color: '#475569', marginTop: 4 }}>
        Atualizado em 20/05/2025
      </Text>
    </Page>
  );
}

// =========================================================================
// PÁGINA 4 & 5: FORMULÁRIO ESPECÍFICO – DISTÚRBIO MINERAL E ÓSSEO NA DRC (2 PÁGINAS)
// =========================================================================
function PageFormularioDMO1({
  patient,
  lmeData
}) {
  const medLabel = lmeData?.medicamentoOficialLabel || 'Paricalcitol 5,0 mcg/mL solução injetável (ampola com 1 mL) - 72 ampolas - 6 Meses';

  return (
    <Page size="A4" style={styles.page}>
      <HeaderGovernoMG />

      <Text style={{ fontSize: 9.5, fontWeight: 'bold', textAlign: 'center', marginBottom: 6, textTransform: 'uppercase' }}>
        FORMULÁRIO ESPECÍFICO – DISTÚRBIO MINERAL E ÓSSEO NA DRC
      </Text>

      <View style={{ borderWidth: 1, borderColor: '#000000' }}>
        {/* 1 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>1   NOME CIVIL DO(A) PACIENTE: {cleanPdfText(patient?.nome)}</Text>
          <Text style={{ fontSize: 7, fontWeight: 'bold', marginTop: 1 }}>    NOME SOCIAL DO(A) PACIENTE: {cleanPdfText(patient?.nomeSocial) || cleanPdfText(patient?.nome)}</Text>
        </View>

        {/* 2 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>2   MEDICAMENTO(S) SOLICITADO(S):</Text>
          <Text style={{ fontSize: 7.5, fontWeight: 'bold', marginTop: 1 }}>{medLabel}</Text>
        </View>

        {/* 3 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3, minHeight: 38 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>
            3   DESCRIÇÃO DO CASO CLÍNICO – HISTÓRICO (Diagnóstico – quadro clínico – evolução):
          </Text>
          <Text style={{ fontSize: 7.5, marginTop: 2, lineHeight: 1.3 }}>
            {cleanPdfText(lmeData?.anamneseTexto) || 'Paciente DRC em hemodiálise evoluindo com DMO secundária a doença de base apesar de dieta adequada e hemodiálise'}
          </Text>
        </View>

        {/* 4 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3, minHeight: 28 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>
            4   TRATAMENTO (Detalhar tratamento prévio e atual, falhas e contraindicações):
          </Text>
          <Text style={{ fontSize: 7.5, marginTop: 2 }}>
            {cleanPdfText(lmeData?.tratamentoPrevio) || 'Hemodiálise e dieta'}
          </Text>
        </View>

        {/* 5: Tabela de Classificação DRC */}
        <View style={{ padding: 3 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 3 }}>
            5   ASSINALAR A CLASSIFICAÇÃO DA DRC DO PACIENTE, DE ACORDO COM A TAXA DE FILTRAÇÃO GLOMERULAR, CONFORME PCDT:
          </Text>

          <View style={{ borderWidth: 0.8, borderColor: '#000000' }}>
            <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', borderBottomWidth: 0.8, borderColor: '#000000' }}>
              <View style={{ width: '15%', borderRightWidth: 0.8, borderColor: '#000000', padding: 2, alignItems: 'center' }}>
                <Text style={{ fontSize: 6.5, fontWeight: 'bold' }}>Estágio</Text>
              </View>
              <View style={{ width: '25%', borderRightWidth: 0.8, borderColor: '#000000', padding: 2, alignItems: 'center' }}>
                <Text style={{ fontSize: 6.5, fontWeight: 'bold' }}>TFG (mL/min por 1,73m²)</Text>
              </View>
              <View style={{ width: '60%', padding: 2, alignItems: 'center' }}>
                <Text style={{ fontSize: 6.5, fontWeight: 'bold' }}>Descrição</Text>
              </View>
            </View>

            {[
              { id: '1', est: '1', tfg: '> 90', desc: 'Lesão renal com TFG normal ou aumentada' },
              { id: '2', est: '2', tfg: '60-89', desc: 'Lesão renal com TFG levemente diminuída' },
              { id: '3', est: '3 (A e B)', tfg: '30-59', desc: 'TFG moderadamente diminuída' },
              { id: '4', est: '4', tfg: '15-29', desc: 'TFG gravemente diminuída' },
              { id: '5', est: '5', tfg: '< 15', desc: 'Falência renal' },
              { id: '5D', est: '5D', tfg: '< 15 em diálise', desc: 'Falência renal em terapia substitutiva' },
              { id: 'T', est: '*T', tfg: 'N/A', desc: 'Transplante renal bem sucedido' }
            ].map((r, idx) => (
              <View key={idx} style={{ flexDirection: 'row', borderBottomWidth: idx < 6 ? 0.5 : 0, borderColor: '#000000', height: 13, alignItems: 'center' }}>
                <View style={{ width: '15%', borderRightWidth: 0.8, borderColor: '#000000', paddingHorizontal: 4 }}>
                  <Checkbox checked={r.id === (lmeData?.estagioDRC || '5D')} label={r.est} />
                </View>
                <View style={{ width: '25%', borderRightWidth: 0.8, borderColor: '#000000', paddingHorizontal: 4 }}>
                  <Text style={{ fontSize: 6.5 }}>{r.tfg}</Text>
                </View>
                <View style={{ width: '60%', paddingHorizontal: 4 }}>
                  <Text style={{ fontSize: 6.5 }}>{r.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: 5.5, fontStyle: 'italic', marginTop: 2, color: '#334155' }}>
            *Somente em solicitações de Cinacalcete para pacientes transplantados renais que não se encaixam em outra classificação da DRC.
          </Text>
        </View>
      </View>
    </Page>
  );
}

function PageFormularioDMO2({
  lmeData,
  dataSolicitacao
}) {
  const [ano, mes, dia] = (dataSolicitacao || new Date().toISOString().split('T')[0]).split('-');

  return (
    <Page size="A4" style={styles.page}>
      <HeaderGovernoMG />

      <View style={{ borderWidth: 1, borderColor: '#000000' }}>
        {/* 6 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 2 }}>6   INFORMAR:</Text>
          <Checkbox checked={false} label="Paciente em tratamento conservador/sem terapia renal substitutiva atualmente;" style={{ marginBottom: 2 }} />
          <Checkbox checked={true} label="Paciente em hemodiálise;" style={{ marginBottom: 2 }} />
          <Checkbox checked={false} label="Paciente em diálise peritoneal." />
        </View>

        {/* 7 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3, minHeight: 36 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', marginRight: 12 }}>
              7   PACIENTE JÁ FEZ TRANSPLANTE RENAL?
            </Text>
            <Checkbox checked={Boolean(lmeData?.transplantePrevio)} label="Sim" style={{ marginRight: 12 }} />
            <Checkbox checked={!lmeData?.transplantePrevio} label="Não" />
          </View>
          <Text style={{ fontSize: 6.5, color: '#334155', marginBottom: 1 }}>Se sim, descreva:</Text>
          <Text style={{ fontSize: 7, lineHeight: 1.3 }}>
            {lmeData?.transplantePrevio ? (cleanPdfText(lmeData?.transplanteDescricao) || 'Tx doador falecido em 15/03/2018 - perda por disfunção primária do enxerto (Bx 25/04/18: necrose cortical e medular de 100% do fragmento).') : ''}
          </Text>
        </View>

        {/* 8 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', marginRight: 12 }}>
              8   PACIENTE REALIZOU PARATIREOIDECTOMIA?
            </Text>
            <Checkbox checked={Boolean(lmeData?.paratireoidectomia)} label="Sim" style={{ marginRight: 12 }} />
            <Checkbox checked={!lmeData?.paratireoidectomia} label="Não" />
          </View>
          <Text style={{ fontSize: 6.5, color: '#334155', marginBottom: 1 }}>Se sim, detalhar:</Text>
          <Text style={{ fontSize: 7, marginBottom: 2 }}>{cleanPdfText(lmeData?.paratireoidectomiaDetalhes) || ''}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 7, fontWeight: 'bold', marginRight: 12 }}>
              PACIENTE COM SÍNDROME DA FOME ÓSSEA APÓS PARATIREOIDECTOMIA?
            </Text>
            <Checkbox checked={Boolean(lmeData?.fomeOssea)} label="Sim" style={{ marginRight: 12 }} />
            <Checkbox checked={!lmeData?.fomeOssea} label="Não" />
          </View>
        </View>

        {/* 9 */}
        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3, minHeight: 32 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold' }}>9   OUTRAS INFORMAÇÕES PERTINENTES:</Text>
          <Text style={{ fontSize: 7, marginTop: 1 }}>{cleanPdfText(lmeData?.outrasInformacoes) || ''}</Text>
        </View>

        {/* 10 */}
        <View style={{ padding: 4 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold', marginBottom: 4 }}>
            10   Assumo integral responsabilidade pela veracidade das informações prestadas.
          </Text>
          <Text style={{ fontSize: 7, marginBottom: 20 }}>
            Data de preenchimento: {dia} / {mes} / {ano}
          </Text>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%', borderTopWidth: 0.8, borderColor: '#000000', paddingTop: 2, alignItems: 'center' }}>
              <Text style={{ fontSize: 7 }}>Médico</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 6.5, color: '#475569', marginTop: 4 }}>
        Atualizado em 13/05/2024
      </Text>
    </Page>
  );
}

// =========================================================================
// PÁGINA 5 (OU 6): REQUERIMENTO DE MEDICAMENTO(S) DO CEAF
// =========================================================================
function PageRequerimentoCEAF({ patient, lmeData }) {
  const medLabel = lmeData?.medicamentoOficialLabel || lmeData?.medicamentoNome;

  return (
    <Page size="A4" style={styles.page}>
      <HeaderGovernoMG />

      <Text style={{ fontSize: 8.5, fontWeight: 'bold', textAlign: 'center', marginBottom: 6, textTransform: 'uppercase' }}>
        REQUERIMENTO DE MEDICAMENTO(S) DO COMPONENTE ESPECIALIZADO DA ASSISTÊNCIA FARMACÊUTICA
      </Text>

      {/* Caixa da Farmácia */}
      <View style={{ borderWidth: 1, borderColor: '#000000', marginBottom: 6 }}>
        <View style={styles.sectionHeaderBar}>
          <Text style={{ fontWeight: 'bold', fontSize: 7.5, textAlign: 'center' }}>
            CAMPOS A SEREM PREENCHIDOS PELO PROFISSIONAL NA FARMÁCIA (PREENCHIMENTO OBRIGATÓRIO)
          </Text>
        </View>

        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', flexDirection: 'row' }}>
          <View style={{ width: '50%', borderRightWidth: 0.8, borderColor: '#000000', padding: 3 }}>
            <Text style={styles.labelMini}>UNIDADE SOLICITANTE (CAF OU MUNICÍPIO):</Text>
            <Text style={{ fontSize: 7.5 }}>{lmeData?.unidadeCAF || ''}</Text>
          </View>
          <View style={{ width: '50%', padding: 3 }}>
            <Text style={styles.labelMini}>CAF DE REFERÊNCIA DO MUNICÍPIO (SE HOUVER):</Text>
          </View>
        </View>

        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={styles.labelMini}>NOME CIVIL COMPLETO DO(A) PACIENTE SOLICITANTE:</Text>
          <Text style={styles.valueStrong}>{cleanPdfText(patient?.nome)}</Text>
        </View>

        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={styles.labelMini}>NOME SOCIAL COMPLETO DO(A) PACIENTE SOLICITANTE:</Text>
          <Text style={styles.valueStrong}>{cleanPdfText(patient?.nomeSocial) || cleanPdfText(patient?.nome)}</Text>
        </View>

        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', flexDirection: 'row' }}>
          <View style={{ width: '50%', borderRightWidth: 0.8, borderColor: '#000000', padding: 3 }}>
            <Text style={styles.labelMini}>CPF:</Text>
            <Text style={styles.valueStrong}>{formatCpf(patient?.cpf)}</Text>
          </View>
          <View style={{ width: '50%', padding: 3 }}>
            <Text style={styles.labelMini}>TELEFONE(S) PARA CONTATO:</Text>
            <Text style={styles.valueStrong}>{formatPhone(patient?.telefone)}</Text>
          </View>
        </View>

        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={styles.labelMini}>MEDICAMENTO(S) SOLICITADO(S):</Text>
          <Text style={styles.valueStrong}>{medLabel}</Text>
        </View>

        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={styles.labelMini}>DATA DE APRESENTAÇÃO DOS DOCUMENTOS:</Text>
          <Text style={{ fontSize: 7.5, marginTop: 1 }}>________ / ________ / ___________</Text>
        </View>

        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={styles.labelMini}>NÚMERO DO PROCESSO SEI:</Text>
          <Text style={{ fontSize: 6, color: '#475569', marginTop: 1 }}>
            (OBSERVAÇÃO: PARA PACIENTES JÁ CADASTRADOS NO PROGRAMA, OS NOVOS DOCUMENTOS APRESENTADOS DEVEM SER SEMPRE INSERIDOS NO PROCESSO SEI EXISTENTE, CASO REFERENTES À MESMA CONDIÇÃO CLÍNICA/CHECKLIST)
          </Text>
        </View>

        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3 }}>
          <Text style={styles.labelMini}>NÚMERO DO PROCESSO SIGAF:</Text>
        </View>

        <View style={{ borderBottomWidth: 0.8, borderColor: '#000000', padding: 3, minHeight: 35 }}>
          <Text style={styles.labelMini}>OBSERVAÇÕES:</Text>
        </View>

        <View style={{ padding: 4, alignItems: 'center' }}>
          <View style={{ width: '90%', borderTopWidth: 0.8, borderColor: '#000000', paddingTop: 2, alignItems: 'center' }}>
            <Text style={{ fontSize: 6.5, fontWeight: 'bold' }}>
              NOME LEGÍVEL DO(A) PROFISSIONAL RESPONSÁVEL PELA ABERTURA DO REQUERIMENTO DE MEDICAMENTOS DO CEAF
            </Text>
          </View>
        </View>
      </View>

      {/* Caixa do Usuário */}
      <View style={{ borderWidth: 1, borderColor: '#000000' }}>
        <View style={styles.sectionHeaderBar}>
          <Text style={{ fontWeight: 'bold', fontSize: 7.5, textAlign: 'center' }}>
            CAMPOS A SEREM PREENCHIDOS PELO USUÁRIO (PREENCHIMENTO OBRIGATÓRIO)
          </Text>
        </View>
        <View style={{ padding: 4 }}>
          <Text style={{ fontSize: 7.5, lineHeight: 1.4, marginBottom: 20 }}>
            Eu __________________________________________________ declaro que li e concordo com todas as informações apresentadas no Termo de Adesão sobre a solicitação de medicamentos do Componente Especializado de Assistência Farmacêutica.
          </Text>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '80%', borderTopWidth: 0.8, borderColor: '#000000', paddingTop: 2, alignItems: 'center' }}>
              <Text style={{ fontSize: 7, fontWeight: 'bold' }}>ASSINATURA DO(A) PACIENTE OU RESPONSÁVEL</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  );
}

// =========================================================================
// PÁGINA 6 & 7 (OU 7 & 8): RECEITUÁRIO SIMPLES (1ª E 2ª VIA OFICIAL)
// =========================================================================
function PageReceituarioSimples({
  patient,
  doctorInfo,
  lmeData,
  estabelecimento,
  dataEmissao,
  viaNumero = 1
}) {
  const clinica = estabelecimento?.nome || 'DIALIZE SAUDE';
  const cnes = estabelecimento?.cnes || '5920574';
  const endereco = estabelecimento?.endereco || 'AV EDMEIA MATTOS LAZZAROTTI 1655';
  const bairro = estabelecimento?.bairro || 'ANGOLA';
  const cep = estabelecimento?.cep || '32604155';
  const cidade = estabelecimento?.cidade || 'BETIM';
  const uf = estabelecimento?.uf || 'MG';
  const telefone = estabelecimento?.telefone || '(31)94510284';

  const medLabel = lmeData?.medicamentoOficialLabel || lmeData?.medicamentoNome;
  const posologia = lmeData?.posologia || 'Administrar conforme prescrição médica';

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.pageBorderBox}>
        {/* Título */}
        <Text style={{ fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 2, textTransform: 'uppercase' }}>
          RECEITUÁRIO
        </Text>
        <Text style={{ fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, textTransform: 'uppercase' }}>
          SIMPLES {viaNumero === 2 ? '(2ª VIA - FARMÁCIA)' : ''}
        </Text>

        {/* Identificação do Paciente */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
            <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>PACIENTE: {cleanPdfText(patient?.nome)}</Text>
            <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>CPF {formatCpf(patient?.cpf)}</Text>
          </View>
          <Text style={{ fontSize: 7.5 }}>
            ENDEREÇO: {cleanPdfText(patient?.endereco) || 'Rua Rio Pará 190, Laranjeiras, Betim - MG'}
          </Text>
        </View>

        {/* Prescrição */}
        <View style={{ flex: 1, marginTop: 8 }}>
          <Text style={{ fontSize: 8, fontWeight: 'bold', textDecoration: 'underline', marginBottom: 6 }}>
            PRESCRIÇÃO:
          </Text>
          <Text style={{ fontSize: 8, fontWeight: 'bold', marginBottom: 6 }}>
            USO INTERNO
          </Text>

          <View style={{ marginLeft: 8, marginTop: 4 }}>
            <Text style={{ fontSize: 8.5, fontWeight: 'bold', marginBottom: 4 }}>
              {medLabel}
            </Text>
            <Text style={{ fontSize: 8, lineHeight: 1.4 }}>
              Modo de Usar - {posologia}
            </Text>
          </View>
        </View>

        {/* Rodapé da Receita */}
        <View style={{ borderTopWidth: 0.8, borderColor: '#000000', paddingTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
            <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>
              NOME DO(A) MÉDICO(A): {cleanPdfText(doctorInfo?.nome || 'Giselle Almeida de Faria Tavares')}
            </Text>
            <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>
              CRM: {doctorInfo?.crm || '41520'}   UF: {doctorInfo?.ufCrm || 'MG'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
            <Text style={{ fontSize: 7.5 }}>LOCAL DE ATENDIMENTO: {clinica}</Text>
            <Text style={{ fontSize: 7.5 }}>CNES: {cnes}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
            <Text style={{ fontSize: 7 }}>ENDEREÇO: {endereco}</Text>
            <Text style={{ fontSize: 7 }}>BAIRRO: {bairro} - CEP: {cep}</Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 7 }}>CIDADE: {cidade}   UF: {uf}   TELEFONE: {telefone}</Text>
          </View>

          <Text style={{ fontSize: 7.5, fontWeight: 'bold', marginBottom: 20 }}>
            DATA DE EMISSÃO: {safeFormatDate(dataEmissao)}
          </Text>

          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '50%', borderTopWidth: 0.8, borderColor: '#000000', paddingTop: 2, alignItems: 'center' }}>
              <Text style={{ fontSize: 7.5, fontWeight: 'bold' }}>Assinatura</Text>
              <Text style={{ fontSize: 7.5 }}>{cleanPdfText(doctorInfo?.nome || 'Giselle Almeida de Faria Tavares')}</Text>
              <Text style={{ fontSize: 7 }}>CRM: {doctorInfo?.crm || '41520'}</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  );
}

// =========================================================================
// PÁGINA 8 (OU 9): TERMO DE ADESÃO PARA SOLICITAÇÃO DE MEDICAMENTOS DO CEAF
// =========================================================================
function PageTermoAdesaoCEAF({ patient, lmeData }) {
  const medLabel = lmeData?.medicamentoOficialLabel || lmeData?.medicamentoNome;

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.pageBorderBox}>
        <HeaderGovernoMG />

        <Text style={{ fontSize: 9.5, fontWeight: 'bold', textAlign: 'center', marginBottom: 2, textTransform: 'uppercase' }}>
          TERMO DE ADESÃO PARA SOLICITAÇÃO DE MEDICAMENTOS DO CEAF
        </Text>
        <Text style={{ fontSize: 6.5, fontStyle: 'italic', textAlign: 'center', marginBottom: 8, color: '#334155' }}>
          Esse documento tem por objetivo registrar a entrega dos documentos para a solicitação de medicamentos e traz algumas informações úteis ao paciente
        </Text>

        <View style={{ flexDirection: 'row', gap: 10, fontSize: 6.5, lineHeight: 1.35, marginBottom: 8 }}>
          {/* Coluna 1 */}
          <View style={{ width: '50%', gap: 6 }}>
            <View>
              <Text style={{ fontWeight: 'bold' }}>O que esse documento indica?</Text>
              <Text>Que seu pedido por um medicamento do Componente Especializado da Assistência Farmacêutica foi registrado.</Text>
            </View>

            <View>
              <Text style={{ fontWeight: 'bold' }}>Quais são os próximos passos?</Text>
              <Text>
                Seus documentos serão analisados pela equipe de analistas da Secretaria de Saúde de Minas Gerais com base no definido em regras estaduais e federais (Protocolos Clínicos e Diretrizes Terapêuticas do Ministério da Saúde, Portarias e Resoluções Estaduais).
              </Text>
              <Text style={{ marginTop: 2 }}>Após isso, um documento será produzido com a resposta ao seu pedido, que poderá ser:</Text>
              <Text style={{ marginLeft: 4, marginTop: 1 }}>• DEFERIDO: não existiam erros no seu pedido e por isso ele foi aceito. Será possível iniciar o tratamento, desde que tenha disponibilidade do medicamento na farmácia.</Text>
              <Text style={{ marginLeft: 4, marginTop: 1 }}>• DEVOLVIDO: faltam exames, documentos ou informações no seu pedido e por isso ele precisa ser completado. É preciso que os documentos faltantes sejam entregues em até 90 dias.</Text>
              <Text style={{ marginLeft: 4, marginTop: 1 }}>• INDEFERIDO: seu pedido não obedece às regras estaduais e federais para conseguir o medicamento. Veja o motivo do indeferimento na resposta e leve o documento ao médico.</Text>
            </View>

            <View>
              <Text style={{ fontWeight: 'bold' }}>Como saber o resultado do meu pedido?</Text>
              <Text>
                Você pode descobrir o resultado pelo MG APP. Para isso, faça o cadastro no aplicativo, acesse o menu, em seguida vá em “Saúde”, depois “Consulta do Andamento da Solicitação de Medicamentos”. Então insira seus dados e selecione o medicamento que gostaria de consultar.
              </Text>
            </View>

            <View>
              <Text style={{ fontWeight: 'bold' }}>E em caso de dúvidas?</Text>
              <Text>Em caso de dúvidas, acesse a página www.saude.mg.gov.br/obtermedicamentosceaf.</Text>
            </View>
          </View>

          {/* Coluna 2 */}
          <View style={{ width: '50%', gap: 6 }}>
            <View>
              <Text style={{ fontWeight: 'bold' }}>Se o pedido for DEFERIDO, o que mais preciso saber?</Text>
              <Text>• A cada 180 dias (6 meses) é necessário entregar novo Laudo para Solicitação, Avaliação e Autorização de medicamentos (LME) e nova receita médica para garantir a continuidade do tratamento;</Text>
              <Text style={{ marginTop: 2 }}>• Caso o pedido pelo medicamento precise de reavaliação periódica, é necessário entregar novas documentações (LME, receita médica e outros documentos) à farmácia, de tempos em tempos, para continuidade do tratamento. Caso os novos documentos não sejam entregues, o fornecimento do medicamento poderá ser interrompido;</Text>
              <Text style={{ marginTop: 2 }}>• Para medicamentos sujeitos a controle especial, será necessário entregar nova receita médica mensalmente;</Text>
              <Text style={{ marginTop: 2 }}>• Caso o medicamento não seja retirado por 6 meses contínuos, sem uma explicação médica anterior a paralisação, será considerado que houve interrupção ou abandono de tratamento e o pedido será INATIVADO. Nesses casos, para conseguir novamente o medicamento, o paciente deverá fazer um novo pedido;</Text>
              <Text style={{ marginTop: 2 }}>• Caso o tratamento precise ser paralisado por questões médicas, é necessário entregar relatório médico com o motivo da suspensão antes da próxima data de retirada do medicamento. Além disso, quando for necessário reiniciar o tratamento, será preciso entregar nova LME e receita médica;</Text>
              <Text style={{ marginTop: 2 }}>• Caso o paciente não possa comparecer à farmácia para retirar o medicamento, deverá indicar os representantes por meio da Declaração Autorizadora.</Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 6, fontStyle: 'italic', textAlign: 'center', marginBottom: 6 }}>
          Todos os documentos relativos às solicitações de medicamento(s), uma vez feito o pedido, passam a pertencer à Secretaria Estadual de Saúde. Caso necessário, o usuário/representante poderá solicitar cópias deles.
        </Text>

        {/* Linha de Corte Tracejada */}
        <View style={{ borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#000000', marginVertical: 6 }} />

        {/* Canhoto: Registro da Solicitação de Medicamento */}
        <View style={{ borderWidth: 0.8, borderColor: '#000000', padding: 4 }}>
          <Text style={{ fontSize: 7.5, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 }}>
            REGISTRO DA SOLICITAÇÃO DE MEDICAMENTO
          </Text>

          <View style={{ borderBottomWidth: 0.5, borderColor: '#000000', paddingVertical: 1.5 }}>
            <Text style={{ fontSize: 6.5 }}>Nome civil do paciente: <Text style={{ fontWeight: 'bold' }}>{cleanPdfText(patient?.nome)}</Text></Text>
          </View>

          <View style={{ borderBottomWidth: 0.5, borderColor: '#000000', paddingVertical: 1.5 }}>
            <Text style={{ fontSize: 6.5 }}>Nome social do paciente: <Text style={{ fontWeight: 'bold' }}>{cleanPdfText(patient?.nomeSocial) || cleanPdfText(patient?.nome)}</Text></Text>
          </View>

          <View style={{ borderBottomWidth: 0.5, borderColor: '#000000', paddingVertical: 1.5, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 6.5 }}>Data da solicitação: ____ / ____ / ________</Text>
            <Text style={{ fontSize: 6.5 }}>Nº do Processo SIGAF: ___________________________</Text>
          </View>

          <View style={{ borderBottomWidth: 0.5, borderColor: '#000000', paddingVertical: 1.5 }}>
            <Text style={{ fontSize: 6.5 }}>Medicamentos solicitados: <Text style={{ fontWeight: 'bold' }}>{medLabel}</Text></Text>
          </View>

          <View style={{ paddingVertical: 1.5, minHeight: 18 }}>
            <Text style={{ fontSize: 6.5 }}>Observações:</Text>
          </View>

          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <View style={{ width: '70%', borderTopWidth: 0.8, borderColor: '#000000', paddingTop: 2, alignItems: 'center' }}>
              <Text style={{ fontSize: 6, fontWeight: 'bold' }}>Assinatura do(a) profissional responsável pelo recebimento da solicitação</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  );
}

// =========================================================================
// PÁGINA 9 (OU 10): JORNADA DO PACIENTE
// =========================================================================
function PageJornadaDoPaciente({ patient }) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={[styles.pageBorderBox, { padding: 24, justifyContent: 'space-between' }]}>
        <View>
          <Text style={{ fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, textTransform: 'uppercase' }}>
            JORNADA DO PACIENTE
          </Text>

          <Text style={{ fontSize: 9.5, lineHeight: 1.5, marginBottom: 16 }}>
            Senhor (a) <Text style={{ fontWeight: 'bold' }}>{cleanPdfText(patient?.nome)}</Text>
          </Text>

          <Text style={{ fontSize: 9.5, lineHeight: 1.5, marginBottom: 24, textAlign: 'justify' }}>
            para ter acesso o seu MEDICAMENTO, por favor, levar todas as folhas preenchidas pelo seu médico, a receita médica, os exames informados pelo médico e uma cópia dos seus documentos pessoais no local de dispensação dos medicamentos especializados.
          </Text>

          {/* Box de Documentos com Triângulo de Alerta */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 18, gap: 16 }}>
            <WarningTriangle size={46} />
            <View>
              <Text style={{ fontSize: 9.5, fontWeight: 'bold', textDecoration: 'underline', marginBottom: 8 }}>
                RELAÇÃO DE DOCUMENTOS PESSOAIS
              </Text>
              <Text style={{ fontSize: 8.5, marginBottom: 4 }}>( ) CÓPIA DO CPF E CARTEIRA DE IDENTIDADE</Text>
              <Text style={{ fontSize: 8.5, marginBottom: 4 }}>( ) CÓPIA DO COMPROVANTE DE RESIDÊNCIA</Text>
              <Text style={{ fontSize: 8.5 }}>( ) CÓPIA DO CARTÃO NACIONAL DE SAÚDE (CNS)</Text>
            </View>
          </View>
        </View>

        {/* Local de Dispensação e Agendamento */}
        <View style={{ borderTopWidth: 1, borderColor: '#000000', paddingTop: 16 }}>
          <Text style={{ fontSize: 9.5, fontWeight: 'bold', textDecoration: 'underline', textAlign: 'center', marginBottom: 12 }}>
            LOCAL DE DISPENSAÇÃO DO MEDICAMENTO
          </Text>

          <Text style={{ fontSize: 8.5, fontWeight: 'bold', lineHeight: 1.4, marginBottom: 8, textAlign: 'justify' }}>
            ATENÇÃO: Se o Sr(a). reside em um dos municípios pertencentes à Regional de Saúde de Belo Horizonte, deverá agendar o atendimento via internet para protocolar sua solicitação de medicamentos.
          </Text>

          <Text style={{ fontSize: 8.5, marginBottom: 6 }}>
            Site: https://www.mg.gov.br/
          </Text>

          <Text style={{ fontSize: 8.5, marginBottom: 8, lineHeight: 1.3 }}>
            Acesse o Aplicativo MG App &gt; Saúde &gt; Solicitar Medicamentos &gt; Agendar abertura de solicitação de medicamento especializado (Regional de BH)
          </Text>

          <Text style={{ fontSize: 8.5, fontWeight: 'bold', marginBottom: 8 }}>
            Av. Nossa Senhora de Fátima, 2777 - Carlos Prates, Belo Horizonte - MG, 30710-182
          </Text>

          <Text style={{ fontSize: 8.5 }}>
            Qualquer dúvida pode ligar no número:
          </Text>
          <Text style={{ fontSize: 9, fontWeight: 'bold' }}>
            (31) 3244-9400
          </Text>
        </View>
      </View>
    </Page>
  );
}

// =========================================================================
// COMPONENTE PRINCIPAL EXPORTADO: DOSSIÊ COMPLETO FARMÁCIA DE MINAS
// =========================================================================

export default function LmeReportPdf({
  patient = {},
  doctorInfo = {},
  lmeData = {},
  clinicalReportText = ''
}) {
  const medId = lmeData?.medicamentoId || 'alfaepoetina';
  const isAnemia = isAnemiaAgravo(medId);
  const isDmo = isDmoAgravo(medId);

  const officialMedLabel = getMedicamentoOfficialLabel(medId, lmeData?.concentracaoId);
  const enrichedLmeData = {
    ...lmeData,
    medicamentoOficialLabel: officialMedLabel
  };

  const estabelecimento = {
    nome: lmeData?.clinicaNome || patient?.clinica || doctorInfo?.clinicaPrincipal || 'DIALIZE SAUDE',
    cnes: lmeData?.cnes || doctorInfo?.cnes || patient?.cnes || '5920574',
    endereco: lmeData?.clinicaEndereco || 'AV EDMEIA MATTOS LAZZAROTTI 1655',
    bairro: lmeData?.clinicaBairro || 'ANGOLA',
    cep: lmeData?.clinicaCep || '32604155',
    cidade: lmeData?.clinicaCidade || 'BETIM',
    uf: lmeData?.clinicaUf || 'MG',
    telefone: lmeData?.clinicaTelefone || '(31)94510284'
  };

  const dataSolicitacao = lmeData?.dataSolicitacao || new Date().toISOString().split('T')[0];
  const safeTitle = `LME_MG_${(patient?.nome || 'Paciente').replace(/\s+/g, '_')}_${medId.toUpperCase()}`;

  return (
    <Document title={safeTitle}>
      {/* 1. Orientações Básicas */}
      <PageOrientacoesBasicas isDmo={isDmo} />

      {/* 2. Relação de Documentos e Exames (Checklist do Agravo) */}
      <PageRelacaoDocumentosExames isAnemia={isAnemia} isDmo={isDmo} dataEmissao={dataSolicitacao} />

      {/* 3. Laudo Oficial LME 23 Campos (SUS / Ministério da Saúde / SES-MG) */}
      <PageLmeNacional23Campos 
        patient={patient} 
        doctorInfo={doctorInfo} 
        lmeData={enrichedLmeData} 
        estabelecimento={estabelecimento} 
        dataSolicitacao={dataSolicitacao} 
      />

      {/* 4 / 4-5. Formulário Específico SES-MG */}
      {isAnemia && (
        <PageFormularioAlfaepoetina 
          patient={patient} 
          doctorInfo={doctorInfo} 
          lmeData={enrichedLmeData} 
          estabelecimento={estabelecimento} 
          dataSolicitacao={dataSolicitacao} 
        />
      )}

      {isDmo && (
        <>
          <PageFormularioDMO1 
            patient={patient} 
            lmeData={enrichedLmeData} 
          />
          <PageFormularioDMO2 
            lmeData={enrichedLmeData} 
            dataSolicitacao={dataSolicitacao} 
          />
        </>
      )}

      {/* 5 (ou 6). Requerimento de Medicamento(s) do CEAF */}
      <PageRequerimentoCEAF 
        patient={patient} 
        lmeData={enrichedLmeData} 
      />

      {/* 6 & 7 (ou 7 & 8). Receituário Simples (1ª e 2ª Via Obrigatória do SUS) */}
      <PageReceituarioSimples 
        patient={patient} 
        doctorInfo={doctorInfo} 
        lmeData={enrichedLmeData} 
        estabelecimento={estabelecimento} 
        dataEmissao={dataSolicitacao} 
        viaNumero={1} 
      />
      <PageReceituarioSimples 
        patient={patient} 
        doctorInfo={doctorInfo} 
        lmeData={enrichedLmeData} 
        estabelecimento={estabelecimento} 
        dataEmissao={dataSolicitacao} 
        viaNumero={2} 
      />

      {/* 8 (ou 9). Termo de Adesão para Solicitação de Medicamentos do CEAF */}
      <PageTermoAdesaoCEAF 
        patient={patient} 
        lmeData={enrichedLmeData} 
      />

      {/* 9 (ou 10). Jornada do Paciente */}
      <PageJornadaDoPaciente 
        patient={patient} 
      />
    </Document>
  );
}
