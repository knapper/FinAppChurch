
import React, { useState, useMemo, useEffect } from 'react';
import { TransferRecord, AccountBalance, AccountType } from '../types';

interface RecordTransferProps {
  onSave: (record: TransferRecord) => void;
  balances: AccountBalance;
  transfers: TransferRecord[];
}

const RecordTransfer: React.FC<RecordTransferProps> = ({ onSave, balances, transfers }) => {
  const [displayLimit, setDisplayLimit] = useState<number>(10);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferRecord | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    fromAccount: 'Cash in Hand' as AccountType,
    toAccount: 'Bank' as AccountType,
    amount: 0,
    description: 'Bank Deposit from Service'
  });

  useEffect(() => {
    if (transferError) setTransferError(null);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let available = 0;
    if (formData.fromAccount === 'Bank') available = balances.bank;
    if (formData.fromAccount === 'Petty Cash') available = balances.pettyCash;
    if (formData.fromAccount === 'Cash in Hand') available = balances.cashInHand;
    
    if (formData.amount > available) {
      setTransferError(`Insufficient funds in ${formData.fromAccount}! Available: $${available.toLocaleString()}`);
      return;
    }

    if (formData.fromAccount === formData.toAccount) {
      setTransferError("Source and destination accounts must be different.");
      return;
    }

    if (formData.toAccount === 'Petty Cash') {
      const currentPettyCash = balances.pettyCash;
      const limit = balances.pettyCashLimit;
      const projectedAmount = currentPettyCash + formData.amount;
      
      if (projectedAmount > limit) {
        setTransferError(`Transfer blocked! The resulting amount would be $${projectedAmount.toLocaleString()}, which is beyond the limit of $${limit.toLocaleString()} established for Petty Cash.`);
        return;
      }
    }

    onSave({
      id: crypto.randomUUID(),
      ...formData
    });

    setFormData({
      date: new Date().toISOString().split('T')[0],
      fromAccount: 'Cash in Hand',
      toAccount: 'Bank',
      amount: 0,
      description: 'Bank Deposit'
    });
    setTransferError(null);
  };

  const handleAccountChange = (field: 'fromAccount' | 'toAccount', value: AccountType) => {
    setFormData(prev => {
      const newState = { ...prev, [field]: value };
      if (newState.fromAccount === newState.toAccount) {
         if (field === 'fromAccount') {
           newState.toAccount = value === 'Bank' ? 'Petty Cash' : 'Bank';
         } else {
           newState.fromAccount = value === 'Bank' ? 'Cash in Hand' : 'Bank';
         }
      }
      return newState;
    });
  };

  const recentTransfers = useMemo(() => {
    return [...transfers]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, displayLimit);
  }, [transfers, displayLimit]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Transfer Funds</h2>
        <p className="text-slate-500 text-sm mb-8 text-center italic">Example: Deposit Sunday's cash to the Bank or refill Petty Cash from the Bank.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-inner">
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Source (From)</label>
              <select 
                className="w-full bg-white p-3 border border-slate-300 rounded-xl text-lg font-black text-slate-900 outline-none cursor-pointer appearance-none"
                value={formData.fromAccount}
                onChange={e => handleAccountChange('fromAccount', e.target.value as AccountType)}
              >
                <option value="Cash in Hand">Cash in Hand (${balances.cashInHand.toLocaleString()})</option>
                <option value="Bank">Bank Account (${balances.bank.toLocaleString()})</option>
                <option value="Petty Cash">Petty Cash (${balances.pettyCash.toLocaleString()})</option>
              </select>
            </div>

            <div className="bg-indigo-100 p-4 rounded-xl border border-indigo-200 shadow-inner">
              <label className="block text-[10px] font-black text-indigo-500 uppercase mb-2 tracking-widest">Destination (To)</label>
              <select 
                className="w-full bg-white p-3 border border-slate-300 rounded-xl text-lg font-black text-slate-900 outline-none cursor-pointer appearance-none"
                value={formData.toAccount}
                onChange={e => handleAccountChange('toAccount', e.target.value as AccountType)}
              >
                <option value="Bank">Bank Account (${balances.bank.toLocaleString()})</option>
                <option value="Petty Cash">Petty Cash (${balances.pettyCash.toLocaleString()})</option>
                <option value="Cash in Hand">Cash in Hand (${balances.cashInHand.toLocaleString()})</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Description</label>
              <input 
                type="text" 
                required
                className="w-full p-3.5 bg-slate-100 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Amount ($)</label>
                <input 
                  type="number" 
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full p-3.5 bg-slate-100 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xl font-black text-slate-900"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Date</label>
                <input 
                  type="date" 
                  className="w-full p-3.5 bg-slate-100 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>
          </div>

          {transferError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="bg-rose-100 p-1 rounded-full text-rose-600 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <p className="text-sm font-bold text-rose-800 leading-relaxed">
                {transferError}
              </p>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-xl transition-all shadow-xl transform active:scale-95 uppercase tracking-widest text-sm"
          >
            Confirm Transfer
          </button>
        </form>
      </div>
      
      {/* Rest of component remains the same for Recent Transfers... */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recent Transfers</h3>
          <div className="flex gap-2">
            {[10, 20, 50].map(limit => (
              <button 
                key={limit}
                onClick={() => setDisplayLimit(limit)}
                className={`text-xs px-2 py-1 rounded ${displayLimit === limit ? 'bg-indigo-100 text-indigo-700 font-bold' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {limit}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-slate-600 font-bold uppercase text-[10px]">Date</th>
                <th className="px-4 py-2 text-slate-600 font-bold uppercase text-[10px]">Path</th>
                <th className="px-4 py-2 text-slate-600 font-bold uppercase text-[10px]">Description</th>
                <th className="px-4 py-2 text-right text-slate-600 font-bold uppercase text-[10px]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentTransfers.map(tr => (
                <tr 
                  key={tr.id} 
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedTransfer(tr)}
                >
                  <td className="px-4 py-4 text-slate-500 font-medium">{tr.date}</td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-black text-slate-900 uppercase">{tr.fromAccount}</span>
                    <span className="mx-2 text-slate-300">→</span>
                    <span className="text-xs font-black text-indigo-600 uppercase">{tr.toAccount}</span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 truncate max-w-[150px] font-medium">{tr.description}</td>
                  <td className="px-4 py-4 text-right font-black text-indigo-600 text-base">${tr.amount.toLocaleString()}</td>
                </tr>
              ))}
              {recentTransfers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No transfers recorded yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTransfer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-slate-900">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-bold text-xl text-slate-800">Transfer Details</h4>
              <button onClick={() => setSelectedTransfer(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex justify-between text-sm">
                <span className="text-slate-500 uppercase font-bold text-xs tracking-wider">Date</span>
                <span className="font-medium text-slate-900">{selectedTransfer.date}</span>
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl flex items-center justify-center gap-6 border border-blue-100 shadow-sm">
                <div className="text-center">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">From</p>
                   <p className="text-xs font-black text-blue-900 uppercase">{selectedTransfer.fromAccount}</p>
                </div>
                <div className="text-blue-300">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
                <div className="text-center">
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">To</p>
                   <p className="text-xs font-black text-blue-900 uppercase">{selectedTransfer.toAccount}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Memo</p>
                <p className="text-slate-700 leading-relaxed font-bold">{selectedTransfer.description}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="font-black text-slate-800 text-sm uppercase">Amount Moved</span>
                <span className="font-black text-indigo-600 text-2xl">${selectedTransfer.amount.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex justify-center">
              <button 
                onClick={() => setSelectedTransfer(null)}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 uppercase tracking-widest text-xs"
              >
                Close Transfer details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordTransfer;
