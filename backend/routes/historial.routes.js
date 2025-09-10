const express = require('express');
const router = express.Router();
const { obtenerInformes, obtenerInformesPartes } = require('../controllers/historial.controller');

/* router.get('/historial', obtenerHistorialInformes); */
router.get('/', obtenerInformes);
router.get('/partes', obtenerInformesPartes);


module.exports = router;
