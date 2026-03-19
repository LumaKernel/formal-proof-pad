/**
 * クエスト・カテゴリのローカライズ純粋関数。
 *
 * デフォルト（日本語）のクエスト定義に対して、
 * 指定ロケールの翻訳データを適用する。
 *
 * 変更時は questLocalization.test.ts も同期すること。
 */

import type { Locale } from "../../i18n/config";
import type { QuestDefinition, QuestCategoryMeta } from "./questDefinition";
import type { CategoryGroup } from "./questCatalog";

// --- 翻訳データ型 ---

/** クエストの翻訳可能フィールド */
export type QuestTranslation = {
  readonly title: string;
  readonly description: string;
  readonly hints: readonly string[];
  readonly learningPoint: string;
};

/** カテゴリの翻訳可能フィールド */
export type CategoryTranslation = {
  readonly label: string;
  readonly description: string;
};

/** ロケール別の翻訳マップ型 */
export type QuestTranslationMap = Readonly<
  Record<string, QuestTranslation | undefined>
>;
export type CategoryTranslationMap = Readonly<
  Record<string, CategoryTranslation | undefined>
>;

// --- ローカライズ関数 ---

/**
 * クエスト定義のテキストフィールドをローカライズする。
 * "ja" の場合はそのまま返す。
 * "en" の場合は翻訳マップから検索し、見つからなければ日本語フォールバック。
 */
export function localizeQuest(
  quest: QuestDefinition,
  locale: Locale,
  translationMap: QuestTranslationMap,
): QuestDefinition {
  if (locale === "ja") return quest;
  const translation = translationMap[quest.id];
  if (translation === undefined) return quest;
  return {
    ...quest,
    title: translation.title,
    description: translation.description,
    hints: translation.hints,
    learningPoint: translation.learningPoint,
  };
}

/**
 * カテゴリメタデータのテキストフィールドをローカライズする。
 */
export function localizeCategory(
  category: QuestCategoryMeta,
  locale: Locale,
  translationMap: CategoryTranslationMap,
): QuestCategoryMeta {
  if (locale === "ja") return category;
  const translation = translationMap[category.id];
  if (translation === undefined) return category;
  return {
    ...category,
    label: translation.label,
    description: translation.description,
  };
}

/**
 * クエスト定義配列を一括ローカライズする。
 */
export function localizeQuests(
  quests: readonly QuestDefinition[],
  locale: Locale,
  translationMap: QuestTranslationMap,
): readonly QuestDefinition[] {
  if (locale === "ja") return quests;
  return quests.map((q) => localizeQuest(q, locale, translationMap));
}

/**
 * カテゴリ配列を一括ローカライズする。
 */
export function localizeCategories(
  categories: readonly QuestCategoryMeta[],
  locale: Locale,
  translationMap: CategoryTranslationMap,
): readonly QuestCategoryMeta[] {
  if (locale === "ja") return categories;
  return categories.map((c) => localizeCategory(c, locale, translationMap));
}

/**
 * CategoryGroup 配列を一括ローカライズする。
 * カテゴリメタデータとグループ内の各クエスト定義のテキストを変換する。
 */
export function localizeCategoryGroups(
  groups: readonly CategoryGroup[],
  locale: Locale,
  questTranslationMap: QuestTranslationMap,
  categoryTranslationMap: CategoryTranslationMap,
): readonly CategoryGroup[] {
  if (locale === "ja") return groups;
  return groups.map((group) => ({
    ...group,
    category: localizeCategory(group.category, locale, categoryTranslationMap),
    items: group.items.map((item) => ({
      ...item,
      quest: localizeQuest(item.quest, locale, questTranslationMap),
    })),
  }));
}
