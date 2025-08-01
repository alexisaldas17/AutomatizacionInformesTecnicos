const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, cambiarPassword } = require('../controllers/auth.controller');

router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/cambiar-password', cambiarPassword);

module.exports = router;
