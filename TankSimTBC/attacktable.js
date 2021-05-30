"use strict";

// TODO: verify parry haste for TBC
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

// TODO: VERIFY ARMOR FORMULA
function armorReduction(atkLvl, armor) {
    return armor/(armor - 22167.5 + atkLvl*467.5);
}

// Tank hitting the boss
function twoRollTankBossTable(attacker, defender, damage) {
    let miss = Math.min(8, Math.max(0, 9 - attacker.hit))
    let parry = Math.max(0, 14 - attacker.stats.expertise*0.25);
    let dodge = Math.max(0, 6.5 - attacker.stats.expertise*0.25);
    let blockValue = defender.getBlockValue();
    let block = 5;
    let crit = Math.max(0, attacker.crit - 4.8);
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
    let miss = Math.min(8, Math.max(0, 9 - attacker.hit))
    let parry = Math.max(0, 14 - attacker.stats.expertise*0.25);
    let dodge = Math.max(0, 6.5 - attacker.stats.expertise*0.25);
    let blockValue = defender.getBlockValue();
    let block = 5;
    let crit = Math.max(0, attacker.crit - 4.8);
    let glance = 24;
    let glanceMod = 0.75;

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
    let miss = Math.max(0, 5 + 0.04 * (defender.defense - 365));
    let parry = defender.stats.parry - 0.6;
    let dodge = defender.stats.dodge - 0.6;
    let blockValue = defender.getBlockValue();
    let block = Math.max(0, defender.getBlock() - 0.6);
    let crit  = Math.max(0, 5 - 0.04 * (defender.defense - 365) - 0.025 * defender.resilience);
    let crush = (390 - Math.min(375, defender.defense)) * 2 - 15;

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

function rollAttack(attacker, defender, damage, yellow = false, meleeSpell = false) {
    if (meleeSpell == true) return twoRollTankBossTable(attacker, defender, damage);
    else if (attacker.stats.type == "tank" && defender.stats.type == "boss") return rollTankBossTable(attacker, defender, damage, yellow);
    else if (attacker.stats.type == "boss" && defender.stats.type == "tank") return rollBossTankTable(attacker, defender, damage, yellow);
}