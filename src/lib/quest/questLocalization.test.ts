/**
 * questLocalization のテスト。
 *
 * ローカライズ純粋関数の動作を検証する。
 */

import { describe, it, expect } from "vitest";
import type { QuestDefinition, QuestCategoryMeta } from "./questDefinition";
import { questCategories } from "./questDefinition";
import type { CategoryGroup, QuestCatalogItem } from "./questCatalog";
import {
  localizeQuest,
  localizeCategory,
  localizeQuests,
  localizeCategories,
  localizeCategoryGroups,
  type QuestTranslationMap,
  type CategoryTranslationMap,
} from "./questLocalization";
import { builtinQuests } from "./builtinQuests";
import {
  questTranslationsEn,
  categoryTranslationsEn,
} from "./questTranslationsEn";

// --- テスト用データ ---

const sampleQuest: QuestDefinition = {
  id: "test-01",
  category: "propositional-basics",
  title: "テスト問題",
  description: "テストの説明文。",
  difficulty: 1,
  systemPresetId: "lukasiewicz",
  goals: [{ formulaText: "phi -> phi", label: "Goal" }],
  hints: ["ヒント1", "ヒント2"],
  estimatedSteps: 5,
  learningPoint: "テストの学習ポイント。",
  order: 1,
  version: 1,
};

const sampleCategory: QuestCategoryMeta = {
  id: "propositional-basics",
  label: "命題論理の基礎",
  description: "A1, A2, A3 + MP を使った基本的な証明。",
  order: 1,
};

const questTranslations: QuestTranslationMap = {
  "test-01": {
    title: "Test Problem",
    description: "Test description.",
    hints: ["Hint 1", "Hint 2"],
    learningPoint: "Test learning point.",
  },
};

const categoryTranslations: CategoryTranslationMap = {
  "propositional-basics": {
    label: "Propositional Logic Basics",
    description: "Basic proofs using A1, A2, A3 + MP.",
  },
};

// --- localizeQuest ---

describe("localizeQuest", () => {
  it("ja ロケールではそのまま返す", () => {
    const result = localizeQuest(sampleQuest, "ja", questTranslations);
    expect(result).toBe(sampleQuest);
  });

  it("en ロケールで翻訳が適用される", () => {
    const result = localizeQuest(sampleQuest, "en", questTranslations);
    expect(result.title).toBe("Test Problem");
    expect(result.description).toBe("Test description.");
    expect(result.hints).toEqual(["Hint 1", "Hint 2"]);
    expect(result.learningPoint).toBe("Test learning point.");
  });

  it("en ロケールで翻訳が見つからない場合は日本語フォールバック", () => {
    const unknownQuest = { ...sampleQuest, id: "unknown-01" };
    const result = localizeQuest(unknownQuest, "en", questTranslations);
    expect(result).toBe(unknownQuest);
  });

  it("非テキストフィールドは保持される", () => {
    const result = localizeQuest(sampleQuest, "en", questTranslations);
    expect(result.id).toBe("test-01");
    expect(result.category).toBe("propositional-basics");
    expect(result.difficulty).toBe(1);
    expect(result.systemPresetId).toBe("lukasiewicz");
    expect(result.goals).toBe(sampleQuest.goals);
    expect(result.estimatedSteps).toBe(5);
    expect(result.order).toBe(1);
    expect(result.version).toBe(1);
  });
});

// --- localizeCategory ---

describe("localizeCategory", () => {
  it("ja ロケールではそのまま返す", () => {
    const result = localizeCategory(sampleCategory, "ja", categoryTranslations);
    expect(result).toBe(sampleCategory);
  });

  it("en ロケールで翻訳が適用される", () => {
    const result = localizeCategory(sampleCategory, "en", categoryTranslations);
    expect(result.label).toBe("Propositional Logic Basics");
    expect(result.description).toBe("Basic proofs using A1, A2, A3 + MP.");
  });

  it("en ロケールで翻訳が見つからない場合は日本語フォールバック", () => {
    const unknownCategory = { ...sampleCategory, id: "unknown" as never };
    const result = localizeCategory(
      unknownCategory,
      "en",
      categoryTranslations,
    );
    expect(result).toBe(unknownCategory);
  });

  it("非テキストフィールドは保持される", () => {
    const result = localizeCategory(sampleCategory, "en", categoryTranslations);
    expect(result.id).toBe("propositional-basics");
    expect(result.order).toBe(1);
  });
});

