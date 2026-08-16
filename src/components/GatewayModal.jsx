import React, { useState, useEffect } from 'react';
import { X, Save, Building, Loader2 } from 'lucide-react';
import { saveGatewayConfig } from '../services/financialService';

export default function GatewayModal({ isOpen, onClose, currentConfig = {}, adminEmail = 'admin@nefroapp.com', onSaved }) {
  const [formData, setFormData] = useState({
    pix: {
      ativo: true,
      tipoChave: 'CNPJ',
      chavePix: '',
      titular: '',
      banco: ''
    },
    cartao: {
      provedor: 'Asaas',
      ativo: true,
      ambiente: 'sandbox',
      apiKey: '',
      webhookUrl: ''
    },
    regrasCobranca: {
      diasTolerancia: 5,
      suspensaoAutomatica: true,
      notificarEmail: true
    }
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      pix: {
        ativo: currentConfig.pix?.ativo ?? true,
        tipoChave: currentConfig.pix?.tipoChave || 'CNPJ',
        chavePix: currentConfig.pix?.chavePix || '12.345.678/0001-90',
        titular: currentConfig.pix?.titular || 'NexAi Soluções em Saúde LTDA',
        banco: currentConfig.pix?.banco || 'Banco do Brasil / Cora'
      },
      cartao: {
        provedor: currentConfig.cartao?.provedor || 'Asaas',
        ativo: currentConfig.cartao?.ativo ?? true,
        ambiente: currentConfig.cartao?.ambiente || 'sandbox',
        apiKey: currentConfig.cartao?.apiKey || '',
        webhookUrl: currentConfig.cartao?.webhookUrl || 'https://nexai-nefro.web.app/api/webhooks/asaas'
      },
      regrasCobranca: {
        diasTolerancia: currentConfig.regrasCobranca?.diasTolerancia ?? 5,
        suspensaoAutomatica: currentConfig.regrasCobranca?.suspensaoAutomatica ?? true,
        notificarEmail: currentConfig.regrasCobranca?.notificarEmail ?? true
      }
    });
    setError('');
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await saveGatewayConfig(formData, adminEmail);
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar configurações de gateway no Cloud Firestore.');
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
          maxWidth: '580px', 
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '1.75rem', 
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Building size={22} color="#2563eb" />
            <div>
              <h2 className="text-lg font-bold">Configurar Gateways & Pagamentos</h2>
              <span className="text-xs text-muted">Parâmetros de cobrança gravados no Firestore</span>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Seção PIX */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                ⚡ Recebimento via PIX
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                <input 
                  type="checkbox" 
                  checked={formData.pix.ativo}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pix: { ...prev.pix, ativo: e.target.checked }
                  }))}
                />
                <span>Habilitado</span>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.6rem' }}>
              <div>
                <label className="text-xs text-muted block mb-0.5">Tipo de Chave</label>
                <select 
                  className="input-field"
                  value={formData.pix.tipoChave}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pix: { ...prev.pix, tipoChave: e.target.value }
                  }))}
                >
                  <option value="CNPJ">CNPJ</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Telefone">Telefone</option>
                  <option value="Aleatória">Aleatória</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted block mb-0.5">Chave PIX</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Ex: 12.345.678/0001-90"
                  value={formData.pix.chavePix}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pix: { ...prev.pix, chavePix: e.target.value }
                  }))}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.6rem', marginTop: '0.5rem' }}>
              <div>
                <label className="text-xs text-muted block mb-0.5">Nome do Titular da Conta</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="NexAi Soluções em Saúde LTDA"
                  value={formData.pix.titular}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pix: { ...prev.pix, titular: e.target.value }
                  }))}
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-0.5">Banco / Instituição</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Banco Cora / BB"
                  value={formData.pix.banco}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pix: { ...prev.pix, banco: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Seção Cartão e Gateway */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                💳 Gateway de Cartão / Recorrência
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
                <input 
                  type="checkbox" 
                  checked={formData.cartao.ativo}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cartao: { ...prev.cartao, ativo: e.target.checked }
                  }))}
                />
                <span>Habilitado</span>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.6rem' }}>
              <div>
                <label className="text-xs text-muted block mb-0.5">Provedor Gateway</label>
                <select 
                  className="input-field"
                  value={formData.cartao.provedor}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cartao: { ...prev.cartao, provedor: e.target.value }
                  }))}
                >
                  <option value="Asaas">Asaas (Recomendado BR)</option>
                  <option value="Mercado Pago">Mercado Pago</option>
                  <option value="Stripe">Stripe</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted block mb-0.5">Ambiente</label>
                <select 
                  className="input-field"
                  value={formData.cartao.ambiente}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cartao: { ...prev.cartao, ambiente: e.target.value }
                  }))}
                >
                  <option value="sandbox">🧪 Sandbox (Testes)</option>
                  <option value="producao">🚀 Produção</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <label className="text-xs text-muted block mb-0.5">Token / Chave de API Secreta</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="$aact_YTU5YTE0M2M6N2Z..."
                value={formData.cartao.apiKey}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  cartao: { ...prev.cartao, apiKey: e.target.value }
                }))}
              />
            </div>
          </div>

          {/* Regras de Cobrança e Inadimplência */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block mb-2.5">
              ⚖️ Regras de Cobrança & Tolerância
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
              <div>
                <label className="text-xs text-muted block mb-0.5">Dias de tolerância antes de suspender</label>
                <input 
                  type="number" 
                  className="input-field" 
                  min="1" 
                  max="30"
                  value={formData.regrasCobranca.diasTolerancia}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    regrasCobranca: { ...prev.regrasCobranca, diasTolerancia: Number(e.target.value) || 5 }
                  }))}
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={formData.regrasCobranca.suspensaoAutomatica}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      regrasCobranca: { ...prev.regrasCobranca, suspensaoAutomatica: e.target.checked }
                    }))}
                  />
                  <span>Suspensão Automática</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={formData.regrasCobranca.notificarEmail}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      regrasCobranca: { ...prev.regrasCobranca, notificarEmail: e.target.checked }
                    }))}
                  />
                  <span>Avisos por E-mail</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t mt-1">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              <span>{saving ? 'Salvando...' : 'Salvar Configurações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
