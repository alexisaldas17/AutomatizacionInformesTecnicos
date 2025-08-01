import styled from 'styled-components';

export const Container = styled.div`
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100vw;
/*   background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text}; */
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 90%;
  margin-top: 20px;
`;

export const InformeCard = styled.div`
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.1);
    background-color: ${({ theme }) => theme.cardHover};
  }

  h3 {
    margin-bottom: 10px;
    color: ${({ theme }) => theme.textCard};
  }

  p {
    margin: 5px 0;
    color: ${({ theme }) => theme.subtext};
  }

  ul {
    margin-top: 10px;
    padding-left: 20px;
    color: ${({ theme }) => theme.subtext};
  }

  li {
    margin-bottom: 5px;
  }
`;

export const Detalle = styled.div`
  margin-top: 10px;
  background: ${({ theme }) => theme.cardBackground};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 15px;
  border-radius: 5px;
`;

export const Boton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  margin: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }

  &.aprobar {
    background-color: #28a745;
    &:hover {
      background-color: #1e7e34;
    }
  }

  &.rechazar {
    background-color: #dc3545;
    &:hover {
      background-color: #a71d2a;
    }
  }

  &.cerrar {
    background-color: #6c757d;
    &:hover {
      background-color: #545b62;
    }
  }
`;

export const ComentarioInput = styled.textarea`
  width: 95%;
  min-height: 80px;
  padding: 12px;
  margin-top: 10px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.inputBackground};
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
    background-color: ${({ theme }) => theme.inputFocus};
  }
`;
