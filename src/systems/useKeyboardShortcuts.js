import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts(isOpen, setIsOpen) {
  const navigate = useNavigate();

  const [enabled] = useState(() => {
    const saved = localStorage.getItem('shortcuts_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('shortcuts_enabled', JSON.stringify(enabled));
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      const target = event.target;

      const isInput =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.isContentEditable ||
        target.classList.contains('monaco-editor') ||
        target.closest('.monaco-editor');

      if (event.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (isInput) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      if ((modifier && event.key.toLowerCase() === 'k') || event.key === '?') {
        event.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (modifier && !event.shiftKey && !event.altKey) {
        if (event.key === '1') {
          event.preventDefault();
          navigate('/');
        } else if (event.key === '2') {
          event.preventDefault();
          navigate('/campaigns');
        } else if (event.key === '3') {
          event.preventDefault();
          navigate('/quests');
        } else if (event.key === '4') {
          event.preventDefault();
          navigate('/profile');
        } else if (event.key === '5') {
          event.preventDefault();
          navigate('/journal');
        }
      }

      if (modifier) {
        if (event.key === 'Enter') {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('shortcut:run-tests'));
        } else if (event.shiftKey && event.key.toLowerCase() === 'r') {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('shortcut:reset-template'));
        } else if (event.shiftKey && event.key.toLowerCase() === 's') {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('shortcut:show-solution'));
        } else if (event.key === '/') {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('shortcut:toggle-hints'));
        } else if (event.shiftKey && event.key.toLowerCase() === 'h') {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent('shortcut:toggle-theme'));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, navigate, setIsOpen]);

  return { enabled };
}
