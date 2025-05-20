import { useState } from 'react';
import { TrendingUp, People, AttachMoney, Timeline } from '@mui/icons-material';
import { Stage } from '../../types';
import * as S from './styles';

interface FunnelStageVisualProps {
  stages: Stage[];
  onStageClick?: (stage: Stage) => void;
}

export const FunnelStageVisual = ({ stages, onStageClick }: FunnelStageVisualProps) => {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  
  const getTotalLeads = () => stages[0]?.metrics?.count || 0;
  
  const getConversionRate = (index: number) => {
    if (index === 0) return 100;
    const currentCount = stages[index].metrics?.count || 0;
    const previousCount = stages[index - 1].metrics?.count || 1;
    return ((currentCount / previousCount) * 100).toFixed(1);
  };

  return (
    <S.Container>
      <S.StagesFlow>
        {stages.map((stage, index) => {
          const isHovered = hoveredStage === stage.id;
          const conversionRate = getConversionRate(index);
          
          return (
            <S.StageBlock
              key={stage.id}
              type={stage.type}
              isHovered={isHovered}
              onClick={() => onStageClick?.(stage)}
              onMouseEnter={() => setHoveredStage(stage.id)}
              onMouseLeave={() => setHoveredStage(null)}
            >
              <S.StageContent>
                <S.StageHeader>
                  <S.StageIcon type={stage.type}>
                    {stage.type === 'lead' ? <People /> : 
                     stage.type === 'opportunity' ? <Timeline /> : 
                     <AttachMoney />}
                  </S.StageIcon>
                  <S.StageName>{stage.name}</S.StageName>
                </S.StageHeader>

                <S.MetricsGrid>
                  <S.MetricCard>
                    <S.MetricIcon>👥</S.MetricIcon>
                    <S.MetricValue>{stage.metrics?.count || 0}</S.MetricValue>
                    <S.MetricLabel>Leads</S.MetricLabel>
                  </S.MetricCard>

                  <S.MetricCard highlight>
                    <S.MetricIcon><TrendingUp /></S.MetricIcon>
                    <S.MetricValue>{conversionRate}%</S.MetricValue>
                    <S.MetricLabel>Conversão</S.MetricLabel>
                  </S.MetricCard>

                  {stage.type === 'sale' && (
                    <S.MetricCard success>
                      <S.MetricIcon>💰</S.MetricIcon>
                      <S.MetricValue>
                        R$ {stage.metrics?.revenue?.toLocaleString() || 0}
                      </S.MetricValue>
                      <S.MetricLabel>Receita</S.MetricLabel>
                    </S.MetricCard>
                  )}
                </S.MetricsGrid>

                <S.StageProgress>
                  <S.ProgressBar 
                    value={(stage.metrics?.count || 0) / getTotalLeads() * 100} 
                    type={stage.type}
                  />
                  <S.ProgressLabel>
                    {((stage.metrics?.count || 0) / getTotalLeads() * 100).toFixed(1)}% do total
                  </S.ProgressLabel>
                </S.StageProgress>
              </S.StageContent>

              {index < stages.length - 1 && (
                <S.StageConnector>
                  <S.ConversionIndicator>
                    <TrendingUp />
                    {conversionRate}%
                  </S.ConversionIndicator>
                </S.StageConnector>
              )}
            </S.StageBlock>
          );
        })}
      </S.StagesFlow>
    </S.Container>
  );
}; 