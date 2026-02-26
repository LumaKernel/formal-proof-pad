import { describe, it, expect } from "vitest";
import {
  distanceSquared,
  findNearestPort,
  computePreviewTarget,
  buildPortCandidates,
  computePreviewStyle,
  DEFAULT_SNAP_DISTANCE,
  type PortCandidate,
  type ConnectionPreviewState,
} from "./connectionPreview";
import type { ConnectorPortOnItem } from "./connector";

describe("distanceSquared", () => {
  it("returns 0 for identical points", () => {
    expect(distanceSquared({ x: 5, y: 3 }, { x: 5, y: 3 })).toBe(0);
  });

  it("returns squared distance for horizontal separation", () => {
    expect(distanceSquared({ x: 0, y: 0 }, { x: 3, y: 0 })).toBe(9);
  });

  it("returns squared distance for vertical separation", () => {
    expect(distanceSquared({ x: 0, y: 0 }, { x: 0, y: 4 })).toBe(16);
  });

  it("returns squared distance for diagonal separation", () => {
    expect(distanceSquared({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(25);
  });

  it("handles negative coordinates", () => {
    expect(distanceSquared({ x: -1, y: -2 }, { x: 2, y: 2 })).toBe(25);
  });
});

describe("findNearestPort", () => {
  const portOnItemA: ConnectorPortOnItem = {
    port: { id: "bottom", edge: "bottom", position: 0.5 },
    itemPosition: { x: 100, y: 100 },
    itemWidth: 100,
    itemHeight: 50,
  };

  const portOnItemB: ConnectorPortOnItem = {
    port: { id: "top", edge: "top", position: 0.5 },
    itemPosition: { x: 200, y: 200 },
    itemWidth: 100,
    itemHeight: 50,
  };

  const candidateA: PortCandidate = {
    itemId: "item-a",
    portOnItem: portOnItemA,
  };

  const candidateB: PortCandidate = {
    itemId: "item-b",
    portOnItem: portOnItemB,
  };

  const candidates = [candidateA, candidateB];

  it("returns null when no candidates are within range", () => {
    const result = findNearestPort(
      { x: 0, y: 0 },
      candidates,
      DEFAULT_SNAP_DISTANCE,
      "source-item",
    );
    expect(result).toBeNull();
  });

  it("returns nearest candidate within range", () => {
    // portOnItemA bottom port is at (150, 150)
    const result = findNearestPort(
      { x: 155, y: 155 },
      candidates,
      DEFAULT_SNAP_DISTANCE,
      "source-item",
    );
    expect(result).toBe(candidateA);
  });

  it("excludes source item from candidates", () => {
    const result = findNearestPort(
      { x: 155, y: 155 },
      candidates,
      DEFAULT_SNAP_DISTANCE,
      "item-a",
    );
    expect(result).toBeNull();
  });

  it("returns closer candidate when multiple are in range", () => {
    // Create overlapping scenario
    const closeCandidate: PortCandidate = {
      itemId: "item-close",
      portOnItem: {
        port: { id: "top", edge: "top", position: 0.5 },
        itemPosition: { x: 95, y: 160 },
        itemWidth: 20,
        itemHeight: 20,
      },
    };
    // close candidate port is at (105, 160)
    const result = findNearestPort(
      { x: 105, y: 158 },
      [...candidates, closeCandidate],
      DEFAULT_SNAP_DISTANCE,
      "source-item",
    );
    expect(result).toBe(closeCandidate);
  });

  it("returns null when all candidates are excluded", () => {
    const singleCandidate = [candidateA];
    const result = findNearestPort(
      { x: 150, y: 150 },
      singleCandidate,
      DEFAULT_SNAP_DISTANCE,
      "item-a",
    );
    expect(result).toBeNull();
  });

  it("returns null for empty candidates list", () => {
    const result = findNearestPort(
      { x: 150, y: 150 },
      [],
      DEFAULT_SNAP_DISTANCE,
      "source-item",
    );
    expect(result).toBeNull();
  });
});

describe("computePreviewTarget", () => {
  const sourcePortOnItem: ConnectorPortOnItem = {
    port: { id: "bottom", edge: "bottom", position: 0.5 },
    itemPosition: { x: 0, y: 0 },
    itemWidth: 100,
    itemHeight: 50,
  };

  it("returns mouse position when not snapped", () => {
    const state: ConnectionPreviewState = {
      sourceItemId: "source",
      sourcePortOnItem,
      mouseWorldPosition: { x: 200, y: 300 },
      snappedTarget: null,
      isValid: true,
    };
    expect(computePreviewTarget(state)).toEqual({ x: 200, y: 300 });
  });

  it("returns snapped port position when snapped", () => {
    const targetPortOnItem: ConnectorPortOnItem = {
      port: { id: "top", edge: "top", position: 0.5 },
      itemPosition: { x: 180, y: 280 },
      itemWidth: 100,
      itemHeight: 50,
    };
    const state: ConnectionPreviewState = {
      sourceItemId: "source",
      sourcePortOnItem,
      mouseWorldPosition: { x: 200, y: 300 },
      snappedTarget: {
        itemId: "target",
        portOnItem: targetPortOnItem,
      },
      isValid: true,
    };
    // top port at position 0.5: x = 180 + 100 * 0.5 = 230, y = 280
    expect(computePreviewTarget(state)).toEqual({ x: 230, y: 280 });
  });
});

describe("buildPortCandidates", () => {
  it("returns empty array for empty items", () => {
    expect(buildPortCandidates([])).toEqual([]);
  });

  it("builds candidates from items with ports", () => {
    const items = [
      {
        id: "item-1",
        position: { x: 0, y: 0 },
        width: 100,
        height: 50,
        ports: [
          { id: "top", edge: "top" as const, position: 0.5 },
          { id: "bottom", edge: "bottom" as const, position: 0.5 },
        ],
      },
      {
        id: "item-2",
        position: { x: 200, y: 100 },
        width: 80,
        height: 40,
        ports: [{ id: "left", edge: "left" as const, position: 0.5 }],
      },
    ];

    const result = buildPortCandidates(items);
    expect(result).toHaveLength(3);
    expect(result[0]?.itemId).toBe("item-1");
    expect(result[0]?.portOnItem.port.id).toBe("top");
    expect(result[1]?.itemId).toBe("item-1");
    expect(result[1]?.portOnItem.port.id).toBe("bottom");
    expect(result[2]?.itemId).toBe("item-2");
    expect(result[2]?.portOnItem.port.id).toBe("left");
  });

  it("sets correct item geometry on port candidates", () => {
    const items = [
      {
        id: "item-1",
        position: { x: 50, y: 75 },
        width: 120,
        height: 60,
        ports: [{ id: "top", edge: "top" as const }],
      },
    ];

    const result = buildPortCandidates(items);
    expect(result[0]?.portOnItem).toEqual({
      port: { id: "top", edge: "top" },
      itemPosition: { x: 50, y: 75 },
      itemWidth: 120,
      itemHeight: 60,
    });
  });
});

describe("computePreviewStyle", () => {
  it("returns blue style for valid connection", () => {
    const style = computePreviewStyle(true);
    expect(style.color).toBe("#3b82f6");
    expect(style.opacity).toBe(0.6);
    expect(style.strokeDasharray).toBe("6 3");
  });

  it("returns red style for invalid connection", () => {
    const style = computePreviewStyle(false);
    expect(style.color).toBe("#ef4444");
    expect(style.opacity).toBe(0.4);
    expect(style.strokeDasharray).toBe("4 4");
  });
});

describe("DEFAULT_SNAP_DISTANCE", () => {
  it("is a positive number", () => {
    expect(DEFAULT_SNAP_DISTANCE).toBeGreaterThan(0);
  });
});
