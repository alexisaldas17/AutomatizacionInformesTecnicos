import { useState } from 'react';
import axios from 'axios';

export default function RestablecerPassword() {
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');

  const restablecer = async () => {
    try {
      await axios.post('http://172.20.70.133:3000/api/authRecovery/restablecer-con-codigo', {
        correo,
        codigo,
        nuevaPassword
      });
      alert('Contraseña actualizada correctamente');
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      alert('Código inválido o expirado');
    }
  };

  return (
    <div>
      <h2>Restablecer contraseña</h2>
      <input
        type="email"
        placeholder="Correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
      />
      <input
        type="text"
        placeholder="Código"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />
      <input
        type="password"
        placeholder="Nueva contraseña"
        value={nuevaPassword}
        onChange={(e) => setNuevaPassword(e.target.value)}
      />
      <button onClick={restablecer}>Restablecer</button>
    </div>
  );
}



/* import React, { useState } from 'react';
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
      const res = await axios.post('http://172.20.70.113:3000/api/authRecovery/restablecer-password', {
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
 */