"use strict";

// import * as papa from "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js";

function sleep(ms) { return new Promise((r) => 
    setTimeout(r, ms)); }

function average(array) {
    if (array) return array.reduce((a, b) => a + b) / array.length;
    else return 0;
};
const range = (length) =>
  Array.from({ length }, (_, i) => i)

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

// Fill the progressbar
async function updateProgressbar(progressPerc) {
    document.querySelector("#progressBar").style.width = `${progressPerc}%`
    await sleep(0);
}

// TODO: move this to a data file
const ITEM_SLOTS = ['head', 'hands', 'neck', 'waist', 'shoulders', 'legs', 'back', 'feet', 'chest', 'wrists', 'finger1', 'finger2', 'trinket1', 'trinket2', 'mainhand', 'offhand', 'ranged'];
const ITEM_IDS = {
  'head': [211843, 211505, 209690, 6971, 211510, 209682, 4724, 211789],
  'hands': [211423, 1978, 209568, 6397, 6974, 3485, 14754, 4254, 4253, 720],
  'neck': [209817, 20444, 209673, 209825, 209422],
  'waist': [211457, 209421, 6719, 6468, 7107, 211466, 4249, 3429, 14567, 14755, 4707],
  'shoulders': [209824, 13131, 209692, 209676, 2264, 210773, 4835, 4833, 4705, 3231, 3481],
  'legs': [209566, 13114, 13010, 10410, 6973, 4831, 6386, 2545, 6087, 4800, 14727, 3048],
  'back': [2059, 5193, 213087, 10518, 2953, 6751, 5971, 209680, 6449, 6340, 6314],
  'feet': [211511, 209581, 1955, 7754, 209689, 19969, 3484, 6752, 12982, 211506, 4051, 6666, 2910, 10658, 6459, 3045],
  'chest': [1717, 211504, 209418, 210794, 6972, 3416, 14744, 3049, 2870],
  'wrists': [211463, 204804, 3228, 6387, 7003, 13012, 6722, 6675, 5943, 4438, 14750, 897, 3212],
  'finger1': [12985, 2039, 2933, 211467, 209565, 1076, 20439, 6748, 4535, 1491, 4998, 6321, 13097],
  'finger2': [12985, 2039, 2933, 211467, 209565, 1076, 20439, 6748, 4535, 1491, 4998, 6321, 13097],
  'trinket1': [21568, 211451, 211449, 211420, 18854],
  'trinket2': [21568, 211451, 211449, 211420, 18854],
  'mainhand': [212583, 211456, 2941, 20443, 7786, 6194, 3414, 209560, 4454, 2194, 4826, 3400, 935, 4445, 2878, 1935, 1454, 212582, 1493, 3413, 1483, 209818, 20440, 2807, 209822, 2011, 1292, 9488, 209525, 209436, 209579, 6220, 1482],
  'offhand': [211460, 6223, 13079, 7002, 6320, 209424, 13245, 12997, 4064, 6676, 15891, 5443, 3656],
  'ranged': [209830, 209688, 3021, 209563],
};
var ITEMS = {};

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

    // log_message('Parsed CSV results:', parsedData);
  } catch (error) {
    console.error('Error:', error);
  }
  return parsedData;
}

function getRow(table, id) {
  for(let r of table) if (r.ID == id) return r;
}

function getRows(table, column, id) {
  let result = [];
  for(let r of table) if (r[column] == id) result.push(r);
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
      case 1: return "Axe";
      case 2: return "Bows";
      case 3: return "Guns";
      case 4: return "Mace";
      case 5: return "Mace";
      case 6: return "Polearm";
      case 7: return "Sword";
      case 8: return "Sword";
      case 10: return "Staff";
      case 13: return "Fist";
      case 14: return "Miscellaneous";
      case 15: return "Dagger";
      case 18: return "Crossbow";
      case 20: return "Fishing Pole";
    }
  }
}

async function loadItemData() {
  // const ids = [2244, 19351, 22422, 22418, 14551, 18805, 210794]; // Test data
  const ids = [].concat(...Object.values(ITEM_IDS));
  
  var Items = {};
  const itemDataCSV = await fetchTable('Item');
  const itemSparseDataCSV = await fetchTable('ItemSparse');
  const itemEffectData = await fetchTable('ItemEffect');
  const spellEffectData = await fetchTable('SpellEffect');

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
    if (id == 21568) {
      let debug = true;
    }
    if (!item) {
      missing = true;
      log_message("Missing item data for ID " + id + ".");
    } 
    if (!itemSparse) {
      missing = true;
      log_message("Missing itemSparse data for ID " + id + ".");
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
              // TODO: Staff, Mace, enabling multiple skilltypes if more items than edgies has it
              if (item.ID == 14551) obj.skilltype = ["Axe", "Dagger", "Sword"];
              else if (e.EffectMiscValue_0 == 44) obj.skilltype = ["Axe"];
              else if (e.EffectMiscValue_0 == 173) obj.skilltype = ["Dagger"];
              else if (e.EffectMiscValue_0 == 43) obj.skilltype = ["Sword"];
              else delete obj.skilltype;
            }
          });
        }
      }
    )}

    // TODO: Procs, of the tiger etc, striking

    Items[`${id}`] = obj;
  }
  // log_message('Items:', Items);
  ITEMS = Items;
}

