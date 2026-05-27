import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showToast) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: isOnline ? '#10b981' : '#ef4444',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      {isOnline ? <Wifi size={20} aria-hidden="true" /> : <WifiOff size={20} aria-hidden="true" />}
      <span style={{ fontWeight: 500 }}>
        {isOnline ? 'You are back online' : 'You are offline'}
      </span>
      <button
        onClick={() => setShowToast(false)}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          minWidth: '44px',
          minHeight: '44px',
          justifyContent: 'center',
        }}
        aria-label="Close notification"
      >
        <X size={16} aria-hidden="true" />
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
