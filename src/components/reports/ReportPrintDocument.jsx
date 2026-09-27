import React from 'react';

/**
 * Componente de Documento Impresso / PDF para Relatórios Clínicos e Gerenciais
 * Formatado para papel A4 em modo paisagem.
 */
export default function ReportPrintDocument({
  report,
  rows = [],
  kpis = [],
  filters = {},
  doctor = {},
  selectedClinica = ''
}) {
  if (!report) return null;

  const emissionDate = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const doctorName = doctor.nome || 'Dr(a). Médico(a) Nefrologista';
  const doctorCrm = doctor.crm ? `CRM/${doctor.ufCrm || 'SP'} ${doctor.crm}` : 'CRM/SP';
  const doctorEspecialidade = doctor.especialidade || doctor.titulo || 'Nefrologia Clínica';
  const clinicaNome = selectedClinica || doctor.clinicaPrincipal || 'Todas as Unidades de Atendimento';

  // Monta resumo amigável dos filtros
  const filterParts = [];
  if (filters.unidade && filters.unidade !== 'todos') filterParts.push(`Unidade: ${filters.unidade}`);
  if (filters.turno && filters.turno !== 'todos') filterParts.push(`Turno: ${filters.turno}`);
  if (filters.diaSemana && filters.diaSemana !== 'todos') filterParts.push(`Escala: ${filters.diaSemana}`);
  if (filters.tipoAcesso && filters.tipoAcesso !== 'todos') filterParts.push(`Acesso: ${filters.tipoAcesso}`);
  if (filters.statusTransplante && filters.statusTransplante !== 'todos') filterParts.push(`Transplante: ${filters.statusTransplante}`);
  if (filters.anticoagulacao && filters.anticoagulacao !== 'todos') filterParts.push(`Anticoagulação: ${filters.anticoagulacao}`);
  if (filters.convenio && filters.convenio !== 'todos') filterParts.push(`Convênio: ${filters.convenio}`);
  if (filters.comAlertaApenas) filterParts.push(`Com Alertas`);
  if (filters.busca) filterParts.push(`Busca: "${filters.busca}"`);

  const filtersSummary = filterParts.length > 0 ? filterParts.join(' • ') : 'Todos os registros';

  return (
    <div className="report-print-container" style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: '#0f172a',
      background: '#ffffff',
      padding: '20px 24px',
      fontSize: '11px',
      lineHeight: 1.4,
      maxWidth: '100%'
    }}>
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm 8mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .report-print-container {
            padding: 0 !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>

      {/* ================= CABEÇALHO TIMBRADO ================= */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2px solid #0284c7',
        paddingBottom: '10px',
        marginBottom: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Nex-<span style={{ color: '#0284c7', fontWeight: '900' }}>Ai</span>.NEFRO
            </span>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              fontSize: '9px',
              fontWeight: '700',
              padding: '2px 6px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              Relatório Clínico
            </span>
          </div>
          <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#64748b' }}>
            Vigilância Nefrológica e Hemodiálise em Nuvem
          </p>
          <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#334155', fontWeight: '600' }}>
            {clinicaNome}
          </p>
        </div>

        <div style={{ textAlign: 'right', fontSize: '10px', color: '#475569' }}>
          <div><strong>Emissão:</strong> {emissionDate}</div>
          <div><strong>Médico:</strong> {doctorName}</div>
          <div><strong>Registro:</strong> {doctorCrm} • {doctorEspecialidade}</div>
        </div>
      </div>

      {/* ================= TÍTULO DO RELATÓRIO E FILTROS ================= */}
      <div style={{ marginBottom: '12px' }}>
        <h1 style={{
          fontSize: '15px',
          fontWeight: '700',
          color: '#0f172a',
          margin: '0 0 3px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.2px'
        }}>
          {report.title}
        </h1>
        <p style={{ margin: '0 0 5px 0', fontSize: '10px', color: '#475569' }}>
          {report.description}
        </p>
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '5px 8px',
          fontSize: '9px',
          color: '#334155'
        }}>
          <strong>Filtros:</strong> {filtersSummary}
        </div>
      </div>

      {/* ================= CARDS DE INDICADORES / KPIS ================= */}
      {kpis && kpis.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(kpis.length, 4)}, 1fr)`,
          gap: '8px',
          marginBottom: '12px'
        }}>
          {kpis.map((kpi, idx) => (
            <div key={idx} style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              padding: '5px 8px'
            }}>
              <div style={{ fontSize: '8.5px', textTransform: 'uppercase', color: '#15803d', fontWeight: '700' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#166534', marginTop: '1px' }}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= TABELA DE DADOS ================= */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '9px',
        marginBottom: '18px'
      }}>
        <thead>
          <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
            <th style={{ padding: '5px 6px', textAlign: 'center', width: '28px', color: '#475569', fontWeight: '700' }}>#</th>
            {report.columns.map(col => (
              <th key={col.id} style={{
                padding: '5px 6px',
                textAlign: 'left',
                color: '#334155',
                fontWeight: '700',
                borderRight: '1px solid #e2e8f0'
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={report.columns.length + 1} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                Nenhum registro encontrado para os filtros selecionados.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={idx} style={{
                background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <td style={{ padding: '4px 6px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>
                  {idx + 1}
                </td>
                {report.columns.map(col => {
                  const val = row[col.id] ?? '-';
                  const isAlert = typeof val === 'string' && (val.includes('🚨') || val.includes('⚠️') || val.includes('Fora') || val.includes('Inadequado'));
                  const isSuccess = typeof val === 'string' && (val.includes('✓') || val.includes('Alvo') || val.includes('Adequado'));

                  return (
                    <td key={col.id} style={{
                      padding: '4px 6px',
                      color: isAlert ? '#b91c1c' : isSuccess ? '#15803d' : '#1e293b',
                      fontWeight: isAlert ? '700' : isSuccess ? '600' : 'normal',
                      borderRight: '1px solid #f1f5f9'
                    }}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ================= RODAPÉ E ASSINATURA ================= */}
      <div style={{
        marginTop: '20px',
        paddingTop: '10px',
        borderTop: '1px solid #cbd5e1',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        fontSize: '8.5px',
        color: '#64748b'
      }}>
        <div>
          <div><strong>Total de registros:</strong> {rows.length}</div>
          <div>Gerado eletronicamente em {emissionDate} pela plataforma Nex-Ai.NEFRO.</div>
          <div style={{ color: '#94a3b8', fontSize: '8px' }}>Autenticidade rastreada no Cloud Firestore • Uso exclusivo institucional</div>
        </div>

        <div style={{ textAlign: 'center', minWidth: '200px' }}>
          <div style={{ borderBottom: '1px solid #0f172a', width: '100%', marginBottom: '4px' }}></div>
          <strong style={{ display: 'block', fontSize: '10px', color: '#0f172a' }}>{doctorName}</strong>
          <span style={{ display: 'block', fontSize: '8.5px', color: '#475569' }}>{doctorEspecialidade}</span>
          <span style={{ display: 'block', fontSize: '8.5px', color: '#64748b' }}>{doctorCrm}</span>
        </div>
      </div>
    </div>
  );
}
