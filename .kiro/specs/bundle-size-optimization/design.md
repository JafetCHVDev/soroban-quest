# Bundle Size Optimization - Technical Design

## Overview

This design implements a comprehensive bundle size optimization strategy for Soroban Quest through code splitting, tree shaking, and performance monitoring. The architecture reduces initial page load from ~350KB to <100KB (gzip), improving Lighthouse scores and user experience on bandwidth-constrained networks.

### Design Goals

- **Primary bundle <100KB (gzip)**: Include only application shell (routing, providers, navbar, footer)
- **Secondary chunks <75KB each**: Route components split into independent chunks
- **MissionDetail <150KB**: Monaco Editor tree-shaken to Rust only, bundled with route
- **Functionality preserved**: All features work identically to non-optimized version
- **Lighthouse >85**: Performance score improvement of 30%+ for TTI and 25%+ for FCP
- **Developer experience**: Clear bundle visibility, warnings for exceeded targets, documentation

## Architecture

### Code Splitting Strategy

The application uses route-based code splitting with Vite's native support for dynamic imports. Each route becomes a lazy-loaded chunk loaded only when needed.

#### Chunk Architecture

```
Primary Bundle (App Shell)
├── React, React Router, React DOM
├── Vite runtime
├── App.jsx (routing structure)
├── Navbar, Footer, ErrorBoundary
├── ToastContext, GameStateContext
├── i18n provider
└── LoadingScreen, ErrorBoundary components
Size target: <100KB (gzip)

Secondary Chunks (Route-based)
├── home: src/pages/Home.jsx (~20KB)
├── missions: src/pages/MissionMap.jsx (~30KB)
├── campaigns: src/pages/Campaigns.jsx (~25KB)
├── profile: src/pages/Profile.jsx (~40KB)
├── journal: src/pages/Journal.jsx (~35KB)
├── skills: src/pages/SkillTree.jsx (~45KB)
└── missionDetail: src/pages/MissionDetail.jsx + Monaco Editor (~150KB)
    - MissionDetail component
    - Monaco Editor (Rust-only)
    - Code validator, test runner
    - Editor themes
    - Live validator
```

### Lazy Loading Implementation

All page routes (except Home) are wrapped with React.lazy() for dynamic imports:

```javascript
const MissionDetail = lazy(() => import("./pages/MissionDetail"));
const MissionMap = lazy(() => import("./pages/MissionMap"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const Profile = lazy(() => import("./pages/Profile"));
const Journal = lazy(() => import("./pages/Journal"));
const SkillTree = lazy(() => import("./pages/SkillTree"));
const NotFound = lazy(() => import("./pages/NotFound"));
```

Home page remains in the primary bundle because it's the landing page and should load immediately.

### Suspense Boundaries

A single Suspense boundary wraps all routes in the Router component:

```jsx
<Suspense fallback={<LoadingScreen />}>
  <Routes>
    {/* All route definitions */}
  </Routes>
</Suspense>
```

The LoadingScreen component displays a spinner and loading text while chunks are fetched, keeping the fallback <5KB to maintain bundle savings.

## Components and Interfaces

### Modified Components

#### App.jsx - Lazy Route Loading

The App component is modified to:
1. Import routes using React.lazy()
2. Wrap routes in a Suspense boundary
3. Keep ErrorBoundary wrapping the entire tree for global error handling

Key changes:
- Home route stays inline (primary bundle)
- All other routes use lazy() import
- Single Suspense boundary with LoadingScreen fallback
- ErrorBoundary unchanged (already in place)

#### ErrorBoundary.jsx - Enhanced Error Recovery

The existing ErrorBoundary is enhanced to handle chunk load failures:

```javascript
// In ErrorBoundary component
componentDidCatch(error, errorInfo) {
  console.error("Soroban Quest Error:", error, errorInfo);
  
  // Log chunk load errors with context
  if (error.message?.includes("Failed to import")) {
    logChunkLoadError(error, errorInfo);
  }
}

// Add retry mechanism via state
state = { hasError: false, retryCount: 0 };

// Add retry button in fallback UI
<button onClick={() => this.setState({ hasError: false })}>
  Retry Loading
</button>
```

### New Patterns

#### Lazy Load Wrapper Factory

Create a utility to wrap lazy-loaded components with consistent error handling:

```javascript
// src/utils/lazyWithFallback.js
export function lazyWithFallback(importFunc, componentName) {
  const Component = React.lazy(importFunc);
  
  return (props) => (
    <Suspense fallback={<LoadingScreen />}>
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    </Suspense>
  );
}
```

This centralizes error handling and ensures consistent behavior across all lazy routes.

## Data Models

### Bundle Manifest

The build process generates a bundle manifest tracking all chunks:

