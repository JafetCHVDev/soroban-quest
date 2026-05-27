# MissionDetail Component Tree

## Visual Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      MissionDetail.jsx                          │
│                     (91 lines - Orchestrator)                   │
│                                                                 │
│  Responsibilities:                                              │
│  • Route params & navigation                                    │
│  • State orchestration via hooks                                │
│  • Conditional rendering (loading/error/replay/main)            │
│  • Mobile tab system (radio inputs)                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌────────────────┐    ┌──────────────────┐
│  Custom Hooks │    │  Sub-Components│    │  External Deps   │
└───────────────┘    └────────────────┘    └──────────────────┘
        │                     │                     │
        │                     │                     │
        ▼                     ▼                     ▼

┌─────────────────────────────────────────────────────────────────┐
│                         CUSTOM HOOKS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  useMissionState.js                                             │
│  ├─ Mission loading lifecycle                                   │
│  ├─ All component state (14 state variables)                    │
│  └─ Activity logging                                            │
│                                                                 │
│  useLiveValidation.js                                           │
│  ├─ Monaco editor refs                                          │
│  ├─ Debounced validator setup                                   │
│  ├─ Marker application/clearing                                 │
│  └─ Editor mount handler                                        │
│                                                                 │
│  useMissionActions.js                                           │
│  ├─ handleRunTests (test execution + victory logic)             │
│  ├─ handleHint (hint progression)                               │
│  ├─ handleReset (code reset)                                    │
│  ├─ handleShowSolution (solution display)                       │
│  ├─ handleNextMission (navigation)                              │
│  ├─ handleWatchReplay (replay mode)                             │
│  ├─ handleCloseReplay (exit replay)                             │
│  └─ handleVictoryClose (modal close + navigation)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       SUB-COMPONENTS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MissionStoryPanel.jsx                                          │
│  ├─ Props: mission, hintIndex                                   │
│  ├─ Renders: difficulty badge, XP, story markdown              │
│  └─ Conditional: hint box display                               │
│                                                                 │
│  EditorToolbar.jsx                                              │
│  ├─ Props: handlers, isRunning, mission, hintIndex             │
│  ├─ Renders: file tab, action buttons                          │
│  └─ Logic: button disable states                                │
│                                                                 │
│  CodeEditor.jsx                                                 │
│  ├─ Props: code, onChange, onMount                              │
│  ├─ Wraps: Monaco Editor                                        │
│  └─ Config: Rust syntax, dark theme, options                    │
│                                                                 │
│  LiveValidationBar.jsx                                          │
│  ├─ Props: passCount, totalCount                                │
│  ├─ Renders: progress bar, status label                        │
│  └─ Logic: color/state calculation                              │
│                                                                 │
│  TestTerminal.jsx                                               │
│  ├─ Props: testResults                                          │
│  ├─ Renders: terminal UI, animated output                      │
│  └─ Features: auto-scroll, color-coded results                  │
│                                                                 │
│  VictoryModal.jsx                                               │
│  ├─ Props: show, onClose, mission, victoryData, code           │
│  ├─ Renders: trophy, XP, level up, badges, actions             │
│  └─ Integrations: Okashi button, toast notifications            │
│                                                                 │
│  MissionReplayPanel.jsx                                         │
│  ├─ Props: onWatchReplay                                        │
│  ├─ Renders: replay description, start button                  │
│  └─ Conditional: only shown when completed + has replay         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL COMPONENTS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MissionDetailSkeleton (loading state)                          │
│  CodeReplayPlayer (full-screen replay mode)                     │
│  MissionErrorBoundary (error handling wrapper)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────┐
│   Systems    │
│   (External) │
└──────┬───────┘
       │
       │ getMissionById()
       │ loadProgress()
       │ CodeRecorder
       │
       ▼
┌──────────────────┐
│  MissionDetail   │ ◄─── Route params (missionId)
│  (Orchestrator)  │
└────────┬─────────┘
         │
         │ Props ↓
         │
    ┌────┴────┬────────┬────────┬────────┬────────┬────────┐
    ▼         ▼        ▼        ▼        ▼        ▼        ▼
  Story    Toolbar  Editor  Validation Terminal Victory  Replay
  Panel                      Bar                 Modal    Panel
    │         │        │        │        │        │        │
    │         │        │        │        │        │        │
    └─────────┴────────┴────────┴────────┴────────┴────────┘
                              │
                              │ Callbacks ↑
                              │
                        ┌─────┴─────┐
                        │  Actions  │
                        │  (Hooks)  │
                        └───────────┘
```

## Mobile Tab System

```
Radio Inputs (hidden)
  ├─ #tab-story
  ├─ #tab-editor
  ├─ #tab-tests
  └─ #tab-replay (conditional)
       │
       │ CSS :checked selectors
       ▼
Mobile Tab Bar (labels)
  ├─ Story
  ├─ Editor
  ├─ Tests
  └─ Replay (conditional)
       │
       │ Controls visibility
       ▼
Content Panels
  ├─ MissionStoryPanel
  ├─ Editor + Toolbar
  ├─ TestTerminal
  └─ MissionReplayPanel
```

## State Management Flow

```
useMissionState Hook
  │
  ├─ loading ──────────► Skeleton / Content switch
  ├─ code ─────────────► CodeEditor value
  ├─ testResults ──────► TestTerminal display
  ├─ isRunning ────────► Button disable states
  ├─ showVictory ──────► VictoryModal visibility
  ├─ victoryData ──────► VictoryModal content
  ├─ hintIndex ────────► Hint display logic
  ├─ showReplay ───────► Replay mode switch
  ├─ replayData ───────► CodeReplayPlayer data
  ├─ livePassCount ────► LiveValidationBar
  └─ liveTotalCount ───► LiveValidationBar
```

## Event Flow

```
User Action
    │
    ▼
EditorToolbar Button Click
    │
    ▼
Handler from useMissionActions
    │
    ├─ handleRunTests ──────► runTests() ──► Update testResults ──► Victory?
    ├─ handleHint ──────────► Update hintIndex ──► Show hint
    ├─ handleReset ─────────► Reset code to template
    ├─ handleShowSolution ──► Load solution code
    └─ handleWatchReplay ───► Switch to replay mode
```

## Styling Architecture

```
index.css (global)
  ├─ Design system variables
  ├─ Base component styles
  ├─ Mission detail layout
  ├─ Modal styles
  └─ Mobile responsive rules

MissionComponents.css (component-specific)
  ├─ MissionStoryPanel styles
  ├─ LiveValidationBar styles
  ├─ VictoryModal extensions
  └─ MissionReplayPanel styles
```
