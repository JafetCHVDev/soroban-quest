import React from "react";
import { useTranslation } from "../i18n/useTranslation";
import "./KeyboardShortcuts.css";

export default function KeyboardShortcuts({ isOpen, onClose }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  const shortcutSections = [
    {
      category: t("shortcuts.categories.navigation"),
      items: [
        { keys: [modKey, "1"], label: t("shortcuts.descriptions.home") },
        { keys: [modKey, "2"], label: t("shortcuts.descriptions.campaigns") },
        { keys: [modKey, "3"], label: t("shortcuts.descriptions.missions") },
        { keys: [modKey, "4"], label: t("shortcuts.descriptions.profile") },
        { keys: [modKey, "5"], label: t("shortcuts.descriptions.journal") },
      ],
    },
    {
      category: t("shortcuts.categories.missionEditor"),
      items: [
        { keys: [modKey, "Enter"], label: t("shortcuts.descriptions.runTests") },
        { keys: [modKey, "Shift", "R"], label: t("shortcuts.descriptions.resetTemplate") },
        { keys: [modKey, "Shift", "S"], label: t("shortcuts.descriptions.showSolution") },
        { keys: [modKey, "/"], label: t("shortcuts.descriptions.toggleHints") },
        { keys: [modKey, "Shift", "H"], label: t("shortcuts.descriptions.toggleTheme") },
      ],
    },
    {
      category: t("shortcuts.categories.general"),
      items: [
        { keys: [modKey, "K"], label: t("shortcuts.descriptions.openModal") },
        { keys: ["?"], label: t("shortcuts.descriptions.openModal") },
        { keys: ["Esc"], label: t("shortcuts.descriptions.closeModal") },
      ],
    },
  ];

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>{t("shortcuts.title")}</h2>
          <button className="shortcuts-close-btn" onClick={onClose}>×</button>
        </div>
        <p className="shortcuts-subtitle">{t("shortcuts.subtitle")}</p>

        <div className="shortcuts-body">
          {shortcutSections.map((section, idx) => (
            <div key={idx} className="shortcuts-section">
              <h3>{section.category}</h3>
              <div className="shortcuts-grid">
                {section.items.map((item, i) => (
                  <div key={i} className="shortcut-row">
                    <span className="shortcut-label">{item.label}</span>
                    <div className="shortcut-keys">
                      {item.keys.map((k, kIdx) => (
                        <kbd key={kIdx} className="kbd-key">{k}</kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}