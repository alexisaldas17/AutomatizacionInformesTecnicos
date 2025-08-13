const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario, cambiarPassword, enviarCorreoInforme } = require('../controllers/auth.controller');

router.post('/registro', registrarUsuario);
router.post('/login', loginUsuario);
router.post('/cambiar-password', cambiarPassword);
router.post('/enviar-correo', enviarCorreoInforme);

module.exports = router;
