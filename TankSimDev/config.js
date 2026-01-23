"use strict";
// TODO: Remove weaponlists, update*list()

import {
  ITEMS, ITEM_SETS, ITEM_SLOTS, ABILITIES,
  ENCHANT_SLOTS, MULT_ATTRIBUTES, ATTRIBUTES, Wield, ActorType,
  BUFFS, DEBUFFS, WORLD_BUFFS, CONSUMES, OH_BUFFS, IMP_BUFFS,
} from './constants.js'
import { AURA_DATA } from './buffs.js'
import { levelstats } from './levelstats.js'
import { races } from './stats.js'
import { LOG_LEVEL, log_message } from './logging.js'
import { ENCHANT_DATA } from './stats.js'
import { getTalentValue } from './talents.js';
import { addTankProcs } from './procs.js'


export function getIndex(buff, level) {
  let ix = -1;
  for (let i = 0; i < buff['levels'].length; i++) {
    if (buff['levels'][i] <= level)
      ix = i;
    else
      break;
  }
  return ix;
}

function writePlayerStats(stats) {
  document.getElementById("playerhp").innerHTML = `${Math.round(stats.health)}`;
  document.getElementById("playerstrength").innerHTML = `${Math.round(stats.strength)}`;
  document.getElementById("playerstamina").innerHTML = `${Math.round(stats.stamina)}`;
  document.getElementById("playeragility").innerHTML = `${Math.round(stats.agility)}`;
  document.getElementById("playerhit").innerHTML = `${stats.hit}`;
  document.getElementById("playercrit").innerHTML = `${Math.round(stats.crit * 10) / 10}`;
  document.getElementById("playerattackpower").innerHTML = `${Math.round(stats.attackpower)}`;
  document.getElementById("playerarmor").innerHTML = `${Math.round(stats.armor)}`;
  document.getElementById("playerblock").innerHTML = `${Math.round((stats.block) * 100) / 100}`;
  document.getElementById("playerblockvalue").innerHTML = `${Math.round(stats.blockvalue)}`;
  document.getElementById("playerparry").innerHTML = `${Math.round((stats.parry) * 100) / 100}`;
  document.getElementById("playerdodge").innerHTML = `${Math.round((stats.dodge) * 100) / 100}`;
  document.getElementById("playerdefense").innerHTML = `${stats.defense}`;
  document.getElementById("playermhskill").innerHTML = `${stats.mhskill}`;
  document.getElementById("playerohskill").innerHTML = `${stats.ohskill}`;
  document.getElementById("playerhaste").innerHTML = `${stats.haste}`;
}

export function checkAuraToggle(name) {
  let element = document.getElementById(`${name}-aura-img`);
  return element && element.classList.contains('aura-toggle-active');
}

function applyMultMods(stats) {
  stats.stamina *= stats.staminaMod;
  stats.strength *= stats.strengthMod;
  stats.agility *= stats.agilityMod;
}

function applyExtraStats(stats) {

  ATTRIBUTES.forEach(attribute => {
    let element = document.getElementById(`playerextra${attribute}`);
    if (element == null)
      return;
    let extraStat = Number(element.value);
    stats[`${attribute}`] += extraStat;
  });

  let extramhskill = Number(document.getElementById("playerextramhskill").value);
  let extraohskill = Number(document.getElementById("playerextraohskill").value);
  stats.mhskill += extramhskill;
  stats.ohskill += extraohskill;
}

function addAuraStats(stats, level) {
  for (const aura of BUFFS.concat(WORLD_BUFFS, CONSUMES, OH_BUFFS)) {
    const element = document.getElementById(aura + '-aura-img');
    const data = AURA_DATA[`${aura}`];
    if (element && element.classList.contains('aura-toggle-active')) {
      let factor = 1
      // Check if the aura has an improvement active.
      for (const impAura of IMP_BUFFS) {
        let impData = AURA_DATA[`${impAura}`];
        if (impData['aura'] == aura) {
          const impElement = document.getElementById(impAura + '-aura-img');
          if (impElement && impElement.classList.contains('aura-toggle-active'))
            factor = impData['factor'];
          break;
        }
      }

      let ix = getIndex(data, level);
      if (ix == -1)
        continue; // We are too low level for this buff.
      // TODO: Check if rounding should be done here.
      for (const attribute of ATTRIBUTES) {
        if (data[`${attribute}`]) {
          if (MULT_ATTRIBUTES.includes(attribute))
            stats[`${attribute}`] *= factor * data[`${attribute}`][ix];
          else
            stats[`${attribute}`] += factor * data[`${attribute}`][ix];
        }
      }
    }
  }
}

