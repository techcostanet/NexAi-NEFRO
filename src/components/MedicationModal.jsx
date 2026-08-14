import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Pill, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Search, 
  Check, 
  Info,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';
import { DIALYSIS_MEDICATIONS_CATALOG } from '../data/dialysisMedications';
import { savePatientMedication } from '../services/patientService';

export default function MedicationModal({ 
  isOpen, 
  onClose, 
  patientId, 
  medicationToEdit = null, 
  onSaved 
}) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('Geral');
  const [dosagem, setDosagem] = useState('');
  const [via, setVia] = useState('VO');
  const [frequencia, setFrequencia] = useState('');
  const [tipo, setTipo] = useState('continuo'); // 'continuo' | 'temporario'
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState('');
  const [duracaoDias, setDuracaoDias] = useState(14);
  const [observacao, setObservacao] = useState('');
  const [ativo, setAtivo] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);

  const dropdownRef = useRef(null);

  // Inicialização do formulário
  useEffect(() => {
    if (!isOpen) return;

    if (medicationToEdit) {
      setNome(medicationToEdit.nome || '');
      setCategoria(medicationToEdit.categoria || 'Geral');
      setDosagem(medicationToEdit.dosagem || '');
      setVia(medicationToEdit.via || 'VO');
      setFrequencia(medicationToEdit.frequencia || '');
      setTipo(medicationToEdit.tipo || 'continuo');
      setDataInicio(medicationToEdit.dataInicio || new Date().toISOString().split('T')[0]);
      setDataFim(medicationToEdit.dataFim || '');
      setObservacao(medicationToEdit.observacao || '');
      setAtivo(medicationToEdit.ativo !== undefined ? medicationToEdit.ativo : true);

      // Tenta encontrar no catálogo
      const matched = DIALYSIS_MEDICATIONS_CATALOG.find(
        m => m.nome.toLowerCase() === (medicationToEdit.nome || '').toLowerCase()
      );
      setSelectedCatalogItem(matched || null);
    } else {
      setNome('');
      setCategoria('Geral');
      setDosagem('');
      setVia('VO');
      setFrequencia('');
      setTipo('continuo');
      setDataInicio(new Date().toISOString().split('T')[0]);
      setDataFim('');
      setDuracaoDias(14);
      setObservacao('');
      setAtivo(true);
      setSelectedCatalogItem(null);
    }
    setError('');
    setIsDropdownOpen(false);
  }, [isOpen, medicationToEdit]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  // Filtragem no catálogo
  const filteredCatalog = DIALYSIS_MEDICATIONS_CATALOG.filter(med => {
    if (!nome.trim()) return true;
    const term = nome.toLowerCase();
    return med.nome.toLowerCase().includes(term) || 
           (med.nomeComercial && med.nomeComercial.toLowerCase().includes(term)) ||
           med.categoria.toLowerCase().includes(term);
  });

  const handleSelectCatalogItem = (item) => {
    setNome(item.nome);
    setCategoria(item.categoria || 'Geral');
    setSelectedCatalogItem(item);
    setIsDropdownOpen(false);

    if (item.viaPadrao) setVia(item.viaPadrao);
    if (item.dosagensSugeridas && item.dosagensSugeridas.length > 0 && !dosagem) {
      setDosagem(item.dosagensSugeridas[0]);
    }
    if (item.frequenciasSugeridas && item.frequenciasSugeridas.length > 0 && !frequencia) {
      setFrequencia(item.frequenciasSugeridas[0]);
    }
    if (item.tipoPadrao) {
      setTipo(item.tipoPadrao);
      if (item.tipoPadrao === 'temporario' && item.duracaoSugeridaDias) {
        applyQuickDuration(item.duracaoSugeridaDias);
      }
    }
    if (item.indicacao && !observacao) {
      setObservacao(item.indicacao);
    }
  };

  const applyQuickDuration = (days) => {
    setDuracaoDias(days);
    const start = new Date((dataInicio || new Date().toISOString().split('T')[0]) + 'T00:00:00');
    start.setDate(start.getDate() + Number(days));
    setDataFim(start.toISOString().split('T')[0]);
  };

  const handleStartDateChange = (val) => {
    setDataInicio(val);
    if (tipo === 'temporario' && duracaoDias) {
      const start = new Date(val + 'T00:00:00');
      start.setDate(start.getDate() + Number(duracaoDias));
      setDataFim(start.toISOString().split('T')[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('Por favor, informe o nome do medicamento.');
      return;
    }
    if (!dosagem.trim()) {
      setError('Por favor, informe a dose/posologia do medicamento.');
      return;
    }
    if (tipo === 'temporario' && !dataFim) {
      setError('Para medicamentos temporários, informe a data de término.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        id: medicationToEdit?.id,
        nome: nome.trim(),
        categoria,
        dosagem: dosagem.trim(),
        via: via.trim(),
        frequencia: frequencia.trim(),
        tipo,
        dataInicio,
        dataFim: tipo === 'temporario' ? dataFim : null,
        observacao: observacao.trim(),
        ativo
      };

      const updatedList = await savePatientMedication(patientId, payload, medicationToEdit?.id);
      if (onSaved) onSaved(updatedList);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar medicamento no Firestore. Verifique sua conexão.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(15, 23, 42, 0.65)', 
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
          maxWidth: '620px', 
          maxHeight: '92vh', 
          overflowY: 'auto',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          borderRadius: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div style={{ padding: '8px', background: 'rgba(217, 119, 6, 0.12)', borderRadius: '10px' }}>
              <Pill size={22} color="#d97706" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {medicationToEdit ? 'Editar Prescrição' : 'Nova Prescrição / Medicamento'}
              </h2>
              <p className="text-xs text-muted">
                Catálogo especializado de diálise e prescrição flexível
              </p>
            </div>
          </div>
          <button 
            type="button"
            className="btn btn-outline" 
            onClick={onClose}
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="card-pastel-rose mb-4" style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#b91c1c' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Campo de Medicamento com Autocomplete */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <label className="text-sm font-semibold mb-1 block flex items-center justify-between">
              <span>Medicamento / Princípio Ativo <span style={{ color: 'red' }}>*</span></span>
              <span className="text-xs text-muted" style={{ fontWeight: 'normal' }}>
                Selecione do catálogo ou digite livremente
              </span>
            </label>
            
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ex: Noripurum, Alfaepoetina, Sevelamer..." 
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)'
                }}
              >
                <ChevronDown size={18} />
              </button>
            </div>

            {/* Dropdown de Sugestões do Catálogo Dialítico */}
            {isDropdownOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  maxHeight: '230px',
                  overflowY: 'auto',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  marginTop: '4px'
                }}
              >
                <div style={{ padding: '6px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.72rem', color: '#64748b', fontWeight: 'bold' }}>
                  CATÁLOGO DE MEDICAMENTOS DIALÍTICOS
                </div>
                {filteredCatalog.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                    Nenhum item do catálogo encontrado. O nome digitado será salvo como medicamento personalizado.
                  </div>
                ) : (
                  filteredCatalog.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectCatalogItem(item)}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 246, 255, 0.7)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <div className="flex justify-between items-center">
                        <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>{item.nome}</strong>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1', fontWeight: '600' }}>
                          {item.categoria}
                        </span>
                      </div>
                      {item.nomeComercial && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          Ref: {item.nomeComercial}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sugestões Rápidas de Dosagem se houver item selecionado */}
          {selectedCatalogItem && selectedCatalogItem.dosagensSugeridas && (
            <div style={{ marginTop: '-4px' }}>
              <span className="text-xs text-muted block mb-1">Doses frequentes no catálogo:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedCatalogItem.dosagensSugeridas.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDosagem(d)}
                    style={{
                      fontSize: '0.75rem',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: dosagem === d ? 'var(--primary)' : '#e2e8f0',
                      background: dosagem === d ? 'rgba(37, 99, 235, 0.1)' : '#ffffff',
                      color: dosagem === d ? 'var(--primary)' : '#475569',
                      fontWeight: dosagem === d ? '600' : 'normal',
                      cursor: 'pointer'
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid de Dose, Via e Frequência */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="text-sm font-semibold mb-1 block">
                Dose / Posologia <span style={{ color: 'red' }}>*</span>
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ex: 4000 UI, 100mg, 1 cp" 
                value={dosagem}
                onChange={(e) => setDosagem(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Via de Administração</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ex: VO, EV pós-HD, SC..." 
                value={via}
                onChange={(e) => setVia(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Frequência / Horário</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Ex: 3x por semana pós-HD, 12/12h" 
                value={frequencia}
                onChange={(e) => setFrequencia(e.target.value)}
              />
            </div>
          </div>

          {/* Seletor de Tipo de Uso: Contínuo vs Temporário */}
          <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
            <label className="text-sm font-semibold mb-2 block">Regime de Duração / Término</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setTipo('continuo');
                  setDataFim('');
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: tipo === 'continuo' ? '#059669' : 'var(--border)',
                  background: tipo === 'continuo' ? 'rgba(240, 253, 244, 0.95)' : 'transparent',
                  color: tipo === 'continuo' ? '#047857' : 'inherit',
                  fontWeight: tipo === 'continuo' ? 'bold' : 'normal',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid', borderColor: tipo === 'continuo' ? '#059669' : '#94a3b8', background: tipo === 'continuo' ? '#059669' : 'transparent' }} />
                <div>
                  <div style={{ fontSize: '0.85rem' }}>Uso Contínuo</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Sem data fixa de encerramento</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTipo('temporario');
                  if (!dataFim) applyQuickDuration(14);
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: tipo === 'temporario' ? '#d97706' : 'var(--border)',
                  background: tipo === 'temporario' ? 'rgba(254, 243, 199, 0.95)' : 'transparent',
                  color: tipo === 'temporario' ? '#b45309' : 'inherit',
                  fontWeight: tipo === 'temporario' ? 'bold' : 'normal',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid', borderColor: tipo === 'temporario' ? '#d97706' : '#94a3b8', background: tipo === 'temporario' ? '#d97706' : 'transparent' }} />
                <div>
                  <div style={{ fontSize: '0.85rem' }}>Ciclo Temporário / Com Término</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Gera alertas visuais de prazo</div>
                </div>
              </button>
            </div>
          </div>

          {/* Configuração de Datas para Ciclos Temporários */}
          {tipo === 'temporario' && (
            <div className="card-pastel-amber animate-in" style={{ padding: '1rem', borderRadius: '12px' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#92400e' }}>
                  Atalhos de Duração:
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {[7, 10, 14, 21, 28, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => applyQuickDuration(d)}
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        border: '1px solid #fde68a',
                        background: duracaoDias === d ? '#d97706' : '#ffffff',
                        color: duracaoDias === d ? '#ffffff' : '#92400e',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {d} dias
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: '#78350f' }}>Data de Início</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={dataInicio}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ color: '#78350f' }}>
                    Data de Término / Reavaliação <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={dataFim}
                    onChange={(e) => {
                      setDataFim(e.target.value);
                      setDuracaoDias(null);
                    }}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Observações Clínicas / Indicação */}
          <div>
            <label className="text-sm font-semibold mb-1 block">Observações e Metas Clínicas</label>
            <textarea 
              className="input-field" 
              rows={2}
              placeholder="Ex: Ciclo de 4 semanas para atingir ferritina > 200; suspender se diarreia; tomar junto às refeições."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          {/* Status Ativo / Suspenso (se editando) */}
          {medicationToEdit && (
            <div className="flex items-center gap-2 pt-1">
              <input 
                type="checkbox" 
                id="med-ativo-toggle" 
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="med-ativo-toggle" className="text-sm font-semibold" style={{ cursor: 'pointer' }}>
                Prescrição Ativa no Momento (desmarque para suspender / arquivar)
              </label>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 mt-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Gravando...' : (medicationToEdit ? 'Atualizar Prescrição' : 'Prescrever Medicação')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
