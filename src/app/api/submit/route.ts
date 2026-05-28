import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const SHEET_NAME = process.env.GOOGLE_SHEET_TAB ?? 'Responses';

const HEADERS = [
  'Timestamp', 'Name', 'Phone', 'Email', 'City', 'Target Year', 'Status',
  'Optional Subject', 'Sociology Interest', 'Attempts Given', 'Cleared Prelims',
  'Written Mains', 'Reached Interview', 'Main Problem', 'GS Confidence',
  'Prelims Confidence', 'Mains Answer Writing', 'Sociology Confidence',
  'Discipline', 'Revision', 'Test Practice', 'Segment', 'Recommendation',
  'Risk Level', 'Counselor Notes',
];

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function POST(req: NextRequest) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !spreadsheetId) {
    return NextResponse.json({ error: 'Google Sheets not configured' }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const sheets = google.sheets({ version: 'v4', auth: getAuth() });

    // Auto-add headers on first submission
    const check = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${SHEET_NAME}!A1`,
    });
    if (!check.data.values?.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: 'RAW',
        requestBody: { values: [HEADERS] },
      });
    }

    const row = [
      body.timestamp ?? '',
      body.name ?? '',
      body.phone ?? '',
      body.email ?? '',
      body.city ?? '',
      body.targetYear ?? '',
      body.status ?? '',
      body.optionalSubject ?? '',
      body.sociologyInterest ?? '',
      body.attempts ?? '0',
      body.clearedPrelims ?? '',
      body.writtenMains ?? '',
      body.reachedInterview ?? '',
      body.mainProblem ?? '',
      body.gsConfidence ?? '',
      body.prelimsConfidence ?? '',
      body.mainsAnswerWriting ?? '',
      body.sociologyConfidence ?? '',
      body.discipline ?? '',
      body.revision ?? '',
      body.testPractice ?? '',
      body.segment ?? '',
      body.recommendation ?? '',
      body.riskLevel ?? '',
      '', // Counselor Notes — filled manually
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:Y`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Sheets API error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
