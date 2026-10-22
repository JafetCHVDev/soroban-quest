import React, { ReactElement } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { LanguageProvider } from './i18n';
import './index.css';

// Type for the PWA register module exports
interface PWARegisterModule {
  useRegisterSW?: () => {
    needRefresh: [userNeedRefresh: boolean, setNeedRefresh: (value: boolean) => void];
    updateServiceWorker: (reload?: boolean) => Promise<void>;
  };
}

// Import PWA registration hook - dynamically imported as it may not be available
let useRegisterSW: (() => {
  needRefresh: [boolean, (value: boolean) => void];
  updateServiceWorker: (reload?: boolean) => Promise<void>;
}) | null = null;

let UpdatePrompt: (() => ReactElement | null) | null = null;

// Try to load PWA registration
import('virtual:pwa-register/react')
  .then((pwaModule: PWARegisterModule) => {
    useRegisterSW = pwaModule.useRegisterSW ?? null;

    /**
     * UpdatePrompt component
     * Displays a notification when a new version of the PWA is available
     */
    UpdatePrompt = function UpdatePrompt(): ReactElement | null {
      if (!useRegisterSW) return null;

      const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
      } = useRegisterSW();

      if (!needRefresh) return null;

      return React.createElement(
        'div',
        {
          role: 'alert',
          'aria-live': 'assertive',
          style: {
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
          },
        },
        React.createElement('div', { style: { marginBottom: '12px', fontWeight: '600' } }, '🚀 New version available!'),
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '8px' } },
          React.createElement(
            'button',
            {
              onClick: () => void updateServiceWorker(true),
              'aria-label': 'Update to new version',
              style: {
                flex: 1,
                background: 'white',
                color: '#7c3aed',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '13px',
              },
            },
            'Update'
          ),
          React.createElement(
            'button',
            {
              onClick: () => setNeedRefresh(false),
              'aria-label': 'Dismiss update notification',
              style: {
                flex: 1,
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
              },
            },
            'Later'
          )
        )
      );
    };
  })
  .catch(() => {
    // PWA module not available, skip UpdatePrompt
    UpdatePrompt = () => null;
  });

/**
 * Redirect path routes to hash routes for SPA compatibility
 */
function redirectPathToHashRoute(): void {
  if (window.location.hash || window.location.pathname === '/') return;

  const hashRoute = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, '', `/#${hashRoute}`);
}

redirectPathToHashRoute();

// Mount React application
const rootElement = document.getElementById('root');
if (rootElement) {
  const updatePrompt = UpdatePrompt ? React.createElement(UpdatePrompt) : null;
  ReactDOM0.createRoot(rootElement).render(
    React.createElement(
      React.StrictMode,
      null,
      React.createElement(
        HashRouter,
        null,
        React.createElement(
          LanguageProvider,
          null,
          React.createElement(App),
          updatePrompt
        )
      )
    )
  );
}
