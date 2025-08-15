import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, PDFViewer, ToastWrapper } from './VistaPreviaPageStyles';

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert

} from '@mui/material';


const VistaPreviaPage = ({ idInforme, requerimiento, usuario }) => {
  /*  const [searchParams] = useSearchParams();
   const idInforme = searchParams.get('idInforme');
    const requerimiento = searchParams.get('requerimiento');
   const usuario = searchParams.get('usuario'); */

  const [pdfURL, setPdfURL] = useState('');
  const [aprobadores, setAprobadores] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [openModal, setOpenModal] = useState(false);


  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success'); // 'success' o 'error'


  useEffect(() => {
    const cargarPDF = async () => {
      try {
        const res = await fetch(`http://172.20.70.113:3000/api/pdf/obtener/${idInforme}`);
        const data = await res.json();
        const byteCharacters = atob(data.pdf);
        const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) => byteCharacters.charCodeAt(i));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfURL(url);
      } catch (error) {
        console.error('Error al cargar el PDF:', error);
      }
    };

    const cargarAprobadores = async () => {
      try {
        const res = await fetch('http://172.20.70.113:3000/api/aprobaciones/aprobadores');
        const data = await res.json();
        setAprobadores(data);
      } catch (error) {
        console.error('Error al cargar aprobadores:', error);
      }
    };

    if (idInforme) {
      cargarPDF();
      cargarAprobadores();
    }
  }, [idInforme]);

  const enviarParaAprobacion = async () => {
    if (seleccionados.length === 0) return;

    const remitente = localStorage.getItem('correo'); // Obtener el correo del técnico

    try {
      const res = await fetch('http://172.20.70.113:3000/api/aprobaciones/enviar-aprobacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idInforme, aprobadores: seleccionados, remitente })
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

  const descargarPDF = () => {
    const nombreArchivo = `INFORME TECNICO_${requerimiento}_${usuario}.pdf`.replace(/\s+/g, ' ');

    const link = document.createElement('a');
    link.href = pdfURL;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container>
      <h2>Vista Previa del Informe</h2>
      {pdfURL ? (
        <>
          <PDFViewer>
            <iframe
              src={pdfURL}
              title="Vista previa PDF"
              style={{ border: '1px solid #ccc', borderRadius: '8px', width: '100%', height: '100%' }}
            />
          </PDFViewer>

          <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
            Enviar para Aprobación
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={descargarPDF}
            style={{ marginLeft: '10px' }}
          >
            Descargar Informe en el equipo
          </Button>
              <Button onClick={() => setOpenModal(false)}>Cancelar</Button>

          <Dialog open={openModal} onClose={() => setOpenModal(false)}>
            <DialogTitle>Seleccionar Aprobadores</DialogTitle>
            <DialogContent>
              <FormControl fullWidth>
                <InputLabel>Aprobadores</InputLabel>
                <Select
                  multiple
                  value={seleccionados}
                  onChange={(e) => setSeleccionados(e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {aprobadores.map((ap) => (
                    <MenuItem key={ap.ID} value={ap.ID}>
                      {ap.NOMBRE}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
              <Button onClick={enviarParaAprobacion} variant="contained" color="success">
                Enviar
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <p>Cargando PDF...</p>
      )}

      <ToastWrapper>
        <Snackbar
          open={toastOpen}
          autoHideDuration={4000}
          onClose={() => setToastOpen(false)}
        >
          <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: '100%' }}>
            {toastMessage}
          </Alert>
        </Snackbar>
      </ToastWrapper>
    </Container>
  );



};


export default VistaPreviaPage;
