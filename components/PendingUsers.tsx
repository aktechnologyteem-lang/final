
import React, { useState, useEffect } from 'react';
import { backendProxy } from '../services/backendProxy';
import { User } from '../types';
import { 
  Trash2, Clock, 
  CreditCard, X, Save, ShieldCheck 
} from 'lucide-react';

interface Props {
  onUpdate: () => void;
}

const PendingUsers: React.FC<Props> = ({ onUpdate }) => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [approvingUser, setApprovingUser] = useState<User | null>(null);
  const [creditLimit, setCreditLimit] = useState(1000);

  const fetchPending = async () => {
    const list = await backendProxy.adminGetUsers();
    setPendingUsers(list.filter(u => u.status === 'pending'));
    onUpdate();
  };

  useEffect(() => {
    fetchPending();
    window.addEventListener('users_updated', fetchPending);
    return () => window.removeEventListener('users_updated', fetchPending);
  }, []);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingUser) return;
    try {
      await backendProxy.adminUpdateUser(approvingUser.id, { 
        status: 'active', 
        creditLimit: creditLimit 
      });
      setApprovingUser(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("Purge this access request permanently?")) {
      try {
        await backendProxy.adminDeleteUser(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
            <Clock className="text-amber-500 w-8 h-8" />
            Gateway Queue
          </h2>
          <p className="text-slate-500 font-medium mt-1">Review new registration requests awaiting network authorization.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Entry Date</th>
              <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">User Identification</th>
              <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">State</th>
              <th className="px-8 py-5 text-right text-[11px] font-black uppercase text-slate-400 tracking-widest">Authorization</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {pendingUsers.length > 0 ? pendingUsers.map(user => (
              <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-8 py-6 text-[13px] font-bold text-slate-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-8 py-6">
                  <div className="font-black text-slate-900 dark:text-slate-100">{user.userId}</div>
                </td>
                <td className="px-8 py-6">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 border border-amber-500/10">
                    PENDING
                  </span>
                </td>
                <td className="px-8 py-6 text-right space-x-3">
                  <button 
                    onClick={() => setApprovingUser(user)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    Grant Access
                  </button>
                  <button 
                    onClick={() => handleReject(user.id)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                  Queue Empty. All requests processed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {approvingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in" onClick={() => setApprovingUser(null)} />
          <form 
            onSubmit={handleApprove}
            className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-10 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <ShieldCheck className="text-indigo-600 w-8 h-8" />
                Security Clearance
              </h3>
              <button type="button" onClick={() => setApprovingUser(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X size={24} />
              </button>
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed font-medium">
              Provisioning access for <span className="font-black text-slate-900 dark:text-white">{approvingUser.userId}</span>. Define their initial processing quota.
            </p>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-1">Assigned Verification Quota</label>
                <div className="relative group">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input 
                    type="number"
                    required
                    value={creditLimit}
                    onChange={e => setCreditLimit(Number(e.target.value))}
                    className="w-full pl-12 pr-5 py-4.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-black text-xl"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setApprovingUser(null)}
                  className="flex-1 py-4.5 text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4.5 bg-indigo-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Authorize User
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PendingUsers;
