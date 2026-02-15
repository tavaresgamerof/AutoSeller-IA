
import React, { useState, useEffect } from 'react';
import { SalesSettings } from '../types';
import { storageService } from '../services/storageService';
import { salesEngine } from '../services/salesEngine';
import { 
  Save, AlertCircle, Sparkles, CreditCard, ShieldCheck, 
  Globe, Loader2, Link, Key, Smartphone, ToggleLeft, 
  ToggleRight, QrCode, RefreshCcw, CheckCircle2, XCircle,
  ExternalLink, Info
} from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SalesSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await storageService.getSettings();
      // Garantir campos novos
      const normalizedData = {
        ...data,
        whatsapp_server_url: data.whatsapp_server_url || 'https://api.gateway.exemplo.com',
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

  const handleGenerateQr = async () => {
    if (!settings) return;
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

  const handleDisconnect = async () => {
    if (!settings) return;
    if (confirm("Deseja desconectar o WhatsApp?")) {
      const updated = { ...settings, connection_status: 'disconnected' as const, is_active: false };
      setSettings(updated);
      await storageService.updateSettings(updated);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Conexão & Inteligência</h2>
          <p className="text-slate-500 font-medium">Configure seu vendedor e conecte-o ao mundo real.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center px-8 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-sm shadow-xl shadow-indigo-200 active:scale-95"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Nova Seção: WhatsApp QR Code Manager */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8">
               <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                 settings.connection_status === 'connected' ? 'bg-emerald-100 text-emerald-600' : 
                 settings.connection_status === 'connecting' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
               }`}>
                 <div className={`w-1.5 h-1.5 rounded-full ${settings.connection_status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                 <span>{settings.connection_status === 'connected' ? 'Conectado' : 'Desconectado'}</span>
               </div>
            </div>

            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Gerenciador de WhatsApp</h3>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-6 mb-8 border border-slate-100">
               <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center space-x-4">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                        <QrCode size={32} className="text-slate-400" />
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900">Conectar via QR Code</p>
                        <p className="text-xs text-slate-500 font-medium">Vincule seu número em segundos sem APIs complexas.</p>
                     </div>
                  </div>
                  {settings.connection_status === 'connected' ? (
                    <button 
                      onClick={handleDisconnect}
                      className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                    >
                      Desconectar
                    </button>
                  ) : (
                    <button 
                      onClick={handleGenerateQr}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-all"
                    >
                      Gerar QR Code
                    </button>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">ID da Instância (Obrigatório)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-semibold"
                  value={settings.whatsapp_instance_id}
                  onChange={(e) => setSettings({ ...settings, whatsapp_instance_id: e.target.value })}
                  placeholder="Ex: Vendedor_Empresa_01"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Gateway URL (Evolution/Z-API)</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-semibold"
                    value={settings.whatsapp_server_url}
                    onChange={(e) => setSettings({ ...settings, whatsapp_server_url: e.target.value })}
                    placeholder="https://api.suaempresa.com"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start space-x-3">
               <Info className="text-indigo-400 shrink-0 mt-0.5" size={18} />
               <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                  Para que o QR Code funcione, você deve apontar para um servidor <strong>Evolution API</strong> ou similar. 
                  Se você não tem um servidor, pode usar o <strong>Modo Simulador</strong> para testar toda a inteligência da IA antes de contratar um gateway.
               </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Personalidade da IA</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Instruções de Comportamento (Prompt)</label>
                <textarea
                  className="w-full h-80 p-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700 leading-relaxed text-sm resize-none"
                  value={settings.sales_prompt}
                  onChange={(e) => setSettings({ ...settings, sales_prompt: e.target.value })}
                  placeholder="Descreva como o vendedor deve se comportar..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Link de Pagamento</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
                    <input
                      type="url"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-400 transition-all text-sm font-bold text-slate-700"
                      value={settings.payment_link}
                      onChange={(e) => setSettings({ ...settings, payment_link: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Nome do Negócio</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-400 transition-all text-sm font-bold text-slate-700"
                      value={settings.business_name}
                      onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Quebra de Objeção</h3>
            </div>
            <div className="space-y-6">
               {settings.objection_scripts && Object.entries(settings.objection_scripts).map(([key, value]) => (
                 <div key={key}>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Gatilho: {key}</label>
                   <textarea
                     className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all text-xs font-semibold text-slate-600 leading-normal h-24 resize-none"
                     value={value}
                     onChange={(e) => {
                       const newScripts = { ...settings.objection_scripts, [key]: e.target.value };
                       setSettings({ ...settings, objection_scripts: newScripts });
                     }}
                   />
                 </div>
               ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all"></div>
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-black tracking-tight">Status do Plano</h4>
                <div className="px-3 py-1 bg-indigo-500 rounded-lg text-[10px] font-black animate-pulse">PREMIUM</div>
             </div>
             <div className="space-y-6">
                <div>
                   <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-400">Mensagens Consumidas</span>
                      <span>{settings.used_messages} / {settings.message_limit}</span>
                   </div>
                   <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-1000" 
                        style={{ width: `${(settings.used_messages / settings.message_limit) * 100}%` }}
                      ></div>
                   </div>
                </div>
                <button 
                    onClick={() => setIsUpgrading(true)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                >
                   Gerenciar Assinatura
                </button>
             </div>
          </div>
        </div>
      </div>
      
      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in">
           <div className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-3xl text-center relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
              
              <h3 className="text-2xl font-black text-slate-900 mb-2">Conectar WhatsApp</h3>
              <p className="text-slate-500 text-sm font-medium mb-8">Escaneie o código abaixo com o seu celular.</p>
              
              <div className="bg-slate-50 rounded-[2.5rem] p-8 mb-8 flex items-center justify-center border-2 border-dashed border-slate-200 relative aspect-square">
                 {loadingQr ? (
                   <div className="flex flex-col items-center">
                      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Iniciando Instância...</p>
                   </div>
                 ) : qrCode ? (
                   <div className="space-y-4">
                      <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 rounded-xl shadow-xl border-8 border-white" />
                      <div className="flex items-center justify-center space-x-2 text-emerald-600 animate-pulse">
                         <RefreshCcw size={14} className="animate-spin" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Aguardando Leitura...</span>
                      </div>
                   </div>
                 ) : (
                   <p className="text-rose-500 font-bold">Falha ao gerar código. Tente novamente.</p>
                 )}
              </div>

              <div className="space-y-4">
                 <ol className="text-left text-xs font-medium text-slate-600 space-y-3 px-4">
                    <li className="flex items-start space-x-3"><span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</span><span>Abra o WhatsApp no seu celular</span></li>
                    <li className="flex items-start space-x-3"><span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</span><span>Toque em <b>Aparelhos Conectados</b></span></li>
                    <li className="flex items-start space-x-3"><span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">3</span><span>Toque em <b>Conectar um Aparelho</b></span></li>
                 </ol>
                 
                 <div className="pt-6">
                    <button 
                      onClick={async () => {
                         const updated = { ...settings, connection_status: 'connected' as const, is_active: true };
                         setSettings(updated);
                         await storageService.updateSettings(updated);
                         setShowQrModal(false);
                      }}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all"
                    >
                       Simular Sucesso na Conexão
                    </button>
                    <button onClick={() => setShowQrModal(false)} className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Cancelar</button>
                 </div>
              </div>
           </div>
        </div>
      )}
      
      {saved && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center animate-in z-50">
          <CheckCircle2 className="text-emerald-400 mr-3" size={20} />
          <span className="font-bold text-sm">Configurações sincronizadas com a nuvem!</span>
        </div>
      )}
    </div>
  );
};

export default Settings;
