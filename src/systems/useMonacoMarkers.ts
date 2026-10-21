/* ==========================================
   useMonacoMarkers: owns the Monaco editor refs and writes
   diagnostics to the editor model under a marker owner
   ========================================== */

import { useCallback, useRef } from "react";
import type { MutableRefObject } from "react";
import type * as MonacoApi from "monaco-editor";

export type Monaco = typeof MonacoApi;
export type IStandaloneCodeEditor = MonacoApi.editor.IStandaloneCodeEditor;
export type EditorMarker = MonacoApi.editor.IMarkerData;
export type SetEditorMarkers = (_owner: string, _markers: EditorMarker[]) => void;

export interface UseMonacoMarkersReturn {
  editorRef: MutableRefObject<IStandaloneCodeEditor | null>;
  monacoRef: MutableRefObject<Monaco | null>;
  /**
   * Replaces the markers for `owner`; pass an empty array to clear them.
   * Referentially stable: hooks that set up the validator and compiler key
   * their effects on it, so a new identity would tear them down.
   */
  setMarkers: SetEditorMarkers;
}

export function useMonacoMarkers(): UseMonacoMarkersReturn {
  const editorRef = useRef<IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  const setMarkers = useCallback<SetEditorMarkers>((owner, markers) => {
    const monaco = monacoRef.current;
    const editorInstance = editorRef.current;
    if (!monaco || !editorInstance) return;
    const model = editorInstance.getModel();
    if (!model) return;
    monaco.editor.setModelMarkers(model, owner, markers);
  }, []);

  return { editorRef, monacoRef, setMarkers };
}