function addEventListeners() {
    ITEM_SLOTS.forEach(slot => {
      const element = document.getElementById(slot + '-slot');
      element.addEventListener('click', function(event) {
        event.preventDefault();
        // var id = element.getAttribute('itemId');

        // selectItem(id, slot);
      })
    });

    document.body.addEventListener('click', function(event) {
        // Check if the clicked element is not part of the dropdown
        if (!event.target.closest('.custom-dropdown')) {
            ITEM_SLOTS.forEach(slot => {
              hideItemDropdown(slot);
            });
        }
    });


}


function showItemDropdown(slot) {
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

function selectItem(id, slot) {
  if (id != 0) {
    const element = document.getElementById(slot + '-slot');
    element.setAttribute('itemid', `${id}`)
    element.innerHTML = `<a href="https://classic.wowhead.com/item=${id}"  data-wh-rename-link="false" data-wh-icon-size="large"></a>`;

    const slotImg = document.getElementById(slot + '-slot-img');
    slotImg.style.display = 'none';
  } else {
    const element = document.getElementById(slot + '-slot');
    element.setAttribute('itemid', `${id}`)
    element.innerHTML = ``;

    const slotImg = document.getElementById(slot + '-slot-img');
    slotImg.style.display = 'block';
  }
  // Find the stats of the id
  // UpdateStats() with 
  window.$WowheadPower.refreshLinks(); // Needed?
}

function createLinks() {
  ITEM_SLOTS.forEach(slot => {
    var dropdownContent = document.getElementById(slot + '-slot-dropdown-content');

    // Clear any existing content
    dropdownContent.innerHTML = '';

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
      selectItem('0', slot);
      hideItemDropdown(slot);
      updateStats();
    });
    dropdownContent.appendChild(unequip);

    // Create a link for each id in the array
    ITEM_IDS[slot].forEach(id => {
        const link = document.createElement('a');
        link.href = `https://www.wowhead.com/classic/item=${id}`;
        link.id = `${id}`
        
        link.addEventListener('click', function(event) {
          event.preventDefault();
          selectItem(id, slot);
          hideItemDropdown(slot);
          updateStats();
        })
        dropdownContent.appendChild(link);
    });
  }); 
  window.$WowheadPower.refreshLinks();
}

