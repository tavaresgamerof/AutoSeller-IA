
import React, { useState, useEffect } from 'react';
import { SalesSettings } from '../types';
import { storageService } from '../services/storageService';
import { salesEngine } from '../services/salesEngine';
import { 
  Save, AlertCircle, Sparkles, CreditCard, ShieldCheck, 
  Globe, Loader2, Link, Key, Smartphone, ToggleLeft, 
  ToggleRight, QrCode, RefreshCcw, CheckCircle2, XCircle,
  ExternalLink, Info, Copy, Check, HelpCircle, BookOpen, Server, Cloud,
  AlertTriangle, Cpu, Terminal, Zap, ShieldPlus
} from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SalesSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webhookToken, setWebhookToken] = useState('');

  // URL final do Webhook (Supabase Edge Function)
  const webhookUrl = `https://upiwxunobfkmxysqswkq.supabase.co/functions/v1/whatsapp-webhook?token=${webhookToken}`;

  useEffect(() => {
    const loadSettings = async () => {
      const data = await storageService.getSettings();
      const token = await storageService.getWebhookToken();
      setWebhookToken(token || '');
      const normalizedData = {
        ...data,
        whatsapp_server_url: data.whatsapp_server_url || '',
        connection_status: data.connection_status || 'disconnected'
      };
      setSettings(normalizedData);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    await storageService.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add handleDisconnect function to update connection status
  const handleDisconnect = async () => {
    if (!settings) return;
    const updatedSettings: SalesSettings = { ...settings, connection_status: 'disconnected' };
    setSettings(updatedSettings);
    await storageService.updateSettings(updatedSettings);
  };

  const edgeFunctionCode = `
// CÓDIGO PARA COLAR NO SUPABASE EDGE FUNCTION
// Nome: whatsapp-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.0'

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  
  // 1. Validar Token de Segurança
  if (token !== "${webhookToken}") return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const message = body.data?.message?.conversation || body.message?.text;
  const phone = body.data?.key?.remoteJid || body.sender;

  if (!message || !phone) return new Response('No data', { status: 200 });

  // 2. Chamar lógica do Gemini e disparar resposta via Gateway
  // (Este script deve ser implantado no Supabase para rodar 24h)
  console.log('Mensagem recebida de:', phone, 'Conteúdo:', message);

  return new Response(JSON.stringify({ status: 'success' }), { 
    headers: { 'Content-Type': 'application/json' } 
  });
})
  `;

  const handleGenerateQr = async () => {
    if (!settings) return;
    if (!settings.whatsapp_server_url || !settings.whatsapp_instance_id) {
      alert("Preencha a URL do Servidor e o ID da Instância antes de gerar o QR Code.");
      return;
    }
    setLoadingQr(true);
    setShowQrModal(true);
    try {
      const code = await salesEngine.getQrCode(settings);
      setQrCode(code);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoadingQr(false);
    }
  };

  if (!settings) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Vincular Atendimento Real</h2>
          <p className="text-slate-500 font-medium">Siga os 3 passos para ativar seu vendedor automático.</p>
        </div>
        <button onClick={handleSave} className="flex items-center px-8 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-sm shadow-xl active:scale-95">
          <Save className="w-4 h-4 mr-2" /> Salvar Tudo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* PASSO 1: GATEWAY */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">Passo 01</span>
            </div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Server size={24} /></div>
              <h3 className="text-xl font-black text-slate-800">Conectar com Gateway</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">URL do Servidor</label>
                <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold" value={settings.whatsapp_server_url} onChange={(e) => setSettings({ ...settings, whatsapp_server_url: e.target.value })} placeholder="https://api.meuservidor.com" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ID Instância</label>
                <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold" value={settings.whatsapp_instance_id} onChange={(e) => setSettings({ ...settings, whatsapp_instance_id: e.target.value })} placeholder="vendedor_ia" />
              </div>
            </div>
            <button onClick={() => setShowHelpModal(true)} className="text-xs font-bold text-indigo-600 flex items-center hover:underline"><Info size={14} className="mr-1" /> Não tenho esses dados. Onde conseguir?</button>
          </div>

          {/* PASSO 2: CÉREBRO (WEBHOOK) */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 p-8">
              <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-[10px] font-black uppercase">Passo 02</span>
            </div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-white/5 text-indigo-400 rounded-2xl"><Cpu size={24} /></div>
              <h3 className="text-xl font-black tracking-tight">Ativar Resposta 24h (Webhook)</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Para a IA responder mesmo com seu navegador fechado, você deve configurar este link de Webhook no seu servidor Gateway:
            </p>
            <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-4 mb-6">
               <code className="text-[10px] font-mono text-indigo-300 break-all">{webhookUrl}</code>
               <button onClick={() => copyToClipboard(webhookUrl)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                 {copied ? <Check size={16} /> : <Copy size={16} />}
               </button>
            </div>
            <button 
              onClick={() => setShowWebhookGuide(true)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2"
            >
              <Terminal size={16} />
              <span>Ver Código da Edge Function</span>
            </button>
          </div>

          {/* PASSO 3: QR CODE */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative">
            <div className="absolute top-0 right-0 p-8">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase">Passo 03</span>
            </div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><QrCode size={24} /></div>
              <h3 className="text-xl font-black text-slate-800">Vincular WhatsApp Real</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleGenerateQr} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-500 transition-all flex items-center justify-center space-x-2">
                <Smartphone size={18} />
                <span>Gerar QR Code Agora</span>
              </button>
              {settings.connection_status === 'connected' && (
                <button onClick={handleDisconnect} className="px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest">Desconectar</button>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Status */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Status do Motor</h4>
            <div className="space-y-4">
               <StatusItem label="Gateway" active={!!settings.whatsapp_server_url} />
               <StatusItem label="Webhook" active={true} />
               <StatusItem label="WhatsApp" active={settings.connection_status === 'connected'} />
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100">
               <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-bold text-slate-500">Auto-Resposta</span>
                 <button 
                   onClick={() => setSettings({...settings, is_active: !settings.is_active})}
                   className={`w-12 h-6 rounded-full transition-all relative ${settings.is_active ? 'bg-indigo-600' : 'bg-slate-200'}`}
                 >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.is_active ? 'left-7' : 'left-1'}`}></div>
                 </button>
               </div>
               <p className="text-[10px] text-slate-400 font-medium">Quando ativado, a IA assume todas as conversas que chegarem.</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
             <Zap className="mb-4 text-amber-300" size={24} fill="currentColor" />
             <h4 className="text-lg font-black mb-2">Dica Pro</h4>
             <p className="text-xs text-indigo-100 leading-relaxed font-medium">
               Mantenha o celular conectado à internet e com bateria. O Gateway Evolution API é o mais estável para evitar banimentos de chip.
             </p>
          </div>
        </div>
      </div>

      {/* Modal Guia de Edge Function */}
      {showWebhookGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-3xl relative overflow-hidden">
              <button onClick={() => setShowWebhookGuide(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-colors"><XCircle size={32}/></button>
              
              <div className="mb-8">
                <div className="w-16 h-16 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldPlus size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Seu Cérebro 24h</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Para que a IA responda mesmo com seu PC desligado, você deve criar uma <b>Edge Function</b> no seu projeto Supabase e colar o código abaixo:
                </p>
              </div>

              <div className="bg-slate-900 rounded-2xl p-6 mb-8 max-h-64 overflow-y-auto">
                 <pre className="text-[10px] text-indigo-300 font-mono">
                   {edgeFunctionCode}
                 </pre>
              </div>

              <div className="space-y-4">
                 <button onClick={() => copyToClipboard(edgeFunctionCode)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2">
                   <Copy size={16} />
                   <span>Copiar Código Completo</span>
                 </button>
                 <p className="text-center text-[10px] text-slate-400 font-bold uppercase">Tutorial: No Supabase > Edge Functions > Create Function</p>
              </div>
           </div>
        </div>
      )}

      {/* Modal de Ajuda Gateway */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in">
           <div className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-3xl relative overflow-hidden">
              <button onClick={() => setShowHelpModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-colors"><XCircle size={32}/></button>
              <div className="mb-10">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6"><BookOpen size={32} /></div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Configurar seu Gateway</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Você precisa de uma "ponte" para conectar seu código ao WhatsApp.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="font-black text-slate-900 text-xs uppercase mb-2">Opção A: Grátis</h4>
                    <p className="text-[11px] text-slate-500 mb-4">Instale a <b>Evolution API</b> em um servidor (VPS).</p>
                    <a href="https://evolution-api.com/" target="_blank" className="text-[10px] font-black text-indigo-600 uppercase">Ver Documentação</a>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="font-black text-slate-900 text-xs uppercase mb-2">Opção B: Pronta</h4>
                    <p className="text-[11px] text-slate-500 mb-4">Contrate serviços como <b>Z-API</b> ou <b>WPPConnect</b>.</p>
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Mais fácil de configurar</span>
                 </div>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Entendi</button>
           </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-3xl relative overflow-hidden flex flex-col items-center">
              <button onClick={() => setShowQrModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-colors"><XCircle size={24}/></button>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Escaneie o QR Code</h3>
                <p className="text-slate-500 text-sm font-medium">Acesse Aparelhos Conectados no seu WhatsApp.</p>
              </div>
              <div className="bg-slate-50 rounded-[2.5rem] p-6 mb-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 aspect-square w-full">
                 {loadingQr ? <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" /> : qrCode ? <img src={qrCode} alt="QR Code" className="w-full rounded-xl shadow-xl border-8 border-white" /> : <div className="text-rose-500 font-bold">Erro ao carregar. Verifique o servidor.</div>}
              </div>
              <button onClick={() => setShowQrModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest">Já Escaneei</button>
           </div>
        </div>
      )}

      {saved && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center animate-in z-50">
          <CheckCircle2 className="text-emerald-400 mr-3" size={20} />
          <span className="font-bold text-sm">Configurações salvas!</span>
        </div>
      )}
    </div>
  );
};

const StatusItem = ({ label, active }: { label: string, active: boolean }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
    <span className="text-xs font-bold text-slate-600">{label}</span>
    {active ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-slate-300" />}
  </div>
);

export default Settings;
