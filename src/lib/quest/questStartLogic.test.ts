import { describe, it, expect } from "vitest";
import {
  resolveSystemPreset,
  buildQuestStartParams,
  prepareQuestStart,
} from "./questStartLogic";
import type { QuestDefinition, SystemPresetId } from "./questDefinition";
import {
  lukasiewiczSystem,
  predicateLogicSystem,
  equalityLogicSystem,
} from "../logic-core/inferenceRule";

// --- テスト用クエスト定義 ---

const testQuest: QuestDefinition = {
  id: "test-01",
  category: "propositional-basics",
  title: "テストクエスト",
  description: "テスト用",
  difficulty: 1,
  systemPresetId: "lukasiewicz",
  goals: [{ formulaText: "phi -> phi", position: { x: 300, y: 0 } }],
  hints: ["ヒント1"],
  estimatedSteps: 5,
  learningPoint: "基本",
  order: 1,
};

const testQuests: readonly QuestDefinition[] = [
  testQuest,
  {
    ...testQuest,
    id: "test-02",
    title: "述語テスト",
    systemPresetId: "predicate",
  },
  {
    ...testQuest,
    id: "test-03",
    title: "等号テスト",
    systemPresetId: "equality",
  },
];

describe("resolveSystemPreset", () => {
  it("lukasiewiczプリセットを解決できる", () => {
    const result = resolveSystemPreset("lukasiewicz");
    expect(result).toBeDefined();
    expect(result?.system).toBe(lukasiewiczSystem);
  });

  it("predicateプリセットを解決できる", () => {
    const result = resolveSystemPreset("predicate");
    expect(result).toBeDefined();
    expect(result?.system).toBe(predicateLogicSystem);
  });

  it("equalityプリセットを解決できる", () => {
    const result = resolveSystemPreset("equality");
    expect(result).toBeDefined();
    expect(result?.system).toBe(equalityLogicSystem);
  });

  it("存在しないプリセットIDはundefinedを返す", () => {
    const result = resolveSystemPreset("nonexistent" as SystemPresetId);
    expect(result).toBeUndefined();
  });
});

describe("buildQuestStartParams", () => {
  it("クエスト定義からノートブック作成パラメータを生成する", () => {
    const result = buildQuestStartParams(testQuest);
    expect(result).toBeDefined();
    expect(result?.name).toBe("テストクエスト");
    expect(result?.system).toBe(lukasiewiczSystem);
    expect(result?.goals).toEqual([
      { formulaText: "phi -> phi", position: { x: 300, y: 0 } },
    ]);
  });

  it("述語論理クエストでpredicateLogicSystemが返る", () => {
    const quest: QuestDefinition = {
      ...testQuest,
      systemPresetId: "predicate",
    };
    const result = buildQuestStartParams(quest);
    expect(result?.system).toBe(predicateLogicSystem);
  });

  it("等号クエストでequalityLogicSystemが返る", () => {
    const quest: QuestDefinition = {
      ...testQuest,
      systemPresetId: "equality",
    };
    const result = buildQuestStartParams(quest);
    expect(result?.system).toBe(equalityLogicSystem);
  });

  it("不正なプリセットIDの場合undefinedを返す", () => {
    const quest: QuestDefinition = {
      ...testQuest,
      systemPresetId: "invalid" as SystemPresetId,
    };
    const result = buildQuestStartParams(quest);
    expect(result).toBeUndefined();
  });

  it("複数ゴールのクエストでgoalsが正しく設定される", () => {
    const quest: QuestDefinition = {
      ...testQuest,
      goals: [
        { formulaText: "phi -> phi", position: { x: 0, y: 0 } },
        { formulaText: "phi -> psi -> phi", position: { x: 300, y: 0 } },
      ],
    };
    const result = buildQuestStartParams(quest);
    expect(result?.goals).toHaveLength(2);
  });
});

describe("prepareQuestStart", () => {
  it("有効なクエストIDで開始パラメータを返す", () => {
    const result = prepareQuestStart(testQuests, "test-01");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.name).toBe("テストクエスト");
      expect(result.params.system).toBe(lukasiewiczSystem);
    }
  });

  it("存在しないクエストIDでquest-not-foundエラー", () => {
    const result = prepareQuestStart(testQuests, "nonexistent");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("quest-not-found");
    }
  });

  it("不正なプリセットIDのクエストでpreset-not-foundエラー", () => {
    const quests: readonly QuestDefinition[] = [
      {
        ...testQuest,
        systemPresetId: "invalid" as SystemPresetId,
      },
    ];
    const result = prepareQuestStart(quests, "test-01");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("preset-not-found");
    }
  });

  it("述語論理クエストを正しく開始準備できる", () => {
    const result = prepareQuestStart(testQuests, "test-02");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.name).toBe("述語テスト");
      expect(result.params.system).toBe(predicateLogicSystem);
    }
  });

  it("等号クエストを正しく開始準備できる", () => {
    const result = prepareQuestStart(testQuests, "test-03");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.params.name).toBe("等号テスト");
      expect(result.params.system).toBe(equalityLogicSystem);
    }
  });

  it("空のクエスト配列でquest-not-foundエラー", () => {
    const result = prepareQuestStart([], "test-01");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("quest-not-found");
    }
  });
});
