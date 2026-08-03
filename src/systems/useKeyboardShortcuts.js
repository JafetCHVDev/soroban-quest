import { useEffect, useCallback } from 'react';

export function useKeyboardShortcuts({ isOpen, setIsOpen, onAction }) {
  const handleKeyDown = useCallback(
    (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      // Escape always closes the modal if open
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        return;
      }

      // Toggle modal with '?' (when not typing in inputs) or Cmd/Ctrl + K
      if (
        (!modifier && event.key === '?' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) ||
        (modifier && event.key.toLowerCase() === 'k')
      ) {
        event.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      // If modal is open or user is typing inside text editors/inputs, don't trigger navigation shortcuts
      if (isOpen || ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      // Navigation shortcuts
      if (modifier && !event.shiftKey) {
        switch (event.key) {
          case '1':
            event.preventDefault();
            onAction?.('home');
            break;
          case '2':
            event.preventDefault();
            onAction?.('campaigns');
            break;
          case '3':
            event.preventDefault();
            onAction?.('missions');
            break;
          case '4':
            event.preventDefault();
            onAction?.('profile');
            break;
          case '5':
            event.preventDefault();
            onAction?.('journal');
            break;
          case '/':
            event.preventDefault();
            onAction?.('toggle-hints');
            break;
          default:
            break;
        }
      }

      // Mission / Editor & Theme shortcuts with Modifier + Shift
      if (modifier && event.shiftKey) {
        switch (event.key.toLowerCase()) {
          case 'r':
            event.preventDefault();
            onAction?.('reset-template');
            break;
          case 's':
            event.preventDefault();
            onAction?.('show-solution');
            break;
          case 'h':
            event.preventDefault();
            onAction?.('toggle-theme');
            break;
          default:
            break;
        }
      }

      // Run tests: Ctrl/Cmd + Enter
      if (modifier && event.key === 'Enter') {
        event.preventDefault();
        onAction?.('run-tests');
      }
    },
    [isOpen, setIsOpen, onAction]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}