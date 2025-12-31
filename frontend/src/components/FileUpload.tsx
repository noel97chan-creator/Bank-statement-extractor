'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { statementsAPI } from '@/lib/api';

interface FileUploadProps {
  onUploadSuccess?: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.PDF')) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a PDF file',
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const result = await statementsAPI.upload(file);
      setUploadStatus({
        type: 'success',
        message: `Successfully processed ${result.transaction_count} transactions from ${result.bank_name}`,
      });
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Failed to upload statement',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center
          transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-primary-500 bg-primary-500/10'
            : 'border-dark-border bg-dark-card hover:border-primary-500/50 hover:bg-dark-hover'
          }
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          accept=".pdf,.PDF"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="flex flex-col items-center space-y-4">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
              <p className="text-gray-400">Processing your statement...</p>
            </>
          ) : (
            <>
              <div className="p-4 bg-primary-500/10 rounded-full">
                <Upload className="h-10 w-10 text-primary-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Upload Bank Statement
                </h3>
                <p className="text-gray-400">
                  Drag and drop your PDF statement here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Supports: HSBC, DBS, OCBC, Citibank, SCB, Trust, GXS
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {uploadStatus.type && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-start space-x-3 ${
            uploadStatus.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20'
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          )}
          <p
            className={`text-sm ${
              uploadStatus.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {uploadStatus.message}
          </p>
        </div>
      )}
    </div>
  );
}
