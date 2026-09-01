import React, { useEffect, useRef, ReactElement } from "react";
import "./ConfirmationDialog.css";

/**
 * ConfirmationDialog component props
 */
interface ConfirmationDialogProps {
  /** Whether the dialog is visible */
  isOpen: boolean;
  /** Dialog title */
  title: string;
  /** Dialog message/description */
  message: string;
  /** Text for the confirm button */
  confirmText: string;
  /** Text for the cancel button */
  cancelText: string;
  /** Callback when confirm button is clicked */
  onConfirm: () => void;
  /** Callback when cancel button is clicked or dialog is dismissed */
  onCancel: () => void;
}

/**
 * ConfirmationDialog component
 * Modal dialog with confirm/cancel buttons, keyboard navigation, and focus trapping
 *
 * @param {ConfirmationDialogProps} props - Component props
 * @returns {ReactElement | null} Confirmation dialog overlay and content
 */
export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps): ReactElement | null {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation & Focus trapping
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const dialogElement = dialogRef.current;
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = Array.from(dialogElement.querySelectorAll(focusableSelectors)) as HTMLElement[];

    if (focusableElements.length === 0) return;

    // Focus the cancel button (usually the first button or btn-cancel) by default for safety in destructive actions
    const cancelBtn = focusableElements.find(
      (el) => el.classList.contains("btn-cancel") || el.getAttribute("data-cancel") === "true"
    );
    if (cancelBtn) {
      cancelBtn.focus();
    } else {
      focusableElements[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
        return;
      }

      if (e.key !== "Tab") return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="dialog-overlay"
      onClick={onCancel}
      role="presentation"
    >
      <div
        className="dialog-content"
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-icon" role="img" aria-hidden="true">
          ⚠️
        </div>
        <h2 id="dialog-title" className="dialog-title">
          {title}
        </h2>
        <p id="dialog-description" className="dialog-message">
          {message}
        </p>
        <div className="dialog-actions">
          <button
            type="button"
            className="btn btn-secondary btn-cancel"
            onClick={onCancel}
            data-cancel="true"
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn btn-confirm"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
