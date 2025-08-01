const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

// Ahora acepta parámetros opcionales
const ejecutarConsulta = async (query, params = {}) => {
  try {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    for (const key in params) {
      const param = params[key];
      if (typeof param === 'object' && param.type && param.value !== undefined) {
        request.input(key, param.type, param.value);
      } else {
        request.input(key, param); // para consultas simples
      }
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('Error en la consulta SQL:', err);
    return [];
  }
};


module.exports = { ejecutarConsulta };
