import React, { useRef, useState, useEffect } from 'react';
import { useFormularioLogic } from './FormularioLogic';
import AutocompleteInput from './AutocompleteInput';
import { generarInformeTecnico } from './helpers/excelUtils';
import { exportarFormularioAPDF, generarPDFenMemoria } from './helpers/pdfUtils';
import axios from 'axios';
import { FaCamera } from 'react-icons/fa'; // Ícono de cámara
import { BotonEliminar } from './FormularioStyles'; // Ajusta la ruta si es necesario
import SignatureCanvas from 'react-signature-canvas';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPenNib } from 'react-icons/fa';
import { FaBroom } from 'react-icons/fa';
import { FiSave } from 'react-icons/fi'; // Ícono de guardar
import { enviarPDFPorCorreo, guardarPDFEnBD, verificarRequerimiento } from './services/pdfService';
import { useNavigate } from 'react-router-dom';
import {
  ContenedorFormularioVista,
  FormularioWrapper,
  BotonContainer,
  VistaPrevia,
  Sugerencias,
  AutocompleteContainer,
  FilaFormulario,
  ModalFirmaOverlay,
  ModalFirmaContenido,
  BotonGuardar,
  BotonFirmar
} from './FormularioStyles';
import TiptapEditor from './helpers/TiptapEditor';

