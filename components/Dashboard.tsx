
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  Moon, 
  Sun, 
  ShieldCheck,
  Download,
  Trash2,
  AlertCircle,
  Key,
  LayoutDashboard,
  History,
  Activity,
  LogOut,
  Users,
  Clock,
  Mail,
  Upload
} from 'lucide-react';
import StatsCards from './StatsCards';
import EmailInput from './EmailInput';
import ResultsTable from './ResultsTable';
import ApiManager from './ApiManager';
import UserManagement from './UserManagement';
import PendingUsers from './PendingUsers';
import CreditsOverview from './CreditsOverview';
import JobHistory from './JobHistory';
import ActiveJobWidget from './ActiveJobWidget';
import JobProgressPanel from './JobProgressPanel';
import Login from './Login';
import EmailGenerator from './EmailGenerator';
import CsvEmailFinder from './CsvEmailFinder';
import { EmailResult, VerificationStats, VerificationJob } from '../types';
import { backendProxy } from '../services/backendProxy';

interface DashboardProps {
  toggleDarkMode: () => void;
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ toggleDarkMode, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'verification' | 'admin' | 'jobs' | 'users' | 'pending' | 'emailGenerator' | 'csvFinder'>('verification');
  const [results, setResults] = useState<EmailResult[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [creditSummary, setCreditSummary] = useState(backendProxy.getCreditSummary());
  const [activeJob, setActiveJob] = useState<VerificationJob | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(backendProxy.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(backendProxy.currentUser);
  const [csvResults, setCsvResults] = useState<any[]>([]);
  const [isCsvLoading, setIsCsvLoading] = useState(false);
  const [csvJobData, setCsvJobData] = useState<Record<string, any[]>>({});
  const [processedCsvJobs, setProcessedCsvJobs] = useState<Set<string>>(new Set());

  const refreshState = () => {
    setIsAuthenticated(backendProxy.isAuthenticated());
    setCurrentUser(backendProxy.currentUser);
    setCreditSummary(backendProxy.getCreditSummary());
  };

  useEffect(() => {
    const handleUpdate = () => refreshState();
    
    window.addEventListener('auth_updated', handleUpdate);
    window.addEventListener('users_updated', handleUpdate);
    window.addEventListener('keys_updated', handleUpdate);
    
    return () => {
      window.removeEventListener('auth_updated', handleUpdate);
      window.removeEventListener('users_updated', handleUpdate);
      window.removeEventListener('keys_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const handleJobsUpdate = async () => {
      const jobs = await backendProxy.getJobsList();
      
      const currentActiveJob = jobs.find(j => j.status === 'processing' || j.status === 'pending');
      setActiveJob(currentActiveJob);
      if (currentActiveJob) {
        setResults(currentActiveJob.results);
        setCsvResults(prev => prev.map(row => {
            if (row.status !== 'processing') return row;
    
            const newPermutations = row.permutations?.map(p => {
                const result = currentActiveJob.results.find(r => r.email === p.email);
                return {
                    ...p,
                    status: result?.status || p.status,
                    quality: result?.quality || p.quality,
                    result: result?.result || p.result,
                };
            });
    
            const allPermutationsChecked = newPermutations?.every(p => p.status !== 'processing' && p.status !== 'pending');
            
            if (allPermutationsChecked) {
                const okEmail = newPermutations.find(p => p.result === 'ok')?.email;
                return { 
                    ...row, 
                    permutations: newPermutations, 
                    status: 'complete', 
                    foundEmail: okEmail || 'Not Found' 
                };
            }
    
            return { ...row, permutations: newPermutations };
        }));
      }

      const completedCsvJobs = jobs.filter(j => 
        j.type === 'csv' && 
        j.status === 'complete' && 
        !processedCsvJobs.has(j.id)
      );

      if (completedCsvJobs.length > 0) {
        let updatedCsvResults = [...csvResults];
        let newProcessedIds = new Set(processedCsvJobs);
        let anyCsvJobProcessed = false;

        for (const job of completedCsvJobs) {
          const originalContacts = csvJobData[job.id];
          if (!originalContacts) continue;

          anyCsvJobProcessed = true;
          const resultMap = new Map(job.results.map(r => [r.email, r]));

          updatedCsvResults = updatedCsvResults.map(csvRow => {
            const wasInJob = originalContacts.some(c => 
                c.firstName === csvRow.firstName && 
                c.lastName === csvRow.lastName && 
                c.domain === csvRow.domain
            );

            if (!wasInJob) return csvRow;

            const permutations = generatePermutations(csvRow.firstName, csvRow.lastName, csvRow.domain);
            
            const finalPermutations = permutations.map(p_email => {
                const resultData = resultMap.get(p_email);
                return {
                    email: p_email,
                    status: resultData?.status || 'pending',
                    quality: resultData?.quality || '',
                    result: resultData?.result || ''
                };
            });

            const okEmail = finalPermutations.find(p => p.result === 'ok')?.email;

            return {
              ...csvRow,
              permutations: finalPermutations,
              foundEmail: okEmail || 'Not Found',
              status: 'complete'
            };
          });
          newProcessedIds.add(job.id);
        }
        
        if (anyCsvJobProcessed) {
            setCsvResults(updatedCsvResults);
            setProcessedCsvJobs(newProcessedIds);

            const stillProcessing = jobs.some(j => 
                j.type === 'csv' && 
                (j.status === 'processing' || j.status === 'pending')
            );
            if (!stillProcessing) {
                setIsCsvLoading(false);
            }
        }
      }

      setCreditSummary(backendProxy.getCreditSummary());
    };

    window.addEventListener('jobs_updated', handleJobsUpdate);
    handleJobsUpdate();
    
    return () => window.removeEventListener('jobs_updated', handleJobsUpdate);
  }, [currentUser, csvResults, csvJobData, processedCsvJobs]);

  useEffect(() => {
    if (activeJob && (activeJob.status === 'processing' || activeJob.status === 'pending')) {
      const interval = setInterval(() => {
        window.dispatchEvent(new CustomEvent('jobs_updated'));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [activeJob]);

  const stats = useMemo<VerificationStats>(() => {
    return {
      total: results.length,
      valid: results.filter(r => r.status === 'valid').length,
      invalid: results.filter(r => r.status === 'invalid').length,
      risky: results.filter(r => r.status === 'risky').length,
    };
  }, [results]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleVerify = async (emails: string[]) => {
    try {
      await backendProxy.createJob(emails);
      showToast(`Verification job started.`, 'success');
      setResults([]);
    } catch (error: any) {
      showToast(error.message || "Failed to start job", "error");
    }
  };

  const handleLogout = () => {
    backendProxy.logout();
    showToast("Logged out successfully", "success");
  };

  const generatePermutations = (firstName: string, lastName: string, domain: string): string[] => {
    if (!firstName || !lastName || !domain) return [];
    const fn = firstName.toLowerCase().trim();
    const ln = lastName.toLowerCase().trim();
    const d = domain.toLowerCase().trim();
    
    // The 8 patterns in priority order
    const formats = [
      `${fn}@${d}`,                  // 1. firstname@domain.com
      `${fn}.${ln}@${d}`,            // 2. firstname.lastname@domain.com
      `${fn}${ln[0]}@${d}`,          // 3. firstnameL@domain.com
      `${fn[0]}${ln}@${d}`,          // 4. flastname@domain.com
      `${fn}-${ln}@${d}`,            // 5. firstname-lastname@domain.com
      `${fn}${ln}@${d}`,             // 6. firstnamelastname@domain.com
      `${fn[0]}.${ln}@${d}`,         // 7. f.lastname@domain.com
      `${fn.substring(0, 2)}@${d}`,  // 8. fi@domain.com (first 2 letters)
    ];
    
    return formats; // Return exactly 8 in order
  };

  const handleFileParsed = (data: any[]) => {
    setCsvResults(data.map(d => ({ ...d, foundEmail: '', status: 'pending', permutations: [] })));
  };

  const handleVerifySelected = async (data: any[]) => {
    if (data.length === 0) {
      showToast('No rows selected', 'error');
      return;
    }
    setIsCsvLoading(true);
    const allPermutationsMap = new Map<string, { email: string; status: 'pending' | 'processing' | 'valid' | 'invalid' | 'risky' }[]>();

    setCsvResults(prev => prev.map(row => {
      const isSelected = data.some(d => d.firstName === row.firstName && d.lastName === row.lastName && d.domain === row.domain);
      if (isSelected) {
        const permutations = generatePermutations(row.firstName, row.lastName, row.domain).map(p => ({ email: p, status: 'processing' as const, quality: '', result: '' }));
        const key = `${row.firstName}-${row.lastName}-${row.domain}`;
        allPermutationsMap.set(key, permutations);
        return { ...row, status: 'processing', permutations };
      }
      return row;
    }));

    const allPermutations = data.flatMap(row => 
      generatePermutations(row.firstName, row.lastName, row.domain)
    );

    try {
      const job = await backendProxy.createJob(allPermutations, 'csv');
      setCsvJobData(prev => ({ ...prev, [job.id]: data }));
      showToast('Bulk verification job started!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to start bulk job', 'error');
      setIsCsvLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl font-extrabold tracking-tight">VerifySaaS Pro</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
              currentUser?.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              {currentUser?.role}
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              ID: <span className="text-slate-900 dark:text-slate-100 font-bold">{currentUser?.userId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <nav className="flex items-center bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mr-2 overflow-x-auto shadow-inner">
            <button 
              onClick={() => setActiveTab('verification')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'verification' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'
              }`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'jobs' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'
              }`}
            >
              <History size={18} />
              History
            </button>
            <button 
              onClick={() => setActiveTab('emailGenerator')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'emailGenerator' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'
              }`}
            >
              <Mail size={18} />
              Generate Email
            </button>
            <button 
              onClick={() => setActiveTab('csvFinder')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'csvFinder' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'
              }`}
            >
              <Upload size={18} />
              Bulk Find
            </button>
            
            {currentUser?.role === 'admin' && (
              <>
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'pending' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'
                  }`}
                >
                  <Clock size={18} />
                  Pending
                </button>
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'users' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'
                  }`}
                >
                  <Users size={18} />
                  Users
                </button>
                <button 
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === 'admin' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'
                  }`}
                >
                  <Key size={18} />
                  APIs
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={toggleDarkMode}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            >
              {isDarkMode ? <Sun size={22} className="text-amber-400" /> : <Moon size={22} className="text-indigo-600" />}
            </button>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 p-3 rounded-2xl border border-rose-200 bg-white dark:bg-slate-900 text-rose-500 shadow-sm font-bold text-sm"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'verification' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            {activeJob && <JobProgressPanel job={activeJob} />}
            <CreditsOverview summary={creditSummary} />
            <StatsCards stats={stats} />
            <EmailInput 
              onVerify={handleVerify} 
              isLoading={!!activeJob} 
              disabled={currentUser?.role !== 'admin' && (creditSummary.userSpecific?.remaining || 0) <= 0}
            />
          </div>

          <div className="lg:col-span-8 space-y-5">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <Activity className={`w-6 h-6 ${activeJob ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
                Live Feed
              </h2>
            </div>
            <ResultsTable results={results} />
          </div>
        </div>
      ) : activeTab === 'jobs' ? (
        <JobHistory />
      ) : activeTab === 'emailGenerator' ? (
        <EmailGenerator />
      ) : activeTab === 'csvFinder' ? (
        <CsvEmailFinder 
          onFileParsed={handleFileParsed}
          onVerifySelected={handleVerifySelected}
          results={csvResults}
          isLoading={isCsvLoading}
        />
      ) : activeTab === 'pending' ? (
        <PendingUsers onUpdate={() => refreshState()} />
      ) : activeTab === 'users' ? (
        <UserManagement onUpdate={() => refreshState()} />
      ) : (
        <ApiManager onUpdate={() => refreshState()} />
      )}

      {activeJob && activeTab !== 'verification' && (
        <ActiveJobWidget job={activeJob} onClick={() => setActiveTab('verification')} />
      )}

      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-8 py-5 rounded-[2rem] shadow-2xl z-[100] border ${
          toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
        } animate-in slide-in-from-bottom-5`}>
          {toast.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
          <p className="font-bold text-lg">{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
