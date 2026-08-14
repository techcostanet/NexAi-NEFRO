import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Droplet, 
  Calendar, 
  AlertCircle, 
  Loader2, 
  Activity, 
  HeartPulse, 
  Zap, 
  FileText,
  ShieldAlert
} from 'lucide-react';
import { savePatientExam } from '../services/patientService';

export default function ExamFormModal({ isOpen, onClose, patientId, examToEdit, examIndex, onSaved }) {
  const [formData, setFormData] = useState({
    dataExame: new Date().toISOString().split('T')[0],
    
    // Anemia & Perfil Férrico
    hb: '',
    ht: '',
    ist: '',
    ferritina: '',
    
    // Metabolismo Ósseo / DMO-DRC
    pth: '',
    fosforo: '',
    ca: '',
    vitD: '',
    fa: '',
    
    // Eletrólitos & Ácido-Básico
    k: '',
    na: '',
    hco3: '',
    
    // Adequação, Cinética de Ureia & Nutrição
    ktv: '',
    ureiaPre: '',
    ureiaPos: '',
    creatinina: '',
    albumina: '',
    
    // Inflamação & Glicemia
    pcr: '',
    glicemia: '',
    hba1c: '',
    
    observacoes: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (examToEdit) {
      setFormData({
        dataExame: examToEdit.dataExame || new Date().toISOString().split('T')[0],
        
        hb: examToEdit.hb !== undefined && examToEdit.hb !== null ? examToEdit.hb : '',
        ht: examToEdit.ht !== undefined && examToEdit.ht !== null ? examToEdit.ht : '',
        ist: examToEdit.ist !== undefined && examToEdit.ist !== null ? examToEdit.ist : '',
        ferritina: examToEdit.ferritina !== undefined && examToEdit.ferritina !== null ? examToEdit.ferritina : '',
        
        pth: examToEdit.pth !== undefined && examToEdit.pth !== null ? examToEdit.pth : '',
        fosforo: examToEdit.fosforo !== undefined && examToEdit.fosforo !== null ? examToEdit.fosforo : '',
        ca: examToEdit.ca !== undefined && examToEdit.ca !== null ? examToEdit.ca : '',
        vitD: examToEdit.vitD !== undefined && examToEdit.vitD !== null ? examToEdit.vitD : '',
        fa: examToEdit.fa !== undefined && examToEdit.fa !== null ? examToEdit.fa : '',
        
        k: examToEdit.k !== undefined && examToEdit.k !== null ? examToEdit.k : '',
        na: examToEdit.na !== undefined && examToEdit.na !== null ? examToEdit.na : '',
        hco3: examToEdit.hco3 !== undefined && examToEdit.hco3 !== null ? examToEdit.hco3 : '',
        
        ktv: examToEdit.ktv !== undefined && examToEdit.ktv !== null ? examToEdit.ktv : '',
        ureiaPre: examToEdit.ureiaPre !== undefined && examToEdit.ureiaPre !== null ? examToEdit.ureiaPre : '',
        ureiaPos: examToEdit.ureiaPos !== undefined && examToEdit.ureiaPos !== null ? examToEdit.ureiaPos : '',
        creatinina: examToEdit.creatinina !== undefined && examToEdit.creatinina !== null ? examToEdit.creatinina : '',
        albumina: examToEdit.albumina !== undefined && examToEdit.albumina !== null ? examToEdit.albumina : '',
        
        pcr: examToEdit.pcr !== undefined && examToEdit.pcr !== null ? examToEdit.pcr : '',
        glicemia: examToEdit.glicemia !== undefined && examToEdit.glicemia !== null ? examToEdit.glicemia : '',
        hba1c: examToEdit.hba1c !== undefined && examToEdit.hba1c !== null ? examToEdit.hba1c : '',
        
        observacoes: examToEdit.observacoes || ''
      });
    } else {
      setFormData({
        dataExame: new Date().toISOString().split('T')[0],
        hb: '',
        ht: '',
        ist: '',
        ferritina: '',
        pth: '',
        fosforo: '',
        ca: '',
        vitD: '',
        fa: '',
        k: '',
        na: '',
        hco3: '',
        ktv: '',
        ureiaPre: '',
        ureiaPos: '',
        creatinina: '',
        albumina: '',
        pcr: '',
        glicemia: '',
        hba1c: '',
        observacoes: ''
      });
    }
    setError('');
  }, [examToEdit, isOpen]);

  if (!isOpen) return null;

  const parseNumber = (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : Number(val);
    return isNaN(num) ? null : num;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dataExame) {
      setError('A data do exame é obrigatória.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const examPayload = {
        dataExame: formData.dataExame,
        
        // Anemia
        hb: parseNumber(formData.hb),
        ht: parseNumber(formData.ht),
        ist: parseNumber(formData.ist),
        ferritina: parseNumber(formData.ferritina),
        
        // DMO-DRC
        pth: parseNumber(formData.pth),
        fosforo: parseNumber(formData.fosforo),
        ca: parseNumber(formData.ca),
        vitD: parseNumber(formData.vitD),
        fa: parseNumber(formData.fa),
        
        // Eletrólitos
        k: parseNumber(formData.k),
        na: parseNumber(formData.na),
        hco3: parseNumber(formData.hco3),
        
        // Cinética & Nutrição
        ktv: parseNumber(formData.ktv),
        ureiaPre: parseNumber(formData.ureiaPre),
        ureiaPos: parseNumber(formData.ureiaPos),
        creatinina: parseNumber(formData.creatinina),
        albumina: parseNumber(formData.albumina),
        
        // Inflamação & Glicemia
        pcr: parseNumber(formData.pcr),
        glicemia: parseNumber(formData.glicemia),
        hba1c: parseNumber(formData.hba1c),
        
        observacoes: formData.observacoes
      };

      const updatedPatient = await savePatientExam(patientId, examPayload, examIndex);
      if (onSaved) onSaved(updatedPatient);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao registrar exames no Firestore. Tente novamente.');
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
          maxWidth: '820px', 
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
        <div className="flex justify-between items-center mb-5 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div style={{ padding: '8px', background: 'rgba(16, 185, 129, 0.12)', borderRadius: '10px' }}>
              <Droplet size={22} color="#059669" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {examToEdit ? 'Editar Resultados Laboratoriais' : 'Lançar Exames Laboratoriais Nefrológicos'}
              </h2>
              <p className="text-xs text-muted">
                Registro clínico especializado com parâmetros de meta para diálise
              </p>
            </div>
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
          <div className="card-pastel-rose mb-4" style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#b91c1c' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Data do Exame */}
          <div style={{ maxWidth: '300px' }}>
            <label className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Calendar size={16} color="var(--primary)" /> Data da Coleta / Exame <span style={{ color: 'red' }}>*</span>
            </label>
            <input 
              type="date" 
              className="input-field" 
              value={formData.dataExame}
              onChange={(e) => setFormData(prev => ({ ...prev, dataExame: e.target.value }))}
              required
            />
          </div>

          {/* 1. Anemia e Perfil Férrico */}
          <div className="card-pastel-rose" style={{ padding: '1.25rem', borderRadius: '14px' }}>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#b91c1c' }}>
              <HeartPulse size={16} /> Anemia & Perfil Férrico
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#7f1d1d' }}>
                  Hemoglobina (Hb)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="g/dL (Ex: 11.2)"
                  value={formData.hb}
                  onChange={(e) => setFormData(prev => ({ ...prev, hb: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 10 - 12 g/dL</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#7f1d1d' }}>
                  Hematócrito (Ht)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="% (Ex: 34)"
                  value={formData.ht}
                  onChange={(e) => setFormData(prev => ({ ...prev, ht: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 30 - 36 %</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#7f1d1d' }}>
                  IST (%)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="% (Ex: 28)"
                  value={formData.ist}
                  onChange={(e) => setFormData(prev => ({ ...prev, ist: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: &gt; 20%</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#7f1d1d' }}>
                  Ferritina
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="ng/mL (Ex: 450)"
                  value={formData.ferritina}
                  onChange={(e) => setFormData(prev => ({ ...prev, ferritina: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 200 - 800</span>
              </div>
            </div>
          </div>

          {/* 2. Metabolismo Ósseo & DMO-DRC */}
          <div className="card-pastel-amber" style={{ padding: '1.25rem', borderRadius: '14px' }}>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#b45309' }}>
              <Activity size={16} /> Metabolismo Mineral & Ósseo (DMO-DRC)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#78350f' }}>
                  PTH Intacto
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="pg/mL (Ex: 320)"
                  value={formData.pth}
                  onChange={(e) => setFormData(prev => ({ ...prev, pth: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 150 - 600</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#78350f' }}>
                  Fósforo (P)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mg/dL (Ex: 4.8)"
                  value={formData.fosforo}
                  onChange={(e) => setFormData(prev => ({ ...prev, fosforo: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 3.5 - 5.5</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#78350f' }}>
                  Cálcio Total (Ca)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mg/dL (Ex: 9.2)"
                  value={formData.ca}
                  onChange={(e) => setFormData(prev => ({ ...prev, ca: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 8.5 - 10.2</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#78350f' }}>
                  Vitamina D (25-OH)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="ng/mL (Ex: 35)"
                  value={formData.vitD}
                  onChange={(e) => setFormData(prev => ({ ...prev, vitD: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: &gt; 30 ng/mL</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#78350f' }}>
                  Fosfatase Alcalina (FA)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="U/L (Ex: 85)"
                  value={formData.fa}
                  onChange={(e) => setFormData(prev => ({ ...prev, fa: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 40 - 130</span>
              </div>
            </div>
          </div>

          {/* 3. Eletrólitos & Equilíbrio Ácido-Básico */}
          <div className="card-pastel-blue" style={{ padding: '1.25rem', borderRadius: '14px' }}>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#1d4ed8' }}>
              <Zap size={16} /> Eletrólitos & Equilíbrio Ácido-Básico
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#1e3a8a' }}>
                  Potássio (K⁺)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mEq/L (Ex: 4.9)"
                  value={formData.k}
                  onChange={(e) => setFormData(prev => ({ ...prev, k: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 3.5 - 5.5</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#1e3a8a' }}>
                  Sódio (Na⁺)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mEq/L (Ex: 138)"
                  value={formData.na}
                  onChange={(e) => setFormData(prev => ({ ...prev, na: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 135 - 145</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#1e3a8a' }}>
                  Bicarbonato (HCO₃⁻)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mEq/L (Ex: 23)"
                  value={formData.hco3}
                  onChange={(e) => setFormData(prev => ({ ...prev, hco3: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 22 - 26 mEq/L</span>
              </div>
            </div>
          </div>

          {/* 4. Adequação da Diálise, Cinética de Ureia & Nutrição */}
          <div className="card-pastel-emerald" style={{ padding: '1.25rem', borderRadius: '14px' }}>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#047857' }}>
              <Droplet size={16} /> Adequação Dialítica, Cinética & Nutrição
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#064e3b' }}>
                  Kt/V (Adequação)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: 1.45"
                  value={formData.ktv}
                  onChange={(e) => setFormData(prev => ({ ...prev, ktv: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: &ge; 1.2</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#064e3b' }}>
                  Ureia Pré-HD
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mg/dL (Ex: 120)"
                  value={formData.ureiaPre}
                  onChange={(e) => setFormData(prev => ({ ...prev, ureiaPre: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Pré-diálise</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#064e3b' }}>
                  Ureia Pós-HD
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mg/dL (Ex: 35)"
                  value={formData.ureiaPos}
                  onChange={(e) => setFormData(prev => ({ ...prev, ureiaPos: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Pós-diálise</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#064e3b' }}>
                  Creatinina
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mg/dL (Ex: 8.5)"
                  value={formData.creatinina}
                  onChange={(e) => setFormData(prev => ({ ...prev, creatinina: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Massa / Residual</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#064e3b' }}>
                  Albumina Sérica
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="g/dL (Ex: 4.1)"
                  value={formData.albumina}
                  onChange={(e) => setFormData(prev => ({ ...prev, albumina: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: &ge; 3.8 g/dL</span>
              </div>
            </div>
          </div>

          {/* 5. Inflamação & Controle Glicêmico */}
          <div className="card-pastel-purple" style={{ padding: '1.25rem', borderRadius: '14px' }}>
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#6d28d9' }}>
              <ShieldAlert size={16} /> Inflamação & Controle Metabólico
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem' }}>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#4c1d95' }}>
                  PCR (Prot. C Reativa)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mg/L (Ex: 3.2)"
                  value={formData.pcr}
                  onChange={(e) => setFormData(prev => ({ ...prev, pcr: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: &lt; 5.0 mg/L</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#4c1d95' }}>
                  Glicemia de Jejum
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mg/dL (Ex: 95)"
                  value={formData.glicemia}
                  onChange={(e) => setFormData(prev => ({ ...prev, glicemia: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta: 70 - 100</span>
              </div>

              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: '#4c1d95' }}>
                  HbA1c (%)
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="% (Ex: 6.8)"
                  value={formData.hba1c}
                  onChange={(e) => setFormData(prev => ({ ...prev, hba1c: e.target.value }))}
                />
                <span className="text-xs text-muted" style={{ fontSize: '0.68rem' }}>Meta DM: &lt; 7 - 8%</span>
              </div>
            </div>
          </div>

          {/* Observações / Conduta */}
          <div>
            <label className="text-sm font-semibold mb-1 block flex items-center gap-1.5">
              <FileText size={16} color="var(--primary)" /> Observações e Conduta Nefrológica
            </label>
            <textarea 
              className="input-field" 
              rows={2}
              placeholder="Notas sobre adequação, intercorrências na diálise, sintomas relatados..."
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 mt-2 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Gravando...' : (examToEdit ? 'Atualizar Exame' : 'Salvar Exames')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
