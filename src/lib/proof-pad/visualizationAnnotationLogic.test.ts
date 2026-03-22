import { describe, expect, it } from "vitest";

import {
  getAnnotationBubbleStyle,
  getAnnotationContainerStyle,
  groupAnnotationsByNodeId,
} from "./visualizationAnnotationLogic";
import type { NodeAnnotation } from "./visualizationState";

describe("visualizationAnnotationLogic", () => {
  describe("getAnnotationBubbleStyle", () => {
    it("returns consistent style object", () => {
      const style = getAnnotationBubbleStyle();
      expect(style.borderRadius).toBe("6px");
      expect(style.fontSize).toBe("12px");
      expect(style.whiteSpace).toBe("pre-wrap");
      expect(style.wordBreak).toBe("break-word");
      expect(style.maxWidth).toBe("200px");
    });

    it("returns same reference on multiple calls", () => {
      expect(getAnnotationBubbleStyle()).toBe(getAnnotationBubbleStyle());
    });
  });

  describe("getAnnotationContainerStyle", () => {
    it("returns container positioned below node", () => {
      const style = getAnnotationContainerStyle();
      expect(style.position).toBe("absolute");
      expect(style.top).toBe("100%");
      expect(style.display).toBe("flex");
      expect(style.flexDirection).toBe("column");
      expect(style.pointerEvents).toBe("none");
    });

    it("returns same reference on multiple calls", () => {
      expect(getAnnotationContainerStyle()).toBe(getAnnotationContainerStyle());
    });
  });

  describe("groupAnnotationsByNodeId", () => {
    it("returns empty map for empty annotations", () => {
      const result = groupAnnotationsByNodeId(new Map());
      expect(result.size).toBe(0);
    });

    it("groups single annotation", () => {
      const ann: NodeAnnotation = {
        id: "ann-1",
        nodeId: "node-a",
        text: "hello",
      };
      const result = groupAnnotationsByNodeId(new Map([["ann-1", ann]]));
      expect(result.size).toBe(1);
      expect(result.get("node-a")).toEqual([ann]);
    });

    it("groups multiple annotations for same node", () => {
      const ann1: NodeAnnotation = {
        id: "ann-1",
        nodeId: "node-a",
        text: "first",
      };
      const ann2: NodeAnnotation = {
        id: "ann-2",
        nodeId: "node-a",
        text: "second",
      };
      const result = groupAnnotationsByNodeId(
        new Map([
          ["ann-1", ann1],
          ["ann-2", ann2],
        ]),
      );
      expect(result.size).toBe(1);
      expect(result.get("node-a")).toEqual([ann1, ann2]);
    });

    it("groups annotations for different nodes separately", () => {
      const ann1: NodeAnnotation = {
        id: "ann-1",
        nodeId: "node-a",
        text: "for A",
      };
      const ann2: NodeAnnotation = {
        id: "ann-2",
        nodeId: "node-b",
        text: "for B",
      };
      const result = groupAnnotationsByNodeId(
        new Map([
          ["ann-1", ann1],
          ["ann-2", ann2],
        ]),
      );
      expect(result.size).toBe(2);
      expect(result.get("node-a")).toEqual([ann1]);
      expect(result.get("node-b")).toEqual([ann2]);
    });

    it("preserves insertion order within a node", () => {
      const annotations = new Map<string, NodeAnnotation>();
      annotations.set("a", { id: "a", nodeId: "n1", text: "first" });
      annotations.set("b", { id: "b", nodeId: "n1", text: "second" });
      annotations.set("c", { id: "c", nodeId: "n1", text: "third" });
      const result = groupAnnotationsByNodeId(annotations);
      const group = result.get("n1");
      expect(group).toHaveLength(3);
      expect(group![0].text).toBe("first");
      expect(group![1].text).toBe("second");
      expect(group![2].text).toBe("third");
    });
  });
});
