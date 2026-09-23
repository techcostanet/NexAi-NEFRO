import React, { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare, ArrowUpRight, Smartphone, Sparkles, Check } from 'lucide-react';

/**
 * Componente de Instalação PWA Inteligente para Celulares e Tablets
 * Detecta automaticamente dispositivos móveis, Android, iOS / iPadOS e gerencia o prompt nativo ou guia visual.
 */
export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Detecta se já está rodando como PWA instalado (Standalone)
    const standaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. Detecta se é Celular ou Tablet
    const ua = navigator.userAgent || '';
    const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(ua);
    const touchTablet = (navigator.maxTouchPoints > 1 && window.innerWidth <= 1024);
    const detectedMobile = mobileUA || touchTablet;
    setIsMobileOrTablet(detectedMobile);

    // 3. Detecta se é iOS (iPhone / iPad / iPadOS)
    const detectedIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(detectedIOS);

    // 4. Captura o evento nativo 'beforeinstallprompt' em navegadores Chromium (Android / Edge / Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsMobileOrTablet(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Detecta se foi instalado com sucesso
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setShowInstructions(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Se já estiver instalado ou dispensado ou em desktop amplo sem touch, não renderiza o banner fixo
  if (isStandalone || isDismissed || !isMobileOrTablet) {
    return null;
  }

  const handleInstallClick = async () => {
    // Se temos o prompt nativo do Android / Chromium
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsStandalone(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Erro ao acionar prompt nativo:', err);
        setShowInstructions(true);
      }
    } else {
      // No iOS (Safari) ou outros navegadores móveis sem evento nativo
      setShowInstructions(true);
    }
  };

  return (
    <>
      {/* ================= BANNER FLUTUANTE DE INSTALAÇÃO MOBILE ================= */}
      <aside 
        aria-label="Instalação do Aplicativo"
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          right: '16px',
          maxWidth: '480px',
          margin: '0 auto',
          zIndex: 9999,
          background: 'rgba(11, 19, 41, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(59, 130, 246, 0.45)',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5), 0 0 25px rgba(37, 99, 235, 0.3)',
          borderRadius: '20px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          animation: 'pwaSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Ícone 3D e Dados do App */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div 
            style={{ 
              position: 'relative', 
              width: '46px', 
              height: '46px', 
              flexShrink: 0,
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <img 
              src="/icon-192.png" 
              alt="Ícone NexAi-NEFRO" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <strong style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: '800', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                Nex-Ai.NEFRO
              </strong>
              <span style={{ fontSize: '0.62rem', background: '#2563eb', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                APP
              </span>
            </div>
            <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.74rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Instalar na tela de início
            </p>
          </div>
        </div>

        {/* Ações: Instalar + Fechar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Download size={15} />
            <span>Instalar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Fechar aviso"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              border: 'none',
              borderRadius: '10px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </aside>

      {/* ================= MODAL DE INSTRUÇÕES VISUAIS (iOS / SAFARI / GUIA) ================= */}
      {showInstructions && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowInstructions(false)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '460px',
              background: '#ffffff',
              borderRadius: '24px',
              padding: '1.75rem 1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              animation: 'pwaSlideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão de Fechar */}
            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            {/* Cabeçalho */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.25rem' }}>
              <img 
                src="/icon-192.png" 
                alt="NexAi-NEFRO" 
                style={{ width: '54px', height: '54px', borderRadius: '14px', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)' }}
              />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>
                  Instalar Nex-Ai.NEFRO
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Acesso rápido direto da sua tela de início
                </p>
              </div>
            </div>

            {/* Passos Guiados */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
              {isIOS ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Share2 size={20} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                      <strong>1. Toque em Compartilhar</strong>
                      <div style={{ color: '#64748b', fontSize: '0.78rem' }}>No menu inferior ou superior do Safari</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <PlusSquare size={20} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                      <strong>2. Adicionar à Tela de Início</strong>
                      <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Role a lista de ações até encontrar a opção</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={20} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                      <strong>3. Toque em Adicionar</strong>
                      <div style={{ color: '#64748b', fontSize: '0.78rem' }}>No canto superior direito da tela</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Smartphone size={20} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                      <strong>1. Abra o menu do navegador</strong>
                      <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Toque nos três pontinhos (⋮) no canto da tela</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '12px 14px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Download size={20} />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>
                      <strong>2. Selecione "Instalar aplicativo"</strong>
                      <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Ou "Adicionar à tela inicial"</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowInstructions(false)}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '14px',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
