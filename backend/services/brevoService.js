const { BrevoClient } = require('@getbrevo/brevo');

/**
 * Brevo Transactional Email Service
 * Sends teacher onboarding email with Firebase password setup link and teacher dashboard instructions.
 */
class BrevoService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || '';
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'support@campussetu.internal';
    this.senderName = process.env.BREVO_SENDER_NAME || 'CampusSetu Administration';
    this.client = this.apiKey ? new BrevoClient({ apiKey: this.apiKey }) : null;
  }

  /**
   * Send teacher onboarding email with secure Firebase password setup link.
   *
   * @param {Object} params
   * @param {string} params.toEmail - Teacher's college email address
   * @param {string} params.toName - Teacher's full name
   * @param {string} params.department - Academic department
   * @param {string} params.setupPasswordLink - Firebase generated password setup / reset URL
   * @param {string} params.loginUrl - Faculty portal URL
   */
  async sendTeacherOnboardingEmail({
    toEmail,
    toName,
    department = '',
    setupPasswordLink,
    loginUrl = process.env.TEACHER_LOGIN_URL || 'http://localhost:5173',
  }) {
    if (!this.client || !this.apiKey) {
      console.warn('BrevoService: BREVO_API_KEY is not configured. Email will not be dispatched.');
      return {
        success: false,
        message: 'Brevo API key is not configured.',
        skipped: true,
      };
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CampusSetu Faculty Portal</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9f6; margin: 0; padding: 24px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
    .header { background: #0f172a; padding: 28px 32px; color: #ffffff; text-align: left; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }
    .body { padding: 32px; line-height: 1.6; font-size: 15px; }
    .btn { display: inline-block; background: #15803d; color: #ffffff !important; text-decoration: none; padding: 13px 26px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 20px 0; }
    .details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 20px 0; font-size: 14px; }
    .details div { margin-bottom: 6px; }
    .details div:last-child { margin-bottom: 0; }
    .details strong { color: #475569; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
    .security-note { font-size: 13px; color: #64748b; background: #fffbeb; border: 1px solid #fef3c7; padding: 12px 16px; border-radius: 6px; margin-top: 18px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>CampusSetu</h1>
      <p>College Administration &amp; Grievance Management System</p>
    </div>
    <div class="body">
      <p>Dear <strong>${toName}</strong>,</p>
      <p>Welcome to <strong>CampusSetu</strong>. Your faculty account has been provisioned by the college administration.</p>
      
      <div class="details">
        <div><strong>Faculty Name:</strong> ${toName}</div>
        <div><strong>Official Email:</strong> ${toEmail}</div>
        ${department ? `<div><strong>Department:</strong> ${department}</div>` : ''}
        <div><strong>Role:</strong> Teacher / Faculty Handler</div>
      </div>

      <p>To securely activate your faculty account and create your personal password, click the button below:</p>

      <div style="text-align: center;">
        <a href="${setupPasswordLink}" class="btn" target="_blank" rel="noopener noreferrer">Set Up Your Secure Password</a>
      </div>

      <div class="security-note">
        <strong>Security Notice:</strong> This password setup link is personalized and time-sensitive. CampusSetu will never ask for your password via email or telephone.
      </div>

      <p style="margin-top: 24px;">Once your password is set up, you can sign in to the CampusSetu faculty mobile app and web dashboard:</p>
      <p style="font-size: 13px; word-break: break-all;">Faculty Portal: <a href="${loginUrl}">${loginUrl}</a></p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} CampusSetu Administration. All rights reserved.<br>
      This is an automated system notification.
    </div>
  </div>
</body>
</html>
`;

    try {
      const response = await this.client.transactionalEmails.sendTransacEmail({
        sender: {
          email: this.senderEmail,
          name: this.senderName,
        },
        to: [
          {
            email: toEmail,
            name: toName,
          },
        ],
        subject: 'Welcome to CampusSetu — Set Up Your Faculty Account',
        htmlContent,
      });

      console.log(`BrevoService: Onboarding email dispatched to ${toEmail}. MessageId:`, response?.messageId);
      return {
        success: true,
        messageId: response?.messageId || null,
      };
    } catch (err) {
      console.error('BrevoService: Failed to send onboarding email:', err.message);
      return {
        success: false,
        error: err.message,
        details: err.body || null,
      };
    }
  }
}

module.exports = new BrevoService();
