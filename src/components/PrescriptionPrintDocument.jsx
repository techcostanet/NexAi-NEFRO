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

  // Limpa possíveis repetições de nomes de medicamentos (ex: Zolpidem Zolpidem)
  const cleanMedicationName = (name) => {
    if (!name) return '';
    const trimmed = name.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) {
      return parts[0];
    }
    return trimmed;
  };

  return (
    <div 
      className="prescription-a4-sheet" 
      style={{
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto',
        padding: '16px 24px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: '12px',
        lineHeight: 1.45,
        display: 'block',
        boxSizing: 'border-box'
      }}
    >
      {/* ================= TOPO DO RECEITUÁRIO ================= */}
      <div className="prescription-top-section">
        {/* Cabeçalho do Médico (Timbrado Limpo Padrão CFM) */}
        <div className="prescription-header text-center pb-2.5 mb-2.5 border-b" style={{ borderColor: '#cbd5e1' }}>
          <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em', textTransform: 'uppercase', margin: 0 }}>
            {doctorName}
          </h1>
          <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2563eb', margin: '2px 0 0 0' }}>
            {doctorEspecialidade}
          </p>
          <p style={{ fontSize: '0.78rem', color: '#475569', margin: '1px 0 0 0', fontWeight: 500 }}>
            CRM-{doctorUf} {doctorCrm} {doctorRqe && `• RQE ${doctorRqe}`}
          </p>
          <p style={{ fontSize: '0.72rem', color: '#64748b', margin: '1px 0 0 0' }}>
            {doctorClinica} {doctorEndereco && `• ${doctorEndereco}`} {doctorTelefone && `• Tel: ${doctorTelefone}`}
          </p>
        </div>

        {/* Linha de Identificação do Paciente */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0', marginBottom: '10px', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: '#64748b' }}>Paciente: </span>
            <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>{patient.nome}</strong>
            {patient.idade && <span style={{ color: '#64748b', fontSize: '0.75rem' }}> ({patient.idade} anos)</span>}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
            Data: <strong style={{ color: '#0f172a' }}>{dataEmissaoObj.toLocaleDateString('pt-BR')}</strong>
          </div>
        </div>

        {/* Alerta Discreto de Alergias */}
        {prescription.incluirAlergias !== false && Array.isArray(patient.alergias) && patient.alergias.length > 0 && (
          <div style={{ padding: '2px 0', marginBottom: '6px', fontSize: '0.72rem', color: '#b91c1c', fontStyle: 'italic' }}>
            * Alergias relatadas: <strong>{patient.alergias.join(', ')}</strong>
          </div>
        )}

        {/* Título do Tipo de Receita */}
        <div style={{ textAlign: 'center', margin: '8px 0 12px 0' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0f172a', margin: 0 }}>
            {getTituloDocumento()}
          </h2>
          {getSubtituloVia() && (
            <span style={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 600, background: '#f1f5f9', color: '#334155', padding: '1px 6px', borderRadius: '4px', marginTop: '3px', border: '1px solid #cbd5e1' }}>
              {getSubtituloVia()}
            </span>
          )}
        </div>

        {/* ================= CORPO: MEDICAMENTOS PRESCRITOS ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0' }}>
          {itens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
              Nenhum medicamento prescrito.
            </div>
          ) : (
            itens.map((item, idx) => (
              <div key={item.id || idx} style={{ paddingLeft: '2px' }}>
                {/* Linha 1: Nome do Medicamento e Quantidade */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>
                    <span>{idx + 1}. </span>
                    <span>{cleanMedicationName(item.medicamento || item.nome)}</span>
                  </div>
                  {item.quantidade && (
                    <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600, flexShrink: 0, marginLeft: '8px' }}>
                      -------------------- {item.quantidade}
                    </div>
                  )}
                </div>

                {/* Linha 2: Posologia e Modo de Usar */}
                <div style={{ paddingLeft: '14px', fontSize: '0.8rem', color: '#1e293b', marginTop: '1px', lineHeight: 1.35 }}>
                  {item.via && <strong style={{ color: '#2563eb' }}>[{item.via}] </strong>}
                  <span>{item.posologia}</span>
                </div>

                {/* Linha 3: Instrução adicional (se houver) */}
                {item.instrucoesAdicionais && (
                  <div style={{ paddingLeft: '14px', fontSize: '0.72rem', color: '#475569', fontStyle: 'italic', marginTop: '1px' }}>
                    Obs: {item.instrucoesAdicionais}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Orientações e Recomendações Gerais */}
        {prescription.observacoesGerais && (
          <div style={{ marginTop: '12px', padding: '6px 0', borderTop: '1px dashed #cbd5e1', fontSize: '0.78rem', color: '#334155' }}>
            <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '2px' }}>
              Orientações Médicas:
            </strong>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.35 }}>{prescription.observacoesGerais}</p>
          </div>
        )}
      </div>

      {/* ================= RODAPÉ DO RECEITUÁRIO ================= */}
      <div className="prescription-bottom-section" style={{ marginTop: '24px' }}>
        {/* Bloco Exclusivo Controle Especial (1ª Via - Farmácia) */}
        {isControleEspecial && currentVia === 1 && (
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', marginBottom: '14px', fontSize: '0.68rem', background: '#f8fafc', color: '#334155', lineHeight: 1.25 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '10px' }}>
                <strong style={{ display: 'block', textTransform: 'uppercase', marginBottom: '3px', color: '#0f172a' }}>Identificação do Comprador</strong>
                <div>Nome: ____________________________________________________</div>
                <div style={{ marginTop: '2px' }}>RG: ________________ Órgão: _______ CPF: ____________________</div>
                <div style={{ marginTop: '2px' }}>End: _____________________________________ Tel: _____________</div>
                <div style={{ marginTop: '4px', textAlign: 'center' }}>Assinatura: ___________________________________</div>
              </div>
              <div>
                <strong style={{ display: 'block', textTransform: 'uppercase', marginBottom: '3px', color: '#0f172a' }}>Identificação do Fornecedor</strong>
                <div>Farmácia / Razão Social: _________________________________</div>
                <div style={{ marginTop: '2px' }}>Farmacêutico: _________________________ CRF: _______________</div>
                <div style={{ marginTop: '2px' }}>Data: ____/____/________ Lote: __________ Qtd Disp: __________</div>
                <div style={{ marginTop: '4px', textAlign: 'center' }}>Visto do Farmacêutico: __________________________</div>
              </div>
            </div>
          </div>
        )}

        {/* Local, Data e Assinatura Médica */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>
              {cidadeEmissao}, {dataFormatada}
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.68rem', color: '#94a3b8' }}>
              Receita Nº {prescription.numeroReceita || prescription.id?.slice(-8).toUpperCase()}
            </p>
          </div>

          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            <div style={{ borderBottom: '1px solid #0f172a', width: '100%', marginBottom: '4px' }}></div>
            <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a' }}>{doctorName}</strong>
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#475569' }}>{doctorEspecialidade}</span>
            <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b' }}>CRM-{doctorUf} {doctorCrm}</span>
          </div>
        </div>

        {/* Rodapé Institucional Discreto */}
        <div className="prescription-footer" style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.65rem', color: '#94a3b8', borderTop: '1px dotted #e2e8f0', paddingTop: '3px' }}>
          {doctorClinica} {doctorTelefone && `• Tel: ${doctorTelefone}`} • NexAi-NEFRO Prontuário em Nuvem
        </div>
      </div>
    </div>
  );
}
