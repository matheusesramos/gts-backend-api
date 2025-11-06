// src/services/resend.service.ts
// 🆕 NOVO - Serviço de email usando Resend (substitui Nodemailer/SMTP)
import { Resend } from "resend";
import { env } from "../config/env";
import { logger } from "../config/logger";

const resend = new Resend(env.RESEND_API_KEY);

export const resendService = {
  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${env.API_BASE_URL}/reset-password?token=${token}`;

    try {
      console.log("🔍 Tentando enviar email de recuperação...");
      console.log("Para:", email);
      console.log("De:", `Gentle Touch Star <${env.EMAIL_FROM}>`);
      console.log("Reset URL:", resetUrl);

      await resend.emails.send({
        from: `Gentle Touch Star <${env.EMAIL_FROM}>`,
        to: email,
        subject: "🔐 Password Recovery",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Recovery</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                      
                      <tr>
                        <td style="background-color: #29abe2; padding: 32px 40px; text-align: left;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Gentle Touch Star - Customer APP</h1>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 40px 40px 24px 40px;">
                          <h2 style="color: #1a1a1a; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">
                            Password recovery request
                          </h2>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          <p style="color: #333333; margin: 0; font-size: 16px; line-height: 1.5;">
                            Hi ${name},
                          </p>
                          <p style="color: #333333; margin: 16px 0 0 0; font-size: 16px; line-height: 1.5;">
                            We received a request to reset your password. Click the button below to create a new password.
                          </p>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <a href="${resetUrl}" 
                                   style="display: inline-block; padding: 16px 48px; background-color: #29abe2; color: #ffffff; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: 600;">
                                  Reset Password
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 4px;">
                            <p style="color: #6b6b6b; font-size: 14px; margin: 0 0 8px 0; line-height: 1.5;">
                              <strong>Button not working?</strong>
                            </p>
                            <p style="color: #333333; font-size: 13px; margin: 0; line-height: 1.5; word-break: break-all;">
                              Copy and paste this link into your browser:
                            </p>
                            <p style="color: #29abe2; font-size: 13px; word-break: break-all; margin: 8px 0 0 0; font-family: monospace;">
                              ${resetUrl}
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          <div style="background-color: #fffbeb; padding: 20px; border-radius: 4px; border-left: 3px solid #f59e0b;">
                            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                              <strong>⏱️ This link expires in 1 hour.</strong> For security reasons, you'll need to request a new link after that.
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0 40px 40px 40px;">
                          <p style="color: #6b6b6b; font-size: 14px; line-height: 1.6; margin: 0;">
                            If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                          </p>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="background-color: #f8f8f8; padding: 24px 40px; border-top: 1px solid #e0e0e0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="text-align: center;">
                                <p style="color: #999999; margin: 0; font-size: 12px; line-height: 1.5;">
                                  © ${new Date().getFullYear()} Gentle Touch Star. All rights reserved.
                                </p>
                                <p style="color: #cccccc; margin: 8px 0 0 0; font-size: 11px;">
                                  This is an automated notification email.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });

      console.log("✅ Email de recuperação enviado com sucesso!");
      logger.info(`Password reset email sent via Resend to: ${email}`);
    } catch (error) {
      // 🔍 ADICIONE AQUI - Melhorar o erro
      console.error("❌ Erro ao enviar email de recuperação:", error);
      logger.error(`Failed to send password reset email via Resend: ${error}`);
      throw new Error("Failed to send email");
    }
  },

  async sendBookingNotification(data: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    executionDate?: string | null;
    postcode?: string | null;
    address?: string | null;
    notes?: string | null;
    services: Array<{
      name: string;
      category: string;
      notes?: string | null;
    }>;
    bookingId: string;
    createdAt: string;
  }) {
    const executionDateFormatted = data.executionDate
      ? new Date(data.executionDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "Not specified";

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    try {
      console.log("🔍 Tentando enviar notificação de booking...");
      console.log("Para:", env.EMAIL_FROM);
      console.log("De:", `Gentle Touch Star <${env.EMAIL_FROM}>`);
      console.log("Booking ID:", data.bookingId);

      await resend.emails.send({
        from: `Gentle Touch Star <${env.EMAIL_FROM}>`,
        to: env.EMAIL_FROM,
        subject: `📅 New Booking Request`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Booking Request</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                      
                      <tr>
                        <td style="background-color: #29abe2; padding: 32px 40px; text-align: left;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Gentle Touch Star - Customer APP</h1>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 40px 40px 24px 40px;">
                          <h2 style="color: #1a1a1a; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">
                            New booking request
                          </h2>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          <p style="color: #333333; margin: 0 0 0 0; font-size: 16px; line-height: 1.5;">
                            A new booking request from Customer APP has been received.
                          </p>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          <div style="background-color: #f8f8f8; padding: 24px; border-radius: 4px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 0 0 12px 0;">
                                  <span style="color: #6b6b6b; font-size: 14px; display: block; margin-bottom: 4px;">Customer name</span>
                                  <span style="color: #1a1a1a; font-size: 16px; font-weight: 500;">${
                                    data.customerName
                                  }</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 0 12px 0;">
                                  <span style="color: #6b6b6b; font-size: 14px; display: block; margin-bottom: 4px;">Email address</span>
                                  <span style="color: #1a1a1a; font-size: 16px; font-weight: 500;">${
                                    data.customerEmail
                                  }</span>
                                </td>
                              </tr>
                              ${
                                data.customerPhone
                                  ? `
                              <tr>
                                <td style="padding: 0 0 12px 0;">
                                  <span style="color: #6b6b6b; font-size: 14px; display: block; margin-bottom: 4px;">Phone number</span>
                                  <span style="color: #1a1a1a; font-size: 16px; font-weight: 500;">${data.customerPhone}</span>
                                </td>
                              </tr>
                              `
                                  : ""
                              }
                              <tr>
                                <td style="padding: 0;">
                                  <span style="color: #6b6b6b; font-size: 14px; display: block; margin-bottom: 4px;">Request date</span>
                                  <span style="color: #1a1a1a; font-size: 16px; font-weight: 500;">${formatDate(
                                    data.createdAt
                                  )}</span>
                                </td>
                              </tr>
                            </table>
                          </div>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0 40px 16px 40px;">
                          <h3 style="color: #1a1a1a; margin: 0; font-size: 18px; font-weight: 600;">
                            Services requested
                          </h3>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          ${data.services
                            .map(
                              (service) => `
                          <div style="background-color: #f8f8f8; padding: 20px; margin-bottom: 12px; border-radius: 4px; border-left: 3px solid #29abe2;">
                            <div style="color: #1a1a1a; font-size: 16px; font-weight: 600; margin-bottom: 4px;">${
                              service.name
                            }</div>
                            <div style="color: #6b6b6b; font-size: 14px; margin-bottom: ${
                              service.notes ? "8px" : "0"
                            };">${service.category}</div>
                            ${
                              service.notes
                                ? `<div style="color: #333333; font-size: 14px; font-style: italic; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e0e0e0;">${service.notes}</div>`
                                : ""
                            }
                          </div>
                          `
                            )
                            .join("")}
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="padding: 0 40px 16px 40px;">
                          <h3 style="color: #1a1a1a; margin: 0; font-size: 18px; font-weight: 600;">
                            Location & schedule
                          </h3>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          <div style="background-color: #f8f8f8; padding: 24px; border-radius: 4px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 0 0 12px 0;">
                                  <span style="color: #6b6b6b; font-size: 14px; display: block; margin-bottom: 4px;">Execution date</span>
                                  <span style="color: #1a1a1a; font-size: 16px; font-weight: 500;">${executionDateFormatted}</span>
                                </td>
                              </tr>
                              ${
                                data.postcode
                                  ? `
                              <tr>
                                <td style="padding: 0 0 12px 0;">
                                  <span style="color: #6b6b6b; font-size: 14px; display: block; margin-bottom: 4px;">Postcode</span>
                                  <span style="color: #1a1a1a; font-size: 16px; font-weight: 500;">${data.postcode}</span>
                                </td>
                              </tr>
                              `
                                  : ""
                              }
                              ${
                                data.address
                                  ? `
                              <tr>
                                <td style="padding: 0;">
                                  <span style="color: #6b6b6b; font-size: 14px; display: block; margin-bottom: 4px;">Address</span>
                                  <span style="color: #1a1a1a; font-size: 16px; font-weight: 500;">${data.address}</span>
                                </td>
                              </tr>
                              `
                                  : ""
                              }
                            </table>
                          </div>
                        </td>
                      </tr>
                      
                      ${
                        data.notes
                          ? `
                      <tr>
                        <td style="padding: 0 40px 16px 40px;">
                          <h3 style="color: #1a1a1a; margin: 0; font-size: 18px; font-weight: 600;">
                            Additional notes
                          </h3>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 4px;">
                            <p style="color: #333333; margin: 0; font-size: 15px; line-height: 1.6;">${data.notes}</p>
                          </div>
                        </td>
                      </tr>
                      `
                          : ""
                      }
                      
                      <tr>
                        <td style="padding: 0 40px 40px 40px;">
                          <div style="background-color: #e8f4f8; padding: 24px; border-radius: 4px; text-align: center;">
                            <p style="color: #003580; margin: 0 0 16px 0; font-size: 15px; font-weight: 600;">
                              Please review this booking and contact the customer
                            </p>
                            <p style="color: #6b6b6b; margin: 0; font-size: 13px;">
                              Booking ID: #${data.bookingId
                                .slice(0, 8)
                                .toUpperCase()}
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <tr>
                        <td style="background-color: #f8f8f8; padding: 24px 40px; border-top: 1px solid #e0e0e0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="text-align: center;">
                                <p style="color: #999999; margin: 0; font-size: 12px; line-height: 1.5;">
                                  © ${new Date().getFullYear()} Gentle Touch Star. All rights reserved.
                                </p>
                                <p style="color: #cccccc; margin: 8px 0 0 0; font-size: 11px;">
                                  This is an automated notification email.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });

      console.log("✅ Notificação de booking enviada com sucesso!");
      logger.info(`Booking notification sent via Resend for ${data.bookingId}`);
    } catch (error) {
      // 🔍 ADICIONE AQUI
      console.error("❌ Erro ao enviar notificação de booking:", error);
      logger.error(`Failed to send booking email via Resend: ${error}`);
      throw error;
    }
  },

  // Adicione este método no resendService:

  async sendPasswordResetCode(email: string, name: string, code: string) {
    try {
      console.log("🔍 Enviando código de recuperação...");
      console.log("Para:", email);
      console.log("Código:", code);

      await resend.emails.send({
        from: `Gentle Touch Cleaning Services <${env.EMAIL_FROM}>`,
        to: email,
        subject: "🔐 Your Password Reset Code",
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset Code</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    
                    <tr>
                      <td style="background-color: #29abe2; padding: 32px 40px; text-align: left;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Gentle Touch Cleaning</h1>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 40px 40px 24px 40px;">
                        <h2 style="color: #1a1a1a; margin: 0; font-size: 22px; font-weight: 600;">
                          Password Reset Code
                        </h2>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 0 40px 32px 40px;">
                        <p style="color: #333333; margin: 0; font-size: 16px; line-height: 1.5;">
                          Hi ${name},
                        </p>
                        <p style="color: #333333; margin: 16px 0 0 0; font-size: 16px; line-height: 1.5;">
                          Use the code below to reset your password:
                        </p>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 0 40px 32px 40px;" align="center">
                        <div style="background-color: #f8f8f8; padding: 32px; border-radius: 8px; display: inline-block;">
                          <span style="font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #29abe2; font-family: monospace;">
                            ${code}
                          </span>
                        </div>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 0 40px 32px 40px;">
                        <div style="background-color: #fffbeb; padding: 20px; border-radius: 4px; border-left: 3px solid #f59e0b;">
                          <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                            <strong>⏱️ This code expires in 10 minutes.</strong> For security reasons, you'll need to request a new code after that.
                          </p>
                        </div>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="padding: 0 40px 40px 40px;">
                        <p style="color: #6b6b6b; font-size: 14px; line-height: 1.6; margin: 0;">
                          If you didn't request this code, you can safely ignore this email. Your password will remain unchanged.
                        </p>
                      </td>
                    </tr>
                    
                    <tr>
                      <td style="background-color: #f8f8f8; padding: 24px 40px; border-top: 1px solid #e0e0e0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="text-align: center;">
                              <p style="color: #999999; margin: 0; font-size: 12px; line-height: 1.5;">
                                © ${new Date().getFullYear()} Gentle Touch Cleaning. All rights reserved.
                              </p>
                              <p style="color: #cccccc; margin: 8px 0 0 0; font-size: 11px;">
                                This is an automated notification email.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      });

      console.log("✅ Código enviado com sucesso!");
      logger.info(`Password reset code sent to: ${email}`);
    } catch (error) {
      console.error("❌ Erro ao enviar código:", error);
      logger.error(`Failed to send reset code: ${error}`);
      throw new Error("Failed to send email");
    }
  },
};
