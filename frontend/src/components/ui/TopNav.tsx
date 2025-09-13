// components/ui/TopNav.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Upload, FileSpreadsheet } from 'lucide-react';

import ThemeToggle from "@/components/ThemeToggle";
import { useUploadExcel } from "@/components/report/hooks/useUploadExcel";

import styles from '@/styles/TopNav.module.css';

type Me = {
  id: string | number;
  email: string;
  name?: string;
  is_verified?: boolean;
  avatar_url?: string;
};

export default function TopNav() {
  const [user, setUser] = useState<Me | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Use the Excel upload hook
  const uploadExcel = useUploadExcel(setUploading);

  useEffect(() => setMounted(true), []);

  const checkAuth = async () => {
    try {
      const me = await getMe();
      if (me) {
        setUser(me);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    }
  };

  // Initial auth check
  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for login success events
  useEffect(() => {
    const handleLoginSuccess = () => {
      setTimeout(() => {
        checkAuth();
      }, 500);
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);

  // Listen for logout events
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('logout', handleLogout);
    
    return () => {
      window.removeEventListener('logout', handleLogout);
    };
  }, []);

  const navigation = [
    { name: "Home", href: "/", current: pathname === "/" },
    { name: "Analysis", href: "/report", current: pathname === "/report" },
    { name: "Learn", href: "/learn", current: pathname === "/learn" },
  ];

  const initial = (user?.name?.trim()?.[0] || user?.email?.trim()?.[0] || "U").toUpperCase();

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
      await uploadExcel(file);
      // Navigate to report page after successful upload
      router.push('/report');
    } catch (error) {
      console.error('Upload failed:', error);
      // You might want to show a toast notification here
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <img src="/icon.png" alt="Funda-IQ" className={styles.logoIcon} />
            <span className={styles.logoText}>Funda-IQ</span>
            <small style={{
              background: '#ff6b35',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '8px',
              marginLeft: '8px'
            }}>BETA</small>
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.desktopNav}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${styles.navLink} ${item.current ? styles.active : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className={styles.rightSection}>
            {/* Excel Upload - Desktop only */}
            <div className={styles.uploadContainer}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                onClick={triggerFileUpload}
                disabled={uploading}
                className={styles.uploadButton}
                title="Upload Excel file for analysis"
              >
                {uploading ? (
                  <>
                    <div className={styles.spinner}></div>
                    <span className={styles.uploadText}>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className={styles.uploadIcon} />
                    <span className={styles.uploadText}>Upload Excel</span>
                  </>
                )}
              </button>
            </div>
            
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={styles.mobileMenuButton}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.mobileNavLink} ${item.current ? styles.active : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Mobile Upload Option */}
          <button
            onClick={() => {
              triggerFileUpload();
              setIsMenuOpen(false);
            }}
            disabled={uploading}
            className={`${styles.mobileUploadButton} ${uploading ? styles.uploading : ''}`}
          >
            {uploading ? (
              <>
                <div className={styles.spinner}></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet />
                <span>Upload Excel</span>
              </>
            )}
          </button>
        </div>
      )}
    </nav>
  );
}