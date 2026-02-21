
import React from 'react';
import { CreditSummary } from '../types';
import { Database, Zap, UserCheck } from 'lucide-react';
import { backendProxy } from '../services/backendProxy';

interface Props {
  summary: CreditSummary;
}

const CreditsOverview: React.FC<Props> = ({ summary }) => {
  const currentUser = backendProxy.currentUser;
  const userStats = summary.userSpecific;
  const percent = userStats ? (userStats.used / userStats.limit) * 100 : 0;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
          <UserCheck size={22} className="text-indigo-600" />
          Processing Quota
        </h3>
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
          summary.status === 'Healthy' ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
        }`}>
          {summary.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-500 dark:text-slate-400">Quota Usage</span>
          <span className="text-slate-900 dark:text-white">
            {userStats?.used.toLocaleString()} <span className="text-slate-400 mx-1">/</span> {userStats?.limit.toLocaleString()}
          </span>
        </div>
        <div className="w-full h-4 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner p-0.5">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
              percent > 90 ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5">
            <Zap size={12} className="text-indigo-500" /> Percent
          </div>
          <span className="text-xl font-black">{Math.round(percent)}%</span>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5">
            <Database size={12} className="text-indigo-500" /> Remaining
          </div>
          <span className="text-xl font-black">{userStats?.remaining.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CreditsOverview;
