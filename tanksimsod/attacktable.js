"use strict";
// We don't consider actors other than lvl 60 players and lvl 63 bosses.

// https://github.com/magey/classic-warrior/wiki/Parry-haste
function getParryHastedSwingEnd(start, end, current) {
    let remaining = 1 - (current-start)/(end-start)
    if(remaining > 0.6)
        return start + (end - start)/1.4
    else if(remaining > 0.2)
        return start + (end - start)/(1 + remaining - 0.2)
    else
        return end
}

function getParryHastedSwing(current, base) {
    if (current/base > 0.6) return current/1.4;
    else if (current/base > 0.2) return current/(1 + current/base - 0.2);
    else return current;
}

function armorReduction(atkLvl, armor) {
    return Math.min(0.75, armor/(armor + 400 + (atkLvl*85)));
}

const spellMissTable = {
  '-3': 0.01,
  '-2': 0.02,
  '-1': 0.03,
  '0': 0.04,
  '1': 0.05,
  '2': 0.06,
  '3': 0.17,
  '4': 0.28,
  '5': 0.39,
  '6': 0.5,
  '7': 0.61,
  '8': 0.72,
  '9': 0.83,
  '10': 0.9,
};

function spellMiss(levelDiff) {
  let ret = spellMissTable[levelDiff];
  if (ret != null)
    return ret;
  else
    log_message(LOG_LEVEL.ERROR, "Level diff too large for lookup table: " + levelDiff);
}


// Player hitting boss
function getGlanceMod(wepSkill, defense) {
    return Math.max(Math.min(0.95, 0.65 + (wepSkill + 15 - defense)*0.04), 0.65);
}

function getPlayerMissChance(atkSkill, defSkill, hit, dualWield) {
    let baseMissChance = 0;
    if (defSkill - atkSkill <= 10) {
        baseMissChance = Math.max(0, 5 + (defSkill - atkSkill)*0.1)
        if(dualWield) {
            return Math.max(0, baseMissChance*0.8 + 20 - hit)
        } else {
            return Math.max(0, baseMissChance - hit)
        }
    } else {
        baseMissChance = Math.max(0, 5 + (defSkill - atkSkill)*0.2)
        if(dualWield) {
            return Math.max(0, baseMissChance*0.8 + 20 - Math.max(0, hit + 1))
        } else {
            return Math.max(0, baseMissChance - Math.max(0, hit + 1))
        }
    }
}

// Tank hitting the boss
function twoRollTankBossTable(attacker, defender, damage) {
    let wepSkill = attacker.stats.MHWepSkill;
    let defense = defender.defense;
    let miss = getPlayerMissChance(wepSkill, defense, attacker.stats.hit, false);
    let parry = defender.stats.level == attacker.stats.level + 3 ? 14 : defender.stats.parry + 0.1*(defense - wepSkill);
    let dodge = defender.stats.dodge + 0.1 * (defense - wepSkill);
    let blockValue = defender.getBlockValue();
    let block = Math.min(5, 5 + (defense - wepSkill) * 0.1);
    let baseAttackRating = Math.min(attacker.stats.level * 5, wepSkill);
    let crit = attacker.stats.crit - (wepSkill-(attacker.stats.level * 5))*0.04; // Adjust for the wep skill bonus in spellbook
    if (baseAttackRating - defense < 0)
      crit += (baseAttackRating - defense) * 0.2;
    else
      crit += (baseAttackRating - defense) * 0.04;
    if (defender.stats.level - attacker.stats.level > 2)
      crit -= 1.8; // TODO: This should only remove 1.8 from crit auras...
    // let crit = attacker.stats.crit - 0.04 * (wepSkill - attacker.stats.level * 5) - 4.8;
    let rng = 100*Math.random();
    let type = "";
    let damageEvent = {}
    if (rng < miss) {
      damage = 0;
      type = 'miss'
    }
    else if (rng < miss + parry) {
        damage = 0;
        type = 'parry';
    }
    else if (rng < miss + parry + dodge) {
        damage = 0;
        type = 'dodge';
    }
    else {
        type = 'hit';
        let crit_roll = 100*Math.random();
        let block_roll = 100*Math.random();
        if (crit_roll < crit && block_roll < block) {
            damage = Math.max(0, damage*attacker.stats.critMod - blockValue); // Impale
            type = 'crit block';
        }
        else if (block_roll < block) {
            damage = Math.max(0, damage - blockValue);
            type = 'block';
        }
        else if (crit_roll < crit) {
            damage = damage*attacker.stats.critMod; // Impale
            type = 'crit';
        }
    }
    damageEvent.type = "damage"
    damageEvent.hit = type
    damageEvent.amount = damage
    damageEvent.source = attacker.name
    damageEvent.target = defender.name
    if(type == "block")
        damageEvent.blockAmount = defender.getBlockValue()
    return damageEvent
}

