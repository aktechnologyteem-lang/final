
import React, { useState, useEffect } from 'react';
import { backendProxy } from '../services/backendProxy';
import { ApiKey } from '../types';
import { Plus, Key, Trash2, Power } from 'lucide-react';

interface Props {
  onUpdate: () => void;
}

const ApiManager: React.FC<Props> = ({ onUpdate }) => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');

  const fetchKeys = async () => {
    const list = await backendProxy.getApiKeys();
    setKeys(list);
    onUpdate();
  };

  useEffect(() => {
    fetchKeys();
    window.addEventListener('keys_updated', fetchKeys);
    return () => window.removeEventListener('keys_updated', fetchKeys);
  }, []);

  const handleAdd = async () => {
    if (!newName || !newKey) return;
    await backendProxy.addKey(newName, newKey);
    setNewName('');
    setNewKey('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this API key from infrastructure rotation?")) {
      await backendProxy.deleteKey(id);
    }
  };

  const handleToggle = async (id: string) => {
    await backendProxy.toggleKeyStatus(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Infrastructure Pool</h2>
          <p className="text-sm text-slate-500">Global API rotation pool for batch processing cluster.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={18} />
          Add Node Key
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Node Alias</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Fingerprint</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Usage</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold uppercase text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {keys.length > 0 ? keys.map(k => (
              <tr key={k.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-6 py-4 font-bold">{k.name}</td>
                <td className="px-6 py-4 font-mono text-xs opacity-60">••••••••{k.key.slice(-4)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{k.usedCredits} / {k.totalLimit}</span>
                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${k.usedCredits >= k.totalLimit ? 'bg-rose-500' : 'bg-indigo-500'}`}
                        style={{ width: `${(k.usedCredits / k.totalLimit) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    k.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 
                    k.status === 'exhausted' ? 'bg-rose-500/10 text-rose-600' : 
                    'bg-slate-500/10 text-slate-600'
                  }`}>
                    {k.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => handleToggle(k.id)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                  >
                    <Power size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(k.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                  Infrastructure Offline. Please add a valid Apify API Key.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 animate-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Key size={20} className="text-indigo-600" />
              Provision New Node
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1 block ml-1">Alias (Source ID)</label>
                <input 
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Apify Account Primary"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1 block ml-1">API Token</label>
                <input 
                  type="password"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="apify_api_••••••••••••"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Discard
                </button>
                <button 
                  onClick={handleAdd}
                  className="flex-1 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  Save Identity
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiManager;
