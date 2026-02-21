
import React, { useState } from 'react';
import { ShieldCheck, Loader2, UserPlus, Lock, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { backendProxy } from '../services/backendProxy';

interface SignupProps {
  onBack: () => void;
}

const Signup: React.FC<SignupProps> = ({ onBack }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return;
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await backendProxy.signup(userId, password);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-10 text-center relative overflow-hidden">
           <div className="absolute top-0 inset-x-0 h-2 bg-emerald-500" />
          <div className="inline-flex items-center justify-center p-5 bg-emerald-500 rounded-full mb-8">
            <CheckCircle2 className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black mb-4">Registration Complete</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
            Your identity has been established on our cloud network. You can now access the processing cluster.
          </p>
          <button
            onClick={onBack}
            className="w-full py-4.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 transition-transform hover:scale-110">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Join the Network</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium uppercase text-xs tracking-[0.2em]">Cloud Identity Creation</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 relative overflow-hidden group">
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Company Email</label>
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="name@enterprise.com"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Secure Password</label>
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Repeat Password</label>
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-bold"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-black animate-in slide-in-from-top-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-[0.98] mt-2 ${
                isLoading
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Initiating...
                </>
              ) : (
                <>
                  <UserPlus size={22} />
                  Establish Account
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 flex items-center justify-center gap-2 text-sm font-black text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all uppercase tracking-widest"
            >
              <ArrowLeft size={16} />
              Return to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
