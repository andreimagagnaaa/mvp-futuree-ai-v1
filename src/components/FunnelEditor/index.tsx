import { useState } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult 
} from 'react-beautiful-dnd';
import { 
  Add, 
  DragIndicator, 
  Edit, 
  Delete,
  TrendingUp,
  People,
  AttachMoney
} from '@mui/icons-material';
import { Stage } from '../../types';
import * as S from './styles';

interface FunnelEditorProps {
  stages: Stage[];
  onChange: (stages: Stage[]) => void;
}

const stageTypes = [
  { value: 'lead', label: 'Lead', icon: <People />, color: '#3b82f6' },
  { value: 'opportunity', label: 'Oportunidade', icon: <TrendingUp />, color: '#f59e0b' },
  { value: 'sale', label: 'Venda', icon: <AttachMoney />, color: '#10b981' }
];

export const FunnelEditor = ({ stages, onChange }: FunnelEditorProps) => {
  const [editingStage, setEditingStage] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(stages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const handleAddStage = () => {
    const newStage: Stage = {
      id: `stage-${Date.now()}`,
      name: 'Nova Etapa',
      type: 'lead',
      metrics: {
        count: 0,
        conversionRate: 0,
        revenue: 0,
        averageTicket: 0
      }
    };
    onChange([...stages, newStage]);
  };

  const handleUpdateStage = (id: string, updates: Partial<Stage>) => {
    onChange(stages.map(stage => 
      stage.id === id ? { ...stage, ...updates } : stage
    ));
    setEditingStage(null);
  };

  const handleDeleteStage = (id: string) => {
    onChange(stages.filter(stage => stage.id !== id));
  };

  return (
    <S.Container>
      <S.Header>
        <h2>Configure as etapas do seu funil</h2>
        <S.AddButton onClick={handleAddStage}>
          <Add /> Adicionar Etapa
        </S.AddButton>
      </S.Header>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stages">
          {(provided) => (
            <S.StagesList {...provided.droppableProps} ref={provided.innerRef}>
              {stages.map((stage, index) => (
                <Draggable key={stage.id} draggableId={stage.id} index={index}>
                  {(provided, snapshot) => (
                    <S.StageItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      isDragging={snapshot.isDragging}
                    >
                      <S.DragHandle {...provided.dragHandleProps}>
                        <DragIndicator />
                      </S.DragHandle>

                      {editingStage === stage.id ? (
                        <S.EditForm>
                          <S.Input
                            type="text"
                            defaultValue={stage.name}
                            onBlur={(e) => handleUpdateStage(stage.id, { name: e.target.value })}
                            autoFocus
                          />
                          <S.Select
                            value={stage.type}
                            onChange={(e) => handleUpdateStage(stage.id, { type: e.target.value })}
                          >
                            {stageTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </S.Select>
                        </S.EditForm>
                      ) : (
                        <S.StageContent type={stage.type}>
                          <S.StageIcon type={stage.type}>
                            {stageTypes.find(t => t.value === stage.type)?.icon}
                          </S.StageIcon>
                          <S.StageName>{stage.name}</S.StageName>
                          <S.StageType>{stageTypes.find(t => t.value === stage.type)?.label}</S.StageType>
                        </S.StageContent>
                      )}

                      <S.Actions>
                        <S.ActionButton onClick={() => setEditingStage(stage.id)}>
                          <Edit />
                        </S.ActionButton>
                        <S.ActionButton onClick={() => handleDeleteStage(stage.id)}>
                          <Delete />
                        </S.ActionButton>
                      </S.Actions>
                    </S.StageItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </S.StagesList>
          )}
        </Droppable>
      </DragDropContext>

      <S.Tips>
        <S.Tip>
          <strong>💡 Dica:</strong> Arraste as etapas para reordenar
        </S.Tip>
        <S.Tip>
          <strong>📊 Recomendação:</strong> Um funil eficiente tem entre 3 e 5 etapas
        </S.Tip>
      </S.Tips>
    </S.Container>
  );
}; 