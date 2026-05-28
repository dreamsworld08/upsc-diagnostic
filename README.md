# UPSC Diagnostic Tool

Free, no-login UPSC counseling assessment. Built with Next.js + TypeScript + Tailwind CSS. Saves to **Google Sheets via Service Account** — no Apps Script, no Web App deployment, no authorization dialogs.

---

## How it works

```
Student fills form
      ↓
POST /api/submit  (Next.js server route on Vercel)
      ↓
Google Sheets API (service account writes directly to your sheet)
```

Your Google Sheet credentials never touch the browser — they live only on Vercel's servers.

---

## Setup Guide

### Step 1 — Install

```bash
cd upsc-diagnostic
npm install
```

---

### Step 2 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) → create a new blank spreadsheet
2. Name it: `UPSC Diagnostic Responses`
3. Rename the first tab (bottom) to: `Responses`
4. **Copy the Sheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_IS_YOUR_SHEET_ID`**`/edit`

---

### Step 3 — Create a Service Account (one-time, ~5 min)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. **Create a new project** (or select existing) → give it any name
3. In the search bar, search **"Google Sheets API"** → click Enable
4. In the left menu: **IAM & Admin → Service Accounts**
5. Click **+ Create Service Account**
   - Name: `upsc-diagnostic` → click **Create and Continue** → **Done**
6. Click on the new service account → go to **Keys** tab
7. **Add Key → Create new key → JSON** → Download the file

---

### Step 4 — Share your sheet with the service account

1. Open the downloaded JSON file in a text editor
2. Copy the value of **`"client_email"`** (looks like `upsc-diagnostic@your-project.iam.gserviceaccount.com`)
3. Open your Google Sheet → click **Share** (top right)
4. Paste that email → set role to **Editor** → click **Send**

---

### Step 5 — Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```
GOOGLE_CLIENT_EMAIL=   ← "client_email" from the JSON file
GOOGLE_PRIVATE_KEY=    ← "private_key" from the JSON file (paste the full value with \n characters)
GOOGLE_SHEET_ID=       ← Sheet ID from the URL (Step 2)
GOOGLE_SHEET_TAB=Responses
```

> **Tip for `GOOGLE_PRIVATE_KEY`:** Open the JSON, find `"private_key"`, and paste the entire value
> (from `-----BEGIN RSA PRIVATE KEY-----` to `-----END RSA PRIVATE KEY-----\n`) wrapped in double quotes.

---

### Step 6 — Run locally

```bash
npm run dev
```

Fill the form at [http://localhost:3000](http://localhost:3000) and check your Google Sheet — headers are added automatically on the first submission.

---

## Deploy to Vercel (Free)

1. Push to GitHub
2. [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Under **Environment Variables**, add all four:

| Key | Value |
|---|---|
| `GOOGLE_CLIENT_EMAIL` | service account email |
| `GOOGLE_PRIVATE_KEY` | full private key string |
| `GOOGLE_SHEET_ID` | your sheet ID |
| `GOOGLE_SHEET_TAB` | `Responses` |

> In Vercel's dashboard you can paste the private key as-is — multi-line values are supported.

4. Click **Deploy** — done.

---

## Google Sheet columns (auto-created)

| Column | Field |
|---|---|
| A | Timestamp |
| B | Name |
| C | Phone |
| D | Email |
| E | City |
| F | Target Year |
| G | Status |
| H | Optional Subject |
| I | Sociology Interest |
| J | Attempts Given |
| K | Cleared Prelims |
| L | Written Mains |
| M | Reached Interview |
| N | Main Problem |
| O | GS Confidence |
| P | Prelims Confidence |
| Q | Mains Answer Writing |
| R | Sociology Confidence |
| S | Discipline |
| T | Revision |
| U | Test Practice |
| V | Segment |
| W | Recommendation |
| X | Risk Level |
| Y | Counselor Notes |

---

## Diagnosis Logic

| Condition | Segment | Risk |
|---|---|---|
| Attempts ≥ 2 and Prelims not cleared | Repeated Prelims Blocked | High |
| Cleared Prelims but Mains not written | Mains Entry Student | Medium |
| Reached Interview + Sociology ≤ 3 | Interview Stage but Optional Drag | Medium |
| Sociology Interest = Yes + Sociology ≤ 3 | Sociology Bottleneck | Medium |
| Discipline ≤ 2 OR Revision ≤ 2 | Mentorship Needed | High |
| Attempts ≤ 1 + GS Confidence ≤ 2 | Foundation Needed | Medium |
| Otherwise | Strategy Refinement | Low |

---

## Customise

- **WhatsApp CTA**: in `src/app/result/page.tsx` update the `wa.me/91XXXXXXXXXX` number
- **Institute name**: in `src/app/layout.tsx` update the header text
- **Diagnosis rules**: edit `src/lib/diagnosis.ts` — each `if` block is one rule
