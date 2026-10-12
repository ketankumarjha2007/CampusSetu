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
  { key: 'title', label: 'Title', width: 130 },
  { key: 'category', label: 'Category', width: 65 },
  { key: 'status', label: 'Status', width: 60 },
  { key: 'priority', label: 'Priority', width: 50 },
  { key: 'assignedTo', label: 'Assigned To', width: 70 },
  { key: 'created', label: 'Raised', width: 60 },
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
  doc.save().rect(MARGIN, y, TABLE_W, ROW_H).fill('#1F3A5F').restore();

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

    // ---------- Title block ----------
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#1F3A5F')
      .text('CampusSetu - Complaint Report', { align: 'center' });

    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(11).fillColor('#333333')
      .text(`Period: ${periodLabel}`, { align: 'center' });
    doc.fontSize(9).fillColor('#666666').text(
      `Generated on ${fmtDate(new Date())} by ${clean(req.user.name)} (${label(req.user.role)})`,
      { align: 'center' }
    );

    doc.moveDown(1);

    // ---------- Summary ----------
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#1F3A5F').text('Summary');
    doc.moveDown(0.3);
    doc.font('Helvetica').fontSize(10).fillColor('#000000');

    doc.text(`Total complaints: ${stats.total}`);
    doc.text(`By status: ${joinCounts(stats.byStatus)}`);
    doc.text(`By priority: ${joinCounts(stats.byPriority)}`);
    doc.text(`By category: ${joinCounts(stats.byCategory)}`);
    doc.text(`Escalated complaints: ${stats.escalated}`);
    doc.text(`Average resolution time: ${stats.avgResolution}`);
    doc.text(
      `Average student rating: ${stats.avgRating}${
        stats.ratingCount ? ` / 5 (${stats.ratingCount} responses)` : ''
      }`
    );

    doc.moveDown(1);

    // ---------- Table ----------
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#1F3A5F')
      .text('Complaint Details');
    doc.moveDown(0.4);

    let y = drawTableHeader(doc, doc.y);

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
        doc.save().rect(MARGIN, y, TABLE_W, ROW_H).fill('#F3F5F8').restore();
      }

      const row = {
        complaintId: issue.complaintId || String(issue._id).slice(-6),
        title: issue.title,
        category: issue.category,
        status: label(issue.status),
        priority: label(issue.priority),
        assignedTo: issue.assignedTo?.name || '-',
        created: fmtDate(issue.createdAt),
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

      y += ROW_H;
    });

    // ---------- Footer with page numbers ----------
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i += 1) {
      doc.switchToPage(range.start + i);
      doc.page.margins.bottom = 0; // allow writing in the footer area
      doc.font('Helvetica').fontSize(8).fillColor('#888888').text(
        `Page ${i + 1} of ${range.count}`,
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