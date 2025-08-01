// FormularioStyles.js
import styled from 'styled-components';

export const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const FilaFormulario = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    flex-direction: row;

    > div {
      flex: 1;
      padding-right: 0.75rem;

      &:last-child {
        padding-right: 0;
      }
    }
  }
`;


export const BotonEliminar = styled.button`
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background-color: #c82333;
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.5);
  }
`;


export const Sugerencias = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  position: absolute;
  background-color: white;
  width: 100%;
  z-index: 10;
  animation: fadeIn 0.2s ease-in-out;

  li {
    padding: 10px 12px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f0f0f0;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const PaginaCentrada = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;  
  padding: 2rem;

`;

export const ContenedorFormularioVista = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  width: 100vw;
  
  /* max-width: 1200px; */ // Elimina esta línea
  margin: 0 auto;

  @media (min-width: 992px) {
    flex-direction: row;
    align-items: flex-start;
  }
`;

export const SeccionFormulario = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  h3 {
    margin-bottom: 1rem;
    font-size: 1.2rem;
    color: #333;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0.5rem;
  }
`;

export const FormularioWrapper = styled.form`
  max-width: 500px;
  width: 100vw;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
  font-family: 'Inter', sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (min-width: 992px) {
    flex: 1;
    max-width: 600px;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border-radius: 4px;
    border: 1px solid #ccc;
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

export const VistaPrevia = styled.div`
  flex: 1;
  max-width: 800px;
  height: 100%;
  background-color: #fff;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  iframe {
    width: 100%;
    height: 600px;
    border: none;
  }
`;

export const BotonGuardar = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  width: 100%; /* Ocupa todo el ancho del contenedor */
  padding: 0.85rem 1.5rem;
  background: linear-gradient(135deg, #28a745, #218838);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);

  &:hover {
    background: linear-gradient(135deg, #218838, #1e7e34);
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.5);
  }

  svg {
    font-size: 1.2rem;
  }
`;
export const BotonFirmar = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  width: 100%;
  padding: 0.85rem 1.5rem;
  margin: 1.5rem 0; /* Espacio arriba y abajo */
  
  background: linear-gradient(135deg, #28a745, #218838);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);

  &:hover {
    background: linear-gradient(135deg, #218838, #1e7e34);
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.98);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.5);
  }

  svg {
    font-size: 1.2rem;
  }
`;



export const ModalFirmaOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const ModalFirmaContenido = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

  h3 {
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
  }

  button {
    width: 100%;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    background-color: #2a3038;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease, transform 0.2s ease;

    &:hover {
      background-color: #0056b3;
      transform: scale(1.02);
    }

    &:active {
      transform: scale(0.98);
    }

    &:last-child {
      background-color: #ccc;
      color: #333;

      &:hover {
        background-color: #bbb;
      }
    }
  }
`;
