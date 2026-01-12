
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import RecordIncome from './components/RecordIncome';
import RecordExpense from './components/RecordExpense';
import RecordTransfer from './components/RecordTransfer';
import MonthlyClosingView from './components/MonthlyClosingView';
import ManagementView from './components/ManagementView';
import Login from './components/Login';
import { IncomeRecord, ExpenseRecord, TransferRecord, AccountBalance, PaymentMethod, User, UserRole } from './types';
import { DEFAULT_PETTY_CASH_LIMIT } from './constants';

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'income' | 'expense' | 'transfer' | 'closing' | 'management'>('dashboard');
  
  // Users state with root user initialization
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sf_users');
    if (saved) return JSON.parse(saved);
    // Default admin user
    return [{
      id: '1',
      username: 'root',
      password: '1234',
      role: UserRole.ADMIN
    }];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('sf_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Financial records persistence initialization
  const [incomes, setIncomes] = useState<IncomeRecord[]>(() => {
    const saved = localStorage.getItem('sf_incomes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('sf_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [transfers, setTransfers] = useState<TransferRecord[]>(() => {
    const saved = localStorage.getItem('sf_transfers');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [balances, setBalances] = useState<AccountBalance>(() => {
    const saved = localStorage.getItem('sf_balances');
    return saved ? JSON.parse(saved) : {
      bank: 5000,
      pettyCash: 250,
      cashInHand: 0,
      pettyCashLimit: DEFAULT_PETTY_CASH_LIMIT
    };
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('sf_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('sf_current_user', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('sf_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('sf_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('sf_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('sf_transfers', JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem('sf_balances', JSON.stringify(balances));
  }, [balances]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('dashboard');
  };

  const handleSaveIncome = (record: IncomeRecord) => {
    setIncomes([...incomes, record]);
    setBalances(prev => ({
      ...prev,
      bank: record.method === PaymentMethod.BANK_TRANSFER ? prev.bank + record.total : prev.bank,
      cashInHand: record.method === PaymentMethod.CASH ? prev.cashInHand + record.total : prev.cashInHand
    }));
  };

  const handleSaveExpense = (record: ExpenseRecord) => {
    setExpenses([...expenses, record]);
    setBalances(prev => {
      const newBalances = { ...prev };
      if (record.sourceAccount === 'Bank') newBalances.bank -= record.amount;
      if (record.sourceAccount === 'Petty Cash') newBalances.pettyCash -= record.amount;
      if (record.sourceAccount === 'Cash in Hand') newBalances.cashInHand -= record.amount;
      return newBalances;
    });
  };

  const handleSaveTransfer = (record: TransferRecord) => {
    setTransfers([...transfers, record]);
    setBalances(prev => {
      const newBalances = { ...prev };
      if (record.fromAccount === 'Bank') newBalances.bank -= record.amount;
      if (record.fromAccount === 'Petty Cash') newBalances.pettyCash -= record.amount;
      if (record.fromAccount === 'Cash in Hand') newBalances.cashInHand -= record.amount;
      if (record.toAccount === 'Bank') newBalances.bank += record.amount;
      if (record.toAccount === 'Petty Cash') newBalances.pettyCash += record.amount;
      if (record.toAccount === 'Cash in Hand') newBalances.cashInHand += record.amount;
      return newBalances;
    });
  };

  const handleUpdateLimit = (newLimit: number) => {
    setBalances(prev => ({ ...prev, pettyCashLimit: newLimit }));
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to delete ALL financial data? Users and system settings will be preserved.")) {
      setIncomes([]);
      setExpenses([]);
      setTransfers([]);
      setBalances({
        bank: 5000,
        pettyCash: 0,
        cashInHand: 0,
        pettyCashLimit: DEFAULT_PETTY_CASH_LIMIT
      });
      alert("Financial records cleared.");
      setView('dashboard');
    }
  };

  const handleUpdateUsers = (newUsers: User[]) => {
    setUsers(newUsers);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-indigo-500 p-1.5 rounded-lg">⛪</span>
            SacredFinance
          </h1>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setView('income')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'income' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Record Service
          </button>
          <button 
            onClick={() => setView('expense')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'expense' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Add Expense
          </button>
          <button 
            onClick={() => setView('transfer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'transfer' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Transfer Funds
          </button>
          <button 
            onClick={() => setView('closing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'closing' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Monthly Closing
          </button>
          <button 
            onClick={() => setView('management')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${view === 'management' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Management
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{currentUser.username}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-rose-900/40 hover:text-rose-400 rounded-xl text-slate-400 text-sm font-semibold transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
          <h2 className="font-semibold text-slate-800 capitalize">{view.replace('-', ' ')}</h2>
          <div className="flex items-center gap-6">
             <div className="text-right">
              <p className="text-xs text-slate-500 uppercase">Cash in Hand</p>
              <p className="text-sm font-bold text-emerald-600">${balances.cashInHand.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase">Petty Cash</p>
              <p className={`text-sm font-bold ${balances.pettyCash > balances.pettyCashLimit * 0.9 ? 'text-rose-500' : 'text-indigo-600'}`}>
                ${balances.pettyCash.toLocaleString()} / ${balances.pettyCashLimit.toLocaleString()}
              </p>
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          {view === 'dashboard' && <Dashboard incomes={incomes} expenses={expenses} transfers={transfers} balances={balances} />}
          {view === 'income' && <RecordIncome onSave={handleSaveIncome} incomes={incomes} />}
          {view === 'expense' && <RecordExpense onSave={handleSaveExpense} expenses={expenses} balances={balances} />}
          {view === 'transfer' && <RecordTransfer onSave={handleSaveTransfer} balances={balances} transfers={transfers} />}
          {view === 'closing' && <MonthlyClosingView incomes={incomes} expenses={expenses} />}
          {view === 'management' && (
            <ManagementView 
              balances={balances} 
              onUpdateLimit={handleUpdateLimit} 
              onResetData={handleResetData}
              rawDatabase={{ incomes, expenses, transfers, balances, users }}
              users={users}
              currentUser={currentUser}
              onUpdateUsers={handleUpdateUsers}
            />
          )}
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-30 shadow-2xl">
        <button onClick={() => setView('dashboard')} className={`p-2 rounded-lg ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        </button>
        <button onClick={() => setView('management')} className={`p-2 rounded-lg ${view === 'management' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
        <button onClick={handleLogout} className="p-2 text-rose-500 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>
    </div>
  );
};

export default App;
