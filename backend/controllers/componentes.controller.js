const { ejecutarConsulta } = require('../services/db');
const sql = require('mssql');
const obtenerComponentes = async (req, res) => {
    try {
        const query = 'SELECT * FROM Componentes';
        const resultados = await ejecutarConsulta(query);
        res.json(resultados);
    } catch (error) {
        console.error('Error al obtener componentes:', error);
        res.status(500).json({ error: 'Error al obtener componentes' });
    }
};
const agregarComponente = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const query = 'INSERT INTO Componentes (Nombre, Descripcion) VALUES (?, ?)';
        await ejecutarConsulta(query, [nombre, descripcion]);
        res.status(201).json({ message: 'Componente agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar componente:', error);
        res.status(500).json({ error: 'Error al agregar componente' });
    }
};
const obtenerTiposComponentes = async (req, res) => {
    try {
        const query = 'SELECT * FROM Tipo_Componentes';
        const resultados = await ejecutarConsulta(query);
        res.json(resultados);
    } catch (error) {
        console.error('Error al obtener tipos de componentes:', error);
        res.status(500).json({ error: 'Error al obtener tipos de componentes' });
    }
};

const obtenerDatosComponentes = async (req, res) => {
    try {
        const query = `
            SELECT 
                tc.TIPO_COMPONENTE AS tipo_componente,
                c.MARCA AS marca,
                c.MODELO AS modelo
            FROM Componentes c
            INNER JOIN Tipo_Componentes tc ON c.ID_TIPO_COMPONENTE = tc.ID
        `;
        const resultados = await ejecutarConsulta(query);
        res.json(resultados);
    } catch (error) {
        console.error('Error al obtener datos de componentes:', error);
        res.status(500).json({ error: 'Error al obtener datos de componentes' });
    }
};

