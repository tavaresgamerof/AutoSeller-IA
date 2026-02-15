
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Flow, FlowStep, SalesStage, MessageType } from '../types';
import { 
  Plus, Trash2, Clock, Type, Image as ImageIcon, 
  Mic, Video, Save, Play, ChevronDown, ChevronUp, AlertCircle, Loader2 
} from 'lucide-react';

const FlowBuilder: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFlows = async () => {
      const data = await storageService.getFlows();
      setFlows(data);
      setIsLoading(false);
    };
    loadFlows();
  }, []);

  const activeFlow = flows.find(f => f.id === activeFlowId);

  const createNewFlow = async () => {
    const newFlow: Flow = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Fluxo de Automática',
      trigger_stage: SalesStage.QUALIFICACAO,
      steps: [],
      is_enabled: true
    };
    const updated = [...flows, newFlow];
    setFlows(updated);
    await storageService.saveFlow(newFlow);
    setActiveFlowId(newFlow.id);
  };

  const addStep = async (flowId: string, type: MessageType) => {
    const newStep: FlowStep = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'text' ? '' : 'URL ou Base64 do arquivo',
      delay: 2000
    };
    
    const updatedFlows = flows.map(f => {
      if (f.id === flowId) {
        return { ...f, steps: [...f.steps, newStep] };
      }
      return f;
    });
    
    setFlows(updatedFlows);
    const flow = updatedFlows.find(f => f.id === flowId);
    if (flow) await storageService.saveFlow(flow);
  };

  const updateStep = async (flowId: string, stepId: string, data: Partial<FlowStep>) => {
    const updatedFlows = flows.map(f => {
      if (f.id === flowId) {
        const steps = f.steps.map(s => s.id === stepId ? { ...s, ...data } : s);
        return { ...f, steps };
      }
      return f;
    });
    setFlows(updatedFlows);
    const flow = updatedFlows.find(f => f.id === flowId);
    if (flow) await storageService.saveFlow(flow);
  };

  const deleteStep = async (flowId: string, stepId: string) => {
    const updatedFlows = flows.map(f => {
      if (f.id === flowId) {
        return { ...f, steps: f.steps.filter(s => s.id !== stepId) };
      }
      return f;
    });
    setFlows(updatedFlows);
    const flow = updatedFlows.find(f => f.id === flowId);
    if (flow) await storageService.saveFlow(flow);
  };

  const deleteFlow = async (id: string) => {
    if (confirm('Excluir este fluxo permanentemente?')) {
      const updated = flows.filter(f => f.id !== id);
      setFlows(updated);
      await storageService.deleteFlow(id);
      setActiveFlowId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Fluxos de Venda</h2>
          <p className="text-slate-500 font-medium">Configure mensagens de colateral (áudio, vídeo, foto) automáticas.</p>
        </div>
        <button 
          onClick={createNewFlow}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center space-x-2 shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} />
          <span>Criar Novo Fluxo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar de Fluxos */}
        <div className="space-y-4">
          {flows.length === 0 && (
            <div className="p-8 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 opacity-50">
              <AlertCircle className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sem fluxos</p>
            </div>
          )}
          {flows.map(flow => (
            <button
              key={flow.id}
              onClick={() => setActiveFlowId(flow.id)}
              className={`w-full text-left p-5 rounded-[2rem] border transition-all ${
                activeFlowId === flow.id 
                  ? 'bg-white border-indigo-500 shadow-xl shadow-indigo-100 ring-4 ring-indigo-500/5' 
                  : 'bg-white border-slate-100 hover:border-indigo-200 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${flow.is_enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {flow.is_enabled ? 'Ativo' : 'Pausado'}
                </span>
                <span className="text-[10px] font-bold text-slate-300">#{flow.id}</span>
              </div>
              <p className="font-black text-slate-900 text-sm truncate">{flow.name}</p>
              <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">Gatilho: {flow.trigger_stage}</p>
            </button>
          ))}
        </div>

        {/* Editor de Fluxo */}
        <div className="lg:col-span-3">
          {activeFlow ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm p-8 space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                <div className="flex-1 max-w-md">
                  <input 
                    type="text" 
                    className="text-2xl font-black text-slate-900 bg-transparent border-none focus:ring-0 p-0 w-full"
                    value={activeFlow.name}
                    onChange={async (e) => {
                      const newName = e.target.value;
                      const updated = flows.map(f => f.id === activeFlow.id ? { ...f, name: newName } : f);
                      setFlows(updated);
                      await storageService.saveFlow({ ...activeFlow, name: newName });
                    }}
                  />
                  <div className="flex items-center mt-2 space-x-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gatilho no Estágio:</label>
                    <select 
                      className="text-[10px] font-black bg-slate-50 border-none rounded-lg focus:ring-0 uppercase tracking-widest text-indigo-600"
                      value={activeFlow.trigger_stage}
                      onChange={async (e) => {
                        const newStage = e.target.value as SalesStage;
                        const updated = flows.map(f => f.id === activeFlow.id ? { ...f, trigger_stage: newStage } : f);
                        setFlows(updated);
                        await storageService.saveFlow({ ...activeFlow, trigger_stage: newStage });
                      }}
                    >
                      {Object.values(SalesStage).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => deleteFlow(activeFlow.id)}
                    className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button 
                    onClick={async () => {
                      const newState = !activeFlow.is_enabled;
                      const updated = flows.map(f => f.id === activeFlow.id ? { ...f, is_enabled: newState } : f);
                      setFlows(updated);
                      await storageService.saveFlow({ ...activeFlow, is_enabled: newState });
                    }}
                    className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      activeFlow.is_enabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {activeFlow.is_enabled ? 'Fluxo Ativo' : 'Fluxo Pausado'}
                  </button>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-6 relative">
                {activeFlow.steps.length > 0 && <div className="absolute left-6 top-8 bottom-8 w-1 bg-slate-50 z-0"></div>}
                {activeFlow.steps.map((step, idx) => (
                  <div key={step.id} className="relative z-10 flex items-start space-x-6 animate-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 font-black shadow-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 bg-slate-50/50 rounded-3xl p-6 border border-slate-100 hover:border-indigo-200 transition-all group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="p-2 bg-white rounded-xl text-indigo-500 shadow-sm">
                            {step.type === 'text' && <Type size={16} />}
                            {step.type === 'image' && <ImageIcon size={16} />}
                            {step.type === 'audio' && <Mic size={16} />}
                            {step.type === 'video' && <Video size={16} />}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Passo {idx + 1}: {step.type}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                           <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                             <Clock size={12} className="text-slate-400" />
                             <input 
                               type="number" 
                               className="w-12 bg-transparent border-none p-0 text-[11px] font-black text-slate-700 focus:ring-0"
                               value={step.delay}
                               onChange={(e) => updateStep(activeFlow.id, step.id, { delay: parseInt(e.target.value) })}
                             />
                             <span className="text-[10px] font-bold text-slate-300">ms</span>
                           </div>
                           <button onClick={() => deleteStep(activeFlow.id, step.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                      
                      {step.type === 'text' ? (
                        <textarea 
                          className="w-full bg-white border border-slate-100 rounded-2xl p-4 text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all resize-none h-24"
                          placeholder="Digite a mensagem automática..."
                          value={step.content}
                          onChange={(e) => updateStep(activeFlow.id, step.id, { content: e.target.value })}
                        />
                      ) : (
                        <div className="space-y-3">
                          <input 
                            type="text" 
                            className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-xs font-mono text-slate-500 focus:ring-0"
                            placeholder="URL do arquivo ou base64..."
                            value={step.content}
                            onChange={(e) => updateStep(activeFlow.id, step.id, { content: e.target.value })}
                          />
                          <p className="text-[10px] text-slate-400 italic">* Utilize URLs do Firebase, S3 ou Base64 direto de ferramentas de conversão.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Step Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 pl-12">
                   <AddStepBtn onClick={() => addStep(activeFlow.id, 'text')} icon={<Type size={16}/>} label="Texto" />
                   <AddStepBtn onClick={() => addStep(activeFlow.id, 'audio')} icon={<Mic size={16}/>} label="Áudio" />
                   <AddStepBtn onClick={() => addStep(activeFlow.id, 'image')} icon={<ImageIcon size={16}/>} label="Imagem" />
                   <AddStepBtn onClick={() => addStep(activeFlow.id, 'video')} icon={<Video size={16}/>} label="Vídeo" />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[2.5rem] border border-slate-100 opacity-60">
               <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-6">
                 <Play size={40} className="text-indigo-200" />
               </div>
               <h3 className="text-xl font-black text-slate-900 mb-2">Editor de Fluxo</h3>
               <p className="text-sm font-medium text-slate-500 max-w-xs">Selecione um fluxo na barra lateral ou crie um novo para começar a automatizar seu processo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AddStepBtn = ({ onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm active:scale-95 text-[11px] font-black uppercase tracking-widest text-slate-500"
  >
    {icon}
    <span>+ {label}</span>
  </button>
);

export default FlowBuilder;
