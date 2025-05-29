import { useEffect, useReducer } from "react";
import * as v from "valibot";
import "~/styles/app.css";

const GoldSchema = v.object({
  base: v.number(),
  purchasable: v.boolean(),
  sell: v.number(),
  total: v.number(),
});

const ImageSchema = v.object({
  full: v.string(),
  group: v.string(),
  h: v.number(),
  sprite: v.string(),
  w: v.number(),
  x: v.number(),
  y: v.number(),
});

const MapSchema = v.object({
  11: v.boolean(),
  12: v.boolean(),
  21: v.boolean(),
  22: v.boolean(),
  30: v.boolean(),
  33: v.boolean(),
});

const StatLiteralSchema = v.union([
  v.literal("FlatMovementSpeedMod"),
  v.literal("FlatHPPoolMod"),
  v.literal("FlatCritChanceMod"),
  v.literal("FlatMagicDamageMod"),
  v.literal("FlatMPPoolMod"),
  v.literal("FlatArmorMod"),
  v.literal("FlatSpellBlockMod"),
  v.literal("FlatPhysicalDamageMod"),
  v.literal("PercentAttackSpeedMod"),
  v.literal("PercentLifeStealMod"),
  v.literal("FlatHPRegenMod"),
  v.literal("PercentMovementSpeedMod"),
]);
const StatsSchema = v.record(StatLiteralSchema, v.number());

const TagLiteralSchema = v.union([
  v.literal("Boots"),
  v.literal("ManaRegen"),
  v.literal("HealthRegen"),
  v.literal("Health"),
  v.literal("CriticalStrike"),
  v.literal("SpellDamage"),
  v.literal("Mana"),
  v.literal("Armor"),
  v.literal("SpellBlock"),
  v.literal("LifeSteal"),
  v.literal("SpellVamp"),
  v.literal("Jungle"),
  v.literal("Damage"),
  v.literal("Lane"),
  v.literal("AttackSpeed"),
  v.literal("OnHit"),
  v.literal("Trinket"),
  v.literal("Active"),
  v.literal("Consumable"),
  v.literal("CooldownReduction"),
  v.literal("ArmorPenetration"),
  v.literal("AbilityHaste"),
  v.literal("Stealth"),
  v.literal("Vision"),
  v.literal("NonbootsMovement"),
  v.literal("Tenacity"),
  v.literal("MagicPenetration"),
  v.literal("Aura"),
  v.literal("Slow"),
  v.literal("MagicResist"),
  v.literal("GoldPer"),
]);

const ItemSchema = v.object({
  id: v.pipe(v.string(), v.transform(Number)),
  name: v.pipe(v.string(), v.minLength(1)),
  image: ImageSchema,
  into: v.optional(v.array(v.pipe(v.string(), v.transform(Number)))),
  maps: MapSchema,
  gold: GoldSchema,
  stats: v.optional(StatsSchema),
  tags: v.array(TagLiteralSchema),
  from: v.optional(v.array(v.pipe(v.string(), v.transform(Number)))),
  depth: v.optional(v.number()),
  consumed: v.optional(v.boolean()),
  consumeOnFull: v.optional(v.boolean()),
});
type Item = v.InferOutput<typeof ItemSchema>;

const ItemDetailsSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  image: ImageSchema,
  into: v.optional(v.array(v.string())),
  maps: MapSchema,
  gold: GoldSchema,
  stats: v.optional(StatsSchema),
  tags: v.array(TagLiteralSchema),
  from: v.optional(v.array(v.string())),
  depth: v.optional(v.number()),
  consumeOnFull: v.optional(v.boolean()),
});

const GroupSchema = v.object({
  id: v.string(),
  MaxGroupOwnable: v.string(),
});
type Group = v.InferOutput<typeof GroupSchema>;

const ItemsResponseSchema = v.object({
  type: v.literal("item"),
  version: v.string(),
  basic: v.any(),
  data: v.record(v.string(), ItemDetailsSchema),
  groups: v.array(GroupSchema),
  tree: v.array(v.any()),
});

const DataSchema = v.tuple([v.string(), ItemDetailsSchema]);

