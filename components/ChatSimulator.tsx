
import React, { useState, useEffect, useRef } from 'react';
import { salesEngine } from '../services/salesEngine';
import { storageService } from '../services/storageService';
import { Message, Lead } from '../types';
import { 
  Send, Bot, MoreHorizontal, PhoneCall, 
  PlusCircle, Smile, Wifi, Battery, Signal, 
  ChevronLeft, CheckCheck, Sparkles, Play, Pause, Download, Mic
} from 'lucide-react';

const ChatSimulator: React.FC = () => {
  const [phone, setPhone] = useState('5511999999999');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fix: Changed refreshMessages to async to handle storageService promises
  const refreshMessages = async () => {
    const activeLead = await storageService.getLeadByPhone(phone);
    if (activeLead) {
      setLead(activeLead);
      // Fix: Await messages from storageService
      const msgs = await storageService.getMessages(activeLead.id);
      setMessages(msgs);
    } else {
      setLead(null);
      setMessages([]);
    }
  };

  useEffect(() => {
    refreshMessages();
    const interval = setInterval(refreshMessages, 2000);
    return () => clearInterval(interval);
  }, [phone]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (customInput?: string) => {
    const messageToSend = customInput || input;
    if (!messageToSend.trim() || loading) return;

    if (!customInput) setInput('');
    setLoading(true);

    try {
      const result = await salesEngine.handleInboundMessage(phone, messageToSend);
      if (result) {
        setLead({ ...result.lead });
        setMessages(await storageService.getMessages(result.lead.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const quickReplies = [
    { label: "Tenho interesse!", text: "Olá! Vi seu anúncio e tenho interesse nos serviços." },
    { label: "Qual o valor?", text: "Gostaria de saber os valores e planos disponíveis." },
    { label: "Como funciona?", text: "Pode me explicar como funciona o processo de implementação?" }
  ];

  return (
    <div className="flex flex-col h-[820px] w-full max-w-[420px] mx-auto bg-slate-950 rounded-[3.5rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-[12px] border-slate-900 relative animate-in overflow-hidden">
      
      {/* Dynamic Island */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-3xl z-50 flex items-center justify-center">
        <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
      </div>

      <div className="flex flex-col h-full bg-[#F0F2F5] rounded-[2.8rem] overflow-hidden relative shadow-inner">
        
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-11 flex items-center justify-between px-8 z-40 text-slate-900 font-bold text-[13px]">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5">
            <Signal size={14} />
            <Wifi size={14} />
            <Battery size={18} />
          </div>
        </div>

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 pt-11 pb-4 px-5 flex items-center justify-between z-30 sticky top-0">
          <div className="flex items-center space-x-3">
            <button className="p-1 text-indigo-600"><ChevronLeft size={24} /></button>
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200">
                <Bot className="text-white w-6 h-6" />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-[15px] leading-tight flex items-center">
                Vendedor IA 
                <Sparkles size={12} className="ml-1 text-amber-500 fill-amber-500" />
              </h3>
              <p className="text-[11px] font-medium text-emerald-600">Atendimento Ativo</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="p-2 text-slate-400 hover:text-indigo-600 cursor-pointer"><PhoneCall size={20} /></div>
            <div className="p-2 text-slate-400 hover:text-indigo-600 cursor-pointer"><MoreHorizontal size={20} /></div>
          </div>
        </div>

        {/* Messages Body */}
        <div 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto p-4 space-y-3 pb-32"
          style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')`, backgroundSize: '200px' }}
        >
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.direction === 'inbound' ? 'justify-end' : 'justify-start'} animate-in`}>
              <div className={`relative max-w-[85%] px-4 py-2.5 shadow-sm text-[14px] font-medium leading-[1.4] ${
                m.direction === 'inbound' 
                  ? 'bg-[#D9FDD3] text-slate-800 rounded-2xl rounded-tr-none' 
                  : 'bg-white text-slate-800 rounded-2xl rounded-tl-none'
              }`}>
                {/* Text Content */}
                {m.type === 'text' && <p>{m.content}</p>}

                {/* Image Content */}
                {m.type === 'image' && (
                  <div className="space-y-2">
                    <img src={m.content} className="rounded-xl w-full h-auto max-h-60 object-cover border border-slate-100" alt="Sent" />
                  </div>
                )}

                {/* Audio Content */}
                {m.type === 'audio' && (
                  <div className="flex items-center space-x-3 py-1 min-w-[200px]">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                      <Play size={16} fill="white" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="h-1 bg-slate-200 w-full rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[40%]"></div>
                      </div>
                      <p className="text-[9px] font-black text-slate-400">0:45</p>
                    </div>
                    <Mic size={14} className="text-slate-300" />
                  </div>
                )}

                {/* Video Content */}
                {m.type === 'video' && (
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-200">
                    <video className="w-full h-full object-cover opacity-50" src={m.content} />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                          <Play size={24} className="text-white fill-white ml-1" />
                       </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-1 mt-1 opacity-50">
                  <span className="text-[10px] font-bold">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {m.direction === 'outbound' && <CheckCheck size={14} className="text-indigo-500" />}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-white px-5 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1.5">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-.5s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Area */}
        <div className="absolute bottom-6 left-0 right-0 px-4 z-40">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
              {quickReplies.map((qr, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(qr.text)}
                  className="whitespace-nowrap px-4 py-2 bg-white/90 backdrop-blur-md border border-white rounded-full text-[11px] font-bold text-indigo-600 shadow-sm"
                >
                  {qr.label}
                </button>
              ))}
            </div>

            <div className="bg-white/95 backdrop-blur-xl p-2 rounded-[2rem] shadow-2xl border border-white flex items-center space-x-2">
              <button className="p-2 text-slate-400"><PlusCircle size={24} /></button>
              <div className="flex-1 bg-slate-100/50 rounded-2xl px-4 py-2 flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Mensagem"
                  className="bg-transparent flex-1 text-sm focus:outline-none text-slate-700 font-medium py-1"
                />
                <button className="p-1 text-slate-400"><Smile size={20} /></button>
              </div>
              <button
                onClick={() => handleSend()}
                className={`p-2.5 rounded-full shadow-lg ${input.trim() ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-900/20 rounded-full z-50"></div>
      </div>
    </div>
  );
};

export default ChatSimulator;
