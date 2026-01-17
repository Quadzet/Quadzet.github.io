// tests/test-data-loader.js
// Node.js-compatible version of loadItemData for testing

import Papa from 'papaparse';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ITEMS, ITEM_SETS } from '../constants.js';
import { LOG_LEVEL, log_message } from '../logging.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

async function fetchTable(tableName) {
  try {
    const csvPath = join(dataDir, `${tableName}.csv`);
    const csvData = await readFile(csvPath, 'utf-8');

    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
          resolve(results.data);
        },
        error: function(error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error(`Error loading ${tableName}:`, error);
    return [];
  }
}

function getRow(table, column, id) {
  for (let r of table) if (r[column] == id) return r;
}

function getRows(table, column, id) {
  let result = [];
  for (let r of table) if (r[column] == id) result.push(r);
  return result;
}

function getValues(table, col) {
  let result = [];
  for (let r of table) result.push(r[col]);
  return result;
}

function getStat(obj, type) {
  let stat = 0;
  if (obj["StatModifier_bonusStat_0"] == type) stat += parseInt(obj["StatModifier_bonusAmount_0"]);
  if (obj["StatModifier_bonusStat_1"] == type) stat += parseInt(obj["StatModifier_bonusAmount_1"]);
  if (obj["StatModifier_bonusStat_2"] == type) stat += parseInt(obj["StatModifier_bonusAmount_2"]);
  if (obj["StatModifier_bonusStat_3"] == type) stat += parseInt(obj["StatModifier_bonusAmount_3"]);
  if (obj["StatModifier_bonusStat_4"] == type) stat += parseInt(obj["StatModifier_bonusAmount_4"]);
  if (obj["StatModifier_bonusStat_5"] == type) stat += parseInt(obj["StatModifier_bonusAmount_5"]);
  if (obj["StatModifier_bonusStat_6"] == type) stat += parseInt(obj["StatModifier_bonusAmount_6"]);
  if (obj["StatModifier_bonusStat_7"] == type) stat += parseInt(obj["StatModifier_bonusAmount_7"]);
  if (obj["StatModifier_bonusStat_8"] == type) stat += parseInt(obj["StatModifier_bonusAmount_8"]);
  if (obj["StatModifier_bonusStat_9"] == type) stat += parseInt(obj["StatModifier_bonusAmount_9"]);
  return stat;
}

var getSlot = function(id) {
  switch (id) {
    case 1: return "head";
    case 2: return "neck";
    case 3: return "shoulder";
    case 5: return "chest";
    case 6: return "waist";
    case 7: return "legs";
    case 8: return "feet";
    case 9: return "wrist";
    case 10: return "hands";
    case 11: return "finger";
    case 12: return "trinket";
    case 13: return "onehand";
    case 14: return "offhand";
    case 15: return "ranged";
    case 16: return "back";
    case 17: return "twohand";
    case 20: return "chest";
    case 21: return "mainhand";
    case 22: return "offhand";
    case 26: return "ranged";
  }
}

function getType(cl, subcl) {
  if (cl == 4) {
    switch (subcl) {
      case 0: return "Miscellaneous";
      case 1: return "Cloth";
      case 2: return "Leather";
      case 3: return "Mail";
      case 4: return "Plate";
      case 6: return "Shield";
    }
  }
  if (cl == 2) {
    switch (subcl) {
      case 0: return "Axe";
      case 1: return "Two-handed Axe";
      case 2: return "Bows";
      case 3: return "Guns";
      case 4: return "Mace";
      case 5: return "Two-handed Mace";
      case 6: return "Polearm";
      case 7: return "Sword";
      case 8: return "Two-handed Sword";
      case 10: return "Staff";
      case 13: return "Fist";
      case 14: return "Miscellaneous";
      case 15: return "Dagger";
      case 18: return "Crossbow";
      case 20: return "Fishing Pole";
    }
  }
}

const ppmExceptions = {
  13440: 3,
}

