import React from 'react';
import { TrendingDown, Psychology, Speed, ArrowForward } from '@mui/icons-material';
import { Funnel } from '../../types';
import * as S from './styles';

interface FunnelGapsCardProps {
  funnel: Funnel;
  onActionClick?: (gapType: string) => void;
}

export const FunnelGapsCard = ({ funnel, onActionClick }: FunnelGapsCardProps) => {
  const analyzeGaps = () => {
    const gaps = [];
    const stages = funnel.stages;

    // Analisa conversão entre etapas
    stages.forEach((stage, index) => {
      if (index > 0) {
        const currentCount = stage.metrics?.count || 0;
        const previousCount = stages[index - 1].metrics?.count || 1;
        const conversionRate = (currentCount / previousCount) * 100;
        
        if (conversionRate < 30) {
          gaps.push({
            type: 'conversion',
            stage: stage.name,
            metric: `${conversionRate.toFixed(1)}%`,
            message: 'Taxa de conversão crítica',
            severity: 'high' as const
          });
        }
      }
    });

    // Analisa volume inicial
    const firstStageCount = stages[0]?.metrics?.count || 0;
    if (firstStageCount < 100) {
      gaps.push({
        type: 'volume',
        stage: stages[0].name,
        metric: firstStageCount.toString(),
        message: 'Volume baixo de leads',
        severity: 'medium' as const
      });
    }

    return gaps;
  };

  const gaps = analyzeGaps();

  return (
    <S.GapsList>
      {gaps.map((gap, index) => (
        <S.GapItem key={index} severity={gap.severity}>
          <S.GapIcon>
            {gap.type === 'conversion' ? <TrendingDown /> : <Psychology />}
          </S.GapIcon>
          
          <S.GapContent>
            <S.GapHeader>
              <S.GapTitle>{gap.message}</S.GapTitle>
              <S.GapMetric>{gap.metric}</S.GapMetric>
            </S.GapHeader>
            <S.GapDescription>
              Etapa: <strong>{gap.stage}</strong>
            </S.GapDescription>
          </S.GapContent>

          <S.ActionButton 
            severity={gap.severity}
            onClick={() => onActionClick?.(gap.type)}
          >
            <ArrowForward />
          </S.ActionButton>
        </S.GapItem>
      ))}

      {gaps.length === 0 && (
        <S.EmptyGaps>
          <span>🎉</span>
          <h4>Funil Saudável!</h4>
          <p>Não foram identificados pontos críticos de melhoria</p>
        </S.EmptyGaps>
      )}
    </S.GapsList>
  );
}; 