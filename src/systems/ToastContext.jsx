import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

// Shared architectural constant keeping animations and JavaScript timeouts synchronized
export const TOAST_LIFETIME = 3000;
// Duration matching the CSS slideOut fade animation (in milliseconds)
const EXIT_ANIMATION_DURATION = 300;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    // 1. First trigger the exit CSS animation state
    setToasts((prev) =>
      (prev || []).map((t) => (t.id === id ? { ...t, isExiting: true } : t)),
    );

    // 2. Clear the toast from the React state once the slideOut ends
    setTimeout(() => {
      setToasts((prev) => (prev || []).filter((t) => t.id !== id));
    }, EXIT_ANIMATION_DURATION);
  }, []);

  const showToast = useCallback(
    (message, type = "info") => {
      const id = Date.now();
      const newToast = { id, message, type, isExiting: false };

      setToasts((prev) => [...(prev || []), newToast]);

      // Request removal phase cleanly right at the 3-second lifecycle milestone
      setTimeout(() => {
        removeToast(id);
      }, TOAST_LIFETIME);
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* The Toast Container */}
      <div className="toast-container">
        {(toasts || []).map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.isExiting ? "toast-exiting" : ""}`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="toast-content">
              <span className="toast-type-icon">
                {toast.type === "success" && "✅ "}
                {toast.type === "error" && "❌ "}
                {toast.type === "warning" && "⚠️ "}
                {toast.type === "info" && "ℹ️ "}
              </span>
              {toast.message}
            </div>

            {/* Visual Progress Countdown Bar with synchronized runtime length */}
            {!toast.isExiting && (
              <div
                className="toast-progress"
                style={{ animationDuration: `${TOAST_LIFETIME}ms` }}
              />
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg) => console.warn("ToastProvider missing. Message:", msg),
    };
  }
  return context;
};
