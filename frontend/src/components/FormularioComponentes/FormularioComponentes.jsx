import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import { usePrefersDarkMode } from '../../../src/hooks/usePrefersDarkMode';
import { lightTheme, darkTheme } from '../themes';

import { obtenerTecnicos, obtenerUsuarios, obtenerUsuarioPorNombre } from './FormularioComponentesServices';

import {
    PaginaCompleta,
    FormularioContenedor,
    TituloFormulario,
    SeccionFormulario,
    FilaFormulario,
    BotonContainer,
    BotonEliminar,
    AutocompleteContainer
} from './FormularioComponentesStyles'; // Asegúrate de que la ruta sea correcta
import HomeButton from '../HomeButton';
import { ThemeProvider } from 'styled-components';

const FormularioComponentes = () => {
    const isDarkMode = usePrefersDarkMode();

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
        const response = await fetch('http://172.20.70.113/api/componentes/tipos-componentes');
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
                        <div>
                            <textarea
                                id="comentario"
                                name="comentario"
                                value={formData.comentario}
                                onChange={handleChange}
                                rows="7"
                                required
                                style={{
                                    width: '98%',
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
