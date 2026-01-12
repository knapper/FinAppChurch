
import React, { useState, useMemo } from 'react';
import { PaymentMethod, IncomeRecord } from '../types';

interface RecordIncomeProps {
  onSave: (record: IncomeRecord) => void;
  incomes: IncomeRecord[];
}

const RecordIncome: React.FC<RecordIncomeProps> = ({ onSave, incomes }) => {
  const [displayLimit, setDisplayLimit] = useState<number>(10);
  const [selectedIncome, setSelectedIncome] = useState<IncomeRecord | null>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    serviceName: 'Sunday Morning Service',
    offerings: 0,
    tithes: 0,
    donations: 0,
    method: PaymentMethod.CASH
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = formData.offerings + formData.tithes + formData.donations;
    onSave({
      id: crypto.randomUUID(),
      ...formData,
      total
    });
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      serviceName: 'Next Service',
      offerings: 0,
      tithes: 0,
      donations: 0,
      method: PaymentMethod.CASH
    });
  };

  const recentIncomes = useMemo(() => {
    return [...incomes]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, displayLimit);
  }, [incomes, displayLimit]);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Record Service Income</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service Name</label>
              <input 
                type="text" 
                required
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                value={formData.serviceName}
                onChange={e => setFormData({...formData, serviceName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
              <select 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                value={formData.method}
                onChange={e => setFormData({...formData, method: e.target.value as PaymentMethod})}
              >
                <option value={PaymentMethod.CASH}>Cash (to Cash in Hand)</option>
                <option value={PaymentMethod.BANK_TRANSFER}>Bank Transfer (to Bank Account)</option>
              </select>
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
              <input 
                type="time" 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Offerings ($)</label>
              <input 
                type="number" 
                min="0"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                value={formData.offerings}
                onChange={e => setFormData({...formData, offerings: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tithes ($)</label>
              <input 
                type="number" 
                min="0"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                value={formData.tithes}
                onChange={e => setFormData({...formData, tithes: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Donations ($)</label>
              <input 
                type="number" 
                min="0"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
                value={formData.donations}
                onChange={e => setFormData({...formData, donations: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-t border-slate-100">
            <span className="font-semibold text-slate-600">Calculated Total:</span>
            <span className="text-2xl font-bold text-indigo-600">${(formData.offerings + formData.tithes + formData.donations).toLocaleString()}</span>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm"
          >
            Save Income Record
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recent Incomes</h3>
          <div className="flex gap-2">
            {[10, 20, 50].map(limit => (
              <button 
                key={limit}
                onClick={() => setDisplayLimit(limit)}
                className={`text-xs px-2 py-1 rounded ${displayLimit === limit ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:bg-slate-50'}`}
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
                <th className="px-4 py-2 text-slate-600 font-bold">Service</th>
                <th className="px-4 py-2 text-slate-600 font-bold">Method</th>
                <th className="px-4 py-2 text-right text-slate-600 font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentIncomes.map(inc => (
                <tr 
                  key={inc.id} 
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedIncome(inc)}
                >
                  <td className="px-4 py-2 text-slate-500">{inc.date}</td>
                  <td className="px-4 py-2 font-medium text-slate-900">{inc.serviceName}</td>
                  <td className="px-4 py-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${inc.method === PaymentMethod.CASH ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                      {inc.method}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-bold text-emerald-600">${inc.total.toLocaleString()}</td>
                </tr>
              ))}
              {recentIncomes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No income records yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIncome && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-slate-900">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 className="font-bold text-xl text-slate-800">Income Breakdown</h4>
              <button onClick={() => setSelectedIncome(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div className="flex justify-between text-sm">
                <span className="text-slate-500 uppercase font-bold text-xs tracking-wider">Date & Time</span>
                <span className="font-medium text-slate-900">{selectedIncome.date} @ {selectedIncome.time}</span>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl">
                <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Service</p>
                <p className="text-lg font-bold text-indigo-900">{selectedIncome.serviceName}</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Offerings</span>
                  <span className="font-bold text-slate-900">${selectedIncome.offerings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Tithes</span>
                  <span className="font-bold text-slate-900">${selectedIncome.tithes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Donations</span>
                  <span className="font-bold text-slate-900">${selectedIncome.donations.toLocaleString()}</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-800">Total Income</span>
                  <span className="font-bold text-emerald-600 text-xl">${selectedIncome.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-2 text-center">
                <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase">
                  Recieved via {selectedIncome.method}
                </span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-center">
              <button 
                onClick={() => setSelectedIncome(null)}
                className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95"
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

export default RecordIncome;
