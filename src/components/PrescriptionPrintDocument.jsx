import React from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import KidneyIcon from './KidneyIcon';

/**
 * Componente que renderiza a folha de receituário médico timbrada
 * ESTRITAMENTE CALIBRADA PARA 1 ÚNICA FOLHA A4 (SEM SEGUNDA PÁGINA)
 */
export default function PrescriptionPrintDocument({
  prescription,
  patient,
  doctorInfo,
  currentVia = 1 // 1 ou 2
}) {
  if (!prescription || !patient) return null;

  const doctorName = prescription.medico?.nome || doctorInfo?.nome || 'Dr. Marcelo Ramos';
  const doctorCrm = prescription.medico?.crm || doctorInfo?.crm || '654321';
  const doctorUf = prescription.medico?.ufCrm || doctorInfo?.ufCrm || 'SP';
  const doctorRqe = prescription.medico?.rqe || doctorInfo?.rqe || '45890';
  const doctorEspecialidade = prescription.medico?.especialidade || doctorInfo?.especialidade || 'Nefrologia Clínica & Hemodiálise';
  const doctorClinica = prescription.medico?.clinica || doctorInfo?.clinicaPrincipal || patient.clinica || 'Clínica Nefrológica NexAi';
  const doctorEndereco = prescription.medico?.endereco || doctorInfo?.endereco || 'São Paulo - SP';
  const doctorTelefone = prescription.medico?.telefone || doctorInfo?.telefone || '';

  const tipoReceita = prescription.tipoReceita || 'simples';
  const isControleEspecial = tipoReceita === 'controle_especial';
  const isAntimicrobiano = tipoReceita === 'antimicrobiano';
  const itens = Array.isArray(prescription.itens) ? prescription.itens : [];

  const dataEmissaoObj = prescription.dataEmissao ? new Date(prescription.dataEmissao + 'T12:00:00') : new Date();
  const dataFormatada = dataEmissaoObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const getTituloDocumento = () => {
    switch (tipoReceita) {
      case 'controle_especial':
        return 'RECEITUÁRIO DE CONTROLE ESPECIAL';
      case 'antimicrobiano':
        return 'RECEITUÁRIO DE ANTIMICROBIANOS';
      case 'alto_custo':
        return 'RECEITA MÉDICA - COMPONENTE ESPECIALIZADO (ALTO CUSTO)';
      default:
        return 'RECEITUÁRIO MÉDICO';
    }
  };

  const getSubtituloVia = () => {
    if (isControleEspecial || isAntimicrobiano) {
      return currentVia === 1 ? '1ª VIA - RETENÇÃO DA FARMÁCIA' : '2ª VIA - ORIENTAÇÃO DO PACIENTE';
    }
    return 'VIA ÚNICA - USO DO PACIENTE';
  };

  return (
    <div className="prescription-a4-sheet bg-white text-slate-900 border border-slate-300 shadow-md rounded-xl p-6 max-w-[780px] w-full mx-auto text-xs font-sans relative flex flex-col justify-between" style={{ minHeight: '260mm', maxHeight: '272mm', boxSizing: 'border-box' }}>
      
      {/* Topo do Documento */}
      <div>
        {/* Faixa da Via (quando 2 vias) */}
        {(isControleEspecial || isAntimicrobiano) && (
          <div className="mb-2 pb-1 border-b border-slate-800 flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-700">
            <span>{getTituloDocumento()}</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
              {getSubtituloVia()}
            </span>
          </div>
        )}

        {/* Cabeçalho Timbrado Compacto */}
        <header className="border-b-2 border-slate-900 pb-2 mb-3 flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <KidneyIcon size={22} />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">
                {doctorName}
              </h1>
              <p className="text-[10px] font-bold text-blue-800 leading-tight">
                {doctorEspecialidade}
              </p>
              <p className="text-[9px] text-slate-600 font-medium">
                CRM-{doctorUf} {doctorCrm} {doctorRqe && `• RQE ${doctorRqe}`}
              </p>
              <p className="text-[8px] text-slate-500">
                {doctorClinica} {doctorEndereco && `• ${doctorEndereco}`} {doctorTelefone && `• Tel: ${doctorTelefone}`}
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] font-black tracking-wider text-blue-900 uppercase">NexAi-NEFRO</span>
            <span className="text-[8px] text-slate-400">Prontuário Dialítico</span>
            <span className="text-[9px] text-slate-600 mt-0.5">
              Receita: <strong className="text-slate-800">{prescription.numeroReceita || prescription.id?.slice(-8).toUpperCase()}</strong>
            </span>
            <span className="text-[8px] text-slate-500">
              Data: <strong>{dataEmissaoObj.toLocaleDateString('pt-BR')}</strong>
            </span>
          </div>
        </header>

        {/* Título Central */}
        <div className="text-center my-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
            {getTituloDocumento()}
          </h2>
          {prescription.subtitulo && (
            <p className="text-[9px] text-slate-500 italic mt-0.5">{prescription.subtitulo}</p>
          )}
        </div>

        {/* Identificação do Paciente Compacta */}
        <section className="bg-slate-50/80 border border-slate-200 rounded-lg p-2.5 mb-3">
          <div className="grid grid-cols-12 gap-1.5 text-[10px]">
            <div className="col-span-8">
              <span className="text-slate-500 text-[9px] block">Paciente:</span>
              <strong className="text-slate-900 text-xs">{patient.nome}</strong>
            </div>
            <div className="col-span-4">
              <span className="text-slate-500 text-[9px] block">CPF:</span>
              <strong className="text-slate-900">{patient.cpf || 'Não informado'}</strong>
            </div>
            <div className="col-span-3">
              <span className="text-slate-500 text-[9px] block">Idade:</span>
              <span>{patient.idade ? `${patient.idade} anos` : '-'}</span>
            </div>
            <div className="col-span-9">
              <span className="text-slate-500 text-[9px] block">Endereço Residencial:</span>
              <span className="text-slate-800 truncate block">{patient.endereco || 'Cadastrado no prontuário eletrônico'}</span>
            </div>
          </div>

          {prescription.incluirAlergias !== false && Array.isArray(patient.alergias) && patient.alergias.length > 0 && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex items-center gap-1 text-[9px] text-red-700 font-semibold">
              <AlertTriangle size={11} className="shrink-0 text-red-600" />
              <span>Alergias: <strong>{patient.alergias.join(', ')}</strong></span>
            </div>
          )}
        </section>

        {/* Lista de Medicamentos (Layout Otimizado para 1 Página) */}
        <section className="flex flex-col gap-2 mb-3">
          <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider border-b pb-0.5">
            Prescrição Farmacológica:
          </div>

          {itens.length === 0 ? (
            <div className="text-center py-6 text-slate-400 italic text-[10px]">
              Nenhum medicamento adicionado a esta receita.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {itens.map((item, idx) => (
                <div key={item.id || idx} className="border-b border-slate-100 pb-1.5 pl-1">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-[11px] text-blue-900">
                        {idx + 1}.
                      </span>
                      <strong className="text-[11px] text-slate-900">
                        {item.medicamento || item.nome}
                      </strong>
                      {item.formaFarmaceutica && (
                        <span className="text-[9px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                          {item.formaFarmaceutica}
                        </span>
                      )}
                    </div>
                    {item.quantidade && (
                      <span className="text-[10px] font-bold text-slate-800 ml-2 shrink-0">
                        {item.quantidade}
                      </span>
                    )}
                  </div>

                  <div className="pl-4 text-[10px] text-slate-800 leading-snug mt-0.5">
                    {item.via && (
                      <span className="font-bold text-blue-800 mr-1.5">
                        [{item.via}]
                      </span>
                    )}
                    <span>{item.posologia}</span>
                  </div>

                  {item.instrucoesAdicionais && (
                    <div className="pl-4 text-[9px] text-slate-500 italic mt-0.5">
                      Obs: {item.instrucoesAdicionais}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Orientações Gerais / Observações Clínicas */}
        {prescription.observacoesGerais && (
          <section className="border border-slate-200 rounded-lg p-2 mb-2 bg-slate-50/60 text-[9px]">
            <strong className="block text-slate-700 font-bold mb-0.5 uppercase tracking-wider text-[8px]">
              Orientações Médicas & Recomendações:
            </strong>
            <p className="text-slate-700 whitespace-pre-wrap leading-tight">
              {prescription.observacoesGerais}
            </p>
          </section>
        )}
      </div>

      {/* Base do Documento (Campos Legais, Assinatura e Validade) */}
      <div>
        {/* Validade */}
        <div className="text-[9px] text-slate-500 mb-2 flex justify-between items-center border-t pt-1">
          <span>
            {isControleEspecial 
              ? '⚠️ Válido por 30 (trinta) dias a contar da data de emissão em todo o território nacional.' 
              : isAntimicrobiano 
                ? '⚠️ Válido por 10 (dez) dias a contar da data de emissão.' 
                : `Receita com validade sugerida de ${prescription.validadeDias || 180} dias para uso contínuo.`}
          </span>
          <span className="text-slate-400 text-[8px]">Uso Humano</span>
        </div>

        {/* Bloco Exclusivo Controle Especial (1ª Via) */}
        {isControleEspecial && currentVia === 1 && (
          <section className="border border-slate-300 rounded p-2 mb-2 text-[8px] bg-slate-50 leading-tight">
            <div className="grid grid-cols-2 gap-3">
              <div className="border-r border-slate-300 pr-2">
                <strong className="block font-bold text-slate-800 uppercase mb-1">Identificação do Comprador</strong>
                <div>Nome: _____________________________________________</div>
                <div>RG: ________________ Órgão: ____ CPF: _____________</div>
                <div>End: ________________________________ Tel: _________</div>
                <div className="pt-1 text-center">Assinatura: ___________________________</div>
              </div>
              <div className="pl-1">
                <strong className="block font-bold text-slate-800 uppercase mb-1">Identificação do Fornecedor</strong>
                <div>Farmácia / Razão Social: ____________________________</div>
                <div>Farmacêutico: ________________ CRF: _______________</div>
                <div>Data: __/__/____ Lote: _______ Qtd Disp: ___________</div>
                <div className="pt-1 text-center">Visto Farmacêutico: ____________________</div>
              </div>
            </div>
          </section>
        )}

        {/* Rodapé: Data e Assinatura Médica */}
        <footer className="pt-2 border-t border-slate-300 flex justify-between items-end">
          <div className="text-[9px] text-slate-500 max-w-[280px]">
            <div className="font-semibold text-slate-700">
              {doctorClinica.includes('São Paulo') || !doctorEndereco ? 'São Paulo - SP' : 'Local de Atendimento'}, {dataFormatada}
            </div>
            <div className="flex items-center gap-1 text-[8px] text-emerald-700 mt-0.5">
              <ShieldCheck size={11} />
              <span>NexAi-NEFRO • Prontuário em Nuvem</span>
            </div>
            <p className="text-[7px] text-slate-400">
              Cód. Autenticador: {prescription.id || 'NEXAI-REC-VALID'}
            </p>
          </div>

          <div className="text-center min-w-[220px]">
            <div className="border-b border-slate-800 w-full mb-1"></div>
            <strong className="block text-[11px] text-slate-900 font-bold">{doctorName}</strong>
            <span className="block text-[9px] text-slate-700">{doctorEspecialidade}</span>
            <span className="block text-[9px] text-slate-600 font-medium">CRM-{doctorUf} {doctorCrm}</span>
          </div>
        </footer>
      </div>

    </div>
  );
}
