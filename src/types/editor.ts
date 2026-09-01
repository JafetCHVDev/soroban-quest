/**
 * @file editor.ts
 * Editor and code validation types
 */

/**
 * Theme names for the Monaco editor
 */
export type EditorTheme = 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';

/**
 * Result from code validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Single validation error
 */
export interface ValidationError {
  code: string;
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Single validation warning
 */
export interface ValidationWarning {
  code: string;
  message: string;
  line?: number;
  column?: number;
}

/**
 * Code execution result
 */
export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime?: number;
}

/**
 * Editor state snapshot
 */
export interface EditorState {
  code: string;
  language: string;
  theme: EditorTheme;
  readOnly?: boolean;
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
}

/**
 * Code replay event (for collaboration/recording)
 */
export interface CodeReplayEvent {
  timestamp: number;
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  userId?: string;
}

/**
 * Compiler configuration
 */
export interface CompilerConfig {
  target: string;
  optimizationLevel: number;
  features?: string[];
}
