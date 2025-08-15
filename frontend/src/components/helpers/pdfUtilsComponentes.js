import jsPDF from 'jspdf';


export const exportarFormularioComponentesA_PDF = async (formRef, nombreArchivo, formData) => {
  // Si no se proporciona un nombre, se genera uno automáticamente
  if (!nombreArchivo) {
    const fecha = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
    const usuario = formData.usuario?.replace(/\s+/g, '_') || 'Usuario';
    const requerimiento = formData.requerimiento || 'REQ';
    nombreArchivo = `Informe_${requerimiento}_${usuario}_${fecha}.pdf`;
  }

  const resultado = await generarPDFenMemoria(formData);
  if (resultado.success) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(resultado.blob);
    link.download = nombreArchivo;
    link.click();
    return { success: true };
  } else {
    return { success: false, error: resultado.error };
  }
};


export const generarPDFenMemoria = async (formData) => {
  try {
    const [usuarioDetalleRes, equipoDetalleRes] = await Promise.all([
      fetch(`http://172.20.70.113:3000/api/usuarios/detalle?nombre=${formData.usuario}`).then(res => res.json()),
      fetch(`http://172.20.70.113:3000/api/equipos/detalle?nombre=${formData.equipo}`).then(res => res.json())
    ]);

    const usuario = usuarioDetalleRes || {};
    const equipo = equipoDetalleRes || {};

    const fecha = new Date();
    const fechaActual = fecha.toLocaleDateString();
    const horaActual = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const pdf = new jsPDF();
    pdf.setFont('helvetica');
    let y = 20;

    // Título centrado
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text(`INFORME TÉCNICO – ${formData.requerimiento}`, 105, y, { align: 'center' });
    y += 12;

    const seccion = (titulo) => {
      pdf.setFontSize(13);
      pdf.setFont(undefined, 'bold');
      pdf.text(titulo, 15, y);
      y += 8;
      pdf.setFont(undefined, 'normal');
    };

    const parrafoJustificado = (texto, margenX = 15, ancho = 180) => {
      const lineas = pdf.splitTextToSize(texto, ancho);
      const altoLinea = 7;
      const limiteInferior = 280;

      lineas.forEach((linea) => {
        if (y + altoLinea > limiteInferior) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(linea, margenX, y);
        y += altoLinea;
      });
    };


    const formatearCapacidad = (valor) => {
      const num = parseInt(valor);
      if (isNaN(num)) return valor;
      return num >= 1000 ? `${(num / 1000).toFixed(1)} TB` : `${num} GB`;
    };

    const formatearMemoria = (valor) => {
      const partes = valor.split(',').map(v => parseInt(v));
      const totalMB = partes.reduce((acc, val) => acc + (isNaN(val) ? 0 : val), 0);
      const totalGB = totalMB / 1024;
      return `${totalGB % 1 === 0 ? totalGB : totalGB.toFixed(1)} GB`;
    };

    const obtenerIPv4 = (direccion) => {
      if (!direccion) return '';
      const partes = direccion.split(',').map(ip => ip.trim());
      const ipv4 = partes.find(ip => /^\d{1,3}(\.\d{1,3}){3}$/.test(ip));
      return ipv4 || partes[0] || '';
    };


    const formatearVelocidad = (valor) => {
      const num = parseFloat(valor);
      return isNaN(num) ? valor : `${(num).toFixed(2)} GHz`;
    };

    const linea = (label, valor = '') => {
      const labelX = 15;
      const valueX = 80;
      const maxWidth = 110;

      pdf.setFont(undefined, 'bold');
      pdf.text(`${label}:`, labelX, y);
      pdf.setFont(undefined, 'normal');

      const valorLineas = pdf.splitTextToSize(valor, maxWidth);
      pdf.text(valorLineas, valueX, y);

      y += valorLineas.length * 7;
    };

    seccion('1. DATOS DE USUARIO Y TÉCNICO');
    linea('Nombre de Usuario', formData.usuario);
    linea('Área', usuario.DEPARTAMENTO);
    linea('Correo Electrónico', usuario.MAIL);
    linea('Empresa', usuario.EMPRESA);
    linea('Cargo', usuario.CARGO);
    linea('Agencia', equipo.AGENCIA);
    linea('Técnico Asignado', formData.tecnico);
    linea('Hora Realización Trabajo', horaActual);
    linea('F. Realización Trabajo', fechaActual);
    y += 10
    seccion('2. IDENTIFICACIÓN DEL EQUIPO');
    linea('Nombre del Equipo', formData.equipo);
    linea('Modelo', equipo.MODELO);
    linea('Marca', equipo.FABRICANTE);
    linea('IP Equipo', obtenerIPv4(equipo.DIRECCION_IP));
    linea('Número de Serie', equipo.NUM_SERIE);
    linea('Dirección MAC', equipo.DIRECCION_MAC);
    linea('Código de Barras', formData.codigoBarras);
    y += 10
    seccion('3. ESPECIFICACIONES TÉCNICAS');
    linea('Disco Duro', formatearCapacidad(equipo.CAPACIDAD_DISCO));
    linea('Espacio Libre', formatearCapacidad(equipo.ESPACIO_LIBRE_DISCO));
    linea('Memoria RAM', formatearMemoria(equipo.MEMORIA_FISICA));
    linea('Procesador', equipo.PROCESADOR);
    linea('Velocidad', formatearVelocidad(equipo.VELOCIDAD_PROCESADOR));


    y += 10
    if (equipo.SO || equipo.VERSION_SO) {
      const textoSO = `${equipo.SO || ''}${equipo.VERSION_SO ? ` Versión: ${equipo.VERSION_SO}` : ''}`;
      linea('Sistema Operativo', textoSO.trim());
    }

    if (equipo.VERSION_CHROME) {
      linea('Google Chrome', `Versión: ${equipo.VERSION_CHROME}`);
    }
    if (equipo.VERSION_IE) {
      linea('Internet Explorer', `Versión: ${equipo.VERSION_IE}`);
    }




    /* pdf.setFont(undefined, 'bold');
    pdf.text('Otros Programas:', 15, y);
    pdf.setFont(undefined, 'normal'); */
    /*  y += 7;
     parrafoJustificado(equipo.otros_programas);
     y += 10 */

    pdf.addPage(); // ← Esto fuerza una nueva página
    y = 20;        // ← Reinicia la posición vertical

    seccion('5. DIAGNÓSTICO Y RECOMENDACIONES');
    parrafoJustificado(formData.comentario);
    y += 10


    if (formData.imagenes && formData.imagenes.length > 0) {
      seccion('6. IMÁGENES ADJUNTAS');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 15;
      const marginY = 20;
      const maxWidth = (pageWidth - marginX * 2);
      const maxHeight = 80; // Altura máxima por imagen

      for (const img of formData.imagenes) {
        try {
          const image = img.url;
          const format = image.startsWith('data:image/png') ? 'PNG' : 'JPEG';

          const imgProps = pdf.getImageProperties(image);
          const ratio = imgProps.width / imgProps.height;
          const imgWidth = maxWidth;
          const imgHeight = imgWidth / ratio;

          const finalHeight = imgHeight > maxHeight ? maxHeight : imgHeight;
          const finalWidth = finalHeight * ratio;

          if (y + finalHeight > pageHeight - marginY) {
            pdf.addPage();
            y = marginY;
          }

          pdf.addImage(image, format, marginX, y, finalWidth, finalHeight);
          y += finalHeight + 10;
        } catch (e) {
          console.warn('No se pudo agregar una imagen al PDF:', e);
        }
      }
    }


    if (formData.firma) {
      pdf.addPage();
      pdf.setFontSize(12);
      pdf.text('Para constancia firman:', 105, 30, { align: 'center' });

      pdf.line(30, 80, 90, 80);
      pdf.line(120, 80, 180, 80);
      pdf.text('Firma del Usuario', 45, 90);
      pdf.text('Firma del Técnico SES', 135, 90);
      pdf.addImage(formData.firma, 'PNG', 120, 40, 60, 30);
    }

    const blob = pdf.output('blob');
    return { success: true, blob };
  } catch (error) {
    console.error('Error al generar PDF en memoria:', error);
    return { success: false, error };
  }
};
