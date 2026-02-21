
export type EmailStatus = 'valid' | 'invalid' | 'risky' | 'pending';
export type ApiKeyStatus = 'active' | 'exhausted' | 'disabled';
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'paused';
export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'disabled' | 'pending';

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  usedCredits: number;
  totalLimit: number;
  resetDate: string;
  status: ApiKeyStatus;
  createdAt: string;
}

export interface User {
  id: string;
  userId: string;
  passwordHash?: string; 
  role: UserRole;
  creditLimit: number;
  usedCredits: number;
  status: UserStatus;
  createdAt: string;
}

export interface VerificationJob {
  id: string;
  creatorId: string; 
  totalEmails: number;
  processedCount: number;
  validCount: number;
  invalidCount: number;
  riskyCount: number;
  remainingCount: number;
  status: JobStatus;
  emails: string[];
  results: EmailResult[];
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface CreditSummary {
  totalAvailable: number;
  totalUsed: number;
  remaining: number;
  percentUsed: number;
  daysUntilNextReset: number;
  status: 'Healthy' | 'Low Credits' | 'Exhausted';
  userSpecific?: {
    limit: number;
    used: number;
    remaining: number;
  };
}

export interface EmailResult {
  id: string;
  email: string;
  status: EmailStatus;
  quality: string;
  result: string;
  resultCode: string | number;
  subResult: string;
  free: boolean;
  role: boolean;
  didYouMean?: string;
  error?: string;
  checkedAt: string;
}

/**
 * Interface for raw Apify email verification items after mapping.
 * Used primarily in apifyService.ts for batch processing.
 */
export interface ApifyApiResponse {
  email: string;
  quality: string;
  result: string;
  resultCode: string | number;
  subResult: string;
  free: boolean;
  role: boolean;
  didYouMean: string;
  error: string;
}

export interface VerificationStats {
  total: number;
  valid: number;
  invalid: number;
  risky: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user?: User;
}
