import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Title, Input, Button } from './FormStyles'; // Ajusta la ruta si es necesario

const CambiarPassword = () => {
  const [correo, setCorreo] = useState('');
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');

  const manejarCambio = async () => {
    try {
      const res = await axios.post('http://172.20.70.113:3000/api/auth/cambiar-password', {
        correo,
        passwordActual,
        nuevaPassword
      });

      alert(res.data.message);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      alert(error.response?.data?.error || 'Error al cambiar contraseña');
    }
  };

  return (
    <Container>
      <Form>
        <Title>Cambiar Contraseña</Title>
        <Input
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="Correo"
        />
        <Input
          type="password"
          value={passwordActual}
          onChange={(e) => setPasswordActual(e.target.value)}
          placeholder="Contraseña actual"
        />
        <Input
          type="password"
          value={nuevaPassword}
          onChange={(e) => setNuevaPassword(e.target.value)}
          placeholder="Nueva contraseña"
        />
        <Button onClick={manejarCambio}>Cambiar</Button>
      </Form>
    </Container>
  );
};

export default CambiarPassword;
