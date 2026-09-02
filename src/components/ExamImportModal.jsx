import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Loader2, 
  Save, 
  Calendar, 
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { parseExamFile, commitImportedExams } from '../services/examImportService';
import { useAuth } from '../context/AuthContext';

export default function ExamImportModal({ 
  isOpen, 
  onClose, 
  patients = [], 
  doctorId, 
  onImportComplete,
  preselectedPatientId = null 
}) {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState('');

  // Dados pós-processamento
  const [parsedData, setParsedData] = useState(null);
  const [records, setRecords] = useState([]);
  const [globalDate, setGlobalDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file) => {
    setSelectedFile(file);
    setError('');
    setSuccessMessage('');
    setLoading(true);
    setProgressPercent(10);
    setProgressText('Lendo estrutura do arquivo...');

    try {
      const result = await parseExamFile(file, patients, (percent, text) => {
        setProgressPercent(percent);
        setProgressText(text);
      });

      setParsedData(result);
      setGlobalDate(result.dataSugerida || new Date().toISOString().split('T')[0]);

      // Se foi aberto de dentro do prontuário com um paciente pré-selecionado
      if (preselectedPatientId) {
        const found = patients.find(p => p.id === preselectedPatientId);
        if (found && result.registros.length === 1) {
          result.registros[0].pacienteId = found.id;
          result.registros[0].pacienteNome = found.nome;
          result.registros[0].statusMatch = 'EXACT_OR_HIGH';
          result.registros[0].confianca = 100;
          result.registros[0].confirmado = true;
        }
      }

      setRecords(result.registros);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao processar o arquivo. Verifique o formato.');
      setSelectedFile(null);
      setParsedData(null);
    } finally {
      setLoading(false);
    }
  };

  // Alterar data de todos os registros
  const handleApplyGlobalDate = (newDate) => {
    setGlobalDate(newDate);
    setRecords(prev => prev.map(r => ({ ...r, dataExame: newDate })));
  };

  // Alternar confirmação individual
  const toggleConfirmRecord = (recordId) => {
    setRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return { ...r, confirmado: !r.confirmado };
      }
      return r;
    }));
  };

  // Alternar todos
  const toggleSelectAll = () => {
    const allChecked = records.every(r => r.confirmado);
    setRecords(prev => prev.map(r => ({ ...r, confirmado: !allChecked && !!r.pacienteId })));
  };

  // Alterar paciente vinculado manualmente
  const handleChangePatient = (recordId, newPatientId) => {
    const selectedPatient = patients.find(p => p.id === newPatientId);
    setRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          pacienteId: newPatientId,
          pacienteNome: selectedPatient ? selectedPatient.nome : '',
          statusMatch: newPatientId ? 'EXACT_OR_HIGH' : 'NOT_FOUND',
          confianca: newPatientId ? 100 : 0,
          confirmado: !!newPatientId
        };
      }
      return r;
    }));
  };

  // Alterar data individual
  const handleChangeRecordDate = (recordId, newDate) => {
    setRecords(prev => prev.map(r => {
      if (r.id === recordId) return { ...r, dataExame: newDate };
      return r;
    }));
  };

  // Remover registro da lista
  const handleRemoveRecord = (recordId) => {
    setRecords(prev => prev.filter(r => r.id !== recordId));
  };

  // Gravar no Firestore
  const handleCommit = async () => {
    const toImport = records.filter(r => r.confirmado && r.pacienteId);
    if (toImport.length === 0) {
      setError('Selecione pelo menos um paciente com correspondência válida para importar.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const res = await commitImportedExams(doctorId, toImport, currentUser?.displayName || currentUser?.email);
      
      setSuccessMessage(`Sucesso! ${res.count} registro(s) de exames foram gravados no Cloud Firestore.`);
      if (onImportComplete) {
        onImportComplete(res.count);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar no Firestore: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedData(null);
    setRecords([]);
    setError('');
    setSuccessMessage('');
  };

  const confirmedCount = records.filter(r => r.confirmado && r.pacienteId).length;
  const matchHighCount = records.filter(r => r.statusMatch === 'EXACT_OR_HIGH').length;
  const matchSuggestionCount = records.filter(r => r.statusMatch === 'SUGGESTION').length;
  const matchNotFoundCount = records.filter(r => r.statusMatch === 'NOT_FOUND' || !r.pacienteId).length;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(15, 23, 42, 0.7)', 
        backdropFilter: 'blur(6px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-in" 
        style={{ 
          background: 'var(--surface-solid)', 
          width: '100%', 
          maxWidth: '1050px', 
          maxHeight: '92vh', 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', 
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          borderRadius: '20px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center pb-3 border-b mb-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '8px', borderRadius: '12px' }}>
              <Sparkles size={22} color="var(--primary)" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Importador Inteligente de Exames
              </h2>
              <p className="text-xs text-muted">
                Processamento automatizado de laudos e planilhas com correspondência fonética de pacientes
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

        {/* Mensagens de Alerta & Sucesso */}
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#059669" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ================= ETAPA 1: UPLOAD DE ARQUIVO ================= */}
        {!parsedData && !loading && (
          <div className="flex flex-col gap-4 my-auto py-6">
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed',
                borderColor: dragActive ? 'var(--primary)' : '#cbd5e1',
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragActive ? 'rgba(37, 99, 235, 0.05)' : '#f8fafc',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem'
              }}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx,.xls,.csv,.docx,.doc,.pdf,image/*" 
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />

              <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '50%', color: '#2563eb' }}>
                <UploadCloud size={42} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Arraste e solte o arquivo aqui, ou <span className="text-blue-600 underline">clique para selecionar</span>
                </h3>
                <p className="text-xs text-muted mt-1">
                  Formatos suportados: <strong>Excel (.xlsx, .xls)</strong>, <strong>PDF (.pdf)</strong>, <strong>Word (.docx)</strong> e <strong>Fotos/Imagens (.jpg, .png)</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
                <span className="badge badge-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                  <FileSpreadsheet size={13} color="#059669" /> Excel / CSV
                </span>
                <span className="badge badge-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                  <FileText size={13} color="#dc2626" /> Laudos em PDF
                </span>
                <span className="badge badge-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                  <FileText size={13} color="#2563eb" /> Word (.docx)
                </span>
                <span className="badge badge-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                  <ImageIcon size={13} color="#d97706" /> Fotos / OCR
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border text-xs text-slate-600 flex flex-col gap-1.5" style={{ borderColor: 'var(--border)' }}>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles size={14} color="#2563eb" />
                <span>Como funciona o reconhecimento inteligente?</span>
              </div>
              <p>• O sistema lê os nomes dos pacientes no arquivo e localiza os registros correspondentes na sua lista, tolerando abreviações (ex: <em>ALAN A. TEIXEIRA</em> vincula a <em>ALAN ALVES TEIXEIRA</em>).</p>
              <p>• Reconhece siglas laboratoriais padronizadas: <strong>Hb, Ht, Ferritina, IST, PTH, P, Ca, K, Kt/V, Albumina, Creatinina, PCR, etc.</strong></p>
              <p>• Antes de gravar qualquer dado no banco, você poderá conferir e ajustar as informações na tela de reconciliação.</p>
            </div>
          </div>
        )}

        {/* ================= ETAPA 2: PROCESSANDO ================= */}
        {loading && (
          <div className="flex flex-col items-center justify-center my-auto py-16 gap-4 animate-in">
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            <div className="text-center">
              <h3 className="font-bold text-base text-slate-800">{progressText}</h3>
              <p className="text-xs text-muted mt-1">Lendo dados e calculando similaridade com seus pacientes...</p>
            </div>
            
            <div style={{ width: '280px', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '0.5rem' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }}></div>
            </div>
          </div>
        )}

        {/* ================= ETAPA 3: RECONCILIAÇÃO & CONFERÊNCIA ================= */}
        {parsedData && !loading && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Barra Resumo de Detecção */}
            <div className="flex justify-between items-center gap-3 flex-wrap p-3 mb-3 rounded-xl bg-slate-50 border" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-bold text-slate-700">Arquivo:</span>
                  <span className="text-slate-900 font-medium">{selectedFile?.name}</span>
                  <span className="badge" style={{ background: '#e0e7ff', color: '#3730a3', fontSize: '0.7rem' }}>
                    {parsedData.tipoArquivo}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#ecfdf5', color: '#047857', fontWeight: 'bold' }}>
                    🟢 {matchHighCount} vinculados
                  </span>
                  {matchSuggestionCount > 0 && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#fef3c7', color: '#92400e', fontWeight: 'bold' }}>
                      🟡 {matchSuggestionCount} sugeridos
                    </span>
                  )}
                  {matchNotFoundCount > 0 && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#fee2e2', color: '#991b1b', fontWeight: 'bold' }}>
                      🔴 {matchNotFoundCount} sem vínculo
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <Calendar size={13} color="var(--primary)" />
                  <span>Data da Coleta:</span>
                </label>
                <input 
                  type="date" 
                  className="input-field" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: '135px' }}
                  value={globalDate}
                  onChange={(e) => handleApplyGlobalDate(e.target.value)}
                  title="Aplica esta data a todos os exames"
                />
              </div>
            </div>

            {/* Tabela de Reconciliação */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1, borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '0.65rem 0.75rem', width: '40px', textAlign: 'center' }}>
                      <button 
                        type="button" 
                        onClick={toggleSelectAll} 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Selecionar / Desmarcar todos"
                      >
                        {records.every(r => r.confirmado) ? (
                          <CheckSquare size={16} color="var(--primary)" />
                        ) : (
                          <Square size={16} color="#94a3b8" />
                        )}
                      </button>
                    </th>
                    <th style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>Nome no Arquivo</th>
                    <th style={{ padding: '0.65rem 0.75rem', color: '#475569', minWidth: '220px' }}>Paciente Vinculado (NexAi)</th>
                    <th style={{ padding: '0.65rem 0.75rem', color: '#475569', width: '130px' }}>Data</th>
                    <th style={{ padding: '0.65rem 0.75rem', color: '#475569' }}>Exames Identificados</th>
                    <th style={{ padding: '0.65rem 0.75rem', width: '40px', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => {
                    const examKeys = Object.keys(rec.exames || {});
                    const isMatched = !!rec.pacienteId;

                    return (
                      <tr 
                        key={rec.id} 
                        style={{ 
                          borderBottom: '1px solid var(--border)',
                          background: rec.confirmado ? '#ffffff' : '#f8fafc',
                          opacity: rec.confirmado ? 1 : 0.65
                        }}
                      >
                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                          <button 
                            type="button" 
                            onClick={() => toggleConfirmRecord(rec.id)}
                            disabled={!rec.pacienteId}
                            style={{ background: 'transparent', border: 'none', cursor: isMatched ? 'pointer' : 'not-allowed' }}
                          >
                            {rec.confirmado ? (
                              <CheckSquare size={16} color="var(--primary)" />
                            ) : (
                              <Square size={16} color="#cbd5e1" />
                            )}
                          </button>
                        </td>

                        <td style={{ padding: '0.65rem 0.75rem', fontWeight: '600', color: '#1e293b' }}>
                          <div className="flex items-center gap-1.5">
                            <span>{rec.nomeArquivo}</span>
                          </div>
                        </td>

                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <select 
                            className="input-field" 
                            style={{ 
                              padding: '0.35rem 0.5rem', 
                              fontSize: '0.78rem',
                              borderColor: rec.statusMatch === 'EXACT_OR_HIGH' ? '#a7f3d0' : rec.statusMatch === 'SUGGESTION' ? '#fde68a' : '#fca5a5',
                              background: rec.statusMatch === 'EXACT_OR_HIGH' ? '#f0fdf4' : rec.statusMatch === 'SUGGESTION' ? '#fffbeb' : '#fef2f2'
                            }}
                            value={rec.pacienteId}
                            onChange={(e) => handleChangePatient(rec.id, e.target.value)}
                          >
                            <option value="">-- Não associado (ignorar) --</option>
                            {patients.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.nome} ({p.clinica || 'Sem clínica'})
                              </option>
                            ))}
                          </select>
                          {rec.confianca > 0 && rec.confianca < 100 && (
                            <span className="text-2xs text-amber-700 block mt-0.5 font-medium">
                              Similaridade fonética: {rec.confianca}%
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <input 
                            type="date" 
                            className="input-field" 
                            style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }}
                            value={rec.dataExame}
                            onChange={(e) => handleChangeRecordDate(rec.id, e.target.value)}
                          />
                        </td>

                        <td style={{ padding: '0.65rem 0.75rem' }}>
                          <div className="flex items-center gap-1 flex-wrap">
                            {examKeys.length === 0 ? (
                              <span className="text-xs text-muted">Nenhum exame numérico extraído</span>
                            ) : (
                              examKeys.slice(0, 6).map(key => (
                                <span 
                                  key={key} 
                                  style={{ 
                                    padding: '2px 6px', 
                                    borderRadius: '6px', 
                                    background: '#f1f5f9', 
                                    border: '1px solid #e2e8f0', 
                                    fontSize: '0.72rem',
                                    fontWeight: '500',
                                    color: '#334155'
                                  }}
                                >
                                  <strong>{key.toUpperCase()}:</strong> {rec.exames[key]}
                                </span>
                              ))
                            )}
                            {examKeys.length > 6 && (
                              <span className="text-2xs text-muted font-bold">
                                +{examKeys.length - 6} outros
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveRecord(rec.id)}
                            className="btn btn-outline" 
                            style={{ padding: '0.25rem', borderRadius: '6px', border: 'none' }}
                            title="Remover este paciente da importação"
                          >
                            <Trash2 size={14} color="#94a3b8" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Rodapé de Ações */}
            <div className="flex justify-between items-center gap-3 pt-3 border-t flex-wrap" style={{ borderColor: 'var(--border)' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={handleReset}
                disabled={saving}
                style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} />
                <span>Escolher Outro Arquivo</span>
              </button>

              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={onClose} 
                  disabled={saving}
                  style={{ fontSize: '0.82rem' }}
                >
                  Cancelar
                </button>

                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleCommit}
                  disabled={saving || confirmedCount === 0}
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', padding: '0.55rem 1.25rem' }}
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>{saving ? 'Gravando no Firestore...' : `Confirmar e Gravar (${confirmedCount})`}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
