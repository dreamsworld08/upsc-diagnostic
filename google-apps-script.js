/**
 * UPSC Diagnostic Tool — Google Apps Script Backend
 *
 * SETUP INSTRUCTIONS:
 * 1. Open your Google Sheet → Extensions → Apps Script
 * 2. Delete any existing code and paste this entire file
 * 3. Click "Save" (Ctrl+S)
 * 4. Click "Deploy" → "New deployment"
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Click "Deploy" and copy the Web App URL
 * 6. Paste the URL into your .env.local as NEXT_PUBLIC_GOOGLE_SCRIPT_URL
 *
 * SHEET COLUMNS (auto-created on first submission):
 * Timestamp | Name | Phone | Email | City | Target Year | Status |
 * Optional Subject | Sociology Interest | Attempts Given | Cleared Prelims |
 * Written Mains | Reached Interview | Main Problem | GS Confidence |
 * Prelims Confidence | Mains Answer Writing | Sociology Confidence |
 * Discipline | Revision | Test Practice | Segment | Recommendation |
 * Risk Level | Counselor Notes
 */

var SHEET_NAME = 'Responses';

var HEADERS = [
  'Timestamp',
  'Name',
  'Phone',
  'Email',
  'City',
  'Target Year',
  'Status',
  'Optional Subject',
  'Sociology Interest',
  'Attempts Given',
  'Cleared Prelims',
  'Written Mains',
  'Reached Interview',
  'Main Problem',
  'GS Confidence',
  'Prelims Confidence',
  'Mains Answer Writing',
  'Sociology Confidence',
  'Discipline',
  'Revision',
  'Test Practice',
  'Segment',
  'Recommendation',
  'Risk Level',
  'Counselor Notes',
];

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    setupSheet(sheet);
  }

  return sheet;
}

function setupSheet(sheet) {
  // Write headers
  sheet.appendRow(HEADERS);

  // Style header row
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground('#1e3a6e');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(11);

  // Freeze header row
  sheet.setFrozenRows(1);

  // Set column widths
  sheet.setColumnWidth(1, 160); // Timestamp
  sheet.setColumnWidth(2, 140); // Name
  sheet.setColumnWidth(3, 120); // Phone
  sheet.setColumnWidth(4, 180); // Email
  sheet.setColumnWidth(5, 120); // City
  sheet.setColumnWidth(22, 200); // Segment
  sheet.setColumnWidth(23, 260); // Recommendation
  sheet.setColumnWidth(25, 220); // Counselor Notes

  // Add conditional formatting for Risk Level column (X = column 24)
  var riskRange = sheet.getRange('X2:X1000');

  var rules = sheet.getConditionalFormatRules();

  var highRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('High')
    .setBackground('#fce8e6')
    .setFontColor('#c5221f')
    .setRanges([riskRange])
    .build();

  var medRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Medium')
    .setBackground('#fef7e0')
    .setFontColor('#b06000')
    .setRanges([riskRange])
    .build();

  var lowRule = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Low')
    .setBackground('#e6f4ea')
    .setFontColor('#137333')
    .setRanges([riskRange])
    .build();

  rules.push(highRule, medRule, lowRule);
  sheet.setConditionalFormatRules(rules);
}

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var p = e.parameter;

    var formattedTimestamp = '';
    if (p.timestamp) {
      try {
        formattedTimestamp = new Date(p.timestamp).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (dateErr) {
        formattedTimestamp = p.timestamp;
      }
    }

    sheet.appendRow([
      formattedTimestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      p.name || '',
      p.phone || '',
      p.email || '',
      p.city || '',
      p.targetYear || '',
      p.status || '',
      p.optionalSubject || '',
      p.sociologyInterest || '',
      p.attempts || '0',
      p.clearedPrelims || '',
      p.writtenMains || '',
      p.reachedInterview || '',
      p.mainProblem || '',
      Number(p.gsConfidence) || '',
      Number(p.prelimsConfidence) || '',
      Number(p.mainsAnswerWriting) || '',
      Number(p.sociologyConfidence) || '',
      Number(p.discipline) || '',
      Number(p.revision) || '',
      Number(p.testPractice) || '',
      p.segment || '',
      p.recommendation || '',
      p.riskLevel || '',
      '', // Counselor Notes — blank, to be filled manually
    ]);

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    Logger.log('doPost error: ' + err.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'UPSC Diagnostic Script is live' })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this function once manually to create a Dashboard sheet.
 * In Apps Script editor: select "createDashboard" from dropdown and click Run.
 */
