
export enum SalesStage {
  INICIO = 'inicio',
  QUALIFICACAO = 'qualificacao',
  DIAGNOSTICO = 'diagnostico',
  APRESENTACAO = 'apresentacao',
  OBJECAO = 'objecao',
  OFERTA = 'oferta',
  FECHAMENTO = 'fechamento',
  POS_VENDA = 'pos_venda'
}

export enum LeadStatus {
  ATIVO = 'ativo',
  CONVERTIDO = 'convertido',
  PERDIDO = 'perdido'
}

export enum LeadTemperature {
  FRIO = 'frio',
  MORNO = 'morno',
  QUENTE = 'quente'
}

export type MessageType = 'text' | 'image' | 'audio' | 'video';

export interface Lead {
  id: string;
  user_id?: string;
  phone: string;
  name: string;
  sales_stage: SalesStage;
  temperature: LeadTemperature;
  status: LeadStatus;
  created_at: number;
  last_activity: number;
  follow_up_count: number;
}

export interface Message {
  id: string;
  lead_id: string;
  direction: 'inbound' | 'outbound';
  type: MessageType;
  content: string;
  created_at: number;
}

export interface FlowStep {
  id: string;
  type: MessageType;
  content: string;
  delay: number;
}

export interface Flow {
  id: string;
  user_id?: string;
  name: string;
  trigger_stage: SalesStage;
  steps: FlowStep[];
  is_enabled: boolean;
}

export interface SalesSettings {
  id?: string;
  sales_prompt: string;
  objection_scripts: { [key: string]: string };
  message_limit: number;
  used_messages: number;
  payment_link: string;
  business_name: string;
  whatsapp_api_key: string;
  whatsapp_instance_id: string;
  whatsapp_server_url: string; // URL da API de Gateway (Evolution, Z-API, etc)
  connection_status: 'disconnected' | 'connecting' | 'connected';
  is_active: boolean;
  is_test_mode: boolean;
  subscription_status: 'trial' | 'active' | 'expired';
  last_error?: string;
}
