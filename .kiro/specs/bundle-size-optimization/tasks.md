# Implementation Tasks: Bundle Size Optimization

## Overview

This document outlines the implementation plan for optimizing the Soroban Quest bundle size through code splitting, tree-shaking, and performance monitoring. The implementation follows a 5-phase approach: configuration setup, lazy-loading utilities, route optimization, Monaco Editor tree-shaking, and comprehensive verification.

**Target Metrics:**
- Primary bundle: <100KB (gzip)
- Secondary chunks: <75KB each (gzip)
- MissionDetail: <150KB (gzip)
- Lighthouse performance: >85
- TTI improvement: +30%
- FCP improvement: +25%

## Tasks

- [ ] 1. Configure Vite for Code Splitting and Bundle Analysis
  - [ ] 1.1 Add rollup-plugin-visualizer to dependencies
    - Install: `npm install --save-dev rollup-plugin-visualizer`
    - Verify installation with `npm ls rollup-plugin-visualizer`
    - _Requirements: 4, 9, 10, 14_
  
  - [ ] 1.2 Update vite.config.js with rollupOptions for code splitting
    - Add rollupOptions.output configuration with manualChunks for 'react-core'
    - Configure entryFileNames, chunkFileNames, assetFileNames with [hash] for cache-busting
    - Set minify to 'terser' with drop_console: true
    - Set chunkSizeWarningLimit to 250KB
    - _Requirements: 9, 14_
  
  - [ ] 1.3 Add visualizer plugin to vite.config.js
    - Import rollup-plugin-visualizer
    - Add plugin configuration with dist/bundle-analysis.html output path
    - Set brotli: true and gzip: true options
    - _Requirements: 4, 10, 14_
  
  - [ ] 1.4 Add tree-shaking hint to package.json
    - Add "sideEffects": false at root level
    - Verify no file modifications break this assumption
    - _Requirements: 14, 9_
  
  - [ ] 1.5 Test initial build and capture baseline metrics
    - Run `npm run build` and generate bundle-analysis.html
    - Document primary bundle size (current ~350KB gzip estimate)
    - Document each route chunk size
    - Screenshot or save bundle analysis for comparison
    - Run `npx lighthouse http://localhost:8080 --view` (after preview) for baseline Lighthouse
    - Save baseline metrics to `.kiro/specs/bundle-size-optimization/baseline-metrics.md`
    - _Requirements: 10, 8_
  
  - [ ]* 1.6 Write tests for bundle configuration
    - Create test to verify vite.config.js has rollupOptions defined
    - Create test to verify visualizer plugin is configured
    - Create test to verify sideEffects is false in package.json
    - _Requirements: 9_

- [ ] 2. Create Lazy Loading Utilities and Error Boundaries
  - [ ] 2.1 Create ChunkErrorBoundary component
    - Create `src/components/ChunkErrorBoundary.jsx`
    - Implement componentDidCatch to detect chunk load failures
    - Add getDerivedStateFromError for error state management
    - Implement retry logic with exponential backoff (1s, 2s, 4s)
    - Display error UI with "Failed to Load Page" message and retry button
    - Include Go Home button for fallback
    - _Requirements: 2, 12_
  
  - [ ] 2.2 Enhance existing ErrorBoundary to handle chunks
    - Verify `src/components/ErrorBoundary.jsx` exists and is functional
    - Add logic to detect "Failed to import" errors
    - Test that chunk errors are caught and displayed
    - _Requirements: 2, 12_
  
  - [ ] 2.3 Create lazyWithFallback utility function
    - Create `src/utils/lazyWithFallback.js`
    - Implement function that wraps lazy() import with Suspense and ChunkErrorBoundary
    - Ensure LoadingScreen is used as fallback
    - Return wrapped component ready for route usage
    - _Requirements: 1, 2_
  
  - [ ] 2.4 Create bundle monitoring utilities
    - Create `src/utils/bundleMonitor.js`
    - Implement logChunkLoad() function to track chunk load success/failure
    - Implement logChunkLoadError() function to log detailed error context
    - Include timestamp, chunk name, duration, and status
    - Integrate with window.__analytics if available
    - _Requirements: 10, 12_
  
  - [ ]* 2.5 Write tests for lazy loading utilities
    - Test lazyWithFallback returns wrapped component
    - Test ChunkErrorBoundary catches import errors
    - Test ChunkErrorBoundary displays retry button
    - Test retry button clears error state
    - Test bundleMonitor functions log correctly
    - _Requirements: 1, 2_

