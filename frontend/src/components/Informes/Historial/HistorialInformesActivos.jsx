import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import { verPDF } from '../../services/pdfService';
import { FiSearch } from 'react-icons/fi';
import { AiOutlineFileText } from 'react-icons/ai'
import { useLocation } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import { AiOutlineEye } from 'react-icons/ai';
import { AiOutlineDownload } from 'react-icons/ai';
import { FiXCircle } from 'react-icons/fi';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../../themes';
import { usePrefersDarkMode } from '../../../hooks/usePrefersDarkMode';

import {
  Container,
  Title,
  Filters,
  Input,
  Button,
  Table,
  Th,
  Td,
  PageSizeSelector,
  PageInfo,
  PaginationButton,
  PaginationContainer,
  IconButton,
  ContentWrapper,
  TableRow
} from './HistorialInformeStyles';
import HomeButton from '../../Home/HomeButton';

const HistorialInformes = () => {
  const [filtros, setFiltros] = useState({
    usuario: '',
    fecha: '',
    tecnico: '',
    numeroRequerimiento: ''
  });
  const isDarkMode = usePrefersDarkMode();

  const [resultados, setResultados] = useState([]);
  const [resultadosPorPagina, setResultadosPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);
  const indiceUltimo = paginaActual * resultadosPorPagina;
  const indicePrimero = indiceUltimo - resultadosPorPagina;
  const resultadosPaginados = resultados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(resultados.length / resultadosPorPagina);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const idResaltado = queryParams.get('resaltado');
  const [orden, setOrden] = useState({ columna: '', ascendente: true });

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };
 const buscarInformes = useCallback(async () => {
    try {
      const response = await axios.get('http://172.20.70.113:3000/api/historial', {
        params: filtros
      });
      setResultados(response.data);
      setBusquedaRealizada(true);
    } catch (error) {
      console.error('Error al buscar informes:', error);
    }
  }, [filtros]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      buscarInformes();
    }, 400); // Espera 400ms después del último cambio

    return () => clearTimeout(delayDebounce);
  }, [filtros, buscarInformes]);

  const handleChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

 

  const limpiarFiltros = () => {
    setFiltros({
      usuario: '',
      fecha: '',
      tecnico: '',
      numeroRequerimiento: ''
    });
    setBusquedaRealizada(false);
    setResultados([]); // Opcional: limpia los resultados si quieres
  };


  const ordenarResultados = (columna) => {
    const esAscendente = orden.columna === columna ? !orden.ascendente : true;

    const resultadosOrdenados = [...resultados].sort((a, b) => {
      const valorA = a[columna];
      const valorB = b[columna];

      if (typeof valorA === 'string') {
        return esAscendente
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      return esAscendente ? valorA - valorB : valorB - valorA;
    });

    setResultados(resultadosOrdenados);
    setOrden({ columna, ascendente: esAscendente });
  };


  return (

    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <>
        <HomeButton />

        <Container>
          <ContentWrapper>
            <Title>
              {/*   <AiOutlineFileText style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> */}
              HISTORIAL DE INFORMES TÉCNICOS
            </Title>
            <Filters>


              <Input
                name="usuario"
                placeholder="Usuario"
                value={filtros.usuario}
                onChange={handleChange}
              />
              <Input
                name="fecha"
                type="date"
                value={filtros.fecha}
                onChange={handleChange}
              />
              <Input
                name="tecnico"
                placeholder="Técnico"
                value={filtros.tecnico}
                onChange={handleChange}
              />
              <Input
                name="numeroRequerimiento"
                placeholder="N° Requerimiento"
                value={filtros.numeroRequerimiento}
                onChange={handleChange}
              />

              <Button onClick={limpiarFiltros}>
                <FiXCircle style={{ marginRight: '0.5rem' }} />
                Limpiar
              </Button>

            </Filters>
            <Table>
              <thead>
                <TableRow>

                  {/* <Th onClick={() => ordenarResultados('ID')}>
                    ID
                  </Th> */}
                  <Th onClick={() => ordenarResultados('FECHA')}>
                    Fecha {orden.columna === 'FECHA' && (orden.ascendente ? '↑' : '↓')}</Th>

                  <Th onClick={() => ordenarResultados('USUARIO')}>
                    Usuario {orden.columna === 'USUARIO' && (orden.ascendente ? '↑' : '↓')}
                  </Th>
                  <Th onClick={() => ordenarResultados('TECNICO')}>
                    Técnico {orden.columna === 'TÉCNICO' && (orden.ascendente ? '↑' : '↓')}</Th>

                  <Th onClick={() => ordenarResultados('NUM_REQUERIMIENTO')}>
                    N° Requerimiento {orden.columna === 'NUM_REQUERIMIENTO' && (orden.ascendente ? '↑' : '↓')}</Th>
                  {/* <Th onClick={() => ordenarResultados('ESTADO')}>
                    Estado {orden.columna === 'ESTADO' && (orden.ascendente ? '↑' : '↓')}
                  </Th> */}
                  <Th>Acciones</Th>



                </TableRow>
              </thead>
              <tbody>
                {resultadosPaginados.map((informe) => (
                  <TableRow
                    key={informe.ID}
                    className={informe.ID.toString() === idResaltado ? 'resaltado' : ''}
                  >
                    {/* <Td>{informe.ID}</Td> */}
                    {/*  <Td>{informe.NOMBRE}</Td> */}
                    <Td>{new Date(informe.FECHA).toLocaleDateString()}</Td>
                    <Td>{informe.USUARIO}</Td>
                    <Td>{informe.TECNICO}</Td>
                    <Td>{informe.NUM_REQUERIMIENTO}</Td>
                    {/* <Td>
                      <IconButton>
                        {informe.ESTADO === 'APROBADO' && '✅ Aprobado'}
                        {informe.ESTADO === 'RECHAZADO' && '❌ Rechazado'}
                        {informe.ESTADO === 'PENDIENTE' && '⏳ Pendiente'}
                      </IconButton>

                    </Td> */}
                    <Td>
                      {/* <IconButton
                      onClick={() =>
                        enviarCorreoOutlook(
                          informe.USUARIO,
                          informe.NOMBRE,
                          informe.NUM_REQUERIMIENTO,
                          informe.USUARIO
                        )
                      }
                      title="Enviar por correo"
                    >
                      <FiMail size={18} />
                    </IconButton> */}

                      <IconButton
                        onClick={() => verPDF(informe.NOMBRE)}
                        title="Ver informe PDF"
                      >
                        <AiOutlineEye size={28} />
                      </IconButton>

                    </Td>


                    {/* <Button onClick={() => descargarPDF(informe.NOMBRE)}>Descargar</Button> */}

                  </TableRow>
                ))}

              </tbody>

            </Table>
            <PageSizeSelector>
              <label htmlFor="cantidadPorPagina">Resultados por página:</label>
              <select
                id="cantidadPorPagina"
                value={resultadosPorPagina}
                onChange={(e) => {
                  setResultadosPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </PageSizeSelector>

            <PaginationContainer>
              <PaginationButton onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1}>
                ⬅ Anterior
              </PaginationButton>

              <PageInfo>
                Página {paginaActual} de {totalPaginas}
              </PageInfo>

              <PaginationButton onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}>
                Siguiente ➡
              </PaginationButton>
            </PaginationContainer>

            {busquedaRealizada && resultados.length === 0 && (
              <div style={{ textAlign: 'center', marginTop: '3rem', color: '#7f8c8d' }}>
                <FiSearch size={48} style={{ marginBottom: '1rem' }} />
                <p style={{ fontSize: '1.1rem' }}>
                  No se encontraron informes con los filtros aplicados.
                </p>
              </div>
            )}

          </ContentWrapper>

        </Container>

      </>
    </ThemeProvider>


  );
};

export default HistorialInformes;
