import styled from 'styled-components';

type Severity = 'low' | 'medium' | 'high';

const getSeverityColor = (severity: Severity) => {
  switch (severity) {
    case 'high': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'low': return '#3b82f6';
    default: return '#64748b';
  }
};

export const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 400px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: #f59e0b;
  }
`;

export const GapCount = styled.div<{ severity: Severity }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => `${getSeverityColor(props.severity)}15`};
  color: ${props => getSeverityColor(props.severity)};
`;

export const GapsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

export const GapItem = styled.div<{ severity: Severity }>`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: ${props => `${getSeverityColor(props.severity)}08`};
  border: 1px solid ${props => `${getSeverityColor(props.severity)}20`};
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    transform: translateX(4px);
    background: ${props => `${getSeverityColor(props.severity)}15`};
  }
`;

export const GapIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
`;

export const GapContent = styled.div`
  flex: 1;
`;

export const GapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
`;

export const GapTitle = styled.div`
  font-weight: 500;
  color: #1e293b;
`;

export const GapMetric = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
`;

export const GapDescription = styled.div`
  font-size: 0.875rem;
  color: #64748b;

  strong {
    color: #1e293b;
  }
`;

export const ActionButton = styled.button<{ severity: Severity }>`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: white;
  color: ${props => getSeverityColor(props.severity)};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => `${getSeverityColor(props.severity)}15`};
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 32px;
  background: #f8fafc;
  border-radius: 8px;
`;

export const EmptyIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 16px;
`;

export const EmptyTitle = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

export const EmptyDescription = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

export const Footer = styled.div`
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
`;

export const Tip = styled.div`
  font-size: 0.875rem;
  color: #64748b;

  strong {
    color: #1e293b;
  }
`; 