// Constants used throughout the app

export const ABILITIES = ["death-wish", "revenge", "rend", "heroic-strike", "shield-block", "shield-slam", "bloodthirst", "mortal-strike", "sunder-armor"];
export const ITEM_SLOTS = ['head', 'hands', 'neck', 'waist', 'shoulder', 'legs', 'back', 'feet', 'chest', 'wrist', 'finger1', 'finger2', 'trinket1', 'trinket2', 'mainhand', 'offhand', 'ranged'];
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
