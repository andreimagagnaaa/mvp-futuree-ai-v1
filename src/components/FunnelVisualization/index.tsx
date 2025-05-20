import { useMemo } from 'react';
import { Funnel } from '../../types';
import * as S from './styles';

interface FunnelVisualizationProps {
  funnel: Funnel;
}

export const FunnelVisualization = ({ funnel }: FunnelVisualizationProps) => {
  const stageMetrics = useMemo(() => {
    const totalLeads = funnel.stages[0]?.metrics?.count || 0;
    
    return funnel.stages.map((stage, index) => {
      const count = stage.metrics?.count || 0;
      const previousCount = index > 0 ? funnel.stages[index - 1]?.metrics?.count || 1 : totalLeads;
      const conversionRate = ((count / previousCount) * 100).toFixed(1);
      const width = Math.max(((count / totalLeads) * 100), 20); // Mínimo de 20% para visualização
      
      return {
        ...stage,
        width: `${width}%`,
        conversionRate
      };
    });
  }, [funnel]);

  return (
    <S.Container>
      <S.Header>
        <S.Title>{funnel.name}</S.Title>
        <S.TotalLeads>
          {funnel.stages[0]?.metrics?.count || 0} leads totais
        </S.TotalLeads>
      </S.Header>

      <S.FunnelWrapper>
        {stageMetrics.map((stage, index) => (
          <S.StageWrapper key={stage.id} width={stage.width}>
            <S.Stage type={stage.type}>
              <S.StageHeader>
                <S.StageIcon>
                  {stage.type === 'lead' ? '👥' : 
                   stage.type === 'opportunity' ? '🎯' : '💰'}
                </S.StageIcon>
                <S.StageName>{stage.name}</S.StageName>
              </S.StageHeader>

              <S.StageMetrics>
                <S.MetricItem>
                  <strong>{stage.metrics?.count || 0}</strong>
                  <span>leads</span>
                </S.MetricItem>
                {index > 0 && (
                  <S.ConversionRate>
                    <span>Taxa de Conversão</span>
                    <strong>{stage.conversionRate}%</strong>
                  </S.ConversionRate>
                )}
                {stage.type === 'sale' && (
                  <S.Revenue>
                    <span>Receita</span>
                    <strong>R$ {stage.metrics?.revenue || 0}</strong>
                  </S.Revenue>
                )}
              </S.StageMetrics>
            </S.Stage>
          </S.StageWrapper>
        ))}
      </S.FunnelWrapper>
    </S.Container>
  );
}; 