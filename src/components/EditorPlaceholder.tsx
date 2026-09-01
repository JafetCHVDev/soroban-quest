import React, { ReactElement } from "react";
import "./EditorPlaceholder.css";

/**
 * EditorPlaceholder component
 * Displays a skeleton loader for the Monaco editor while it's loading
 *
 * @returns {ReactElement} Editor placeholder skeleton
 */
export default function EditorPlaceholder(): ReactElement {
  return (
    <div className="editor-placeholder" role="status" aria-label="Loading code editor">
      <div className="editor-placeholder__gutter">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="editor-placeholder__line-number">{i + 1}</span>
        ))}
      </div>
      <div className="editor-placeholder__body">
        <div className="editor-placeholder__bar" style={{ width: "70%" }} />
        <div className="editor-placeholder__bar" style={{ width: "45%" }} />
        <div className="editor-placeholder__bar" style={{ width: "85%" }} />
        <div className="editor-placeholder__bar" style={{ width: "30%" }} />
        <div className="editor-placeholder__bar" style={{ width: "60%" }} />
      </div>
    </div>
  );
}
