import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Droplet, Pill, AlertTriangle } from 'lucide-react';
import patientsData from '../data/patients_db.json';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const patient = patientsData.find(p => p.id === id);

  if (!patient) {
    return (
      <div className="container flex items-center justify-center h-screen flex-col gap-4">
        <h2>Paciente não encontrado</h2>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>Voltar</button>
      </div>
    );
  }

  // Alerta de exames fora da meta
  const hbBaixa = patient.exames.hb && patient.exames.hb < 10;
  const pthAlto = patient.exames.pth && patient.exames.pth > 600;

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      <header className="flex items-center gap-4 mt-4 mb-6">
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold truncate">{patient.nome}</h1>
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
              <span className="font-semibold text-sm">{patient.acessoVascular.tipo}</span>
            </div>
            <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--border)' }}>
              <span className="text-muted text-sm">Fluxo de Sangue</span>
              <span className="font-semibold text-sm">{patient.acessoVascular.fluxoSangue ? `${patient.acessoVascular.fluxoSangue} ml/min` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted text-sm">Fluxo Dialisato</span>
              <span className="font-semibold text-sm">{patient.acessoVascular.fluxoDialisato ? `${patient.acessoVascular.fluxoDialisato} ml/min` : '-'}</span>
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
                {patient.exames.hb || '-'} g/dL
              </p>
            </div>
            <div>
              <p className="text-muted text-sm">IST</p>
              <p className="font-bold">{patient.exames.ist || '-'}%</p>
            </div>
            <div>
              <p className="text-muted text-sm">Ferritina</p>
              <p className="font-bold">{patient.exames.ferritina || '-'}</p>
            </div>
            <div>
              <p className="text-muted text-sm">PTH</p>
              <p className="font-bold" style={{ color: pthAlto ? 'var(--danger)' : 'inherit' }}>
                {patient.exames.pth || '-'}
              </p>
            </div>
            <div>
              <p className="text-muted text-sm">Fósforo</p>
              <p className="font-bold">{patient.exames.fosforo || '-'}</p>
            </div>
            <div>
              <p className="text-muted text-sm">Cálcio</p>
              <p className="font-bold">{patient.exames.ca || '-'}</p>
            </div>
            <div>
              <p className="text-muted text-sm">Vit. D</p>
              <p className="font-bold">{patient.exames.vitD || '-'}</p>
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
            {patient.medicamentos.epo && <li><span className="text-muted font-normal block">EPO:</span> {patient.medicamentos.epo}</li>}
            {patient.medicamentos.nor && <li><span className="text-muted font-normal block">Noripurum:</span> {patient.medicamentos.nor}</li>}
            {patient.medicamentos.paricalcitol && <li><span className="text-muted font-normal block">Paricalcitol:</span> {patient.medicamentos.paricalcitol}</li>}
            {patient.medicamentos.cinacalcete && <li><span className="text-muted font-normal block">Cinacalcete:</span> {patient.medicamentos.cinacalcete}</li>}
            {patient.medicamentos.sevelamer && <li><span className="text-muted font-normal block">Sevelamer:</span> {patient.medicamentos.sevelamer}</li>}
            {patient.medicamentos.caco3 && <li><span className="text-muted font-normal block">Carbonato de Cálcio:</span> {patient.medicamentos.caco3}</li>}
            
            {(!patient.medicamentos.epo && !patient.medicamentos.nor && !patient.medicamentos.paricalcitol && !patient.medicamentos.cinacalcete && !patient.medicamentos.sevelamer && !patient.medicamentos.caco3) && (
              <li className="text-muted font-normal">Nenhuma medicação registrada na planilha.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