// Tank hitting the boss
function rollTankBossTable(attacker, defender, damage, yellow = false, dualWieldMiss = false, OHSwing = false) {
    let wepSkill = attacker.stats.MHWepSkill;
    let defense = defender.defense;
    if (OHSwing) wepSkill = attacker.stats.OHWepSkill;
    let miss = getPlayerMissChance(wepSkill, defense, attacker.stats.hit, dualWieldMiss);
    let parry = defender.stats.level == attacker.stats.level + 3 ? 14 : defender.stats.parry + 0.1*(defense - wepSkill);
    let dodge = defender.stats.dodge + 0.1 * (defense - wepSkill);
    let blockValue = defender.getBlockValue();
    let block = Math.min(5, 5 + (defense - wepSkill) * 0.1);
    let baseAttackRating = Math.min(attacker.stats.level * 5, wepSkill);
    let crit = attacker.stats.crit - (wepSkill-(attacker.stats.level * 5))*0.04; // Adjust for the wep skill bonus in spellbook
    if (baseAttackRating - defense < 0)
      crit += (baseAttackRating - defense) * 0.2;
    else
      crit += (baseAttackRating - defense) * 0.04;
    if (defender.stats.level - attacker.stats.level > 2)
      crit -= 1.8;
    // let crit = attacker.stats.crit - 0.04 * (wepSkill - attacker.stats.level * 5) - 4.8;
    let glance = Math.max(0, 10 + 10 * (defender.stats.level - attacker.stats.level));
    let glanceMod = getGlanceMod(wepSkill, defender.stats.defense);

    let rng = 100*Math.random()
    let type = ""
    let damageEvent = {}
    if (rng < miss) {
        damage = 0
        type = "miss"
    }
    else if (rng < miss + parry) {
        damage = 0;
        type = "parry";
    }
    else if (rng < miss + parry + dodge) {
        damage = 0;
        type = "dodge";
    }
    else if (rng < miss + parry + dodge + block) {
        damage = Math.max(0, damage - blockValue);
        type = "block";
    }
    else if (!yellow && rng < miss + parry + dodge + block + glance) {
        damage = damage * glanceMod;
        type = "glance";
    }
    else if ((!yellow && rng < miss + parry + dodge + block + glance + crit) || (rng < miss + parry + dodge + block + crit)) {
        damage = damage*(yellow ? attacker.stats.critMod : 2); // Impale
        type = "crit";
    }
    else type = "hit";
    damageEvent.type = "damage"
    damageEvent.hit = type
    damageEvent.amount = damage
    damageEvent.source = attacker.name
    damageEvent.target = defender.name
    if(type == "block")
        damageEvent.blockAmount = defender.getBlockValue()
    return damageEvent
}

// Boss hitting the tank
function rollBossTankTable(attacker, defender, damage, yellow = false) {
    let wepSkill = attacker.stats.MHWepSkill;
    let miss = Math.max(0, 5 - 0.04 * (wepSkill - defender.defense));
    let parry = defender.stats.parry - 0.04 * (wepSkill - defender.defense);
    let dodge = defender.stats.dodge - 0.04 * (wepSkill - defender.defense);
    let blockValue = defender.getBlockValue();
    let block = Math.max(0, defender.block + (wepSkill - defender.defense) * 0.04);
    let crit  = Math.max(0, attacker.stats.crit + 0.04 * (wepSkill - defender.defense));
    let crush =  0;
    if (attacker.stats.level - defender.stats.level > 2)
      crush = (wepSkill - Math.min(defender.stats.level * 5, defender.defense)) * 2 - 15;

//    console.log(`miss: ${miss}   parry: ${parry}   dodge: ${dodge}   block: ${block}   crit: ${crit}   crush: ${crush}`)

    let rng = 100*Math.random();
    let type = "";
    let damageEvent = {}
    if (rng < miss) {
        damage = 0;
        type = "miss";
    }
    else if (rng < miss + parry) {
        damage = 0;
        type = "parry";
    }
    else if (rng < miss + parry + dodge) {
        damage = 0;
        type = "dodge";
    }
    else if (rng < miss + parry + dodge + block) {
        damage = Math.max(0, damage - blockValue);
        type = "block";
    }
    else if (!yellow && rng < miss + parry + dodge + block + crit) {
        damage *= 2;
        type = "crit";
    }
    else if (!yellow && rng < miss + parry + dodge + block + crit + crush) {
        damage *= 1.5;
        type = "crush";
    }
    else type = "hit";
    // return {
    //     "type": "damage",
    //     "hit": type,
    //     "damage": damage,
    // };
    damageEvent.type = "damage"
    damageEvent.hit = type
    damageEvent.amount = damage
    damageEvent.source = attacker.name
    damageEvent.target = defender.name
    if(type == "block")
        damageEvent.blockAmount = defender.getBlockValue()
    return damageEvent
}
// TODO
function rollDpsBossTable(stats, damage, yellow = false) {
    return;
}