function saveInput()
{
  let profiles = localStorage.getItem("sod_profiles");
  profiles = profiles ? JSON.parse(profiles) : {};
  let profile = {};
  let profile_name = "Default"; // TODO: Turn into user input
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

  profiles[`${profile_name}`] = profile;
  localStorage.setItem("sod_profiles", JSON.stringify(profiles));

    // Tank Settings
    localStorage.setItem("level", document.querySelector("#level").selectedIndex)
    localStorage.setItem("race", document.querySelector("#race").selectedIndex)
    // localStorage.setItem("head", document.querySelector("#head").selectedIndex)
    // localStorage.setItem("neck", document.querySelector("#neck").selectedIndex)
    // localStorage.setItem("shoulder", document.querySelector("#shoulder").selectedIndex)
    // localStorage.setItem("cape", document.querySelector("#cape").selectedIndex)
    // localStorage.setItem("chest", document.querySelector("#chest").selectedIndex)
    // localStorage.setItem("wrist", document.querySelector("#wrist").selectedIndex)
    // localStorage.setItem("hands", document.querySelector("#hands").selectedIndex)
    // localStorage.setItem("waist", document.querySelector("#waist").selectedIndex)
    // localStorage.setItem("legs", document.querySelector("#legs").selectedIndex)
    // localStorage.setItem("feet", document.querySelector("#feet").selectedIndex)
    // localStorage.setItem("ringone", document.querySelector("#ringone").selectedIndex)
    // localStorage.setItem("ringtwo", document.querySelector("#ringtwo").selectedIndex)
    // localStorage.setItem("trinketone", document.querySelector("#trinketone").selectedIndex)
    // localStorage.setItem("trinkettwo", document.querySelector("#trinkettwo").selectedIndex)
    // localStorage.setItem("ranged", document.querySelector("#ranged").selectedIndex)
    // localStorage.setItem("mainhand", document.querySelector("#mainhand").selectedIndex)
    // localStorage.setItem("offhand", document.querySelector("#offhand").selectedIndex)
    // localStorage.setItem("mhweptypelist", document.getElementById("mhweptypelist").selectedIndex)
    // localStorage.setItem("ohweptypelist", document.getElementById("ohweptypelist").selectedIndex)

    localStorage.setItem("headenchant", document.querySelector("#headenchant").selectedIndex)
    localStorage.setItem("shoulderenchant", document.querySelector("#shoulderenchant").selectedIndex)
    localStorage.setItem("backenchant", document.querySelector("#backenchant").selectedIndex)
    localStorage.setItem("chestenchant", document.querySelector("#chestenchant").selectedIndex)
    localStorage.setItem("wristenchant", document.querySelector("#wristenchant").selectedIndex)
    localStorage.setItem("handenchant", document.querySelector("#handenchant").selectedIndex)
    localStorage.setItem("legenchant", document.querySelector("#legenchant").selectedIndex)
    localStorage.setItem("feetenchant", document.querySelector("#feetenchant").selectedIndex)
    localStorage.setItem("mhwepenchant", document.querySelector("#mhwepenchant").selectedIndex)
    localStorage.setItem("ohwepenchant", document.querySelector("#ohwepenchant").selectedIndex)

    localStorage.setItem("startRage", document.querySelector("#startRage").value)
    // localStorage.setItem("deathwish", document.querySelector("#deathwish").checked)
    // localStorage.setItem("windfury", document.querySelector("#windfury").checked)
    localStorage.setItem("wcb", document.querySelector("#wcb").checked)
    localStorage.setItem("dmf", document.querySelector("#dmf").checked)

    // Talents 
    // localStorage.setItem("deathwish", document.getElementById("deathwish").checked);
    // localStorage.setItem("bloodthirst", document.getElementById("bloodthirst").checked);
    // localStorage.setItem("shieldslam", document.getElementById("shieldslam").checked);
    localStorage.setItem("deflection", document.getElementById("deflection").value)
    localStorage.setItem("cruelty", document.getElementById("cruelty").value)
    localStorage.setItem("anticipation", document.getElementById("anticipation").value)
    localStorage.setItem("shieldspec", document.getElementById("shieldspec").value)
    localStorage.setItem("toughness", document.getElementById("toughness").value)
    localStorage.setItem("impHS", document.querySelector("#impHS").value) 
    localStorage.setItem("impSA", document.querySelector("#impSA").value) 
    localStorage.setItem("impRend", document.querySelector("#impRend").value) 
    localStorage.setItem("impale", document.querySelector("#impale").value) 
    localStorage.setItem("defiance", document.querySelector("#defiance").value) 
    // localStorage.setItem("dwspec", document.querySelector("#dwspec").value) 
    localStorage.setItem("enrage", document.querySelector("#enrage").value) 
    localStorage.setItem("deepWounds", document.querySelector("#deepWounds").value) 
    
    // Other Bonuses
    // localStorage.setItem("twoPieceDreadnaught", document.querySelector("#twoPieceDreadnaught").checked)
    // localStorage.setItem("threePieceConqueror", document.getElementById("threePieceConqueror").checked)
    // localStorage.setItem("fivePieceWrath", document.querySelector("#fivePieceWrath").checked)
    // localStorage.setItem("berserking", document.querySelector("#berserking").checked)
    localStorage.setItem("devastate", document.querySelector("#devastate").checked)
    localStorage.setItem("endlessRage", document.querySelector("#endlessRage").checked)
    // localStorage.setItem("quickStrike", document.querySelector("#quickStrike").checked)
    localStorage.setItem("consumedByRage", document.querySelector("#consumedByRage").checked)
    localStorage.setItem("furiousThunder", document.querySelector("#furiousThunder").checked)
    localStorage.setItem("ragingBlow", document.querySelector("#ragingBlow").checked)
    localStorage.setItem("flagellation", document.querySelector("#flagellation").checked)
    localStorage.setItem("bloodFrenzy", document.querySelector("#bloodFrenzy").checked)
    
    // Buffs
    localStorage.setItem("mhstone", document.getElementById("mhstone").selectedIndex);
    localStorage.setItem("ohstone", document.getElementById("ohstone").selectedIndex);
    localStorage.setItem("strbuff", document.getElementById("strbuff").selectedIndex);
    localStorage.setItem("apbuff", document.getElementById("apbuff").selectedIndex);
    localStorage.setItem("agibuff", document.getElementById("agibuff").selectedIndex);
    localStorage.setItem("statbuff", document.getElementById("statbuff").selectedIndex);
    localStorage.setItem("foodbuff", document.getElementById("foodbuff").selectedIndex);
    localStorage.setItem("alcohol", document.getElementById("alcohol").selectedIndex);
    localStorage.setItem("potion", document.getElementById("potion").selectedIndex);

    localStorage.setItem("inspiration", document.getElementById("inspiration").checked);
    localStorage.setItem("devo", document.getElementById("devo").checked);
    localStorage.setItem("imploh", document.getElementById("imploh").checked);

    // localStorage.setItem("goa", document.getElementById("goa").checked);
    localStorage.setItem("CoV", document.getElementById("CoV").checked);
    localStorage.setItem("armorelixir", document.getElementById("armorelixir").checked);
    localStorage.setItem("hpelixir", document.getElementById("hpelixir").checked);
    // localStorage.setItem("titans", document.getElementById("titans").checked);
    localStorage.setItem("dragonslayer", document.getElementById("dragonslayer").checked);
    localStorage.setItem("boonOfTheBlackfathom", document.getElementById("boonOfTheBlackfathom").checked);
    localStorage.setItem("ashenvaleCry", document.getElementById("ashenvaleCry").checked);
    localStorage.setItem("zandalar", document.getElementById("zandalar").checked);
    localStorage.setItem("wcb", document.getElementById("wcb").checked);
    localStorage.setItem("dmf", document.getElementById("dmf").checked);
    localStorage.setItem("dmstamina", document.getElementById("dmstamina").checked);
    localStorage.setItem("dmAP", document.getElementById("dmAP").checked);
    localStorage.setItem("dmspell", document.getElementById("dmspell").checked);
    localStorage.setItem("songflower", document.getElementById("songflower").checked);
    localStorage.setItem("bshout", document.getElementById("bshout").checked);
    // localStorage.setItem("pack", document.getElementById("pack").checked);
    // localStorage.setItem("trueshot", document.getElementById("trueshot").checked);
    localStorage.setItem("mark", document.getElementById("mark").checked);
    localStorage.setItem("fortitude", document.getElementById("fortitude").checked);
    localStorage.setItem("bloodpact", document.getElementById("bloodpact").checked);
    localStorage.setItem("kings", document.getElementById("kings").checked);
    localStorage.setItem("might", document.getElementById("might").checked);
    localStorage.setItem("hornOfLord", document.getElementById("hornOfLord").checked);
    localStorage.setItem("mangle", document.getElementById("mangle").checked);
    // localStorage.setItem("windfury", document.getElementById("windfury").checked);
    localStorage.setItem("strofearth", document.getElementById("strofearth").checked);
    localStorage.setItem("wildStrikes", document.getElementById("wildStrikes").checked);
    // localStorage.setItem("graceofair", document.getElementById("graceofair").checked);
    // localStorage.setItem("impweptotems", document.getElementById("impweptotems").checked);

    // Boss Settings
    localStorage.setItem("bossLevel", document.querySelector("#bossLevel").selectedIndex)
    localStorage.setItem("swingMin", document.querySelector("#swingMin").value)
    localStorage.setItem("swingMax", document.querySelector("#swingMax").value)
    localStorage.setItem("swingTimer", document.querySelector("#swingTimer").value)
    localStorage.setItem("bossarmor", document.querySelector("#bossarmor").value)

    localStorage.setItem("curseofrecklessness", document.querySelector("#curseofrecklessness").checked)
    localStorage.setItem("faeriefire", document.querySelector("#faeriefire").checked)
    // localStorage.setItem("debuffdelay", document.querySelector("#debuffdelay").value)
    localStorage.setItem("iea", document.querySelector("#iea").checked)
    localStorage.setItem("homunculi", document.querySelector("#homunculi").checked)
    // localStorage.setItem("bshouttargets", document.querySelector("#bshouttargets").value)
    // localStorage.setItem("ieadelay", document.querySelector("#ieadelay").value)

    // Calc Settings
    localStorage.setItem("iterations", document.querySelector("#iterations").value)
    localStorage.setItem("fightLength", document.querySelector("#fightLength").value)

}

