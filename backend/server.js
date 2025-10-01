=== backend/server.js ===
/**
 * backend/server.js
 *
 * Servidor Express que:
 *  - Sirve los archivos estáticos del frontend (../frontend).
 *  - Expone POST /api/apply que recibe la solicitud y envía 2 correos:
 *      1) al solicitante (confirmación)
 *      2) a la administración (soelucas515@gmail.com)
 *
 * Configuración vía .env:
 *  - SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false), SMTP_USER, SMTP_PASS
 *  - FROM_EMAIL  (opcional; por defecto SMTP_USER)
 *  - ADMIN_EMAIL (por defecto soelucas515@gmail.com)
 *  - PORT (opcional)
 *
 * NOTA EDUCATIVA:
 *  - Nunca confíes sólo en la validación del cliente: el servidor vuelve a validar.
 *  - En producción usa HTTPS y credenciales seguras.
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());

// Servir frontend estático (ajusta si tu estructura difiere)
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Configuración del transporte SMTP con variables de entorno
const smtpHost = process.env.SMTP_HOST || '';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = (process.env.SMTP_SECURE === 'true'); // true si usa 465
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
});

// Verificamos al arrancar (para detectar problemas temprano)
transporter.verify()
  .then(() => console.log('SMTP verificado ✅'))
  .catch((err) => console.warn('Advertencia SMTP: ', err && err.message ? err.message : err));

// Endpoint para recibir aplicaciones
app.post('/api/apply', async (req, res) => {
  try {
    const { nombre, edad, nacionalidad, razon, email } = req.body || {};

    // Validación básica
    if (!nombre || !email) return res.status(400).json({ error: 'Nombre y email son requeridos.' });

    const edadNum = Number(edad);
    if (!edadNum || isNaN(edadNum) || edadNum <= 0) return res.status(400).json({ error: 'Edad inválida.' });
    if (edadNum < 18) return res.status(400).json({ error: 'Menor de edad. No aplica.' });
    if (!nacionalidad || String(nacionalidad).trim().toLowerCase() !== 'colombiano') {
      return res.status(400).json({ error: 'Solo colombianos pueden aplicar.' });
    }

    // Mensajes
    const from = process.env.FROM_EMAIL || smtpUser || 'no-reply@example.com';
    const adminEmail = process.env.ADMIN_EMAIL || 'soelucas515@gmail.com';

    // Correo al solicitante
    const mailToApplicant = {
      from,
      to: email,
      subject: `Confirmación de recepción — ${nombre}`,
      text: `Hola ${nombre},\n\nHemos recibido tu solicitud. Gracias por aplicar.\n\nResumen:\n- Edad: ${edad}\n- Nacionalidad: ${nacionalidad}\n- Motivo: ${razon}\n\nTe contactaremos pronto por este email.\n\n— Equipo`
    };

    // Correo a admin
    const mailToAdmin = {
      from,
      to: adminEmail,
      subject: `Nueva solicitud: ${nombre}`,
      text: `Nueva solicitud recibida:\n\nNombre: ${nombre}\nEmail: ${email}\nEdad: ${edad}\nNacionalidad: ${nacionalidad}\nRazón: ${razon}\n\nRevisa y da seguimiento.`
    };

    // Enviar ambos correos (sequencialmente para manejo de errores simple)
    await transporter.sendMail(mailToApplicant);
    await transporter.sendMail(mailToAdmin);

    return res.json({ ok: true, message: 'Correos enviados' });
  } catch (err) {
    console.error('Error /api/apply:', err);
    return res.status(500).json({ error: 'No se pudo procesar la solicitud.' });
  }
});

// Fallback: si quieres soportar SPA routing podrías devolver index.html aquí.
// Iniciamos servidor
app.listen(PORT, () => console.log(`Servidor backend escuchando en http://localhost:${PORT}`));