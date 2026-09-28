import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Download, 
  Loader2, 
  Sparkles, 
  Pill, 
  Eye,
  Building2,
  Stethoscope,
  ClipboardCheck
} from 'lucide-react';
import { 
  LME_MEDICAMENTOS, 
  extractLatestExamsForLme, 
  evaluateLmePcdtCriteria, 
  buildLmeClinicalReportText,
  isAnemiaAgravo,
  isDmoAgravo,
  getMedicamentoOfficialLabel
} from '../../services/lmeService.js';
import { savePatientLme } from '../../services/patientService.js';
import { saveDoctorProfile } from '../../services/doctorService.js';
import { downloadPdfDocument, openPdfPreview } from '../../services/pdfService.js';
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
  const [activeTab, setActiveTab] = useState('remedio'); // 'remedio' | 'formulario' | 'exames' | 'clinica'

  // Medicamento e Posologia
  const [selectedMedId, setSelectedMedId] = useState(lmeToEdit?.medicamentoId || 'alfaepoetina');
  const [selectedConcentracaoId, setSelectedConcentracaoId] = useState('');
  const [posologia, setPosologia] = useState('');
  const [quantidadeMensal, setQuantidadeMensal] = useState(12);
  const [vigenciaMeses, setVigenciaMeses] = useState(6);
  const [dataSolicitacao, setDataSolicitacao] = useState(new Date().toISOString().split('T')[0]);
  const [dataValidade, setDataValidade] = useState('');
  const [exames, setExames] = useState({});
  const [clinicalText, setClinicalText] = useState('');

  // Questionário Farmácia de Minas (SES-MG)
  const [tipoTratamento, setTipoTratamento] = useState('Hemodiálise');
  const [estagioDRC, setEstagioDRC] = useState('5D');
  const [doencaBase, setDoencaBase] = useState('');
  const [anamneseTexto, setAnamneseTexto] = useState('');
  const [tratamentoPrevio, setTratamentoPrevio] = useState('Hemodiálise e Dieta');
  const [isPrimeiroTratamento, setIsPrimeiroTratamento] = useState(true);
  const [recebendoTransfusao, setRecebendoTransfusao] = useState(false);
  const [doseSolicitadaTexto, setDoseSolicitadaTexto] = useState('');
  const [transplantePrevio, setTransplantePrevio] = useState(false);
  const [transplanteDescricao, setTransplanteDescricao] = useState('');
  const [paratireoidectomia, setParatireoidectomia] = useState(false);
  const [paratireoidectomiaDetalhes, setParatireoidectomiaDetalhes] = useState('');
  const [fomeOssea, setFomeOssea] = useState(false);
  const [outrasInformacoes, setOutrasInformacoes] = useState('');

  // Unidade Solicitante e Médico
  const [clinicaNome, setClinicaNome] = useState('');
  const [cnes, setCnes] = useState('');
  const [clinicaEndereco, setClinicaEndereco] = useState('');
  const [clinicaBairro, setClinicaBairro] = useState('');
  const [clinicaCep, setClinicaCep] = useState('');
  const [clinicaCidade, setClinicaCidade] = useState('BETIM');
  const [clinicaUf, setClinicaUf] = useState('MG');
  const [clinicaTelefone, setClinicaTelefone] = useState('');
  const [medicoCns, setMedicoCns] = useState('');
  const [racaCor, setRacaCor] = useState('Parda');

  // Estados de Operação
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [previewingPdf, setPreviewingPdf] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentMed = LME_MEDICAMENTOS.find(m => m.id === selectedMedId) || LME_MEDICAMENTOS[0];
  const isAnemia = isAnemiaAgravo(selectedMedId);
  const isDmo = isDmoAgravo(selectedMedId);

  // Inicialização e preenchimento inteligente
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

      setTipoTratamento(lmeToEdit.tipoTratamento || 'Hemodiálise');
      setEstagioDRC(lmeToEdit.estagioDRC || '5D');
      setDoencaBase(lmeToEdit.doencaBase || patient?.etiologiaDRC || 'Doença Renal do Diabetes');
      setAnamneseTexto(lmeToEdit.anamneseTexto || '');
      setTratamentoPrevio(lmeToEdit.tratamentoPrevio || 'Hemodiálise e Dieta');
      setIsPrimeiroTratamento(lmeToEdit.isPrimeiroTratamento !== undefined ? lmeToEdit.isPrimeiroTratamento : true);
      setRecebendoTransfusao(Boolean(lmeToEdit.recebendoTransfusao));
      setDoseSolicitadaTexto(lmeToEdit.doseSolicitadaTexto || '');
      setTransplantePrevio(Boolean(lmeToEdit.transplantePrevio));
      setTransplanteDescricao(lmeToEdit.transplanteDescricao || '');
      setParatireoidectomia(Boolean(lmeToEdit.paratireoidectomia));
      setParatireoidectomiaDetalhes(lmeToEdit.paratireoidectomiaDetalhes || '');
      setFomeOssea(Boolean(lmeToEdit.fomeOssea));
      setOutrasInformacoes(lmeToEdit.outrasInformacoes || '');

      setClinicaNome(lmeToEdit.clinicaNome || patient?.clinica || doctorInfo?.clinicaPrincipal || 'DIALIZE SAUDE');
      setCnes(lmeToEdit.cnes || doctorInfo?.cnes || '5920574');
      setClinicaEndereco(lmeToEdit.clinicaEndereco || 'AV EDMEIA MATTOS LAZZAROTTI 1655');
      setClinicaBairro(lmeToEdit.clinicaBairro || 'ANGOLA');
      setClinicaCep(lmeToEdit.clinicaCep || '32604155');
      setClinicaCidade(lmeToEdit.clinicaCidade || 'BETIM');
      setClinicaUf(lmeToEdit.clinicaUf || 'MG');
      setClinicaTelefone(lmeToEdit.clinicaTelefone || '(31)94510284');
      setMedicoCns(lmeToEdit.medicoSolicitante?.cns || doctorInfo?.cns || '898004770672707');
      setRacaCor(lmeToEdit.racaCor || patient?.racaCor || 'Parda');
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

      // Defaults para questionário de Minas Gerais
      setTipoTratamento('Hemodiálise');
      setEstagioDRC('5D');
      setDoencaBase(patient?.etiologiaDRC || 'Doença Renal do Diabetes');
      setIsPrimeiroTratamento(!isRenovacao);
      setRecebendoTransfusao(false);
      setTratamentoPrevio('Hemodiálise e Dieta');

      const medIsAnemia = isAnemiaAgravo(selectedMedId);
      setAnamneseTexto(medIsAnemia 
        ? 'Paciente DRC em hemodiálise evolui com anemia secundária a doença de base' 
        : 'Paciente DRC em hemodiálise evoluindo com DMO secundária a doença de base apesar de dieta adequada e hemodiálise'
      );
      setDoseSolicitadaTexto(medIsAnemia ? '3000ui 3 vezes por semana' : 'Administrar 1 ampola EV por sessão de diálise (3 vezes/semana) - 12 ampolas/mês');

      setClinicaNome(patient?.clinica || doctorInfo?.clinicaPrincipal || 'DIALIZE SAUDE');
      setCnes(doctorInfo?.cnes || '5920574');
      setClinicaEndereco('AV EDMEIA MATTOS LAZZAROTTI 1655');
      setClinicaBairro('ANGOLA');
      setClinicaCep('32604155');
      setClinicaCidade('BETIM');
      setClinicaUf('MG');
      setClinicaTelefone('(31)94510284');
      setMedicoCns(doctorInfo?.cns || '898004770672707');
      setRacaCor(patient?.racaCor || 'Parda');
    }
  }, [lmeToEdit, isRenovacao, isOpen, doctorInfo, patient]);

  // Quando o médico troca de medicamento
  const handleMedChange = (newMedId) => {
    setSelectedMedId(newMedId);
    const med = LME_MEDICAMENTOS.find(m => m.id === newMedId);
    if (med) {
      setSelectedConcentracaoId(med.concentracoes[0]?.id || '');
      setPosologia(med.posologiaSugerida);
      setQuantidadeMensal(med.quantidadeMensalPadrao);
      setVigenciaMeses(med.vigenciaPadraoMeses);
      
      const isAnem = isAnemiaAgravo(newMedId);
      setAnamneseTexto(isAnem 
        ? 'Paciente DRC em hemodiálise evolui com anemia secundária a doença de base' 
        : 'Paciente DRC em hemodiálise evoluindo com DMO secundária a doença de base apesar de dieta adequada e hemodiálise'
      );
      setDoseSolicitadaTexto(isAnem ? '3000ui 3 vezes por semana' : 'Administrar 1 ampola EV por sessão de diálise (3 vezes/semana) - 12 ampolas/mês');

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

  // Montar payload completo da LME
  const buildPayload = () => {
    const medOfficial = getMedicamentoOfficialLabel(selectedMedId, selectedConcentracaoId);

    return {
      medicamentoId: selectedMedId,
      medicamentoNome: currentMed.nome,
      medicamentoOficialLabel: medOfficial,
      nomeComercial: currentMed.nomeComercial,
      concentracaoId: selectedConcentracaoId,
      concentracaoLabel: currentConc?.label,
      cidPrincipal: isDmo ? 'N25.0' : currentMed.cidPrincipal,
      cidDescricao: isDmo ? 'Osteodistrofia renal' : currentMed.cidDescricao,
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

      // Dados de Minas Gerais
      tipoTratamento,
      estagioDRC,
      doencaBase,
      anamneseTexto,
      tratamentoPrevio,
      isPrimeiroTratamento,
      recebendoTransfusao,
      doseSolicitadaTexto,
      transplantePrevio,
      transplanteDescricao,
      paratireoidectomia,
      paratireoidectomiaDetalhes,
      fomeOssea,
      outrasInformacoes,

      // Dados da Clínica / Estabelecimento
      clinicaNome,
      cnes,
      clinicaEndereco,
      clinicaBairro,
      clinicaCep,
      clinicaCidade,
      clinicaUf,
      clinicaTelefone,
      unidadeCAF: clinicaCidade ? `${clinicaCidade} - MG` : 'Betim - MG',
      racaCor,

      medicoSolicitante: {
        nome: doctorInfo?.nome || 'Médico Nefrologista',
        crm: doctorInfo?.crm || '',
        ufCrm: doctorInfo?.ufCrm || 'MG',
        cns: medicoCns || doctorInfo?.cns || '898004770672707',
        cpf: doctorInfo?.cpf || ''
      }
    };
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = buildPayload();
      await savePatientLme(patient.id, payload);

      if (doctorInfo?.id && medicoCns && medicoCns !== doctorInfo.cns) {
        try {
          await saveDoctorProfile(doctorInfo.id, { ...doctorInfo, cns: medicoCns });
        } catch (docErr) {
          console.warn("Aviso ao salvar CNS no perfil do médico:", docErr);
        }
      }

      setSuccess('LME salva no prontuário com sucesso!');
      if (onSaveSuccess) onSaveSuccess();
      setTimeout(() => {
        onClose();
      }, 1000);
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
      const fileName = `LME_MG_${safeMed}_${safePatient}.pdf`;

      const effectiveDoctorInfo = {
        ...doctorInfo,
        cns: payload.medicoSolicitante?.cns || doctorInfo?.cns || ''
      };

      await downloadPdfDocument(
        <LmeReportPdf
          patient={patient}
          doctorInfo={effectiveDoctorInfo}
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

  const handlePreviewPdf = async () => {
    try {
      setPreviewingPdf(true);
      setError('');
      const payload = buildPayload();
      const effectiveDoctorInfo = {
        ...doctorInfo,
        cns: payload.medicoSolicitante?.cns || doctorInfo?.cns || ''
      };

      await openPdfPreview(
        <LmeReportPdf
          patient={patient}
          doctorInfo={effectiveDoctorInfo}
          lmeData={payload}
          clinicalReportText={clinicalText}
        />
      );
    } catch (err) {
      console.error(err);
      setError('Falha ao abrir prévia: ' + err.message);
    } finally {
      setPreviewingPdf(false);
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
          maxWidth: '1020px',
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
                  {isRenovacao ? 'Renovar LME' : lmeToEdit ? 'Editar LME' : 'Emitir LME'}
                </h2>
                <span style={{ fontSize: '0.70rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                  Farmácia de Minas (SES-MG)
                </span>
              </div>
              <p className="text-xs text-muted" style={{ margin: 0 }}>
                Paciente: <strong>{patient.nome}</strong> • CPF: {patient.cpf || '—'} • CNS: {patient.cns || patient.cartaoSus || 'Pendente'}
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

        {/* Barra de Abas Estilo Segmented Pill (Regra de Poucas Palavras) */}
        <div 
          style={{ 
            display: 'flex', 
            background: '#f1f5f9', 
            borderRadius: '12px', 
            padding: '3px', 
            marginBottom: '0.85rem',
            gap: '4px',
            flexShrink: 0
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('remedio')}
            style={{
              flex: 1,
              padding: '0.45rem 0.5rem',
              borderRadius: '9px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'remedio' ? '700' : '500',
              background: activeTab === 'remedio' ? '#ffffff' : 'transparent',
              color: activeTab === 'remedio' ? '#2563eb' : '#475569',
              boxShadow: activeTab === 'remedio' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Pill size={14} />
            <span>Fármaco</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('formulario')}
            style={{
              flex: 1,
              padding: '0.45rem 0.5rem',
              borderRadius: '9px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'formulario' ? '700' : '500',
              background: activeTab === 'formulario' ? '#ffffff' : 'transparent',
              color: activeTab === 'formulario' ? '#2563eb' : '#475569',
              boxShadow: activeTab === 'formulario' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <ClipboardCheck size={14} />
            <span>Formulário</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exames')}
            style={{
              flex: 1,
              padding: '0.45rem 0.5rem',
              borderRadius: '9px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'exames' ? '700' : '500',
              background: activeTab === 'exames' ? '#ffffff' : 'transparent',
              color: activeTab === 'exames' ? '#2563eb' : '#475569',
              boxShadow: activeTab === 'exames' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} />
            <span>Exames</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clinica')}
            style={{
              flex: 1,
              padding: '0.45rem 0.5rem',
              borderRadius: '9px',
              border: 'none',
              fontSize: '0.82rem',
              fontWeight: activeTab === 'clinica' ? '700' : '500',
              background: activeTab === 'clinica' ? '#ffffff' : 'transparent',
              color: activeTab === 'clinica' ? '#2563eb' : '#475569',
              boxShadow: activeTab === 'clinica' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Building2 size={14} />
            <span>Clínica</span>
          </button>
        </div>

        {/* Mensagens de Alerta & Sucesso */}
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

        {/* Corpo com Rolagem */}
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
          {/* ================= ABA 1: FÁRMACO ================= */}
          {activeTab === 'remedio' && (
            <div className="flex flex-col gap-3">
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <Pill size={16} color="var(--primary)" />
                  <span>Prescrição do Medicamento</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Medicamento</label>
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
                    placeholder="Ex: Administrar 1 ampola SC 3 vezes na semana - 12 ampolas/mês"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginTop: '0.85rem' }}>
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
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Vigência</label>
                    <select 
                      className="input-field" 
                      value={vigenciaMeses} 
                      onChange={(e) => handleDateOrVigenciaChange(dataSolicitacao, e.target.value)}
                    >
                      <option value="3">3 Meses</option>
                      <option value="6">6 Meses</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Início da Vigência</label>
                    <input 
                      type="date" 
                      className="input-field" 
                      value={dataSolicitacao} 
                      onChange={(e) => handleDateOrVigenciaChange(e.target.value, vigenciaMeses)} 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Data de Renovação</label>
                    <input 
                      type="date" 
                      className="input-field" 
                      value={dataValidade} 
                      onChange={(e) => setDataValidade(e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              {/* Justificativa Clínica Resumida */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <FileText size={16} color="var(--primary)" />
                  <span>Justificativa Médica</span>
                </h3>
                <textarea 
                  className="input-field" 
                  rows={4}
                  style={{ fontSize: '0.80rem', lineHeight: '1.45', fontFamily: 'inherit', resize: 'vertical' }}
                  value={clinicalText}
                  onChange={(e) => setClinicalText(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ================= ABA 2: FORMULÁRIO (MINAS GERAIS) ================= */}
          {activeTab === 'formulario' && (
            <div className="flex flex-col gap-3">
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2" style={{ margin: 0 }}>
                    <ClipboardCheck size={16} color="var(--primary)" />
                    <span>Questionário Obrigatório Farmácia de Minas</span>
                  </h3>
                  <span style={{ fontSize: '0.70rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                    {isAnemia ? 'Formulário: Alfaepoetina' : 'Formulário: Distúrbio Mineral Ósseo'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Tratamento</label>
                    <select 
                      className="input-field" 
                      value={tipoTratamento} 
                      onChange={(e) => setTipoTratamento(e.target.value)}
                    >
                      <option value="Hemodiálise">Hemodiálise</option>
                      <option value="Diálise peritoneal">Diálise peritoneal</option>
                      <option value="Conservador">Conservador</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Estágio da DRC</label>
                    <select 
                      className="input-field" 
                      value={estagioDRC} 
                      onChange={(e) => setEstagioDRC(e.target.value)}
                    >
                      <option value="5D">5D (&lt; 15 em diálise)</option>
                      <option value="5">5 (&lt; 15 falência renal)</option>
                      <option value="4">4 (15-29 grave)</option>
                      <option value="3">3 (30-59 moderada)</option>
                      <option value="*T">*T (Transplante renal)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Doença de Base</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={doencaBase} 
                      onChange={(e) => setDoencaBase(e.target.value)}
                      placeholder="Ex: Doença Renal do Diabetes"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Anamnese no Formulário</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={anamneseTexto} 
                    onChange={(e) => setAnamneseTexto(e.target.value)}
                    placeholder="Resumo da anamnese"
                  />
                </div>

                <div className="mt-3">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tratamento Prévio e Atual</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={tratamentoPrevio} 
                    onChange={(e) => setTratamentoPrevio(e.target.value)}
                    placeholder="Ex: Hemodiálise e Dieta"
                  />
                </div>
              </div>

              {/* Campos específicos se Anemia */}
              {isAnemia && (
                <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
                  <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase">Parâmetros de Alfaepoetina</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">1º Tratamento com EPO?</label>
                      <select 
                        className="input-field" 
                        value={isPrimeiroTratamento ? 'sim' : 'nao'}
                        onChange={(e) => setIsPrimeiroTratamento(e.target.value === 'sim')}
                      >
                        <option value="sim">Sim (Primeiro Tratamento)</option>
                        <option value="nao">Não (Tratamento Anterior)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Recebendo Transfusão de Sangue?</label>
                      <select 
                        className="input-field" 
                        value={recebendoTransfusao ? 'sim' : 'nao'}
                        onChange={(e) => setRecebendoTransfusao(e.target.value === 'sim')}
                      >
                        <option value="nao">Não</option>
                        <option value="sim">Sim</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Dose Solicitada</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={doseSolicitadaTexto} 
                        onChange={(e) => setDoseSolicitadaTexto(e.target.value)}
                        placeholder="Ex: 3000ui 3 vezes por semana"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Campos específicos se DMO */}
              {isDmo && (
                <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
                  <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase">Histórico de Transplante e Cirurgias</h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Já Fez Transplante Renal?</label>
                      <select 
                        className="input-field" 
                        value={transplantePrevio ? 'sim' : 'nao'}
                        onChange={(e) => setTransplantePrevio(e.target.value === 'sim')}
                      >
                        <option value="nao">Não</option>
                        <option value="sim">Sim</option>
                      </select>
                    </div>

                    {transplantePrevio && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Descrição do Transplante</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={transplanteDescricao} 
                          onChange={(e) => setTransplanteDescricao(e.target.value)}
                          placeholder="Ex: Tx doador falecido em 15/03/2018 - perda por disfunção primária..."
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Realizou Paratireoidectomia?</label>
                      <select 
                        className="input-field" 
                        value={paratireoidectomia ? 'sim' : 'nao'}
                        onChange={(e) => setParatireoidectomia(e.target.value === 'sim')}
                      >
                        <option value="nao">Não</option>
                        <option value="sim">Sim</option>
                      </select>
                    </div>

                    {paratireoidectomia && (
                      <>
                        <div>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">Fome Óssea pós Cirurgia?</label>
                          <select 
                            className="input-field" 
                            value={fomeOssea ? 'sim' : 'nao'}
                            onChange={(e) => setFomeOssea(e.target.value === 'sim')}
                          >
                            <option value="nao">Não</option>
                            <option value="sim">Sim</option>
                          </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label className="text-xs font-semibold text-slate-700 block mb-1">Detalhes da Paratireoidectomia</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            value={paratireoidectomiaDetalhes} 
                            onChange={(e) => setParatireoidectomiaDetalhes(e.target.value)}
                            placeholder="Data e evolução cirúrgica"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Outras Informações */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Outras Informações Pertinentes</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={outrasInformacoes} 
                  onChange={(e) => setOutrasInformacoes(e.target.value)}
                  placeholder="Informações adicionais para a perícia médica da SES-MG"
                />
              </div>
            </div>
          )}

          {/* ================= ABA 3: EXAMES ================= */}
          {activeTab === 'exames' && (
            <div className="flex flex-col gap-3">
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2" style={{ margin: 0 }}>
                    <Sparkles size={16} color="var(--primary)" />
                    <span>Auditoria de Critérios do SUS</span>
                  </h3>
                </div>

                {/* Avisos do Auditor */}
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

                {/* Exames Obrigatórios */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-2">Resultados Laboratoriais Anexados:</span>
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
            </div>
          )}

          {/* ================= ABA 4: CLÍNICA & MÉDICO ================= */}
          {activeTab === 'clinica' && (
            <div className="flex flex-col gap-3">
              {/* Médico Solicitante */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <Stethoscope size={16} color="var(--primary)" />
                  <span>Médico Solicitante</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <span className="text-2xs text-muted block">Nome</span>
                    <strong className="text-xs text-slate-800 block truncate">{doctorInfo?.nome || 'Médico Nefrologista'}</strong>
                  </div>
                  <div>
                    <span className="text-2xs text-muted block">CRM / UF</span>
                    <span className="text-xs text-slate-700 font-semibold">{doctorInfo?.crm || '—'} / {doctorInfo?.ufCrm || 'MG'}</span>
                  </div>
                  <div>
                    <label className="text-2xs font-semibold text-slate-700 block mb-0.5">
                      CNS do Médico (Obrigatório) *
                    </label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={medicoCns} 
                      onChange={(e) => setMedicoCns(e.target.value.replace(/\D/g, '').slice(0, 15))}
                      placeholder="Ex: 898004770672707"
                      maxLength={15}
                      style={{ fontSize: '0.80rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Estabelecimento de Saúde Solicitante */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                  <Building2 size={16} color="var(--primary)" />
                  <span>Unidade Solicitante</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Nome do Estabelecimento</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={clinicaNome} 
                      onChange={(e) => setClinicaNome(e.target.value)}
                      placeholder="DIALIZE SAUDE"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">CNES</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={cnes} 
                      onChange={(e) => setCnes(e.target.value)}
                      placeholder="5920574"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Telefone da Unidade</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={clinicaTelefone} 
                      onChange={(e) => setClinicaTelefone(e.target.value)}
                      placeholder="(31)94510284"
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Endereço da Unidade</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={clinicaEndereco} 
                      onChange={(e) => setClinicaEndereco(e.target.value)}
                      placeholder="AV EDMEIA MATTOS LAZZAROTTI 1655"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Bairro</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={clinicaBairro} 
                      onChange={(e) => setClinicaBairro(e.target.value)}
                      placeholder="ANGOLA"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">CEP</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={clinicaCep} 
                      onChange={(e) => setClinicaCep(e.target.value)}
                      placeholder="32604155"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Cidade / UF</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="input-field" 
                        value={clinicaCidade} 
                        onChange={(e) => setClinicaCidade(e.target.value)}
                        placeholder="BETIM"
                      />
                      <input 
                        type="text" 
                        className="input-field" 
                        style={{ width: '60px' }}
                        value={clinicaUf} 
                        onChange={(e) => setClinicaUf(e.target.value.toUpperCase())}
                        maxLength={2}
                        placeholder="MG"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Raça/Cor do Paciente */}
              <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Raça/Cor Informada pelo Paciente</label>
                <select 
                  className="input-field" 
                  value={racaCor}
                  onChange={(e) => setRacaCor(e.target.value)}
                >
                  <option value="Parda">Parda</option>
                  <option value="Preta">Preta</option>
                  <option value="Branca">Branca</option>
                  <option value="Amarela">Amarela</option>
                  <option value="Indígena">Indígena</option>
                </select>
              </div>
            </div>
          )}
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
              disabled={saving || downloadingPdf || previewingPdf}
              style={{ fontSize: '0.82rem', borderRadius: '10px' }}
            >
              Cancelar
            </button>

            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={handlePreviewPdf}
              disabled={saving || downloadingPdf || previewingPdf}
              style={{ 
                fontSize: '0.82rem', 
                borderRadius: '10px',
                borderColor: '#cbd5e1',
                background: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Abrir pré-visualização completa do dossiê em nova aba"
            >
              {previewingPdf ? <Loader2 className="animate-spin" size={15} /> : <Eye size={15} color="#2563eb" />}
              <span>{previewingPdf ? 'Abrindo...' : 'Visualizar'}</span>
            </button>

            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={handleDownloadPdf}
              disabled={saving || downloadingPdf || previewingPdf}
              style={{ 
                fontSize: '0.82rem', 
                borderRadius: '10px',
                borderColor: '#cbd5e1',
                background: '#f8fafc',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Baixar Dossiê Farmácia de Minas Completo em PDF"
            >
              {downloadingPdf ? <Loader2 className="animate-spin" size={15} /> : <Download size={15} color="#2563eb" />}
              <span>{downloadingPdf ? 'Gerando...' : 'PDF'}</span>
            </button>

            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving || downloadingPdf || previewingPdf}
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
