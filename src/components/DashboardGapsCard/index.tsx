import React, { useState } from 'react';
import { Warning, TrendingDown, Psychology, Speed, ArrowForward } from '@mui/icons-material';
import { Gap, Funnel } from '../../types';
import { GapDiagnostic } from '../GapDiagnostic';

interface DashboardGapsCardProps {
  funnel: Funnel;
  onActionClick?: (gapType: string) => void;
}

export const DashboardGapsCard = ({ funnel, onActionClick }: DashboardGapsCardProps) => {
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  const analyzeGaps = () => {
    const gaps: Gap[] = [];
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
            severity: 'high'
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
        severity: 'medium'
      });
    }

    // Analisa velocidade de conversão
    const lastStageCount = stages[stages.length - 1]?.metrics?.count || 0;
    if (lastStageCount > 0) {
      const conversionVelocity = lastStageCount / stages.length;
      if (conversionVelocity < 10) {
        gaps.push({
          type: 'velocity',
          stage: 'Geral',
          metric: `${conversionVelocity.toFixed(1)} conv/etapa`,
          message: 'Velocidade de conversão baixa',
          severity: 'medium'
        });
      }
    }

    return gaps;
  };

  const gaps = analyzeGaps();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-lg">
            <Warning className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Diagnóstico de GAPS</h3>
        </div>
        
        <button
          onClick={() => setShowDiagnostic(true)}
          className="flex items-center px-3 py-2 text-sm font-medium text-white bg-[#2C6CEE] hover:bg-[#2C6CEE]/90 rounded-lg shadow-sm"
        >
          Diagnóstico de GAPs
        </button>
      </div>

      <div className="space-y-4">
        {gaps.map((gap, index) => (
          <div 
            key={index}
            className={`flex items-start gap-4 p-4 rounded-lg border ${
              gap.severity === 'high' 
                ? 'bg-red-50 border-red-100' 
                : 'bg-amber-50 border-amber-100'
            }`}
          >
            <div className="p-2 bg-white rounded-lg">
              {gap.type === 'conversion' && <TrendingDown className="w-5 h-5 text-gray-600" />}
              {gap.type === 'volume' && <Psychology className="w-5 h-5 text-gray-600" />}
              {gap.type === 'velocity' && <Speed className="w-5 h-5 text-gray-600" />}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-gray-900">{gap.message}</span>
                <span className="text-sm font-medium text-gray-600">{gap.metric}</span>
              </div>
              <p className="text-sm text-gray-600">
                Etapa: <span className="font-medium text-gray-900">{gap.stage}</span>
              </p>
            </div>

            <button
              onClick={() => onActionClick?.(gap.type)}
              className={`p-2 rounded-lg transition-colors ${
                gap.severity === 'high'
                  ? 'bg-white text-red-600 hover:bg-red-100'
                  : 'bg-white text-amber-600 hover:bg-amber-100'
              }`}
            >
              <ArrowForward className="w-5 h-5" />
            </button>
          </div>
        ))}

        {gaps.length === 0 && (
          <div className="text-center py-8">
            <span className="text-2xl mb-3 block">🎉</span>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Funil Saudável!</h4>
            <p className="text-gray-600">Não foram identificados pontos críticos de melhoria</p>
          </div>
        )}
      </div>

      <GapDiagnostic
        isOpen={showDiagnostic}
        onClose={() => setShowDiagnostic(false)}
      />
    </div>
  );
}; 