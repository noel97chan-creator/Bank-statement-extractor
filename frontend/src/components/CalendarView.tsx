'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Transaction } from '@/types';
import { transactionsAPI } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarView({ statementId }: { statementId?: number }) {
  const [date, setDate] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDateTransactions, setSelectedDateTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (statementId) {
      loadTransactions();
    }
  }, [statementId]);

  useEffect(() => {
    updateSelectedDateTransactions();
  }, [date, transactions]);

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

  const updateSelectedDateTransactions = () => {
    const dateStr = date.toISOString().split('T')[0];
    const filtered = transactions.filter(t => {
      const transDate = new Date(t.transaction_date).toISOString().split('T')[0];
      return transDate === dateStr;
    });
    setSelectedDateTransactions(filtered);
  };

  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const dayTransactions = transactions.filter(t => {
        const transDate = new Date(t.transaction_date).toISOString().split('T')[0];
        return transDate === dateStr;
      });

      if (dayTransactions.length > 0) {
        const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
        return (
          <div className="text-xs mt-1">
            <div className={`font-semibold ${total >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {dayTransactions.length}
            </div>
          </div>
        );
      }
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Transaction Calendar</h3>
        <div className="calendar-container">
          <Calendar
            onChange={(value) => setDate(value as Date)}
            value={date}
            tileContent={getTileContent}
            className="w-full bg-dark-bg border-dark-border rounded-lg text-white"
          />
        </div>
      </div>

      {/* Selected Date Transactions */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {formatDate(date.toISOString())}
        </h3>

        {selectedDateTransactions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedDateTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-3 bg-dark-bg rounded-lg border border-dark-border"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-white font-medium truncate flex-1">
                    {transaction.description}
                  </p>
                  <p className={`text-sm font-semibold ml-2 ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary-500/20 text-primary-400">
                    {transaction.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No transactions on this date
          </div>
        )}

        {selectedDateTransactions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dark-border">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total:</span>
              <span className={`font-semibold ${
                selectedDateTransactions.reduce((sum, t) => sum + t.amount, 0) >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
              }`}>
                {formatCurrency(selectedDateTransactions.reduce((sum, t) => sum + t.amount, 0))}
              </span>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .calendar-container .react-calendar {
          background: transparent;
          border: none;
          width: 100%;
        }

        .react-calendar__tile {
          background: #161A1E;
          border: 1px solid #2B3139;
          margin: 2px;
          padding: 10px 5px;
          border-radius: 8px;
          color: white;
        }

        .react-calendar__tile:hover {
          background: #1E2329;
        }

        .react-calendar__tile--active {
          background: #0ea5e9 !important;
          color: white;
        }

        .react-calendar__tile--now {
          background: #2B3139;
        }

        .react-calendar__month-view__weekdays {
          color: #9ca3af;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .react-calendar__navigation button {
          color: white;
          font-size: 1rem;
          background: #161A1E;
          border: 1px solid #2B3139;
          margin: 2px;
          border-radius: 8px;
        }

        .react-calendar__navigation button:hover {
          background: #1E2329;
        }

        .react-calendar__navigation button:disabled {
          background: #0B0E11;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}
