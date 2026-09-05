/** @vitest-environment jsdom */
import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary, EditorErrorBoundary, MissionErrorBoundary } from "../../components/ErrorBoundary";

// Mock translation hook since ErrorBoundary uses useTranslation
vi.mock("../../i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        "errorBoundary.generic.title": "Something went wrong",
        "errorBoundary.generic.body": "An unexpected error occurred.",
        "errorBoundary.generic.reload": "Reload Page",
        "errorBoundary.generic.goHome": "Go Home",
        "errorBoundary.generic.report": "Report Bug",
        "errorBoundary.editor.body": "Editor crashed",
        "errorBoundary.editor.reset": "Reset Editor",
        "errorBoundary.mission.title": "Mission Error",
        "errorBoundary.mission.retry": "Retry",
      };
      return translations[key] || key;
    },
  }),
}));

// Helper component that throws an error during render
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error("Test render error");
  }
  return <div data-testid="child">Normal Content</div>;
};

describe("ErrorBoundary components", () => {
  // Suppress console.error during expected error boundary throws
  let consoleErrorSpy;
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("ErrorBoundary (Generic)", () => {
    it("renders children normally when no error occurs", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId("child")).toBeDefined();
      expect(screen.getByText("Normal Content")).toBeDefined();
    });

    it("renders fallback UI when a child component throws during render", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Verify fallback UI renders instead of throwing/blank screen
      expect(screen.getByText("Something went wrong")).toBeDefined();
      expect(screen.getByText("An unexpected error occurred.")).toBeDefined();
      expect(screen.getByText("Reload Page")).toBeDefined();
    });

    it("calls console.error via componentDidCatch when an error is caught", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("EditorErrorBoundary", () => {
    it("renders editor specific fallback UI on error", () => {
      render(
        <EditorErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EditorErrorBoundary>
      );

      expect(screen.getByText("Editor crashed")).toBeDefined();
      expect(screen.getByText("Reset Editor")).toBeDefined();
    });
  });

  describe("MissionErrorBoundary", () => {
    it("renders mission specific fallback UI on error", () => {
      render(
        <MissionErrorBoundary>
          <ThrowError shouldThrow={true} />
        </MissionErrorBoundary>
      );

      expect(screen.getByText("Mission Error")).toBeDefined();
      expect(screen.getByText("Retry")).toBeDefined();
    });
  });
});