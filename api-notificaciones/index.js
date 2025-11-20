const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.json());

// Ruta para enviar notificación
app.post('/notificar', async (req, res) => {
  const { nombre, mensaje, tipo } = req.body;

  // Validar que los campos coincidan con el esquema JSON
  if (typeof nombre !== 'string' || typeof mensaje !== 'string' || typeof tipo !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'El cuerpo debe contener nombre, mensaje y tipo como cadenas de texto.'
    });
  }

  // URL de tu flujo de Power Automate
  const powerAutomateUrl = 'https://tu-url-de-flujo'; // Reemplaza con tu URL real

  try {
    const response = await axios.post(powerAutomateUrl, {
      nombre,
      mensaje,
      tipo
    });

    res.status(200).json({ success: true, status: response.status });
  } catch (error) {
    console.error('Error al enviar a Power Automate:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});