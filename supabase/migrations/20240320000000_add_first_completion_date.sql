-- Adiciona a coluna first_completion_date
ALTER TABLE task_progress
ADD COLUMN first_completion_date TIMESTAMP WITH TIME ZONE;

-- Função para gerenciar a data da primeira conclusão
CREATE OR REPLACE FUNCTION manage_first_completion() 
RETURNS TRIGGER AS $$
BEGIN
    -- Se a tarefa está sendo marcada como completed e ainda não tem first_completion_date
    IF NEW.status = 'completed' AND NEW.first_completion_date IS NULL THEN
        NEW.first_completion_date := CURRENT_TIMESTAMP;
    END IF;
    
    -- Nunca permite que first_completion_date seja alterado depois de definido
    IF OLD.first_completion_date IS NOT NULL THEN
        NEW.first_completion_date := OLD.first_completion_date;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria o trigger para gerenciar automaticamente first_completion_date
CREATE TRIGGER tr_manage_first_completion
    BEFORE INSERT OR UPDATE ON task_progress
    FOR EACH ROW
    EXECUTE FUNCTION manage_first_completion();

-- Atualiza registros existentes que já estão completed
UPDATE task_progress
SET first_completion_date = updated_at
WHERE status = 'completed' AND first_completion_date IS NULL; 