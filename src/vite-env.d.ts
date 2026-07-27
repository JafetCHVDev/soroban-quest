/// <reference types="vite/client" />

declare module '*?raw' {
  const content: string;
  export default content;
}

declare module 'virtual:pwa-register/react' {
  export function useRegisterSW(options?: any): {
    needRefresh: [boolean, (val: boolean) => void];
    offlineReady: [boolean, (val: boolean) => void];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}
