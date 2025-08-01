// excelUtils.js
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const generarInformeTecnico = async (formData) => {
  try {
    const [usuarioDetalle, equipoDetalle] = await Promise.all([
      axios.get(`http://172.20.70.113:3000/api/usuarios/detalle?nombre=${formData.usuario}`),
      axios.get(`http://172.20.70.113:3000/api/equipos/detalle?nombre=${formData.equipo}`)
    ]);

    const response = await fetch('/plantillas/FormatoInformeTecnico.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const datos = {
      "Nombre de Usuario:": formData.usuario,
      "Área:": usuarioDetalle.area,
      "Técnico Asignado:": formData.tecnico,
      "Correo Electrónico:": usuarioDetalle.data.mail,
      "Nombre del Equipo:": formData.equipo,
      "Cargo:": usuarioDetalle.data.CARGO,
      "Empresa:": usuarioDetalle.data.EMPRESA,
      "Agencia:": usuarioDetalle.data.DEPARTAMENTO,
      "NÚMERO SERIE:": equipoDetalle.data.serie,
      "DISCO DURO": equipoDetalle.data.disco_duro,
      "MEMORIA": equipoDetalle.data.memoria,
      "CRITERIO TÉCNICO SOBRE EL ESTADO DEL EQUIPO Y RECOMENDACIONES:": formData.comentario
    };

    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
        const cell = sheet[cellRef];
        if (cell && datos[cell.v]) {
          const targetRef = XLSX.utils.encode_cell({ c: C + 1, r: R });
          sheet[targetRef] = { t: 's', v: datos[cell.v] };
        }
      }
    }

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const archivo = new Blob([excelBuffer], { type: "application/octet-stream" });
    const nombreArchivo = `INFORME_TECNICO_${formData.requerimiento}_${formData.usuario}.xlsx`;
    saveAs(archivo, nombreArchivo);

    return { success: true };
  } catch (error) {
    console.error('Error al generar el informe:', error);
    return { success: false, error };
  }
};
