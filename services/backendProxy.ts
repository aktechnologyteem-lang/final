
import { 
  ApiKey, CreditSummary, 
  VerificationJob, AuthState, User, UserRole 
} from '../types';

export const MASTER_EMAIL = 'digitalservicegot@gmail.com';

class BackendService {
  private _currentUser: User | undefined;
  private _isAuthenticated: boolean = false;

  constructor() {
    this.checkSession();
  }

  private async checkSession() {
    try {
      const response = await fetch('/api/me');
      if (response.ok) {
        this._currentUser = await response.json();
        this._isAuthenticated = true;
        window.dispatchEvent(new CustomEvent('auth_updated'));
      }
    } catch (e) {
      // Not logged in
    }
  }

  // --- AUTHENTICATION ---
  async login(userId: string, password?: string): Promise<User> {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Login failed");
    }

    const data = await response.json();
    this._currentUser = data.user;
    this._isAuthenticated = true;
    window.dispatchEvent(new CustomEvent('auth_updated'));
    return data.user;
  }

  async signup(userId: string, password?: string): Promise<void> {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Signup failed");
    }
  }

  async logout() {
    // In a real app, we might call a logout endpoint to clear cookies
    // For now, we'll just clear local state and the cookie will expire or we can try to clear it
    this._currentUser = undefined;
    this._isAuthenticated = false;
    window.dispatchEvent(new CustomEvent('auth_updated'));
  }

  get currentUser() { return this._currentUser; }
  isAuthenticated(): boolean { return this._isAuthenticated; }

  // --- ADMIN OPERATIONS ---
  async adminGetUsers(): Promise<User[]> {
    const response = await fetch('/admin/users');
    if (!response.ok) throw new Error("Failed to fetch users");
    return await response.json();
  }

  async adminCreateUser(userId: string, password?: string, role: UserRole = 'user', creditLimit: number = 100): Promise<void> {
    const response = await fetch('/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password, role, creditLimit })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to create user");
    }
    window.dispatchEvent(new CustomEvent('users_updated'));
  }

  async adminUpdateUser(id: string, updates: Partial<User>): Promise<void> {
    const response = await fetch(`/admin/edit-user/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error("Failed to update user");
    window.dispatchEvent(new CustomEvent('users_updated'));
    if (this._currentUser?.id === id) {
       this.checkSession();
    }
  }

  async adminDeleteUser(id: string): Promise<void> {
    const response = await fetch(`/admin/remove-user/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error("Failed to delete user");
    window.dispatchEvent(new CustomEvent('users_updated'));
  }

  // --- API KEY MANAGEMENT ---
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await fetch('/api/keys');
    if (!response.ok) throw new Error("Failed to fetch API keys");
    return await response.json();
  }

  async addKey(name: string, key: string): Promise<ApiKey> {
    const response = await fetch('/api/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, key })
    });
    if (!response.ok) throw new Error("Failed to add key");
    const newKey = await response.json();
    window.dispatchEvent(new CustomEvent('keys_updated'));
    return newKey;
  }

  async deleteKey(id: string) {
    const response = await fetch(`/api/keys/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error("Failed to delete key");
    window.dispatchEvent(new CustomEvent('keys_updated'));
  }

  async toggleKeyStatus(id: string) {
    const response = await fetch(`/api/keys/${id}/toggle`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error("Failed to toggle key status");
    window.dispatchEvent(new CustomEvent('keys_updated'));
  }

  // --- CREDIT SUMMARY ---
  getCreditSummary(): CreditSummary {
    const user = this._currentUser;
    const summary: CreditSummary = { 
      totalAvailable: 0, totalUsed: 0, remaining: 0, 
      percentUsed: 0, daysUntilNextReset: 30, status: 'Healthy' 
    };

    if (user) {
      summary.userSpecific = {
        limit: user.creditLimit,
        used: user.usedCredits,
        remaining: Math.max(0, user.creditLimit - user.usedCredits)
      };
      const usage = (user.usedCredits / user.creditLimit) * 100;
      summary.percentUsed = usage;
      summary.status = usage > 90 ? 'Exhausted' : usage > 70 ? 'Low Credits' : 'Healthy';
      summary.remaining = summary.userSpecific.remaining;
    }

    return summary;
  }

  // --- VERIFICATION ENGINE ---
  async createJob(emails: string[]): Promise<VerificationJob> {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to create job");
    }

    const job = await response.json();
    window.dispatchEvent(new CustomEvent('jobs_updated'));
    return job;
  }

  async getJobsList(): Promise<VerificationJob[]> {
    const response = await fetch('/api/jobs');
    if (!response.ok) return [];
    return await response.json();
  }

  async cancelJob(id: string) {
    const response = await fetch(`/api/jobs/${id}/cancel`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error("Failed to cancel job");
    window.dispatchEvent(new CustomEvent('jobs_updated'));
  }

  async deleteJob(id: string) {
    const response = await fetch(`/api/jobs/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error("Failed to delete job");
    window.dispatchEvent(new CustomEvent('jobs_updated'));
  }
}

export const backendProxy = new BackendService();
