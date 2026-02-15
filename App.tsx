
import React, { useState, useEffect, useCallback } from 'react';
import { LayoutDashboard, Users, Settings as SettingsIcon, MessageSquare, Menu, X, Rocket, Bell, Search, ChevronRight, Plus, AlertCircle, Info, CheckCircle, AlertTriangle, Layers, Database, LogOut, ShieldAlert, Sparkles } from 'lucide-react';
import Dashboard from './components/Dashboard';
import LeadList from './components/LeadList';
import Settings from './components/Settings';
import ChatSimulator from './components/ChatSimulator';
import FlowBuilder from './components/FlowBuilder';
import Login from './components/Login';
import { storageService } from './services/storageService';
import { supabase } from './services/supabaseClient';
import { Lead, SalesStage, LeadStatus, LeadTemperature, SalesSettings } from './types';

interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'settings' | 'simulador' | 'flows'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<SalesSettings | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadName, setNewLeadName] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Carrega a sessão inicial
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setAuthLoading(false);
    };

    initSession();

    // Escuta mudanças de estado (login/logout/demo)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const addNotification = useCallback((type: Notification['type'], title: string, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, type, title, message, timestamp: Date.now() }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  }, []);

  const loadData = useCallback(async () => {
    if (!session) return;
    setIsSyncing(true);
    try {
      const [freshLeads, currentSettings] = await Promise.all([
        storageService.getLeads(),
        storageService.getSettings()
      ]);
      
      setLeads(freshLeads);
      setSettings(currentSettings);
      
      if (currentSettings.last_error) {
        addNotification('error', 'Atenção', currentSettings.last_error);
        const updatedSettings = { ...currentSettings };
        delete updatedSettings.last_error;
        await storageService.updateSettings(updatedSettings);
      }
    } catch (e) {
      console.error('Falha na sincronização:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [addNotification, session]);

  useEffect(() => {
    if (session) {
      loadData();
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [loadData, session]);

  const handleLogout = async () => {
    setAuthLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setAuthLoading(false);
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadPhone) return;

    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      phone: newLeadPhone,
      name: newLeadName,
      sales_stage: SalesStage.INICIO,
      temperature: LeadTemperature.FRIO,
      status: LeadStatus.ATIVO,
      created_at: Date.now(),
      last_activity: Date.now(),
      follow_up_count: 0
    };

    await storageService.saveLead(newLead);
    setNewLeadName('');
    setNewLeadPhone('');
    setIsNewLeadModalOpen(false);
    await loadData();
    setActiveTab('leads');
    addNotification('success', 'Sucesso', 'Lead adicionado à nuvem.');
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full bg-[#0F172A] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Database className="text-indigo-500 animate-pulse" size={48} />
          <span className="text-slate-500 text-xs font-black uppercase tracking-widest">Estabelecendo Conexão</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  const navItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: <LayoutDashboard size={20} /> },
    { id: 'leads', label: 'Gestão de Leads', icon: <Users size={20} /> },
    { id: 'flows', label: 'Fluxos Automáticos', icon: <Layers size={20} /> },
    { id: 'simulador', label: 'Simulador WhatsApp', icon: <MessageSquare size={20} /> },
    { id: 'settings', label: 'Configurações IA', icon: <SettingsIcon size={20} /> },
  ];

  const usagePercentage = settings ? Math.min(100, (settings.used_messages / settings.message_limit) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 overflow-x-hidden relative">
      <div className={`fixed bottom-6 right-6 z-[120] flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg border transition-all duration-500 ${isSyncing ? 'bg-indigo-600 border-indigo-500 text-white translate-y-0' : 'bg-white border-slate-200 text-slate-400 translate-y-20'}`}>
        <Database size={14} className={isSyncing ? 'animate-pulse' : ''} />
        <span className="text-[10px] font-black uppercase tracking-widest">Cloud Sync</span>
      </div>

      <div className="fixed top-24 right-8 z-[110] flex flex-col space-y-4 pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto w-80 p-4 rounded-2xl shadow-2xl border flex items-start space-x-3 animate-in bg-white ${n.type === 'error' ? 'border-rose-100' : 'border-indigo-100'}`}>
            <div className={`p-2 rounded-xl bg-slate-50 ${n.type === 'error' ? 'text-rose-500' : 'text-indigo-500'}`}>
              {n.type === 'error' ? <AlertCircle size={20} /> : <Info size={20} />}
            </div>
            <div className="flex-1 pt-1">
              <h4 className="text-sm font-black leading-tight mb-1">{n.title}</h4>
              <p className="text-xs font-medium opacity-80 leading-relaxed">{n.message}</p>
            </div>
            <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
          </div>
        ))}
      </div>

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-slate-400 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20"><Rocket className="text-white w-6 h-6" /></div>
              <span className="text-xl font-black text-white tracking-tighter">AutoSeller<span className="text-indigo-400">.AI</span></span>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-1.5 mt-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 font-bold' : 'hover:bg-slate-800/50 font-medium'}`}
              >
                <div className="flex items-center space-x-3">
                  <span className={activeTab === item.id ? 'text-white' : 'text-slate-500'}>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={14} />}
              </button>
            ))}
          </nav>

          <div className="p-6 space-y-4">
            <div className="bg-slate-800/40 rounded-3xl p-5 border border-slate-700/50">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[10px] font-black uppercase text-slate-400">Status</span>
                 <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${settings?.is_test_mode ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                   {settings?.is_test_mode ? 'TESTE' : 'PRO'}
                 </span>
              </div>
              <div className="flex justify-between text-[11px] font-bold text-white mb-2">
                <span>Mensagens</span>
                <span>{settings?.used_messages || 0}/{settings?.message_limit || 0}</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${usagePercentage}%` }}></div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 py-3 border border-slate-800 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all text-[10px] font-black uppercase tracking-widest"
            >
              <LogOut size={16} />
              <span>Sair do Terminal</span>
            </button>
          </div>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><Menu size={24} /></button>
            {settings?.is_test_mode && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl">
                <ShieldAlert size={14} className="text-amber-500" />
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">Modo de Teste Ativo</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
             <div className="hidden sm:flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuário</span>
               <span className="text-xs font-bold text-slate-900">{session?.user?.email}</span>
             </div>
             <button onClick={() => setIsNewLeadModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-xl shadow-indigo-100 hover:bg-indigo-500 transition-all active:scale-95">+ Novo Lead</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 animate-in">
          {activeTab === 'dashboard' && <Dashboard leads={leads} />}
          {activeTab === 'leads' && <LeadList leads={leads} onSelect={() => setActiveTab('simulador')} />}
          {activeTab === 'flows' && <FlowBuilder />}
          {activeTab === 'simulador' && <div className="max-w-4xl mx-auto h-full flex flex-col pb-8"><ChatSimulator /></div>}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>

      {isNewLeadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-3xl border border-slate-100">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Cadastrar Lead</h3>
            <p className="text-slate-400 text-sm font-medium mb-8">O AutoSeller iniciará a abordagem automática imediatamente.</p>
            <form onSubmit={handleCreateLead} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome do Contato</label>
                <input type="text" value={newLeadName} onChange={(e) => setNewLeadName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-slate-700" placeholder="Ex: João da Silva" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WhatsApp (DDI + DDD + Num)</label>
                <input type="text" required value={newLeadPhone} onChange={(e) => setNewLeadPhone(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-slate-700" placeholder="Ex: 5511999999999" />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-2xl shadow-indigo-100 hover:bg-indigo-500 transition-all mt-4">Ativar Vendedor IA</button>
              <button type="button" onClick={() => setIsNewLeadModalOpen(false)} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">Cancelar Registro</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
