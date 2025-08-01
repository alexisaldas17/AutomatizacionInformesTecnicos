const express = require('express');
const router = express.Router();
const {
  recuperarPassword,
  restablecerPassword,
  solicitarCodigo,
  restablecerConCodigo
} = require('../controllers/authRecovery.controller');

router.post('/recuperar-password', recuperarPassword);
router.post('/restablecer-password', restablecerPassword);
router.post('/restablecer-con-codigo', restablecerConCodigo);
router.post('/solicitar-codigo', solicitarCodigo);
module.exports = router;
