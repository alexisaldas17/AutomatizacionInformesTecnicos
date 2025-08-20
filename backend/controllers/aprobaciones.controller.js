const { ejecutarConsulta } = require('../services/db');
const sql = require('mssql');
const axios = require('axios');

const { notificarTecnico } = require('../websocketServer'); // Ajusta la ruta según tu estructura

exports.estadoAprobacion = async (req, res) => {
  const { idInforme } = req.params;

  try {
    const query = `
      SELECT COUNT(*) AS aprobados
      FROM Aprobaciones_Informe
      WHERE ID_INFORME = @idInforme AND ESTADO = 'Aprobado'
    `;

    const result = await ejecutarConsulta(query, {
      idInforme: { type: sql.Int, value: idInforme }
    });

    const aprobado = result[0]?.aprobados >= 1;

    res.json({ aprobado });
  } catch (error) {
    console.error('Error al verificar estado de aprobación:', error);
    res.status(500).json({ error: 'Error al verificar estado' });
  }
};

exports.obtenerInformesPendientes = async (req, res) => {
  try {
    const query = `
          SELECT 
              i.ID AS idInforme,
              i.NUM_REQUERIMIENTO AS requerimiento,
              i.TECNICO AS tecnico,
              i.ARCHIVO AS rutaPdf,
              ai.ID AS idAprobacion,
              ap.ID AS idAprobador,
              ap.NOMBRE AS nombreAprobador,
              ai.ESTADO
          FROM Informes_PDF i
          INNER JOIN Aprobaciones_Informe ai ON i.ID = ai.ID_INFORME
          INNER JOIN Autenticacion ap ON ai.ID_APROBADOR = ap.ID
          WHERE ai.ESTADO = 'Pendiente'
          ORDER BY i.ID, ap.NOMBRE

    `;

    const resultados = await ejecutarConsulta(query);

    const informesMap = new Map();

    resultados.forEach(row => {
      if (!informesMap.has(row.idInforme)) {
        informesMap.set(row.idInforme, {
          id: row.idInforme,
          requerimiento: row.requerimiento,
          tecnico: row.tecnico,
          rutaPdf: row.rutaPdf,
          aprobadores: []
        });
      }

      informesMap.get(row.idInforme).aprobadores.push({
        id: row.idAprobador,
        nombre: row.nombreAprobador,
        estado: row.ESTADO
      });
    });

    const informes = Array.from(informesMap.values());

    res.json(informes);
  } catch (error) {
    console.error('Error al obtener informes pendientes:', error);
    res.status(500).json({ error: 'Error al obtener informes pendientes' });
  }
};

// GET /api/aprobaciones/por-tecnico/:idTecnico
exports.obtenerAprobacionesPorTecnico = async (req, res) => {
  const idTecnico = parseInt(req.params.idTecnico);

  try {
    const query = `
      SELECT 
        ai.ID AS idAprobacion,
        ai.ID_INFORME,
        ai.ID_APROBADOR,
        ai.ESTADO,
        ai.FECHA_SOLICITUD,
        ai.FECHA_RESPUESTA,
        ai.COMENTARIO,
        i.NUM_REQUERIMIENTO AS requerimiento,
        i.TECNICO AS nombreTecnico,
        i.ARCHIVO AS rutaPdf,
        a.NOMBRE AS nombreAprobador,
        i.USUARIO,
        i.EMAIL,
        i.NOMBRE as nombreArchivo
      FROM 
        Aprobaciones_Informe ai
      INNER JOIN 
        Informes_PDF i ON ai.ID_INFORME = i.ID
      INNER JOIN 
        Autenticacion a ON ai.ID_APROBADOR = a.ID
      WHERE 
        ai.ID_TECNICO = @idTecnico
    `;

    const resultados = await ejecutarConsulta(query, {
      idTecnico: { type: sql.Int, value: idTecnico }
    });

    const pendientes = resultados.filter(row => row.ESTADO === 'Pendiente');
    const aprobados = resultados.filter(row => row.ESTADO === 'Aprobado');

    res.json({
      pendientes,
      aprobados
    });
  } catch (error) {
    console.error('Error al obtener informes por técnico:', error);
    res.status(500).json({ error: 'Error al obtener informes por técnico' });
  }
};


