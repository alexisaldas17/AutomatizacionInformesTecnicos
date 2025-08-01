
import React, { useEffect, useState } from 'react';

const VistaPreviaInforme = ({ pdfBlob, nombreArchivo, onEnviarAprobacion }) => {
  const [aprobadores, setAprobadores] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [mostrarBotonEnviar, setMostrarBotonEnviar] = useState(false);
  const [pdfURL, setPdfURL] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(pdfBlob);
    setPdfURL(url);
  }, [pdfBlob]);

/*   useEffect(() => {
    const cargarAprobadores = async () => {
      try {
        const res = await fetch('http://172.20.70.113:3000/api/aprobaciones/aprobadores');
        const data = await res.json();
        setAprobadores(data);
        console.log(data);
      } catch (error) {
        console.error('Error al cargar aprobadores:', error);
      }
    };
    cargarAprobadores();
  }, []);
 */
  const manejarSeleccion = (e) => {
    const opciones = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setSeleccionados(opciones);
    setMostrarBotonEnviar(opciones.length > 0);
  };

/*   const enviarParaAprobacion = () => {
    if (seleccionados.length === 0) {
      alert('Debe seleccionar al menos un aprobador.');
      return;
    }
    onEnviarAprobacion(seleccionados);
    setMostrarBotonEnviar(false);
  }; */
  const enviarParaAprobacion = async () => {
    if (seleccionados.length === 0) return;

    try {
      const res = await fetch('http://172.20.70.113:3000/api/aprobaciones/enviar-aprobacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idInforme, aprobadores: seleccionados })
      });

      const result = await res.json();
      console.log(result);

      if (result.success) {
        setToastMessage('✅ Informe enviado para aprobación.');
        setToastSeverity('success');
        setOpenModal(false);
      } else {
        setToastMessage(result.message || '❌ Error al enviar para aprobación.');
        setToastSeverity('error');
      }

      setToastOpen(true);
    } catch (error) {
      console.error('Error al enviar para aprobación:', error);
      setToastMessage('❌ Ocurrió un error al enviar para aprobación.');
      setToastSeverity('error');
      setToastOpen(true);
    }
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif' }}>
      <iframe src={pdfURL} width="100%" height="600px" style={{ border: 'none' }} title="Vista previa PDF" />
      <div style={{ marginTop: '20px' }}>
        <div id="seccion-aprobadores">
          <label htmlFor="select-aprobadores">Seleccionar Aprobadores:</label><br />
          <select id="select-aprobadores" multiple size="5" style={{ width: '300px' }} onChange={manejarSeleccion}>
            {aprobadores.map(ap => (
              <option key={ap.ID} value={ap.ID}>{ap.NOMBRE}</option>
            ))}
          </select><br />
          {mostrarBotonEnviar && (
            <button onClick={enviarParaAprobacion} style={{ marginTop: '10px' }}>
              Enviar para Aprobación
            </button>
          )}
        </div>
        <button onClick={() => window.close()}>Actualizar Datos</button>
        <a href={pdfURL} download={nombreArchivo}>
          <button>Guardar Informe en el Equipo</button>
        </a>
      </div>
    </div>
  );
};

export default VistaPreviaInforme;
