"use strict";

import { BUFF_DATA, DEBUFF_DATA, WORLD_BUFF_DATA, CONSUMES_DATA, OH_BUFF_DATA } from './buffs.js';
import { ITEM_SLOTS, ABILITIES, ENCHANT_SLOTS, ENCHANT_IDS} from './constants.js';
import { ENCHANT_DATA } from './stats.js';
import { LOG_LEVEL, log_message } from './logging.js';
import { formatEvent } from './eventHelpFuncs.js';
import { createTalentTrees, loadTalents, getTalents } from './talents.js';
import { getTalentValue, updateStats } from './config.js';

function sleep(ms) {
  return new Promise((r) =>
    setTimeout(r, ms));
}

function average(array) {
  if (array) return array.reduce((a, b) => a + b) / array.length;
  else return 0;
};

function linspace(start, end, length = Math.max(Math.round(end - start) + 1, 1)) {
  if (length < 2) { return length === 1 ? [start] : []; }
  var i, ret = Array(length);
  length--;
  for (i = length; i >= 0; i--) { ret[i] = (i * end + (length - i) * start) / length; }
  return ret;
}

const asc = arr => arr.sort((a, b) => a - b);

// sample standard deviation
const std = (arr) => {
  const mu = average(arr);
  const diffArr = arr.map(a => (a - mu) ** 2);
  return Math.sqrt(diffArr.reduce((a, b) => a + b) / (arr.length - 1));
};

