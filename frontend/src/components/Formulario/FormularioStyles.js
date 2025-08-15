import styled from 'styled-components';

export const PaginaCompleta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 3rem;
  font-family: 'Segoe UI', sans-serif;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  min-height: 100vh;
  width: 100vw;
  box-sizing: border-box;
`;

export const FormularioContenedor = styled.form`
  width: 100%;
  background-color: ${({ theme }) => theme.formBackground};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  font-family: 'Segoe UI', sans-serif;
  color: ${({ theme }) => theme.text};
`;


export const TituloFormulario = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.text};
`;

export const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;
export const SeccionFormulario = styled.div`
  margin-bottom: 2rem;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.sectionBackground};

  h3 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.text};
    border-bottom: 1px solid ${({ theme }) => theme.border};
    padding-bottom: 0.5rem;
  }
`;


export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;


export const ModalContent = styled.div`
  background: ${({ theme }) => theme.modalBackground};
  color: ${({ theme }) => theme.text};
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
`;


export const FilaFormulario = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 0.75rem;

  @media (min-width: 768px) {
    flex-direction: row;

    > div {
     ;
    }
  }

  label {
    font-weight: 400;
    margin-bottom: 0.25rem;
    display: block;
    color: ${({ theme }) => theme.text};
  }

  input,
  textarea {
    width: 90%;
    padding: 0.75rem;
    border: 1px solid ${({ theme }) => theme.inputBorder};
    border-radius: 6px;
    font-size: 1rem;
    background-color: ${({ theme }) => theme.formBackground};
    color: ${({ theme }) => theme.text};
  }

  textarea {
    resize: vertical;
  }
`;


export const BotonContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 2rem;
  width: 100%;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }

  button {
    width: 100%;
    padding: 0.85rem 1.2rem;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
    }

    &:active {
      transform: scale(0.98);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
    }

    &:focus {
      outline: none;
    }
  }

  /* Estilos personalizados por clase */
  .btn-verde {
    background: linear-gradient(135deg, #28a745, #218838);
  }

  .btn-azul {
    background: linear-gradient(135deg, #1e90ff, #007bff);
  }

  .btn-rojo {
    background: linear-gradient(135deg, #dc3545, #c82333);
  }

  .btn-gris {
    background: linear-gradient(135deg, #6c757d, #5a6268);
  }
`;

export const BotonEliminar = styled.button`
  margin-top: 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  align-self: flex-end;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #c82333;
    transform: scale(1.1);
  }
`;
