const PDFDocument = require('pdfkit');

const GREEN = '#16a34a';
const GRAY = '#374151';
const LIGHT_GRAY = '#9ca3af';
const BORDER = '#e5e7eb';

function drawHeader(doc, title, subtitle) {
  doc.fillColor(GREEN).fontSize(20).font('Helvetica-Bold').text('EcoSphere', 50, 45);
  doc.fillColor(LIGHT_GRAY).fontSize(9).font('Helvetica').text('Sustainability & ESG Platform', 50, 68);

  doc.fillColor(GRAY).fontSize(15).font('Helvetica-Bold').text(title, 50, 100);
  if (subtitle) {
    doc.fillColor(LIGHT_GRAY).fontSize(10).font('Helvetica').text(subtitle, 50, 122);
  }
  doc.fillColor(LIGHT_GRAY).fontSize(8).text(`Generated ${new Date().toLocaleString()}`, 50, 138);

  doc.moveTo(50, 158).lineTo(545, 158).strokeColor(BORDER).stroke();
  doc.y = 172;
}

function drawFooter(doc) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    doc.fillColor(LIGHT_GRAY).fontSize(8).text(
      `Page ${i + 1} of ${range.count}`,
      50, 780, { align: 'center', width: 495 }
    );
  }
}

/**
 * Minimal table renderer (pdfkit has no built-in tables).
 * columns: [{ label, width, key }]
 */
function drawTable(doc, columns, rows) {
  const startX = 50;
  let y = doc.y + 10;

  // Header row
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
  doc.rect(startX, y, 495, 22).fill(GREEN);
  let x = startX;
  columns.forEach(col => {
    doc.fillColor('#ffffff').text(col.label, x + 6, y + 6, { width: col.width - 12 });
    x += col.width;
  });
  y += 22;

  // Data rows
  doc.font('Helvetica').fontSize(9);
  rows.forEach((row, i) => {
    if (y > 740) {
      doc.addPage();
      y = 50;
    }
    if (i % 2 === 0) {
      doc.rect(startX, y, 495, 20).fill('#f9fafb');
    }
    x = startX;
    columns.forEach(col => {
      const value = typeof col.key === 'function' ? col.key(row) : row[col.key];
      doc.fillColor(GRAY).text(String(value ?? '—'), x + 6, y + 5, { width: col.width - 12 });
      x += col.width;
    });
    doc.strokeColor(BORDER).moveTo(startX, y + 20).lineTo(startX + 495, y + 20).stroke();
    y += 20;
  });

  doc.y = y + 15;
}

function drawSummaryBox(doc, label, value, x) {
  doc.roundedRect(x, doc.y, 155, 55, 4).fillAndStroke('#f0fdf4', BORDER);
  doc.fillColor(LIGHT_GRAY).fontSize(8).font('Helvetica').text(label, x + 12, doc.y - 45);
  doc.fillColor(GREEN).fontSize(18).font('Helvetica-Bold').text(value, x + 12, doc.y - 28);
}

/**
 * Streams a Carbon Summary PDF directly to the response.
 * data: { transactions, totalKg, byDepartment: [{name, totalKg}], startDate, endDate }
 */
function generateCarbonSummaryPDF(res, data) {
  const doc = new PDFDocument({ margin: 50, bufferPages: true });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="carbon-summary-report.pdf"');
  doc.pipe(res);

  const rangeLabel = data.startDate && data.endDate
    ? `${new Date(data.startDate).toLocaleDateString()} – ${new Date(data.endDate).toLocaleDateString()}`
    : 'All time';

  drawHeader(doc, 'Carbon Emissions Summary', rangeLabel);

  const boxY = doc.y + 45;
  doc.y = boxY;
  drawSummaryBox(doc, 'TOTAL EMISSIONS', `${Number(data.totalKg || 0).toLocaleString()} kg`, 50);
  drawSummaryBox(doc, 'TRANSACTIONS', String(data.transactions.length), 220);
  drawSummaryBox(doc, 'DEPARTMENTS', String(data.byDepartment.length), 390);
  doc.y = boxY + 30;

  doc.moveDown(2);
  doc.fillColor(GRAY).fontSize(12).font('Helvetica-Bold').text('Emissions by Department');
  drawTable(doc,
    [
      { label: 'Department', width: 300, key: 'name' },
      { label: 'Total (kg CO2e)', width: 195, key: (r) => Number(r.totalKg).toLocaleString() }
    ],
    data.byDepartment
  );

  doc.addPage();
  doc.fillColor(GRAY).fontSize(12).font('Helvetica-Bold').text('Transaction Detail', 50, 50);
  doc.y = 70;
  drawTable(doc,
    [
      { label: 'Date', width: 80, key: (r) => new Date(r.date).toLocaleDateString() },
      { label: 'Name', width: 160, key: 'name' },
      { label: 'Department', width: 120, key: (r) => r.department?.name || '—' },
      { label: 'Qty', width: 60, key: 'quantity' },
      { label: 'kg CO2e', width: 75, key: (r) => Number(r.emissionKg || 0).toFixed(1) }
    ],
    data.transactions
  );

  drawFooter(doc);
  doc.end();
}

