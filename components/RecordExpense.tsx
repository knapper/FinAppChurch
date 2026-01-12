
import React, { useState, useMemo } from 'react';
import { ExpenseCategory, ExpenseRecord, AccountBalance, AccountType } from '../types';

interface RecordExpenseProps {
  onSave: (record: ExpenseRecord) => void;
  expenses: ExpenseRecord[];
  balances: AccountBalance;
}

const RecordExpense: React.FC<RecordExpenseProps> = ({ onSave, expenses, balances }) => {
  const [displayLimit, setDisplayLimit] = useState<number>(10);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: ExpenseCategory.OPERATIONAL,
    amount: 0,
    sourceAccount: 'Bank' as AccountType
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let available = 0;
    if (formData.sourceAccount === 'Bank') available = balances.bank;
    if (formData.sourceAccount === 'Petty Cash') available = balances.pettyCash;
    if (formData.sourceAccount === 'Cash in Hand') available = balances.cashInHand;

    if (formData.amount > available) {
      alert(`Insufficient funds in ${formData.sourceAccount}! Available: $${available}`);
      return;
    }

    onSave({
      id: crypto.randomUUID(),
      ...formData
    });
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: ExpenseCategory.OPERATIONAL,
      amount: 0,
      sourceAccount: 'Bank'
    });
  };

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, displayLimit);
  }, [expenses, displayLimit]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Record Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Utility bill payment"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 placeholder-slate-400"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})}
                >
                  {Object.values(ExpenseCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source Account</label>
                <select 
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  value={formData.sourceAccount}
                  onChange={e => setFormData({...formData, sourceAccount: e.target.value as AccountType})}
                >
                  <option value="Bank">Bank Account (${balances.bank.toLocaleString()})</option>
                  <option value="Petty Cash">Petty Cash (${balances.pettyCash.toLocaleString()})</option>
                  <option value="Cash in Hand">Cash in Hand (${balances.cashInHand.toLocaleString()})</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                <input 
                  type="number" 
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm active:scale-[0.99]"
          >
            Register Expense
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recent Expenses</h3>
          <div className="flex gap-2">
            {[10, 20, 50].map(limit => (
              <button 
                key={limit}
                onClick={() => setDisplayLimit(limit)}
                className={`text-xs px-2 py-1 rounded ${displayLimit === limit ? 'bg-rose-100 text-rose-700' : 'text-slate-400 hover:bg-slate-50'}`}
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
                <th className="px-4 py-2 text-slate-600 font-bold">Date</th>
                <th className="px-4 py-2 text-slate-600 font-bold">Category</th>
                <th className="px-4 py-2 text-slate-600 font-bold">Source</th>
                <th className="px-4 py-2 text-right text-slate-600 font-bold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentExpenses.map(exp => (
                <tr 
                  key={exp.id} 
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedExpense(exp)}
                >
                  <td className="px-4 py-2 text-slate-500">{exp.date}</td>
                  <td className="px-4 py-2">
                    <span className="font-medium text-slate-900">{exp.category}</span>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{exp.description}</div>
                  </td>
                  <td className="px-4 py-2 text-xs font-semibold text-slate-600 italic">
                    {exp.sourceAccount}
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-rose-600">-${exp.amount.toLocaleString()}</td>
                </tr>
              ))}
              {recentExpenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No expense records yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedExpense && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-slate-900">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-bold text-xl text-slate-800">Expense Details</h4>
              <button onClick={() => setSelectedExpense(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex justify-between text-sm">
                <span className="text-slate-500 uppercase font-bold text-xs tracking-wider">Date</span>
                <span className="font-medium text-slate-900">{selectedExpense.date}</span>
              </div>
              <div className="bg-rose-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-rose-400 uppercase mb-1">Category</p>
                <p className="text-lg font-bold text-rose-900">{selectedExpense.category}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Description</p>
                <p className="text-slate-700 leading-relaxed">{selectedExpense.description}</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Charged to</span>
                  <span className="px-3 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 uppercase">
                    {selectedExpense.sourceAccount}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Total Spent</span>
                  <span className="font-bold text-rose-600 text-xl">-${selectedExpense.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-center">
              <button 
                onClick={() => setSelectedExpense(null)}
                className="px-8 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-all shadow-md active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordExpense;
