import React from 'react';
import { ShieldAlert } from 'lucide-react';
import './SecurityNotes.css';

export default function SecurityNotes({ notes, t }) {
  if (!notes?.length) return null;

  return (
    <details className="security-notes" role="region" aria-label={t('missionDetail.securityNotes.title')}>
      <summary className="security-notes-summary">
        <ShieldAlert size={14} aria-hidden="true" />
        <span className="security-notes-title">{t('missionDetail.securityNotes.title')}</span>
        <span className="security-notes-count">
          {t('missionDetail.securityNotes.count', { count: notes.length })}
        </span>
      </summary>
      <p className="security-notes-advisory">{t('missionDetail.securityNotes.advisory')}</p>
      <ul className="security-notes-list">
        {notes.map((note) => (
          <li key={note.id} className={`security-notes-item is-${note.severity}`}>
            <strong className="security-notes-item-title">
              {t(note.titleKey)}
            </strong>
            <span className="security-notes-item-body">
              {t(note.messageKey, { functionName: note.functionName })}
            </span>
            <span className="security-notes-item-line">
              {t('missionDetail.securityNotes.line', { line: note.line })}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
