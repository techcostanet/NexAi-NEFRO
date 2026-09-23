import React, { useState, useEffect } from 'react';
import { X, Save, User, UserX, UserMinus, Loader2, Syringe, AlertTriangle } from 'lucide-react';
import { 
  savePatient, 
  calculateAge, 
  STATUS_TRANSPLANTE_OPTIONS,
  TIPOS_ANTICOAGULACAO,
  PRESETS_HEPARINA
} from '../services/patientService';
import { useAuth } from '../context/AuthContext';
import AllergySelector from './AllergySelector';
import PatientDischargeModal from './PatientDischargeModal';

const TIPOS_ACESSO_PADRAO = [
  { value: 'FAV', label: 'FAV (Fístula Arteriovenosa)' },
  { value: 'CDL', label: 'CDL (Cateter Duplo Lúmen)' },
  { value: 'Permcath', label: 'Permcath (Cateter Tunelizado)' },
  { value: 'Prótese', label: 'Prótese Vascular' },
  { value: 'Cateter Peritoneal', label: 'Cateter Peritoneal' },
];

export const ETIOLOGIAS_DRC_PADRAO = [
  { value: 'Diabetes Mellitus / Nefropatia Diabética', label: 'Nefropatia Diabética' },
  { value: 'Hipertensão Arterial Sistêmica (HAS)', label: 'Nefroesclerose Hipertensiva' },
  { value: 'Glomerulonefrite Crônica (GNC)', label: 'Glomerulonefrite Crônica' },
  { value: 'Doença Renal Policística Autossômica Dominante (DRPAD)', label: 'Doença Renal Policística' },
  { value: 'Nefropatia Lúpica / Doenças Autoimunes', label: 'Nefrite Lúpica' },
  { value: 'Uropatia Obstrutiva / Litíase Renal', label: 'Uropatia Obstrutiva' },
  { value: 'Nefrite Túbulo-Intersticial Crônica (NTIC)', label: 'Nefrite Túbulo-Intersticial' },
  { value: 'Doença Renal Indeterminada / Desconhecida', label: 'Causa Indeterminada' },
];

const LOCALIZACOES_ACESSO_PADRAO = [
  { value: 'MSE', label: 'MSE - Membro Superior Esquerdo' },
  { value: 'MSD', label: 'MSD - Membro Superior Direito' },
  { value: 'Jugular Interna', label: 'Jugular Interna' },
  { value: 'Jugular Interna Direita (JID)', label: 'Jugular Interna Direita (JID)' },
  { value: 'Jugular Interna Esquerda (JIE)', label: 'Jugular Interna Esquerda (JIE)' },
  { value: 'Subclávia Direita', label: 'Subclávia Direita' },
  { value: 'Subclávia Esquerda', label: 'Subclávia Esquerda' },
  { value: 'Femoral Direita', label: 'Femoral Direita' },
  { value: 'Femoral Esquerda', label: 'Femoral Esquerda' },
  { value: 'MIE', label: 'MIE - Membro Inferior Esquerdo' },
  { value: 'MID', label: 'MID - Membro Inferior Direito' },
  { value: 'Abdominal / Peritoneal', label: 'Abdominal Peritoneal' },
];

const EMPTY_LOCAIS = [];

