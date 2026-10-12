const PDFDocument = require('pdfkit');
const Issue = require('../models/Issue');

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MARGIN = 40;
const ROW_H = 18;

const columns = [
  { key: 'complaintId', label: 'Complaint ID', width: 80 },
  { key: 'title', label: 'Title', width: 105 },
  { key: 'category', label: 'Category', width: 60 },
  { key: 'status', label: 'Status', width: 60 },
  { key: 'priority', label: 'Priority', width: 45 },
  { key: 'assignedTo', label: 'Assigned To', width: 70 },
  { key: 'created', label: 'Raised', width: 60 },
  { key: 'feedback', label: 'Rating', width: 35 },
];
const TABLE_W = columns.reduce((sum, c) => sum + c.width, 0);

// Built-in PDF fonts only support Latin characters, so strip the rest (emoji etc.).
const clean = (v) => String(v ?? '').replace(/[^\x20-\xFF]/g, '').trim();

const pad = (n) => String(n).padStart(2, '0');

const fmtDate = (d) => {
  if (!d) return '-';
  const x = new Date(d);
  return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`;
};

const label = (s) => clean(String(s || '-').replace(/_/g, ' '));

const buildStats = (issues) => {
  const byStatus = {};
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

    if (i.status === 'resolved' && i.resolvedAt) {
      resolvedMs += new Date(i.resolvedAt) - new Date(i.createdAt);
      resolvedCount += 1;
    }

    if (i.feedback?.rating) {
      ratingSum += i.feedback.rating;
      ratingCount += 1;
    }

    if (i.escalationLevel > 0) escalated += 1;
  }

  let avgResolution = '-';
  if (resolvedCount) {
    const hours = resolvedMs / resolvedCount / 36e5;
    avgResolution =
      hours < 48 ? `${hours.toFixed(1)} hrs` : `${(hours / 24).toFixed(1)} days`;
  }

  return {
    total: issues.length,
    byStatus,
    byPriority,
    byCategory,
    escalated,
    avgResolution,
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
  doc.save().roundedRect(MARGIN, y, TABLE_W, ROW_H, 5).fill('#153C31').restore();

  let x = MARGIN;
  doc.font('Helvetica-Bold').fontSize(8).fillColor('#FFFFFF');

  columns.forEach((c) => {
    doc.text(c.label, x + 4, y + 5, {
      width: c.width - 8,
      height: ROW_H - 6,
      ellipsis: true,
    });
    x += c.width;
  });

  doc.fillColor('#000000');
  return y + ROW_H;
};

const drawMetricCard = (doc, { x, y, width, label: title, value, accent }) => {
  doc.save()
    .roundedRect(x, y, width, 58, 8)
    .fillAndStroke('#F5F8F4', '#E4EBE3')
    .restore();
  doc.save().roundedRect(x, y, 4, 58, 2).fill(accent).restore();
  doc.font('Helvetica-Bold').fontSize(7).fillColor('#718078')
    .text(title.toUpperCase(), x + 12, y + 11, { width: width - 20, ellipsis: true });
  doc.font('Helvetica-Bold').fontSize(17).fillColor('#15342A')
    .text(clean(value), x + 12, y + 26, { width: width - 20, ellipsis: true });
};

/*
 * GET /api/issues/reports/download?type=monthly|yearly|all&month=1-12&year=YYYY
 * Access: principal, cluster_head
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
    let periodLabel = 'All Time';

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
      periodLabel = `Year ${year}`;
    }

    const issues = await Issue.find(filter)
      .populate('assignedTo', 'name')
      .sort({ createdAt: 1 })
      .lean();

    const stats = buildStats(issues);

    const fileName = `CampusSetu-Report-${periodLabel.replace(/\s+/g, '-')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`
    );

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
      bufferPages: true,
    });

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const cardGap = 9;
    const metricWidth = (TABLE_W - cardGap * 3) / 4;

    // ---------- Branded report masthead ----------
    doc.save().rect(0, 0, pageWidth, 128).fill('#0B3027').restore();
    doc.save().rect(0, 124, pageWidth, 4).fill('#C8F36A').restore();
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#C8F36A')
      .text('CAMPUSSETU  /  LEADERSHIP INTELLIGENCE', MARGIN, 25);
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#FFFFFF')
      .text('Campus grievance report', MARGIN, 45);
    doc.font('Helvetica').fontSize(11).fillColor('#D2E1D8')
      .text(periodLabel, MARGIN, 78);
    doc.fontSize(8).fillColor('#AFC7B9')
      .text(
        `Prepared ${fmtDate(new Date())}  |  ${clean(req.user.name)}  |  ${label(req.user.role)}`,
        MARGIN,
        99
      );

    // ---------- At-a-glance metrics ----------
    const activeCount =
      (stats.byStatus.pending || 0) +
      (stats.byStatus.assigned || 0) +
      (stats.byStatus.in_progress || 0);
    const metricY = 148;
    [
      { label: 'Total complaints', value: stats.total, accent: '#176B4D' },
      { label: 'Resolved', value: stats.byStatus.resolved || 0, accent: '#31A675' },
      { label: 'Still active', value: activeCount, accent: '#E6AB3E' },
      {
        label: 'Avg. student rating',
        value: stats.ratingCount ? `${stats.avgRating} / 5` : 'No ratings',
        accent: '#7886D9',
      },
    ].forEach((metric, index) => {
      drawMetricCard(doc, {
        ...metric,
        x: MARGIN + index * (metricWidth + cardGap),
        y: metricY,
        width: metricWidth,
      });
    });

    // ---------- Visual status distribution ----------
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#15342A')
      .text('Portfolio snapshot', MARGIN, 225);
    doc.font('Helvetica-Bold').fontSize(7).fillColor('#718078')
      .text('STATUS DISTRIBUTION', MARGIN, 245);

    const statusColors = {
      pending: '#E8A83B',
      assigned: '#7773D1',
      in_progress: '#438AC7',
      resolved: '#35A477',
      rejected: '#D56C68',
    };
    const statusOrder = ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'];
    let statusX = MARGIN;
    for (const status of statusOrder) {
      const count = stats.byStatus[status] || 0;
      doc.save().circle(statusX + 3, 269, 3).fill(statusColors[status]).restore();
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#57665D')
        .text(label(status), statusX + 10, 265, { width: 82, ellipsis: true });
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#15342A')
        .text(String(count), statusX + 10, 278);
      statusX += 103;
    }

    const barY = 299;
    const barHeight = 8;
    let barX = MARGIN;
    if (stats.total === 0) {
      doc.save().roundedRect(MARGIN, barY, TABLE_W, barHeight, 4).fill('#E4EBE3').restore();
    } else {
      for (const status of statusOrder) {
        const count = stats.byStatus[status] || 0;
        if (!count) continue;
        const segmentWidth = TABLE_W * (count / stats.total);
        doc.save().rect(barX, barY, segmentWidth, barHeight).fill(statusColors[status]).restore();
        barX += segmentWidth;
      }
    }

    // ---------- Additional context ----------
    doc.font('Helvetica-Bold').fontSize(7).fillColor('#718078')
      .text('PRIORITY MIX', MARGIN, 320);
    doc.font('Helvetica').fontSize(8).fillColor('#35483D')
      .text(joinCounts(stats.byPriority), MARGIN, 332, {
        width: TABLE_W,
        height: 12,
        ellipsis: true,
      });
    doc.font('Helvetica-Bold').fontSize(7).fillColor('#718078')
      .text('CATEGORY MIX', MARGIN, 349);
    doc.font('Helvetica').fontSize(8).fillColor('#35483D')
      .text(joinCounts(stats.byCategory), MARGIN, 361, {
        width: TABLE_W,
        height: 12,
        ellipsis: true,
      });
    doc.font('Helvetica').fontSize(8).fillColor('#57665D')
      .text(
        `Escalated: ${stats.escalated}    |    Average resolution: ${stats.avgResolution}    |    Feedback responses: ${stats.ratingCount}`,
        MARGIN,
        381,
        { width: TABLE_W, ellipsis: true }
      );

    // ---------- Complaint register ----------
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#15342A')
      .text('Complaint register', MARGIN, 407);
    doc.font('Helvetica').fontSize(8).fillColor('#718078')
      .text('One row per complaint, ordered from oldest to newest.', MARGIN, 423);

    let y = drawTableHeader(doc, 441);

    if (!issues.length) {
      doc.font('Helvetica').fontSize(10).fillColor('#666666')
        .text('No complaints found for this period.', MARGIN, y + 8);
    }

    issues.forEach((issue, index) => {
      if (y + ROW_H > doc.page.height - 60) {
        doc.addPage();
        y = drawTableHeader(doc, MARGIN);
      }

      if (index % 2 === 0) {
        doc.save().rect(MARGIN, y, TABLE_W, ROW_H).fill('#F3F7F3').restore();
      }

      const row = {
        complaintId: issue.complaintId || String(issue._id).slice(-6),
        title: issue.title,
        category: issue.category,
        status: label(issue.status),
        priority: label(issue.priority),
        assignedTo: issue.assignedTo?.name || '-',
        created: fmtDate(issue.createdAt),
        feedback: issue.feedback?.rating
          ? `${issue.feedback.rating}/5`
          : '-',
      };

      let x = MARGIN;
      doc.font('Helvetica').fontSize(8).fillColor('#000000');

      columns.forEach((c) => {
        doc.text(clean(row[c.key]), x + 4, y + 5, {
          width: c.width - 8,
          height: ROW_H - 6,
          ellipsis: true,
        });
        x += c.width;
      });

      doc.save().moveTo(MARGIN, y + ROW_H).lineTo(MARGIN + TABLE_W, y + ROW_H)
        .lineWidth(0.35).strokeColor('#E8EDE8').stroke().restore();
      y += ROW_H;
    });

    // ---------- Footer with page numbers ----------
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i += 1) {
      doc.switchToPage(range.start + i);
      doc.page.margins.bottom = 0; // allow writing in the footer area
      doc.font('Helvetica').fontSize(8).fillColor('#888888').text(
        `CampusSetu - Confidential  |  Page ${i + 1} of ${range.count}`,
        MARGIN,
        doc.page.height - 30,
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