// pdf.routes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // Almacena archivos en memoria

const {
  enviarYGuardarPDF,
  guardarSoloPDF,actualizarPDF,
  guardarPDF,verificarRequerimiento, verPDF,
  obtenerPDFporID,
  verPDF_Partes} = require('../controllers/pdf.controller');

// Ruta principal para recibir el PDF, enviarlo por correo y guardarlo en la base de datos
router.post('/enviar-correo', upload.single('archivo'), enviarYGuardarPDF);
router.post('/guardar', upload.single('archivo'), guardarPDF);
router.get('/verificar-requerimiento', verificarRequerimiento);
router.get('/ver/:nombreArchivo', verPDF);
router.get('/verPDF_Partes/:nombreArchivo', verPDF_Partes);
router.put('/actualizar/:id', actualizarPDF);
router.get('/obtener/:idInforme', obtenerPDFporID);

module.exports = router;
