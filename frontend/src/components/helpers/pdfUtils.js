import jsPDF from 'jspdf';

import { convert } from 'html-to-text';



export const exportarFormularioAPDF = async (formRef, nombreArchivo, formData) => {


  // Si no se proporciona un nombre, se genera uno automáticamente
  if (!nombreArchivo) {
    const fecha = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
    const usuario = formData.usuario?.replace(/\s+/g, '_') || 'Usuario';
    const requerimiento = formData.requerimiento || 'REQ';
    nombreArchivo = `Informe_${requerimiento}_${usuario}_${fecha}.pdf`;
  }

  // Generar el PDF en memoria con los datos del formulario
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
    const fecha = new Date();
    const fechaActual = fecha.toLocaleDateString();
    const horaActual = fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const pdf = new jsPDF();
    pdf.setFont('helvetica');
    let y = 20;

    // Convertir comentario HTML a texto plano
    const comentarioPlano = convert(formData.comentario, {
      wordwrap: 130,
      preserveNewlines: true,
    });

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
   
    function renderFormattedText(pdf, html, startX = 15, startY = 20, maxWidth = 180, lineHeight = 7) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = startY;

      const processParagraph = (element) => {
        let words = [];
        const collectWords = (node, style = { bold: false, italic: false, underline: false }) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const textWords = node.textContent.trim().split(/\s+/).filter(Boolean);
            textWords.forEach(word => words.push({ text: word, style }));
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const newStyle = { ...style };
            if (node.tagName === 'B' || node.tagName === 'STRONG') newStyle.bold = true;
            if (node.tagName === 'I' || node.tagName === 'EM') newStyle.italic = true;
            if (node.tagName === 'U') newStyle.underline = true;
            node.childNodes.forEach(child => collectWords(child, newStyle));
          }
        };

        collectWords(element);

        let x = startX;
        let line = [];
        let lineWidth = 0;

        const flushLine = () => {
          const totalTextWidth = line.reduce((sum, w) => sum + pdf.getTextWidth(w.text), 0);
          const spaceCount = line.length - 1;
          const extraSpace = spaceCount > 0 ? (maxWidth - totalTextWidth) / spaceCount : 0;

          x = startX;
          line.forEach((word, i) => {
            const { bold, italic, underline } = word.style;
            let fontStyle = 'normal';
            if (bold && italic) fontStyle = 'bolditalic';
            else if (bold) fontStyle = 'bold';
            else if (italic) fontStyle = 'italic';

            pdf.setFont(undefined, fontStyle);
            pdf.text(word.text, x, y);

            if (underline) {
              const textWidth = pdf.getTextWidth(word.text);
              pdf.line(x, y + 1, x + textWidth, y + 1);
            }

            x += pdf.getTextWidth(word.text) + (i < spaceCount ? extraSpace : 0);
          });

          y += lineHeight;
          if (y > pageHeight - 20) {
            pdf.addPage();
            y = 20;
          }

          line = [];
          lineWidth = 0;
        };

        words.forEach(word => {
          const wordWidth = pdf.getTextWidth(word.text);
          if (lineWidth + wordWidth + (line.length > 0 ? pdf.getTextWidth(' ') : 0) > maxWidth) {
            flushLine();
          }
          line.push(word);
          lineWidth += wordWidth + (line.length > 1 ? pdf.getTextWidth(' ') : 0);
        });

        if (line.length > 0) flushLine();
      };

      tempDiv.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') {
          processParagraph(node);
        } else {
          processParagraph(node);
        }
      });

      return y;
    }


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

    const formatearVelocidad = (valor) => {
      // Reemplazar coma por punto si existe
      const valorNormalizado = typeof valor === 'string' ? valor.replace(',', '.') : valor;

      const num = parseFloat(valorNormalizado);
      if (isNaN(num)) return valor;

      // Truncar sin redondear a dos decimales
      const truncado = Math.floor(num * 100) / 100;

      return `${truncado.toFixed(2)} GHz`;
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

    // Sección 1: Usuario y Técnico
    seccion('1. DATOS DE USUARIO Y TÉCNICO');
    linea('Nombre de Usuario', formData.usuario);
    linea('Área', formData.departamento);
    linea('Correo Electrónico', formData.email);
    linea('Empresa', formData.empresa);
    linea('Cargo', formData.cargo);
    linea('Técnico Asignado', formData.tecnico);
    linea('Hora Realización Trabajo', horaActual);
    linea('Fecha Realización Trabajo', fechaActual);
    y += 10;

    // Sección 2: Identificación del Equipo
    seccion('2. IDENTIFICACIÓN DEL EQUIPO');
    linea('Nombre del Equipo', formData.equipo);
    linea('Agencia', formData.agencia);
    linea('Modelo', formData.modelo);
    linea('Marca', formData.marca);
    linea('IP Equipo', formData.ipEquipo);
    linea('Número de Serie', formData.numSerie);
    linea('Dirección MAC', formData.direccionMAC);
    linea('Código de Barras', formData.codigoBarras);
    y += 10;

    // Sección 3: Especificaciones Técnicas
    seccion('3. ESPECIFICACIONES TÉCNICAS');
    linea('Disco Duro', formatearCapacidad(formData.discoDuro));
    linea('Espacio Libre', formatearCapacidad(formData.espacioLibre));
    linea('Memoria RAM', formatearMemoria(formData.memoriaRAM));
    linea('Procesador', formData.procesador);
    linea('Velocidad', formatearVelocidad(formData.velocidad));
    linea('Sistema Operativo', `${formData.sistemaOperativo} ${formData.version_so || ''}`.trim());
    y += 10;

    // Sección 4: Diagnóstico
    pdf.addPage();
    y = 20;
    seccion('4.DIAGNÓSTICO Y RECOMENDACIONES');
    y = renderFormattedText(pdf, formData.comentario, 15, y);
    y += 10;


    // Sección 5: Imágenes
    if (formData.imagenes && formData.imagenes.length > 0) {
      seccion('5. IMÁGENES ADJUNTAS');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 15;
      const marginY = 20;
      const spacing = 5;

      let x = marginX;
      let rowHeight = 0;

      for (let i = 0; i < formData.imagenes.length; i++) {
        try {
          const image = formData.imagenes[i].url;
          const format = image.startsWith('data:image/png') ? 'PNG' : 'JPEG';
          const imgProps = pdf.getImageProperties(image);
          const ratio = imgProps.width / imgProps.height;
          const isWide = imgProps.width > 0.7 * imgProps.height;
          const maxImageWidth = isWide ? pageWidth - marginX * 2 : (pageWidth - marginX * 2 - spacing);
          const maxImageHeight = pageHeight / 3;
          let imgWidth = Math.min(imgProps.width, maxImageWidth);
          let imgHeight = imgWidth / ratio;
          if (imgHeight > maxImageHeight) {
            imgHeight = maxImageHeight;
            imgWidth = imgHeight * ratio;
          }
          if (x + imgWidth > pageWidth - marginX) {
            x = marginX;
            y += rowHeight + spacing;
            rowHeight = 0;
          }
          if (y + imgHeight > pageHeight - marginY) {
            pdf.addPage();
            y = marginY;
            x = marginX;
            rowHeight = 0;
          }
          pdf.addImage(image, format, x, y, imgWidth, imgHeight);
          if (formData.imagenes[i].descripcion) {
            pdf.setFontSize(10);
            pdf.text(formData.imagenes[i].descripcion, x + imgWidth / 2, y + imgHeight + 5, { align: 'center' });
          }
          x += imgWidth + spacing;
          rowHeight = Math.max(rowHeight, imgHeight + 10);
        } catch (e) {
          pdf.setDrawColor(255, 0, 0);
          pdf.rect(x, y, 50, 20);
          pdf.setFontSize(10);
          pdf.text('Imagen no disponible', x + 25, y + 10, { align: 'center' });
          x += 55;
        }
      }


      if (x !== marginX) {
        y += rowHeight + 10;
      }
    }


    // Sección 6: Firma
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