- [ ] 3. Lazy-Load Route Components in App.jsx
  - [ ] 3.1 Update imports in App.jsx to use lazy()
    - Replace direct imports for: MissionMap, MissionDetail, Profile, Journal, Campaigns, SkillTree
    - Import lazy, Suspense from React (already done for NotFound)
    - Keep Home imported directly (stays in primary bundle)
    - Change imports to: `const MissionDetail = lazy(() => import("./pages/MissionDetail"))`
    - _Requirements: 1, 3, 7_
  
  - [ ] 3.2 Verify Suspense boundary wraps all routes
    - Confirm Suspense boundary is already wrapping Routes
    - Verify LoadingScreen is used as fallback component
    - Verify fallback is lightweight (<5KB)
    - _Requirements: 1, 2_
  
  - [ ] 3.3 Test each lazy route loads correctly
    - Test navigation to /missions triggers MissionMap chunk load
    - Test navigation to /mission/1 triggers MissionDetail chunk load
    - Test navigation to /campaigns triggers Campaigns chunk load
    - Test navigation to /profile triggers Profile chunk load
    - Test navigation to /journal triggers Journal chunk load
    - Test navigation to /skills triggers SkillTree chunk load
    - Test LoadingScreen appears during chunk load
    - Verify functionality is identical to pre-optimization
    - Run existing test suite: `npm run test`
    - _Requirements: 1, 2, 7_
  
  - [ ] 3.4 Verify ErrorBoundary still wraps entire App
    - Check that ErrorBoundary still wraps ToastProvider and GameStateProvider
    - Verify error handling is still functional for global errors
    - Test that errors in components are still caught and displayed
    - _Requirements: 2, 12_
  
  - [ ] 3.5 Checkpoint - Ensure all existing tests pass
    - Run `npm run test` and verify all tests pass
    - Run `npm run test:e2e` and verify e2e tests pass (if applicable)
    - If tests fail, debug and fix failures before proceeding
    - Ask the user if any questions arise about test failures
    - _Requirements: 7, 10_

- [ ] 4. Optimize Monaco Editor for Rust-Only Support
  - [ ] 4.1 Analyze current Monaco Editor usage in MissionDetail
    - Read `src/pages/MissionDetail.jsx` to understand Monaco initialization
    - Identify how Monaco Editor is currently configured
    - Check if all languages are being loaded (default behavior)
    - Document current Monaco dependency size from bundle analysis
    - _Requirements: 3, 11_
  
  - [ ] 4.2 Configure Monaco Editor to load only Rust language
    - In MissionDetail.jsx, add language registration for Rust only
    - Use Monaco's language registration API: `monaco.languages.register()`
    - Explicitly set editor language to 'rust' for code models
    - Verify no other language loaders are imported or initialized
    - _Requirements: 3, 11_
  
  - [ ] 4.3 Test Monaco Editor functionality with Rust-only config
    - Test code editor still renders correctly
    - Test syntax highlighting works for Rust code
    - Test code completion/IntelliSense suggestions appear for Rust
    - Test code validation works for Rust syntax
    - Load a mission and verify editor functionality
    - Run `npm run test` to ensure MissionDetail tests still pass
    - _Requirements: 3, 7, 11_
  
  - [ ] 4.4 Build and measure Monaco tree-shaking impact
    - Run `npm run build` and generate new bundle analysis
    - Compare MissionDetail chunk size before and after
    - Verify Monaco-related dependencies are tree-shaken
    - Document size reduction in bundle analysis (target: 30-40% reduction)
    - Check for build warnings related to Monaco or unused imports
    - _Requirements: 3, 4, 6, 14_
  
  - [ ]* 4.5 Write integration test for Monaco Editor tree-shaking
    - Create test to verify Monaco Editor initializes correctly
    - Create test to verify Rust syntax highlighting works
    - Create test that MissionDetail chunk loads successfully
    - Add test to verify other language definitions are not in bundle (via imports check)
    - _Requirements: 3, 11_

