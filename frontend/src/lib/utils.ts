import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    return format(date, 'dd MMM yyyy');
  } catch (error) {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    return format(date, 'dd MMM yyyy, HH:mm');
  } catch (error) {
    return dateString;
  }
}

export function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'Food & Dining': 'bg-orange-500',
    'Shopping': 'bg-pink-500',
    'Transport': 'bg-blue-500',
    'Entertainment': 'bg-purple-500',
    'Bills & Utilities': 'bg-yellow-500',
    'Healthcare': 'bg-red-500',
    'Income': 'bg-green-500',
    'Transfer': 'bg-gray-500',
    'Investment': 'bg-indigo-500',
    'Loan Payment': 'bg-rose-500',
    'Insurance': 'bg-cyan-500',
    'Education': 'bg-teal-500',
    'Travel': 'bg-sky-500',
    'Personal Care': 'bg-violet-500',
    'Groceries': 'bg-lime-500',
    'Other': 'bg-slate-500',
  };
  return colors[category] || 'bg-gray-500';
}

export function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    pending: 'bg-yellow-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    edited: 'bg-blue-500',
  };
  return colors[status] || 'bg-gray-500';
}
