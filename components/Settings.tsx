
import React, { useState, useEffect } from 'react';
import { SalesSettings } from '../types';
import { storageService } from '../services/storageService';
import { Save, AlertCircle, Sparkles, CreditCard, ShieldCheck, Globe, Loader2, Link, Key, Smartphone, ToggleLeft, ToggleRight } from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SalesSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await storageService.getSettings();
      setSettings(data);
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    await storageService.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleUpgrade = () => {
    setIsUpgrading(true);
    setTimeout(() => {
      setIsUpgrading(false);
      alert('Infelizmente as assinaturas estão suspensas temporariamente para sua região. Você já está no plano PRO gratuito!');
    }, 1500);
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Preferências</h2>
          <p className="text-slate-500 font-medium">Configure a personalidade e a conexão com seu WhatsApp.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center px-8 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all font-black text-sm shadow-xl shadow-indigo-200 active:scale-95"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Seção de Conexão WhatsApp */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Conexão WhatsApp Real</h3>
              </div>
              <button 
                onClick={() => setSettings({...settings, is_active: !settings.is_active})}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${settings.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}
              >
                {settings.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                <span>{settings.is_active ? 'ATIVO' : 'DESATIVADO'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">API Key (Provider)</label>
                <div className="relative group">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="password"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-semibold"
                    value={settings.whatsapp_api_key}
                    onChange={(e) => setSettings({ ...settings, whatsapp_api_key: e.target.value })}
                    placeholder="Sua chave de API externa"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Instance ID</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-indigo-500 transition-all text-sm font-semibold"
                  value={settings.whatsapp_instance_id}
                  onChange={(e) => setSettings({ ...settings, whatsapp_instance_id: e.target.value })}
                  placeholder="ID da Instância (Ex: AutoSeller_01)"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">URL de Webhook (Para seu provedor)</label>
                <div className="flex space-x-2">
                  <div className="relative flex-1 group">
                    <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                      type="text"
                      readOnly
                      className="w-full pl-11 pr-4 py-3 bg-slate-100 border border-slate-100 rounded-xl text-slate-400 text-xs font-mono"
                      value={settings.webhook_url}
                    />
                  </div>
                  <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">Copiar</button>
                </div>
                <p className="mt-2 text-[10px] text-slate-400 font-medium italic">Configure esta URL no seu provedor para receber mensagens em tempo real.</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800 tracking-tight">Cérebro da IA</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Prompt Mestre de Vendas</label>
                <textarea
                  className="w-full h-80 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700 leading-relaxed text-sm resize-none"
                  value={settings.sales_prompt}
                  onChange={(e) => setSettings({ ...settings, sales_prompt: e.target.value })}
                  placeholder="Defina as regras de ouro para o seu vendedor virtual..."
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge text="{stage}" />
                  <Badge text="{name}" />
                  <Badge text="{objective}" />
                  <Badge text="{business_name}" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Link de Checkout</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
                    <input
                      type="url"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold text-slate-700"
                      value={settings.payment_link}
                      onChange={(e) => setSettings({ ...settings, payment_link: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Nome da Empresa</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500" size={18} />
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold text-slate-700"
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
            <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter mb-6">Resposta base para gatilhos:</p>
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

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
             <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-black tracking-tight">Plano & Cotas</h4>
                <span className="text-[10px] font-black bg-indigo-500 px-2 py-1 rounded-lg">PRO</span>
             </div>
             <div className="space-y-6">
                <div>
                   <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-400">Mensagens Usadas</span>
                      <span>{settings.used_messages} / {settings.message_limit}</span>
                   </div>
                   <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500" style={{ width: `${(settings.used_messages / settings.message_limit) * 100}%` }}></div>
                   </div>
                </div>
                <button 
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-black transition-colors uppercase tracking-widest flex items-center justify-center space-x-2"
                >
                   {isUpgrading ? <Loader2 className="animate-spin" size={14} /> : <span>Fazer Upgrade</span>}
                </button>
             </div>
          </div>
        </div>
      </div>
      
      {saved && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center animate-in z-50">
          <Sparkles className="text-indigo-400 mr-3" size={20} />
          <span className="font-bold text-sm">Configurações sincronizadas com sucesso!</span>
        </div>
      )}
    </div>
  );
};

const Badge = ({ text }: { text: string }) => (
  <span className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest border border-indigo-100 uppercase select-none cursor-default hover:bg-indigo-100 transition-colors">
    {text}
  </span>
);

export default Settings;
