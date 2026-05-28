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

function getSheets() {
  // Decode the entire service account JSON from base64 — no newline issues
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_BASE64 env var is missing');

  const credentials = JSON.parse(
    Buffer.from(raw, 'base64').toString('utf-8')
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// GET — debug: confirm env vars are loaded
export async function GET() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
  let decoded: Record<string, string> = {};
  try {
    decoded = JSON.parse(Buffer.from(raw ?? '', 'base64').toString('utf-8'));
  } catch {
    /* ignore */
  }

  return NextResponse.json({
    status: 'ok',
    configured: {
      hasBase64Key: !!raw,
      base64Length: raw?.length ?? 0,
      clientEmail: decoded?.client_email ?? 'not decoded',
      hasSheetId: !!process.env.GOOGLE_SHEET_ID,
      sheetTab: process.env.GOOGLE_SHEET_TAB ?? 'missing',
    },
  });
}

export async function POST(req: NextRequest) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_BASE64 || !spreadsheetId) {
    return NextResponse.json({ error: 'Google Sheets not configured' }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const sheets = getSheets();

    // Auto-create headers on first submission
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
      body.timestamp ?? new Date().toISOString(),
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
      '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:Y`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Sheets API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
