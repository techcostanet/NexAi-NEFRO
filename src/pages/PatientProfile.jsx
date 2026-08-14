import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Droplet, Pill, AlertTriangle, Loader2 } from 'lucide-react';
import { getPatientById } from '../services/patientService';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true);
        const data = await getPatientById(id);
        setPatient(data);
      } catch (err) {
        console.error("Erro ao carregar paciente:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="container flex items-center justify-center h-screen flex-col gap-4">
        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        <p className="text-muted">Carregando dados do paciente...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container flex items-center justify-center h-screen flex-col gap-4">
        <h2>Paciente não encontrado</h2>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Voltar</button>
      </div>
    );
  }

  const exames = patient.exames || {};
  const acessoVascular = patient.acessoVascular || {};
  const medicamentos = patient.medicamentos || {};

  // Alerta de exames fora da meta
  const hbBaixa = exames.hb && exames.hb < 10;
  const pthAlto = exames.pth && exames.pth > 600;

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <header className="flex items-center gap-4 mt-4 mb-6">
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold truncate">{patient.nome}</h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{patient.turno}</span>
        </div>
      </header>

      {/* Acesso Vascular */}
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Activity size={20} style={{ color: 'var(--primary)' }} /> Acesso Vascular
        </h2>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted text-sm">Tipo</span>
              <span className="font-semibold text-sm">{acessoVascular.tipo || 'Não informado'}</span>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted text-sm">Fluxo de Sangue</span>
              <span className="font-semibold text-sm">{acessoVascular.fluxoSangue ? `${acessoVascular.fluxoSangue} ml/min` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted text-sm">Fluxo Dialisato</span>
              <span className="font-semibold text-sm">{acessoVascular.fluxoDialisato ? `${acessoVascular.fluxoDialisato} ml/min` : '-'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Exames Recentes */}
      <section className="mb-6">
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Droplet size={20} style={{ color: 'var(--secondary)' }} /> Últimos Exames
        </h2>
        
        {/* Alertas */}
        {(hbBaixa || pthAlto) && (
          <div className="glass-panel mb-4" style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div className="flex flex-col gap-2" style={{ color: 'var(--danger)' }}>
              {hbBaixa && (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} />
                  <span className="font-semibold text-sm">Atenção: Hemoglobina baixa (Hb &lt; 10)</span>
                </div>
              )}
              {pthAlto && (
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} />
                  <span className="font-semibold text-sm">Atenção: PTH elevado (PTH &gt; 600)</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p className="text-muted text-sm">Hemoglobina</p>
              <p className="font-bold" style={{ color: hbBaixa ? 'var(--danger)' : 'inherit' }}>
                {exames.hb ? `${exames.hb} g/dL` : '-'}
              </p>
            </div>
            <div>
              <p className="text-muted text-sm">IST</p>
              <p className="font-bold">{exames.ist ? `${exames.ist}%` : '-'}</p>
            </div>
            <div>
              <p className="text-muted text-sm">Ferritina</p>
              <p className="font-bold">{exames.ferritina || '-'}</p>
            </div>
            <div>
              <p className="text-muted text-sm">PTH</p>
              <p className="font-bold" style={{ color: pthAlto ? 'var(--danger)' : 'inherit' }}>
                {exames.pth || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted text-sm">Fósforo</p>
              <p className="font-bold">{exames.fosforo || '-'}</p>
            </div>
            <div>
              <p className="text-muted text-sm">Cálcio</p>
              <p className="font-bold">{exames.ca || '-'}</p>
            </div>
            <div>
              <p className="text-muted text-sm">Vit. D</p>
              <p className="font-bold">{exames.vitD || '-'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Medicações */}
      <section>
        <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Pill size={20} style={{ color: 'var(--warning)' }} /> Prescrições Atuais
        </h2>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <ul className="text-sm font-semibold flex flex-col gap-3" style={{ listStyleType: 'none' }}>
            {medicamentos.epo && <li><span className="text-muted font-normal block">EPO:</span> {medicamentos.epo}</li>}
            {medicamentos.nor && <li><span className="text-muted font-normal block">Noripurum:</span> {medicamentos.nor}</li>}
            {medicamentos.paricalcitol && <li><span className="text-muted font-normal block">Paricalcitol:</span> {medicamentos.paricalcitol}</li>}
            {medicamentos.cinacalcete && <li><span className="text-muted font-normal block">Cinacalcete:</span> {medicamentos.cinacalcete}</li>}
            {medicamentos.sevelamer && <li><span className="text-muted font-normal block">Sevelamer:</span> {medicamentos.sevelamer}</li>}
            {medicamentos.caco3 && <li><span className="text-muted font-normal block">Carbonato de Cálcio:</span> {medicamentos.caco3}</li>}
            
            {(!medicamentos.epo && !medicamentos.nor && !medicamentos.paricalcitol && !medicamentos.cinacalcete && !medicamentos.sevelamer && !medicamentos.caco3) && (
              <li className="text-muted font-normal">Nenhuma medicação registrada.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
