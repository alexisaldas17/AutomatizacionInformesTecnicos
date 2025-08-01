const sql = require('mssql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { ejecutarConsulta } = require('../services/db');

exports.recuperarPassword = async (req, res) => {
  const { correo } = req.body;

  if (!correo) {
    return res.status(400).json({ error: 'El correo es obligatorio' });
  }

  try {
    const query = 'SELECT * FROM Autenticacion WHERE CORREO = @correo';
    const result = await ejecutarConsulta(query, {
      correo: { type: sql.NVarChar, value: correo }
    });

    const usuario = result[0];
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const token = jwt.sign({ correo }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '********' : 'No definida');

    const transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
      ,
      tls: {
        ciphers: 'SSLv3'
      }
    });

    const resetLink = `http://172.20.70.113:3000/restablecer-password?token=${token}`;
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Credenciales de Outlook no definidas correctamente');
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: correo,
      subject: 'Recuperación de contraseña',
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p><a href="${resetLink}">${resetLink}</a>`
    });

    res.json({ success: true, message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({ error: 'Error al enviar correo de recuperación' });
  }
};

exports.restablecerPassword = async (req, res) => {
  const { token, nuevaPassword } = req.body;

  if (!token || !nuevaPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const correo = decoded.correo;

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    const updateQuery = 'UPDATE Autenticacion SET PASSWORD = @password WHERE CORREO = @correo';
    await ejecutarConsulta(updateQuery, {
      password: { type: sql.NVarChar, value: hashedPassword },
      correo: { type: sql.NVarChar, value: correo }
    });

    res.json({ success: true, message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ error: 'Token inválido o expirado' });
  }
};

const generarCodigo = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.solicitarCodigo = async (req, res) => {
  const { correo } = req.body;
  const codigo = generarCodigo();
  const expira = new Date(Date.now() + 10 * 60000); // 10 minutos

  const query = `
    DELETE FROM RecuperacionPassword WHERE CORREO = @correo;
    INSERT INTO RecuperacionPassword (CORREO, CODIGO, EXPIRA)
    VALUES (@correo, @codigo, @expira);
  `;

  await ejecutarConsulta(query, {
    correo: { type: sql.NVarChar, value: correo },
    codigo: { type: sql.NVarChar, value: codigo },
    expira: { type: sql.DateTime, value: expira }
  });

  res.json({ success: true, codigo }); // Puedes ocultarlo si lo enviarás por otro canal
};

exports.restablecerConCodigo = async (req, res) => {
  const { correo, codigo, nuevaPassword } = req.body;

  const query = `
    SELECT * FROM RecuperacionPassword
    WHERE CORREO = @correo AND CODIGO = @codigo AND EXPIRA > GETDATE();
  `;

  const result = await ejecutarConsulta(query, {
    correo: { type: sql.NVarChar, value: correo },
    codigo: { type: sql.NVarChar, value: codigo }
  });

  if (result.length === 0) {
    return res.status(400).json({ error: 'Código inválido o expirado' });
  }

  const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

  await ejecutarConsulta(
    'UPDATE Autenticacion SET PASSWORD = @password WHERE CORREO = @correo',
    {
      password: { type: sql.NVarChar, value: hashedPassword },
      correo: { type: sql.NVarChar, value: correo }
    }
  );

  await ejecutarConsulta('DELETE FROM RecuperacionPassword WHERE CORREO = @correo', {
    correo: { type: sql.NVarChar, value: correo }
  });

  res.json({ success: true, message: 'Contraseña actualizada correctamente' });
};