const initialState = {
  lolItems: [],
};

const ACTION = {
  SET_ITEMS: "set_items",
} as const;

type State = { lolItems: Item[] };

type Action = { type: "set_items"; dataItems: Item[] };

function itemsReducer(state: State, action: Action) {
  switch (action.type) {
    case ACTION.SET_ITEMS: {
      return { ...state, lolItems: action.dataItems };
    }
  }
}

export default function () {
  const [state, dispatch] = useReducer(itemsReducer, initialState);

  useEffect(() => {
    async function fetchLolItems() {
      return await fetch(
        "https://ddragon.leagueoflegends.com/cdn/14.19.1/data/en_US/item.json",
      )
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log("DATA", data);
          const itemsData = v.parse(ItemsResponseSchema, data);

          const dataSchema = v.parse(
            v.array(DataSchema),
            Object.entries(itemsData.data),
          );

          const lolItemsId = dataSchema.map(([id, item]) => {
            return { ...item, id };
          });

          const CHAMPION_EXClUSIVE_ITEM_IDS = [
            3599, 3600, 3330, 3901, 3902, 3903,
          ];
          const OBSIDIAN_EDGE_ID = 1040;
          const SHATTERED_GUARD_ID = 2421;

          const FILTER_ID = [
            ...CHAMPION_EXClUSIVE_ITEM_IDS,
            OBSIDIAN_EDGE_ID,
            SHATTERED_GUARD_ID,
          ];

          const lolItems = v
            .parse(v.array(ItemSchema), lolItemsId)
            .filter(
              (item) =>
                item.maps[11] === true &&
                item.gold.purchasable === true &&
                !FILTER_ID.includes(item.id),
            )
            .sort((a, b) => a.gold.total - b.gold.total);

          dispatch({ type: "set_items", dataItems: lolItems });
        });
    }
    fetchLolItems();
  }, []);

  const boots = filterBoots(state.lolItems);
  const consumables = filterConsumables(state.lolItems);
  const starters = filterStarter(state.lolItems);
  const basics = filterBasic(state.lolItems);
  const epics = filterEpic(state.lolItems);
  const legendaries = filterLengedary(state.lolItems);

  return (
    <>
      <h1>League Of Legends Shop</h1>
      <div className="container">
        {state.lolItems.length > 0 ? (
          <>
            {/* <h2>Boots</h2>
            <ul>{boots.map((item) => Card(item))}</ul>

            <h2>Consumable</h2>
            <ul>{consumables.map((item) => Card(item))}</ul> */}

            <h2>Starter</h2>
            <ul>{starters.map((item) => Card(item))}</ul>

            {/* <h2>Basic</h2>
            <ul>{basics.map((item) => Card(item))}</ul>

            <h2>Epic</h2>
            <ul>{epics.map((item) => Card(item))}</ul>

            <h2>Legendary</h2>
            <ul>{legendaries.map((item) => Card(item))}</ul> */}
          </>
        ) : (
          <p>Without items...</p>
        )}
      </div>
    </>
  );
}

function Card(item: Item) {
  return (
    <li key={item.id} className="item-card">
      <section>
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/14.19.1/img/item/${item.image.full}`}
          alt={item.name}
        />
        <p className="item-name">{item.name}</p>
        <p className="item-gold">
          <b>{item.gold.total}</b>
        </p>
      </section>
    </li>
  );
}

function filterBoots(lolItems: Item[]) {
  return lolItems.filter((item) => item.tags.includes("Boots"));
}

function filterConsumables(lolItems: Item[]) {
  return lolItems.filter(
    (item) =>
      item.tags.includes("Consumable") ||
      !item.stats ||
      (item.gold.base === 0 && item.gold.sell === 0),
  );
}

function filterStarter(lolItems: Item[]) {
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
    });

  const uniqueStarterItems = Array.from(
    new Map(starterItems.map((item) => [item.name, item])).values(),
  );

  return uniqueStarterItems;
}

function filterBasic(lolItems: Item[]) {
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

function filterEpic(lolItems: Item[]) {
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

function filterLengedary(lolItems: Item[]) {
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
