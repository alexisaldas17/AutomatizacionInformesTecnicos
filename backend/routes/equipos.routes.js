const express = require('express');
const router = express.Router();
const { obtenerEquipos, obtenerEquipoPorNombre, obtenerNumeroSerieEquipo, obtenerEquipoPorUsuario  } = require('../controllers/equipos.controller');

router.get('/', obtenerEquipos);
router.get('/detalle', obtenerEquipoPorNombre);
router.get('/detalleGarantia', obtenerNumeroSerieEquipo);
router.get('/equipo-por-usuario', obtenerEquipoPorUsuario);

module.exports = router;