function createDashboard() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var dash = ss.getSheetByName('Dashboard');
  if (!dash) {
    dash = ss.insertSheet('Dashboard', 0);
  } else {
    dash.clearContents();
    dash.clearFormats();
  }

  // Title
  dash.getRange('A1').setValue('UPSC Diagnostic — Counselor Dashboard').setFontSize(16).setFontWeight('bold');
  dash.getRange('A1').setFontColor('#1e3a6e');

  dash.getRange('A2').setValue('Auto-updated from Responses sheet').setFontColor('#888888').setFontSize(10);

  // Summary stats section
  dash.getRange('A4').setValue('SUMMARY').setFontWeight('bold').setBackground('#1e3a6e').setFontColor('#ffffff');
  dash.getRange('B4').setValue('').setBackground('#1e3a6e');

  var statsLabels = [
    ['Total Responses', "=COUNTA(Responses!B2:B)"],
    ['High Priority', "=COUNTIF(Responses!X2:X,\"High\")"],
    ['Medium Priority', "=COUNTIF(Responses!X2:X,\"Medium\")"],
    ['Low Priority', "=COUNTIF(Responses!X2:X,\"Low\")"],
  ];

  statsLabels.forEach(function (row, i) {
    dash.getRange(5 + i, 1).setValue(row[0]).setFontWeight('bold');
    dash.getRange(5 + i, 2).setFormula(row[1]);
  });

  // Segment breakdown
  dash.getRange('A10').setValue('SEGMENT BREAKDOWN').setFontWeight('bold').setBackground('#1e3a6e').setFontColor('#ffffff');
  dash.getRange('B10').setValue('COUNT').setFontWeight('bold').setBackground('#1e3a6e').setFontColor('#ffffff');

  var segments = [
    'Repeated Prelims Blocked',
    'Mains Entry Student',
    'Interview Stage but Optional Drag',
    'Sociology Bottleneck',
    'Mentorship Needed',
    'Foundation Needed',
    'Strategy Refinement',
  ];

  segments.forEach(function (seg, i) {
    dash.getRange(11 + i, 1).setValue(seg);
    dash.getRange(11 + i, 2).setFormula('=COUNTIF(Responses!V2:V,"' + seg + '")');
  });

  // Recent entries header
  dash.getRange('A19').setValue('RECENT ENTRIES (Last 10)').setFontWeight('bold').setBackground('#1e3a6e').setFontColor('#ffffff');

  var recentHeaders = ['Date', 'Name', 'Phone', 'City', 'Segment', 'Risk', 'Recommendation'];
  recentHeaders.forEach(function (h, i) {
    dash.getRange(20, 1 + i).setValue(h).setFontWeight('bold').setBackground('#d5e0f5').setFontColor('#1e3a6e');
  });

  // Recent entries data (last 10)
  var recentFormulas = [
    '=IFERROR(INDEX(Responses!A2:A,COUNTA(Responses!A2:A)),"")',
    '=IFERROR(INDEX(Responses!B2:B,COUNTA(Responses!B2:B)),"")',
    '=IFERROR(INDEX(Responses!C2:C,COUNTA(Responses!C2:C)),"")',
    '=IFERROR(INDEX(Responses!E2:E,COUNTA(Responses!E2:E)),"")',
    '=IFERROR(INDEX(Responses!V2:V,COUNTA(Responses!V2:V)),"")',
    '=IFERROR(INDEX(Responses!X2:X,COUNTA(Responses!X2:X)),"")',
    '=IFERROR(INDEX(Responses!W2:W,COUNTA(Responses!W2:W)),"")',
  ];

  // Use SORT + OFFSET approach for last 10 entries
  dash.getRange('A21').setFormula(
    '=IFERROR(SORT(FILTER(Responses!A2:G,Responses!A2:A<>""),1,FALSE),"No data yet")'
  );

  // Column widths
  dash.setColumnWidth(1, 200);
  dash.setColumnWidth(2, 150);
  dash.setColumnWidth(3, 120);
  dash.setColumnWidth(4, 200);
  dash.setColumnWidth(5, 280);
  dash.setColumnWidth(6, 80);
  dash.setColumnWidth(7, 280);

  // Move Dashboard to first position
  ss.setActiveSheet(dash);
  ss.moveActiveSheet(1);

  Logger.log('Dashboard created successfully');
}