function loadInput()
{
  // Gear
  let profiles = localStorage.getItem("sod_profiles");
  profiles = profiles ? JSON.parse(profiles) : {};
  let profile_name = "Default"; // TODO: Make user input
  let profile = profiles[`${profile_name}`];
  profile = profile ? profile : {};
  let gear = profile.gear ? profile.gear : {};

  Object.keys(gear).forEach(slot => {
    let element = document.getElementById(slot + '-slot');
    if (element) {
      element.setAttribute('itemid', gear[`${slot}`]); // Update the HTML
      selectItem(gear[`${slot}`], slot); // Update the UI
    }
  });

    // Tank Settings
    document.querySelector("#level").selectedIndex = localStorage.getItem("level") ? localStorage.getItem("level") : 0;
    document.querySelector("#race").selectedIndex = localStorage.getItem("race") ? localStorage.getItem("race") : 0;
    // document.querySelector("#head").selectedIndex = localStorage.getItem("head") ? localStorage.getItem("head") : 0;
    // document.querySelector("#neck").selectedIndex = localStorage.getItem("neck") ? localStorage.getItem("neck") : 0;
    // document.querySelector("#shoulder").selectedIndex = localStorage.getItem("shoulder") ? localStorage.getItem("shoulder") : 0;
    // document.querySelector("#cape").selectedIndex = localStorage.getItem("cape") ? localStorage.getItem("cape") : 0;
    // document.querySelector("#chest").selectedIndex = localStorage.getItem("chest") ? localStorage.getItem("chest") : 0;
    // document.querySelector("#wrist").selectedIndex = localStorage.getItem("wrist") ? localStorage.getItem("wrist") : 0;
    // document.querySelector("#hands").selectedIndex = localStorage.getItem("hands") ? localStorage.getItem("hands") : 0;
    // document.querySelector("#waist").selectedIndex = localStorage.getItem("waist") ? localStorage.getItem("waist") : 0;
    // document.querySelector("#legs").selectedIndex = localStorage.getItem("legs") ? localStorage.getItem("legs") : 0;
    // document.querySelector("#feet").selectedIndex = localStorage.getItem("feet") ? localStorage.getItem("feet") : 0;
    // document.querySelector("#ringone").selectedIndex = localStorage.getItem("ringone") ? localStorage.getItem("ringone") : 0;
    // document.querySelector("#ringtwo").selectedIndex = localStorage.getItem("ringtwo") ? localStorage.getItem("ringtwo") : 0;
    // document.querySelector("#trinketone").selectedIndex = localStorage.getItem("trinketone") ? localStorage.getItem("trinketone") : 0;
    // document.querySelector("#trinkettwo").selectedIndex = localStorage.getItem("trinkettwo") ? localStorage.getItem("trinkettwo") : 0;
    // document.querySelector("#ranged").selectedIndex = localStorage.getItem("ranged") ? localStorage.getItem("ranged") : 0;
    // document.querySelector("#mhweptypelist").selectedIndex = localStorage.getItem("mhweptypelist") ? localStorage.getItem("mhweptypelist") : 0;
    // document.querySelector("#ohweptypelist").selectedIndex = localStorage.getItem("ohweptypelist") ? localStorage.getItem("ohweptypelist") : 0;
    // updateMHWeaponList(false);
    // updateOHWeaponList(false);
    // document.querySelector("#mainhand").selectedIndex = localStorage.getItem("mainhand") ? localStorage.getItem("mainhand") : 0;
    // document.querySelector("#offhand").selectedIndex = localStorage.getItem("offhand") ? localStorage.getItem("offhand") : 0;

    document.querySelector("#headenchant").selectedIndex = localStorage.getItem("headenchant") ? Math.min(localStorage.getItem("headenchant"), 5) : 0;
    document.querySelector("#shoulderenchant").selectedIndex = localStorage.getItem("shoulderenchant") ? localStorage.getItem("shoulderenchant") : 0;
    document.querySelector("#backenchant").selectedIndex = localStorage.getItem("backenchant") ? localStorage.getItem("backenchant") : 0;
    document.querySelector("#chestenchant").selectedIndex = localStorage.getItem("chestenchant") ? localStorage.getItem("chestenchant") : 0;
    document.querySelector("#wristenchant").selectedIndex = localStorage.getItem("wristenchant") ? localStorage.getItem("wristenchant") : 0;
    document.querySelector("#handenchant").selectedIndex = localStorage.getItem("handenchant") ? localStorage.getItem("handenchant") : 0;
    document.querySelector("#legenchant").selectedIndex = localStorage.getItem("legenchant") ? Math.min(localStorage.getItem("legenchant"), 5) : 0;
    document.querySelector("#feetenchant").selectedIndex = localStorage.getItem("feetenchant") ? localStorage.getItem("feetenchant") : 0;
    document.querySelector("#mhwepenchant").selectedIndex = localStorage.getItem("mhwepenchant") ? localStorage.getItem("mhwepenchant") : 0;
    document.querySelector("#ohwepenchant").selectedIndex = localStorage.getItem("ohwepenchant") ? localStorage.getItem("ohwepenchant") : 0;

    document.querySelector("#startRage").value = localStorage.getItem("startRage") ? localStorage.getItem("startRage") : 70;
    // document.querySelector("#windfury").checked = localStorage.getItem("windfury") == "true" ? true : false;
    document.querySelector("#wcb").checked = localStorage.getItem("wcb") == "true" ? true : false;
    document.querySelector("#dmf").checked = localStorage.getItem("dmf") == "true" ? true : false;

    // Talents 
    // document.getElementById("deathwish").checked = localStorage.getItem("deathwish") == "false" ? false : true;
    // document.getElementById("bloodthirst").checked = localStorage.getItem("bloodthirst") == "false" ? false : true;
    // document.getElementById("shieldslam").checked = localStorage.getItem("shieldslam") == "true" ? true : false;
    document.getElementById("deflection").value = localStorage.getItem("deflection") ? localStorage.getItem("deflection") : 0;
    document.getElementById("cruelty").value = localStorage.getItem("cruelty") ? localStorage.getItem("cruelty") : 0;
    document.getElementById("anticipation").value = localStorage.getItem("anticipation") ? localStorage.getItem("anticipation") : 0;
    document.getElementById("shieldspec").value = localStorage.getItem("shieldspec") ? localStorage.getItem("shieldspec") : 0;
    document.getElementById("toughness").value = localStorage.getItem("toughness") ? localStorage.getItem("toughness") : 0;
    document.querySelector("#impHS").value = localStorage.getItem("impHS") ? localStorage.getItem("impHS") : 0; 
    document.querySelector("#impSA").value = localStorage.getItem("impSA") ? localStorage.getItem("impSA") : 0; 
    document.querySelector("#impRend").value = localStorage.getItem("impRend") ? localStorage.getItem("impRend") : 0; 
    document.querySelector("#impale").value = localStorage.getItem("impale") ? localStorage.getItem("impale") : 0; 
    document.querySelector("#defiance").value = localStorage.getItem("defiance") ? localStorage.getItem("defiance") : 0; 
    // document.querySelector("#dwspec").value = localStorage.getItem("dwspec") ? localStorage.getItem("dwspec") : 0; 
    document.querySelector("#enrage").value = localStorage.getItem("enrage") ? localStorage.getItem("enrage") : 0; 
    document.querySelector("#deepWounds").value = localStorage.getItem("deepWounds") ? localStorage.getItem("deepWounds") : 0; 
    
    // Other Bonuses
    // document.querySelector("#twoPieceDreadnaught").checked = localStorage.getItem("twoPieceDreadnaught") == "true" ? true : false;
    // document.querySelector("#threePieceConqueror").checked = localStorage.getItem("threePieceConqueror") == "true" ? true : false;
    // document.querySelector("#fivePieceWrath").checked = localStorage.getItem("fivePieceWrath") == "true" ? true : false;
    // document.querySelector("#berserking").checked = localStorage.getItem("berserking") == "true" ? true : false;
    document.querySelector("#devastate").checked = localStorage.getItem("devastate") == "true" ? true : false;
    document.querySelector("#endlessRage").checked = localStorage.getItem("endlessRage") == "true" ? true : false;
    // document.querySelector("#quickStrike").checked = localStorage.getItem("quickStrike") == "true" ? true : false;
    document.querySelector("#consumedByRage").checked = localStorage.getItem("consumedByRage") == "true" ? true : false;
    document.querySelector("#furiousThunder").checked = localStorage.getItem("furiousThunder") == "true" ? true : false;
    document.querySelector("#ragingBlow").checked = localStorage.getItem("ragingBlow") == "true" ? true : false;
    document.querySelector("#flagellation").checked = localStorage.getItem("flagellation") == "true" ? true : false;
    document.querySelector("#bloodFrenzy").checked = localStorage.getItem("bloodFrenzy") == "true" ? true : false;

    // Buffs
    document.getElementById("mhstone").selectedIndex = localStorage.getItem("mhstone") ? localStorage.getItem("mhstone") : 0;
    document.getElementById("ohstone").selectedIndex = localStorage.getItem("ohstone") ? localStorage.getItem("ohstone") : 0;
    document.getElementById("strbuff").selectedIndex = localStorage.getItem("strbuff") ? localStorage.getItem("strbuff") : 0;
    document.getElementById("apbuff").selectedIndex = localStorage.getItem("apbuff") ? localStorage.getItem("apbuff") : 0;
    document.getElementById("agibuff").selectedIndex = localStorage.getItem("agibuff") ? localStorage.getItem("agibuff") : 0;
    document.getElementById("statbuff").selectedIndex = localStorage.getItem("statbuff") ? localStorage.getItem("statbuff") : 0;
    document.getElementById("foodbuff").selectedIndex = localStorage.getItem("foodbuff") ? localStorage.getItem("foodbuff") : 0;
    document.getElementById("alcohol").selectedIndex = localStorage.getItem("alcohol") ? localStorage.getItem("alcohol") : 0;
    document.getElementById("potion").selectedIndex = localStorage.getItem("potion") ? localStorage.getItem("potion") : 0;

    document.getElementById("inspiration").checked = localStorage.getItem("inspiration") == "true" ? true : false;
    document.getElementById("devo").checked = localStorage.getItem("devo") == "true" ? true : false;
    document.getElementById("imploh").checked = localStorage.getItem("imploh") == "true" ? true : false;

    // document.getElementById("goa").checked = localStorage.getItem("goa") == "true" ? true : false;
    document.getElementById("CoV").checked = localStorage.getItem("CoV") == "true" ? true : false;// 
    document.getElementById("armorelixir").checked = localStorage.getItem("armorelixir") == "true" ? true : false;
    document.getElementById("hpelixir").checked = localStorage.getItem("hpelixir") == "true" ? true : false;
    // document.getElementById("titans").checked = localStorage.getItem("titans") == "true" ? true : false;
    document.getElementById("dragonslayer").checked = localStorage.getItem("dragonslayer") == "true" ? true : false;
    document.getElementById("boonOfTheBlackfathom").checked = localStorage.getItem("boonOfTheBlackfathom") == "true" ? true : false;
    document.getElementById("ashenvaleCry").checked = localStorage.getItem("ashenvaleCry") == "true" ? true : false;
    document.getElementById("zandalar").checked = localStorage.getItem("zandalar") == "true" ? true : false;
    document.getElementById("wcb").checked = localStorage.getItem("wcb") == "true" ? true : false;
    document.getElementById("dmf").checked = localStorage.getItem("dmf") == "true" ? true : false;
    document.getElementById("dmstamina").checked = localStorage.getItem("dmstamina") == "true" ? true : false;
    document.getElementById("dmAP").checked = localStorage.getItem("dmAP") == "true" ? true : false;
    document.getElementById("dmspell").checked = localStorage.getItem("dmspell") == "true" ? true : false;
    document.getElementById("songflower").checked = localStorage.getItem("songflower") == "true" ? true : false;
    document.getElementById("bshout").checked = localStorage.getItem("bshout") == "true" ? true : false;
    // document.getElementById("pack").checked = localStorage.getItem("pack") == "true" ? true : false;
    // document.getElementById("trueshot").checked = localStorage.getItem("trueshot") == "true" ? true : false;
    document.getElementById("mark").checked = localStorage.getItem("mark") == "true" ? true : false;
    document.getElementById("fortitude").checked = localStorage.getItem("fortitude") == "true" ? true : false;
    document.getElementById("bloodpact").checked = localStorage.getItem("bloodpact") == "true" ? true : false;
    document.getElementById("kings").checked = localStorage.getItem("kings") == "true" ? true : false;
    document.getElementById("might").checked = localStorage.getItem("might") == "true" ? true : false;
    document.getElementById("hornOfLord").checked = localStorage.getItem("hornOfLord") == "true" ? true : false;
    document.getElementById("mangle").checked = localStorage.getItem("mangle") == "true" ? true : false;
    // document.getElementById("windfury").checked = localStorage.getItem("windfury") == "true" ? true : false;
    document.getElementById("strofearth").checked = localStorage.getItem("strofearth") == "true" ? true : false;
    document.getElementById("wildStrikes").checked = localStorage.getItem("wildStrikes") == "true" ? true : false;
    // document.getElementById("graceofair").checked = localStorage.getItem("graceofair") == "true" ? true : false;
    // document.getElementById("impweptotems").checked = localStorage.getItem("impweptotems") == "true" ? true : false;

    // Boss Settings
    document.querySelector("#bossLevel").selectedIndex = localStorage.getItem("bossLevel") ? localStorage.getItem("bossLevel") : 1;
    document.querySelector("#swingMin").value = localStorage.getItem("swingMin") ? localStorage.getItem("swingMin") : 170;
    document.querySelector("#swingMax").value = localStorage.getItem("swingMax") ? localStorage.getItem("swingMax") : 200;
    document.querySelector("#swingTimer").value = localStorage.getItem("swingTimer") ? localStorage.getItem("swingTimer") : 2;
    document.querySelector("#bossarmor").value = localStorage.getItem("bossarmor") ? localStorage.getItem("bossarmor") : 1108;
    document.querySelector("#curseofrecklessness").checked = localStorage.getItem("curseofrecklessness") == "false" ? false : true;
    document.querySelector("#faeriefire").checked = localStorage.getItem("faeriefire") == "false" ? false : true;
    // document.querySelector("#debuffdelay").value = localStorage.getItem("debuffdelay") ? localStorage.getItem("debuffdelay") : 0;
    document.querySelector("#iea").checked = localStorage.getItem("iea") == "true" ? true : false;
    document.querySelector("#homunculi").checked = localStorage.getItem("homunculi") == "true" ? true : false;
    // document.querySelector("#bshouttargets").value = localStorage.getItem("bshouttargets") ? localStorage.getItem("bshouttargets") : 5;
    // document.querySelector("#ieadelay").value = localStorage.getItem("ieadelay") ? localStorage.getItem("ieadelay") : 10;

    // Calc Settings
    document.querySelector("#iterations").value = localStorage.getItem("iterations") ? localStorage.getItem("iterations") : 10000;
    document.querySelector("#fightLength").value = localStorage.getItem("fightLength") ? localStorage.getItem("fightLength") : 12;
}  