- [ ] 5. Verify Bundle Size Targets and Build Optimization
  - [ ] 5.1 Run production build and capture all chunk sizes
    - Run `npm run build`
    - Extract all chunk file sizes from build output
    - Record both minified and gzip sizes for each chunk
    - Save output to `.kiro/specs/bundle-size-optimization/build-output.txt`
    - _Requirements: 5, 6, 10_
  
  - [ ] 5.2 Verify primary bundle is under 100KB (gzip)
    - Check build output for index.[hash].js file size
    - Verify gzip size is <100KB
    - If over 100KB, identify largest imports and consider further tree-shaking
    - Document finding in metrics file
    - _Requirements: 5, 10_
  
  - [ ] 5.3 Verify MissionDetail chunk is under 150KB (gzip)
    - Locate MissionDetail.[hash].js in build output
    - Verify gzip size is <150KB (including Monaco Editor)
    - If over 150KB, analyze Monaco configuration and dependencies
    - Document finding in metrics file
    - _Requirements: 6, 10_
  
  - [ ] 5.4 Verify all secondary route chunks are under 75KB (gzip)
    - Check sizes for: MissionMap, Campaigns, Profile, Journal, SkillTree chunks
    - Verify each is <75KB gzip
    - If any chunk exceeds 75KB, analyze dependencies and optimize
    - Document findings in metrics file
    - _Requirements: 6, 10_
  
  - [ ] 5.5 Generate and review bundle analysis report
    - Locate dist/bundle-analysis.html generated by visualizer plugin
    - Open report in browser and review chunk composition
    - Identify top 10 dependencies by size in primary bundle
    - Identify top 10 dependencies by size in MissionDetail chunk
    - Screenshot key insights from analysis
    - _Requirements: 4, 10, 14_
  
  - [ ] 5.6 Compare baseline vs optimized metrics
    - Load baseline metrics from step 1.5
    - Compare primary bundle size reduction
    - Calculate percentage reduction for primary bundle
    - Calculate percentage reduction for MissionDetail (Monaco tree-shaking)
    - Document all improvements in metrics file
    - _Requirements: 8, 10, 14_
  
  - [ ] 5.7 Address any bundle size warnings
    - Check build output for size warnings (configured at 250KB limit)
    - If warnings appear, analyze the problematic chunk
    - Consider splitting large chunks further or tree-shaking unused imports
    - Re-run build to confirm warnings are resolved
    - _Requirements: 6, 10_

- [ ] 6. Performance Testing and Lighthouse Audit
  - [ ] 6.1 Build application and prepare for Lighthouse audit
    - Run `npm run build`
    - Run `npm run preview` to start local preview server
    - Verify application loads correctly in browser
    - _Requirements: 8_
  
  - [ ] 6.2 Run Lighthouse audit on optimized application
    - Use Chrome DevTools or run: `npx lighthouse http://localhost:3000`
    - Audit homepage and other key pages (campaigns, missions, etc.)
    - Capture performance score (target: >85)
    - Measure Time to Interactive (TTI)
    - Measure First Contentful Paint (FCP)
    - Measure Largest Contentful Paint (LCP)
    - Save audit report to `.kiro/specs/bundle-size-optimization/lighthouse-optimized.html`
    - _Requirements: 8, 10_
  
  - [ ] 6.3 Compare Lighthouse metrics to baseline
    - Load baseline Lighthouse report from step 1.5
    - Compare performance score (target: >85 or +5 point improvement)
    - Calculate TTI improvement percentage (target: +30%)
    - Calculate FCP improvement percentage (target: +25%)
    - Calculate LCP improvement percentage
    - Document comparisons in metrics file
    - _Requirements: 8, 10_
  
  - [ ] 6.4 Verify performance on simulated low-bandwidth connection
    - In Chrome DevTools Network tab, set throttling to "Slow 4G"
    - Navigate through application routes
    - Verify LoadingScreen appears and chunks load within reasonable time
    - Measure chunk load time and verify acceptable (<3 seconds per chunk)
    - Document findings in metrics file
    - _Requirements: 5, 8_
  
  - [ ] 6.5 Test chunk load failures and error recovery
    - In Network tab, set offline mode
    - Navigate to a route that needs to load a chunk
    - Verify error message appears
    - Click retry button and set connection back to online
    - Verify chunk loads on retry
    - Test that other routes still function if one chunk fails
    - _Requirements: 12, 10_

- [ ] 7. Comprehensive Testing and Validation
  - [ ] 7.1 Run full test suite
    - Run `npm run test` and ensure all tests pass
    - If any tests fail, debug and fix before proceeding
    - Verify no test files are broken by code splitting changes
    - _Requirements: 7, 10_
  
  - [ ] 7.2 Run end-to-end tests
    - Run `npm run test:e2e` and ensure all e2e tests pass
    - Verify navigation flows work correctly with lazy loading
    - Verify mission completion flow works end-to-end
    - If tests fail, debug and fix
    - _Requirements: 7, 10_
  
  - [ ] 7.3 Verify all application features work correctly
    - Test Home page loads without lazy loading
    - Test mission code editor functionality (Monaco)
    - Test code execution and test results
    - Test progress saving and loading
    - Test mission completion and XP/level-up mechanics
    - Test journal and profile functionality
    - Test skill tree interaction
    - Test campaign selection
    - Document any issues found
    - _Requirements: 7, 10_
  
  - [ ] 7.4 Test backward compatibility
    - Verify old bookmarks still work (route URLs unchanged)
    - Verify localStorage persists correctly with lazy-loaded routes
    - Verify game state is preserved across route navigation
    - Verify no breaking changes to component APIs
    - _Requirements: 7_
  
  - [ ] 7.5 Verify chunk manifest and build metadata
    - Check that generated chunks match expected route components
    - Verify no orphaned or unused chunks are generated
    - Verify chunk names are predictable and match route names
    - Run build multiple times and verify deterministic output
    - _Requirements: 10_

