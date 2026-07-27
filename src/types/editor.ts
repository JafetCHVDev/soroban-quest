/* ==========================================
   Editor & Code Validator Types
   ========================================== */

export interface ThemeRule {
  token: string;
  foreground?: string;
  background?: string;
  fontStyle?: string;
}

export interface EditorTheme {
  id: string;
  name: string;
  base: 'vs' | 'vs-dark' | 'hc-black';
  inherit: boolean;
  rules: ThemeRule[];
  colors: Record<string, string>;
}

export interface CheckResult {
  type?: string;
  description: string;
  passed: boolean;
  message?: string;
}

export interface ValidationResult {
  passed: boolean;
  score?: number;
  errors: string[];
  passedChecks: string[];
  totalChecks: number;
  checkResults?: CheckResult[];
}
