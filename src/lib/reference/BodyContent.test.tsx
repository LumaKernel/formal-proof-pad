import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BodyContent } from "./BodyContent";

afterEach(cleanup);

describe("BodyContent", () => {
  it("通常のテキストを<p>で表示する", () => {
    const { container } = render(<BodyContent text="Hello world" />);
    const p = container.querySelector("p");
    expect(p).not.toBeNull();
    expect(p?.textContent).toBe("Hello world");
  });

  it("• リストを<ul>/<li>で表示する", () => {
    const { container } = render(
      <BodyContent text={"In a system:\n• First item\n• Second item"} />,
    );
    const p = container.querySelector("p");
    expect(p?.textContent).toBe("In a system:");

    const ul = container.querySelector("ul");
    expect(ul).not.toBeNull();
    const items = ul?.querySelectorAll("li");
    expect(items?.length).toBe(2);
    expect(items?.[0]?.textContent).toBe("First item");
    expect(items?.[1]?.textContent).toBe("Second item");
  });

  it("<b>N.</b> リストを<ol>/<li>で表示する", () => {
    const { container } = render(
      <BodyContent
        text={
          "Reasons:\n<b>1. Certainty:</b> No error.\n<b>2. Verification:</b> Automatic."
        }
      />,
    );
    const ol = container.querySelector("ol");
    expect(ol).not.toBeNull();
    const items = ol?.querySelectorAll("li");
    expect(items?.length).toBe(2);
  });

  it("プレーンな番号付きリストを<ol>/<li>で表示する", () => {
    const { container } = render(
      <BodyContent text={"Steps:\n1. Click here\n2. Select option"} />,
    );
    const ol = container.querySelector("ol");
    expect(ol).not.toBeNull();
    const items = ol?.querySelectorAll("li");
    expect(items?.length).toBe(2);
    expect(items?.[0]?.textContent).toBe("Click here");
  });

  it("リスト内のインラインマークダウンが正しくレンダリングされる", () => {
    const { container } = render(
      <BodyContent text={"• <b>Bold item</b> with text\n• Normal item"} />,
    );
    const strong = container.querySelector("strong");
    expect(strong).not.toBeNull();
    expect(strong?.textContent).toBe("Bold item");
  });

  it("<ol>はlist-styleとしてデフォルト表示される", () => {
    const { container } = render(
      <BodyContent
        text={"<b>1. First:</b> Detail\n<b>2. Second:</b> Detail"}
      />,
    );
    const ol = container.querySelector("ol");
    expect(ol).not.toBeNull();
  });
});
