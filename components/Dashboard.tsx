
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { IncomeRecord, ExpenseRecord, TransferRecord, AccountBalance } from '../types';

interface DashboardProps {
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  transfers: TransferRecord[];
  balances: AccountBalance;
}

type Transaction = {
  id: string;
  date: string;
  type: 'Income' | 'Expense' | 'Transfer';
  category: string;
  description: string;
  amount: number;
  account: string;
};

const COLORS = ['#4f46e5', '#10b981', '#f59e0b'];

const Dashboard: React.FC<DashboardProps> = ({ incomes, expenses, transfers, balances }) => {
  const [displayLimit, setDisplayLimit] = useState<number>(10);
  const [selectedTx, setSelectedTx] = useState<{ type: 'Income' | 'Expense' | 'Transfer', data: any } | null>(null);

  const totalIncome = incomes.reduce((sum, i) => sum + i.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const chartData = [
    { name: 'Total', Income: totalIncome, Expenses: totalExpenses }
  ];

  const fundData = [
    { name: 'Bank', value: balances.bank },
    { name: 'Cash in Hand', value: balances.cashInHand },
    { name: 'Petty Cash', value: balances.pettyCash },
  ];

  const incomeTrend = useMemo(() => 
    incomes.slice(-10).map(inc => ({
      date: inc.date,
      amount: inc.total
    })), [incomes]);

  const allTransactions = useMemo(() => {
    const combined: Transaction[] = [
      ...incomes.map(inc => ({
        id: inc.id,
        date: inc.date,
        type: 'Income' as const,
        category: 'Service Revenue',
        description: inc.serviceName,
        amount: inc.total,
        account: inc.method === 'Cash' ? 'Cash in Hand' : 'Bank'
      })),
      ...expenses.map(exp => ({
        id: exp.id,
        date: exp.date,
        type: 'Expense' as const,
        category: exp.category,
        description: exp.description,
        amount: exp.amount,
        account: exp.sourceAccount
      })),
      ...transfers.map(tr => ({
        id: tr.id,
        date: tr.date,
        type: 'Transfer' as const,
        category: 'Account Transfer',
        description: `${tr.fromAccount} → ${tr.toAccount}`,
        amount: tr.amount,
        account: 'Multi-account'
      }))
    ];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomes, expenses, transfers]);

  const recentTransactions = allTransactions.slice(0, displayLimit);

  const handleRowClick = (tx: Transaction) => {
    if (tx.type === 'Income') {
      const data = incomes.find(i => i.id === tx.id);
      if (data) setSelectedTx({ type: 'Income', data });
    } else if (tx.type === 'Expense') {
      const data = expenses.find(e => e.id === tx.id);
      if (data) setSelectedTx({ type: 'Expense', data });
    } else {
      const data = transfers.find(t => t.id === tx.id);
      if (data) setSelectedTx({ type: 'Transfer', data });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase">Bank Account</p>
          <p className="text-xl font-bold text-indigo-600">${balances.bank.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase">Cash in Hand</p>
          <p className="text-xl font-bold text-emerald-600">${balances.cashInHand.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase">Petty Cash</p>
          <p className="text-xl font-bold text-amber-600">${balances.pettyCash.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase">Monthly Income</p>
          <p className="text-xl font-bold text-slate-800">${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase">Monthly Expenses</p>
          <p className="text-xl font-bold text-slate-800">${totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Fund Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fundData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {fundData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Income vs Expenses</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Income" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Service Income Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeTrend}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-slate-800">Global Recent Transactions</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Show last:</span>
            {[10, 20, 50].map(limit => (
              <button
                key={limit}
                onClick={() => setDisplayLimit(limit)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  displayLimit === limit ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {limit}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Category / Description</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((tx) => (
                <tr 
                  key={tx.id} 
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(tx)}
                >
                  <td className="px-6 py-4 text-sm text-slate-600">{tx.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.type === 'Income' ? 'bg-emerald-100 text-emerald-700' : tx.type === 'Expense' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{tx.category}</div>
                    <div className="text-xs text-slate-500">{tx.description}</div>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${
                    tx.type === 'Income' ? 'text-emerald-600' : tx.type === 'Expense' ? 'text-rose-600' : 'text-indigo-600'
                  }`}>
                    {tx.type === 'Income' ? '+' : tx.type === 'Expense' ? '-' : '•'}${tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTx && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-slate-900">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-bold text-xl text-slate-800">Transaction Details</h4>
              <button 
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase text-slate-400">Date</span>
                <span className="text-slate-700 font-medium">{selectedTx.data.date}</span>
              </div>
              
              {selectedTx.type === 'Income' && (
                <div className="space-y-3">
                  <div className="bg-indigo-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Service Name</p>
                    <p className="text-lg font-bold text-indigo-900">{selectedTx.data.serviceName}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Offerings</span>
                      <span className="font-semibold text-slate-900">${selectedTx.data.offerings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tithes</span>
                      <span className="font-semibold text-slate-900">${selectedTx.data.tithes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Donations</span>
                      <span className="font-semibold text-slate-900">${selectedTx.data.donations.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 mt-2 border-t border-slate-100">
                      <span className="font-bold text-slate-800">Total</span>
                      <span className="font-bold text-emerald-600 text-lg">${selectedTx.data.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedTx.type === 'Expense' && (
                <div className="space-y-3">
                  <div className="bg-rose-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-rose-400 uppercase mb-1">Category</p>
                    <p className="text-lg font-bold text-rose-900">{selectedTx.data.category}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Description</p>
                    <p className="text-slate-700">{selectedTx.data.description}</p>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-500">Source Account</span>
                    <span className="font-semibold text-slate-800">{selectedTx.data.sourceAccount}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-800">Amount</span>
                    <span className="font-bold text-rose-600 text-lg">${selectedTx.data.amount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {selectedTx.type === 'Transfer' && (
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-blue-400 uppercase mb-1">Transfer Path</p>
                    <p className="text-lg font-bold text-blue-900">{selectedTx.data.fromAccount} → {selectedTx.data.toAccount}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Description</p>
                    <p className="text-slate-700">{selectedTx.data.description}</p>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-800">Transferred Amount</span>
                    <span className="font-bold text-blue-600 text-lg">${selectedTx.data.amount.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 text-center">
              <button 
                onClick={() => setSelectedTx(null)}
                className="px-6 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
