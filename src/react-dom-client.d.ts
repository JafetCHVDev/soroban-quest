/**
 * TypeScript declaration augmentation for react-dom/client
 * Ensures proper typing for React 18 client API
 */

import type { ReactElement } from 'react';

declare module 'react-dom/client' {
  export interface Root {
    render(children: ReactElement | null): void;
    unmount(): void;
  }

  export function createRoot(container: Element | Document): Root;
}
