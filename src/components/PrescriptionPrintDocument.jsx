import React from 'react';
import { safeFormatDateExtenso } from '../utils/dateUtils';

/**
 * Modelo de Receituário Médico Padrão Brasileiro
 * Padronizado exatamente com o formato do PDF (Baixar PDF).
 * Calibrado com alta fidelidade para visualização em tela e impressão A4.
 */
export default function PrescriptionPrintDocument({
  prescription,
  patient,
  doctorInfo,
  currentVia = 1 // 1 ou 2
}) {
  if (!prescription || !patient) return null;

  const docInfo = prescription.medico || doctorInfo || {};
  const doctorName = docInfo.nome || 'Dr(a). Médico(a) Responsável';
  const doctorUf = docInfo.ufCrm || 'SP';
  const doctorCrm = docInfo.crm ? `CRM-${doctorUf} ${docInfo.crm}` : 'CRM/SP';
  const doctorRqe = docInfo.rqe ? ` • RQE ${docInfo.rqe}` : '';
  const doctorEspecialidade = docInfo.especialidade || docInfo.titulo || 'Nefrologia Clínica e Hemodiálise';
  const clinicaNome = docInfo.clinica || docInfo.clinicaPrincipal || patient.clinica || 'Clínica de Nefrologia';
  const enderecoClinica = docInfo.endereco || (patient.clinica ? `${patient.clinica}` : 'São Paulo - SP');

  const tipoReceita = prescription.tipoReceita || 'simples';
  const isControleEspecial = tipoReceita === 'controle_especial';
  const isAntimicrobiano = tipoReceita === 'antimicrobiano';
  const itens = Array.isArray(prescription.itens) ? prescription.itens : [];

  const dataFormatada = safeFormatDateExtenso(prescription.dataEmissao);

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

  // Limpa possíveis repetições de nomes de medicamentos
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
        padding: '24px 32px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, 'Inter', sans-serif",
        fontSize: '11px',
        lineHeight: 1.4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '840px',
        boxSizing: 'border-box'
      }}
    >
      <div>
        {/* ================= CABEÇALHO DA CLÍNICA ================= */}
        <div style={{ borderBottom: '2px solid #1e3a8a', paddingBottom: '8px', marginBottom: '12px' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e3a8a', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            {clinicaNome}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
            {enderecoClinica} • {doctorEspecialidade}
          </div>
        </div>

        {/* ================= TÍTULO DO DOCUMENTO ================= */}
        <div style={{ textAlign: 'center', marginTop: '6px', marginBottom: '10px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', letterSpacing: '0.6px', textTransform: 'uppercase', margin: 0 }}>
            {getTituloDocumento()}
          </h2>
          {getSubtituloVia() && (
            <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#dc2626', marginTop: '3px' }}>
              {getSubtituloVia()}
            </div>
          )}
        </div>

        {/* ================= DADOS DO PACIENTE ================= */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '5px', padding: '8px 12px', marginBottom: '14px', fontSize: '0.80rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
            <div>
              <span style={{ color: '#64748b' }}>Paciente: </span>
              <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{patient.nome}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Data: </span>
              <strong style={{ color: '#0f172a' }}>{dataFormatada}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#64748b' }}>CPF: </span>
              <strong style={{ color: '#0f172a' }}>{patient.cpf || 'Não informado'}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Idade / Sexo: </span>
              <strong style={{ color: '#0f172a' }}>{patient.idade ? `${patient.idade} anos` : '--'} / {patient.sexo || '--'}</strong>
            </div>
          </div>
          {patient.endereco && (
            <div style={{ marginTop: '3px' }}>
              <span style={{ color: '#64748b' }}>Endereço: </span>
              <strong style={{ color: '#0f172a' }}>{patient.endereco}</strong>
            </div>
          )}
          {prescription.incluirAlergias !== false && Array.isArray(patient.alergias) && patient.alergias.length > 0 && (
            <div style={{ marginTop: '3px', color: '#b91c1c', fontSize: '0.72rem', fontStyle: 'italic' }}>
              * Alergias relatadas: <strong>{patient.alergias.join(', ')}</strong>
            </div>
          )}
        </div>

        {/* ================= LISTA DE MEDICAMENTOS ================= */}
        <div style={{ minHeight: '260px', marginBottom: '12px' }}>
          {itens.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.82rem' }}>
              Nenhum medicamento prescrito nesta receita.
            </div>
          ) : (
            itens.map((it, idx) => {
              const medName = cleanMedicationName(it.medicamento || it.nome || 'Medicamento não especificado');
              const posologia = it.via 
                ? `[${it.via}] ${it.posologia || 'Conforme orientação médica'}` 
                : (it.posologia || 'Conforme orientação médica');
              const obs = it.instrucoesAdicionais || it.orientacoes || '';

              return (
                <div key={it.id || idx} style={{ marginBottom: '10px', paddingBottom: '6px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '0.90rem', fontWeight: '800', color: '#1e3a8a' }}>{idx + 1}.</span>
                      <strong style={{ fontSize: '0.90rem', color: '#0f172a' }}>{medName}</strong>
                    </div>
                    {it.quantidade && (
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#2563eb', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2px 7px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                        {it.quantidade}
                      </span>
                    )}
                  </div>
                  <div style={{ paddingLeft: '14px', fontSize: '0.80rem', color: '#334155', lineHeight: 1.35 }}>
                    Uso: {posologia}
                  </div>
                  {obs && (
                    <div style={{ paddingLeft: '14px', fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>
                      Obs: {obs}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ================= ORIENTAÇÕES MÉDICAS ================= */}
        {prescription.observacoesGerais && (
          <div style={{ marginTop: '8px', marginBottom: '10px', paddingTop: '6px', borderTop: '0.5px solid #cbd5e1', fontSize: '0.80rem' }}>
            <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '2px' }}>
              Orientações Médicas:
            </strong>
            <p style={{ margin: 0, color: '#334155', lineHeight: 1.35, whiteSpace: 'pre-wrap' }}>
              {prescription.observacoesGerais}
            </p>
          </div>
        )}

        {/* ================= BLOCO DE DUAS VIAS (FARMÁCIA) ================= */}
        {(isControleEspecial || isAntimicrobiano) && currentVia === 1 && (
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '6px 10px', marginBottom: '12px', fontSize: '0.68rem', background: '#ffffff', color: '#334155', lineHeight: 1.25 }}>
            <div style={{ textAlign: 'center', fontWeight: '700', textTransform: 'uppercase', color: '#334155', borderBottom: '0.5px solid #e2e8f0', paddingBottom: '2px', marginBottom: '4px' }}>
              Identificação do Comprador (Preenchimento da Farmácia)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <div>Comprador: _____________________________________</div>
                <div style={{ marginTop: '3px' }}>RG / Órgão: __________________ Tel: _____________</div>
                <div style={{ marginTop: '3px' }}>Endereço: ______________________________________</div>
              </div>
              <div>
                <div>Farmacêutico(a): _______________________________</div>
                <div style={{ marginTop: '3px' }}>CRF: ________________ Assinatura: _______________</div>
                <div style={{ marginTop: '3px' }}>Data de Dispensação: _____ / _____ / 202___</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        {/* ================= SEÇÃO DE ASSINATURA ================= */}
        <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <div style={{ width: '220px', margin: '0 auto 4px auto', borderTop: '1px solid #0f172a' }}></div>
          <strong style={{ display: 'block', fontSize: '0.88rem', color: '#0f172a' }}>{doctorName}</strong>
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginTop: '1px' }}>
            {doctorEspecialidade} • {doctorCrm}{doctorRqe}
          </span>
        </div>

        {/* ================= RODAPÉ ================= */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '0.5px solid #e2e8f0', paddingTop: '6px', marginTop: '10px', fontSize: '0.68rem', color: '#94a3b8' }}>
          <span>Nex-Ai.NEFRO • Prontuário Eletrônico em Nuvem</span>
          <span>Documento Médico Oficial • Emissão Digital</span>
        </div>
      </div>
    </div>
  );
}
