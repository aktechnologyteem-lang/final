
import { ApifyApiResponse } from '../types';

/**
 * Verifies a list of emails using Apify's Email Verifier.
 */
export const verifyEmailsApi = async (emails: string[], token: string): Promise<ApifyApiResponse[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const endpoint = `https://api.apify.com/v2/acts/account56~email-verifier/run-sync-get-dataset-items?token=${token}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emails }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data.map(item => ({
        email: item.email || 'unknown',
        quality: item.quality || 'unknown',
        result: item.result || 'unknown',
        resultCode: item.resultcode ?? '-',
        subResult: item.subresult || '-',
        free: !!item.free,
        role: !!item.role,
        didYouMean: item.didyoumean || '',
        error: item.error || ''
      }));
    }

    throw new Error("Invalid API response format");
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. Try a smaller batch of emails.");
    }
    throw error;
  }
};

export const mapInternalStatus = (result: string): 'valid' | 'invalid' | 'risky' => {
  const s = result.toLowerCase();
  if (s === 'ok' || s === 'valid' || s === 'deliverable') return 'valid';
  if (s === 'invalid' || s === 'undeliverable' || s === 'error') return 'invalid';
  return 'risky';
};
