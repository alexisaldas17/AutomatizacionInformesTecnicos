// components/UsuarioMenu.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { FaUserCircle } from 'react-icons/fa';
import { lightTheme, darkTheme } from '../themes';
import { usePrefersDarkMode } from '../../../src/hooks/usePrefersDarkMode';

const Wrapper = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
`;

const IconButton = styled.button`
  background: ;
  border: none;
  cursor: pointer;
  font-size: 28px;
  color: ${({ theme }) => theme.text};
`;

const Menu = styled.div`
  position: absolute;
  top: 40px;
  left: 0;
  background-color: ${({ theme }) => theme.formBackground};
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  padding: 10px;
  width: 180px;
`;

const MenuItem = styled.div`
  padding: 8px;
  font-size: 14px;
  cursor: pointer;
  color: ${({ theme }) => theme.text};

  &:hover {
    background-color: ${({ theme }) => theme.background};
  }
`;

const UsuarioMenu = () => {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const navigate = useNavigate();
  const isDarkMode = usePrefersDarkMode();

  const nombre = localStorage.getItem('nombre');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('rol');
    localStorage.removeItem('correo');
    localStorage.removeItem('vistaPreviaPDF');
    navigate('/login');
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Wrapper>
        <IconButton onClick={() => setMostrarMenu(!mostrarMenu)}>
          <FaUserCircle />
        </IconButton>
        {mostrarMenu && (
          <Menu>
            <MenuItem><strong>{nombre || 'Usuario'}</strong></MenuItem>
            <MenuItem>Estado: ✅ Conectado</MenuItem>
            <MenuItem onClick={logout}>🔓 Cerrar sesión</MenuItem>
          </Menu>
        )}
      </Wrapper>
    </ThemeProvider>
  );
};

export default UsuarioMenu;
