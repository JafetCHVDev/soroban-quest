/**
 * @file storage.ts
 * Storage, import/export, and persistence types
 */

import type { GameState, Profile, ProfileSlot, ExportData } from './game';

/**
 * Import validation result
 */
export interface ImportValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Storage operations result
 */
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Cloud sync status
 */
export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime?: number;
  error?: string;
}

/**
 * Profile settings
 */
export interface ProfileSettings {
  id: string;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
}

/**
 * Backup metadata
 */
export interface BackupMetadata {
  id: string;
  timestamp: number;
  label?: string;
  version: string;
  size: number;
}

/**
 * Storage quota info
 */
export interface StorageQuota {
  usage: number;
  limit: number;
  percentage: number;
}

/**
 * Compressed export (for download)
 */
export interface CompressedExport {
  data: Blob;
  filename: string;
  mimeType: string;
}

/**
 * Migration status
 */
export interface MigrationStatus {
  completed: boolean;
  fromVersion: string;
  toVersion: string;
  itemsMigrated: number;
  errors?: string[];
}