function rollAttack(attacker, defender, damage, yellow = false, dualWieldMiss = false, OHSwing = false, meleeSpell = false) {
    if (meleeSpell == true) return twoRollTankBossTable(attacker, defender, damage);
    else if (attacker.stats.type == "tank" && defender.stats.type == "boss") return rollTankBossTable(attacker, defender, damage, yellow, dualWieldMiss, OHSwing);
    else if (attacker.stats.type == "boss" && defender.stats.type == "tank") return rollBossTankTable(attacker, defender, damage, yellow);
}

function rollSpellAttack(attacker, defender, damage, isDot, isPhys) {
  let miss = spellMiss(defender.stats.level - attacker.stats.level);
  let spellCrit = attacker.stats.spellCrit || 0;
  spellCrit += 0.02; // Around 2% at lvl 25 with no buffs TODO: Actually get the correct amount, int per crit at 25: 31.8, base: 3.18%
  // levelBasedResist: 2/15 * defenderLevel * levelDiff ? source Zephan sheet
  // Assume boss resistance 25 for now
  // TODO: include spell pen lmao
  // netResistance = Min(Max((resistance - spellpen, 0) + levelBasedResist), defenderLevel * 5)
  // TODO: levelBasedResist does not apply to binary spells
  // Note: Calculations are simplified and lacking minmax checks because they should not matter with available gear
  let isBinary = false;
  let netResistance = 25;

  if (!isBinary) netResistance += 2/15 * defender.stats.level * (defender.stats.level - attacker.stats.level);
  // if (isDot) netResistance *= 0.1;
  // defender.stats.level ??
  let resistCap = attacker.stats.level * 5;
  // Source: https://royalgiraffe.github.io/resist-analysis
  let resistChance = netResistance > resistCap / 3 ?
                      Math.min(1, 0.75 + (netResistance / resistCap - 1/3) * 0.75) :
                      0.75 * netResistance / resistCap * 3;
  let avgResist = isDot ? netResistance * 0.1 > resistCap * 2 / 3 ? 
                      0.75 * netResistance * 0.1 / resistCap - 3/16 * (netResistance * 0.1 / resistCap - 2/3) : 
                      0.5 * netResistance * 0.1 / resistCap : 
                      netResistance > resistCap * 2 / 3 ? 
                      0.75 * netResistance / resistCap - 3/16 * (netResistance / resistCap - 2/3) : 
                      0.5 * netResistance / resistCap;

  let resistAmount = 0;
  if (!isPhys && (Math.random() < resistChance)) resistAmount = damage * avgResist / resistChance;
  // Source: Zephan warlock spreadsheet
  // let mitigation = netResistance > defender.stats.level * 10 / 3 ? 
  //         0.5625 * netResistance / (defender.stats.level * 5) + 0.5 : 
  //         0.75 * netResistance / (defender.stats.level * 5);

  let rng = Math.random();
  let damageEvent = {
    type: "damage",
    source: attacker.name,
    target: defender.name,
  };
  if (rng < miss) {
    damageEvent.hit = 'miss';
    damageEvent.amount = 0;
    damageEvent.resist = 0;
  } else if (rng < miss + spellCrit) {
    damageEvent.hit = 'crit';
    damageEvent.amount = (damage - resistAmount) * 1.5;
    damageEvent.resist = resistAmount * 1.5;
  } else {
    damageEvent.hit = 'hit';
    damageEvent.amount = (damage - resistAmount);
    damageEvent.resist = resistAmount;
  }
  return damageEvent;
}
