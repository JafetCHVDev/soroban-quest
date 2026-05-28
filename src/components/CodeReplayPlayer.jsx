// CodeReplayPlayer.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';

const PLAYBACK_SPEEDS = [1, 2, 4];

export default function CodeReplayPlayer({ missionId, recording, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentCode, setCurrentCode] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const intervalRef = useRef(null);
  const editorRef = useRef(null);

  // Initialize
  useEffect(() => {
    if (recording) {
      setDuration(recording.duration || 0);
      setCurrentCode(recording.events[0]?.content || '');
      setCurrentEventIndex(0);
      setCurrentTime(0);
    }
  }, [recording]);

  // Handle editor mount
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    // Make editor read-only
    editor.updateOptions({ readOnly: true });
  };

  // Play/pause functionality
  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // Step to next event
  const stepNext = useCallback(() => {
    if (currentEventIndex < recording.events.length - 1) {
      const nextIndex = currentEventIndex + 1;
      const nextEvent = recording.events[nextIndex];
      
      setCurrentEventIndex(nextIndex);
      setCurrentTime(nextEvent.timestamp);
      
      if (nextEvent.type === 'edit') {
        setCurrentCode(nextEvent.content);
      }
    }
  }, [currentEventIndex, recording]);

  // Step to previous event
  const stepPrevious = useCallback(() => {
    if (currentEventIndex > 0) {
      const prevIndex = currentEventIndex - 1;
      const prevEvent = recording.events[prevIndex];
      
      setCurrentEventIndex(prevIndex);
      setCurrentTime(prevEvent.timestamp);
      
      // Find the last edit event before this timestamp
      let lastEditCode = recording.events[0]?.content || '';
      for (let i = 0; i <= prevIndex; i++) {
        if (recording.events[i].type === 'edit') {
          lastEditCode = recording.events[i].content;
        }
      }
      setCurrentCode(lastEditCode);
    }
  }, [currentEventIndex, recording]);

  // Jump to specific time
  const jumpToTime = useCallback((targetTime) => {
    // Find the event at or before the target time
    let targetIndex = 0;
    let codeAtTime = recording.events[0]?.content || '';
    
    for (let i = 0; i < recording.events.length; i++) {
      if (recording.events[i].timestamp <= targetTime) {
        targetIndex = i;
        if (recording.events[i].type === 'edit') {
          codeAtTime = recording.events[i].content;
        }
      } else {
        break;
      }
    }
    
    setCurrentEventIndex(targetIndex);
    setCurrentTime(targetTime);
    setCurrentCode(codeAtTime);
  }, [recording]);

  // Playback loop
  useEffect(() => {
    if (isPlaying && currentEventIndex < recording.events.length - 1) {
      const nextEvent = recording.events[currentEventIndex + 1];
      const delay = (nextEvent.timestamp - currentTime) / playbackSpeed;
      
      intervalRef.current = setTimeout(() => {
        stepNext();
      }, delay);
    } else if (isPlaying && currentEventIndex >= recording.events.length - 1) {
      // Stop at the end
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentEventIndex, currentTime, playbackSpeed, recording, stepNext]);

  // Format time display
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get event type display
  const getEventDisplay = (eventType) => {
    switch (eventType) {
      case 'edit': return { text: 'Code Edit', color: '#60a5fa' };
      case 'run': return { text: 'Run Tests', color: '#34d399' };
      case 'hint': return { text: 'Viewed Hint', color: '#fbbf24' };
      case 'reset': return { text: 'Reset Code', color: '#f87171' };
      default: return { text: 'Unknown', color: '#94a3b8' };
    }
  };

  if (!recording) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No recording available for this mission.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)'
      }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
          📹 Code Replay - Mission {missionId}
        </h3>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onClose}
          style={{ color: 'var(--text-muted)' }}
        >
          ✕
        </button>
      </div>

      {/* Playback Controls */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-tertiary)'
      }}>
        {/* Main Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={togglePlayPause}
            disabled={currentEventIndex >= recording.events.length - 1}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          
          <button
            className="btn btn-ghost btn-sm"
            onClick={stepPrevious}
            disabled={currentEventIndex === 0}
          >
            ⏮ Step Back
          </button>
          
          <button
            className="btn btn-ghost btn-sm"
            onClick={stepNext}
            disabled={currentEventIndex >= recording.events.length - 1}
          >
            Step Forward ⏭
          </button>

          {/* Speed Control */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginLeft: 'auto'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Speed:
            </span>
            {PLAYBACK_SPEEDS.map(speed => (
              <button
                key={speed}
                className={`btn btn-sm ${playbackSpeed === speed ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setPlaybackSpeed(speed)}
                style={{ minWidth: '2.5rem' }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '0.25rem'
          }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => jumpToTime(Number(e.target.value))}
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: 'var(--border-subtle)',
              outline: 'none'
            }}
          />
        </div>

        {/* Current Event Info */}
        {recording.events[currentEventIndex] && (
          <div style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            padding: '0.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <span
              style={{
                color: getEventDisplay(recording.events[currentEventIndex].type).color,
                fontWeight: 'bold'
              }}
            >
              {getEventDisplay(recording.events[currentEventIndex].type).text}
            </span>
            <span style={{ marginLeft: '0.5rem' }}>
              Event {currentEventIndex + 1} of {recording.events.length}
            </span>
          </div>
        )}
      </div>

      {/* Editor */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Editor
          height="100%"
          defaultLanguage="rust"
          value={currentCode}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16 },
            lineNumbers: "on",
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            wordWrap: "on",
            tabSize: 4,
            readOnly: true,
            suggestOnTriggerCharacters: false,
            quickSuggestions: false,
            parameterHints: { enabled: false },
            hover: { enabled: false },
            contextmenu: false
          }}
        />
      </div>

      {/* Event Timeline */}
      <div style={{
        height: '120px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-tertiary)',
        padding: '1rem',
        overflowY: 'auto'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          Event Timeline
        </h4>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          {recording.events.map((event, index) => {
            const display = getEventDisplay(event.type);
            const isActive = index === currentEventIndex;
            
            return (
              <div
                key={index}
                onClick={() => {
                  setCurrentEventIndex(index);
                  setCurrentTime(event.timestamp);
                  if (event.type === 'edit') {
                    setCurrentCode(event.content);
                  } else {
                    // Find the last edit before this event
                    let lastEditCode = recording.events[0]?.content || '';
                    for (let i = 0; i <= index; i++) {
                      if (recording.events[i].type === 'edit') {
                        lastEditCode = recording.events[i].content;
                      }
                    }
                    setCurrentCode(lastEditCode);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  background: isActive ? 'var(--bg-primary)' : 'transparent',
                  border: isActive ? `1px solid ${display.color}` : '1px solid transparent',
                  opacity: isActive ? 1 : 0.7,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'var(--bg-secondary)';
                    e.target.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'transparent';
                    e.target.style.opacity = '0.7';
                  }
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: display.color
                  }}
                />
                <span style={{ color: 'var(--text-muted)', minWidth: '60px' }}>
                  {formatTime(event.timestamp)}
                </span>
                <span style={{ color: display.color, fontWeight: isActive ? 'bold' : 'normal' }}>
                  {display.text}
                </span>
                {event.type === 'hint' && (
                  <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    #{event.content + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
