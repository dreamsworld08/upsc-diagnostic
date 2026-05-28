import { ResultData } from './types';

export async function submitToSheets(data: ResultData): Promise<void> {
  try {
    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.error('Submission failed:', err);
  }
}
