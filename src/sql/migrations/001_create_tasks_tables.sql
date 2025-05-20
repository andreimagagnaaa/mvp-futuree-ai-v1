-- Criar tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  categoria TEXT NOT NULL,
  prioridade TEXT NOT NULL CHECK (prioridade IN ('Alta', 'Média', 'Baixa')),
  pontuacao TEXT NOT NULL CHECK (pontuacao IN ('bom', 'precisa melhorar')),
  clientType TEXT NOT NULL CHECK (clientType IN ('B2B', 'B2C')),
  userId TEXT NOT NULL,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de progresso das tarefas
CREATE TABLE IF NOT EXISTS task_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  taskId UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  userId TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(taskId, userId)
);

-- Criar função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar o timestamp
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_progress_updated_at
  BEFORE UPDATE ON task_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar políticas RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para tasks
CREATE POLICY "Usuários podem ver suas próprias tarefas"
  ON tasks FOR SELECT
  USING (auth.uid()::text = userId);

CREATE POLICY "Usuários podem criar suas próprias tarefas"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid()::text = userId);

CREATE POLICY "Usuários podem atualizar suas próprias tarefas"
  ON tasks FOR UPDATE
  USING (auth.uid()::text = userId);

-- Políticas para task_progress
CREATE POLICY "Usuários podem ver seu próprio progresso"
  ON task_progress FOR SELECT
  USING (auth.uid()::text = userId);

CREATE POLICY "Usuários podem criar seu próprio progresso"
  ON task_progress FOR INSERT
  WITH CHECK (auth.uid()::text = userId);

CREATE POLICY "Usuários podem atualizar seu próprio progresso"
  ON task_progress FOR UPDATE
  USING (auth.uid()::text = userId);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(userId);
CREATE INDEX IF NOT EXISTS idx_task_progress_user_id ON task_progress(userId);
CREATE INDEX IF NOT EXISTS idx_task_progress_task_id ON task_progress(taskId); 