function getBlockValue(itemID) {
  switch (itemID) {
    case 211460: return 15;
    case 6223: return 14;
    case 13079: return 14;
    case 7002: return 13;
    case 6320: return 13;
    case 209424: return 14;
    case 13245: return 9;
    case 12997: return 11;
    case 4064: return 11;
    case 6676: return 10;
    case 15891: return 9;
    case 5443: return 9;
    case 3656: return 10;
    default:
      log_message(LOG_LEVEL.WARNING, 'Unknown shield item id: ' + itemID + '. Could not fetch block value.')
      return 0;
  }
}

// TODO: Use correct agi-crit/dodge conversion based on level.
function applyStatEffects(stats, level) {
  let hpMod = document.getElementById("race").value == "Tauren" ? 1.05 : 1;
  stats.health += stats.stamina * 10 * hpMod;
  stats.armor += stats.agility * 2;
  stats.crit = stats.crit + stats.agility * 0.05 + (stats.mhskill - (level * 5)) * 0.04;
  stats.attackpower += stats.strength * 2;
  stats.dodge += 5 + stats.agility * 0.05 + stats.defense * 0.04;
  stats.blockvalue += stats.strength / 20;
  stats.parry += 5 + stats.defense * 0.04;
  stats.block += 5 + stats.defense * 0.04;
  if (stats.wield != Wield.SHIELD) {
    stats.block = 0;
    stats.blockvalue = 0;
  }
}

function addTalentStats(stats) {

  let twohand = stats.mainhand.slot == 'twohand';
  let anticipation = getTalentValue("anticipation");
  let toughness = getTalentValue("toughness");
  let cruelty = getTalentValue("cruelty");
  let impale = getTalentValue("impale");
  let defiance = getTalentValue("defiance");

  stats.armorMod += Math.round(0.02 * stats.talents.toughness);
  stats.defense += Math.round(2 * stats.talents.anticipation);
  stats.crit += Number(cruelty);
  stats.parry += Number(stats.talents.deflection);
  stats.block += Number(stats.talents.shieldspec);
  stats.abilityCritMod += Number(stats.talents.impale) * 0.1;
  stats.threatMod += 0.03 * Number(stats.talents.defiance);

  if (stats.wield == Wield.TWOHAND)
    stats.physDamageMod += 0.01 * getTalentValue('two-handed-weapon-specialization');
  else
    stats.physDamageMod += 0.02 * getTalentValue('one-handed-specialization');

  let mhweapontype = stats.mainhand.type == undefined ? "" : stats.mainhand.type;
  if (mhweapontype == "Axe" || mhweapontype == "Two-handed Axe")
    stats.crit += Number(stats.talents.axeSpec);
  if (mhweapontype == "Polearm")
    stats.crit += Number(stats.talents.poleSpec);
}

