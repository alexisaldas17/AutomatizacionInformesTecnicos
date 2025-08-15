const express = require('express');
const router = express.Router();
const { obtenerComponentes, agregarComponente, obtenerTiposComponentes } = require('../controllers/componentes.controller');
const { route } = require('./informes.routes');

router.get('/', obtenerComponentes);
router.post('/', agregarComponente);
router.get('/tipos', obtenerTiposComponentes);

module.exports = router;
