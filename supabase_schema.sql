
-- 1. TABELA DE CONFIGURAÇÕES (SETTINGS)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sales_prompt TEXT,
  objection_scripts JSONB DEFAULT '{}'::jsonb,
  message_limit INTEGER DEFAULT 50,
  used_messages INTEGER DEFAULT 0,
  payment_link TEXT,
  business_name TEXT,
  whatsapp_api_key TEXT,
  whatsapp_instance_id TEXT,
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT FALSE,
  is_test_mode BOOLEAN DEFAULT TRUE,
  subscription_status TEXT DEFAULT 'trial',
  last_error TEXT
);

-- 2. TABELA DE LEADS
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT,
  sales_stage TEXT DEFAULT 'inicio',
  temperature TEXT DEFAULT 'frio',
  status TEXT DEFAULT 'ativo',
  created_at BIGINT NOT NULL,
  last_activity BIGINT NOT NULL,
  follow_up_count INTEGER DEFAULT 0
);

-- 3. TABELA DE MENSAGENS
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  type TEXT CHECK (type IN ('text', 'image', 'audio', 'video')),
  content TEXT,
  created_at BIGINT NOT NULL
);

-- 4. TABELA DE FLUXOS (FLOWS)
CREATE TABLE IF NOT EXISTS flows (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_stage TEXT NOT NULL,
  steps JSONB DEFAULT '[]'::jsonb,
  is_enabled BOOLEAN DEFAULT TRUE
);

-- Habilitar RLS (Seguro executar múltiplas vezes)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas para evitar erro de "already exists" ao recriar
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage their own settings" ON settings;
    DROP POLICY IF EXISTS "Users can manage their own leads" ON leads;
    DROP POLICY IF EXISTS "Users can manage messages of their leads" ON messages;
    DROP POLICY IF EXISTS "Users can manage their own flows" ON flows;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Criar Políticas
CREATE POLICY "Users can manage their own settings" ON settings
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage their own leads" ON leads
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage messages of their leads" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM leads 
      WHERE leads.id = messages.lead_id 
      AND leads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own flows" ON flows
  FOR ALL USING (auth.uid() = user_id);

-- Índices (IF NOT EXISTS disponível no Postgres 9.5+)
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_flows_user_id ON flows(user_id);
