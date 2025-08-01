import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Title, Input, Button } from './FormStyles';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../themes';
import { usePrefersDarkMode } from '../../../src/hooks/usePrefersDarkMode';

const Login = ({ onLogin }) => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const isDarkMode = usePrefersDarkMode();

  useEffect(() => {
    const usuarioLogueado = localStorage.getItem('nombre');
    if (usuarioLogueado) {
      navigate('/home');
    }
  }, [navigate]);

  const manejarLogin = async () => {
    try {
      const res = await axios.post('http://172.20.70.113:3000/api/auth/login', {
        correo,
        password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('rol', res.data.rol);
      localStorage.setItem('nombre', res.data.nombre);
      localStorage.setItem('correo', res.data.correo);
      localStorage.setItem('id', res.data.id);

      if (res.data.rol === 'Tecnico') {
        navigate('/home');
      } else if (res.data.rol === 'Aprobador') {
        navigate('/aprobaciones-pendientes');
      } else {
        navigate('/home');
      }

    } catch (error) {
      if (error.response) {
        alert(`❌ Error: ${error.response.data.error || 'Error al iniciar sesión'}`);
      } else if (error.request) {
        alert('❌ No se pudo conectar con el servidor');
      } else {
        alert('❌ Error inesperado al iniciar sesión');
      }
    }
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Container>
        <Form>
          <Title>Login</Title>
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
          <Button onClick={manejarLogin}>Ingresar</Button>

          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <p style={{ margin: '10px 0' }}>
              ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
            </p>
            <p>
              ¿Olvidaste tu contraseña? <Link to="/recuperar-password">Recupérala aquí</Link>
            </p>
          </div>
        </Form>
      </Container>
    </ThemeProvider>
  );
};

export default Login;
