import styled from 'styled-components';

export const Container = styled.div`
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    font-size: 1.5rem;
    color: #1e293b;
    margin: 0;
  }
`;

export const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

export const StagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const StageItem = styled.div<{ isDragging: boolean }>`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${props => props.isDragging ? '#f8fafc' : 'white'};
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;

  &:hover {
    border-color: #94a3b8;
  }
`;

export const DragHandle = styled.div`
  color: #94a3b8;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
`;

export const StageContent = styled.div<{ type: string }>`
  flex: 1;
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
`;

export const StageName = styled.div`
  font-weight: 500;
  color: #1e293b;
`;

export const StageType = styled.div`
  font-size: 0.875rem;
  color: #64748b;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

export const ActionButton = styled.button`
  padding: 6px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

export const EditForm = styled.div`
  flex: 1;
  display: flex;
  gap: 16px;
`;

export const Input = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

export const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

export const Tips = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Tip = styled.div`
  font-size: 0.875rem;
  color: #64748b;

  strong {
    color: #1e293b;
  }
`; 