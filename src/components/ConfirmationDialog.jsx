import React, { useEffect, useRef } from "react";
import "./ConfirmationDialog.css";

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  // Keyboard navigation & Focus trapping
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const dialogElement = dialogRef.current;
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = dialogElement.querySelectorAll(focusableSelectors);

    if (focusableElements.length === 0) return;

    // Focus the cancel button (usually the first button or btn-cancel) by default for safety in destructive actions
    const cancelBtn = Array.from(focusableElements).find(
      (el) => el.classList.contains("btn-cancel") || el.getAttribute("data-cancel") === "true"
    );
    if (cancelBtn) {
      cancelBtn.focus();
    } else {
      focusableElements[0].focus();
    }

    const handleKeyDown = (e) => {
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
