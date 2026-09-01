/**
 * @file components.ts
 * Common React component prop types
 */

import type { ReactNode, CSSProperties } from 'react';
import type { GameState, Profile, Mission, Badge } from './game';

/**
 * Common base props for all components
 */
export interface BaseProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Common layout props
 */
export interface LayoutProps extends BaseProps {
  headerContent?: ReactNode;
  footerContent?: ReactNode;
}

/**
 * Modal/Dialog props
 */
export interface DialogProps {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  onConfirm?: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  children?: ReactNode;
}

/**
 * Confirmation dialog props
 */
export interface ConfirmationDialogProps extends DialogProps {
  message: string;
  isDangerous?: boolean;
}

/**
 * Game state context props
 */
export interface GameStateContextProps {
  progress: GameState;
  profile: Profile;
  updateProgress: (state: Partial<GameState>) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  resetProgress: () => void;
  resetProfile: () => void;
}

/**
 * Toast notification props
 */
export interface ToastProps {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
}

/**
 * Toast context props
 */
export interface ToastContextProps {
  addToast: (message: string, type?: ToastProps['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  toasts: ToastProps[];
}

/**
 * Mission card props
 */
export interface MissionCardProps {
  mission: Mission;
  isCompleted: boolean;
  attempts: number;
  onSelect: (missionId: string) => void;
}

/**
 * Mission detail props
 */
export interface MissionDetailProps {
  mission: Mission;
  currentCode: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  isValidating: boolean;
}

/**
 * Badge display props
 */
export interface BadgeDisplayProps {
  badge: Badge;
  isUnlocked: boolean;
}

/**
 * Loading skeleton props
 */
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  count?: number;
  circle?: boolean;
}

/**
 * Button props
 */
export interface ButtonProps extends BaseProps {
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

/**
 * Form field props
 */
export interface FormFieldProps extends BaseProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Input field props
 */
export interface InputProps extends FormFieldProps {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Select props
 */
export interface SelectProps<T = string> extends FormFieldProps {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}

/**
 * Error boundary state
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: {
    componentStack: string;
  };
}
