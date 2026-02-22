/**
 * SendGrid email helper — replaces Manus notification service.
 * Used for owner notifications, password reset emails, and welcome emails.
 */
import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ?? "";
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL ?? "noreply@servicesourceconnect.com";
const FROM_NAME = "ServiceSource Connect";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.warn("[Email] SENDGRID_API_KEY not set — email not sent:", subject);
    return false;
  }
  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, ""),
    });
    return true;
  } catch (error) {
    console.error("[Email] SendGrid error:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: "Reset your ServiceSource Connect password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">ServiceSource Connect</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display:inline-block;background:#c8a84b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Reset Password
        </a>
        <p style="color:#666;font-size:14px;">This link expires in 1 hour. If you did not request this, ignore this email.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#999;font-size:12px;">ServiceSource Connect — Veteran &amp; Active Duty Support</p>
      </div>
    `,
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: "Welcome to ServiceSource Connect",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e3a5f;">Welcome, ${name}!</h2>
        <p>Thank you for joining ServiceSource Connect — your trusted platform connecting Veterans and Active Duty service members with the resources they've earned.</p>
        <a href="https://servicesourceconnect.com/dashboard" style="display:inline-block;background:#c8a84b;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0;">
          Go to Your Dashboard
        </a>
        <p style="color:#666;font-size:14px;">Start by completing your profile to get personalized resource recommendations.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
        <p style="color:#999;font-size:12px;">ServiceSource Connect — Veteran &amp; Active Duty Support</p>
      </div>
    `,
  });
}

export async function notifyOwner({
  title,
  content,
}: {
  title: string;
  content: string;
}): Promise<boolean> {
  const ownerEmail = process.env.OWNER_EMAIL ?? FROM_EMAIL;
  return sendEmail({
    to: ownerEmail,
    subject: `[ServiceSource] ${title}`,
    html: `<div style="font-family:Arial,sans-serif;"><h3>${title}</h3><pre style="white-space:pre-wrap;">${content}</pre></div>`,
  });
}