export default function PatientFormModal({ isOpen, onClose, patientToEdit, onSaved, locaisAtuacao = EMPTY_LOCAIS, doctorId }) {
  const { activeDoctorId } = useAuth();
  const effectiveDoctorId = doctorId || activeDoctorId;
  const [customClinic, setCustomClinic] = useState(false);
  const [customTipoAcesso, setCustomTipoAcesso] = useState(false);
  const [customLadoMembro, setCustomLadoMembro] = useState(false);
  const [customEtiologia, setCustomEtiologia] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    sexo: 'Masculino',
    convenio: 'SUS',
    modalidade: 'HD',
    dataInicioClinica: '',
    clinica: 'Clínica Nefrológica Nex-Ai.NEFRO',
    hospital: 'Hospital de Nefrologia',
    turno: '3º Turno',
    etiologiaDRC: 'Diabetes Mellitus / Nefropatia Diabética',
    dataNascimento: '',
    idade: '',
    statusTransplante: 'Não Avaliado',
    status: 'Não Avaliado',
    pesoSeco: '',
    dataInicioDialise: '',
    alergias: [],
    acessoVascular: {
      tipo: 'FAV',
      fluxoSangue: '',
      fluxoDialisato: '',
      agulha: '16G',
      dataConfeccao: '',
      ladoMembro: 'MSE'
    },
    anticoagulacao: {
      tipo: 'heparina_padrao',
      doseAtaque: '1000',
      doseManutencao: '500',
      doseEnoxaparina: '40',
      motivoSemHeparina: '',
      observacoes: 'Desligar infusão 45 min antes do término da diálise.'
    },
    exames: {},
    medicamentos: {},
    historicoPesos: [],
    hemoculturas: []
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const defaultClinic = (locaisAtuacao && locaisAtuacao.length > 0) ? locaisAtuacao[0].nome : 'Clínica Nefrológica Nex-Ai.NEFRO';
    if (patientToEdit) {
      const isKnown = locaisAtuacao.some(l => l.nome === patientToEdit.clinica);
      setCustomClinic(!isKnown && !!patientToEdit.clinica);

      const currentTipo = patientToEdit.acessoVascular?.tipo || 'FAV';
      const isKnownTipo = TIPOS_ACESSO_PADRAO.some(t => t.value === currentTipo);
      setCustomTipoAcesso(!isKnownTipo && !!patientToEdit.acessoVascular?.tipo);

      const currentLado = patientToEdit.acessoVascular?.ladoMembro || 'MSE';
      const isKnownLado = LOCALIZACOES_ACESSO_PADRAO.some(l => l.value === currentLado);
      setCustomLadoMembro(!isKnownLado && !!patientToEdit.acessoVascular?.ladoMembro);

      const currentEtiologia = patientToEdit.etiologiaDRC || 'Diabetes Mellitus / Nefropatia Diabética';
      const isKnownEtiologia = ETIOLOGIAS_DRC_PADRAO.some(e => (typeof e === 'object' ? e.value === currentEtiologia : e === currentEtiologia));
      setCustomEtiologia(!isKnownEtiologia && !!patientToEdit.etiologiaDRC);

      const initialTransplante = patientToEdit.statusTransplante || patientToEdit.status || 'Não Avaliado';

      setFormData({
        id: patientToEdit.id,
        doctorId: patientToEdit.doctorId || effectiveDoctorId || null,
        nome: patientToEdit.nome || '',
        cpf: patientToEdit.cpf || '',
        sexo: patientToEdit.sexo || 'Masculino',
        convenio: patientToEdit.convenio || 'SUS',
        modalidade: patientToEdit.modalidade || 'HD',
        dataInicioClinica: patientToEdit.dataInicioClinica || '',
        clinica: patientToEdit.clinica || defaultClinic,
        hospital: patientToEdit.hospital || 'Hospital de Nefrologia',
        turno: patientToEdit.turno || '3º Turno',
        etiologiaDRC: currentEtiologia || 'Diabetes Mellitus / Nefropatia Diabética',
        dataNascimento: patientToEdit.dataNascimento || '',
        idade: patientToEdit.idade !== undefined && patientToEdit.idade !== null ? patientToEdit.idade : (calculateAge(patientToEdit.dataNascimento) || ''),
        statusTransplante: initialTransplante,
        status: initialTransplante,
        pesoSeco: patientToEdit.pesoSeco !== undefined && patientToEdit.pesoSeco !== null ? patientToEdit.pesoSeco : '',
        dataInicioDialise: patientToEdit.dataInicioDialise || '',
        alergias: Array.isArray(patientToEdit.alergias) ? patientToEdit.alergias : [],
        acessoVascular: {
          tipo: currentTipo,
          fluxoSangue: patientToEdit.acessoVascular?.fluxoSangue || '',
          fluxoDialisato: patientToEdit.acessoVascular?.fluxoDialisato || '',
          agulha: patientToEdit.acessoVascular?.agulha || '',
          dataConfeccao: patientToEdit.acessoVascular?.dataConfeccao || '',
          ladoMembro: currentLado
        },
        anticoagulacao: {
          tipo: patientToEdit.anticoagulacao?.tipo || (patientToEdit.heparina === 'sem_heparina' ? 'sem_heparina' : 'heparina_padrao'),
          doseAtaque: patientToEdit.anticoagulacao?.doseAtaque !== undefined ? String(patientToEdit.anticoagulacao.doseAtaque) : '1000',
          doseManutencao: patientToEdit.anticoagulacao?.doseManutencao !== undefined ? String(patientToEdit.anticoagulacao.doseManutencao) : '500',
          doseEnoxaparina: patientToEdit.anticoagulacao?.doseEnoxaparina || '40',
          motivoSemHeparina: patientToEdit.anticoagulacao?.motivoSemHeparina || patientToEdit.heparinaMotivo || '',
          observacoes: patientToEdit.anticoagulacao?.observacoes || ''
        },
        exames: patientToEdit.exames || {},
        medicamentos: patientToEdit.medicamentos || {},
        historicoExames: patientToEdit.historicoExames || [],
        historicoPesos: patientToEdit.historicoPesos || [],
        hemoculturas: patientToEdit.hemoculturas || []
      });
    } else {
      setCustomClinic(false);
      setCustomTipoAcesso(false);
      setCustomLadoMembro(false);
      setCustomEtiologia(false);
      setFormData({
        doctorId: effectiveDoctorId || null,
        nome: '',
        cpf: '',
        sexo: 'Masculino',
        convenio: 'SUS',
        modalidade: 'HD',
        dataInicioClinica: '',
        clinica: defaultClinic,
        hospital: 'Hospital de Nefrologia',
        turno: '3º Turno',
        etiologiaDRC: 'Diabetes Mellitus / Nefropatia Diabética',
        dataNascimento: '',
        idade: '',
        statusTransplante: 'Não Avaliado',
        status: 'Não Avaliado',
        pesoSeco: '',
        dataInicioDialise: '',
        alergias: [],
        acessoVascular: {
          tipo: 'FAV',
          fluxoSangue: '300',
          fluxoDialisato: '500',
          agulha: '16G',
          dataConfeccao: '',
          ladoMembro: 'MSE'
        },
        anticoagulacao: {
          tipo: 'heparina_padrao',
          doseAtaque: '1000',
          doseManutencao: '500',
          doseEnoxaparina: '40',
          motivoSemHeparina: '',
          observacoes: 'Desligar infusão 45 min antes do término da diálise.'
        },
        exames: {},
        medicamentos: {},
        historicoExames: [],
        historicoPesos: [],
        hemoculturas: []
      });
    }
    setError('');
  }, [patientToEdit, isOpen, locaisAtuacao, effectiveDoctorId]);

  if (!isOpen) return null;

  const handleBirthDateChange = (val) => {
    const calculated = calculateAge(val);
    setFormData(prev => ({
      ...prev,
      dataNascimento: val,
      idade: calculated !== null ? calculated : prev.idade
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      setError('O nome do paciente é obrigatório.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      const payload = {
        ...formData,
        doctorId: patientToEdit?.doctorId || formData.doctorId || effectiveDoctorId || null,
        nome: formData.nome.trim(),
        cpf: formData.cpf ? formData.cpf.trim() : null,
        sexo: formData.sexo || 'Masculino',
        convenio: formData.convenio || 'SUS',
        modalidade: formData.modalidade || 'HD',
        dataInicioClinica: formData.dataInicioClinica || null,
        idade: formData.idade ? Number(formData.idade) : (calculateAge(formData.dataNascimento) || null),
        status: formData.statusTransplante,
        statusTransplante: formData.statusTransplante,
        pesoSeco: formData.pesoSeco !== '' && formData.pesoSeco !== null ? parseFloat(String(formData.pesoSeco).replace(',', '.')) : null,
        etiologiaDRC: formData.etiologiaDRC ? formData.etiologiaDRC.trim() : 'Indeterminada / Causa Desconhecida',
        dataInicioDialise: formData.dataInicioDialise || null,
        alergias: Array.isArray(formData.alergias) ? formData.alergias : [],
        hospital: formData.hospital ? formData.hospital.trim() : 'Hospital de Nefrologia',
        acessoVascular: {
          ...formData.acessoVascular,
          fluxoSangue: formData.acessoVascular.fluxoSangue ? Number(formData.acessoVascular.fluxoSangue) : null,
          fluxoDialisato: formData.acessoVascular.fluxoDialisato ? Number(formData.acessoVascular.fluxoDialisato) : null
        }
      };

      const saved = await savePatient(payload);
      if (onSaved) onSaved(saved);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar paciente no Firestore. Tente novamente.');
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
          maxWidth: '650px', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <User size={22} color="var(--primary)" />
            <h2 className="text-xl font-bold">
              {patientToEdit ? 'Editar Paciente' : 'Novo Paciente'}
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-outline" 
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Dados Pessoais & Clínicos */}
          <div>
            <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3">Identificação</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="text-sm font-semibold mb-1 block">Nome *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Nome do paciente" 
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">CPF</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="000.000.000-00" 
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Sexo</label>
                <select 
                  className="input-field" 
                  value={formData.sexo}
                  onChange={(e) => setFormData(prev => ({ ...prev, sexo: e.target.value }))}
                >
                  <option value="">Não informado</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Convênio</label>
                <select 
                  className="input-field" 
                  value={formData.convenio}
                  onChange={(e) => setFormData(prev => ({ ...prev, convenio: e.target.value }))}
                >
                  <option value="SUS">SUS (Público)</option>
                  <option value="Convênio Privado">Convênio Privado</option>
                  <option value="Particular">Particular</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Modalidade</label>
                <select 
                  className="input-field" 
                  value={formData.modalidade}
                  onChange={(e) => setFormData(prev => ({ ...prev, modalidade: e.target.value }))}
                >
                  <option value="HD">HD (Hemodiálise)</option>
                  <option value="HDF">HDF (Hemodiafiltração)</option>
                  <option value="APD">APD (Diálise Peritoneal Automatizada)</option>
                  <option value="CAPD">CAPD (Diálise Peritoneal Contínua)</option>
                  <option value="Conservador">Tratamento Conservador</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Unidade *</label>
                {locaisAtuacao && locaisAtuacao.length > 0 && !customClinic ? (
                  <div className="flex flex-col gap-1">
                    <select 
                      className="input-field"
                      value={formData.clinica}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setCustomClinic(true);
                          setFormData(prev => ({ ...prev, clinica: '' }));
                        } else {
                          setFormData(prev => ({ ...prev, clinica: e.target.value }));
                        }
                      }}
                    >
                      {locaisAtuacao.map(loc => (
                        <option key={loc.id} value={loc.nome}>
                          {loc.tipo?.includes('Hemodiálise') ? '🏥' : loc.tipo?.includes('Hospital') ? '🏨' : '🩺'} {loc.nome} {loc.status === 'Inativo' ? '(Inativo)' : ''}
                        </option>
                      ))}
                      <option value="__custom__">➕ Outro local (digitar)...</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ex: Centro de Diálise Nex-Ai.NEFRO"
                      value={formData.clinica}
                      onChange={(e) => setFormData(prev => ({ ...prev, clinica: e.target.value }))}
                    />
                    {locaisAtuacao && locaisAtuacao.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setCustomClinic(false);
                          setFormData(prev => ({ ...prev, clinica: locaisAtuacao[0]?.nome || '' }));
                        }}
                        className="text-xs text-blue-600 hover:underline mt-1 block"
                      >
                        ← Selecionar da lista de locais
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Hospital</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.hospital}
                  placeholder="Ex: Hospital do Rim"
                  onChange={(e) => setFormData(prev => ({ ...prev, hospital: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Turno</label>
                <select 
                  className="input-field" 
                  value={formData.turno}
                  onChange={(e) => setFormData(prev => ({ ...prev, turno: e.target.value }))}
                >
                  <option value="1º Turno">1º Turno (Manhã)</option>
                  <option value="2º Turno">2º Turno (Tarde)</option>
                  <option value="3º Turno">3º Turno (Noite)</option>
                  <option value="4º Turno">4º Turno</option>
                  <option value="Diálise Peritoneal">Diálise Peritoneal</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Data de Nascimento</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formData.dataNascimento}
                  onChange={(e) => handleBirthDateChange(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Idade (anos)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Ex: 58"
                  value={formData.idade}
                  onChange={(e) => setFormData(prev => ({ ...prev, idade: e.target.value }))}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="text-sm font-semibold mb-1 block flex items-center justify-between">
                  <span>Etiologia da DRC</span>
                  <span className="text-xs text-muted font-normal">Padrão SBN</span>
                </label>
                {!customEtiologia ? (
                  <select 
                    className="input-field"
                    value={formData.etiologiaDRC}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setCustomEtiologia(true);
                        setFormData(prev => ({ ...prev, etiologiaDRC: '' }));
                      } else {
                        setFormData(prev => ({ ...prev, etiologiaDRC: e.target.value }));
                      }
                    }}
                  >
                    <option value="">-- Selecione a etiologia --</option>
                    {ETIOLOGIAS_DRC_PADRAO.map(et => (
                      <option key={et.value} value={et.value}>{et.label}</option>
                    ))}
                    <option value="__custom__">➕ Outra etiologia (digitar)...</option>
                  </select>
                ) : (
                  <div>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ex: Mieloma Múltiplo, Amiloidose, Alport, etc..." 
                      value={formData.etiologiaDRC}
                      onChange={(e) => setFormData(prev => ({ ...prev, etiologiaDRC: e.target.value }))}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        setCustomEtiologia(false);
                        setFormData(prev => ({ ...prev, etiologiaDRC: ETIOLOGIAS_DRC_PADRAO[0].value }));
                      }}
                      className="text-xs text-blue-600 hover:underline mt-1 block"
                    >
                      ← Selecionar da lista de etiologias padrão
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dados Clínicos Nefrológicos & Status de Transplante */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3">
              Transplante Renal
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="text-sm font-semibold mb-1 block">
                  Status de Transplante *
                </label>
                <select 
                  className="input-field font-semibold" 
                  value={formData.statusTransplante}
                  onChange={(e) => setFormData(prev => ({ ...prev, statusTransplante: e.target.value, status: e.target.value }))}
                  style={{ borderColor: '#93c5fd', background: '#f8fafc', color: '#1e3a8a' }}
                >
                  {STATUS_TRANSPLANTE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">
                  Peso Seco (kg)
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="input-field" 
                  placeholder="Ex: 68.5" 
                  value={formData.pesoSeco}
                  onChange={(e) => setFormData(prev => ({ ...prev, pesoSeco: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Início da Diálise (1º TTO)</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formData.dataInicioDialise}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataInicioDialise: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Início nesta Clínica</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formData.dataInicioClinica}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataInicioClinica: e.target.value }))}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }} className="pt-2">
                <AllergySelector 
                  selectedAllergies={formData.alergias} 
                  onChange={(alergias) => setFormData(prev => ({ ...prev, alergias }))} 
                />
              </div>
            </div>
          </div>

          {/* Acesso Vascular */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3">
              Acesso Vascular
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="text-sm font-semibold mb-1 block">Tipo de Acesso</label>
                {!customTipoAcesso ? (
                  <select 
                    className="input-field" 
                    value={formData.acessoVascular.tipo}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setCustomTipoAcesso(true);
                        setFormData(prev => ({ 
                          ...prev, 
                          acessoVascular: { ...prev.acessoVascular, tipo: '' } 
                        }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          acessoVascular: { ...prev.acessoVascular, tipo: e.target.value } 
                        }));
                      }
                    }}
                  >
                    {TIPOS_ACESSO_PADRAO.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                    <option value="__custom__">➕ Outro tipo (digitar)...</option>
                  </select>
                ) : (
                  <div>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ex: Prótese PTFE, Outro..." 
                      value={formData.acessoVascular.tipo}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        acessoVascular: { ...prev.acessoVascular, tipo: e.target.value } 
                      }))}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        setCustomTipoAcesso(false);
                        setFormData(prev => ({ 
                          ...prev, 
                          acessoVascular: { ...prev.acessoVascular, tipo: 'FAV' } 
                        }));
                      }}
                      className="text-xs text-blue-600 hover:underline mt-1 block"
                    >
                      ← Selecionar da lista de tipos
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Localização do Acesso</label>
                {!customLadoMembro ? (
                  <select 
                    className="input-field" 
                    value={formData.acessoVascular.ladoMembro}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setCustomLadoMembro(true);
                        setFormData(prev => ({ 
                          ...prev, 
                          acessoVascular: { ...prev.acessoVascular, ladoMembro: '' } 
                        }));
                      } else {
                        setFormData(prev => ({ 
                          ...prev, 
                          acessoVascular: { ...prev.acessoVascular, ladoMembro: e.target.value } 
                        }));
                      }
                    }}
                  >
                    {LOCALIZACOES_ACESSO_PADRAO.map(loc => (
                      <option key={loc.value} value={loc.value}>{loc.label}</option>
                    ))}
                    <option value="__custom__">➕ Outra localização (digitar)...</option>
                  </select>
                ) : (
                  <div>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Ex: Radiocefálica Esquerda..." 
                      value={formData.acessoVascular.ladoMembro}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        acessoVascular: { ...prev.acessoVascular, ladoMembro: e.target.value } 
                      }))}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        setCustomLadoMembro(false);
                        setFormData(prev => ({ 
                          ...prev, 
                          acessoVascular: { ...prev.acessoVascular, ladoMembro: 'MSE' } 
                        }));
                      }}
                      className="text-xs text-blue-600 hover:underline mt-1 block"
                    >
                      ← Selecionar da lista de locais
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Fluxo de Sangue (ml/min)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Ex: 350" 
                  value={formData.acessoVascular.fluxoSangue}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    acessoVascular: { ...prev.acessoVascular, fluxoSangue: e.target.value } 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Fluxo Dialisato (ml/min)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  placeholder="Ex: 500" 
                  value={formData.acessoVascular.fluxoDialisato}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    acessoVascular: { ...prev.acessoVascular, fluxoDialisato: e.target.value } 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Calibre da Agulha</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: 15G, 16G, 17G" 
                  value={formData.acessoVascular.agulha}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    acessoVascular: { ...prev.acessoVascular, agulha: e.target.value } 
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Anticoagulação na Hemodiálise (Heparina) */}
          <div className="border-t pt-5 mt-2" style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2.5">
                <div 
                  style={{ 
                    width: '34px', 
                    height: '34px', 
                    borderRadius: '10px', 
                    background: '#e0f2fe', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Syringe size={18} color="#0284c7" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    Anticoagulação na Hemodiálise
                  </h3>
                  <p className="text-xs text-slate-500">
                    Defina o esquema de heparinização contínua ou protocolo sem anticoagulante
                  </p>
                </div>
              </div>
              {formData.anticoagulacao?.tipo === 'sem_heparina' && (
                <span 
                  style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: '700', 
                    background: '#fee2e2', 
                    color: '#b91c1c', 
                    border: '1px solid #fecaca', 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '5px' 
                  }}
                >
                  <AlertTriangle size={12} color="#b91c1c" />
                  SEM HEPARINA
                </span>
              )}
            </div>

            {/* Esquemas Rápidos Clínicos com Espaçamento Adequado */}
            <div 
              style={{ 
                background: '#f8fafc', 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                padding: '0.9rem 1rem', 
                marginBottom: '1.25rem' 
              }}
            >
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
                Esquemas Rápidos (Clique para preencher):
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PRESETS_HEPARINA.map((preset, idx) => {
                  // Checagem estrita para isolar 40mg de 20mg e checar ataque + manutenção
                  const current = formData.anticoagulacao || {};
                  const isCurrent = (() => {
                    if (current.tipo !== preset.tipo) return false;
                    if (preset.tipo === 'heparina_padrao') {
                      return String(current.doseAtaque || '') === String(preset.doseAtaque || '') &&
                             String(current.doseManutencao || '') === String(preset.doseManutencao || '');
                    }
                    if (preset.tipo === 'enoxaparina') {
                      return String(current.doseEnoxaparina || '') === String(preset.doseEnoxaparina || '');
                    }
                    if (preset.tipo === 'sem_heparina') {
                      return true;
                    }
                    return false;
                  })();

                  const isSemHep = preset.tipo === 'sem_heparina';

                  return (
                    <button
                      key={preset.id || idx}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          anticoagulacao: {
                            tipo: preset.tipo,
                            doseAtaque: preset.doseAtaque,
                            doseManutencao: preset.doseManutencao,
                            doseEnoxaparina: preset.doseEnoxaparina,
                            motivoSemHeparina: preset.motivoSemHeparina,
                            observacoes: preset.observacoes
                          }
                        }));
                      }}
                      style={{
                        padding: '6px 13px',
                        fontSize: '0.78rem',
                        fontWeight: isCurrent ? '700' : '500',
                        borderRadius: '8px',
                        border: '1px solid',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: isCurrent 
                          ? (isSemHep ? '#fee2e2' : '#eff6ff') 
                          : (isSemHep ? '#fff5f5' : '#ffffff'),
                        borderColor: isCurrent 
                          ? (isSemHep ? '#ef4444' : '#3b82f6') 
                          : (isSemHep ? '#fca5a5' : '#cbd5e1'),
                        color: isCurrent 
                          ? (isSemHep ? '#991b1b' : '#1d4ed8') 
                          : (isSemHep ? '#dc2626' : '#334155'),
                        boxShadow: isCurrent 
                          ? (isSemHep ? '0 1px 3px rgba(239, 68, 68, 0.25)' : '0 1px 3px rgba(59, 130, 246, 0.25)') 
                          : 'none'
                      }}
                    >
                      {isSemHep ? <AlertTriangle size={13} /> : <Syringe size={13} />}
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Tipo de Anticoagulação</label>
                <select
                  className="input-field"
                  value={formData.anticoagulacao?.tipo || 'heparina_padrao'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    anticoagulacao: {
                      ...prev.anticoagulacao,
                      tipo: e.target.value
                    }
                  }))}
                >
                  {TIPOS_ANTICOAGULACAO.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {formData.anticoagulacao?.tipo === 'heparina_padrao' && (
                <>
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">Dose de Ataque (UI)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ex: 1000"
                      value={formData.anticoagulacao?.doseAtaque || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        anticoagulacao: { ...prev.anticoagulacao, doseAtaque: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">Manutenção (UI/h)</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Ex: 500"
                      value={formData.anticoagulacao?.doseManutencao || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        anticoagulacao: { ...prev.anticoagulacao, doseManutencao: e.target.value }
                      }))}
                    />
                  </div>
                </>
              )}

              {formData.anticoagulacao?.tipo === 'enoxaparina' && (
                <div>
                  <label className="text-sm font-semibold mb-1.5 block">Dose Enoxaparina (mg)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ex: 20 ou 40"
                    value={formData.anticoagulacao?.doseEnoxaparina || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      anticoagulacao: { ...prev.anticoagulacao, doseEnoxaparina: e.target.value }
                    }))}
                  />
                </div>
              )}

              {formData.anticoagulacao?.tipo === 'sem_heparina' && (
                <div style={{ gridColumn: '1 / -1' }} className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <label className="text-xs font-bold text-red-900 mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle size={15} color="#dc2626" />
                    <span>Motivo Sem Heparina:</span>
                  </label>
                  <input
                    type="text"
                    className="input-field w-full mb-2 bg-white"
                    placeholder="Ex: Risco hemorrágico, pós-biópsia renal, cirurgia recente, pericardite..."
                    value={formData.anticoagulacao?.motivoSemHeparina || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      anticoagulacao: { ...prev.anticoagulacao, motivoSemHeparina: e.target.value }
                    }))}
                  />
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100/60 p-2 rounded-lg">
                    <span>💡 <strong>Conduta padrão:</strong> Lavagens periódicas com 100ml de SF 0,9% a cada 30 minutos e monitorização do capilar.</span>
                  </div>
                </div>
              )}

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="text-sm font-semibold mb-1.5 block">Observações de Conduta</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ex: Desligar infusão 30-45 min antes do término; não heparinar na 1ª hora..."
                  value={formData.anticoagulacao?.observacoes || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    anticoagulacao: { ...prev.anticoagulacao, observacoes: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center gap-3 mt-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <div>
              {patientToEdit && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsDischargeModalOpen(true)}
                  disabled={saving}
                  style={{ 
                    borderColor: '#fecaca', 
                    background: '#fff1f2', 
                    color: '#be123c', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    fontSize: '0.82rem',
                    padding: '0.45rem 0.85rem'
                  }}
                  title="Desligar paciente do cadastro médico"
                >
                  <UserMinus size={15} color="#e11d48" />
                  <span>Desligar</span>
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <PatientDischargeModal
        isOpen={isDischargeModalOpen}
        onClose={() => setIsDischargeModalOpen(false)}
        patient={patientToEdit}
        onSuccess={() => {
          setIsDischargeModalOpen(false);
          onClose();
        }}
      />
    </div>
  );
}
