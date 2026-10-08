import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Edit, 
  Trash2, 
  ExternalLink,
  DollarSign,
  User,
  Filter
} from 'lucide-react';
import { 
  APPOINTMENT_STATUSES, 
  updateAppointmentStatus, 
  deleteAppointment 
} from '../../services/appointmentService';

export default function AppointmentSchedule({
  appointments = [],
  patients = [],
  doctorInfo = null,
  onOpenNewAppointment,
  onEditAppointment
}) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Navegação de dias
  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Formatação de data amigável
  const formattedDateTitle = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Agendamentos do dia selecionado
  const dayAppointments = useMemo(() => {
    return appointments.filter(a => a.data === selectedDate);
  }, [appointments, selectedDate]);

  // Agendamentos filtrados por status
  const filteredAppointments = useMemo(() => {
    if (statusFilter === 'Todos') return dayAppointments;
    return dayAppointments.filter(a => a.status === statusFilter);
  }, [dayAppointments, statusFilter]);

  // Métricas do dia
  const stats = useMemo(() => {
    const total = dayAppointments.length;
    const confirmados = dayAppointments.filter(a => a.status === 'Confirmado' || a.status === 'Agendado').length;
    const aguardando = dayAppointments.filter(a => a.status === 'Aguardando').length;
    const atendidos = dayAppointments.filter(a => a.status === 'Atendido').length;
    const faltaram = dayAppointments.filter(a => a.status === 'Faltou').length;
    const totalParticular = dayAppointments
      .filter(a => a.modalidade === 'Particular' && a.status !== 'Cancelado')
      .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

    return { total, confirmados, aguardando, atendidos, faltaram, totalParticular };
  }, [dayAppointments]);

  // Mudar status da consulta
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  // Excluir agendamento
  const handleDelete = async (appointment) => {
    if (window.confirm(`Deseja cancelar/remover a consulta de ${appointment.patientNome} às ${appointment.hora}?`)) {
      try {
        await deleteAppointment(appointment.id);
      } catch (err) {
        alert('Erro ao excluir consulta: ' + err.message);
      }
    }
  };

  // Gerar link do WhatsApp para confirmação rápida
  const getWhatsAppLink = (appointment) => {
    const rawPhone = (appointment.patientTelefone || '').replace(/\D/g, '');
    if (!rawPhone || rawPhone.length < 10) return null;
    const docName = doctorInfo?.nome || 'Dr(a). Nefrologista';
    const text = encodeURIComponent(
      `Olá, ${appointment.patientNome}! Confirmamos sua consulta nefrológica com ${docName} no dia ${selectedDate.split('-').reverse().join('/')} às ${appointment.hora}. Qualquer dúvida estamos à disposição!`
    );
    return `https://api.whatsapp.com/send?phone=55${rawPhone}&text=${text}`;
  };

  return (
    <div className="flex flex-col gap-4 animate-in">
      {/* BARRA SUPERIOR DE NAVEGAÇÃO E AÇÃO */}
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
        {/* Controles de Navegação de Data */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleToday}
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '8px' }}
          >
            Hoje
          </button>

          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1 text-slate-600 hover:text-slate-900 rounded"
              title="Dia anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '0.78rem',
                fontWeight: '600',
                padding: '2px 6px',
                color: '#1e293b',
                outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={handleNextDay}
              className="p-1 text-slate-600 hover:text-slate-900 rounded"
              title="Próximo dia"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <span className="text-xs font-semibold text-slate-700 capitalize pl-1">
            {formattedDateTitle}
          </span>
        </div>

        {/* Botão Principal: Agendar */}
        <button
          type="button"
          onClick={() => onOpenNewAppointment(selectedDate)}
          className="btn btn-primary"
          style={{
            fontSize: '0.82rem',
            padding: '0.5rem 1.1rem',
            borderRadius: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={16} />
          <span>Agendar</span>
        </button>
      </div>

      {/* CARDS DE RESUMO DO DIA (ZERO BURACOS) */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem'
        }}
      >
        <div className="p-3 rounded-xl border bg-white flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div>
            <span className="text-2xs text-muted block">Total do Dia</span>
            <strong className="text-lg text-slate-800">{stats.total}</strong>
          </div>
          <CalendarIcon size={20} color="var(--primary)" />
        </div>

        <div className="p-3 rounded-xl border bg-white flex items-center justify-between" style={{ borderColor: '#fde68a' }}>
          <div>
            <span className="text-2xs text-amber-700 block">Em Espera</span>
            <strong className="text-lg text-amber-800">{stats.aguardando}</strong>
          </div>
          <Clock size={20} color="#d97706" />
        </div>

        <div className="p-3 rounded-xl border bg-white flex items-center justify-between" style={{ borderColor: '#bbf7d0' }}>
          <div>
            <span className="text-2xs text-emerald-700 block">Atendidos</span>
            <strong className="text-lg text-emerald-800">{stats.atendidos}</strong>
          </div>
          <CheckCircle2 size={20} color="#16a34a" />
        </div>

        <div className="p-3 rounded-xl border bg-white flex items-center justify-between" style={{ borderColor: '#fecaca' }}>
          <div>
            <span className="text-2xs text-rose-700 block">Faltaram</span>
            <strong className="text-lg text-rose-800">{stats.faltaram}</strong>
          </div>
          <AlertCircle size={20} color="#dc2626" />
        </div>

        <div className="p-3 rounded-xl border bg-white flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <div>
            <span className="text-2xs text-muted block">Particular</span>
            <strong className="text-sm text-slate-800">
              {stats.totalParticular.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </strong>
          </div>
          <DollarSign size={20} color="#059669" />
        </div>
      </div>

      {/* BARRA DE FILTROS DE STATUS (SEGMENTED PILL) */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div 
          style={{ 
            display: 'inline-flex', 
            background: '#f1f5f9', 
            padding: '3px', 
            borderRadius: '10px', 
            border: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '2px'
          }}
        >
          {['Todos', 'Agendado', 'Confirmado', 'Aguardando', 'Atendido', 'Faltou'].map(st => {
            const isSel = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '7px',
                  fontSize: '0.74rem',
                  fontWeight: isSel ? '700' : '500',
                  background: isSel ? '#ffffff' : 'transparent',
                  color: isSel ? '#2563eb' : '#64748b',
                  boxShadow: isSel ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {st}
              </button>
            );
          })}
        </div>

        <span className="text-xs text-muted">
          Exibindo {filteredAppointments.length} consulta(s)
        </span>
      </div>

      {/* LISTA CRONOLÓGICA DE CONSULTAS */}
      {filteredAppointments.length === 0 ? (
        <div 
          className="glass-panel text-center py-12"
          style={{ borderRadius: '16px', background: 'var(--surface-solid)' }}
        >
          <CalendarIcon size={36} color="#94a3b8" style={{ margin: '0 auto 0.5rem auto' }} />
          <h4 className="text-sm font-bold text-slate-700">Nenhuma consulta agendada</h4>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            Não há atendimentos registrados para este dia ou filtro selecionado.
          </p>
          <button
            type="button"
            onClick={() => onOpenNewAppointment(selectedDate)}
            className="btn btn-outline mt-3"
            style={{ fontSize: '0.78rem', padding: '0.4rem 1rem', borderRadius: '8px' }}
          >
            Agendar Paciente
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredAppointments.map((apt) => {
            const stObj = APPOINTMENT_STATUSES.find(s => s.value === apt.status) || APPOINTMENT_STATUSES[0];
            const waLink = getWhatsAppLink(apt);
            const hasPatientDoc = Boolean(apt.patientId);

            return (
              <div
                key={apt.id}
                className="glass-panel"
                style={{
                  padding: '0.9rem 1.15rem',
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: '1px solid var(--border)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                {/* Horário & Paciente */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div 
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      textAlign: 'center',
                      minWidth: '58px'
                    }}
                  >
                    <span style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0f172a', display: 'block' }}>
                      {apt.hora}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
                      {apt.tipo}
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a' }}>
                        {apt.patientNome}
                      </span>
                      {hasPatientDoc ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/patient/${apt.patientId}`)}
                          className="text-2xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-0.5"
                          title="Abrir prontuário completo do paciente"
                        >
                          <span>Prontuário</span>
                          <ExternalLink size={10} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.66rem', color: '#94a3b8' }}>
                          (Avulso)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                      {apt.patientTelefone && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Phone size={11} /> {apt.patientTelefone}
                        </span>
                      )}
                      <span style={{ fontSize: '0.72rem', color: '#475569' }}>
                        · {apt.modalidade} {apt.convenioNome ? `(${apt.convenioNome})` : (apt.valor ? `R$ ${Number(apt.valor).toFixed(2)}` : '')}
                      </span>
                      {apt.observacoes && (
                        <span style={{ fontSize: '0.70rem', color: '#94a3b8' }} title={apt.observacoes}>
                          · {apt.observacoes.slice(0, 35)}...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Pills & Ações Rápidas */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {/* Seletor Rápido de Status */}
                  <select
                    value={apt.status}
                    onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: stObj.bg,
                      color: stObj.color,
                      border: `1px solid ${stObj.border}`,
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {APPOINTMENT_STATUSES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>

                  {/* Botão WhatsApp se houver telefone */}
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{
                        padding: '4px 7px',
                        borderRadius: '8px',
                        color: '#059669',
                        borderColor: '#a7f3d0',
                        background: '#ecfdf5'
                      }}
                      title="Enviar lembrete via WhatsApp"
                    >
                      <MessageSquare size={13} />
                    </a>
                  )}

                  {/* Editar */}
                  <button
                    type="button"
                    onClick={() => onEditAppointment(apt)}
                    className="btn btn-outline"
                    style={{ padding: '4px 7px', borderRadius: '8px' }}
                    title="Editar agendamento"
                  >
                    <Edit size={13} color="var(--primary)" />
                  </button>

                  {/* Excluir */}
                  <button
                    type="button"
                    onClick={() => handleDelete(apt)}
                    className="btn btn-outline"
                    style={{ padding: '4px 7px', borderRadius: '8px' }}
                    title="Cancelar agendamento"
                  >
                    <Trash2 size={13} color="var(--danger)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
