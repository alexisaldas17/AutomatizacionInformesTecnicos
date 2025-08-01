
const { ejecutarConsulta } = require('../services/db');

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await ejecutarConsulta('SELECT NOMBRE FROM Usuarios');
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

const obtenerUsuarioPorNombre = async (req, res) => {
  const { nombre } = req.query;
  try {
    const query = `
      SELECT NOMBRE, USUARIO, MAIL, CARGO, EMPRESA, DEPARTAMENTO
      FROM Usuarios
      WHERE NOMBRE = @nombre
    `;
    const resultado = await ejecutarConsulta(query, { nombre });
    res.json(resultado[0]);
  } catch (error) {
    console.error('Error al obtener detalles del usuario:', error);
    res.status(500).json({ error: 'Error al obtener detalles del usuario' });
  }
};



module.exports = { obtenerUsuarios, obtenerUsuarioPorNombre };

