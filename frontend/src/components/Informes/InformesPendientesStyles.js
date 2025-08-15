import styled from 'styled-components';
import { FaSpinner } from 'react-icons/fa';

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

export const IconContainer = styled.div`
  display: none;
  justify-content: center;
  align-items: center;
  gap: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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
export const InformeCardHover = styled(InformeCard)`

position: relative;
  overflow: hidden;

  &:hover .icon-overlay {
    display: flex;
  }

  &:hover .card-content {
    filter: blur(2px);
    opacity: 0.6;
  }

`;

export const IconOverlay = styled.div`
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  gap: 20px;
  justify-content: center;
  align-items: center;
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
  color: ${({ theme }) => theme.textComentario};
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
export const TotalPendientes = styled.div`
  display: inline-block;
  background-color: #ff9800;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
`;
export const CardResumen = styled.div`
  background-color: #f5f5f5;
  border-left: 6px solid #ff9800;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

export const Title = styled.h2`
  display: flex;
  justify-content: center;
  align-items: center;
  grid-column: span 4;
  padding: 1rem;
  text-align: center;
  color: ${({ theme }) => theme.text};
  font-size: 1.5rem;
`;

export const NoInformesMessage = styled.div`
  grid-column: span 4;
  text-align: center;
  color: ${({ theme }) => theme.text};
  font-size: 1.2rem;
`;

export const Loader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;

  .spinner {
    border: 6px solid #f3f3f3;
    border-top: 6px solid #ff9800;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  p {
    margin-top: 15px;
    font-size: 1.1rem;
    color: #666;
  }
`;


export const LoadingContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
`;

export const SpinnerIcon = styled(FaSpinner)`
  font-size: 2.5rem;
  color: #ff9800;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.text};
`;
export const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.textComentario};
  padding: 20px;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  h3 {
    font-size: 1.2rem;
    margin-bottom: 20px;
  }

  .botones {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
`;

/* NO ELIMINAR CODIGO EstadoBadge */

/* const EstadoBadge = styled.span`
  padding: 4px 8px;
  border-radius: 5px;
  font-weight: bold;
  background-color: ${props => {
    switch (props.estado) {
      case 'Pendiente': return '#f0ad4e';
      case 'Aprobado': return '#5cb85c';
      case 'Rechazado': return '#d9534f';
      default: return '#ccc';
    }
  }};
  color: white;
`; */
