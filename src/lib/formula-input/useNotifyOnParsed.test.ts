import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useNotifyOnParsed } from "./useNotifyOnParsed";

describe("useNotifyOnParsed", () => {
  it("parsedValue が非null で onParsed が指定されていれば呼ばれる", () => {
    const onParsed = vi.fn();
    renderHook(() => useNotifyOnParsed("hello", onParsed));
    expect(onParsed).toHaveBeenCalledWith("hello");
    expect(onParsed).toHaveBeenCalledTimes(1);
  });

  it("parsedValue が null なら onParsed は呼ばれない", () => {
    const onParsed = vi.fn();
    renderHook(() => useNotifyOnParsed(null, onParsed));
    expect(onParsed).not.toHaveBeenCalled();
  });

  it("onParsed が undefined なら何もしない", () => {
    // エラーが発生しないことを確認
    renderHook(() => useNotifyOnParsed("hello", undefined));
  });

  it("parsedValue が変わると再度 onParsed が呼ばれる", () => {
    const onParsed = vi.fn();
    const { rerender } = renderHook(
      ({ value }: { readonly value: string | null }) =>
        useNotifyOnParsed(value, onParsed),
      { initialProps: { value: "first" as string | null } },
    );
    expect(onParsed).toHaveBeenCalledTimes(1);
    expect(onParsed).toHaveBeenCalledWith("first");

    rerender({ value: "second" });
    expect(onParsed).toHaveBeenCalledTimes(2);
    expect(onParsed).toHaveBeenCalledWith("second");
  });

  it("parsedValue が null に変わったら onParsed は呼ばれない", () => {
    const onParsed = vi.fn();
    const { rerender } = renderHook(
      ({ value }: { readonly value: string | null }) =>
        useNotifyOnParsed(value, onParsed),
      { initialProps: { value: "initial" as string | null } },
    );
    expect(onParsed).toHaveBeenCalledTimes(1);

    rerender({ value: null });
    // null に変わっても追加で呼ばれない
    expect(onParsed).toHaveBeenCalledTimes(1);
  });
});