function getPPM(id) {
  let ppm = ppmExceptions[id];
  if (ppm)
    return ppm;
  return 1;
}

export async function loadTestItemData() {
  // Clear any existing data
  Object.keys(ITEMS).forEach(key => delete ITEMS[key]);
  ITEM_SETS.length = 0;

  var Items = {};
  const itemDataCSV = await fetchTable('ItemPruned');
  const itemSparseDataCSV = await fetchTable('ItemSparsePruned');
  const itemEffectData = await fetchTable('ItemEffectPruned');
  const spellEffectData = await fetchTable('SpellEffectPruned');
  const spellCategoriesData = await fetchTable('SpellCategoriesPruned');
  const spellMiscData = await fetchTable('SpellMiscPruned');
  const spellDurationData = await fetchTable('SpellDurationPruned');
  const spellNameData = await fetchTable('SpellNamePruned');
  const itemSetData = await fetchTable('ItemSet');
  const itemSetSpell = await fetchTable('ItemSetSpell');
  const shieldBlockValue = await fetchTable('ShieldBlockPruned');

  // Transform into a JSON object
  const itemSparseData = itemSparseDataCSV.reduce((result, row) => {
    let obj = { ...row };
    result[row.ID] = obj;
    return result;
  }, {});
  const itemData = itemDataCSV.reduce((result, row) => {
    let obj = { ...row };
    result[row.ID] = obj;
    return result;
  }, {});

  // itemsets
  for (let row of itemSetData) {
    let setObj = {
      setID: row['ID'],
      itemIDs: [],
      name: row['Name_lang'],
      bonuses: [],
    };
    let setID = row['ID']
    for (let i = 0; i <= 16; i++) {
      if (row['ItemID_' + i] != 0)
        setObj.itemIDs.push(row['ItemID_' + i]);
    }
    let spells = getRows(itemSetSpell, 'ItemSetID', setID);
    if (spells.length) {
      spells.forEach(spell => {
        let bonus = {
          requires: spell.Threshold
        }
        let effects = getRows(spellEffectData, 'SpellID', spell.SpellID);

        effects.forEach(e => {
          // Effect == 6 means apply_aura
          if (e.Effect == 6 && e.EffectAura == 99 && e.EffectDieSides == 1)
            bonus.attackpower = (bonus.attackpower || 0) + parseInt(e.EffectBasePoints) + 1;
          if (e.Effect == 6 && e.EffectAura == 102 && e.EffectMiscValue_0 & 32)
            bonus.attackpower = (bonus.attackpower || 0) + parseInt(e.EffectBasePoints) + 1;
          if (e.Effect == 6 && e.EffectAura == 54)
            bonus.hit = parseInt(e.EffectBasePoints) + 1;
          if (e.Effect == 6 && e.EffectAura == 52)
            bonus.crit = parseInt(e.EffectBasePoints) + 1;
          if (e.Effect == 6 && e.EffectAura == 22 && e.EffectMiscValue_0 == 1)
            bonus.armor = parseInt(e.EffectBasePoints) + 1;
          if (e.Effect == 6 && e.EffectAura == 49)
            bonus.dodge = parseInt(e.EffectBasePoints) + 1;
          if (e.Effect == 6 && e.EffectAura == 47)
            bonus.parry = parseInt(e.EffectBasePoints) + 1;
          if (e.Effect == 6 && e.EffectAura == 51)
            bonus.block = parseInt(e.EffectBasePoints) + 1;
          if (e.Effect == 6 && (e.EffectAura == 158 || e.EffectAura == 564))
            bonus.blockvalue = parseInt(e.EffectBasePoints) + 1;
          if (e.Effect == 6 && e.EffectAura == 30 && e.EffectMiscValue_0 == 95)
            bonus.defense = parseInt(e.EffectBasePoints) + 1;
          if (e.Effect == 6 && e.EffectAura == 30 && e.EffectMiscValue_0 != 95 && e.EffectMiscValue_0 != 226 && e.EffectMiscValue_0 != 393 && e.EffectMiscValue_0 != 45 && e.EffectMiscValue_0 != 46) {
            bonus.skill = parseInt(e.EffectBasePoints) + 1;
            if (bonus.skilltype == null)
              bonus.skilltype = [];
            if (e.EffectMiscValue_0 == 44) bonus.skilltype.push("Axe");
            else if (e.EffectMiscValue_0 == 173) bonus.skilltype.push("Dagger");
            else if (e.EffectMiscValue_0 == 43) bonus.skilltype.push("Sword");
            else if (e.EffectMiscValue_0 == 54) bonus.skilltype.push("Mace");
            else if (e.EffectMiscValue_0 == 172) bonus.skilltype.push("Two-handed Axe");
            else if (e.EffectMiscValue_0 == 55) bonus.skilltype.push("Two-handed Sword");
            else if (e.EffectMiscValue_0 == 160) bonus.skilltype.push("Two-handed Mace");
            else if (e.EffectMiscValue_0 == 162) bonus.skilltype.push("Fist");
            else delete bonus.skilltype;
          }
        });
        setObj.bonuses.push(bonus);
      });
    }
    ITEM_SETS.push(setObj);
  }

  // Items
  const ids = getValues(itemDataCSV, 'ID');
  for (let id of ids) {
    let obj = {
      name: "",
      slot: "",
      type: "",
      ilvl: 0,

      armor: 0,
      agility: 0,
      strength: 0,
      stamina: 0,

      crit: 0,
      hit: 0,
      attackpower: 0,

      mindmg: 0,
      maxdmg: 0,
      swingtimer: 0,

      defense: 0,
      parry: 0,
      dodge: 0,
      block: 0,
      blockvalue: 0,

      skill: 0,
      skilltype: [],
    };
    let item = itemData[`${id}`];
    let itemSparse = itemSparseData[`${id}`];
    let missing = false;

    if (!item) {
      missing = true;
      log_message(LOG_LEVEL.WARNING, "Missing item data for ID " + id + ".");
    }
    if (!itemSparse) {
      missing = true;
      log_message(LOG_LEVEL.WARNING, "Missing itemSparse data for ID " + id + ".");
    }
    if (missing)
      continue;

    obj.type = getType(item.ClassID, item.SubclassID);
    obj.slot = getSlot(item.InventoryType);
    obj.armor = parseInt(itemSparse.Resistances_0) ? itemSparse.Resistances_0 : 0;
    if (obj.type == "Shield") {
      let shieldblock = getRows(shieldBlockValue, 'Rarity', itemSparse.ItemLevel)[0];
      let blockvalue = shieldblock[itemSparse.OverallQualityID];
      obj.blockvalue = parseInt(blockvalue);
    }

    obj.strength = getStat(itemSparse, 4);
    obj.agility = getStat(itemSparse, 3);
    obj.stamina = getStat(itemSparse, 7);

    obj.ilvl = itemSparse.ItemLevel;
    obj.name = itemSparse.Display_lang;
    if (parseInt(itemSparse.ItemDelay)) obj.swingtimer = parseInt(itemSparse.ItemDelay);
    if (parseInt(itemSparse.MinDamage_0)) obj.mindmg = parseInt(itemSparse.MinDamage_0);
    if (parseInt(itemSparse.MaxDamage_0)) obj.maxdmg = parseInt(itemSparse.MaxDamage_0);
    if (parseInt(itemSparse.MinDamage_1)) obj.mindmg += parseInt(itemSparse.MinDamage_1);
    if (parseInt(itemSparse.MaxDamage_1)) obj.maxdmg += parseInt(itemSparse.MaxDamage_1);

    let spells = getRows(itemEffectData, 'ParentItemID', item.ID);
    if (spells.length) {
      spells.forEach((spell, _) => {
        let effects = getRows(spellEffectData, 'SpellID', spell.SpellID);

        if (spell.TriggerType == "1") {
          effects.forEach(e => {
            if (e.Effect == 6 && e.EffectAura == 99 && e.EffectDieSides == 1)
              obj.attackpower = (obj.attackpower || 0) + parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 102 && e.EffectMiscValue_0 & 32)
              obj.attackpower += (obj.attackpower || 0) + parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 54)
              obj.hit += parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 52)
              obj.crit += parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 22 && e.EffectMiscValue_0 == 1)
              obj.armor += parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 49)
              obj.dodge += parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 47)
              obj.parry += parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 51)
              obj.block += parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && (e.EffectAura == 158 || e.EffectAura == 564))
              obj.blockvalue += parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 30 && e.EffectMiscValue_0 == 95)
              obj.defense += parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 30 && e.EffectMiscValue_0 != 95 && e.EffectMiscValue_0 != 226 && e.EffectMiscValue_0 != 393 && e.EffectMiscValue_0 != 45 && e.EffectMiscValue_0 != 46) {
              obj.skill += parseInt(e.EffectBasePoints) + 1;
              if (obj.skilltype == null)
                obj.skilltype = [];
              else if (e.EffectMiscValue_0 == 44) obj.skilltype.push("Axe");
              else if (e.EffectMiscValue_0 == 173) obj.skilltype.push("Dagger");
              else if (e.EffectMiscValue_0 == 43) obj.skilltype.push("Sword");
              else if (e.EffectMiscValue_0 == 54) obj.skilltype.push("Mace");
              else if (e.EffectMiscValue_0 == 172) obj.skilltype.push("Two-handed Axe");
              else if (e.EffectMiscValue_0 == 55) obj.skilltype.push("Two-handed Sword");
              else if (e.EffectMiscValue_0 == 160) obj.skilltype.push("Two-handed Mace");
              else if (e.EffectMiscValue_0 == 162) obj.skilltype.push("Fist");
              else delete obj.skilltype;
            }
          });
        }

        let category = getRow(spellCategoriesData, 'SpellID', spell.SpellID);
        let misc = getRow(spellMiscData, 'SpellID', spell.SpellID);
        let proc = { id: spell.SpellID };

        if (misc != null && !(parseInt(misc.SchoolMask) & 1)) proc.magic = true;

        effects.forEach(e => {
          if (e.Effect == 2) {
            proc.dmg = parseInt(e.EffectBasePoints) + 1;
            if (e.EffectDieSides)
              proc.dmg = proc.dmg + ~~((parseInt(e.EffectDieSides) - 1) / 2);
          }
          if (e.Effect == 6 && e.EffectAura == 3) {
            proc.tick = parseInt(e.EffectBasePoints) + 1;
            proc.interval = e.EffectAuraPeriod;
            let duration = getRow(spellDurationData, 'ID', misc.DurationIndex);
            proc.duration = duration.Duration;
            if (category && category.Mechanic == 15) proc.bleed = true;
          }
          if (e.Effect == 9) {
            proc.dmg = parseInt(e.EffectBasePoints) + 1;
            if (e.EffectDieSides)
              proc.dmg = proc.dmg + ~~((parseInt(e.EffectDieSides) - 1) / 2);
            proc.coeff = 1;
          }
        });

        let triggerSpell = effects.filter(e => !!parseInt(e.EffectTriggerSpell));
        let proc2;
        if (triggerSpell.length) {
          proc2 = {};
        }
        if (proc == null && proc2 != null)
          proc = proc2;
        if (proc && (proc.spell || proc.extra || proc.dmg || proc.tick) && obj.slot !== "ranged") {
          proc.name = getRow(spellNameData, 'ID', spell.SpellID).Name_lang;
          proc.ppm = getPPM(proc.id);
          obj.proc = proc;

          // Exceptions
          if (id == 215166) delete obj.proc;
          if (id == 215114) delete obj.proc;
          if (id == 215161) delete obj.proc;
        }
      })
    }

    Items[`${id}`] = obj;
  }

  Object.assign(ITEMS, Items);
}
