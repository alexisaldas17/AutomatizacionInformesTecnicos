const sql = require('mssql');
const { ejecutarConsulta } = require('../services/db');

/* exports.obtenerHistorialInformes = async (req, res) => {
  const { usuario, fecha, tecnico, numeroRequerimiento } = req.query;

  let query = `SELECT ID, NOMBRE, FECHA, USUARIO, TECNICO, NUM_REQUERIMIENTO FROM Informes_PDF WHERE 1=1`;
  const params = {};

  if (usuario) {
    query += ` AND USUARIO LIKE @usuario`;
    params.usuario = { type: sql.NVarChar, value: `%${usuario}%` };
  }

  if (fecha) {
    query += ` AND CONVERT(date, FECHA) = @fecha`;
    params.fecha = { type: sql.Date, value: fecha };
  }

  if (tecnico) {
    query += ` AND TECNICO LIKE @tecnico`;
    params.tecnico = { type: sql.NVarChar, value: `%${tecnico}%` };
  }

  if (numeroRequerimiento) {
    query += ` AND NUM_REQUERIMIENTO = @numeroRequerimiento`;
    params.numeroRequerimiento = { type: sql.NVarChar, value: numeroRequerimiento };
  }

  try {
    const resultados = await ejecutarConsulta(query, params);
    res.json(resultados);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial de informes' });
  }
};
 */

/* exports.obtenerInformes = async (req, res) => {
  try {
    const query = `
      SELECT ID, NOMBRE, FECHA, USUARIO, TECNICO, NUM_REQUERIMIENTO
      FROM Informes_PDF
      ORDER BY FECHA DESC
    `;

    const resultados = await ejecutarConsulta(query);
    res.json(resultados);
  } catch (error) {
    console.error('Error al obtener informes:', error);
    res.status(500).json({ error: 'Error al obtener informes' });
  }
};

 */


exports.obtenerInformes = async (req, res) => {
  const { usuario, fecha, tecnico, numeroRequerimiento } = req.query;

  let query = `
    SELECT 
      I.ID, 
      I.NOMBRE, 
      I.FECHA, 
      I.USUARIO, 
      I.TECNICO, 
      I.NUM_REQUERIMIENTO,
      CASE 
        WHEN SUM(CASE WHEN A.ESTADO = 'RECHAZADO' THEN 1 ELSE 0 END) > 0 THEN 'RECHAZADO'
        WHEN SUM(CASE WHEN A.ESTADO = 'APROBADO' THEN 1 ELSE 0 END) >= 2 THEN 'APROBADO'
        ELSE 'PENDIENTE'
      END AS ESTADO
    FROM Informes_PDF I
    LEFT JOIN Aprobaciones_Informe A ON A.ID_INFORME = I.ID
    WHERE 1=1
  `;
  const params = {};

  if (usuario) {
    query += ' AND I.USUARIO LIKE @usuario';
    params.usuario = { type: sql.NVarChar, value: `%${usuario}%` };
  }
  if (fecha) {
    query += ' AND CONVERT(date, I.FECHA) = @fecha';
    params.fecha = { type: sql.Date, value: fecha };
  }
  if (tecnico) {
    query += ' AND I.TECNICO LIKE @tecnico';
    params.tecnico = { type: sql.NVarChar, value: `%${tecnico}%` };
  }
  if (numeroRequerimiento) {
    query += ' AND I.NUM_REQUERIMIENTO LIKE @numRequerimiento';
    params.numRequerimiento = { type: sql.NVarChar, value: `%${numeroRequerimiento}%` };
  }

  query += `
    GROUP BY 
      I.ID, 
      I.NOMBRE, 
      I.FECHA, 
      I.USUARIO, 
      I.TECNICO, 
      I.NUM_REQUERIMIENTO
    ORDER BY I.FECHA DESC
  `;

  try {
    const resultados = await ejecutarConsulta(query, params);
    res.json(resultados);
  } catch (error) {
    console.error('Error al obtener informes:', error);
    res.status(500).json({ error: 'Error al obtener informes' });
  }
};

exports.obtenerInformesPartes = async (req, res) => {
  const { usuario, fecha, tecnico, numeroRequerimiento } = req.query;

  let query = `
    SELECT 
      I.ID, 
      I.NOMBRE, 
      I.FECHA, 
      I.USUARIO, 
      I.TECNICO, 
      I.NUM_REQUERIMIENTO,
      CASE 
        WHEN SUM(CASE WHEN A.ESTADO = 'RECHAZADO' THEN 1 ELSE 0 END) > 0 THEN 'RECHAZADO'
        WHEN SUM(CASE WHEN A.ESTADO = 'APROBADO' THEN 1 ELSE 0 END) >= 2 THEN 'APROBADO'
        ELSE 'PENDIENTE'
      END AS ESTADO
    FROM Informes_Componentes I
    LEFT JOIN Aprobaciones_Informe A ON A.ID_INFORME = I.ID
    WHERE 1=1
  `;
  const params = {};

  if (usuario) {
    query += ' AND I.USUARIO LIKE @usuario';
    params.usuario = { type: sql.NVarChar, value: `%${usuario}%` };
  }
  if (fecha) {
    query += ' AND CONVERT(date, I.FECHA) = @fecha';
    params.fecha = { type: sql.Date, value: fecha };
  }
  if (tecnico) {
    query += ' AND I.TECNICO LIKE @tecnico';
    params.tecnico = { type: sql.NVarChar, value: `%${tecnico}%` };
  }
  if (numeroRequerimiento) {
    query += ' AND I.NUM_REQUERIMIENTO LIKE @numRequerimiento';
    params.numRequerimiento = { type: sql.NVarChar, value: `%${numeroRequerimiento}%` };
  }

  query += `
    GROUP BY 
      I.ID, 
      I.NOMBRE, 
      I.FECHA, 
      I.USUARIO, 
      I.TECNICO, 
      I.NUM_REQUERIMIENTO
    ORDER BY I.FECHA DESC
  `;

  try {
    const resultados = await ejecutarConsulta(query, params);
    res.json(resultados);
  } catch (error) {
    console.error('Error al obtener informes:', error);
    res.status(500).json({ error: 'Error al obtener informes' });
  }
};

