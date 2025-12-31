export interface Transaction {
  id: number;
  statement_id: number;
  transaction_date: string;
  description: string;
  amount: number;
  balance: number | null;
  category: string;
  confidence_score: number;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  auto_categorized: boolean;
  edited_at: string | null;
  reviewed_at: string | null;
  original_description: string | null;
  original_amount: number | null;
}

export interface Statement {
  id: number;
  filename: string;
  bank_name: string;
  account_number: string | null;
  statement_period_start: string | null;
  statement_period_end: string | null;
  uploaded_at: string;
  status: string;
}

export interface Analytics {
  total_transactions: number;
  total_income: number;
  total_expenses: number;
  net_amount: number;
  category_breakdown: {
    [key: string]: {
      total: number;
      count: number;
    };
  };
  status_breakdown: {
    pending: number;
    approved: number;
    rejected: number;
    edited: number;
  };
}

export interface MonthlyAnalytics {
  year: number;
  month: number;
  total_income: number;
  total_expenses: number;
  net_amount: number;
  transaction_count: number;
  daily_breakdown: {
    [day: number]: {
      income: number;
      expenses: number;
      count: number;
    };
  };
}

export const TRANSACTION_CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transport',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Income',
  'Transfer',
  'Investment',
  'Loan Payment',
  'Insurance',
  'Education',
  'Travel',
  'Personal Care',
  'Groceries',
  'Other',
] as const;

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number];
