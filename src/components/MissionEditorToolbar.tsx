import React from "react";
import type { ChangeEvent } from "react";
import type { LanguageContextValue } from "../i18n";
import { EDITOR_THEMES } from "../systems/editorThemes";

interface EditorThemeOption {
  id: string;
  label: string;
}

interface MissionEditorToolbarProps {
  t: LanguageContextValue["t"];
  editorTheme: string;
  editorFontSize: number;
  onThemeChange: (_event: ChangeEvent<HTMLSelectElement>) => void;
  onFontSizeChange: (_event: ChangeEvent<HTMLInputElement>) => void;
  isRunning: boolean;
  isCompiling: boolean;
  hintDisabled: boolean;
  onReset: () => void;
  onHint: () => void;
  onShowSolution: () => void;
  onCompileAndRun: () => void;
  onRunTests: () => void;
}

/** Toolbar above the mission editor: file tab, editor preferences and actions. */
export default function MissionEditorToolbar({
  t,
  editorTheme,
  editorFontSize,
  onThemeChange,
  onFontSizeChange,
  isRunning,
  isCompiling,
  hintDisabled,
  onReset,
  onHint,
  onShowSolution,
  onCompileAndRun,
  onRunTests,
}: MissionEditorToolbarProps): React.ReactElement {
  return (
    <div className="mission-editor-toolbar">
      <div className="mission-editor-toolbar-left">
        <div className="editor-file-tab" aria-label="Active context tab file: lib.rs">
          <span className="dot" aria-hidden="true" /> lib.rs
        </div>
      </div>
      <div className="mission-editor-toolbar-right">
        <label className="editor-theme-select" aria-label={t("missionDetail.editor.themeLabel")}>
          <span className="editor-theme-select-label">{t("missionDetail.editor.themeLabel")}</span>
          <select
            className="editor-theme-select-input"
            value={editorTheme}
            onChange={onThemeChange}
          >
            {(EDITOR_THEMES as EditorThemeOption[]).map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.label}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          A
          <input
            type="range"
            min="10"
            max="24"
            step="1"
            value={editorFontSize}
            onChange={onFontSizeChange}
            style={{ width: '56px', accentColor: 'var(--cyan)' }}
            aria-label="Editor font size"
          />
          A
        </label>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onReset}
          disabled={isRunning}
          aria-label="Reset working environment code to template state"
        >
          {t("missionDetail.editor.reset")}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onHint}
          disabled={hintDisabled}
          aria-label="Unlock contextual hint description asset"
        >
          {t("missionDetail.editor.hint")}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onShowSolution}
          aria-label="Overwrite active workspace with solution code blueprint"
        >
          {t("missionDetail.editor.solution")}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onCompileAndRun}
          disabled={isCompiling || isRunning}
          aria-label="Compile and run the contract in a sandboxed Soroban VM"
          title="Compile & Run"
        >
          {isCompiling ? t("missionDetail.editor.compiling") : t("missionDetail.editor.compile")}
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onRunTests}
          disabled={isRunning}
        >
          {isRunning ? t("missionDetail.editor.running") : t("missionDetail.editor.run")}
        </button>
      </div>
    </div>
  );
}
