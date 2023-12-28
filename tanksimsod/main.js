"use strict";

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
const ABILITIES = ["revenge", "raging-blow", "rend", "devastate", "heroic-strike", "shield-block"];
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
        if (spell.SpellID == 9140)
          var x = 15;

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

  // Rotation
  let rotation = {};
  ABILITIES.forEach(ability => {
    let obj = {};
    let use = document.getElementById('use-' + ability).checked;
    let rage = 0;
    if (ability != 'raging-blow')
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

  profiles[`${profile_name}`] = profile;
  localStorage.setItem("sod_profiles", JSON.stringify(profiles));

    // Tank Settings
    localStorage.setItem("level", document.querySelector("#level").selectedIndex)
    localStorage.setItem("race", document.querySelector("#race").selectedIndex)
    
    localStorage.setItem("sod_headenchant", document.querySelector("#headenchant").selectedIndex)
    localStorage.setItem("sod_shoulderenchant", document.querySelector("#shoulderenchant").selectedIndex)
    localStorage.setItem("sod_backenchant", document.querySelector("#backenchant").selectedIndex)
    localStorage.setItem("sod_chestenchant", document.querySelector("#chestenchant").selectedIndex)
    localStorage.setItem("sod_wristenchant", document.querySelector("#wristenchant").selectedIndex)
    localStorage.setItem("sod_handenchant", document.querySelector("#handenchant").selectedIndex)
    localStorage.setItem("sod_legenchant", document.querySelector("#legenchant").selectedIndex)
    localStorage.setItem("sod_feetenchant", document.querySelector("#feetenchant").selectedIndex)
    localStorage.setItem("sod_mhwepenchant", document.querySelector("#mhwepenchant").selectedIndex)
    localStorage.setItem("sod_ohwepenchant", document.querySelector("#ohwepenchant").selectedIndex)

    localStorage.setItem("sod_startRage", document.querySelector("#startRage").value)
    localStorage.setItem("sod_wcb", document.querySelector("#wcb").checked)
    localStorage.setItem("sod_dmf", document.querySelector("#dmf").checked)

    // Talents 
    localStorage.setItem("sod_deflection", document.getElementById("deflection").value)
    localStorage.setItem("sod_cruelty", document.getElementById("cruelty").value)
    localStorage.setItem("sod_anticipation", document.getElementById("anticipation").value)
    localStorage.setItem("sod_shieldspec", document.getElementById("shieldspec").value)
    localStorage.setItem("sod_toughness", document.getElementById("toughness").value)
    localStorage.setItem("sod_impHS", document.querySelector("#impHS").value) 
    localStorage.setItem("sod_impSA", document.querySelector("#impSA").value) 
    localStorage.setItem("sod_impRend", document.querySelector("#impRend").value) 
    localStorage.setItem("sod_impale", document.querySelector("#impale").value) 
    localStorage.setItem("sod_defiance", document.querySelector("#defiance").value) 
    localStorage.setItem("sod_enrage", document.querySelector("#enrage").value) 
    localStorage.setItem("sod_deepWounds", document.querySelector("#deepWounds").value) 
    
    // Other Bonuses
    localStorage.setItem("devastate", document.querySelector("#devastate").checked)
    localStorage.setItem("endlessRage", document.querySelector("#endlessRage").checked)
    localStorage.setItem("consumedByRage", document.querySelector("#consumedByRage").checked)
    localStorage.setItem("furiousThunder", document.querySelector("#furiousThunder").checked)
    localStorage.setItem("ragingBlow", document.querySelector("#ragingBlow").checked)
    localStorage.setItem("flagellation", document.querySelector("#flagellation").checked)
    localStorage.setItem("bloodFrenzy", document.querySelector("#bloodFrenzy").checked)
    
    // Buffs
    localStorage.setItem("sod_mhstone", document.getElementById("mhstone").selectedIndex);
    localStorage.setItem("sod_ohstone", document.getElementById("ohstone").selectedIndex);
    localStorage.setItem("sod_strbuff", document.getElementById("strbuff").selectedIndex);
    localStorage.setItem("sod_apbuff", document.getElementById("apbuff").selectedIndex);
    localStorage.setItem("sod_agibuff", document.getElementById("agibuff").selectedIndex);
    localStorage.setItem("sod_statbuff", document.getElementById("statbuff").selectedIndex);
    localStorage.setItem("sod_foodbuff", document.getElementById("foodbuff").selectedIndex);
    localStorage.setItem("sod_alcohol", document.getElementById("alcohol").selectedIndex);
    localStorage.setItem("sod_potion", document.getElementById("potion").selectedIndex);

    localStorage.setItem("sod_inspiration", document.getElementById("inspiration").checked);
    localStorage.setItem("sod_devo", document.getElementById("devo").checked);
    localStorage.setItem("sod_imploh", document.getElementById("imploh").checked);

    localStorage.setItem("sod_CoV", document.getElementById("CoV").checked);
    localStorage.setItem("sod_armorelixir", document.getElementById("armorelixir").checked);
    localStorage.setItem("sod_hpelixir", document.getElementById("hpelixir").checked);
    localStorage.setItem("sod_dragonslayer", document.getElementById("dragonslayer").checked);
    localStorage.setItem("sod_boonOfTheBlackfathom", document.getElementById("boonOfTheBlackfathom").checked);
    localStorage.setItem("sod_ashenvaleCry", document.getElementById("ashenvaleCry").checked);
    localStorage.setItem("sod_zandalar", document.getElementById("zandalar").checked);
    localStorage.setItem("sod_wcb", document.getElementById("wcb").checked);
    localStorage.setItem("sod_dmf", document.getElementById("dmf").checked);
    localStorage.setItem("sod_dmstamina", document.getElementById("dmstamina").checked);
    localStorage.setItem("sod_dmAP", document.getElementById("dmAP").checked);
    localStorage.setItem("sod_dmspell", document.getElementById("dmspell").checked);
    localStorage.setItem("sod_songflower", document.getElementById("songflower").checked);
    localStorage.setItem("sod_bshout", document.getElementById("bshout").checked);
    localStorage.setItem("sod_mark", document.getElementById("mark").checked);
    localStorage.setItem("sod_fortitude", document.getElementById("fortitude").checked);
    localStorage.setItem("sod_bloodpact", document.getElementById("bloodpact").checked);
    localStorage.setItem("sod_kings", document.getElementById("kings").checked);
    localStorage.setItem("sod_might", document.getElementById("might").checked);
    localStorage.setItem("sod_hornOfLord", document.getElementById("hornOfLord").checked);
    localStorage.setItem("sod_mangle", document.getElementById("mangle").checked);
    localStorage.setItem("sod_strofearth", document.getElementById("strofearth").checked);
    localStorage.setItem("sod_wildStrikes", document.getElementById("wildStrikes").checked);

    // Boss Settings
    localStorage.setItem("sod_bossLevel", document.querySelector("#bossLevel").selectedIndex)
    localStorage.setItem("sod_swingMin", document.querySelector("#swingMin").value)
    localStorage.setItem("sod_swingMax", document.querySelector("#swingMax").value)
    localStorage.setItem("sod_swingTimer", document.querySelector("#swingTimer").value)
    localStorage.setItem("sod_bossarmor", document.querySelector("#bossarmor").value)

    localStorage.setItem("sod_curseofrecklessness", document.querySelector("#curseofrecklessness").checked)
    localStorage.setItem("sod_faeriefire", document.querySelector("#faeriefire").checked)
    localStorage.setItem("sod_iea", document.querySelector("#iea").checked)
    localStorage.setItem("sod_homunculi", document.querySelector("#homunculi").checked)

    // Calc Settings
    localStorage.setItem("sod_iterations", document.querySelector("#iterations").value)
    localStorage.setItem("sod_fightLength", document.querySelector("#fightLength").value)

}

function loadInput()
{
  // Gear
  let profiles = localStorage.getItem("sod_profiles");
  profiles = profiles ? JSON.parse(profiles) : {};
  let profile_name = "Default"; // TODO: Make user input
  let profile = profiles[`${profile_name}`];
  profile = profile ? profile : {};

  let defaultGear = {
    'head': 211505,
    'hands': 209568,
    'neck': 209673,
    'waist': 211457,
    'shoulders': 209692,
    'legs': 209566,
    'back': 213087,
    'feet': 209581,
    'chest': 210794,
    'wrists': 211463,
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
    if (ability != 'raging-blow' && abilitySettings.rage !== undefined)
      abilityRage.value = abilitySettings.rage;
  });
  document.getElementById('use-cbr-stop-rage').checked = rotation.cbrUse === undefined ? true : rotation.cbrUse; // Defaults to true
  if (rotation.cbrStacks !== undefined)
    document.getElementById('cbr-stacks').value = rotation.cbrStacks;

    // Tank Settings
    document.querySelector("#level").selectedIndex = localStorage.getItem("level") ? localStorage.getItem("level") : 0;
    document.querySelector("#race").selectedIndex = localStorage.getItem("race") ? localStorage.getItem("race") : 3;

    document.querySelector("#headenchant").selectedIndex = localStorage.getItem("sod_headenchant") ? localStorage.getItem("sod_headenchant") : 0;
    document.querySelector("#shoulderenchant").selectedIndex = localStorage.getItem("sod_shoulderenchant") ? localStorage.getItem("sod_shoulderenchant") : 0;
    document.querySelector("#backenchant").selectedIndex = localStorage.getItem("sod_backenchant") ? localStorage.getItem("sod_backenchant") : 1;
    document.querySelector("#chestenchant").selectedIndex = localStorage.getItem("sod_chestenchant") ? localStorage.getItem("sod_chestenchant") : 1;
    document.querySelector("#wristenchant").selectedIndex = localStorage.getItem("sod_wristenchant") ? localStorage.getItem("sod_wristenchant") : 1;
    document.querySelector("#handenchant").selectedIndex = localStorage.getItem("sod_handenchant") ? localStorage.getItem("sod_handenchant") : 1;
    document.querySelector("#legenchant").selectedIndex = localStorage.getItem("sod_legenchant") ? localStorage.getItem("sod_legenchant") : 1;
    document.querySelector("#feetenchant").selectedIndex = localStorage.getItem("sod_feetenchant") ? localStorage.getItem("sod_feetenchant") : 1;
    document.querySelector("#mhwepenchant").selectedIndex = localStorage.getItem("sod_mhwepenchant") ? localStorage.getItem("sod_mhwepenchant") : 1;
    document.querySelector("#ohwepenchant").selectedIndex = localStorage.getItem("sod_ohwepenchant") ? localStorage.getItem("sod_ohwepenchant") : 0;

    document.querySelector("#startRage").value = localStorage.getItem("sod_startRage") ? localStorage.getItem("sod_startRage") : 40;
    document.querySelector("#wcb").checked = localStorage.getItem("sod_wcb") == "true" ? true : false;
    document.querySelector("#dmf").checked = localStorage.getItem("sod_dmf") == "true" ? true : false;

    // Talents 
    document.getElementById("deflection").value = localStorage.getItem("sod_deflection") ? localStorage.getItem("sod_deflection") : 5;
    document.getElementById("cruelty").value = localStorage.getItem("sod_cruelty") ? localStorage.getItem("sod_cruelty") : 3;
    document.getElementById("anticipation").value = localStorage.getItem("sod_anticipation") ? localStorage.getItem("sod_anticipation") : 0;
    document.getElementById("shieldspec").value = localStorage.getItem("sod_shieldspec") ? localStorage.getItem("sod_shieldspec") : 0;
    document.getElementById("toughness").value = localStorage.getItem("sod_toughness") ? localStorage.getItem("sod_toughness") : 0;
    document.querySelector("#impHS").value = localStorage.getItem("sod_impHS") ? localStorage.getItem("sod_impHS") : 0; 
    document.querySelector("#impSA").value = localStorage.getItem("sod_impSA") ? localStorage.getItem("sod_impSA") : 0; 
    document.querySelector("#impRend").value = localStorage.getItem("sod_impRend") ? localStorage.getItem("sod_impRend") : 3; 
    document.querySelector("#impale").value = localStorage.getItem("sod_impale") ? localStorage.getItem("sod_impale") : 0; 
    document.querySelector("#defiance").value = localStorage.getItem("sod_defiance") ? localStorage.getItem("sod_defiance") : 0; 
    document.querySelector("#enrage").value = localStorage.getItem("sod_enrage") ? localStorage.getItem("sod_enrage") : 0; 
    document.querySelector("#deepWounds").value = localStorage.getItem("sod_deepWounds") ? localStorage.getItem("sod_deepWounds") : 3; 
    
    // Other Bonuses
    document.querySelector("#devastate").checked = localStorage.getItem("devastate") == "false" ? false : true;
    document.querySelector("#endlessRage").checked = localStorage.getItem("endlessRage") == "true" ? true : false;
    document.querySelector("#consumedByRage").checked = localStorage.getItem("consumedByRage") == "false" ? false : true;
    document.querySelector("#furiousThunder").checked = localStorage.getItem("furiousThunder") == "true" ? true : false;
    document.querySelector("#ragingBlow").checked = localStorage.getItem("ragingBlow") == "true" ? true : false;
    document.querySelector("#flagellation").checked = localStorage.getItem("flagellation") == "false" ? false : true;
    document.querySelector("#bloodFrenzy").checked = localStorage.getItem("bloodFrenzy") == "true" ? true : false;

    // Buffs
    document.getElementById("mhstone").selectedIndex = localStorage.getItem("sod_mhstone") ? localStorage.getItem("sod_mhstone") : 0;
    document.getElementById("ohstone").selectedIndex = localStorage.getItem("sod_ohstone") ? localStorage.getItem("sod_ohstone") : 0;
    document.getElementById("strbuff").selectedIndex = localStorage.getItem("sod_strbuff") ? localStorage.getItem("sod_strbuff") : 2;
    document.getElementById("apbuff").selectedIndex = localStorage.getItem("sod_apbuff") ? localStorage.getItem("sod_apbuff") : 0;
    document.getElementById("agibuff").selectedIndex = localStorage.getItem("sod_agibuff") ? localStorage.getItem("sod_agibuff") : 2;
    document.getElementById("statbuff").selectedIndex = localStorage.getItem("sod_statbuff") ? localStorage.getItem("sod_statbuff") : 0;
    document.getElementById("foodbuff").selectedIndex = localStorage.getItem("sod_foodbuff") ? localStorage.getItem("sod_foodbuff") : 1;
    document.getElementById("alcohol").selectedIndex = localStorage.getItem("sod_alcohol") ? localStorage.getItem("sod_alcohol") : 1;
    document.getElementById("potion").selectedIndex = localStorage.getItem("sod_potion") ? localStorage.getItem("sod_potion") : 0;

    document.getElementById("inspiration").checked = localStorage.getItem("sod_inspiration") == "true" ? true : false;
    document.getElementById("devo").checked = localStorage.getItem("sod_devo") == "true" ? true : false;
    document.getElementById("imploh").checked = localStorage.getItem("sod_imploh") == "true" ? true : false;

    document.getElementById("CoV").checked = localStorage.getItem("sod_CoV") == "true" ? true : false;// 
    document.getElementById("armorelixir").checked = localStorage.getItem("sod_armorelixir") == "false" ? false : true;
    document.getElementById("hpelixir").checked = localStorage.getItem("sod_hpelixir") == "false" ? false : true;
    document.getElementById("dragonslayer").checked = localStorage.getItem("sod_dragonslayer") == "true" ? true : false;
    document.getElementById("boonOfTheBlackfathom").checked = localStorage.getItem("sod_boonOfTheBlackfathom") == "true" ? true : false;
    document.getElementById("ashenvaleCry").checked = localStorage.getItem("sod_ashenvaleCry") == "true" ? true : false;
    document.getElementById("zandalar").checked = localStorage.getItem("sod_zandalar") == "true" ? true : false;
    document.getElementById("wcb").checked = localStorage.getItem("sod_wcb") == "true" ? true : false;
    document.getElementById("dmf").checked = localStorage.getItem("sod_dmf") == "true" ? true : false;
    document.getElementById("dmstamina").checked = localStorage.getItem("sod_dmstamina") == "true" ? true : false;
    document.getElementById("dmAP").checked = localStorage.getItem("sod_dmAP") == "true" ? true : false;
    document.getElementById("dmspell").checked = localStorage.getItem("sod_dmspell") == "true" ? true : false;
    document.getElementById("songflower").checked = localStorage.getItem("sod_songflower") == "true" ? true : false;
    document.getElementById("bshout").checked = localStorage.getItem("sod_bshout") == "false" ? false : true;
    document.getElementById("mark").checked = localStorage.getItem("sod_mark") == "true" ? true : false;
    document.getElementById("fortitude").checked = localStorage.getItem("sod_fortitude") == "true" ? true : false;
    document.getElementById("bloodpact").checked = localStorage.getItem("sod_bloodpact") == "true" ? true : false;
    document.getElementById("kings").checked = localStorage.getItem("sod_kings") == "true" ? true : false;
    document.getElementById("might").checked = localStorage.getItem("sod_might") == "true" ? true : false;
    document.getElementById("hornOfLord").checked = localStorage.getItem("sod_hornOfLord") == "true" ? true : false;
    document.getElementById("mangle").checked = localStorage.getItem("sod_mangle") == "true" ? true : false;
    document.getElementById("strofearth").checked = localStorage.getItem("sod_strofearth") == "true" ? true : false;
    document.getElementById("wildStrikes").checked = localStorage.getItem("sod_wildStrikes") == "true" ? true : false;

    // Boss Settings
    document.querySelector("#bossLevel").selectedIndex = localStorage.getItem("sod_bossLevel") ? localStorage.getItem("sod_bossLevel") : 1;
    document.querySelector("#swingMin").value = localStorage.getItem("sod_swingMin") ? localStorage.getItem("sod_swingMin") : 170;
    document.querySelector("#swingMax").value = localStorage.getItem("sod_swingMax") ? localStorage.getItem("sod_swingMax") : 200;
    document.querySelector("#swingTimer").value = localStorage.getItem("sod_swingTimer") ? localStorage.getItem("sod_swingTimer") : 2;
    document.querySelector("#bossarmor").value = localStorage.getItem("sod_bossarmor") ? localStorage.getItem("sod_bossarmor") : 1108;
    document.querySelector("#curseofrecklessness").checked = localStorage.getItem("sod_curseofrecklessness") == "false" ? false : true;
    document.querySelector("#faeriefire").checked = localStorage.getItem("sod_faeriefire") == "false" ? false : true;
    document.querySelector("#iea").checked = localStorage.getItem("sod_iea") == "true" ? true : false;
    document.querySelector("#homunculi").checked = localStorage.getItem("sod_homunculi") == "false" ? false : true;

    // Calc Settings
    document.querySelector("#iterations").value = localStorage.getItem("sod_iterations") ? localStorage.getItem("sod_iterations") : 3000;
    document.querySelector("#fightLength").value = localStorage.getItem("sod_fightLength") ? localStorage.getItem("sod_fightLength") : 60;
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
          let eventLine = formatEvent(e);
          if (eventLine !== undefined) {
            timelineDOM.innerHTML += eventLine;
            timelineDOM.innerHTML += "</br>";
          }
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


