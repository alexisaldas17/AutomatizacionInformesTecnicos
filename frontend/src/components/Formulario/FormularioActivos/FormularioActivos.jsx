import React, { useState, useRef, useEffect } from "react";
import { generarPDFenMemoria } from "../../helpers/pdfUtilsActivos";
import EditorComentario from "../../EditorComentario/EditorComentario";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../../themes";
import { usePrefersDarkMode } from "../../../hooks/usePrefersDarkMode";
import CreatableSelect from "react-select/creatable";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { ArrowUp, ArrowDown, Eye } from "lucide-react";

import {
  obtenerTecnicos,
  obtenerUsuarios,
  obtenerUsuarioPorNombre,
  obtenerEquipoPorNombre,
  obtenerEquipos,
} from "../../services/FormularioComponentesServices";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import Swal from "sweetalert2";
import {
  PaginaCompleta,
  FormularioContenedor,
  TituloFormulario,
  SeccionFormulario,
  FilaFormulario,
  BotonContainer,
  ModalOverlay,
  ModalContent,
} from "../FormularioStyles";
import Select from "react-select";
import { FaCamera } from "react-icons/fa"; // Ícono de cámara
import { BotonEliminar } from "../../FormularioStyles"; // Ajusta la ruta si es necesario
import HomeButton from "../../Home/HomeButton";

