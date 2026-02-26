import "@testing-library/dom";
import "@testing-library/jest-dom/vitest";

// JSDOM does not implement ResizeObserver
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}
