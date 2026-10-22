const { BrevoClient } = require('@getbrevo/brevo');

const ROLE_DISPLAY_NAMES = {
  staff: 'Staff / Department Handler',
  teacher: 'Staff / Department Handler',
  cluster_head: 'Cluster Head / Operations Lead',
  principal: 'College Principal / Executive Authority',
};

const ROLE_SUBJECT_LINES = {
  staff: 'Welcome to CampusSetu — Set Up Your Staff Account',
  teacher: 'Welcome to CampusSetu — Set Up Your Staff Account',
  cluster_head: 'Welcome to CampusSetu — Set Up Your Cluster Head Account',
  principal: 'Welcome to CampusSetu — Set Up Your Principal Executive Account',
};

// NEW: escape user-provided text before putting it into email HTML
const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Brevo Transactional Email Service
 * Sends staff onboarding emails (Teacher, Cluster Head, Principal) with Firebase password setup link and dashboard instructions.
 * Also sends task-assignment emails to teachers.
 */
class BrevoService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || '';
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'support@campussetu.internal';
    this.senderName = process.env.BREVO_SENDER_NAME || 'CampusSetu Administration';
    this.client = this.apiKey ? new BrevoClient({ apiKey: this.apiKey }) : null;
  }

  /**
   * Send staff onboarding email (for teachers, cluster heads, and principals)
   *
   * @param {Object} params
   * @param {string} params.toEmail - Recipient's official college email
   * @param {string} params.toName - Full name
   * @param {string} [params.role='teacher'] - 'teacher' | 'cluster_head' | 'principal'
   * @param {string} [params.department=''] - Department, cluster, or institution
   * @param {string} params.setupPasswordLink - Firebase generated password setup / reset URL
   * @param {string} [params.loginUrl] - Portal login URL
   */
  async sendStaffOnboardingEmail({
    toEmail,
    toName,
    role = 'teacher',
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

    const roleTitle = ROLE_DISPLAY_NAMES[role] || 'Faculty Member';
    const subject = ROLE_SUBJECT_LINES[role] || `Welcome to CampusSetu — Set Up Your ${roleTitle} Account`;
    const deptLabel = role === 'cluster_head' ? 'Cluster / Region' : role === 'principal' ? 'Institution / Campus' : 'Department';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CampusSetu</title>
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
      <p>Welcome to <strong>CampusSetu</strong>. Your official administrative account has been provisioned by the college leadership.</p>
      
      <div class="details">
        <div><strong>Full Name:</strong> ${toName}</div>
        <div><strong>Official Email:</strong> ${toEmail}</div>
        <div><strong>Assigned Role:</strong> ${roleTitle}</div>
        ${department ? `<div><strong>${deptLabel}:</strong> ${department}</div>` : ''}
      </div>

      <p>To securely activate your account and configure your personal credentials, click the button below:</p>

      <div style="text-align: center;">
        <a href="${setupPasswordLink}" class="btn" target="_blank" rel="noopener noreferrer">Set Up Your Secure Password</a>
      </div>

      <div class="security-note">
        <strong>Security Notice:</strong> This link is encrypted, personalized, and time-sensitive. CampusSetu representatives will never ask for your password via email or telephone.
      </div>

      <p style="margin-top: 24px;">Once your password is set up, you can immediately access the CampusSetu mobile app or web console:</p>
      <p style="font-size: 13px; word-break: break-all;">Portal Address: <a href="${loginUrl}">${loginUrl}</a></p>
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
        subject,
        htmlContent,
      });

      console.log(`BrevoService: Onboarding email dispatched to ${toEmail} [role=${role}]. MessageId:`, response?.messageId);
      return {
        success: true,
        messageId: response?.messageId || null,
      };
    } catch (err) {
      console.error(`BrevoService: Failed to send onboarding email to ${toEmail}:`, err.message);
      return {
        success: false,
        error: err.message,
        details: err.body || null,
      };
    }
  }

  /**
   * NEW: Send an email to a teacher when a complaint is assigned to them.
   * Never throws; always resolves to { success, ... }.
   *
   * @param {Object} params
   * @param {Object} params.teacher - User document (needs name, email)
   * @param {Object} params.issue - Issue document
   * @param {Object} [params.assignedBy] - User who assigned it (req.user)
   * @param {string} [params.loginUrl] - Portal URL shown in the email
   */
  async sendTaskAssignedEmail({
    teacher,
    issue,
    assignedBy,
    loginUrl = process.env.TEACHER_LOGIN_URL || 'http://localhost:5173',
  }) {
    if (!this.client || !this.apiKey) {
      console.warn('BrevoService: BREVO_API_KEY is not configured. Assignment email will not be dispatched.');
      return {
        success: false,
        message: 'Brevo API key is not configured.',
        skipped: true,
      };
    }

    if (!teacher?.email) {
      return { success: false, message: 'Teacher has no email address.' };
    }

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const location =
      [issue.building, issue.floor, issue.roomNumber].filter(Boolean).join(', ') ||
      issue.location ||
      '-';
    const student = issue.reportedBy || {};
    const reportedAt = issue.createdAt
      ? new Date(issue.createdAt).toLocaleString()
      : '-';

    // Strip line breaks so user text can never inject extra headers into the subject
    const subject = `New Complaint Assigned: ${complaintId} - ${issue.title}`.replace(/[\r\n]+/g, ' ');

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Complaint Assigned</title>
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
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>CampusSetu</h1>
      <p>College Administration &amp; Grievance Management System</p>
    </div>
    <div class="body">
      <p>Dear <strong>${escapeHtml(teacher.name)}</strong>,</p>
      <p>A new complaint has been assigned to you. Please review the details below.</p>

      <div class="details">
        <div><strong>Complaint ID:</strong> ${escapeHtml(complaintId)}</div>
        <div><strong>Title:</strong> ${escapeHtml(issue.title)}</div>
        <div><strong>Description:</strong> ${escapeHtml(issue.description)}</div>
        <div><strong>Category:</strong> ${escapeHtml(issue.category)}</div>
        <div><strong>Location:</strong> ${escapeHtml(location)}</div>
        <div><strong>Priority:</strong> ${escapeHtml(String(issue.priority || 'medium').toUpperCase())}</div>
        <div><strong>Reported by:</strong> ${escapeHtml(student.name || 'Student')}</div>
        <div><strong>Student email:</strong> ${escapeHtml(student.email || '-')}</div>
        ${student.usn ? `<div><strong>Student ID:</strong> ${escapeHtml(student.usn)}</div>` : ''}
        <div><strong>Reported on:</strong> ${escapeHtml(reportedAt)}</div>
        <div><strong>Student photo:</strong> ${issue.photoUrl ? 'Attached' : 'Not provided'}</div>
        <div><strong>Assigned By:</strong> ${escapeHtml(assignedBy?.name || 'College Administration')}</div>
      </div>

      <p>Please open CampusSetu, mark the complaint <strong>In Progress</strong>, and upload a proof photo with a resolution note once it is resolved.</p>

      <div style="text-align: center;">
        <a href="${escapeHtml(loginUrl)}" class="btn" target="_blank" rel="noopener noreferrer">Open CampusSetu</a>
      </div>
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
            email: teacher.email,
            name: teacher.name,
          },
        ],
        subject,
        htmlContent,
      });

      console.log(`BrevoService: Assignment email dispatched to ${teacher.email} [complaint=${complaintId}]. MessageId:`, response?.messageId);
      return {
        success: true,
        messageId: response?.messageId || null,
      };
    } catch (err) {
      console.error(`BrevoService: Failed to send assignment email to ${teacher.email}:`, err.message);
      return {
        success: false,
        error: err.message,
        details: err.body || null,
      };
    }
  }

  /**
   * Backward-compatible alias for existing callers
   */
  async sendTeacherOnboardingEmail(params) {
    return this.sendStaffOnboardingEmail({ ...params, role: 'teacher' });
  }
}

module.exports = new BrevoService();