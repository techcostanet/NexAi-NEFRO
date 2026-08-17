import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  QrCode, 
  Copy, 
  Check, 
  Loader2, 
  Lock, 
  User, 
  Building, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { registerDoctorSelfService } from '../services/authService';

export default function CheckoutModal({ isOpen, onClose, selectedPlan, allPlans = [] }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Dados Médicos | 2: Pagamento / Ativação | 3: Sucesso
  
  const [currentPlan, setCurrentPlan] = useState(selectedPlan);
  const [paymentMethod, setPaymentMethod] = useState('PIX'); // 'PIX' | 'Cartao'
  const [copiedPix, setCopiedPix] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Formulário do Médico
  const [formData, setFormData] = useState({
    nome: '',
    crm: '',
    ufCrm: 'SP',
    cpf: '',
    rqe: '',
    email: '',
    telefone: '',
    senha: '',
    clinicaPrincipal: ''
  });

  // Dados do Cartão de Crédito (Asaas)
  const [cardData, setCardData] = useState({
    numero: '',
    nomeTitular: '',
    validade: '',
    cvv: ''
  });

  useEffect(() => {
    if (selectedPlan) {
      setCurrentPlan(selectedPlan);
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isTrial = currentPlan?.intervalo === 'trial' || Number(currentPlan?.valor) === 0;

  const handleNextToPayment = (e) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.crm.trim() || !formData.email.trim() || !formData.senha.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }
    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleCopyPix = () => {
    const pixCode = "00020126580014br.gov.bcb.pix013612345678000190520400005303986540" + (currentPlan?.valor?.toFixed(2) || "99.90") + "5802BR5925NexAi Solucoes Saude6009Sao Paulo62070503***6304E2CA";
    navigator.clipboard.writeText(pixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleFinishOnboarding = async () => {
    try {
      setLoading(true);
      setError('');

      await registerDoctorSelfService({
        ...formData,
        plan: currentPlan,
        paymentMethod: isTrial ? 'Gratuito' : paymentMethod
      });

      setStep(3);
      setTimeout(() => {
        onClose();
        navigate('/doctor');
      }, 2500);

    } catch (err) {
      console.error("Erro no onboarding:", err);
      setError(err.message || 'Erro ao criar conta no Firestore. Tente novamente.');
    } finally {
      setLoading(false);
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
        backgroundColor: 'rgba(15, 23, 42, 0.75)', 
        backdropFilter: 'blur(8px)', 
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
          background: '#ffffff', 
          width: '100%', 
          maxWidth: '580px', 
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '2rem', 
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button 
          type="button" 
          onClick={onClose} 
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 transition"
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>

        {/* Indicador de Passos */}
        {step < 3 && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div 
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: step === 1 ? '#2563eb' : '#10b981', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
              >
                {step === 1 ? '1' : <Check size={16} />}
              </div>
              <span className={`text-xs font-bold ${step === 1 ? 'text-slate-900' : 'text-emerald-600'}`}>
                Dados Médicos
              </span>
            </div>

            <div style={{ flex: 1, height: '2px', background: step === 2 ? '#2563eb' : '#e2e8f0', margin: '0 1rem' }} />

            <div className="flex items-center gap-2">
              <div 
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: step === 2 ? '#2563eb' : '#e2e8f0', 
                  color: step === 2 ? 'white' : '#64748b', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
              >
                2
              </div>
              <span className={`text-xs font-bold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                {isTrial ? 'Ativação Gratuita' : 'Pagamento & Acesso'}
              </span>
            </div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <div className="p-3 mb-4 rounded-xl flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* ================= PASSO 1: DADOS DO MÉDICO ================= */}
        {step === 1 && (
          <div>
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Cadastro de Licença Médica</span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">Informe seus dados profissionais</h2>
              <p className="text-xs text-muted">Sua conta será criada e liberada instantaneamente.</p>
            </div>

            {/* Resumo do Plano Selecionado */}
            <div className="p-3 mb-4 rounded-xl border border-blue-100 bg-blue-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div style={{ padding: '6px', background: '#dbeafe', borderRadius: '8px', color: '#1d4ed8' }}>
                  <Zap size={16} />
                </div>
                <div>
                  <strong className="text-xs text-slate-900 block">{currentPlan?.nome || 'Plano Mensal'}</strong>
                  <span className="text-xs text-muted">{isTrial ? '7 dias de teste completo' : currentPlan?.descricao}</span>
                </div>
              </div>
              <div className="text-right">
                <strong className="text-sm block text-blue-700">
                  {isTrial ? 'Grátis' : `R$ ${Number(currentPlan?.valor || 99.90).toFixed(2)}`}
                </strong>
                <span className="text-xs text-muted">/{currentPlan?.intervalo || 'mês'}</span>
              </div>
            </div>

            <form onSubmit={handleNextToPayment} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Nome Completo *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Dr. Marcelo Ramos" 
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr', gap: '0.6rem' }}>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">CRM *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: 123456" 
                    value={formData.crm}
                    onChange={(e) => setFormData(prev => ({ ...prev, crm: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">UF</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="SP" 
                    maxLength={2}
                    value={formData.ufCrm}
                    onChange={(e) => setFormData(prev => ({ ...prev, ufCrm: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">RQE (Opcional)</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: 45890" 
                    value={formData.rqe}
                    onChange={(e) => setFormData(prev => ({ ...prev, rqe: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">CPF do Médico</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="000.000.000-00" 
                    value={formData.cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">WhatsApp / Telefone</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="(11) 98888-7777" 
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Clínica / Hospital Principal</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: Instituto de Nefrologia & Diálise" 
                  value={formData.clinicaPrincipal}
                  onChange={(e) => setFormData(prev => ({ ...prev, clinicaPrincipal: e.target.value }))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '0.6rem' }}>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">E-mail de Acesso *</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="seu.email@clinica.com" 
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Senha * (mín. 6)</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="******" 
                    value={formData.senha}
                    onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button type="button" className="btn btn-outline" onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary flex items-center gap-2">
                  <span>{isTrial ? 'Avançar para Ativação' : 'Ir para o Pagamento'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= PASSO 2: PAGAMENTO / ATIVAÇÃO ================= */}
        {step === 2 && (
          <div>
            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                {isTrial ? '🎉 Avaliação Gratuita por 7 Dias' : '💳 Conclusão do Pagamento'}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {isTrial ? 'Ative seu acesso agora' : 'Escolha a forma de pagamento'}
              </h2>
              <p className="text-xs text-muted">
                {isTrial 
                  ? 'Você terá acesso completo a todos os recursos por 7 dias sem qualquer cobrança.'
                  : 'Liberação imediata da sua licença médica no Cloud Firestore.'}
              </p>
            </div>

            {/* Se for TRIAL 7 DIAS */}
            {isTrial ? (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div style={{ padding: '8px', background: '#10b981', borderRadius: '10px', color: 'white' }}>
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <strong className="text-sm text-emerald-900 block font-bold">Teste Grátis por 7 Dias Garantido</strong>
                      <span className="text-xs text-emerald-700">Sem necessidade de cartão de crédito</span>
                    </div>
                  </div>
                  <ul className="text-xs text-emerald-800 flex flex-col gap-1.5 pl-2">
                    <li>✓ Acesso imediato a prontuários e sessões de hemodiálise</li>
                    <li>✓ 6 pacientes demonstrativos com exames já pré-carregados</li>
                    <li>✓ Prescrições contínuas, ciclos de ferro/EPO e alertas laboratoriais</li>
                    <li>✓ Seus dados ficam salvos em segurança na nuvem</li>
                  </ul>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <button 
                    type="button" 
                    className="btn btn-outline flex items-center gap-1.5" 
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    <ArrowLeft size={16} /> Voltar
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-primary flex items-center gap-2" 
                    onClick={handleFinishOnboarding}
                    disabled={loading}
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                    <span>{loading ? 'Criando sua conta...' : 'Ativar Meu Acesso Gratuito'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Se for PLANO PAGO (Mensal R$ 99,90 ou Anual R$ 990,00) */
              <div className="flex flex-col gap-4">
                {/* Abas de Pagamento */}
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                      paymentMethod === 'PIX' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    <QrCode size={16} /> PIX Instantâneo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cartao')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                      paymentMethod === 'Cartao' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    <CreditCard size={16} /> Cartão de Crédito (Asaas)
                  </button>
                </div>

                {/* Opção PIX */}
                {paymentMethod === 'PIX' && (
                  <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl flex flex-col items-center text-center">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-emerald-100 mb-3">
                      {/* QR Code Ilustrativo Dinâmico */}
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=nexai-pix-${currentPlan?.valor || '99.90'}-${formData.crm}`} 
                        alt="QR Code PIX" 
                        style={{ width: '130px', height: '130px', borderRadius: '8px' }}
                      />
                    </div>
                    
                    <strong className="text-sm text-slate-800">
                      Total: <span className="text-emerald-700 font-bold">R$ {Number(currentPlan?.valor || 99.90).toFixed(2)}</span>
                    </strong>
                    <span className="text-xs text-muted mb-3">Escaneie com o app do seu banco</span>

                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="btn btn-outline flex items-center gap-2 text-xs py-1.5 px-3 bg-white"
                    >
                      {copiedPix ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      <span>{copiedPix ? 'Chave PIX Copiada!' : 'Copiar Chave PIX'}</span>
                    </button>
                  </div>
                )}

                {/* Opção Cartão de Crédito via Asaas */}
                {paymentMethod === 'Cartao' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">Número do Cartão</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="0000 0000 0000 0000"
                        value={cardData.numero}
                        onChange={(e) => setCardData(prev => ({ ...prev, numero: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1 block">Nome Impresso no Cartão</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="DR MARCELO RAMOS"
                        value={cardData.nomeTitular}
                        onChange={(e) => setCardData(prev => ({ ...prev, nomeTitular: e.target.value.toUpperCase() }))}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">Validade (MM/AA)</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder="12/28"
                          value={cardData.validade}
                          onChange={(e) => setCardData(prev => ({ ...prev, validade: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 mb-1 block">CVV</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder="123"
                          maxLength={4}
                          value={cardData.cvv}
                          onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted pt-1">
                      <ShieldCheck size={14} color="#16a34a" />
                      <span>Processamento seguro de recorrência via Gateway Asaas</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <button 
                    type="button" 
                    className="btn btn-outline flex items-center gap-1.5" 
                    onClick={() => setStep(1)}
                    disabled={loading}
                  >
                    <ArrowLeft size={16} /> Voltar
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-primary flex items-center gap-2" 
                    onClick={handleFinishOnboarding}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                    <span>{loading ? 'Ativando Licença...' : (paymentMethod === 'PIX' ? 'Já Paguei / Liberar Acesso' : 'Confirmar Assinatura')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= PASSO 3: SUCESSO & REDIRECIONAMENTO ================= */}
        {step === 3 && (
          <div className="py-8 text-center flex flex-col items-center">
            <div 
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                background: '#dcfce7', 
                color: '#16a34a', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1rem',
                boxShadow: '0 8px 16px rgba(22, 163, 74, 0.2)'
              }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Seja bem-vindo(a), {formData.nome}!</h2>
            <p className="text-sm text-slate-600 mb-4">
              Sua licença médica do <strong>NexAi-NEFRO</strong> foi ativada com sucesso no Cloud Firestore.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 py-2 px-4 rounded-full">
              <Loader2 className="animate-spin" size={14} />
              <span>Entrando no seu painel médico...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
