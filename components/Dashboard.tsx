
import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Lead, SalesStage, LeadStatus } from '../types';
import { Users, Target, TrendingUp, Zap, ArrowUpRight, Clock, ChevronRight } from 'lucide-react';

interface Props {
  leads: Lead[];
}

const Dashboard: React.FC<Props> = ({ leads }) => {
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d'>('30d');

  const filteredLeads = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (dateRange === 'today') {
      return leads.filter(l => (now - l.created_at) < oneDay);
    } else if (dateRange === '7d') {
      return leads.filter(l => (now - l.created_at) < (oneDay * 7));
    }
    return leads;
  }, [leads, dateRange]);

  const stats = useMemo(() => {
    const total = filteredLeads.length;
    const converted = filteredLeads.filter(l => l.status === LeadStatus.CONVERTIDO).length;
    const conversionRate = total > 0 ? (converted / total * 100).toFixed(1) : 0;
    const active = filteredLeads.filter(l => l.status === LeadStatus.ATIVO).length;
    
    const stages = Object.values(SalesStage);
    const funnelData = stages.map(stage => ({
      name: stage.charAt(0).toUpperCase() + stage.slice(1),
      count: filteredLeads.filter(l => l.sales_stage === stage).length
    }));

    return { total, converted, conversionRate, active, funnelData };
  }, [filteredLeads]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Executivo</h2>
          <p className="text-slate-500 font-medium">Análise em tempo real do seu motor de vendas.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setDateRange('today')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${dateRange === 'today' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >Hoje</button>
          <button 
            onClick={() => setDateRange('7d')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${dateRange === '7d' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >7 Dias</button>
          <button 
            onClick={() => setDateRange('30d')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${dateRange === '30d' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
          >30 Dias</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users />} title="Total de Leads" value={stats.total} trend="+12.5%" color="indigo" />
        <StatCard icon={<Target />} title="Conversões" value={stats.converted} trend="+8.2%" color="emerald" />
        <StatCard icon={<Zap />} title="Taxa de Fechamento" value={`${stats.conversionRate}%`} trend="+3.1%" color="amber" />
        <StatCard icon={<TrendingUp />} title="Leads Ativos" value={stats.active} trend="Estável" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Fluxo do Funil</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Volume por estágio ({dateRange})</p>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ArrowUpRight className="text-slate-400" size={20}/></button>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.funnelData}>
                  <defs>
                    <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="700" tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorIndigo)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6">Atividade Recente dos Leads</h3>
            <div className="space-y-4">
              {filteredLeads.slice(0, 4).sort((a,b) => b.last_activity - a.last_activity).map((lead, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                      {lead.name ? lead.name[0] : 'L'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{lead.name || 'Lead Anônimo'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{lead.sales_stage}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center">
                      <Clock size={12} className="mr-1" /> {new Date(lead.last_activity).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
              ))}
              {filteredLeads.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Nenhum dado para este período.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-xl shadow-slate-200/20">
            <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight">Status Global</h3>
            <div className="h-[280px] flex items-center justify-center relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Ativo', value: filteredLeads.filter(l => l.status === LeadStatus.ATIVO).length },
                        { name: 'Convertido', value: filteredLeads.filter(l => l.status === LeadStatus.CONVERTIDO).length },
                        { name: 'Perdido', value: filteredLeads.filter(l => l.status === LeadStatus.PERDIDO).length },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={105}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#6366f1" />
                      <Cell fill="#10b981" />
                      <Cell fill="#f43f5e" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black text-slate-900">{stats.total}</span>
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Leads</span>
               </div>
            </div>
            <div className="mt-8 space-y-4">
               <LegendItem color="bg-indigo-500" label="Ativos" count={filteredLeads.filter(l => l.status === LeadStatus.ATIVO).length} />
               <LegendItem color="bg-emerald-500" label="Convertidos" count={filteredLeads.filter(l => l.status === LeadStatus.CONVERTIDO).length} />
               <LegendItem color="bg-rose-500" label="Perdidos" count={filteredLeads.filter(l => l.status === LeadStatus.PERDIDO).length} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
             <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                <Zap size={24} className="text-white fill-white" />
             </div>
             <h4 className="text-xl font-black mb-2">Dica de IA</h4>
             <p className="text-indigo-100 text-sm leading-relaxed font-medium">
               Seus leads no estágio de "Diagnóstico" têm 45% mais chance de converter se respondidos em menos de 5 minutos.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, trend, color }: any) => (
  <div className="bg-white p-7 rounded-[2rem] border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
    <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${color}-500/5 rounded-full blur-2xl group-hover:bg-${color}-500/10 transition-colors`}></div>
    <div className="flex items-center justify-between mb-6">
      <div className={`p-3.5 rounded-2xl bg-${color}-50 text-${color}-600 group-hover:scale-110 transition-transform duration-500`}>
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <div className="flex items-center text-emerald-500 text-[11px] font-black bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100/50 shadow-sm">
        <ArrowUpRight size={12} className="mr-1" />
        {trend}
      </div>
    </div>
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
    <p className="text-3xl font-black text-slate-900 mt-1.5 tracking-tighter leading-none">{value}</p>
  </div>
);

const LegendItem = ({ color, label, count }: any) => (
  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-default border border-transparent hover:border-slate-100">
    <div className="flex items-center space-x-3">
      <div className={`w-3 h-3 rounded-full ${color} shadow-sm`}></div>
      <span className="text-xs font-bold text-slate-600">{label}</span>
    </div>
    <span className="text-sm font-black text-slate-900">{count}</span>
  </div>
);

export default Dashboard;
