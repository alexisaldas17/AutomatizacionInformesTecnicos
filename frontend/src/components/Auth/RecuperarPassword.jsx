import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Title, Input, Button, BackButton } from './FormStyles';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../themes';
import { usePrefersDarkMode } from '../../../src/hooks/usePrefersDarkMode';

export default function RecuperarPassword() {
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoVisible, setCodigoVisible] = useState('');

  const navigate = useNavigate();
  const isDarkMode = usePrefersDarkMode();

  const solicitarCodigo = async () => {
    try {
      const res = await axios.post('http://172.20.70.113:3000/api/authRecovery/solicitar-codigo', { correo });
      setCodigoEnviado(true);
      setCodigoVisible(res.data.codigo); // Solo para pruebas
    } catch (error) {
      alert('Error al solicitar código');
    }
  };

  const restablecerPassword = async () => {
    try {
      const res = await axios.post('http://172.20.70.113:3000/api/authRecovery/restablecer-con-codigo', {
        correo,
        codigo,
        nuevaPassword
      });

      alert('✅ Contraseña actualizada correctamente');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      console.error("Error:", error.response?.data);
      alert('❌ ' + (error.response?.data?.error || 'Código inválido o expirado'));
    }
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Container>
        <Form>
          <Title>Recuperar contraseña</Title>

          <Input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
          <Button onClick={solicitarCodigo}>Solicitar código</Button>

          {codigoEnviado && (
            <>
              <p style={{ fontSize: '14px', color: '#888', marginTop: '10px' }}>
                Código enviado (para pruebas): <strong>{codigoVisible}</strong>
              </p>
              <Input
                type="text"
                placeholder="Código"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Nueva contraseña"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
              />
              <Button onClick={restablecerPassword}>Restablecer contraseña</Button>
            </>
          )}

          <BackButton onClick={() => navigate('/login')} style={{ marginTop: '15px' }}>
            Volver
          </BackButton>
        </Form>
      </Container>
    </ThemeProvider>
  );
}
