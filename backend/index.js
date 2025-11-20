const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const informesRoutes = require('./routes/informes.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const tecnicosRoutes = require('./routes/tecnicos.routes');
const equiposRoutes = require('./routes/equipos.routes');
const pdfRoutes = require('./routes/pdf.routes');
const historialRoutes = require('./routes/historial.routes');
const authRoutes = require('./routes/auth.routes');
const aprobacionesRoutes = require('./routes/aprobaciones.routes');
const authRecoveryRoutes = require('./routes/authRecovery.routes');
/* const notificacionesRoutes = require('./routes/notificaciones.routes');
 */const componentesRoutes = require('./routes/componentes.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Aumentar el límite de tamaño para JSON (por defecto es 100kb)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/informes', informesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/tecnicos', tecnicosRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/aprobaciones', aprobacionesRoutes);
app.use('/api/auth', authRoutes );
app.use('/api/authRecovery', authRecoveryRoutes);
/* app.use('/api/notificaciones', notificacionesRoutes);*/
app.use('/api/componentes', componentesRoutes);

// Iniciar servidor
app.listen(PORT, '172.20.70.113', () => {
  console.log(`Servidor escuchando en http://172.20.70.113:${PORT}`);
});

app.get('/', (req, res) => {
  res.send('API de Informes Técnicos funcionando ✅');
});
