import React, { Suspense, lazy } from "react";
import EditorPlaceholder from "./EditorPlaceholder";

const MonacoEditor = lazy(() => import("@monaco-editor/react"));

export default function LazyMonacoEditor(props) {
  return (
    <Suspense fallback={<EditorPlaceholder />}>
      <MonacoEditor {...props} />
    </Suspense>
  );
}

export function preloadMonacoEditor() {
  return import("@monaco-editor/react");
}
