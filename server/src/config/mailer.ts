import nodemailer from "nodemailer";
import { env } from "./env";

function ensureSmtpConfiguration() {
  if (!env.smtpHost || !env.smtpPort || !env.smtpUser || !env.smtpPass) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.");
  }
}

function createTransporter() {
  ensureSmtpConfiguration();

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
}

export const mailer = {
  from: env.mailFrom,

  async sendVerificationCode(email: string, code: string, expiresInMinutes: number) {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: env.mailFrom,
      to: email,
      subject: "Your Meba verification code",
      text: `Your verification code is ${code}. It expires in ${expiresInMinutes} minutes.`,
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in ${expiresInMinutes} minutes.</p>`
    });
  }
};