function addGearStats(stats, level) {

  let gear = {};  // For tracking set bonuses.

  // Add raw gear stats.
  ITEM_SLOTS.forEach(slot => {
    let element = document.getElementById(`${slot}-slot`)
    let itemID = element.getAttribute('itemid');
    if (itemID != null && itemID != 0) {
      gear[`${slot}`] = itemID;
      let itemStats = ITEMS[`${itemID}`];

      stats.armor += itemStats.armor;
      stats.agility += itemStats.agility;
      stats.strength += itemStats.strength;
      stats.stamina += itemStats.stamina;
      stats.crit += itemStats.crit;
      stats.hit += itemStats.hit;
      stats.attackpower += itemStats.attackpower;
      stats.defense += itemStats.defense;
      stats.parry += itemStats.parry;
      stats.dodge += itemStats.dodge;
      stats.block += itemStats.block;
      stats.blockvalue += itemStats.blockvalue;

      if (itemStats.proc != null)
        stats.procs.push(itemStats.proc);
    }
  });

  // Get weapon stats.
  let mhwep = document.getElementById('mainhand-slot').getAttribute('itemid');
  if (mhwep != undefined && mhwep != "0") {
    stats.mainhand = ITEMS[`${mhwep}`];
  } else {
    stats.mainhand = {
      mindmg: 0,
      maxdmg: 0,
      swingtimer: 2000,
      type: 'none',
    };
  }
  let ohwep = document.getElementById('offhand-slot').getAttribute('itemid');
  if (ohwep != undefined && ohwep != "0") {
    stats.offhand = ITEMS[`${ohwep}`];
  }

  let mhweapontype = stats.mainhand.type == undefined ? "" : stats.mainhand.type;
  let ohweapontype = stats.offhand.type == undefined ? "" : stats.offhand.type;

  if (stats.mainhand.slot == 'twohand')
    stats.wield = Wield.TWOHAND;
  else if (ohwep != "0" && ohweapontype != "Shield")
    stats.wield = Wield.DUALWIELD;
  else if (ohweapontype == "Shield")
    stats.wield = Wield.SHIELD;
  else if (mhweapontype != "")
    stats.wield = Wield.ONEHAND;
  else
    stats.wield = Wield.UNARMED;

  stats.normSwing = mhweapontype == "Daggers" ? 1700 :
    stats.wield == Wield.TWOHAND ? 3300 : 2400;

  stats.defense += level * 5;
  stats.mhskill += level * 5;
  if (stats.wield == Wield.DUALWIELD)
    stats.ohskill += level * 5;

  // TODO: Get real blockvalue.
  if (stats.wield == Wield.SHIELD)
    stats.blockvalue += getBlockValue(Number(ohwep));

  // Add weapon skill from gear.
  ITEM_SLOTS.forEach(slot => {
    let element = document.getElementById(`${slot}-slot`)
    let itemID = element.getAttribute('itemid');
    if (itemID && itemID != 0) {
      let itemStats = ITEMS[`${itemID}`];
      if (itemStats.skilltype) {
        if (itemStats.skilltype.includes(mhweapontype))
          stats.mhskill += itemStats.skill;
        if (itemStats.skilltype.includes(ohweapontype))
          stats.ohskill += itemStats.skill;
      }
    }
  });

  // Add any set bonuses.
  const equippedIDs = Object.values(gear).map(value => parseInt(value, 10));
  ITEM_SETS.forEach(set => {
    let n_equipped = set.itemIDs.filter(element => equippedIDs.includes(element)).length;
    if (n_equipped > 0) {
      set.bonuses.forEach(bonus => {
        if (bonus.requires > n_equipped)
          return;
        stats.armor += (bonus.armor ? bonus.armor : 0);
        stats.agility += (bonus.agility ? bonus.agility : 0);
        stats.strength += (bonus.strength ? bonus.strength : 0);
        stats.stamina += (bonus.stamina ? bonus.stamina : 0);
        stats.crit += (bonus.crit ? bonus.crit : 0);
        stats.hit += (bonus.hit ? bonus.hit : 0);
        stats.attackpower += (bonus.attackpower ? bonus.attackpower : 0);
        stats.defense += (bonus.defense ? bonus.defense : 0);
        stats.parry += (bonus.parry ? bonus.parry : 0);
        stats.dodge += (bonus.dodge ? bonus.dodge : 0);
        stats.block += (bonus.block ? bonus.block : 0);
        stats.blockvalue += (bonus.blockvalue ? bonus.blockvalue : 0);
        if (bonus.skilltype) {
          if (bonus.skilltype.includes(mhweapontype))
            stats.mhskill += bonus.skill;
          if (bonus.skilltype.includes(ohweapontype))
            stats.ohskill += bonus.skill;
        }
      });
    }
  });

  // Update the procchance based on mh wep swingtimer.
  stats.procs.forEach(proc => {
    proc.procChance = proc.ppm * stats.mainhand.swingtimer / 60000;
  });

  stats.gear = gear;
}

function addRaceStats(stats, level) {

  let race = document.querySelector("#race").value
  let v_l = levelstats[race][level - 1].split(',');
  stats.strength += parseInt(v_l[1]);
  stats.agility += parseInt(v_l[2]);
  stats.stamina += parseInt(v_l[3]);
  stats.attackpower += level * 3 - 20;

  if (races[race].skilltype.includes(stats.mainhand.type))
    stats.mhskill += races[race].skill;

  if (stats.offhand && races[race].skilltype.includes(stats.offhand.type))
    stats.ohskill += races[race].skill;
}

