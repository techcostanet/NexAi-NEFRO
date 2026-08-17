import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  Activity, 
  Stethoscope, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Lock, 
  Database, 
  FileText, 
  BarChart3, 
  Pill, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  ExternalLink,
  Award,
  Users,
  Check,
  Star,
  Layers,
  HeartPulse
} from 'lucide-react';
import KidneyIcon from '../components/KidneyIcon';
import { subscribeSystemPlans } from '../services/financialService';
import CheckoutModal from '../components/CheckoutModal';
import { APP_VERSION } from '../version';

export default function LandingPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState('anual'); // 'mensal' | 'anual'
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('dialise'); // 'dialise' | 'exames' | 'medicamentos' | 'prontuario'
  const [openFaq, setOpenFaq] = useState(null);
  
  // Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  useEffect(() => {
    const unsub = subscribeSystemPlans((data) => {
      if (data && data.length > 0) {
        setPlans(data);
      }
    });
    return () => unsub();
  }, []);

  const handleOpenCheckout = (plan) => {
    setSelectedPlanForCheckout(plan);
    setIsCheckoutOpen(true);
  };

  const handleStartTrial = () => {
    const trialPlan = plans.find(p => p.intervalo === 'trial') || {
      id: 'plano-trial',
      nome: 'Avaliação Gratuita (7 Dias)',
      descricao: 'Experimente todas as funcionalidades do sistema sem compromisso',
      valor: 0.00,
      intervalo: 'trial'
    };
    handleOpenCheckout(trialPlan);
  };

  const faqs = [
    {
      q: "O NexAi-NEFRO é exclusivo para médicos nefrologistas?",
      a: "Sim. Toda a arquitetura clínica, os parâmetros de cálculo (Kt/V, cinética de ureia, clearance de creatinina), as tabelas laboratoriais (PTH, Fósforo, Ferritina, IST) e o controle de turnos de hemodiálise foram desenhados especificamente para a rotina do nefrologista e clínicas de diálise."
    },
    {
      q: "Como funciona a Avaliação Gratuita de 7 Dias?",
      a: "Você se cadastra em menos de 1 minuto sem precisar informar cartão de crédito. Sua conta é liberada imediatamente com 6 pacientes demonstrativos completos para você testar evoluções clínicas, prescrições e gráficos laboratoriais."
    },
    {
      q: "Meus dados e os prontuários dos pacientes ficam seguros?",
      a: "Totalmente. O sistema roda 100% no Google Cloud Firestore com criptografia em trânsito e repouso, atendendo rigorosamente à Lei Geral de Proteção de Dados (LGPD) e às resoluções do CFM (Conselho Federal de Medicina nº 1.821/2007 e 2.299/2021)."
    },
    {
      q: "Posso acessar pelo celular, tablet ou computador do hospital?",
      a: "Sim. A plataforma é 100% responsiva e funciona em qualquer navegador web (computador, iPad, tablet ou smartphone) sem necessidade de instalação."
    },
    {
      q: "Como funciona o cancelamento ou renovação?",
      a: "Você tem total liberdade. No plano mensal, não há fidelidade. No plano anual, você aproveita 2 meses de bônus gratuito (pague 10 meses e use 12)."
    }
  ];

  return (
    <div style={{ background: '#f8fafc', color: '#0f172a', minHeight: '100vh', fontFamily: 'inherit' }}>
      
      {/* ================= HEADER FIXO / NAVBAR ================= */}
      <nav 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000, 
          background: 'rgba(255, 255, 255, 0.85)', 
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.5rem' }}>
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', padding: '0.55rem', borderRadius: '12px', color: 'white', display: 'flex', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}>
              <KidneyIcon size={24} color="#ffffff" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight" style={{ color: '#0f172a' }}>NexAi<span style={{ color: '#2563eb' }}>-NEFRO</span></span>
                <span style={{ fontSize: '0.68rem', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                  v{APP_VERSION}
                </span>
              </div>
              <span className="text-xs text-muted block -mt-0.5">Software Médico Especializado</span>
            </div>
          </div>

          {/* Links Centrais */}
          <div className="hidden md:flex items-center gap-6" style={{ fontSize: '0.88rem', fontWeight: '600', color: '#475569' }}>
            <a href="#funcionalidades" className="hover:text-blue-600 transition" style={{ textDecoration: 'none', color: 'inherit' }}>Funcionalidades</a>
            <a href="#telas" className="hover:text-blue-600 transition" style={{ textDecoration: 'none', color: 'inherit' }}>Telas do Sistema</a>
            <a href="#seguranca" className="hover:text-blue-600 transition" style={{ textDecoration: 'none', color: 'inherit' }}>Segurança & LGPD</a>
            <a href="#planos" className="hover:text-blue-600 transition" style={{ textDecoration: 'none', color: 'inherit' }}>Planos & Preços</a>
            <a href="#faq" className="hover:text-blue-600 transition" style={{ textDecoration: 'none', color: 'inherit' }}>Dúvidas</a>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => navigate('/login')}
              className="btn btn-outline"
              style={{ fontSize: '0.84rem', padding: '0.5rem 1rem', fontWeight: '600' }}
            >
              Entrar
            </button>
            <button 
              type="button" 
              onClick={handleStartTrial}
              className="btn btn-primary"
              style={{ fontSize: '0.84rem', padding: '0.5rem 1.1rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
            >
              Testar 7 Dias Grátis
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section style={{ padding: '4.5rem 1.5rem 3rem', background: 'radial-gradient(ellipse at top, rgba(239, 246, 255, 0.9) 0%, rgba(248, 250, 252, 0.4) 100%)' }}>
        <div className="container" style={{ maxWidth: '1100px', textAlign: 'center' }}>
          
          {/* Badge de Destaque */}
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(219, 234, 254, 0.7)', 
              border: '1px solid #bfdbfe', 
              padding: '6px 14px', 
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#1d4ed8',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)'
            }}
          >
            <Sparkles size={14} color="#2563eb" />
            <span>Desenvolvido exclusivamente para Nefrologistas & Clínicas de Diálise</span>
          </div>

          {/* Headline Principal */}
          <h1 
            style={{ 
              fontSize: 'clamp(2rem, 4.5vw, 3.4rem)', 
              fontWeight: '900', 
              lineHeight: 1.15, 
              letterSpacing: '-0.03em', 
              color: '#0f172a', 
              marginBottom: '1.25rem',
              maxWidth: '900px',
              margin: '0 auto 1.25rem'
            }}
          >
            O Prontuário Inteligente que revoluciona sua rotina de <span style={{ background: 'linear-gradient(135deg, #2563eb, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hemodiálise e Nefrologia</span>
          </h1>

          {/* Sub-headline */}
          <p 
            style={{ 
              fontSize: 'clamp(1rem, 2vw, 1.15rem)', 
              color: '#475569', 
              maxWidth: '720px', 
              margin: '0 auto 2.25rem', 
              lineHeight: 1.6 
            }}
          >
            Controle de sessões dialíticas em 2 minutos, acompanhamento de distúrbio mineral ósseo (PTH/Fósforo), prescrições com ciclos de ferro e alertas laboratoriais — <strong>100% em nuvem e seguro</strong>.
          </p>

          {/* CTAs */}
          <div className="flex justify-center items-center gap-3 flex-wrap mb-4">
            <button 
              type="button" 
              onClick={handleStartTrial}
              className="btn btn-primary"
              style={{ 
                padding: '0.85rem 1.85rem', 
                fontSize: '1rem', 
                fontWeight: 'bold', 
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Começar Teste Grátis por 7 Dias</span>
              <ArrowRight size={18} />
            </button>

            <a 
              href="#telas"
              className="btn btn-outline"
              style={{ 
                padding: '0.85rem 1.5rem', 
                fontSize: '0.95rem', 
                fontWeight: '600', 
                borderRadius: '14px',
                background: '#ffffff',
                borderColor: '#cbd5e1'
              }}
            >
              Conhecer as Telas
            </a>
          </div>

          {/* Micro Prova Social */}
          <div className="flex justify-center items-center gap-6 mt-4 text-xs font-semibold text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={15} color="#16a34a" /> Sem cartão de crédito</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={15} color="#16a34a" /> Ativação em 30 segundos</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={15} color="#16a34a" /> 100% Conforme LGPD & CFM</span>
          </div>

          {/* Preview Hero / Mockup do Painel */}
          <div 
            style={{ 
              marginTop: '3.5rem', 
              position: 'relative',
              borderRadius: '24px',
              padding: '10px',
              background: 'linear-gradient(135deg, #cbd5e1, #e2e8f0)',
              boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)'
            }}
          >
            <div 
              style={{ 
                background: '#ffffff', 
                borderRadius: '18px', 
                overflow: 'hidden',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Header do Mockup Browser */}
              <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                <div style={{ marginLeft: '1rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px 14px', fontSize: '0.72rem', color: '#64748b', fontWeight: '500' }}>
                  https://nexai-nefro.web.app/doctor
                </div>
              </div>

              {/* Conteúdo Ilustrativo da Tela do Médico */}
              <div style={{ padding: '1.5rem', background: '#f8fafc' }}>
                {/* Header Interno do Mockup */}
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-left">
                    <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '10px', color: '#2563eb' }}>
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <strong className="text-sm block text-slate-800">Painel do Nefrologista • Dr. Marcelo Ramos</strong>
                      <span className="text-xs text-muted">Clínica Nefrológica Principal • 6 Pacientes em Acompanhamento</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                      🟢 Sistema Online (Nuvem)
                    </span>
                  </div>
                </div>

                {/* Cards de Pacientes Mockup */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', textAlign: 'left' }}>
                  
                  {/* Card 1 */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <strong className="text-sm block text-slate-900">AMÉLIA SILVA</strong>
                        <span className="text-xs text-muted">68 anos • FAV (MSE) • 3º Turno</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                        Ativo
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', background: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
                      <div>Hb: <strong>11.4 g/dL</strong></div>
                      <div>PTH: <strong style={{ color: '#d97706' }}>380 pg/mL</strong></div>
                      <div>Kt/V: <strong style={{ color: '#16a34a' }}>1.42 (Adequado)</strong></div>
                      <div>Peso Seco: <strong>64.5 kg</strong></div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <strong className="text-sm block text-slate-900">ADCÉLIO PEREIRA</strong>
                        <span className="text-xs text-muted">54 anos • Permcath • 1º Turno</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                        Alerta Exame
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', background: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
                      <div>Hb: <strong style={{ color: '#dc2626' }}>9.2 g/dL</strong></div>
                      <div>Fósforo: <strong style={{ color: '#dc2626' }}>6.8 mg/dL</strong></div>
                      <div>Kt/V: <strong>1.28</strong></div>
                      <div>Prescrição: <strong style={{ color: '#2563eb' }}>EPO + Ferro IV</strong></div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm hidden md:block">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <strong className="text-sm block text-slate-900">CARLOS EDUARDO</strong>
                        <span className="text-xs text-muted">61 anos • FAV (MSD) • 2º Turno</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                        Ativo
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', background: '#f8fafc', padding: '8px', borderRadius: '8px' }}>
                      <div>Hb: <strong>12.0 g/dL</strong></div>
                      <div>PTH: <strong>210 pg/mL</strong></div>
                      <div>Kt/V: <strong style={{ color: '#16a34a' }}>1.55</strong></div>
                      <div>Ciclo: <strong>Calcitriol Ativo</strong></div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SEÇÃO DE DIFERENCIAIS & DORES ================= */}
      <section id="funcionalidades" style={{ padding: '5rem 1.5rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Por que migrar para o NexAi-NEFRO?</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1" style={{ letterSpacing: '-0.02em' }}>
              Projetado para eliminar planilhas lentas e prontuários genéricos
            </h2>
            <p className="text-muted text-sm max-w-2xl mx-auto mt-2">
              Prontuários hospitalares genéricos não entendem de diálise, fluxo de sangue, bicarbonato e distúrbio mineral. O NexAi-NEFRO nasceu focado na nefrologia.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Card 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#dbeafe', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Clock size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Evolução Dialítica em 2 Minutos</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Registre intercorrências, ultrafiltração, pressão pré/pós e parâmetros da máquina em poucos cliques, sem perder tempo digitando textos repetitivos.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <BarChart3 size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Painel Laboratorial & Distúrbio Ósseo</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Acompanhe a curva histórica de PTH, Fósforo, Cálcio, Ferritina, IST e Kt/V com indicadores visuais de adequação conforme as diretrizes da SBN e KDIGO.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Pill size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Prescrição com Gestão de Ciclos</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Controle doses e término de ciclos de Sacarato de Hidróxido Férrico, Alfaepoetina e Paricalcitol com alertas automáticos de vencimento e suspensão.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <HeartPulse size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Gestão de Acessos Vasculares</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Controle individualizado de FAV, Permcath e Próteses com data de confecção, membro, fluxo efetivo de sangue (Qb) e histórico de intervenções.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Users size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Organização por Clínicas & Turnos</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filtre seus pacientes por unidade de atendimento (Clínica A, Clínica B, Hospital) e por turno (1º, 2º ou 3º turno), facilitando o plantão e a ronda.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Conformidade Legal & LGPD</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Garantia de sigilo médico absoluto: nenhum dado clínico é compartilhado e todos os registros são criptografados no Cloud Firestore com backup contínuo.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ================= SHOWCASE DE TELAS INTERATIVO ================= */}
      <section id="telas" style={{ padding: '5rem 1.5rem', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Demonstração Visual</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1" style={{ letterSpacing: '-0.02em' }}>
              Veja como o sistema funciona na prática
            </h2>
            <p className="text-muted text-sm max-w-xl mx-auto mt-2">
              Clique nas abas abaixo para explorar os módulos do prontuário nefrológico.
            </p>
          </div>

          {/* Abas Interativas */}
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('dialise')}
              className={`btn ${activeShowcaseTab === 'dialise' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem', borderRadius: '12px' }}
            >
              🩺 Hemodiálise & Parâmetros
            </button>
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('exames')}
              className={`btn ${activeShowcaseTab === 'exames' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem', borderRadius: '12px' }}
            >
              🧪 Painel de Exames & Gráficos
            </button>
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('medicamentos')}
              className={`btn ${activeShowcaseTab === 'medicamentos' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem', borderRadius: '12px' }}
            >
              💊 Prescrições & Ciclos
            </button>
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('prontuario')}
              className={`btn ${activeShowcaseTab === 'prontuario' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.85rem', padding: '0.5rem 1.1rem', borderRadius: '12px' }}
            >
              👤 Prontuário & Acessos
            </button>
          </div>

          {/* Card da Tela Ativa */}
          <div className="glass-panel" style={{ background: '#ffffff', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 15px 35px rgba(0,0,0,0.05)' }}>
            
            {activeShowcaseTab === 'dialise' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Evolução Clínica de Hemodiálise</h3>
                    <p className="text-xs text-muted">Registro rápido de parâmetros pré, intra e pós-diálise com cálculo de UF</p>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Agilidade Máxima
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-xs text-muted block">Pressão Pré / Pós</span>
                    <strong className="text-base text-slate-900">140x90 ➡️ 120x80 mmHg</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-xs text-muted block">Ultrafiltração (UF)</span>
                    <strong className="text-base text-blue-700">2.400 mL (Adequada)</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-xs text-muted block">Fluxo de Sangue (Qb)</span>
                    <strong className="text-base text-slate-900">350 mL/min</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-xs text-muted block">Intercorrências</span>
                    <strong className="text-base text-emerald-700">Nenhuma registrada</strong>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'exames' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Metabolismo Ósseo, Anemia & Cinética</h3>
                    <p className="text-xs text-muted">Controle rigoroso dos principais biomarcadores da DRC estágio 5D</p>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Diretrizes SBN / KDIGO
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-xs text-emerald-800 font-semibold block">Kt/V Dialítico</span>
                    <strong className="text-xl text-emerald-700">1.45</strong>
                    <span className="text-xs text-emerald-600 block mt-0.5">Adequado (&gt; 1.20)</span>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="text-xs text-blue-800 font-semibold block">Hemoglobina (Hb)</span>
                    <strong className="text-xl text-blue-700">11.2 g/dL</strong>
                    <span className="text-xs text-blue-600 block mt-0.5">Alvo: 10 - 12 g/dL</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-xs text-amber-800 font-semibold block">PTH Intacto</span>
                    <strong className="text-xl text-amber-700">340 pg/mL</strong>
                    <span className="text-xs text-amber-600 block mt-0.5">Alvo: 150 - 600 pg/mL</span>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <span className="text-xs text-purple-800 font-semibold block">Ferritina & IST</span>
                    <strong className="text-xl text-purple-700">420 ng/mL • 28%</strong>
                    <span className="text-xs text-purple-600 block mt-0.5">Estoques de ferro OK</span>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'medicamentos' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Catálogo Nefrológico & Alertas de Ciclos</h3>
                    <p className="text-xs text-muted">Prescrição contínua e temporária com controle de ampolas e término</p>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#f3e8ff', color: '#7c3aed', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Alertas Inteligentes
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <strong className="text-sm block text-slate-900">Alfaepoetina (EPO) 4.000 UI</strong>
                      <span className="text-xs text-muted">Via SC • 3x por semana pós-diálise</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      Uso Contínuo
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <strong className="text-sm block text-slate-900">Sacarato de Hidróxido Férrico (Noripurum) 100mg</strong>
                      <span className="text-xs text-muted">Via IV • Ciclo de 5 semanas (1x/semana) • Restam 2 aplicações</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                      Ciclo Ativo
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeShowcaseTab === 'prontuario' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Prontuário Especializado & Acesso Vascular</h3>
                    <p className="text-xs text-muted">Histórico clínico focado na Doença Renal Crônica e Comorbidades</p>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#fee2e2', color: '#dc2626', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Controle de Acesso
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs text-muted block">Tipo de Acesso Vascular</span>
                    <strong className="text-sm text-slate-900">Fístula Arteriovenosa (FAV)</strong>
                    <span className="text-xs text-slate-500 block mt-0.5">Membro Superior Esquerdo (MSE)</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs text-muted block">Etiologia da DRC</span>
                    <strong className="text-sm text-slate-900">Nefropatia Diabética + HAS</strong>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs text-muted block">Peso Seco Ideal</span>
                    <strong className="text-sm text-blue-700">65.0 kg</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ================= SEÇÃO DE SEGURANÇA & CONFORMIDADE ================= */}
      <section id="seguranca" style={{ padding: '4.5rem 1.5rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '1000px', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', padding: '10px', background: '#ede9fe', borderRadius: '16px', color: '#7c3aed', marginBottom: '1rem' }}>
            <Lock size={28} />
          </div>

          <h2 className="text-3xl font-black text-slate-900" style={{ letterSpacing: '-0.02em' }}>
            Segurança de Nível Bancário & Conformidade Médica Rigorosa
          </h2>
          <p className="text-muted text-sm max-w-xl mx-auto mt-2 mb-8">
            Desenvolvido para proteger os dados mais sensíveis da sua clínica e garantir conformidade jurídica irrestrita.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', textAlign: 'left' }}>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldCheck size={18} color="#16a34a" />
                <strong className="text-sm text-slate-900">100% LGPD Compliant</strong>
              </div>
              <p className="text-xs text-slate-600">
                Isolamento estrito dos prontuários de saúde. Nem mesmo os administradores da infraestrutura têm acesso aos dados dos seus pacientes.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 mb-1.5">
                <Award size={18} color="#2563eb" />
                <strong className="text-sm text-slate-900">Normas CFM 1.821 e 2.299</strong>
              </div>
              <p className="text-xs text-slate-600">
                Alinhado às diretrizes do Conselho Federal de Medicina para prontuário eletrônico e guarda digital de registros de diálise.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 mb-1.5">
                <Database size={18} color="#7c3aed" />
                <strong className="text-sm text-slate-900">Google Cloud Firestore</strong>
              </div>
              <p className="text-xs text-slate-600">
                Infraestrutura em nuvem de alta disponibilidade com criptografia AES-256 e redundância geográfica automática.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SEÇÃO DE PLANOS & PREÇOS ================= */}
      <section id="planos" style={{ padding: '5rem 1.5rem', background: 'radial-gradient(ellipse at bottom, rgba(239, 246, 255, 0.8) 0%, rgba(248, 250, 252, 1) 100%)' }}>
        <div className="container" style={{ maxWidth: '1100px', textAlign: 'center' }}>
          
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Planos Transparentes</span>
          <h2 className="text-3xl font-black text-slate-900 mt-1" style={{ letterSpacing: '-0.02em' }}>
            Investimento acessível com retorno imediato em produtividade
          </h2>
          <p className="text-muted text-sm max-w-xl mx-auto mt-2 mb-8">
            Escolha o plano ideal para sua prática nefrológica. Cancele ou altere a qualquer momento.
          </p>

          {/* Toggle Mensal / Anual */}
          <div className="flex justify-center items-center gap-3 mb-10">
            <span className={`text-xs font-bold ${billingCycle === 'mensal' ? 'text-slate-900' : 'text-slate-500'}`}>
              Mensal
            </span>

            <div 
              onClick={() => setBillingCycle(prev => prev === 'mensal' ? 'anual' : 'mensal')}
              style={{ 
                width: '56px', 
                height: '28px', 
                background: billingCycle === 'anual' ? '#2563eb' : '#cbd5e1', 
                borderRadius: '999px', 
                padding: '3px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div 
                style={{ 
                  width: '22px', 
                  height: '22px', 
                  background: '#ffffff', 
                  borderRadius: '50%', 
                  transform: billingCycle === 'anual' ? 'translateX(28px)' : 'translateX(0px)',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${billingCycle === 'anual' ? 'text-slate-900' : 'text-slate-500'}`}>
                Anual
              </span>
              <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                2 MESES GRÁTIS 🔥
              </span>
            </div>
          </div>

          {/* Grid de Cards de Planos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', alignItems: 'stretch' }}>
            
            {/* Card 1: Trial 7 Dias */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between text-left">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block mb-1">Sem Compromisso</span>
                <h3 className="text-xl font-bold text-slate-900">Avaliação Gratuita</h3>
                <p className="text-xs text-muted mt-1 mb-4">Teste completo por 7 dias para conhecer todos os recursos</p>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-slate-900">Grátis</span>
                  <span className="text-xs text-muted block mt-0.5">por 7 dias completos</span>
                </div>

                <ul className="text-xs text-slate-600 flex flex-col gap-2.5 mb-6">
                  <li className="flex items-center gap-2"><Check size={14} color="#16a34a" /> Acesso total a prontuários e diálise</li>
                  <li className="flex items-center gap-2"><Check size={14} color="#16a34a" /> 6 pacientes demonstrativos inclusos</li>
                  <li className="flex items-center gap-2"><Check size={14} color="#16a34a" /> Sem necessidade de cartão de crédito</li>
                  <li className="flex items-center gap-2"><Check size={14} color="#16a34a" /> Ativação imediata no Cloud Firestore</li>
                </ul>
              </div>

              <button 
                type="button" 
                onClick={handleStartTrial}
                className="btn btn-outline w-full py-2.5 text-xs font-bold"
              >
                Iniciar Teste Grátis
              </button>
            </div>

            {/* Card 2: Plano Anual (DESTAQUE) */}
            <div 
              className="p-6 rounded-3xl bg-white flex flex-col justify-between text-left relative"
              style={{ 
                border: '2px solid #2563eb', 
                boxShadow: '0 20px 40px rgba(37, 99, 235, 0.15)',
                transform: 'scale(1.02)'
              }}
            >
              {/* Badge Topo */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '-12px', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                  color: 'white', 
                  padding: '4px 14px', 
                  borderRadius: '999px', 
                  fontSize: '0.72rem', 
                  fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)'
                }}
              >
                MAIS ESCOLHIDO POR MÉDICOS ⭐
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">Melhor Custo-Benefício</span>
                <h3 className="text-xl font-bold text-slate-900">Plano Anual</h3>
                <p className="text-xs text-muted mt-1 mb-4">Economize 2 meses de mensalidade com contratação anual</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-blue-600">R$ 990,00</span>
                    <span className="text-xs text-muted">/ano</span>
                  </div>
                  <span className="text-xs text-emerald-600 font-bold block mt-0.5">
                    Equivalente a R$ 82,50/mês (Pague 10, use 12)
                  </span>
                </div>

                <ul className="text-xs text-slate-600 flex flex-col gap-2.5 mb-6">
                  <li className="flex items-center gap-2"><Check size={14} color="#2563eb" /> <strong>Prontuários e Pacientes Ilimitados</strong></li>
                  <li className="flex items-center gap-2"><Check size={14} color="#2563eb" /> <strong>Evoluções de Hemodiálise Ilimitadas</strong></li>
                  <li className="flex items-center gap-2"><Check size={14} color="#2563eb" /> <strong>Gráficos de PTH, Fósforo, Hb e Kt/V</strong></li>
                  <li className="flex items-center gap-2"><Check size={14} color="#2563eb" /> <strong>Prescrições com Alertas de Ciclos</strong></li>
                  <li className="flex items-center gap-2"><Check size={14} color="#2563eb" /> <strong>Suporte VIP prioritário via WhatsApp</strong></li>
                  <li className="flex items-center gap-2"><Check size={14} color="#2563eb" /> <strong>Backup dedicado na nuvem</strong></li>
                </ul>
              </div>

              <button 
                type="button" 
                onClick={() => handleOpenCheckout(plans.find(p => p.intervalo === 'anual') || { id: 'plano-anual', nome: 'Plano Anual com Desconto', valor: 990.00, intervalo: 'anual' })}
                className="btn btn-primary w-full py-3 text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)' }}
              >
                Assinar Plano Anual com 2 Meses Grátis
              </button>
            </div>

            {/* Card 3: Plano Mensal */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between text-left">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Flexibilidade Total</span>
                <h3 className="text-xl font-bold text-slate-900">Plano Mensal</h3>
                <p className="text-xs text-muted mt-1 mb-4">Acesso completo sem fidelidade ou carência</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">R$ 99,90</span>
                    <span className="text-xs text-muted">/mês</span>
                  </div>
                  <span className="text-xs text-muted block mt-0.5">Cobrança recorrente mensal</span>
                </div>

                <ul className="text-xs text-slate-600 flex flex-col gap-2.5 mb-6">
                  <li className="flex items-center gap-2"><Check size={14} color="#16a34a" /> Prontuários e Pacientes Ilimitados</li>
                  <li className="flex items-center gap-2"><Check size={14} color="#16a34a" /> Evoluções de Hemodiálise Ilimitadas</li>
                  <li className="flex items-center gap-2"><Check size={14} color="#16a34a" /> Painel de Exames e Gráficos</li>
                  <li className="flex items-center gap-2"><Check size={14} color="#16a34a" /> Prescrições com Alertas de Ciclos</li>
                  <li className="flex items-center gap-2"><Check size={14} color="#16a34a" /> Cancele quando quiser</li>
                </ul>
              </div>

              <button 
                type="button" 
                onClick={() => handleOpenCheckout(plans.find(p => p.intervalo === 'mensal') || { id: 'plano-mensal', nome: 'Plano Mensal Nefrologia', valor: 99.90, intervalo: 'mensal' })}
                className="btn btn-outline w-full py-2.5 text-xs font-bold"
              >
                Assinar Plano Mensal
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ================= FAQ ACCORDION ================= */}
      <section id="faq" style={{ padding: '4.5rem 1.5rem', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Tire Suas Dúvidas</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1" style={{ letterSpacing: '-0.02em' }}>
              Perguntas Frequentes de Médicos
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm text-slate-900 flex justify-between items-center bg-transparent border-none cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="#2563eb" /> : <ChevronDown size={18} color="#64748b" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= BANNER FINAL DE CONVERSÃO ================= */}
      <section style={{ padding: '4.5rem 1.5rem', background: 'linear-gradient(135deg, #1e40af, #1e3a8a)', color: 'white', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 className="text-3xl font-black mb-2" style={{ letterSpacing: '-0.02em' }}>
            Pronto para transformar sua rotina nefrológica?
          </h2>
          <p className="text-blue-100 text-sm max-w-lg mx-auto mb-6">
            Junte-se a nefrologistas que utilizam tecnologia de ponta para cuidar melhor dos seus pacientes em diálise.
          </p>

          <button 
            type="button" 
            onClick={handleStartTrial}
            className="btn py-3 px-8 text-sm font-bold rounded-xl"
            style={{ background: '#ffffff', color: '#1e40af', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
          >
            Começar Meu Teste Grátis de 7 Dias Agora
          </button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '2.5rem 1.5rem', fontSize: '0.75rem', borderTop: '1px solid #1e293b' }}>
        <div className="container" style={{ maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="flex items-center gap-2">
            <KidneyIcon size={18} color="#38bdf8" />
            <strong className="text-white">NexAi-NEFRO</strong>
            <span>• Plataforma Especializada em Nefrologia Clínica & Hemodiálise</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400">100% Cloud Firestore</span>
            <span>•</span>
            <span className="text-slate-400">Conforme LGPD & CFM</span>
            <span>•</span>
            <span className="text-slate-400">v{APP_VERSION}</span>
          </div>
        </div>
      </footer>

      {/* ================= BOTÃO FLUTUANTE DE WHATSAPP ================= */}
      <a 
        href="https://wa.me/5511999999999?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20o%20software%20NexAi-NEFRO" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9990,
          background: '#25D366',
          color: 'white',
          borderRadius: '50px',
          padding: '10px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 'bold',
          fontSize: '0.82rem',
          textDecoration: 'none',
          boxShadow: '0 8px 20px rgba(37, 211, 102, 0.4)',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageCircle size={20} />
        <span>Dúvidas? Fale Conosco</span>
      </a>

      {/* Modal de Checkout / Onboarding */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlanForCheckout}
        allPlans={plans}
      />

    </div>
  );
}
