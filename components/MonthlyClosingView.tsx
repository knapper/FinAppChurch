
import React, { useState, useEffect } from 'react';
import { MonthlyClosing, IncomeRecord, ExpenseRecord } from '../types';
import { getFinancialInsights } from '../services/geminiService';

interface MonthlyClosingViewProps {
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
}

const MonthlyClosingView: React.FC<MonthlyClosingViewProps> = ({ incomes, expenses }) => {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const totalIncome = incomes.reduce((sum, i) => sum + i.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const net = totalIncome - totalExpenses;

  const handleGenerateInsights = async () => {
    setLoading(true);
    const data: MonthlyClosing = {
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      totalIncome,
      totalExpenses,
      netBalance: net,
      incomeByService: incomes,
      expensesByService: expenses
    };
    const response = await getFinancialInsights(data);
    setInsights(response || "Insights generation failed.");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-900 text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Monthly Financial Review</h2>
          <p className="opacity-80">Summary for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-sm uppercase tracking-wider opacity-60">Total Revenues</p>
              <p className="text-3xl font-bold text-emerald-400">${totalIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider opacity-60">Total Expenditures</p>
              <p className="text-3xl font-bold text-rose-400">${totalExpenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm uppercase tracking-wider opacity-60">Net Surplus/Deficit</p>
              <p className={`text-3xl font-bold ${net >= 0 ? 'text-blue-300' : 'text-rose-500'}`}>
                ${net.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">AI Financial Insights</h3>
          <button 
            onClick={handleGenerateInsights}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Thinking...
              </>
            ) : 'Generate Health Report'}
          </button>
        </div>
        
        {insights ? (
          <div className="prose prose-indigo max-w-none bg-indigo-50/50 p-6 rounded-lg border border-indigo-100 text-slate-700 whitespace-pre-wrap italic">
            {insights}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
            Click the button above to generate a smart analysis of your church's finances.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Income Breakdown</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-slate-500 border-b">
                  <th className="pb-3 font-medium">Service</th>
                  <th className="pb-3 font-medium text-right">Offerings</th>
                  <th className="pb-3 font-medium text-right">Tithes</th>
                  <th className="pb-3 font-medium text-right">Donations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomes.map(i => (
                  <tr key={i.id} className="text-sm">
                    <td className="py-3">
                      <div>{i.serviceName}</div>
                      <div className="text-xs text-slate-400">{i.date}</div>
                    </td>
                    <td className="py-3 text-right">${i.offerings.toLocaleString()}</td>
                    <td className="py-3 text-right">${i.tithes.toLocaleString()}</td>
                    <td className="py-3 text-right">${i.donations.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Expense Breakdown</h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-slate-500 border-b">
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(e => (
                  <tr key={e.id} className="text-sm">
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs uppercase font-semibold text-slate-600">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3">{e.description}</td>
                    <td className="py-3 text-right text-rose-600 font-medium">-${e.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyClosingView;
