const express = require('express');
const router = express.Router();
const { obtenerUsuarios, obtenerUsuarioPorNombre  } = require('../controllers/usuarios.controller');

router.get('/', obtenerUsuarios);
router.get('/detalle', obtenerUsuarioPorNombre);



module.exports = router;
