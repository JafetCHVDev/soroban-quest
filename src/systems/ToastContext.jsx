import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
const TOAST_DURATION = 3000;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [leaving, setLeaving] = useState(new Set());

  const dismissToast = useCallback((id) => {
    setLeaving((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setLeaving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setToasts((prev) => (prev || []).filter((t) => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts((prev) => [...(prev || []), newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, TOAST_DURATION);
  }, [dismissToast]);

  const removeToast = useCallback((id) => {
    dismissToast(id);
  }, [dismissToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {(toasts || []).map((toast) => (
          <div 
            key={toast.id} 
            className={`toast toast-${toast.type}${leaving.has(toast.id) ? ' toast-leaving' : ''}`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="toast-content">{toast.message}</div>
            {!leaving.has(toast.id) && <div className="toast-progress" />}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  // Fallback to prevent "Cannot destructure showToast of undefined"
  if (!context) {
    return {
      showToast: (msg) => console.warn("ToastProvider missing. Message:", msg)
    };
  }
  return context;
};