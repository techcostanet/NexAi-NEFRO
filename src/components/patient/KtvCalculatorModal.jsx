import React, { useState, useEffect, useMemo } from 'react';
import { X, Calculator, CheckCircle2, AlertTriangle, AlertCircle, Save, Info, ArrowRight } from 'lucide-react';
import { calculateDaugirdasKtv } from '../../utils/ktvCalculator.js';

export default function KtvCalculatorModal({
  isOpen,
  onClose,
  onSave,
  patient = null
}) {
  const [ureiaPre, setUreiaPre] = useState('');
  const [ureiaPos, setUreiaPos] = useState('');
  const [pesoPre, setPesoPre] = useState('');
  const [pesoPos, setPesoPos] = useState('');
  const [duracaoHoras, setDuracaoHoras] = useState('4.0');
  const [dataColeta, setDataColeta] = useState('');
  const [observacao, setObservacao] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Inicializa os campos com os dados mais recentes do paciente
  useEffect(() => {
    if (!isOpen || !patient) return;

    const exames = patient.exames || {};
    setUreiaPre(exames.ureiaPre !== undefined && exames.ureiaPre !== null ? String(exames.ureiaPre) : '');
    setUreiaPos(exames.ureiaPos !== undefined && exames.ureiaPos !== null ? String(exames.ureiaPos) : '');
    
    // Sugere pesos a partir do histórico de pesagens e peso seco cadastrado
    const pesos = Array.isArray(patient.historicoPesos) ? patient.historicoPesos : [];
    const pesoPreRecente = pesos.find(p => (p.tipo || '').toLowerCase().includes('pré'))?.peso || patient.ultimoPesoAferido;
    const pesoPosRecente = pesos.find(p => (p.tipo || '').toLowerCase().includes('pós'))?.peso || patient.pesoSeco;

    setPesoPre(pesoPreRecente ? String(pesoPreRecente) : '');
    setPesoPos(pesoPosRecente ? String(pesoPosRecente) : (patient.pesoSeco ? String(patient.pesoSeco) : ''));

    // Duração da sessão
    const tempoPrescrito = patient.prescricaoDialise?.tempoSessao;
    if (tempoPrescrito) {
      const horas = parseFloat(tempoPrescrito) > 10 ? parseFloat(tempoPrescrito) / 60 : parseFloat(tempoPrescrito);
      setDuracaoHoras(horas ? horas.toFixed(1) : '4.0');
    } else {
      setDuracaoHoras('4.0');
    }

    // Data da coleta
    const hoje = new Date().toISOString().split('T')[0];
    const dataExameRecente = patient.historicoExames?.[patient.historicoExames.length - 1]?.dataExame;
    setDataColeta(dataExameRecente || hoje);
    setObservacao('');
    setErrorMsg('');
  }, [isOpen, patient]);

  // Cálculo reativo em tempo real
  const resultado = useMemo(() => {
    return calculateDaugirdasKtv({
      ureiaPre,
      ureiaPos,
      pesoPre,
      pesoPos,
      duracaoHoras
    });
  }, [ureiaPre, ureiaPos, pesoPre, pesoPos, duracaoHoras]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!resultado.valido) {
      setErrorMsg(resultado.descricao || 'Preencha os dados necessários para o cálculo.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');

      const dadosParaSalvar = {
        ktv: resultado.ktv,
        pru: resultado.pru,
        uf: resultado.uf !== null && resultado.uf !== undefined ? resultado.uf : 0,
        ureiaPre: parseFloat(String(ureiaPre).replace(',', '.')),
        ureiaPos: parseFloat(String(ureiaPos).replace(',', '.')),
        pesoPre: pesoPre ? parseFloat(String(pesoPre).replace(',', '.')) : null,
        pesoPos: pesoPos ? parseFloat(String(pesoPos).replace(',', '.')) : null,
        duracaoHoras: parseFloat(String(duracaoHoras).replace(',', '.')) || 4.0,
        dataColeta: dataColeta || new Date().toISOString().split('T')[0],
        observacao: observacao ? observacao.trim() : '',
        metodoCalculo: 'Daugirdas 2ª Geração (spKt/V)'
      };

      if (onSave) {
        await onSave(dadosParaSalvar);
      }
      onClose();
    } catch (err) {
      console.error('Erro ao salvar Kt/V calculado:', err);
      setErrorMsg('Falha ao salvar dados de adequação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="modal-container"
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)'
              }}
            >
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 leading-tight">
                Adequação Dialítica
              </h3>
              <p className="text-xs text-muted">
                spKt/V de Daugirdas de 2ª Geração e Redução de Ureia
              </p>
            </div>
          </div>
          <button
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={onClose}
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário e Painel de Resultados */}
        <form onSubmit={handleSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Card de Resultado Instantâneo */}
          <div
            style={{
              padding: '1.1rem',
              borderRadius: '14px',
              background: resultado.valido
                ? (resultado.cor === 'green' || resultado.cor === 'emerald' ? '#ecfdf5' : resultado.cor === 'amber' ? '#fffbeb' : '#fef2f2')
                : '#f8fafc',
              border: `1px solid ${
                resultado.valido
                  ? (resultado.cor === 'green' || resultado.cor === 'emerald' ? '#a7f3d0' : resultado.cor === 'amber' ? '#fde68a' : '#fecaca')
                  : '#e2e8f0'
              }`,
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Resultado Oficial
              </span>
              {resultado.valido && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    padding: '2px 10px',
                    borderRadius: '8px',
                    background: resultado.cor === 'green' || resultado.cor === 'emerald' ? '#047857' : resultado.cor === 'amber' ? '#b45309' : '#b91c1c',
                    color: '#ffffff'
                  }}
                >
                  {resultado.status}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
              <div>
                <span className="text-xs text-muted block">spKt/V:</span>
                <span
                  className="font-black text-2xl"
                  style={{
                    color: resultado.valido
                      ? (resultado.cor === 'green' || resultado.cor === 'emerald' ? '#065f46' : resultado.cor === 'amber' ? '#92400e' : '#991b1b')
                      : '#94a3b8'
                  }}
                >
                  {resultado.valido ? resultado.ktv.toFixed(2) : '--'}
                </span>
              </div>

              <div>
                <span className="text-xs text-muted block">PRU (URR):</span>
                <span className="font-bold text-base text-slate-800">
                  {resultado.valido ? `${resultado.pru}%` : '--'}
                </span>
              </div>

              <div>
                <span className="text-xs text-muted block">UF Calculada:</span>
                <span className="font-bold text-base text-slate-800">
                  {resultado.valido && resultado.uf !== null ? `${resultado.uf} L` : '--'}
                </span>
              </div>
            </div>

            <p className="text-xs mt-2 text-slate-600">
              {resultado.descricao}
            </p>

            {!pesoPre && resultado.valido && (
              <div
                className="mt-2.5 p-2 bg-amber-50 border border-amber-200/70 rounded-lg flex items-start gap-1.5 text-amber-800"
                style={{ fontSize: '0.72rem' }}
              >
                <Info size={13} className="shrink-0 mt-0.5 text-amber-600" />
                <span>
                  <strong>Atenção ao Peso Pré:</strong> Como o Peso Pré não foi preenchido, a ultrafiltração (UF) foi estimada em <strong>0 L</strong>. Preencha o Peso Pré para computar a remoção convectiva no spKt/V oficial.
                </span>
              </div>
            )}
          </div>

          {/* Seção 1: Dosagens de Ureia (Pré e Pós) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Ureia Pré (mg/dL) *
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                className="input-field w-full text-xs font-semibold"
                placeholder="Ex: 140"
                value={ureiaPre}
                onChange={(e) => setUreiaPre(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Ureia Pós (mg/dL) *
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                required
                className="input-field w-full text-xs font-semibold"
                placeholder="Ex: 38"
                value={ureiaPos}
                onChange={(e) => setUreiaPos(e.target.value)}
              />
            </div>
          </div>

          {/* Seção 2: Pesos da Sessão e Duração */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Peso Pré (kg)
              </label>
              <input
                type="number"
                step="0.05"
                min="20"
                className="input-field w-full text-xs"
                placeholder="Ex: 72.5"
                value={pesoPre}
                onChange={(e) => setPesoPre(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Peso Pós (kg)
              </label>
              <input
                type="number"
                step="0.05"
                min="20"
                className="input-field w-full text-xs"
                placeholder="Ex: 70.0"
                value={pesoPos}
                onChange={(e) => setPesoPos(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Duração (h)
              </label>
              <input
                type="number"
                step="0.25"
                min="1"
                max="8"
                className="input-field w-full text-xs"
                placeholder="Ex: 4.0"
                value={duracaoHoras}
                onChange={(e) => setDuracaoHoras(e.target.value)}
              />
            </div>
          </div>

          {/* Seção 3: Data da Coleta e Observações */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.85rem' }}>
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Data Coleta
              </label>
              <input
                type="date"
                required
                className="input-field w-full text-xs"
                value={dataColeta}
                onChange={(e) => setDataColeta(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Observação
              </label>
              <input
                type="text"
                className="input-field w-full text-xs"
                placeholder="Ex: Coleta mensal de rotina"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
          </div>

          {/* Rodapé com Botões de Ação */}
          <div
            style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || !resultado.valido}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={15} />
              <span>{saving ? 'Gravando...' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
