import type * as v from "valibot";
import type { ItemSchema } from "~/valibot-schema";

type Item = v.InferOutput<typeof ItemSchema>;

export function getBootItems(lolItems: Item[]) {
  return lolItems.filter((item) => item.tags.includes("Boots"));
}

export function getConsumableItems(lolItems: Item[]) {
  return lolItems.filter(
    (item) =>
      item.tags.includes("Consumable") ||
      !item.stats ||
      (item.gold.base === 0 && item.gold.sell === 0),
  );
}

export function getStarterItems(lolItems: Item[]) {
  const tagsInclude = ["Lane", "Jungle"];
  const tagsExclude = ["Consumable"];

  const starterItems = lolItems
    .filter((item) => {
      return item.tags.some((tag) => tagsInclude.includes(tag));
    })
    .filter((item) => {
      return !item.tags.some((tag) => tagsExclude.includes(tag));
    })
    .filter((item) => {
      return !item.from && item.gold.base > 0;
    })
    .filter((item) => {
      return !(
        item.tags.length === 2 &&
        item.tags.includes("Damage") &&
        item.tags.includes("Lane")
      );
    });

  const uniqueStarterItems = Array.from(
    new Map(starterItems.map((item) => [item.name, item])).values(),
  );

  return uniqueStarterItems;
}

export function getBasicItems(lolItems: Item[]) {
  return lolItems
    .filter((item) => {
      return !item.from;
    })
    .filter((item) => {
      return !item.tags.includes("Boots");
    })
    .filter((item) => {
      return item.into && item.into.length >= 3;
    })
    .filter((item) => {
      return !(item.tags.includes("Mana") && item.tags.includes("ManaRegen"));
    });
}

export function getEpicItems(lolItems: Item[]) {
  return lolItems
    .filter((item) => {
      return item.depth === 2 || item.consumeOnFull === true;
    })
    .filter((item) => {
      return item.consumeOnFull === true || (item.into && item.from);
    })
    .filter((item) => {
      return !item.tags.includes("Boots");
    })
    .filter((item) => {
      return !(item.stats && item.stats.FlatHPPoolMod === 250);
    });
}

export function getLengedaryItems(lolItems: Item[]) {
  return lolItems
    .filter((item) => {
      return !item.into && item.from;
    })
    .filter((item) => {
      return item.depth === 2 || item.depth === 3;
    })
    .filter((item) => {
      return !item.tags.includes("Boots");
    });
}
