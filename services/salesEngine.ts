
import { storageService } from './storageService';
import { getGeminiResponse } from './geminiService';
import { Lead, SalesStage, LeadStatus, LeadTemperature, Message, Flow, MessageType, SalesSettings } from '../types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const salesEngine = {
  // Busca o QR Code real do servidor configurado
  getQrCode: async (settings: SalesSettings) => {
    if (!settings.whatsapp_server_url || !settings.whatsapp_instance_id) {
      throw new Error("Configure a URL do servidor e o ID da instância primeiro.");
    }
    
    try {
      // Tenta buscar da Evolution API (padrão de mercado)
      const response = await fetch(`${settings.whatsapp_server_url}/instance/connect/${settings.whatsapp_instance_id}`, {
        method: 'GET',
        headers: { 
          'apikey': settings.whatsapp_api_key || '',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Se o gateway retornar base64 diretamente
        return data.base64 || data.qrcode || data.code;
      }

      // Se falhar a conexão real, mantém a simulação para demonstração visual
      console.warn("Servidor de gateway não respondeu. Usando modo simulado.");
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=INSTANCIA_${settings.whatsapp_instance_id}`;
    } catch (e) {
      console.error("Erro ao obter QR Code:", e);
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ERROR_CONNECTION`;
    }
  },

  checkConnection: async (settings: SalesSettings) => {
    if (!settings.whatsapp_server_url) return false;
    try {
      const response = await fetch(`${settings.whatsapp_server_url}/instance/connectionStatus/${settings.whatsapp_instance_id}`, {
        headers: { 'apikey': settings.whatsapp_api_key || '' }
      });
      const data = await response.json();
      return data.instance?.state === 'open' || data.status === 'connected';
    } catch (e) {
      return false;
    }
  },

  sendRealMessage: async (phone: string, content: string, type: MessageType = 'text') => {
    const settings = await storageService.getSettings();
    if (!settings.is_active || settings.connection_status !== 'connected') {
      return false;
    }

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const endpoint = `${settings.whatsapp_server_url}/message/sendText/${settings.whatsapp_instance_id}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': settings.whatsapp_api_key || ''
        },
        body: JSON.stringify({
          number: cleanPhone,
          options: { delay: 1200, presence: "composing" },
          text: content
        })
      });
      
      return response.ok;
    } catch (e: any) {
      console.error("Erro no envio real:", e);
      return false;
    }
  },

  handleInboundMessage: async (phone: string, content: string) => {
    let lead = await storageService.getLeadByPhone(phone);
    const settings = await storageService.getSettings();

    if (settings.used_messages >= settings.message_limit) {
      return;
    }

    if (!lead) {
      lead = {
        id: Math.random().toString(36).substr(2, 9),
        phone,
        name: '',
        sales_stage: SalesStage.INICIO,
        temperature: LeadTemperature.FRIO,
        status: LeadStatus.ATIVO,
        created_at: Date.now(),
        last_activity: Date.now(),
        follow_up_count: 0
      };
      await storageService.saveLead(lead);
    }

    await storageService.saveMessage({
      id: Math.random().toString(36).substr(2, 9),
      lead_id: lead.id,
      direction: 'inbound',
      type: 'text',
      content,
      created_at: Date.now()
    });

    const { text, nextStage } = await getGeminiResponse(lead, content);

    const aiMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      lead_id: lead.id,
      direction: 'outbound',
      type: 'text',
      content: text,
      created_at: Date.now()
    };
    await storageService.saveMessage(aiMsg);

    if (settings.is_active && settings.connection_status === 'connected') {
      await salesEngine.sendRealMessage(phone, text);
    }

    const oldStage = lead.sales_stage;
    lead.last_activity = Date.now();
    
    if (nextStage && nextStage !== oldStage) {
      lead.sales_stage = nextStage;
      const flows = await storageService.getFlows();
      const triggerFlow = flows.find(f => f.trigger_stage === nextStage && f.is_enabled);
      if (triggerFlow) salesEngine.executeFlow(lead, triggerFlow);
    }
    
    await storageService.saveLead(lead);
    return { lead, reply: text };
  },

  executeFlow: async (lead: Lead, flow: Flow) => {
    const settings = await storageService.getSettings();
    for (const step of flow.steps) {
      if (settings.used_messages >= settings.message_limit) break;
      await sleep(step.delay);
      
      const outboundMsg: Message = {
        id: Math.random().toString(36).substr(2, 9),
        lead_id: lead.id,
        direction: 'outbound',
        type: step.type,
        content: step.content,
        created_at: Date.now()
      };
      
      await storageService.saveMessage(outboundMsg);
      if (settings.is_active && settings.connection_status === 'connected') {
        await salesEngine.sendRealMessage(lead.phone, step.content, step.type);
      }
      settings.used_messages += 1;
      await storageService.updateSettings(settings);
    }
  }
};
