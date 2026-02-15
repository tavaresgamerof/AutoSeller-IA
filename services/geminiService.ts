
import { GoogleGenAI, Type } from "@google/genai";
import { storageService } from "./storageService";
import { SalesStage, Lead, Message } from "../types";
import { STAGE_OBJECTIVES } from "../constants";

/**
 * Service to interact with the Gemini API to generate sales responses.
 * Uses systemInstruction and responseSchema as recommended by the @google/genai SDK.
 */
export const getGeminiResponse = async (lead: Lead, userMessage: string): Promise<{ text: string, nextStage?: SalesStage }> => {
  // Fix: Await the async calls to storageService
  const settings = await storageService.getSettings();
  const history = await storageService.getMessages(lead.id);
  
  // Always initialize GoogleGenAI with the apiKey from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Fix: history is now correctly typed as Message[] after await
  const formattedHistory = history.map(m => 
    `${m.direction === 'inbound' ? 'Cliente' : 'Vendedor'}: ${m.content}`
  ).join('\n');

  // Fix: settings is now correctly typed as SalesSettings after await
  const systemInstruction = `
    ${settings.sales_prompt
      .replace('{stage}', lead.sales_stage)
      .replace('{name}', lead.name || 'Cliente')
      .replace('{objective}', STAGE_OBJECTIVES[lead.sales_stage])}
    
    Responda obrigatoriamente no formato JSON estruturado.
  `;

  const contents = `
    HISTÓRICO DA CONVERSA:
    ${formattedHistory}

    NOVA MENSAGEM DO CLIENTE:
    ${userMessage}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      // Fix: Simplified contents parameter to use a string directly
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        // Using responseSchema is the recommended way to get structured output
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "Sua resposta curta e persuasiva para o WhatsApp",
            },
            reasoning: {
              type: Type.STRING,
              description: "Breve explicação do porquê desta resposta",
            },
            next_stage: {
              type: Type.STRING,
              description: "O próximo estágio do funil sugerido (inicio, qualificacao, diagnostico, apresentacao, objecao, oferta, fechamento, pos_venda)",
            },
            customer_name: {
              type: Type.STRING,
              description: "Nome do cliente se descoberto agora, senão mantenha nulo",
            }
          },
          required: ["reply", "next_stage"],
        }
      }
    });

    // Directly access the .text property of the response object.
    const result = JSON.parse(response.text || '{}');
    
    // Update usage tracking
    settings.used_messages += 1;
    // Fix: Await the updateSettings call
    await storageService.updateSettings(settings);

    return {
      text: result.reply || "Olá! Como posso te ajudar hoje?",
      nextStage: result.next_stage as SalesStage
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "Olá! Desculpe, tive uma instabilidade técnica momentânea. Pode repetir o que disse?" };
  }
};
