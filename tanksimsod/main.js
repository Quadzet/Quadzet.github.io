"use strict";

function sleep(ms) { return new Promise((r) => 
    setTimeout(r, ms)); }

function average(array) {
    if (array) return array.reduce((a, b) => a + b) / array.length;
    else return 0;
};
// const range = (length) =>
//   Array.from({ length }, (_, i) => i)

function linspace(start, end, length = Math.max(Math.round(end-start) + 1, 1)) {
    if(length < 2) { return length === 1 ? [start] : [] ; }
    var i, ret = Array(length);
    length--;
    for(i = length; i >= 0; i--) { ret[i] = (i*end+(length-i)*start)/length; }
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
    document.querySelector("#progressBar").style.width = `${progressPerc}%`
    await sleep(0);
}

// TODO: move this to a data file
const BUFFS = ['battleshout', 'motw', 'kings', 'might', 'horn', 'strtotem', 'wildstrikes', 'lion', 'fort', 'bloodpact', 'devo', 'loh', 'inspiration',
              'ogre', 'defense', 'fort-elixir', 'solid', 'dense', 'shadow-oil', 'rumsey', 'oh-solid', 'oh-dense', 'oh-shadow-oil',
              'botbf', 'ashcry', 'dmf', 'wcb', 'zandalar', 'dragonslayer', 'moldar', 'fengus', 'slipkik', 'songflower',
              'mangle', 'cov', 'sunder', 'iea', 'degrade', 'faeriefire', 'cor', 'agi', 'giants', 'spark-of-inspiration', 'dark-desire', 'stam-food', 'agi-food', 'str-scroll',
              'leader-of-the-pack', 'trueshot'];
const TANK_SETTINGS = ['level', 'race', 'startRage'];
const BOSS_SETTINGS = ['bossLevel', 'swingMax', 'swingMin', 'swingTimer', 'bossArmor'];
const TALENTS = ['deflection', 'cruelty', 'anticipation', 'shield-spec', 'toughness', 'impHS', 'impSA', 'impRend', 'impale', 'defiance', 'enrage', 'deep-wounds'];
const ENCHANT_SLOTS = ['head', 'shoulder', 'back', 'chest', 'wrist', 'hands', 'legs', 'feet', 'mainhand', 'offhand'];
const ENCHANT_IDS = {
  'head': [0],
  'shoulder': [0],
  'back': [0, 13882, 13421, 13746],
  'chest': [0, 13700, 13626, 7857, 10487, 3780],
  'wrist': [0, 7428, 13646, 7779, 13536, 13501, 13661],
  'wrist': [0, 13661, 7428, 13646, 7779, 13536, 13501],
  'hands': [0, 13815, 13887, 10487, 3780], // 13948 minor haste
  'legs': [0, 10487, 3780],
  'feet': [0, 13637, 7867, 7863, 10487, 3780],
  'mainhand': [0, 13693, 13503, 7788, 435481],
  'twohand': [20030, 13937, 435481],
  'shield': [0, 13817, 13689, 13464, 13378], //, 6042], TODO: Shield Spike
};
const RUNES = ['devastate', 'endless-rage', 'consumed-by-rage', 'furious-thunder', 'raging-blow', 'flagellation', 'blood-frenzy', 'precise-timing', 'focused-rage', 'single-minded-fury', 'bloodsurge', 'frenzied-assault', 'quick-strike'];
const ABILITIES = ["slam", "death-wish", "revenge", "raging-blow", "rend", "devastate", "heroic-strike", "shield-block", "shield-slam", "bloodthirst", "quick-strike", "mortal-strike"];
const ITEM_SLOTS = ['head', 'hands', 'neck', 'waist', 'shoulder', 'legs', 'back', 'feet', 'chest', 'wrist', 'finger1', 'finger2', 'trinket1', 'trinket2', 'mainhand', 'offhand', 'ranged'];
const ITEM_IDS = {
  'head': [215166, 211843, 211505, 209690, 6971, 211510, 209682, 4724, 211789],
  'hands': [213319, 211423, 1978, 209568, 6397, 6974, 3485, 14754, 4254, 4253, 720],
  'neck': [213344, 209817, 20444, 209673, 209825, 209422],
  'waist': [215115, 211457, 209421, 6719, 6468, 7107, 211466, 4249, 3429, 14567, 14755, 4707],
  'shoulder': [213304, 209824, 13131, 209692, 209676, 2264, 210773, 4835, 4833, 4705, 3231, 3481],
  'legs': [213332, 209566, 13114, 13010, 10410, 6973, 4831, 6386, 2545, 6087, 4800, 14727, 3048],
  'back': [213307, 2059, 5193, 213087, 10518, 2953, 6751, 5971, 209680, 6449, 6340, 6314],
  'feet': [9637, 211511, 209581, 1955, 7754, 209689, 19969, 3484, 6752, 12982, 211506, 4051, 6666, 2910, 10658, 6459, 3045],
  'chest': [213313, 1717, 211504, 209418, 210794, 6972, 3416, 14744, 3049, 2870],
  'wrist': [19581, 211463, 204804, 3228, 6387, 7003, 13012, 6722, 6675, 5943, 4438, 14750, 897, 3212],
  'finger1': [213284, 19512, 12985, 2039, 2933, 211467, 209565, 1076, 20439, 6748, 4535, 1491, 4998, 6321, 13097],
  'finger2': [213284, 19512, 12985, 2039, 2933, 211467, 209565, 1076, 20439, 6748, 4535, 1491, 4998, 6321, 13097],
  'trinket1': [213348, 21568, 211451, 211449, 211420, 18854],
  'trinket2': [213348, 21568, 211451, 211449, 211420, 18854],
  'mainhand': [216495, 213286, 212583, 211456, 2941, 20443, 7786, 6194, 3414, 209560, 4454, 2194, 4826, 3400, 935, 4445, 2878, 1935, 1454, 212582, 1493, 3413, 1483, 209818, 20440, 2807, 209822, 2011, 1292, 9488, 209525, 209436, 209579, 6220, 1482],
  'offhand': [216496, 211460, 6223, 13079, 7002, 6320, 209424, 13245, 12997, 4064, 6676, 15891, 5443, 3656, 212583],
  'ranged': [9426, 209830, 209688, 3021, 209563],
};
var ITEMS = {};

