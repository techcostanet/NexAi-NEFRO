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
  HeartPulse,
  FileUp,
  Syringe,
  FileCheck,
  Printer,
  HeartHandshake,
  Calculator,
  Copy,
  FileSpreadsheet,
  ClipboardCheck,
  Sliders,
  Download,
  AlertTriangle
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { subscribeSystemPlans } from '../services/financialService';
import CheckoutModal from '../components/CheckoutModal';
import ChangelogModal from '../components/ChangelogModal';
import { APP_VERSION } from '../version';

export default function LandingPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState('anual'); // 'mensal' | 'anual'
  const [activeShowcaseTab, setActiveShowcaseTab] = useState('evolucao'); // 'evolucao' | 'lme' | 'boletim' | 'ktv' | 'dialise' | 'heparina' | 'receituario' | 'exames' | 'exportacao'
  const [openFaq, setOpenFaq] = useState(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  
  // Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  const [isChangelogOpen, setIsChangelogOpen] = useState(false);

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

  const handleCopyDemoSnippet = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2200);
    }
  };

  const faqs = [
    {
      q: "O Nex-Ai.NEFRO é exclusivo para médicos nefrologistas?",
      a: "Sim. Toda a arquitetura clínica, os parâmetros de cálculo (Kt/V de Daugirdas, cinética de ureia), as tabelas laboratoriais (PTH, Fósforo, Ferritina, IST), o controle de heparina, o laudo LME do SUS e a evolução mensal em 12 domínios foram desenhados especificamente para a rotina do nefrologista e clínicas de diálise."
    },
    {
      q: "Como funciona a Evolução Mensal Inteligente e Simplificada?",
      a: "Com 1 clique, o sistema compila os 12 domínios clínicos obrigatórios (adequação dialítica, anemia, distúrbio mineral ósseo, acesso vascular, intercorrências, sorologias periódicas e conduta) cruzando o histórico de exames e sessões. Conta com Checklist de Conformidade para apontar pendências e botão de cópia instantânea para colar no prontuário hospitalar (TASY, MV, PEP), além de impressão formal em folha A4."
    },
    {
      q: "O sistema emite o formulário LME do SUS para medicamentos de alto custo?",
      a: "Sim! O Nex-Ai.NEFRO possui gerador integrado de LME (Laudo de Solicitação, Avaliação e Autorização de Medicamento do Componente Especializado) totalmente formatado no padrão oficial do SUS e Farmácia de Minas (SES-MG). O sistema pré-preenche automaticamente os dados do paciente, código CID-10, posologia, exames obrigatórios e audita os critérios do PCDT para Alfaepoetina, Sacarato de Hidróxido Férrico, Calcitriol, Paricalcitol, Cinacalcet e Sevelamer."
    },
    {
      q: "O que é o Novo Boletim com Letramento Visual para o paciente?",
      a: "É uma ferramenta humanizada de educação e adesão ao tratamento dialítico. O médico pode gerar tanto o Boletim Clínico quanto o inovador Boletim Visual Lúdico, que usa semáforos, figuras de órgãos (Coração para Potássio, Sangue para Hemoglobina, Ossos para Fósforo e Filtro para Kt/V) e carinhas para traduzir exames complexos para idosos ou pacientes com pouca escolaridade, acompanhado de orientações dietéticas e guia de medicamentos com horários."
    },
    {
      q: "O sistema possui Calculadora Clínica de Kt/V integrada?",
      a: "Sim. O Nex-Ai.NEFRO conta com calculadora nativa de spKt/V de 2ª geração pelo método de Daugirdas e Taxa de Redução de Ureia (URR). Basta informar as ureias pré e pós e os pesos da sessão para obter o resultado instantâneo com sinalizadores de adequação conforme as diretrizes da SBN e KDIGO, com opção de salvar direto no histórico do paciente."
    },
    {
      q: "Como funciona a Avaliação Gratuita de 7 Dias?",
      a: "Você se cadastra em menos de 1 minuto sem precisar informar cartão de crédito. Sua conta é liberada imediatamente com o sistema pronto para você cadastrar seus pacientes e testar evoluções clínicas, laudos LME, prescrições e gráficos laboratoriais na sua rotina real."
    },
    {
      q: "Vocês possuem uma Conta de Demonstração com dados já preenchidos?",
      a: "Sim! Se você quiser explorar o Nex-Ai.NEFRO com pacientes, sessões de hemodiálise, laudos LME, relatórios e históricos de exames já preenchidos sem precisar digitar nada, disponibilizamos uma Conta de Demonstração completa com dados fictícios. Basta nos chamar no WhatsApp pelo botão da página que liberamos o acesso imediatamente."
    },
    {
      q: "Meus dados e os prontuários dos pacientes ficam seguros?",
      a: "Totalmente. O sistema foi desenvolvido e é hospedado com Tecnologia Google em nuvem de alta segurança, com criptografia em trânsito e repouso, atendendo rigorosamente à Lei Geral de Proteção de Dados (LGPD) e às resoluções do CFM (Conselho Federal de Medicina nº 1.821/2007 e 2.299/2021)."
    },
    {
      q: "Como funciona a Migração e Importação Inicial no Plano Anual?",
      a: "Quem assina o Plano Anual recebe Implantação VIP gratuita: nossa equipe técnica cadastra todos os seus pacientes e o histórico de exames laboratoriais a partir dos seus arquivos em PDF ou planilhas em Excel (XLS). Você não perde horas digitando tudo do zero e já começa a atender com prontuários completos desde o primeiro dia!"
    },
    {
      q: "O receituário atende às normas da ANVISA para medicamentos controlados e antimicrobianos?",
      a: "Sim. O sistema gera automaticamente o receituário oficial em 2 vias (1ª Via da Farmácia/Retenção e 2ª Via do Paciente) em conformidade com a Portaria SVS/MS nº 344/98 e a RDC ANVISA nº 20/2011, além de campos padronizados para identificação do comprador e fornecedor."
    }
  ];

  return (
    <div style={{ background: '#f8fafc', color: '#0f172a', minHeight: '100vh', fontFamily: 'inherit', width: '100%', maxWidth: '100vw', overflowX: 'hidden', position: 'relative' }}>
      
      {/* ================= HEADER FIXO / NAVBAR ================= */}
      <nav 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1000, 
          background: 'rgba(255, 255, 255, 0.88)', 
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', width: '100%', boxSizing: 'border-box' }}>
          {/* Logo */}
          <div style={{ flexShrink: 1, minWidth: 0 }}>
            <BrandLogo 
              size="md"
              versionBadge={`v${APP_VERSION}`}
              subtitle="Software Médico Especializado"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          </div>

          {/* Links Centrais */}
          <div className="hidden md:flex items-center gap-6" style={{ fontSize: '0.88rem', fontWeight: '600', color: '#475569' }}>
            <a href="#funcionalidades" className="hover:text-blue-600 transition" style={{ textDecoration: 'none', color: 'inherit' }}>Funcionalidades</a>
            <a href="#telas" className="hover:text-blue-600 transition" style={{ textDecoration: 'none', color: 'inherit' }}>Telas</a>
            <a href="#seguranca" className="hover:text-blue-600 transition" style={{ textDecoration: 'none', color: 'inherit' }}>Segurança</a>
            <a href="#planos" className="hover:text-blue-600 transition" style={{ textDecoration: 'none', color: 'inherit' }}>Planos</a>
            <a href="#faq" className="hover:text-blue-600 transition" style={{ textDecoration: 'none', color: 'inherit' }}>Dúvidas</a>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
            <button 
              type="button" 
              onClick={() => navigate('/login')}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem', fontWeight: '600', minHeight: '36px' }}
            >
              Entrar
            </button>
            <button 
              type="button" 
              onClick={handleStartTrial}
              className="btn btn-primary"
              style={{ 
                fontSize: '0.82rem', 
                padding: '0.45rem 0.85rem', 
                fontWeight: 'bold', 
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                minHeight: '36px',
                whiteSpace: 'nowrap'
              }}
            >
              <span className="hidden sm:inline">Testar 7 Dias Grátis</span>
              <span className="sm:hidden">Testar Grátis</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section style={{ padding: 'clamp(2.5rem, 5vw, 4.5rem) 1rem 2.5rem', background: 'radial-gradient(ellipse at top, rgba(239, 246, 255, 0.95) 0%, rgba(248, 250, 252, 0.5) 100%)', width: '100%', boxSizing: 'border-box' }}>
        <div className="container" style={{ maxWidth: '1100px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Badge de Destaque */}
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(219, 234, 254, 0.8)', 
              border: '1px solid #bfdbfe', 
              padding: '6px 14px', 
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#1d4ed8',
              marginBottom: '1.25rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
              maxWidth: '100%'
            }}
          >
            <Sparkles size={14} color="#2563eb" style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'normal', textAlign: 'center' }}>Exclusivo para Nefrologistas e Clínicas de Diálise</span>
          </div>

          {/* Headline Principal */}
          <h1 
            style={{ 
              fontSize: 'clamp(1.75rem, 4.5vw, 3.2rem)', 
              fontWeight: '900', 
              lineHeight: 1.18, 
              letterSpacing: '-0.03em', 
              color: '#0f172a', 
              marginBottom: '1.25rem',
              maxWidth: '920px',
              margin: '0 auto 1.25rem',
              wordBreak: 'break-word',
              overflowWrap: 'break-word'
            }}
          >
            O Prontuário Inteligente que revoluciona sua rotina de <span style={{ background: 'linear-gradient(135deg, #2563eb, #0284c7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Hemodiálise e Nefrologia</span>
          </h1>

          {/* Sub-headline */}
          <p 
            style={{ 
              fontSize: 'clamp(0.95rem, 2.2vw, 1.15rem)', 
              color: '#475569', 
              maxWidth: '780px', 
              margin: '0 auto 2rem', 
              lineHeight: 1.6,
              padding: '0 0.5rem'
            }}
          >
            Evolução mensal simplificada em 12 domínios, laudos de LME no padrão oficial do SUS, novo boletim com letramento visual e calculadora de Kt/V — <strong>100% em nuvem e seguro</strong>.
          </p>

          {/* CTAs */}
          <div className="flex justify-center items-center gap-3 flex-wrap mb-4" style={{ width: '100%' }}>
            <button 
              type="button" 
              onClick={handleStartTrial}
              className="btn btn-primary"
              style={{ 
                padding: '0.85rem 1.6rem', 
                fontSize: '0.96rem', 
                fontWeight: 'bold', 
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                maxWidth: '100%'
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
                borderColor: '#cbd5e1',
                maxWidth: '100%'
              }}
            >
              Conhecer as Telas
            </a>
          </div>

          {/* Micro Prova Social */}
          <div className="flex justify-center items-center gap-4 sm:gap-6 mt-4 text-xs font-semibold text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={15} color="#16a34a" /> Sem cartão</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={15} color="#16a34a" /> Ativação Imediata</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={15} color="#16a34a" /> LME Padrão SUS</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={15} color="#16a34a" /> LGPD e CFM</span>
          </div>

          {/* Preview Hero / Mockup do Painel */}
          <div 
            style={{ 
              marginTop: '2.5rem', 
              position: 'relative',
              borderRadius: '20px',
              padding: '6px',
              background: 'linear-gradient(135deg, #cbd5e1, #e2e8f0)',
              boxShadow: '0 20px 50px -15px rgba(15, 23, 42, 0.25)',
              maxWidth: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <div 
              style={{ 
                background: '#ffffff', 
                borderRadius: '16px', 
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                width: '100%',
                maxWidth: '100%'
              }}
            >
              {/* Header do Mockup Browser */}
              <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                <div style={{ marginLeft: '0.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px 10px', fontSize: '0.70rem', color: '#64748b', fontWeight: '500', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  https://nexai-nefro.web.app/doctor
                </div>
              </div>

              {/* Conteúdo Ilustrativo da Tela do Médico */}
              <div style={{ padding: '1rem 0.85rem', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}>
                {/* Header Interno do Mockup */}
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-left" style={{ minWidth: 0 }}>
                    <div style={{ padding: '6px', background: '#dbeafe', borderRadius: '8px', color: '#2563eb', flexShrink: 0 }}>
                      <Stethoscope size={18} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong className="text-xs sm:text-sm block text-slate-800 truncate">Painel do Nefrologista • Dr. Marcelo</strong>
                      <span className="text-[11px] text-muted block truncate">Clínica Renalis • 60 Pacientes em 3 Clínicas</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '2px 7px', borderRadius: '6px', fontWeight: 'bold' }}>
                      🟢 Online
                    </span>
                  </div>
                </div>

                {/* Barra de Filtros & Triagem Rápida */}
                <div className="mobile-scroll-row flex items-center gap-1.5 mb-3 text-xs" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
                  <span style={{ background: '#2563eb', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>Todas as Unidades (60)</span>
                  <span style={{ background: '#e2e8f0', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: '600', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>1º Turno (20)</span>
                  <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.72rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <FileText size={11} /> Evoluções Mensais (2)
                  </span>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.72rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Award size={11} /> LME SUS a Renovar (1)
                  </span>
                  <span style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', fontSize: '0.72rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Syringe size={11} /> Sem Heparina (1)
                  </span>
                </div>

                {/* Cards de Pacientes Mockup */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '0.85rem', textAlign: 'left' }}>
                  
                  {/* Card 1 */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm" style={{ width: '100%', boxSizing: 'border-box' }}>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div style={{ minWidth: 0 }}>
                        <strong className="text-xs sm:text-sm block text-slate-900 truncate">AMÉLIA SILVA</strong>
                        <span className="text-[11px] text-muted block truncate">68 anos • FAV (MSE) • 3º Turno</span>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', padding: '2px 5px', borderRadius: '5px', fontWeight: 'bold' }}>
                          Ativo
                        </span>
                        <span style={{ fontSize: '0.62rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <Syringe size={9} /> Heparina 1000+500/h
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.72rem', background: '#f8fafc', padding: '6px 8px', borderRadius: '8px' }}>
                      <div>Hb: <strong>11.4 g/dL</strong></div>
                      <div>PTH: <strong style={{ color: '#d97706' }}>380 pg/mL</strong></div>
                      <div>spKt/V: <strong style={{ color: '#16a34a' }}>1.48 (OK)</strong></div>
                      <div>Peso Seco: <strong>64.5 kg</strong></div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 flex-wrap">
                      <span style={{ fontSize: '0.62rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        ✓ Evolução Pronta
                      </span>
                      <span style={{ fontSize: '0.62rem', background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        ✓ LME Ativo (EPO)
                      </span>
                      <span style={{ fontSize: '0.62rem', background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        ✓ Boletim Visual
                      </span>
                    </div>
                  </div>

                  {/* Card 2 (visível em telas sm ou maiores) */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hidden sm:block" style={{ width: '100%', boxSizing: 'border-box' }}>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div style={{ minWidth: 0 }}>
                        <strong className="text-xs sm:text-sm block text-slate-900 truncate">ADCÉLIO PEREIRA</strong>
                        <span className="text-[11px] text-muted block truncate">54 anos • Permcath Luer-Lock • 1º Turno</span>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#b45309', padding: '2px 5px', borderRadius: '5px', fontWeight: 'bold' }}>
                          Alerta Exame
                        </span>
                        <span style={{ fontSize: '0.62rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '1px 5px', borderRadius: '5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <Syringe size={9} /> Sem Heparina
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.72rem', background: '#f8fafc', padding: '6px 8px', borderRadius: '8px' }}>
                      <div>Hb: <strong style={{ color: '#dc2626' }}>9.2 g/dL</strong></div>
                      <div>Fósforo: <strong style={{ color: '#dc2626' }}>6.8 mg/dL</strong></div>
                      <div>spKt/V: <strong>1.28</strong></div>
                      <div>Prescrição: <strong style={{ color: '#2563eb' }}>EPO + Ferro</strong></div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 flex-wrap">
                      <span style={{ fontSize: '0.62rem', background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        🏛️ LME Elegível (PCDT)
                      </span>
                      <span style={{ fontSize: '0.62rem', background: '#f3e8ff', color: '#7c3aed', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        🧮 Kt/V Calculado
                      </span>
                    </div>
                  </div>

                  {/* Card 3 (visível em telas md ou maiores) */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm hidden md:block" style={{ width: '100%', boxSizing: 'border-box' }}>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div style={{ minWidth: 0 }}>
                        <strong className="text-xs sm:text-sm block text-slate-900 truncate">CARLOS EDUARDO</strong>
                        <span className="text-[11px] text-muted block truncate">61 anos • FAV (MSD) • 2º Turno</span>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', padding: '2px 5px', borderRadius: '5px', fontWeight: 'bold' }}>
                          Ativo
                        </span>
                        <span style={{ fontSize: '0.62rem', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', padding: '1px 5px', borderRadius: '5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <Syringe size={9} /> Enoxaparina 40mg
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.72rem', background: '#f8fafc', padding: '6px 8px', borderRadius: '8px' }}>
                      <div>Hb: <strong>12.0 g/dL</strong></div>
                      <div>PTH: <strong>210 pg/mL</strong></div>
                      <div>spKt/V: <strong style={{ color: '#16a34a' }}>1.55</strong></div>
                      <div>Ciclo: <strong>Calcitriol Ativo</strong></div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 flex-wrap">
                      <span style={{ fontSize: '0.62rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        ✓ 100% Conforme
                      </span>
                      <span style={{ fontSize: '0.62rem', background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                        🌟 Boletim Entregue
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* ================= CALLOUT CONTA DEMONSTRAÇÃO COM DADOS FICTÍCIOS ================= */}
          <div 
            style={{ 
              marginTop: '2rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              border: '1.5px solid #86efac',
              borderRadius: '20px',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 8px 24px rgba(22, 163, 74, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              textAlign: 'left',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ flex: '1 1 300px', minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '800', marginBottom: '0.4rem' }}>
                <Sparkles size={12} color="#16a34a" />
                <span>EXPERIMENTE COM DADOS PRÉ-PREENCHIDOS</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0', letterSpacing: '-0.01em' }}>
                Quer ver o prontuário já funcionando na prática?
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                No teste grátis, o sistema vem limpo para seus dados. Mas se você quiser ver como o Nex-Ai.NEFRO fica com <strong>pacientes, laudos de LME, evoluções mensais e gráficos laboratoriais já preenchidos</strong>, solicite o acesso à nossa <strong>Conta de Demonstração</strong> via WhatsApp!
              </p>
            </div>

            <div style={{ flexShrink: 0, width: '100%', maxWidth: '320px' }}>
              <a
                href="https://wa.me/5531987624789?text=Ol%C3%A1!%20Gostaria%20de%20acessar%20a%20Conta%20de%20Demonstra%C3%A7%C3%A3o%20com%20dados%20fict%C3%ADcios%20do%20Nex-Ai.NEFRO%20para%20conhecer%20o%20sistema."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#ffffff',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                  transition: 'transform 0.15s ease',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <MessageCircle size={18} />
                <span>Pedir Acesso Demonstração</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ================= SEÇÃO DE DIFERENCIAIS & RECURSOS ================= */}
      <section id="funcionalidades" style={{ padding: '5rem 1.5rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '1100px' }}>
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Por que migrar para o Nex-Ai.NEFRO?</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1" style={{ letterSpacing: '-0.02em' }}>
              Projetado para eliminar planilhas lentas e prontuários genéricos
            </h2>
            <p className="text-muted text-sm max-w-2xl mx-auto mt-2">
              Prontuários hospitalares genéricos não entendem de cinética de ureia, LME, fluxo de sangue e distúrbio mineral. O Nex-Ai.NEFRO nasceu focado na nefrologia.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Card 1: Evolução Mensal Simplificada */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FileText size={22} />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-bold text-base text-slate-900 m-0">Evolução Mensal Simplificada</h3>
                <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Novo</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Geração em 1 clique dos 12 domínios clínicos SBN e KDIGO, com Checklist de Conformidade de prontuário, impressão formal A4 e botão de cópia rápida para sistemas hospitalares.
              </p>
            </div>

            {/* Card 2: LME Padrão SUS */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Award size={22} />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-bold text-base text-slate-900 m-0">LME Padrão SUS</h3>
                <span style={{ fontSize: '0.68rem', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Novo</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emissão oficial do Laudo de Solicitação de Medicamento Especializado com validação em tempo real dos critérios do PCDT para Alfaepoetina, Ferro, Calcitriol, Paricalcitol e Cinacalcet.
              </p>
            </div>

            {/* Card 3: Boletim Educativo Visual */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <HeartHandshake size={22} />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-bold text-base text-slate-900 m-0">Boletim Educativo Visual</h3>
                <span style={{ fontSize: '0.68rem', background: '#fef3c7', color: '#b45309', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Novo</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Transforme dados laboratoriais complexos em figuras de órgãos, semáforos e carinhas com linguagem empática, melhorando a adesão ao tratamento dialítico e à dieta na família.
              </p>
            </div>

            {/* Card 4: Calculadora de Kt/V */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f5f3ff', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Calculator size={22} />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-bold text-base text-slate-900 m-0">Calculadora de Kt/V</h3>
                <span style={{ fontSize: '0.68rem', background: '#ede9fe', color: '#6d28d9', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Novo</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cálculo instantâneo de spKt/V de 2ª geração pelo método de Daugirdas e Taxa de Redução de Ureia (URR) a partir das ureias e pesos da sessão com metas da SBN.
              </p>
            </div>

            {/* Card 5: Importador Inteligente */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FileUp size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Importador Inteligente de Laudos</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Extração automática de exames laboratoriais a partir de arquivos PDF, planilhas Excel (XLSX) e DOCX, com homologação para laboratórios de referência (DB, Labicon, Pardini, Alvaro).
              </p>
            </div>

            {/* Card 6: Receituário 2 Vias */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f5f3ff', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FileCheck size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Receituário Oficial em 2 Vias</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emissão instantânea de Receita Simples, Antimicrobianos e Controle Especial em 2 vias (com retenção de farmácia e via do paciente) em folha timbrada A4 ou PDF vetorial.
              </p>
            </div>

            {/* Card 7: Heparina */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Syringe size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Anticoagulação e Heparina</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Controle individual de dose de ataque e manutenção, Enoxaparina e modo Sem Heparina com alertas visuais preventivos contra coagulação de linhas e sangramentos.
              </p>
            </div>

            {/* Card 8: Transplante Renal */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Activity size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Transplante Renal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Acompanhe a elegibilidade do paciente para inscrição em lista de espera e gere o Laudo de Encaminhamento ao Transplante Renal pré-formatado para os centros transplantadores.
              </p>
            </div>

            {/* Card 9: Painel Laboratorial */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <BarChart3 size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Painel Laboratorial e DMO</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Acompanhe a curva histórica de PTH, Fósforo, Cálcio, Ferritina, IST e Kt/V com indicadores visuais de adequação conforme as diretrizes da SBN e KDIGO.
              </p>
            </div>

            {/* Card 10: Prescrição com Ciclos */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Pill size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Prescrição com Gestão de Ciclos</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Controle doses e término de ciclos de Sacarato de Hidróxido Férrico, Alfaepoetina e Paricalcitol com alertas automáticos de vencimento e suspensão.
              </p>
            </div>

            {/* Card 11: Acesso Vascular */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <HeartPulse size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-1.5">Gestão de Acessos Vasculares</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Controle individualizado de FAV (agulhas 15G, 16G, 17G), Permcath (Luer-Lock) e Próteses PTFE com data de confecção, membro, fluxo efetivo Qb e intervenções.
              </p>
            </div>

            {/* Card 12: Portabilidade */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FileSpreadsheet size={22} />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="font-bold text-base text-slate-900 m-0">Portabilidade e Exportação Total</h3>
                <span style={{ fontSize: '0.68rem', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>Novo</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero lock-in: exporte todos os prontuários, exames, históricos e evoluções em planilhas Excel (XLSX) multi-abas ou dossiês completos em PDF a qualquer momento.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ================= SHOWCASE DE TELAS INTERATIVO ================= */}
      <section id="telas" style={{ padding: 'clamp(2.5rem, 5vw, 5rem) 1rem', background: '#f8fafc', width: '100%', boxSizing: 'border-box' }}>
        <div className="container" style={{ maxWidth: '1100px', width: '100%', boxSizing: 'border-box' }}>
          
          <div className="text-center mb-6 sm:mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Demonstração Visual</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1" style={{ letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
              Veja como o sistema funciona na prática
            </h2>
            <p className="text-muted text-xs sm:text-sm max-w-xl mx-auto mt-2">
              Selecione as abas abaixo para explorar os novos módulos e telas do prontuário nefrológico.
            </p>
          </div>

          {/* Abas Interativas com Scroll Suave no Mobile (Regra de Poucas Palavras: 1 palavra por aba) */}
          <div className="mobile-tabs-scroll flex justify-start sm:justify-center gap-2 mb-6" style={{ overflowX: 'auto', paddingBottom: '6px', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('evolucao')}
              className={`btn ${activeShowcaseTab === 'evolucao' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              📝 Evolução
            </button>
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('lme')}
              className={`btn ${activeShowcaseTab === 'lme' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              🏛️ LME
            </button>
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('boletim')}
              className={`btn ${activeShowcaseTab === 'boletim' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              🌟 Boletim
            </button>
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('ktv')}
              className={`btn ${activeShowcaseTab === 'ktv' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              🧮 Calculadora
            </button>
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('dialise')}
              className={`btn ${activeShowcaseTab === 'dialise' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              🩺 Sessão
            </button>
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('heparina')}
              className={`btn ${activeShowcaseTab === 'heparina' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              💉 Anticoagulação
            </button>
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('receituario')}
              className={`btn ${activeShowcaseTab === 'receituario' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              📋 Receita
            </button>
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('exames')}
              className={`btn ${activeShowcaseTab === 'exames' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              🧪 Exames
            </button>
            <button 
              type="button"
              onClick={() => setActiveShowcaseTab('exportacao')}
              className={`btn ${activeShowcaseTab === 'exportacao' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', borderRadius: '12px', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              📦 Exportação
            </button>
          </div>

          {/* Card da Tela Ativa */}
          <div className="glass-panel" style={{ background: '#ffffff', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 15px 35px rgba(0,0,0,0.05)', width: '100%', boxSizing: 'border-box' }}>
            
            {/* ================= ABA EVOLUÇÃO MENSAL ================= */}
            {activeShowcaseTab === 'evolucao' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">Evolução Médica Mensal Inteligente</h3>
                    <p className="text-xs text-muted">Compilação automatizada dos 12 domínios clínicos SBN e KDIGO com auditoria de conformidade</p>
                  </div>
                  <span style={{ fontSize: '0.70rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Padrão SBN KDIGO
                  </span>
                </div>

                {/* Header do Mockup de Evolução */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-3 flex justify-between items-center flex-wrap gap-2">
                  <div className="text-xs">
                    <strong className="text-slate-900 text-sm block">AMÉLIA SILVA • 68 anos</strong>
                    <span className="text-slate-600">Tempo de Diálise: 2 anos e 7 meses • FAV em MSE • Rádio-cefálica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={12} /> Prontuário 100% Conforme
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyDemoSnippet("EVOLUÇÃO MÉDICA MENSAL - HEMODIÁLISE\nPaciente: AMÉLIA SILVA\nKt/V sp: 1.48 (Adequado)\nHb: 11.4 g/dL | PTH: 380 pg/mL | P: 4.8 mg/dL\nConduta: Manter parâmetros dialíticos vigentes. Concluído ciclo de sacarato férrico.")}
                      className="btn btn-outline"
                      style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Copy size={12} />
                      <span>{copiedSnippet ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>

                {/* Grid dos 3 Pilares Clínicos da Evolução */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1.5 text-blue-700 font-bold text-xs">
                      <HeartPulse size={14} />
                      <span>1. Acesso e Hemodinâmica</span>
                    </div>
                    <p className="text-xs text-slate-700 m-0 leading-relaxed">
                      FAV madura em MSE com bom frêmito contínuo, punção com agulha 16G, fluxo efetivo Qb 350 mL/min sem recirculação. PA pré 135x80 e pós 120x80 mmHg. Ganho interdialítico médio de 1.8 kg (2.8% do peso seco de 64.5 kg).
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1.5 text-emerald-700 font-bold text-xs">
                      <BarChart3 size={14} />
                      <span>2. Adequação e Laboratório</span>
                    </div>
                    <p className="text-xs text-slate-700 m-0 leading-relaxed">
                      spKt/V de 1.48 (meta &gt; 1.20) e URR de 71%. Hemoglobina 11.4 g/dL estável com Alfaepoetina 4.000 UI 3x/sem pós-HD. Metabolismo ósseo em alvo terapêutico: PTH 380 pg/mL, Fósforo 4.8 mg/dL e Cálcio Corrigido 9.1 mg/dL.
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1.5 text-indigo-700 font-bold text-xs">
                      <FileCheck size={14} />
                      <span>3. Conduta Terapêutica</span>
                    </div>
                    <p className="text-xs text-slate-700 m-0 leading-relaxed">
                      Manter prescrição dialítica de 4h em capilar de alto fluxo. Encerrado ciclo de ferro EV pós 5ª ampola de Noripurum. Manter Sevelamer 800mg mastigado às refeições. Paciente ativa em lista única de transplante renal.
                    </p>
                  </div>
                </div>

                {/* Box de Cópia Pronta para Prontuário Hospitalar */}
                <div style={{ background: '#0f172a', color: '#e2e8f0', padding: '0.85rem 1rem', borderRadius: '12px', fontSize: '0.72rem', fontFamily: 'monospace', lineHeight: '1.5' }}>
                  <div className="flex justify-between items-center mb-1 text-slate-400 border-b border-slate-800 pb-1">
                    <span>TEXTO PRONTO PARA COLAR NO PRONTUÁRIO HOSPITALAR (TASY / MV / PEP)</span>
                    <span className="text-emerald-400">1 Clique</span>
                  </div>
                  <div style={{ maxHeight: '80px', overflowY: 'auto' }}>
                    [EVOLUÇÃO MÉDICA MENSAL - HEMODIÁLISE] DRC 5D (Nefropatia Diabética). TRS há 31 meses. FAV MSE rádio-cefálica (Qb 350 ml/min, agulha 16G). spKt/V 1.48 (OK). Hb 11.4 g/dL. PTH 380 pg/mL, P 4.8 mg/dL, CaCorr 9.1 mg/dL. Sorologias anuais não reagentes. Conduta: Manter HD 3x4h; encerrar ciclo de Noripurum; renovar LME de Alfaepoetina. Dr. Marcelo Ramos • CRM-SP 654321
                  </div>
                </div>
              </div>
            )}

            {/* ================= ABA LME PADRÃO SUS ================= */}
            {activeShowcaseTab === 'lme' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">Laudo de Medicamento Especializado (LME SUS)</h3>
                    <p className="text-xs text-muted">Formulário oficial CEAF e Farmácia de Minas (SES-MG) com auditoria em tempo real das regras do PCDT</p>
                  </div>
                  <span style={{ fontSize: '0.70rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Padrão Oficial SUS
                  </span>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  {/* Topo do Formulário com Brasão e Logo SUS */}
                  <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-slate-300">
                    <div className="flex items-center gap-2">
                      <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                        <Award size={18} />
                      </div>
                      <div>
                        <strong className="text-xs text-slate-900 block font-black">MINISTÉRIO DA SAÚDE • SISTEMA ÚNICO DE SAÚDE</strong>
                        <span className="text-[10px] text-slate-500">Componente Especializado da Assistência Farmacêutica (CEAF / SES-MG)</span>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">
                      Protocolo PCDT Anemia na DRC
                    </span>
                  </div>

                  {/* Checklist PCDT em Tempo Real */}
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg mb-3 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <CheckCircle2 size={15} color="#16a34a" />
                      <span>Critérios do PCDT Aprovados Automaticamente:</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-emerald-700 font-semibold">
                      <span>✓ Hb 9.4 g/dL (&lt; 10.0)</span>
                      <span>✓ Ferritina 340 ng/mL (&gt; 100)</span>
                      <span>✓ IST 28% (&gt; 20%)</span>
                    </div>
                  </div>

                  {/* Grid de Dados Oficiais Pré-Preenchidos */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.65rem', fontSize: '0.74rem', background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Paciente</span>
                      <strong className="text-slate-900">AMÉLIA SILVA (CNS: 7000.1234.5678)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Medicamento Solicitado</span>
                      <strong className="text-blue-700">Alfaepoetina 4.000 UI Frasco-Ampola</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Posologia e Quantidade</span>
                      <strong className="text-slate-900">12 ampolas/mês (Total 6 meses: 72)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Diagnóstico e CID-10</span>
                      <strong className="text-slate-900">DRC Estágio 5D • CID N18.0</strong>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500 flex-wrap gap-2">
                    <span>Médico Solicitante: Dr. Marcelo Ramos • CRM-MG 65432 • CNS: 9800.1234.5678</span>
                    <div className="flex gap-3">
                      <span className="text-blue-600 font-semibold flex items-center gap-1"><Printer size={13} /> Impressão Direta</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1"><FileCheck size={13} /> PDF Idêntico ao SUS</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= ABA NOVO BOLETIM ================= */}
            {activeShowcaseTab === 'boletim' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">Novo Boletim com Letramento Visual</h3>
                    <p className="text-xs text-muted">Comunicação humanizada com órgãos ilustrados, semáforos e carinhas para adesão da família</p>
                  </div>
                  <span style={{ fontSize: '0.70rem', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Letramento em Saúde
                  </span>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200 rounded-xl">
                  <div className="text-center pb-2 mb-3 border-b border-blue-200">
                    <strong className="text-base text-slate-900 block font-bold">🌟 Boletim de Saúde de Amélia Silva</strong>
                    <span className="text-xs text-slate-600">Acompanhamento humanizado do tratamento de hemodiálise • Setembro de 2026</span>
                  </div>

                  {/* 4 Cards Lúdicos com Semáforos e Órgãos */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.65rem', marginBottom: '0.85rem' }}>
                    {/* Coração */}
                    <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm text-center">
                      <span className="text-2xl block mb-1">❤️</span>
                      <strong className="text-xs text-red-800 block">Coração (Potássio)</strong>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-0.5 inline-block">😃 4.8 (Tudo Certo!)</span>
                      <p className="text-[10px] text-slate-500 m-0 mt-1">Ritmo calmo e protegido. Parabéns por evitar banana e água de coco em excesso.</p>
                    </div>

                    {/* Sangue */}
                    <div className="bg-white p-3 rounded-lg border border-rose-200 shadow-sm text-center">
                      <span className="text-2xl block mb-1">🩸</span>
                      <strong className="text-xs text-rose-800 block">Sangue (Hemoglobina)</strong>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-0.5 inline-block">😃 11.4 (Forte!)</span>
                      <p className="text-[10px] text-slate-500 m-0 mt-1">Muita energia e disposição. Continue com as aplicações em dia na máquina.</p>
                    </div>

                    {/* Ossos */}
                    <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-sm text-center">
                      <span className="text-2xl block mb-1">🦴</span>
                      <strong className="text-xs text-amber-800 block">Ossos (Fósforo)</strong>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-0.5 inline-block">😃 4.6 (Na Meta)</span>
                      <p className="text-[10px] text-slate-500 m-0 mt-1">Artérias protegidas! Continue mastigando o quelante junto com a refeição.</p>
                    </div>

                    {/* Filtro / KtV */}
                    <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm text-center">
                      <span className="text-2xl block mb-1">🫘</span>
                      <strong className="text-xs text-blue-800 block">Filtro (Kt/V)</strong>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-0.5 inline-block">😃 1.48 (Excelente!)</span>
                      <p className="text-[10px] text-slate-500 m-0 mt-1">Seu sangue está sendo muito bem limpo a cada sessão de 4 horas completas.</p>
                    </div>
                  </div>

                  {/* Guia de Remédios Acoplado no Boletim */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs mb-2 flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <Pill size={14} color="#7c3aed" />
                      <strong className="text-slate-900">Guia Prático de Medicamentos:</strong>
                      <span className="text-slate-600">Sevelamer 800mg (1 cp no almoço e 1 no jantar) • Anlodipino 5mg pela manhã</span>
                    </div>
                    <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">Prescrição Integrada</span>
                  </div>

                  {/* Mensagem Humanizada */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                    <strong className="text-slate-900 block mb-0.5">💬 Recado do seu Nefrologista:</strong>
                    <p className="m-0 italic">"Parabéns pelo comprometimento, dona Amélia! O esforço da senhora e da sua família no controle de sal e líquidos nos finais de semana fez toda a diferença neste mês!"</p>
                  </div>
                </div>
              </div>
            )}

            {/* ================= ABA CALCULADORA KTV ================= */}
            {activeShowcaseTab === 'ktv' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">Calculadora Clínica de Kt/V (Daugirdas 2ª Geração)</h3>
                    <p className="text-xs text-muted">Cinética de ureia spKt/V e URR calculados em tempo real com alertas de adequação SBN e KDIGO</p>
                  </div>
                  <span style={{ fontSize: '0.70rem', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Daugirdas spKt/V
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '0.85rem' }}>
                  {/* Entradas Clínicas */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                      <Sliders size={14} color="#2563eb" /> Parâmetros da Sessão
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.74rem' }}>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[11px]">Ureia Pré</span>
                        <strong className="text-slate-900">145 mg/dL</strong>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[11px]">Ureia Pós</span>
                        <strong className="text-slate-900">41 mg/dL</strong>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[11px]">Peso Pré</span>
                        <strong className="text-slate-900">66.4 kg</strong>
                      </div>
                      <div className="bg-white p-2 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[11px]">Peso Pós</span>
                        <strong className="text-slate-900">64.0 kg</strong>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500">
                      Duração: <strong>4.0 h</strong> • Ultrafiltração: <strong className="text-blue-700">2.400 mL</strong>
                    </div>
                  </div>

                  {/* Resultados Calculados */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-xs font-bold text-emerald-900 block mb-2 flex items-center gap-1.5">
                      <Calculator size={14} color="#16a34a" /> Resultado Imediato
                    </span>
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <strong className="text-3xl font-black text-emerald-700">1.48</strong>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded">Adequado (Meta &gt; 1.20)</span>
                    </div>
                    <div className="text-xs text-emerald-800 space-y-1">
                      <div>URR (Taxa Redução Ureia): <strong>71.7%</strong> (Meta &gt; 65%)</div>
                      <div className="text-[11px] text-emerald-700">Depuração dialítica excelente. Clearance de pequenas moléculas dentro das metas internacionais de sobrevida.</div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-emerald-200 flex justify-between items-center text-[11px]">
                      <span className="text-emerald-800 font-semibold">Salvo no prontuário</span>
                      <span className="text-emerald-700 font-bold">✓ Histórico Atualizado</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= ABA SESSÃO / HEMODIÁLISE ================= */}
            {activeShowcaseTab === 'dialise' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">Evolução Clínica de Hemodiálise</h3>
                    <p className="text-xs text-muted">Registro ágil de parâmetros pré, intra e pós-diálise com controle de acesso e UF</p>
                  </div>
                  <span style={{ fontSize: '0.70rem', background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Agilidade Máxima
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.85rem', background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-xs text-muted block">Pressão Pré e Pós</span>
                    <strong className="text-sm sm:text-base text-slate-900">140x90 ➡️ 120x80 mmHg</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-xs text-muted block">Ultrafiltração (UF)</span>
                    <strong className="text-sm sm:text-base text-blue-700">2.400 mL (Adequada)</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-xs text-muted block">Fluxo de Sangue (Qb)</span>
                    <strong className="text-sm sm:text-base text-slate-900">350 mL/min</strong>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-xs text-muted block">Acesso Vascular</span>
                    <strong className="text-sm sm:text-base text-slate-900">FAV MSE • Agulha 16G</strong>
                  </div>
                </div>
              </div>
            )}

            {/* ================= ABA ANTICOAGULAÇÃO ================= */}
            {activeShowcaseTab === 'heparina' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">Segurança de Anticoagulação em Hemodiálise</h3>
                    <p className="text-xs text-muted">Controle rigoroso de heparinização extracorpórea, prevenção de coagulação e alertas de sangramento</p>
                  </div>
                  <span style={{ fontSize: '0.70rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Segurança do Paciente
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.85rem' }}>
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5"><Syringe size={14} color="#2563eb" /> Heparina Não Fracionada</span>
                      <span className="text-[10px] bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-bold">Padrão Diálise</span>
                    </div>
                    <strong className="text-sm block text-blue-950">Ataque: 1.000 UI + Manutenção: 500 UI/h</strong>
                    <span className="text-xs text-blue-700 block mt-1">Interrupção programada 1h antes do término da sessão</span>
                  </div>

                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5"><Syringe size={14} color="#d97706" /> Alerta: Sem Heparina</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">Risco Clínico</span>
                    </div>
                    <strong className="text-sm block text-amber-950">Lavagem com SF 0,9% a cada 30 min</strong>
                    <span className="text-xs text-amber-700 block mt-1">Indicação: FAV recente ou pós-biópsia renal</span>
                  </div>

                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5"><Syringe size={14} color="#4f46e5" /> HBPM (Enoxaparina)</span>
                      <span className="text-[10px] bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded font-bold">Dose Única</span>
                    </div>
                    <strong className="text-sm block text-indigo-950">40 mg no circuito arterial</strong>
                    <span className="text-xs text-indigo-700 block mt-1">Injeção em bolus no início da sessão dialítica</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= ABA RECEITA ================= */}
            {activeShowcaseTab === 'receituario' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Receituário Oficial em 2 Vias</h3>
                    <p className="text-xs text-muted">Emissão rápida de receitas com retenção de farmácia, antimicrobianos e controle especial em folha timbrada A4 ou PDF</p>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Portaria 344 e RDC 20
                  </span>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center pb-2 mb-3 border-b border-blue-900">
                    <div>
                      <strong className="text-sm text-blue-900 block font-black">CLÍNICA RENALIS • NEFROLOGIA E HEMODIÁLISE</strong>
                      <span className="text-[11px] text-slate-500">São Paulo - SP • Dr. Marcelo Ramos • CRM-SP 654321 • RQE 98765</span>
                    </div>
                    <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-md font-bold">
                      1ª VIA FARMÁCIA • 2ª VIA PACIENTE
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900">1. Sacarato de Hidróxido Férrico (Noripurum) 100mg</strong>
                        <p className="text-slate-600 m-0 mt-0.5">Uso: [EV pós-HD] Diluir 1 ampola em 100ml SF 0,9% e infundir na linha venosa 1x por semana.</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">Uso Contínuo (5 ampolas)</span>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <strong className="text-slate-900">2. Ciprofloxacino 500mg</strong>
                        <p className="text-slate-600 m-0 mt-0.5">Uso: [Oral] Tomar 1 comprimido de 12 em 12 horas por 7 dias para infecção de sítio de cateter.</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-bold">14 Comprimidos</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500 flex-wrap gap-2">
                    <span>Identificação de comprador, dados da farmácia e assinatura na base</span>
                    <div className="flex gap-3">
                      <span className="text-blue-600 font-semibold flex items-center gap-1"><Printer size={13} /> Impressão A4 Direta</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1"><FileCheck size={13} /> PDF Vetorial Nativo</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= ABA EXAMES ================= */}
            {activeShowcaseTab === 'exames' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">Metabolismo Ósseo e Anemia</h3>
                    <p className="text-xs text-muted">Controle rigoroso dos principais biomarcadores da DRC estágio 5D com curvas históricas</p>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Diretrizes SBN KDIGO
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '0.75rem' }}>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-xs text-emerald-800 font-semibold block">spKt/V Daugirdas</span>
                    <strong className="text-xl text-emerald-700">1.48</strong>
                    <span className="text-xs text-emerald-600 block mt-0.5">Adequado (&gt; 1.20)</span>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="text-xs text-blue-800 font-semibold block">Hemoglobina (Hb)</span>
                    <strong className="text-xl text-blue-700">11.4 g/dL</strong>
                    <span className="text-xs text-blue-600 block mt-0.5">Alvo: 10 - 12 g/dL</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-xs text-amber-800 font-semibold block">PTH Intacto</span>
                    <strong className="text-xl text-amber-700">380 pg/mL</strong>
                    <span className="text-xs text-amber-600 block mt-0.5">Alvo: 150 - 600 pg/mL</span>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <span className="text-xs text-purple-800 font-semibold block">Ferritina e IST</span>
                    <strong className="text-xl text-purple-700">340 ng/mL • 28%</strong>
                    <span className="text-xs text-purple-600 block mt-0.5">Estoques de ferro OK</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= ABA EXPORTAÇÃO ================= */}
            {activeShowcaseTab === 'exportacao' && (
              <div>
                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900">Portabilidade Total e Exportação de Dados</h3>
                    <p className="text-xs text-muted">Seus dados nunca ficam presos: extraia planilhas Excel estruturadas e relatórios em PDF com 1 clique</p>
                  </div>
                  <span style={{ fontSize: '0.70rem', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                    Zero Lock-in
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-1.5 text-emerald-700 font-bold text-xs">
                        <FileSpreadsheet size={16} />
                        <span>Planilhas Excel Multi-Abas</span>
                      </div>
                      <p className="text-xs text-slate-600 m-0 leading-relaxed">
                        Exportação em formato XLSX com abas separadas para Pacientes, Exames Laboratoriais, Prescrições, Acessos Vasculares e Histórico de Evoluções.
                      </p>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-1.5 text-blue-700 font-bold text-xs">
                        <FileText size={16} />
                        <span>Dossiês Clínicos em PDF</span>
                      </div>
                      <p className="text-xs text-slate-600 m-0 leading-relaxed">
                        Relatórios formais com sumário executivo, logomarca personalizada do médico nefrologista e histórico temporal consolidado para auditorias ou transferências.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-200 pt-2.5 flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <ShieldCheck size={14} color="#16a34a" /> Conforme resoluções do CFM e padrões de interoperabilidade médica
                    </span>
                    <span className="text-blue-700 font-bold">Exportação ilimitada</span>
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
            Segurança Avançada e Conformidade Médica
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
                <strong className="text-sm text-slate-900">Tecnologia Google Cloud</strong>
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
          
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb' }}>
            Planos Transparentes
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginTop: '0.25rem', letterSpacing: '-0.02em' }}>
            Investimento acessível com retorno imediato em produtividade
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '36rem', margin: '0.5rem auto 2rem auto', lineHeight: '1.5' }}>
            Escolha o plano ideal para sua prática nefrológica. Cancele ou altere a qualquer momento.
          </p>

          {/* Toggle Mensal / Anual */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '1rem', 
              marginTop: '1.5rem', 
              marginBottom: '3.5rem' 
            }}
          >
            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: billingCycle === 'mensal' ? '#0f172a' : '#64748b' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '700', color: billingCycle === 'anual' ? '#0f172a' : '#64748b' }}>
                Anual
              </span>
              <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' }}>
                2 MESES GRÁTIS 🔥
              </span>
            </div>
          </div>

          {/* Grid de Cards de Planos */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', 
              gap: '1.5rem', 
              alignItems: 'stretch',
              paddingTop: '1.5rem',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            
            {/* Card 1: Trial 7 Dias */}
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1rem, 2.5vw, 2rem)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'left'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9333ea', display: 'block', marginBottom: '0.5rem' }}>
                  Sem Compromisso
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                  Avaliação Gratuita
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
                  Teste completo por 7 dias para conhecer todos os recursos
                </p>

                <div style={{ marginBottom: '1.75rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1, display: 'block' }}>
                    Grátis
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                    por 7 dias completos
                  </span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: '#334155' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Acesso total a prontuários e sessões</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Evolução Mensal e Laudo LME</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Sem necessidade de cartão de crédito</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Hospedado com Tecnologia Google</span>
                  </li>
                </ul>
              </div>

              <div>
                <button 
                  type="button" 
                  onClick={handleStartTrial}
                  className="btn btn-outline"
                  style={{ 
                    width: '100%', 
                    padding: '0.85rem 1.5rem', 
                    fontSize: '0.95rem', 
                    fontWeight: '700', 
                    borderRadius: '12px' 
                  }}
                >
                  Iniciar Teste Grátis
                </button>
                <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
                  <a
                    href="https://wa.me/5531987624789?text=Ol%C3%A1!%20Gostaria%20de%20acessar%20a%20Conta%20de%20Demonstra%C3%A7%C3%A3o%20com%20dados%20fict%C3%ADcios%20do%20Nex-Ai.NEFRO."
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.74rem', color: '#2563eb', textDecoration: 'none', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>Dúvidas? Teste a Conta Demonstração no WhatsApp</span>
                    <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Card 2: Plano Anual (DESTAQUE) */}
            <div 
              className="featured-plan-card"
              style={{ 
                background: '#ffffff',
                borderRadius: '24px',
                border: '2px solid #2563eb', 
                boxShadow: '0 20px 40px rgba(37, 99, 235, 0.12)',
                padding: 'clamp(1.75rem, 3.5vw, 2.5rem) clamp(1rem, 2.5vw, 2rem)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'left',
                position: 'relative',
                zIndex: 10
              }}
            >
              {/* Badge Topo */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: '-14px', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                  color: '#ffffff', 
                  padding: '6px 18px', 
                  borderRadius: '999px', 
                  fontSize: '0.75rem', 
                  fontWeight: '700',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                }}
              >
                MAIS ESCOLHIDO POR MÉDICOS ⭐
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb', display: 'block', marginBottom: '0.5rem' }}>
                  Melhor Custo-Benefício
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                  Plano Anual
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
                  Economize 2 meses de mensalidade com contratação anual
                </p>

                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#2563eb' }}>R$</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#2563eb', lineHeight: 1, letterSpacing: '-0.03em' }}>
                      {plans.find(p => p.intervalo === 'anual') ? plans.find(p => p.intervalo === 'anual').valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '590,00'}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>/ano</span>
                  </div>
                  <div style={{ display: 'inline-block', fontSize: '0.78rem', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '8px', marginTop: '0.5rem' }}>
                    {plans.find(p => p.intervalo === 'anual') 
                      ? `Equivalente a R$ ${(plans.find(p => p.intervalo === 'anual').valor / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês` 
                      : 'Equivalente a R$ 49,17/mês'}
                  </div>
                </div>

                {/* Bônus Exclusivo de Migração VIP */}
                <div 
                  style={{ 
                    background: 'linear-gradient(135deg, #eff6ff 0%, #ecfdf5 100%)', 
                    border: '1.5px dashed #2563eb', 
                    borderRadius: '14px', 
                    padding: '0.85rem 1rem', 
                    marginBottom: '1.5rem',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1rem' }}>🎁</span>
                    <strong style={{ fontSize: '0.78rem', color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      BÔNUS VIP: Migração Inicial Gratuita
                    </strong>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#1e293b', lineHeight: '1.45', margin: 0 }}>
                    <strong>Cadastramos tudo por você!</strong> Envie seus relatórios em <strong>PDF ou planilhas (XLS)</strong> e nossa equipe técnica importa todos os seus pacientes e históricos de exames. Você já começa atendendo no 1º dia sem perder tempo digitando!
                  </p>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: '#1e293b' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#eff6ff', padding: '7px 10px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                    <Check size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#1d4ed8', fontWeight: '700', fontSize: '0.84rem' }}>
                      Carga Inicial VIP: Importamos seus pacientes e exames via PDF/XLS
                    </span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                    <strong>Evolução Mensal Inteligente com Checklist</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                    <strong>Emissão de LME no Padrão Oficial SUS</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                    <strong>Novo Boletim com Letramento Visual</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                    <strong>Calculadora de Kt/V Integrada (Daugirdas)</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                    <strong>Prontuários e Pacientes Ilimitados</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                    <strong>Receituário em 2 Vias (Portaria 344)</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                    <strong>Portabilidade Total em Excel e PDF</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                    <strong>Suporte VIP prioritário via WhatsApp</strong>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                    <strong>Backup dedicado na nuvem</strong>
                  </li>
                </ul>
              </div>

              <a 
                href="https://www.asaas.com/c/gsye7xf8m2lez8oi"
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  textDecoration: 'none',
                  width: '100%', 
                  padding: '0.95rem 1rem', 
                  fontSize: '0.98rem', 
                  fontWeight: '800', 
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
                  color: '#ffffff',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  whiteSpace: 'normal',
                  textAlign: 'center',
                  lineHeight: '1.25'
                }}
              >
                <span>Assinar Plano Anual</span>
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: '#dbeafe' }}>
                  2 Meses Grátis com Migração VIP Inclusa 🎁
                </span>
              </a>
            </div>

            {/* Card 3: Plano Mensal */}
            <div 
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textAlign: 'left'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>
                  Flexibilidade Total
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                  Plano Mensal
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
                  Acesso completo sem fidelidade ou carência
                </p>

                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' }}>R$</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', lineHeight: 1, letterSpacing: '-0.03em' }}>
                      {plans.find(p => p.intervalo === 'mensal') ? plans.find(p => p.intervalo === 'mensal').valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '89,90'}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>/mês</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                    Cobrança recorrente mensal
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem', color: '#334155' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Prontuários e Pacientes Ilimitados</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Evolução Mensal Simplificada</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Emissão de LME no Padrão SUS</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Novo Boletim do Paciente Visual</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Calculadora de Kt/V Integrada</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Receituário Oficial em 2 Vias</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Portabilidade Total em Excel e PDF</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Check size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                    <span>Cancele quando quiser</span>
                  </li>
                </ul>
              </div>

              <a 
                href="https://www.asaas.com/c/3x8rzpiq9i86a2c9"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ 
                  width: '100%', 
                  padding: '1rem 1.5rem', 
                  fontSize: '0.95rem', 
                  fontWeight: '700', 
                  borderRadius: '14px',
                  whiteSpace: 'normal',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                Assinar Plano Mensal
              </a>
            </div>

          </div>

          {/* Banner de Destaque: Transição e Migração sem Esforço */}
          <div 
            style={{ 
              marginTop: '3rem',
              background: '#ffffff',
              borderRadius: '24px',
              border: '2px solid #bfdbfe',
              boxShadow: '0 12px 32px rgba(37, 99, 235, 0.08)',
              padding: 'clamp(1.25rem, 3vw, 2.25rem) clamp(1rem, 3vw, 2.5rem)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              textAlign: 'left',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ flex: '1 1 280px', minWidth: 0, maxWidth: '100%' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dbeafe', color: '#1e40af', padding: '5px 14px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '0.75rem', maxWidth: '100%' }}>
                <span>🚀 ZERO TRABALHO DE DIGITAÇÃO</span>
              </div>
              <h3 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
                Preocupado com o tempo para cadastrar todos os seus pacientes?
              </h3>
              <p style={{ fontSize: '0.90rem', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                No <strong>Plano Anual</strong>, você não precisa cadastrar nada do zero! Basta nos enviar suas listas ou relatórios em <strong>PDF ou planilhas em Excel (XLS)</strong>. Nossa equipe técnica realiza toda a importação inicial dos seus pacientes e o histórico completo de exames laboratoriais. Você já começa a usar o Nex-Ai.NEFRO com seus prontuários 100% prontos desde o primeiro dia!
              </p>
            </div>

            <div style={{ flexShrink: 0, width: '100%', maxWidth: '380px' }}>
              <a
                href="https://www.asaas.com/c/gsye7xf8m2lez8oi"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  padding: '0.95rem 1.5rem',
                  fontSize: '0.92rem',
                  fontWeight: '800',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  boxSizing: 'border-box',
                  textAlign: 'center'
                }}
              >
                <span>Garantir Plano Anual com Migração Inclusa</span>
                <ArrowRight size={18} style={{ flexShrink: 0 }} />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ================= FAQ ACCORDION ================= */}
      <section id="faq" style={{ padding: '5rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          
          <div className="text-center mb-12">
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb' }}>
              Tire Suas Dúvidas
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginTop: '0.5rem', letterSpacing: '-0.02em' }}>
              Perguntas Frequentes de Médicos
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: isOpen ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                    boxShadow: isOpen ? '0 8px 24px rgba(37, 99, 235, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.02)',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      textAlign: 'left',
                      fontWeight: '700',
                      fontSize: '1.05rem',
                      color: isOpen ? '#1d4ed8' : '#1e293b',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit'
                    }}
                  >
                    <span style={{ paddingRight: '1rem' }}>{faq.q}</span>
                    <div 
                      style={{ 
                        flexShrink: 0, 
                        padding: '6px', 
                        borderRadius: '50%', 
                        background: isOpen ? '#dbeafe' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      {isOpen ? <ChevronUp size={20} color="#2563eb" /> : <ChevronDown size={20} color="#64748b" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div 
                      style={{ 
                        padding: '0 1.5rem 1.25rem 1.5rem', 
                        fontSize: '0.95rem', 
                        color: '#475569', 
                        lineHeight: '1.6', 
                        borderTop: '1px solid #f1f5f9', 
                        paddingTop: '1rem' 
                      }}
                    >
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
      <section style={{ padding: 'clamp(2.5rem, 5vw, 4.5rem) 1rem', background: 'linear-gradient(135deg, #1e40af, #1e3a8a)', color: 'white', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
        <div className="container" style={{ maxWidth: '800px', width: '100%', boxSizing: 'border-box' }}>
          <h2 className="text-2xl sm:text-3xl font-black mb-2" style={{ letterSpacing: '-0.02em', wordBreak: 'break-word' }}>
            Pronto para transformar sua rotina nefrológica?
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm max-w-lg mx-auto mb-6 leading-relaxed">
            Junte-se a nefrologistas que utilizam tecnologia de ponta para cuidar melhor dos seus pacientes em diálise.
          </p>

          <button 
            type="button" 
            onClick={handleStartTrial}
            className="btn py-3 px-6 text-sm font-bold rounded-xl"
            style={{ 
              background: '#ffffff', 
              color: '#1e40af', 
              boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
              maxWidth: '100%',
              whiteSpace: 'normal',
              lineHeight: 1.3
            }}
          >
            Começar Teste Grátis por 7 Dias
          </button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '2rem 1rem', fontSize: '0.75rem', borderTop: '1px solid #1e293b', width: '100%', boxSizing: 'border-box' }}>
        <div className="container" style={{ maxWidth: '1200px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" textColor="light" />
            <span className="hidden sm:inline">• Nefrologia Clínica e Hemodiálise</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="text-slate-400">Tecnologia Google</span>
            <span>•</span>
            <span className="text-slate-400">LGPD e CFM</span>
            <span>•</span>
            <button 
              onClick={() => setIsChangelogOpen(true)}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: '#38bdf8', 
                fontWeight: '600', 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem'
              }}
            >
              <Sparkles size={12} />
              <span>v{APP_VERSION} • Notas de Versão</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ================= BOTÃO FLUTUANTE DE WHATSAPP ================= */}
      <a 
        href="https://wa.me/5531987624789?text=Ol%C3%A1!%20Gostaria%20de%20tirar%20d%C3%BAvidas%20sobre%20o%20software%20Nex-Ai.NEFRO%20e%20conhecer%20a%20Conta%20de%20Demonstra%C3%A7%C3%A3o." 
        target="_blank" 
        rel="noopener noreferrer"
        className="landing-whatsapp-btn"
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

      {/* Modal de Notas de Versão */}
      <ChangelogModal 
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

    </div>
  );
}