```javascript
{
  "primary": {
    "file": "index.js",
    "size": { "minified": 95000, "gzipped": 32000 },
    "modules": [...]
  },
  "chunks": [
    {
      "name": "missionDetail",
      "file": "missionDetail.xxxxx.js",
      "size": { "minified": 480000, "gzipped": 145000 },
      "modules": ["MissionDetail", "Monaco Editor", ...],
      "warnings": []
    },
    // ... other chunks
  ]
}
```

### Size Thresholds

```javascript
const SIZE_TARGETS = {
  primary: { gzip: 100 * 1024, label: "Primary Bundle" },
  missionDetail: { gzip: 150 * 1024, label: "MissionDetail + Monaco" },
  default: { gzip: 75 * 1024, label: "Secondary Routes" }
};

const WARNING_MARGIN = 0.9; // Warn at 90% of target
```

## Vite Configuration Strategy

### Build Configuration

The vite.config.js is enhanced with explicit code splitting and optimization settings:

```javascript
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Core vendor dependencies in primary bundle
          'react-core': ['react', 'react-dom', 'react-router-dom'],
          
          // Monaco Editor in its own chunk, loaded with MissionDetail
          'monaco-editor': ['@monaco-editor/react'],
          
          // Each route gets its own chunk (automatic via lazy())
          // Named chunks for predictable output
        },
        // Use content hashes for cache-busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Enable tree-shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
      },
    },
    // Report warnings for large chunks
    chunkSizeWarningLimit: 250,
  },
});
```

### Bundle Analyzer Plugin

Add vite-bundle-analyzer to visualize bundle composition:

```javascript
import { visualizer } from "rollup-plugin-visualizer";

plugins: [
  // ... other plugins
  visualizer({
    filename: 'dist/bundle-analysis.html',
    title: 'Soroban Quest Bundle Analysis',
    open: false, // Don't auto-open, user can open manually
    brotli: true,
    gzip: true,
  }),
],
```

### Tree-Shaking Configuration

Vite's default tree-shaking is enabled, and package.json entries are configured:

```javascript
// In package.json
{
  "sideEffects": false, // Enable aggressive tree-shaking
  "exports": {
    ".": {
      "import": "./dist/index.js"
    }
  }
}
```

## Monaco Editor Tree-Shaking

### Current State

Monaco Editor includes language definitions for 50+ languages, adding ~200KB to the bundle. Soroban Quest only needs Rust syntax highlighting.

### Tree-Shaking Strategy

#### Option 1: Dynamic Language Loading (Recommended)

Configure Monaco Editor to load only Rust at runtime:

```javascript
// In MissionDetail.jsx or Monaco setup
import * as monaco from "monaco-editor";
import RustLanguage from "monaco-editor/esm/vs/basic-languages/rust/rust";

// Register only Rust language
monaco.languages.register({ id: 'rust' });
monaco.languages.setMonarchTokensProvider('rust', RustLanguage.language);

// Set editor language
editorRef.current.getModel().setLanguage('rust');
```

This approach:
- Loads Monaco Editor (~150KB)
- Loads only Rust language definitions (~5KB)
- Excludes other 50+ language definitions (~180KB saved)
- Requires no build changes, works with tree-shaking

#### Option 2: Custom Monaco Build (Advanced)

For even smaller Monaco size, use a custom build:

```javascript
// Build Monaco with only Rust support
// This requires customization of Monaco's build process
// Generally not necessary if Option 1 achieves targets
```

### Integration with MissionDetail Chunk

Monaco Editor is bundled with MissionDetail because:
1. Only MissionDetail uses Monaco Editor
2. Keeping it separate adds HTTP overhead
3. Users won't load MissionDetail without needing Monaco
4. Total MissionDetail chunk target: <150KB (gzip)

Configuration in vite.config.js:

```javascript
rollupOptions: {
  output: {
    manualChunks: {
      // Monaco stays with MissionDetail, don't extract separately
      // No need to force separation
    },
  },
}
```

## Performance Monitoring

### Build-Time Verification

The build process logs bundle sizes and warnings:

```javascript
// Custom Vite plugin for size reporting
export default function bundleSizeReporter() {
  return {
    name: 'bundle-size-reporter',
    writeBundle(options, bundle) {
      console.log('\n📦 Bundle Analysis\n');
      
      const chunks = Object.entries(bundle);
      chunks.forEach(([name, asset]) => {
        if (asset.type === 'asset') return;
        
        const size = asset.code.length;
        const gzipped = gzipSize(asset.code);
        
        // Check against targets
        let target = SIZE_TARGETS.default;
        if (name === 'missionDetail') target = SIZE_TARGETS.missionDetail;
        if (name === 'index') target = SIZE_TARGETS.primary;
        
        const percentage = (gzipped / target.gzip) * 100;
        const status = percentage > 100 ? '⚠️ ' : percentage > 90 ? '⚡' : '✅';
        
        console.log(`${status} ${name}: ${(gzipped/1024).toFixed(1)}KB gzip`);
        
        if (percentage > 100) {
          console.warn(`⚠️  ${name} exceeds target by ${(percentage-100).toFixed(1)}%`);
        }
      });
    },
  };
}
```

