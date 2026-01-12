
import React, { useState } from 'react';
import { AccountBalance, User, UserRole } from '../types';

interface ManagementViewProps {
  balances: AccountBalance;
  onUpdateLimit: (newLimit: number) => void;
  onResetData: () => void;
  rawDatabase: any;
  users: User[];
  currentUser: User;
  onUpdateUsers: (newUsers: User[]) => void;
}

const ManagementView: React.FC<ManagementViewProps> = ({ 
  balances, 
  onUpdateLimit, 
  onResetData, 
  rawDatabase,
  users,
  currentUser,
  onUpdateUsers
}) => {
  const [newLimit, setNewLimit] = useState<number>(balances.pettyCashLimit);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatabase, setShowDatabase] = useState(false);
  
  // User Management Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdateLimit(newLimit);
      setIsSaving(false);
      alert("Settings updated successfully!");
    }, 500);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.find(u => u.username === newUsername)) {
      alert("Username already exists!");
      return;
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      username: newUsername,
      password: newPassword,
      role: newRole
    };
    onUpdateUsers([...users, newUser]);
    setNewUsername('');
    setNewPassword('');
    alert("User created successfully!");
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.username === 'root') {
      alert("Cannot delete the root administrator.");
      return;
    }
    if (userId === currentUser.id) {
      alert("Cannot delete your own account.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete user ${userToDelete?.username}?`)) {
      onUpdateUsers(users.filter(u => u.id !== userId));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(rawDatabase, null, 2));
    alert("Database JSON copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Financial Configuration Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
          <h2 className="text-2xl font-bold text-slate-800">Financial Policy Management</h2>
          <p className="text-slate-500 mt-1 text-sm">Configure operational limits and financial constraints.</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSave} className="space-y-10">
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Petty Cash Limits</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Maximum Petty Cash ($)</label>
                    <input 
                      type="number" 
                      min="0"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-bold text-slate-900 transition-shadow"
                      value={newLimit}
                      onChange={e => setNewLimit(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Current Status</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Balance</span>
                      <span className="text-lg font-bold text-slate-800">${balances.pettyCash.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Defined Limit</span>
                      <span className="text-lg font-bold text-slate-800">${balances.pettyCashLimit.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
              >
                {isSaving ? "Updating..." : 'Save Financial Policy'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* User Management Card (Only for Admins) */}
      {currentUser.role === UserRole.ADMIN && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/30">
            <h2 className="text-2xl font-bold text-slate-800">User Access Management</h2>
            <p className="text-slate-500 mt-1 text-sm">Control who can access the system and manage their permissions.</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Create User Form */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Create New Access
              </h3>
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="john.doe"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                  <select
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                  >
                    <option value={UserRole.USER}>User (ReadOnly/Basic)</option>
                    <option value={UserRole.ADMIN}>Admin (Full Access)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg shadow-md transition-all active:scale-95"
                >
                  Create User
                </button>
              </form>
            </div>

            {/* Users List */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Authorized Personnel</h3>
              <div className="overflow-hidden border border-slate-100 rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-3 font-bold">Username</th>
                      <th className="px-6 py-3 font-bold">Role</th>
                      <th className="px-6 py-3 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900">{u.username}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.username === 'root' || u.id === currentUser.id}
                            className="text-rose-400 hover:text-rose-600 disabled:opacity-30 p-1 rounded-lg hover:bg-rose-50 transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Explorer Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">System Data Explorer</h2>
            <p className="text-slate-500 text-sm">View the raw application "database" in JSON format.</p>
          </div>
          <button 
            onClick={() => setShowDatabase(!showDatabase)}
            className="text-indigo-600 font-semibold hover:underline"
          >
            {showDatabase ? 'Hide Data' : 'View Raw Data'}
          </button>
        </div>
        
        {showDatabase && (
          <div className="p-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Raw Application State</span>
              <button 
                onClick={copyToClipboard}
                className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold text-slate-600 flex items-center gap-2 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                Copy JSON
              </button>
            </div>
            <div className="bg-slate-900 rounded-xl p-6 overflow-hidden border border-slate-800">
              <pre className="text-emerald-400 font-mono text-sm overflow-x-auto max-h-[400px]">
                {JSON.stringify(rawDatabase, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-50 rounded-2xl p-8 border border-rose-100 flex items-center justify-between">
        <div>
          <h3 className="text-rose-900 font-bold text-lg">Danger Zone</h3>
          <p className="text-rose-600 text-sm">Clear all financial records and reset balances. (Preserves users)</p>
        </div>
        <button 
          onClick={onResetData}
          className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-all shadow-md active:scale-95"
        >
          Reset Financial Data
        </button>
      </div>
    </div>
  );
};

export default ManagementView;
