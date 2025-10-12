//src/utils/mailer.js

import nodemailer from "nodemailer";
import createHttpError from "http-errors";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
} = process.env;

if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !SMTP_FROM) {
  console.warn("SMTP environment variables are not fully defined");
}

export function createTransporter() {
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    return transporter;
  } catch {
    throw createHttpError(500, "Failed to create mail transporter");
  }
}

export async function sendMail({ to, subject, html, text }) {
  const transporter = createTransporter();
  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("Failed to send email:", err.message);
    throw createHttpError(500, "Failed to send the email, please try again later.");
  }
}
