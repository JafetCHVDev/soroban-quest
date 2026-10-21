import React from "react";

interface MissionShortcutLegendProps {
  hasPreviousMission: boolean;
  hasNextMission: boolean;
}

/** Hotkey legend shown above the mission workspace. */
export default function MissionShortcutLegend({
  hasPreviousMission,
  hasNextMission,
}: MissionShortcutLegendProps): React.ReactElement {
  return (
    <div className="shortcut-legend-bar" style={{ display: 'flex', gap: '1rem', padding: '0.5rem 1rem', background: 'var(--bg-tertiary)', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
      <span>Hotkeys: <kbd style={{ background: '#334155', padding: '1px 5px', borderRadius: '3px', color: '#fff' }}>Ctrl+Enter</kbd> Run Tests</span>
      {hasPreviousMission && <span><kbd style={{ background: '#334155', padding: '1px 5px', borderRadius: '3px', color: '#fff' }}>P</kbd> Prev Mission</span>}
      {hasNextMission && <span><kbd style={{ background: '#334155', padding: '1px 5px', borderRadius: '3px', color: '#fff' }}>N</kbd> Next Mission</span>}
    </div>
  );
}
