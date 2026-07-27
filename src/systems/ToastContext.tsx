import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import "./Toast.css";

export type ToastType = "info" | "success" | "error" | "warning" | string;

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  isExiting: boolean;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const TOAST_LIFETIME = 3000;
const EXIT_ANIMATION_DURATION = 300;

export interface ToastProviderProps {
  children?: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) =>
      (prev || []).map((t) => (t.id === id ? { ...t, isExiting: true } : t)),
    );

    setTimeout(() => {
      setToasts((prev) => (prev || []).filter((t) => t.id !== id));
    }, EXIT_ANIMATION_DURATION);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now();
      const newToast: ToastItem = { id, message, type, isExiting: false };

      setToasts((prev) => [...(prev || []), newToast]);

      setTimeout(() => {
        dismissToast(id);
      }, TOAST_LIFETIME);
    },
    [dismissToast],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" aria-live="polite" role="status">
        {(toasts || []).map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.isExiting ? "toast-exiting" : ""}`}
            onClick={() => dismissToast(toast.id)}
            role="alert"
            aria-atomic="true"
            style={{
              cursor: "pointer",
              ["--duration" as any]: `${TOAST_LIFETIME}ms`,
            }}
          >
            <div className="toast-content">{toast.message}</div>
            <div className="toast-progress" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg: string) => console.warn("ToastProvider missing. Message:", msg),
    };
  }
  return context;
};
