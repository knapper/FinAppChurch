
import React, { useState, useMemo } from 'react';
import { PaymentMethod, IncomeRecord } from '../types';

interface RecordIncomeProps {
  onSave: (record: IncomeRecord) => void;
  incomes: IncomeRecord[];
}

type SubView = 'selection' | 'service' | 'donation';

const RecordIncome: React.FC<RecordIncomeProps> = ({ onSave, incomes }) => {
  const [subView, setSubView] = useState<SubView>('selection');
  const [displayLimit, setDisplayLimit] = useState<number>(10);
  const [selectedIncome, setSelectedIncome] = useState<IncomeRecord | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    serviceName: '',
    donorName: '',
    destination: '',
    offerings: 0,
    tithes: 0,
    donations: 0,
    method: PaymentMethod.CASH
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      serviceName: '',
      donorName: '',
      destination: '',
      offerings: 0,
      tithes: 0,
      donations: 0,
      method: PaymentMethod.CASH
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const type = subView === 'service' ? 'Service' : 'Direct';
    const total = formData.offerings + formData.tithes + formData.donations;
    
    if (total <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    onSave({
      id: crypto.randomUUID(),
      type,
      ...formData,
      total
    });
    
    resetForm();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const recentIncomes = useMemo(() => {
    return [...incomes]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, displayLimit);
  }, [incomes, displayLimit]);

  const totalCalculated = formData.offerings + formData.tithes + formData.donations;

  if (subView === 'selection') {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-800">What would you like to record?</h2>
          <p className="text-slate-500 mt-2">Choose the type of income entry to begin</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          <button 
            onClick={() => setSubView('service')}
            className="group bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border-2 border-transparent hover:border-indigo-500 transition-all text-left flex flex-col items-start gap-6 active:scale-[0.98]"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-4xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              ⛪
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Service Income</h3>
              <p className="text-slate-500 mt-2 leading-relaxed">Record offerings and tithes collected during a specific church service or event.</p>
            </div>
            <div className="mt-auto flex items-center gap-2 font-bold text-indigo-600">
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>

          <button 
            onClick={() => setSubView('donation')}
            className="group bg-white p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border-2 border-transparent hover:border-emerald-500 transition-all text-left flex flex-col items-start gap-6 active:scale-[0.98]"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-4xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              👤
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Direct / Donation</h3>
              <p className="text-slate-500 mt-2 leading-relaxed">Record special donations, building fund gifts, or missions support from individuals.</p>
            </div>
            <div className="mt-auto flex items-center gap-2 font-bold text-emerald-600">
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className={`p-8 border-b border-slate-100 flex items-center gap-4 ${subView === 'service' ? 'bg-indigo-50/50' : 'bg-emerald-50/50'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${subView === 'service' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
            {subView === 'service' ? '⛪' : '👤'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900">{subView === 'service' ? 'New Service Record' : 'New Direct Donation'}</h2>
            <p className="text-slate-500 text-sm">Please provide the transaction details below</p>
          </div>
          {saveSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs animate-in fade-in slide-in-from-right-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Saved Successfully!
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subView === 'service' ? (
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Service Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sunday Celebration, Friday Prayer"
                  className="w-full p-4 bg-slate-100 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-bold"
                  value={formData.serviceName}
                  onChange={e => setFormData({...formData, serviceName: e.target.value})}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Donor / Offeror Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Full name"
                    className="w-full p-4 bg-slate-100 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-bold"
                    value={formData.donorName}
                    onChange={e => setFormData({...formData, donorName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Destination (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Building Fund"
                    className="w-full p-4 bg-slate-100 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-bold"
                    value={formData.destination}
                    onChange={e => setFormData({...formData, destination: e.target.value})}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
              <input 
                type="date" 
                className="w-full p-4 bg-slate-100 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-slate-400 outline-none text-slate-900 font-bold"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Payment Method</label>
              <select 
                className="w-full p-4 bg-slate-100 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-slate-400 outline-none text-slate-900 font-bold cursor-pointer appearance-none"
                value={formData.method}
                onChange={e => setFormData({...formData, method: e.target.value as PaymentMethod})}
              >
                <option value={PaymentMethod.CASH}>Cash (to Cash in Hand)</option>
                <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer (to Bank Account)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Financial breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subView === 'service' ? (
                <>
                  <div className="group">
                    <label className="block text-sm font-bold text-slate-600 mb-2 group-hover:text-indigo-600 transition-colors">Offerings ($)</label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="0.00"
                      className="w-full p-5 bg-white border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-2xl font-black text-slate-900 shadow-sm"
                      value={formData.offerings || ''}
                      onChange={e => setFormData({...formData, offerings: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-bold text-slate-600 mb-2 group-hover:text-indigo-600 transition-colors">Tithes ($)</label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="0.00"
                      className="w-full p-5 bg-white border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-2xl font-black text-slate-900 shadow-sm"
                      value={formData.tithes || ''}
                      onChange={e => setFormData({...formData, tithes: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </>
              ) : (
                <div className="group md:col-span-3">
                  <label className="block text-sm font-bold text-slate-600 mb-2 group-hover:text-emerald-600 transition-colors">Donation Amount ($)</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="0.00"
                    className="w-full p-5 bg-white border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-2xl font-black text-slate-900 shadow-sm"
                    value={formData.donations || ''}
                    onChange={e => setFormData({...formData, donations: parseFloat(e.target.value) || 0})}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={`flex flex-col md:flex-row justify-between items-center p-8 rounded-3xl border gap-6 ${subView === 'service' ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="text-center md:text-left">
              <span className={`block text-xs font-bold uppercase tracking-widest ${subView === 'service' ? 'text-indigo-400' : 'text-emerald-400'}`}>Total for entry</span>
              <span className={`text-4xl font-black ${subView === 'service' ? 'text-indigo-700' : 'text-emerald-700'}`}>${totalCalculated.toLocaleString()}</span>
            </div>
            <button 
              type="submit"
              className={`w-full md:w-auto px-12 py-5 text-white font-bold rounded-2xl transition-all shadow-xl active:scale-95 ${subView === 'service' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
            >
              Save Income Record
            </button>
          </div>

          <div className="flex justify-center">
            <button 
              type="button"
              onClick={() => { resetForm(); setSubView('selection'); }}
              className="text-slate-500 font-black text-sm hover:text-slate-800 flex items-center gap-2 group transition-colors uppercase tracking-widest"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 0118 0z" /></svg>
              Choose another type of income
            </button>
          </div>
        </form>
      </div>
      
      {/* Rest of component remains the same for Recent Transactions... */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
          <div className="flex gap-2">
            {[10, 20, 50].map(limit => (
              <button 
                key={limit}
                onClick={() => setDisplayLimit(limit)}
                className={`text-xs px-4 py-2 font-bold rounded-xl transition-all ${displayLimit === limit ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {limit}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-8 py-5 font-bold uppercase tracking-wider text-[10px]">Date</th>
                <th className="px-8 py-5 font-bold uppercase tracking-wider text-[10px]">Description / Source</th>
                <th className="px-8 py-5 font-bold uppercase tracking-wider text-[10px]">Type</th>
                <th className="px-8 py-5 text-right font-bold uppercase tracking-wider text-[10px]">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentIncomes.map(inc => (
                <tr 
                  key={inc.id} 
                  className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedIncome(inc)}
                >
                  <td className="px-8 py-6 text-slate-500 font-medium">{inc.date}</td>
                  <td className="px-8 py-6">
                    <div className="font-bold text-slate-900">{inc.type === 'Service' ? inc.serviceName : inc.donorName}</div>
                    <div className="text-[10px] text-slate-400">{inc.destination ? `Dest: ${inc.destination}` : `Via ${inc.method}`}</div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${inc.type === 'Service' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {inc.type}
                    </span>
                  </td>
                  <td className={`px-8 py-6 text-right font-black text-lg ${inc.type === 'Service' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                    ${inc.total.toLocaleString()}
                  </td>
                </tr>
              ))}
              {recentIncomes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-slate-400 italic">No financial records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIncome && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="font-black text-3xl text-slate-800">Breakdown</h4>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{selectedIncome.type} RECORD</p>
              </div>
              <button onClick={() => setSelectedIncome(null)} className="text-slate-300 hover:text-slate-600 p-3 hover:bg-slate-50 rounded-full transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className={`p-8 rounded-3xl ${selectedIncome.type === 'Service' ? 'bg-indigo-50' : 'bg-emerald-50'}`}>
                <p className={`text-[10px] font-black uppercase mb-1 ${selectedIncome.type === 'Service' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                  {selectedIncome.type === 'Service' ? 'Service Event' : 'Donor / Offering Source'}
                </p>
                <p className={`text-2xl font-black ${selectedIncome.type === 'Service' ? 'text-indigo-900' : 'text-emerald-900'}`}>
                  {selectedIncome.type === 'Service' ? selectedIncome.serviceName : selectedIncome.donorName}
                </p>
                {selectedIncome.destination && (
                   <p className="mt-2 text-sm font-bold text-emerald-700 italic">Reserved for: {selectedIncome.destination}</p>
                )}
              </div>

              <div className="space-y-4">
                {selectedIncome.offerings > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase text-xs">Offerings</span>
                    <span className="font-black text-slate-900 text-xl">${selectedIncome.offerings.toLocaleString()}</span>
                  </div>
                )}
                {selectedIncome.tithes > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase text-xs">Tithes</span>
                    <span className="font-black text-slate-900 text-xl">${selectedIncome.tithes.toLocaleString()}</span>
                  </div>
                )}
                {selectedIncome.donations > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold uppercase text-xs">Donations</span>
                    <span className="font-black text-slate-900 text-xl">${selectedIncome.donations.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-black text-slate-800 text-xl uppercase tracking-tighter">Total Entry</span>
                  <span className={`font-black text-3xl ${selectedIncome.type === 'Service' ? 'text-indigo-600' : 'text-emerald-600'}`}>
                    ${selectedIncome.total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                  <span>Method</span>
                  <span>Date</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-600">
                  <span>{selectedIncome.method}</span>
                  <span>{selectedIncome.date}</span>
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50">
              <button 
                onClick={() => setSelectedIncome(null)}
                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordIncome;