exports.enviarParaAprobacion = async (req, res) => {
  const { idInforme, aprobadores, idTecnico } = req.body;

  // Función auxiliar para obtener el nombre del aprobador
  const obtenerNombreAprobador = async (idAprobador) => {
    const query = `
      SELECT NOMBRE FROM Autenticacion WHERE ID = @idAprobador
    `;
    const resultado = await ejecutarConsulta(query, {
      idAprobador: { type: sql.Int, value: idAprobador }
    });
    return resultado[0]?.NOMBRE || 'Desconocido';
  };

  try {
    for (const idAprobador of aprobadores) {
      // Verificar si ya existe la aprobación para este informe y aprobador
      const existe = await ejecutarConsulta(`
        SELECT COUNT(*) AS total FROM Aprobaciones_Informe
        WHERE ID_INFORME = @idInforme AND ID_APROBADOR = @idAprobador
      `, {
        idInforme: { type: sql.Int, value: idInforme },
        idAprobador: { type: sql.Int, value: idAprobador }
      });

      if (existe[0].total > 0) {
        const nombre = await obtenerNombreAprobador(idAprobador);
        return res.status(400).json({
          success: false,
          message: `El informe técnico ya fue enviado al aprobador ${nombre}`
        });
      }

      // Insertar nueva aprobación
      await ejecutarConsulta(`
        INSERT INTO Aprobaciones_Informe (ID_INFORME, ID_APROBADOR, ESTADO, ID_TECNICO)
        VALUES (@idInforme, @idAprobador, 'Pendiente', @idTecnico)
      `, {
        idInforme: { type: sql.Int, value: idInforme },
        idAprobador: { type: sql.Int, value: idAprobador },
        idTecnico: { type: sql.Int, value: idTecnico }
      });
    }
    const nombreArchivo = await obtenerNombreArchivo(idInforme);
    const nombreTecnico = await obtenerNombreTecnico(idInforme);
    /* await notificarTeams(nombreArchivo, nombreTecnico);  */

    res.json({ success: true, message: 'Informe enviado para aprobación.' });
  } catch (error) {
    console.error('Error al enviar informe para aprobación:', error);
    res.status(500).json({ error: 'Error al enviar informe para aprobación.' });
  }
};
exports.aprobarInforme = async (req, res) => {
  const { idInforme, idAprobador, comentario } = req.body;

  if (!idInforme || !idAprobador) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  try {
    const query = `
      UPDATE Aprobaciones_Informe
      SET ESTADO = 'Aprobado', FECHA_RESPUESTA = GETDATE(), COMENTARIO = @comentario
      WHERE ID_INFORME = @idInforme AND ID_APROBADOR = @idAprobador
    `;

    await ejecutarConsulta(query, {
      idInforme: { type: sql.Int, value: idInforme },
      idAprobador: { type: sql.Int, value: idAprobador },
      comentario: { type: sql.NVarChar, value: comentario || '' }
    });


    const datos = await ejecutarConsulta(`
      SELECT NOMBRE AS nombreArchivo, TECNICO AS nombreTecnico
      FROM Informes_PDF WHERE ID = @idInforme
    `, {
      idInforme: { type: sql.Int, value: idInforme }
    });

    const { nombreArchivo, nombreTecnico } = datos[0] || {};
    if (nombreArchivo && nombreTecnico) {
      await notificarAprobacionTeams(nombreArchivo, nombreTecnico, comentario);
    }

    res.json({ success: true, message: 'Informe aprobado correctamente' });
  } catch (error) {
    console.error('Error al aprobar informe:', error);
    res.status(500).json({ error: 'Error al aprobar informe' });
  }
};

