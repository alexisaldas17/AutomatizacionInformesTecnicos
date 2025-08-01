
const { ejecutarConsulta } = require('../services/db');

const obtenerTecnicos = async (req, res) => {
  try {
    const tecnicos = await ejecutarConsulta('SELECT NOM_TECNICO FROM Tecnicos');
    res.json(tecnicos);
  } catch (error) {
    console.error('Error al obtener técnicos:', error);
    res.status(500).json({ error: 'Error al obtener técnicos' });
  }
};


// Guardar técnico
/* const guardarTecnico = async (req, res) => {
  const { nombreTecnico } = req.body;

  if (!nombreTecnico || typeof nombreTecnico !== 'string') {
    return res.status(400).json({ error: 'Nombre del técnico inválido' });
  }

  try {
    const query = 'INSERT INTO Tecnicos (NOM_TECNICO) VALUES (@nombreTecnico)';
    const params = {
      nombreTecnico: { type: require('mssql').NVarChar, value: nombreTecnico }
    };

    await ejecutarConsulta(query, params);
    res.json({ success: true, message: 'Técnico guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar técnico:', error);
    res.status(500).json({ error: 'Error al guardar técnico' });
  }
}; */

module.exports = { obtenerTecnicos };
