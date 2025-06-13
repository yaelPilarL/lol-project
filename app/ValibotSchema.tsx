import * as v from "valibot";

export const GoldSchema = v.object({
  base: v.number(),
  purchasable: v.boolean(),
  sell: v.number(),
  total: v.number(),
});

export const ImageSchema = v.object({
  full: v.string(),
  group: v.string(),
  h: v.number(),
  sprite: v.string(),
  w: v.number(),
  x: v.number(),
  y: v.number(),
});

export const MapSchema = v.object({
  11: v.boolean(),
  12: v.boolean(),
  21: v.boolean(),
  22: v.boolean(),
  30: v.boolean(),
  33: v.boolean(),
});

export const StatLiteralSchema = v.union([
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
export const StatsSchema = v.record(StatLiteralSchema, v.number());

export const TagLiteralSchema = v.union([
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

export const ItemSchema = v.object({
  id: v.number(),
  name: v.pipe(v.string(), v.minLength(1)),
  image: ImageSchema,
  into: v.optional(v.array(v.number())),
  maps: MapSchema,
  gold: GoldSchema,
  stats: v.optional(StatsSchema),
  tags: v.array(TagLiteralSchema),
  from: v.optional(v.array(v.number())),
  depth: v.optional(v.number()),
  consumed: v.optional(v.boolean()),
  consumeOnFull: v.optional(v.boolean()),
});

export const ItemDetailsSchema = v.object({
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

export const GroupSchema = v.object({
  id: v.string(),
  MaxGroupOwnable: v.string(),
});

export const ItemsResponseSchema = v.object({
  type: v.literal("item"),
  version: v.string(),
  basic: v.any(),
  data: v.record(v.string(), ItemDetailsSchema),
  groups: v.array(GroupSchema),
  tree: v.array(v.any()),
});

export const DataSchema = v.tuple([v.string(), ItemDetailsSchema]);
