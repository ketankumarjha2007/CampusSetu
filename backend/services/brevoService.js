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

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildEmailTemplate = ({
  headline,
  intro,
  details = [],
  actionButton = null,
  alertBox = null,
  footerNote = null,
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CampusSetu Grievance Portal</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06); }
    .header { background: #0f172a; padding: 24px 32px; color: #ffffff; }
    .institution-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700; margin: 0 0 6px 0; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; color: #ffffff; }
    .body { padding: 32px; line-height: 1.6; font-size: 15px; }
    .headline { font-size: 17px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
    .intro { color: #334155; margin-bottom: 20px; line-height: 1.6; }
    .details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 20px 0; font-size: 14px; }
    .detail-row { padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-weight: 600; color: #475569; display: inline-block; width: 150px; }
    .detail-val { color: #0f172a; font-weight: 500; }
    .btn { display: inline-block; background: #0f766e; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 20px 0; }
    .alert { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 0 6px 6px 0; margin: 20px 0; font-size: 13.5px; color: #1e3a8a; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p class="institution-tag">CampusSetu • Grievance Redressal Portal</p>
      <h1>College Facility &amp; Infrastructure Administration</h1>
    </div>
    <div class="body">
      ${headline ? `<div class="headline">${escapeHtml(headline)}</div>` : ''}
      <div class="intro">${intro}</div>
      ${
        details.length > 0
          ? `
        <div class="details">
          ${details
            .map(
              (d) => `
            <div class="detail-row">
              <span class="detail-label">${escapeHtml(d.label)}:</span>
              <span class="detail-val">${d.isHtml ? d.value : escapeHtml(d.value)}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `
          : ''
      }
      ${alertBox ? `<div class="alert">${alertBox}</div>` : ''}
      ${
        actionButton
          ? `
        <div style="text-align: center;">
          <a href="${escapeHtml(actionButton.url)}" class="btn" target="_blank" rel="noopener noreferrer">${escapeHtml(actionButton.text)}</a>
        </div>
      `
          : ''
      }
      ${footerNote ? `<p style="font-size: 13px; color: #64748b; margin-top: 24px;">${footerNote}</p>` : ''}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} CampusSetu Administration. All rights reserved.<br>
      This is an official automated institutional notification dispatched to your registered address.
    </div>
  </div>
</body>
</html>
`;
};

/**
 * Brevo Transactional Email Service
 * Handles all automated campus communications: onboarding, complaint filings,
 * department staff alerts, assignment updates, resolution proof, and escalations.
 */
class BrevoService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || '';
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'support@campussetu.internal';
    this.senderName = process.env.BREVO_SENDER_NAME || 'CampusSetu Administration';
    this.client = this.apiKey ? new BrevoClient({ apiKey: this.apiKey }) : null;
  }

  /**
   * Helper to dispatch transactional emails with error resilience
   */
  async sendEmail({ toEmail, toName, subject, htmlContent }) {
    if (!this.client || !this.apiKey) {
      console.warn(`BrevoService: BREVO_API_KEY not configured. Email to ${toEmail} skipped.`);
      return { success: false, skipped: true, message: 'Brevo API key not configured' };
    }

    if (!toEmail) {
      return { success: false, message: 'Missing recipient email' };
    }

    try {
      const response = await this.client.transactionalEmails.sendTransacEmail({
        sender: {
          email: this.senderEmail,
          name: this.senderName,
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail.split('@')[0],
          },
        ],
        subject: subject.replace(/[\r\n]+/g, ' '),
        htmlContent,
      });

      console.log(`BrevoService: Email dispatched to ${toEmail} [${subject}]. MessageId:`, response?.messageId);
      return { success: true, messageId: response?.messageId || null };
    } catch (err) {
      console.error(`BrevoService: Failed to send email to ${toEmail}:`, err.message);
      return { success: false, error: err.message, details: err.body || null };
    }
  }

  /**
   * Send staff onboarding email
   */
  async sendStaffOnboardingEmail({
    toEmail,
    toName,
    role = 'staff',
    department = '',
    setupPasswordLink,
    loginUrl = process.env.TEACHER_LOGIN_URL || 'http://localhost:5173',
  }) {
    const roleTitle = ROLE_DISPLAY_NAMES[role] || 'Staff Member';
    const subject = ROLE_SUBJECT_LINES[role] || `Welcome to CampusSetu — Set Up Your ${roleTitle} Account`;
    const deptLabel = role === 'cluster_head' ? 'Cluster / Region' : role === 'principal' ? 'Institution / Campus' : 'Department';

    const htmlContent = buildEmailTemplate({
      headline: `Welcome, ${toName}`,
      intro: `Your official administrative account has been provisioned on <strong>CampusSetu</strong>. To securely activate your account and configure your credentials, follow the instructions below.`,
      details: [
        { label: 'Full Name', value: toName },
        { label: 'Official Email', value: toEmail },
        { label: 'Assigned Role', value: roleTitle },
        ...(department ? [{ label: deptLabel, value: department }] : []),
      ],
      alertBox: '<strong>Security Notice:</strong> This activation link is encrypted and personalized. CampusSetu staff will never ask for your password.',
      actionButton: {
        text: 'Set Up Your Secure Password',
        url: setupPasswordLink,
      },
      footerNote: `Portal Address: <a href="${escapeHtml(loginUrl)}">${escapeHtml(loginUrl)}</a>`,
    });

    return this.sendEmail({ toEmail, toName, subject, htmlContent });
  }

  /**
   * 1. Send confirmation email to the student/reporter when a complaint is created
   */
  async sendComplaintCreatedReporterEmail({ recipient, issue }) {
    if (!recipient?.email) return { success: false, message: 'No recipient email' };

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const location =
      [issue.building, issue.floor, issue.roomNumber].filter(Boolean).join(', ') ||
      issue.location ||
      'Campus Grounds';

    const subject = `[CampusSetu] Complaint Registered: ${complaintId} - ${issue.title}`;

    const htmlContent = buildEmailTemplate({
      headline: `Complaint Successfully Registered`,
      intro: `Dear <strong>${escapeHtml(recipient.name || 'Student')}</strong>,<br>Your complaint has been formally logged in the campus grievance system. It has been routed to the <strong>${escapeHtml(issue.department || 'Maintenance')}</strong> department for resolution.`,
      details: [
        { label: 'Complaint ID', value: complaintId },
        { label: 'Title', value: issue.title },
        { label: 'Category', value: issue.category },
        { label: 'Department', value: issue.department || 'General' },
        { label: 'Location', value: location },
        { label: 'Priority', value: String(issue.priority || 'medium').toUpperCase() },
        { label: 'Filed Date', value: new Date(issue.createdAt || Date.now()).toLocaleString('en-IN') },
      ],
      alertBox: `<strong>What happens next?</strong> Active staff in the <strong>${escapeHtml(issue.department)}</strong> department have been notified. Once a technician accepts or is dispatched to your ticket, you will receive an automatic progress email.`,
      footerNote: 'You can track real-time resolution progress and photos in the CampusSetu mobile app under "My Reports".',
    });

    return this.sendEmail({
      toEmail: recipient.email,
      toName: recipient.name,
      subject,
      htmlContent,
    });
  }

  /**
   * 2. Send email to active staff members in the selected department when a new complaint arrives
   */
  async sendComplaintCreatedDepartmentStaffEmail({ staffMembers = [], issue }) {
    if (!Array.isArray(staffMembers) || staffMembers.length === 0) {
      return { success: false, message: 'No staff recipients' };
    }

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const location =
      [issue.building, issue.floor, issue.roomNumber].filter(Boolean).join(', ') ||
      issue.location ||
      '-';
    const reporter = issue.reportedBy || {};

    const subject = `[CampusSetu Action Required] New ${issue.department} Complaint: ${complaintId}`;

    const htmlContent = buildEmailTemplate({
      headline: `New Complaint in ${issue.department}`,
      intro: `A new infrastructure or facility issue has been reported in your department queue and requires dispatch/resolution.`,
      details: [
        { label: 'Complaint ID', value: complaintId },
        { label: 'Issue Title', value: issue.title },
        { label: 'Department', value: issue.department },
        { label: 'Location', value: location },
        { label: 'Priority', value: String(issue.priority || 'medium').toUpperCase() },
        { label: 'Reported By', value: `${reporter.name || 'User'} (${reporter.role || 'student'})` },
        { label: 'Description', value: issue.description },
      ],
      alertBox: 'Please open CampusSetu mobile app or web console to claim this ticket and begin work.',
      footerNote: 'Immediate action ensures high resolution SLA metrics across campus.',
    });

    // Send to all department staff in parallel
    const results = await Promise.all(
      staffMembers.map((staff) =>
        this.sendEmail({
          toEmail: staff.email,
          toName: staff.name,
          subject,
          htmlContent,
        })
      )
    );

    return { success: true, count: results.filter((r) => r.success).length };
  }

  /**
   * 3. Send email to reporter when complaint is claimed or assigned to a staff member
   */
  async sendComplaintAssignedReporterEmail({ reporter, staff, issue }) {
    if (!reporter?.email) return { success: false, message: 'No reporter email' };

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const staffName = staff?.name || 'Assigned Staff';
    const staffDept = staff?.department || issue.department || 'Maintenance';

    const subject = `[CampusSetu Update] Complaint ${complaintId} Assigned to ${staffName}`;

    const htmlContent = buildEmailTemplate({
      headline: `Complaint Assigned to Staff`,
      intro: `Dear <strong>${escapeHtml(reporter.name || 'Student')}</strong>,<br>Your complaint <strong>#${escapeHtml(complaintId)}</strong> has been assigned to a department technician.`,
      details: [
        { label: 'Complaint ID', value: complaintId },
        { label: 'Title', value: issue.title },
        { label: 'Assigned Staff', value: staffName },
        { label: 'Staff Department', value: staffDept },
        { label: 'Staff Email', value: staff?.email || 'N/A' },
        { label: 'Current Status', value: 'Assigned / In Queue' },
      ],
      alertBox: `The technician has received the details of your issue and will attend to it at the specified location.`,
    });

    return this.sendEmail({
      toEmail: reporter.email,
      toName: reporter.name,
      subject,
      htmlContent,
    });
  }

  /**
   * 4. Send email to reporter on status updates (In Progress, Resolved, Rejected)
   */
  async sendComplaintStatusUpdateReporterEmail({
    reporter,
    staff,
    issue,
    oldStatus,
    newStatus,
    resolutionNote = '',
  }) {
    if (!reporter?.email) return { success: false, message: 'No reporter email' };

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const formattedStatus = newStatus.replace('_', ' ').toUpperCase();

    let subject = `[CampusSetu Update] Complaint ${complaintId}: ${formattedStatus}`;
    let introText = `Dear <strong>${escapeHtml(reporter.name || 'Student')}</strong>,<br>Your complaint status has been updated to <strong>${escapeHtml(formattedStatus)}</strong>.`;
    let alertText = null;

    if (newStatus === 'in_progress') {
      subject = `[CampusSetu] Work Started on Complaint ${complaintId}`;
      introText = `Dear <strong>${escapeHtml(reporter.name || 'Student')}</strong>,<br>Work has officially begun on your complaint. Technician <strong>${escapeHtml(staff?.name || 'Staff')}</strong> is actively working on the resolution.`;
    } else if (newStatus === 'resolved') {
      subject = `[CampusSetu Resolved] Complaint ${complaintId} Has Been Resolved`;
      introText = `Dear <strong>${escapeHtml(reporter.name || 'Student')}</strong>,<br>Great news! Your complaint has been marked as <strong>RESOLVED</strong> by the department staff.`;
      alertText = `<strong>Please Review &amp; Rate:</strong> Open the CampusSetu app to inspect the technician's resolution proof photo and rate the service. If the issue is not fixed to your satisfaction, you can reopen it with a single tap.`;
    } else if (newStatus === 'rejected') {
      subject = `[CampusSetu Update] Complaint ${complaintId} Notice`;
      introText = `Dear <strong>${escapeHtml(reporter.name || 'Student')}</strong>,<br>Your complaint has been reviewed and closed as <strong>REJECTED</strong>.`;
    }

    const htmlContent = buildEmailTemplate({
      headline: `Status: ${formattedStatus}`,
      intro: introText,
      details: [
        { label: 'Complaint ID', value: complaintId },
        { label: 'Issue Title', value: issue.title },
        { label: 'Updated Status', value: formattedStatus },
        { label: 'Handled By', value: staff?.name || 'Department Staff' },
        ...(resolutionNote ? [{ label: 'Staff Note / Remarks', value: resolutionNote }] : []),
        { label: 'Updated At', value: new Date().toLocaleString('en-IN') },
      ],
      alertBox: alertText,
      footerNote: 'Thank you for helping maintain college facilities and campus quality.',
    });

    return this.sendEmail({
      toEmail: reporter.email,
      toName: reporter.name,
      subject,
      htmlContent,
    });
  }

  /**
   * 5. Send email to assigned staff when a student reopens an issue
   */
  async sendComplaintReopenedEmail({ recipientStaff, reporter, issue, reason }) {
    const complaintId = issue.complaintId || String(issue._id).slice(-6);

    // Notify Staff
    if (recipientStaff?.email) {
      const subject = `[CampusSetu Alert] Complaint ${complaintId} Reopened by Student`;
      const htmlContent = buildEmailTemplate({
        headline: `Complaint Reopened for Review`,
        intro: `Dear <strong>${escapeHtml(recipientStaff.name || 'Staff')}</strong>,<br>The reporting student has indicated that complaint <strong>#${escapeHtml(complaintId)}</strong> was not completely resolved and has reopened the ticket.`,
        details: [
          { label: 'Complaint ID', value: complaintId },
          { label: 'Title', value: issue.title },
          { label: 'Student', value: reporter?.name || 'Student' },
          { label: 'Student Reason', value: reason || 'Issue still persists' },
          { label: 'Status', value: 'IN PROGRESS (Reopened)' },
        ],
        alertBox: 'Please inspect the location again and upload a new resolution proof photo once completed.',
      });

      this.sendEmail({
        toEmail: recipientStaff.email,
        toName: recipientStaff.name,
        subject,
        htmlContent,
      });
    }

    // Confirmation to Student
    if (reporter?.email) {
      const studentSubject = `[CampusSetu] Complaint ${complaintId} Successfully Reopened`;
      const studentHtml = buildEmailTemplate({
        headline: `Complaint Reopened`,
        intro: `Dear <strong>${escapeHtml(reporter.name || 'Student')}</strong>,<br>Your complaint <strong>#${escapeHtml(complaintId)}</strong> has been reopened and placed back into the technician queue.`,
        details: [
          { label: 'Complaint ID', value: complaintId },
          { label: 'Title', value: issue.title },
          { label: 'Your Reason', value: reason || 'Unresolved' },
          { label: 'Status', value: 'IN PROGRESS' },
        ],
        alertBox: 'Our department staff will follow up to ensure the issue is completely addressed.',
      });

      this.sendEmail({
        toEmail: reporter.email,
        toName: reporter.name,
        subject: studentSubject,
        htmlContent: studentHtml,
      });
    }
  }

  /**
   * 6. Send email when a complaint is escalated
   */
  async sendComplaintEscalatedEmail({ reporter, issue, escalationLevel, note }) {
    if (!reporter?.email) return { success: false, message: 'No reporter email' };

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const subject = `[CampusSetu Priority] Complaint ${complaintId} Escalated to Level ${escalationLevel}`;

    const htmlContent = buildEmailTemplate({
      headline: `Priority Escalation (Level ${escalationLevel})`,
      intro: `Dear <strong>${escapeHtml(reporter.name || 'Student')}</strong>,<br>Your complaint <strong>#${escapeHtml(complaintId)}</strong> has been escalated to senior administration for accelerated resolution.`,
      details: [
        { label: 'Complaint ID', value: complaintId },
        { label: 'Title', value: issue.title },
        { label: 'Priority', value: 'CRITICAL / ESCALATED' },
        { label: 'Escalation Level', value: `Level ${escalationLevel}` },
        ...(note ? [{ label: 'Leadership Note', value: note }] : []),
      ],
      alertBox: 'Cluster leadership and the Principal’s office have been alerted to expedite resolution.',
    });

    return this.sendEmail({
      toEmail: reporter.email,
      toName: reporter.name,
      subject,
      htmlContent,
    });
  }

  /**
   * 7. Send email when additional info is requested
   */
  async sendInfoRequestedEmail({ reporter, staff, issue, prompt }) {
    if (!reporter?.email) return { success: false, message: 'No reporter email' };

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const subject = `[CampusSetu Action Required] Information Needed for Complaint ${complaintId}`;

    const htmlContent = buildEmailTemplate({
      headline: `Information Needed from You`,
      intro: `Dear <strong>${escapeHtml(reporter.name || 'Student')}</strong>,<br>Technician <strong>${escapeHtml(staff?.name || 'Department Staff')}</strong> needs clarification regarding your complaint.`,
      details: [
        { label: 'Complaint ID', value: complaintId },
        { label: 'Issue Title', value: issue.title },
        { label: 'Staff Request', value: prompt },
      ],
      alertBox: 'Please open CampusSetu mobile app to view the ticket and provide the requested details.',
    });

    return this.sendEmail({
      toEmail: reporter.email,
      toName: reporter.name,
      subject,
      htmlContent,
    });
  }

  /**
   * Task assigned email to staff (preserving backward compatibility)
   */
  async sendTaskAssignedEmail({
    teacher,
    issue,
    assignedBy,
    loginUrl = process.env.TEACHER_LOGIN_URL || 'http://localhost:5173',
  }) {
    if (!teacher?.email) return { success: false, message: 'Staff has no email' };

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const location =
      [issue.building, issue.floor, issue.roomNumber].filter(Boolean).join(', ') ||
      issue.location ||
      '-';
    const reporter = issue.reportedBy || {};
    const subject = `New Complaint Assigned: ${complaintId} - ${issue.title}`;

    const htmlContent = buildEmailTemplate({
      headline: `Complaint Assigned to You`,
      intro: `Dear <strong>${escapeHtml(teacher.name)}</strong>,<br>A campus complaint has been formally assigned to you for inspection and repair.`,
      details: [
        { label: 'Complaint ID', value: complaintId },
        { label: 'Title', value: issue.title },
        { label: 'Description', value: issue.description },
        { label: 'Category', value: issue.category },
        { label: 'Location', value: location },
        { label: 'Priority', value: String(issue.priority || 'medium').toUpperCase() },
        { label: 'Reported By', value: `${reporter.name || 'Student'} (${reporter.email || '-'})` },
        { label: 'Assigned By', value: assignedBy?.name || 'Administration' },
      ],
      alertBox: 'Please mark the complaint <strong>In Progress</strong> when work begins, and upload a proof photo with a resolution note when done.',
      actionButton: {
        text: 'Open CampusSetu Console',
        url: loginUrl,
      },
    });

    return this.sendEmail({
      toEmail: teacher.email,
      toName: teacher.name,
      subject,
      htmlContent,
    });
  }

  /**
   * Backward-compatible alias
   */
  async sendTeacherOnboardingEmail(params) {
    return this.sendStaffOnboardingEmail({ ...params, role: 'staff' });
  }
}

module.exports = new BrevoService();
