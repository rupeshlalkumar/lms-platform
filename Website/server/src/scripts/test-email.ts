
import "dotenv/config";
import { sendEmail } from "../services/email.service.js";

const recipient = process.env.BREVO_TEST_EMAIL;

if (!recipient) {
  throw new Error("Please set BREVO_TEST_EMAIL in your .env file");
}

try {
  await sendEmail({
    to: recipient,
    subject: "MRL Vidya World - SMTP Test",
    text: "Your Brevo SMTP integration is working successfully.",
    html: `
      <h2>MRL Vidya World</h2>
      <p>Your Brevo SMTP integration is working successfully.</p>
    `,
  });

  console.log("Test email sent successfully.");
} catch (error) {
  console.error("Test email failed:", error);
  process.exitCode = 1;
}
