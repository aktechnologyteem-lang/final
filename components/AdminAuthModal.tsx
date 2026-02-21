
import React, { useState } from 'react';
import { Lock, X, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { backendProxy } from '../services/backendProxy';

interface AdminAuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    setError(null);

    try {
      const success = await backendProxy.login(password);
      if (success) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
              <Lock className="text-indigo-600 dark:text-indigo-400" size={28} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Admin Authentication</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
              The Admin Section is protected. Please enter your administrator password to manage API keys and credit rotation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                Admin Password
              </label>
              <input 
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl outline-none focus:ring-4 transition-all text-lg font-mono ${
                  error 
                    ? 'border-rose-500 focus:ring-rose-500/10' 
                    : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/10 focus:border-indigo-500'
                }`}
                disabled={isLoading}
              />
              {error && (
                <div className="flex items-center gap-2 mt-3 text-rose-500 text-sm font-semibold animate-in slide-in-from-top-1">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !password}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] ${
                isLoading || !password
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/25'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Authenticating...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest leading-relaxed">
            Enterprise Security Policy Active • Sessions Encrypted via JWT
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthModal;
