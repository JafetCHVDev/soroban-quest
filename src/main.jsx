import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { LanguageProvider } from './i18n';
import { useRegisterSW } from 'virtual:pwa-register/react';
import './index.css';

function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(124, 58, 237, 0.95)',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(124, 58, 237, 0.4)',
      zIndex: 10000,
      fontFamily: 'Inter, sans-serif',
      fontSize: '14px',
      maxWidth: '320px',
    }}>
      <div style={{ marginBottom: '12px', fontWeight: '600' }}>
        🚀 New version available!
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => updateServiceWorker(true)}
          style={{
            flex: 1,
            background: 'white',
            color: '#7c3aed',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
          }}
        >
          Update
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          style={{
            flex: 1,
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <LanguageProvider>
        <App />
        <UpdatePrompt />
      </LanguageProvider>
    </HashRouter>
  </React.StrictMode>
);