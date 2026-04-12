import { Resend } from 'resend';

// Usamos la llave que guardamos en el .env
const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendResetEmail(email, code) {
  try {
    await resend.emails.send({
      from: 'Soporte <onboarding@resend.dev>',
      to: [email],
      subject: 'Tu código de recuperación',
      html: `
        <div style="font-family: sans-serif; text-align: center; border: 1px solid #eee; padding: 20px;">
          <h2>Código de Verificación</h2>
          <p>Tu código para restablecer la contraseña es:</p>
          <h1 style="letter-spacing: 5px; color: #000; font-size: 40px;">${code}</h1>
          <p>Este código expira en 15 minutos.</p>
        </div>
      `,
    });
  } catch (error) {
    throw new Error("Error al enviar el email");
  }
}