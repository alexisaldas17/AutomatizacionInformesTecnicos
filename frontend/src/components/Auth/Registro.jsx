import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Title, Input, Button, BackButton } from './FormStyles';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../themes';
import { usePrefersDarkMode } from '../../../src/hooks/usePrefersDarkMode';

const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();
  const isDarkMode = usePrefersDarkMode();

  const manejarRegistro = async () => {
    if (!nombre || !correo || !password || !codigo) {
      alert('⚠️ Todos los campos son obligatorios');
      return;
    }

    try {
      await axios.post('http://172.20.70.113:3000/api/auth/registro', {
        nombre,
        correo,
        password,
        codigo
      });

      alert('✅ Usuario registrado correctamente');
      navigate('/login');
    } catch (error) {
      console.error(error);
      if (error.response?.data?.error) {
        alert(`❌ ${error.response.data.error}`);
      } else {
        alert('❌ Error al registrar usuario');
      }
    }
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Container>
        <Form>
          <Title>Registro de usuario</Title>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
          />
          <Input
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Correo"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
          />
          <Input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Código de invitación"
          />

          <Button onClick={manejarRegistro}>Registrar</Button>

          <BackButton onClick={() => navigate('/login')} style={{ marginTop: '15px' }}>
            Volver
          </BackButton>

        </Form>
      </Container>
    </ThemeProvider>
  );
};

export default Registro;
