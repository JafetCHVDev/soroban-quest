import React, { createContext, useContext, useState, useCallback } from "react";
import "./Toast.css"; // Ensure the styles are loaded alongside the context

const ToastContext = createContext(null);

// Shared Timing Configuration Constants (Acceptance Criteria #3)
export const TOAST_LIFETIME = 3000; // 3 seconds visibility countdown
const EXIT_ANIMATION_DURATION = 300; // 300ms matches CSS slideOut duration

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    // 1. Trigger exit class name animation state
    setToasts((prev) =>
      (prev || []).map((t) => (t.id === id ? { ...t, isExiting: true } : t)),
    );

    // 2. Safely remove node from memory structure once exit animation finishes playing
    setTimeout(() => {
      setToasts((prev) => (prev || []).filter((t) => t.id !== id));
    }, EXIT_ANIMATION_DURATION);
  }, []);

  const showToast = useCallback(
    (message, type = "info") => {
      const id = Date.now();
      const newToast = { id, message, type, isExiting: false };

      setToasts((prev) => [...(prev || []), newToast]);

      // Automatically trigger dismissal flow after lifetime limit completes
      setTimeout(() => {
        dismissToast(id);
      }, TOAST_LIFETIME);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* The Toast Container — Updated invalid role to standard semantic role status (#102) */}
      <div 
        className="toast-container" 
        aria-live="polite" 
        role="status"
      >
        {(toasts || []).map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.isExiting ? "toast-exiting" : ""}`}
            onClick={() => removeToast(toast.id)}
            role="alert"
            aria-atomic="true"
            style={{ cursor: "pointer" }}
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
  // Fallback pattern to gracefully bypass runtime destructuring faults if context is missing
  if (!context) {
    return {
      showToast: (msg) => console.warn("ToastProvider missing. Message:", msg),
    };
  }
  return context;
};
