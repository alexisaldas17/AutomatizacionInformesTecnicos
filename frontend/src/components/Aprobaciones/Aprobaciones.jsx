import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Aprobaciones = () => {
  const [informes, setInformes] = useState([]);
  const [estadosAprobacion, setEstadosAprobacion] = useState({});
  useEffect(() => {
    const cargarEstados = async () => {
      const nuevosEstados = {};
      for (const informe of informes) {
        try {
          const res = await axios.get(`http://localhost:3000/api/aprobaciones/estado/${informe.id}`);
          nuevosEstados[informe.id] = res.data.aprobado;
        } catch (error) {
          console.error(`Error al consultar estado del informe ${informe.id}:`, error);
        }
      }
      setEstadosAprobacion(nuevosEstados);
    };

    if (informes.length > 0) {
      cargarEstados();
    }
  }, [informes]);

  useEffect(() => {
    const cargarInformes = async () => {
      try {
        const response = await axios.get('http://172.20.70.113:3000/api/aprobaciones/pendientes');
        setInformes(response.data);
      } catch (error) {
        console.error('Error al cargar informes:', error);
      }
    };

    cargarInformes();
  }, []);

  const aprobar = async (idInforme, idAprobador) => {
    const comentario = prompt('Comentario de aprobación (opcional):');

    try {
      await axios.post('http://localhost:3000/api/aprobaciones/aprobar', {
        idInforme,
        idAprobador,
        comentario
      });

      alert('✅ Informe aprobado correctamente');
      // Recargar lista
      setInformes((prev) => prev.filter((i) => i.id !== idInforme));
    } catch (error) {
      console.error('Error al aprobar:', error);
      alert('❌ Error al aprobar el informe');
    }
  };

  return (
    <div>
      <h2>Informes pendientes de aprobación</h2>
      {informes.length === 0 ? (
        <p>No hay informes pendientes.</p>
      ) : (
        <ul>
          {informes.map((informe) => (
            <li key={informe.id}>
              <strong>Requerimiento:</strong> {informe.requerimiento} <br />
              <strong>Técnico:</strong> {informe.tecnico} <br />
              <strong>Aprobadores:</strong>
              <ul>
                {informe.aprobadores.map((ap) => (
                  <li key={ap.id}>
                    {ap.nombre} - <em>{ap.estado}</em>
                    {ap.estado === 'Pendiente' && (
                      <button onClick={() => aprobar(informe.id, ap.id)}>Aprobar</button>
                    )}
                  </li>
                ))}
              </ul>
              <hr />
            </li>
          ))}
        </ul>

      )}

      {estadosAprobacion[informe.id] && (
        <span style={{ color: 'green', fontWeight: 'bold' }}>
          ✅ Aprobado por al menos uno
        </span>
      )}

    </div>
  );
};

export default Aprobaciones;