const verificarREQ = async (req, res) => {
  const { requerimiento } = req.query;

  if (!requerimiento) {
    return res.status(400).json({ error: 'Número de requerimiento no proporcionado' });
  }

  try {
    const query = `
      SELECT ID FROM Informes_Componentes WHERE NUM_REQUERIMIENTO = @requerimiento
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

const actualizarPDF = async (req, res) => {
  const { id } = req.params;
  const {
    nombreArchivo,
    pdf,
    firma,
    usuario,
    departamento,
    email,
    empresa,
    cargo,
    tecnico,
    agencia,
    modelo,
    marca,
    numSerie,
    codigoBarras,
    comentario,
    imagenes,
    tipoComponente
  } = req.body;

  if (!nombreArchivo || !pdf || !firma || !id) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  try {
    const pdfBuffer = Buffer.from(pdf, 'base64');
    const firmaBuffer = Buffer.from(firma.split(',')[1], 'base64');

    const updateQuery = `
      UPDATE Informes_Componentes   SET
        NOMBRE = @nombre,
        ARCHIVO = @archivo,
        FIRMA = @firma,
        FECHA = GETDATE(),
        USUARIO = @usuario,
        AREA = @departamento,
        MAIL = @email,
        EMPRESA = @empresa,
        CARGO = @cargo,
        TECNICO = @tecnico,
        AGENCIA = @agencia,
        MODELO = @modelo,
        MARCA = @marca,
        NUM_SERIE = @numSerie,
        CODIGO_BARRAS = @codigoBarras,
        COMENTARIO = @comentario,
        TIPO_COMPONENTE = @tipoComponente
      WHERE ID = @id
    `;

    const params = {
      id: { type: sql.Int, value: parseInt(id) },
      nombre: { type: sql.NVarChar, value: nombreArchivo },
      archivo: { type: sql.VarBinary(sql.MAX), value: pdfBuffer },
      firma: { type: sql.VarBinary(sql.MAX), value: firmaBuffer },
      usuario: { type: sql.NVarChar, value: usuario || '' },
      departamento: { type: sql.NVarChar, value: departamento || '' },
      email: { type: sql.NVarChar, value: email || '' },
      empresa: { type: sql.NVarChar, value: empresa || '' },
      cargo: { type: sql.NVarChar, value: cargo || '' },
      tecnico: { type: sql.NVarChar, value: tecnico || '' },
      agencia: { type: sql.NVarChar, value: agencia || '' },
      modelo: { type: sql.NVarChar, value: modelo || '' },
      marca: { type: sql.NVarChar, value: marca || '' },
      numSerie: { type: sql.NVarChar, value: numSerie || '' },
      codigoBarras: { type: sql.NVarChar, value: codigoBarras || '' },
      comentario: { type: sql.NVarChar(sql.MAX), value: comentario || '' },
      tipoComponente: { type: sql.NVarChar, value: tipoComponente || '' }
    };

    await ejecutarConsulta(updateQuery, params);

    // Eliminar imágenes anteriores
    await ejecutarConsulta(`DELETE FROM Imagenes_Componentes WHERE ID_INFORME = @id`, {
      id: { type: sql.Int, value: parseInt(id) }
    });

    // Insertar nuevas imágenes
    if (imagenes && Array.isArray(imagenes)) {
      for (const [index, imagen] of imagenes.entries()) {
        const base64Data = imagen.url.split(',')[1];
        const imagenBuffer = Buffer.from(base64Data, 'base64');

        const insertImagenQuery = `
          INSERT INTO Imagenes_Componentes (ID_INFORME, IMAGEN, ORDEN)
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
const guardarPDF_Componentes = async (req, res) => {
  const {
    nombreArchivo,
    pdf,
    firma,
    usuario,
    departamento,
    email,
    empresa,
    cargo,
    tecnico,
    requerimiento,
    agencia,
    modelo,
    marca,
    numSerie,
    codigoBarras,
    comentario,
    imagenes,
    tipoComponente
  } = req.body;
  console.log("Datos recibidos:", req.body);
  if (!nombreArchivo || !pdf || !firma || !requerimiento) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  try {
    const pdfBuffer = Buffer.from(pdf, 'base64');
    const firmaBuffer = Buffer.from(firma.split(',')[1], 'base64');

    // Verificar si ya existe un informe con ese número de requerimiento
    const checkQuery = `
      SELECT ID FROM Informes_Componentes WHERE NUM_REQUERIMIENTO = @requerimiento
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
      INSERT INTO Informes_Componentes (
        NOMBRE, ARCHIVO, FIRMA, FECHA, USUARIO, AREA, MAIL, EMPRESA, CARGO, TECNICO,
        NUM_REQUERIMIENTO, AGENCIA, MODELO, MARCA, NUM_SERIE,
       CODIGO_BARRAS, COMENTARIO, TIPO_COMPONENTE
      )
      OUTPUT inserted.ID
      VALUES (
        @nombre, @archivo, @firma, GETDATE(), @usuario, @departamento, @email, @empresa, @cargo, @tecnico,
        @requerimiento, @agencia, @modelo, @marca, @numSerie,
        @codigoBarras, @comentario, @tipoComponente
      )
    `;

    const params = {
      nombre: { type: sql.NVarChar, value: nombreArchivo },
      archivo: { type: sql.VarBinary(sql.MAX), value: pdfBuffer },
      firma: { type: sql.VarBinary(sql.MAX), value: firmaBuffer },
      usuario: { type: sql.NVarChar, value: usuario || '' },
      departamento: { type: sql.NVarChar, value: departamento || '' },
      email: { type: sql.NVarChar, value: email || '' },
      empresa: { type: sql.NVarChar, value: empresa || '' },
      cargo: { type: sql.NVarChar, value: cargo || '' },
      tecnico: { type: sql.NVarChar, value: tecnico || '' },
      requerimiento: { type: sql.NVarChar, value: requerimiento || '' },
      agencia: { type: sql.NVarChar, value: agencia || '' },
      modelo: { type: sql.NVarChar, value: modelo || '' },
      marca: { type: sql.NVarChar, value: marca || '' },
      numSerie: { type: sql.NVarChar, value: numSerie || '' },
      codigoBarras: { type: sql.NVarChar, value: codigoBarras || '' },
      comentario: { type: sql.NVarChar(sql.MAX), value: comentario || '' },
      tipoComponente: { type: sql.NVarChar, value: tipoComponente || '' }
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
            INSERT INTO Imagenes_Componentes (ID_INFORME, IMAGEN, ORDEN)
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

module.exports = {
    obtenerComponentes,
    agregarComponente,
    obtenerTiposComponentes,
    obtenerDatosComponentes,
    verificarREQ,
    actualizarPDF,
    guardarPDF_Componentes
};
