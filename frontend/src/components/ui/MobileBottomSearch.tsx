'use client';

import { useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useUploadExcel } from '@/components/report/hooks/useUploadExcel';
import styles from '@/styles/MobileBottomSearch.module.css';

export default function MobileBottomSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isExpanded, setIsExpanded] = useState(false);

  // Use the Excel upload hook
  const uploadExcel = useUploadExcel(setUploading);

  // Don't show on desktop
  if (typeof window !== 'undefined' && window.innerWidth > 768) {
    return null;
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleExcelUpload(file);
    }
  };

  // Handle Excel upload
  const handleExcelUpload = async (file: File) => {
    try {
      setUploadStatus('idle');
      await uploadExcel(file);
      setUploadStatus('success');
      
      // Navigate to report page after successful upload
      if (pathname !== '/report') {
        router.push('/report');
      }
      
      // Hide success message after 2 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setIsExpanded(false);
      }, 2000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
      
      // Hide error message after 3 seconds
      setTimeout(() => {
        setUploadStatus('idle');
      }, 3000);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.mobileSearchContainer}>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className={styles.backdrop}
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Status Messages */}
      {isExpanded && uploadStatus !== 'idle' && (
        <div className={styles.statusContainer}>
          <div className={`${styles.statusMessage} ${
            uploadStatus === 'success' ? styles.statusSuccess : styles.statusError
          }`}>
            {uploadStatus === 'success' ? (
              <>
                <CheckCircle className={styles.statusIcon} />
                <span>Excel file uploaded successfully!</span>
              </>
            ) : (
              <>
                <AlertCircle className={styles.statusIcon} />
                <span>Upload failed. Please try again.</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Upload Bar */}
      <div className={styles.searchBar}>
        <div className={styles.searchBarInner}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className={styles.collapsedButton}
            >
              <div className={styles.collapsedIcon}>
                <FileSpreadsheet />
              </div>
              
              <div className={styles.collapsedContent}>
                <div className={styles.collapsedText}>
                  Upload Excel for Analysis
                </div>
                <div className={styles.collapsedSubtext}>
                  Upload your financial Excel file to generate analysis
                </div>
              </div>
              
              <div className={styles.collapsedIndicator}>
                <Upload />
              </div>
            </button>
          ) : (
            <>
              {/* Expanded Upload Interface */}
              <div className={styles.expandedInput}>
                <div className={styles.uploadArea}>
                  <FileSpreadsheet className={styles.inputIcon} />
                  <div className={styles.uploadContent}>
                    <div className={styles.uploadTitle}>Upload Excel File</div>
                    <div className={styles.uploadSubtitle}>
                      Select a .xlsx or .xls file containing financial data
                    </div>
                  </div>
                </div>
                
                {/* Right Controls */}
                <div className={styles.rightControls}>
                  {/* Close Button */}
                  <button
                    onClick={() => setIsExpanded(false)}
                    className={styles.closeButton}
                  >
                    <X />
                  </button>
                </div>
              </div>

              {/* Upload Button */}
              <button
                onClick={triggerFileUpload}
                disabled={uploading}
                className={styles.searchButton}
              >
                {uploading ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    <span className={styles.searchButtonText}>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className={styles.uploadButtonIcon} />
                    <span className={styles.searchButtonText}>Choose File</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}