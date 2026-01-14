
export enum IncomeCategory {
  OFFERING = 'Offering',
  TITHE = 'Tithe',
  DONATION = 'Donation'
}

export enum PaymentMethod {
  CASH = 'Cash',
  BANK_TRANSFER = 'Bank Transfer'
}

export enum ExpenseCategory {
  SALARIES = 'Salaries',
  CHARITY = 'Charity',
  CAPITAL_EXPENSE = 'Capital Expense',
  OPERATIONAL = 'Operational Expenses'
}

export type AccountType = 'Bank' | 'Petty Cash' | 'Cash in Hand';

export enum UserRole {
  ADMIN = 'Admin',
  USER = 'User'
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface IncomeRecord {
  id: string;
  date: string;
  time: string;
  type: 'Service' | 'Direct';
  serviceName?: string;
  donorName?: string;
  destination?: string;
  offerings: number;
  tithes: number;
  donations: number;
  method: PaymentMethod;
  total: number;
}

export interface ExpenseRecord {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  sourceAccount: AccountType;
}

export interface TransferRecord {
  id: string;
  date: string;
  fromAccount: AccountType;
  toAccount: AccountType;
  amount: number;
  description: string;
}

export interface AccountBalance {
  bank: number;
  pettyCash: number;
  cashInHand: number;
  pettyCashLimit: number;
}

export interface MonthlyClosing {
  month: string; // YYYY-MM
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeByService: IncomeRecord[];
  expensesByService: ExpenseRecord[];
}