/**
 * data: { esgScores: {environmental, social, governance}, goalsOnTrack, activeGoals,
 *         csrActivitiesThisMonth, complianceIssuesOpen, complianceIssuesOverdue }
 */
function generateEsgOverviewPDF(res, data) {
  const doc = new PDFDocument({ margin: 50, bufferPages: true });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="esg-overview-report.pdf"');
  doc.pipe(res);

  drawHeader(doc, 'ESG Overview Report');

  doc.moveDown(3);
  doc.fillColor(GRAY).fontSize(12).font('Helvetica-Bold').text('ESG Scores');
  drawTable(doc,
    [
      { label: 'Pillar', width: 300, key: 'pillar' },
      { label: 'Score (/100)', width: 195, key: 'score' }
    ],
    [
      { pillar: 'Environmental', score: data.esgScores.environmental },
      { pillar: 'Social', score: data.esgScores.social },
      { pillar: 'Governance', score: data.esgScores.governance }
    ]
  );

  doc.moveDown();
  doc.fillColor(GRAY).fontSize(12).font('Helvetica-Bold').text('Key Metrics');
  drawTable(doc,
    [
      { label: 'Metric', width: 300, key: 'metric' },
      { label: 'Value', width: 195, key: 'value' }
    ],
    [
      { metric: 'Sustainability Goals On Track', value: `${data.goalsOnTrack} / ${data.activeGoals}` },
      { metric: 'CSR Activities This Month', value: data.csrActivitiesThisMonth },
      { metric: 'Open Compliance Issues', value: data.complianceIssuesOpen },
      { metric: 'Overdue Compliance Issues', value: data.complianceIssuesOverdue }
    ]
  );

  drawFooter(doc);
  doc.end();
}

/**
 * data: { issues: [{name, severity, owner, dueDate, status}] }
 */
function generateComplianceReportPDF(res, data) {
  const doc = new PDFDocument({ margin: 50, bufferPages: true });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="compliance-status-report.pdf"');
  doc.pipe(res);

  drawHeader(doc, 'Compliance Status Report');

  const open = data.issues.filter(i => i.status !== 'resolved').length;
  const overdue = data.issues.filter(i => i.status !== 'resolved' && new Date(i.dueDate) < new Date()).length;

  const boxY = doc.y + 45;
  doc.y = boxY;
  drawSummaryBox(doc, 'TOTAL ISSUES', String(data.issues.length), 50);
  drawSummaryBox(doc, 'OPEN', String(open), 220);
  drawSummaryBox(doc, 'OVERDUE', String(overdue), 390);
  doc.y = boxY + 30;

  doc.moveDown(2);
  drawTable(doc,
    [
      { label: 'Issue', width: 155, key: 'name' },
      { label: 'Severity', width: 80, key: 'severity' },
      { label: 'Owner', width: 100, key: (r) => r.owner?.name || '—' },
      { label: 'Due Date', width: 80, key: (r) => new Date(r.dueDate).toLocaleDateString() },
      { label: 'Status', width: 80, key: 'status' }
    ],
    data.issues
  );

  drawFooter(doc);
  doc.end();
}

module.exports = { generateCarbonSummaryPDF, generateEsgOverviewPDF, generateComplianceReportPDF };
