import React from 'react';
import { IconButton, Tooltip, LinearProgress } from '@mui/material';
import { Edit, Delete, TrendingUp, People, AttachMoney, Timeline } from '@mui/icons-material';
import { Funnel } from '../../types';
import * as S from './styles';

interface FunnelCardProps {
  funnel: Funnel;
  onEdit: (funnel: Funnel) => void;
  onDelete: (id: string) => void;
}

export const FunnelCard = ({ funnel, onEdit, onDelete }: FunnelCardProps) => {
  const getTotalLeads = () => funnel.stages[0]?.metrics?.count || 0;
  
  const getStageMetrics = (index: number) => {
    const stage = funnel.stages[index];
    const previousStage = index > 0 ? funnel.stages[index - 1] : null;
    const count = stage.metrics?.count || 0;
    const previousCount = previousStage?.metrics?.count || 1;
    const conversionRate = ((count / previousCount) * 100).toFixed(1);
    
    return {
      count,
      conversionRate,
      percentageOfTotal: ((count / getTotalLeads()) * 100).toFixed(1)
    };
  };

  const totalRevenue = funnel.stages
    .filter(stage => stage.type === 'sale')
    .reduce((acc, stage) => acc + (stage.metrics?.revenue || 0), 0);

  const averageTicket = totalRevenue / (funnel.stages[funnel.stages.length - 1]?.metrics?.count || 1);

  return (
    <S.Card>
      <S.Header>
        <S.TitleArea>
          <S.Title>{funnel.name}</S.Title>
          <S.StageCount>{funnel.stages.length} etapas</S.StageCount>
        </S.TitleArea>
        <S.Actions>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEdit(funnel)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton 
              size="small" 
              onClick={() => funnel.id && onDelete(funnel.id)}
              disabled={!funnel.id}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </S.Actions>
      </S.Header>

      <S.StagesList>
        {funnel.stages.map((stage, index) => {
          const metrics = getStageMetrics(index);
          return (
            <S.Stage key={stage.id}>
              <S.StageHeader>
                <S.StageIcon type={stage.type}>
                  {stage.type === 'lead' ? <People /> : 
                   stage.type === 'opportunity' ? <Timeline /> : 
                   <AttachMoney />}
                </S.StageIcon>
                <S.StageInfo>
                  <S.StageName>{stage.name}</S.StageName>
                  <S.StageMetrics>
                    <span>{metrics.count} leads</span>
                    {index > 0 && (
                      <S.ConversionBadge positive={Number(metrics.conversionRate) > 50}>
                        <TrendingUp fontSize="small" />
                        {metrics.conversionRate}%
                      </S.ConversionBadge>
                    )}
                  </S.StageMetrics>
                </S.StageInfo>
              </S.StageHeader>
              
              <S.StageProgress>
                <LinearProgress 
                  variant="determinate" 
                  value={Number(metrics.percentageOfTotal)}
                  sx={{
                    backgroundColor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: stage.type === 'lead' ? '#3b82f6' :
                                     stage.type === 'opportunity' ? '#f59e0b' :
                                     '#10b981'
                    }
                  }}
                />
                <S.ProgressLabel>{metrics.percentageOfTotal}% do total</S.ProgressLabel>
              </S.StageProgress>
            </S.Stage>
          );
        })}
      </S.StagesList>

      <S.Footer>
        <S.MetricGrid>
          <S.MetricCard>
            <S.MetricIcon><People /></S.MetricIcon>
            <S.MetricValue>{getTotalLeads()}</S.MetricValue>
            <S.MetricLabel>Leads Totais</S.MetricLabel>
          </S.MetricCard>

          <S.MetricCard>
            <S.MetricIcon><TrendingUp /></S.MetricIcon>
            <S.MetricValue>
              {getStageMetrics(funnel.stages.length - 1).conversionRate}%
            </S.MetricValue>
            <S.MetricLabel>Conversão Total</S.MetricLabel>
          </S.MetricCard>

          <S.MetricCard>
            <S.MetricIcon><AttachMoney /></S.MetricIcon>
            <S.MetricValue>
              R$ {totalRevenue.toLocaleString()}
            </S.MetricValue>
            <S.MetricLabel>
              Receita Total
              <S.TicketInfo>
                Ticket Médio: R$ {averageTicket.toLocaleString()}
              </S.TicketInfo>
            </S.MetricLabel>
          </S.MetricCard>
        </S.MetricGrid>
      </S.Footer>
    </S.Card>
  );
}; 