const quantile = (arr, q) => {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

function getAmount(event, ability, type) {
  if (event[`${type}`] && event.ability == ability) return event[`${type}`];
  else return 0;
}

function refreshLinks() {
  let links = document.getElementsByTagName('a');
  Array.from(links).forEach(link => {
    link.classList.remove('q1');
    link.classList.remove('q2');
    link.classList.remove('q3');
    link.classList.remove('q4');
  })
  window.$WowheadPower.refreshLinks();
  Array.from(links).forEach(link => {
    link.classList.remove('q1');
  })
}

// Fill the progressbar
async function updateProgressbar(progressPerc) {
  document.querySelector("#progressBar").style.width = `${progressPerc}%`;
  await sleep(0);
}

// TODO: move this to a data file
const BUFFS = [
  'battleshout', 'motw', 'kings', 'might', 'strtotem',
  'fort', 'bloodpact', 'devo', 'loh', 'inspiration', 'str', 'defense',
  'fort-elixir', 'shadow-oil', 'rumsey', 'oh-shadow-oil',
  'dmf', 'wcb', 'zandalar', 'dragonslayer',
  'moldar', 'fengus', 'slipkik', 'songflower', 'sunder', 'iea',
  'faeriefire', 'cor', 'agi', 'giants',
  'dark-desire', 'stam-food', 'str-scroll', 'leader', 'trueshot'];
const TANK_SETTINGS = ['player-level', 'race', 'startRage'];
const BOSS_SETTINGS = ['bossLevel', 'swingMax', 'swingMin', 'swingTimer', 'bossArmor'];
const TALENTS = [
  'deflection', 'cruelty', 'anticipation', 'shield-spec', 'toughness', 'impHS',
  'impSA', 'impRend', 'impale', 'defiance', 'enrage', 'deep-wounds'];

export var ITEMS = {};
export var ITEM_SETS = [];

export function updateRotation(globals) {
  let element = document.getElementById('rotation-death-wish');
  if (getTalentValue('death-wish') > 0)
    element.style.display = 'flex';
  else
    element.style.display = 'none';

  element = document.getElementById('rotation-mortal-strike');
  if (getTalentValue('mortal-strike') > 0)
    element.style.display = 'flex';
  else
    element.style.display = 'none';

  element = document.getElementById('rotation-shield-slam');
  if (getTalentValue('shield-slam') > 0)
    element.style.display = 'flex';
  else
    element.style.display = 'none';

  element = document.getElementById('rotation-shield-block');
  if (!globals.tankStats.dualWield && !globals.tankStats.twohand)
    element.style.display = 'flex';
  else
    element.style.display = 'none';

  element = document.getElementById('rotation-bloodthirst');
  if (getTalentValue('bloodthirst') > 0)
    element.style.display = 'flex';
  else
    element.style.display = 'none';
}

function toggleAura(event, id, exclusives) {
  event.preventDefault();
  const element = document.getElementById(id + '-aura-img');
  element.classList.toggle('aura-toggle-active');
  if (exclusives != null && element.classList.contains('aura-toggle-active')) {
    exclusives.forEach(name => {
      var exElement = document.getElementById(name + '-aura-img');
      exElement.classList.remove('aura-toggle-active');
    });
  }
  let globals = updateStats();
  updateRotation(globals);
}

async function fetchTable(tableName) {
  let parsedData = [];
  try {
    // Check if Papa Parse is available
    if (typeof window.Papa === 'undefined') {
      console.error('Papa Parse is not loaded yet');
      return parsedData;
    }

    const response = await fetch('./data/' + tableName + '.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} for ${tableName}.csv`);
    }
    const csvData = await response.text();

    // Parse the CSV content using window.Papa to ensure we get the global
    parsedData = await new Promise((resolve, reject) => {
      window.Papa.parse(csvData, {
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
  }
  return parsedData;
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

async function loadItemData() {
  // const ids = [].concat(...Object.values(ITEM_IDS));

  var Items = {};
  const itemDataCSV = await fetchTable('ItemPruned');
  const itemSparseDataCSV = await fetchTable('ItemSparsePruned');
  const itemEffectData = await fetchTable('ItemEffectPruned');
  const spellEffectData = await fetchTable('SpellEffectPruned');
  const spellCategoriesData = await fetchTable('SpellCategoriesPruned'); // TODO: prune
  const spellMiscData = await fetchTable('SpellMiscPruned'); // TODO prune
  const spellDurationData = await fetchTable('SpellDurationPruned'); // TODO Prune
  const spellNameData = await fetchTable('SpellNamePruned'); // TODO prune
  const itemSetData = await fetchTable('ItemSet'); // TODO prune
  const itemSetSpell = await fetchTable('ItemSetSpell'); // TODO prune
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
          // TODO: str/agi/stam/armor/health etc(?)
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
            // TODO: remaining wep types
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
    obj.slot = getSlot(item.InventoryType); // Not needed atm, but useful if I ever merge the item ID arrays
    obj.armor = parseInt(itemSparse.Resistances_0) ? itemSparse.Resistances_0 : 0;
    if (obj.type == "Shield") {
      let shieldblock = getRows(shieldBlockValue, 'Rarity', itemSparse.ItemLevel)[0];
      let blockvalue = shieldblock[itemSparse.OverallQualityID];
      obj.blockvalue = parseInt(blockvalue);
    }

    obj.strength = getStat(itemSparse, 4);
    obj.agility = getStat(itemSparse, 3);
    obj.stamina = getStat(itemSparse, 7);

    obj.ilvl = itemSparse.ItemLevel; // Might be good for sorting
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

        if (spell.TriggerType == "1") { // Only care about on_equip
          effects.forEach(e => {
            // Effect == 6 means apply_aura
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
              // TODO: remaining wep types
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

        // Physical <=> schoolmask == 0x1
        if (misc != null && !(parseInt(misc.SchoolMask) & 1)) proc.magic = true;

        effects.forEach(e => {
          // direct dmg
          if (e.Effect == 2) {
            proc.dmg = parseInt(e.EffectBasePoints) + 1;
            // Average out any random component to the dmg
            if (e.EffectDieSides)
              proc.dmg = proc.dmg + ~~((parseInt(e.EffectDieSides) - 1) / 2);
          }
          // dot
          if (e.Effect == 6 && e.EffectAura == 3) {
            proc.tick = parseInt(e.EffectBasePoints) + 1;
            proc.interval = e.EffectAuraPeriod;
            let duration = getRow(spellDurationData, 'ID', misc.DurationIndex);
            proc.duration = duration.Duration;
            if (category && category.Mechanic == 15) proc.bleed = true;
          }
          // leech
          if (e.Effect == 9) {
            proc.dmg = parseInt(e.EffectBasePoints) + 1;
            // Average out any random component to the dmg
            if (e.EffectDieSides)
              proc.dmg = proc.dmg + ~~((parseInt(e.EffectDieSides) - 1) / 2);
            proc.coeff = 1;
          }
        });

        let triggerSpell = effects.filter(e => !!parseInt(e.EffectTriggerSpell));
        let proc2;
        if (triggerSpell.length) {
          proc2 = {}; //TODO: create proc from triggerSpell[0].EffectTriggerSpell
        }
        if (proc == null && proc2 != null)
          proc = proc2;
        if (proc && (proc.spell || proc.extra || proc.dmg || proc.tick) && obj.slot !== "ranged") {
          proc.name = getRow(spellNameData, 'ID', spell.SpellID).Name_lang;
          proc.ppm = getPPM(proc.id);
          obj.proc = proc;

          // Glowing Gneuro-Linked Cowl 'procs' itself and does dmg to boss...
          if (id == 215166) delete obj.proc;
          if (id == 215114) delete obj.proc;
          if (id == 215161) delete obj.proc;

        }
      }
      )
    }

    // TODO: of the tiger etc, striking

    Items[`${id}`] = obj;

  }
  ITEMS = Items;
}

function addEventListeners() {
  ITEM_SLOTS.forEach(slot => {
    const element = document.getElementById(slot + '-slot');
    element.addEventListener('click', function(event) {
      event.preventDefault();
    })
  });
  ENCHANT_SLOTS.forEach(slot => {
    const element = document.getElementById(slot + '-enchant');
    element.addEventListener('click', function(event) {
      event.preventDefault();
    })
  });

  document.body.addEventListener('click', function(event) {
    // Check if the clicked element is not part of the dropdown
    // if (!event.target.closest('.gear-slot')) {
    if (!event.target.closest('.dropdown-content')) {
      ITEM_SLOTS.forEach(slot => {
        hideItemDropdown(slot);
      });
      ENCHANT_SLOTS.forEach(slot => {
        hideEnchantDropdown(slot);
      });
    }
  });
  window.addEventListener('click', function(event) {
    const element = document.getElementById('profiles')
    if (event.target === element) {
      hideProfiles();
    }
  })
}

function get_index(buff, level) {
  let ix = -1;
  for (let i = 0; i < buff['levels'].length; i++) {
    if (buff['levels'][i] < level)
      ix = i
    else
      break
  }
  return ix
}

function createAuraRow(data, level) {
  let aura_row = ''
  Object.keys(data).forEach(buff => {
    let ix = get_index(data[`${buff}`], level)

    let type = data[`${buff}`]['type'].toLowerCase()
    let id = data[`${buff}`]['ids'][ix]
    aura_row += `
          <div class="aura-toggle" id="${data}-aura">
            <a href="https://classic.wowhead.com/${type}=${id}" data-wh-rename-link="false" onclick="toggleAura(event, '${buff}')">
              <img class="aura-toggle-default" src="img/${buff}.jpg" id="${buff}-aura-img" active="false">
            </a>
          </div>`
  })
  return aura_row
}

function createAuraRows() {
  let level = document.getElementById("player-level").value

  let element = document.getElementById("aura-row-buffs")
  element.innerHTML = createAuraRow(BUFF_DATA, level)

  element = document.getElementById("aura-row-oh-wep-buffs")
  element.innerHTML = createAuraRow(OH_BUFF_DATA, level)

  element = document.getElementById("aura-row-consumes")
  element.innerHTML = createAuraRow(CONSUMES_DATA, level)

  element = document.getElementById("aura-row-world-buffs")
  element.innerHTML = createAuraRow(WORLD_BUFF_DATA, level)

  element = document.getElementById("aura-row-debuffs")
  element.innerHTML = createAuraRow(DEBUFF_DATA, level)
}

function showEnchantDropdown(event, slot) {
  event.preventDefault();
  event.stopPropagation();
  const dropdown = document.getElementById(slot + '-enchant-dropdown-content');
  const dropdowns = document.getElementsByClassName('dropdown-content')

  let enchantSlot = slot
  // Select correct enchant list depending on 2h, mh, oh or shield
  if (enchantSlot == 'mainhand' || enchantSlot == 'offhand' || enchantSlot == 'onehand') {
    var gearElement = document.getElementById(enchantSlot + '-slot');
    let itemID = gearElement.getAttribute('itemid');
    if (ITEMS[`${itemID} `].slot == "twohand") enchantSlot = 'twohand';
    else if (['offhand', 'onehand'].includes(ITEMS[`${itemID} `].slot) && ITEMS[`${itemID} `].type == "Shield") enchantSlot = 'shield';
    else if (['offhand', 'onehand'].includes(ITEMS[`${itemID} `].slot)) enchantSlot = 'mainhand';
  }
  // Clear any existing content
  dropdown.innerHTML = '';

  // Create a link for each id in the array
  ENCHANT_IDS[enchantSlot].forEach(id => {
    const link = document.createElement('a');
    if (id != 0)
      link.href = `https://www.wowhead.com/classic/spell=${id}`;
    else
      link.innerHTML = `${ENCHANT_DATA[`${id}`].name}`;

    link.addEventListener('click', function(event) {
      event.preventDefault();
      selectEnchant(id, slot);
      hideEnchantDropdown(slot);
      updateStats();
    })
    dropdown.appendChild(link);
  });

  // Hide any already opened dropdown
  for (let i = 0; i < dropdowns.length; i++) {
    dropdowns.item(i).style.display = 'none';
  }
  dropdown.style.display = 'block';
  refreshLinks();
}

function hideEnchantDropdown(slot) {
  const dropdown = document.getElementById(slot + '-enchant-dropdown-content');
  dropdown.style.display = 'none';
}

function generateGearList(slot) {
  const dropdownContent = document.getElementById(slot + '-slot-dropdown-content');
  const dropdownList = document.getElementById(slot + '-dropdown-gear-list');
  dropdownList.innerHTML = ''; // Reset current list if any

  // Filters
  const allowedSlots = [];
  const filterSlots = ['twohand', 'onehand', 'mainhand', 'offhand'];
  filterSlots.forEach(filter => {
    if (document.getElementById(slot + '-filter-' + filter) && document.getElementById(slot + '-filter-' + filter).checked)
      allowedSlots.push(filter);
  });

  const bannedTypes = [];
  const filterTypes = ['Shield', 'Plate', 'Mail', 'Leather'];
  filterTypes.forEach(filter => {
    if (document.getElementById(slot + '-filter-' + filter) && !document.getElementById(slot + '-filter-' + filter).checked) {
      bannedTypes.push(filter);
    }
  });

  let filterString;
  if (document.getElementById(slot + '-dropdown-search'))
    filterString = document.getElementById(slot + '-dropdown-search').value;


  // Add an Unequip option
  var unequip = document.createElement('a');
  unequip.href = '#';
  unequip.id = '0';
  var span = document.createElement('span');
  var spanText = document.createTextNode('Unequip');
  span.appendChild(spanText);
  unequip.appendChild(span);
  unequip.addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    selectItem('0', slot);
    hideItemDropdown(slot);
    let globals = updateStats();
    updateRotation(globals);
  });
  dropdownList.appendChild(unequip);

  let slotFilter = slot
  if (slot == 'finger1' || slot == 'finger2')
    slotFilter = 'finger';
  if (slot == 'trinket1' || slot == 'trinket2')
    slotFilter = 'trinket';
  if (!(document.getElementById(slot + '-filter-' + slotFilter) && !document.getElementById(slot + '-filter-' + slotFilter).checked))
    allowedSlots.push(slotFilter);

  // Create a link for each id in the array
  let allowShields = document.getElementById(slot + '-filter-Shield') && document.getElementById(slot + '-filter-Shield').checked;
  let slotItemIDs = []
  Object.keys(ITEMS).forEach(id => {
    if (!allowedSlots.includes(ITEMS[`${id}`].slot)) {
      if (!(ITEMS[`${id}`].type == 'Shield' && allowShields)) { // If it's a shield, only filter if the type Shield is banned. Otherwise slot offhand removes both oh weps and shields
        return;
      }
    }
    if (bannedTypes.includes(ITEMS[`${id}`].type))
      return;
    if (filterString != null)
      if (!ITEMS[`${id}`].name.toLowerCase().includes(filterString.toLowerCase()))
        return;
    slotItemIDs.push(id);
  });

  slotItemIDs.sort((a, b) => ITEMS[`${b}`].ilvl - ITEMS[`${a}`].ilvl);
  slotItemIDs.forEach(id => {
    const link = document.createElement('a');
    link.href = `https://www.wowhead.com/classic/item=${id}`;

    link.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      selectItem(id, slot);
      hideItemDropdown(slot);
      let globals = updateStats();
      updateRotation(globals);
    })
    dropdownList.appendChild(link);
  });
  dropdownContent.appendChild(dropdownList);
  refreshLinks();
}

function showItemDropdown(event, slot) {
  event.preventDefault();
  event.stopPropagation();
  var dropdownContent = document.getElementById(slot + '-slot-dropdown-content');

  dropdownContent.innerHTML = `<input type="text" class="gear-dropdown-search" id="${slot}-dropdown-search" oninput="generateGearList('${slot}')" placeholder="Search..."></input>`;
  if (slot == "mainhand")
    dropdownContent.innerHTML += `
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-twohand" checked="true" onclick="generateGearList('${slot}')">Twohand</input>
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-mainhand" checked="true" onclick="generateGearList('${slot}')">Mainhand</input>
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-onehand" checked="true" onclick="generateGearList('${slot}')">Onehand</input>
        `
  else if (slot == "offhand")
    dropdownContent.innerHTML += `
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-offhand" checked="true" onclick="generateGearList('${slot}')">Offhand</input>
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-onehand" checked="true" onclick="generateGearList('${slot}')">Onehand</input>
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-Shield" checked="true" onclick="generateGearList('${slot}')">Shield</input>
        `;
  else if (['head', 'shoulder', 'chest', 'wrist', 'legs', 'feet', 'hands', 'waist'].includes(slot))
    dropdownContent.innerHTML += `
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-Leather" checked="true" onclick="generateGearList('${slot}')">Leather</input>
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-Mail" checked="true" onclick="generateGearList('${slot}')">Mail</input>
        <input type="checkbox" class="dropdown-filter-checkbox" id="${slot}-filter-Plate" checked="true" onclick="generateGearList('${slot}')">Plate</input>
        `;
  const dropdownList = document.createElement('div');
  dropdownList.classList.add('gear-dropdown-list');
  dropdownList.setAttribute('id', slot + '-dropdown-gear-list')
  dropdownContent.appendChild(dropdownList);
  generateGearList(slot);

  const dropdown = document.getElementById(slot + '-slot-dropdown-content');
  const dropdowns = document.getElementsByClassName('dropdown-content')
  // Hide any already opened dropdown
  for (let i = 0; i < dropdowns.length; i++) {
    dropdowns.item(i).style.display = 'none';
  }
  dropdown.style.display = 'block';
}

function hideItemDropdown(slot) {
  const dropdown = document.getElementById(slot + '-slot-dropdown-content');
  dropdown.style.display = 'none';
}

const GEAR_ROWS = [['head', 'hands'], ['neck', 'waist'], ['shoulder', 'legs'], ['back', 'feet'], ['chest', 'finger1'], ['wrist', 'finger2'], ['mainhand', 'trinket1'], ['offhand', 'trinket2'], ['ranged']];
const RIGHT_SLOTS = ['hands', 'waist', 'legs', 'feet', 'finger1', 'finger2', 'trinket1', 'trinket2'];
function createGearRows() {
  const gearSelect = document.getElementById('gear-select');
  GEAR_ROWS.forEach(row => {
    if (row.length == 2) {
      const element = document.createElement('div');
      element.classList.add('gear-row');
      element.style.display = 'flex';
      element.innerHTML = `
        <div>
          <div class="gear-slot gear-slot-left" id="${row[0]}-slot" >
            <img id="${row[0]}-slot-img" itemId='0' src="img/${row[0]}.jpg" onclick="showItemDropdown(event, '${row[0]}')"/>
            <div id="${row[0]}-slot-icon" class="slot-icon" onclick="showItemDropdown(event, '${row[0]}')"></div>
            <div class="slot-text" id="${row[0]}-slot-text">
              <a class="gear-text" id="${row[0]}-text" onclick="showItemDropdown(event, '${row[0]}')"></a>
              <a onclick="showEnchantDropdown(event, '${row[0]}')" class="gear-enchant" id="${row[0]}-enchant" data-wh-rename-link="false" href="#">${ENCHANT_SLOTS.includes(row[0]) ? 'Add Enchant' : ''}</a>
            </div>
          </div>
          <div id="${row[0]}-slot-dropdown-content" class="dropdown-content"></div>
          <div id="${row[0]}-enchant-dropdown-content" class="dropdown-content"></div>
        </div>
        <div>
          <div class="gear-slot gear-slot-right" id="${row[1]}-slot">
            <img id="${row[1]}-slot-img" itemId='0' src="img/${row[1]}.jpg" onclick="showItemDropdown(event, '${row[1]}')"/>
            <div class="slot-text" id="${row[1]}-slot-text">
              <a class="gear-text" id="${row[1]}-text" onclick="showItemDropdown(event, '${row[1]}')"></a>
              <a onclick="showEnchantDropdown(event, '${row[1]}')" class="gear-enchant" id="${row[1]}-enchant" data-wh-rename-link="false" href="#">${ENCHANT_SLOTS.includes(row[1]) ? 'Add Enchant' : ''}</a>
            </div>
            <div id="${row[1]}-slot-icon" class="slot-icon" onclick="showItemDropdown(event, '${row[1]}')"></div>
          </div>
          <div id="${row[1]}-slot-dropdown-content" class="dropdown-content"></div>
          <div id="${row[1]}-enchant-dropdown-content" class="dropdown-content"></div>
        </div>
      `;
      gearSelect.appendChild(element);
    } else { // length == 1
      const element = document.createElement('div');
      element.classList.add('gear-row');
      element.style.display = 'flex';
      element.innerHTML = `
        <div>
          <div class="gear-slot gear-slot-left" id="${row[0]}-slot" >
            <img id="${row[0]}-slot-img" itemId='0' src="img/${row[0]}.jpg" onclick="showItemDropdown(event, '${row[0]}')"/>
            <div id="${row[0]}-slot-icon" class="slot-icon" onclick="showItemDropdown(event, '${row[0]}')"></div>
            <div class="slot-text" id="${row[0]}-slot-text">
              <a class="gear-text" id="${row[0]}-text" onclick="showItemDropdown(event, '${row[0]}')"></a>
              <a onclick="showEnchantDropdown(event, '${row[0]}')" class="gear-enchant" id="${row[0]}-enchant" data-wh-rename-link="false" href="#">${ENCHANT_SLOTS.includes(row[0]) ? 'Add Enchant' : ''}</a>
            </div>
          </div>
          <div id="${row[0]}-slot-dropdown-content" class="dropdown-content"></div>
          <div id="${row[0]}-enchant-dropdown-content" class="dropdown-content"></div>
        </div>
      `;
      gearSelect.appendChild(element);
    }
  });
}

function selectEnchant(id, slot) {
  const slotText = document.getElementById(slot + '-enchant');
  if (id != 0) {
    slotText.href = `https://classic.wowhead.com/spell=${id}`;
    slotText.classList.add('enchanted');
  } else {
    slotText.href = '';
    slotText.classList.remove('enchanted');
  }
  slotText.setAttribute('enchantID', `${id}`)
  slotText.innerHTML = ENCHANT_DATA[`${id}`].description;
  refreshLinks();
}

function toggleOffhandBuffs(show) {
  const ohStones = document.getElementById('aura-row-oh-wep-buffs');
  const ohHeader = document.getElementById('oh-wep-buffs-header');
  if (show) {
    ohStones.style.display = 'flex';
    ohHeader.style.display = 'block';
  } else {
    ohStones.style.display = 'none';
    ohHeader.style.display = 'none';
  }
}

function selectItem(id, slot) {
  if (id != 0) {
    // set text
    const slotText = document.getElementById(slot + '-text');
    slotText.href = `https://classic.wowhead.com/item=${id}`;

    // set icon
    const slotIcon = document.getElementById(slot + '-slot-icon');
    slotIcon.innerHTML = `
      <a href="https://classic.wowhead.com/item=${id}" data-wh-rename-link="false" data-wh-icon-size="large"></a>`;

    const element = document.getElementById(slot + '-slot');
    element.setAttribute('itemid', `${id}`);
    const textElement = document.getElementById(slot + '-slot-text');
    textElement.style.display = 'flex';
    const iconElement = document.getElementById(slot + '-slot-icon');
    iconElement.style.display = 'flex';

    element.setAttribute('itemid', `${id}`);
    const slotImg = document.getElementById(slot + '-slot-img');
    slotImg.style.display = 'none';
    if (ITEMS[id].slot == "twohand") {
      selectItem(0, 'offhand');
      selectEnchant(0, 'offhand');
    }
    if (slot == "offhand") {
      const mhElement = document.getElementById('mainhand-slot');
      const mhitemid = mhElement.getAttribute('itemid');
      if (parseInt(mhitemid) != 0 && ITEMS[mhitemid].slot == "twohand") {
        selectItem(0, 'mainhand');
        selectEnchant(0, 'mainhand');
      }
      if (ITEMS[id].type == "Shield") {
        toggleOffhandBuffs(false);
      } else {
        toggleOffhandBuffs(true);
      }
    }
  } else {
    // set text
    const slotText = document.getElementById(slot + '-text');
    slotText.href = `https://classic.wowhead.com/item=${id}`;

    // set icon
    const slotIcon = document.getElementById(slot + '-slot-icon');
    slotIcon.innerHTML = `
      <a href="https://classic.wowhead.com/item=${id}" data-wh-rename-link="false" data-wh-icon-size="large"></a>`;

    const element = document.getElementById(slot + '-slot');
    element.setAttribute('itemid', `${id}`);
    const textElement = document.getElementById(slot + '-slot-text');
    textElement.style.display = 'none';
    const iconElement = document.getElementById(slot + '-slot-icon');
    iconElement.style.display = 'none';

    const slotImg = document.getElementById(slot + '-slot-img');
    slotImg.style.display = 'flex';

    if (slot == "offhand") {
      toggleOffhandBuffs(false);
    }
  }
  refreshLinks();
}

function updateBleedResistance() {
  var slider = document.getElementById("bleed-resistance");
  var output = document.getElementById("bleed-resistance-span");
  output.innerHTML = slider.value + '%';
}

// TODO: Remove
function createLinks() {
  refreshLinks();
}

function generateProfile() {
  let profile = {};
  profile.version = '1.0.0';

  // Gear
  let gear = {};
  ITEM_SLOTS.forEach(slot => {
    let element = document.getElementById(slot + '-slot');
    let itemID = element.getAttribute('itemid');
    itemID = itemID ? itemID : 0;
    gear[`${slot}`] = itemID;
  });
  profile.gear = gear;

  // Rotation
  let rotation = {};
  ABILITIES.forEach(ability => {
    let obj = {};
    let use = document.getElementById('use-' + ability).checked;
    let rage = 0;
    if ('death-wish' != ability)
      rage = Number(document.getElementById(ability + '-rage').value);
    obj.use = use;
    obj.rage = rage;
    rotation[`${ability}`] = obj;
  });
  profile.rotation = rotation;

  // Tank Settings
  let tankSettings = {};
  TANK_SETTINGS.forEach(setting => {
    if (setting == "startRage" || setting == "player-level")
      tankSettings[`${setting}`] = document.getElementById(setting).value;
    else
      tankSettings[`${setting}-ix`] = document.getElementById(setting).selectedIndex;
  });
  profile.tankSettings = tankSettings;

  // Enchants
  let enchants = {};
  ENCHANT_SLOTS.forEach(slot => {
    const element = document.getElementById(slot + '-enchant');
    let enchantID = Number(element.getAttribute('enchantID'));
    enchants[`${slot}-enchant-id`] = enchantID;
  });
  profile.enchants = enchants;

  // Talents 
  profile.talents = getTalents();

  // Buffs
  let buffs = {};
  BUFFS.forEach(buff => {
    let element = document.getElementById(`${buff}-aura-img`);
    buffs[`${buff}`] = element.classList.contains('aura-toggle-active');
  });
  profile.buffs = buffs;

  // Boss Settings
  let bossSettings = {};
  BOSS_SETTINGS.forEach(setting => {
    let element = document.getElementById(setting);
    if (setting == "bossLevel")
      bossSettings[`${setting}`] = element.selectedIndex;
    else if (['CoR', 'faeriefire', 'iea', 'homunculi'].includes(setting))
      bossSettings[`${setting}`] = element.checked;
    else
      bossSettings[`${setting}`] = element.value;
  });
  bossSettings['bleed-resistance'] = document.getElementById('bleed-resistance').value;
  profile.bossSettings = bossSettings;

  // Calc Settings
  let calcSettings = {
    'iterations': document.getElementById("iterations").value,
    'fightLength': document.getElementById("fightLength").value,
  }
  profile.calcSettings = calcSettings;
  return profile;
}

function saveInput() {
  let profile_name = "Default"; // TODO: Turn into user input
  let profiles = localStorage.getItem("fresh_profiles");
  profiles = profiles ? JSON.parse(profiles) : {};
  let profile = generateProfile();
  profiles[`${profile_name}`] = profile;
  localStorage.setItem("fresh_profiles", JSON.stringify(profiles));
}

function loadProfile(profile) {
  const DEFAULT_PROFILE = { "version": "1.0.0", "gear": { "head": "22418", "hands": "21581", "neck": "22732", "waist": "22422", "shoulder": "22419", "legs": "22417", "back": "23045", "feet": "22420", "chest": "22416", "wrist": "22423", "finger1": "23059", "finger2": "19376", "trinket1": 0, "trinket2": 0, "mainhand": "23054", "offhand": "236336", "ranged": "236322" }, "rotation": { "slam": { "use": false, "rage": 60 }, "death-wish": { "use": false, "rage": 0 }, "revenge": { "use": true, "rage": 60 }, "raging-blow": { "use": false, "rage": 0 }, "rend": { "use": false, "rage": 60 }, "devastate": { "use": false, "rage": 70 }, "heroic-strike": { "use": false, "rage": 85 }, "shield-block": { "use": false, "rage": 90 }, "shield-slam": { "use": true, "rage": 60 }, "bloodthirst": { "use": false, "rage": 60 }, "quick-strike": { "use": false, "rage": 60 }, "mortal-strike": { "use": false, "rage": 60 }, "thunder-clap": { "use": false, "rage": 60 }, "cbrUse": false, "cbrStacks": 0 }, "tankSettings": { "level": 50, "race-ix": 0, "startRage": "70" }, "enchants": { "head-enchant-id": 0, "shoulder-enchant-id": 0, "back-enchant-id": 0, "chest-enchant-id": 0, "wrist-enchant-id": 0, "hands-enchant-id": 0, "legs-enchant-id": 0, "feet-enchant-id": 0, "mainhand-enchant-id": 0, "offhand-enchant-id": 0 }, "talents": { "cruelty": 2, "shield-specialization": 5, "improved-bloodrage": 2, "toughness": 5, "last-stand": 1, "improved-shield-block": 1, "improved-revenge": 3, "defiance": 5, "improved-sunder-armor": 3, "concussion-blow": 1, "one-handed-specialization": 5, "shield-slam": 1 }, "buffs": { "battleshout": false, "motw": false, "kings": false, "might": false, "horn": false, "strtotem": false, "fort": false, "bloodpact": false, "devo": false, "loh": false, "inspiration": false, "defense": false, "fort-elixir": false, "shadow-oil": false, "rumsey": false, "oh-shadow-oil": false, "dmf": false, "wcb": false, "zandalar": false, "dragonslayer": false, "moldar": false, "fengus": false, "slipkik": false, "songflower": false, "sunder": false, "iea": false, "faeriefire": false, "cor": false, "agi": false, "giants": false, "dark-desire": false, "stam-food": false, "str-scroll": false, "leader": false, "trueshot": false }, "bossSettings": { "bossLevel": 0, "swingMax": "4000", "swingMin": "4000", "swingTimer": "2", "bossArmor": "3731", "bleed-resistance": "20" }, "calcSettings": { "iterations": "10000", "fightLength": "20" } };
  profile = profile == null ? DEFAULT_PROFILE : profile;

  // Deprecated with the addition of default json profile
  let defaultGear = {
    'head': 211505,
    'hands': 209568,
    'neck': 209673,
    'waist': 211457,
    'shoulder': 209692,
    'legs': 209566,
    'back': 213087,
    'feet': 209581,
    'chest': 210794,
    'wrist': 211463,
    'finger1': 209565,
    'finger2': 2933,
    'trinket1': 211449,
    'trinket2': 21568,
    'mainhand': 209525,
    'offhand': 209424,
    'ranged': 209688,
  };
  let gear = profile.gear ? profile.gear : {};
  // TODO: Just use GEARSLOTS list? [sic]
  Object.keys(defaultGear).forEach(slot => {
    let element = document.getElementById(slot + '-slot');
    let itemID = gear[`${slot}`] !== undefined ? gear[`${slot}`] : defaultGear[`${slot}`];
    if (element) {
      element.setAttribute('itemid', itemID); // Update the HTML
      selectItem(itemID, slot); // Update the UI
    }
  });

  let rotation = profile.rotation ? profile.rotation : {};
  ABILITIES.forEach(ability => {
    let abilityUse = document.getElementById('use-' + ability);
    let abilityRage = document.getElementById(ability + '-rage');
    let abilitySettings = rotation[`${ability}`] ? rotation[`${ability}`] : {};
    if (!["rend", "shield-block"].includes(ability))
      abilityUse.checked = abilitySettings.use === undefined ? true : abilitySettings.use; // Default to true
    else
      abilityUse.checked = abilitySettings.use === undefined ? false : abilitySettings.use; // Default to false
    if (!['raging-blow', 'death-wish'].includes(ability) && abilitySettings.rage !== undefined)
      abilityRage.value = abilitySettings.rage;
  });

  // Tank Settings
  let tankSettings = profile.tankSettings == null ? {} : profile.tankSettings;
  TANK_SETTINGS.forEach(setting => {
    if (setting == 'startRage') {
      if (tankSettings[`${setting}`] != null)
        document.getElementById(setting).value = tankSettings[`${setting}`];
    } else {
      if (tankSettings[`${setting}-ix`] != null)
        document.getElementById(setting).selectedIndex = tankSettings[`${setting}-ix`];
    }
  });

  // Enchants
  let enchants = profile.enchants == null ? {} : profile.enchants;
  ENCHANT_SLOTS.forEach(enchant => {
    if (enchants[`${enchant}-enchant-id`] != null)
      selectEnchant(enchants[`${enchant}-enchant-id`], enchant)
  });

  // Talents 
  let talents = profile.talents == null ? {} : profile.talents;
  loadTalents(talents);

  // Buffs
  let buffs = profile.buffs == null ? {} : profile.buffs;
  BUFFS.forEach(buff => {
    let element = document.getElementById(`${buff}-aura-img`);
    element.classList.remove('aura-toggle-active');
    if (buffs[`${buff}`])
      element.classList.add('aura-toggle-active');
  });

  // Boss Settings
  let bossSettings = profile.bossSettings == null ? {} : profile.bossSettings;
  BOSS_SETTINGS.forEach(setting => {
    if (bossSettings[`${setting}`] != null) {
      if (setting == 'bossLevel')
        document.getElementById(setting).selectedIndex = bossSettings[`${setting}`];
      else
        document.getElementById(setting).value = bossSettings[`${setting}`];
    }
  });
  if (bossSettings['bleed-resistance'] != null) {
    document.getElementById('bleed-resistance').value = bossSettings['bleed-resistance'];
    updateBleedResistance();
  }

  // Calc Settings
  let calcSettings = profile.calcSettings == null ? {} : profile.calcSettings;
  if (calcSettings.iterations != null)
    document.getElementById("iterations").value = calcSettings.iterations;
  if (calcSettings.fightLength != null)
    document.getElementById("fightLength").value = calcSettings.fightLength;
}

function loadLocalstorage() {
  try {
    let profiles = localStorage.getItem("fresh_profiles");
    profiles = profiles ? JSON.parse(profiles) : {};
    let profile_name = "Default"; // TODO: Make user input
    let profile = profiles[`${profile_name}`];
    loadProfile(profile);
  } catch ({ name, message }) {
    log_message(LOG_LEVEL.WARNING, "Unable to load profile: " + message + ". Loading default profile.");
    loadProfile(null);
  }
}

function processJson() {
  try {
    const jsonInput = document.getElementById('jsonInput').value;
    const parsedJson = JSON.parse(jsonInput);
    loadProfile(parsedJson);
    let globals = updateStats();
    updateRotation(globals);
  } catch (error) {
    alert('Invalid JSON format. Please check your input.');
  }
}


function copyToClipboard() {
  let profile = generateProfile();
  const tempInput = document.createElement('input');
  tempInput.value = JSON.stringify(profile);
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  alert('JSON copied to clipboard!');
}

const SECTIONS = ['gear', 'settings', 'results'];
function changeSection(id) {
  SECTIONS.forEach(section => {
    document.getElementById(section).style.display = 'none';
  });
  document.getElementById(id).style.display = 'flex';
}

function showProfiles(event) {
  event.stopPropagation();
  const element = document.getElementById('profiles');
  element.style.display = 'block';
}

function hideProfiles() {
  const element = document.getElementById('profiles');
  element.style.display = 'none';
}

function enableCalc() {
  document.getElementById("calcBtn").disabled = false;
}

function disableCalc() {
  document.getElementById("calcBtn").disabled = true;
}

async function onLoadPage() {
  disableCalc();
  createGearRows();
  createAuraRows()
  createLinks();
  addEventListeners();
  createTalentTrees();
  await loadItemData();
  loadLocalstorage();
  let globals = updateStats();
  updateRotation(globals);
  enableCalc();
}

async function main() {

  // Cache the user input locally
  saveInput();
  // Fetch and set all user input settings
  //fetchSettings()
  const globals = updateStats();

  document.getElementById("errorContainer").innerHTML = ""
  if (globals.config.iterations == 0 || globals.config.simDuration == 0) {
    enableCalc();
    return;
  }

  let start = Date.now()
  let results = {};
  let uptimes = {};
  let tps = []
  let dps = []
  let dtps = []
  let auras = {};
  let rageGained = []
  let rageSpent = []
  let snapshots = []
  let breaches = 0
  let bossSwings = 0;
  let exampleEvents = []

  updateProgressbar(0)
  document.querySelector("#progressBar").style.display = `block`;
  document.querySelector("#barContainer").style.display = `block`;
  let numWorkers = window.navigator.hardwareConcurrency;
  let remainderIterations = globals.config.iterations - Math.floor(globals.config.iterations / numWorkers) * numWorkers
  let numWorkersDone = 0;
  let progressPerc = 0;
  for (var i = 0; i < numWorkers; i++) {
    var worker = new Worker('./workers/worker.js', { type: 'module' });
    let iterations = i == 0 ? Math.floor(globals.config.iterations / numWorkers) + remainderIterations : Math.floor(globals.config.iterations / numWorkers);
    if (iterations <= 0) {
      numWorkersDone++;
      continue;
    }
    worker.postMessage({
      globals: globals,
      iterations: iterations,
    })
    worker.addEventListener('error', function(e) {
      log_message(LOG_LEVEL.ERROR, `Line ${e.lineno} in ${e.filename}: ${e.message}`)
    })
    worker.addEventListener('message', function(e) {
      if (e.data.type == 'progressUpdate') {
        progressPerc += e.data.progressPerc / numWorkers;
        updateProgressbar(progressPerc);
      } else {
        for (let ability in e.data.results.tpsBreakdown) {
          if (!results[`${ability}`]) results[`${ability}`] = [];
          results[`${ability}`] = results[`${ability}`].concat(e.data.results.tpsBreakdown[`${ability}`]);
        }
        tps = tps.concat(e.data.results.tps);
        dps = dps.concat(e.data.results.dps);
        dtps = dtps.concat(e.data.results.dtps);
        Object.keys(e.data.results.auras).forEach(aura => {
          let obj = auras[`${aura}`] == null ? { uptimes: [] } : auras[`${aura}`];
          obj.uptimes = obj.uptimes.concat(e.data.results.auras[`${aura}`].uptime);
          auras[`${aura}`] = obj;
        });
        if (++numWorkersDone === numWorkers) {
          exampleEvents = e.data.events
          postResults();
        }
      }
    })
  }

  function postResults() {

    let end = Date.now()
    let ret = `Calculated ${globals.config.iterations} iterations of ${globals.config.simDuration}s. fights with timestep ${globals.config.timeStep} ms using ${numWorkers} threads in ${(end - start) / 1000} seconds.`;

    let iterations = globals.config.iterations;
    // Pad the vector in case there were fight iterations where an ability was not used at all (is this really needed?)
    for (let result in results) {
      results[`${result}`] = [...Array(globals.config.iterations - results[`${result}`].length)].map((_, i) => { return { tps: 0, dps: 0, hits: 0, casts: 0 } }).concat(results[`${result}`])
    }

    let sortedResults = Object.keys(results).map(key => [key, results[key]])
    // Sort the abilities based on their average tps
    sortedResults.sort((a, b) => {
      let btps = b[1].reduce((a, b) => a += b.tps, 0);
      let atps = a[1].reduce((a, b) => a += b.tps, 0);
      return btps - atps;
    })

    let resultTable = `<table><tr><th class="table-first-col">Ability</th><th>TPS</th><th>DPS</th><th>Casts</th><th>Landed</th><th>Hit</th><th>Crit</th><th>Miss</th><th>Dodge</th><th>Parry</th><th>Block</th><th>Glance</th></tr>`;
    let totalTps = 0;
    let totalDps = 0;
    for (let i in sortedResults) {
      let result = { tps: 0, dps: 0, casts: 0, hits: 0 };
      if (sortedResults[i]) {
        result = sortedResults[i][1].reduce((accumulator, element) => {
          accumulator.tps += element.tps != null ? element.tps : 0;
          accumulator.dps += element.dps != null ? element.dps : 0;
          accumulator.casts += element.casts != null ? element.casts : 0;
          accumulator.hits += element.hits != null ? element.hits : 0;
          accumulator.crits += element.crits != null ? element.crits : 0;
          accumulator.misses += element.misses != null ? element.misses : 0;
          accumulator.dodges += element.dodges != null ? element.dodges : 0;
          accumulator.parries += element.parries != null ? element.parries : 0;
          accumulator.blocks += element.blocks != null ? element.blocks : 0;
          accumulator.glances += element.glances != null ? element.glances : 0;
          return accumulator;
        }, { tps: 0, dps: 0, hits: 0, casts: 0, crits: 0, glances: 0, misses: 0, dodges: 0, parries: 0, blocks: 0 });
      }
      resultTable = resultTable.concat(`<tr>
            <td class="table-first-col">${sortedResults[i][0]}:</td>
            <td>${(result.tps / iterations).toFixed(2)}</td>
            <td>${(result.dps / iterations).toFixed(2)}</td>
            <td>${(result.casts / iterations).toFixed(2)}</td>
            <td>${((result.hits + result.crits + result.glances + result.blocks) / iterations).toFixed(2)}</td>
            <td>${(result.hits / (result.casts) * 100).toFixed(2)}%</td>
            <td>${(result.crits / (result.casts) * 100).toFixed(2)}%</td>
            <td>${(result.misses / (result.casts) * 100).toFixed(2)}%</td>
            <td>${(result.dodges / (result.casts) * 100).toFixed(2)}%</td>
            <td>${(result.parries / (result.casts) * 100).toFixed(2)}%</td>
            <td>${(result.blocks / (result.casts) * 100).toFixed(2)}%</td>
            <td>${(result.glances / (result.casts) * 100).toFixed(2)}%</td>
          </tr>`);
      totalTps += result.tps;
      totalDps += result.dps;
    }
    resultTable = resultTable.concat(`
            <tr><td>Total:</td>
            <td>${Math.round(totalTps / iterations * 100) / 100}</td>
            <td>${Math.round(totalDps / iterations * 100) / 100}</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`)
    resultTable = resultTable.concat(`</table>`)

    // Sort the auras based on their average uptime
    let sortedAuras = Object.keys(auras).map(key => [key, average(auras[key].uptimes)])
    sortedAuras.sort((a, b) => {
      return b[1] - a[1];
    });
    let auraTable = `<table><tr><th class="table-first-col">Aura</th><th>Uptime</th></tr>`;
    sortedAuras.forEach(vec => {
      auraTable += `<tr><td class="table-first-col">${vec[0]}</td><td>${(vec[1] * 100).toFixed(2)}%</td></tr>`;
    });
    auraTable += '</table>';

    let statsTable =
      `<table>
        <tr><th>Statistics</th><th></th><th></th></tr>
        <tr><td class="table-first-col">TPS standard deviation:</td><td>${Math.round(std(tps) * 100) / 100}</ts><td> (${Math.round(std(tps) / average(tps) * 10000) / 100}%)</td></tr>
        <tr><td class="table-first-col">DPS standard deviation:</td><td>${Math.round(std(dps) * 100) / 100}</ts><td> (${Math.round(std(dps) / average(dps) * 10000) / 100}%)</td></tr>
        </table>`

    let generalTable =
      `<table id="generalStatsTable">
        <tr><td>TPS: </td><td>${Math.round(average(tps) * 100) / 100}</td></tr>
        <tr><td>DPS: </td><td>${Math.round(average(dps) * 100) / 100}</td></tr>
        <tr><td>DTPS: </td><td>${Math.round(average(dtps) * 100) / 100}</td></tr>
        </table>
        `
    document.getElementById("generalStats").innerHTML = generalTable;
    document.getElementById("tpsTable").innerHTML = resultTable;
    document.getElementById("statistics").innerHTML = statsTable;
    document.getElementById("auraTable").innerHTML = auraTable;


    let timelineHeaderDOM = document.querySelector("#log-description")
    timelineHeaderDOM.innerHTML = `Calculated ${globals.config.iterations} iterations of ${globals.config.simDuration}s. fights using ${numWorkers} threads in ${(end - start) / 1000} seconds.`
    timelineHeaderDOM.innerHTML += "</br>"
    timelineHeaderDOM.innerHTML += "Example fight:"
    timelineHeaderDOM.innerHTML += "</br>"

    let timelineDOM = document.querySelector("#log>pre>code")
    timelineDOM.innerHTML = ""
    exampleEvents.forEach(e => {
      let eventLine = formatEvent(e);
      if (eventLine !== undefined) {
        timelineDOM.innerHTML += eventLine;
        timelineDOM.innerHTML += "</br>";
      }
    })
    document.querySelector("#progressBar").style.display = `none`;
    document.querySelector("#barContainer").style.display = `none`;
    document.querySelector("#resultContainer").style.display = `flex`;
    document.querySelector("#log").style.display = `flex`;
    enableCalc();
  }
}

async function calc() {
  disableCalc();
  await main();
}

// Attach functions to window for HTML event handlers
window.calc = calc;
window.changeSection = changeSection;
window.showProfiles = showProfiles;
window.hideProfiles = hideProfiles;
window.loadProfile = loadProfile;
window.copyToClipboard = copyToClipboard;
window.processJson = processJson;
window.updateBleedResistance = updateBleedResistance;

function initWhenReady() {
  if (typeof window.Papa === 'undefined') {
    console.log('Waiting for Papa Parse to load...');
    setTimeout(initWhenReady, 50);
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onLoadPage);
  } else {
    onLoadPage();
  }
}

initWhenReady();
