import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  MapPin, 
  User, 
  Hospital, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Sliders,
  FileText,
  AlertOctagon,
  Droplet
} from 'lucide-react';
import { 
  TIPOS_EVENTO_ACESSO, 
  savePatientAccessIntervention, 
  deletePatientAccessIntervention, 
  updatePatientAccessVascular 
} from '../../services/patientService.js';
import { safeFormatDate } from '../../utils/dateUtils.js';
import AccessInterventionModal from './AccessInterventionModal.jsx';
import AccessParametersModal from './AccessParametersModal.jsx';

/**
 * Calcula o tempo de uso do acesso (anos e meses ou dias)
 */
function calculateAccessAge(dateStr) {
  if (!dateStr) return null;
  const start = new Date(dateStr);
  const now = new Date();
  if (isNaN(start.getTime())) return null;

  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months--;

  if (months < 1) {
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} dias`;
  }
  if (months < 12) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} m`;
}

/**
 * Retorna estilo semântico baseado no tipo de evento
 */
function getEventBadgeStyle(tipoEvento) {
  const match = TIPOS_EVENTO_ACESSO.find(t => t.value === tipoEvento || t.label === tipoEvento);
  if (match) {
    return { color: match.color, bg: match.bg, border: match.border };
  }
  return { color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' };
}

/**
 * Retorna cor do desfecho do procedimento
 */
function getDesfechoBadge(desfecho) {
  const d = (desfecho || '').toLowerCase();
  if (d.includes('sucesso') || d.includes('dilatada') || d.includes('removido') || d.includes('sem intercorr')) {
    return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
  }
  if (d.includes('parcial')) {
    return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
  }
  if (d.includes('insucesso') || d.includes('falha') || d.includes('trombose')) {
    return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
  }
  return { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
}

export default function VascularAccessTab({
  patient,
  currentUser,
  anticoagulacaoInfo = { textoCompleto: 'Heparina Padrão', isSemHeparina: false },
  onOpenLockTherapy = null
}) {
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [interventionToEdit, setInterventionToEdit] = useState(null);
  const [isParametersModalOpen, setIsParametersModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const acessoVascular = patient?.acessoVascular || {};
  const historicoAcesso = useMemo(() => {
    return Array.isArray(patient?.historicoAcesso) ? patient.historicoAcesso : [];
  }, [patient?.historicoAcesso]);

  const accessAge = useMemo(() => {
    return calculateAccessAge(acessoVascular.dataConfeccao);
  }, [acessoVascular.dataConfeccao]);

  const isCatheter = useMemo(() => {
    const tipo = (acessoVascular.tipo || '').toLowerCase();
    return tipo.includes('permcath') || tipo.includes('cateter') || tipo.includes('cdl') || tipo.includes('duplo');
  }, [acessoVascular.tipo]);

  // Filtros rápidos
  const filteredIntervencoes = useMemo(() => {
    return historicoAcesso.filter(item => {
      // Filtro por categoria
      if (selectedFilter !== 'todos') {
        const tipo = (item.tipoEvento || '').toLowerCase();
        if (selectedFilter === 'cirurgia' && !tipo.includes('confecção') && !tipo.includes('revisão')) return false;
        if (selectedFilter === 'angioplastia' && !tipo.includes('angioplastia')) return false;
        if (selectedFilter === 'cateter' && !tipo.includes('cateter')) return false;
        if (selectedFilter === 'desobstrucao' && !tipo.includes('desobstrução') && !tipo.includes('alteplase')) return false;
        if (selectedFilter === 'doppler' && !tipo.includes('doppler') && !tipo.includes('exame')) return false;
        if (selectedFilter === 'infeccao' && !tipo.includes('infecção') && !tipo.includes('cultura')) return false;
      }

      // Busca por texto livre
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const fullText = `${item.tipoEvento || ''} ${item.acesso || ''} ${item.ladoMembro || ''} ${item.profissional || ''} ${item.hospital || ''} ${item.descricao || ''} ${item.conduta || ''} ${item.desfecho || ''}`.toLowerCase();
        return fullText.includes(query);
      }

      return true;
    });
  }, [historicoAcesso, selectedFilter, searchTerm]);

  // Salvar intervenção
  const handleSaveIntervention = async (formData, interventionId) => {
    if (!patient?.id) return;
    await savePatientAccessIntervention(patient.id, formData, interventionId, currentUser?.email || '');
  };

  // Excluir intervenção
  const handleConfirmDelete = async () => {
    if (!patient?.id || !itemToDelete) return;
    try {
      setIsDeleting(true);
      await deletePatientAccessIntervention(patient.id, itemToDelete.id);
      setItemToDelete(null);
    } catch (err) {
      console.error('Erro ao excluir intervenção:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Salvar parâmetros do acesso
  const handleSaveParameters = async (formData) => {
    if (!patient?.id) return;
    await updatePatientAccessVascular(patient.id, formData);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ================= BARRA SUPERIOR DE AÇÕES ================= */}
      <div 
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(248,250,252,0.95))'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Activity size={22} />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-800 tracking-tight">
              Acesso Vascular
            </h1>
            <p className="text-xs text-slate-500">
              Vigilância hemodinâmica, cirurgias e histórico de manutenções
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isCatheter && onOpenLockTherapy && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenLockTherapy}
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '10px'
              }}
              title="Protocolo de Lock Therapy para Cateter"
            >
              <Droplet size={15} color="#0284c7" />
              <span>Protocolo</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsParametersModalOpen(true)}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '10px'
            }}
            title="Ajustar parâmetros vigentes"
          >
            <Sliders size={15} />
            <span>Editar</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setInterventionToEdit(null);
              setIsInterventionModalOpen(true);
            }}
            style={{
              padding: '0.45rem 1.15rem',
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Plus size={16} />
            <span>Registrar</span>
          </button>
        </div>
      </div>

      {/* ================= GRADE DE 3 COLUNAS BALANCEADAS ================= */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}
      >
        {/* CARD 1: ACESSO VIGENTE */}
        <div 
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.85rem'
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Acesso Vigente
            </span>
            <span 
              style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '8px',
                background: isCatheter ? '#fff7ed' : '#eff6ff',
                color: isCatheter ? '#c2410c' : '#1d4ed8'
              }}
            >
              {acessoVascular.tipo || 'FAV'}
            </span>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between items-center gap-3 border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted shrink-0">Local:</span>
              <strong className="text-slate-800 font-semibold text-right">{acessoVascular.ladoMembro || 'Não informado'}</strong>
            </div>
            <div className="flex justify-between items-center gap-3 border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted shrink-0">Confecção:</span>
              <strong className="text-slate-800 font-semibold text-right">
                {acessoVascular.dataConfeccao ? safeFormatDate(acessoVascular.dataConfeccao) : 'Não informada'}
              </strong>
            </div>
            <div className="flex justify-between items-center gap-3">
              <span className="text-muted shrink-0">Tempo em Uso:</span>
              <strong className="text-blue-700 font-semibold text-right">{accessAge || 'Recente'}</strong>
            </div>
          </div>
        </div>

        {/* CARD 2: PARÂMETROS HEMODINÂMICOS */}
        <div 
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.85rem'
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Hemodinâmica
            </span>
            <span 
              style={{
                fontSize: '0.72rem',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '8px',
                background: '#f8fafc',
                color: '#475569',
                border: '1px solid #e2e8f0'
              }}
            >
              Prescrição
            </span>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between items-center gap-3 border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted shrink-0">Qb (Fluxo Sangue):</span>
              <strong className="text-slate-800 font-semibold text-right">
                {acessoVascular.fluxoSangue ? `${acessoVascular.fluxoSangue} ml/min` : '-'}
              </strong>
            </div>
            <div className="flex justify-between items-center gap-3 border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted shrink-0">Qd (Dialisato):</span>
              <strong className="text-slate-800 font-semibold text-right">
                {acessoVascular.fluxoDialisato ? `${acessoVascular.fluxoDialisato} ml/min` : '-'}
              </strong>
            </div>
            <div className="flex justify-between items-center gap-3">
              <span className="text-muted shrink-0">Calibre:</span>
              <strong className="text-slate-800 font-semibold text-right">
                {acessoVascular.agulha || (isCatheter ? 'Permcath Duplo' : '16G')}
              </strong>
            </div>
          </div>
        </div>

        {/* CARD 3: VIGILÂNCIA E ALERTAS */}
        <div 
          className="glass-panel"
          style={{
            padding: '1.25rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.85rem'
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Vigilância Clínica
            </span>
            <span 
              style={{
                fontSize: '0.72rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '8px',
                background: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0'
              }}
            >
              {historicoAcesso.length} {historicoAcesso.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <div className="flex justify-between items-center gap-3 border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted shrink-0">Último Evento:</span>
              <strong className="text-slate-800 font-semibold truncate max-w-[60%] text-right">
                {historicoAcesso[0] 
                  ? `${safeFormatDate(historicoAcesso[0].data)} (${historicoAcesso[0].tipoEvento})`
                  : 'Nenhum lançamento'}
              </strong>
            </div>
            <div className="flex justify-between items-start gap-3 border-b pb-1.5" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted shrink-0">Anticoagulação:</span>
              <strong 
                className="font-semibold text-right"
                style={{ color: anticoagulacaoInfo.isSemHeparina ? '#dc2626' : '#334155' }}
              >
                {anticoagulacaoInfo.textoCompleto || 'Heparina'}
              </strong>
            </div>
            <div className="flex justify-between items-center gap-3">
              <span className="text-muted shrink-0">Condição:</span>
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Em atividade</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEÇÃO DE LINHA DO TEMPO (TIMELINE) ================= */}
      <section 
        className="glass-panel"
        style={{
          padding: '1.5rem',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {/* Barra de Filtros e Busca */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1" style={{ maxWidth: '100%' }}>
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'angioplastia', label: 'Angioplastias' },
              { id: 'cirurgia', label: 'Cirurgias' },
              { id: 'cateter', label: 'Cateteres' },
              { id: 'desobstrucao', label: 'Desobstruções' },
              { id: 'doppler', label: 'Doppler' },
              { id: 'infeccao', label: 'Infecções' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFilter(f.id)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: selectedFilter === f.id ? '700' : '500',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedFilter === f.id ? '#2563eb' : '#e2e8f0',
                  background: selectedFilter === f.id ? '#eff6ff' : '#ffffff',
                  color: selectedFilter === f.id ? '#1d4ed8' : '#64748b',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Buscar histórico..."
              className="input-field text-xs w-full pl-9 pr-3 py-1.5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Linha do Tempo */}
        {filteredIntervencoes.length === 0 ? (
          <div 
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <div 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Activity size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-700">
                Nenhuma intervenção registrada
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Cadastre o histórico de confecções, angioplastias, trocas de cateter, desobstruções ou exames doppler deste paciente.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary mt-2"
              onClick={() => {
                setInterventionToEdit(null);
                setIsInterventionModalOpen(true);
              }}
              style={{
                padding: '0.45rem 1.25rem',
                fontSize: '0.82rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '10px'
              }}
            >
              <Plus size={15} />
              <span>Registrar</span>
            </button>
          </div>
        ) : (
          <div className="relative pl-6 flex flex-col gap-5">
            {/* Linha vertical contínua */}
            <div 
              style={{
                position: 'absolute',
                left: '11px',
                top: '12px',
                bottom: '12px',
                width: '2px',
                background: '#e2e8f0'
              }}
            />

            {filteredIntervencoes.map((item) => {
              const badgeStyle = getEventBadgeStyle(item.tipoEvento);
              const desfechoStyle = getDesfechoBadge(item.desfecho);

              return (
                <div key={item.id} className="relative flex flex-col gap-2">
                  {/* Ponto indicador na linha do tempo */}
                  <div 
                    style={{
                      position: 'absolute',
                      left: '-24px',
                      top: '12px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: badgeStyle.color,
                      border: '2px solid #ffffff',
                      boxShadow: `0 0 0 2px ${badgeStyle.border}`
                    }}
                  />

                  {/* Card do Evento */}
                  <div 
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      padding: '1.15rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                    }}
                  >
                    {/* Header do Card */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Data */}
                        <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                          <Calendar size={13} color="var(--primary)" />
                          <span>{safeFormatDate(item.data)}</span>
                        </span>

                        {/* Tipo de Evento */}
                        <span 
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            background: badgeStyle.bg,
                            color: badgeStyle.color,
                            border: `1px solid ${badgeStyle.border}`
                          }}
                        >
                          {item.tipoEvento}
                        </span>

                        {/* Acesso & Local */}
                        <span className="text-xs text-slate-500 font-medium">
                          • {item.acesso} {item.ladoMembro ? `(${item.ladoMembro})` : ''}
                        </span>

                        {/* Desfecho */}
                        {item.desfecho && (
                          <span 
                            style={{
                              fontSize: '0.70rem',
                              fontWeight: '600',
                              padding: '1px 7px',
                              borderRadius: '6px',
                              background: desfechoStyle.bg,
                              color: desfechoStyle.color,
                              border: `1px solid ${desfechoStyle.border}`
                            }}
                          >
                            {item.desfecho}
                          </span>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setInterventionToEdit(item);
                            setIsInterventionModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Descrição do Procedimento */}
                    <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {item.descricao}
                    </div>

                    {/* Conduta para Hemodiálise (se houver) */}
                    {item.conduta && (
                      <div 
                        style={{
                          fontSize: '0.75rem',
                          background: '#eff6ff',
                          color: '#1e3a8a',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '10px',
                          border: '1px solid #dbeafe',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '6px'
                        }}
                      >
                        <Sparkles size={14} className="shrink-0 mt-0.5 text-blue-600" />
                        <div>
                          <strong>Conduta: </strong>
                          <span>{item.conduta}</span>
                        </div>
                      </div>
                    )}

                    {/* Rodapé do Registro: Profissional, Hospital e Anexo */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        {item.profissional && (
                          <span className="flex items-center gap-1">
                            <User size={12} className="text-slate-400" />
                            <span>{item.profissional}</span>
                          </span>
                        )}
                        {item.hospital && (
                          <span className="flex items-center gap-1">
                            <Hospital size={12} className="text-slate-400" />
                            <span>{item.hospital}</span>
                          </span>
                        )}
                      </div>

                      {item.anexoUrl && (
                        <a 
                          href={item.anexoUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink size={12} />
                          <span>Ver Laudo</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= MODAIS ================= */}
      {/* Modal de Registro / Edição de Intervenção */}
      <AccessInterventionModal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        onSave={handleSaveIntervention}
        interventionToEdit={interventionToEdit}
        patient={patient}
        currentUser={currentUser}
      />

      {/* Modal de Parâmetros do Acesso */}
      <AccessParametersModal
        isOpen={isParametersModalOpen}
        onClose={() => setIsParametersModalOpen(false)}
        onSave={handleSaveParameters}
        patient={patient}
      />

      {/* Modal de Confirmação de Exclusão */}
      {itemToDelete && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => !isDeleting && setItemToDelete(null)}
        >
          <div 
            className="modal-container"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '420px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  Excluir Intervenção
                </h3>
                <p className="text-xs text-slate-500">
                  {itemToDelete.tipoEvento} de {safeFormatDate(itemToDelete.data)}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tem certeza de que deseja remover este lançamento do prontuário? Esta ação não pode ser desfeita.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                style={{ padding: '0.45rem 1.15rem', fontSize: '0.82rem' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  padding: '0.45rem 1.25rem',
                  fontSize: '0.82rem',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: '600',
                  borderRadius: '10px',
                  border: 'none'
                }}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
