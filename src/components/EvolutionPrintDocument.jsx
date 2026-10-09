import React from 'react';
import { safeFormatDate } from '../utils/dateUtils';

/**
 * Documento de Impressão A4 de Evolução Médica de Hemodiálise
 * Padronizado para prontuário físico e auditorias clínicas (RDC 11 ANVISA / SBN).
 */
export default function EvolutionPrintDocument({
  evolution,
  patient,
  doctorInfo
}) {
  if (!evolution || !patient) return null;

  const docInfo = doctorInfo || {};
  const doctorName = evolution.medicoNome || docInfo.nome || 'Médico(a) Responsável';
  const doctorCrm = evolution.medicoCrm || (docInfo.crm ? `CRM-${docInfo.ufCrm || 'SP'} ${docInfo.crm}` : 'CRM/SP');
  const doctorRqe = docInfo.rqe ? ` • RQE ${docInfo.rqe}` : '';
  const doctorEspecialidade = docInfo.especialidade || docInfo.titulo || 'Médico Nefrologista';
  const clinicaNome = docInfo.clinicaPrincipal || patient.clinica || 'Clínica de Nefrologia & Diálise';
  const enderecoClinica = docInfo.endereco || patient.clinica || 'Unidade de Hemodiálise';

  const dataHoraEvo = evolution.dataHora ? safeFormatDate(evolution.dataHora) : safeFormatDate(new Date().toISOString());

  return (
    <div 
      className="evolution-a4-sheet" 
      style={{
        width: '100%',
        maxWidth: '750px',
        margin: '0 auto',
        padding: '24px 32px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        fontSize: '11px',
        lineHeight: 1.45,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '1020px',
        boxSizing: 'border-box'
      }}
    >
      <div>
        {/* Cabeçalho da Clínica */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #2563eb',
          paddingBottom: '12px',
          marginBottom: '14px'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e3a8a', letterSpacing: '-0.02em' }}>
              {clinicaNome}
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '10px', color: '#64748b' }}>
              Serviço Especializado de Nefrologia e Hemodiálise Crônica • {enderecoClinica}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block',
              background: '#eff6ff',
              color: '#1d4ed8',
              fontWeight: '700',
              fontSize: '10px',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #bfdbfe'
            }}>
              PRONTUÁRIO CLÍNICO
            </span>
            <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '3px' }}>
              RDC Nº 11/2014 • SBN
            </div>
          </div>
        </div>

        {/* Título do Documento */}
        <div style={{ textAlign: 'center', margin: '8px 0 14px' }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a' }}>
            Evolução Médica - {evolution.tipoAtendimento || 'Hemodiálise'}
          </h2>
          <span style={{ fontSize: '10px', color: '#64748b' }}>
            Data e Hora do Atendimento: <strong>{dataHoraEvo}</strong>
          </span>
        </div>

        {/* Box de Identificação do Paciente */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '6px' }}>
            <div>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Paciente</span>
              <div style={{ fontWeight: '700', fontSize: '12px', color: '#0f172a' }}>{patient.nome}</div>
            </div>
            <div>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>CPF</span>
              <div style={{ fontWeight: '600' }}>{patient.cpf || 'Não informado'}</div>
            </div>
            <div>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Idade / Sexo</span>
              <div style={{ fontWeight: '600' }}>
                {patient.idade ? `${patient.idade} anos` : '-'} • {patient.sexo === 'F' ? 'Fem' : 'Masc'}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', paddingTop: '6px', borderTop: '1px dashed #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Etiologia DRC</span>
              <div style={{ fontWeight: '500', fontSize: '10px' }}>{patient.etiologiaDRC || '-'}</div>
            </div>
            <div>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Acesso Vascular</span>
              <div style={{ fontWeight: '500', fontSize: '10px' }}>
                {patient.tipoAcesso || 'FAV'} {patient.posicaoAcesso ? `(${patient.posicaoAcesso})` : ''}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Peso Seco Alvo</span>
              <div style={{ fontWeight: '600', fontSize: '10px', color: '#2563eb' }}>
                {patient.pesoSeco ? `${patient.pesoSeco} kg` : '-'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>Turno / Escala</span>
              <div style={{ fontWeight: '500', fontSize: '10px' }}>
                {patient.turno || 'Manhã'} • {patient.diaSemana || 'Seg/Qua/Sex'}
              </div>
            </div>
          </div>
        </div>

        {/* Parâmetros Vitais e Dialíticos da Sessão */}
        {(evolution.paPre || evolution.paPos || evolution.pesoPre || evolution.ufRetirada || evolution.qbEfetivo) && (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '14px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            alignItems: 'center',
            fontSize: '10px'
          }}>
            {evolution.paPre && <span>PA Pré: <strong>{evolution.paPre}</strong></span>}
            {evolution.paPos && <span>PA Pós: <strong>{evolution.paPos}</strong></span>}
            {evolution.pesoPre && <span>Peso Pré: <strong>{evolution.pesoPre} kg</strong></span>}
            {evolution.pesoPos && <span>Peso Pós: <strong>{evolution.pesoPos} kg</strong></span>}
            {evolution.ufRetirada && <span>UF Retirada: <strong>{evolution.ufRetirada} ml</strong></span>}
            {evolution.qbEfetivo && <span>Qb: <strong>{evolution.qbEfetivo} ml/min</strong></span>}
            {evolution.intercorrencias && (
              <span style={{ color: evolution.intercorrencias === 'Nenhuma' ? '#15803d' : '#b91c1c', fontWeight: '600' }}>
                Intercorrência: {evolution.intercorrencias}
              </span>
            )}
          </div>
        )}

        {/* Texto Completo da Evolução e Conduta Clínica */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '14px 16px',
          minHeight: '400px'
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: '#1e3a8a',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '4px',
            marginBottom: '10px'
          }}>
            Descrição da Evolução Clínica e Plano Terapêutico
          </div>

          <div style={{
            whiteSpace: 'pre-wrap',
            fontSize: '10.5px',
            lineHeight: 1.5,
            color: '#1e293b'
          }}>
            {evolution.condutaClinica || 'Nenhuma descrição informada.'}
          </div>
        </div>
      </div>

      {/* Rodapé com Assinatura e Dados do Médico */}
      <div style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontSize: '9px', color: '#64748b' }}>
            <div>Documento emitido eletronicamente via NexAi-NEFRO Cloud System</div>
            <div>Autenticidade vinculada ao registro médico no Cloud Firestore</div>
          </div>

          <div style={{ textAlign: 'center', minWidth: '240px' }}>
            <div style={{ borderBottom: '1px solid #0f172a', marginBottom: '4px', width: '220px', marginLeft: 'auto', marginRight: 'auto' }}></div>
            <div style={{ fontWeight: '700', fontSize: '11px', color: '#0f172a' }}>{doctorName}</div>
            <div style={{ fontSize: '10px', color: '#475569' }}>
              {doctorEspecialidade} • {doctorCrm}{doctorRqe}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
