import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Creates and returns a Nodemailer transporter.
 * Supports standard Gmail SMTP (using App Password) or custom SMTP settings from env vars:
 * - SMTP_USER or EMAIL_USER
 * - SMTP_PASS or EMAIL_PASS
 * - SMTP_HOST (defaults to smtp.gmail.com)
 * - SMTP_PORT (defaults to 465 for secure, or 587)
 * - EMAIL_FROM (defaults to SMTP_USER)
 */
export function getMailTransporter() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;

  if (!user || !pass) {
    throw new Error(
      "Email configuration missing: Please set EMAIL_USER and EMAIL_PASS (Gmail App Password) in your .env file."
    );
  }

  const isSecure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends an email using Nodemailer.
 */
export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  const transporter = getMailTransporter();
  const fromUser = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from: `"RMS Notification" <${fromUser}>`,
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, "<br/>"),
  });

  return info;
}
