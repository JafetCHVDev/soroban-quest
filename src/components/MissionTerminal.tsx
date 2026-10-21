import React from "react";
import type { MutableRefObject } from "react";
import type { LanguageContextValue } from "../i18n";
import type { TerminalLine } from "../systems/useMissionCompileRunner";

interface MissionTerminalProps {
  testResults: TerminalLine[];
  terminalBodyRef: MutableRefObject<HTMLDivElement | null>;
  t: LanguageContextValue["t"];
}

/** Terminal panel that streams test and compiler output for a mission. */
export default function MissionTerminal({
  testResults,
  terminalBodyRef,
  t,
}: MissionTerminalProps): React.ReactElement {
  return (
    <div
      className="mission-terminal-panel"
      role="region"
      aria-label="Validation execution test terminal log terminal"
    >
      <div className="terminal" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div className="terminal-header">
          <span className="terminal-dot red" aria-hidden="true" />
          <span className="terminal-dot yellow" aria-hidden="true" />
          <span className="terminal-dot green" aria-hidden="true" />
          <span className="terminal-title">{t("missionDetail.terminal.title")}</span>
        </div>
        <div className="terminal-body" ref={terminalBodyRef} style={{ flex: 1 }}>
          {testResults.length === 0 ? (
            <span className="terminal-line info" style={{ color: "var(--text-muted)" }}>
              {t("missionDetail.terminal.placeholder")}
            </span>
          ) : (
            testResults.map((r, i) => (
              <span
                key={i}
                className={`terminal-line ${
                  r.passed === true ? "pass" : r.passed === false ? "fail" : "info"
                }`}
              >
                {r.message}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