// --- localizeQuests ---

describe("localizeQuests", () => {
  it("ja ロケールでは同じ配列参照を返す", () => {
    const quests = [sampleQuest];
    const result = localizeQuests(quests, "ja", questTranslations);
    expect(result).toBe(quests);
  });

  it("en ロケールで各クエストを翻訳する", () => {
    const quests = [sampleQuest, { ...sampleQuest, id: "unknown-01" }];
    const result = localizeQuests(quests, "en", questTranslations);
    expect(result[0]?.title).toBe("Test Problem");
    expect(result[1]?.title).toBe("テスト問題"); // fallback
  });
});

// --- localizeCategories ---

describe("localizeCategories", () => {
  it("ja ロケールでは同じ配列参照を返す", () => {
    const categories = [sampleCategory];
    const result = localizeCategories(categories, "ja", categoryTranslations);
    expect(result).toBe(categories);
  });

  it("en ロケールで各カテゴリを翻訳する", () => {
    const categories = [sampleCategory];
    const result = localizeCategories(categories, "en", categoryTranslations);
    expect(result[0]?.label).toBe("Propositional Logic Basics");
  });
});

// --- localizeCategoryGroups ---

describe("localizeCategoryGroups", () => {
  const sampleItem: QuestCatalogItem = {
    quest: sampleQuest,
    completed: false,
    completionCount: 0,
    bestStepCount: undefined,
    rating: "not-completed",
  };

  const sampleGroup: CategoryGroup = {
    category: sampleCategory,
    items: [sampleItem],
    completedCount: 0,
    totalCount: 1,
  };

  it("ja ロケールでは同じ配列参照を返す", () => {
    const groups = [sampleGroup];
    const result = localizeCategoryGroups(
      groups,
      "ja",
      questTranslations,
      categoryTranslations,
    );
    expect(result).toBe(groups);
  });

  it("en ロケールでカテゴリとクエストの両方を翻訳する", () => {
    const groups = [sampleGroup];
    const result = localizeCategoryGroups(
      groups,
      "en",
      questTranslations,
      categoryTranslations,
    );
    expect(result[0]?.category.label).toBe("Propositional Logic Basics");
    expect(result[0]?.items[0]?.quest.title).toBe("Test Problem");
    expect(result[0]?.items[0]?.quest.description).toBe("Test description.");
  });

  it("集計フィールドは保持される", () => {
    const groups = [sampleGroup];
    const result = localizeCategoryGroups(
      groups,
      "en",
      questTranslations,
      categoryTranslations,
    );
    expect(result[0]?.completedCount).toBe(0);
    expect(result[0]?.totalCount).toBe(1);
    expect(result[0]?.items[0]?.completed).toBe(false);
    expect(result[0]?.items[0]?.rating).toBe("not-completed");
  });
});

// --- 翻訳データの整合性テスト ---

describe("questTranslationsEn 整合性", () => {
  it("全ビルトインクエストに英語翻訳が存在する", () => {
    const missingTranslations: readonly string[] = builtinQuests
      .filter((q) => questTranslationsEn[q.id] === undefined)
      .map((q) => q.id);
    expect(missingTranslations).toEqual([]);
  });

  it("翻訳のhintsの数が元のクエストと一致する", () => {
    const mismatchedHints: readonly string[] = builtinQuests
      .filter((q) => {
        const en = questTranslationsEn[q.id];
        return en !== undefined && en.hints.length !== q.hints.length;
      })
      .map((q) => q.id);
    expect(mismatchedHints).toEqual([]);
  });

  it("翻訳のtitleが空文字でない", () => {
    for (const quest of builtinQuests) {
      const en = questTranslationsEn[quest.id];
      if (en !== undefined) {
        expect(en.title.length).toBeGreaterThan(0);
      }
    }
  });

  it("翻訳のdescriptionが空文字でない", () => {
    for (const quest of builtinQuests) {
      const en = questTranslationsEn[quest.id];
      if (en !== undefined) {
        expect(en.description.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("categoryTranslationsEn 整合性", () => {
  it("全カテゴリに英語翻訳が存在する", () => {
    const missingCategories: readonly string[] = questCategories
      .filter((c) => categoryTranslationsEn[c.id] === undefined)
      .map((c) => c.id);
    expect(missingCategories).toEqual([]);
  });
});
