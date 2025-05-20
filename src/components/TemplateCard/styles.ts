import styled from 'styled-components';

export const Card = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: white;
    border-color: #cbd5e1;
    transform: translateY(-2px);
  }
`;

export const Title = styled.h4`
  font-size: 1rem;
  color: #1e293b;
  margin: 0 0 8px 0;
`;

export const Description = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
`; 