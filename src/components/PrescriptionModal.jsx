import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Printer, 
  Plus, 
  Trash2, 
  Sparkles, 
  FileText, 
  Check, 
  AlertTriangle, 
  Copy, 
  Eye, 
  Edit3, 
  Pill, 
  Clock, 
  Calendar,
  Layers,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { DIALYSIS_MEDICATIONS_CATALOG } from '../data/dialysisMedications';
import { savePatientPrescription } from '../services/patientService';
import PrescriptionPrintDocument from './PrescriptionPrintDocument';

export default function PrescriptionModal({
  isOpen,
  onClose,
  patient,
  doctorInfo,
  prescriptionToEdit = null,
  initialTipo = 'simples',
  initialView = 'edit',
  onSaved
}) {
  const [activeView, setActiveView] = useState(initialView || 'edit'); // 'edit' | 'preview'
  const [tipoReceita, setTipoReceita] = useState(initialTipo);
  const [dataEmissao, setDataEmissao] = useState(new Date().toISOString().split('T')[0]);
  const [validadeDias, setValidadeDias] = useState(180);
  const [subtitulo, setSubtitulo] = useState('');
  const [itens, setItens] = useState([]);
  const [observacoesGerais, setObservacoesGerais] = useState('');
  const [incluirAlergias, setIncluirAlergias] = useState(true);
  const [previewVia, setPreviewVia] = useState(1); // 1 ou 2

  // Novo item em edição
  const [searchTerm, setSearchTerm] = useState('');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const catalogDropdownRef = useRef(null);

  // Inicializa dados quando modal abre ou muda
  useEffect(() => {
    if (!isOpen) return;

    if (prescriptionToEdit) {
      setTipoReceita(prescriptionToEdit.tipoReceita || 'simples');
      setDataEmissao(prescriptionToEdit.dataEmissao || new Date().toISOString().split('T')[0]);
      setValidadeDias(prescriptionToEdit.validadeDias || 180);
      setSubtitulo(prescriptionToEdit.subtitulo || '');
      setItens(Array.isArray(prescriptionToEdit.itens) ? [...prescriptionToEdit.itens] : []);
      setObservacoesGerais(prescriptionToEdit.observacoesGerais || '');
      setIncluirAlergias(prescriptionToEdit.incluirAlergias !== false);
    } else {
      setTipoReceita(initialTipo || 'simples');
      setDataEmissao(new Date().toISOString().split('T')[0]);
      setValidadeDias(initialTipo === 'antimicrobiano' ? 10 : (initialTipo === 'controle_especial' ? 30 : 180));
      setSubtitulo('');
      setItens([]);
      setObservacoesGerais('Recomenda-se manter rigor no controle da ingestão hídrica e adesão às orientações nutricionais da nefrologia. Retorno ambulatorial conforme agendamento.');
      setIncluirAlergias(true);
    }
    setActiveView(initialView || 'edit');
    setError('');
    setFeedbackMsg('');
    setSearchTerm('');
    setSelectedCatalogItem(null);
  }, [isOpen, prescriptionToEdit, initialTipo, initialView]);

  // Atualiza validade padrão ao trocar o tipo de receita
  const handleTipoChange = (novoTipo) => {
    setTipoReceita(novoTipo);
    if (novoTipo === 'controle_especial') {
      setValidadeDias(30);
    } else if (novoTipo === 'antimicrobiano') {
      setValidadeDias(10);
    } else if (novoTipo === 'alto_custo') {
      setValidadeDias(90);
    } else {
      setValidadeDias(180);
    }
  };

  // Fecha dropdown do catálogo ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (catalogDropdownRef.current && !catalogDropdownRef.current.contains(event.target)) {
        setIsCatalogOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen || !patient) return null;

  // 1-Clique: Importar todas as prescrições ativas do paciente
  const handleImportActiveMedications = () => {
    const ativas = (patient.medicamentos || []).filter(m => m.ativo !== false);
    if (ativas.length === 0) {
      setError('O paciente não possui medicamentos ativos cadastrados na aba Prescrições.');
      return;
    }

    const novosItens = ativas.map((m, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      medicamento: `${m.nome}${m.dosagem ? ` ${m.dosagem}` : ''}`,
      formaFarmaceutica: m.forma || (m.via === 'VO' ? 'Comprimidos' : 'Frasco-ampola'),
      quantidade: m.tipo === 'continuo' ? 'Uso Contínuo (3 caixas)' : 'Conforme prescrição',
      via: m.via || 'VO',
      posologia: m.frequencia ? `Tomar/aplicar ${m.frequencia}.` : 'Conforme orientação médica.',
      instrucoesAdicionais: m.observacao || '',
      origem: 'prescricao_ativa'
    }));

    setItens(prev => [...prev, ...novosItens]);
    setFeedbackMsg(`⚡ ${novosItens.length} medicamentos ativos importados com sucesso!`);
    setTimeout(() => setFeedbackMsg(''), 4000);
    setError('');
  };

  // Inserção rápida de Kits Nefrológicos predefinidos
  const handleApplyPreset = (presetName) => {
    let novos = [];
    if (presetName === 'anemia') {
      novos = [
        {
          id: `item-${Date.now()}-1`,
          medicamento: 'Alfaepoetina (EPO) 4.000 UI',
          formaFarmaceutica: 'Frasco-ampola injetável',
          quantidade: '12 frascos-ampola',
          via: 'SC pós-HD',
          posologia: 'Aplicar 1 frasco-ampola (4.000 UI) por via subcutânea, 3x por semana, ao término da sessão de hemodiálise.',
          instrucoesAdicionais: 'Manter estritamente refrigerado entre 2°C e 8°C. Não congelar.'
        },
        {
          id: `item-${Date.now()}-2`,
          medicamento: 'Sacarato de Hidróxido Férrico (Noripurum) 100mg',
          formaFarmaceutica: 'Ampolas de 5 mL',
          quantidade: '5 ampolas',
          via: 'EV pós-HD',
          posologia: 'Diluir 1 ampola em 100 mL de SF 0,9% e infundir por via endovenosa na última hora de hemodiálise, 1x por semana.',
          instrucoesAdicionais: 'Monitorar sinais de hipersensibilidade durante a infusão.'
        },
        {
          id: `item-${Date.now()}-3`,
          medicamento: 'Ácido Fólico 5mg',
          formaFarmaceutica: 'Comprimidos',
          quantidade: '60 comprimidos (2 caixas)',
          via: 'VO',
          posologia: 'Tomar 1 comprimido por via oral, 1 vez ao dia, pela manhã.',
          instrucoesAdicionais: 'Uso contínuo.'
        }
      ];
    } else if (presetName === 'dmo') {
      novos = [
        {
          id: `item-${Date.now()}-1`,
          medicamento: 'Cloridrato de Sevelâmer 800mg',
          formaFarmaceutica: 'Comprimidos revestidos',
          quantidade: '180 comprimidos (3 frascos)',
          via: 'VO às refeições',
          posologia: 'Tomar 2 comprimidos por via oral durante o almoço e 2 comprimidos durante o jantar.',
          instrucoesAdicionais: 'Tomar obrigatoriamente junto às refeições para quelar o fósforo alimentar. Não mastigar.'
        },
        {
          id: `item-${Date.now()}-2`,
          medicamento: 'Calcitriol 0,25 mcg',
          formaFarmaceutica: 'Cápsulas gelatinosas',
          quantidade: '60 cápsulas (2 caixas)',
          via: 'VO',
          posologia: 'Tomar 1 cápsula por via oral, à noite ao deitar, 3 vezes por semana (nos dias de hemodiálise).',
          instrucoesAdicionais: 'Monitorar cálcio sérico e fósforo mensalmente.'
        }
      ];
    } else if (presetName === 'antibiocath') {
      setTipoReceita('antimicrobiano');
      setValidadeDias(10);
      novos = [
        {
          id: `item-${Date.now()}-1`,
          medicamento: 'Ciprofloxacino 500mg',
          formaFarmaceutica: 'Comprimidos revestidos',
          quantidade: '14 comprimidos (1 caixa)',
          via: 'VO',
          posologia: 'Tomar 1 comprimido (dose ajustada para DRC clareamento reduzido) a cada 24 horas por 7 dias.',
          instrucoesAdicionais: 'Não ingerir concomitantemente com quelantes de fósforo à base de cálcio ou sevelâmer (espaçar no mínimo 2 horas).'
        }
      ];
    }

    if (novos.length > 0) {
      setItens(prev => [...prev, ...novos]);
      setFeedbackMsg(`Preset "${presetName.toUpperCase()}" aplicado com sucesso!`);
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  // Adiciona item avulso a partir do catálogo ou busca
  const handleSelectCatalogItem = (catItem) => {
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      medicamento: `${catItem.nome}${catItem.dosagensSugeridas?.[0] ? ` ${catItem.dosagensSugeridas[0]}` : ''}`,
      formaFarmaceutica: catItem.viaPadrao?.includes('VO') ? 'Comprimidos' : 'Injetável',
      quantidade: catItem.tipoPadrao === 'continuo' ? 'Uso Contínuo (3 caixas)' : '1 caixa',
      via: catItem.viaPadrao || 'VO',
      posologia: catItem.frequenciasSugeridas?.[0] 
        ? `Tomar/aplicar ${catItem.frequenciasSugeridas[0]}.` 
        : 'Conforme prescrição médica.',
      instrucoesAdicionais: catItem.indicacao ? `Indicação: ${catItem.indicacao}` : ''
    };

    setItens(prev => [...prev, newItem]);
    setSearchTerm('');
    setSelectedCatalogItem(null);
    setIsCatalogOpen(false);
  };

  // Adiciona linha vazia para preenchimento manual
  const handleAddBlankItem = () => {
    setItens(prev => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        medicamento: '',
        formaFarmaceutica: 'Comprimidos',
        quantidade: 'Uso Contínuo',
        via: 'VO',
        posologia: 'Tomar 1 comprimido ao dia.',
        instrucoesAdicionais: ''
      }
    ]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItens(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveItem = (id) => {
    setItens(prev => prev.filter(item => item.id !== id));
  };

  const handleMoveItem = (index, direction) => {
    const newItens = [...itens];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newItens.length) return;
    const temp = newItens[index];
    newItens[index] = newItens[targetIdx];
    newItens[targetIdx] = temp;
    setItens(newItens);
  };

  // Salvar no Cloud Firestore
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (itens.length === 0) {
      setError('Adicione ao menos um medicamento à receita antes de salvar.');
      return;
    }

    const invalidItem = itens.find(it => !it.medicamento || !it.medicamento.trim());
    if (invalidItem) {
      setError('Por favor, preencha o nome de todos os medicamentos na receita.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        tipoReceita,
        subtitulo: subtitulo.trim(),
        dataEmissao,
        validadeDias: parseInt(validadeDias, 10) || 180,
        observacoesGerais: observacoesGerais.trim(),
        incluirAlergias,
        itens,
        medico: {
          id: doctorInfo?.id || 'dr-marcelo',
          nome: doctorInfo?.nome || 'Dr. Marcelo Ramos',
          crm: doctorInfo?.crm || '654321',
          ufCrm: doctorInfo?.ufCrm || 'SP',
          rqe: doctorInfo?.rqe || '45890',
          especialidade: doctorInfo?.especialidade || 'Nefrologia Clínica & Hemodiálise',
          clinica: doctorInfo?.clinicaPrincipal || patient.clinica || 'Clínica Nefrológica Virtual Modelo',
          endereco: doctorInfo?.endereco || 'São Paulo/SP',
          telefone: doctorInfo?.telefone || ''
        },
        paciente: {
          id: patient.id,
          nome: patient.nome,
          cpf: patient.cpf || '',
          idade: patient.idade || '',
          endereco: patient.endereco || ''
        }
      };

      const updatedReceitas = await savePatientPrescription(patient.id, payload, prescriptionToEdit?.id);

      if (onSaved) onSaved(updatedReceitas);
      onClose();
    } catch (err) {
      console.error("Erro ao salvar receita no Firestore:", err);
      setError("Falha ao salvar receita no Cloud Firestore: " + (err.message || ''));
    } finally {
      setSaving(false);
    }
  };

  // Filtro do catálogo nefrológico
  const filteredCatalog = DIALYSIS_MEDICATIONS_CATALOG.filter(med => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      med.nome.toLowerCase().includes(term) ||
      (med.nomeComercial && med.nomeComercial.toLowerCase().includes(term)) ||
      med.categoria.toLowerCase().includes(term)
    );
  }).slice(0, 8);

  const previewPrescriptionData = {
    tipoReceita,
    subtitulo: subtitulo.trim(),
    dataEmissao,
    validadeDias: parseInt(validadeDias, 10) || 180,
    observacoesGerais: observacoesGerais.trim(),
    incluirAlergias,
    itens,
    id: prescriptionToEdit?.id || `REC-${Date.now().toString().slice(-6)}`,
    numeroReceita: prescriptionToEdit?.numeroReceita || `REC-${new Date().getFullYear()}/${itens.length}M`,
    medico: {
      nome: doctorInfo?.nome || 'Dr. Marcelo Ramos',
      crm: doctorInfo?.crm || '654321',
      ufCrm: doctorInfo?.ufCrm || 'SP',
      rqe: doctorInfo?.rqe || '45890',
      especialidade: doctorInfo?.especialidade || 'Nefrologia Clínica & Hemodiálise',
      clinica: doctorInfo?.clinicaPrincipal || patient.clinica || 'Clínica Nefrológica Virtual Modelo',
      endereco: doctorInfo?.endereco || 'São Paulo/SP',
      telefone: doctorInfo?.telefone || ''
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 md:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-in bg-white text-slate-900 w-full max-w-4xl max-h-[94vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-4 md:px-6 border-b border-slate-200 bg-slate-50/80 flex justify-between items-center no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <FileCheck size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{prescriptionToEdit ? 'Editar Receituário Médico' : 'Emissão de Receita Médica'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase bg-blue-100 text-blue-800">
                  {tipoReceita.replace('_', ' ')}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Paciente: <strong className="text-slate-800">{patient.nome}</strong> • CPF: {patient.cpf || 'Não cadastrado'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Alternador de visualização Formulário / Live Preview */}
            <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                  activeView === 'edit' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveView('edit')}
              >
                <Edit3 size={13} />
                <span>Editar</span>
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                  activeView === 'preview' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveView('preview')}
              >
                <Eye size={13} />
                <span>Visualizar A4</span>
              </button>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notificações e Erros */}
        {error && (
          <div className="bg-red-50 text-red-700 text-xs px-5 py-2.5 border-b border-red-200 flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {feedbackMsg && (
          <div className="bg-emerald-50 text-emerald-800 text-xs px-5 py-2.5 border-b border-emerald-200 flex items-center gap-2">
            <Check size={15} className="shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Corpo do Modal: View Edit ou View Preview */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/40">
          {activeView === 'edit' ? (
            <div className="flex flex-col gap-5">
              {/* Seleção do Tipo de Receita */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Tipo de Receituário:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTipoChange('simples')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      tipoReceita === 'simples'
                        ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-semibold ring-2 ring-blue-400/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                      <FileText size={14} className="text-blue-600" />
                      <span>Receita Simples</span>
                    </div>
                    <p className="text-[10px] text-slate-500">1 via • Medicamentos em geral e de uso contínuo</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTipoChange('controle_especial')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      tipoReceita === 'controle_especial'
                        ? 'border-purple-500 bg-purple-50/70 text-purple-900 font-semibold ring-2 ring-purple-400/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                      <FileCheck size={14} className="text-purple-600" />
                      <span>Controle Especial</span>
                    </div>
                    <p className="text-[10px] text-slate-500">2 vias (Portaria 344/98) • Opioides, sedativos, etc.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTipoChange('antimicrobiano')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      tipoReceita === 'antimicrobiano'
                        ? 'border-amber-500 bg-amber-50/70 text-amber-900 font-semibold ring-2 ring-amber-400/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                      <Pill size={14} className="text-amber-600" />
                      <span>Antimicrobianos</span>
                    </div>
                    <p className="text-[10px] text-slate-500">2 vias (RDC 20/2011) • Antibióticos (válido 10 dias)</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTipoChange('alto_custo')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      tipoReceita === 'alto_custo'
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold ring-2 ring-emerald-400/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                      <Sparkles size={14} className="text-emerald-600" />
                      <span>Alto Custo (LME)</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Para farmácias do SUS (EPO, Sevelâmer, Cinacalcete)</p>
                  </button>
                </div>

                {/* Parâmetros da Receita */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Data de Emissão:
                    </label>
                    <input
                      type="date"
                      value={dataEmissao}
                      onChange={e => setDataEmissao(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Validade Sugerida (dias):
                    </label>
                    <input
                      type="number"
                      value={validadeDias}
                      onChange={e => setValidadeDias(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Subtítulo / Observação do Cabeçalho:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Programa de Terapia Dialítica Contínua"
                      value={subtitulo}
                      onChange={e => setSubtitulo(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Barra de Ações Rápidas & Presets */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    <Sparkles size={14} className="text-blue-600" />
                    Agilidade Clínica:
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleImportActiveMedications}
                    className="btn btn-primary"
                    style={{ padding: '0.35rem 0.8rem', fontSize: '0.75rem', gap: '4px' }}
                    title="Importa todos os medicamentos que o paciente já usa no cadastro de Prescrições"
                  >
                    <span>⚡ Puxar Medicamentos Ativos</span>
                  </button>

                  {/* Presets nefrológicos */}
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('anemia')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-300 text-[11px] font-medium transition-colors"
                  >
                    + Kit Anemia (EPO+Fe)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('dmo')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-300 text-[11px] font-medium transition-colors"
                  >
                    + Kit Quelantes / DMO
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('antibiocath')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-300 text-[11px] font-medium transition-colors"
                  >
                    + Kit Antibiótico Cateter
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-slate-600 flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={incluirAlergias}
                      onChange={e => setIncluirAlergias(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Destacar alergias no documento</span>
                  </label>
                </div>
              </div>

              {/* Seção de Medicamentos Prescritos */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Pill size={16} className="text-blue-600" />
                    <strong className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Medicamentos na Receita ({itens.length})
                    </strong>
                  </div>

                  {/* Campo de Busca Rápida no Catálogo com Autocomplete */}
                  <div className="relative w-72" ref={catalogDropdownRef}>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Pesquisar catálogo nefrológico..."
                        value={searchTerm}
                        onChange={e => {
                          setSearchTerm(e.target.value);
                          setIsCatalogOpen(true);
                        }}
                        onFocus={() => setIsCatalogOpen(true)}
                        className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddBlankItem}
                        className="btn btn-outline shrink-0"
                        style={{ padding: '0.28rem 0.6rem', fontSize: '0.72rem', gap: '3px' }}
                        title="Adicionar linha vazia"
                      >
                        <Plus size={13} />
                        <span>Item</span>
                      </button>
                    </div>

                    {/* Dropdown com resultados do catálogo */}
                    {isCatalogOpen && (
                      <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden text-xs max-h-64 overflow-y-auto">
                        <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Catálogo Especializado NexAi
                        </div>
                        {filteredCatalog.length === 0 ? (
                          <div className="p-3 text-center text-slate-400 italic">
                            Nenhum medicamento encontrado.
                          </div>
                        ) : (
                          filteredCatalog.map((catItem, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectCatalogItem(catItem)}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-slate-100 flex flex-col transition-colors"
                            >
                              <strong className="text-slate-800 text-xs font-semibold">{catItem.nome}</strong>
                              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                                <span>{catItem.categoria}</span>
                                <span className="font-medium text-blue-600">{catItem.viaPadrao}</span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lista de Itens */}
                {itens.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs flex flex-col items-center gap-2">
                    <Pill size={28} className="opacity-40 text-blue-500" />
                    <span>Nenhum medicamento adicionado a esta receita.</span>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={handleImportActiveMedications}
                        className="btn btn-outline"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        ⚡ Puxar Medicamentos Ativos
                      </button>
                      <button
                        type="button"
                        onClick={handleAddBlankItem}
                        className="btn btn-primary"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        + Adicionar Linha Manual
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {itens.map((item, idx) => (
                      <div 
                        key={item.id || idx}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all text-xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-700 text-xs">Item {idx + 1}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveItem(idx, -1)}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Subir item"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(idx, 1)}
                              disabled={idx === itens.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Descer item"
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              title="Remover item da receita"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Campos do item */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                          <div className="md:col-span-5">
                            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                              Medicamento e Concentração: *
                            </label>
                            <input
                              type="text"
                              value={item.medicamento}
                              onChange={e => handleUpdateItem(item.id, 'medicamento', e.target.value)}
                              placeholder="Ex: Cloridrato de Sevelâmer 800mg"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                              Forma Farmacêutica:
                            </label>
                            <input
                              type="text"
                              value={item.formaFarmaceutica}
                              onChange={e => handleUpdateItem(item.id, 'formaFarmaceutica', e.target.value)}
                              placeholder="Ex: Comprimidos / Frasco-ampola"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                            />
                          </div>

                          <div className="md:col-span-4">
                            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                              Quantidade / Caixas:
                            </label>
                            <input
                              type="text"
                              value={item.quantidade}
                              onChange={e => handleUpdateItem(item.id, 'quantidade', e.target.value)}
                              placeholder="Ex: 3 caixas / 180 cps / Uso Contínuo"
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                              Via de Administração:
                            </label>
                            <select
                              value={item.via}
                              onChange={e => handleUpdateItem(item.id, 'via', e.target.value)}
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                            >
                              <option value="VO">VO (Via Oral)</option>
                              <option value="VO às refeições">VO (às refeições)</option>
                              <option value="SC pós-HD">SC pós-HD (Subcutânea)</option>
                              <option value="EV pós-HD">EV pós-HD (Endovenosa)</option>
                              <option value="SC">SC (Subcutânea)</option>
                              <option value="EV">EV (Endovenosa)</option>
                              <option value="SL">SL (Sublingual)</option>
                              <option value="Tópica">Tópica</option>
                              <option value="Inalatória">Inalatória</option>
                            </select>
                          </div>

                          <div className="md:col-span-9">
                            <label className="text-[10px] font-semibold text-slate-600 block mb-0.5">
                              Posologia Detalhada & Instruções ao Paciente:
                            </label>
                            <input
                              type="text"
                              value={item.posologia}
                              onChange={e => handleUpdateItem(item.id, 'posologia', e.target.value)}
                              placeholder="Ex: Tomar 2 comprimidos por via oral durante o almoço e 2 durante o jantar."
                              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                            />
                          </div>

                          {/* Observações específicas do item */}
                          <div className="md:col-span-12">
                            <input
                              type="text"
                              value={item.instrucoesAdicionais || ''}
                              onChange={e => handleUpdateItem(item.id, 'instrucoesAdicionais', e.target.value)}
                              placeholder="Observação específica deste item (ex: Manter refrigerado; Tomar longe do ferro)"
                              className="w-full px-2 py-1 border border-slate-200 rounded-md text-[11px] text-slate-500 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddBlankItem}
                      className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-700 flex items-center justify-center gap-1.5 transition-all mt-1"
                    >
                      <Plus size={14} />
                      <span>Adicionar Mais um Medicamento</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Recomendações Gerais & Orientações Médicas */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">
                  Recomendações e Orientações Gerais ao Paciente:
                </label>
                <textarea
                  rows={3}
                  value={observacoesGerais}
                  onChange={e => setObservacoesGerais(e.target.value)}
                  placeholder="Orientações sobre controle hidroeletrolítico, dieta com restrição de potássio/fósforo, retornos para exames laboratoriais..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs resize-y"
                />
              </div>
            </div>
          ) : (
            /* ================= VIEW: PRÉ-VISUALIZAÇÃO A4 ================= */
            <div className="flex flex-col items-center">
              {/* Barra de controle da visualização prévia */}
              <div className="w-full max-w-[800px] mb-3 flex justify-between items-center flex-wrap gap-2 no-print bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Visualização:</span>
                  {(tipoReceita === 'controle_especial' || tipoReceita === 'antimicrobiano') && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          previewVia === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                        onClick={() => setPreviewVia(1)}
                      >
                        1ª Via (Farmácia)
                      </button>
                      <button
                        type="button"
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          previewVia === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                        onClick={() => setPreviewVia(2)}
                      >
                        2ª Via (Paciente)
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn btn-primary"
                    style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', gap: '5px' }}
                  >
                    <Printer size={15} />
                    <span>Imprimir / Salvar PDF</span>
                  </button>
                </div>
              </div>

              {/* Documento A4 Timbrado */}
              <div className="w-full flex justify-center overflow-x-auto">
                <PrescriptionPrintDocument
                  prescription={previewPrescriptionData}
                  patient={patient}
                  doctorInfo={doctorInfo}
                  currentVia={previewVia}
                />
              </div>
            </div>
          )}
        </div>

        {/* Rodapé de Ações do Modal */}
        <div className="p-4 md:px-6 border-t border-slate-200 bg-white flex justify-between items-center gap-3 no-print">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '0.5rem 1.2rem', fontSize: '0.82rem' }}
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            {activeView === 'edit' && (
              <button
                type="button"
                onClick={() => setActiveView('preview')}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1.2rem', fontSize: '0.82rem', gap: '6px' }}
              >
                <Eye size={15} />
                <span>Ver Folha A4</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1.4rem', fontSize: '0.82rem', gap: '6px' }}
            >
              <Save size={15} />
              <span>{saving ? 'Gravando...' : (prescriptionToEdit ? 'Atualizar Receita' : 'Salvar no Prontuário')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
