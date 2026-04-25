import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts((prev) => [...(prev || []), newToast]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => (prev || []).filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => (prev || []).filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* The Toast Container */}
      <div className="toast-container">
        {(toasts || []).map((toast) => (
          <div 
            key={toast.id} 
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="toast-content">{toast.message}</div>
            <div className="toast-progress" />
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