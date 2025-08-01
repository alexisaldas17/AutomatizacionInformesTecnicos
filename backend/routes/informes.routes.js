const express = require('express');
const router = express.Router();
const { crearInforme } = require('../controllers/informes.controller');

router.post('/', crearInforme);

module.exports = router;
