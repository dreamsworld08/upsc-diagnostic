import { ResultData } from './types';

export async function submitToSheets(data: ResultData): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error('Sheet submission failed:', json.error);
      return { success: false, error: json.error };
    }

    return { success: true };
  } catch (err) {
    console.error('Sheet submission error:', err);
    return { success: false, error: String(err) };
  }
}
