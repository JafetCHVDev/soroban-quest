import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

export default function ServiceWorkerUpdate() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        const handleUpdate = () => {
          setWaitingWorker(registration.waiting);
          setShowUpdatePrompt(true);
        };

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleUpdate();
            }
          });
        });

        // Check for waiting worker on load
        if (registration.waiting) {
          handleUpdate();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      waitingWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  };

  if (!showUpdatePrompt) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#6366f1',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        zIndex: 10000,
        maxWidth: '90%',
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <RefreshCw size={20} aria-hidden="true" />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
          New version available
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          A new version of Soroban Quest is ready to install.
        </div>
      </div>
      <button
        onClick={handleUpdate}
        style={{
          backgroundColor: 'white',
          color: '#6366f1',
          border: 'none',
          padding: '12px 16px',
          borderRadius: '6px',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: '14px',
          minWidth: '44px',
          minHeight: '44px',
        }}
        aria-label="Update app to new version"
      >
        Update Now
      </button>
      <button
        onClick={() => setShowUpdatePrompt(false)}
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
        @keyframes slideUp {
          from {
            transform: translate(-50%, 100px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
