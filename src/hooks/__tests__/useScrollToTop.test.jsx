/**
 * @vitest-environment jsdom
 *
 * Tests for useScrollToTop hook and the legacy ScrollToTop component.
 *
 * Key behavior of useScrollToTop:
 *   - MemoryRouter initialises with navigationType === "POP", so the hook does
 *     NOT scroll on the very first mount (same as a real browser back-button load).
 *   - PUSH navigations → scrolls window and DOM containers to the top.
 *   - POP navigations (navigate(-1), browser back/forward) → no scroll, preserving
 *     the browser's native scroll restoration.
 *
 * ScrollToTop.jsx (legacy component):
 *   - Simpler — reacts only to pathname changes, always scrolls with behavior:"smooth".
 *   - Does NOT check navigationType, so it scrolls on every change including POP.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, act, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import useScrollToTop from "../useScrollToTop.js";

// ---------------------------------------------------------------------------
// Thin helper component that mounts the hook under test
// ---------------------------------------------------------------------------
function ScrollToTopHarness() {
  useScrollToTop();
  return null;
}

// ---------------------------------------------------------------------------
// Helper: render the hook in a MemoryRouter and surface useNavigate
// ---------------------------------------------------------------------------
function setup(initialPath = "/") {
  let navigateFn;

  function NavigateCapture() {
    navigateFn = useNavigate();
    return null;
  }

  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ScrollToTopHarness />
      <NavigateCapture />
      <Routes>
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>,
  );

  return {
    navigate: async (to, opts) => {
      await act(async () => navigateFn(to, opts));
    },
  };
}

// ---------------------------------------------------------------------------
// Tests: useScrollToTop hook
// ---------------------------------------------------------------------------

describe("useScrollToTop", () => {
  beforeEach(() => {
    // Spy installed before each test so every call is captured.
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  it("does NOT call window.scrollTo on initial mount (MemoryRouter starts with POP)", () => {
    // React Router's MemoryRouter initialises navigationType as "POP", so the
    // hook intentionally skips scrolling — matching browser native behavior where
    // a fresh page load does not forcibly reset the scroll position.
    setup("/");

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("scrolls to top on the first PUSH navigation", async () => {
    const { navigate } = setup("/");

    await navigate("/missions");

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  });

  it("scrolls to top on every successive PUSH navigation", async () => {
    const { navigate } = setup("/");

    await navigate("/missions");
    await navigate("/profile");

    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    // Both calls use the same arguments.
    for (const call of window.scrollTo.mock.calls) {
      expect(call[0]).toEqual({ top: 0, left: 0, behavior: "instant" });
    }
  });

  it("does NOT scroll on POP navigation (browser back/forward)", async () => {
    const { navigate } = setup("/");

    // Push a new entry first so there is history to pop back from.
    await navigate("/missions");
    window.scrollTo.mockClear();

    await navigate(-1); // POP — simulates the browser back button

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("resumes scrolling if user navigates forward after a POP", async () => {
    const { navigate } = setup("/");

    await navigate("/missions");
    await navigate(-1); // POP
    window.scrollTo.mockClear();

    // A new PUSH after a POP should still scroll.
    await navigate("/profile");

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  });

  it("resets scrollTop on .main-content and .app DOM containers on PUSH", async () => {
    const mainContent = document.createElement("div");
    mainContent.className = "main-content";

    const appDiv = document.createElement("div");
    appDiv.className = "app";

    document.body.appendChild(mainContent);
    document.body.appendChild(appDiv);

    try {
      const { navigate } = setup("/");

      // Simulate the user having scrolled mid-page.
      mainContent.scrollTop = 500;
      appDiv.scrollTop = 300;

      await navigate("/profile");

      expect(mainContent.scrollTop).toBe(0);
      expect(appDiv.scrollTop).toBe(0);
    } finally {
      document.body.removeChild(mainContent);
      document.body.removeChild(appDiv);
    }
  });

  it("does NOT reset DOM scroll containers on POP navigation", async () => {
    const mainContent = document.createElement("div");
    mainContent.className = "main-content";
    document.body.appendChild(mainContent);

    try {
      const { navigate } = setup("/");
      await navigate("/missions");

      // User has scrolled partway down on the destination page.
      mainContent.scrollTop = 400;

      await navigate(-1); // POP — scroll position should be preserved

      expect(mainContent.scrollTop).toBe(400);
    } finally {
      document.body.removeChild(mainContent);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: ScrollToTop component (legacy simpler wrapper)
// ---------------------------------------------------------------------------

describe("ScrollToTop component", () => {
  let ScrollToTop;

  beforeEach(async () => {
    ({ default: ScrollToTop } = await import(
      "../../components/ScrollToTop.jsx"
    ));
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  function setupWithComponent(initialPath = "/") {
    let navigateFn;

    function NavigateCapture() {
      navigateFn = useNavigate();
      return null;
    }

    render(
      <MemoryRouter initialEntries={[initialPath]}>
        <ScrollToTop />
        <NavigateCapture />
        <Routes>
          <Route path="*" element={null} />
        </Routes>
      </MemoryRouter>,
    );

    return {
      navigate: async (to, opts) => {
        await act(async () => navigateFn(to, opts));
      },
    };
  }

  it("calls window.scrollTo on initial mount with smooth behavior", () => {
    setupWithComponent("/");

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("scrolls to top on pathname change (PUSH)", async () => {
    const { navigate } = setupWithComponent("/");
    window.scrollTo.mockClear();

    await navigate("/missions");

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("scrolls on POP navigation too (no navigationType check in this component)", async () => {
    // Unlike useScrollToTop, ScrollToTop.jsx only watches `pathname` and does
    // not check useNavigationType, so it fires on every route change including POP.
    const { navigate } = setupWithComponent("/");
    await navigate("/missions");
    window.scrollTo.mockClear();

    await navigate(-1); // POP

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
