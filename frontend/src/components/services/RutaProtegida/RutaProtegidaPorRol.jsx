import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaProtegidaPorRol = ({ children, rolesPermitidos }) => {
    const token = localStorage.getItem('token');
    const rol = localStorage.getItem('rol');

    if (!token || !rolesPermitidos.includes(rol)) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default RutaProtegidaPorRol;