- [ ] 8. Documentation and Finalization
  - [ ] 8.1 Create comprehensive optimization documentation
    - Create `docs/BUNDLE_OPTIMIZATION.md` explaining strategy
    - Document the 5 phases of implementation
    - Explain code splitting architecture and route chunks
    - Document tree-shaking strategy for Monaco Editor
    - Explain how to run bundle analysis
    - Provide performance improvement metrics
    - Include before/after bundle analysis comparisons
    - _Requirements: 13_
  
  - [ ] 8.2 Document bundle size targets and monitoring
    - List primary bundle target: <100KB gzip
    - List secondary chunk targets: <75KB gzip each
    - List MissionDetail target: <150KB gzip
    - Explain how to verify targets in future builds
    - Document warning thresholds and what to do if exceeded
    - _Requirements: 5, 6, 13_
  
  - [ ] 8.3 Create developer guide for maintaining optimizations
    - Document how to lazy-load new routes in the future
    - Provide code template for new lazy routes
    - Explain the lazyWithFallback utility usage
    - Document performance best practices
    - Explain how to use bundle analysis for decisions
    - _Requirements: 13_
  
  - [ ] 8.4 Update project README with optimization summary
    - Add section explaining bundle optimization
    - Note performance improvements achieved
    - Link to detailed documentation
    - Include instructions to run bundle analysis
    - _Requirements: 13_
  
  - [ ] 8.5 Create metrics summary document
    - Compile all size comparisons (before/after)
    - Compile all Lighthouse improvements
    - Compile TTI/FCP/LCP improvements
    - Document chunk load times on slow connections
    - Calculate and document total bandwidth savings for typical user
    - _Requirements: 8, 10_

- [ ] 9. Final Checkpoint and Review
  - [ ] 9.1 Verify all acceptance criteria are met
    - Check Requirement 1: Code splitting for all routes except Home ✓
    - Check Requirement 2: Suspense boundaries and error handling ✓
    - Check Requirement 3: Monaco Editor tree-shaking ✓
    - Check Requirement 4: Bundle analysis configuration ✓
    - Check Requirement 5: Primary bundle <100KB gzip ✓
    - Check Requirement 6: Secondary chunks <75KB gzip ✓
    - Check Requirement 7: Functionality preserved ✓
    - Check Requirement 8: Lighthouse >85 ✓
    - Check Requirement 9: Vite configuration documented ✓
    - Check Requirement 10: Build process verification ✓
    - Check Requirement 11: Monaco Rust isolation ✓
    - Check Requirement 12: Graceful error handling ✓
    - Check Requirement 13: Documentation complete ✓
    - Check Requirement 14: Tree-shaking verified ✓
    - _Requirements: 1-14_
  
  - [ ] 9.2 Run final build and verify no warnings
    - Run `npm run build` one final time
    - Capture final build output
    - Verify no bundle size warnings
    - Verify all tests pass
    - Verify no console errors or warnings during build
    - _Requirements: 10, 14_
  
  - [ ] 9.3 Create final metrics report
    - Compile final bundle analysis
    - Compare to baseline metrics
    - Create summary table: Before | After | Improvement
    - Calculate total bundle size reduction percentage
    - Document final Lighthouse scores
    - Document final TTI/FCP/LCP metrics
    - Ensure all targets are met
    - Ask the user if questions arise about results
    - _Requirements: 8, 10_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints (phases ending in .5 or final sections) ensure validation before proceeding
- All changes maintain 100% backward compatibility
- No component APIs are modified; splitting is purely internal
- Build times should remain similar or improve due to parallelization
- Tests should run in <30 seconds after lazy-loading implementation
- Lighthouse audits should improve 30%+ for TTI and 25%+ for FCP

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["1.5", "2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": ["1.6", "2.4", "3.1"] },
    { "id": 3, "tasks": ["2.5", "3.2", "3.3"] },
    { "id": 4, "tasks": ["3.4", "3.5", "4.1"] },
    { "id": 5, "tasks": ["4.2", "4.3", "4.4"] },
    { "id": 6, "tasks": ["4.5", "5.1", "5.2"] },
    { "id": 7, "tasks": ["5.3", "5.4", "5.5"] },
    { "id": 8, "tasks": ["5.6", "5.7", "6.1"] },
    { "id": 9, "tasks": ["6.2", "6.3", "6.4"] },
    { "id": 10, "tasks": ["6.5", "7.1", "7.2"] },
    { "id": 11, "tasks": ["7.3", "7.4", "7.5"] },
    { "id": 12, "tasks": ["8.1", "8.2", "8.3"] },
    { "id": 13, "tasks": ["8.4", "8.5"] },
    { "id": 14, "tasks": ["9.1", "9.2", "9.3"] }
  ]
}
```
