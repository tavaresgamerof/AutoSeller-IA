
import { supabase } from './supabaseClient';
import { Lead, Message, SalesSettings, Flow } from '../types';
import { DEFAULT_SALES_PROMPT, OBJECTION_SCRIPTS } from '../constants';

export const storageService = {
  // Obter ID do usuário atual de forma segura
  getCurrentUserId: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  },

  // LEADS
  getLeads: async (): Promise<Lead[]> => {
    const userId = await storageService.getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity', { ascending: false });
    
    if (error) return [];
    return data || [];
  },

  saveLead: async (lead: Lead) => {
    const userId = await storageService.getCurrentUserId();
    const { error } = await supabase
      .from('leads')
      .upsert({ ...lead, user_id: userId });
    
    if (error) console.error('Erro ao salvar lead:', error);
  },

  deleteLead: async (leadId: string) => {
    await supabase.from('messages').delete().eq('lead_id', leadId);
    const { error } = await supabase.from('leads').delete().eq('id', leadId);
    if (error) console.error('Erro ao excluir lead:', error);
  },

  getLeadByPhone: async (phone: string): Promise<Lead | undefined> => {
    const userId = await storageService.getCurrentUserId();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('phone', phone)
      .eq('user_id', userId)
      .single();
    
    return data || undefined;
  },

  // MESSAGES
  getMessages: async (leadId: string): Promise<Message[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true });
    
    return data || [];
  },

  saveMessage: async (msg: Message) => {
    await supabase.from('messages').insert(msg);
  },

  // SETTINGS (Agora por Usuário)
  getSettings: async (): Promise<SalesSettings> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const userId = user.id;

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      // Tentar pegar dados do metadado do registro se disponíveis
      const businessName = user.user_metadata?.business_name || 'Minha Empresa Tech';
      
      const defaultSettings: SalesSettings = {
        id: userId,
        sales_prompt: DEFAULT_SALES_PROMPT,
        objection_scripts: OBJECTION_SCRIPTS,
        message_limit: 50, // Limite reduzido para teste
        used_messages: 0,
        payment_link: '',
        business_name: businessName,
        whatsapp_api_key: '',
        whatsapp_instance_id: '',
        webhook_url: `https://api.autoseller.ai/webhook/${userId}`,
        is_active: false,
        is_test_mode: true, // Novo usuário começa em teste
        subscription_status: 'trial'
      };
      
      // Criar configurações iniciais se não existirem
      await supabase.from('settings').insert(defaultSettings);
      return defaultSettings;
    }
    return data;
  },

  updateSettings: async (settings: SalesSettings) => {
    const userId = await storageService.getCurrentUserId();
    const { error } = await supabase
      .from('settings')
      .upsert({ ...settings, id: userId });
    
    if (error) console.error('Erro ao atualizar configurações:', error);
  },

  // FLOWS
  getFlows: async (): Promise<Flow[]> => {
    const userId = await storageService.getCurrentUserId();
    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('user_id', userId);
    
    return data || [];
  },

  saveFlow: async (flow: Flow) => {
    const userId = await storageService.getCurrentUserId();
    await supabase.from('flows').upsert({ ...flow, user_id: userId });
  },

  deleteFlow: async (flowId: string) => {
    await supabase.from('flows').delete().eq('id', flowId);
  }
};
