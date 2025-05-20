CREATE OR REPLACE FUNCTION create_task_progress_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Criar extensão uuid-ossp se não existir
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Criar a tabela se não existir
    CREATE TABLE IF NOT EXISTS task_progress (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        task_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
        CONSTRAINT check_status CHECK (status IN ('pending', 'in_progress', 'completed'))
    );

    -- Criar índices para otimização
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

    -- Criar políticas de segurança
    DROP POLICY IF EXISTS "Usuários podem ver seu próprio progresso" ON task_progress;
    CREATE POLICY "Usuários podem ver seu próprio progresso"
        ON task_progress FOR SELECT
        USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Usuários podem inserir seu próprio progresso" ON task_progress;
    CREATE POLICY "Usuários podem inserir seu próprio progresso"
        ON task_progress FOR INSERT
        WITH CHECK (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio progresso" ON task_progress;
    CREATE POLICY "Usuários podem atualizar seu próprio progresso"
        ON task_progress FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    RAISE NOTICE 'Tabela task_progress criada/atualizada com sucesso!';
END;
$$; 