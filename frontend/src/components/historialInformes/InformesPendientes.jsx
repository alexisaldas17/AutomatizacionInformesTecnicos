
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    InformeCard,
    Detalle,
    GridContainer,
    Boton,
    ComentarioInput
} from './InformesPendientesStyles';
import ReactModal from 'react-modal';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { toast, ToastContainer } from 'react-toastify';
import UsuarioMenu from '../UsuarioMenu/UsuarioMenu';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../themes';
import { usePrefersDarkMode } from '../../hooks/usePrefersDarkMode';

ReactModal.setAppElement('#root'); // Required for accessibility

const InformesPendientes = () => {

    const [idAprobadorActual, setIdAprobadorActual] = useState(null);
    const isDarkMode = usePrefersDarkMode();

    const filtrarInformesPendientes = (data, idAprobador) => {
        return data.filter(informe => {
            const aprobadorActual = informe.aprobadores.find(ap => ap.id === idAprobador);
            console.log(aprobadorActual)
            return aprobadorActual && aprobadorActual.estado === 'Pendiente';
        });
    };


    useEffect(() => {
        // Simulación: obtener desde localStorage o API
        const id = localStorage.getItem('id');
        setIdAprobadorActual(parseInt(id));
    }, []);

    const [informes, setInformes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [informeSeleccionado, setInformeSeleccionado] = useState(null);
    const [comentario, setComentario] = useState('');
    const [modalAbierto, setModalAbierto] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');

    useEffect(() => {
        const fetchInformes = async () => {
            try {
                const idAprobador = parseInt(localStorage.getItem('id'));
                setIdAprobadorActual(idAprobador);

                const response = await axios.get('http://172.20.70.113:3000/api/aprobaciones/pendientes');
                const filtrados = filtrarInformesPendientes(response.data, idAprobador);
                setInformes(filtrados);
            } catch (error) {
                console.error('Error al obtener informes pendientes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInformes();
    }, []);





    const bufferToBlobUrl = (bufferData) => {
        const byteArray = new Uint8Array(bufferData.data);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
    };

    const handleVerInforme = (informe) => {
        setInformeSeleccionado(informe);
        const url = bufferToBlobUrl(informe.rutaPdf);
        setPdfUrl(url);
        setModalAbierto(true);
    };


    const manejarAprobacion = async (estado) => {
        if (!informeSeleccionado) return;

        const endpoint = estado === 'aprobado'
            ? 'http://172.20.70.113:3000/api/aprobaciones/aprobar'
            : 'http://172.20.70.113:3000/api/aprobaciones/rechazar';

        const idAprobador = parseInt(localStorage.getItem('id'));
        console.log('este es el id', idAprobador)
        if (!idAprobador) {
            console.error('No se encontró el ID del aprobador');
            return;
        }

        try {
            await axios.post(endpoint, {
                idInforme: informeSeleccionado.id,
                idAprobador,
                comentario
            });

            toast.success(`✅ Informe técnico ${estado} correctamente.`);

            // Cierra el modal y limpia estados
            setModalAbierto(false);
            setComentario('');
            setInformeSeleccionado(null);

            // Recarga los informes pendientes
            const response = await axios.get('http://172.20.70.113:3000/api/aprobaciones/pendientes');
            const filtrados = filtrarInformesPendientes(response.data, idAprobadorActual);
            setInformes(filtrados);



        } catch (err) {
            console.error('Error al enviar aprobación:', err);
            toast.error('❌ Ocurrió un error al procesar la aprobación.');
        }
    };


    if (loading) return <p>Cargando informes pendientes...</p>;

    return (


        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <Container>
                <UsuarioMenu />
                <h2>📄 Informes Técnicos Pendientes de Aprobación</h2>
                <p>Total pendientes: {informes.length}</p>
                {informes.length === 0 ? (
                    <p>No hay informes pendientes.</p>
                ) : (
                    <GridContainer>
                        {informes.map((informe) => (
                            <InformeCard
                                key={informe.id}
                                onClick={() => handleVerInforme(informe)}
                            >
                                <h3>Requerimiento: {informe.requerimiento}</h3>
                                <p><strong>Técnico:</strong> {informe.tecnico}</p>
                                <ul>
                                    {informe.aprobadores.map((aprobador, index) => (
                                        <li key={index}>
                                            {aprobador.nombre} - <strong>{aprobador.estado}</strong>
                                        </li>
                                    ))}
                                </ul>
                            </InformeCard>
                        ))}
                    </GridContainer>
                )}


                <ReactModal
                    isOpen={modalAbierto}
                    onRequestClose={() => setModalAbierto(false)}
                    contentLabel="Vista previa del informe"
                    style={{
                        overlay: {
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        },
                        content: {
                            top: '50%',
                            left: '50%',
                            right: 'auto',
                            bottom: 'auto',
                            marginRight: '-50%',
                            transform: 'translate(-50%, -50%)',
                            width: '70%',
                            height: '90%',
                            padding: '0',
                            display: 'flex',
                            flexDirection: 'column',
                        },
                    }}
                >
                    <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>

                        {pdfUrl && (
                            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                <Viewer fileUrl={pdfUrl} />
                            </Worker>
                        )}
                    </div>

                    <div style={{
                        padding: '15px 20px',
                        borderTop: '1px solid #ccc',
                        backgroundColor: '#f9f9f9',
                        position: 'sticky',
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <ComentarioInput
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            placeholder="Escribe un comentario..."
                        />
                        <div style={{ display: 'flex', justifyContent: '' }}>
                            <Boton className="aprobar" onClick={() => manejarAprobacion('aprobado')}>Aprobar</Boton>
                            {/*                         <Boton className="rechazar" onClick={() => manejarAprobacion('rechazado')}>Rechazar</Boton>
 */}                        <Boton className="cerrar" onClick={() => setModalAbierto(false)}>Cerrar</Boton>

                        </div>
                    </div>
                </ReactModal>
                <ToastContainer position="top-right" autoClose={3000} />

            </Container>
        </ThemeProvider>



    );
};

export default InformesPendientes;
