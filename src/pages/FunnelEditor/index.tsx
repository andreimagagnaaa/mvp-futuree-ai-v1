import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { funnelService } from '../../services/funnelService';
import { Funnel, Stage } from '../../types';
import { FunnelStageVisual } from '../../components/FunnelStageVisual';
import { FunnelEditor } from '../../components/FunnelEditor';
import * as S from './styles';

export const FunnelEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadFunnel = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await funnelService.getFunnel(id);
          setFunnel(data);
        }
      } catch (error) {
        console.error('Erro ao carregar funil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFunnel();
  }, [id]);

  const handleStagesChange = async (newStages: Stage[]) => {
    if (!funnel) return;

    try {
      setSaving(true);
      const updatedFunnel = { ...funnel, stages: newStages };
      await funnelService.updateFunnel(updatedFunnel);
      setFunnel(updatedFunnel);
    } catch (error) {
      console.error('Erro ao atualizar funil:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <S.LoadingState>Carregando...</S.LoadingState>;
  }

  if (!funnel) {
    return <S.ErrorState>Funil não encontrado</S.ErrorState>;
  }

  return (
    <S.Container>
      <S.Header>
        <S.HeaderContent>
          <S.Title>
            <h1>{funnel.name}</h1>
            <S.EditButton>Editar Nome</S.EditButton>
          </S.Title>
          <S.Actions>
            <S.Button onClick={() => navigate('/funnels')}>Voltar</S.Button>
            <S.SaveButton saving={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </S.SaveButton>
          </S.Actions>
        </S.HeaderContent>
      </S.Header>

      <S.Content>
        <S.Section>
          <FunnelEditor 
            stages={funnel.stages} 
            onChange={handleStagesChange}
          />
        </S.Section>

        <S.Section>
          <S.SectionTitle>Visualização do Funil</S.SectionTitle>
          <FunnelStageVisual 
            stages={funnel.stages}
            onStageClick={(stage) => console.log('Stage clicked:', stage)}
          />
        </S.Section>
      </S.Content>
    </S.Container>
  );
}; 