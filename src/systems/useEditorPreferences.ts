/* ==========================================
   useEditorPreferences: persisted Monaco theme and font
   size for the mission editor
   ========================================== */

import { useCallback, useState } from "react";
import type { ChangeEvent, MutableRefObject } from "react";
import { registerEditorThemes, loadEditorTheme, saveEditorTheme } from "./editorThemes";
import type { IStandaloneCodeEditor, Monaco } from "./useMonacoMarkers";

export const FONT_SIZE_STORAGE_KEY = "soroban_quest_editor_font_size";

export interface UseEditorPreferencesOptions {
  editorRef: MutableRefObject<IStandaloneCodeEditor | null>;
  monacoRef: MutableRefObject<Monaco | null>;
}

export interface UseEditorPreferencesReturn {
  editorTheme: string;
  editorFontSize: number;
  handleEditorMount: (_editor: IStandaloneCodeEditor, _monaco: Monaco) => void;
  handleThemeChange: (_event: ChangeEvent<HTMLSelectElement>) => void;
  handleFontSizeChange: (_event: ChangeEvent<HTMLInputElement>) => void;
}

export function useEditorPreferences({
  editorRef,
  monacoRef,
}: UseEditorPreferencesOptions): UseEditorPreferencesReturn {
  const [editorTheme, setEditorTheme] = useState<string>(() => loadEditorTheme());
  const [editorFontSize, setEditorFontSize] = useState(() => {
    return parseInt(localStorage.getItem(FONT_SIZE_STORAGE_KEY) || "14", 10);
  });

  const handleEditorMount = useCallback(
    (editor: IStandaloneCodeEditor, monaco: Monaco): void => {
      editorRef.current = editor;
      monacoRef.current = monaco;
      // Register custom themes so the stored selection applies on first paint.
      registerEditorThemes(monaco);
      monaco.editor.setTheme(editorTheme);
    },
    [editorRef, monacoRef, editorTheme],
  );

  const handleThemeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      const nextTheme = event.target.value;
      setEditorTheme(nextTheme);
      saveEditorTheme(nextTheme);
      monacoRef.current?.editor.setTheme(nextTheme);
    },
    [monacoRef],
  );

  const handleFontSizeChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const size = parseInt(event.target.value, 10);
    setEditorFontSize(size);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(size));
  }, []);

  return {
    editorTheme,
    editorFontSize,
    handleEditorMount,
    handleThemeChange,
    handleFontSizeChange,
  };
}
