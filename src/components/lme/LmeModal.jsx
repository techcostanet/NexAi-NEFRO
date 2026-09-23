import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Download, 
  Loader2, 
  Sparkles, 
  Pill, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { 
  LME_MEDICAMENTOS, 
  extractLatestExamsForLme, 
  evaluateLmePcdtCriteria, 
  buildLmeClinicalReportText 
} from '../../services/lmeService.js';
import { savePatientLme } from '../../services/patientService.js';
import { downloadPdfDocument } from '../../services/pdfService.js';
import LmeReportPdf from '../pdf/LmeReportPdf.jsx';

export default function LmeModal({
  isOpen,
  onClose,
  patient,
  doctorInfo,
  lmeToEdit = null,
  isRenovacao = false,
  onSaveSuccess
}) {
  const [selectedMedId, setSelectedMedId] = useState(lmeToEdit?.medicamentoId || 'alfaepoetina');
  const [selectedConcentracaoId, setSelectedConcentracaoId] = useState('');
  const [posologia, setPosologia] = useState('');
  const [quantidadeMensal, setQuantidadeMensal] = useState(12);
  const [vigenciaMeses, setVigenciaMeses] = useState(6);
  const [dataSolicitacao, setDataSolicitacao] = useState(new Date().toISOString().split('T')[0]);
  const [dataValidade, setDataValidade] = useState('');
  const [exames, setExames] = useState({});
  const [clinicalText, setClinicalText] = useState('');
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentMed = LME_MEDICAMENTOS.find(m => m.id === selectedMedId) || LME_MEDICAMENTOS[0];

  // Inicialização e preenchimento
  useEffect(() => {
    if (!isOpen || !patient) return;

    if (lmeToEdit && !isRenovacao) {
      // Modo Edição
      setSelectedMedId(lmeToEdit.medicamentoId || 'alfaepoetina');
      setSelectedConcentracaoId(lmeToEdit.concentracaoId || '');
      setPosologia(lmeToEdit.posologia || '');
      setQuantidadeMensal(lmeToEdit.quantidadeMensal || 12);
      setVigenciaMeses(lmeToEdit.vigenciaMeses || 6);
      setDataSolicitacao(lmeToEdit.dataSolicitacao || new Date().toISOString().split('T')[0]);
      setDataValidade(lmeToEdit.dataValidade || '');
      setExames(lmeToEdit.examesUtilizados || {});
      setClinicalText(lmeToEdit.justificativaClinica || '');
    } else {
      // Modo Novo ou Renovação
      const defaultConc = currentMed.concentracoes[0];
      setSelectedConcentracaoId(isRenovacao && lmeToEdit?.concentracaoId ? lmeToEdit.concentracaoId : defaultConc?.id);
      setPosologia(isRenovacao && lmeToEdit?.posologia ? lmeToEdit.posologia : currentMed.posologiaSugerida);
      setQuantidadeMensal(isRenovacao && lmeToEdit?.quantidadeMensal ? lmeToEdit.quantidadeMensal : currentMed.quantidadeMensalPadrao);
      setVigenciaMeses(isRenovacao && lmeToEdit?.vigenciaMeses ? lmeToEdit.vigenciaMeses : currentMed.vigenciaPadraoMeses);
      
      const hojeStr = new Date().toISOString().split('T')[0];
      setDataSolicitacao(hojeStr);

      // Puxa exames laboratoriais mais recentes do prontuário
      const latestExams = extractLatestExamsForLme(patient);
      setExames(latestExams);

      // Calcula data de validade (6 meses)
      const d = new Date();
      d.setMonth(d.getMonth() + (currentMed.vigenciaPadraoMeses || 6));
      setDataValidade(d.toISOString().split('T')[0]);
    }
  }, [lmeToEdit, isRenovacao, isOpen]);

  // Quando o médico troca de medicamento
  const handleMedChange = (newMedId) => {
    setSelectedMedId(newMedId);
    const med = LME_MEDICAMENTOS.find(m => m.id === newMedId);
    if (med) {
      setSelectedConcentracaoId(med.concentracoes[0]?.id || '');
      setPosologia(med.posologiaSugerida);
      setQuantidadeMensal(med.quantidadeMensalPadrao);
      setVigenciaMeses(med.vigenciaPadraoMeses);
      
      // Recalcula validade
      const d = new Date(dataSolicitacao);
      d.setMonth(d.getMonth() + Number(med.vigenciaPadraoMeses));
      setDataValidade(d.toISOString().split('T')[0]);
    }
  };

  // Recalcula data de validade quando altera data de solicitação ou vigência
  const handleDateOrVigenciaChange = (solDate, meses) => {
    setDataSolicitacao(solDate);
    setVigenciaMeses(meses);
    try {
      const d = new Date(solDate);
      d.setMonth(d.getMonth() + Number(meses));
      setDataValidade(d.toISOString().split('T')[0]);
    } catch (_) {}
  };

  // Atualizar exame manual
  const handleExamChange = (key, field, val) => {
    setExames(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: val
      }
    }));
  };

  // Avaliação do Auditor PCDT
  const pcdtAudit = evaluateLmePcdtCriteria(selectedMedId, exames);
  const currentConc = currentMed.concentracoes.find(c => c.id === selectedConcentracaoId) || currentMed.concentracoes[0];

  // Gerar texto clínico da justificativa
  useEffect(() => {
    if (!isOpen || !patient) return;

    if (!lmeToEdit || isRenovacao) {
      const txt = buildLmeClinicalReportText({
        patient,
        medicamentoData: currentMed,
        concentracao: currentConc,
        posologia,
        exames: Object.keys(exames).reduce((acc, k) => {
          acc[k] = exames[k]?.valor || '';
          return acc;
        }, {}),
        doctorInfo
      });
      setClinicalText(txt);
    }
  }, [selectedMedId, selectedConcentracaoId, posologia, exames]);

  // Montar payload da LME
  const buildPayload = () => {
    return {
      medicamentoId: selectedMedId,
      medicamentoNome: currentMed.nome,
      nomeComercial: currentMed.nomeComercial,
      concentracaoId: selectedConcentracaoId,
      concentracaoLabel: currentConc?.label,
      cidPrincipal: currentMed.cidPrincipal,
      cidDescricao: currentMed.cidDescricao,
      cidSecundario: currentMed.cidSecundario,
      cidSecundarioDescricao: currentMed.cidSecundarioDescricao,
      posologia,
      quantidadeMensal: Number(quantidadeMensal),
      quantidadeTotal: Number(quantidadeMensal) * Number(vigenciaMeses),
      vigenciaMeses: Number(vigenciaMeses),
      dataSolicitacao,
      dataValidade,
      status: 'Ativo',
      examesUtilizados: exames,
      justificativaClinica: clinicalText,
      medicoSolicitante: {
        nome: doctorInfo?.nome || 'Médico Nefrologista',
        crm: doctorInfo?.crm || '',
        ufCrm: doctorInfo?.ufCrm || 'MG',
        cpf: doctorInfo?.cpf || ''
      },
      isRenovacao: !!isRenovacao
    };
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = buildPayload();
      const targetId = isRenovacao ? null : lmeToEdit?.id;
      await savePatientLme(patient.id, payload, targetId);

      setSuccess('LME salva no prontuário com sucesso!');
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError('Falha ao salvar LME: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      setError('');
      const payload = buildPayload();
      const safePatient = (patient.nome || 'Paciente').replace(/\s+/g, '_');
      const safeMed = (currentMed.id || 'LME').toUpperCase();
      const fileName = `LME_${safeMed}_${safePatient}.pdf`;

      await downloadPdfDocument(
        <LmeReportPdf
          patient={patient}
          doctorInfo={doctorInfo}
          lmeData={payload}
          clinicalReportText={clinicalText}
        />,
        fileName
      );
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar PDF: ' + err.message);
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (!isOpen || !patient) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '0.75rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-in"
        style={{
          background: 'var(--surface-solid)',
          width: '100%',
          maxWidth: '1000px',
          height: '92vh',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          borderRadius: '20px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center pb-3 border-b mb-3" style={{ borderColor: 'var(--border)', flexShrink: 0 }}>
          <div className="flex items-center gap-2.5">
            <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '12px', color: '#2563eb' }}>
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight" style={{ margin: 0 }}>
                  {isRenovacao ? 'Renovação de LME' : lmeToEdit ? 'Editar LME' : 'Emitir LME (Alto Custo SUS)'}
                </h2>
                <span style={{ fontSize: '0.70rem', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                  Farmácia Estadual CEAF
                </span>
              </div>
              <p className="text-xs text-muted" style={{ margin: 0 }}>
                Paciente: <strong>{patient.nome}</strong> • CNS: {patient.cns || patient.cartaoSus || 'Pendente'}
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-outline" 
            style={{ padding: '0.4rem', borderRadius: '50%' }}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Alertas & Sucesso */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.65rem 0.9rem', borderRadius: '10px', marginBottom: '0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <AlertCircle size={18} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.65rem 0.9rem', borderRadius: '10px', marginBottom: '0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{success}</span>
          </div>
        )}

        {/* Corpo com Rolagem Independente */}
        <div 
          className="custom-scrollbar"
          style={{
            flex: '1 1 0%',
            minHeight: 0,
            overflowY: 'auto',
            paddingRight: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* SEÇÃO 1: MEDICAMENTO E POSOLOGIA */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Pill size={16} color="var(--primary)" />
              <span>1. Medicamento Solicitado</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Fármaco</label>
                <select 
                  className="input-field" 
                  value={selectedMedId} 
                  onChange={(e) => handleMedChange(e.target.value)}
                  style={{ fontWeight: '600' }}
                >
                  {LME_MEDICAMENTOS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({m.nomeComercial})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Concentração</label>
                <select 
                  className="input-field" 
                  value={selectedConcentracaoId} 
                  onChange={(e) => setSelectedConcentracaoId(e.target.value)}
                >
                  {currentMed.concentracoes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-700 block mb-1">Posologia Prescrita</label>
              <input 
                type="text" 
                className="input-field" 
                value={posologia} 
                onChange={(e) => setPosologia(e.target.value)} 
                placeholder="Ex: 4.000 UI SC 3x por semana pós-hemodiálise"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginTop: '0.75rem' }}>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Quantidade Mensal</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={quantidadeMensal} 
                  onChange={(e) => setQuantidadeMensal(e.target.value)} 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Período de Vigência</label>
                <select 
                  className="input-field" 
                  value={vigenciaMeses} 
                  onChange={(e) => handleDateOrVigenciaChange(dataSolicitacao, e.target.value)}
                >
                  <option value="3">3 Meses (Trimestral)</option>
                  <option value="6">6 Meses (Semestral)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Data Início da Vigência</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={dataSolicitacao} 
                  onChange={(e) => handleDateOrVigenciaChange(e.target.value, vigenciaMeses)} 
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Data Prevista para Renovação</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={dataValidade} 
                  onChange={(e) => setDataValidade(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: AUDITOR DE ELEGIBILIDADE PCDT & EXAMES */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
            <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2" style={{ margin: 0 }}>
                <Sparkles size={16} color="var(--primary)" />
                <span>2. Elegibilidade PCDT</span>
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Conferência automática com base nos critérios do SUS
              </span>
            </div>

            {/* Painel do Auditor */}
            <div style={{ marginBottom: '1rem' }}>
              {pcdtAudit.alertas.length > 0 && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.75rem', marginBottom: '0.65rem' }}>
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-900 mb-1.5">
                    <AlertTriangle size={15} color="#d97706" />
                    <span>Atenção aos Critérios do Protocolo:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.78rem', color: '#92400e' }}>
                    {pcdtAudit.alertas.map((a, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>
                        <strong>{a.param}:</strong> {a.mensagem}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pcdtAudit.conformidades.length > 0 && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.65rem 0.75rem' }}>
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 mb-1">
                    <CheckCircle2 size={15} color="#16a34a" />
                    <span>Critérios Atendidos:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.78rem', color: '#166534' }}>
                    {pcdtAudit.conformidades.map((c, i) => (
                      <li key={i} style={{ marginBottom: '2px' }}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Tabela dos Exames Exigidos pelo PCDT */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">Exames Obrigatórios para este Medicamento:</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.65rem' }}>
                {currentMed.examesObrigatorios.map(ob => {
                  const item = exames[ob.key] || { valor: '', data: '' };
                  return (
                    <div 
                      key={ob.key} 
                      style={{ 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '10px', 
                        padding: '0.65rem 0.75rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-800">{ob.nome}</span>
                        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{ob.unidade}</span>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          className="input-field" 
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', fontWeight: 'bold' }}
                          value={item.valor || ''} 
                          onChange={(e) => handleExamChange(ob.key, 'valor', e.target.value)} 
                          placeholder="Valor"
                        />
                        <input 
                          type="date" 
                          className="input-field" 
                          style={{ padding: '0.3rem 0.4rem', fontSize: '0.72rem', width: '110px' }}
                          value={item.data || ''} 
                          onChange={(e) => handleExamChange(ob.key, 'data', e.target.value)} 
                        />
                      </div>
                      <span className="text-2xs text-muted block mt-1">
                        {ob.cortePcdt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: JUSTIFICATIVA CLÍNICA / RELATÓRIO MÉDICO */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
              <FileText size={16} color="var(--primary)" />
              <span>3. Relatório Médico Circunstanciado (Justificativa para a SES)</span>
            </h3>
            <p className="text-xs text-muted mb-2">
              Texto formal gerado automaticamente para acompanhar a LME. Pode ser editado livremente:
            </p>
            <textarea 
              className="input-field" 
              rows={5}
              style={{ fontSize: '0.82rem', lineHeight: '1.45', fontFamily: 'inherit', resize: 'vertical' }}
              value={clinicalText}
              onChange={(e) => setClinicalText(e.target.value)}
            />
          </div>
        </div>

        {/* Rodapé Fixo de Ações */}
        <div 
          className="flex justify-between items-center gap-3 pt-3 border-t flex-wrap" 
          style={{ 
            borderColor: 'var(--border)', 
            flexShrink: 0,
            marginTop: 'auto',
            background: 'var(--surface-solid)',
            zIndex: 20
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Validade: <strong>{dataValidade ? dataValidade.split('-').reverse().join('/') : '-'}</strong> ({vigenciaMeses} meses)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={onClose} 
              disabled={saving || downloadingPdf}
              style={{ fontSize: '0.82rem', borderRadius: '10px' }}
            >
              Cancelar
            </button>

            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={handleDownloadPdf}
              disabled={saving || downloadingPdf}
              style={{ 
                fontSize: '0.82rem', 
                borderRadius: '10px',
                borderColor: '#cbd5e1',
                background: '#f8fafc',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Baixar Laudo LME e Relatório Circunstanciado em PDF vetorial"
            >
              {downloadingPdf ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} color="#2563eb" />}
              <span>{downloadingPdf ? 'Gerando...' : 'PDF'}</span>
            </button>

            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving || downloadingPdf}
              style={{ 
                fontSize: '0.88rem', 
                fontWeight: '700',
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '0.6rem 1.4rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
              }}
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              <span>{saving ? 'Gravando...' : isRenovacao ? 'Renovar' : 'Salvar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
