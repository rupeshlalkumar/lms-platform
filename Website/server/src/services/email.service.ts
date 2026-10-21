
import nodemailer from "nodemailer";

const smtpHost = process.env.BREVO_SMTP_HOST;
const smtpPort = Number(process.env.BREVO_SMTP_PORT || 587);
const smtpUser = process.env.BREVO_SMTP_USER;
const smtpKey = process.env.BREVO_SMTP_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL;
const senderName = process.env.BREVO_SENDER_NAME || "MRL Vidya World";

function createTransporter() {
  if (!smtpHost || !smtpUser || !smtpKey || !senderEmail) {
    throw new Error("Brevo SMTP environment variables are missing");
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpKey,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<void> {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: {
      name: senderName,
      address: senderEmail,
    },
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  });
}
