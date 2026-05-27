import React from "react";

export default function EditorToolbar({
  onReset,
  onHint,
  onShowSolution,
  onRunTests,
  isRunning,
  mission,
  hintIndex,
}) {
  const hasMoreHints = mission?.hints && hintIndex < mission.hints.length - 1;

  return (
    <div className="mission-editor-toolbar">
      <div className="mission-editor-toolbar-left">
        <div className="editor-file-tab">
          <span className="dot" /> lib.rs
        </div>
      </div>
      <div className="mission-editor-toolbar-right">
        <button
          className="btn btn-ghost btn-sm"
          onClick={onReset}
          disabled={isRunning}
        >
          ↺ Reset
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onHint}
          disabled={!hasMoreHints}
        >
          💡 Hint
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onShowSolution}
        >
          👁️ Solution
        </button>
        <button
          className="btn btn-primary btn-sm"
          onClick={onRunTests}
          disabled={isRunning}
        >
          {isRunning ? "Running..." : "▶ Run Tests"}
        </button>
      </div>
    </div>
  );
}
