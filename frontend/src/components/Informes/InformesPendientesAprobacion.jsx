import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  InformeCard,
  Detalle,
  GridContainer,
  Boton,
  ComentarioInput,
  TotalPendientes,
  Loader,
  LoadingContainer,
  SpinnerIcon,
  LoadingText,
  ModalContent,
} from "./InformesPendientesStyles";
import ReactModal from "react-modal";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { toast, ToastContainer } from "react-toastify";
import UsuarioMenu from "../UsuarioMenu/UsuarioMenu";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../themes";
import { usePrefersDarkMode } from "../../hooks/usePrefersDarkMode";
import {
  FaUserCheck,
  FaUserClock,
  FaFilePdf,
  FaClipboardList,
} from "react-icons/fa";
import { BotonContainer } from "../FormularioStyles";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

ReactModal.setAppElement("#root"); // Required for accessibility

const InformesPendientes = () => {
  const [idAprobadorActual, setIdAprobadorActual] = useState(null);
  const isDarkMode = usePrefersDarkMode();
  const [confirmacion, setConfirmacion] = useState({
    tipo: "",
    abierto: false,
  });


  /* const abrirConfirmacion = () => {
    setConfirmarAprobacion(true);
  }; */
  const abrirConfirmacion = (tipo) => {
    setConfirmacion({ tipo, abierto: true });
  };


  const confirmarYEnviar = () => {
    setConfirmacion({ tipo: "", abierto: false });
    manejarAprobacion(confirmacion.tipo);
  };


  const filtrarInformesPendientes = (data, idAprobador) => {
    return data.filter((informe) => {
      const aprobadorActual = informe.aprobadores.find(
        (ap) => ap.id === idAprobador
      );
      console.log(aprobadorActual);
      return aprobadorActual && aprobadorActual.estado === "Pendiente";
    });
  };

  useEffect(() => {
    // Simulación: obtener desde localStorage o API
    const id = localStorage.getItem("id");
    setIdAprobadorActual(parseInt(id));
  }, []);

  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [informeSeleccionado, setInformeSeleccionado] = useState(null);
  const [comentario, setComentario] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    const fetchInformes = async () => {
      try {
        const idAprobador = parseInt(localStorage.getItem("id"));
        setIdAprobadorActual(idAprobador);

        const response = await axios.get(
          "http://172.20.70.113:3000/api/aprobaciones/pendientes"
        );
        const filtrados = filtrarInformesPendientes(response.data, idAprobador);
        setInformes(filtrados);
      } catch (error) {
        console.error("Error al obtener informes pendientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInformes();
  }, []);

  const bufferToBlobUrl = (bufferData) => {
    const byteArray = new Uint8Array(bufferData.data);
    const blob = new Blob([byteArray], { type: "application/pdf" });
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

    const endpoint =
      estado === "aprobado"
        ? "http://172.20.70.113:3000/api/aprobaciones/aprobar"
        : "http://172.20.70.113:3000/api/aprobaciones/rechazar";

    const idAprobador = parseInt(localStorage.getItem("id"));
    console.log("este es el id", idAprobador);
    if (!idAprobador) {
      console.error("No se encontró el ID del aprobador");
      return;
    }

    try {
      await axios.post(endpoint, {
        idInforme: informeSeleccionado.id,
        idAprobador,
        comentario,
      });

      toast.success(`✅ Informe técnico ${estado} correctamente.`);

      // Cierra el modal y limpia estados
      setModalAbierto(false);
      setComentario("");
      setInformeSeleccionado(null);

      // Recarga los informes pendientes
      const response = await axios.get(
        "http://172.20.70.113:3000/api/aprobaciones/pendientes"
      );
      const filtrados = filtrarInformesPendientes(
        response.data,
        idAprobadorActual
      );
      setInformes(filtrados);
    } catch (err) {
      console.error("Error al enviar aprobación:", err);
      toast.error("❌ Ocurrió un error al procesar la aprobación.");
    }
  };

  if (loading)
    return (
      <LoadingContainer>
        <SpinnerIcon />
        <LoadingText>Cargando informes pendientes...</LoadingText>
      </LoadingContainer>
    );

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Container>
        {!modalAbierto && <UsuarioMenu />}
        <h2>📄 Informes Técnicos Pendientes de Aprobación</h2>
        <TotalPendientes>
          🔔 Total pendientes: {informes.length}
        </TotalPendientes>

        {informes.length === 0 ? (
          <p>No hay informes pendientes.</p>
        ) : (
          <GridContainer>
            {informes.map((informe) => (
              <InformeCard
                key={informe.id}
                onClick={() => handleVerInforme(informe)}
                style={{
                  borderLeft: "6px solid #f39c12",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  transition: "transform 0.2s",
                  cursor: "pointer",
                }}
              >
                <h3>
                  <FaFilePdf style={{ marginRight: "8px" }} />{" "}
                  {informe.requerimiento}
                </h3>
                <p>
                  <strong>
                    <FaUserCheck /> Técnico:
                  </strong>{" "}
                  {informe.tecnico}
                </p>
                <ul>
                  {informe.aprobadores.map((aprobador, index) => (
                    <li key={index}>
                      {aprobador.nombre} -
                      <strong
                        style={{
                          color:
                            aprobador.estado === "Pendiente"
                              ? "orange"
                              : "green",
                        }}
                      >
                        {aprobador.estado}
                      </strong>
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
              backgroundColor: "rgba(0, 0, 0, 0.9)",
            },
            content: {
              top: "50%",
              left: "50%",
              right: "auto",
              bottom: "auto",
              marginRight: "-50%",
              transform: "translate(-50%, -50%)",
              width: "70%",
              height: "100vh",
              padding: "0",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          <div style={{ flex: 1, overflow: "auto", padding: "20px" }}>
            {pdfUrl && (
              <Worker workerUrl="/pdf.worker.min.js">
                <Viewer fileUrl={pdfUrl} />
              </Worker>
            )}
          </div>

          <div
            style={{
              padding: "15px 20px",
              borderTop: "1px solid #ccc",
              backgroundColor: "#f9f9f9",
              position: "sticky",
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <ComentarioInput
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe un comentario..."
            />

            <BotonContainer>
              <Button
                variant="contained"
                color="success"
                onClick={() => abrirConfirmacion("aprobado")}
              >
                Aprobar
              </Button>
              <Button
                className="btn-rojo"
                onClick={() => abrirConfirmacion("rechazado")}
              >
                Rechazar
              </Button>

              <Dialog
                open={confirmacion.abierto}
                onClose={() => setConfirmacion({ tipo: "", abierto: false })}
                maxWidth="xs"
                fullWidth
              >
                <DialogTitle>
                  Confirmar{" "}
                  {confirmacion.tipo === "aprobado" ? "aprobación" : "rechazo"}
                </DialogTitle>
                <DialogContent>
                  <Typography>
                    ¿Estás seguro que deseas{" "}
                    {confirmacion.tipo === "aprobado" ? "aprobar" : "rechazar"}{" "}
                    este informe técnico?
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() =>
                      setConfirmacion({ tipo: "", abierto: false })
                    }
                    color="primary"
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    onClick={confirmarYEnviar}
                    color={
                      confirmacion.tipo === "aprobado" ? "success" : "error"
                    }
                    variant="contained"
                  >
                    {confirmacion.tipo === "aprobado" ? "Aprobar" : "Rechazar"}
                  </Button>
                </DialogActions>
              </Dialog>

              {/*                             <Button className="btn-gris" onClick={() => setModalAbierto(false)}>CERRAR</Button>
               */}
            </BotonContainer>
          </div>
        </ReactModal>

        <ToastContainer position="top-right" autoClose={3000} />
      </Container>
    </ThemeProvider>
  );
};

export default InformesPendientes;
