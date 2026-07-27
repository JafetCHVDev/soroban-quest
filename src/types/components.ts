/* ==========================================
   React Components Props Types
   ========================================== */

import { ReactNode } from 'react';

export interface NavbarProps {
  className?: string;
}

export interface FooterProps {
  className?: string;
}

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface CodeReplayEvent {
  timestamp: number;
  code: string;
  cursorOffset?: number;
}

export interface CodeReplayPlayerProps {
  events: CodeReplayEvent[];
  onClose: () => void;
}

export interface CollaborationUser {
  id: string;
  name: string;
  color?: string;
  avatar?: string;
}

export interface CollaborationAvatarProps {
  user: CollaborationUser;
  color?: string;
}

export interface CollaborationBarProps {
  roomId: string;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
}

export interface LanguageSelectorProps {
  className?: string;
}

export interface LoadingScreenProps {
  message?: string;
}

export interface MissionDetailSkeletonProps {
  className?: string;
}

export interface OnboardingProps {
  onComplete: () => void;
}

export interface ScrollToTopProps {
  smooth?: boolean;
}

export interface ConfettiProps {
  active: boolean;
  duration?: number;
}
