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

const IdSchema = v.pipe(v.string(), v.transform(Number));

const ItemSchema = v.object({
  id: IdSchema,
  name: v.pipe(v.string(), v.minLength(1)),
  image: ImageSchema,
  into: v.optional(v.array(IdSchema)),
  maps: MapSchema,
  gold: GoldSchema,
  stats: v.optional(StatsSchema),
  tags: v.array(TagLiteralSchema),
});

const initialState = {
  lolItems: [],
};

const ACTION = {
  SET_ITEMS: "set_items",
};

//@ts-ignore
function itemsReducer(state, action) {
  switch (action.type) {
    case ACTION.SET_ITEMS: {
      return { ...state, lolItems: action.dataItems };
    }
  }
  throw Error("There has been an error in reducer function");
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

          const items = Object.entries(data.data);

          console.log("items", items);

          const lolItems = items.map(([id, item]) => {
            return { ...item, id };
          });
          console.log("itemId", lolItems);

          v.parse(v.array(ItemSchema), lolItems);

          const statKeys = lolItems.flatMap((item) => {
            return Object.keys(item.stats);
          });
          const uniqueStats = new Set(statKeys);

          const tags = lolItems.flatMap((item) => {
            return item.tags;
          });
          const uniqueTags = new Set(tags);

          // dispatch({ type: "set_items", dataItems: lolItems });
        });
    }
    fetchLolItems();
  }, []);

  console.log("state", state);
  return (
    <>
      <h1>League Of Legends Shop</h1>
      {/* <div className="container">
        {state.lolItems.length > 0 ? (
          state.lolItems.map((item) => (
            <div key={item.id}>
              <p>{item.name}</p>
            </div>
          ))
        ) : (
          <p>Without items...</p>
        )}
      </div> */}
    </>
  );
}
