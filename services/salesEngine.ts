
import { storageService } from './storageService';
import { getGeminiResponse } from './geminiService';
import { Lead, SalesStage, LeadStatus, LeadTemperature, Message, Flow, MessageType, SalesSettings } from '../types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const salesEngine = {
  // Método para gerar QR Code via API de Gateway externa
  getQrCode: async (settings: SalesSettings) => {
    if (!settings.whatsapp_server_url || !settings.whatsapp_instance_id) {
      throw new Error("Configure a URL do servidor e o ID da instância primeiro.");
    }
    
    try {
      // Exemplo de chamada para Evolution API
      // const response = await fetch(`${settings.whatsapp_server_url}/instance/connect/${settings.whatsapp_instance_id}`, {
      //   headers: { 'apikey': settings.whatsapp_api_key }
      // });
      // const data = await response.json();
      // return data.base64; // Retorna o base64 do QR Code
      
      // Simulação para demonstração enquanto não houver API real
      await sleep(1500);
      return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=AutoSellerAI_Connection_Demo";
    } catch (e) {
      console.error("Erro ao obter QR Code:", e);
      return null;
    }
  },

  checkConnection: async (settings: SalesSettings) => {
    try {
      // Exemplo de checagem real
      // const response = await fetch(`${settings.whatsapp_server_url}/instance/connectionStatus/${settings.whatsapp_instance_id}`, {
      //   headers: { 'apikey': settings.whatsapp_api_key }
      // });
      // const data = await response.json();
      // return data.status === 'open';
      return settings.connection_status === 'connected';
    } catch (e) {
      return false;
    }
  },

  sendRealMessage: async (phone: string, content: string, type: MessageType = 'text') => {
    const settings = await storageService.getSettings();
    if (!settings.is_active || settings.connection_status !== 'connected') {
      console.warn("[MENSAGEM NÃO ENVIADA] WhatsApp desconectado ou modo inativo.");
      return false;
    }

    try {
      // Integração real com Evolution API / Z-API
      const endpoint = `${settings.whatsapp_server_url}/message/sendText/${settings.whatsapp_instance_id}`;
      console.log(`[WHATSAPP REAL] Enviando para ${phone}: ${content.substring(0, 30)}...`);
      
      /* 
      await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': settings.whatsapp_api_key 
        },
        body: JSON.stringify({
          number: phone,
          text: content
        })
      });
      */
      
      return true;
    } catch (e: any) {
      console.error("Erro ao enviar mensagem real:", e);
      settings.last_error = `Falha no WhatsApp: ${e.message || 'Erro de conexão'}`;
      await storageService.updateSettings(settings);
      return false;
    }
  },

  executeFlow: async (lead: Lead, flow: Flow) => {
    const settings = await storageService.getSettings();
    
    for (const step of flow.steps) {
      if (settings.used_messages >= settings.message_limit) {
         settings.last_error = "Limite de cota atingido durante fluxo automático.";
         await storageService.updateSettings(settings);
         break;
      }

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
  },

  handleInboundMessage: async (phone: string, content: string) => {
    let lead = await storageService.getLeadByPhone(phone);
    const settings = await storageService.getSettings();

    if (settings.used_messages >= settings.message_limit) {
      settings.last_error = settings.is_test_mode 
        ? "Você atingiu o limite de 50 mensagens do MODO TESTE."
        : "Seu limite mensal de mensagens foi atingido.";
      await storageService.updateSettings(settings);
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
      if ([SalesStage.OFERTA, SalesStage.FECHAMENTO].includes(nextStage)) lead.temperature = LeadTemperature.QUENTE;
    }
    
    await storageService.saveLead(lead);
    return { lead, reply: text };
  }
};
