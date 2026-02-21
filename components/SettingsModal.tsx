
import React, { useState, useEffect } from 'react';
import { X, Key, Shield, ExternalLink, Save } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onSave: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onSave }) => {
  const [token, setToken] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('apify_token');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleSave = () => {
    localStorage.setItem('apify_token', token);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-bold">API Settings</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Key size={18} />
              <label className="text-sm font-bold uppercase tracking-wider">Apify API Token</label>
            </div>
            <input 
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your Apify token here..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            />
            <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200 dark:border-amber-500/20 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                <Shield size={16} />
                Security Note
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400/80 leading-relaxed">
                Tokens are stored locally in your browser's localStorage. For production applications, we recommend using a secure backend proxy to protect your credentials.
              </p>
            </div>
          </div>

          <a 
            href="https://console.apify.com/account/integrations" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <ExternalLink size={14} />
            Get your token from Apify Console
          </a>
        </div>

        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

import { Settings } from 'lucide-react';

export default SettingsModal;
