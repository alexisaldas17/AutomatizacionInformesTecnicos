
const { generarExcel } = require('../utils/excelGenerator');

const crearInforme = async (req, res) => {
  const { requerimiento, usuario, tecnico, equipo, comentario } = req.body;

  try {
    const nombreArchivo = await generarExcel({ requerimiento, usuario, tecnico, equipo, comentario });
    res.status(200).json({ mensaje: 'Informe generado correctamente', archivo: nombreArchivo });
  } catch (error) {
    console.error('Error al generar informe:', error);
    res.status(500).json({ error: 'Error al generar el informe' });
  }
};

module.exports = { crearInforme };
