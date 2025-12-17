import sgMail from "@sendgrid/mail";
import { config } from "@config/environment.js";

const SENDGRID_API_KEY = config.email.sendgridApiKey;
const SENDGRID_FROM_EMAIL = config.email.sendgridFromEmail;

let __sendgridInitialized = false;

function initSendGrid() {
  if (!__sendgridInitialized && SENDGRID_API_KEY) {
    try {
      sgMail.setApiKey(SENDGRID_API_KEY);
      __sendgridInitialized = true;
    } catch (err) {
      console.error("[OTP] Failed to initialize SendGrid", err);
    }
  }
}

const OTP_EXPIRY_MINUTES = 10;

export async function sendOtpEmail(email: string, otp: string): Promise<void> {
  try {
    initSendGrid();

    if (!__sendgridInitialized) {
      console.info(`Unable to send OTP in (DEV MODE) OTP ${otp} for ${email}`);
      return;
    }

    const subject = "Your verification code";
    const plain = `Your verification code is ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`;
    const html = `<p>Your verification code is <strong>${otp}</strong>.<br/>It will expire in <strong>${OTP_EXPIRY_MINUTES}</strong> minutes.</p>`;

    await sgMail.send({
      to: email,
      from: SENDGRID_FROM_EMAIL,
      subject,
      text: plain,
      html,
    });
    console.info(`[OTP] Sent verification code email to ${email}`);
  } catch (error) {
    console.error("[OTP] Failed to send OTP email", error);
  }
}

