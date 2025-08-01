// FormStyles.js
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) => theme.background};
  position: fixed;
  top: 0;
  left: 0;
`;

export const Form = styled.div`
  background-color: ${({ theme }) => theme.formBackground};
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 300px;
`;

export const Title = styled.h2`
  margin-bottom: 20px;
  text-align: center;
  color: ${({ theme }) => theme.text};
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 5px;
  font-size: 14px;

  &:focus {
    border-color: ${({ theme }) => theme.buttonBackground};
    outline: none;
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: ${({ theme }) => theme.buttonBackground};
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 15px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.buttonHover};
  }
`;

export const BackButton = styled(Button)`
  background-color: ${({ theme }) => theme.backButtonBackground};

  &:hover {
    background-color: ${({ theme }) => theme.backButtonHover};
  }
`;
