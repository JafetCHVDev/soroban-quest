import React, { Suspense, lazy, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import type { IStandaloneCodeEditor, Monaco } from "monaco-editor";
import EditorPlaceholder from "./EditorPlaceholder";
import { measureEditorLoad } from "../systems/performanceMonitor";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

/**
 * LazyMonacoEditor component props
 * Accepts all props that @monaco-editor/react accepts
 */
interface LazyMonacoEditorProps {
  /** Callback when editor is mounted */
  onMount?: (_editor: IStandaloneCodeEditor, _monaco: Monaco) => void;
  [key: string]: unknown;
}

/**
 * LazyMonacoEditor component
 * Wraps Monaco Editor with lazy loading and performance monitoring
 *
 * @param {LazyMonacoEditorProps} props - Component props passed to MonacoEditor
 * @returns {ReactElement} Monaco editor with fallback skeleton
 */
export default function LazyMonacoEditor(props: LazyMonacoEditorProps): ReactElement {
  const stopEditorLoad = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!stopEditorLoad.current) {
      stopEditorLoad.current = measureEditorLoad();
    }
  }, []);

  const handleMount = (editor: IStandaloneCodeEditor, monaco: Monaco): void => {
    stopEditorLoad.current?.();
    stopEditorLoad.current = null;
    if (typeof window !== 'undefined') {
      const globalWindow = window as Window & {
        __MONACO_EDITOR__?: IStandaloneCodeEditor;
        monaco?: Monaco;
      };
      globalWindow.__MONACO_EDITOR__ = editor;
      globalWindow.monaco = monaco;
    }
    props.onMount?.(editor, monaco);
  };

  return (
    <Suspense fallback={<EditorPlaceholder />}>
      <MonacoEditor {...props} onMount={handleMount} />
    </Suspense>
  );
}

/**
 * Preload Monaco Editor bundle
 * @returns Promise that resolves when Monaco Editor is loaded
 */
export function preloadMonacoEditor(): Promise<typeof import('@monaco-editor/react')> {
  return import("@monaco-editor/react");
}
