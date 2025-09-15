import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Debug: Verificar variables de entorno (comentado para producción)
// console.log('EMAIL_USER:', process.env.EMAIL_USER);
// console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configurado***' : 'NO CONFIGURADO');

export async function POST({ request }) {
  try {
    const { nombre, email, consulta } = await request.json();
    
    // Validar campos requeridos
    if (!nombre || !email || !consulta) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son requeridos' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Formato de email inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Configurar transporter de nodemailer
    // Nota: Necesitarás configurar las variables de entorno para el email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER || 'tu-email@gmail.com',
        pass: process.env.EMAIL_PASS?.replace(/\s/g, '') || 'tu-app-password' // Remover espacios de la App Password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Configurar el email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tu-email@gmail.com',
      to: 'francobusch130@gmail.com',
      subject: `Nueva consulta de ${nombre} - Save The Date`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #8B5CF6; text-align: center; margin-bottom: 30px;">Nueva Consulta - Save The Date</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Información del Cliente:</h3>
            <p><strong>Nombre:</strong> ${nombre}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Consulta/Idea:</h3>
            <p style="line-height: 1.6; color: #555;">${consulta.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">Este mensaje fue enviado desde el formulario de contacto de Save The Date</p>
            <p style="color: #666; font-size: 14px;">Fecha: ${new Date().toLocaleString('es-ES')}</p>
          </div>
        </div>
      `,
      text: `
        Nueva Consulta - Portal Invitación
        
        Nombre: ${nombre}
        Email: ${email}
        
        Consulta/Idea:
        ${consulta}
        
        Fecha: ${new Date().toLocaleString('es-ES')}
      `
    };
    
    // Enviar el email
    await transporter.sendMail(mailOptions);
    
    return new Response(
      JSON.stringify({ message: 'Email enviado correctamente' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error al enviar email:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}