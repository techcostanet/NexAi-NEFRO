import React, { useState, useEffect } from 'react';
import { X, Save, Droplet, Pill, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { savePatientExam } from '../services/patientService';

export default function ExamFormModal({ isOpen, onClose, patientId, examToEdit, examIndex, onSaved }) {
  const [formData, setFormData] = useState({
    dataExame: new Date().toISOString().split('T')[0],
    hb: '',
    ist: '',
    ferritina: '',
    pth: '',
    fosforo: '',
    ca: '',
    vitD: '',
    k: '',
    creatinina: '',
    ktv: '',
    medicamentos: {
      epo: '',
      nor: '',
      paricalcitol: '',
      cinacalcete: '',
      sevelamer: '',
      caco3: ''
    },
    observacoes: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (examToEdit) {
      setFormData({
        dataExame: examToEdit.dataExame || new Date().toISOString().split('T')[0],
        hb: examToEdit.hb !== undefined && examToEdit.hb !== null ? examToEdit.hb : '',
        ist: examToEdit.ist !== undefined && examToEdit.ist !== null ? examToEdit.ist : '',
        ferritina: examToEdit.ferritina !== undefined && examToEdit.ferritina !== null ? examToEdit.ferritina : '',
        pth: examToEdit.pth !== undefined && examToEdit.pth !== null ? examToEdit.pth : '',
        fosforo: examToEdit.fosforo !== undefined && examToEdit.fosforo !== null ? examToEdit.fosforo : '',
        ca: examToEdit.ca !== undefined && examToEdit.ca !== null ? examToEdit.ca : '',
        vitD: examToEdit.vitD !== undefined && examToEdit.vitD !== null ? examToEdit.vitD : '',
        k: examToEdit.k !== undefined && examToEdit.k !== null ? examToEdit.k : '',
        creatinina: examToEdit.creatinina !== undefined && examToEdit.creatinina !== null ? examToEdit.creatinina : '',
        ktv: examToEdit.ktv !== undefined && examToEdit.ktv !== null ? examToEdit.ktv : '',
        medicamentos: {
          epo: examToEdit.medicamentos?.epo || examToEdit.epo || '',
          nor: examToEdit.medicamentos?.nor || examToEdit.nor || '',
          paricalcitol: examToEdit.medicamentos?.paricalcitol || examToEdit.paricalcitol || '',
          cinacalcete: examToEdit.medicamentos?.cinacalcete || examToEdit.cinacalcete || '',
          sevelamer: examToEdit.medicamentos?.sevelamer || examToEdit.sevelamer || '',
          caco3: examToEdit.medicamentos?.caco3 || examToEdit.caco3 || ''
        },
        observacoes: examToEdit.observacoes || ''
      });
    } else {
      setFormData({
        dataExame: new Date().toISOString().split('T')[0],
        hb: '',
        ist: '',
        ferritina: '',
        pth: '',
        fosforo: '',
        ca: '',
        vitD: '',
        k: '',
        creatinina: '',
        ktv: '',
        medicamentos: {
          epo: '',
          nor: '',
          paricalcitol: '',
          cinacalcete: '',
          sevelamer: '',
          caco3: ''
        },
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
        hb: parseNumber(formData.hb),
        ist: parseNumber(formData.ist),
        ferritina: parseNumber(formData.ferritina),
        pth: parseNumber(formData.pth),
        fosforo: parseNumber(formData.fosforo),
        ca: parseNumber(formData.ca),
        vitD: parseNumber(formData.vitD),
        k: parseNumber(formData.k),
        creatinina: parseNumber(formData.creatinina),
        ktv: parseNumber(formData.ktv),
        medicamentos: formData.medicamentos,
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
          maxWidth: '700px', 
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
            <Droplet size={22} color="var(--secondary)" />
            <h2 className="text-xl font-bold">
              {examToEdit ? 'Editar Exame e Resultados' : 'Lançar Novo Exame'}
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Data do Exame */}
          <div>
            <label className="text-sm font-semibold mb-1 flex items-center gap-2">
              <Calendar size={16} color="var(--primary)" /> Data do Exame / Coleta *
            </label>
            <input 
              type="date" 
              className="input-field" 
              value={formData.dataExame}
              onChange={(e) => setFormData(prev => ({ ...prev, dataExame: e.target.value }))}
              required
              style={{ maxWidth: '250px' }}
            />
          </div>

          {/* Painel de Exames */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3">Resultados Laboratoriais</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="text-sm font-semibold mb-1 block">Hemoglobina (Hb)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="g/dL (Ex: 11.2)"
                  value={formData.hb}
                  onChange={(e) => setFormData(prev => ({ ...prev, hb: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">IST (%)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="% (Ex: 28)"
                  value={formData.ist}
                  onChange={(e) => setFormData(prev => ({ ...prev, ist: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Ferritina</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="ng/mL"
                  value={formData.ferritina}
                  onChange={(e) => setFormData(prev => ({ ...prev, ferritina: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">PTH</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="pg/mL"
                  value={formData.pth}
                  onChange={(e) => setFormData(prev => ({ ...prev, pth: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Fósforo (P)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mg/dL"
                  value={formData.fosforo}
                  onChange={(e) => setFormData(prev => ({ ...prev, fosforo: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Cálcio (Ca)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mg/dL"
                  value={formData.ca}
                  onChange={(e) => setFormData(prev => ({ ...prev, ca: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Vitamina D</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="ng/mL"
                  value={formData.vitD}
                  onChange={(e) => setFormData(prev => ({ ...prev, vitD: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Potássio (K)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mEq/L"
                  value={formData.k}
                  onChange={(e) => setFormData(prev => ({ ...prev, k: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Creatinina</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="mg/dL"
                  value={formData.creatinina}
                  onChange={(e) => setFormData(prev => ({ ...prev, creatinina: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Kt/V (Adequação)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: 1.42"
                  value={formData.ktv}
                  onChange={(e) => setFormData(prev => ({ ...prev, ktv: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Medicações Prescritas */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-bold text-sm text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <Pill size={16} color="var(--warning)" /> Ajuste de Medicamentos
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div>
                <label className="text-sm font-semibold mb-1 block">EPO (Eritropoetina)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: 4000 UI 3x/sem"
                  value={formData.medicamentos.epo}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    medicamentos: { ...prev.medicamentos, epo: e.target.value } 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Noripurum (Ferro)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: 100mg EV 1x/sem"
                  value={formData.medicamentos.nor}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    medicamentos: { ...prev.medicamentos, nor: e.target.value } 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Paricalcitol</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: 2mcg EV pós HD"
                  value={formData.medicamentos.paricalcitol}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    medicamentos: { ...prev.medicamentos, paricalcitol: e.target.value } 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Cinacalcete</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: 30mg VO 1x/dia"
                  value={formData.medicamentos.cinacalcete}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    medicamentos: { ...prev.medicamentos, cinacalcete: e.target.value } 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Sevelamer</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: 800mg 3x/dia"
                  value={formData.medicamentos.sevelamer}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    medicamentos: { ...prev.medicamentos, sevelamer: e.target.value } 
                  }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Carbonato de Cálcio</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: 500mg com as refeições"
                  value={formData.medicamentos.caco3}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    medicamentos: { ...prev.medicamentos, caco3: e.target.value } 
                  }))}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block">Observações / Conduta Nefrológica</label>
            <textarea 
              className="input-field" 
              rows={2}
              placeholder="Notas sobre adequação, sintomas, intercorrências..."
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Salvando...' : 'Salvar Exames'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
