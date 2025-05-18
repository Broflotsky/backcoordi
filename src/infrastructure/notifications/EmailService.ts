import nodemailer from 'nodemailer';
import { IEmailService } from '@domain/notifications/IEmailService';
export class EmailService implements IEmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '',
      },
    });
  }

  async sendShipmentCreationNotification(userEmail: string, trackingCode: string, recipientName: string): Promise<void> {
    try {
      const subject = `✅ Envío creado exitosamente - Código de seguimiento: ${trackingCode}`;
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #333333;">¡Tu envío ha sido creado con éxito!</h2>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Código de seguimiento:</strong> <span style="color: #007bff;">${trackingCode}</span></p>
            <p style="margin: 5px 0;"><strong>Destinatario:</strong> ${recipientName}</p>
            <p style="margin: 5px 0;"><strong>Estado actual:</strong> En espera</p>
          </div>
          
          <p>Puedes hacer seguimiento de tu envío en cualquier momento ingresando a nuestra plataforma con tu código de seguimiento.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visita nuestra web</a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e4; font-size: 12px; color: #777777;">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'notificaciones@coordinadora.com',
        to: userEmail,
        subject,
        html: htmlContent,
      });

      console.log(`Notificación de envío enviada a ${userEmail} para el envío ${trackingCode}`);
    } catch (error) {
      console.error('Error al enviar notificación de envío:', error);
    }
  }
}
