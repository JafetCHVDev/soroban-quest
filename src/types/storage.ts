/* ==========================================
   Storage & Export/Import Types
   ========================================== */

import { GameState, Achievement, ActivityLog } from './game';

export interface ExportData {
  version: string;
  exportedAt: string;
  gameState: GameState;
  achievements?: Record<string, any> | Achievement[];
  savedCode?: Record<string, string>;
  activityLogs?: ActivityLog[];
}

export interface ImportData {
  version?: string;
  exportedAt?: string;
  gameState?: Partial<GameState>;
  achievements?: any;
  savedCode?: Record<string, string>;
  activityLogs?: ActivityLog[];
}

export interface StorageValidationResult {
  valid: boolean;
  error?: string;
}
