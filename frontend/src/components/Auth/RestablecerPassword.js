
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { Container, Form, Title, Input, Button } from './FormStyles';

const RestablecerPassword = () => {
  const [searchParams] = useSearchParams();
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const token = searchParams.get('token');

  const manejarRestablecimiento = async () => {
    if (!nuevaPassword) {
      setError('⚠️ La nueva contraseña es obligatoria');
      return;
    }

    try {
      const res = await axios.post('http://172.20.70.113:3000/api/auth/restablecer-password', {
        token,
        nuevaPassword
      });

      setMensaje(res.data.message || '✅ Contraseña restablecida correctamente');
      setError('');
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      setError(err.response?.data?.error || '❌ Error al restablecer contraseña');
      setMensaje('');
    }
  };

  return (
    <Container>
      <Form>
        <Title>Restablecer Contraseña</Title>
        <Input
          type="password"
          value={nuevaPassword}
          onChange={(e) => setNuevaPassword(e.target.value)}
          placeholder="Nueva contraseña"
        />
        <Button onClick={manejarRestablecimiento}>Guardar nueva contraseña</Button>
        {mensaje && <p style={{ color: 'green', marginTop: '15px' }}>{mensaje}</p>}
        {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
      </Form>
    </Container>
  );
};

export default RestablecerPassword;
