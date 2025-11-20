
const axios = require('axios');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const axios = require('axios');


// Reemplaza esta URL con la del flujo de Power Automate
const powerAutomateUrl = 'https://prod-xx.westus.logic.azure.com:...';

exports.notificarTeams = async (req, res) => {
  try {
    // Datos de prueba para enviar al flujo
    const payload = {
      equipo: 'SRV-QT-01',
      estado: 'En mantenimiento',
      tecnico: 'Bryan Aldas',
      mensaje: 'Se realizó limpieza interna y cambio de pasta térmica.',
      fecha: new Date().toISOString()
    };

    // Enviar POST al flujo de Power Automate
    const response = await axios.post(powerAutomateUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    res.status(response.status).send(response.data);
  } catch (error) {
    console.error('Error al enviar al flujo:', error.message);
    res.status(500).send('Error al enviar al flujo de Power Automate');
  }
};



/* 
// Configuración de credenciales de Microsoft Graph
const tenantId = '5403bb85-6bc3-495d-8a5e-1a61c622dd74';
const clientId = 'e0582bd1-a7b0-498e-a476-f6a24ad817a1';
const clientSecret = '898b5001-e6fb-49bd-8a8b-26f6a6b72887';

async function obtenerToken() {
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('scope', 'https://graph.microsoft.com/.default');

  const response = await axios.post(url, params);
  return response.data.access_token;
}

// Función para obtener el ID del usuario técnico por correo
async function obtenerUsuarioPorCorreo(correo, token) {
  const response = await axios.get(`https://graph.microsoft.com/v1.0/users/${correo}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.id;
}

// Función para enviar mensaje al chat personal
async function enviarMensajeChatPersonal(idUsuario, token, mensaje) {
  const chatResponse = await axios.post(`https://graph.microsoft.com/v1.0/chats`, {
    chatType: "oneOnOne",
    members: [
      {
        "@odata.type": "#microsoft.graph.aadUserConversationMember",
        roles: ["owner"],
        "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${idUsuario}`
      },
      {
        "@odata.type": "#microsoft.graph.aadUserConversationMember",
        roles: ["owner"],
        "user@odata.bind": `https://graph.microsoft.com/v1.0/users/${clientId}`
      }
    ]
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const chatId = chatResponse.data.id;

  await axios.post(`https://graph.microsoft.com/v1.0/chats/${chatId}/messages`, {
    body: {
      contentType: "html",
      content: mensaje
    }
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

// Endpoint para recibir datos desde el frontend
exports.notificarTecnico = async (req, res) => {
  const { nombreTecnico, correo, mensaje } = req.body;

  if (!nombreTecnico || !correo || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const token = await obtenerToken();
    const idUsuario = await obtenerUsuarioPorCorreo(correo, token);

    const mensajeHtml = `
      ✅ Hola <b>${nombreTecnico}</b>,<br>
      ${mensaje}
    `;

    await enviarMensajeChatPersonal(idUsuario, token, mensajeHtml);

    res.json({ success: true, message: 'Mensaje enviado correctamente al técnico' });
  } catch (error) {
    console.error('Error al enviar mensaje al técnico:', error.response?.data || error.message);
    res.status(500).json({ error: 'No se pudo enviar el mensaje al técnico' });
  }
};
 */