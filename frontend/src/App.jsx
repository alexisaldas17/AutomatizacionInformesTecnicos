import React from 'react';
/* import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
 */import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './components/home/Home';
import HistorialInformes from './components/Informes/Historial/HistorialInformesActivos';
import FormularioComponentes from './components/Formulario/FormularioComponentes/FormularioComponentes';
import FormularioActivos from './components/Formulario/FormularioActivos/FormularioActivos';

import Registro from './components/Auth/Registro';
import Login from './components/Auth/Login';
import CambiarPassword from './components/Auth/CambiarContrasenia';
import RecuperarPassword from './components/Auth/RecuperarPassword';
import RestablecerPassword from './components/Auth/ReestablecerPassword';

import RutaProtegidaPorRol from './components/services/RutaProtegida/RutaProtegidaPorRol';
import VistaPreviaPage from './components/Informes/VistaPrevia/VistaPreviaPage';
import InformesPendientes from './components/Informes/InformesPendientes';
import InformesPendientesAprobadosPorTecnico from './components/Informes/InformesPendientesAprobadosPorTecnico';
import InformesTabs from './components/Informes/InformesTabs';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-password" element={<RecuperarPassword />} />
        <Route path="/restablecer-password" element={<RestablecerPassword />} />
        <Route path="/cambiar-password" element={<CambiarPassword />} />

        {/* Rutas protegidas para Técnicos */}
        <Route
          path="/home"
          element={
            <RutaProtegidaPorRol rolesPermitidos={['Tecnico']}>
              <Home />
            </RutaProtegidaPorRol>
          }
        />
        <Route
          path="/mis-informes"
          element={
            <RutaProtegidaPorRol rolesPermitidos={['Tecnico']}>
              <InformesPendientesAprobadosPorTecnico />
            </RutaProtegidaPorRol>
          }
        />
        <Route
          path="/formularioEquipos"
          element={
            <RutaProtegidaPorRol rolesPermitidos={['Tecnico']}>
              <FormularioActivos />
            </RutaProtegidaPorRol>
          }
        />
        <Route
          path="/formularioComponentes"
          element={
            <RutaProtegidaPorRol rolesPermitidos={['Tecnico']}>
              <FormularioComponentes />
            </RutaProtegidaPorRol>
          }
        />
        <Route
          path="/vista-previa"
          element={
            <RutaProtegidaPorRol rolesPermitidos={['Tecnico']}>
              <VistaPreviaPage />
            </RutaProtegidaPorRol>
          }
        />

        {/* Rutas protegidas para Admins o Historial */}
        <Route
          path="/historial-informes"
          element={
            <RutaProtegidaPorRol rolesPermitidos={['Tecnico']}>
              <InformesTabs />
            </RutaProtegidaPorRol>
          }
        />

        <Route
          path="/aprobaciones-pendientes"
          element={
            <RutaProtegidaPorRol rolesPermitidos={['Aprobador']}>
              <InformesPendientes />
            </RutaProtegidaPorRol>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;
