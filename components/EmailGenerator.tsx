import React, { useState } from 'react';
import { Mail, ArrowRight, Clipboard, ShieldCheck } from 'lucide-react';
import { backendProxy } from '../services/backendProxy';

const EmailGenerator: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [domain, setDomain] = useState('');
  const [generatedEmails, setGeneratedEmails] = useState<string[]>([]);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!firstName || !lastName || !domain) return;

    const fn = firstName.toLowerCase();
    const ln = lastName.toLowerCase();
    const d = domain.toLowerCase();

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

    setGeneratedEmails([...new Set(formats)]); // Remove duplicates
  };

  const handleVerify = async () => {
    if (generatedEmails.length === 0) return;
    setIsLoading(true);
    try {
      await backendProxy.createJob(generatedEmails);
      setToast('Verification job started successfully!');
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      setToast(error.message || 'Failed to start verification job.');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-indigo-500" />
            <span>Email Permutation Generator</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-1">First Name</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-1">Last Name</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block ml-1">Domain</label>
              <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <button onClick={handleGenerate} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 flex items-center justify-center gap-2">
              <ArrowRight size={18} />
              Generate Emails
            </button>
            <button onClick={handleVerify} disabled={generatedEmails.length === 0 || isLoading} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">
              {isLoading ? <span className='animate-spin'>-</span> : <ShieldCheck size={18} />}
              Verify Emails
            </button>
          </div>
        </div>
      </div>
      <div className="lg:col-span-8">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Generated Emails ({generatedEmails.length})</h2>
            {generatedEmails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generatedEmails.map((email, index) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg flex items-center justify-between">
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{email}</span>
                    <button onClick={() => copyToClipboard(email)} className="text-slate-400 hover:text-indigo-500">
                      {copiedEmail === email ? <span className='text-xs text-emerald-500'>Copied!</span> : <Clipboard size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                <p>Enter details and click generate to see email formats.</p>
              </div>
            )}
         </div>
      </div>
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default EmailGenerator;
