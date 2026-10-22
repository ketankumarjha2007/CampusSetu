const PDFDocument = require('pdfkit');
const Issue = require('../models/Issue');

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MARGIN = 36;
const ROW_H = 20;

const columns = [
  { key: 'complaintId', label: 'Complaint ID', width: 78 },
  { key: 'title', label: 'Title', width: 116 },
  { key: 'category', label: 'Category / Dept', width: 96 },
  { key: 'location', label: 'Location', width: 80 },
  { key: 'reportedBy', label: 'Reported By', width: 86 },
  { key: 'created', label: 'Report Date', width: 62 },
  { key: 'assignedTo', label: 'Assigned Staff', width: 80 },
  { key: 'status', label: 'Status', width: 58 },
  { key: 'completed', label: 'Completed Date', width: 64 },
  { key: 'rating', label: 'Rating', width: 50 },
];

const TABLE_W = columns.reduce((sum, c) => sum + c.width, 0); // 770 pt

// Built-in PDF fonts only support Latin characters, so strip unsupported emoji
const clean = (v) => String(v ?? '').replace(/[^\x20-\xFF]/g, '').trim();

const pad = (n) => String(n).padStart(2, '0');

const fmtDate = (d) => {
  if (!d) return '-';
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return '-';
  return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`;
};

const label = (s) => clean(String(s || '-').replace(/_/g, ' '));

const buildStats = (issues) => {
  const byStatus = {
    pending: 0,
    assigned: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  };
  const byPriority = {};
  const byCategory = {};
  let resolvedMs = 0;
  let resolvedCount = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  let escalated = 0;

  for (const i of issues) {
    byStatus[i.status] = (byStatus[i.status] || 0) + 1;
    byPriority[i.priority] = (byPriority[i.priority] || 0) + 1;
    byCategory[i.category] = (byCategory[i.category] || 0) + 1;

    if (i.status === 'resolved' && (i.resolvedAt || i.updatedAt)) {
      const completionTime = new Date(i.resolvedAt || i.updatedAt).getTime();
      const creationTime = new Date(i.createdAt).getTime();
      if (completionTime >= creationTime) {
        resolvedMs += completionTime - creationTime;
        resolvedCount += 1;
      }
    }

    if (i.feedback?.rating) {
      ratingSum += Number(i.feedback.rating);
      ratingCount += 1;
    }

    if (Number(i.escalationLevel || 0) > 0) escalated += 1;
  }

  let avgResolution = '-';
  if (resolvedCount) {
    const hours = resolvedMs / resolvedCount / 36e5;
    avgResolution =
      hours < 48 ? `${hours.toFixed(1)} hrs` : `${(hours / 24).toFixed(1)} days`;
  }

  const resolutionRate = issues.length
    ? `${Math.round(((byStatus.resolved || 0) / issues.length) * 100)}%`
    : '0%';

  return {
    total: issues.length,
    byStatus,
    byPriority,
    byCategory,
    escalated,
    avgResolution,
    resolutionRate,
    avgRating: ratingCount ? (ratingSum / ratingCount).toFixed(2) : '-',
    ratingCount,
  };
};

const joinCounts = (obj) =>
  Object.keys(obj).length
    ? Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${label(k)}: ${v}`)
        .join('   |   ')
    : 'None';

const drawTableHeader = (doc, y) => {
  doc.save().roundedRect(MARGIN, y, TABLE_W, ROW_H, 4).fill('#104B38').restore();

  let x = MARGIN;
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');

  columns.forEach((c) => {
    doc.text(c.label, x + 4, y + 6, {
      width: c.width - 8,
      height: ROW_H - 6,
      ellipsis: true,
    });
    x += c.width;
  });

  doc.fillColor('#000000');
  return y + ROW_H;
};

const drawMetricCard = (doc, { x, y, width, label: title, value, subtext, accent }) => {
  doc.save()
    .roundedRect(x, y, width, 52, 6)
    .fillAndStroke('#F5F8F4', '#E4EBE3')
    .restore();
  doc.save().roundedRect(x, y, 4, 52, 2).fill(accent).restore();
  doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#64746B')
    .text(title.toUpperCase(), x + 10, y + 9, { width: width - 16, ellipsis: true });
  doc.font('Helvetica-Bold').fontSize(15).fillColor('#15342A')
    .text(clean(value), x + 10, y + 21, { width: width - 16, ellipsis: true });
  if (subtext) {
    doc.font('Helvetica').fontSize(6.5).fillColor('#718078')
      .text(clean(subtext), x + 10, y + 38, { width: width - 16, ellipsis: true });
  }
};

/*
 * GET /api/issues/reports/download?type=monthly|yearly|all&month=1-12&year=YYYY
 * Access: principal, cluster_head, college_admin, staff, teacher
 */
