import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Modelo de Receituário Médico Padrão Brasileiro
 * Simples, limpo, elegante e estritamente calibrado para 1 única folha A4.
 */
export default function PrescriptionPrintDocument({
  prescription,
  patient,
  doctorInfo,
  currentVia = 1 // 1 ou 2
}) {
  if (!prescription || !patient) return null;

  const doctorName = prescription.medico?.nome || doctorInfo?.nome || 'Dr(a). Médico(a) Responsável';
  const doctorCrm = prescription.medico?.crm || doctorInfo?.crm || '------';
  const doctorUf = prescription.medico?.ufCrm || doctorInfo?.ufCrm || 'SP';
  const doctorRqe = prescription.medico?.rqe || doctorInfo?.rqe || '';
  const doctorEspecialidade = prescription.medico?.especialidade || doctorInfo?.especialidade || 'Nefrologia Clínica & Hemodiálise';
  const doctorClinica = prescription.medico?.clinica || doctorInfo?.clinicaPrincipal || patient.clinica || 'Clínica Nefrológica';
  const doctorEndereco = prescription.medico?.endereco || doctorInfo?.endereco || '';
  const doctorTelefone = prescription.medico?.telefone || doctorInfo?.telefone || '';

  const tipoReceita = prescription.tipoReceita || 'simples';
  const isControleEspecial = tipoReceita === 'controle_especial';
  const isAntimicrobiano = tipoReceita === 'antimicrobiano';
  const itens = Array.isArray(prescription.itens) ? prescription.itens : [];

  const dataEmissaoObj = prescription.dataEmissao ? new Date(prescription.dataEmissao + 'T12:00:00') : new Date();
  const dataFormatada = dataEmissaoObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const getTituloDocumento = () => {
    switch (tipoReceita) {
      case 'controle_especial':
        return 'RECEITUÁRIO DE CONTROLE ESPECIAL';
      case 'antimicrobiano':
        return 'RECEITUÁRIO DE ANTIMICROBIANOS';
      case 'alto_custo':
        return 'RECEITA MÉDICA - COMPONENTE ESPECIALIZADO (LME)';
      default:
        return 'RECEITUÁRIO MÉDICO';
    }
  };

  const getSubtituloVia = () => {
    if (isControleEspecial || isAntimicrobiano) {
      return currentVia === 1 ? '1ª VIA - RETENÇÃO DA FARMÁCIA' : '2ª VIA - ORIENTAÇÃO DO PACIENTE';
    }
    return null;
  };

  // Determina cidade para rodapé
  const cidadeEmissao = doctorClinica.includes('Betim') || doctorEndereco.includes('Betim') 
    ? 'Betim - MG' 
    : (doctorClinica.includes('São Paulo') || !doctorEndereco ? 'São Paulo - SP' : doctorEndereco.split('-')[0].trim());

  return (
    <div 
      className="prescription-a4-sheet" 
      style={{
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto',
        padding: '24px 32px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: '13px',
        lineHeight: 1.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box'
      }}
    >
      {/* ================= TOPO DO RECEITUÁRIO ================= */}
      <div>
        {/* Cabeçalho do Médico (Timbrado Limpo Padrão CFM) */}
        <header className="text-center pb-3 mb-3 border-b-2" style={{ borderColor: '#334155' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'uppercase', margin: 0 }}>
            {doctorName}
          </h1>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2563eb', margin: '3px 0 0 0' }}>
            {doctorEspecialidade}
          </p>
          <p style={{ fontSize: '0.82rem', color: '#475569', margin: '2px 0 0 0', fontWeight: 500 }}>
            CRM-{doctorUf} {doctorCrm} {doctorRqe && `• RQE ${doctorRqe}`}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
            {doctorClinica} {doctorEndereco && `• ${doctorEndereco}`} {doctorTelefone && `• Tel: ${doctorTelefone}`}
          </p>
        </header>

        {/* Linha de Identificação do Paciente */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '6px', borderBottom: '1px solid #cbd5e1', marginBottom: '12px', fontSize: '0.9rem' }}>
          <div>
            <span style={{ color: '#64748b' }}>Paciente: </span>
            <strong style={{ color: '#0f172a', fontSize: '0.98rem' }}>{patient.nome}</strong>
            {patient.idade && <span style={{ color: '#64748b', fontSize: '0.82rem' }}> ({patient.idade} anos)</span>}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.84rem' }}>
            Data: <strong style={{ color: '#0f172a' }}>{dataEmissaoObj.toLocaleDateString('pt-BR')}</strong>
          </div>
        </div>

        {/* Alerta Discreto de Alergias */}
        {prescription.incluirAlergias !== false && Array.isArray(patient.alergias) && patient.alergias.length > 0 && (
          <div style={{ padding: '3px 0', marginBottom: '8px', fontSize: '0.78rem', color: '#b91c1c', fontStyle: 'italic' }}>
            * Alergias relatadas: <strong>{patient.alergias.join(', ')}</strong>
          </div>
        )}

        {/* Título do Tipo de Receita */}
        <div style={{ textAlign: 'center', margin: '10px 0 16px 0' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f172a', margin: 0 }}>
            {getTituloDocumento()}
          </h2>
          {getSubtituloVia() && (
            <span style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', border: '1px solid #cbd5e1' }}>
              {getSubtituloVia()}
            </span>
          )}
        </div>

        {/* ================= CORPO: MEDICAMENTOS PRESCRITOS ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '14px 0' }}>
          {itens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontStyle: 'italic' }}>
              Nenhum medicamento prescrito.
            </div>
          ) : (
            itens.map((item, idx) => (
              <div key={item.id || idx} style={{ paddingLeft: '4px' }}>
                {/* Linha 1: Nome do Medicamento e Quantidade */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>
                    <span>{idx + 1}. </span>
                    <span>{item.medicamento || item.nome}</span>
                  </div>
                  {item.quantidade && (
                    <div style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 600, flexShrink: 0, marginLeft: '12px' }}>
                      -------------------- {item.quantidade}
                    </div>
                  )}
                </div>

                {/* Linha 2: Posologia e Modo de Usar */}
                <div style={{ paddingLeft: '18px', fontSize: '0.88rem', color: '#1e293b', marginTop: '2px', lineHeight: 1.4 }}>
                  {item.via && <strong style={{ color: '#2563eb' }}>[{item.via}] </strong>}
                  <span>{item.posologia}</span>
                </div>

                {/* Linha 3: Instrução adicional (se houver) */}
                {item.instrucoesAdicionais && (
                  <div style={{ paddingLeft: '18px', fontSize: '0.78rem', color: '#475569', fontStyle: 'italic', marginTop: '1px' }}>
                    Obs: {item.instrucoesAdicionais}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Orientações e Recomendações Gerais */}
        {prescription.observacoesGerais && (
          <div style={{ marginTop: '16px', padding: '8px 0', borderTop: '1px dashed #cbd5e1', fontSize: '0.82rem', color: '#334155' }}>
            <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '3px' }}>
              Orientações Médicas:
            </strong>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{prescription.observacoesGerais}</p>
          </div>
        )}
      </div>

      {/* ================= RODAPÉ DO RECEITUÁRIO ================= */}
      <div>
        {/* Bloco Exclusivo Controle Especial (1ª Via - Farmácia) */}
        {isControleEspecial && currentVia === 1 && (
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', marginBottom: '16px', fontSize: '0.72rem', background: '#f8fafc', color: '#334155', lineHeight: 1.3 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '12px' }}>
                <strong style={{ display: 'block', textTransform: 'uppercase', marginBottom: '4px', color: '#0f172a' }}>Identificação do Comprador</strong>
                <div>Nome: ____________________________________________________</div>
                <div style={{ marginTop: '2px' }}>RG: ________________ Órgão: _______ CPF: ____________________</div>
                <div style={{ marginTop: '2px' }}>End: _____________________________________ Tel: _____________</div>
                <div style={{ marginTop: '6px', textAlign: 'center' }}>Assinatura: ___________________________________</div>
              </div>
              <div>
                <strong style={{ display: 'block', textTransform: 'uppercase', marginBottom: '4px', color: '#0f172a' }}>Identificação do Fornecedor</strong>
                <div>Farmácia / Razão Social: _________________________________</div>
                <div style={{ marginTop: '2px' }}>Farmacêutico: _________________________ CRF: _______________</div>
                <div style={{ marginTop: '2px' }}>Data: ____/____/________ Lote: __________ Qtd Disp: __________</div>
                <div style={{ marginTop: '6px', textAlign: 'center' }}>Visto do Farmacêutico: __________________________</div>
              </div>
            </div>
          </div>
        )}

        {/* Local, Data e Assinatura Médica */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>
              {cidadeEmissao}, {dataFormatada}
            </p>
            <p style={{ margin: '3px 0 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>
              Receita Nº {prescription.numeroReceita || prescription.id?.slice(-8).toUpperCase()}
            </p>
          </div>

          <div style={{ textAlign: 'center', minWidth: '220px' }}>
            <div style={{ borderBottom: '1px solid #0f172a', width: '100%', marginBottom: '6px' }}></div>
            <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a' }}>{doctorName}</strong>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#475569' }}>{doctorEspecialidade}</span>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>CRM-{doctorUf} {doctorCrm}</span>
          </div>
        </div>

        {/* Rodapé Institucional Discreto */}
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.68rem', color: '#94a3b8', borderTop: '1px dotted #e2e8f0', paddingTop: '4px' }}>
          {doctorClinica} {doctorTelefone && `• Tel: ${doctorTelefone}`} • NexAi-NEFRO Prontuário em Nuvem
        </div>
      </div>
    </div>
  );
}
