// components/LogoutButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StyledButton = styled.button`
  padding: 8px 16px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return <StyledButton onClick={handleLogout}>Cerrar sesión</StyledButton>;
};

export default LogoutButton;
