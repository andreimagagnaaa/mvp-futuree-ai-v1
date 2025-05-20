-- Criar tabela de progresso das tarefas
CREATE TABLE IF NOT EXISTS public.task_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    taskId TEXT NOT NULL,
    userId TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(taskId, userId)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.task_progress ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura apenas das próprias tarefas
CREATE POLICY "Usuários podem ver apenas seu próprio progresso"
    ON public.task_progress
    FOR SELECT
    USING (auth.uid()::text = userId);

-- Criar política para permitir inserção/atualização apenas das próprias tarefas
CREATE POLICY "Usuários podem atualizar apenas seu próprio progresso"
    ON public.task_progress
    FOR ALL
    USING (auth.uid()::text = userId); 