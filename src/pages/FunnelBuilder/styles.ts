import styled, { keyframes } from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

export const Header = styled.header`
  background: white;
  padding: 32px 0;
  border-bottom: 1px solid #e2e8f0;
`;

export const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
`;

export const HeaderTitle = styled.div`
  h1 {
    font-size: 28px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }

  p {
    font-size: 16px;
    color: #64748b;
    margin: 8px 0 0;
  }
`;

export const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

export const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f1f5f9;
  border-radius: 12px;
  
  svg {
    color: #3b82f6;
    font-size: 24px;
  }

  div {
    display: flex;
    flex-direction: column;
    
    strong {
      font-size: 24px;
      font-weight: 600;
      color: #1e293b;
    }

    span {
      font-size: 14px;
      color: #64748b;
    }
  }
`;

export const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
`;

export const FloatingButton = styled.button`
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 28px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 20px rgba(37, 99, 235, 0.3);
  }

  svg {
    font-size: 20px;
  }
`;

export const Section = styled.section`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

export const SectionSubtitle = styled.p`
  color: #64748b;
  margin: 4px 0 0;
  font-size: 0.875rem;
`;

export const FunnelsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const FunnelsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
`;

export const FunnelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

export const GapsCard = styled.div`
  margin-top: 24px;
  width: 100%;
  
  // Garante que o card de GAPS tenha a mesma largura dos cards de funil
  @media (min-width: 768px) {
    max-width: calc(100% - 24px);
  }
`;

export const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
`;

export const CreateButton = styled.button`
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #1d4ed8;
  }

  svg {
    font-size: 20px;
  }
`;

export const TemplateInfo = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin: 4px 0 0;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  background: #f9fafb;
  border-radius: 16px;
  color: #6b7280;

  p {
    margin: 0;
    line-height: 1.6;
    
    &:first-child {
      font-weight: 500;
      color: #374151;
    }
  }
`;

export const StagePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

export const StageIndicator = styled.div<{ type: string }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
  background: ${props => 
    props.type === 'lead' ? '#3b82f6' :
    props.type === 'opportunity' ? '#f59e0b' :
    '#10b981'
  };
`;

export const Tabs = styled.div`
  display: flex;
  gap: 2px;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

export const Tab = styled.button<{ active: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: ${props => props.active ? 'white' : 'transparent'};
  color: ${props => props.active ? '#1e293b' : '#64748b'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? 'white' : '#e2e8f0'};
  }
`;

export const FunnelView = styled.div`
  padding: 24px;
`;

export const FunnelList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

export const FunnelCard = styled.div<{ selected: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 16px;
  border: 2px solid ${props => props.selected ? '#3b82f6' : '#e2e8f0'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
  }
`;

export const DiagnosticSection = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
`;

export const DiagnosticWrapper = styled.div`
  margin-top: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const DiagnosticTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    font-size: 20px;
  }
`;

export const MainSection = styled.section`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

export const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
`;

export const FunnelsLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  margin-top: 24px;
`;

export const FunnelsSection = styled.div`
  flex: 1;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: #64748b;
  font-size: 0.875rem;
`;

export const DiagnosticCard = styled.div`
  margin-top: 32px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const DiagnosticHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;

  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }

  svg {
    font-size: 20px;
  }
`; 