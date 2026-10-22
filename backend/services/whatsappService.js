/**
 * WhatsApp Notification Service for CampusSetu
 * Powered by Meta WhatsApp Cloud API (Free tier: 1,000 conversations/month)
 * 
 * Configured via environment variables:
 * - WHATSAPP_ACCESS_TOKEN (Meta system user access token or temporary token)
 * - WHATSAPP_PHONE_NUMBER_ID (From Meta App Dashboard -> WhatsApp -> API Setup)
 * - WHATSAPP_API_VERSION (Default: v21.0)
 * 
 * If credentials are not yet configured, operates in Simulation Mode so
 * the server never throws or crashes.
 */

const mongoose = require('mongoose');

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';
    this.apiUrl = `https://graph.facebook.com/${this.apiVersion}`;

    if (this.accessToken && this.phoneNumberId) {
      console.log('WhatsAppService: Initialized with Meta Cloud API Phone ID:', this.phoneNumberId);
    } else {
      console.log('WhatsAppService: Running in simulation/dev mode (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set)');
    }
  }

  /**
   * Normalize and sanitize phone number to international format
   * Accepts: 9876543210, +919876543210, 09876543210, 919876543210
   * Defaults 10-digit numbers to +91 (India)
   */
  sanitizePhoneNumber(phone) {
    if (!phone) return null;
    let digits = String(phone).replace(/\D/g, '');

    // Strip leading zero if 11 digits (e.g. 09876543210)
    if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    // 10 digits standard mobile -> prepend 91
    if (digits.length === 10) {
      digits = `91${digits}`;
    }

    // Minimum valid international length
    if (digits.length < 11 || digits.length > 15) {
      return null;
    }

    return digits;
  }

  /**
   * Send WhatsApp message via Meta Cloud API (Text or Template)
   */
  async sendMessage({ toPhone, messageText, templateName = null, templateParams = [] }) {
    const cleanPhone = this.sanitizePhoneNumber(toPhone);
    if (!cleanPhone) {
      return { success: false, message: 'Invalid or missing phone number' };
    }

    if (!messageText && !templateName) {
      return { success: false, message: 'Message text or template name required' };
    }

    // If credentials are not configured, simulate sending gracefully
    if (!this.accessToken || !this.phoneNumberId) {
      console.log(`[WhatsAppService (Simulation)] To: +${cleanPhone}\n----------------------------------------\n${messageText || `Template: ${templateName}`}\n----------------------------------------`);
      return { success: true, simulated: true, to: cleanPhone };
    }

    try {
      const payload = templateName
        ? {
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'en_US' },
              ...(templateParams.length > 0
                ? {
                    components: [
                      {
                        type: 'body',
                        parameters: templateParams.map((p) => ({
                          type: 'text',
                          text: String(p),
                        })),
                      },
                    ],
                  }
                : {}),
            },
          }
        : {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'text',
            text: {
              preview_url: false,
              body: messageText,
            },
          };

      const response = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errCode = data?.error?.code;
        const errMsg = data?.error?.message || response.statusText;
        console.error(`[WhatsAppService] Meta API error to +${cleanPhone}: [${errCode}] ${errMsg}`);

        if (errCode === 131047 || String(errMsg).includes('24 hours')) {
          console.warn(`[WhatsAppService] Notice: Recipient +${cleanPhone} is outside the 24-hour service window. Have them send "Hi" to your WhatsApp number to reopen the window.`);
        }

        return { success: false, error: errMsg, code: errCode };
      }

      console.log(`[WhatsAppService] Message dispatched to +${cleanPhone}. ID:`, data?.messages?.[0]?.id);
      return { success: true, messageId: data?.messages?.[0]?.id };
    } catch (err) {
      console.error(`[WhatsAppService] Network error to +${cleanPhone}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * 1. Send confirmation WhatsApp message to student upon complaint registration
   */
  async sendComplaintCreatedReporterWhatsApp({ recipient, issue }) {
    const phone = recipient?.phone;
    if (!phone) return { success: false, message: 'No phone number for student' };

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const location = [issue.building, issue.floor, issue.roomNumber].filter(Boolean).join(', ') || issue.location || 'Campus';
    const reporterName = recipient.name || 'Student';

    const message =
      `🏛️ *CampusSetu — Complaint Lodged*\n\n` +
      `Hello *${reporterName}*,\n` +
      `Your complaint has been successfully registered in the campus grievance portal.\n\n` +
      `📋 *Ticket ID:* #${complaintId}\n` +
      `🏷️ *Title:* ${issue.title}\n` +
      `🏢 *Department:* ${issue.department}\n` +
      `📍 *Location:* ${location}\n` +
      `⚡ *Priority:* ${String(issue.priority || 'medium').toUpperCase()}\n\n` +
      `Department staff has been notified. You can track progress in the CampusSetu app.`;

    return this.sendMessage({ toPhone: phone, messageText: message });
  }

  /**
   * 2. Send broadcast alert to department staff members when new complaint is filed
   */
  async sendComplaintCreatedDepartmentStaffWhatsApp({ staffMembers = [], issue }) {
    let recipients = [...(Array.isArray(staffMembers) ? staffMembers : [])];

    // If recipients missing phone numbers, query from database
    if (recipients.length === 0 || recipients.some((s) => !s?.phone)) {
      try {
        const User = mongoose.model('User');
        const dept = issue?.department;
        if (dept) {
          const freshStaff = await User.find({
            role: { $in: ['staff', 'teacher'] },
            isActive: { $ne: false },
            department: new RegExp(dept.trim(), 'i'),
          }).select('_id name email phone department');

          if (freshStaff && freshStaff.length > 0) {
            recipients = freshStaff;
          }
        }
      } catch (e) {
        console.warn('[WhatsAppService] Fallback staff lookup error:', e.message);
      }
    }

    const validRecipients = recipients.filter((s) => s && s.phone);
    if (validRecipients.length === 0) {
      return { success: false, message: 'No staff phone numbers found' };
    }

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const location = [issue.building, issue.floor, issue.roomNumber].filter(Boolean).join(', ') || issue.location || 'Campus';
    const reporter = issue.reportedBy || {};

    const results = await Promise.all(
      validRecipients.map((staff) => {
        const message =
          `🔔 *CampusSetu — Action Required*\n\n` +
          `Hello *${staff.name || 'Staff Member'}*,\n` +
          `A new ticket has been assigned to the *${issue.department}* queue.\n\n` +
          `📋 *Ticket ID:* #${complaintId}\n` +
          `🏷️ *Issue:* ${issue.title}\n` +
          `📍 *Location:* ${location}\n` +
          `⚡ *Priority:* ${String(issue.priority || 'medium').toUpperCase()}\n` +
          `👤 *Reported by:* ${reporter.name || 'Student'}\n\n` +
          `Open CampusSetu to claim this ticket and start resolution.`;

        return this.sendMessage({ toPhone: staff.phone, messageText: message });
      })
    );

    const successful = results.filter((r) => r.success).length;
    console.log(`[WhatsAppService] Dispatched to staff. Successful: ${successful}/${results.length}`);
    return { success: successful > 0, count: successful };
  }

  /**
   * 3. Send update to student when complaint is claimed or assigned to staff
   */
  async sendComplaintAssignedReporterWhatsApp({ recipient, issue, staffMember }) {
    const phone = recipient?.phone;
    if (!phone) return { success: false, message: 'No phone number for student' };

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const reporterName = recipient.name || 'Student';
    const staffName = staffMember?.name || 'Assigned Staff';
    const staffDept = staffMember?.department || issue.department || 'Maintenance';

    const message =
      `👨‍🏫 *CampusSetu — Official Assigned*\n\n` +
      `Hello *${reporterName}*,\n` +
      `Your complaint *#${complaintId}* (${issue.title}) has been assigned to a campus official.\n\n` +
      `👤 *Assigned Official:* ${staffName}\n` +
      `🏢 *Department:* ${staffDept}\n` +
      `Status is now: *ASSIGNED*\n\n` +
      `You will receive an update as soon as repair/resolution begins.`;

    return this.sendMessage({ toPhone: phone, messageText: message });
  }

  /**
   * 4. Send status update to student (in_progress, resolved, rejected)
   */
  async sendComplaintStatusUpdateReporterWhatsApp({ recipient, issue, status, note }) {
    const phone = recipient?.phone;
    if (!phone) return { success: false, message: 'No phone number for student' };

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const reporterName = recipient.name || 'Student';

    let message = '';

    if (status === 'in_progress') {
      message =
        `🛠️ *CampusSetu — Work In Progress*\n\n` +
        `Hello *${reporterName}*,\n` +
        `The campus maintenance team has started working on your complaint *#${complaintId}* (${issue.title}).\n\n` +
        (note ? `📝 *Progress Note:* "${note}"\n\n` : '') +
        `You will receive another update once resolution is verified.`;
    } else if (status === 'resolved') {
      message =
        `✅ *CampusSetu — Complaint Resolved*\n\n` +
        `Hello *${reporterName}*,\n` +
        `Great news! Your complaint *#${complaintId}* (${issue.title}) has been marked as *RESOLVED*.\n\n` +
        (note ? `📝 *Resolution Note:* "${note}"\n\n` : '') +
        `Please open the CampusSetu app to inspect the proof photo and submit your rating.`;
    } else if (status === 'rejected') {
      message =
        `❌ *CampusSetu — Complaint Rejected*\n\n` +
        `Hello *${reporterName}*,\n` +
        `Your complaint *#${complaintId}* (${issue.title}) has been reviewed and *REJECTED*.\n\n` +
        `⚠️ *Official Rationale:*\n` +
        `"${note || 'Does not meet campus grievance guidelines or is duplicate.'}"\n\n` +
        `If you believe this was done in error, you can reopen this ticket in the CampusSetu app with additional evidence.`;
    } else {
      message =
        `ℹ️ *CampusSetu — Status Update*\n\n` +
        `Hello *${reporterName}*,\n` +
        `Your complaint *#${complaintId}* status has been updated to: *${String(status).toUpperCase()}*.\n\n` +
        (note ? `📝 *Note:* "${note}"\n\n` : '') +
        `Check the CampusSetu app for full timeline details.`;
    }

    return this.sendMessage({ toPhone: phone, messageText: message });
  }

  /**
   * 5. Send alert to staff when student reopens complaint
   */
  async sendComplaintReopenedStaffWhatsApp({ staffMember, issue, reason }) {
    const phone = staffMember?.phone;
    if (!phone) return { success: false, message: 'No phone number for staff' };

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const staffName = staffMember.name || 'Staff Member';

    const message =
      `🔄 *CampusSetu — Complaint Reopened*\n\n` +
      `Hello *${staffName}*,\n` +
      `Complaint *#${complaintId}* (${issue.title}) has been reopened by the student for re-examination.\n\n` +
      `💬 *Student Reopen Reason:*\n` +
      `"${reason}"\n\n` +
      `Please review the ticket in the CampusSetu app.`;

    return this.sendMessage({ toPhone: phone, messageText: message });
  }

  /**
   * 6. Send priority escalation alert
   */
  async sendComplaintEscalatedWhatsApp({ recipient, issue, priority }) {
    const phone = recipient?.phone;
    if (!phone) return { success: false, message: 'No phone number' };

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const name = recipient.name || 'User';

    const message =
      `⚡ *CampusSetu — Priority Escalated*\n\n` +
      `Hello *${name}*,\n` +
      `Complaint *#${complaintId}* (${issue.title}) priority has been escalated to *${String(priority).toUpperCase()}*.\n\n` +
      `Campus leadership has been alerted to prioritize this ticket.`;

    return this.sendMessage({ toPhone: phone, messageText: message });
  }

  /**
   * 7. Send request for more info to student
   */
  async sendInfoRequestedWhatsApp({ recipient, issue, prompt }) {
    const phone = recipient?.phone;
    if (!phone) return { success: false, message: 'No phone number' };

    const complaintId = issue.complaintId || String(issue._id).slice(-6);
    const reporterName = recipient.name || 'Student';

    const message =
      `❓ *CampusSetu — More Details Needed*\n\n` +
      `Hello *${reporterName}*,\n` +
      `The facility team handling your complaint *#${complaintId}* (${issue.title}) requires additional details:\n\n` +
      `💬 *Staff Question:*\n` +
      `"${prompt}"\n\n` +
      `Please open CampusSetu to provide the requested details.`;

    return this.sendMessage({ toPhone: phone, messageText: message });
  }
}

module.exports = new WhatsAppService();
