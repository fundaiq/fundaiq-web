'use client';

import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { useUploadExcel } from '@/components/report/hooks/useUploadExcel';
import styles from '@/styles/ExcelUploadSection.module.css';

interface ExcelUploadSectionProps {
  className?: string;
}

export default function ExcelUploadSection({ className = "" }: ExcelUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Use the Excel upload hook (now handles redirect internally)
  const uploadExcel = useUploadExcel(setUploading);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleExcelUpload(file);
    }
  };

  // Handle Excel upload
  const handleExcelUpload = async (file: File) => {
    try {
      setUploadStatus('idle');
      
      //console.log('📁 [COMPONENT] Starting upload for file:', file.name);
      
      await uploadExcel(file);
      
      //console.log('✅ [COMPONENT] Upload successful, setting success status');
      setUploadStatus('success');
      
      // **REMOVED: router.push('/report') - now handled in the hook**
      // The useUploadExcel hook now handles the redirect internally with proper timing
      
    } catch (error) {
      console.error('❌ [COMPONENT] Upload failed:', error);
      setUploadStatus('error');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setSelectedFile(null);
      }, 3000);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`${styles.uploadContainer} ${className}`}>
      <div className={styles.uploadInputWrapper}>
        <div className={styles.uploadInputContainer}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {/* Upload Area */}
          <div 
            className={`${styles.uploadArea} ${selectedFile ? styles.hasFile : ''}`}
            onClick={triggerFileUpload}
          >
            <FileSpreadsheet className={styles.uploadIcon} />
            
            <div className={styles.uploadContent}>
              {selectedFile ? (
                <div className={styles.fileInfo}>
                  <div className={styles.fileName}>{selectedFile.name}</div>
                  <div className={styles.fileSize}>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <div className={styles.uploadPrompt}>
                  <div className={styles.uploadTitle}>Choose Screener.in Excel File</div>                  
                </div>
              )}
            </div>

            {/* Status Indicator */}
            {uploadStatus !== 'idle' && (
              <div className={styles.statusIndicator}>
                {uploadStatus === 'success' ? (
                  <CheckCircle className={styles.successIcon} />
                ) : (
                  <AlertCircle className={styles.errorIcon} />
                )}
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div className={styles.rightControls}>
            {/* Upload Button */}
            <button
              onClick={triggerFileUpload}
              disabled={uploading}
              className={styles.uploadButton}
              type="button"
              aria-label="Upload Excel file"
              title="Upload Excel file for analysis"
            >
              {uploading ? (
                <div className={styles.loadingSpinner}></div>
              ) : (
                <Upload className={styles.uploadButtonIcon} />
              )}
            </button>

            {/* Help Icon */}
            <div className={styles.tooltipContainer}>
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className={styles.helpButton}
                type="button"
                aria-label="Help"
              >
                <HelpCircle className={styles.helpIcon} />
              </button>
              
              {showTooltip && (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipContent}>
                    <p><strong>Supported Files:</strong></p>
                    <ul>
                      <li>• Excel files (.xlsx, .xls)</li>
                      <li>• Profit & Loss statements</li>
                      <li>• Balance Sheet data</li>
                      <li>• Cash Flow statements</li>
                    </ul>
                    <p><strong>Maximum file size:</strong> 10MB</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {uploadStatus !== 'idle' && (
            <div className={`${styles.statusMessage} ${
              uploadStatus === 'success' ? styles.statusSuccess : styles.statusError
            }`}>
              {uploadStatus === 'success' ? (
                <span>✅ File uploaded successfully! Redirecting to analysis...</span>
              ) : (
                <span>❌ Upload failed. Please try again.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}