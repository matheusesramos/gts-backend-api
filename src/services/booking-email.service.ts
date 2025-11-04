// src/services/booking-email.service.ts
import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../config/logger";
import https from "https";
import http from "http";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface BookingEmailData {
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
  photoUrls?: string[];
  bookingId: string;
  createdAt: string;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function generateBookingEmailHTML(data: BookingEmailData): string {
  const executionDateFormatted = data.executionDate
    ? new Date(data.executionDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not specified";

  return `
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
              <!-- Container Principal -->
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                
                <!-- Header com logo/nome -->
                <tr>
                  <td style="background-color: #003580; padding: 32px 40px; text-align: left;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">GTS Customer</h1>
                  </td>
                </tr>
                
                <!-- Título Principal -->
                <tr>
                  <td style="padding: 40px 40px 24px 40px;">
                    <h2 style="color: #1a1a1a; margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">
                      Your booking request has been sent
                    </h2>
                  </td>
                </tr>
                
                <!-- Saudação -->
                <tr>
                  <td style="padding: 0 40px 32px 40px;">
                    <p style="color: #333333; margin: 0; font-size: 16px; line-height: 1.5;">
                      Hi there,
                    </p>
                    <p style="color: #333333; margin: 16px 0 0 0; font-size: 16px; line-height: 1.5;">
                      A new booking request from <strong>${
                        data.customerName
                      }</strong> has been received.
                    </p>
                  </td>
                </tr>
                
                <!-- Box de Informações do Cliente -->
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
                            <span style="color: #6b6b6b; font-size: 14px; display: block; margin-bottom: 4px;">Booking date</span>
                            <span style="color: #1a1a1a; font-size: 16px; font-weight: 500;">${formatDate(
                              data.createdAt
                            )}</span>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
                
                <!-- Serviços Solicitados -->
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
                    <div style="background-color: #f8f8f8; padding: 20px; margin-bottom: 12px; border-radius: 4px; border-left: 3px solid #003580;">
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
                
                <!-- Localização e Agendamento -->
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
                
                <!-- Notas Adicionais -->
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
                
                <!-- Fotos Anexadas -->
                ${
                  data.photoUrls && data.photoUrls.length > 0
                    ? `
                <tr>
                  <td style="padding: 0 40px 32px 40px;">
                    <div style="background-color: #fffbeb; padding: 20px; border-radius: 4px; border-left: 3px solid #f59e0b;">
                      <p style="color: #92400e; margin: 0; font-size: 14px; line-height: 1.6;">
                        <strong>📎 ${data.photoUrls.length} photo(s) attached</strong> – Please check the attachments for visual reference.
                      </p>
                    </div>
                  </td>
                </tr>
                `
                    : ""
                }
                
                <!-- Call to Action -->
                <tr>
                  <td style="padding: 0 40px 40px 40px;">
                    <div style="background-color: #e8f4f8; padding: 24px; border-radius: 4px; text-align: center;">
                      <p style="color: #003580; margin: 0 0 16px 0; font-size: 15px; font-weight: 600;">
                        Please review this booking and contact the customer
                      </p>
                      <p style="color: #6b6b6b; margin: 0; font-size: 13px;">
                        Booking ID: #${data.bookingId.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8f8f8; padding: 24px 40px; border-top: 1px solid #e0e0e0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="text-align: center;">
                          <p style="color: #999999; margin: 0; font-size: 12px; line-height: 1.5;">
                            © ${new Date().getFullYear()} GTS Customer. All rights reserved.
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
  `;
}

async function downloadImage(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const chunks: Buffer[] = [];

    client
      .get(url, (response) => {
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
        response.on("error", reject);
      })
      .on("error", reject);
  });
}

export const bookingEmailService = {
  async sendNewBookingNotification(data: BookingEmailData) {
    try {
      const recipientEmail = env.EMAIL_FROM;
      const emailHtml = generateBookingEmailHTML(data);

      let attachments: any[] = [];

      if (data.photoUrls && data.photoUrls.length > 0) {
        logger.info(
          `Preparing ${data.photoUrls.length} photo attachments for booking ${data.bookingId}`
        );

        for (let i = 0; i < data.photoUrls.length; i++) {
          try {
            const buffer = await downloadImage(data.photoUrls[i]);
            const extension =
              data.photoUrls[i].split(".").pop()?.split("?")[0] || "jpg";

            attachments.push({
              filename: `photo-${i + 1}.${extension}`,
              content: buffer,
              contentType: `image/${extension}`,
            });
          } catch (error) {
            logger.error(`Error downloading photo ${i + 1}: ${error}`);
          }
        }

        logger.debug(
          `${attachments.length} photos ready for booking ${data.bookingId}`
        );
      }

      await transporter.sendMail({
        from: `"GTS Customer" <${env.EMAIL_FROM}>`,
        to: recipientEmail,
        subject: `🎉 New Booking Request - ${data.customerName}`,
        html: emailHtml,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      logger.info(`Booking notification sent for ${data.bookingId}`);
    } catch (error) {
      logger.error(`Failed to send booking email: ${error}`);
      throw error;
    }
  },
};