const Formulario = () => {
  const {
    formData, setFormData,
    usuarios, tecnicos, equipos,
    showSuggestions, setShowSuggestions,
    usuarioRef, tecnicoRef, equipoRef,
  } = useFormularioLogic();

  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
  const [mostrarFirma, setMostrarFirma] = useState(false);
  const [mostrarModalFirma, setMostrarModalFirma] = useState(false);
  const [firmaBase64, setFirmaBase64] = useState(null);
  const firmaFileInputRef = useRef(null);
  const navigate = useNavigate();
  const firmaRef = useRef();
  /* 
    const handleFirmarInforme = () => {
      setMostrarFirma(true);
    }; */

  const confirmarFirma = () => {
    if (firmaRef.current.isEmpty()) {
      toast.warning('Por favor dibuja tu firma antes de confirmar.');
      return;
    }
    const firma = firmaRef.current.getCanvas().toDataURL('image/png');
    setFirmaBase64(firma); // Actualiza el estado con la nueva firma
    setMostrarFirma(false);
    // Llama directamente a la vista previa con la nueva firma
    handleVistaPreviaPDF(firma);
    toast.success('Firma confirmada correctamente.');
  };
  const formRef = useRef(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [datosEquipo, setDatosEquipo] = useState(null);

  useEffect(() => {
    if (firmaBase64) {
      handleVistaPreviaPDF();
    }
  }, [firmaBase64]);

  useEffect(() => {
    return () => {
      imagenesSeleccionadas.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, [imagenesSeleccionadas]);

  useEffect(() => {
    const manejarPegado = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          const url = URL.createObjectURL(file);
          setImagenesSeleccionadas((prev) => [...prev, { file, url }]);
        }
      }
    };

    window.addEventListener('paste', manejarPegado);
    return () => window.removeEventListener('paste', manejarPegado);
  }, []);


  /* const obtenerFirma = () => {
    const firmaBase64 = firmaRef.current.getTrimmedCanvas().toDataURL('image/png');
    // Aquí puedes agregar la firma al PDF
    console.log(firmaBase64);
    setMostrarFirma(false);
  }; */

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setShowSuggestions({ ...showSuggestions, [e.target.name]: true });
  };

  /*  const handleSelect = (field, value) => {
     setFormData({ ...formData, [field]: value });
     setShowSuggestions({ ...showSuggestions, [field]: false });
   }; */

  const handleSelect = async (field, value) => {
    const updatedFormData = { ...formData, [field]: value };

    if (field === 'usuario') {
      try {
        const res = await axios.get(`http://172.20.70.113:3000/api/equipo-por-usuario?nombre=${encodeURIComponent(value)}`);
        if (res.data.equipo) {
          updatedFormData.equipo = res.data.equipo;
        }
      } catch (error) {
        console.error('Error al obtener equipo del usuario:', error);
      }
    }

    setFormData(updatedFormData);
    setShowSuggestions({ ...showSuggestions, [field]: false });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultado = await generarInformeTecnico(formData);

    if (resultado.success) {
      toast.success('Informe generado correctamente');
    } else {
      toast.error('Hubo un error al generar el informe');
    }

  };

  const hayDatosCargados = () => {
    return (
      formData.requerimiento ||
      formData.usuario ||
      formData.tecnico ||
      formData.equipo ||
      formData.codigoBarras ||
      formData.comentario ||
      imagenesSeleccionadas.length > 0 ||
      firmaBase64
    );
  };


  const convertirADataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  /* VALIDAR CAMPOS */
  const validarCamposObligatorios = () => {
    const camposRequeridos = [
      'usuario',
      'tecnico',
      'equipo',
      'codigoBarras',
      'comentario'
    ];

    for (const campo of camposRequeridos) {
      if (!formData[campo] || formData[campo].trim() === '') {
        toast.warning(`El campo "${campo}" es obligatorio.`);
        return false;
      }
    }

    /*     if (!firmaBase64) {
          toast.warning('Debe confirmar la firma antes de generar la vista previa.');
          return false;
        } */

    return true;
  };


  const handleVistaPreviaPDF = async () => {
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
        const url = URL.createObjectURL(resultado.blob);
        setPdfUrl(url); // Mostrar vista previa
      } else {
        toast.error('Error al generar vista previa del PDF');
      }
    } catch (error) {
      console.error('Error al procesar imágenes para el PDF:', error);
      toast.error('Ocurrió un error al preparar las imágenes para el PDF.');
    }
  };

  const handleGuardarPDF = async () => {
    if (!validarCamposObligatorios()) return;
    const yaExiste = await verificarRequerimiento(formData.requerimiento);
    if (yaExiste) {
      const confirmar = window.confirm(
        'Ya existe un informe con este número de requerimiento. ¿Deseas actualizarlo?'
      );
      if (!confirmar) return;
    }

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
        const nombreArchivo = `INFORME_TECNICO_${formData.requerimiento}_${formData.usuario}.pdf`;

        // Datos adicionales a guardar
        const datosAdicionales = {
          nombreUsuario: formData.usuario,
          nombreTecnico: formData.tecnico,
          numeroRequerimiento: formData.requerimiento,
        };

        const response = await guardarPDFEnBD(resultado.blob, nombreArchivo, datosAdicionales);

        if (response.success) {
          toast.success(`PDF guardado correctamente con ID: ${response.id}`);
          navigate(`/historial-informes?resaltado=${response.id}`);
        } else {
          toast.error('Error al guardar el PDF en la base de datos.');
        }
      } else {
        toast.error('Error al generar el PDF.');
      }
    } catch (error) {
      console.error('Error al guardar PDF:', error);
      toast.error('Ocurrió un error al guardar el PDF.');
    }
  };


  const handleDescargarPDF = async () => {
    const resultado = await exportarFormularioAPDF(null, null, formData);
    if (!resultado.success) {
      toast.error('Error al descargar el PDF');
    }
  };

  const handleLimpiarFormulario = () => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esto borrará todos los campos del formulario, incluyendo imágenes y firma.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Limpiar campos del formulario
        setFormData({
          requerimiento: '',
          usuario: '',
          tecnico: '',
          equipo: '',
          codigoBarras: '',
          comentario: '',
        });

        // Limpiar sugerencias visibles
        setShowSuggestions({
          usuario: false,
          tecnico: false,
          equipo: false,
        });

        // Limpiar imágenes seleccionadas
        imagenesSeleccionadas.forEach(img => URL.revokeObjectURL(img.url));
        setImagenesSeleccionadas([]);

        // Limpiar firma
        setFirmaBase64(null);
        if (firmaRef.current) {
          firmaRef.current.clear();
        }

        // Limpiar vista previa del PDF
        setPdfUrl(null);

        // Cerrar modales si están abiertos
        setMostrarFirma(false);
        setMostrarModalFirma(false);

        // Reiniciar refs (opcional: enfocar el primero)
        if (usuarioRef.current) usuarioRef.current.value = '';
        if (tecnicoRef.current) tecnicoRef.current.value = '';
        if (equipoRef.current) equipoRef.current.value = '';

        /*     if (usuarioRef.current) usuarioRef.current.focus(); */

        toast.success('Formulario limpiado correctamente.');
      }
    });
  };


  const filtrarOpciones = (lista, valor) => {
    return lista.filter(opcion =>
      opcion.toLowerCase().includes(valor.toLowerCase())
    );
  };

  const handleExportPDF = async () => {
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

      const nombreArchivo = `INFORME_TECNICO_${formData.requerimiento}_${formData.usuario}.pdf`;
      const resultado = await exportarFormularioAPDF(null, nombreArchivo, formDataConImagenes);

      if (!resultado.success) {
        toast.error('Error al exportar a PDF');
      }
    } catch (error) {
      console.error('Error al preparar datos para exportar PDF:', error);
      toast.error('Ocurrió un error al preparar el PDF para descarga.');
    }
  };


  const handleVerGarantia = async () => {
    const nombreEquipo = formData.equipo?.trim();
    console.log(nombreEquipo);

    if (!nombreEquipo) {
      toast.info('Por favor ingresa el nombre del equipo.');
      return;
    }

    try {
      const response = await axios.get(`http://172.20.70.113:3000/api/equipos/detalleGarantia?nombre=${encodeURIComponent(nombreEquipo)}`);
      const { NUM_SERIE, FABRICANTE, MODELO } = response.data;

      if (!NUM_SERIE || !FABRICANTE) {

        toast.warning('No se encontró información de garantía para este equipo.');

        return;
      }

      setDatosEquipo({ NUM_SERIE, FABRICANTE, MODELO });

      let url = '';

      if (FABRICANTE.toLowerCase().includes('hp')) {
        try {
          await navigator.clipboard.writeText(NUM_SERIE);
          Swal.fire({
            icon: 'success',
            title: 'Número de serie copiado',
            html: `
            <p><strong>Fabricante:</strong> ${FABRICANTE}</p>
            <p><strong>Modelo:</strong> ${MODELO}</p>
            <p><strong>Número de Serie:</strong> ${NUM_SERIE}</p>
            <p>El número de serie ha sido copiado al portapapeles. Abre la página de HP y pégalo para consultar la garantía.</p>
          `,
          });
          window.open('https://support.hp.com/ec-es/check-warranty', '_blank');
        } catch (copyError) {
          Swal.fire({
            icon: 'error',
            title: 'Error al copiar',
            html: `
            <p><strong>Fabricante:</strong> ${FABRICANTE}</p>
            <p><strong>Modelo:</strong> ${MODELO}</p>
            <p><strong>Número de Serie:</strong> ${NUM_SERIE}</p>
            <p>No se pudo copiar automáticamente el número de serie. Por favor, cópialo manualmente.</p>
          `,
          });
          window.open('https://support.hp.com/ec-es/check-warranty', '_blank');
        }

      } else if (FABRICANTE.toLowerCase().includes('lenovo')) {
        url = `https://pcsupport.lenovo.com/ec/es/products/laptops-and-netbooks/lenovo-v-series-laptops/v14-g2-itl/82ka/82ka00c1lm/${NUM_SERIE}/warranty`;
        window.open(url, '_blank');
      } else if (FABRICANTE.toLowerCase().includes('dell')) {
        url = `https://www.dell.com/support/home/es-ec/product-support/servicetag/${NUM_SERIE}/overview`;
        window.open(url, '_blank');
      } else {
        toast.warning('No se encontró información de garantía para este equipo.');
      }

    } catch (error) {
      console.error('Error al obtener datos del equipo:', error);
      toast.error('Error al consultar los datos del equipo.');
    }
  };


  const handleImagenesSeleccionadas = (e) => {
    const archivos = Array.from(e.target.files);

    const previews = archivos.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImagenesSeleccionadas(prev => [...prev, ...previews]);
    /* setImagenesSeleccionadas(previews); */
  };

  const handleFirmaSeleccionada = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFirmaBase64(reader.result);
        toast.success('Firma cargada correctamente.');
        handleVistaPreviaPDF(); // Regenerar PDF con la firma
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCodigoBarrasChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Elimina todo lo que no sea número

    // Limita a 11 dígitos
    value = value.slice(0, 11);

    // Aplica el formato 000 000 00000
    if (value.length > 6) {
      value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)} ${value.slice(3)}`;
    }

    setFormData({ ...formData, codigoBarras: value });
  };


  const eliminarImagen = (url) => {
    setImagenesSeleccionadas(prev => {
      const actualizadas = prev.filter(img => img.url !== url);
      URL.revokeObjectURL(url); // Limpieza de memoria
      return actualizadas;
    });
  };

  /*   const enviarCorreo = () => {
      const destinatario = "bryan.aldas.tcs@bgr.com.ec";
      const asunto = encodeURIComponent("Asunto del correo");
      const cuerpo = encodeURIComponent("Hola,\n\nEste es el cuerpo del mensaje.\n\nSaludos.");
  
      window.location.href = `mailto:${destinatario}?subject=${asunto}&body=${cuerpo}`;
    };
  
   */

  /*  const handleEnviarPDFCorreo = async () => {
     try {
       const resultado = await generarPDFenMemoria(formData); // Ya lo tienes
       if (!resultado.success) {
         toast.error('Error al generar el PDF.');
         return;
       }
 
       const blob = resultado.blob;
       const nombreArchivo = `Informe_${formData.requerimiento}_${formData.usuario}.pdf`;
       const correoDestino = formData.usuario.MAIL; // Asegúrate de tenerlo
 
       const respuesta = await enviarPDFPorCorreo(blob, nombreArchivo, correoDestino);
 
       if (respuesta.success) {
         toast.success('Correo enviado correctamente.');
       } else {
         toast.error('Error al enviar el correo.');
       }
     } catch (error) {
       console.error('Error al enviar PDF por correo:', error);
       toast.error('Ocurrió un error al enviar el correo.');
     }
   }; */


  return (
    <ContenedorFormularioVista>
      <FormularioWrapper onSubmit={handleSubmit} ref={formRef}>
        <h2>Formulario de Informe Técnico</h2>

        <FilaFormulario>
          <div>
            <label>Número de Requerimiento:</label>
            <input
              type="text"
              name="requerimiento"
              value={formData.requerimiento}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Técnico Asignado:</label>
            <AutocompleteContainer>
              <input
                type="text"
                name="tecnico"
                value={formData.tecnico}
                onChange={handleChange}
                onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, tecnico: false })), 100)}
                onFocus={() => setShowSuggestions(prev => ({ ...prev, tecnico: true }))}
                ref={tecnicoRef}
                autoComplete="off"
              />
              {showSuggestions.tecnico && (
                <Sugerencias>
                  {filtrarOpciones(tecnicos, formData.tecnico).map((tecnico, index) => (
                    <li key={index} onClick={() => handleSelect('tecnico', tecnico)}>
                      {tecnico}
                    </li>
                  ))}
                </Sugerencias>
              )}
            </AutocompleteContainer>
          </div>
        </FilaFormulario>

        <FilaFormulario>
          <div>
            <label>Nombre de Usuario:</label>
            <AutocompleteContainer>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, usuario: false })), 100)}
                onFocus={() => setShowSuggestions(prev => ({ ...prev, usuario: true }))}
                ref={usuarioRef}
                autoComplete="off"
              />
              {showSuggestions.usuario && (
                <Sugerencias>
                  {filtrarOpciones(usuarios, formData.usuario).map((usuario, index) => (
                    <li key={index} onClick={() => handleSelect('usuario', usuario)}>
                      {usuario}
                    </li>
                  ))}
                </Sugerencias>
              )}
            </AutocompleteContainer>
          </div>

          <div>
            <label>Nombre de Equipo:</label>
            <AutocompleteContainer>
              <input
                type="text"
                name="equipo"
                value={formData.equipo}
                onChange={handleChange}
                onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, equipo: false })), 100)}
                onFocus={() => setShowSuggestions(prev => ({ ...prev, equipo: true }))}
                ref={equipoRef}
                autoComplete="off"
              />
              {showSuggestions.equipo && (
                <Sugerencias>
                  {filtrarOpciones(equipos, formData.equipo).map((equipo, index) => (
                    <li key={index} onClick={() => handleSelect('equipo', equipo)}>
                      {equipo}
                    </li>
                  ))}
                </Sugerencias>
              )}
            </AutocompleteContainer>
          </div>
        </FilaFormulario>

        <FilaFormulario>
          <div>
            <label>Código de Barras:</label>
            <input
              type="text"
              name="codigoBarras"
              value={formData.codigoBarras}
              onChange={handleCodigoBarrasChange}
              autoComplete="off"
              maxLength={14}
            />
          </div>
          <div></div>

        </FilaFormulario>
        <div>
          <label htmlFor="imagenUpload" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FaCamera size={20} />
            Agregar Imágenes:
          </label>
          <input
            type="file"
            id="imagenUpload"
            accept="image/*"
            multiple
            onChange={handleImagenesSeleccionadas}
            style={{ marginTop: '0.5rem' }}
          />

          {imagenesSeleccionadas.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '12px',
                marginTop: '1rem',
              }}
            >
              {imagenesSeleccionadas.map((img, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                >
                  <img
                    src={img.url}
                    alt={`preview-${index}`}
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                    }}
                  />
                  <BotonEliminar
                    onClick={() => eliminarImagen(img.url)}
                    title="Eliminar imagen"
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: '#ff4d4f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    ×
                  </BotonEliminar>
                </div>
              ))}
            </div>
          )}
        </div>
        <FilaFormulario></FilaFormulario>

        <label htmlFor="comentario" style={{ fontWeight: 'bold', marginBottom: '5px', display: 'block' }}>
          Diagnóstico y Recomendaciones:
        </label>
        <textarea
          id="comentario"
          name="comentario"
          value={formData.comentario}
          onChange={handleChange}
          rows="7"
          required
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            resize: 'vertical',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
            transition: 'border-color 0.3s ease'
          }}
          placeholder="Escribe aquí el diagnóstico técnico y las recomendaciones..."
        />


        {mostrarFirma && (
          <div style={{ marginTop: '1rem' }}>
            <p>Dibuja tu firma:</p>
            <SignatureCanvas
              penColor="black"
              canvasProps={{ width: 400, height: 150, className: 'sigCanvas' }}
              ref={firmaRef}
            />
            <div style={{ marginTop: '1rem' }}>
              <button onClick={confirmarFirma}>Confirmar Firma</button>
              <button onClick={() => setMostrarFirma(false)}>Cancelar</button>
            </div>
          </div>
        )}

        <BotonContainer>
          {/*  <button type="submit">GENERAR INFORME TÉCNICO (Excel)</button> */}
          <button className='btn-verde' type="button" onClick={handleVerGarantia}>VERIFICAR GARANTÍA</button>
          {/* <button type="button" onClick={handleExportPDF}>EXPORTAR A PDF</button> */}
          <button className='btn-azul' type="button" onClick={handleVistaPreviaPDF}>GENERAR INFORME TÉCNICO</button>

          {hayDatosCargados() && (
            <button className='btn-gris' type="button" onClick={handleLimpiarFormulario}>
              <FaBroom style={{ marginRight: '8px' }} />
              LIMPIAR FORMULARIO
            </button>
          )}

          {/* ****************FIRMAR DOCUMENTO**************** */}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={firmaFileInputRef}
            onChange={handleFirmaSeleccionada}
          />

          {mostrarModalFirma && (
            <ModalFirmaOverlay>
              <ModalFirmaContenido>
                <h3>Selecciona una opción para firmar</h3>
                <button onClick={() => {
                  setMostrarModalFirma(false);
                  setMostrarFirma(true);
                }}>
                  Dibujar Firma
                </button>
                <button onClick={() => {
                  setMostrarModalFirma(false);
                  firmaFileInputRef.current.click();
                }}>
                  Cargar Firma
                </button>
                <button onClick={() => setMostrarModalFirma(false)}>
                  Cancelar
                </button>
              </ModalFirmaContenido>
            </ModalFirmaOverlay>
          )}
        </BotonContainer>

      </FormularioWrapper>
      {pdfUrl && (
        <VistaPrevia>
          <h3>Vista Previa del Informe Técnico</h3>
          <iframe src={pdfUrl} title="Vista Previa PDF" />

          <BotonContainer>
            <button className='btn-gris' type="button" onClick={() => setMostrarModalFirma(true)}>
              <FaPenNib style={{ marginRight: '8px' }} />
              FIRMAR DOCUMENTO
            </button>

            <button className="btn-verde" onClick={handleGuardarPDF}>
              <FiSave style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              GUARDAR INFORME TÉCNICO
            </button>
          </BotonContainer>

          {/*   <button onClick={enviarCorreo}>ENVIAR CORREO</button> */}
          {/*  <button onClick={handleExportPDF}>Descargar PDF</button> */}
          {/*  <button onClick={handleDescargarWord}>Descargar WORD</button> */}

        </VistaPrevia>
      )}

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

    </ContenedorFormularioVista>
  );
};
export default Formulario;
