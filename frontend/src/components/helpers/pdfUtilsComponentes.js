import jsPDF from "jspdf";
import { convert } from "html-to-text";

export const exportarFormularioComponentesA_PDF = async (
  formRef,
  nombreArchivo,
  formData
) => {
  // Si no se proporciona un nombre, se genera uno automáticamente
  if (!nombreArchivo) {
    const fecha = new Date().toISOString().split("T")[0]; // formato YYYY-MM-DD
    const usuario = formData.usuario?.replace(/\s+/g, "_") || "Usuario";
    const requerimiento = formData.requerimiento || "REQ";
    nombreArchivo = `Informe_${requerimiento}_${usuario}_${fecha}.pdf`;
  }

  const resultado = await generarPDFenMemoria(formData);
  if (resultado.success) {
    const link = document.createElement("a");
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
    const horaActual = fecha.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const pdf = new jsPDF();
    pdf.setFont("helvetica");
    let y = 20;

    // Convertir comentario HTML a texto plano
    /*     const comentarioPlano = convert(formData.comentario, {
      wordwrap: 130,
      preserveNewlines: true,
    });
 */
    pdf.setFontSize(16);
    pdf.setFont(undefined, "bold");
    pdf.text(`INFORME TÉCNICO – ${formData.requerimiento}`, 105, y, {
      align: "center",
    });
    y += 12;

    const seccion = (titulo) => {
      pdf.setFontSize(13);
      pdf.setFont(undefined, "bold");
      pdf.text(titulo, 15, y);
      y += 8;
      pdf.setFont(undefined, "normal");
    };
    /* 
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
    }; */
    function renderFormattedText(
      pdf,
      html,
      startX = 15,
      startY = 20,
      maxWidth = 180,
      lineHeight = 7
    ) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = startY;
      const widthCache = {};

      const getTextWidth = (text) => {
        if (!widthCache[text]) {
          widthCache[text] = pdf.getTextWidth(text);
        }
        return widthCache[text];
      };

      const getFontStyle = ({ bold, italic }) => {
        if (bold && italic) return "bolditalic";
        if (bold) return "bold";
        if (italic) return "italic";
        return "normal";
      };

      const collectWords = (
        node,
        style = { bold: false, italic: false, underline: false }
      ) => {
        let words = [];
        if (node.nodeType === Node.TEXT_NODE) {
          const textWords = node.textContent
            .trim()
            .split(/\s+/)
            .filter(Boolean);
          textWords.forEach((text) => words.push({ text, style }));
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const newStyle = { ...style };
          const tag = node.tagName.toUpperCase();
          if (tag === "B" || tag === "STRONG") newStyle.bold = true;
          if (tag === "I" || tag === "EM") newStyle.italic = true;
          if (tag === "U") newStyle.underline = true;
          node.childNodes.forEach((child) => {
            words = words.concat(collectWords(child, newStyle));
          });
        }
        return words;
      };

      const flushLine = (line) => {
        const totalTextWidth = line.reduce(
          (sum, w) => sum + getTextWidth(w.text),
          0
        );
        const spaceCount = line.length - 1;

        // Solo justificar si hay suficientes palabras y el espacio extra no es excesivo
        const shouldJustify =
          spaceCount > 2 && (maxWidth - totalTextWidth) / spaceCount < 10;
        const extraSpace = shouldJustify
          ? (maxWidth - totalTextWidth) / spaceCount
          : getTextWidth(" ");

        let x = startX;
        line.forEach((word, i) => {
          const fontStyle = getFontStyle(word.style);
          pdf.setFont(undefined, fontStyle);
          pdf.text(word.text, x, y);

          if (word.style.underline) {
            const textWidth = getTextWidth(word.text);
            pdf.line(x, y + 1, x + textWidth, y + 1);
          }

          x += getTextWidth(word.text) + (i < spaceCount ? extraSpace : 0);
        });

        y += lineHeight;
        if (y > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
      };

      const processParagraph = (element) => {
        const words = collectWords(element);
        let line = [];
        let lineWidth = 0;

        words.forEach((word) => {
          const wordWidth = getTextWidth(word.text);
          const spaceWidth = line.length > 0 ? getTextWidth(" ") : 0;

          if (lineWidth + wordWidth + spaceWidth > maxWidth) {
            flushLine(line);
            line = [];
            lineWidth = 0;
          }

          line.push(word);
          lineWidth += wordWidth + (line.length > 1 ? getTextWidth(" ") : 0);
        });

        if (line.length > 0) flushLine(line);
      };

      tempDiv.childNodes.forEach(processParagraph);

      return y;
    }

    const linea = (label, valor = "") => {
      const labelX = 15;
      const valueX = 80;
      const maxWidth = 110;
      pdf.setFont(undefined, "bold");
      pdf.text(`${label}:`, labelX, y);
      pdf.setFont(undefined, "normal");
      const valorLineas = pdf.splitTextToSize(valor, maxWidth);
      pdf.text(valorLineas, valueX, y);
      y += valorLineas.length * 7;
    };

    // Sección 1: Usuario y Técnico
    seccion("1. DATOS DE USUARIO Y TÉCNICO");
    linea("Nombre de Usuario", formData.usuario);
    linea("Área", formData.departamento);
    linea("Correo Electrónico", formData.email);
    linea("Empresa", formData.empresa);
    linea("Cargo", formData.cargo);
    linea("Técnico Asignado", formData.tecnico);
    linea("Hora Realización Trabajo", horaActual);
    linea("Fecha Realización Trabajo", fechaActual);
    y += 10;

    // Sección 2: Identificación del Componente
    seccion("2. IDENTIFICACIÓN DEL COMPONENTE");
    linea("Nombre del Componente", formData.tipoComponente);

    if (formData.marca) {
      linea("Marca", formData.marca);
    }

    if (formData.modelo) {
      linea("Modelo", formData.modelo);
    }
    if (formData.numSerie) {
      linea("Número de Serie", formData.numSerie);
    }
    if (formData.codigoBarras) {
      linea("Código de Barras", formData.codigoBarras);
    }

    y += 10;

    // Sección 4: Diagnóstico
    pdf.addPage();
    y = 20;
    seccion("4.DIAGNÓSTICO Y RECOMENDACIONES");
    y = renderFormattedText(pdf, formData.comentario, 15, y);
    y += 10;

    // Sección 5: Imágenes
    if (formData.imagenes && formData.imagenes.length > 0) {
      seccion("5. IMÁGENES ADJUNTAS");
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
          const format = image.startsWith("data:image/png") ? "PNG" : "JPEG";
          const imgProps = pdf.getImageProperties(image);
          const ratio = imgProps.width / imgProps.height;
          const isWide = imgProps.width > 0.7 * imgProps.height;
          const maxImageWidth = isWide
            ? pageWidth - marginX * 2
            : pageWidth - marginX * 2 - spacing;
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
            pdf.text(
              formData.imagenes[i].descripcion,
              x + imgWidth / 2,
              y + imgHeight + 5,
              { align: "center" }
            );
          }
          x += imgWidth + spacing;
          rowHeight = Math.max(rowHeight, imgHeight + 10);
        } catch (e) {
          pdf.setDrawColor(255, 0, 0);
          pdf.rect(x, y, 50, 20);
          pdf.setFontSize(10);
          pdf.text("Imagen no disponible", x + 25, y + 10, { align: "center" });
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
      pdf.text("Para constancia firman:", 105, 30, { align: "center" });
      pdf.line(30, 80, 90, 80);
      pdf.line(120, 80, 180, 80);
      pdf.text("Firma del Usuario", 45, 90);
      pdf.text("Firma del Técnico SES", 135, 90);
      pdf.addImage(formData.firma, "PNG", 120, 40, 60, 30);
    }

    const blob = pdf.output("blob");
    return { success: true, blob };
  } catch (error) {
    console.error("Error al generar PDF en memoria:", error);
    return { success: false, error };
  }
};
