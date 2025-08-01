const nodemailer = require('nodemailer');
const sql = require('mssql');
const { ejecutarConsulta } = require('../services/db');

// Guardar PDF en SQL Server usando ejecutarConsulta
/* exports.guardarPDF = async (nombreArchivo, buffer) => {
    try {
        const query = `
      INSERT INTO Informes_PDF (NOMBRE, ARCHIVO, FECHA)
      OUTPUT INSERTED.ID
      VALUES (@nombre, @archivo, GETDATE())
    `;

        const params = {
            nombre: { type: sql.NVarChar, value: nombreArchivo },
            archivo: { type: sql.VarBinary(sql.MAX), value: buffer }
        };

        const result = await ejecutarConsulta(query, params);
        return result[0]?.ID;
    } catch (err) {
        console.error('Error al guardar PDF en SQL Server:', err);
        throw err;
    }
}; */

// Enviar PDF por correo usando Outlook
exports.enviarCorreoPDF = async (correo, nombreArchivo, buffer) => {
  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: correo,
    subject: 'Informe Técnico',
    text: 'Adjunto el informe técnico solicitado.',
    attachments: [
      {
        filename: nombreArchivo,
        content: buffer,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

// Controlador para enviar y guardar PDF
exports.enviarYGuardarPDF = async (req, res) => {
  try {
    const { correo, nombreArchivo } = req.body;
    const archivo = req.file;

    if (!correo || !archivo) {
      return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' });
    }

    const buffer = archivo.buffer;
    const idInsertado = await exports.guardarPDF(nombreArchivo, buffer);
    await exports.enviarCorreoPDF(correo, nombreArchivo, buffer);

    res.json({ success: true, id: idInsertado });
  } catch (error) {
    console.error('Error al enviar o guardar PDF:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Nuevo controlador: solo guardar PDF
exports.guardarSoloPDF = async (req, res) => {
  try {
    const { nombreArchivo } = req.body;
    const archivo = req.file;

    if (!archivo || !nombreArchivo) {
      return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' });
    }

    const buffer = archivo.buffer;
    const idInsertado = await exports.guardarPDF(nombreArchivo, buffer);

    res.json({ success: true, id: idInsertado });
  } catch (error) {
    console.error('Error al guardar PDF:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.verificarRequerimiento = async (req, res) => {
  const { requerimiento } = req.query;

  if (!requerimiento) {
    return res.status(400).json({ error: 'Número de requerimiento no proporcionado' });
  }

  try {
    const query = `
      SELECT ID FROM Informes_PDF WHERE NUM_REQUERIMIENTO = @requerimiento
    `;

    const params = {
      requerimiento: { type: sql.NVarChar, value: requerimiento }
    };

    const result = await ejecutarConsulta(query, params);

    if (result.length > 0) {
      return res.json({ existe: true, id: result[0].ID });
    } else {
      return res.json({ existe: false });
    }
  } catch (error) {
    console.error('Error al verificar requerimiento:', error);
    res.status(500).json({ error: 'Error al verificar requerimiento' });
  }
};


exports.verPDF = async (req, res) => {
  const { nombreArchivo } = req.params;

  if (!nombreArchivo) {
    return res.status(400).json({ error: 'Nombre de archivo no proporcionado' });
  }

  try {
    const query = `
      SELECT ARCHIVO, NOMBRE
      FROM Informes_PDF
      WHERE NOMBRE = @nombre
    `;

    const params = {
      nombre: { type: sql.NVarChar, value: nombreArchivo }
    };

    const resultado = await ejecutarConsulta(query, params);

    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const archivo = resultado[0].ARCHIVO;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${nombreArchivo}"`);
    res.send(archivo);
  } catch (error) {
    console.error('Error al recuperar el PDF:', error);
    res.status(500).json({ error: 'Error al recuperar el PDF' });
  }
};

exports.guardarPDF = async (req, res) => {
  const {
    nombreArchivo,
    pdf,
    firma,
    usuario,
    area,
    email,
    empresa,
    cargo,
    tecnico,
    requerimiento,
    equipo,
    agencia,
    modelo,
    marca,
    ipEquipo,
    numSerie,
    direccionMAC,
    codigoBarras,
    discoDuro,
    espacioLibre,
    memoriaRAM,
    procesador,
    velocidad,
    sistemaOperativo,
    comentario,
    imagenes
  } = req.body;

  if (!nombreArchivo || !pdf || !firma || !requerimiento) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  try {
    const pdfBuffer = Buffer.from(pdf, 'base64');
    const firmaBuffer = Buffer.from(firma.split(',')[1], 'base64');

    // Verificar si ya existe un informe con ese número de requerimiento
    const checkQuery = `
      SELECT ID FROM Informes_PDF WHERE NUM_REQUERIMIENTO = @requerimiento
    `;
    const checkResult = await ejecutarConsulta(checkQuery, {
      requerimiento: { type: sql.NVarChar, value: requerimiento }
    });

    if (checkResult.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un informe para este número de requerimiento.',
        id: checkResult[0].ID
      });
    }

    // Insertar nuevo informe
    const insertQuery = `
      INSERT INTO Informes_PDF (
        NOMBRE, ARCHIVO, FIRMA, FECHA, USUARIO, AREA, EMAIL, EMPRESA, CARGO, TECNICO,
        NUM_REQUERIMIENTO, NOMBRE_EQUIPO, AGENCIA, MODELO, MARCA, IP_EQUIPO, NUMERO_SERIE,
        DIRECCION_MAC, CODIGO_BARRAS, DISCO_DURO, ESPACIO_LIBRE, MEMORIA_RAM, PROCESADOR,
        VELOCIDAD, SO, COMENTARIO
      )
      OUTPUT inserted.ID
      VALUES (
        @nombre, @archivo, @firma, GETDATE(), @usuario, @area, @email, @empresa, @cargo, @tecnico,
        @requerimiento, @equipo, @agencia, @modelo, @marca, @ipEquipo, @numSerie,
        @direccionMAC, @codigoBarras, @discoDuro, @espacioLibre, @memoriaRAM, @procesador,
        @velocidad, @so, @comentario
      )
    `;

    const params = {
      nombre: { type: sql.NVarChar, value: nombreArchivo },
      archivo: { type: sql.VarBinary(sql.MAX), value: pdfBuffer },
      firma: { type: sql.VarBinary(sql.MAX), value: firmaBuffer },
      usuario: { type: sql.NVarChar, value: usuario || '' },
      area: { type: sql.NVarChar, value: area || '' },
      email: { type: sql.NVarChar, value: email || '' },
      empresa: { type: sql.NVarChar, value: empresa || '' },
      cargo: { type: sql.NVarChar, value: cargo || '' },
      tecnico: { type: sql.NVarChar, value: tecnico || '' },
      requerimiento: { type: sql.NVarChar, value: requerimiento || '' },
      equipo: { type: sql.NVarChar, value: equipo || '' },
      agencia: { type: sql.NVarChar, value: agencia || '' },
      modelo: { type: sql.NVarChar, value: modelo || '' },
      marca: { type: sql.NVarChar, value: marca || '' },
      ipEquipo: { type: sql.NVarChar, value: ipEquipo || '' },
      numSerie: { type: sql.NVarChar, value: numSerie || '' },
      direccionMAC: { type: sql.NVarChar, value: direccionMAC || '' },
      codigoBarras: { type: sql.NVarChar, value: codigoBarras || '' },
      discoDuro: { type: sql.NVarChar, value: discoDuro || '' },
      espacioLibre: { type: sql.NVarChar, value: espacioLibre || '' },
      memoriaRAM: { type: sql.NVarChar, value: memoriaRAM || '' },
      procesador: { type: sql.NVarChar, value: procesador || '' },
      velocidad: { type: sql.NVarChar, value: velocidad || '' },
      so: { type: sql.NVarChar, value: sistemaOperativo || '' },
      comentario: { type: sql.NVarChar(sql.MAX), value: comentario || '' }
    };

    const result = await ejecutarConsulta(insertQuery, params);

    console.log("Resultado del INSERT:", result); // <-- Esto es clave

    const idInforme = result[0]?.ID;
    console.log(idInforme);

    // Guardar imágenes relacionadas
    if (imagenes && Array.isArray(imagenes)) {
      for (const [index, imagen] of imagenes.entries()) {
        try {
          const base64Data = imagen.url.split(',')[1];
          const imagenBuffer = Buffer.from(base64Data, 'base64');

          const insertImagenQuery = `
            INSERT INTO Imagenes (ID_INFORME, IMAGEN, ORDEN)
            VALUES (@idInforme, @imagen, @orden)
          `;

          const imagenParams = {
            idInforme: { type: sql.Int, value: idInforme },
            imagen: { type: sql.VarBinary(sql.MAX), value: imagenBuffer },
            orden: { type: sql.Int, value: index }
          };

          await ejecutarConsulta(insertImagenQuery, imagenParams);
        } catch (imgError) {
          console.error(`Error al guardar imagen ${index}:`, imgError);
        }
      }
    }

    res.json({ success: true, id: idInforme });
  } catch (error) {
    console.error('Error al guardar el informe:', error);
    res.status(500).json({ error: 'Error al guardar el informe' });
  }
};

exports.actualizarPDF = async (req, res) => {
  const { id } = req.params;
  const {
    nombreArchivo,
    pdf,
    firma,
    usuario,
    area,
    email,
    empresa,
    cargo,
    tecnico,
    equipo,
    agencia,
    modelo,
    marca,
    ipEquipo,
    numSerie,
    direccionMAC,
    codigoBarras,
    discoDuro,
    espacioLibre,
    memoriaRAM,
    procesador,
    velocidad,
    sistemaOperativo,
    comentario,
    imagenes
  } = req.body;

  if (!nombreArchivo || !pdf || !firma || !id) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  try {
    const pdfBuffer = Buffer.from(pdf, 'base64');
    const firmaBuffer = Buffer.from(firma.split(',')[1], 'base64');

    const updateQuery = `
      UPDATE Informes_PDF SET
        NOMBRE = @nombre,
        ARCHIVO = @archivo,
        FIRMA = @firma,
        FECHA = GETDATE(),
        USUARIO = @usuario,
        AREA = @area,
        EMAIL = @email,
        EMPRESA = @empresa,
        CARGO = @cargo,
        TECNICO = @tecnico,
        NOMBRE_EQUIPO = @equipo,
        AGENCIA = @agencia,
        MODELO = @modelo,
        MARCA = @marca,
        IP_EQUIPO = @ipEquipo,
        NUMERO_SERIE = @numSerie,
        DIRECCION_MAC = @direccionMAC,
        CODIGO_BARRAS = @codigoBarras,
        DISCO_DURO = @discoDuro,
        ESPACIO_LIBRE = @espacioLibre,
        MEMORIA_RAM = @memoriaRAM,
        PROCESADOR = @procesador,
        VELOCIDAD = @velocidad,
        SO = @so,
        COMENTARIO = @comentario
      WHERE ID = @id
    `;

    const params = {
      id: { type: sql.Int, value: parseInt(id) },
      nombre: { type: sql.NVarChar, value: nombreArchivo },
      archivo: { type: sql.VarBinary(sql.MAX), value: pdfBuffer },
      firma: { type: sql.VarBinary(sql.MAX), value: firmaBuffer },
      usuario: { type: sql.NVarChar, value: usuario || '' },
      area: { type: sql.NVarChar, value: area || '' },
      email: { type: sql.NVarChar, value: email || '' },
      empresa: { type: sql.NVarChar, value: empresa || '' },
      cargo: { type: sql.NVarChar, value: cargo || '' },
      tecnico: { type: sql.NVarChar, value: tecnico || '' },
      equipo: { type: sql.NVarChar, value: equipo || '' },
      agencia: { type: sql.NVarChar, value: agencia || '' },
      modelo: { type: sql.NVarChar, value: modelo || '' },
      marca: { type: sql.NVarChar, value: marca || '' },
      ipEquipo: { type: sql.NVarChar, value: ipEquipo || '' },
      numSerie: { type: sql.NVarChar, value: numSerie || '' },
      direccionMAC: { type: sql.NVarChar, value: direccionMAC || '' },
      codigoBarras: { type: sql.NVarChar, value: codigoBarras || '' },
      discoDuro: { type: sql.NVarChar, value: discoDuro || '' },
      espacioLibre: { type: sql.NVarChar, value: espacioLibre || '' },
      memoriaRAM: { type: sql.NVarChar, value: memoriaRAM || '' },
      procesador: { type: sql.NVarChar, value: procesador || '' },
      velocidad: { type: sql.NVarChar, value: velocidad || '' },
      so: { type: sql.NVarChar, value: sistemaOperativo || '' },
      comentario: { type: sql.NVarChar(sql.MAX), value: comentario || '' }
    };

    await ejecutarConsulta(updateQuery, params);

    // Eliminar imágenes anteriores
    await ejecutarConsulta(`DELETE FROM Imagenes WHERE ID_INFORME = @id`, {
      id: { type: sql.Int, value: parseInt(id) }
    });

    // Insertar nuevas imágenes
    if (imagenes && Array.isArray(imagenes)) {
      for (const [index, imagen] of imagenes.entries()) {
        const base64Data = imagen.url.split(',')[1];
        const imagenBuffer = Buffer.from(base64Data, 'base64');

        const insertImagenQuery = `
          INSERT INTO Imagenes (ID_INFORME, IMAGEN, ORDEN)
          VALUES (@idInforme, @imagen, @orden)
        `;

        const imagenParams = {
          idInforme: { type: sql.Int, value: parseInt(id) },
          imagen: { type: sql.VarBinary(sql.MAX), value: imagenBuffer },
          orden: { type: sql.Int, value: index }
        };

        await ejecutarConsulta(insertImagenQuery, imagenParams);
      }
    }

    res.json({ success: true, message: 'Informe actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el informe:', error);
    res.status(500).json({ error: 'Error al actualizar el informe' });
  }
};

exports.obtenerPDFporID = async (req, res) => {
  const { idInforme } = req.params;

  if (!idInforme) {
    return res.status(400).json({ error: 'ID de informe no proporcionado' });
  }

  try {
    const query = `
      SELECT ARCHIVO
      FROM Informes_PDF
      WHERE ID = @idInforme
    `;
    const params = {
      idInforme: { type: sql.Int, value: parseInt(idInforme) }
    };

    const resultado = await ejecutarConsulta(query, params);

    if (!resultado || resultado.length === 0) {
      return res.status(404).json({ error: 'Informe no encontrado' });
    }

    const buffer = resultado[0].ARCHIVO;
    const base64 = buffer.toString('base64');

    res.json({ pdf: base64 });
  } catch (error) {
    console.error('Error al obtener el PDF por ID:', error);
    res.status(500).json({ error: 'Error al obtener el PDF' });
  }
};
