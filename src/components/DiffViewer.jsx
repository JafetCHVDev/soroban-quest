// src/components/DiffViewer.jsx
import React, { useRef, useEffect, useState } from "react";

export default function DiffViewer({ userCode, solutionCode, onClose }) {
  const containerRef = useRef(null);
  const diffEditorRef = useRef(null);
  const [inline, setInline] = useState(false);
  const [monacoReady, setMonacoReady] = useState(false);

  // Boot the diff editor once Monaco is available on window
  useEffect(() => {
    let cancelled = false;

    function tryInit() {
      if (cancelled) return;
      if (!containerRef.current) return;

      // Monaco is loaded by @monaco-editor/react — wait for it
      if (!window.monaco) {
        setTimeout(tryInit, 100);
        return;
      }

      const editor = window.monaco.editor.createDiffEditor(containerRef.current, {
        theme: "vs-dark",
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        renderSideBySide: true,   // overridden by toggle below
        readOnly: true,
        padding: { top: 16 },
        wordWrap: "on",
        lineNumbers: "on",
        renderLineHighlight: "all",
        diffWordWrap: "on",
      });

      const original = window.monaco.editor.createModel(userCode, "rust");
      const modified = window.monaco.editor.createModel(solutionCode, "rust");
      editor.setModel({ original, modified });

      diffEditorRef.current = editor;
      setMonacoReady(true);
    }

    tryInit();

    return () => {
      cancelled = true;
      if (diffEditorRef.current) {
        diffEditorRef.current.dispose();
        diffEditorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle inline / side-by-side without recreating the editor
  useEffect(() => {
    if (!diffEditorRef.current) return;
    diffEditorRef.current.updateOptions({ renderSideBySide: !inline });
  }, [inline]);

  // Trap Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="diff-overlay" onClick={onClose}>
      <div className="diff-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="diff-header">
          <div className="diff-header-left">
            <span className="diff-icon">⚡</span>
            <span className="diff-title">Code Comparison</span>
          </div>

          <div className="diff-header-center">
            <div className="diff-labels">
              <span className="diff-label your-code">● Your Code</span>
              <span className="diff-label solution">● Reference Solution</span>
            </div>
          </div>

          <div className="diff-header-right">
            {/* Inline / Side-by-side toggle */}
            <div className="diff-toggle" title="Switch view mode">
              <button
                className={`diff-toggle-btn ${!inline ? "active" : ""}`}
                onClick={() => setInline(false)}
              >
                ⧉ Side-by-side
              </button>
              <button
                className={`diff-toggle-btn ${inline ? "active" : ""}`}
                onClick={() => setInline(true)}
              >
                ≡ Inline
              </button>
            </div>

            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              ← Back to Editor
            </button>
          </div>
        </div>

        {/* ── Column headers ── */}
        {!inline && (
          <div className="diff-col-headers">
            <div className="diff-col-header your-code">📝 Your Code</div>
            <div className="diff-col-header solution">✅ Reference Solution</div>
          </div>
        )}
        {inline && (
          <div className="diff-col-headers inline-header">
            <div className="diff-col-header">≡ Inline Diff — red = removed · green = added</div>
          </div>
        )}

        {/* ── Monaco diff editor container ── */}
        <div className="diff-editor-wrapper">
          {!monacoReady && (
            <div className="diff-loading">
              <span className="spinner" style={{ width: 24, height: 24 }} />
              <span>Loading diff engine…</span>
            </div>
          )}
          <div
            ref={containerRef}
            style={{ width: "100%", height: "100%", opacity: monacoReady ? 1 : 0 }}
          />
        </div>

        {/* ── Legend ── */}
        <div className="diff-legend">
          <span className="diff-legend-item added">＋ Lines you need to add</span>
          <span className="diff-legend-item removed">－ Lines that differ from solution</span>
          <span className="diff-legend-item unchanged">　 Unchanged lines</span>
          <span className="diff-legend-hint">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
}