/* ==========================================
   Performance Monitor — Runtime Metrics System
   Tracks component render timings, route navigation
   durations, and Monaco editor load times using the
   browser Performance API. Falls back gracefully when
   the API is unavailable (e.g. older browsers, SSR, tests).
   ========================================== */

const MAX_METRICS_PER_CATEGORY = 100;

export interface PerformanceEntry {
  component?: string;
  duration: number;
  timestamp: number;
  from?: string;
  to?: string;
}

export interface PerformanceSummary {
  count: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
}

export interface PerformanceMetricsSnapshot {
  renders: {
    summary: PerformanceSummary;
    entries: PerformanceEntry[];
  };
  navigations: {
    summary: PerformanceSummary;
    entries: PerformanceEntry[];
  };
  editorLoads: {
    summary: PerformanceSummary;
    entries: PerformanceEntry[];
  };
}

const metrics: {
  renders: PerformanceEntry[];
  navigations: PerformanceEntry[];
  editorLoads: PerformanceEntry[];
} = {
  renders: [],
  navigations: [],
  editorLoads: [],
};

function hasPerformanceApi(): boolean {
  return (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  );
}

function pushMetric(
  category: keyof typeof metrics,
  entry: PerformanceEntry
): void {
  const list = metrics[category];
  list.push(entry);
  if (list.length > MAX_METRICS_PER_CATEGORY) {
    list.shift();
  }
}

/**
 * Measures the render duration of a component using performance marks.
 * Call the returned function once rendering/painting completes.
 *
 * @param componentName - Name of the component being measured.
 * @returns Function to call to stop the measurement and record the duration.
 *
 * Usage:
 *   useEffect(() => {
 *     const stop = measureRender('SkillTree');
 *     return stop;
 *   }, []);
 */
export function measureRender(componentName: string): () => void {
  if (!hasPerformanceApi() || !componentName) {
    return () => {};
  }

  const startMark = `render-start-${componentName}-${Date.now()}-${Math.random()}`;

  try {
    performance.mark(startMark);
  } catch (error) {
    console.error("Failed to start render measurement:", error);
    return () => {};
  }

  return function stopMeasureRender() {
    try {
      const endMark = `${startMark}-end`;
      const measureName = `render-${componentName}`;
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);

      const entries = performance.getEntriesByName(measureName);
      const entry = entries[0] as PerformanceMeasure;
      if (entry) {
        pushMetric("renders", {
          component: componentName,
          duration: entry.duration,
          timestamp: Date.now(),
        });
      }

      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    } catch (error) {
      console.error("Failed to complete render measurement:", error);
    }
  };
}

/**
 * Measures the duration of a route navigation using performance marks.
 * Call the returned function once the destination route has mounted.
 *
 * @param from - Origin route path.
 * @param to - Destination route path.
 * @returns Function to call to stop the measurement and record the duration.
 */
export function measureNavigation(
  from: string | undefined,
  to: string
): () => void {
  if (!hasPerformanceApi() || !to) {
    return () => {};
  }

  const startMark = `nav-start-${from || "unknown"}-${to}-${Date.now()}-${Math.random()}`;

  try {
    performance.mark(startMark);
  } catch (error) {
    console.error("Failed to start navigation measurement:", error);
    return () => {};
  }

  return function stopMeasureNavigation() {
    try {
      const endMark = `${startMark}-end`;
      const measureName = `nav-${from || "unknown"}-to-${to}`;
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);

      const entries = performance.getEntriesByName(measureName);
      const entry = entries[0] as PerformanceMeasure;
      if (entry) {
        pushMetric("navigations", {
          from: from || "unknown",
          to,
          duration: entry.duration,
          timestamp: Date.now(),
        });
      }

      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    } catch (error) {
      console.error("Failed to complete navigation measurement:", error);
    }
  };
}

/**
 * Measures the load duration of the lazy-loaded Monaco editor bundle.
 * Call the returned function once the editor's onMount fires.
 *
 * @returns Function to call to stop the measurement and record the duration.
 *
 * Usage:
 *   const stop = measureEditorLoad();
 *   const handleEditorMount = (editor, monaco) => {
 *     stop();
 *     ...
 *   };
 */
export function measureEditorLoad(): () => void {
  if (!hasPerformanceApi()) {
    return () => {};
  }

  const startMark = `editor-load-start-${Date.now()}-${Math.random()}`;

  try {
    performance.mark(startMark);
  } catch (error) {
    console.error("Failed to start editor load measurement:", error);
    return () => {};
  }

  return function stopMeasureEditorLoad() {
    try {
      const endMark = `${startMark}-end`;
      const measureName = "editor-load";
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);

      const entries = performance.getEntriesByName(measureName);
      const entry = entries[0] as PerformanceMeasure;
      if (entry) {
        pushMetric("editorLoads", {
          duration: entry.duration,
          timestamp: Date.now(),
        });
      }

      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    } catch (error) {
      console.error("Failed to complete editor load measurement:", error);
    }
  };
}

function summarize(list: PerformanceEntry[]): PerformanceSummary {
  if (list.length === 0) {
    return {
      count: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
    };
  }

  const durations = list.map((entry) => entry.duration);
  const total = durations.reduce((sum, d) => sum + d, 0);

  return {
    count: list.length,
    avgDuration: total / list.length,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
  };
}

/**
 * Returns a snapshot of all collected performance metrics, including
 * per-category summaries (count, average/min/max duration) and the
 * raw recorded entries (capped at the most recent MAX_METRICS_PER_CATEGORY).
 *
 * @returns Performance metrics snapshot
 */
export function getPerformanceMetrics(): PerformanceMetricsSnapshot {
  return {
    renders: {
      summary: summarize(metrics.renders),
      entries: [...metrics.renders],
    },
    navigations: {
      summary: summarize(metrics.navigations),
      entries: [...metrics.navigations],
    },
    editorLoads: {
      summary: summarize(metrics.editorLoads),
      entries: [...metrics.editorLoads],
    },
  };
}

/**
 * Clears all collected performance metrics. Primarily useful for tests.
 */
export function clearPerformanceMetrics(): void {
  metrics.renders.length = 0;
  metrics.navigations.length = 0;
  metrics.editorLoads.length = 0;
}
