
const { ejecutarConsulta } = require('../services/db');

const obtenerEquipos = async (req, res) => {
  try {
    const equipos = await ejecutarConsulta('SELECT NOM_EQUIPO FROM Inventario_Hardware');
    res.json(equipos);
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
};

const obtenerNumeroSerieEquipo = async(req, res) => {
  const { nombre } = req.query;
  try {
    const query = `
      SELECT  NUM_SERIE,FABRICANTE, MODELO       
      FROM Inventario_Hardware
      WHERE NOM_EQUIPO = @nombre
    `;
    const resultado = await ejecutarConsulta(query, { nombre });
    res.json(resultado[0]);
  } catch (error) {
    console.error('Error al obtener detalles de garantia:', error);
    res.status(500).json({ error: 'Error al obtener detalles de garantia' });
  }

}

const obtenerEquipoPorNombre = async (req, res) => {
  const { nombre } = req.query;
  try {
    const query = `
              SELECT
          h.NOM_EQUIPO, h.AGENCIA, h.SO, h.VERSION_SO, h.ARQUITECTURA_SO, h.NUM_SERIE,
          h.FABRICANTE, h.MODELO, h.PROCESADOR, h.ARQ_PROCESADOR, h.VELOCIDAD_PROCESADOR,
          h.CAPACIDAD_DISCO, h.MEMORIA_FISICA, h.ESPACIO_LIBRE_DISCO, h.DIRECCION_IP,
          h.DIRECCION_MAC, h.VERSION_IE, h.VERSION_CHROME,
          a.CODIGO
        FROM Inventario_Hardware h
        LEFT JOIN Inventario_Administrativo a ON h.NUM_SERIE = a.SERIE
        WHERE h.NOM_EQUIPO = @nombre
    `;
    const resultado = await ejecutarConsulta(query, { nombre });
    res.json(resultado[0]);
  } catch (error) {
    console.error('Error al obtener detalles del equipo:', error);
    res.status(500).json({ error: 'Error al obtener detalles del equipo' });
  }
};

const obtenerEquipoPorUsuario = async (req, res) => {
  const { nombre } = req.query;

  try {
    const query = `
      SELECT EQUIPO
      FROM UsuariosEquipos
      WHERE NOMBRE = @nombre
    `;

    const resultado = await ejecutarConsulta(query, { nombre });

    if (resultado.length > 0) {
      res.json({ equipo: resultado[0].NOM_EQUIPO });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado o sin equipo asignado' });
    }
  } catch (error) {
    console.error('Error al obtener equipo por usuario:', error);
    res.status(500).json({ error: 'Error al obtener equipo por usuario' });
  }
};


module.exports = { obtenerEquipos, obtenerEquipoPorNombre, obtenerNumeroSerieEquipo , obtenerEquipoPorUsuario };
