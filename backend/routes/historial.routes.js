const express = require('express');
const router = express.Router();
const { obtenerInformes } = require('../controllers/historial.controller');

/* router.get('/historial', obtenerHistorialInformes); */
router.get('/', obtenerInformes);


module.exports = router;
