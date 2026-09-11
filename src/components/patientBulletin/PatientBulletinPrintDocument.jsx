import React from 'react';
import { 
  Trophy, 
  Sparkles, 
  Heart, 
  Droplet, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  HeartHandshake
} from 'lucide-react';
import { GOAL_STATUS } from '../../services/patientEducationService';

/**
 * 📄 DOCUMENTO IMPRESSO OFICIAL: BOLETIM DE CONQUISTAS & METAS DE SAÚDE DO PACIENTE
 * Calibrado com precisão para 1 ÚNICA FOLHA A4 COLORIDA, legível para todas as idades.
 */
export default function PatientBulletinPrintDocument({
  bulletinData,
  doctorInfo,
  customNote = ''
}) {
  if (!bulletinData) return null;

  const {
    pacienteNome,
    dataReferencia,
    totalMetas,
    metasBatidas,
    taxaSucesso,
    tituloPlacar,
    mensagemGeral,
    cards = []
  } = bulletinData;

  const doctorName = doctorInfo?.nome || 'Dr(a). Médico(a) Responsável';
  const doctorCrm = doctorInfo?.crm ? `CRM-${doctorInfo?.ufCrm || 'MG'} ${doctorInfo?.crm}` : 'Nefrologista Responsável';
  const doctorClinica = doctorInfo?.clinicaPrincipal || 'Clínica de Nefrologia & Hemodiálise';

  const dataObj = dataReferencia ? new Date(dataReferencia + 'T12:00:00') : new Date();
  const mesAnoExtenso = dataObj.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const mesFormatado = mesAnoExtenso.charAt(0).toUpperCase() + mesAnoExtenso.slice(1);

  // Mapeia ícones por string
  const renderIcon = (iconName, color) => {
    const props = { size: 16, color };
    switch (iconName) {
      case 'Droplet': return <Droplet {...props} />;
      case 'Heart': return <Heart {...props} />;
      case 'ShieldCheck': return <ShieldCheck {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Award': return <Award {...props} />;
      default: return <Activity {...props} />;
    }
  };

  return (
    <div className="printable-patient-bulletin-area">
      <div className="patient-bulletin-a4-sheet" style={{
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: '#1e293b',
        background: '#ffffff',
        width: '100%',
        maxWidth: '740px',
        margin: '0 auto',
        padding: '12px 18px',
        boxSizing: 'border-box'
      }}>
        
        {/* ================= CABEÇALHO DO BOLETIM ================= */}
        <div style={{
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '8px',
          marginBottom: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e40af', letterSpacing: '0.5px' }}>
                {doctorClinica.toUpperCase()}
              </span>
              <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '8px', fontWeight: 'bold' }}>
                Boletim Nefrológico
              </span>
            </div>
            <h1 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.3px' }}>
              Boletim de Saúde & Conquistas
            </h1>
            <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
              Paciente: <strong style={{ color: '#0f172a', fontSize: '13px' }}>{pacienteNome}</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>
              {mesFormatado}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              Resp: <strong>{doctorName}</strong>
            </div>
            <div style={{ fontSize: '9px', color: '#94a3b8' }}>
              {doctorCrm}
            </div>
          </div>
        </div>

        {/* ================= BANNER PLACAR DE CONQUISTAS ================= */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '8px 12px',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            background: '#3b82f6',
            color: '#ffffff',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
          }}>
            <Trophy size={20} color="#ffffff" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '12px', color: '#1e40af' }}>
                {tituloPlacar}
              </strong>
              <span style={{
                fontSize: '11px',
                fontWeight: '800',
                color: taxaSucesso >= 70 ? '#15803d' : '#b45309',
                background: taxaSucesso >= 70 ? '#dcfce7' : '#fef3c7',
                padding: '2px 8px',
                borderRadius: '10px'
              }}>
                🌟 {metasBatidas} de {totalMetas} Metas Batidas ({taxaSucesso}%)
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '10.5px', color: '#334155', lineHeight: '1.35' }}>
              {mensagemGeral}
            </p>
          </div>
        </div>

        {/* ================= GRADE DE EXAMES E DICAS (2 COLUNAS) ================= */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '7px',
          marginBottom: '8px'
        }}>
          {cards.map(card => {
            const isConquista = card.status === GOAL_STATUS.CONQUISTA;
            const isQuaseLa = card.status === GOAL_STATUS.QUASE_LA;

            const bgCard = isConquista ? '#f8fafc' : (isQuaseLa ? '#fffbeb' : '#fef2f2');
            const borderCard = isConquista ? '#e2e8f0' : (isQuaseLa ? '#fde68a' : '#fecaca');
            const badgeBg = isConquista ? '#ecfdf5' : (isQuaseLa ? '#fef3c7' : '#fee2e2');
            const badgeColor = isConquista ? '#166534' : (isQuaseLa ? '#92400e' : '#991b1b');
            const badgeText = isConquista ? '🟢 Conquista!' : (isQuaseLa ? '🟡 Quase Lá!' : '🔴 Atenção');

            return (
              <div 
                key={card.id}
                style={{
                  background: bgCard,
                  border: `1px solid ${borderCard}`,
                  borderRadius: '8px',
                  padding: '7px 9px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  breakInside: 'avoid',
                  pageBreakInside: 'avoid'
                }}
              >
                {/* Linha 1: Título, Ícone e Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {renderIcon(card.icone, card.corPrimaria)}
                    <div>
                      <strong style={{ fontSize: '11px', color: '#0f172a', display: 'block', lineHeight: '1.1' }}>
                        {card.categoria}
                      </strong>
                      <span style={{ fontSize: '9px', color: '#64748b' }}>
                        {card.subtitulo}
                      </span>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: '700',
                    background: badgeBg,
                    color: badgeColor,
                    padding: '1px 6px',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap'
                  }}>
                    {badgeText}
                  </span>
                </div>

                {/* Linha 2: Valor Atual e Faixa Meta */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  background: 'rgba(255, 255, 255, 0.7)',
                  padding: '2px 6px',
                  borderRadius: '5px',
                  marginTop: '1px'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: isConquista ? '#0f172a' : '#b45309' }}>
                    Resultado: {card.valorFormatado}
                  </span>
                  <span style={{ fontSize: '8.5px', color: '#64748b', fontStyle: 'italic' }}>
                    {card.faixaMeta}
                  </span>
                </div>

                {/* Linha 3: Mensagem Humanizada */}
                <p style={{ margin: '0', fontSize: '9.5px', color: '#334155', lineHeight: '1.25' }}>
                  "{card.mensagem}"
                </p>

                {/* Linha 4: Dica de Ouro */}
                <div style={{
                  background: 'rgba(254, 240, 138, 0.25)',
                  borderLeft: '2px solid #eab308',
                  padding: '2px 5px',
                  fontSize: '9px',
                  color: '#713f12',
                  lineHeight: '1.2',
                  borderRadius: '0 4px 4px 0'
                }}>
                  <strong>💡 Dica de Ouro:</strong> {card.dica}
                </div>
              </div>
            );
          })}
        </div>

        {/* ================= RECADINHO ESPECIAL DA EQUIPE ================= */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '6px 10px',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
            <HeartHandshake size={14} color="#2563eb" />
            <strong style={{ fontSize: '10.5px', color: '#1e40af' }}>
              Recadinho Especial da Sua Equipe de Nefrologia:
            </strong>
          </div>
          <p style={{
            margin: '0',
            fontSize: '9.5px',
            color: '#334155',
            lineHeight: '1.3',
            fontStyle: 'italic'
          }}>
            {customNote || `"${pacienteNome.split(' ')[0]}, cada pequeno cuidado no seu dia a dia faz uma enorme diferença na sua qualidade de vida e no seu bem-estar. Toda a nossa equipe se orgulha da sua dedicação. Conte sempre com a gente!"`}
          </p>
        </div>

        {/* ================= RODAPÉ INSTITUCIONAL & ASSINATURA ================= */}
        <div style={{
          borderTop: '1px dashed #cbd5e1',
          paddingTop: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '9px',
          color: '#64748b'
        }}>
          <div>
            <span>Emitido em: <strong>{new Date().toLocaleDateString('pt-BR')}</strong> • NexAi-NEFRO</span>
            <span style={{ display: 'block', color: '#94a3b8', fontSize: '8px' }}>
              Este boletim é um material educativo de apoio e reforço positivo ao tratamento.
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontWeight: '700', color: '#1e293b' }}>
              {doctorName}
            </span>
            <span style={{ fontSize: '8.5px', color: '#64748b' }}>
              {doctorCrm} • Nefrologia
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
