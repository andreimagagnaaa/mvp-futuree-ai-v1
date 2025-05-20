-- Tabela de Setores
CREATE TABLE sectors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(name, user_id)
);

-- Tabela de Métricas
CREATE TABLE metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'number', 'currency')),
  is_active BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(key, user_id)
);

-- Tabela de Competidores
CREATE TABLE competitors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  market_share NUMERIC DEFAULT 0,
  growth NUMERIC DEFAULT 0,
  social_followers INTEGER DEFAULT 0,
  engagement NUMERIC DEFAULT 0,
  website_traffic INTEGER DEFAULT 0,
  content_frequency INTEGER DEFAULT 0,
  sector TEXT NOT NULL,
  user_id TEXT NOT NULL,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX idx_sectors_user_id ON sectors(user_id);
CREATE INDEX idx_metrics_user_id ON metrics(user_id);
CREATE INDEX idx_competitors_user_id ON competitors(user_id);

-- Políticas de Segurança RLS (Row Level Security)
ALTER TABLE sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;

-- Política para sectors
CREATE POLICY "Usuários podem ver apenas seus próprios setores"
ON sectors FOR ALL
USING (user_id = auth.uid());

-- Política para metrics
CREATE POLICY "Usuários podem ver apenas suas próprias métricas"
ON metrics FOR ALL
USING (user_id = auth.uid());

-- Política para competitors
CREATE POLICY "Usuários podem ver apenas seus próprios competidores"
ON competitors FOR ALL
USING (user_id = auth.uid()); 