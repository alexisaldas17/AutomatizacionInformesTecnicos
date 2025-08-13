const express = require('express');
const router = express.Router();
const { notificarTecnico } = require('../controllers/notificacionesController');

// Ruta para enviar notificación al técnico
router.post('/notificar-tecnico', notificarTecnico);

module.exports = router;
