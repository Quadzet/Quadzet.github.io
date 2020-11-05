"use strict";
// We don't consider actors other than lvl 60 players and lvl 63 bosses.

// https://github.com/magey/classic-warrior/wiki/Parry-haste
function getParryHastedSwing(current, base) {
    if (current/base > 0.6) return current/1.4;
    else if (current/base > 0.2) return current/(1 + current/base - 0.2);
    else return current;
}
function armorReduction(atkLvl, armor) {
    return armor/(armor + 400 + (atkLvl*85));
}

// Lvl 60 Player hitting lvl 63 Boss
function getGlanceMod(wepSkill) {
    return Math.min(0.95, 0.65 + (wepSkill-300)*0.04);
}

function getPlayerMissChance(atkSkill, defSkill, hit, dualWield) {
    let missChance = 0
    if (defSkill - atkSkill <= 10) missChance = Math.max(0, 5 + (defSkill - atkSkill)*0.1 - hit);
    else missChance = Math.max(0, 5 + (defSkill - atkSkill)*0.2 - Math.max(0, hit + 1));
    if (dualWield) missChance = 20 + missChance * 0.8;
    return missChance;
}

// Tank hitting the boss
function twoRollTankBossTable(stats, defStats, damage) {
    let wepSkill = stats.MHWepSkill;
    let miss = getPlayerMissChance(wepSkill, defStats.defense, stats.hit, false);
    let parry = 14;
    let dodge = defStats.dodge - 0.1 * (wepSkill - defStats.defense);
    let blockValue = defStats.blockValue;
    let block = Math.min(5, 5 + (defStats.defense - wepSkill) * 0.1);
    let crit = stats.crit - 0.04 * (wepSkill - 300) - 4.8;
    let rng = 100*Math.random();
    let type = "";
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
            damage = Math.max(0, damage*stats.critMod - blockValue); // Impale
            type = 'crit block';
        }
        else if (block_roll < block) {
            damage = Math.max(0, damage - blockValue);
            type = 'block';
        }
        else if (crit_roll < crit) {
            damage = damage*stats.critMod; // Impale
            type = 'crit';
        }
    }
    return {
        "type": "damage",
        "hit": type,
        "damage": damage,
    };
}

// Tank hitting the boss
function rollTankBossTable(stats, defStats, damage, yellow = false, dualWieldMiss = false, OHSwing = false) {
    let wepSkill = stats.MHWepSkill;
    if (OHSwing) wepSkill = stats.OHWepSkill;
    let miss = getPlayerMissChance(wepSkill, defStats.defense, stats.hit, dualWieldMiss);
    let parry = 14;
    let dodge = defStats.dodge - 0.1 * (wepSkill - defStats.defense);
    let blockValue = defStats.blockValue;
    let block = Math.min(5, 5 + (defStats.defense - wepSkill) * 0.1);
    let crit = stats.crit - 0.04 * (wepSkill - 300) - 4.8;
    let glance = 40;
    let glanceMod = getGlanceMod(wepSkill);

    let rng = 100*Math.random()
    let type = ""
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
        damage = damage*(yellow ? stats.critMod : 2); // Impale
        type = "crit";
    }
    else type = "hit";
    return {
        "type": "damage",
        "hit": type,
        "damage": damage,
    };
}

// Boss hitting the tank
function rollBossTankTable(stats, defStats, damage, yellow = false) {
    let wepSkill = stats.MHWepSkill;
    let miss = 5 - 0.04 * (wepSkill - defStats.defense);
    let parry = defStats.parry - 0.04 * (wepSkill - 300);
    let dodge = defStats.dodge - 0.04 * (wepSkill - 300);
    let blockValue = defStats.blockValue;
    let block = defStats.block + (wepSkill - defStats.defense) * 0.04;
    let crit  = stats.crit + 0.04 * (wepSkill - defStats.defense);
    let crush = (wepSkill - Math.min(300, defStats.defense)) * 2 - 15;

    let rng = 100*Math.random();
    let type = "";
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
    return {
        "type": "damage",
        "hit": type,
        "damage": damage,
    };
}
// TODO
function rollDpsBossTable(stats, damage, yellow = false) {
    return;
}

function rollAttack(stats, defStats, damage, yellow = false, dualWieldMiss = false, OHSwing = false, meleeSpell = false) {
    if (meleeSpell == true) return twoRollTankBossTable(stats, defStats, damage);
    else if (stats.type == "tank" && defStats.type == "boss") return rollTankBossTable(stats, defStats, damage, yellow, dualWieldMiss, OHSwing);
    else if (stats.type == "boss" && defStats.type == "tank") return rollBossTankTable(stats, defStats, damage, yellow);
}