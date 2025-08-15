import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import { usePrefersDarkMode } from '../../../hooks/usePrefersDarkMode';
import { lightTheme, darkTheme } from '../../themes';
import { FaCamera, FaBroom } from 'react-icons/fa'; // Ícono de cámara y escoba
import { obtenerTecnicos, obtenerUsuarios, obtenerUsuarioPorNombre } from '../../services/FormularioComponentesServices';
import { toast, ToastContainer } from 'react-toastify';
import { generarPDFenMemoria } from '../../helpers/pdfUtils';
import {
    PaginaCompleta,
    FormularioContenedor,
    TituloFormulario,
    SeccionFormulario,
    FilaFormulario,
    BotonContainer,
    BotonEliminar,
    AutocompleteContainer
} from '../FormularioStyles'; // Asegúrate de que la ruta sea correcta
import HomeButton from '../../Home/HomeButton';
import { ThemeProvider } from 'styled-components';
import EditorComentario from '../../EditorComentario/EditorComentario';

const FormularioComponentes = () => {

    const isDarkMode = usePrefersDarkMode();
    const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([]);
    const [firmaBase64, setFirmaBase64] = useState(null);

    const [tecnicos, setTecnicos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const customSelectStyles = (isDarkMode) => ({
        control: (base) => ({
            ...base,
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
            borderColor: isDarkMode ? '#555' : '#ccc',
            color: isDarkMode ? '#f0f0f0' : '#333',
        }),

        input: (base) => ({
            ...base,
            color: isDarkMode ? '#f0f0f0' : '#333',
            width: '100px', // o el ancho que prefieras
            flex: 'none',   // evita que crezca automáticamente
        }),

        menu: (base) => ({
            ...base,
            backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
            color: isDarkMode ? '#f0f0f0' : '#333',
        }),
        singleValue: (base) => ({
            ...base,
            color: isDarkMode ? '#f0f0f0' : '#333',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
                ? isDarkMode ? '#333' : '#eee'
                : isDarkMode ? '#2a2a2a' : '#fff',
            color: isDarkMode ? '#f0f0f0' : '#333',
        }),
        placeholder: (base) => ({
            ...base,
            color: isDarkMode ? '#aaa' : '#666',
        }),
    });

    const [tiposComponentes, setTiposComponentes] = useState([]);
    const obtenerTiposComponentes = async () => {
        const response = await fetch('http://172.20.70.113:3000/api/componentes/tipos');
        const data = await response.json();
        return data;
    };

    useEffect(() => {
        const cargarTipos = async () => {
            try {
                const tipos = await obtenerTiposComponentes();
                setTiposComponentes(tipos);
            } catch (error) {
                console.error('Error al cargar tipos de componentes:', error);
            }
        };
        cargarTipos();
    }, []);

    const opcionesTiposComponentes = tiposComponentes.map(tc => ({
        label: tc.TIPO_COMPONENTE, // ajusta según el campo real
        value: tc.ID
    }));


    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const tecnicosData = await obtenerTecnicos();
                const usuariosData = await obtenerUsuarios();
                setTecnicos(tecnicosData);
                setUsuarios(usuariosData);
                console.log(tecnicosData);
            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        };

        cargarDatos();
    }, []);

    const opcionesTecnicos = tecnicos.map(t => ({
        label: t.NOM_TECNICO,
        value: t.id
    }));

    const opcionesUsuarios = usuarios.map(u => ({
        label: u.NOMBRE,
        value: u.id
    }));

    const [formData, setFormData] = useState({
        numRequerimiento: '',
        tecnico: '',
        usuario: '',
        email: '',
        cargo: '',
        empresa: '',
        departamento: '',
        codigoBarras: '',
        comentario: '',
        tipoComponente: '',
    });


    const formRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCodigoBarrasChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
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
        console.log('Datos guardados:', formData);
    };


    const handleUsuarioSeleccionado = async (opcion) => {
        try {
            const usuarioCompleto = await obtenerUsuarioPorNombre(opcion.label);
            setFormData(prev => ({
                ...prev,
                usuario: opcion.label,
                email: usuarioCompleto.MAIL || '',
                cargo: usuarioCompleto.CARGO || '',
                empresa: usuarioCompleto.EMPRESA || '',
                departamento: usuarioCompleto.DEPARTAMENTO || ''
            }));
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
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

    const eliminarImagen = (url) => {
        setImagenesSeleccionadas(prev => {
            const actualizadas = prev.filter(img => img.url !== url);
            URL.revokeObjectURL(url); // Limpieza de memoria
            return actualizadas;
        });
    };
    
    /* FIRMA */
    const handleFirmaSeleccionada = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result;
                setFirmaBase64(base64);
                setFormData(prev => ({ ...prev, firma: base64 }));

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
                        toast.success('✅ Se cargó la firma correctamente');
                    } else {
                        toast.error('❌ Error al regenerar el PDF con la firma.');
                    }
                } catch (error) {
                    console.error('Error al procesar la firma:', error);
                    toast.error('❌ Ocurrió un error al cargar la firma.');
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
    const convertirADataURL = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ url: reader.result });
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    const handleLimpiarFormulario = () => {
    };

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <PaginaCompleta>
                <HomeButton />
                <FormularioContenedor onSubmit={handleGuardar} ref={formRef}>
                    <TituloFormulario>Formulario de Informe Técnico Componentes</TituloFormulario>

                    <SeccionFormulario>
                        <FilaFormulario>
                            <div>
                                <label htmlFor="tecnico">Técnico Asignado</label>
                                <Select
                                    id="tecnico"
                                    options={opcionesTecnicos}
                                    onChange={(opcion) => setFormData(prev => ({ ...prev, tecnico: opcion.label }))}
                                    value={opcionesTecnicos.find(opt => opt.label === formData.tecnico)}
                                    placeholder="Selecciona un técnico"
                                    styles={customSelectStyles(isDarkMode)}

                                />
                            </div>

                            <div>
                                <label htmlFor="numRequerimiento">Número de Requerimiento</label>
                                <input
                                    type="text"
                                    id="numRequerimiento"
                                    name="numRequerimiento"
                                    value={formData.numRequerimiento}
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
                                    value={opcionesUsuarios.find(opt => opt.label === formData.usuario)}
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
                                    onChange={(opcion) =>
                                        setFormData(prev => ({ ...prev, tipoComponente: opcion.label }))
                                    }
                                    value={opcionesTiposComponentes.find(opt => opt.label === formData.tipoComponente)}
                                    placeholder="Selecciona un tipo de componente"
                                    styles={customSelectStyles(isDarkMode)}

                                />
                            </div>

                            <div>
                                <label htmlFor="marca">Marca</label>
                                <input
                                    type="text"
                                    name="marca"
                                    value={formData.marca}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="modelo">Modelo</label>
                                <input
                                    type="text"
                                    name="modelo"
                                    value={formData.modelo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="codigoBarras">Código de Barras</label>
                                <input
                                    type="text"
                                    name="codigoBarras"
                                    value={formData.codigoBarras}
                                    onChange={handleCodigoBarrasChange}
                                    autoComplete="off"
                                    maxLength={14}
                                />
                            </div>
                            <div>
                                <label htmlFor="numSerie">Numero de Serie</label>
                                <input
                                    type="text"
                                    name="numSerie"
                                    value={formData.numSerie}
                                    onChange={handleChange}
                                />
                            </div>

                        </FilaFormulario>


                    </SeccionFormulario>

                    <SeccionFormulario>
                        <h3>Diagnóstico y Recomendaciones</h3>
                        <EditorComentario
                            value={formData.comentario}
                            onChange={(html) => setFormData(prev => ({ ...prev, comentario: html }))}
                        />

                    </SeccionFormulario>
                    <SeccionFormulario>
                        <FilaFormulario>
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
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '12px', marginTop: '1rem' }}>
                                        {imagenesSeleccionadas.map((img, index) => (
                                            <div key={index} style={{ position: 'relative', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                                                <img
                                                    src={img.url}
                                                    alt={`preview-${index}`}
                                                    style={{ width: '100%', height: '100px', objectFit: 'cover', cursor: 'pointer' }}
                                                    onClick={() => vistaPreviaImagen(img.url)}
                                                />
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                                    <button type="button" onClick={() => moverImagenArriba(index)}>↑</button>
                                                    <button type="button" onClick={() => moverImagenAbajo(index)}>↓</button>
                                                    <button type="button" onClick={() => vistaPreviaImagen(img.url)}>👁️</button>
                                                    <BotonEliminar
                                                        type="button"
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
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        </FilaFormulario>
                    </SeccionFormulario>
                    <SeccionFormulario>
                        {/* Firma y acciones */}
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            {firmaBase64 ? (
                                <>
                                    <p style={{ color: 'green' }}>✅ El documento ya ha sido firmado.</p>
                                    <img
                                        src={firmaBase64}
                                        alt="Firma cargada"
                                        style={{ maxHeight: '100px', marginBottom: '10px' }}
                                    />
                                    <br />
                                    <button onClick={() => setFirmaBase64(null)}>Cambiar firma</button>
                                </>
                            ) : (
                                <>
                                    <label htmlFor="firmaUpload" style={{ marginRight: '10px' }}>
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
                            <button className='btn-gris' type="button" onClick={handleLimpiarFormulario}>
                                <FaBroom style={{ marginRight: '8px' }} />
                                LIMPIAR FORMULARIO
                            </button>
                        )}
                        <button type="submit" className="btn-verde">GENERAR INFORME TÉCNICO</button>

                        {/*   <button type="button" className="firmar" onClick={handleFirmar}>Firmar</button> */}
                    </BotonContainer>

                    {/*                 <BotonEliminar type="button" onClick={handleEliminar}>×</BotonEliminar>
 */}            </FormularioContenedor>
            </PaginaCompleta>
        </ThemeProvider>

    );
};

export default FormularioComponentes;
