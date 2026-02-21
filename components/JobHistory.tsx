
import React, { useState, useEffect } from 'react';
import { backendProxy } from '../services/backendProxy';
import { VerificationJob } from '../types';
import { History, Download, Trash2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const JobHistory: React.FC = () => {
  const [jobs, setJobs] = useState<VerificationJob[]>([]);

  const fetchJobs = async () => {
    const list = await backendProxy.getJobsList();
    setJobs(list);
  };

  useEffect(() => {
    fetchJobs();
    window.addEventListener('jobs_updated', fetchJobs);
    return () => window.removeEventListener('jobs_updated', fetchJobs);
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Permanently purge this job history?")) {
      await backendProxy.deleteJob(id);
    }
  };

  const exportJob = (job: VerificationJob) => {
    const headers = "Email,Quality,Result,Result Code,Sub Result,Free,Role,Did You Mean,Error,Checked At\n";
    const csvContent = job.results.map(r => 
      `"${r.email}","${r.quality}","${r.result}","${r.resultCode}","${r.subResult}","${r.free}","${r.role}","${r.didYouMean || ''}","${r.error || ''}","${r.checkedAt}"`
    ).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job_${job.id}_results.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <History className="text-indigo-600" />
            Central Job Repository
          </h2>
          <p className="text-sm text-slate-500">Persistent storage of all verification payloads.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">Stamp / ID</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">Metrics</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">Volume</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase text-slate-400 tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {jobs.length > 0 ? jobs.map(job => (
              <tr key={job.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[9px] font-mono opacity-40 uppercase mt-1">{job.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
                      <CheckCircle2 size={12} /> {job.validCount}
                    </div>
                    <div className="flex items-center gap-1 text-rose-500 font-bold text-xs">
                      <XCircle size={12} /> {job.invalidCount}
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <AlertTriangle size={12} /> {job.riskyCount}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold">{job.totalEmails.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 
                    job.status === 'processing' ? 'bg-indigo-500/10 text-indigo-600' : 
                    job.status === 'paused' ? 'bg-amber-500/10 text-amber-600' : 
                    'bg-slate-500/10 text-slate-600'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-1">
                  <button 
                    onClick={() => exportJob(job)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(job.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                  No verified payloads found in repository.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobHistory;
