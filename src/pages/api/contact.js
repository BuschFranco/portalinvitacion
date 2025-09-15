import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Debug: Verificar variables de entorno (comentado para producción)
// console.log('EMAIL_USER:', process.env.EMAIL_USER);
// console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configurado***' : 'NO CONFIGURADO');

// Traducciones para mensajes de error y email
const translations = {
  es: {
    requiredFields: 'Todos los campos son requeridos',
    invalidEmail: 'Formato de email inválido',
    serverError: 'Error interno del servidor',
    emailSubject: 'Nueva consulta de {nombre} - Save The Date',
    emailTitle: 'Nueva Consulta - Save The Date',
    clientInfo: 'Información del Cliente:',
    name: 'Nombre:',
    email: 'Email:',
    inquiry: 'Consulta/Idea:',
    footerText: 'Este mensaje fue enviado desde el formulario de contacto de Save The Date',
    date: 'Fecha:',
    successMessage: 'Email enviado correctamente'
  },
  en: {
    requiredFields: 'All fields are required',
    invalidEmail: 'Invalid email format',
    serverError: 'Internal server error',
    emailSubject: 'New inquiry from {nombre} - Save The Date',
    emailTitle: 'New Inquiry - Save The Date',
    clientInfo: 'Client Information:',
    name: 'Name:',
    email: 'Email:',
    inquiry: 'Inquiry/Idea:',
    footerText: 'This message was sent from the Save The Date contact form',
    date: 'Date:',
    successMessage: 'Email sent successfully'
  },
  pt: {
    requiredFields: 'Todos os campos são obrigatórios',
    invalidEmail: 'Formato de email inválido',
    serverError: 'Erro interno do servidor',
    emailSubject: 'Nova consulta de {nombre} - Save The Date',
    emailTitle: 'Nova Consulta - Save The Date',
    clientInfo: 'Informações do Cliente:',
    name: 'Nome:',
    email: 'Email:',
    inquiry: 'Consulta/Ideia:',
    footerText: 'Esta mensagem foi enviada do formulário de contato do Save The Date',
    date: 'Data:',
    successMessage: 'Email enviado com sucesso'
  }
};

export async function POST({ request }) {
  try {
    const { nombre, email, consulta, language = 'es' } = await request.json();
    
    // Obtener traducciones para el idioma actual
    const t = translations[language] || translations['es'];
    
    // Validar campos requeridos
    if (!nombre || !email || !consulta) {
      return new Response(
        JSON.stringify({ error: t.requiredFields }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: t.invalidEmail }),
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
      subject: t.emailSubject.replace('{nombre}', nombre),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #8B5CF6; text-align: center; margin-bottom: 30px;">${t.emailTitle}</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">${t.clientInfo}</h3>
            <p><strong>${t.name}</strong> ${nombre}</p>
            <p><strong>${t.email}</strong> ${email}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">${t.inquiry}</h3>
            <p style="line-height: 1.6; color: #555;">${consulta.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">${t.footerText}</p>
            <p style="color: #666; font-size: 14px;">${t.date} ${new Date().toLocaleString(language === 'es' ? 'es-ES' : language === 'pt' ? 'pt-BR' : 'en-US')}</p>
          </div>
        </div>
      `,
      text: `
        ${t.emailTitle}
        
        ${t.name} ${nombre}
        ${t.email} ${email}
        
        ${t.inquiry}
        ${consulta}
        
        ${t.date} ${new Date().toLocaleString(language === 'es' ? 'es-ES' : language === 'pt' ? 'pt-BR' : 'en-US')}
      `
    };
    
    // Enviar el email
    await transporter.sendMail(mailOptions);
    
    return new Response(
      JSON.stringify({ message: t.successMessage }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error al enviar email:', error);
    const t = translations[language] || translations['es'];
    return new Response(
      JSON.stringify({ error: t.serverError }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}