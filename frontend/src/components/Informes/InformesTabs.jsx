import React, { useState } from 'react';
import HistorialInformesActivos from './Historial/HistorialInformesActivos'; // Ajusta la ruta según tu estructura
import HistorialInformesPartes from './Historial/HistorialInformesPartes';   // Ajusta la ruta según tu estructura

const InformesTabs = () => {
  const [pestanaActiva, setPestanaActiva] = useState('activos');

  const tabStyle = (tab) => ({
    padding: '10px 20px',
    margin: '0 10px',
    border: 'none',
    borderBottom: pestanaActiva === tab ? '3px solid #007bff' : '3px solid transparent',
    backgroundColor: pestanaActiva === tab ? '#e6f0ff' : 'transparent',
    color: pestanaActiva === tab ? '#007bff' : '#333',
    fontWeight: pestanaActiva === tab ? 'bold' : 'normal',
    cursor: 'pointer',
    borderRadius: '5px 5px 0 0',
    transition: 'all 0.3s ease'
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', borderBottom: '2px solid #ccc', marginBottom: '1rem' }}>
        <button
          onClick={() => setPestanaActiva('activos')}
          style={tabStyle('activos')}
        >
          Activos
        </button>
        <button
          onClick={() => setPestanaActiva('componentes')}
          style={tabStyle('componentes')}
        >
          Partes
        </button>
      </div>

      <div>
        {pestanaActiva === 'activos' && <HistorialInformesActivos />}
        {pestanaActiva === 'componentes' && <HistorialInformesPartes />}
      </div>
    </div>
  );
};

export default InformesTabs;
