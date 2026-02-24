import { describe, expect, it } from "vitest";
import {
  computePortEndpoint,
  computePortPosition,
  DEFAULT_PORTS,
  findPort,
  type ConnectorPort,
  type ConnectorPortOnItem,
} from "./connector";

describe("computePortPosition", () => {
  const baseItem = {
    itemPosition: { x: 100, y: 200 },
    itemWidth: 120,
    itemHeight: 60,
  };

  it("computes top edge center (default position 0.5)", () => {
    const portOnItem: ConnectorPortOnItem = {
      port: { id: "top", edge: "top" },
      ...baseItem,
    };
    const pos = computePortPosition(portOnItem);
    expect(pos).toEqual({ x: 160, y: 200 });
  });

  it("computes bottom edge center", () => {
    const portOnItem: ConnectorPortOnItem = {
      port: { id: "bottom", edge: "bottom", position: 0.5 },
      ...baseItem,
    };
    const pos = computePortPosition(portOnItem);
    expect(pos).toEqual({ x: 160, y: 260 });
  });

  it("computes left edge center", () => {
    const portOnItem: ConnectorPortOnItem = {
      port: { id: "left", edge: "left", position: 0.5 },
      ...baseItem,
    };
    const pos = computePortPosition(portOnItem);
    expect(pos).toEqual({ x: 100, y: 230 });
  });

  it("computes right edge center", () => {
    const portOnItem: ConnectorPortOnItem = {
      port: { id: "right", edge: "right", position: 0.5 },
      ...baseItem,
    };
    const pos = computePortPosition(portOnItem);
    expect(pos).toEqual({ x: 220, y: 230 });
  });

  it("computes top edge at position 0.0 (left corner)", () => {
    const portOnItem: ConnectorPortOnItem = {
      port: { id: "top-left", edge: "top", position: 0 },
      ...baseItem,
    };
    const pos = computePortPosition(portOnItem);
    expect(pos).toEqual({ x: 100, y: 200 });
  });

  it("computes top edge at position 1.0 (right corner)", () => {
    const portOnItem: ConnectorPortOnItem = {
      port: { id: "top-right", edge: "top", position: 1 },
      ...baseItem,
    };
    const pos = computePortPosition(portOnItem);
    expect(pos).toEqual({ x: 220, y: 200 });
  });

  it("computes right edge at position 0.25 (near top)", () => {
    const portOnItem: ConnectorPortOnItem = {
      port: { id: "right-quarter", edge: "right", position: 0.25 },
      ...baseItem,
    };
    const pos = computePortPosition(portOnItem);
    expect(pos).toEqual({ x: 220, y: 215 });
  });

  it("computes bottom edge at position 0.75", () => {
    const portOnItem: ConnectorPortOnItem = {
      port: { id: "bottom-3q", edge: "bottom", position: 0.75 },
      ...baseItem,
    };
    const pos = computePortPosition(portOnItem);
    expect(pos).toEqual({ x: 190, y: 260 });
  });
});

describe("computePortEndpoint", () => {
  it("returns position and direction for a port", () => {
    const portOnItem: ConnectorPortOnItem = {
      port: { id: "right", edge: "right", position: 0.5 },
      itemPosition: { x: 0, y: 0 },
      itemWidth: 100,
      itemHeight: 50,
    };
    const endpoint = computePortEndpoint(portOnItem);
    expect(endpoint.position).toEqual({ x: 100, y: 25 });
    expect(endpoint.direction).toBe("right");
  });

  it("returns direction matching the port edge", () => {
    const portOnItem: ConnectorPortOnItem = {
      port: { id: "top", edge: "top" },
      itemPosition: { x: 10, y: 20 },
      itemWidth: 80,
      itemHeight: 40,
    };
    const endpoint = computePortEndpoint(portOnItem);
    expect(endpoint.direction).toBe("top");
    expect(endpoint.position).toEqual({ x: 50, y: 20 });
  });
});

describe("DEFAULT_PORTS", () => {
  it("has exactly 4 ports", () => {
    expect(DEFAULT_PORTS).toHaveLength(4);
  });

  it("contains one port for each edge", () => {
    const edges = DEFAULT_PORTS.map((p) => p.edge);
    expect(edges).toContain("top");
    expect(edges).toContain("right");
    expect(edges).toContain("bottom");
    expect(edges).toContain("left");
  });

  it("all ports are centered (position 0.5)", () => {
    for (const port of DEFAULT_PORTS) {
      expect(port.position).toBe(0.5);
    }
  });
});

describe("findPort", () => {
  const ports: readonly ConnectorPort[] = [
    { id: "in", edge: "left", position: 0.5 },
    { id: "out-1", edge: "right", position: 0.3 },
    { id: "out-2", edge: "right", position: 0.7 },
  ];

  it("finds a port by id", () => {
    const port = findPort(ports, "out-1");
    expect(port).toEqual({ id: "out-1", edge: "right", position: 0.3 });
  });

  it("returns undefined for unknown id", () => {
    const port = findPort(ports, "nonexistent");
    expect(port).toBeUndefined();
  });

  it("finds the first matching port", () => {
    const port = findPort(ports, "in");
    expect(port?.edge).toBe("left");
  });
});
