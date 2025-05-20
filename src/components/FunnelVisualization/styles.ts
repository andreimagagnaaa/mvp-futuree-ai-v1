import styled from 'styled-components';

export const Container = styled.div`
  padding: 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

export const Header = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

export const Title = styled.h2`
  font-size: 1.5rem;
  color: #1e293b;
  margin: 0 0 8px;
`;

export const TotalLeads = styled.div`
  font-size: 1rem;
  color: #64748b;
`;

export const FunnelWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
`;

export const StageWrapper = styled.div<{ width: string }>`
  width: ${props => props.width};
  margin: 0 auto;
  transition: width 0.3s ease;
`;

export const Stage = styled.div<{ type: string }>`
  background: ${props => 
    props.type === 'lead' ? '#eff6ff' :
    props.type === 'opportunity' ? '#fff7ed' :
    '#f0fdf4'
  };
  border: 2px solid ${props => 
    props.type === 'lead' ? '#3b82f6' :
    props.type === 'opportunity' ? '#f59e0b' :
    '#10b981'
  };
  border-radius: 12px;
  padding: 16px;
`;

export const StageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

export const StageIcon = styled.div`
  font-size: 1.25rem;
`;

export const StageName = styled.div`
  font-weight: 500;
  color: #1e293b;
`;

export const StageMetrics = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
`;

export const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;

  strong {
    font-size: 1.125rem;
    color: #1e293b;
  }

  span {
    font-size: 0.875rem;
    color: #64748b;
  }
`;

export const ConversionRate = styled(MetricItem)`
  strong {
    color: #10b981;
  }
`;

export const Revenue = styled(MetricItem)`
  strong {
    color: #3b82f6;
  }
`; 