async function onLoadPage()
{
    createLinks();
    addEventListeners();
    await loadItemData();
    loadInput();
    updateStats();
}

async function main() {

    // Cache the user input locally
    saveInput();
    // Fetch and set all user input settings
    //fetchSettings()
    const globals = updateStats();
    
    document.getElementById("errorContainer").innerHTML = ""
    if(Number(document.getElementById("fightLength").value) > 120){
        document.getElementById("errorContainer").innerHTML = "Please choose a fight duration below 120."
        return;
    }

    let start = Date.now()
    let results = {};
    let uptimes = {};
    let tps = []
    let dps = []
    let dtps = []
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
            log_message(`Error: Line ${e.lineno} in ${e.filename}: ${e.message}`)
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
                // for (let ability in e.data.uptimes) {
                //     if(!uptimes[`${ability}`]) uptimes[`${ability}`] = [];
                //     uptimes[`${ability}`] = uptimes[`${ability}`].concat(e.data.uptimes[`${ability}`]);
                // }
                tps = tps.concat(e.data.results.tps);
                dps = dps.concat(e.data.results.dps);
                dtps = dtps.concat(e.data.results.dtps);
                // rageGained = rageGained.concat(e.data.rageGained);
                // rageSpent = rageSpent.concat(e.data.rageSpent);
                // snapshots = snapshots.concat(e.data.snapshots);
                // breaches += e.data.breaches;
                // bossSwings += e.data.bossSwings;
                if (++numWorkersDone === numWorkers) {
                    exampleEvents = e.data.events
                    postResults();
                }
            }
        })
    }
    
    function postResults() {

        let end = Date.now()
        // log_message(`Boss swingtimer: ${(globals.config.simDuration * globals.config.iterations)/bossSwings}`)
        // Some console logging...
        let ret = `Calculated ${globals.config.iterations} iterations of ${globals.config.simDuration}s. fights with timestep ${globals.config.timeStep} ms using ${numWorkers} threads in ${(end-start)/1000} seconds.`;
        /*
        log_message(ret);
        log_message(`TPS: ${Math.round(average(tps)*100)/100}`);
        log_message(`DPS: ${Math.round(average(dps)*100)/100}`);
        log_message(`DTPS: ${Math.round(average(dtps)*100)/100}`);
        for (let ability in results)
            log_message(`${ability}: ${Math.round(average(results[`${ability}`])*100)/100}`);
        log_message(`gainRPS: ${Math.round(average(rageGained)*100)/100}`);
        log_message(`spentRPS: ${Math.round(average(rageSpent)*100)/100}`);
        */

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
          // average(b[1].tps) - average(a[1].tps)
          // return
        })

        let resultTable = `<table><tr><th>Ability</th><th>TPS</th><th>DPS</th><th>Casts</th><th>Hits</th></tr>`;
        let totalTps = 0;
        let totalDps = 0;
        for (let i in sortedResults) {
          let result = {tps: 0, dps: 0, casts: 0, hits: 0};
          if (sortedResults[i]) {
            result = sortedResults[i][1].reduce((accumulator, element) => {
              accumulator.tps += element.tps;
              accumulator.dps += element.dps;
              accumulator.casts += element.casts;
              accumulator.hits += element.hits
              return accumulator;
            }, { tps: 0, dps: 0, hits: 0, casts: 0 });
          }
          resultTable = resultTable.concat(`<tr><td>${sortedResults[i][0]}:</td><td>${Math.round(result.tps/iterations*100)/100}</td><td>${Math.round(result.dps/iterations*100)/100}</td><td>${Math.round(result.casts/iterations*100)/100}</td><td>${Math.round(result.hits/iterations*100)/100}</td></tr>`)
          totalTps += result.tps;
          totalDps += result.dps;
        }
        resultTable = resultTable.concat(`<tr><td>Total:</td><td>${Math.round(totalTps/iterations*100)/100}</td><td>${Math.round(totalDps/iterations*100)/100}</td></tr>`)
        resultTable = resultTable.concat(`</table>`)
        let statsTable = 
        `<table>
        <tr><th>Statistics</th></tr>
        <tr><td>TPS standard deviation:</td><td>${Math.round(std(tps)*100)/100}</ts><td> (${Math.round(std(tps)/average(tps)*10000)/100}%)</td></tr>
        <tr><td>DPS standard deviation:</td><td>${Math.round(std(dps)*100)/100}</ts><td> (${Math.round(std(dps)/average(dps)*10000)/100}%)</td></tr>
        </table>`
        // <tr><td>Threshold failed:</td><td>${breaches}</ts><td> (${Math.round(breaches/globals.config.iterations*10000)/100}%)</td></tr>

        let generalTable = 
        `<table>
        <tr><th>General Stats</th></tr>
        <tr><td>TPS: </td><td>${Math.round(average(tps)*100)/100}</td></tr>
        <tr><td>DPS: </td><td>${Math.round(average(dps)*100)/100}</td></tr>
        <tr><td>DTPS: </td><td>${Math.round(average(dtps)*100)/100}</td></tr>
        `
        // <tr><td>RPS gained: </td><td>${Math.round(average(rageGained)*100)/100}</td></tr>
        // <tr><td>RPS spent: </td><td>${Math.round(average(rageSpent)*100)/100}</td></tr>
