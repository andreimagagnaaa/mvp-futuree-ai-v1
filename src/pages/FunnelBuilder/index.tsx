import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Add, 
  TrendingUp, 
  People, 
  Assessment,
  Warning,
  FilterList
} from '@mui/icons-material';
import { FunnelCard } from '../../components/FunnelCard';
import { TemplateCard } from '../../components/TemplateCard';
import { Funnel } from '../../types';
import * as S from './styles';
import { FunnelVisualization } from '../../components/FunnelVisualization';
import { funnelService } from '../../services/funnelService';
import { auth } from '../../firebase/firebaseConfig';
import { FunnelGapsCard } from '../../components/FunnelGapsCard';

const templates = [
  {
    id: 'marketing',
    title: 'Funil de Marketing',
    description: 'Ideal para qualificação progressiva de leads.',
    stages: [
      { 
        id: 'lead',
        name: 'Lead',
        type: 'lead',
        metrics: {
          count: 0,
          conversionRate: 0
        }
      },
      { 
        id: 'mql',
        name: 'MQL',
        type: 'lead',
        metrics: {
          count: 0,
          conversionRate: 0
        }
      },
      { 
        id: 'sql', 
        name: 'SQL',
        type: 'opportunity',
        metrics: {
          count: 0,
          conversionRate: 0
        }
      },
      { 
        id: 'deal',
        name: 'Deal',
        type: 'sale',
        metrics: {
          count: 0,
          conversionRate: 0,
          revenue: 0,
          averageTicket: 0
        }
      }
    ]
  },
  {
    id: 'sales',
    title: 'Funil de Vendas Diretas',
    description: 'Perfeito para equipes comerciais B2B.',
    stages: [
      { id: '1', name: 'Prospecção', type: 'lead' },
      { id: '2', name: 'Qualificação', type: 'opportunity' },
      { id: '3', name: 'Proposta', type: 'opportunity' },
      { id: '4', name: 'Fechamento', type: 'sale' }
    ]
  },
  {
    id: 'upsell',
    title: 'Funil de Upsell',
    description: 'Aumente o valor médio por cliente.',
    stages: [
      { id: '1', name: 'Clientes Ativos', type: 'lead' },
      { id: '2', name: 'Oportunidade Identificada', type: 'opportunity' },
      { id: '3', name: 'Proposta de Upgrade', type: 'opportunity' },
      { id: '4', name: 'Upgrade Realizado', type: 'sale' }
    ]
  }
];

export const FunnelBuilder = () => {
  const navigate = useNavigate();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadFunnels();
  }, []);

  const loadFunnels = async () => {
    try {
      setLoading(true);
      const data = await funnelService.getFunnels(auth.currentUser?.uid || '');
      setFunnels(data);
    } catch (error) {
      console.error('Erro ao carregar funis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (funnel: Funnel) => {
    navigate(`/funnels/${funnel.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    try {
      await funnelService.deleteFunnel(id, auth.currentUser?.uid || '');
      loadFunnels();
    } catch (error) {
      console.error('Erro ao deletar funil:', error);
    }
  };

  const handleGapAction = (gapType: string) => {
    switch (gapType) {
      case 'conversion':
        console.log('Analisando problemas de conversão...');
        break;
      case 'volume':
        console.log('Analisando volume de leads...');
        break;
      case 'velocity':
        console.log('Analisando velocidade do funil...');
        break;
    }
  };

  return (
    <S.Container>
      <S.Content>
        <S.Section>
          <S.SectionHeader>
            <div>
              <S.SectionTitle>Funis de Vendas</S.SectionTitle>
              <S.SectionSubtitle>
                Gerencie seus funis de vendas e acompanhe resultados
              </S.SectionSubtitle>
            </div>
            <S.CreateButton onClick={() => navigate('/funnels/new')}>
              <Add /> Criar Novo Funil
            </S.CreateButton>
          </S.SectionHeader>

          {loading ? (
            <S.LoadingState>
              <S.Spinner />
              <span>Carregando funis...</span>
            </S.LoadingState>
          ) : (
            <>
              {/* Grid de Funis */}
              <S.FunnelGrid>
                {funnels.map(funnel => (
                  <FunnelCard
                    key={funnel.id}
                    funnel={funnel}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </S.FunnelGrid>

              {/* Card de Diagnóstico */}
              {funnels.length > 0 && (
                <S.DiagnosticCard>
                  <S.DiagnosticHeader>
                    <Warning sx={{ color: '#f59e0b' }} />
                    <h3>Diagnóstico de Performance</h3>
                  </S.DiagnosticHeader>
                  
                  <FunnelGapsCard 
                    funnel={funnels[0]}
                    onActionClick={handleGapAction}
                  />
                </S.DiagnosticCard>
              )}
            </>
          )}
        </S.Section>
      </S.Content>
    </S.Container>
  );
}; 