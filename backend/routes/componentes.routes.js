const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // Almacena archivos en memoria

const { obtenerComponentes, 
    agregarComponente, 
    obtenerTiposComponentes, 
    obtenerDatosComponentes, 
    verificarREQ, actualizarPDF, 
    guardarPDF_Componentes
     } = require('../controllers/componentes.controller');

router.get('/', obtenerComponentes);
router.post('/', agregarComponente);
router.get('/tipos', obtenerTiposComponentes);
router.get('/datos', obtenerDatosComponentes);
router.get('/verificar', verificarREQ);
router.put('/actualizar/:id', actualizarPDF);
router.post('/guardar', upload.single('archivo'), guardarPDF_Componentes);

module.exports = router;
