import React, { useRef, useEffect } from "react";

export default function TestTerminal({ testResults }) {
  const terminalBodyRef = useRef(null);

  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [testResults]);

  return (
    <div className="mission-terminal-panel">
      <div className="terminal">
        <div className="terminal-header">
          <span className="terminal-dot red" />
          <span className="terminal-dot yellow" />
          <span className="terminal-dot green" />
          <span className="terminal-title">Test Output</span>
        </div>
        <div className="terminal-body" ref={terminalBodyRef}>
          {testResults.length === 0 ? (
            <span className="terminal-line info terminal-line-muted">
              Click "Run Tests" to validate your code...
            </span>
          ) : (
            testResults.map((r, i) => (
              <span
                key={i}
                className={`terminal-line ${
                  r.passed === true
                    ? "pass"
                    : r.passed === false
                    ? "fail"
                    : "info"
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
