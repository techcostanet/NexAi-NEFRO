import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CreditCard, 
  FileText, 
  Check, 
  Loader2,
  Building2,
  AlertCircle
} from 'lucide-react';
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES } from '../../services/appointmentService';

export default function AppointmentModal({
  isOpen,
  onClose,
  onSave,
  appointmentToEdit = null,
  patients = [],
  doctorInfo = null,
  initialDate = ''
}) {
  const [patientMode, setPatientMode] = useState('existing'); // 'existing' | 'new'
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dados do paciente caso seja novo
  const [newPatientNome, setNewPatientNome] = useState('');
  const [newPatientTelefone, setNewPatientTelefone] = useState('');
  const [newPatientCpf, setNewPatientCpf] = useState('');

  // Dados do agendamento
  const [data, setData] = useState('');
  const [hora, setHora] = useState('09:00');
  const [tipo, setTipo] = useState('Retorno');
  const [status, setStatus] = useState('Agendado');
  const [localId, setLocalId] = useState('');
  const [localNome, setLocalNome] = useState('');
  const [modalidade, setModalidade] = useState('Particular');
  const [convenioNome, setConvenioNome] = useState('');
  const [valor, setValor] = useState('350.00');
  const [observacoes, setObservacoes] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const locais = Array.isArray(doctorInfo?.locaisAtuacao) ? doctorInfo.locaisAtuacao : [];

  useEffect(() => {
    if (appointmentToEdit) {
      setSelectedPatientId(appointmentToEdit.patientId || '');
      setPatientMode(appointmentToEdit.patientId ? 'existing' : 'new');
      setNewPatientNome(appointmentToEdit.patientNome || '');
      setNewPatientTelefone(appointmentToEdit.patientTelefone || '');
      setNewPatientCpf(appointmentToEdit.patientCpf || '');
      setData(appointmentToEdit.data || '');
      setHora(appointmentToEdit.hora || '09:00');
      setTipo(appointmentToEdit.tipo || 'Retorno');
      setStatus(appointmentToEdit.status || 'Agendado');
      setLocalId(appointmentToEdit.localId || '');
      setLocalNome(appointmentToEdit.localNome || '');
      setModalidade(appointmentToEdit.modalidade || 'Particular');
      setConvenioNome(appointmentToEdit.convenioNome || '');
      setValor(appointmentToEdit.valor !== undefined ? String(appointmentToEdit.valor) : '350.00');
      setObservacoes(appointmentToEdit.observacoes || '');
    } else {
      // Novo agendamento
      setSelectedPatientId('');
      setPatientMode('existing');
      setNewPatientNome('');
      setNewPatientTelefone('');
      setNewPatientCpf('');
      const todayStr = initialDate || new Date().toISOString().split('T')[0];
      setData(todayStr);
      setHora('09:00');
      setTipo('Retorno');
      setStatus('Agendado');
      setLocalId(locais[0]?.id || '');
      setLocalNome(locais[0]?.nome || '');
      setModalidade('Particular');
      setConvenioNome('');
      setValor('350.00');
      setObservacoes('');
    }
    setError('');
  }, [appointmentToEdit, isOpen, initialDate]);

  if (!isOpen) return null;

  // Filtragem de pacientes existentes
  const filteredPatients = patients.filter(p => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (p.nome || '').toLowerCase().includes(term) ||
           (p.cpf || '').includes(term) ||
           (p.telefone || '').includes(term);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let finalPatientId = selectedPatientId;
    let finalPatientNome = '';
    let finalPatientTelefone = '';
    let finalPatientCpf = '';

    if (patientMode === 'existing') {
      const p = patients.find(it => it.id === selectedPatientId);
      if (!p) {
        setError('Selecione um paciente cadastrado.');
        return;
      }
      finalPatientId = p.id;
      finalPatientNome = p.nome;
      finalPatientTelefone = p.telefone || '';
      finalPatientCpf = p.cpf || '';
    } else {
      if (!newPatientNome.trim()) {
        setError('Informe o nome do paciente.');
        return;
      }
      finalPatientNome = newPatientNome.trim();
      finalPatientTelefone = newPatientTelefone.trim();
      finalPatientCpf = newPatientCpf.trim();
    }

    if (!data || !hora) {
      setError('Informe a data e o horário da consulta.');
      return;
    }

    const payload = {
      patientId: finalPatientId || null,
      patientNome: finalPatientNome,
      patientTelefone: finalPatientTelefone,
      patientCpf: finalPatientCpf,
      doctorId: doctorInfo?.id || 'dr-marcelo',
      data,
      hora,
      tipo,
      status,
      localId,
      localNome,
      modalidade,
      convenioNome: modalidade === 'Convênio' ? convenioNome : '',
      valor: modalidade === 'Particular' ? Number(valor) || 0 : 0,
      observacoes: observacoes.trim()
    };

    try {
      setSaving(true);
      await onSave(payload, appointmentToEdit?.id);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar agendamento:', err);
      setError(err.message || 'Erro ao salvar agendamento no Firestore.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
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
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Cabeçalho */}
        <div 
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bfdbfe'
              }}
            >
              <Calendar size={17} color="#2563eb" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: '700', color: '#0f172a' }}>
                {appointmentToEdit ? 'Editar Consulta' : 'Nova Consulta'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                Agendamento ambulatorial no Cloud Firestore
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#94a3b8'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário com Scroll Suave */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div 
            style={{
              padding: '1.25rem',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {/* Alternador Paciente Cadastrado / Novo */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                Paciente
              </label>
              <div 
                style={{ 
                  display: 'inline-flex', 
                  background: '#f1f5f9', 
                  padding: '3px', 
                  borderRadius: '10px', 
                  border: '1px solid #e2e8f0',
                  width: '100%'
                }}
              >
                <button
                  type="button"
                  onClick={() => setPatientMode('existing')}
                  style={{
                    flex: 1,
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: patientMode === 'existing' ? '700' : '500',
                    background: patientMode === 'existing' ? '#ffffff' : 'transparent',
                    color: patientMode === 'existing' ? '#2563eb' : '#64748b',
                    boxShadow: patientMode === 'existing' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Paciente Cadastrado
                </button>
                <button
                  type="button"
                  onClick={() => setPatientMode('new')}
                  style={{
                    flex: 1,
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: patientMode === 'new' ? '700' : '500',
                    background: patientMode === 'new' ? '#ffffff' : 'transparent',
                    color: patientMode === 'new' ? '#2563eb' : '#64748b',
                    boxShadow: patientMode === 'new' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Novo Paciente
                </button>
              </div>
            </div>

            {patientMode === 'existing' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc'
                  }}
                />
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  style={{
                    padding: '0.5rem 0.65rem',
                    fontSize: '0.82rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff'
                  }}
                >
                  <option value="">Selecione o paciente...</option>
                  {filteredPatients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} {p.cpf ? `(${p.cpf})` : ''} · {p.clinica || 'Geral'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={newPatientNome}
                    onChange={(e) => setNewPatientNome(e.target.value)}
                    placeholder="Nome do paciente"
                    style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>Telefone (WhatsApp)</label>
                  <input
                    type="tel"
                    value={newPatientTelefone}
                    onChange={(e) => setNewPatientTelefone(e.target.value)}
                    placeholder="(31) 99999-9999"
                    style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '2px' }}>CPF</label>
                  <input
                    type="text"
                    value={newPatientCpf}
                    onChange={(e) => setNewPatientCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
            )}

            {/* Data e Horário */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Horário *
                </label>
                <input
                  type="time"
                  required
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>

            {/* Tipo de Consulta e Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Tipo de Consulta
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                >
                  {APPOINTMENT_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                >
                  {APPOINTMENT_STATUSES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modalidade e Valor */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Modalidade
                </label>
                <select
                  value={modalidade}
                  onChange={(e) => setModalidade(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.65rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff' }}
                >
                  <option value="Particular">Particular</option>
                  <option value="Convênio">Convênio</option>
                  <option value="Retorno Gratuito">Retorno Gratuito</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  {modalidade === 'Convênio' ? 'Nome do Convênio' : 'Valor (R$)'}
                </label>
                {modalidade === 'Convênio' ? (
                  <input
                    type="text"
                    value={convenioNome}
                    onChange={(e) => setConvenioNome(e.target.value)}
                    placeholder="Unimed, Bradesco..."
                    style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                ) : (
                  <input
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                )}
              </div>
            </div>

            {/* Observações */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                Observações
              </label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex.: Paciente traz exames recentes de creatinina e ultrassom renal..."
                style={{
                  width: '100%',
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  resize: 'none'
                }}
              />
            </div>
          </div>

          {/* Rodapé de Ações (Regra de poucas palavras) */}
          <div 
            style={{
              padding: '0.85rem 1.25rem',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.5rem',
              flexShrink: 0
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="btn btn-outline"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.95rem' }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ fontSize: '0.78rem', padding: '0.45rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              <span>{saving ? 'Salvando...' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
