
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
      SELECT NOM_EQUIPO, AGENCIA, SO, VERSION_SO, ARQUITECTURA_SO, NUM_SERIE,
             FABRICANTE, MODELO, PROCESADOR, ARQ_PROCESADOR, VELOCIDAD_PROCESADOR,
             CAPACIDAD_DISCO, MEMORIA_FISICA, ESPACIO_LIBRE_DISCO, DIRECCION_IP,
             DIRECCION_MAC, VERSION_IE, VERSION_CHROME
      FROM Inventario_Hardware
      WHERE NOM_EQUIPO = @nombre
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