function updateRotation(globals) {
  let element = document.getElementById('rotation-death-wish');
  if (getTalentValue('death-wish') > 0)
    element.style.display = 'flex';
  else
    element.style.display = 'none';
  
  element = document.getElementById('rotation-raging-blow');
  if (checkRuneToggle('raging-blow'))
    element.style.display = 'flex';
  else
    element.style.display = 'none';
  
  element = document.getElementById('rotation-quick-strike');
  if (checkRuneToggle('quick-strike'))
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
  
  element = document.getElementById('rotation-slam');
  if (checkRuneToggle('precise-timing') || checkRuneToggle('bloodsurge'))
    element.style.display = 'flex';
  else
    element.style.display = 'none';
  
  element = document.getElementById('rotation-devastate');
  if (checkRuneToggle('devastate')) {
    let spanElement = document.getElementById('rotation-devastate-label');
    spanElement.innerHTML = 'Devastate above '
    element.style.display = 'flex';
  }
  else {
    let spanElement = document.getElementById('rotation-devastate-label');
    spanElement.innerHTML = 'Sunder Armor above '
    element.style.display = 'flex';
  }

  element = document.getElementById('rotation-consumed-by-rage');
  if (checkRuneToggle('consumed-by-rage'))
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

function toggleRune(event, id, exclusives) {
  event.preventDefault();
  const element = document.getElementById(id + '-rune-img');
  element.classList.toggle('rune-toggle-active');
  if (exclusives != null && element.classList.contains('rune-toggle-active')) {
    exclusives.forEach(name => {
      var exElement = document.getElementById(name + '-rune-img');
      exElement.classList.remove('rune-toggle-active');
    });
  }
  let globals = updateStats();
  updateRotation(globals);
}

async function fetchTable(tableName) {
  let parsedData = [];
  try {
    const response = await fetch('./data/' + tableName + '.csv');
    const csvData = await response.text();

    // Parse the CSV content
    parsedData = await new Promise((resolve, reject) => {
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
    console.error('Error:', error);
  }
  return parsedData;
}

function getRow(table, column, id) {
  for(let r of table) if (r[column] == id) return r;
}

function getRows(table, column, id) {
  let result = [];
  for(let r of table) if (r[column] == id) result.push(r);
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
  switch(id) {
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
    switch(subcl) {
      case 0: return "Miscellaneous";
      case 1: return "Cloth";
      case 2: return "Leather";
      case 3: return "Mail";
      case 4: return "Plate";
      case 6: return "Shield";
    }
  }
  if (cl == 2) {
    switch(subcl) {
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
    if (id == 215161) 
      var x = 15;
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
      spells.forEach((spell, index) => {

        let effects = getRows(spellEffectData, 'SpellID', spell.SpellID);

        if (spell.TriggerType == "1") { // Only care about on_equip
          effects.forEach(e => {
            // Effect == 6 means apply_aura
            if (e.Effect == 6 && e.EffectAura == 99)
              obj.attackpower = (obj.attackpower || 0) + parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 102 && e.EffectMiscValue_0 & 32)
              obj.attackpower = (obj.attackpower || 0) + parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 54)
              obj.hit = parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 52)
              obj.crit = parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 49)
              obj.dodge = parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 47)
              obj.parry = parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 51)
              obj.block = parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 158)
              obj.blockvalue = parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 30 && e.EffectMiscValue_0 == 95)
              obj.defense = parseInt(e.EffectBasePoints) + 1;
            if (e.Effect == 6 && e.EffectAura == 30 && e.EffectMiscValue_0 != 95 && e.EffectMiscValue_0 != 226 && e.EffectMiscValue_0 != 393 && e.EffectMiscValue_0 != 45 && e.EffectMiscValue_0 != 46) {
              obj.skill = parseInt(e.EffectBasePoints) + 1;
              // TODO: remaining wep types
              if (obj.skilltype == null)
                obj.skilltype = [];
              else if (e.EffectMiscValue_0 == 44) obj.skilltype.push("Axe");
              else if (e.EffectMiscValue_0 == 173) obj.skilltype.push("Dagger");
              else if (e.EffectMiscValue_0 == 43) obj.skilltype.push("Sword");
              else if (e.EffectMiscValue_0 == 172) obj.skilltype.push("Two-handed Axe");
              else if (e.EffectMiscValue_0 == 55) obj.skilltype.push("Two-handed Sword");
              else if (e.EffectMiscValue_0 == 160) obj.skilltype.push("Two-handed Mace");
              else delete obj.skilltype;
            }
          });
        }

        let category = getRow(spellCategoriesData, 'SpellID', spell.SpellID);
        let misc = getRow(spellMiscData, 'SpellID', spell.SpellID);
        let proc = {id: spell.SpellID};

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
    )}

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
    window.addEventListener('click', function (event) {
        const element = document.getElementById('profiles')
        if (event.target === element) {
          hideProfiles();
        }
    })
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
      if (ITEMS[`${itemID}`].slot == "twohand") enchantSlot = 'twohand';
      else if (['offhand', 'onehand'].includes(ITEMS[`${itemID}`].slot) && ITEMS[`${itemID}`].type == "Shield") enchantSlot = 'shield';
      else if (['offhand', 'onehand'].includes(ITEMS[`${itemID}`].slot)) enchantSlot = 'mainhand';
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
    if (id == 215161)
      var x = 15;
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
    dropdownList.setAttribute('id', slot+'-dropdown-gear-list')
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
  const ohStones = document.getElementById('oh-wep-buffs');
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
      if (ITEMS[mhitemid].slot == "twohand") {
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
    if (!['raging-blow', 'death-wish'].includes(ability))
      rage = Number(document.getElementById(ability + '-rage').value);
    obj.use = use;
    obj.rage = rage;
    rotation[`${ability}`] = obj;
  });
  let cbrStacks = 0;
  rotation.cbrUse = document.getElementById('use-cbr-stop-rage').checked;
  if (rotation.cbrUse)
    cbrStacks = Number(document.getElementById('cbr-stacks').value);
  rotation.cbrStacks = cbrStacks;
  profile.rotation = rotation;

  // Tank Settings
  let tankSettings = {};
  TANK_SETTINGS.forEach(setting => {
    if (setting == "startRage")
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

  // Runes
  let runes = {};
  RUNES.forEach(rune => {
    runes[`${rune}`] = checkRuneToggle(rune);
  });
  profile.runes = runes;
    
  // Buffs
  let buffs  = {};
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

function saveInput()
{
  let profile_name = "Default"; // TODO: Turn into user input
  let profiles = localStorage.getItem("sod_profiles");
  profiles = profiles ? JSON.parse(profiles) : {};
  let profile = generateProfile();
  profiles[`${profile_name}`] = profile;
  localStorage.setItem("sod_profiles", JSON.stringify(profiles));
}

function loadProfile(profile)
{
  const DEFAULT_PROFILE = {
    "version": "1.0.0",
    "gear": {
      "head": "211505",
      "hands": "209568",
      "neck": "209673",
      "waist": "211457",
      "shoulder": "209692",
      "legs": "209566",
      "back": "213087",
      "feet": "209581",
      "chest": "210794",
      "wrist": "211463",
      "finger1": "209565",
      "finger2": "2933",
      "trinket1": "211449",
      "trinket2": "21568",
      "mainhand": "209525",
      "offhand": "209424",
      "ranged": "209688"
    },
    "rotation": {
      "revenge": {
        "use": false,
        "rage": 60
      },
      "raging-blow": {
        "use": true,
        "rage": 0
      },
      "death-wish": {
        "use": true,
        "rage": 0
      },
      "rend": {
        "use": false,
        "rage": 80
      },
      "devastate": {
        "use": true,
        "rage": 75
      },
      "heroic-strike": {
        "use": true,
        "rage": 90
      },
      "shield-block": {
        "use": false,
        "rage": 90
      },
      "cbrUse": true,
      "cbrStacks": 3
    },
    "tankSettings": {
      "level-ix": 0,
      "race-ix": 2,
      "startRage": "40"
    },
    "enchants": {
      "head-enchant-id": 3780,
      "shoulder-enchant-id": 0,
      "back-enchant-id": 13882,
      "chest-enchant-id": 13626,
      "wrist-enchant-id": 13501,
      "hands-enchant-id": 3780,
      "legs-enchant-id": 3780,
      "feet-enchant-id": 7867,
      "mainhand-enchant-id": 13503,
      "offhand-enchant-id": 13464
    },
    "talents": {
      "deflection": 5,
      "cruelty": 3,
      "anticipation": 0,
      "shield-specialization": 0,
      "toughness": 0,
      "improved-heroic-strike": 2,
      "improved-sunder-armor": 0,
      "improved-rend": 3,
      "impale": 0,
      "defiance": 0,
      "enrage": 0,
      "deep-wounds": 3,
    },
    "runes": {
      "devastate": true,
      "endless-rage": false,
      "consumed-by-rage": true,
      "furious-thunder": false,
      "raging-blow": false,
      "flagellation": true,
      "blood-frenzy": false
    },
    "buffs": {
      "battleshout": true,
      "motw": true,
      "kings": false,
      "might": false,
      "horn": true,
      "strtotem": true,
      "wildstrikes": true,
      "lion": true,
      "fort": true,
      "bloodpact": true,
      "devo": true,
      "loh": false,
      "inspiration": false,
      "lesseragi": true,
      "ogre": true,
      "defense": true,
      "minorfort": true,
      "food": true,
      "coarse": false,
      "bfdstone": false,
      "rumsey": true,
      "botbf": true,
      "ashcry": true,
      "dmf": true,
      "wcb": false,
      "zandalar": false,
      "dragonslayer": false,
      "moldar": false,
      "fengus": false,
      "slipkik": false,
      "songflower": false,
      "mangle": true,
      "cov": true,
      "sunder": false,
      "iea": false,
      "degrade": true,
      "faeriefire": true,
      "cor": true
    },
    "bossSettings": {
      "bossLevel": 1,
      "swingMax": "200",
      "swingMin": "200",
      "swingTimer": "1",
      "bossArmor": "1081"
    },
    "calcSettings": {
      "iterations": "1000",
      "fightLength": "30"
    }
  }
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
  document.getElementById('use-cbr-stop-rage').checked = rotation.cbrUse === undefined ? true : rotation.cbrUse; // Defaults to true
  if (rotation.cbrStacks !== undefined)
    document.getElementById('cbr-stacks').value = rotation.cbrStacks;

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
    
  // Runes
  let runes = profile.runes == null ? {} : profile.runes;
  RUNES.forEach(rune => {
    let element = document.getElementById(`${rune}-rune-img`);
    element.classList.remove('rune-toggle-active');
    if (runes[`${rune}`])
      element.classList.add('rune-toggle-active');
  });

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
    let profiles = localStorage.getItem("sod_profiles");
    profiles = profiles ? JSON.parse(profiles) : {};
    let profile_name = "Default"; // TODO: Make user input
    let profile = profiles[`${profile_name}`];
    loadProfile(profile);
  } catch({name, message}) {
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

async function onLoadPage()
{
  disableCalc();
  createGearRows();
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
    let remainderIterations = globals.config.iterations - Math.floor(globals.config.iterations/numWorkers)*numWorkers
    let numWorkersDone = 0;
    let progressPerc = 0;
    for (var i = 0; i < numWorkers; i++) {
        var worker = new Worker('./workers/worker.js');
        let iterations = i == 0 ? Math.floor(globals.config.iterations/numWorkers) + remainderIterations : Math.floor(globals.config.iterations/numWorkers);
        if (iterations <= 0) {
            numWorkersDone++;
            continue;
        }
        worker.postMessage({
            globals: globals,
            iterations: iterations,
        })
        worker.addEventListener('error', function(e)  {
            log_message(LOG_LEVEL.ERROR, `Line ${e.lineno} in ${e.filename}: ${e.message}`)
        })
        worker.addEventListener('message', function(e) {
            if (e.data.type == 'progressUpdate') {
                progressPerc += e.data.progressPerc / numWorkers;
                updateProgressbar(progressPerc);
            } else {
                for (let ability in e.data.results.tpsBreakdown) {
                    if(!results[`${ability}`]) results[`${ability}`] = [];
                    results[`${ability}`] = results[`${ability}`].concat(e.data.results.tpsBreakdown[`${ability}`]);
                }
                tps = tps.concat(e.data.results.tps);
                dps = dps.concat(e.data.results.dps);
                dtps = dtps.concat(e.data.results.dtps);
                Object.keys(e.data.results.auras).forEach(aura => {
                 let obj = auras[`${aura}`] == null ? {uptimes : []} : auras[`${aura}`];
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
        let ret = `Calculated ${globals.config.iterations} iterations of ${globals.config.simDuration}s. fights with timestep ${globals.config.timeStep} ms using ${numWorkers} threads in ${(end-start)/1000} seconds.`;

        let iterations = globals.config.iterations;
        // Pad the vector in case there were fight iterations where an ability was not used at all (is this really needed?)
        for(let result in results) {
            results[`${result}`] = [...Array(globals.config.iterations - results[`${result}`].length)].map((_, i) => { return { tps: 0, dps: 0, hits: 0, casts: 0 }}).concat(results[`${result}`])
        }
    
        let sortedResults = Object.keys(results).map(key => [key, results[key]])
        // Sort the abilities based on their average tps
        sortedResults.sort((a,b) => {
          let btps = b[1].reduce((a, b) => a += b.tps, 0);
          let atps = a[1].reduce((a, b) => a += b.tps, 0);
          return btps- atps;
        })

        let resultTable = `<table><tr><th class="table-first-col">Ability</th><th>TPS</th><th>DPS</th><th>Casts</th><th>Landed</th><th>Hit</th><th>Crit</th><th>Miss</th><th>Dodge</th><th>Parry</th><th>Block</th><th>Glance</th></tr>`;
        let totalTps = 0;
        let totalDps = 0;
        for (let i in sortedResults) {
          let result = {tps: 0, dps: 0, casts: 0, hits: 0};
          if (sortedResults[i]) {
            result = sortedResults[i][1].reduce((accumulator, element) => {
              accumulator.tps     += element.tps != null ? element.tps : 0;
              accumulator.dps     += element.dps != null ? element.dps : 0;
              accumulator.casts   += element.casts != null ? element.casts : 0;
              accumulator.hits    += element.hits != null ? element.hits : 0;
              accumulator.crits   += element.crits != null ? element.crits : 0;
              accumulator.misses  += element.misses != null ? element.misses : 0;
              accumulator.dodges  += element.dodges != null ? element.dodges : 0;
              accumulator.parries += element.parries != null ? element.parries : 0;
              accumulator.blocks  += element.blocks != null ? element.blocks : 0;
              accumulator.glances += element.glances != null ? element.glances : 0;
              return accumulator;
            }, { tps: 0, dps: 0, hits: 0, casts: 0, crits: 0, glances: 0, misses: 0, dodges: 0, parries: 0, blocks: 0});
          }
          resultTable = resultTable.concat(`<tr>
            <td class="table-first-col">${sortedResults[i][0]}:</td>
            <td>${(result.tps/iterations).toFixed(2)}</td>
            <td>${(result.dps/iterations).toFixed(2)}</td>
            <td>${(result.casts/iterations).toFixed(2)}</td>
            <td>${((result.hits + result.crits + result.glances + result.blocks)/iterations).toFixed(2)}</td>
            <td>${(result.hits/(result.casts)*100).toFixed(2)}%</td>
            <td>${(result.crits/(result.casts)*100).toFixed(2)}%</td>
            <td>${(result.misses/(result.casts)*100).toFixed(2)}%</td>
            <td>${(result.dodges/(result.casts)*100).toFixed(2)}%</td>
            <td>${(result.parries/(result.casts)*100).toFixed(2)}%</td>
            <td>${(result.blocks/(result.casts)*100).toFixed(2)}%</td>
            <td>${(result.glances/(result.casts)*100).toFixed(2)}%</td>
          </tr>`);
          totalTps += result.tps;
          totalDps += result.dps;
        }
        resultTable = resultTable.concat(`
            <tr><td>Total:</td>
            <td>${Math.round(totalTps/iterations*100)/100}</td>
            <td>${Math.round(totalDps/iterations*100)/100}</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>`)
        resultTable = resultTable.concat(`</table>`)

        // Sort the auras based on their average uptime
        let sortedAuras = Object.keys(auras).map(key => [key, average(auras[key].uptimes)])
        sortedAuras.sort((a,b) => {
          return b[1] - a[1];
        });
        let auraTable = `<table><tr><th class="table-first-col">Aura</th><th>Uptime</th></tr>`;
        sortedAuras.forEach(vec => {
          auraTable += `<tr><td class="table-first-col">${vec[0]}</td><td>${(vec[1]*100).toFixed(2)}%</td></tr>`;
        });
        auraTable += '</table>';

        let statsTable = 
        `<table>
        <tr><th>Statistics</th><th></th><th></th></tr>
        <tr><td class="table-first-col">TPS standard deviation:</td><td>${Math.round(std(tps)*100)/100}</ts><td> (${Math.round(std(tps)/average(tps)*10000)/100}%)</td></tr>
        <tr><td class="table-first-col">DPS standard deviation:</td><td>${Math.round(std(dps)*100)/100}</ts><td> (${Math.round(std(dps)/average(dps)*10000)/100}%)</td></tr>
        </table>`

        let generalTable = 
        `<table id="generalStatsTable">
        <tr><td>TPS: </td><td>${Math.round(average(tps)*100)/100}</td></tr>
        <tr><td>DPS: </td><td>${Math.round(average(dps)*100)/100}</td></tr>
        <tr><td>DTPS: </td><td>${Math.round(average(dtps)*100)/100}</td></tr>
        </table>
        `
        document.getElementById("generalStats").innerHTML = generalTable;
        document.getElementById("tpsTable").innerHTML = resultTable;
        document.getElementById("statistics").innerHTML = statsTable;
        document.getElementById("auraTable").innerHTML = auraTable;


        let timelineHeaderDOM = document.querySelector("#log-description")
        timelineHeaderDOM.innerHTML = `Calculated ${globals.config.iterations} iterations of ${globals.config.simDuration}s. fights using ${numWorkers} threads in ${(end-start)/1000} seconds.`
        timelineHeaderDOM.innerHTML += "</br>"
        timelineHeaderDOM.innerHTML += "Example fight:"
        timelineHeaderDOM.innerHTML += "</br>"

        let timelineDOM = document.querySelector("#log>pre>code")
        timelineDOM.innerHTML = ""
        exampleEvents.forEach( e => {
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
