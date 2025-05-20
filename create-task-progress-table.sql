-- Criar extensão uuid-ossp se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Remover a tabela se existir
DROP TABLE IF EXISTS task_progress;

-- Criar a tabela
CREATE TABLE task_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_status CHECK (status IN ('pending', 'in_progress', 'completed'))
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_task_progress_user_id ON task_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_task_id ON task_progress(task_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_status ON task_progress(status);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_task_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS set_task_progress_updated_at ON task_progress;
CREATE TRIGGER set_task_progress_updated_at
    BEFORE UPDATE ON task_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_task_progress_updated_at();

-- Habilitar RLS
ALTER TABLE task_progress ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações
DROP POLICY IF EXISTS "Permitir todas as operações" ON task_progress;
CREATE POLICY "Permitir todas as operações"
    ON task_progress
    FOR ALL
    USING (true)
    WITH CHECK (true); 