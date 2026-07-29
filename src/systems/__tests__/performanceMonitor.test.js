import { describe, it, expect, beforeEach } from "vitest";
import {
  measureRender,
  measureNavigation,
  measureEditorLoad,
  getPerformanceMetrics,
  clearPerformanceMetrics,
} from "../performanceMonitor";

describe("performanceMonitor", () => {
  beforeEach(() => {
    clearPerformanceMetrics();
  });

  it("measureRender records a duration entry for the component", () => {
    const stop = measureRender("SkillTree");
    stop();

    const metrics = getPerformanceMetrics();
    expect(metrics.renders.summary.count).toBe(1);
    expect(metrics.renders.entries[0].component).toBe("SkillTree");
    expect(metrics.renders.entries[0].duration).toBeGreaterThanOrEqual(0);
  });

  it("measureRender returns a no-op when componentName is missing", () => {
    const stop = measureRender();
    expect(() => stop()).not.toThrow();

    const metrics = getPerformanceMetrics();
    expect(metrics.renders.summary.count).toBe(0);
  });

  it("measureNavigation records from/to and a duration", () => {
    const stop = measureNavigation("/missions", "/mission/1");
    stop();

    const metrics = getPerformanceMetrics();
    expect(metrics.navigations.summary.count).toBe(1);
    expect(metrics.navigations.entries[0]).toMatchObject({
      from: "/missions",
      to: "/mission/1",
    });
  });

  it("measureNavigation defaults 'from' to 'unknown' when omitted", () => {
    const stop = measureNavigation(undefined, "/profile");
    stop();

    const metrics = getPerformanceMetrics();
    expect(metrics.navigations.entries[0].from).toBe("unknown");
  });

  it("measureEditorLoad records a duration entry", () => {
    const stop = measureEditorLoad();
    stop();

    const metrics = getPerformanceMetrics();
    expect(metrics.editorLoads.summary.count).toBe(1);
    expect(metrics.editorLoads.entries[0].duration).toBeGreaterThanOrEqual(0);
  });

  it("getPerformanceMetrics computes avg/min/max across multiple entries", () => {
    measureRender("Home")();
    measureRender("Home")();
    measureRender("Home")();

    const metrics = getPerformanceMetrics();
    expect(metrics.renders.summary.count).toBe(3);
    expect(metrics.renders.summary.avgDuration).toBeGreaterThanOrEqual(0);
    expect(metrics.renders.summary.minDuration).toBeLessThanOrEqual(
      metrics.renders.summary.maxDuration
    );
  });

  it("clearPerformanceMetrics resets all categories", () => {
    measureRender("Home")();
    measureNavigation("/", "/missions")();
    measureEditorLoad()();

    clearPerformanceMetrics();

    const metrics = getPerformanceMetrics();
    expect(metrics.renders.summary.count).toBe(0);
    expect(metrics.navigations.summary.count).toBe(0);
    expect(metrics.editorLoads.summary.count).toBe(0);
  });

  it("returns a zeroed summary when a category has no entries", () => {
    const metrics = getPerformanceMetrics();
    expect(metrics.renders.summary).toEqual({
      count: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
    });
  });
});
