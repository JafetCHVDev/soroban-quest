/* ==========================================
   SDK Reference Panel Component
   Collapsible panel with searchable Soroban documentation
   ========================================== */

import React, { useState, useMemo } from 'react';
import {
  SDK_CATEGORIES,
  getEntriesByCategory,
  searchSDKEntries,
  getHighlightedEntries,
} from '../data/sdkReference';

export default function SDKReferencePanel({ isOpen, onClose, conceptsIntroduced = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntry, setExpandedEntry] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Get highlighted entries based on mission concepts
  const highlightedIds = useMemo(() => {
    return getHighlightedEntries(conceptsIntroduced).map(e => e.id);
  }, [conceptsIntroduced]);

  // Filter entries by search and category
  const filteredEntries = useMemo(() => {
    let result = searchQuery
      ? searchSDKEntries(searchQuery)
      : getEntriesByCategory(selectedCategory);
    return result;
  }, [searchQuery, selectedCategory]);

  // Copy example to clipboard
  const handleCopy = (example, id) => {
    navigator.clipboard.writeText(example);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Close panel on background click
  const handleBackgroundClick = () => {
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="sdk-panel-overlay"
          onClick={handleBackgroundClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease-out',
          }}
        />
      )}

      {/* Panel */}
      <div
        className="sdk-reference-panel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '380px',
          maxWidth: '90vw',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isOpen ? '-4px 0 16px rgba(0, 0, 0, 0.3)' : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-md)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            📚 SDK Reference
          </h3>
          <button
            className="btn btn-ghost"
            onClick={onClose}
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '1.2rem',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Search Box */}
        <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border-subtle)' }}>
          <input
            type="text"
            placeholder="Search SDK..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedCategory('All');
            }}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-code)',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--cyan)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-subtle)';
            }}
          />
        </div>

        {/* Category Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-xs)',
            padding: 'var(--space-md)',
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto',
          }}
        >
          {SDK_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchQuery('');
              }}
              style={{
                padding: '0.4rem 0.8rem',
                background: selectedCategory === cat ? 'var(--cyan-dim)' : 'transparent',
                color: selectedCategory === cat ? 'var(--cyan)' : 'var(--text-secondary)',
                border: selectedCategory === cat ? `1px solid var(--cyan)` : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Entries List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
          }}
        >
          {filteredEntries.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-2xl)',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              No entries found
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isHighlighted = highlightedIds.includes(entry.id);
              const isExpanded = expandedEntry === entry.id;

              return (
                <div
                  key={entry.id}
                  onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                  style={{
                    background: isHighlighted ? 'rgba(6, 214, 160, 0.08)' : 'var(--bg-tertiary)',
                    border: isHighlighted
                      ? '1px solid rgba(6, 214, 160, 0.3)'
                      : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--cyan)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isHighlighted
                      ? 'rgba(6, 214, 160, 0.3)'
                      : 'var(--border-subtle)';
                  }}
                >
                  {/* Entry Header */}
                  <div
                    style={{
                      padding: 'var(--space-md)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 'var(--space-sm)',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-xs)',
                          marginBottom: '0.3rem',
                        }}
                      >
                        {isHighlighted && (
                          <span
                            style={{
                              display: 'inline-block',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: 'var(--cyan)',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <h4
                          style={{
                            margin: 0,
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-code)',
                          }}
                        >
                          {entry.name}
                        </h4>
                      </div>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.65rem',
                          padding: '0.2rem 0.4rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-muted)',
                          marginBottom: '0.3rem',
                        }}
                      >
                        {entry.category}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '1.1rem',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      ▼
                    </span>
                  </div>

                  {/* Entry Details (Expanded) */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '0 var(--space-md) var(--space-md) var(--space-md)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-md)',
                      }}
                    >
                      {/* Signature */}
                      {entry.signature && (
                        <div>
                          <p
                            style={{
                              margin: '0 0 0.3rem 0',
                              fontSize: '0.7rem',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                              letterSpacing: '0.05em',
                            }}
                          >
                            Signature
                          </p>
                          <code
                            style={{
                              display: 'block',
                              padding: '0.6rem 0.8rem',
                              background: 'rgba(0, 0, 0, 0.2)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              color: 'var(--cyan)',
                              fontFamily: 'var(--font-code)',
                              overflow: 'auto',
                              lineHeight: 1.4,
                            }}
                          >
                            {entry.signature}
                          </code>
                        </div>
                      )}

                      {/* Description */}
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.5,
                          }}
                        >
                          {entry.description}
                        </p>
                      </div>

                      {/* Parameters */}
                      {entry.params && entry.params.length > 0 && (
                        <div>
                          <p
                            style={{
                              margin: '0 0 0.3rem 0',
                              fontSize: '0.7rem',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                              letterSpacing: '0.05em',
                            }}
                          >
                            Parameters
                          </p>
                          <ul
                            style={{
                              margin: 0,
                              paddingLeft: '1.2rem',
                              fontSize: '0.8rem',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {entry.params.map((param, idx) => (
                              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                                {param}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Return Type */}
                      {entry.returnType && entry.returnType !== 'N/A' && (
                        <div>
                          <p
                            style={{
                              margin: '0 0 0.3rem 0',
                              fontSize: '0.7rem',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                              letterSpacing: '0.05em',
                            }}
                          >
                            Returns
                          </p>
                          <code
                            style={{
                              display: 'block',
                              fontSize: '0.75rem',
                              color: 'var(--purple)',
                              fontFamily: 'var(--font-code)',
                            }}
                          >
                            {entry.returnType}
                          </code>
                        </div>
                      )}

                      {/* Example */}
                      {entry.example && (
                        <div>
                          <p
                            style={{
                              margin: '0 0 0.3rem 0',
                              fontSize: '0.7rem',
                              color: 'var(--text-muted)',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                              letterSpacing: '0.05em',
                            }}
                          >
                            Example
                          </p>
                          <pre
                            style={{
                              margin: 0,
                              padding: '0.6rem 0.8rem',
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.7rem',
                              color: '#d4d4d4',
                              fontFamily: 'var(--font-code)',
                              overflow: 'auto',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              lineHeight: 1.4,
                            }}
                          >
                            {entry.example}
                          </pre>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(entry.example, entry.id);
                            }}
                            style={{
                              marginTop: '0.5rem',
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.75rem',
                              background: copiedId === entry.id ? 'var(--cyan-dim)' : 'transparent',
                              color: copiedId === entry.id ? 'var(--cyan)' : 'var(--text-secondary)',
                              border: `1px solid ${copiedId === entry.id ? 'var(--cyan)' : 'var(--border-subtle)'}`,
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                          >
                            {copiedId === entry.id ? '✓ Copied!' : '📋 Copy Example'}
                          </button>
                        </div>
                      )}

                      {/* Docs Link */}
                      {entry.docUrl && (
                        <a
                          href={entry.docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '0.6rem 0.8rem',
                            background: 'rgba(6, 214, 160, 0.1)',
                            border: '1px solid rgba(6, 214, 160, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--cyan)',
                            fontSize: '0.8rem',
                            textAlign: 'center',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(6, 214, 160, 0.2)';
                            e.target.style.borderColor = 'var(--cyan)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(6, 214, 160, 0.1)';
                            e.target.style.borderColor = 'rgba(6, 214, 160, 0.3)';
                          }}
                        >
                          → Open Docs
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Scrollbar styling for panel */
        .sdk-reference-panel::-webkit-scrollbar {
          width: 8px;
        }
        .sdk-reference-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        .sdk-reference-panel::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .sdk-reference-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
}