/*
        for(let ability in uptimes) {
            uptimes[`${ability}`] = [...Array(globals.config.iterations - uptimes[`${ability}`].length)].map((_, i) => 0).concat(uptimes[`${ability}`])
        }
        let sortedUptimes = Object.keys(uptimes).map(key => [key, uptimes[key]])
        sortedUptimes.sort((a,b) => average(b[1]) - average(a[1]))
        for (let i in sortedUptimes) {
            //sortedUptimes[i][1] = sortedUptimes[i][1].concat([...Array(globals.config.iterations - sortedUptimes[i][1].length)].map((_, i) => 0)) // fill with zeros
            generalTable = generalTable.concat(`<tr><td>${sortedUptimes[i][0]} uptime:</td><td>${Math.round(average(sortedUptimes[i][1])*100)/100}%</td></tr>`)
        }
        generalTable = generalTable.concat(`</table>`)
*/

        document.getElementById("resultsHeader").innerHTML = `<h2>Results</h2>`
        document.getElementById("generalStats").innerHTML = generalTable;
        document.getElementById("abilitytps").innerHTML = resultTable;
        document.getElementById("statistics").innerHTML = statsTable;

        let timelineHeaderDOM = document.querySelector("#timeline>div")
        timelineHeaderDOM.innerHTML = `Calculated ${globals.config.iterations} iterations of ${globals.config.simDuration}s. fights using ${numWorkers} threads in ${(end-start)/1000} seconds.`
        timelineHeaderDOM.innerHTML += "</br>"
        timelineHeaderDOM.innerHTML += "Example fight:"
        timelineHeaderDOM.innerHTML += "</br>"

        let timelineDOM = document.querySelector("#timeline>pre>code")
        timelineDOM.innerHTML = ""
        exampleEvents.forEach( e => {
            timelineDOM.innerHTML += formatEvent(e)
            timelineDOM.innerHTML += "</br>"
        })
