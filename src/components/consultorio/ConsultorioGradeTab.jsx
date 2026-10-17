import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  CreditCard, 
  Check, 
  Save, 
  RotateCcw, 
  Loader2, 
  Plus, 
  Trash2, 
  Sparkles,
  Building2
} from 'lucide-react';
import { DEFAULT_GRADE_CONFIG, saveDoctorGradeConsultorio } from '../../services/consultorioService';

const DIA_LABELS = {
  seg: 'Segunda-feira',
  ter: 'Terça-feira',
  qua: 'Quarta-feira',
  qui: 'Quinta-feira',
  sex: 'Sexta-feira',
  sab: 'Sábado',
  dom: 'Domingo'
};

export default function ConsultorioGradeTab({
  doctorInfo = null,
  onGradeSaved
}) {
  const [gradeData, setGradeData] = useState(() => {
    return doctorInfo?.gradeConsultorio || DEFAULT_GRADE_CONFIG;
  });

  const [newConvenio, setNewConvenio] = useState('');
  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (doctorInfo?.gradeConsultorio) {
      setGradeData(doctorInfo.gradeConsultorio);
    }
  }, [doctorInfo]);

  // Alternar dia ativo
  const toggleDiaAtivo = (diaKey) => {
    setGradeData(prev => ({
      ...prev,
      diasSemana: {
        ...prev.diasSemana,
        [diaKey]: {
          ...prev.diasSemana[diaKey],
          ativo: !prev.diasSemana[diaKey]?.ativo
        }
      }
    }));
  };

  // Alterar horário de um dia
  const handleHorarioChange = (diaKey, field, value) => {
    setGradeData(prev => ({
      ...prev,
      diasSemana: {
        ...prev.diasSemana,
        [diaKey]: {
          ...prev.diasSemana[diaKey],
          [field]: value
        }
      }
    }));
  };

  // Adicionar convênio
  const handleAddConvenio = (e) => {
    e.preventDefault();
    const clean = newConvenio.trim();
    if (!clean) return;
    const current = Array.isArray(gradeData.conveniosAceitos) ? gradeData.conveniosAceitos : [];
    if (current.includes(clean)) return;

    setGradeData(prev => ({
      ...prev,
      conveniosAceitos: [...current, clean]
    }));
    setNewConvenio('');
  };

  // Remover convênio
  const handleRemoveConvenio = (conv) => {
    setGradeData(prev => ({
      ...prev,
      conveniosAceitos: (prev.conveniosAceitos || []).filter(c => c !== conv)
    }));
  };

  // Restaurar padrão
  const handleResetDefault = () => {
    if (window.confirm('Deseja restaurar as configurações padrão de grade e convênios?')) {
      setGradeData(DEFAULT_GRADE_CONFIG);
    }
  };

  // Salvar no Firestore
  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await saveDoctorGradeConsultorio(doctorInfo?.id || 'dr-marcelo', gradeData);
      setSuccessNotice(true);
      setTimeout(() => setSuccessNotice(false), 3500);
      if (onGradeSaved) onGradeSaved(gradeData);
    } catch (err) {
      console.error('Erro ao salvar grade:', err);
      setError('Falha ao salvar configurações no Firestore.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in">
      {/* BARRA SUPERIOR DE AÇÃO */}
      <div 
        className="glass-panel"
        style={{
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          background: 'var(--surface-solid)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h2 className="text-base font-bold text-slate-900" style={{ margin: 0 }}>
            Configuração da Grade de Atendimento
          </h2>
          <p className="text-xs text-slate-500" style={{ margin: 0 }}>
            Defina seus dias, turnos, duração das consultas e convênios aceitos
          </p>
        </div>

        <div className="flex items-center gap-2">
          {successNotice && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg flex items-center gap-1.5 animate-in">
              <Check size={14} /> Salvo com sucesso!
            </span>
          )}

          <button
            type="button"
            onClick={handleResetDefault}
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', borderRadius: '10px' }}
          >
            <RotateCcw size={14} />
            <span>Restaurar</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ 
              padding: '0.45rem 1.25rem', 
              fontSize: '0.82rem', 
              borderRadius: '10px',
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

      {error && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs">
          {error}
        </div>
      )}

      {/* PARÂMETROS GERAIS (DURAÇÃO & VALOR) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Duração */}
        <div 
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div style={{ padding: '6px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb' }}>
              <Clock size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Duração da Consulta:
              </span>
              <span className="text-2xs text-slate-500">
                Intervalo sugerido entre agendamentos
              </span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[15, 20, 30, 45, 60].map(mins => {
              const isSelected = Number(gradeData.duracaoMinutos) === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setGradeData(prev => ({ ...prev, duracaoMinutos: mins }))}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? '700' : '500',
                    background: isSelected ? '#2563eb' : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#475569',
                    border: '1px solid',
                    borderColor: isSelected ? '#2563eb' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {mins} min
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Valor Particular */}
        <div 
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            background: '#ffffff',
            border: '1px solid #e2e8f0'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div style={{ padding: '6px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
              <DollarSign size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Valor Particular Padrão:
              </span>
              <span className="text-2xs text-slate-500">
                Sugerido automaticamente ao agendar particular
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-600">R$</span>
            <input
              type="number"
              step="10"
              min="0"
              value={gradeData.valorParticularPadrao || 400}
              onChange={(e) => setGradeData(prev => ({ ...prev, valorParticularPadrao: Number(e.target.value) || 0 }))}
              className="form-control text-sm font-bold text-slate-800"
              style={{ maxWidth: '160px', padding: '0.45rem', borderRadius: '8px' }}
            />
            <span className="text-xs text-slate-400">por atendimento</span>
          </div>
        </div>
      </div>

      {/* GRADE SEMANAL POR DIAS */}
      <div 
        className="glass-panel"
        style={{
          padding: '1.25rem',
          borderRadius: '16px',
          background: '#ffffff',
          border: '1px solid #e2e8f0'
        }}
      >
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
          Horários de Atendimento por Dia:
        </span>

        <div className="flex flex-col gap-2.5">
          {Object.entries(DIA_LABELS).map(([diaKey, diaLabel]) => {
            const conf = gradeData.diasSemana?.[diaKey] || {};
            const ativo = Boolean(conf.ativo);

            return (
              <div 
                key={diaKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: ativo ? '#ffffff' : '#f8fafc',
                  border: '1px solid',
                  borderColor: ativo ? '#bfdbfe' : '#e2e8f0',
                  boxShadow: ativo ? '0 1px 3px rgba(37, 99, 235, 0.06)' : 'none',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                {/* Switch Ativo & Nome do Dia */}
                <div className="flex items-center gap-3" style={{ minWidth: '150px' }}>
                  <input
                    type="checkbox"
                    id={`dia-${diaKey}`}
                    checked={ativo}
                    onChange={() => toggleDiaAtivo(diaKey)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label 
                    htmlFor={`dia-${diaKey}`} 
                    className={`text-xs font-bold ${ativo ? 'text-slate-900' : 'text-slate-400'}`}
                    style={{ cursor: 'pointer' }}
                  >
                    {diaLabel}
                  </label>
                </div>

                {/* Horários Manhã e Tarde */}
                {ativo ? (
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="font-semibold text-2xs uppercase text-slate-500">Manhã:</span>
                      <input
                        type="time"
                        value={conf.inicioManha || '08:00'}
                        onChange={(e) => handleHorarioChange(diaKey, 'inicioManha', e.target.value)}
                        className="form-control text-2xs"
                        style={{ padding: '3px 6px', borderRadius: '6px' }}
                      />
                      <span>às</span>
                      <input
                        type="time"
                        value={conf.fimManha || '12:00'}
                        onChange={(e) => handleHorarioChange(diaKey, 'fimManha', e.target.value)}
                        className="form-control text-2xs"
                        style={{ padding: '3px 6px', borderRadius: '6px' }}
                      />
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="font-semibold text-2xs uppercase text-slate-500">Tarde:</span>
                      <input
                        type="time"
                        value={conf.inicioTarde || '14:00'}
                        onChange={(e) => handleHorarioChange(diaKey, 'inicioTarde', e.target.value)}
                        className="form-control text-2xs"
                        style={{ padding: '3px 6px', borderRadius: '6px' }}
                      />
                      <span>às</span>
                      <input
                        type="time"
                        value={conf.fimTarde || '18:00'}
                        onChange={(e) => handleHorarioChange(diaKey, 'fimTarde', e.target.value)}
                        className="form-control text-2xs"
                        style={{ padding: '3px 6px', borderRadius: '6px' }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-2xs text-slate-400 italic">
                    Sem atendimentos programados
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CONVÊNIOS ATENDIDOS */}
      <div 
        className="glass-panel"
        style={{
          padding: '1.25rem',
          borderRadius: '16px',
          background: '#ffffff',
          border: '1px solid #e2e8f0'
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={17} color="#475569" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Convênios e Planos Aceitos:
          </span>
        </div>

        <div className="flex gap-2 flex-wrap mb-3">
          {(gradeData.conveniosAceitos || []).map(conv => (
            <div 
              key={conv}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                fontSize: '0.78rem',
                color: '#334155',
                fontWeight: '600'
              }}
            >
              <span>{conv}</span>
              {conv !== 'Particular' && (
                <button
                  type="button"
                  onClick={() => handleRemoveConvenio(conv)}
                  className="text-slate-400 hover:text-red-600"
                  title="Remover convênio"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleAddConvenio} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={newConvenio}
            onChange={(e) => setNewConvenio(e.target.value)}
            placeholder="Nome de outro convênio (ex: Omint, Mediservice)"
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
      </div>
    </div>
  );
}
