-- Primeiro, vamos verificar se a coluna já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'task_progress'
        AND column_name = 'completed_at'
    ) THEN
        -- Adiciona a coluna completed_at se não existir
        ALTER TABLE task_progress ADD COLUMN completed_at TIMESTAMPTZ DEFAULT NULL;
        RAISE NOTICE 'Coluna completed_at adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna completed_at já existe!';
    END IF;
END $$; 