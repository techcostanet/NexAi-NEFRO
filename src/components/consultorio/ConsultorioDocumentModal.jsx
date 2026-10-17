import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Printer, 
  FileDown, 
  FileText, 
  Plus, 
  Trash2, 
  Check, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  FlaskConical,
  Stethoscope,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { EXAM_KITS, createConsultorioDocument } from '../../services/consultorioService';
import { downloadPdfDocument } from '../../services/pdfService';
import { printElement } from '../../utils/printUtils';
import { safeFormatDateExtenso } from '../../utils/dateUtils';
import ConsultorioDocumentPdf from './ConsultorioDocumentPdf';

export default function ConsultorioDocumentModal({
  isOpen,
  onClose,
  patients = [],
  doctorInfo = null,
  initialPatient = null,
  initialTipo = 'exames',
  onSuccess
}) {
  const [tipo, setTipo] = useState('exames'); // 'exames' | 'atestado' | 'comparecimento' | 'parecer'
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientMode, setPatientMode] = useState('existing'); // 'existing' | 'avulso'
  const [patientNome, setPatientNome] = useState('');
  const [patientCpf, setPatientCpf] = useState('');
  const [dataEmissao, setDataEmissao] = useState('');

  // Estados específicos de Exames
  const [selectedKit, setSelectedKit] = useState('checkup');
  const [examesList, setExamesList] = useState([]);
  const [customExamInput, setCustomExamInput] = useState('');
  const [justificativa, setJustificativa] = useState('Acompanhamento nefrológico ambulatorial especializado.');

  // Estados específicos de Atestado
  const [diasRepouso, setDiasRepouso] = useState(2);
  const [cid, setCid] = useState('');
  const [cidConsentimento, setCidConsentimento] = useState(true);
  const [observacoesAtestado, setObservacoesAtestado] = useState('');

  // Estados específicos de Comparecimento
  const [paraAcompanhante, setParaAcompanhante] = useState(false);
  const [nomeAcompanhante, setNomeAcompanhante] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFim, setHoraFim] = useState('10:00');

  // Estados específicos de Parecer
  const [tipoParecer, setTipoParecer] = useState('risco_cirurgico');
  const [textoParecer, setTextoParecer] = useState('');
  const [conclusaoParecer, setConclusaoParecer] = useState('');

  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  // Inicialização ao abrir modal
  useEffect(() => {
    if (!isOpen) return;

    setTipo(initialTipo || 'exames');
    setDataEmissao(new Date().toISOString().split('T')[0]);

    if (initialPatient) {
      setSelectedPatientId(initialPatient.id || '');
      setPatientNome(initialPatient.nome || '');
      setPatientCpf(initialPatient.cpf || '');
      setPatientMode(initialPatient.id ? 'existing' : 'avulso');
    } else {
      setSelectedPatientId(patients[0]?.id || '');
      setPatientNome(patients[0]?.nome || '');
      setPatientCpf(patients[0]?.cpf || '');
      setPatientMode(patients.length > 0 ? 'existing' : 'avulso');
    }

    // Carrega kit de exames inicial
    const kit = EXAM_KITS.find(k => k.id === 'checkup');
    if (kit) {
      setExamesList([...kit.exames]);
      setSelectedKit('checkup');
    }

    // Parecer padrão
    setTextoParecer('Paciente avaliado(a) ambulatorialmente. Exame físico sem congestão ou estigmas urêmicos agudos. PA controlada e função renal em acompanhamento estável.');
    setConclusaoParecer('Sem contraindicações renais imediatas. Recomenda-se hidratação adequada e profilaxia de nefrotoxicidade.');

    setError('');
  }, [isOpen, initialPatient, initialTipo, patients]);

  // Atualiza paciente selecionado
  const handleSelectPatient = (id) => {
    setSelectedPatientId(id);
    const p = patients.find(item => item.id === id);
    if (p) {
      setPatientNome(p.nome || '');
      setPatientCpf(p.cpf || '');
    }
  };

  // Trocar kit de exames
  const handleKitChange = (kitId) => {
    setSelectedKit(kitId);
    const found = EXAM_KITS.find(k => k.id === kitId);
    if (found) {
      setExamesList([...found.exames]);
    }
  };

  // Adicionar exame manual à lista
  const handleAddCustomExam = (e) => {
    e.preventDefault();
    if (!customExamInput.trim()) return;
    setExamesList(prev => [...prev, customExamInput.trim()]);
    setCustomExamInput('');
  };

  // Remover exame da lista
  const handleRemoveExam = (index) => {
    setExamesList(prev => prev.filter((_, i) => i !== index));
  };

  // Montar payload atual do documento
  const buildPayload = () => {
    const payload = {
      tipo,
      patientId: patientMode === 'existing' ? selectedPatientId : null,
      patientNome: patientNome.trim(),
      patientCpf: patientCpf.trim(),
      doctorId: doctorInfo?.id || 'dr-marcelo',
      data: dataEmissao
    };

    if (tipo === 'exames') {
      payload.kitNome = EXAM_KITS.find(k => k.id === selectedKit)?.nome || 'Personalizado';
      payload.exames = examesList;
      payload.justificativa = justificativa;
    } else if (tipo === 'atestado') {
      payload.diasRepouso = Number(diasRepouso) || 1;
      payload.cid = cid.trim();
      payload.cidConsentimento = cidConsentimento;
      payload.observacoes = observacoesAtestado;
    } else if (tipo === 'comparecimento') {
      payload.paraAcompanhante = paraAcompanhante;
      payload.nomeAcompanhante = nomeAcompanhante.trim();
      payload.horaInicio = horaInicio;
      payload.horaFim = horaFim;
    } else if (tipo === 'parecer') {
      payload.tipoParecer = tipoParecer;
      payload.textoParecer = textoParecer;
      payload.conclusao = conclusaoParecer;
    }

    return payload;
  };

  // Salvar no Firestore
  const handleSave = async () => {
    if (!patientNome.trim()) {
      setError('Informe o nome do paciente.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const payload = buildPayload();
      await createConsultorioDocument(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao emitir documento:', err);
      setError('Falha ao salvar documento no banco de dados.');
    } finally {
      setSaving(false);
    }
  };

  // Baixar PDF Oficial
  const handleDownloadPdf = async () => {
    if (!patientNome.trim()) {
      setError('Informe o nome do paciente.');
      return;
    }

    try {
      setDownloading(true);
      const payload = buildPayload();
      const patientObj = { nome: patientNome, cpf: patientCpf };
      const safeName = patientNome.replace(/\s+/g, '_');
      const fileName = `${tipo.toUpperCase()}_${safeName}_${dataEmissao}.pdf`;

      await downloadPdfDocument(
        <ConsultorioDocumentPdf
          documentData={payload}
          patient={patientObj}
          doctorInfo={doctorInfo}
        />,
        fileName
      );
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      setError('Não foi possível gerar o arquivo PDF.');
    } finally {
      setDownloading(false);
    }
  };

  // Imprimir
  const handlePrint = () => {
    printElement('printable-consultorio-doc', `${tipo.toUpperCase()} - ${patientNome}`);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay animate-in"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div 
        className="glass-panel"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* CABEÇALHO DO MODAL */}
        <div 
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900" style={{ margin: 0 }}>
                Documento Ambulatorial
              </h2>
              <p className="text-xs text-slate-500" style={{ margin: 0 }}>
                Emissão timbrada e integração com prontuário
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '6px', borderRadius: '8px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* CORPO DO FORMULÁRIO */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }} className="flex flex-col gap-4">
          
          {error && (
            <div 
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* SELEÇÃO DO TIPO DE DOCUMENTO (Segmented Pill) */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Tipo:
            </label>
            <div 
              style={{
                display: 'flex',
                background: '#f1f5f9',
                padding: '4px',
                borderRadius: '12px',
                gap: '4px',
                flexWrap: 'wrap'
              }}
            >
              {[
                { id: 'exames', label: 'Exames', icon: FlaskConical },
                { id: 'atestado', label: 'Atestado', icon: ShieldCheck },
                { id: 'comparecimento', label: 'Comparecimento', icon: Clock },
                { id: 'parecer', label: 'Parecer', icon: Stethoscope }
              ].map(item => {
                const Icon = item.icon;
                const isSelected = tipo === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTipo(item.id)}
                    style={{
                      flex: 1,
                      minWidth: '120px',
                      padding: '0.45rem 0.8rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? '700' : '600',
                      background: isSelected ? '#ffffff' : 'transparent',
                      color: isSelected ? '#2563eb' : '#64748b',
                      border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent',
                      boxShadow: isSelected ? '0 2px 4px rgba(37, 99, 235, 0.1)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={14} color={isSelected ? '#2563eb' : '#64748b'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DADOS DO PACIENTE */}
          <div 
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}
          >
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Identificação do Paciente:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPatientMode('existing')}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: patientMode === 'existing' ? '700' : '500',
                    color: patientMode === 'existing' ? '#2563eb' : '#64748b',
                    background: patientMode === 'existing' ? '#eff6ff' : 'transparent',
                    border: '1px solid',
                    borderColor: patientMode === 'existing' ? '#bfdbfe' : '#cbd5e1',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    cursor: 'pointer'
                  }}
                >
                  Cadastrado
                </button>
                <button
                  type="button"
                  onClick={() => setPatientMode('avulso')}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: patientMode === 'avulso' ? '700' : '500',
                    color: patientMode === 'avulso' ? '#2563eb' : '#64748b',
                    background: patientMode === 'avulso' ? '#eff6ff' : 'transparent',
                    border: '1px solid',
                    borderColor: patientMode === 'avulso' ? '#bfdbfe' : '#cbd5e1',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    cursor: 'pointer'
                  }}
                >
                  Avulso
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {patientMode === 'existing' ? (
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-600 block mb-1">Selecionar:</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => handleSelectPatient(e.target.value)}
                    className="form-control text-xs w-full"
                    style={{ padding: '0.45rem', borderRadius: '8px' }}
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome} {p.cpf ? `(${p.cpf})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-600 block mb-1">Nome:</label>
                  <input
                    type="text"
                    value={patientNome}
                    onChange={(e) => setPatientNome(e.target.value)}
                    placeholder="Nome completo do paciente"
                    className="form-control text-xs w-full"
                    style={{ padding: '0.45rem', borderRadius: '8px' }}
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-slate-600 block mb-1">CPF:</label>
                <input
                  type="text"
                  value={patientCpf}
                  onChange={(e) => setPatientCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="form-control text-xs w-full"
                  style={{ padding: '0.45rem', borderRadius: '8px' }}
                />
              </div>
            </div>
          </div>

          {/* CAMPOS ESPECÍFICOS: EXAMES */}
          {tipo === 'exames' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Kits Pré-Configurados em Nefrologia:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {EXAM_KITS.map(kit => (
                    <button
                      key={kit.id}
                      type="button"
                      onClick={() => handleKitChange(kit.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.76rem',
                        fontWeight: selectedKit === kit.id ? '700' : '500',
                        background: selectedKit === kit.id ? '#eff6ff' : '#ffffff',
                        color: selectedKit === kit.id ? '#1d4ed8' : '#475569',
                        border: '1px solid',
                        borderColor: selectedKit === kit.id ? '#93c5fd' : '#cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {kit.nome}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Exames Solicitados ({examesList.length}):
                </label>
                <div 
                  style={{
                    maxHeight: '190px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '8px',
                    background: '#ffffff'
                  }}
                  className="flex flex-col gap-1.5"
                >
                  {examesList.map((exam, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8fafc',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #f1f5f9'
                      }}
                    >
                      <span className="text-xs text-slate-800">• {exam}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExam(idx)}
                        className="text-slate-400 hover:text-red-600"
                        title="Remover exame"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adicionar Exame Customizado */}
              <form onSubmit={handleAddCustomExam} className="flex gap-2">
                <input
                  type="text"
                  value={customExamInput}
                  onChange={(e) => setCustomExamInput(e.target.value)}
                  placeholder="Digitar exame extra (ex: Cistatina C sérica)"
                  className="form-control text-xs flex-1"
                  style={{ padding: '0.45rem', borderRadius: '8px' }}
                />
                <button
                  type="submit"
                  className="btn btn-outline"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', borderRadius: '8px' }}
                >
                  <Plus size={14} />
                  <span>Adicionar</span>
                </button>
              </form>

              <div>
                <label className="text-xs text-slate-700 block mb-1 font-semibold">
                  Justificativa Clínica:
                </label>
                <input
                  type="text"
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  className="form-control text-xs w-full"
                  style={{ padding: '0.45rem', borderRadius: '8px' }}
                />
              </div>
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS: ATESTADO */}
          {tipo === 'atestado' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-semibold">
                    Dias de Afastamento:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={diasRepouso}
                    onChange={(e) => setDiasRepouso(e.target.value)}
                    className="form-control text-xs w-full"
                    style={{ padding: '0.45rem', borderRadius: '8px' }}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-semibold">
                    CID-10 (Opcional):
                  </label>
                  <input
                    type="text"
                    value={cid}
                    onChange={(e) => setCid(e.target.value)}
                    placeholder="Ex: N18.3, N20.0"
                    className="form-control text-xs w-full"
                    style={{ padding: '0.45rem', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cidConsent"
                  checked={cidConsentimento}
                  onChange={(e) => setCidConsentimento(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="cidConsent" className="text-xs text-slate-600" style={{ cursor: 'pointer' }}>
                  Com consentimento expresso do paciente para declaração do diagnóstico (Resolução CFM 1.658/2002)
                </label>
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1 font-semibold">
                  Observações:
                </label>
                <textarea
                  value={observacoesAtestado}
                  onChange={(e) => setObservacoesAtestado(e.target.value)}
                  rows="2"
                  placeholder="Informações adicionais relevantes"
                  className="form-control text-xs w-full"
                  style={{ padding: '0.45rem', borderRadius: '8px' }}
                />
              </div>
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS: COMPARECIMENTO */}
          {tipo === 'comparecimento' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chkAcomp"
                  checked={paraAcompanhante}
                  onChange={(e) => setParaAcompanhante(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="chkAcomp" className="text-xs font-semibold text-slate-700" style={{ cursor: 'pointer' }}>
                  Emitir para acompanhante
                </label>
              </div>

              {paraAcompanhante && (
                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-semibold">
                    Nome do Acompanhante:
                  </label>
                  <input
                    type="text"
                    value={nomeAcompanhante}
                    onChange={(e) => setNomeAcompanhante(e.target.value)}
                    placeholder="Nome completo do acompanhante"
                    className="form-control text-xs w-full"
                    style={{ padding: '0.45rem', borderRadius: '8px' }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-semibold">
                    Horário Início:
                  </label>
                  <input
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="form-control text-xs w-full"
                    style={{ padding: '0.45rem', borderRadius: '8px' }}
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 block mb-1 font-semibold">
                    Horário Fim:
                  </label>
                  <input
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                    className="form-control text-xs w-full"
                    style={{ padding: '0.45rem', borderRadius: '8px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS: PARECER */}
          {tipo === 'parecer' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-700 block mb-1 font-semibold">
                  Texto da Avaliação Nefrológica:
                </label>
                <textarea
                  value={textoParecer}
                  onChange={(e) => setTextoParecer(e.target.value)}
                  rows="4"
                  className="form-control text-xs w-full"
                  style={{ padding: '0.5rem', borderRadius: '8px', lineHeight: 1.5 }}
                />
              </div>

              <div>
                <label className="text-xs text-slate-700 block mb-1 font-semibold">
                  Conclusão e Recomendações:
                </label>
                <input
                  type="text"
                  value={conclusaoParecer}
                  onChange={(e) => setConclusaoParecer(e.target.value)}
                  className="form-control text-xs w-full"
                  style={{ padding: '0.45rem', borderRadius: '8px' }}
                />
              </div>
            </div>
          )}

          {/* ÁREA DE PRÉ-VISUALIZAÇÃO OCULTA PARA IMPRESSÃO */}
          <div id="printable-consultorio-doc" style={{ display: 'none' }}>
            <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif' }}>
              <h2 style={{ color: '#1e3a8a', textAlign: 'center' }}>
                {doctorInfo?.clinicaPrincipal || 'Consultório Nefrológico'}
              </h2>
              <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                {doctorInfo?.nome} • CRM {doctorInfo?.crm}/{doctorInfo?.ufCrm}
              </p>
              <hr style={{ margin: '16px 0' }} />
              <h3>Paciente: {patientNome}</h3>
              <p>CPF: {patientCpf || 'Não informado'}</p>
              <div style={{ margin: '20px 0' }}>
                {tipo === 'exames' && examesList.map((ex, i) => (
                  <div key={i}>• {ex}</div>
                ))}
                {tipo === 'atestado' && (
                  <p>Atesto que o(a) paciente necessita de {diasRepouso} dia(s) de repouso.</p>
                )}
                {tipo === 'comparecimento' && (
                  <p>Declaro comparecimento no período de {horaInicio} às {horaFim}.</p>
                )}
                {tipo === 'parecer' && (
                  <p>{textoParecer}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ DO MODAL COM BOTÕES CONCISOS (REGRA DE 1 PALAVRA) */}
        <div 
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1rem', borderRadius: '10px' }}
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-outline"
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={15} />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="btn btn-outline"
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                borderColor: '#93c5fd',
                background: '#eff6ff',
                color: '#1d4ed8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {downloading ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
              <span>Baixar</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>Salvar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
