
import React, { useState } from 'react';
import { ShieldCheck, Loader2, LogIn, Lock, Mail, AlertCircle, UserPlus } from 'lucide-react';
import { backendProxy } from '../services/backendProxy';
import Signup from './Signup';

const Login: React.FC = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      await backendProxy.login(userId, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSignup) {
    return <Signup onBack={() => setShowSignup(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-500/20 mb-6 group transition-transform hover:scale-110">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">VerifySaaS Pro</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium uppercase text-xs tracking-widest">Enterprise Access Gate</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/10 transition-colors" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 block ml-1">
                User Identification
              </label>
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-indigo-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 block ml-1">
                Access Password
              </label>
              <div className="relative group/field">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-indigo-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-[15px] font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-semibold animate-in slide-in-from-top-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4.5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] mt-2 ${
                isLoading
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/25 hover:shadow-indigo-500/40'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Verifying Identity...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Establish Secure Session
                </>
              )}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-800"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-2 text-slate-500">New around here?</span></div>
            </div>

            <button
              type="button"
              onClick={() => setShowSignup(true)}
              className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              <UserPlus size={18} />
              Register Request
            </button>
          </form>
        </div>

        <div className="mt-10 text-center space-y-4">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest leading-relaxed">
            Enterprise Cloud Auth • v3.0.0
          </p>
          <div className="flex items-center justify-center gap-6">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400">Security Node: Active</span>
            <span className="text-[10px] font-bold text-slate-400">Firebase Bridge: Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
