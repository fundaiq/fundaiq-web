// components/EnvDiagnostic.tsx
"use client";

import { useEffect, useState } from 'react';

export default function EnvDiagnostic() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    const checkEnvironment = () => {
      const data = {
        // Environment info
        nodeEnv: process.env.NODE_ENV,
        
        // Turnstile config
        siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        siteKeyExists: !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        siteKeyFirstChars: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.substring(0, 8) || 'none',
        
        // Domain info
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
        origin: typeof window !== 'undefined' ? window.location.origin : 'SSR',
        protocol: typeof window !== 'undefined' ? window.location.protocol : 'SSR',
        
        // Script loading
        turnstileGlobal: typeof window !== 'undefined' && !!window.turnstile,
        turnstileScript: typeof window !== 'undefined' && !!document.querySelector('script[src*="turnstile"]'),
        
        // All env vars starting with NEXT_PUBLIC_
        allPublicEnvs: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')),
        
        timestamp: new Date().toISOString()
      };
      
      setInfo(data);
      console.log('🔍 Environment Diagnostic:', data);
    };

    checkEnvironment();
    setTimeout(checkEnvironment, 2000);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '10px',
      background: '#1a1a1a',
      color: '#00ff00',
      border: '2px solid #00ff00',
      padding: '15px',
      borderRadius: '8px',
      maxWidth: '500px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999,
      fontFamily: 'Courier New, monospace',
      fontSize: '12px',
      boxShadow: '0 4px 12px rgba(0,255,0,0.3)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#00ff00' }}>🖥️ ENV DIAGNOSTIC</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: '#ffff00' }}>Environment:</strong> {info.nodeEnv}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: '#ffff00' }}>Site Key Exists:</strong> {info.siteKeyExists ? '✅' : '❌'}
      </div>
      
      {info.siteKeyExists && (
        <div style={{ marginBottom: '10px' }}>
          <strong style={{ color: '#ffff00' }}>Site Key Preview:</strong> {info.siteKeyFirstChars}...
        </div>
      )}
      
      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: '#ffff00' }}>Domain:</strong> {info.hostname}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: '#ffff00' }}>Origin:</strong> {info.origin}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: '#ffff00' }}>Turnstile Script:</strong> {info.turnstileScript ? '✅' : '❌'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: '#ffff00' }}>Turnstile Global:</strong> {info.turnstileGlobal ? '✅' : '❌'}
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <strong style={{ color: '#ffff00' }}>All Public Env Vars:</strong>
        <div style={{ fontSize: '10px', marginTop: '5px' }}>
          {info.allPublicEnvs?.join(', ') || 'None found'}
        </div>
      </div>
      
      {!info.siteKeyExists && (
        <div style={{ 
          background: '#660000', 
          padding: '8px', 
          borderRadius: '4px',
          color: '#ff6666',
          marginTop: '10px',
          border: '1px solid #ff0000'
        }}>
          ⚠️ MISSING: NEXT_PUBLIC_TURNSTILE_SITE_KEY
        </div>
      )}
      
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '5px 10px',
            background: '#00ff00',
            color: '#000000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          RELOAD
        </button>
        
        <button 
          onClick={() => console.log('Full window.turnstile object:', window.turnstile)}
          style={{
            padding: '5px 10px',
            background: '#ffff00',
            color: '#000000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px'
          }}
        >
          LOG TURNSTILE
        </button>
      </div>
    </div>
  );
}