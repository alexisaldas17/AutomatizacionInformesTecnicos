import { useState } from 'react';
import axios from 'axios';

export default function SolicitarCodigo() {
  const [correo, setCorreo] = useState('');
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigo, setCodigo] = useState('');

  const solicitarCodigo = async () => {
    try {
      const res = await axios.post('http://172.20.70.113:3000/api/authRecovery/solicitar-codigo', { correo });
      setCodigoEnviado(true);
      setCodigo(res.data.codigo); // Solo para pruebas, puedes ocultarlo en producción
    } catch (error) {
      console.error('Error al solicitar código:', error);
      alert('No se pudo enviar el código');
    }
  };

  return (
    <div>
      <h2>Recuperar contraseña</h2>
      <input
        type="email"
        placeholder="Correo"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
      />
      <button onClick={solicitarCodigo}>Solicitar código</button>

      {codigoEnviado && (
        <div>
          <p>Código enviado. (Código para pruebas: <strong>{codigo}</strong>)</p>
        </div>
      )}
    </div>
  );
}