const FormularioActivos = () => {
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
  const [idInforme, setIdInforme] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openModalAprobadores, setOpenModalAprobadores] = useState(false);
  const [modoManualEquipo, setModoManualEquipo] = useState(false);
  const [modoManualUsuario, setModoManualUsuario] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    console.log("Elemento eliminado");
    setDialogOpen(false);
  };

  const [aprobadoresDisponibles, setAprobadoresDisponibles] = useState([]);
  const [aprobadoresSeleccionados, setAprobadoresSeleccionados] = useState([]);

  const formRef = useRef(null);
  const [mostrarModalPDF, setMostrarModalPDF] = useState(false);
  const [pdfURL, setPdfURL] = useState(null);
  const [nombreArchivoGenerado, setNombreArchivoGenerado] = useState("");
  const [datosEquipo, setDatosEquipo] = useState(null);

  const [tecnicos, setTecnicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
  const [firmaBase64, setFirmaBase64] = useState(null);
  const [mostrarSelectorAprobadores, setMostrarSelectorAprobadores] =
    useState(false);
  const isDarkMode = usePrefersDarkMode();

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
    const listener = (event) => {
      if (event.data === "enviarAprobacion") {
        handleEnviarParaAprobacion();
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const tecnicosData = await obtenerTecnicos();
        const usuariosData = await obtenerUsuarios();
        const equiposData = await obtenerEquipos();
        setTecnicos(tecnicosData);
        setUsuarios(usuariosData);
        setEquipos(equiposData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const [formData, setFormData] = useState({
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
    firma: firmaBase64,
  });

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

  const handleVerGarantia = async () => {
    const nombreEquipo = formData.equipo?.trim();

    if (!nombreEquipo) {
      toast.info("Por favor ingresa el nombre del equipo.");
      return;
    }

    try {
      const response = await axios.get(
        `http://172.20.70.113:3000/api/equipos/detalleGarantia?nombre=${encodeURIComponent(
          nombreEquipo
        )}`
      );
      const { NUM_SERIE, FABRICANTE, MODELO } = response.data;

      if (!NUM_SERIE || !FABRICANTE) {
        toast.warning(
          "No se encontró información de garantía para este equipo."
        );

        return;
      }

      setDatosEquipo({ NUM_SERIE, FABRICANTE, MODELO });

      let url = "";

      if (FABRICANTE.toLowerCase().includes("hp")) {
        try {
          await navigator.clipboard.writeText(NUM_SERIE);
          Swal.fire({
            icon: "success",
            title: "Número de serie copiado",
            html: `
            <p><strong>Fabricante:</strong> ${FABRICANTE}</p>
            <p><strong>Modelo:</strong> ${MODELO}</p>
            <p><strong>Número de Serie:</strong> ${NUM_SERIE}</p>
            <p>El número de serie ha sido copiado al portapapeles. Abre la página de HP y pégalo para consultar la garantía.</p>
          `,
          });
          window.open("https://support.hp.com/ec-es/check-warranty", "_blank");
        } catch (copyError) {
          Swal.fire({
            icon: "error",
            title: "Error al copiar",
            html: `
            <p><strong>Fabricante:</strong> ${FABRICANTE}</p>
            <p><strong>Modelo:</strong> ${MODELO}</p>
            <p><strong>Número de Serie:</strong> ${NUM_SERIE}</p>
            <p>No se pudo copiar automáticamente el número de serie. Por favor, cópialo manualmente.</p>
          `,
          });
          window.open("https://support.hp.com/ec-es/check-warranty", "_blank");
        }
      } else if (FABRICANTE.toLowerCase().includes("lenovo")) {
        url = `https://pcsupport.lenovo.com/ec/es/products/laptops-and-netbooks/lenovo-v-series-laptops/v14-g2-itl/82ka/82ka00c1lm/${NUM_SERIE}/warranty`;
        window.open(url, "_blank");
      } else if (FABRICANTE.toLowerCase().includes("dell")) {
        url = `https://www.dell.com/support/home/es-ec/product-support/servicetag/${NUM_SERIE}/overview`;
        window.open(url, "_blank");
      } else {
        toast.warning(
          "No se encontró información de garantía para este equipo."
        );
      }
    } catch (error) {
      console.error("Error al obtener datos del equipo:", error);
      toast.error("Error al consultar los datos del equipo.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const eliminarImagen = (url) => {
    setImagenesSeleccionadas((prev) => {
      const actualizadas = prev.filter((img) => img.url !== url);
      URL.revokeObjectURL(url); // Limpieza de memoria
      return actualizadas;
    });
  };

  const opcionesTecnicos = tecnicos.map((t) => ({
    label: t.NOM_TECNICO,
    value: t.id,
  }));

  const opcionesUsuarios = usuarios.map((u) => ({
    label: u.NOMBRE,
    value: u.id,
  }));

  const handleDescargarPDFConSelector = async () => {
    if (!pdfURL || !window.showSaveFilePicker) {
      toast.warning(
        "Tu navegador no permite seleccionar ubicación de guardado."
      );
      return;
    }

    try {
      const response = await fetch(pdfURL);
      const blob = await response.blob();

      const nombreArchivo = `${nombreArchivoGenerado || "Informe_Tecnico"}.pdf`;

      const fileHandle = await window.showSaveFilePicker({
        suggestedName: nombreArchivo,
        types: [
          {
            description: "Archivo PDF",
            accept: { "application/pdf": [".pdf"] },
          },
        ],
      });

      const writableStream = await fileHandle.createWritable();
      await writableStream.write(blob);
      await writableStream.close();

      toast.success("✅ PDF guardado correctamente.");
    } catch (error) {
      console.error("Error al guardar el archivo:", error);
      toast.error("❌ No se pudo guardar el archivo.");
    }
  };

  const opcionesEquipos = equipos.map((u) => ({
    label: u.NOM_EQUIPO,
    value: u.id,
  }));

  /*  const handleVistaPreviaPDF = async () => {
         if (!validarCamposObligatorios()) return;
 
         try {
             const imagenesBase64 = await Promise.all(
                 imagenesSeleccionadas.map((img) => convertirADataURL(img.file))
             );
 
             const formDataConImagenes = {
                 ...formData,
                 imagenes: imagenesBase64,
                 firma: firmaBase64,
             };
 
             const resultado = await generarPDFenMemoria(formDataConImagenes);
 
             if (resultado.success) {
                 const blob = resultado.blob;
                 const url = URL.createObjectURL(blob);
                 setPdfURL(url);
                 setMostrarModalPDF(true);
             } else {
                 toast.error('Error al generar vista previa del PDF');
             }
         } catch (error) {
             console.error('Error al procesar imágenes para el PDF:', error);
             toast.error('Ocurrió un error al preparar las imágenes para el PDF.');
         }
     };
  */
  const convertirADataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

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

  const vistaPreviaImagen = (url) => {
    window.open(url, "_blank");
  };

  /* VALIDAR CAMPOS */
  const validarCamposObligatorios = () => {
    const camposRequeridos = [
      "requerimiento",
      "usuario",
      "tecnico",
      "equipo",
      "codigoBarras",
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

  const handleUsuarioSeleccionado = async (opcion) => {
    try {
      console.log("Opción seleccionada:", opcion);
      const usuarioCompleto = await obtenerUsuarioPorNombre(opcion.label);
      console.log("usuarioCompleto", usuarioCompleto);
      if (!usuarioCompleto || !usuarioCompleto.MAIL) {
        toast.info(
          "Usuario no encontrado. Puedes ingresar los datos manualmente."
        );
        setModoManualUsuario(true);
        setFormData((prev) => ({ ...prev, usuario: opcion.label }));
        return;
      }

      setModoManualUsuario(false);
      setFormData((prev) => ({
        ...prev,
        usuario: opcion.label,
        email: usuarioCompleto.MAIL ?? "",
        cargo: usuarioCompleto.CARGO ?? "",
        empresa: usuarioCompleto.EMPRESA ?? "",
        departamento: usuarioCompleto.DEPARTAMENTO ?? "",
      }));
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      toast.info(
        "Usuario no encontrado. Puedes ingresar los datos manualmente."
      );
      setModoManualUsuario(true);
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

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleEnviarParaAprobacion = async () => {
    if (!aprobadoresSeleccionados || aprobadoresSeleccionados.length === 0) {
      toast.warning("Debe seleccionar al menos un aprobador.");
      return;
    }

    try {
      const obtenerID = await axios.get(
        `http://172.20.70.113:3000/api/pdf/verificar-requerimiento`,
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

  const handleEquipoSeleccionado = async (opcion) => {
    try {
      const equipoCompleto = await obtenerEquipoPorNombre(opcion.label);

      if (!equipoCompleto || !equipoCompleto.MODELO) {
        toast.info(
          "Equipo no encontrado. Puedes ingresar los datos manualmente."
        );
        setModoManualEquipo(true);
        setFormData((prev) => ({
          ...prev,
          equipo: opcion.label,
        }));
        return;
      }

      setModoManualEquipo(false); // Desactiva modo manual si se encuentra el equipo
      setFormData((prev) => ({
        ...prev,
        equipo: opcion.label,
        modelo: equipoCompleto.MODELO ?? "",
        marca: equipoCompleto.FABRICANTE ?? "",
        agencia: equipoCompleto.AGENCIA ?? "",
        ipEquipo: equipoCompleto.DIRECCION_IP ?? "",
        numSerie: equipoCompleto.NUM_SERIE ?? "",
        direccionMAC: equipoCompleto.DIRECCION_MAC ?? "",
        codigoBarras: equipoCompleto.CODIGO ?? "",
        discoDuro: equipoCompleto.CAPACIDAD_DISCO ?? "",
        espacioLibre: equipoCompleto.ESPACIO_LIBRE_DISCO ?? "",
        memoriaRAM: equipoCompleto.MEMORIA_FISICA ?? "",
        procesador: equipoCompleto.PROCESADOR ?? "",
        velocidad: equipoCompleto.VELOCIDAD_PROCESADOR ?? "",
        sistemaOperativo: equipoCompleto.SO ?? "",
        version_so: equipoCompleto.VERSION_SO ?? "",
      }));
    } catch (error) {
      console.info("Equipo no encontrado:", error);
      toast.info(
        "Equipo no encontrado. Puedes ingresar los datos manualmente."
      );
      setModoManualEquipo(true);
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

  const handleGenerarYMostrarInforme = async () => {
    console.log("Data del fomrulario:", formData);
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
      console.log(datosParaGuardar);
      const resultado = await generarPDFenMemoria(datosParaGuardar);
      if (!resultado.success) {
        toast.error("❌ Error al generar el PDF.");
        return;
      }

      const pdfBlob = resultado.blob;
      const pdfBase64 = await blobToBase64(pdfBlob);

      // Verificar si ya existe un informe
      const verificar = await axios.get(
        `http://172.20.70.113:3000/api/pdf/verificar-requerimiento`,
        {
          params: { requerimiento: formData.requerimiento },
        }
      );

      let idInforme = null;
      console.log("valor d everificar.data.existe", verificar.data.existe);
      if (verificar.data.existe) {
        idInforme = verificar.data.id;

        await axios.put(
          `http://172.20.70.113:3000/api/pdf/actualizar/${idInforme}`,
          {
            ...datosParaGuardar,
            pdf: pdfBase64,
          }
        );
      } else {
        const guardarResponse = await axios.post(
          `http://172.20.70.113:3000/api/pdf/guardar`,
          {
            ...datosParaGuardar,
            pdf: pdfBase64,
          }
        );

        idInforme = guardarResponse.data?.id;
        console.log(idInforme);
      }

      if (idInforme) {
        setIdInforme(idInforme);
        setMostrarModalPDF(true);
        const url = URL.createObjectURL(resultado.blob);
        setPdfURL(url);
        console.log("se actualizó la vista con ID de informes", idInforme);
      } else {
        toast.error("❌ No se pudo obtener el ID del informe.");
      }
    } catch (error) {
      toast.error("❌ Ocurrió un error al generar el informe.");
    }
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <PaginaCompleta>
        {!mostrarModalPDF && <HomeButton />}
        <FormularioContenedor ref={formRef}>
          <TituloFormulario>
            Formulario Informe Técnico Activos
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
                <CreatableSelect
                  id="usuario"
                  options={opcionesUsuarios}
                  onChange={(opcion, { action }) => {
                    if (action === "create-option") {
                      // Activar modo manual y establecer el nombre ingresado
                      setModoManualUsuario(true);
                      setFormData((prev) => ({
                        ...prev,
                        usuario: opcion.label,
                        email: "",
                        cargo: "",
                        empresa: "",
                        departamento: "",
                      }));
                    } else if (action === "clear") {
                      // Si se borra el campo
                      setModoManualUsuario(true);
                      setFormData((prev) => ({
                        ...prev,
                        usuario: "",
                        email: "",
                        cargo: "",
                        empresa: "",
                        departamento: "",
                      }));
                    } else {
                      // Si se selecciona una opción existente
                      handleUsuarioSeleccionado(opcion);
                    }
                  }}
                  value={
                    opcionesUsuarios.find(
                      (opt) => opt.label === formData.usuario
                    ) || {
                      label: formData.usuario,
                      value: null,
                    }
                  }
                  placeholder="Selecciona o escribe el nombre del usuario"
                  styles={customSelectStyles(isDarkMode)}
                  isClearable
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
            </FilaFormulario>
            <FilaFormulario>
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
              <div>
                <label htmlFor="departamento">Departamento</label>
                <input
                  type="text"
                  id="departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                />
              </div>
            </FilaFormulario>
          </SeccionFormulario>
          {/* Sección: Identificación del Equipo */}
          <SeccionFormulario>
            <h3>Identificación del Equipo</h3>
            <FilaFormulario>
              <div>
                <label htmlFor="equipo">EQUIPO</label>
                <CreatableSelect
                  id="equipo"
                  options={opcionesEquipos}
                  onChange={(opcion) => {
                    if (!opcion) {
                      // Si se borra el campo, limpiar el estado y activar modo manual
                      setFormData((prev) => ({
                        ...prev,
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
                      }));
                      setModoManualEquipo(true);
                      return;
                    }

                    setFormData((prev) => ({
                      ...prev,
                      equipo: opcion.label,
                    }));
                    handleEquipoSeleccionado(opcion);
                  }}
                  value={
                    opcionesEquipos.find(
                      (opt) => opt.label === formData.equipo
                    ) || { label: formData.equipo, value: null }
                  }
                  placeholder="Selecciona o escribe el nombre del equipo"
                  styles={customSelectStyles(isDarkMode)}
                  isClearable
                />
              </div>

              {/*  <div>
                            <label htmlFor="nombreEquipo">Nombre del Equipo</label>
                            <input type="text" name="nombreEquipo" value={formData.nombreEquipo} onChange={handleChange} />
                        </div> */}

              <div>
                <label htmlFor="modelo">Modelo</label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  readOnly={!modoManualEquipo}
                />
              </div>
              <div>
                <label htmlFor="marca">Marca</label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  readOnly={!modoManualEquipo}
                />
              </div>

              <div>
                <label htmlFor="agencia">Agencia</label>
                <input
                  type="text"
                  name="agencia"
                  value={formData.agencia}
                  onChange={handleChange}
                />
              </div>
            </FilaFormulario>
            <FilaFormulario>
              <div>
                <label htmlFor="ipEquipo">IP Equipo</label>
                <input
                  type="text"
                  name="ipEquipo"
                  value={formData.ipEquipo}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="numSerie">Número de Serie</label>
                <input
                  type="text"
                  name="numSerie"
                  value={formData.numSerie}
                  onChange={handleChange}
                  readOnly={!modoManualEquipo}
                />
              </div>
              <div>
                <label htmlFor="direccionMAC">Dirección MAC</label>
                <input
                  type="text"
                  name="direccionMAC"
                  value={formData.direccionMAC}
                  onChange={handleChange}
                  readOnly={!modoManualEquipo}
                />
              </div>
              <div>
                <label htmlFor="codigoBarras">Código de Barras</label>
                <input
                  type="text"
                  name="codigoBarras"
                  value={formData.codigoBarras}
                  onChange={handleChange}
                />
              </div>
            </FilaFormulario>
            <FilaFormulario>
              <button
                className="btn-verde"
                type="button"
                onClick={handleVerGarantia}
              >
                VERIFICAR GARANTÍA
              </button>
            </FilaFormulario>
          </SeccionFormulario>

          {/* Sección: Especificaciones Técnicas */}
          <SeccionFormulario>
            <h3>Especificaciones Técnicas</h3>
            <FilaFormulario>
              <div>
                <label htmlFor="discoDuro">Disco Duro</label>
                <input
                  type="text"
                  name="discoDuro"
                  value={formData.discoDuro}
                  onChange={handleChange}
                  readOnly={!modoManualEquipo}
                />
              </div>
              <div>
                <label htmlFor="espacioLibre">Espacio Libre</label>
                <input
                  type="text"
                  name="espacioLibre"
                  value={formData.espacioLibre}
                  onChange={handleChange}
                  readOnly={!modoManualEquipo}
                />
              </div>
              <div>
                <label htmlFor="memoriaRAM">Memoria RAM</label>
                <input
                  type="text"
                  name="memoriaRAM"
                  value={formData.memoriaRAM}
                  onChange={handleChange}
                  readOnly={!modoManualEquipo}
                />
              </div>
              <div>
                <label htmlFor="procesador">Procesador</label>
                <input
                  type="text"
                  name="procesador"
                  value={formData.procesador}
                  onChange={handleChange}
                  readOnly={!modoManualEquipo}
                />
              </div>
            </FilaFormulario>
            <FilaFormulario>
              <div>
                <label htmlFor="velocidad">Velocidad</label>
                <input
                  type="text"
                  name="velocidad"
                  value={formData.velocidad}
                  onChange={handleChange}
                  readOnly={!modoManualEquipo}
                />
              </div>
              <div>
                <label htmlFor="sistemaOperativo">Sistema Operativo</label>
                <input
                  type="text"
                  name="sistemaOperativo"
                  value={formData.sistemaOperativo}
                  onChange={handleChange}
                  readOnly={!modoManualEquipo}
                />
              </div>
              <div>
                <label htmlFor="version_so">Versión SO</label>
                <input
                  type="text"
                  name="version_so"
                  value={formData.version_so}
                  onChange={handleChange}
                  readOnly={!modoManualEquipo}
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
                            title="Mover arriba"
                            /* style={estiloBotonAccion("#3b82f6")} */
                          >
                            <ArrowUp size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => moverImagenAbajo(index)}
                            title="Mover abajo"
                            /* style={estiloBotonAccion("#10b981")} */
                          >
                            <ArrowDown size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => vistaPreviaImagen(img.url)}
                            title="Vista previa"
                            /* style={estiloBotonAccion("#f59e0b")} */
                          >
                            <Eye size={18} />
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
            <button
              type="button"
              className="btn-azul"
              onClick={() => setOpenConfirmDialog(true)}
            >
              GENERAR INFORME TÉCNICO
            </button>
          </BotonContainer>
        </FormularioContenedor>

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
    </ThemeProvider>
  );
};

export default FormularioActivos;
