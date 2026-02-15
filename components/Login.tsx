
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
  Rocket, Mail, Lock, Loader2, Sparkles, ChevronRight, 
  AlertCircle, Briefcase, User, Smartphone, ArrowLeft, 
  CheckCircle, ShieldCheck, Zap, BarChart3, MessageSquare, 
  Globe, Shield, Star, Play, X, HeartHandshake, Users2, 
  TrendingUp, Send, Bot, CheckCheck, ShieldPlus, ChevronDown,
  Building2, ShoppingCart, Stethoscope, GraduationCap
} from 'lucide-react';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<{message: string, isRateLimit: boolean} | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              business_name: businessName,
              whatsapp_contact: whatsapp,
              plan_type: 'trial',
              is_test_mode: true
            }
          }
        });
        
        if (signUpError) {
          if (signUpError.status === 429 || signUpError.message.includes('rate limit')) {
            throw { 
              message: 'Limite de e-mails atingido. Por favor, tente novamente mais tarde.', 
              isRateLimit: true 
            };
          }
          throw signUpError;
        }
        
        setSuccess('Cadastro realizado! Agora você pode entrar.');
        setIsSignUp(false);
        setStep(1);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError({
        message: err.message || 'Erro na autenticação.',
        isRateLimit: err.isRateLimit || false
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] -z-10"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[60] bg-[#020617]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Rocket className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">AutoSeller<span className="text-indigo-400">.AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-[10px] font-black uppercase tracking-[0.2em]">
            <button onClick={() => scrollToSection('features')} className="hover:text-indigo-400 transition-colors">Tecnologia</button>
            <button onClick={() => scrollToSection('comparison')} className="hover:text-indigo-400 transition-colors">Diferencial</button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-indigo-400 transition-colors">Planos</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-indigo-400 transition-colors">FAQ</button>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => { setShowAuth(true); setIsSignUp(false); }}
              className="text-[10px] font-black uppercase tracking-widest text-white hover:text-indigo-400 transition-colors hidden sm:block"
            >
              Entrar
            </button>
            <button 
              onClick={() => { setShowAuth(true); setIsSignUp(true); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all"
            >
              Começar Agora
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8 animate-in">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <HeartHandshake className="text-emerald-400 w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Inteligência com Empatia Humana</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
              Humanize sua Escala e <span className="text-indigo-500">Venda Mais</span> no WhatsApp.
            </h1>
            <p className="text-lg text-slate-400 max-w-lg leading-relaxed font-medium">
              Pare de perder vendas para robôs robóticos. O AutoSeller entende gírias, contextos e sentimentos, criando uma <span className="text-white font-bold">conexão real</span> que converte leads em clientes fiéis 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => { setShowAuth(true); setIsSignUp(true); }}
                className="bg-white text-slate-900 px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-3 hover:scale-105 transition-all shadow-2xl shadow-white/10"
              >
                <span>Ativar Vendedor Humano</span>
                <ChevronRight size={18} />
              </button>
              <button 
                onClick={() => setShowDemo(true)}
                className="bg-white/5 border border-white/10 text-white px-8 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-white/10 transition-all"
              >
                <Play size={18} fill="currentColor" />
                <span>Ver IA em Ação</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4 pt-4">
               <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <ShieldCheck size={16} className="text-indigo-400" />
                  <span>Chip Protegido</span>
               </div>
               <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
               <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <span>+40% de Conversão</span>
               </div>
            </div>
          </div>

          {/* Product Preview Card */}
          <div className="relative group perspective-1000">
             <div className="absolute inset-0 bg-indigo-600/30 blur-[120px] -z-10 group-hover:bg-indigo-600/40 transition-all"></div>
             <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 shadow-3xl transform group-hover:rotate-x-2 transition-transform duration-700">
                <div className="bg-[#020617] rounded-[2.5rem] overflow-hidden border border-white/5 h-[400px] flex flex-col font-mono text-[11px]">
                   <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                      <div className="flex space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                      </div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sentient Sales Mode</span>
                   </div>
                   <div className="flex-1 p-6 space-y-4">
                      <p className="text-emerald-400 flex items-center space-x-2">
                        <span className="opacity-50">10:45</span>
                        <span className="font-bold">>> Lead: "Achei o valor um pouco puxado pra mim agora..."</span>
                      </p>
                      <p className="text-indigo-400 flex items-center space-x-2">
                         <span className="opacity-50">10:45</span>
                         <span className="font-bold">>> IA: [EMPATIA_NIVEL_3] + [CONTORNO_OBJECAO]</span>
                      </p>
                      <p className="text-slate-300 ml-4 bg-white/5 p-4 rounded-2xl border border-white/5 leading-relaxed">
                        "Poxa, eu te entendo perfeitamente! Investir no crescimento dá um frio na barriga mesmo. Mas pensa comigo: se você fechar apenas 2 clientes novos com a nossa ajuda, o sistema já se paga. Quer que eu veja uma condição de parcelamento pra te ajudar a começar hoje?"
                      </p>
                      <p className="text-emerald-400 flex items-center space-x-2 font-black uppercase">
                         <span>>> RESULTADO: CLIENTE CONVENCIDO POR CONEXÃO</span>
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Social Proof Bar */}
      <div className="py-12 border-y border-white/5 bg-slate-950/20">
         <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-8">Empresas que confiam no nosso atendimento humanizado</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
               <div className="text-2xl font-black tracking-tighter text-white">BRAZIL<span className="text-indigo-500">TECH</span></div>
               <div className="text-2xl font-black tracking-tighter text-white">VENDAS<span className="text-indigo-500">MAX</span></div>
               <div className="text-2xl font-black tracking-tighter text-white">SAAS<span className="text-indigo-500">FLOW</span></div>
               <div className="text-2xl font-black tracking-tighter text-white">GROWTH<span className="text-indigo-500">AI</span></div>
               <div className="text-2xl font-black tracking-tighter text-white">SCALE<span className="text-indigo-500">HUB</span></div>
            </div>
         </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-black text-white tracking-tighter">O Fim das Respostas <span className="text-indigo-500">Robóticas.</span></h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">Nossa tecnologia foi treinada em milhões de conversas de vendas reais no Brasil para garantir que seu cliente se sinta ouvido.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users2 className="text-indigo-400" />}
              title="Escuta Ativa"
              desc="A IA não apenas 'despeja' informação. Ela analisa a dor do cliente e responde de forma empática e consultiva."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-emerald-500" />}
              title="Proteção de Chip"
              desc="Padrões de digitação humanos e intervalos inteligentes que evitam bloqueios e banimentos."
            />
            <FeatureCard 
              icon={<TrendingUp className="text-amber-500" />}
              title="Fechador Implacável"
              desc="Detecta o momento exato de enviar o link de checkout e fechar o pedido de forma natural."
            />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white tracking-tighter">Por que somos <span className="text-indigo-500">Diferentes?</span></h2>
              <p className="text-slate-500 font-medium mt-4">A maioria dos robôs afasta clientes. O AutoSeller aproxima.</p>
           </div>

           <div className="bg-slate-900/40 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                 <thead className="bg-white/5 border-b border-white/5">
                    <tr>
                       <th className="p-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">Atributo</th>
                       <th className="p-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">Chatbots Comuns</th>
                       <th className="p-8 text-[10px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-500/5">AutoSeller AI</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    <ComparisonRow label="Tom de Voz" old="Frio e Limitado" modern="Caloroso e Humano" />
                    <ComparisonRow label="Entendimento de Gírias" old="Nenhum" modern="Completo (Nativo BR)" />
                    <ComparisonRow label="Resolução de Conflitos" old="Menu de Opções" modern="Diálogo Inteligente" />
                    <ComparisonRow label="Gatilhos Mentais" old="Inexistentes" modern="Estratégicos e Fluídos" />
                    <ComparisonRow label="Taxa de Abandono" old="Alta (Robô detectado)" modern="Baixa (Conexão gerada)" />
                 </tbody>
              </table>
           </div>
        </div>
      </section>

      {/* Niches Section */}
      <section className="py-24 px-6 bg-indigo-600/5">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-black text-white tracking-tighter">Venda Mais em <span className="text-indigo-500">Qualquer Mercado.</span></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <NicheCard icon={<GraduationCap />} title="Infoprodutos" desc="Venda cursos e mentorias quebrando objeções no automático." />
               <NicheCard icon={<Building2 />} title="Imobiliárias" desc="Qualifique leads interessados e agende visitas sem esforço." />
               <NicheCard icon={<Stethoscope />} title="Clínicas" desc="Confirmação de consultas e triagem humanizada 24h." />
               <NicheCard icon={<ShoppingCart />} title="E-commerce" desc="Recupere carrinhos e tire dúvidas sobre frete e produtos." />
            </div>
         </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6">
         <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-black text-white tracking-tighter">Perguntas <span className="text-indigo-500">Frequentes.</span></h2>
            </div>
            <div className="space-y-4">
               <FaqItem 
                  index={0} 
                  active={activeFaq} 
                  setActive={setActiveFaq}
                  question="O cliente percebe que é uma IA?"
                  answer="Nosso motor de NLP foi afinado para usar gírias brasileiras e pausas de digitação. Em 95% dos casos, o cliente acredita estar falando com um atendente humano dedicado."
               />
               <FaqItem 
                  index={1} 
                  active={activeFaq} 
                  setActive={setActiveFaq}
                  question="Posso usar meu próprio número?"
                  answer="Sim! Você conecta seu WhatsApp via QR Code de forma simples e segura, mantendo seu número comercial oficial."
               />
               <FaqItem 
                  index={2} 
                  active={activeFaq} 
                  setActive={setActiveFaq}
                  question="A IA consegue enviar áudios?"
                  answer="Com certeza. Você pode configurar áudios pré-gravados para que a IA os envie no momento certo da conversa, simulando um envio em tempo real."
               />
               <FaqItem 
                  index={3} 
                  active={activeFaq} 
                  setActive={setActiveFaq}
                  question="Como funciona a garantia?"
                  answer="Oferecemos 7 dias de garantia incondicional. Se não notar uma melhora na qualidade do seu atendimento, devolvemos seu dinheiro."
               />
            </div>
         </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-slate-950/50">
         <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-black text-white tracking-tighter mb-4">Planos que <span className="text-indigo-500">Se Pagam Sozinhos.</span></h2>
            <p className="text-slate-500 font-medium mb-16">Escolha a potência do seu motor de vendas.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <PriceCard 
                  tier="Iniciante"
                  price="Gratis"
                  features={['50 mensagens inclusas', 'IA Humanizada', 'Painel de Gestão']}
                  onAction={() => { setShowAuth(true); setIsSignUp(true); }}
               />
               <PriceCard 
                  tier="Professional"
                  price="R$ 197"
                  featured
                  features={['Mensagens Ilimitadas', 'Quebra de Objeções VIP', 'Envio de Áudios', 'Integração Webhook', 'Suporte Prioritário']}
                  onAction={() => { setShowAuth(true); setIsSignUp(true); }}
               />
               <PriceCard 
                  tier="Enterprise"
                  price="R$ 497"
                  features={['Multi-Números', 'Treinamento Customizado', 'API Full Access', 'Gerente de Contas', 'Garantia de Uptime 99.9%']}
                  onAction={() => { setShowAuth(true); setIsSignUp(true); }}
               />
            </div>
         </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-24 px-6 border-t border-white/5">
         <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-12 md:p-20 rounded-[4rem] border border-white/10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="shrink-0">
               <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center border-4 border-indigo-500/30">
                  <ShieldPlus size={80} className="text-indigo-400" />
               </div>
            </div>
            <div className="space-y-6">
               <h2 className="text-3xl font-black text-white tracking-tighter">Sua Venda Protegida</h2>
               <p className="text-slate-400 font-medium leading-relaxed">
                  Estamos tão confiantes no poder humanizado do AutoSeller que oferecemos <span className="text-white font-bold">7 dias de teste sem risco</span>. Se não vender mais, não paga nada.
               </p>
               <button 
                  onClick={() => { setShowAuth(true); setIsSignUp(true); }}
                  className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5"
               >
                  Começar Teste Sem Risco
               </button>
            </div>
         </div>
      </section>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-2xl animate-in">
           <button onClick={() => setShowAuth(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all hover:rotate-90"><X size={32} /></button>
           <div className="w-full max-w-lg">
             <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-3xl relative overflow-hidden">
                <div className="text-center mb-10">
                  <h2 className="text-3xl font-black text-white tracking-tighter mb-2">{isSignUp ? 'Criar sua Máquina' : 'Entrar no Terminal'}</h2>
                  <p className="text-slate-500 font-medium text-sm">Acesse seu motor de vendas inteligente.</p>
                </div>
                <form onSubmit={handleAuth} className="space-y-6">
                  {success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-bold text-center">{success}</div>}
                  {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold text-center">{error.message}</div>}
                  {isSignUp ? (
                    <>
                      {step === 1 ? (
                        <div className="space-y-4 animate-in">
                          <Input icon={<User />} placeholder="Nome Completo" value={fullName} onChange={setFullName} />
                          <Input icon={<Briefcase />} placeholder="Nome da sua Empresa" value={businessName} onChange={setBusinessName} />
                          <Input icon={<Smartphone />} placeholder="WhatsApp (+55...)" value={whatsapp} onChange={setWhatsapp} />
                          <button type="button" onClick={() => (fullName && businessName && whatsapp) ? setStep(2) : setError({message: 'Preencha os campos', isRateLimit: false})} className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2">
                            <span>Próximo Passo</span>
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-in">
                          <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black uppercase text-slate-500 flex items-center mb-4"><ArrowLeft size={14} className="mr-1"/> Voltar</button>
                          <Input icon={<Mail />} type="email" placeholder="E-mail" value={email} onChange={setEmail} />
                          <Input icon={<Lock />} type="password" placeholder="Sua melhor senha" value={password} onChange={setPassword} />
                          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-indigo-500/20 transition-all">
                            {loading ? <Loader2 className="animate-spin" /> : <span>Finalizar Cadastro</span>}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4 animate-in">
                      <Input icon={<Mail />} type="email" placeholder="E-mail" value={email} onChange={setEmail} />
                      <Input icon={<Lock />} type="password" placeholder="Senha" value={password} onChange={setPassword} />
                      <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-indigo-500/20 transition-all">
                        {loading ? <Loader2 className="animate-spin" /> : <span>Acessar Painel</span>}
                      </button>
                    </div>
                  )}
                </form>
                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                   <button onClick={() => { setIsSignUp(!isSignUp); setStep(1); setError(null); }} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                     {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Criar Agora'}
                   </button>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* Demo Interactive Modal - Functional */}
      {showDemo && (
        <DemoModal onClose={() => setShowDemo(false)} onStartTrial={() => { setShowDemo(false); setShowAuth(true); setIsSignUp(true); }} />
      )}

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
          <div className="space-y-4 max-w-xs">
            <div className="flex items-center justify-center md:justify-start space-x-3">
              <div className="p-2 bg-indigo-600 rounded-xl"><Rocket className="text-white w-4 h-4" /></div>
              <span className="text-lg font-black text-white tracking-tighter">AutoSeller<span className="text-indigo-400">.AI</span></span>
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">A revolução das vendas humanizadas via IA.</p>
          </div>
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">© 2024 Terminal AutoSeller . Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

// Sub-components
const ComparisonRow = ({ label, old, modern }: any) => (
  <tr className="group hover:bg-white/5 transition-colors">
    <td className="p-8 text-sm font-bold text-white">{label}</td>
    <td className="p-8 text-sm text-slate-500">{old}</td>
    <td className="p-8 text-sm font-black text-indigo-400 bg-indigo-500/5">{modern}</td>
  </tr>
);

const NicheCard = ({ icon, title, desc }: any) => (
  <div className="bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] hover:border-indigo-500/30 transition-all group">
     <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { size: 24 })}
     </div>
     <h4 className="text-lg font-black text-white mb-2">{title}</h4>
     <p className="text-sm text-slate-500 font-medium">{desc}</p>
  </div>
);

const FaqItem = ({ index, active, setActive, question, answer }: any) => (
  <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden">
     <button 
        onClick={() => setActive(active === index ? null : index)}
        className="w-full p-6 text-left flex items-center justify-between group"
     >
        <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{question}</span>
        <div className={`transition-transform duration-300 ${active === index ? 'rotate-180 text-indigo-400' : 'text-slate-500'}`}>
           <ChevronDown size={20} />
        </div>
     </button>
     {active === index && (
        <div className="px-6 pb-6 animate-in">
           <p className="text-sm text-slate-400 font-medium leading-relaxed">{answer}</p>
        </div>
     )}
  </div>
);

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] space-y-4 hover:border-indigo-500/30 transition-all group">
    <div className="p-4 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

const PriceCard = ({ tier, price, features, featured, onAction }: any) => (
  <div className={`p-10 rounded-[3rem] border transition-all ${featured ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl shadow-indigo-500/20 scale-105 z-10' : 'bg-slate-900/40 border-white/5 text-slate-300'}`}>
    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${featured ? 'text-indigo-200' : 'text-slate-500'}`}>{tier}</p>
    <div className="flex items-end justify-center space-x-1 mb-8">
      <span className="text-4xl font-black tracking-tighter">{price}</span>
      {price !== 'Gratis' && <span className="text-xs font-bold mb-1 opacity-60">/mês</span>}
    </div>
    <ul className="space-y-4 mb-10 text-xs font-bold text-center">
       {features.map((f: string) => <li key={f} className="flex items-center justify-center space-x-2"><CheckCircle size={14} className={featured ? 'text-white' : 'text-indigo-500'} /> <span>{f}</span></li>)}
    </ul>
    <button onClick={onAction} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${featured ? 'bg-white text-indigo-600 hover:bg-slate-100' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>Escolher Este Plano</button>
  </div>
);

const Input = ({ icon, type = 'text', placeholder, value, onChange }: any) => (
  <div className="relative group">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors">{React.cloneElement(icon, { size: 18 })}</div>
    <input type={type} required value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm" />
  </div>
);

// Demo Modal Component
const DemoModal = ({ onClose, onStartTrial }: { onClose: () => void, onStartTrial: () => void }) => {
  const [messages, setMessages] = useState([{ id: '1', direction: 'outbound', text: "Olá! Tudo bem? Sou o consultor virtual da AutoSeller. Me conta, qual o seu nicho e qual sua maior dificuldade hoje em vender pelo WhatsApp?" }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input; setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), direction: 'inbound', text: userMsg }]);
    setIsTyping(true);
    
    // Simulate human-like thinking delay
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "Nossa, entendo perfeitamente! Esse problema de leads que 'somem' é super comum. A boa notícia é que minha IA humanizada consegue manter o engajamento lá no alto, tratando cada lead com a atenção que ele merece. Quer ver como eu montaria um fluxo pra você?",
        "Show de bola! Atendo muitos clientes nesse nicho e o segredo é a agilidade no primeiro contato, mas sem parecer um robô travado. Eu uso gatilhos de empatia pra gerar confiança imediata. Vamos testar?",
        "Entendi! Sabe o que a gente faz nesses casos? Configuramos uma abordagem consultiva. Eu descubro a dor real do lead antes de oferecer o produto. Isso aumenta a conversão em até 40%. Quer experimentar meu painel?"
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), direction: 'outbound', text: randomReply }]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-xl animate-in">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-3xl h-[600px]">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"><Bot className="text-white w-5 h-5" /></div>
            <div><h3 className="text-sm font-black text-white tracking-tight">Vendedor Humano IA</h3><p className="text-[10px] font-bold text-emerald-400 uppercase">Demonstração Interativa</p></div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#020617]/50 no-scrollbar">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.direction === 'inbound' ? 'justify-end' : 'justify-start'} animate-in`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${m.direction === 'inbound' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'}`}>
                {m.text}<div className="flex justify-end mt-1 opacity-40"><CheckCheck size={14} /></div>
              </div>
            </div>
          ))}
          {isTyping && (<div className="flex justify-start"><div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1 border border-white/5"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s] shadow-indigo-500/40"></div><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div></div></div>)}
        </div>
        <div className="p-6 border-t border-white/5 bg-slate-900">
           <div className="relative group">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Fale comigo aqui..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-white focus:outline-none focus:border-indigo-500/50 transition-all text-sm font-medium" />
              <button onClick={handleSend} className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${input.trim() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-600 cursor-not-allowed'}`}><Send size={18} /></button>
           </div>
           <button onClick={onStartTrial} className="w-full mt-4 py-3 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center space-x-2"><span>Impressionado? Garanta sua vaga agora</span><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
};

export default Login;
