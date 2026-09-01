import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  FC,
} from 'react';
import './Toast.css'; // Ensure the styles are loaded alongside the context

/**
 * Toast notification configuration
 */
export interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isExiting: boolean;
}

/**
 * Toast context value type
 */
export interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void;
}

/**
 * Toast context
 */
const ToastContext = createContext<ToastContextValue | null>(null);

// Shared Timing Configuration Constants (Acceptance Criteria #3)
export const TOAST_LIFETIME = 3000; // 3 seconds visibility countdown
const EXIT_ANIMATION_DURATION = 300; // 300ms matches CSS slideOut duration

/**
 * ToastProvider component provides toast notification functionality to child components.
 * @param props - Component props
 * @param props.children - Child components
 * @returns Toast provider element
 */
export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number): void => {
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
    (message: string, type: Toast['type'] = 'info'): void => {
      const id = Date.now();
      const newToast: Toast = { id, message, type, isExiting: false };

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
      <div className="toast-container" aria-live="polite" role="status">
        {(toasts || []).map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${
              toast.isExiting ? 'toast-exiting' : ''
            }`}
            onClick={() => dismissToast(toast.id)} // FIX: Changed from invalid removeToast to dismissToast
            role="alert"
            aria-atomic="true"
            style={{
              cursor: 'pointer',
              '--duration': `${TOAST_LIFETIME}ms`,
            } as React.CSSProperties}
          >
            <div className="toast-content">{toast.message}</div>
            <div className="toast-progress" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * Hook to access toast notifications from anywhere in the app.
 * Returns a fallback object if ToastProvider is not present in the tree.
 * @returns Toast context value with showToast function
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  // Fallback pattern to gracefully bypass runtime destructuring faults if context is missing
  if (!context) {
    return {
      showToast: (msg) =>
        console.warn('ToastProvider missing. Message:', msg),
    };
  }
  return context;
};