const downloadReport = async (req, res) => {
  try {
    const type = String(req.query.type || 'all').toLowerCase();

    if (!['monthly', 'yearly', 'all'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be monthly, yearly, or all',
      });
    }

    const now = new Date();
    const year = req.query.year
      ? parseInt(req.query.year, 10)
      : now.getFullYear();
    const month = req.query.month
      ? parseInt(req.query.month, 10)
      : now.getMonth() + 1;

    if (type !== 'all' && (Number.isNaN(year) || year < 2000 || year > 2100)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year',
      });
    }

    if (type === 'monthly' && (Number.isNaN(month) || month < 1 || month > 12)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month (use 1-12)',
      });
    }

    const filter = {};
    let periodLabel = 'All Time Record';

    if (type === 'monthly') {
      filter.createdAt = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      };
      periodLabel = `${MONTH_NAMES[month - 1]} ${year}`;
    } else if (type === 'yearly') {
      filter.createdAt = {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      };
      periodLabel = `Calendar Year ${year}`;
    }

    const issues = await Issue.find(filter)
      .populate('assignedTo', 'name email role department')
      .populate('reportedBy', 'name email role department usn')
      .sort({ createdAt: 1 })
      .lean();

    const stats = buildStats(issues);

    const fileName = `CampusSetu-Report-${periodLabel.replace(/\s+/g, '-')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`
    );

    // Landscape A4 for wide table presentation
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      bufferPages: true,
    });

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const cardGap = 8;
    const metricWidth = (TABLE_W - cardGap * 4) / 5;

    // ---------- Branded report masthead ----------
    doc.save().rect(0, 0, pageWidth, 92).fill('#0B3027').restore();
    doc.save().rect(0, 89, pageWidth, 3).fill('#C8F36A').restore();

    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#C8F36A')
      .text('CAMPUSSETU  /  INSTITUTIONAL RESOLUTION REPORT', MARGIN, 18);
    doc.font('Helvetica-Bold').fontSize(19).fillColor('#FFFFFF')
      .text('Campus Grievance & Accountability Register', MARGIN, 32);
    doc.font('Helvetica').fontSize(10).fillColor('#D2E1D8')
      .text(`Reporting Period: ${periodLabel}`, MARGIN, 56);
    doc.fontSize(7.5).fillColor('#AFC7B9')
      .text(
        `Generated: ${fmtDate(new Date())}  |  Prepared By: ${clean(req.user.name)} (${clean(label(req.user.role))})  |  Total Complaints: ${stats.total}`,
        MARGIN,
        73
      );

    // ---------- At-a-glance metrics ----------
    const activeCount =
      (stats.byStatus.pending || 0) +
      (stats.byStatus.assigned || 0) +
      (stats.byStatus.in_progress || 0);
    const metricY = 104;

    [
      {
        label: 'Total Complaints',
        value: stats.total,
        subtext: 'Filed in period',
        accent: '#176B4D',
      },
      {
        label: 'Resolved',
        value: stats.byStatus.resolved || 0,
        subtext: `${stats.resolutionRate} resolution rate`,
        accent: '#2EA671',
      },
      {
        label: 'Currently Active',
        value: activeCount,
        subtext: `${stats.byStatus.pending || 0} pending review`,
        accent: '#E6A534',
      },
      {
        label: 'Avg. Resolution Time',
        value: stats.avgResolution,
        subtext: 'From filing to resolution',
        accent: '#3B82F6',
      },
      {
        label: 'User Feedback',
        value: stats.ratingCount ? `${stats.avgRating} / 5` : 'No ratings',
        subtext: `${stats.ratingCount} rating(s) submitted`,
        accent: '#8B5CF6',
      },
    ].forEach((metric, index) => {
      drawMetricCard(doc, {
        ...metric,
        x: MARGIN + index * (metricWidth + cardGap),
        y: metricY,
        width: metricWidth,
      });
    });

    // ---------- Summary Distribution Row ----------
    const summaryY = 168;
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#15342A')
      .text('Status & Priority Distribution', MARGIN, summaryY);

    const statusColors = {
      pending: '#E8A83B',
      assigned: '#7773D1',
      in_progress: '#438AC7',
      resolved: '#35A477',
      rejected: '#D56C68',
    };
    const statusOrder = ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'];

    let statusX = MARGIN;
    for (const st of statusOrder) {
      const count = stats.byStatus[st] || 0;
      doc.save().circle(statusX + 3, summaryY + 18, 3).fill(statusColors[st]).restore();
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#57665D')
        .text(`${label(st)}: ${count}`, statusX + 9, summaryY + 14, { width: 90, ellipsis: true });
      statusX += 95;
    }

    doc.font('Helvetica').fontSize(7).fillColor('#64746B')
      .text(
        `Priority: ${joinCounts(stats.byPriority)}    |    Escalations: ${stats.escalated}`,
        statusX + 10,
        summaryY + 14,
        { width: TABLE_W - (statusX - MARGIN) - 10, align: 'right', ellipsis: true }
      );

    // Distribution bar
    const barY = summaryY + 28;
    const barHeight = 5;
    let barX = MARGIN;
    if (stats.total === 0) {
      doc.save().roundedRect(MARGIN, barY, TABLE_W, barHeight, 2.5).fill('#E4EBE3').restore();
    } else {
      for (const st of statusOrder) {
        const count = stats.byStatus[st] || 0;
        if (!count) continue;
        const segmentWidth = TABLE_W * (count / stats.total);
        doc.save().rect(barX, barY, segmentWidth, barHeight).fill(statusColors[st]).restore();
        barX += segmentWidth;
      }
    }

    // ---------- Complaint register table ----------
    const registerTitleY = barY + 14;
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#15342A')
      .text('Detailed Complaint Register', MARGIN, registerTitleY);
    doc.font('Helvetica').fontSize(7).fillColor('#718078')
      .text('Ordered from earliest to latest submission date.', MARGIN, registerTitleY + 12);

    let y = drawTableHeader(doc, registerTitleY + 24);

    if (!issues.length) {
      doc.font('Helvetica').fontSize(9).fillColor('#666666')
        .text('No complaints found for this reporting period.', MARGIN, y + 10);
    }

    issues.forEach((issue, index) => {
      // Check page overflow
      if (y + ROW_H > doc.page.height - 38) {
        doc.addPage();
        y = drawTableHeader(doc, MARGIN);
      }

      if (index % 2 === 0) {
        doc.save().rect(MARGIN, y, TABLE_W, ROW_H).fill('#F6F9F6').restore();
      }

      const reporterName = issue.reportedBy?.name || 'Unknown';
      const reporterRole = issue.reportedBy?.role ? ` (${clean(label(issue.reportedBy.role))})` : '';
      const reporterText = `${reporterName}${reporterRole}`;

      const locParts = [
        issue.building,
        issue.floor ? `Fl ${issue.floor}` : '',
        issue.roomNumber ? `Rm ${issue.roomNumber}` : '',
      ].filter(Boolean);
      const locText = locParts.join(', ') || issue.location || '-';

      const completedText =
        issue.status === 'resolved'
          ? fmtDate(issue.resolvedAt || issue.updatedAt)
          : issue.status === 'rejected'
            ? 'Rejected'
            : '-';

      const ratingText = issue.feedback?.rating
        ? `${issue.feedback.rating}/5`
        : issue.resolutionNote
          ? clean(issue.resolutionNote).slice(0, 16)
          : '-';

      const row = {
        complaintId: issue.complaintId || String(issue._id).slice(-8).toUpperCase(),
        title: issue.title || '-',
        category: issue.department
          ? `${issue.category || 'General'} · ${issue.department}`
          : issue.category || '-',
        location: locText,
        reportedBy: reporterText,
        created: fmtDate(issue.createdAt),
        assignedTo: issue.assignedTo?.name || 'Unassigned',
        status: label(issue.status),
        completed: completedText,
        rating: ratingText,
      };

      let x = MARGIN;
      doc.font('Helvetica').fontSize(7.5).fillColor('#1F2923');

      columns.forEach((c) => {
        // Color-code status and priority
        if (c.key === 'status') {
          const stColor = statusColors[issue.status] || '#1F2923';
          doc.font('Helvetica-Bold').fontSize(7).fillColor(stColor);
        } else if (c.key === 'completed' && issue.status === 'resolved') {
          doc.font('Helvetica-Bold').fontSize(7).fillColor('#15803D');
        } else if (c.key === 'complaintId') {
          doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#104B38');
        } else {
          doc.font('Helvetica').fontSize(7.5).fillColor('#1F2923');
        }

        doc.text(clean(row[c.key]), x + 4, y + 6, {
          width: c.width - 8,
          height: ROW_H - 6,
          ellipsis: true,
        });
        x += c.width;
      });

      doc.save().moveTo(MARGIN, y + ROW_H).lineTo(MARGIN + TABLE_W, y + ROW_H)
        .lineWidth(0.35).strokeColor('#E5EBE5').stroke().restore();
      y += ROW_H;
    });

    // ---------- Footer with page numbers on all pages ----------
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i += 1) {
      doc.switchToPage(range.start + i);
      doc.page.margins.bottom = 0;
      doc.font('Helvetica').fontSize(7).fillColor('#88948D').text(
        `CampusSetu Institutional Portal  •  Confidential Grievance Record  •  Page ${i + 1} of ${range.count}`,
        MARGIN,
        doc.page.height - 22,
        { width: TABLE_W, align: 'center' }
      );
    }

    doc.end();
  } catch (error) {
    console.error('Download report error:', error.message);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate report',
      });
    }

    res.end();
  }
};

module.exports = { downloadReport };
