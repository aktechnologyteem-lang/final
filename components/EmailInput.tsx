
import React, { useState, useRef } from 'react';
import { Send, Upload, FileText, X, Loader2, AlertTriangle, UserX } from 'lucide-react';

interface EmailInputProps {
  onVerify: (emails: string[]) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const EmailInput: React.FC<EmailInputProps> = ({ onVerify, isLoading, disabled }) => {
  const [inputText, setInputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVerifyClick = () => {
    if (disabled) return;
    if (!inputText.trim()) {
      setError('Please enter some emails to verify.');
      return;
    }

    const emails = inputText
      .split(/[\n,;]/)
      .map(e => e.trim())
      .filter(e => e.includes('@'));

    if (emails.length === 0) {
      setError('No valid email patterns found.');
      return;
    }

    setError(null);
    onVerify(emails);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
      setError(null);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden group">
      {disabled && (
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/90 z-[30] flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm animate-in fade-in duration-500">
          <div className="p-4 bg-rose-500/20 rounded-3xl mb-4 border border-rose-500/20">
            <UserX className="text-rose-600" size={40} />
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">Access Restricted</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-[200px]">
            Your credit limit has been reached. Contact Admin.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText className="text-indigo-600" size={20} />
          Batch Engine
        </h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 rounded-xl transition-all flex items-center gap-2"
        >
          <Upload size={14} />
          Upload Dataset
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".csv,.txt" 
        />
      </div>

      <div className="relative mb-6">
        <textarea
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (error) setError(null);
          }}
          placeholder="email1@enterprise.com&#10;email2@enterprise.com"
          className={`w-full h-56 p-5 text-[15px] bg-slate-50 dark:bg-slate-950 border rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none font-mono font-medium ${
            error ? 'border-rose-400' : 'border-slate-200 dark:border-slate-800'
          }`}
          disabled={isLoading || disabled}
        ></textarea>
        <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {inputText.split('\n').filter(l => l.includes('@')).length} emails detected
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm font-bold animate-in slide-in-from-top-1">
          <X size={16} />
          {error}
        </div>
      )}

      <button
        onClick={handleVerifyClick}
        disabled={isLoading || !inputText.trim() || disabled}
        className={`w-full py-5 px-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl active:scale-[0.98] ${
          isLoading || !inputText.trim() || disabled
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 shadow-none'
            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/30 hover:shadow-indigo-500/50'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={24} />
            Establishing Bridge...
          </>
        ) : (
          <>
            <Send size={22} />
            Start Verification Job
          </>
        )}
      </button>
    </div>
  );
};

export default EmailInput;
