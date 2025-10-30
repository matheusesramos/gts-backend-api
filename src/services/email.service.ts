// src/services/email.service.ts
import { Resend } from "resend";
import { env } from "../config/env";

const resend = new Resend(env.RESEND_API_KEY);

export const emailService = {
  async sendPasswordResetEmail(email: string, name: string, token: string) {
    // URL da página web
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    try {
      const { data, error } = await resend.emails.send({
        from: env.EMAIL_FROM,
        to: email,
        subject: "Password Recovery - GTS Customer",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Recovery</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #4FB3D9 0%, #3A8CAF 100%); padding: 40px 20px; text-align: center;">
                          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">GTS Customer</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">
                          <h2 style="color: #1a1a1a; margin-top: 0; font-size: 24px; font-weight: 600;">Hello, ${name}! 👋</h2>
                          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                            You requested to reset your password.
                          </p>
                          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                            Click the button below to reset your password:
                          </p>
                          
                          <!-- Button -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                            <tr>
                              <td align="center">
                                <a href="${resetUrl}" 
                                   style="display: inline-block; padding: 16px 48px; background: linear-gradient(135deg, #4FB3D9 0%, #3A8CAF 100%); color: #ffffff; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(79, 179, 217, 0.3);">
                                  Reset Password
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <div style="background-color: #f7fafc; border-left: 4px solid #4FB3D9; padding: 16px; margin: 30px 0; border-radius: 4px;">
                            <p style="color: #2d3748; font-size: 14px; margin: 0; line-height: 1.5;">
                              <strong>Can't click the button?</strong><br>
                              Copy and paste this link into your browser:
                            </p>
                            <p style="color: #4FB3D9; font-size: 13px; word-break: break-all; margin: 8px 0 0 0; font-family: monospace;">
                              ${resetUrl}
                            </p>
                          </div>
                          
                          <div style="background-color: #fff5f5; border-left: 4px solid #fc8181; padding: 16px; margin: 20px 0; border-radius: 4px;">
                            <p style="color: #742a2a; font-size: 14px; margin: 0; line-height: 1.5;">
                              <strong>⏱️ This link expires in 1 hour.</strong>
                            </p>
                          </div>
                          
                          <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                            If you didn't request this, you can safely ignore this email.
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f7fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                          <p style="color: #a0aec0; font-size: 12px; margin: 0; line-height: 1.5;">
                            © 2024 GTS Customer. All rights reserved.
                          </p>
                          <p style="color: #cbd5e0; font-size: 11px; margin: 8px 0 0 0;">
                            This is an automated email, please do not reply.
                          </p>
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

      if (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
      }

      console.log("✅ Email sent successfully");
      return data;
    } catch (error) {
      console.error("Error in email service:", error);
      throw error;
    }
  },
};
