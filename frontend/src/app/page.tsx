'use client';

import { useState, useEffect } from 'react';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import TransactionList from '@/components/TransactionList';
import CalendarView from '@/components/CalendarView';
import { Statement } from '@/types';
import { statementsAPI } from '@/lib/api';
import {
  LayoutDashboard,
  List,
  Calendar,
  Upload,
  FileText,
  Menu,
  X
} from 'lucide-react';

type TabType = 'dashboard' | 'transactions' | 'calendar' | 'upload';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [statements, setStatements] = useState<Statement[]>([]);
  const [selectedStatement, setSelectedStatement] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatements();
  }, []);

  const loadStatements = async () => {
    try {
      const data = await statementsAPI.getAll();
      setStatements(data);
      if (data.length > 0 && !selectedStatement) {
        setSelectedStatement(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load statements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    loadStatements();
    setActiveTab('dashboard');
  };

  const tabs = [
    { id: 'upload' as TabType, name: 'Upload', icon: Upload },
    { id: 'dashboard' as TabType, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as TabType, name: 'Transactions', icon: List },
    { id: 'calendar' as TabType, name: 'Calendar', icon: Calendar },
  ];

  return (
    <div className="flex h-screen bg-dark-bg">
      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-64' : 'w-0'}
          bg-dark-card border-r border-dark-border transition-all duration-300 overflow-hidden
        `}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-primary-500 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Statement</h1>
              <p className="text-xs text-gray-400">Extractor</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:bg-dark-hover hover:text-white'
                  }
                `}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>

          {/* Statements List */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">
              Statements
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {statements.map((statement) => (
                <button
                  key={statement.id}
                  onClick={() => {
                    setSelectedStatement(statement.id);
                    if (activeTab === 'upload') {
                      setActiveTab('dashboard');
                    }
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                    ${selectedStatement === statement.id
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'text-gray-400 hover:bg-dark-hover hover:text-white'
                    }
                  `}
                >
                  <div className="font-medium truncate">{statement.bank_name}</div>
                  <div className="text-xs text-gray-500 truncate">{statement.filename}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-dark-card border-b border-dark-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5 text-gray-400" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {tabs.find(t => t.id === activeTab)?.name}
                </h2>
                {selectedStatement && statements.length > 0 && (
                  <p className="text-sm text-gray-400">
                    {statements.find(s => s.id === selectedStatement)?.bank_name} -
                    {statements.find(s => s.id === selectedStatement)?.filename}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {statements.length} statement{statements.length !== 1 ? 's' : ''} uploaded
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'upload' && (
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            )}

            {activeTab === 'dashboard' && selectedStatement && (
              <Dashboard />
            )}

            {activeTab === 'transactions' && selectedStatement && (
              <TransactionList statementId={selectedStatement} />
            )}

            {activeTab === 'calendar' && selectedStatement && (
              <CalendarView statementId={selectedStatement} />
            )}

            {!selectedStatement && activeTab !== 'upload' && (
              <div className="text-center py-12">
                <div className="p-4 bg-yellow-500/10 rounded-full inline-block mb-4">
                  <FileText className="h-12 w-12 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Statement Selected
                </h3>
                <p className="text-gray-400 mb-4">
                  Upload a bank statement to get started
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Upload Statement
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
