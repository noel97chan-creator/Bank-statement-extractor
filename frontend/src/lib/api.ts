import axios from 'axios';
import type { Transaction, Statement, Analytics, MonthlyAnalytics } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Statements API
export const statementsAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/statements/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (): Promise<Statement[]> => {
    const response = await api.get('/statements/');
    return response.data;
  },

  getById: async (id: number): Promise<Statement> => {
    const response = await api.get(`/statements/${id}`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/statements/${id}`);
    return response.data;
  },

  getSupportedBanks: async () => {
    const response = await api.get('/statements/banks/supported');
    return response.data;
  },
};

// Transactions API
export const transactionsAPI = {
  getByStatement: async (statementId: number): Promise<Transaction[]> => {
    const response = await api.get(`/transactions/statement/${statementId}`);
    return response.data;
  },

  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  update: async (id: number, updates: Partial<Transaction>) => {
    const response = await api.patch(`/transactions/${id}`, updates);
    return response.data;
  },

  approve: async (id: number) => {
    const response = await api.post(`/transactions/${id}/approve`);
    return response.data;
  },

  reject: async (id: number) => {
    const response = await api.post(`/transactions/${id}/reject`);
    return response.data;
  },

  bulkApprove: async (transactionIds: number[]) => {
    const response = await api.post('/transactions/bulk-approve', {
      transaction_ids: transactionIds,
    });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getAnalytics: async (statementId?: number): Promise<Analytics> => {
    const params = statementId ? { statement_id: statementId } : {};
    const response = await api.get('/analytics/', { params });
    return response.data;
  },

  getMonthly: async (year: number, month: number): Promise<MonthlyAnalytics> => {
    const response = await api.get(`/analytics/monthly/${year}/${month}`);
    return response.data;
  },
};

export default api;
