const express = require('express');
const router = express.Router();
const { obtenerTecnicos } = require('../controllers/tecnicos.controller');

router.get('/', obtenerTecnicos);

module.exports = router;
