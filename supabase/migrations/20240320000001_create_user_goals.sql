-- Cria a tabela de metas dos usuários
CREATE TABLE user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    area TEXT NOT NULL,
    current_score NUMERIC(3,1) NOT NULL,
    target_score NUMERIC(3,1) NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed')),
    classification TEXT NOT NULL CHECK (classification IN ('precisa melhorar', 'bom', 'excelente')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, area)
);

-- Adiciona trigger para atualizar updated_at
CREATE TRIGGER tr_user_goals_updated_at
    BEFORE UPDATE ON user_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Adiciona políticas de segurança RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias metas"
    ON user_goals FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Usuários podem criar suas próprias metas"
    ON user_goals FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias metas"
    ON user_goals FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Cria índices para melhor performance
CREATE INDEX idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX idx_user_goals_status ON user_goals(status);
CREATE INDEX idx_user_goals_area ON user_goals(area); 