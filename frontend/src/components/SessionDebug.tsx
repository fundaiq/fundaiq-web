// components/SessionDebug.tsx
"use client";

import { useEffect, useState } from 'react';

export default function SessionDebug() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    const checkSession = async () => {
      const data: any = {
        // Check cookies
        cookies: typeof document !== 'undefined' ? document.cookie : 'SSR',
        
        // Check localStorage
        localStorage: {},
        
        // API base URLs
        apiBase: process.env.NEXT_PUBLIC_API_BASE_URL,
        backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
        
        // Environment
        nodeEnv: process.env.NODE_ENV,
        
        timestamp: new Date().toISOString()
      };

      // Check localStorage items
      if (typeof window !== 'undefined') {
        const keys = ['access_token', 'refresh_token', 'user', 'auth_token'];
        keys.forEach(key => {
          try {
            const value = localStorage.getItem(key);
            data.localStorage[key] = value ? `${value.substring(0, 20)}...` : null;
          } catch (e) {
            data.localStorage[key] = 'Error reading';
          }
        });

        // Try to make a test API call
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            const response = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            data.apiTest = {
              status: response.status,
              ok: response.ok,
              statusText: response.statusText
            };
          } else {
            data.apiTest = 'No token found';
          }
        } catch (e: any) {
          data.apiTest = `Error: ${e.message}`;
        }
      }

      setInfo(data);
      console.log('🔍 Session Debug:', data);
    };

    checkSession();
    
    // Check again after delay
    setTimeout(checkSession, 2000);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: '#2d3748',
      color: '#ffffff',
      border: '2px solid #4299e1',
      padding: '15px',
      borderRadius: '8px',
      maxWidth: '400px',
      maxHeight: '400px',
      overflow: 'auto',
      zIndex: 9999,
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#4299e1' }}>🔐 SESSION DEBUG</h3>
      
      <div style={{ marginBottom: '8px' }}>
        <strong style={{ color: '#68d391' }}>API Base:</strong> {info.apiBase || 'Not set'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong style={{ color: '#68d391' }}>Backend URL:</strong> {info.backendUrl || 'Not set'}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong style={{ color: '#68d391' }}>Cookies:</strong>
        <div style={{ fontSize: '10px', wordBreak: 'break-all', marginTop: '2px' }}>
          {typeof info.cookies === 'string' ? info.cookies.substring(0, 100) + '...' : 'None'}
        </div>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong style={{ color: '#68d391' }}>LocalStorage:</strong>
        {Object.entries(info.localStorage || {}).map(([key, value]: [string, any]) => (
          <div key={key} style={{ fontSize: '10px', marginLeft: '10px' }}>
            <span style={{ color: '#fbd38d' }}>{key}:</span> {value || 'null'}
          </div>
        ))}
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong style={{ color: '#68d391' }}>API Test:</strong>
        <div style={{ fontSize: '10px', marginTop: '2px' }}>
          {typeof info.apiTest === 'object' 
            ? `${info.apiTest.status} ${info.apiTest.statusText}` 
            : info.apiTest}
        </div>
      </div>
      
      <div style={{ marginTop: '10px', display: 'flex', gap: '5px' }}>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            padding: '4px 8px',
            background: '#e53e3e',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          CLEAR & RELOAD
        </button>
        
        <button 
          onClick={() => console.log('Full localStorage:', localStorage)}
          style={{
            padding: '4px 8px',
            background: '#4299e1',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '10px'
          }}
        >
          LOG STORAGE
        </button>
      </div>
    </div>
  );
}