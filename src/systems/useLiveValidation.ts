/* ==========================================
   useLiveValidation: debounced in-editor checks and
   security lint notes for the mission being edited
   ========================================== */

import { useCallback, useEffect, useRef, useState } from "react";
import { createDebouncedValidator, SECURITY_MARKER_SOURCE } from "./liveValidator";
import type { EditorMarker, SetEditorMarkers } from "./useMonacoMarkers";

export const LIVE_MARKER_OWNER = "soroban-quest-live";
export const SECURITY_MARKER_OWNER = "soroban-quest-security";

export interface SecurityNote {
  id: string;
  [key: string]: unknown;
}

interface LiveValidationResult {
  passCount: number;
  totalCount: number;
  markers?: EditorMarker[];
  securityNotes?: SecurityNote[];
}

interface DebouncedValidator {
  call: (_code: string, _mission: unknown) => void;
  cancel: () => void;
}

export interface UseLiveValidationOptions {
  code: string;
  mission: unknown;
  loading: boolean;
  setMarkers: SetEditorMarkers;
}

export interface UseLiveValidationReturn {
  livePassCount: number;
  liveTotalCount: number;
  securityNotes: SecurityNote[];
  resetLiveValidation: () => void;
}

export function useLiveValidation({
  code,
  mission,
  loading,
  setMarkers,
}: UseLiveValidationOptions): UseLiveValidationReturn {
  const [livePassCount, setLivePassCount] = useState(0);
  const [liveTotalCount, setLiveTotalCount] = useState(0);
  const [securityNotes, setSecurityNotes] = useState<SecurityNote[]>([]);
  const validatorRef = useRef<DebouncedValidator | null>(null);

  // Set up debounced validator once
  useEffect(() => {
    const validator: DebouncedValidator = createDebouncedValidator(
      500,
      (result: LiveValidationResult) => {
        setLivePassCount(result.passCount);
        setLiveTotalCount(result.totalCount);
        setSecurityNotes(result.securityNotes || []);
        const allMarkers = result.markers || [];
        setMarkers(
          LIVE_MARKER_OWNER,
          allMarkers.filter((m) => m.source !== SECURITY_MARKER_SOURCE),
        );
        setMarkers(
          SECURITY_MARKER_OWNER,
          allMarkers.filter((m) => m.source === SECURITY_MARKER_SOURCE),
        );
      },
    );
    validatorRef.current = validator;

    return () => {
      validator.cancel();
      setMarkers(LIVE_MARKER_OWNER, []);
      setMarkers(SECURITY_MARKER_OWNER, []);
    };
  }, [setMarkers]);

  // Re-run live validation when code or mission changes
  useEffect(() => {
    if (!mission || loading) return;
    validatorRef.current?.call(code, mission);
  }, [code, mission, loading]);

  const resetLiveValidation = useCallback((): void => {
    setLivePassCount(0);
    setLiveTotalCount(0);
    setSecurityNotes([]);
  }, []);

  return { livePassCount, liveTotalCount, securityNotes, resetLiveValidation };
}
