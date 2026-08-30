/** @vitest-environment jsdom */

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";
import { LanguageProvider } from "../../i18n";
import Footer from "../Footer.jsx";

afterEach(() => {
  cleanup();
});

// Keep in sync with static <Route path> entries in src/App.jsx.
const KNOWN_APP_ROUTES = new Set([
  "/",
  "/missions",
  "/quests",
  "/campaigns",
  "/profile",
  "/journal",
  "/skills",
  "/leaderboard",
  "/achievements",
  "/shop",
]);

const routerFuture = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderFooter(initialPath = "/") {
  return render(
    <LanguageProvider>
      <MemoryRouter future={routerFuture} initialEntries={[initialPath]}>
        <Footer />
        <LocationDisplay />
      </MemoryRouter>
    </LanguageProvider>,
  );
}

function footer() {
  return screen.getByRole("contentinfo");
}

function footerLinks() {
  return within(footer()).getAllByRole("link");
}

function hrefOf(link) {
  return link.getAttribute("href") ?? "";
}

function isInternalHref(href) {
  return href.startsWith("/") && !href.startsWith("//");
}

function isExternalHref(href) {
  return /^https?:\/\//i.test(href);
}

function pathnameOf(href) {
  return href.split(/[?#]/)[0];
}

function isKnownAppRoute(pathname) {
  return (
    KNOWN_APP_ROUTES.has(pathname) ||
    pathname.startsWith("/mission/") ||
    pathname.startsWith("/theory/")
  );
}

describe("Footer", () => {
  it("renders platform, resources, community, and credits without crashing", () => {
    renderFooter();

    expect(footer()).toBeTruthy();
    expect(within(footer()).getByRole("heading", { name: "Platform" })).toBeTruthy();
    expect(within(footer()).getByRole("heading", { name: "Resources" })).toBeTruthy();
    expect(within(footer()).getByRole("heading", { name: "Community" })).toBeTruthy();
    expect(within(footer()).getByText("Built for the Stellar ecosystem")).toBeTruthy();
    expect(within(footer()).getByText("MIT License")).toBeTruthy();
  });

  it("renders expected internal and external links", () => {
    renderFooter();
    const root = footer();

    expect(within(root).getByRole("link", { name: "Home" })).toBeTruthy();
    expect(within(root).getByRole("link", { name: "Missions" })).toBeTruthy();
    expect(within(root).getByRole("link", { name: "Profile" })).toBeTruthy();

    expect(within(root).getByRole("link", { name: /Soroban Docs/ })).toBeTruthy();
    expect(within(root).getByRole("link", { name: /Stellar SDK/ })).toBeTruthy();
    expect(within(root).getByRole("link", { name: /^GitHub/ })).toBeTruthy();
    expect(within(root).getByRole("link", { name: /Glossary/ })).toBeTruthy();
    expect(within(root).getByRole("link", { name: /FAQ/ })).toBeTruthy();
    expect(within(root).getByRole("link", { name: /Discord/ })).toBeTruthy();
    expect(within(root).getByRole("link", { name: /Stellar Forum/ })).toBeTruthy();
    expect(within(root).getByRole("link", { name: /Stellar Blog/ })).toBeTruthy();
  });

  it("uses React Router for internal links so they update in-app location", async () => {
    const user = userEvent.setup();
    renderFooter("/profile");
    const root = footer();

    await user.click(within(root).getByRole("link", { name: "Missions" }));
    expect(screen.getByTestId("location").textContent).toBe("/missions");

    await user.click(within(root).getByRole("link", { name: "Home" }));
    expect(screen.getByTestId("location").textContent).toBe("/");

    await user.click(within(root).getByRole("link", { name: "Profile" }));
    expect(screen.getByTestId("location").textContent).toBe("/profile");
  });

  it("points internal links at valid app routes", () => {
    renderFooter();

    const internalHrefs = footerLinks()
      .map(hrefOf)
      .filter(isInternalHref)
      .map(pathnameOf);

    expect(internalHrefs).toEqual(["/", "/missions", "/profile"]);
    for (const pathname of internalHrefs) {
      expect(isKnownAppRoute(pathname)).toBe(true);
    }
  });

  it("does not link to dead in-app routes such as /glossary", () => {
    renderFooter();

    const internalPathnames = footerLinks()
      .map(hrefOf)
      .filter(isInternalHref)
      .map(pathnameOf);

    expect(internalPathnames).not.toContain("/glossary");

    const glossary = within(footer()).getByRole("link", { name: /Glossary/ });
    expect(hrefOf(glossary)).toBe(
      "https://developers.stellar.org/docs/learn/encyclopedia",
    );
  });

  it("gives every external link target=_blank and rel=noopener noreferrer", () => {
    renderFooter();

    const externalLinks = footerLinks().filter((link) =>
      isExternalHref(hrefOf(link)),
    );

    expect(externalLinks.length).toBeGreaterThan(0);

    for (const link of externalLinks) {
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });

  it("does not use placeholder or empty hrefs for social and resource links", () => {
    renderFooter();

    for (const link of footerLinks()) {
      const href = hrefOf(link);
      expect(href).not.toBe("");
      expect(href).not.toBe("#");
      expect(href).not.toMatch(/^javascript:/i);
    }
  });
});
