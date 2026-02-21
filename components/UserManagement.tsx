
import React, { useState, useEffect } from 'react';
import { backendProxy, MASTER_EMAIL } from '../services/backendProxy';
import { User, UserRole } from '../types';
import { 
  Users, UserPlus, Trash2, Shield, CreditCard, 
  Power, Edit3, X, Save, Mail 
} from 'lucide-react';

interface Props {
  onUpdate: () => void;
}

const UserManagement: React.FC<Props> = ({ onUpdate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [creditLimit, setCreditLimit] = useState(100);

  const fetchUsers = async () => {
    const list = await backendProxy.adminGetUsers();
    setUsers(list);
    onUpdate();
  };

  useEffect(() => {
    fetchUsers();
    window.addEventListener('users_updated', fetchUsers);
    return () => window.removeEventListener('users_updated', fetchUsers);
  }, []);

  const resetForm = () => {
    setUserId('');
    setRole('user');
    setCreditLimit(100);
    setIsAdding(false);
    setEditingUser(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await backendProxy.adminCreateUser(userId, undefined, role, creditLimit);
      resetForm();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await backendProxy.adminUpdateUser(editingUser.id, {
        userId,
        role,
        creditLimit: role === 'admin' ? 999999999 : creditLimit
      });
      resetForm();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      await backendProxy.adminUpdateUser(id, { status: currentStatus === 'active' ? 'disabled' : 'active' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently purge this identity from the network?")) {
      try {
        await backendProxy.adminDeleteUser(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setUserId(user.userId);
    setRole(user.role);
    setCreditLimit(user.creditLimit);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold flex items-center gap-3 text-slate-900 dark:text-white">
            <Users className="text-indigo-600 w-8 h-8" />
            User Ecosystem
          </h2>
          <p className="text-slate-500 font-medium mt-1">Manage global enterprise accounts and verification quotas.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
        >
          <UserPlus size={20} />
          Create Profile
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Profile Identity</th>
              <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Role</th>
              <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Payload Quota</th>
              <th className="px-8 py-5 text-[11px] font-black uppercase text-slate-400 tracking-widest">Status</th>
              <th className="px-8 py-5 text-right text-[11px] font-black uppercase text-slate-400 tracking-widest">Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map(user => {
              const isUserUnlimited = user.creditLimit >= 999999999;
              return (
                <tr key={user.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                        user.role === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}>
                        {user.userId.charAt(0).toUpperCase()}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{user.userId}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      user.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-2 max-w-[150px]">
                      <div className="flex justify-between text-[10px] font-black uppercase gap-4">
                        <span className="text-slate-400">{user.usedCredits} used</span>
                        <span className="text-indigo-600">{isUserUnlimited ? 'Unlim' : user.creditLimit} lim</span>
                      </div>
                      {!isUserUnlimited && (
                        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${user.usedCredits >= user.creditLimit ? 'bg-rose-500' : 'bg-indigo-500'}`}
                            style={{ width: `${Math.min(100, (user.usedCredits / user.creditLimit) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                      user.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 
                      user.status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-xl transition-all disabled:opacity-20"
                        disabled={user.userId === MASTER_EMAIL}
                      >
                        <Power size={18} />
                      </button>
                      <button 
                        onClick={() => startEdit(user)}
                        className="p-2.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/40 rounded-xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-xl transition-all disabled:opacity-20"
                        disabled={user.userId === MASTER_EMAIL}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(isAdding || editingUser) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={resetForm} />
          <form 
            onSubmit={editingUser ? handleUpdate : handleCreate}
            className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <Shield className="text-indigo-600" />
                {editingUser ? 'Edit Profile' : 'Provision User'}
              </h3>
              <button type="button" onClick={resetForm} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Email Identification</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input 
                    type="email"
                    required
                    value={userId}
                    onChange={e => setUserId(e.target.value)}
                    placeholder="user@enterprise.com"
                    disabled={editingUser?.userId === MASTER_EMAIL}
                    className="w-full pl-11 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Access Role</label>
                  <select 
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    disabled={editingUser?.userId === MASTER_EMAIL}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold appearance-none disabled:opacity-50"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Verification Quota</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input 
                      type="number"
                      required
                      value={creditLimit}
                      onChange={e => setCreditLimit(Number(e.target.value))}
                      disabled={role === 'admin'}
                      className="w-full pl-11 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4 text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-indigo-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Commit Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
