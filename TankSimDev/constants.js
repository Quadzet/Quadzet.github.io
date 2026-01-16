export var ITEMS = {};
export var ITEM_SETS = [];

export const Wield = {
  TWOHAND: "Twohanded",
  SHIELD: "Sword and board",
  ONEHAND: "One handed",
  DUALWIELD: "Dual wield",
  UNARMED: "Unarmed",
};

export const ActorType = {
  TANK: "tank",
  BOSS: "boss",
};

export const LANDED_HITS = ["hit", "crit", "block", "crit block", "glance"];

// Attributes that can be found on buffs/debuffs/consumes.
export const ATTRIBUTES = [
  "armor", "agility", "strength", "stamina",
  "crit", "hit", "attackpower", "haste",
  "defense", "armor", "bonusArmor", "parry",
  "dodge", "block", "blockvalue", "health",
  "strengthMod", "staminaMod", "agilityMod", "damageMod", "armorMod",
];

export const MULT_ATTRIBUTES = [
  "strengthMod", "staminaMod", "agilityMod", "damageMod", "armorMod",
];

export const ABILITIES = [
  "death-wish", "revenge", "rend", "heroic-strike", "shield-block",
  "shield-slam", "bloodthirst", "mortal-strike", "sunder-armor"];

export const ITEM_SLOTS = [
  'head', 'hands', 'neck', 'waist', 'shoulder', 'legs', 'back', 'feet',
  'chest', 'wrist', 'finger1', 'finger2', 'trinket1', 'trinket2',
  'mainhand', 'offhand', 'ranged'];

export const ENCHANT_SLOTS = [
  'head', 'shoulder', 'back', 'chest', 'wrist', 'hands',
  'legs', 'feet', 'mainhand', 'offhand'];

export const ENCHANT_IDS = {
  'head': [0],
  'shoulder': [0],
  'back': [0, 13882, 13421, 13746],
  'chest': [0, 13700, 13626, 7857, 19058, 10487, 3780],
  'wrist': [0, 7428, 13646, 7779, 13536, 13501, 13661],
  'wrist': [0, 13661, 7428, 13646, 7779, 13536, 13501],
  'hands': [0, 13815, 13887, 19058, 10487, 3780], // 13948 minor haste
  'legs': [0, 19058, 10487, 3780],
  'feet': [0, 13637, 7867, 7863, 19058, 10487, 3780],
  'mainhand': [0, 13693, 13503, 7788, 435481],
  'twohand': [0, 13695, 13529, 435481], // 20030, 13937, +9, +7 damage
  'shield': [0, 13817, 13689, 13464, 13378], //, 6042], TODO: Shield Spike
};

export const BUFFS = [
  'battleshout', 'motw', 'kings', 'might', 'strtotem',
  'fort', 'bloodpact', 'devo', 'loh', 'inspiration',
  'leader', 'trueshot',
];

export const DEBUFFS = [
  'sunder', 'iea', 'faeriefire', 'cor'
];

export const CONSUMES = [
  'bloodpact', 'str-elixir', 'defense', 'agi-elixir', 'mongoose',
  'fort-elixir', 'rumsey','giant-growth',
  'dark-desire', 'stam-food', 'str-food', 'agi-food', 'str-scroll',
  'consecrated-stone', 'stone', 'shadow-oil', 'elemental-stone',
];

export const OH_BUFFS = [
  'oh-shadow-oil', 'oh-stone', 'oh-consecrated-stone', 'oh-elemental-stone'
];

export const WORLD_BUFFS = [
  'dmf', 'wcb', 'zandalar', 'dragonslayer',
  'moldar', 'fengus', 'slipkik', 'songflower',
]

export const TANK_SETTINGS = ['player-level', 'race', 'startRage'];

export const BOSS_SETTINGS = ['bossLevel', 'swingMax', 'swingMin', 'swingTimer', 'bossArmor'];

