
import React, { useState, useMemo } from 'react';
import { Lead, LeadTemperature, LeadStatus } from '../types';
import { storageService } from '../services/storageService';
import { Search, Filter, MoreHorizontal, MessageSquare, ChevronRight, Hash, Phone as PhoneIcon, Zap, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  leads: Lead[];
  onSelect: (lead: Lead) => void;
}

const LeadList: React.FC<Props> = ({ leads, onSelect }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = (l.name?.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search));
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      storageService.deleteLead(id);
      setActiveMenu(null);
    }
  };

  const handleChangeStatus = (id: string, newStatus: LeadStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    const lead = leads.find(l => l.id === id);
    if (lead) {
      storageService.saveLead({ ...lead, status: newStatus });
    }
    setActiveMenu(null);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden min-h-[600px] flex flex-col">
      <div className="p-8 border-b border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Gerenciamento de Leads</h3>
          <p className="text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest">Base de contatos inteligentes</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por nome ou número..." 
              className="pl-12 pr-6 py-3.5 text-sm bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white focus:border-indigo-500 w-full sm:w-80 transition-all font-semibold"
            />
          </div>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="appearance-none flex items-center space-x-2 px-10 py-3.5 text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all font-bold text-sm cursor-pointer outline-none"
            >
              <option value="all">Todos Status</option>
              <option value={LeadStatus.ATIVO}>Ativos</option>
              <option value={LeadStatus.CONVERTIDO}>Convertidos</option>
              <option value={LeadStatus.PERDIDO}>Perdidos</option>
            </select>
            <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/70 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-6">Informação do Lead</th>
              <th className="px-8 py-6">Estágio de Venda</th>
              <th className="px-8 py-6">Engajamento</th>
              <th className="px-8 py-6">Status da Conta</th>
              <th className="px-8 py-6">Última Interação</th>
              <th className="px-8 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-32 text-center">
                  <div className="flex flex-col items-center max-w-xs mx-auto">
                    <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-6 text-indigo-200">
                      <Hash size={40} />
                    </div>
                    <p className="text-slate-800 font-black text-lg">Nenhum lead encontrado</p>
                    <p className="text-slate-400 text-sm font-medium mt-2">Tente ajustar sua busca ou filtros.</p>
                  </div>
                </td>
              </tr>
            )}
            {filteredLeads.sort((a,b) => b.last_activity - a.last_activity).map((lead) => (
              <tr 
                key={lead.id} 
                onClick={() => onSelect(lead)}
                className="hover:bg-slate-50/80 cursor-pointer transition-all group relative"
              >
                <td className="px-8 py-7">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm group-hover:border-indigo-500/20 group-hover:scale-105 transition-all">
                      {lead.name ? lead.name[0].toUpperCase() : <PhoneIcon className="w-5 h-5 text-slate-300" />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 leading-none mb-1">{lead.name || 'Aguardando Nome...'}</p>
                      <p className="text-[11px] font-bold text-slate-400 tracking-tight">{lead.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-7">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3.5 py-2 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10">
                    {lead.sales_stage}
                  </span>
                </td>
                <td className="px-8 py-7">
                  <div className={`inline-flex items-center px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    lead.temperature === LeadTemperature.QUENTE ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    lead.temperature === LeadTemperature.MORNO ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-sky-50 text-sky-600 border-sky-100'
                  }`}>
                    <Zap size={10} className="mr-1.5 fill-current" />
                    {lead.temperature}
                  </div>
                </td>
                <td className="px-8 py-7">
                  <div className="flex items-center">
                    <div className={`w-2.5 h-2.5 rounded-full mr-3 shadow-sm ${
                      lead.status === LeadStatus.CONVERTIDO ? 'bg-emerald-500 shadow-emerald-200' :
                      lead.status === LeadStatus.ATIVO ? 'bg-indigo-500 shadow-indigo-200' :
                      'bg-rose-500 shadow-rose-200'
                    }`}></div>
                    <span className="text-[10px] font-black uppercase text-slate-700 tracking-tighter">
                      {lead.status}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-7">
                  <p className="text-xs font-black text-slate-800">{new Date(lead.last_activity).toLocaleDateString('pt-BR')}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(lead.last_activity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}h</p>
                </td>
                <td className="px-8 py-7 text-right">
                   <div className="flex items-center justify-end space-x-3 relative">
                     <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                       <MessageSquare size={16} />
                     </div>
                     <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === lead.id ? null : lead.id);
                        }}
                        className="p-2.5 text-slate-300 hover:text-slate-600 transition-colors"
                      >
                       <MoreHorizontal size={20} />
                     </button>
                     
                     {/* Actions Menu Popover */}
                     {activeMenu === lead.id && (
                         <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-2 animate-in overflow-hidden">
                             <button 
                                onClick={(e) => handleChangeStatus(lead.id, LeadStatus.CONVERTIDO, e)}
                                className="w-full flex items-center space-x-3 p-3 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl transition-colors text-xs font-bold"
                             >
                                 <CheckCircle size={16} />
                                 <span>Marcar Convertido</span>
                             </button>
                             <button 
                                onClick={(e) => handleChangeStatus(lead.id, LeadStatus.PERDIDO, e)}
                                className="w-full flex items-center space-x-3 p-3 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl transition-colors text-xs font-bold"
                             >
                                 <XCircle size={16} />
                                 <span>Marcar Perdido</span>
                             </button>
                             <div className="h-px bg-slate-50 my-1 mx-2"></div>
                             <button 
                                onClick={(e) => handleDelete(lead.id, e)}
                                className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 text-red-500 rounded-xl transition-colors text-xs font-bold"
                             >
                                 <Trash2 size={16} />
                                 <span>Excluir Lead</span>
                             </button>
                         </div>
                     )}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mostrando {filteredLeads.length} de {leads.length} leads</p>
         <div className="flex space-x-2">
            <button disabled className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-300 cursor-not-allowed">Anterior</button>
            <button disabled className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-300 cursor-not-allowed">Próximo</button>
         </div>
      </div>
    </div>
  );
};

export default LeadList;
