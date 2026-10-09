import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  ArrowUp, 
  ArrowDown, 
  Sliders, 
  Loader2 
} from 'lucide-react';
import { saveDoctorEvolutionConfig } from '../services/doctorService';
import { DEFAULT_EVOLUTION_SECTIONS } from '../utils/monthlyEvolutionGenerator';

export default function EvolutionTemplateModal({
  isOpen,
  onClose,
  doctorInfo,
  onSaved
}) {
  const [titulo, setTitulo] = useState('EVOLUÇÃO MÉDICA MENSAL - HEMODIÁLISE CRÔNICA');
  const [secoes, setSecoes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const savedConfig = doctorInfo?.configuracaoEvolucao;
    if (savedConfig) {
      setTitulo(savedConfig.titulo || 'EVOLUÇÃO MÉDICA MENSAL - HEMODIÁLISE CRÔNICA');
      
      // Mescla seções salvas com catálogo padrão caso surjam novas seções
      const savedIds = new Set((savedConfig.secoes || []).map(s => s.id));
      const currentList = (savedConfig.secoes || []).map(s => {
        const defaultDef = DEFAULT_EVOLUTION_SECTIONS.find(d => d.id === s.id);
        return {
          id: s.id,
          label: s.label || defaultDef?.label || s.id,
          descricao: defaultDef?.descricao || '',
          ativo: s.ativo !== false
        };
      });

      DEFAULT_EVOLUTION_SECTIONS.forEach(def => {
        if (!savedIds.has(def.id)) {
          currentList.push({
            id: def.id,
            label: def.label,
            descricao: def.descricao,
            ativo: true
          });
        }
      });

      setSecoes(currentList);
    } else {
      setTitulo('EVOLUÇÃO MÉDICA MENSAL - HEMODIÁLISE CRÔNICA');
      setSecoes(DEFAULT_EVOLUTION_SECTIONS.map(s => ({ ...s, ativo: true })));
    }

    setError('');
    setFeedback('');
  }, [isOpen, doctorInfo]);

  if (!isOpen) return null;

  const handleToggle = (id) => {
    setSecoes(prev => prev.map(s => s.id === id ? { ...s, ativo: !s.ativo } : s));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setSecoes(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index) => {
    if (index === secoes.length - 1) return;
    setSecoes(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const handleReset = () => {
    setTitulo('EVOLUÇÃO MÉDICA MENSAL - HEMODIÁLISE CRÔNICA');
    setSecoes(DEFAULT_EVOLUTION_SECTIONS.map(s => ({ ...s, ativo: true })));
    setFeedback('Padrão restaurado.');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!doctorInfo?.id) {
      setError('Identificação do médico não encontrada.');
      return;
    }

    const ativas = secoes.filter(s => s.ativo);
    if (ativas.length === 0) {
      setError('Selecione ao menos 1 seção para a evolução médica.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const configPayload = {
        titulo: titulo.trim() || 'EVOLUÇÃO MÉDICA MENSAL - HEMODIÁLISE CRÔNICA',
        secoes: secoes.map(s => ({
          id: s.id,
          label: s.label,
          ativo: s.ativo
        })),
        atualizadoEm: new Date().toISOString()
      };

      await saveDoctorEvolutionConfig(doctorInfo.id, configPayload);

      if (onSaved) {
        onSaved(configPayload);
      }
      onClose();
    } catch (err) {
      console.error("Erro ao salvar padrão de evolução no Firestore:", err);
      setError('Falha ao gravar configuração no Cloud Firestore.');
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
        backgroundColor: 'rgba(15, 23, 42, 0.75)', 
        backdropFilter: 'blur(6px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 10002,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-in" 
        style={{ 
          background: 'var(--surface-solid, #ffffff)', 
          width: '100%', 
          maxWidth: '650px', 
          maxHeight: '92vh', 
          overflowY: 'auto', 
          padding: '1.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          borderRadius: '20px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-4 border-b pb-3" style={{ borderColor: 'var(--border, #e2e8f0)' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <Sliders size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Padrão de Evolução
              </h2>
              <p className="text-xs text-slate-500">
                Personalize as seções e a ordem das informações para seu perfil.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {feedback && (
          <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#15803d', padding: '0.65rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.82rem' }}>
            {feedback}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Título do Documento */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Título Padrão da Evolução
            </label>
            <input 
              type="text" 
              className="input-field" 
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: EVOLUÇÃO MÉDICA MENSAL - HEMODIÁLISE"
              required
            />
          </div>

          {/* Lista Reordenável de Seções */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Seções Clínicas e Sequência
              </span>
              <button 
                type="button" 
                onClick={handleReset}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <RotateCcw size={12} />
                <span>Restaurar</span>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {secoes.map((sec, idx) => (
                <div 
                  key={sec.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: sec.ativo ? '#ffffff' : '#f8fafc',
                    border: `1px solid ${sec.ativo ? '#cbd5e1' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    opacity: sec.ativo ? 1 : 0.6,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      id={`chk-${sec.id}`}
                      checked={sec.ativo}
                      onChange={() => handleToggle(sec.id)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <div>
                      <label 
                        htmlFor={`chk-${sec.id}`}
                        className="text-xs font-bold text-slate-800 cursor-pointer block"
                      >
                        {idx + 1}. {sec.label}
                      </label>
                      {sec.descricao && (
                        <span className="text-[11px] text-slate-500 block leading-tight">
                          {sec.descricao}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                      title="Subir"
                    >
                      <ArrowUp size={15} className="text-slate-600" />
                    </button>
                    <button 
                      type="button"
                      disabled={idx === secoes.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                      title="Descer"
                    >
                      <ArrowDown size={15} className="text-slate-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rodapé com Ações */}
          <div className="flex justify-between items-center pt-3 border-t mt-1" style={{ borderColor: 'var(--border, #e2e8f0)' }}>
            <span className="text-[11px] text-slate-500">
              Salvo para seu usuário no Cloud Firestore.
            </span>
            <div className="flex gap-2">
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={onClose}
                disabled={saving}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                <span>{saving ? 'Gravando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
