import styled, { css, keyframes } from 'styled-components';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const Container = styled.div`
  padding: 32px;
  overflow-x: auto;
`;

export const StagesFlow = styled.div`
  display: flex;
  gap: 40px;
  align-items: flex-start;
  min-width: min-content;
`;

export const StageBlock = styled.div<{ type: string; isHovered: boolean }>`
  position: relative;
  min-width: 300px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;

  ${props => props.isHovered && css`
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
    animation: ${pulse} 1s infinite;
  `}

  border-top: 4px solid ${props => 
    props.type === 'lead' ? '#3b82f6' :
    props.type === 'opportunity' ? '#f59e0b' :
    '#10b981'
  };
`;

export const StageContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const StageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const StageIcon = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => 
    props.type === 'lead' ? '#eff6ff' :
    props.type === 'opportunity' ? '#fff7ed' :
    '#f0fdf4'
  };
  color: ${props => 
    props.type === 'lead' ? '#3b82f6' :
    props.type === 'opportunity' ? '#f59e0b' :
    '#10b981'
  };

  svg {
    font-size: 24px;
  }
`;

export const StageName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

export const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
`;

export const MetricCard = styled.div<{ highlight?: boolean; success?: boolean }>`
  padding: 16px;
  border-radius: 12px;
  background: ${props => 
    props.highlight ? '#eff6ff' :
    props.success ? '#f0fdf4' :
    '#f8fafc'
  };
  text-align: center;
`;

export const MetricIcon = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
  
  svg {
    color: #3b82f6;
  }
`;

export const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
`;

export const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 4px;
`;

export const StageProgress = styled.div`
  margin-top: 16px;
`;

export const ProgressBar = styled.div<{ value: number; type: string }>`
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.value}%;
    background: ${props => 
      props.type === 'lead' ? '#3b82f6' :
      props.type === 'opportunity' ? '#f59e0b' :
      '#10b981'
    };
    transition: width 0.3s ease;
  }
`;

export const ProgressLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 8px;
  text-align: right;
`;

export const StageConnector = styled.div`
  position: absolute;
  right: -40px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ConversionIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 500;

  svg {
    font-size: 16px;
  }
`; 