import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    Container,
    InformeCard,
    GridContainer,
    TotalPendientes,
    Loader,
    IconContainer,
    InformeCardHover,
    IconOverlay
} from './InformesPendientesStyles';
import ReactModal from 'react-modal';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import UsuarioMenu from '../UsuarioMenu/UsuarioMenu';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../themes';
import { usePrefersDarkMode } from '../../hooks/usePrefersDarkMode';
import { FaClock, FaCheckCircle, FaUserCheck, FaFilePdf, FaEdit, FaEnvelope } from 'react-icons/fa';
import HomeButton from '../HomeButton';

ReactModal.setAppElement('#root');

const InformesPendientesAprobadosPorTecnico = () => {
    const [idTecnico, setIdTecnico] = useState(null);
    const [informesPendientes, setInformesPendientes] = useState([]);
    const [informesAprobados, setInformesAprobados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [tabActiva, setTabActiva] = useState('pendientes'); // 👈 Nueva pestaña activa
    const isDarkMode = usePrefersDarkMode();

    useEffect(() => {
        const id = localStorage.getItem('id');
        setIdTecnico(parseInt(id));
    }, []);

    useEffect(() => {
        const fetchInformes = async () => {
            try {
                const response = await axios.get(`http://172.20.70.113:3000/api/aprobaciones/por-tecnico/${idTecnico}`);
                setInformesPendientes(response.data.pendientes);
                setInformesAprobados(response.data.aprobados);
                console.log('DATA', response.data)
            } catch (error) {
                console.error('Error al obtener informes del técnico:', error);
            } finally {
                setLoading(false);
            }
        };
        if (idTecnico) fetchInformes();
    }, [idTecnico]);

    const bufferToBlobUrl = (bufferData) => {
        const byteArray = new Uint8Array(bufferData.data);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
    };

    const handleVerInforme = (informe) => {
        const url = bufferToBlobUrl(informe.rutaPdf);
        setPdfUrl(url);
        setModalAbierto(true);
    };


    const enviarCorreo = async (idInforme, destinatario) => {
        try {
            const response = await axios.post('http://172.20.70.113:3000/api/auth/enviar-correo', {
                idInforme,
                destinatario,
            });

            if (response.data.success) {
                toast.success('📧 Correo enviado correctamente');
            } else {
                toast.error('❌ Error al enviar el correo');
            }
        } catch (error) {
            console.error('Error al enviar correo:', error);
            toast.error('⚠️ Error de conexión al servidor');
        }
    };

    if (loading) return <Loader>Cargando informes...</Loader>;

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <Container>
                <HomeButton />
                {!modalAbierto && <UsuarioMenu />}
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>📄 Informes Técnicos Aprobados / Pendientes</h2>

                {/* 🔀 Botones de pestañas */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <button
                        onClick={() => setTabActiva('pendientes')}
                        style={{
                            marginRight: '10px',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: tabActiva === 'pendientes' ? '#3498db' : '#ecf0f1',
                            color: tabActiva === 'pendientes' ? '#fff' : '#2c3e50',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        🕒 Pendientes ({informesPendientes.length})
                    </button>
                    <button
                        onClick={() => setTabActiva('aprobados')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: tabActiva === 'aprobados' ? '#2ecc71' : '#ecf0f1',
                            color: tabActiva === 'aprobados' ? '#fff' : '#2c3e50',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        ✅ Aprobados ({informesAprobados.length})
                    </button>
                </div>


                {/* 📋 Renderizado condicional */}
                <GridContainer>
                    {(tabActiva === 'pendientes' ? informesPendientes : informesAprobados).map((inf, index) => {
                        const fecha = new Date(tabActiva === 'pendientes' ? inf.FECHA_SOLICITUD : inf.FECHA_RESPUESTA).toLocaleString('es-EC', {
                            timeZone: 'America/Guayaquil',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        });

                        const isAprobado = inf.ESTADO === 'Aprobado';

                        if (isAprobado) {
                            return (
                                <InformeCardHover
                                    key={`informe-aprobado-${inf.ID || inf.id || index}`}
                                    onClick={() => handleVerInforme(inf)}
                                    style={{
                                        borderLeft: '6px solid #2ecc71',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <IconOverlay className="icon-overlay">
                                        <FaEdit style={{ fontSize: '24px', cursor: 'pointer' }}
                                            title="Editar"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toast.info(`Editar informe ${inf.ID || inf.id}`);
                                            }}
                                        />
                                        <FaEnvelope
                                            style={{ fontSize: '24px', cursor: 'pointer' }}
                                            title="Enviar correo"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log(inf.ID_INFORME)
                                                enviarCorreo(inf.ID_INFORME, inf.EMAIL); // puedes usar un input dinámico

                                                // toast.success(`Enviar correo informe ${inf.ID || inf.id}`);
                                            }}
                                        />
                                    </IconOverlay>
                                    <div className="card-content">
                                        <h3>📌 {inf.requerimiento}</h3>
                                        <p>📅 Fecha: <strong>{fecha}</strong></p>
                                        <p>📍 Estado: <strong style={{ color: '#2ecc71' }}>{inf.ESTADO}</strong></p>
                                        <p>👤 <strong>Aprobado por:</strong> {inf.nombreAprobador}</p>
                                        <p>💬 <strong>Comentario:</strong> <span style={{ fontStyle: 'italic' }}>{inf.COMENTARIO}</span></p>
                                    </div>
                                </InformeCardHover>
                            );
                        } else {
                            return (
                                <InformeCard
                                    key={`informe-pendiente-${inf.ID || inf.id || index}`}
                                    onClick={() => handleVerInforme(inf)}
                                    style={{
                                        borderLeft: '6px solid #f39c12',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                        transition: 'transform 0.2s',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <div className="card-content">
                                        <h3>📌 {inf.requerimiento}</h3>
                                        <p>📅 Fecha: <strong>{fecha}</strong></p>
                                        <p>📍 Estado: <strong style={{ color: '#e67e22' }}>{inf.ESTADO}</strong></p>
                                    </div>
                                </InformeCard>
                            );
                        }
                    })}
                </GridContainer>


                {/* 📄 Modal PDF */}
                <ReactModal
                    isOpen={modalAbierto}
                    onRequestClose={() => setModalAbierto(false)}
                    contentLabel="Vista previa del informe"

                    style={{
                        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.9)' },
                        content: {
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '70%',
                            height: '100vh',
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
                </ReactModal>
            </Container>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

        </ThemeProvider>

    );
};
export default InformesPendientesAprobadosPorTecnico;
