const express = require('express');
const router = express.Router();

const {estadoAprobacion,obtenerAprobacionesPorTecnico, obtenerInformesPendientes,aprobarInforme, enviarParaAprobacion, obtenerAprobadores} = require('../controllers/aprobaciones.controller');


router.get('/pendientes', obtenerInformesPendientes);
router.post('/aprobar', aprobarInforme);
router.get('/estado/:idInforme', estadoAprobacion);
router.post('/enviar-aprobacion', enviarParaAprobacion);
router.get('/aprobadores', obtenerAprobadores);
router.get('/por-tecnico/:idTecnico', obtenerAprobacionesPorTecnico);
module.exports = router;