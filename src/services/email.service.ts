// src/services/email.service.ts
import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../config/logger"; // 🆕 NOVO

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 30000,
});

transporter.verify((error) => {
  if (error) {
    logger.error(`SMTP connection failed: ${error.message}`); // 🔄 ALTERADO - era console.error
  } else {
    logger.info("SMTP server ready"); // 🔄 ALTERADO - era console.log
  }
});

export const emailService = {
  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${env.API_BASE_URL}/reset-password?token=${token}`; // 🔄 ALTERADO - usa API_BASE_URL

    try {
      await transporter.sendMail({
        from: `"GTS Customer" <${env.EMAIL_FROM}>`,
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
                    <!-- Container Principal -->
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                      
                      <!-- Header com logo/nome -->
                      <tr>
                        <td style="background-color: #29abe2; padding: 32px 40px; text-align: left;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Gentle Touch Star - Customer APP</h1>
                        </td>
                      </tr>
                      
                      <!-- Título Principal -->
                      <tr>
                        <td style="padding: 40px 40px 24px 40px;">
                          <h2 style="color: #1a1a1a; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">
                            Password recovery request
                          </h2>
                        </td>
                      </tr>
                      
                      <!-- Saudação -->
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
                      
                      <!-- Botão de Reset -->
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
                      
                      <!-- Box com link alternativo -->
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
                      
                      <!-- Aviso de expiração -->
                      <tr>
                        <td style="padding: 0 40px 32px 40px;">
                          <div style="background-color: #fffbeb; padding: 20px; border-radius: 4px; border-left: 3px solid #f59e0b;">
                            <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                              <strong>⏱️ This link expires in 1 hour.</strong> For security reasons, you'll need to request a new link after that.
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Mensagem de segurança -->
                      <tr>
                        <td style="padding: 0 40px 40px 40px;">
                          <p style="color: #6b6b6b; font-size: 14px; line-height: 1.6; margin: 0;">
                            If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
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

      logger.info(`Password reset email sent to: ${email}`); // 🔄 ALTERADO - era console.log
    } catch (error) {
      logger.error(`Failed to send password reset email: ${error}`); // 🔄 ALTERADO - era console.error
      throw new Error("Failed to send email");
    }
  },
};
