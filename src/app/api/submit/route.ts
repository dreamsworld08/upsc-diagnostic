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

/**
 * Handles both formats Netlify/Vercel may store the key:
 *   1. Literal \n  →  "-----BEGIN...\nMIIE..."   (env var with escaped newlines)
 *   2. Real newlines →  "-----BEGIN...\nMIIE..."  (multi-line env var)
 */
function parsePrivateKey(raw: string | undefined): string {
  if (!raw) return '';
  // Replace literal backslash-n with actual newline
  return raw.replace(/\\n/g, '\n');
}

function getSheets() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY);

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// GET — debug endpoint: confirms env vars are loaded (safe, no secrets exposed)
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    configured: {
      hasEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
      emailPrefix: process.env.GOOGLE_CLIENT_EMAIL?.split('@')[0] ?? 'missing',
      hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
      keyStart: process.env.GOOGLE_PRIVATE_KEY?.slice(0, 27) ?? 'missing',
      hasSheetId: !!process.env.GOOGLE_SHEET_ID,
      sheetTab: process.env.GOOGLE_SHEET_TAB ?? 'missing',
    },
  });
}

export async function POST(req: NextRequest) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !spreadsheetId) {
    console.error('Missing env vars:', {
      hasEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
      hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
      hasSheetId: !!spreadsheetId,
    });
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
