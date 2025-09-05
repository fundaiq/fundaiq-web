// components/ui/TopNav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search } from 'lucide-react';

import ThemeToggle from "@/components/ThemeToggle";
import StockSearchNav from "@/components/ui/StockSearchNav";
import { getMe, logout} from "@/app/lib/api";
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
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  useEffect(() => setMounted(true), []);
  const router = useRouter();
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
      
      // Add a small delay to ensure the token is properly set
      setTimeout(() => {
        checkAuth();
      }, 500);
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, []);

  // Listen for logout events (optional, for future use)
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
    // { name: "Portfolios", href: "/portfolios", current: pathname.startsWith("/portfolios") },
    { name: "Learn", href: "/learn", current: pathname === "/learn" },
  ];

  const initial = (user?.name?.trim()?.[0] || user?.email?.trim()?.[0] || "U").toUpperCase();

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
            {/* Search - Desktop only */}
            <div className={styles.searchContainer}>
              <StockSearchNav />
            </div>

            {/* User Section */}
            {/* Clean User Section */}
            {mounted && (
              user ? (
                <div className={styles.userSection}>
                  <button 
                    className={styles.userButton}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="avatar" className={styles.userAvatar} />
                    ) : (
                      <div className={styles.userInitial}>{initial}</div>
                    )}
                    <span className={styles.userName}>
                      {user.name || user.email || "User"}
                    </span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className={styles.userDropdown}>
                      {/* User Info Header */}
                      <div className={styles.userDropdownHeader}>
                        <div className={styles.userDropdownName}>{user.name || "User"}</div>
                        <div className={styles.userDropdownEmail}>{user.email}</div>
                        {!user.is_verified && (
                          <div className={styles.userDropdownBadge}>Email not verified</div>
                        )}
                      </div>
                      
                      <div className={styles.userDropdownDivider}></div>
                      
                      {/* Menu Items */}
                      <a href="/profile" className={styles.userDropdownItem} onClick={() => setIsUserMenuOpen(false)}>
                        <svg className={styles.userDropdownIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </a>
                      
                    
                      
                      <div className={styles.userDropdownDivider}></div>
                      
                      <button 
                        className={`${styles.userDropdownItem} ${styles.userDropdownItemDanger}`}
                        onClick={async () => {
                          
                          setIsUserMenuOpen(false);
                          
                          try {
                            await logout(); // ✅ Use your existing logout function
                            setUser(null);
                            
                            router.push('/');
                          } catch (error) {
                            
                            // Still clear user state even if logout fails
                            setUser(null);
                            router.push('/');
                          }
                        }}
                      >
                        <svg className={styles.userDropdownIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.authButtons}>
                  <a href="/auth" className={styles.signInButton}>Sign in</a>
                  <a href="/auth" className={styles.signUpButton}>Get started</a>
                </div>
              )
            )}
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
      {isMenuOpen && mounted && (
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
        </div>
      )}
    </nav>
  );
}