const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const { ejecutarConsulta } = require('../services/db');
const codigosValidos = {
  'TEC-2025': 'Tecnico',
  'ADM-2025': 'Administrativo',
  'USR-2025': 'Usuario',
  'APR-2025': 'Aprobador',

};


/* exports.registrarUsuario = async (req, res) => {
  const { nombre, correo, password, codigo } = req.body;

  if (!nombre || !correo || !password || !codigo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const rol = codigosValidos[codigo];
  if (!rol) {
    return res.status(400).json({ error: 'Código de invitación inválido' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO Autenticacion (NOMBRE, CORREO, PASSWORD, ROL)
      VALUES (@nombre, @correo, @password, @rol)
    `;

    await ejecutarConsulta(query, {
      nombre: { type: sql.NVarChar, value: nombre },
      correo: { type: sql.NVarChar, value: correo },
      password: { type: sql.NVarChar, value: hashedPassword },
      rol: { type: sql.NVarChar, value: rol }
    });

    res.json({ success: true, message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
}; */
exports.registrarUsuario = async (req, res) => {
  const { nombre, correo, password, codigo } = req.body;

  if (!nombre || !correo || !password || !codigo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const rol = codigosValidos[codigo];
  if (!rol) {
    return res.status(400).json({ error: 'Código de invitación inválido' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO Autenticacion (NOMBRE, CORREO, PASSWORD, ROL)
      VALUES (@nombre, @correo, @password, @rol)
    `;

    await ejecutarConsulta(query, {
      nombre: { type: sql.NVarChar, value: nombre },
      correo: { type: sql.NVarChar, value: correo },
      password: { type: sql.NVarChar, value: hashedPassword },
      rol: { type: sql.NVarChar, value: rol }
    });

    res.json({ success: true, message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};


exports.loginUsuario = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  try {
    const query = `SELECT * FROM Autenticacion WHERE CORREO = @correo`;
    const result = await ejecutarConsulta(query, {
      correo: { type: sql.NVarChar, value: correo }
    });

    const usuario = result[0];
    if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, usuario.PASSWORD);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: usuario.ID, rol: usuario.ROL, nombre: usuario.NOMBRE },
      'tu_clave_secreta',
      { expiresIn: '8h' }
    );

    res.json({ token, rol: usuario.ROL, nombre: usuario.NOMBRE, correo: usuario.CORREO, id: usuario.ID });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en login' });
  }
};


exports.cambiarPassword = async (req, res) => {
  const { correo, passwordActual, nuevaPassword } = req.body;

  if (!correo || !passwordActual || !nuevaPassword) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const query = `SELECT * FROM Usuarios WHERE CORREO = @correo`;
    const result = await ejecutarConsulta(query, {
      correo: { type: sql.NVarChar, value: correo }
    });

    const usuario = result[0];
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const match = await bcrypt.compare(passwordActual, usuario.PASSWORD);
    if (!match) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    const updateQuery = `
      UPDATE Usuarios SET PASSWORD = @nuevaPassword WHERE CORREO = @correo
    `;

    await ejecutarConsulta(updateQuery, {
      nuevaPassword: { type: sql.NVarChar, value: hashedPassword },
      correo: { type: sql.NVarChar, value: correo }
    });

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};
