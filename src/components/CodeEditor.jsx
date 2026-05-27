import React from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, onChange, onMount }) {
  return (
    <div className="editor-wrapper">
      <Editor
        height="100%"
        defaultLanguage="rust"
        value={code}
        onChange={(v) => onChange(v || "")}
        theme="vs-dark"
        onMount={onMount}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
          lineNumbers: "on",
          renderLineHighlight: "all",
          cursorBlinking: "smooth",
          wordWrap: "on",
          tabSize: 4,
          suggestOnTriggerCharacters: true,
          glyphMargin: true,
        }}
      />
    </div>
  );
}
