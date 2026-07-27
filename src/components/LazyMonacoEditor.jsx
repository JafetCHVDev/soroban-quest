import React, { Suspense, lazy, useRef } from "react";
import EditorPlaceholder from "./EditorPlaceholder";
import { measureEditorLoad } from "../systems/performanceMonitor";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

export default function LazyMonacoEditor(props) {
  const stopEditorLoad = useRef(null);

  if (!stopEditorLoad.current) {
    stopEditorLoad.current = measureEditorLoad();
  }

  const handleMount = (editor, monaco) => {
    stopEditorLoad.current?.();
    stopEditorLoad.current = null;
    props.onMount?.(editor, monaco);
  };

  return (
    <Suspense fallback={<EditorPlaceholder />}>
      <MonacoEditor {...props} onMount={handleMount} />
    </Suspense>
  );
}

export function preloadMonacoEditor() {
  return import("@monaco-editor/react");
}
