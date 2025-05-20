import styled from 'styled-components';

export const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

export const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

export const StageCount = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

export const StagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

export const Stage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const StageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const StageIcon = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: ${props => 
    props.type === 'lead' ? '#3b82f6' :
    props.type === 'opportunity' ? '#f59e0b' :
    '#10b981'
  };
  background: ${props => 
    props.type === 'lead' ? '#eff6ff' :
    props.type === 'opportunity' ? '#fff7ed' :
    '#f0fdf4'
  };
`;

export const StageInfo = styled.div`
  flex: 1;
`;

export const StageName = styled.div`
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
`;

export const StageMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.875rem;
  color: #64748b;
`;

export const ConversionBadge = styled.div<{ positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  background: ${props => props.positive ? '#dcfce7' : '#fff7ed'};
  color: ${props => props.positive ? '#16a34a' : '#f59e0b'};

  svg {
    font-size: 14px;
  }
`;

export const StageProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ProgressLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  text-align: right;
`;

export const Footer = styled.div`
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
`;

export const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

export const MetricCard = styled.div`
  text-align: center;
`;

export const MetricIcon = styled.div`
  color: #64748b;
  margin-bottom: 8px;
`;

export const MetricValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
`;

export const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

export const TicketInfo = styled.div`
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 2px;
`; 