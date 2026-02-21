
import React from 'react';
import { VerificationJob } from '../types';
import { Loader2, CheckCircle2, XCircle, AlertTriangle, Clock, PlayCircle, AlertCircle } from 'lucide-react';
import { backendProxy } from '../services/backendProxy';

interface Props {
  job: VerificationJob;
}

const JobProgressPanel: React.FC<Props> = ({ job }) => {
  const progress = Math.round((job.processedCount / job.totalEmails) * 100) || 0;
  
  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this job? Processed results will be saved.")) {
      backendProxy.cancelJob(job.id);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-indigo-500/20 dark:border-indigo-400/20 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl">
            {job.status === 'processing' ? <Loader2 className="text-indigo-500 animate-spin" size={20} /> : <PlayCircle className="text-amber-500" size={20} />}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-none">Verification in Progress</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Job ID: {job.id}</p>
          </div>
        </div>
        <button 
          onClick={handleCancel}
          className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all"
        >
          Cancel Job
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-bold mb-1">
          <span className="text-slate-500">Overall Progress</span>
          <span className="text-indigo-600">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 font-medium">
          <span>{job.processedCount.toLocaleString()} Verified</span>
          <span>{job.remainingCount.toLocaleString()} Remaining</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/10 text-center">
          <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase mb-1">
            <CheckCircle2 size={12} /> Valid
          </div>
          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{job.validCount.toLocaleString()}</span>
        </div>
        <div className="bg-rose-500/5 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-500/10 text-center">
          <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase mb-1">
            <XCircle size={12} /> Invalid
          </div>
          <span className="text-lg font-bold text-rose-700 dark:text-rose-300">{job.invalidCount.toLocaleString()}</span>
        </div>
        <div className="bg-amber-500/5 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-500/10 text-center">
          <div className="flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase mb-1">
            <AlertTriangle size={12} /> Risky
          </div>
          <span className="text-lg font-bold text-amber-700 dark:text-amber-300">{job.riskyCount.toLocaleString()}</span>
        </div>
      </div>

      {job.error && (
        <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-start gap-2">
          <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={14} />
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{job.error}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        <Clock size={12} />
        Estimated Time: {Math.ceil(job.remainingCount / 100) * 15} Seconds
      </div>
    </div>
  );
};

export default JobProgressPanel;