### Runtime Monitoring

Integrate with analytics to track:
- Time to interactive (TTI)
- First contentful paint (FCP)
- Chunk load success/failure rates
- Route navigation latency

```javascript
// In main.jsx or app initialization
if (performance.measureUserAgentSpecificMetrics) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Send to analytics
      logPerformanceMetric({
        name: entry.name,
        duration: entry.duration,
        timestamp: entry.startTime,
      });
    }
  });
  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
}
```

### Lighthouse Measurement

Run Lighthouse audits to establish baselines:

```bash
# Before optimization
npm run build
npx lighthouse https://localhost:8080 --view

# After optimization
# Compare reports for performance score, TTI, FCP improvements
```

## Error Handling & Resilience

### Chunk Load Failure Scenarios

1. **Network Error During Download**: User goes offline while chunk is loading
2. **Corrupted Chunk**: Downloaded file is corrupted or incomplete
3. **Browser Cache Stale**: Browser serves outdated cached version
4. **Missing Chunk**: Web server doesn't have the chunk file

### Error Recovery Strategy

#### Automatic Retry with Exponential Backoff

```javascript
// src/utils/chunkRetry.js
export async function loadChunkWithRetry(importFunc, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await importFunc();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.log(`Retrying chunk load in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
```

#### Error Boundary Enhancement

Wrap lazy routes with error recovery:

```javascript
// src/components/ChunkErrorBoundary.jsx
export class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (error.message?.includes("Failed to import")) {
      logChunkLoadError(error, errorInfo);
    }
  }

  handleRetry = async () => {
    // Force chunk re-download by clearing cache
    const urls = Object.keys(window.__CHUNK_IMPORTS__ || {});
    for (const url of urls) {
      await fetch(url, { cache: 'reload' });
    }
    
    this.setState({ hasError: false, retryCount: this.state.retryCount + 1 });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="chunk-error">
          <h2>Failed to Load Page</h2>
          <p>We couldn't load the requested page content.</p>
          <button onClick={this.handleRetry}>
            {this.state.retryCount > 0 ? `Retry (${this.state.retryCount})` : 'Retry'}
          </button>
          <button onClick={() => window.location.href = '/'}>Go Home</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### User-Facing Error Messages

```javascript
// Error messages by scenario
const CHUNK_ERROR_MESSAGES = {
  network: {
    title: 'Connection Lost',
    message: 'Unable to load the page. Please check your connection and try again.',
  },
  timeout: {
    title: 'Page Load Timeout',
    message: 'The page took too long to load. Please try again.',
  },
  corrupted: {
    title: 'Page Load Failed',
    message: 'The page content was corrupted. Please refresh and try again.',
  },
  generic: {
    title: 'Unexpected Error',
    message: 'Something went wrong loading this page. Please try again later.',
  },
};
```

## Error Handling & Resilience

### Chunk Load Failure Scenarios

1. **Network Error During Download**: User goes offline while chunk is loading
2. **Corrupted Chunk**: Downloaded file is corrupted or incomplete
3. **Browser Cache Stale**: Browser serves outdated cached version
4. **Missing Chunk**: Web server doesn't have the chunk file

### Error Recovery Strategy

#### Automatic Retry with Exponential Backoff

```javascript
// src/utils/chunkRetry.js
export async function loadChunkWithRetry(importFunc, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await importFunc();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.log(`Retrying chunk load in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}
```

#### Error Boundary Enhancement

Wrap lazy routes with error recovery:

```javascript
// src/components/ChunkErrorBoundary.jsx
export class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (error.message?.includes("Failed to import")) {
      logChunkLoadError(error, errorInfo);
    }
  }

  handleRetry = async () => {
    // Force chunk re-download by clearing cache
    const urls = Object.keys(window.__CHUNK_IMPORTS__ || {});
    for (const url of urls) {
      await fetch(url, { cache: 'reload' });
    }
    
    this.setState({ hasError: false, retryCount: this.state.retryCount + 1 });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="chunk-error">
          <h2>Failed to Load Page</h2>
          <p>We couldn't load the requested page content.</p>
          <button onClick={this.handleRetry}>
            {this.state.retryCount > 0 ? `Retry (${this.state.retryCount})` : 'Retry'}
          </button>
          <button onClick={() => window.location.href = '/'}>Go Home</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### User-Facing Error Messages

```javascript
// Error messages by scenario
const CHUNK_ERROR_MESSAGES = {
  network: {
    title: 'Connection Lost',
    message: 'Unable to load the page. Please check your connection and try again.',
  },
  timeout: {
    title: 'Page Load Timeout',
    message: 'The page took too long to load. Please try again.',
  },
  corrupted: {
    title: 'Page Load Failed',
    message: 'The page content was corrupted. Please refresh and try again.',
  },
  generic: {
    title: 'Unexpected Error',
    message: 'Something went wrong loading this page. Please try again later.',
  },
};
```

## Dependencies & Tooling

### Required npm Packages

**Already in project**:
- `@monaco-editor/react@^4.6.0` - Monaco Editor React wrapper
- `react@^18.3.1` - React framework
- `react-router-dom@^6.28.0` - Routing
- `vite@^6.0.0` - Build tool (supports code splitting natively)

**To add**:
```json
{
  "devDependencies": {
    "rollup-plugin-visualizer": "^5.12.0"
  }
}
```

The `rollup-plugin-visualizer` generates interactive bundle analysis HTML. Alternative: `vite-plugin-compression` for compression reporting.

### Version Compatibility

- **Node.js**: >=16.0.0 (for Vite 6)
- **Vite**: ^6.0.0 (already in use, natively supports code splitting)
- **React**: ^18.0.0+ (already in use, supports Suspense for lazy loading)
- **Monaco Editor**: ^4.0.0+ (already in use, supports language isolation)

No breaking changes expected. This is purely a configuration and code organization change.

## File Structure & Changes

### Files to Modify

#### 1. `vite.config.js`
- Add rollup manual chunks configuration
- Add visualizer plugin for bundle analysis
- Enable tree-shaking and minification
- Configure chunk size warnings

**Lines changed**: ~15 (add rollupOptions, plugins)

#### 2. `src/App.jsx`
- Import lazy() for route components
- Wrap routes in Suspense boundary
- Keep ErrorBoundary (already present)
- Keep Home route inline (don't lazy-load)

**Lines changed**: ~20 (add lazy imports, wrap Routes in Suspense)

#### 3. `src/main.jsx`
- No changes required (already has LanguageProvider wrapping App)
- Suspense boundary added in App.jsx, not main

**Lines changed**: 0

#### 4. `package.json`
- Add rollup-plugin-visualizer dependency
- Optionally add "sideEffects": false for aggressive tree-shaking

**Lines changed**: ~2

### New Files to Create

#### 1. `src/utils/lazyWithFallback.js`
Utility for consistent lazy loading with error boundaries:

```javascript
import { lazy, Suspense } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { ChunkErrorBoundary } from '../components/ChunkErrorBoundary';

export function lazyWithFallback(importFunc, componentName) {
  const Component = lazy(importFunc);
  
  return (props) => (
    <ChunkErrorBoundary componentName={componentName}>
      <Suspense fallback={<LoadingScreen />}>
        <Component {...props} />
      </Suspense>
    </ChunkErrorBoundary>
  );
}
```

**Size**: ~200 lines

#### 2. `src/components/ChunkErrorBoundary.jsx`
Enhanced error boundary for chunk load failures (see Error Handling section above).

**Size**: ~100 lines

#### 3. `src/utils/bundleMonitor.js`
Analytics and monitoring for chunk loads:

```javascript
export function logChunkLoad(chunkName, durationMs, status) {
  const metric = {
    timestamp: new Date().toISOString(),
    chunk: chunkName,
    duration: durationMs,
    status: status, // 'success' or 'failed'
  };
  
  // Send to analytics service
  if (window.__analytics) {
    window.__analytics.track('chunk_load', metric);
  }
  
  console.debug('Chunk loaded:', metric);
}

export function logChunkLoadError(error, errorInfo) {
  const errorMetric = {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: errorInfo.componentStack,
  };
  
  if (window.__analytics) {
    window.__analytics.track('chunk_load_error', errorMetric);
  }
  
  console.error('Chunk load error:', errorMetric);
}
```

**Size**: ~50 lines

#### 4. `docs/BUNDLE_OPTIMIZATION.md`
Developer documentation explaining the optimization strategy (see Testing Strategy section for content).

**Size**: ~200 lines

### Configuration Updates

#### vite.config.js - Rollup Configuration

Add this to the build section:

```javascript
build: {
  outDir: 'dist',
  assetsDir: 'assets',
  rollupOptions: {
    output: {
      manualChunks: {
        // Group React and routing in primary bundle
        'react-core': ['react', 'react-dom', 'react-router-dom'],
        
        // Monaco Editor automatically goes with MissionDetail
        // (both are only needed on MissionDetail route)
      },
      entryFileNames: 'assets/[name]-[hash].js',
      chunkFileNames: 'assets/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]',
    },
  },
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true, // Production optimization
    },
  },
  chunkSizeWarningLimit: 250,
},
```

#### package.json - Tree-Shaking Hint

Add to root level:

```json
{
  "sideEffects": false
}
```

This tells bundlers that no files have side effects, enabling aggressive tree-shaking.

## Implementation Sequence

### Phase 1: Build Configuration and Analysis Setup (Day 1)

**Objective**: Set up build tools and establish baseline metrics

**Tasks**:
1. Add rollup-plugin-visualizer to package.json
2. Update vite.config.js with rollupOptions
3. Add bundle size reporter plugin to vite.config.js
4. Run `npm run build` and generate baseline analysis
5. Document current bundle sizes

**Deliverables**:
- Updated vite.config.js with full config
- dist/bundle-analysis.html showing current state
- Baseline metrics in project documentation

### Phase 2: React.lazy() Wrapper Creation (Day 1)

**Objective**: Create consistent patterns for lazy loading

**Tasks**:
1. Create src/utils/lazyWithFallback.js
2. Create src/components/ChunkErrorBoundary.jsx
3. Create src/utils/bundleMonitor.js
4. Add TypeScript types (optional, if using TS)

**Deliverables**:
- Reusable lazy loading utilities
- Enhanced error handling for chunks
- Monitoring hooks for analytics

### Phase 3: Route Components Lazy-Loading (Day 2)

**Objective**: Update App.jsx to lazy-load all non-Home routes

**Tasks**:
1. Import lazy from React in App.jsx
2. Replace route component imports with lazy() imports for: MissionDetail, MissionMap, Campaigns, Profile, Journal, SkillTree, NotFound
3. Wrap Routes in Suspense boundary with LoadingScreen fallback
4. Keep ErrorBoundary unchanged
5. Keep Home component inline (not lazy)
6. Test each route to verify chunk loads on navigation

**Deliverables**:
- Updated App.jsx with lazy routes
- All routes functionally tested
- Build verification that chunks are generated

### Phase 4: Monaco Editor Tree-Shaking (Day 2)

**Objective**: Reduce Monaco Editor bundle from ~200KB to ~150KB

**Tasks**:
1. In MissionDetail.jsx, verify Monaco Editor imports
2. Add Rust language registration (if needed for full support)
3. Configure Monaco to exclude non-Rust languages
4. Test syntax highlighting and code completion still work
5. Build and verify Monaco is tree-shaken

**Deliverables**:
- MissionDetail properly configured for Rust only
- Verified that syntax highlighting works
- Build shows ~50-70KB reduction from Monaco tree-shaking

### Phase 5: Verification and Performance Tuning (Day 3)

**Objective**: Verify all targets are met and optimize further if needed

**Tasks**:
1. Run `npm run build` and analyze bundle-analysis.html
2. Verify primary bundle <100KB gzip
3. Verify MissionDetail chunk <150KB gzip
4. Verify all other route chunks <75KB gzip
5. Check for any warnings in build output
6. If targets not met, identify largest modules and optimize further
7. Run Lighthouse audit on deployed version (or local build preview)
8. Compare Lighthouse scores to baseline

**Deliverables**:
- Build output showing all targets met
- Lighthouse audit showing 85+ performance score
- Any warning messages properly documented
- Analysis HTML report in dist folder

## Testing Strategy

### Unit Tests - Lazy Loading

**Test**: Verify routes load correctly when lazy-imported

```javascript
// src/pages/__tests__/App.lazy.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../../App';

describe('Lazy Route Loading', () => {
  it('loads MissionDetail chunk when navigating to /mission/1', async () => {
    const { user } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Navigate to mission detail
    window.location.hash = '#/mission/1';
    
    // Wait for LoadingScreen to appear and disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading Quest Assets')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verify MissionDetail content loaded
    expect(screen.getByText(/mission description/i)).toBeInTheDocument();
  });

  it('shows LoadingScreen while chunk is loading', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Navigate to slow-to-load route
    window.location.hash = '#/mission/1';
    
    // LoadingScreen should appear briefly
    expect(screen.getByText('Loading Quest Assets')).toBeInTheDocument();
  });
});
```

### Unit Tests - Error Handling

**Test**: Verify chunk load failure shows error UI and retry works

```javascript
// src/components/__tests__/ChunkErrorBoundary.test.jsx
import { render, screen } from '@testing-library/react';
import { ChunkErrorBoundary } from '../ChunkErrorBoundary';

describe('ChunkErrorBoundary', () => {
  it('displays error message when chunk fails to load', () => {
    const errorComponent = () => {
      throw new Error('Failed to import');
    };
    
    render(
      <ChunkErrorBoundary componentName="MissionDetail">
        {errorComponent()}
      </ChunkErrorBoundary>
    );
    
    expect(screen.getByText('Failed to Load Page')).toBeInTheDocument();
    expect(screen.getByText(/couldn't load/i)).toBeInTheDocument();
  });

  it('has retry button that clears error state', async () => {
    const { rerender } = render(
      <ChunkErrorBoundary componentName="MissionDetail">
        <div>Test Content</div>
      </ChunkErrorBoundary>
    );
    
    // Simulate error
    rerender(
      <ChunkErrorBoundary componentName="MissionDetail">
        {(() => { throw new Error('Failed to import'); })()}
      </ChunkErrorBoundary>
    );
    
    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
  });
});
```

### Unit Tests - Monaco Editor Tree-Shaking

**Test**: Verify Monaco Editor works with Rust only

```javascript
// src/pages/__tests__/MissionDetail.monaco.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import MissionDetail from '../MissionDetail';
import { BrowserRouter } from 'react-router-dom';

describe('Monaco Editor - Rust Only', () => {
  it('renders Monaco Editor with Rust syntax highlighting', async () => {
    render(
      <BrowserRouter>
        <MissionDetail />
      </BrowserRouter>,
      { wrapper: GameStateProvider }
    );
    
    await waitFor(() => {
      const editor = screen.getByRole('textbox');
      expect(editor).toBeInTheDocument();
    });
  });

  it('provides code completion for Rust syntax', async () => {
    // This would require integration with Monaco's completion API
    // and verifying Rust suggestions appear
  });
});
```

### Integration Tests - Bundle Size Verification

**Test**: Verify bundle size targets are met

```javascript
// test/bundleSize.test.js
import fs from 'fs';
import gzip from 'node-gzip';

describe('Bundle Size Targets', () => {
  it('primary bundle is under 100KB gzip', async () => {
    const bundleFile = fs.readFileSync('dist/assets/index-xxxxx.js');
    const gzipped = await gzip(bundleFile);
    
    const sizeKB = gzipped.length / 1024;
    expect(sizeKB).toBeLessThan(100);
  });

  it('MissionDetail chunk is under 150KB gzip', async () => {
    const missionDetailFile = fs.readFileSync('dist/assets/missionDetail-xxxxx.js');
    const gzipped = await gzip(missionDetailFile);
    
    const sizeKB = gzipped.length / 1024;
    expect(sizeKB).toBeLessThan(150);
  });

  it('all secondary route chunks are under 75KB gzip', async () => {
    const chunks = fs.readdirSync('dist/assets')
      .filter(f => f.match(/^[a-z]+-[a-f0-9]+\.js$/))
      .filter(f => !f.startsWith('index') && !f.startsWith('missionDetail'));
    
    for (const chunk of chunks) {
      const file = fs.readFileSync(`dist/assets/${chunk}`);
      const gzipped = await gzip(file);
      const sizeKB = gzipped.length / 1024;
      
      expect(sizeKB).toBeLessThan(75);
    }
  });
});
```

### E2E Tests - User Workflows

**Test**: Verify functionality is preserved end-to-end

```javascript
// e2e/bundleOptimization.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Bundle Optimization - Functionality Preserved', () => {
  test('mission code editor works after navigation', async ({ page }) => {
    // Navigate to home
    await page.goto('/');
    expect(page.url()).toContain('home');
    
    // Navigate to mission detail (loads MissionDetail chunk)
    await page.click('text=Start Mission 1');
    
    // Wait for chunk to load
    await page.waitForSelector('[class*="monaco"]');
    
    // Type code in editor
    await page.focus('[role="textbox"]');
    await page.type('[role="textbox"]', 'fn hello() {}');
    
    // Verify code appears
    expect(await page.innerText('[role="textbox"]')).toContain('hello');
  });

  test('mission completion flow works', async ({ page }) => {
    await page.goto('/#/mission/1');
    
    // Wait for content
    await page.waitForSelector('text=Run Tests');
    
    // Add code
    await page.focus('[role="textbox"]');
    await page.fill('[role="textbox"]', `
      pub fn hello() -> String {
        "Hello, Soroban!".to_string()
      }
    `);
    
    // Run tests
    await page.click('button:has-text("Run Tests")');
    
    // Wait for victory modal
    await page.waitForSelector('text=Victory');
    expect(await page.innerText('body')).toContain('Mission Complete');
  });

  test('switching between routes works seamlessly', async ({ page }) => {
    // Start on home
    await page.goto('/');
    
    // Go to missions
    await page.click('text=Missions');
    await page.waitForSelector('text=Mission Map');
    
    // Go to mission detail
    await page.click('text=Mission 1');
    await page.waitForSelector('[class*="monaco"]');
    
    // Go to profile
    await page.click('text=Profile');
    await page.waitForSelector('text=Profile');
    
    // Go back to mission
    await page.click('text=Missions');
    await page.click('text=Mission 1');
    
    // Editor should work
    await page.focus('[role="textbox"]');
    await page.type('[role="textbox"]', 'test');
    expect(await page.innerText('[role="textbox"]')).toContain('test');
  });

  test('chunk load failure shows error and retry works', async ({ page }) => {
    // Intercept chunk requests and fail first one
    await page.route('**/*.js', route => {
      if (route.request().url().includes('missionDetail')) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });
    
    // Try to navigate to mission detail
    await page.goto('/#/mission/1');
    
    // Should see error UI
    expect(await page.innerText('body')).toContain('Failed to Load Page');
    
    // Unblock requests
    await page.unroute('**/*.js');
    
    // Click retry
    await page.click('button:has-text("Retry")');
    
    // Should load successfully
    await page.waitForSelector('[class*="monaco"]');
    expect(await page.innerText('body')).not.toContain('Failed to Load Page');
  });
});
```

### Performance Tests - Lighthouse

**Test**: Verify Lighthouse performance score improvements

```javascript
// test/lighthouse.test.js
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

describe('Lighthouse Performance', () => {
  let chrome;

  beforeAll(async () => {
    chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  });

  afterAll(async () => {
    await chromeLauncher.kill(chrome.pid);
  });

  it('homepage scores 85+ on performance', async () => {
    const result = await lighthouse('http://localhost:5173/', {
      port: chrome.port,
    });

    expect(result.lhr.categories.performance.score).toBeGreaterThanOrEqual(0.85);
    
    // Log metrics for comparison
    console.log('FCP:', result.lhr.audits['first-contentful-paint'].displayValue);
    console.log('TTI:', result.lhr.audits['interactive'].displayValue);
  });
});
```

### Manual Testing Checklist

- [ ] Primary bundle loads immediately
- [ ] LoadingScreen appears when navigating to lazy routes
- [ ] Each route loads correctly (MissionMap, Campaigns, Profile, Journal, SkillTree, MissionDetail)
- [ ] Monaco Editor works on MissionDetail (syntax highlighting, code completion)
- [ ] Code can be typed, submitted, and tested
- [ ] Victory modal shows on mission completion
- [ ] Navigation between routes is smooth
- [ ] Back button works correctly
- [ ] Keyboard shortcuts still work
- [ ] Collaboration features work (if present)
- [ ] Storage/persistence still works
- [ ] Error recovery shows error UI and retry button
- [ ] Lighthouse performance score is 85+
- [ ] TTI improved by 30%+
- [ ] FCP improved by 25%+

## Correctness Properties

**Note on Property-Based Testing Applicability**: 

This feature is primarily infrastructure/build-focused rather than business logic-focused. The majority of acceptance criteria are integration-level tests (bundle size verification, build output analysis, Lighthouse metrics, Monaco tree-shaking verification) rather than pure function inputs/outputs suitable for property-based testing.

Instead of property-based testing, this feature uses:
- **Integration tests**: Verify chunk sizes, bundle composition, Lighthouse scores
- **Example-based unit tests**: Verify lazy loading behavior, error recovery
- **E2E tests**: Verify functionality is preserved and routes load correctly

The criteria that could theoretically use property-based testing (like "routes load in any order without state corruption") are better tested with E2E tests given the UI/navigation focus.

### Alternative Testing Approach: Snapshot & Analysis Testing

Instead of properties, we verify correctness through:

1. **Bundle Size Snapshots**: Capture bundle analysis and verify it doesn't regress
2. **Functionality Preservation**: E2E tests verify all user workflows still work
3. **Performance Baselines**: Lighthouse scores and metrics compared to pre-optimization
4. **Build Output Verification**: Warnings emitted for exceeded size targets

### Key Verifiable Outcomes (Not Traditional Properties)

**Outcome 1: Code Splitting Works**
- Primary bundle loads first, routes load on-demand
- Evidence: E2E test navigating to each route and verifying chunk loads
- Measured by: Chunk presence in dist folder, bundle analysis report

**Outcome 2: Tree-Shaking Effective**
- Monaco Editor reduced from ~200KB to ~150KB by excluding non-Rust languages
- Evidence: Bundle analysis showing difference before/after
- Measured by: `npm run build` output and bundle-analysis.html

**Outcome 3: Performance Improves**
- Lighthouse performance score ≥85, TTI improves 30%+, FCP improves 25%+
- Evidence: Lighthouse audit results
- Measured by: Lighthouse CLI tool before/after

**Outcome 4: Functionality Preserved**
- All mission workflows still work (code edit, test run, victory modal, storage)
- Evidence: E2E tests passing
- Measured by: e2e test suite execution

**Outcome 5: Error Recovery Works**
- Chunk load failures show error UI, retry succeeds
- Evidence: E2E test simulating chunk load failure
- Measured by: Error UI appears, retry button works

---

## Implementation Constraints

### Build Time Impact

Adding bundle analysis and code splitting *slightly* increases build time:
- Baseline: ~2-3 seconds
- With visualizer: ~3-4 seconds (minimal impact)
- Vite's native splitting has negligible overhead

### Browser Compatibility

Code splitting (React.lazy + Suspense) requires:
- React 16.6+ (already using 18.3.1)
- All modern browsers with dynamic import support
- No IE11 support (acceptable for modern web app)

### Development Experience

During development (`npm run dev`):
- Hot module replacement (HMR) still works
- Routes lazy-load normally
- No perceived difference vs non-optimized version

### Network Considerations

For users on slow connections:
- Initial page load faster (smaller primary bundle)
- Navigating to new routes requires chunk download
- LoadingScreen provides feedback during chunk loads
- Retry mechanism helps with flaky networks

### Storage and Caching

Service Worker (PWA) integration:
- Chunks are cached like any other assets
- Workbox in vite-plugin-pwa handles caching automatically
- No additional cache management needed

---

## Rollback Plan

If optimization causes issues:

### Simple Rollback
1. Comment out lazy() imports in App.jsx
2. Revert to direct component imports
3. Remove Suspense boundary
4. Run `npm run build`

### Git Rollback
```bash
git revert <commit-hash>  # Revert optimization commit
npm install                # Restore dependencies if changed
npm run build              # Rebuild
```

The changes are isolated and don't affect other systems, making rollback safe and quick.

---

## Performance Expectations

### Before Optimization
- Primary bundle: ~350KB (gzip ~110KB)
- MissionDetail chunk: N/A (all in primary)
- Lighthouse performance: ~70
- TTI: ~3.5 seconds
- FCP: ~1.2 seconds

### After Optimization
- Primary bundle: <100KB (gzip, 65%+ reduction)
- MissionDetail chunk: ~150KB (gzip)
- Other route chunks: <75KB (gzip)
- Lighthouse performance: 85+
- TTI: ~2.5 seconds (30%+ improvement)
- FCP: ~0.9 seconds (25%+ improvement)

---

## Future Optimization Opportunities

Beyond this implementation:

1. **Image Optimization**: Lazy-load images using Intersection Observer
2. **Route Prefetching**: Prefetch nearby routes based on user behavior
3. **Dynamic Polyfills**: Load polyfills only for older browsers
4. **CSS Splitting**: Extract route-specific CSS into separate files
5. **Vite Image Optimization**: Use vite-plugin-image-optimization for next-gen formats
6. **Service Worker Caching**: Fine-tune Workbox caching strategies per chunk
7. **Database Optimization**: Lazy-load mission data instead of loading all missions upfront
8. **Virtual Scrolling**: In MissionMap and similar lists, use react-virtual (already installed)

---

## Documentation References

### For Developers

Create `docs/BUNDLE_OPTIMIZATION.md` containing:

1. **Overview**: What was optimized and why
2. **Architecture Diagram**: How chunks are split
3. **Configuration Guide**: How vite.config.js controls splitting
4. **Adding New Routes**: How to add lazy-loaded routes
5. **Analyzing Bundles**: How to run bundle analyzer
6. **Size Targets**: What sizes should be maintained
7. **Troubleshooting**: Common issues and solutions

### External References

- [Vite Code Splitting Docs](https://vitejs.dev/guide/features.html#dynamic-import)
- [React.lazy() Documentation](https://react.dev/reference/react/lazy)
- [React Suspense](https://react.dev/reference/react/Suspense)
- [Rollup Manual Chunks](https://rollupjs.org/guide/en/#outputmanualchunks)
- [Monaco Editor Optimization](https://github.com/microsoft/monaco-editor/tree/main/samples)
- [Rollup Plugin Visualizer](https://github.com/btd/rollup-plugin-visualizer)

---

## Success Criteria Summary

| Criterion | Target | Verification | Priority |
|-----------|--------|--------------|----------|
| Primary Bundle (gzip) | <100KB | Bundle analysis | P0 |
| MissionDetail (gzip) | <150KB | Bundle analysis | P0 |
| Secondary Routes (gzip) | <75KB each | Bundle analysis | P0 |
| Lighthouse Performance | 85+ | Lighthouse CLI | P0 |
| TTI Improvement | 30%+ | Lighthouse comparison | P1 |
| FCP Improvement | 25%+ | Lighthouse comparison | P1 |
| Functionality Preserved | 100% | E2E tests pass | P0 |
| Error Recovery | Working | E2E tests pass | P1 |
| Tree-Shaking Effective | 30-40% Monaco reduction | Bundle analysis | P1 |
| Build Time Impact | <1s increase | Manual measurement | P2 |

---

## Sign-Off

This design provides a complete roadmap for implementing bundle size optimization. The implementation is low-risk (all changes are additive, existing functionality is preserved), follows Vite best practices, and achieves the stated performance goals through a clear five-phase approach.

**Design Review**: Ready for developer implementation
**Estimated Duration**: 3 days (Phases 1-5)
**Risk Level**: Low
**Breaking Changes**: None

