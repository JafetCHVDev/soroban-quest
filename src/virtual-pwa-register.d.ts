/**
 * TypeScript declaration for virtual:pwa-register/react
 * Vite plugin for PWA registration in React
 */

declare module 'virtual:pwa-register/react' {
  import type { ReactElement } from 'react';

  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration) => void;
    onRegistrationError?: (error: unknown) => void;
  }

  export interface UseRegisterSWResult {
    needRefresh: [boolean, (needRefresh: boolean) => void];
    offlineReady: [boolean, (offlineReady: boolean) => void];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  }

  export function useRegisterSW(options?: RegisterSWOptions): UseRegisterSWResult;
}
