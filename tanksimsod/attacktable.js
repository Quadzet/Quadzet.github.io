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
    return armor/(armor + 400 + (atkLvl*85));
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
    if (rng < miss) type = 'miss';
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
    let block = Math.max(0, defender.stats.block + (wepSkill - defender.defense) * 0.04);
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