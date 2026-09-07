import React from 'react';
import { Pill, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import KidneyIcon from './KidneyIcon';

/**
 * Componente que renderiza a folha de receituário timbrada pronta para visualização e impressão A4
 */
export default function PrescriptionPrintDocument({
  prescription,
  patient,
  doctorInfo,
  currentVia = 1, // 1 ou 2
  isTwoPages = false
}) {
  if (!prescription || !patient) return null;

  const doctorName = prescription.medico?.nome || doctorInfo?.nome || 'Médico(a) Nefrologista';
  const doctorCrm = prescription.medico?.crm || doctorInfo?.crm || '------';
  const doctorUf = prescription.medico?.ufCrm || doctorInfo?.ufCrm || 'SP';
  const doctorRqe = prescription.medico?.rqe || doctorInfo?.rqe || '';
  const doctorEspecialidade = prescription.medico?.especialidade || doctorInfo?.especialidade || 'Nefrologia Clínica & Hemodiálise';
  const doctorClinica = prescription.medico?.clinica || doctorInfo?.clinicaPrincipal || patient.clinica || 'Clínica Nefrológica NexAi';
  const doctorEndereco = prescription.medico?.endereco || doctorInfo?.endereco || 'Unidade de Nefrologia e Hemodiálise';
  const doctorTelefone = prescription.medico?.telefone || doctorInfo?.telefone || '';

  const tipoReceita = prescription.tipoReceita || 'simples'; // 'simples' | 'controle_especial' | 'antimicrobiano' | 'alto_custo'
  const isControleEspecial = tipoReceita === 'controle_especial';
  const isAntimicrobiano = tipoReceita === 'antimicrobiano';
  const itens = Array.isArray(prescription.itens) ? prescription.itens : [];

  // Formatação de data
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
      return currentVia === 1 
        ? '1ª VIA - RETENÇÃO DA FARMÁCIA' 
        : '2ª VIA - ORIENTAÇÃO DO PACIENTE';
    }
    return 'VIA ÚNICA - USO DO PACIENTE';
  };

  return (
    <div className="prescription-a4-sheet bg-white text-slate-900 border border-slate-300 shadow-sm rounded-xl p-8 max-w-[800px] mx-auto my-4 text-xs font-sans relative">
      {/* Faixa Superior de Identificação da Via */}
      {(isControleEspecial || isAntimicrobiano) && (
        <div className="mb-4 pb-1 border-b-2 border-slate-800 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-700">
          <span>{getTituloDocumento()}</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
            {getSubtituloVia()}
          </span>
        </div>
      )}

      {/* Cabeçalho Timbrado */}
      <header className="border-b-2 border-slate-900 pb-4 mb-5 flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <KidneyIcon size={26} />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
              {doctorName}
            </h1>
            <p className="text-[11px] font-semibold text-blue-800">
              {doctorEspecialidade}
            </p>
            <p className="text-[10px] text-slate-600 font-medium">
              CRM-{doctorUf} {doctorCrm} {doctorRqe && `• RQE ${doctorRqe}`}
            </p>
            <p className="text-[9px] text-slate-500">
              {doctorClinica} {doctorEndereco && `• ${doctorEndereco}`} {doctorTelefone && `• Tel: ${doctorTelefone}`}
            </p>
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="text-[11px] font-black tracking-wider text-blue-900 uppercase">NexAi-NEFRO</span>
          <span className="text-[9px] text-slate-500 font-medium">Sistema de Gestão Dialítica</span>
          <span className="text-[9px] text-slate-400 mt-1">
            Receita Nº: <strong className="text-slate-700">{prescription.numeroReceita || prescription.id?.slice(-8).toUpperCase()}</strong>
          </span>
          <span className="text-[9px] text-slate-500">
            Data: <strong>{dataEmissaoObj.toLocaleDateString('pt-BR')}</strong>
          </span>
        </div>
      </header>

      {/* Título Principal Centralizado */}
      <div className="text-center my-3">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
          {getTituloDocumento()}
        </h2>
        {prescription.subtitulo && (
          <p className="text-[10px] text-slate-600 italic mt-0.5">{prescription.subtitulo}</p>
        )}
      </div>

      {/* Identificação do Paciente */}
      <section className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-5">
        <div className="grid grid-cols-12 gap-2 text-[11px]">
          <div className="col-span-8">
            <span className="text-slate-500 text-[10px] block">Nome do Paciente:</span>
            <strong className="text-slate-900 text-xs">{patient.nome}</strong>
          </div>
          <div className="col-span-4">
            <span className="text-slate-500 text-[10px] block">CPF:</span>
            <strong className="text-slate-900">{patient.cpf || 'Não informado'}</strong>
          </div>
          <div className="col-span-3">
            <span className="text-slate-500 text-[10px] block">Idade / Sexo:</span>
            <span>{patient.idade ? `${patient.idade} anos` : '-'} • {patient.sexo || '-'}</span>
          </div>
          <div className="col-span-9">
            <span className="text-slate-500 text-[10px] block">Endereço Residencial:</span>
            <span className="text-slate-800">{patient.endereco || 'Endereço residencial cadastrado no prontuário'}</span>
          </div>
        </div>

        {/* Alerta de Alergias */}
        {prescription.incluirAlergias !== false && Array.isArray(patient.alergias) && patient.alergias.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[10px] text-red-700 font-semibold">
            <AlertTriangle size={12} className="shrink-0 text-red-600" />
            <span>Alergias relatadas pelo paciente: <strong>{patient.alergias.join(', ')}</strong></span>
          </div>
        )}
      </section>

      {/* Corpo da Prescrição: Medicamentos */}
      <section className="min-h-[260px] flex flex-col gap-4 mb-6">
        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider border-b pb-1">
          Prescrição Farmacológica:
        </div>

        {itens.length === 0 ? (
          <div className="text-center py-10 text-slate-400 italic">
            Nenhum medicamento adicionado a esta receita.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {itens.map((item, idx) => (
              <div key={item.id || idx} className="border-b border-slate-100 pb-3 pl-1">
                <div className="flex justify-between items-baseline mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-blue-900">
                      {idx + 1}.
                    </span>
                    <strong className="text-xs text-slate-900">
                      {item.medicamento || item.nome}
                    </strong>
                    {item.formaFarmaceutica && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.formaFarmaceutica}
                      </span>
                    )}
                  </div>
                  {item.quantidade && (
                    <span className="text-xs font-bold text-slate-800 ml-2">
                      {item.quantidade}
                    </span>
                  )}
                </div>

                {/* Via e Posologia */}
                <div className="pl-5 text-[11px] text-slate-800 leading-relaxed">
                  {item.via && (
                    <span className="font-bold text-blue-800 mr-2">
                      [{item.via}]
                    </span>
                  )}
                  <span>{item.posologia}</span>
                </div>

                {/* Instruções Adicionais */}
                {item.instrucoesAdicionais && (
                  <div className="pl-5 mt-1 text-[10px] text-slate-500 italic">
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
        <section className="border border-slate-200 rounded-lg p-3 mb-6 bg-slate-50/70 text-[10px]">
          <strong className="block text-slate-700 font-bold mb-1 uppercase tracking-wider">
            Recomendações e Orientações Médicas:
          </strong>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
            {prescription.observacoesGerais}
          </p>
        </section>
      )}

      {/* Validade */}
      <div className="text-[10px] text-slate-500 mb-6 flex justify-between items-center">
        <span>
          {isControleEspecial 
            ? '⚠️ Válido por 30 (trinta) dias a contar da data de emissão em todo o território nacional.' 
            : isAntimicrobiano 
              ? '⚠️ Válido por 10 (dez) dias a contar da data de emissão.' 
              : `Receita com validade sugerida de ${prescription.validadeDias || 180} dias para medicamentos de uso contínuo.`}
        </span>
        <span className="text-slate-400">
          Uso Humano
        </span>
      </div>

      {/* Campos Exclusivos da Portaria 344/98 (Controle Especial - 1ª Via) */}
      {isControleEspecial && currentVia === 1 && (
        <section className="border-2 border-dashed border-slate-300 rounded-lg p-3 mb-6 text-[9px] bg-slate-50">
          <div className="grid grid-cols-2 gap-4">
            {/* Identificação do Comprador */}
            <div className="border-r border-slate-300 pr-3">
              <strong className="block font-bold text-slate-800 uppercase mb-2 border-b pb-1">
                Identificação do Comprador
              </strong>
              <div className="space-y-1.5">
                <div>Nome: ________________________________________________</div>
                <div>Identidade (RG): ________________ Órgão Emissor: _______</div>
                <div>CPF: ______________________ Tel: ____________________</div>
                <div>Endereço: ___________________________________________</div>
                <div>Cidade: __________________________ UF: ______________</div>
                <div className="pt-2 text-center">Assinatura: ___________________________</div>
              </div>
            </div>

            {/* Identificação do Fornecedor / Farmácia */}
            <div className="pl-1">
              <strong className="block font-bold text-slate-800 uppercase mb-2 border-b pb-1">
                Identificação do Fornecedor
              </strong>
              <div className="space-y-1.5">
                <div>Razão Social / Farmácia: ___________________________</div>
                <div>CNPJ: _____________________________________________</div>
                <div>Nome do Farmacêutico: ____________________________</div>
                <div>CRF: ________________ Data de Atendimento: __/__/____</div>
                <div>Quantidade Dispensada: ________________ Lote: ________</div>
                <div className="pt-2 text-center">Assinatura do Farmacêutico: _______________</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Rodapé: Data e Assinatura do Médico */}
      <footer className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end">
        <div className="text-[10px] text-slate-500 max-w-[280px]">
          <div className="font-semibold text-slate-700 mb-1">
            {doctorClinica.includes('São Paulo') || !doctorEndereco ? 'São Paulo - SP' : 'Local de Atendimento'}, {dataFormatada}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-emerald-700">
            <ShieldCheck size={12} />
            <span>Documento emitido via NexAi-NEFRO</span>
          </div>
          <p className="text-[8px] text-slate-400 mt-0.5">
            Código Autenticador: {prescription.id || 'NEXAI-REC-VALID'}
          </p>
        </div>

        {/* Bloco de Carimbo e Assinatura */}
        <div className="text-center min-w-[240px]">
          <div className="border-b border-slate-800 w-full mb-1"></div>
          <strong className="block text-xs text-slate-900 font-bold">{doctorName}</strong>
          <span className="block text-[10px] text-slate-700">{doctorEspecialidade}</span>
          <span className="block text-[10px] text-slate-600 font-medium">CRM-{doctorUf} {doctorCrm}</span>
        </div>
      </footer>
    </div>
  );
}