function addEnchantStats(stats) {

  let enchants = {};
  ENCHANT_SLOTS.forEach(slot => {
    const element = document.getElementById(slot + '-enchant');
    let id = Number(element.getAttribute('enchantID'));
    let enchant = ENCHANT_DATA[id];
    enchants[`${slot}`] = id;

    let mhweapontype = stats.mainhand.type == undefined ? "" : stats.mainhand.type;
    let ohweapontype = stats.offhand.type == undefined ? "" : stats.offhand.type;

    stats.health += enchant.health;
    stats.strength += enchant.strength;
    stats.stamina += enchant.stamina;
    stats.agility += enchant.agility;
    stats.hit += enchant.hit;
    stats.crit += enchant.crit;
    stats.attackpower += enchant.attackpower;
    stats.armor += enchant.armor;
    stats.parry += enchant.parry;
    stats.dodge += enchant.dodge;
    stats.defense += enchant.defense;
    stats.block += enchant.block;
    stats.blockvalue += enchant.blockvalue;
    if (enchant.skilltype !== undefined && enchant.skilltype != 'none') {
      if (enchant.skilltype.includes(mhweapontype))
        stats.mhskill += enchant.skill;
      if (enchant.skilltype.includes(ohweapontype))
        stats.ohskill += enchant.skill;
      if (stats.wield == Wield.DUALWIELD) {
        stats.offhand.mindmg += enchant.damage;
        stats.offhand.maxdmg += enchant.damage;
      }
      stats.mainhand.mindmg += enchant.damage;
      stats.mainhand.maxdmg += enchant.damage;
    }
  });
}

function getBossStats(playerLevel) {

  let level = Number(playerLevel) + Number(document.querySelector("#bossLevel").value)
  let armor = Number(document.querySelector("#bossArmor").value);
  let mindmg = Number(document.querySelector("#swingMin").value);
  let maxdmg = Number(document.querySelector("#swingMax").value);
  let swingtimer = Number(document.querySelector("#swingTimer").value) * 1000;
  let defense = level * 5;
  // Not confirmed, seems to more or less match at lvl 27 and 63.
  let blockvalue = Math.max(0, level - 15);
  let mhskill = level * 5;

  let stats = {
    level: level,
    type: ActorType.BOSS,

    agility: 0,
    strength: 0,
    stamina: 0,

    crit: 5,
    spellcrit: 0,
    hit: 0,
    attackpower: 0, // TODO: Implement attackpower for bosses.
    haste: 0,

    defense: defense,
    armor: armor,
    bonusArmor: 0,
    parry: 5,
    dodge: 5,
    block: 5,
    blockvalue: blockvalue,
    health: 1,

    staminaMod: 1,
    strengthMod: 1,
    agilityMod: 1,
    armorMod: 1,
    damageMod: 0.9, // TODO: Defensive Stance, implement it as a buff instead.
    critMod: 1,
    abilityCritMod: 1,
    threatMod: 0,
    physDamageMod: 1,
    flatArmor: 0,
    flatDamage: 0,

    mainhand: {
      mindmg: mindmg,
      maxdmg: maxdmg,
      swingtimer: swingtimer,
      type: "none",
    },
    offhand: {},
    mhskill: mhskill,
    ohskill: 0,
    wield: Wield.UNARMED,
    normSwing: 2400,

    startRage: 0,

    gear: {},
    rotation: {},
    talents: {},
    bonuses: {},
    procs: [],
  };

  DEBUFFS.forEach(aura => {
    const element = document.getElementById(aura + '-aura-img');

    if (element && element.classList.contains('aura-toggle-active')) {
      let data = AURA_DATA[`${aura}`];
      let ix = getIndex(AURA_DATA[`${aura}`], playerLevel);
      if (ix == -1)
        return; // We are too low level for this debuff.

      let factor = 1
      // Check if the aura has an improvement active.
      for (const impAura of IMP_BUFFS) {
        let impData = AURA_DATA[`${impAura}`];
        if (impData['aura'] == aura) {
          const impElement = document.getElementById(impAura + '-aura-img');
          if (impElement && impElement.classList.contains('aura-toggle-active'))
            factor = impData['factor'];
          break;
        }
      }
      ATTRIBUTES.forEach(attribute => {
        if (data[`${attribute}`])
          stats[`${attribute}`] += factor * data[`${attribute}`][ix];
      });
    }
  });

  stats.armor += stats.bonusArmor;

  return stats;
}


