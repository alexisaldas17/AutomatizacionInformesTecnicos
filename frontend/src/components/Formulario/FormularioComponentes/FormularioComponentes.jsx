import React, { useState, useRef, useEffect } from "react";
import Select from "react-select";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { usePrefersDarkMode } from "../../../hooks/usePrefersDarkMode";
import { lightTheme, darkTheme } from "../../themes";
import { FaCamera, FaBroom } from "react-icons/fa"; // Ícono de cámara y escoba
import {
  obtenerTecnicos,
  obtenerUsuarios,
  obtenerUsuarioPorNombre,
} from "../../services/FormularioComponentesServices";
import { toast, ToastContainer } from "react-toastify";
import { generarPDFenMemoria } from "../../helpers/pdfUtilsComponentes";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import {
  PaginaCompleta,
  FormularioContenedor,
  TituloFormulario,
  SeccionFormulario,
  FilaFormulario,
  BotonContainer,
  BotonEliminar,
  AutocompleteContainer,
  ModalOverlay,
  ModalContent,
} from "../FormularioStyles"; // Asegúrate de que la ruta sea correcta
import HomeButton from "../../Home/HomeButton";
import { ThemeProvider } from "styled-components";
import EditorComentario from "../../EditorComentario/EditorComentario";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import axios from "axios";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const FormularioComponentes = () => {
  const isDarkMode = usePrefersDarkMode();
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
  const [firmaBase64, setFirmaBase64] = useState(null);
  const [pdfURL, setPdfURL] = useState(null);
  const [nombreArchivoGenerado, setNombreArchivoGenerado] = useState("");
  const [mostrarModalPDF, setMostrarModalPDF] = useState(false);
  const [mostrarSelectorAprobadores, setMostrarSelectorAprobadores] =
    useState(false);
  const [datosComponentes, setDatosComponentes] = useState([]);
  const [marcasFiltradas, setMarcasFiltradas] = useState([]);
  const [modelosFiltrados, setModelosFiltrados] = useState([]);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [idInforme, setIdInforme] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [openModalAprobadores, setOpenModalAprobadores] = useState(false);
  const [aprobadoresDisponibles, setAprobadoresDisponibles] = useState([]);
  const [aprobadoresSeleccionados, setAprobadoresSeleccionados] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  const customSelectStyles = (isDarkMode) => ({
    control: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
      borderColor: isDarkMode ? "#555" : "#ccc",
      color: isDarkMode ? "#f0f0f0" : "#333",
    }),

    input: (base) => ({
      ...base,
      color: isDarkMode ? "#f0f0f0" : "#333",
      width: "100px", // o el ancho que prefieras
      flex: "none", // evita que crezca automáticamente
    }),

    menu: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? "#2a2a2a" : "#fff",
      color: isDarkMode ? "#f0f0f0" : "#333",
    }),
    singleValue: (base) => ({
      ...base,
      color: isDarkMode ? "#f0f0f0" : "#333",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? isDarkMode
          ? "#333"
          : "#eee"
        : isDarkMode
        ? "#2a2a2a"
        : "#fff",
      color: isDarkMode ? "#f0f0f0" : "#333",
    }),
    placeholder: (base) => ({
      ...base,
      color: isDarkMode ? "#aaa" : "#666",
    }),
  });

  const [tiposComponentes, setTiposComponentes] = useState([]);
  const obtenerTiposComponentes = async () => {
    const response = await fetch(
      "http://172.20.70.113:3000/api/componentes/tipos"
    );
    const data = await response.json();
    return data;
  };

  const obtenerDatosComponentes = async () => {
    const response = await fetch(
      "http://172.20.70.113:3000/api/componentes/datos"
    );
    const data = await response.json();
    return data;
  };
  useEffect(() => {
    const cargarAprobadores = async () => {
      const res = await axios.get(
        "http://172.20.70.113:3000/api/aprobaciones/aprobadores"
      );
      const opciones = res.data.map((ap) => ({
        label: ap.NOMBRE,
        value: ap.ID,
      }));
      setAprobadoresDisponibles(opciones);
    };
    cargarAprobadores();
  }, []);

  useEffect(() => {
    const cargarDatosComponentes = async () => {
      try {
        const datos = await obtenerDatosComponentes();
        setDatosComponentes(datos);
      } catch (error) {
        console.error("Error al cargar datos de componentes:", error);
      }
    };
    cargarDatosComponentes();
  }, []);

  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const tipos = await obtenerTiposComponentes();
        setTiposComponentes(tipos);
      } catch (error) {}
    };
    cargarTipos();
  }, []);

  const opcionesTiposComponentes = tiposComponentes.map((tc) => ({
    label: tc.TIPO_COMPONENTE, // ajusta según el campo real
    value: tc.ID,
  }));

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const tecnicosData = await obtenerTecnicos();
        const usuariosData = await obtenerUsuarios();
        setTecnicos(tecnicosData);
        setUsuarios(usuariosData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);
  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          const url = URL.createObjectURL(file);
          const nuevaImagen = { file, url };

          setImagenesSeleccionadas((prev) => [...prev, nuevaImagen]);

          toast.success("📸 Imagen pegada desde el portapapeles");
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);
  const opcionesTecnicos = tecnicos.map((t) => ({
    label: t.NOM_TECNICO,
    value: t.id,
  }));
  const vistaPreviaImagen = (url) => {
    window.open(url, "_blank");
  };
  const opcionesUsuarios = usuarios.map((u) => ({
    label: u.NOMBRE,
    value: u.id,
  }));

  const [formData, setFormData] = useState({
    requerimiento: "",
    tecnico: "",
    usuario: "",
    email: "",
    cargo: "",
    empresa: "",
    departamento: "",
    codigoBarras: "",
    comentario: "",
    tipoComponente: "",
    marca: "",
    modelo: "",
    numSerie: "",
    firma: firmaBase64,
  });

  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCodigoBarrasChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    value = value.slice(0, 11);
    if (value.length > 6) {
      value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)} ${value.slice(3)}`;
    }
    setFormData({ ...formData, codigoBarras: value });
  };

  const handleGuardar = (e) => {
    e.preventDefault();
  };

  const handleUsuarioSeleccionado = async (opcion) => {
    try {
      const usuarioCompleto = await obtenerUsuarioPorNombre(opcion.label);
      setFormData((prev) => ({
        ...prev,
        usuario: opcion.label,
        email: usuarioCompleto.MAIL || "",
        cargo: usuarioCompleto.CARGO || "",
        empresa: usuarioCompleto.EMPRESA || "",
        departamento: usuarioCompleto.DEPARTAMENTO || "",
      }));
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
    }
  };
  const handleImagenesSeleccionadas = (e) => {
    const archivos = Array.from(e.target.files);

    const previews = archivos.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImagenesSeleccionadas((prev) => [...prev, ...previews]);
    /* setImagenesSeleccionadas(previews); */
  };

  const eliminarImagen = (url) => {
    setImagenesSeleccionadas((prev) => {
      const actualizadas = prev.filter((img) => img.url !== url);
      URL.revokeObjectURL(url); // Limpieza de memoria
      return actualizadas;
    });
  };

  const moverImagenArriba = (index) => {
    if (index === 0) return;
    setImagenesSeleccionadas((prev) => {
      const nuevas = [...prev];
      [nuevas[index - 1], nuevas[index]] = [nuevas[index], nuevas[index - 1]];
      return nuevas;
    });
  };

  const moverImagenAbajo = (index) => {
    if (index === imagenesSeleccionadas.length - 1) return;
    setImagenesSeleccionadas((prev) => {
      const nuevas = [...prev];
      [nuevas[index], nuevas[index + 1]] = [nuevas[index + 1], nuevas[index]];
      return nuevas;
    });
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleGenerarYMostrarInforme = async () => {
    console.log("Generando informe con datos:", formData);
    if (!validarCamposObligatorios()) return;

    // Validar que la firma esté presente
    if (!firmaBase64 || firmaBase64.trim() === "") {
      toast.info("❌ Debes cargar la firma antes de generar el informe.");
      return;
    }

    try {
      const imagenesBase64 = await Promise.all(
        imagenesSeleccionadas.map((img) => convertirADataURL(img.file))
      );

      const nombreArchivo =
        `INFORME_TÉCNICO_${formData.requerimiento}_${formData.usuario}`.replace(
          /\s+/g,
          "_"
        );
      setNombreArchivoGenerado(nombreArchivo);

      const datosParaGuardar = {
        ...formData,
        nombreArchivo,
        imagenes: imagenesBase64,
        firma: firmaBase64,
      };
      const resultado = await generarPDFenMemoria(datosParaGuardar);
      if (!resultado.success) {
        toast.error("❌ Error al generar el PDF.");
        return;
      }

      const pdfBlob = resultado.blob;
      const pdfBase64 = await blobToBase64(pdfBlob);

      // Verificar si ya existe un informe
      console.log(
        "Verificando si ya existe un informe para el requerimiento:",
        formData.requerimiento
      );
      const verificar = await axios.get(
        `http://172.20.70.113:3000/api/componentes/verificar`,
        {
          params: { requerimiento: formData.requerimiento },
        }
      );

      let idInforme = null;
      if (verificar.data.existe) {
        idInforme = verificar.data.id;

        await axios.put(
          `http://172.20.70.113:3000/api/componentes/actualizar/${idInforme}`,
          {
            ...datosParaGuardar,
            pdf: pdfBase64,
          }
        );
      } else {
        console.log(datosParaGuardar);
        const guardarResponse = await axios.post(
          `http://172.20.70.113:3000/api/componentes/guardar`,
          {
            ...datosParaGuardar,
            pdf: pdfBase64,
          }
        );

        idInforme = guardarResponse.data?.id;
      }

      if (idInforme) {
        setIdInforme(idInforme);
        setMostrarModalPDF(true);
        const url = URL.createObjectURL(resultado.blob);
        setPdfURL(url);
      } else {
        toast.error("❌ No se pudo obtener el ID del informe.");
      }
    } catch (error) {
      toast.error("❌ Ocurrió un error al generar el informe.", error);
      console.error("Error al generar el informe:", error);
    }
  };

  /* FIRMA */
  const handleFirmaSeleccionada = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setFirmaBase64(base64);
        setFormData((prev) => ({ ...prev, firma: base64 }));

        try {
          const imagenesBase64 = await Promise.all(
            imagenesSeleccionadas.map((img) => convertirADataURL(img.file))
          );

          const formDataConFirma = {
            ...formData,
            imagenes: imagenesBase64,
            firma: base64,
          };

          const resultado = await generarPDFenMemoria(formDataConFirma);
          if (resultado.success) {
            const url = URL.createObjectURL(resultado.blob);
            setPdfURL(url);
            toast.success("✅ Se cargó la firma correctamente");
          } else {
            toast.error("❌ Error al regenerar el PDF con la firma.");
          }
        } catch (error) {
          console.error("Error al procesar la firma:", error);
          toast.error("❌ Ocurrió un error al cargar la firma.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const hayDatosCargados = () => {
    /*     return ( */
    /*     formData.requerimiento ||
            formData.usuario ||
            formData.tecnico ||
            formData.equipo ||
            formData.codigoBarras ||
            formData.comentario || */
    /* imagenesSeleccionadas.length > 0 || */
    /* firmaBase64 */
    /*   ); */
  };

  /* VALIDAR CAMPOS */
  const validarCamposObligatorios = () => {
    const camposRequeridos = [
      "usuario",
      "tecnico",
      "tipoComponente",
      "comentario",
    ];

    for (const campo of camposRequeridos) {
      if (!formData[campo] || formData[campo].trim() === "") {
        toast.warning(`El campo "${campo}" es obligatorio.`);
        return false;
      }
    }

    return true;
  };
  const convertirADataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleLimpiarFormulario = () => {};
  const handleEnviarParaAprobacion = async () => {
    if (!aprobadoresSeleccionados || aprobadoresSeleccionados.length === 0) {
      toast.warning("Debe seleccionar al menos un aprobador.");
      return;
    }

    try {
      const obtenerID = await axios.get(
        `http://172.20.70.113:3000/api/componentes/verificar`,
        {
          params: { requerimiento: formData.requerimiento },
        }
      );

      const idInforme = obtenerID.data.id;
      const idsAprobadores = aprobadoresSeleccionados.map((ap) => ap.value);

      // Obtener el ID del técnico desde localStorage
      const idTecnico = parseInt(localStorage.getItem("id"), 10);

      //xconst idTecnico = localStorage.getItem("id");
      console.log(idTecnico);

      const response = await axios.post(
        "http://172.20.70.113:3000/api/aprobaciones/enviar-aprobacion",
        {
          idInforme,
          aprobadores: idsAprobadores,
          idTecnico,
        }
      );

      if (response.data.success) {
        toast.success("✅ Informe enviado para aprobación.");
        setAprobadoresDisponibles([]);
        setAprobadoresSeleccionados([]);
        setMostrarSelectorAprobadores(false); // Oculta el botón y selector

        // Esperar 1.5 segundos para mostrar el toast antes de redirigir
        setTimeout(() => {
          setMostrarModalPDF(false);

          setFormData({
            equipo: "",
            modelo: "",
            marca: "",
            agencia: "",
            ipEquipo: "",
            numSerie: "",
            direccionMAC: "",
            codigoBarras: "",
            discoDuro: "",
            espacioLibre: "",
            memoriaRAM: "",
            procesador: "",
            velocidad: "",
            sistemaOperativo: "",
            version_so: "",
            tecnico: "",
            usuario: "",
            email: "",
            cargo: "",
            empresa: "",
            departamento: "",
            comentario: "",
            requerimiento: "",
            firma: null,
          });

          setImagenesSeleccionadas([]);
          setFirmaBase64(null);

          navigate("/mis-informes");
        }, 1500); // 1.5 segundos de espera
      } else {
        toast.error("❌ Error al enviar para aprobación.");
      }
    } catch (error) {
      console.error("Error al enviar para aprobación:", error);

      if (error.response && error.response.status === 400) {
        const mensaje = error.response.data?.message || "Solicitud inválida.";
        toast.info(`❌ ${mensaje}`);
      } else {
        toast.error("❌ Ocurrió un error al enviar para aprobación.");
      }
    }
  };
  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <PaginaCompleta>
        <HomeButton />
        <FormularioContenedor onSubmit={handleGuardar} ref={formRef}>
          <TituloFormulario>
            Formulario de Informe Técnico Componentes
          </TituloFormulario>
          <SeccionFormulario>
            <FilaFormulario>
              <div>
                <label htmlFor="tecnico">Técnico Asignado</label>
                <Select
                  id="tecnico"
                  options={opcionesTecnicos}
                  onChange={(opcion) =>
                    setFormData((prev) => ({ ...prev, tecnico: opcion.label }))
                  }
                  value={opcionesTecnicos.find(
                    (opt) => opt.label === formData.tecnico
                  )}
                  placeholder="Selecciona un técnico"
                  styles={customSelectStyles(isDarkMode)}
                />
              </div>

              <div>
                <label htmlFor="requerimiento">Número de Requerimiento</label>
                <input
                  type="text"
                  id="requerimiento"
                  name="requerimiento"
                  value={formData.requerimiento}
                  onChange={handleChange}
                />
              </div>
            </FilaFormulario>
          </SeccionFormulario>
          <SeccionFormulario>
            <h3>Datos del Usuario</h3>
            <FilaFormulario>
              <div>
                <label htmlFor="usuario">Nombre del Usuario</label>
                <Select
                  id="usuario"
                  options={opcionesUsuarios}
                  onChange={handleUsuarioSeleccionado}
                  value={opcionesUsuarios.find(
                    (opt) => opt.label === formData.usuario
                  )}
                  placeholder="Selecciona un usuario"
                  styles={customSelectStyles(isDarkMode)}
                />
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="cargo">Cargo</label>
                <input
                  type="text"
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="empresa">Empresa</label>
                <input
                  type="text"
                  id="empresa"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleChange}
                />
              </div>
            </FilaFormulario>
          </SeccionFormulario>
          <SeccionFormulario>
            <h3>Datos del Componente</h3>

            <FilaFormulario>
              <div>
                <label htmlFor="tipoComponente">Tipo de Componente</label>
                <Select
                  id="tipoComponente"
                  options={opcionesTiposComponentes}
                  onChange={(opcion) => {
                    const tipoSeleccionado = opcion.label;
                    setFormData((prev) => ({
                      ...prev,
                      tipoComponente: tipoSeleccionado,
                    }));

                    const marcas = [
                      ...new Set(
                        datosComponentes
                          .filter(
                            (dc) => dc.tipo_componente === tipoSeleccionado
                          )
                          .map((dc) => dc.marca)
                      ),
                    ];
                    setMarcasFiltradas(marcas);
                    setModelosFiltrados([]); // Limpiar modelos al cambiar tipo
                  }}
                  value={opcionesTiposComponentes.find(
                    (opt) => opt.label === formData.tipoComponente
                  )}
                  placeholder="Selecciona un tipo de componente"
                  styles={customSelectStyles(isDarkMode)}
                />
              </div>
              <div>
                <label htmlFor="marca">Marca</label>
                {marcasFiltradas.length > 0 ? (
                  <Select
                    id="marca"
                    options={marcasFiltradas.map((m) => ({
                      label: m,
                      value: m,
                    }))}
                    onChange={(opcion) => {
                      setFormData((prev) => ({ ...prev, marca: opcion.label }));
                      const modelos = [
                        ...new Set(
                          datosComponentes
                            .filter(
                              (dc) =>
                                dc.tipo_componente ===
                                  formData.tipoComponente &&
                                dc.marca === opcion.label
                            )
                            .map((dc) => dc.modelo)
                        ),
                      ];
                      setModelosFiltrados(modelos);
                    }}
                    value={
                      formData.marca
                        ? { label: formData.marca, value: formData.marca }
                        : null
                    }
                    placeholder="Selecciona una marca"
                    styles={customSelectStyles(isDarkMode)}
                  />
                ) : (
                  <input
                    type="text"
                    name="marca"
                    value={formData.marca || ""}
                    onChange={handleChange}
                    placeholder="Ingresa la marca"
                  />
                )}
              </div>
              <div>
                <label htmlFor="modelo">Modelo</label>

                {modelosFiltrados.filter((m) => m && m.trim() !== "").length >
                0 ? (
                  <Select
                    id="modelo"
                    options={modelosFiltrados.map((m) => ({
                      label: m,
                      value: m,
                    }))}
                    onChange={(opcion) =>
                      setFormData((prev) => ({ ...prev, modelo: opcion.label }))
                    }
                    value={
                      formData.modelo
                        ? { label: formData.modelo, value: formData.modelo }
                        : null
                    }
                    placeholder="Selecciona un modelo"
                    styles={customSelectStyles(isDarkMode)}
                  />
                ) : (
                  <input
                    type="text"
                    name="modelo"
                    value={formData.modelo || ""}
                    onChange={handleChange}
                    placeholder="Ingresa el modelo"
                  />
                )}
              </div>
              <div>
                <label htmlFor="numSerie">Numero de Serie</label>
                <input
                  type="text"
                  name="numSerie"
                  value={formData.numSerie}
                  onChange={handleChange}
                  placeholder="Ingresa el número de serie"
                />
              </div>
            </FilaFormulario>
          </SeccionFormulario>
          <SeccionFormulario>
            <h3>Diagnóstico y Recomendaciones</h3>
            <EditorComentario
              value={formData.comentario}
              onChange={(html) =>
                setFormData((prev) => ({ ...prev, comentario: html }))
              }
            />
          </SeccionFormulario>
          <SeccionFormulario>
            <FilaFormulario>
              <div>
                <label
                  htmlFor="imagenUpload"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FaCamera size={20} />
                  Agregar Imágenes:
                </label>
                <input
                  type="file"
                  id="imagenUpload"
                  accept="image/*"
                  multiple
                  onChange={handleImagenesSeleccionadas}
                  style={{ marginTop: "0.5rem" }}
                />

                {imagenesSeleccionadas.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(190px, 1fr))",
                      gap: "12px",
                      marginTop: "1rem",
                    }}
                  >
                    {imagenesSeleccionadas.map((img, index) => (
                      <div
                        key={index}
                        style={{
                          position: "relative",
                          border: "1px solid #ccc",
                          borderRadius: "8px",
                          overflow: "hidden",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        }}
                      >
                        <img
                          src={img.url}
                          alt={`preview-${index}`}
                          style={{
                            width: "100%",
                            height: "100px",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => vistaPreviaImagen(img.url)}
                        />
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginTop: "8px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => moverImagenArriba(index)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moverImagenAbajo(index)}
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => vistaPreviaImagen(img.url)}
                          >
                            👁️
                          </button>
                          <BotonEliminar
                            type="button"
                            onClick={() => eliminarImagen(img.url)}
                            title="Eliminar imagen"
                            style={{
                              position: "absolute",
                              top: "5px",
                              right: "5px",
                              background: "#ff4d4f",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              width: "24px",
                              height: "24px",
                              cursor: "pointer",
                              fontWeight: "bold",
                            }}
                          >
                            ×
                          </BotonEliminar>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FilaFormulario>
          </SeccionFormulario>
          <SeccionFormulario>
            {/* Firma y acciones */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
              {firmaBase64 ? (
                <>
                  <p style={{ color: "green" }}>
                    ✅ El documento ya ha sido firmado.
                  </p>
                  <img
                    src={firmaBase64}
                    alt="Firma cargada"
                    style={{ maxHeight: "100px", marginBottom: "10px" }}
                  />
                  <br />
                  <button onClick={() => setFirmaBase64(null)}>
                    Cambiar firma
                  </button>
                </>
              ) : (
                <>
                  <label htmlFor="firmaUpload" style={{ marginRight: "10px" }}>
                    Firmar documento:
                  </label>
                  <input
                    type="file"
                    id="firmaUpload"
                    accept="image/*"
                    onChange={handleFirmaSeleccionada}
                  />
                </>
              )}
            </div>
          </SeccionFormulario>
          <BotonContainer>
            {hayDatosCargados() && (
              <button
                className="btn-gris"
                type="button"
                onClick={handleLimpiarFormulario}
              >
                <FaBroom style={{ marginRight: "8px" }} />
                LIMPIAR FORMULARIO
              </button>
            )}
            <button
              type="button"
              className="btn-azul"
              onClick={() => setOpenConfirmDialog(true)}
            >
              GENERAR INFORME TÉCNICO
            </button>

            {/*   <button type="button" className="firmar" onClick={handleFirmar}>Firmar</button> */}
          </BotonContainer>
          {/*                 <BotonEliminar type="button" onClick={handleEliminar}>×</BotonEliminar>
           */}{" "}
        </FormularioContenedor>

        {
          <Dialog
            open={openConfirmDialog}
            onClose={() => setOpenConfirmDialog(false)}
          >
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogContent>¿Deseas generar el informe técnico?</DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenConfirmDialog(false)}
                color="secondary"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setOpenConfirmDialog(false);
                  handleGenerarYMostrarInforme();
                }}
                color="primary"
                autoFocus
              >
                Sí, generar
              </Button>
            </DialogActions>
          </Dialog>
        }

        {/* DIALOGO APROBADORES */}
        <Dialog
          open={openModalAprobadores}
          onClose={() => setOpenModalAprobadores(false)}
        >
          <DialogTitle>Seleccionar Aprobadores</DialogTitle>
          <DialogContent>
            <p>Selecciona uno o más aprobadores para enviar el informe:</p>
            <Select
              isMulti
              options={aprobadoresDisponibles}
              value={aprobadoresSeleccionados}
              onChange={(seleccionados) =>
                setAprobadoresSeleccionados(seleccionados)
              }
              placeholder="Selecciona aprobadores"
              styles={customSelectStyles(isDarkMode)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setOpenModalAprobadores(false)}
              color="secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setOpenModalAprobadores(false);
                handleEnviarParaAprobacion();
              }}
              color="primary"
            >
              Enviar
            </Button>
          </DialogActions>
        </Dialog>
      </PaginaCompleta>

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
        theme="colored"
      />
      {mostrarModalPDF && (
        <ModalOverlay>
          <ModalContent>
            <div style={{ height: "500px" }}>
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={pdfURL}
                  plugins={[defaultLayoutPluginInstance]}
                />
              </Worker>
            </div>
            <BotonContainer>
              {/* <button className='btn-gris'
                                    onClick={handleDescargarPDFConSelector}>
                                    DESCARGAR PDF
                                </button>*/}

              <button
                className="btn-azul"
                onClick={() => {
                  setMostrarModalPDF(false);
                }}
              >
                {" "}
                MODIFICAR DATOS
              </button>

              <button
                type="button"
                className="btn-rojo"
                onClick={() => setOpenModalAprobadores(true)}
              >
                ENVIAR PARA APROBACIÓN
              </button>

              {mostrarSelectorAprobadores && (
                <div style={{ marginTop: "1rem" }}>
                  <label>Seleccionar Aprobadores:</label>
                  <Select
                    isMulti
                    options={aprobadoresDisponibles}
                    value={aprobadoresSeleccionados}
                    onChange={(seleccionados) =>
                      setAprobadoresSeleccionados(seleccionados)
                    }
                    placeholder="Selecciona uno o más aprobadores"
                    styles={customSelectStyles(isDarkMode)}
                  />
                  <button
                    className="btn-azul"
                    style={{ marginTop: "10px" }}
                    onClick={handleEnviarParaAprobacion}
                  >
                    Confirmar Envío
                  </button>
                </div>
              )}
            </BotonContainer>
          </ModalContent>
        </ModalOverlay>
      )}
    </ThemeProvider>
  );
};

export default FormularioComponentes;
