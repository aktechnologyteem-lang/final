
import React from 'react';
import { VerificationJob } from '../types';
import { Activity, Loader2, ChevronRight } from 'lucide-react';

interface Props {
  job: VerificationJob;
  onClick: () => void;
}

const ActiveJobWidget: React.FC<Props> = ({ job, onClick }) => {
  const progress = Math.round((job.processedCount / job.totalEmails) * 100) || 0;

  return (
    <div 
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-4 bg-white dark:bg-slate-900 p-4 pl-5 rounded-2xl shadow-2xl border border-indigo-500/30 cursor-pointer hover:scale-105 active:scale-95 transition-all group"
    >
      <div className="relative">
        <Loader2 className="text-indigo-500 animate-spin" size={24} />
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-indigo-600 dark:text-indigo-400">
          {progress}%
        </span>
      </div>
      
      <div className="flex flex-col pr-4">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Activity size={12} className="text-indigo-500" />
          Processing Emails...
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          {job.processedCount} / {job.totalEmails} Verified
        </span>
      </div>
      
      <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-colors">
        <ChevronRight size={14} />
      </div>
    </div>
  );
};

export default ActiveJobWidget;