export function updateStats() {
  let level = document.querySelector("#player-level").value
  var output = document.getElementById("player-level-span");
  output.innerHTML = level;

  let stats = {
    level: level,
    type: ActorType.TANK,

    agility: 0,
    strength: 0,
    stamina: 0,

    crit: 0,
    spellcrit: 0,
    hit: 0,
    attackpower: 0,
    haste: 0,

    defense: 0,
    armor: 0,
    bonusArmor: 0, // Not from agi/gear, ie not affected by mult mods.
    parry: 0,
    dodge: 0,
    block: 0,
    blockvalue: 0,
    health: 94, // Base HP for all races.

    staminaMod: 1,
    strengthMod: 1,
    agilityMod: 1,
    armorMod: 1,
    damageMod: 1,
    critMod: 1,
    abilityCritMod: 1,
    threatMod: 1.3, // TODO: Defensive stance, turn it into a buff.
    physDamageMod: 1,
    flatArmor: 0,
    flatDamage: 0,

    mainhand: {},
    offhand: {},
    mhskill: 0,
    ohskill: 0,
    wield: Wield.UNARMED,
    normSwing: 2400,

    startRage: 0,

    gear: {},
    rotation: {},
    talents: {},
    bonuses: {},
    procs: [],
  };


  stats.talents = {
    deathwish: getTalentValue("death-wish") > 0,
    bloodthirst: getTalentValue("bloodthirst") > 0,
    mortalStrike: getTalentValue("mortal-strike") > 0,
    shieldslam: getTalentValue("shield-slam") > 0,
    flurry: getTalentValue("flurry"),
    enrage: getTalentValue("enrage"),
    deepWounds: getTalentValue("deep-wounds"),
    toughness: getTalentValue("toughness"),
    anticipation: getTalentValue("anticipation"),
    deflection: getTalentValue("deflection"),
    cruelty: getTalentValue("cruelty"),
    shieldspec: getTalentValue("shield-specialization"),
    impHS: getTalentValue("improved-heroic-strike"),
    impSA: getTalentValue("improved-sunder-armor"),
    impRend: getTalentValue("improved-rend"),
    defiance: getTalentValue("defiance"),
    impale: getTalentValue("impale"),
    impSB: getTalentValue("improved-shield-block"),
    impTC: getTalentValue("improved-thunderclap"),
    dwspec: getTalentValue("dual-wield-specialization"),
    swordSpec: getTalentValue('sword-specialization'),
    axeSpec: getTalentValue('axe-specialization'),
    poleSpec: getTalentValue('polearm-specialization'),
  };

  addGearStats(stats, level);
  addRaceStats(stats, level);
  addTalentStats(stats);
  addEnchantStats(stats);
  addAuraStats(stats, level);
  applyExtraStats(stats, level);
  applyMultMods(stats);
  applyStatEffects(stats, level);
  stats.armor *= stats.armorMod;
  stats.armor += stats.bonusArmor;
  writePlayerStats(stats);


  stats.startRage = Number(document.querySelector("#startRage").value);
  // TODO: Enable stances as buffs, as well as stance dancing (execute).
  stats.damageMod *= 0.9;

  /*let enhTotems = true; // TODO
    let impFort = true; // TODO
    let impImp = true; // TODO
    let impBShout = true; // TODO
    let impMight = true; // TODO
    let impMOTW = true; // TODO
    let impDevo = true; // TODO
  */

  ABILITIES.forEach(ability => {
    let obj = {};
    const element = document.getElementById('use-' + ability);
    let use = element.checked && element.style != 'none';
    use = use ? use : false;
    let rage = 0;
    if (!('death-wish' == ability))
      rage = Number(document.getElementById(ability + '-rage').value);
    obj.use = use;
    obj.rage = rage;
    stats.rotation[`${ability}`] = obj;
  });

  addTankProcs(stats, level);
  // TODO: Move these settings from here.
  stats.bonuses = {
    windfury: checkAuraToggle('windfury'),
    goa: checkAuraToggle('goa'),
    fivePieceWrath: false,
    twoPieceDreadnaught: false,
  };

  let bossStats = getBossStats(level);

  let globals = {
    tankStats: stats,
    bossStats: bossStats,
    // Calc Settings and other globals
    config: {
      // Fight duration in seconds.
      simDuration: Number(document.querySelector("#fightLength").value),
      // Number of fights simulated.
      iterations: Number(document.querySelector("#iterations").value),
    },
  }
  return globals;
}
