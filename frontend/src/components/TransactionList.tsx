'use client';

import { useState, useEffect } from 'react';
import { Transaction, TRANSACTION_CATEGORIES } from '@/types';
import { transactionsAPI, statementsAPI } from '@/lib/api';
import { formatCurrency, formatDate, getCategoryColor, getStatusColor } from '@/lib/utils';
import {
  Check,
  X,
  Edit2,
  ChevronDown,
  ChevronUp,
  Filter,
  Search
} from 'lucide-react';

export default function TransactionList({ statementId }: { statementId?: number }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (statementId) {
      loadTransactions();
    }
  }, [statementId]);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchTerm, filterCategory, filterStatus, sortBy, sortOrder]);

  const loadTransactions = async () => {
    if (!statementId) return;
    try {
      const data = await transactionsAPI.getByStatement(statementId);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const comparison = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = a.amount - b.amount;
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    setFilteredTransactions(filtered);
  };

  const handleApprove = async (id: number) => {
    try {
      await transactionsAPI.approve(id);
      await loadTransactions();
    } catch (error) {
      console.error('Failed to approve transaction:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await transactionsAPI.reject(id);
      await loadTransactions();
    } catch (error) {
      console.error('Failed to reject transaction:', error);
    }
  };

  const handleBulkApprove = async () => {
    const pendingIds = transactions
      .filter(t => t.status === 'pending')
      .map(t => t.id);
    if (pendingIds.length > 0) {
      try {
        await transactionsAPI.bulkApprove(pendingIds);
        await loadTransactions();
      } catch (error) {
        console.error('Failed to bulk approve:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            {TRANSACTION_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="edited">Edited</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by as 'date' | 'amount');
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:border-primary-500"
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
          </select>
        </div>

        {/* Bulk Actions */}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-400">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
          <button
            onClick={handleBulkApprove}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Approve All Pending
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-bg border-b border-dark-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {filteredTransactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  isEditing={editingId === transaction.id}
                  onEdit={() => setEditingId(transaction.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onSave={() => {
                    setEditingId(null);
                    loadTransactions();
                  }}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({
  transaction,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onApprove,
  onReject
}: {
  transaction: Transaction;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const [editData, setEditData] = useState({
    description: transaction.description,
    amount: transaction.amount,
    category: transaction.category
  });

  const handleSave = async () => {
    try {
      await transactionsAPI.update(transaction.id, editData);
      onSave();
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  if (isEditing) {
    return (
      <tr className="bg-dark-hover">
        <td className="px-6 py-4 text-sm text-gray-300">
          {formatDate(transaction.transaction_date)}
        </td>
        <td className="px-6 py-4">
          <input
            type="text"
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-white text-sm"
          />
        </td>
        <td className="px-6 py-4">
          <select
            value={editData.category}
            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
            className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-white text-sm"
          >
            {TRANSACTION_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </td>
        <td className="px-6 py-4">
          <input
            type="number"
            step="0.01"
            value={editData.amount}
            onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
            className="w-full px-2 py-1 bg-dark-bg border border-dark-border rounded text-white text-sm text-right"
          />
        </td>
        <td className="px-6 py-4 text-center">
          <span className="text-xs text-gray-400">Editing...</span>
        </td>
        <td className="px-6 py-4">
          <div className="flex justify-center space-x-2">
            <button
              onClick={handleSave}
              className="p-1 bg-green-500 hover:bg-green-600 rounded text-white"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={onCancelEdit}
              className="p-1 bg-gray-500 hover:bg-gray-600 rounded text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-dark-hover transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
        {formatDate(transaction.transaction_date)}
      </td>
      <td className="px-6 py-4 text-sm text-white">
        <div>
          {transaction.description}
          {transaction.original_description && (
            <div className="text-xs text-gray-500 mt-1">
              Original: {transaction.original_description}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getCategoryColor(transaction.category)}`}>
          {transaction.category}
        </span>
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        {formatCurrency(transaction.amount)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(transaction.status)}`}>
          {transaction.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        <div className="flex justify-center space-x-2">
          <button
            onClick={onEdit}
            className="p-1 bg-blue-500 hover:bg-blue-600 rounded text-white transition-colors"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          {transaction.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(transaction.id)}
                className="p-1 bg-green-500 hover:bg-green-600 rounded text-white transition-colors"
                title="Approve"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => onReject(transaction.id)}
                className="p-1 bg-red-500 hover:bg-red-600 rounded text-white transition-colors"
                title="Reject"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
