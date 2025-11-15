/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => {
  const MockIcon = ({ "data-testid": testId }: { "data-testid": string }) => {
    const React = require("react");
    return React.createElement("div", { "data-testid": testId });
  };

  return {
    ShoppingCart: (props: any) =>
      MockIcon({ "data-testid": "shopping-cart-icon", ...props }),
    Search: (props: any) =>
      MockIcon({ "data-testid": "search-icon", ...props }),
    Filter: (props: any) =>
      MockIcon({ "data-testid": "filter-icon", ...props }),
    ArrowLeft: (props: any) =>
      MockIcon({ "data-testid": "arrow-left-icon", ...props }),
    Check: (props: any) => MockIcon({ "data-testid": "check-icon", ...props }),
    Minus: (props: any) => MockIcon({ "data-testid": "minus-icon", ...props }),
    Plus: (props: any) => MockIcon({ "data-testid": "plus-icon", ...props }),
    Trash2: (props: any) => MockIcon({ "data-testid": "trash-icon", ...props }),
    ShoppingBag: (props: any) =>
      MockIcon({ "data-testid": "shopping-bag-icon", ...props }),
    Languages: (props: any) =>
      MockIcon({ "data-testid": "languages-icon", ...props }),
    ChevronDown: (props: any) =>
      MockIcon({ "data-testid": "chevron-down-icon", ...props }),
    ChevronUp: (props: any) =>
      MockIcon({ "data-testid": "chevron-up-icon", ...props }),
    Loader2: (props: any) =>
      MockIcon({ "data-testid": "loader2-icon", ...props }),
    CheckCircle: (props: any) =>
      MockIcon({ "data-testid": "check-circle-icon", ...props }),
    Home: (props: any) => MockIcon({ "data-testid": "home-icon", ...props }),
  };
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock pointer capture methods for JSDOM
if (typeof Element !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = function () {
      return false;
    };
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = function () {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = function () {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function () {};
  }
}
