import axios from 'axios';

export const enviarPDFPorCorreo = async (blob, nombreArchivo, correoDestino) => {
    const formData = new FormData();
    formData.append('archivo', blob, nombreArchivo);
    formData.append('correo', correoDestino);
    formData.append('nombreArchivo', nombreArchivo);

    const response = await axios.post('http://172.20.70.113:3000/api/pdf/enviar-correo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const verificarRequerimiento = async (numeroRequerimiento) => {
    try {
        const response = await axios.get('http://172.20.70.113:3000/api/pdf/verificar-requerimiento', {
            params: { numeroRequerimiento }
        });
        return response.data.existe;
    } catch (error) {
        console.error('Error al verificar requerimiento:', error);
        return false;
    }
};


/* export const descargarPDF = (nombreArchivo) => {
    const url = `http://172.20.70.113:3000/api/pdf/descargar/${nombreArchivo}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}; */

export const verPDF = (nombreArchivo) => {
      const url = `http://172.20.70.113:3000/api/pdf/ver/${nombreArchivo}`;
      window.open(url, '_blank');


};

export const guardarPDFEnBD = async (blob, nombreArchivo, datosAdicionales) => {
    const formData = new FormData();
    formData.append('archivo', blob, nombreArchivo); // archivo con nombre
    formData.append('nombreArchivo', nombreArchivo); // nombre como campo separado

    // Añadir los datos adicionales al FormData
    formData.append('nombreUsuario', datosAdicionales.nombreUsuario);
    formData.append('nombreTecnico', datosAdicionales.nombreTecnico);
    formData.append('numeroRequerimiento', datosAdicionales.numeroRequerimiento);

    try {
        const response = await axios.post('http://172.20.70.113:3000/api/pdf/guardar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error al enviar el PDF al backend:', error);
        return { success: false };
    }
};

