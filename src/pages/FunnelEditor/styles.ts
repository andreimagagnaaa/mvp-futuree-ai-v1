import styled from 'styled-components';

export const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

export const Header = styled.header`
  background: white;
  padding: 24px 0;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
`;

export const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  h1 {
    font-size: 1.5rem;
    color: #1e293b;
    margin: 0;
  }
`;

export const EditButton = styled.button`
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.875rem;
  cursor: pointer;

  &:hover {
    color: #3b82f6;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
`;

export const Button = styled.button`
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #94a3b8;
    color: #1e293b;
  }
`;

export const SaveButton = styled(Button)<{ saving: boolean }>`
  background: ${props => props.saving ? '#94a3b8' : '#3b82f6'};
  border-color: ${props => props.saving ? '#94a3b8' : '#3b82f6'};
  color: white;

  &:hover {
    background: ${props => props.saving ? '#94a3b8' : '#2563eb'};
    border-color: ${props => props.saving ? '#94a3b8' : '#2563eb'};
    color: white;
  }
`;

export const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

export const Section = styled.section`
  margin-bottom: 32px;
`;

export const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: #1e293b;
  margin: 0 0 16px;
`;

export const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #64748b;
`;

export const ErrorState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #ef4444;
`; 