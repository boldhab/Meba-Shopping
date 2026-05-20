import nodemailer from "nodemailer";
import { env } from "./env";

function ensureSmtpConfiguration() {
  if (!env.smtpHost || !env.smtpPort || !env.smtpUser || !env.smtpPass) {
    if (env.isProduction) {
      throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.");
    }

    return false;
  }

  return true;
}

function createTransporter() {
  if (!ensureSmtpConfiguration()) {
    return null;
  }

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

    if (!transporter) {
      return;
    }

    try {
      await transporter.sendMail({
        from: env.mailFrom,
        to: email,
        subject: "Your Meba verification code",
        text: `Your verification code is ${code}. It expires in ${expiresInMinutes} minutes.`,
        html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in ${expiresInMinutes} minutes.</p>`
      });
    } catch (error) {
      if (env.isProduction) {
        throw error;
      }

      console.warn("Verification email delivery failed in development; continuing with dev code.", error);
    }
  },

  async sendPasswordResetCode(email: string, code: string, expiresInMinutes: number) {
    const transporter = createTransporter();

    if (!transporter) {
      return;
    }

    try {
      await transporter.sendMail({
        from: env.mailFrom,
        to: email,
        subject: "Reset your Meba password",
        text: `Your password reset code is ${code}. It expires in ${expiresInMinutes} minutes. If you did not request this, you can safely ignore this email.`,
        html: `<p>Your password reset code is <strong>${code}</strong>.</p><p>It expires in ${expiresInMinutes} minutes.</p><p>If you did not request this, you can safely ignore this email.</p>`
      });
    } catch (error) {
      if (env.isProduction) {
        throw error;
      }

      console.warn("Password reset email delivery failed in development; continuing with dev code.", error);
    }
  },

  async sendEmail(options: { to: string; subject: string; text: string; html: string }) {
    const transporter = createTransporter();
    if (!transporter) return;

    try {
      await transporter.sendMail({
        from: env.mailFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      });
    } catch (error) {
      if (env.isProduction) throw error;
      console.warn("Email delivery failed in development.", error);
    }
  }
};