exports.obtenerAprobadores = async (req, res) => {
  try {
    const query = `
      SELECT ID, NOMBRE, CORREO, ROL
      FROM Autenticacion
      WHERE ROL = 'Aprobador' 
    `;
    const resultado = await ejecutarConsulta(query);
    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener aprobadores:', error);
    res.status(500).json({ error: 'Error al obtener aprobadores' });
  }
};

// Función para enviar notificaciones a Microsoft Teams

async function notificarTeams(nombreArchivo, nombreTecnico) {
  const webhookUrl = 'https://bgrecuador.webhook.office.com/webhookb2/e4464fa7-bfe5-4e53-882b-4d67ef8e94cb@5403bb85-6bc3-495d-8a5e-1a61c622dd74/IncomingWebhook/c6bacac134d141cb832932783ba8a2d5/b861c152-81d8-4d1e-acfc-70b5b7cd0936/V20e489Xjwmr9Ky7_6pR-0HxUu7DKPwxfluqt8oVieTas1';

  const tarjeta = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: `📄 **${nombreArchivo}** enviado para aprobación por **${nombreTecnico}**`,
              wrap: true
            }
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "🔗 Ver informes pendientes",
              url: "http://172.20.70.113:3001/#/aprobaciones-pendientes"
            }
          ]
        }
      }
    ]
  };

  try {
    await axios.post(webhookUrl, tarjeta);
  } catch (error) {
    console.error('Error al enviar tarjeta a Teams:', error);
  }
}


// Función auxiliar para obtener el nombre del archivo
const obtenerNombreArchivo = async (idInforme) => {
  const query = `
        SELECT NOMBRE FROM Informes_PDF WHERE ID = @idInforme
    `;
  const resultado = await ejecutarConsulta(query, {
    idInforme: { type: sql.Int, value: idInforme }
  });
  return resultado[0]?.NOMBRE || 'Desconocido';
};

// Función auxiliar para obtener el nombre del técnico
const obtenerNombreTecnico = async (idInforme) => {
  const query = `
        SELECT TECNICO FROM Informes_PDF WHERE ID = @idInforme
    `;
  const resultado = await ejecutarConsulta(query, {
    idInforme: { type: sql.Int, value: idInforme }
  });
  return resultado[0]?.TECNICO || 'Desconocido';
};

async function notificarAprobacionTeams(nombreArchivo, nombreTecnico, comentario) {
  const webhookUrl = 'https://bgrecuador.webhook.office.com/webhookb2/830e2adb-66a8-4466-936f-b86871ff7dac@5403bb85-6bc3-495d-8a5e-1a61c622dd74/IncomingWebhook/b209c58352684e0583d2ae8990918f89/b861c152-81d8-4d1e-acfc-70b5b7cd0936/V2oHtuzv3ytpLcmuBnlcgnkV2zV6yO08ElBfpsa0bFLZk1';

  const fecha = new Date().toLocaleString('es-EC', {
    timeZone: 'America/Guayaquil',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const tarjeta = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: "✅ Informe técnico aprobado",
              weight: "Bolder",
              size: "Medium",
              color: "Good"
            },
            {
              type: "FactSet",
              facts: [
                { title: "Archivo:", value: nombreArchivo },
                { title: "Técnico:", value: nombreTecnico },
                { title: "Fecha:", value: fecha },
                { title: "Comentario:", value: comentario || "Sin comentarios" }
              ]
            }
          ],
          actions: [
            {
              type: "Action.OpenUrl",
              title: "🔗 Ver informe aprobado",
              url: "http://172.20.70.113:3001/#/mis-informes"
            }
          ]
        }
      }
    ]
  };

  try {
    await axios.post(webhookUrl, tarjeta);
  } catch (error) {
    console.error('Error al enviar tarjeta de aprobación a Teams:', error);
  }
}



/* const enviarCorreoAprobador = async (remitente, email, nombre, idInforme) => {
  await enviarCorreoGraph(
    remitente,
    email,
    'Nuevo informe técnico para aprobación',
    `Hola ${nombre}, tienes un nuevo informe técnico (ID: ${idInforme}) pendiente de aprobación. Accede al sistema: http://tuservidor.com/informes/${idInforme}`
  );
};
 */