/*
        var x = linspace(0, globals.config.simDuration, globals.config.simDuration*1000/globals.config.snapshotLen + 1);

        let lineShape = document.querySelector("#lineSelect").options[document.querySelector("#lineSelect").selectedIndex].value

        // Make the graph
        var y_avg = [];
        var y_99 = [];
        var y_95 = [];
        var y_05 = [];
        var y_01 = [];
        snapshots.forEach(snapshot => {
            y_avg.push(Math.round(average(snapshot)));
            y_99.push(Math.round(quantile(snapshot, 0.99)));
            y_95.push(Math.round(quantile(snapshot, 0.95)));
            y_05.push(Math.round(quantile(snapshot, 0.05)));
            y_01.push(Math.round(quantile(snapshot, 0.01)));
        });

        var traceAvg = {
            x: x,
            y: y_avg,
            mode: 'lines+markers',
            name: "Average Threat",
            line: {
                color: '#939C56',
                shape: `${lineShape}`,
            },
            marker: {
                size: 4,
            }
        }

        var trace99 = {
            x: x,
            y: y_99,
            mode: 'lines+markers',
            name: "99th percentile",
            line: {
                color: '#569C81',
                shape: `${lineShape}`,
            },
            marker: {
                size: 4,
            }
        }

        var trace95 = {
            x: x,
            y: y_95,
            mode: 'lines+markers',
            name: "95th percentile",
            line: {
                color: '#569B65',
                shape: `${lineShape}`,
            },
            marker: {
                size: 4,
            }
        }

        var trace05 = {
            x: x,
            y: y_05,
            mode: 'lines+markers',
            name: "5th percentile",
            line: {
                color: '#966C44',
                shape: `${lineShape}`,
            },
            marker: {
                size: 4,
            }
        }
        var trace01 = {
            x: x,
            y: y_01,
            mode: 'lines+markers',
            name: "1st percentile",
            line: {
                color: '#964343',
                shape: `${lineShape}`,
            },
            marker: {
                size: 4,
            }
        }

    // BG grey 222629
    // dark grey 474b4f
    // medium grey 6b6e70
    // light gray c8ced1


        var plotData = [ trace99, trace95, traceAvg, trace05, trace01 ];
        var layout = {
            title: 'Threat Distribution',
            width: 1440,
            height: 810,

            plot_bgcolor: "#222629",
            paper_bgcolor: "#222629",
            
            titlefont: {color: "#c8ced1"}, 
            xaxis:{
                title:"Time (s)", 
                titlefont: {color: "#c8ced1"},
                tickfont: {color: "#c8ced1"}, 
                rangemode: "tozero",
                gridcolor: "#474b4f",
                linecolor: "#c8ced1",
                autotick: false,
                ticks: 'outside',
                tick0: 0,
                dtick: 1.5,
            },
            yaxis:{
                title:"Threat",
                titlefont: {color: "#c8ced1"},
                tickcolor: "#c8ced1",
                tickfont: {color: "#c8ced1"},
                rangemode: "tozero",
                gridcolor: "#474b4f",
                linecolor: "#c8ced1"},
            legend: {font: {color: "#c8ced1"}},
        }
        Plotly.newPlot('plotContainer', plotData, layout);
*/
        document.querySelector("#progressBar").style.display = `none`;
        document.querySelector("#barContainer").style.display = `none`;
        document.querySelector("#plotContainer").style.display = `block`;
        document.querySelector("#resultContainer").style.display = `block`;
        document.querySelector("#timeline").style.display = `block`;
    }
}


