
import React, { useState } from 'react';
import { MonthlyClosing, IncomeRecord, ExpenseRecord, PaymentMethod } from '../types';
import { getFinancialInsights } from '../services/geminiService';

interface MonthlyClosingViewProps {
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
}

type ReportType = 'Income' | 'Expenses';

const MonthlyClosingView: React.FC<MonthlyClosingViewProps> = ({ incomes, expenses }) => {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  
  // Report Generator State
  const [reportType, setReportType] = useState<ReportType>('Income');
  const [filters, setFilters] = useState({
    category: 'All',
    method: 'All',
    dateFrom: '',
    dateTo: '',
  });
  const [generatedResults, setGeneratedResults] = useState<{ type: ReportType, data: any[] } | null>(null);

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

  const generateReport = () => {
    let results: any[] = [];
    
    if (reportType === 'Income') {
      results = incomes.filter(inc => {
        const matchCategory = filters.category === 'All' || inc.type === filters.category;
        const matchMethod = filters.method === 'All' || inc.method === filters.method;
        const matchDateFrom = !filters.dateFrom || new Date(inc.date) >= new Date(filters.dateFrom);
        const matchDateTo = !filters.dateTo || new Date(inc.date) <= new Date(filters.dateTo);
        return matchCategory && matchMethod && matchDateFrom && matchDateTo;
      });
    } else {
      results = expenses.filter(exp => {
        const matchCategory = filters.category === 'All' || exp.category === filters.category;
        const matchAccount = filters.method === 'All' || exp.sourceAccount === filters.method;
        const matchDateFrom = !filters.dateFrom || new Date(exp.date) >= new Date(filters.dateFrom);
        const matchDateTo = !filters.dateTo || new Date(exp.date) <= new Date(filters.dateTo);
        return matchCategory && matchAccount && matchDateFrom && matchDateTo;
      });
    }

    setGeneratedResults({
      type: reportType,
      data: results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    });
  };

  const handlePrint = () => {
    const reportElement = document.getElementById('printable-report');
    if (!reportElement) return;

    setIsPrinting(true);

    // Create a temporary hidden iframe for printing
    const iframe = document.createElement('iframe');
    
    // Set sandbox BEFORE appending to body to ensure allow-modals is registered correctly
    iframe.setAttribute('sandbox', 'allow-modals allow-scripts allow-same-origin');
    
    // Visibility and positioning
    Object.assign(iframe.style, {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '0',
      height: '0',
      border: '0',
      visibility: 'hidden',
      zIndex: '-1'
    });

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('');

    // Construct the document content for srcdoc
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SacredFinance Official Report</title>
          ${styles}
          <style>
            @page { size: A4; margin: 20mm; }
            body { background: white !important; font-family: 'Inter', sans-serif; padding: 0; margin: 0; }
            .print-section { display: block !important; visibility: visible !important; width: 100% !important; }
            .print\\:hidden { display: none !important; }
            table { width: 100% !important; border-collapse: collapse !important; }
            th, td { border-bottom: 1px solid #e2e8f0 !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          </style>
        </head>
        <body>
          <div class="print-section">
            ${reportElement.innerHTML}
          </div>
          <script>
            window.onload = function() {
              // Ensure layout and styles are settled
              setTimeout(function() {
                try {
                  window.print();
                } catch (e) {
                  console.error('Print dialog could not be opened:', e);
                }
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    document.body.appendChild(iframe);
    
    // Using srcdoc is more reliable than doc.write for sandboxed iframes
    iframe.srcdoc = content;

    // Cleanup logic: Remove the iframe when focus returns to the main window
    const cleanup = () => {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        setIsPrinting(false);
      }, 1000);
      window.removeEventListener('focus', cleanup);
    };

    window.addEventListener('focus', cleanup);
    
    // Safety fallback cleanup
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
        setIsPrinting(false);
      }
    }, 60000);
  };

  const reportTotal = generatedResults?.data.reduce((sum, item) => sum + (item.total || item.amount), 0) || 0;

  return (
    <div className="space-y-8 pb-10">
      {/* Financial Summary Card */}
      <div className="bg-indigo-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden print:hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4 opacity-70">
            <span className="text-2xl">📊</span>
            <span className="font-bold uppercase tracking-[0.2em] text-xs">Financial Ecosystem Overview</span>
          </div>
          <h2 className="text-4xl font-black mb-2">Monthly Health Review</h2>
          <p className="opacity-60 font-medium">Data consolidated for {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
          
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-widest font-black opacity-50 mb-2">Total Revenues</p>
              <p className="text-4xl font-black text-emerald-400">${totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-widest font-black opacity-50 mb-2">Total Expenditures</p>
              <p className="text-4xl font-black text-rose-400">${totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-widest font-black opacity-50 mb-2">Net Cash Flow</p>
              <p className={`text-4xl font-black ${net >= 0 ? 'text-indigo-300' : 'text-rose-500'}`}>
                ${net.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
      </div>

      {/* AI Insights Card */}
      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 print:hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800">AI Financial Counselor</h3>
            <p className="text-slate-500 text-sm mt-1">Intelligent analysis based on current month performance</p>
          </div>
          <button 
            onClick={handleGenerateInsights}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl disabled:opacity-50 transition-all flex items-center gap-3 font-bold shadow-lg shadow-indigo-100 active:scale-95"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>✨</span>
                Generate Insights
              </div>
            )}
          </button>
        </div>
        
        {insights ? (
          <div className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100 text-slate-700 leading-relaxed italic animate-in fade-in duration-500">
            <div className="flex gap-4">
              <span className="text-4xl text-indigo-300">"</span>
              <p className="text-lg font-medium">{insights}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 border-4 border-dashed border-slate-50 rounded-[2rem] bg-slate-50/20">
            <div className="text-4xl mb-4">🧠</div>
            <p className="font-bold">Request a health report to see detailed AI recommendations.</p>
          </div>
        )}
      </div>

      {/* Report Generator Section */}
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 print:hidden">
          <h3 className="text-2xl font-black text-slate-800">Sacred Reports Generator</h3>
          <p className="text-slate-500 text-sm">Filter and export detailed transaction lists</p>
        </div>

        <div className="p-8 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Report Target</label>
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button 
                  onClick={() => { setReportType('Income'); setFilters(f => ({ ...f, category: 'All' })); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${reportType === 'Income' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Income
                </button>
                <button 
                  onClick={() => { setReportType('Expenses'); setFilters(f => ({ ...f, category: 'All' })); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${reportType === 'Expenses' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}
                >
                  Expenses
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Category Filter</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.category}
                onChange={e => setFilters({...filters, category: e.target.value})}
              >
                <option value="All">All Categories</option>
                {reportType === 'Income' ? (
                  <>
                    <option value="Service">Service Income Only</option>
                    <option value="Direct">Donations/Direct Only</option>
                  </>
                ) : (
                  <>
                    <option value="Salaries">Salaries</option>
                    <option value="Charity">Charity</option>
                    <option value="Capital Expense">Capital Expense</option>
                    <option value="Operational Expenses">Operational</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{reportType === 'Income' ? 'Payment Method' : 'Account Source'}</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                value={filters.method}
                onChange={e => setFilters({...filters, method: e.target.value})}
              >
                <option value="All">All Sources</option>
                {reportType === 'Income' ? (
                  <>
                    <option value={PaymentMethod.CASH}>Cash Only</option>
                    <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer Only</option>
                  </>
                ) : (
                  <>
                    <option value="Bank">Bank Account</option>
                    <option value="Petty Cash">Petty Cash</option>
                    <option value="Cash in Hand">Cash in Hand</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">From</label>
                <input 
                  type="date" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  value={filters.dateFrom}
                  onChange={e => setFilters({...filters, dateFrom: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">To</label>
                <input 
                  type="date" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  value={filters.dateTo}
                  onChange={e => setFilters({...filters, dateTo: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button 
              onClick={generateReport}
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              Generate Live Report
            </button>
          </div>
        </div>

        {/* Generated Report View */}
        {generatedResults && (
          <div className="p-8 bg-white border-t border-slate-100">
            <div className="flex items-center justify-between mb-8 print:hidden">
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Report Preview ({generatedResults.data.length} records)</h4>
              <button 
                onClick={handlePrint}
                disabled={isPrinting}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100 disabled:opacity-50"
              >
                {isPrinting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                )}
                Export to PDF / Print
              </button>
            </div>

            <div id="printable-report">
              {/* Report Letterhead - Only shows in print/PDF */}
              <div className="hidden print:block mb-10 border-b-2 border-slate-900 pb-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Official Financial Statement</h1>
                    <p className="text-slate-500 font-bold mt-1 tracking-wide text-xs">Generated for {generatedResults.type} review on {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-indigo-600 text-2xl tracking-widest">SACRED CHURCH</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Treasury & Auditing</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Date</th>
                      <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Purpose / Source</th>
                      <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Categorization</th>
                      <th className="px-6 py-4 font-black text-slate-400 uppercase tracking-widest text-[10px]">Account</th>
                      <th className="px-6 py-4 text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">Net Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {generatedResults.data.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-500 whitespace-nowrap">{item.date}</td>
                        <td className="px-6 py-4">
                          <div className="font-black text-slate-900">
                            {generatedResults.type === 'Income' 
                              ? (item.type === 'Service' ? (item.serviceName || 'Congregational Service') : item.donorName) 
                              : item.description}
                          </div>
                          {item.type === 'Service' && (
                            <div className="text-[10px] text-slate-500 mt-1 flex flex-wrap gap-2">
                               {item.offerings > 0 && <span className="font-bold border border-slate-100 px-1 rounded">Offerings: ${item.offerings.toLocaleString()}</span>}
                               {item.tithes > 0 && <span className="font-bold border border-slate-100 px-1 rounded">Tithes: ${item.tithes.toLocaleString()}</span>}
                            </div>
                          )}
                          {item.type === 'Direct' && (
                            <div className="text-[10px] text-emerald-600 font-bold mt-1 uppercase">Donation Gift</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                            generatedResults.type === 'Income' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {generatedResults.type === 'Income' ? item.type : item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase">
                          {generatedResults.type === 'Income' ? item.method : item.sourceAccount}
                        </td>
                        <td className={`px-6 py-4 text-right font-black text-base ${
                          generatedResults.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {generatedResults.type === 'Income' ? '+' : '-'}${ (item.total || item.amount).toLocaleString() }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white border-t-2 border-slate-900">
                      <td colSpan={4} className="px-6 py-8 font-black text-right uppercase tracking-[0.4em]">Total Statement Value</td>
                      <td className="px-6 py-8 text-right font-black text-3xl whitespace-nowrap">${reportTotal.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* PDF Signatures Footer */}
              <div className="hidden print:block mt-32">
                <div className="grid grid-cols-2 gap-32">
                  <div className="text-center">
                    <div className="h-0.5 bg-slate-300 w-full mb-3" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">General Treasurer Signature</p>
                  </div>
                  <div className="text-center">
                    <div className="h-0.5 bg-slate-300 w-full mb-3" />
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Supervisory Pastor Signature</p>
                  </div>
                </div>
                <div className="mt-20 text-center text-[8px] text-slate-300 font-bold uppercase tracking-widest">
                  SacredFinance Official Audit Document • Protected by AI Insights
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyClosingView;
