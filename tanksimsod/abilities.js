"use strict";

function updateRage(attacker, hit, rageCost) {
    if (attacker.stats.bonuses.fivePieceWrath && Math.random() < 0.25) rageCost = Math.max(rageCost - 5, 0) // 0.25 instead of 0.2 to account for parry/dodge streaks not consuming the buff
    if (["dodge", "parry", "miss"].includes(hit)) attacker.addRage(-0.2*rageCost, true); // Default ability refund 80%
    else attacker.addRage(-rageCost, true);
}

class Ability {
    constructor(name, baseCooldown, rageCost, onGCD) {
        this.name = name
        this.baseCooldown = baseCooldown
        this.rageCost = rageCost
        this.onGCD = onGCD
        // TODO: spellCrit
        this.currentCooldown = 0
    }

    //if the ability or swing hits, returns threat.
    //if no connection, returns 0
    rank(level)
    {
      return 0;
    }
    damage(rank)
    {
      return 0;
    }
    staticThreat(rank)
    {
      return 0;
    }
    threatModifier(rank)
    {
      return 1;
    }
    threatCalculator(dmg_event, attacker) {
        if (
            dmg_event.hit != "parry" && 
            dmg_event.hit != "dodge" && 
            dmg_event.hit != "miss" ) {
            let rank = this.rank(attacker.level);
            return ((dmg_event.damage * this.threatModifier(rank)) +  this.staticThreat(rank)) * attacker.stats.threatMod;
        }
        else return 0;
    }
    weaponSwingRoll(attacker) {
        return (
            Math.random()*(attacker.stats.MHMax - attacker.stats.MHMin) +
            attacker.stats.MHMin + attacker.getAP()*attacker.stats.MHSwing/
            (14*1000));
    }

    // This function needs to be implemented in the sub classes!
    use(attacker, defender) {
        console.log(`Internal Error: Use function not implemented for ability ${this.name}!`);
    }

    isUsable(attacker, defender) {
        return this.currentCooldown <= 0 && (attacker.GCD <= 0 || this.onGCD == false) && attacker.rage >= this.rageCost;
    }
}

class MHSwing extends Ability {
    use(attacker, defender) {
        let damageEvent = {};
        // Heroic Strike
        if (attacker.isHeroicStrikeQueued && attacker.rage > (15 - attacker.stats.talents.impHS)) {
            let damage = this.weaponSwingRoll(attacker) + this.damage(this.rank(attacker.level)) + defender.additivePhysBonus;
            damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
            damageEvent = rollAttack(attacker, defender, damage, true);
            damageEvent.threat = this.threatCalculator(damageEvent, attacker);
            damageEvent.ability = "Heroic Strike (Rank " + this.rank(attacker.level) + ")";
            // Remove rage
            updateRage(attacker, damageEvent.hit, (15 - attacker.stats.talents.impHS));
        }
        // White Swing
        else {
            let damage = this.weaponSwingRoll(attacker) + defender.additivePhysBonus;
            damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
            damageEvent = rollAttack(attacker, defender, damage, false, attacker.stats.dualWield);
            
            damageEvent.threat = this.threatCalculator(damageEvent, attacker);
            damageEvent.ability = "MH Swing";
            
            // Add rage
            if (damageEvent.hit == "miss") return damageEvent;
            else if (["dodge", "parry"].includes(damageEvent.hit)) attacker.addRage(0.75*damage*7.5/230.6, true); // 'refund' 75% of the rage gain
            else {
                attacker.addRage(damageEvent.damage*7.5/230.6, true);
                defender.addRage(damageEvent.damage*2.5/230.6, true);
            }
        }
        
        attacker.isHeroicStrikeQueued = false;
        return damageEvent;
    }
    // Needs to be overridden since MHSwing is actually both HS and MHSwing...
    threatCalculator(dmg_event, attacker) {
        if (
            dmg_event.hit != "parry" && 
            dmg_event.hit != "dodge" && 
            dmg_event.hit != "miss" ) {
            if (attacker.isHeroicStrikeQueued && attacker.rage > (15 - attacker.stats.talents.impHS)) {
              let rank = this.rank(attacker.level);
              return ((dmg_event.damage * this.threatModifier(rank)) +  this.staticThreat(rank)) * attacker.stats.threatMod;
            } else {
              return dmg_event.damage;
            }
        }
        else return 0;
    }
    rank(level)
    {
      if (level < 8) return 1;
      else if (level < 16) return 2;
      else if (level < 24) return 3;
      else if (level < 32) return 4;
      else if (level < 40) return 5;
      else if (level < 48) return 6;
      else if (level < 56) return 7;
      else if (level < 60) return 8; // TODO: Used at 60 without skill book
      else return 9;
    }
    damage(rank) {
      if (rank == 1) return 11;
      else if (rank == 2) return 21;
      else if (rank == 3) return 32;
      else if (rank == 4) return 44;
      else if (rank == 5) return 58;
      else if (rank == 6) return 80;
      else if (rank == 7) return 111;
      else if (rank == 8) return 138; // TODO: Used at 60 without skill book
      else if (rank == 9) return 157;
      else 
      {
        console.log("Error: invalid rank for Heroic Strike: " + rank)
        return 0;
      }
    }
    staticThreat(rank) {
      if (rank == 1) return 20;
      else if (rank == 2) return 39;
      else if (rank == 3) return 59;
      else if (rank == 4) return 78;
      else if (rank == 5) return 98;
      else if (rank == 6) return 118;
      else if (rank == 7) return 137;
      else if (rank == 8) return 145; // TODO: Used at 60 without skill book
      else if (rank == 9) return 175;
      else 
      {
        console.log("Error: invalid rank for Heroic Strike: " + rank)
        return 0;
      }
    }
}

class OHSwing extends Ability {

    use(attacker, defender) {
        let damage = Math.random()*(attacker.stats.OHMax - attacker.stats.OHMin) + attacker.stats.OHMin + attacker.getAP()*attacker.stats.OHSwing/(14*1000); // swing timer is in ms
        damage = damage*(0.5 + 0.025*attacker.stats.talents.dwspec) +  defender.additivePhysBonus;
        damage *=(1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
        let damageEvent = rollAttack(attacker, defender, damage, false, !attacker.isHeroicStrikeQueued, true);
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name;
        // Add rage
        if (damageEvent.hit == "miss") return damageEvent;
        else if (["dodge", "parry"].includes(damageEvent.hit)) attacker.addRage(0.75*damage*7.5/230.6, true); // 'refund' 75% of the rage gain
        else {
            attacker.addRage(damageEvent.damage*7.5/230.6, true);
            defender.addRage(damageEvent.damage*2.5/230.6);
        }
        return damageEvent;
    }
}
class Bloodthirst extends Ability {
    use(attacker, defender) {
        let damage = 0.45*attacker.getAP() + defender.additivePhysBonus;
        damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
        let damageEvent = rollAttack(attacker, defender, damage, true, false, false, true);
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name;

        // Remove rage
        updateRage(attacker, damageEvent.hit, this.rageCost)
        return damageEvent;
    }
}


class Revenge extends Ability {
    use(attacker, defender) {
        let damage = this.damage(this.rank(attacker.level)) + defender.additivePhysBonus;
        damage += attacker.stats.bonuses.twoPieceDreadnaught ? 75 : 0;
        damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
        let damageEvent = rollAttack(attacker, defender, damage, true, false, false, true);
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name + " (Rank " + this.rank() + ")";
        // Remove rage
        updateRage(attacker, damageEvent.hit, this.rageCost);
        return damageEvent;
    }

    isUsable(attacker, defender) {
        let offCD = (this.currentCooldown <= 0 && (attacker.GCD <= 0 || this.onGCD == false) && attacker.rage > this.rageCost);
        if (!offCD) return false;
        var defStateActive = false;
        attacker.auras.forEach(aura => {
            if (aura.name == "Defensive State" && aura.duration > 0)
                defStateActive = true; 
        })
        return defStateActive;
    }
    rank(level) {
      if (level < 24) return 1;
      else if (level < 34) return 2;
      else if (level < 44) return 3;
      else if (level < 54) return 4;
      else if (level < 60) return 5;
      else return 6;
    }
    damage(rank) {
      if (rank == 1) return Math.random()*2 + 12;
      else if (rank == 2) return Math.random()*4 + 18;
      else if (rank == 3) return Math.random()*6 + 25;
      else if (rank == 4) return Math.random()*10 + 43;
      else if (rank == 5) return Math.random()*14 + 64;
      else if (rank == 6) return Math.random()*18 + 81;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
    staticThreat(rank) {
      if (rank == 1) return 63;
      else if (rank == 2) return 108; // NEEDS TESTING
      else if (rank == 3) return 153; // NEEDS TESTING
      else if (rank == 4) return 198; // NEEDS TESTING
      else if (rank == 5) return 243;
      else if (rank == 6) return 273;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
    threatModifier(rank) {
      return 2.25;
    }
}

class SunderArmor extends Ability {
    use(attacker, defender) {
        let damage = 0;
        let damageEvent = rollAttack(attacker, defender, damage, true);
        if (damageEvent.hit == "crit") damageEvent.hit = "hit";  // TODO this can't crit...
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name;
        // Remove rage
        updateRage(attacker, damageEvent.hit, this.rageCost);
        return damageEvent;
    }
    isUsable(attacker, defender) {
        return (!defender.IEA && this.currentCooldown <= 0 && (attacker.GCD <= 0 || this.onGCD == false) && attacker.rage > this.rageCost + (attacker.stats.dualWield ? 10 : 15));
    }
    rank(level) {
      if (level < 10) return 0;
      else if (level < 22) return 1;
      else if (level < 34) return 2;
      else if (level < 46) return 3;
      else if (level < 58) return 4;
      else return 5;
    }
    staticThreat(rank) {
      if (rank == 1) return 45;
      else if (rank == 2) return 99; // NEEDS TESTING
      else if (rank == 3) return 153; // NEEDS TESTING
      else if (rank == 4) return 207; // NEEDS TESTING
      else if (rank == 5) return 261;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
}

class HeroicStrike extends Ability {
    use(attacker, defender) {
        // Note that just pressing the ability has no rage cost
        attacker.isHeroicStrikeQueued = true;
        return {
                type: "spell cast",
                name: this.name,
        };
    }
    isUsable(attacker, defender) {
        return (attacker.isHeroicStrikeQueued == false && attacker.rage > this.rageCost + (attacker.stats.dualWield ? 0 : 60));
    }
}

class BattleShout extends Ability {
    threatCalculator(damageEvent, attacker) {
        return attacker.stats.bshouttargets * this.staticThreat(this.rank(attacker.level)) * attacker.stats.threatMod; 
    }
    
    use(attacker, defender) {
        let spellCastEvent = {
            type: "spell cast",
            name: this.name,
            ability: this.name + " Rank(" + this.rank(attacker.level) + ")",
            threat: this.threatCalculator({}, attacker),
        }
        // Remove rage
        updateRage(attacker, "hit", this.rageCost);
        return spellCastEvent;
    }
    isUsable(attacker, defender) {
        return (defender.IEA && (attacker.GCD <= 0 || this.onGCD == false) && attacker.rage > this.rageCost + (attacker.stats.dualWield ? 10 : 15));
    }
    rank(level) {
      if (level < 12) return 1;
      else if (level < 22) return 2;
      else if (level < 32) return 3;
      else if (level < 42) return 4;
      else if (level < 52) return 5;
      else if (level < 60) return 6;
      else return 7;
    }
    staticThreat(rank) {
      if (rank == 1) return 1; // NEEDS TESTING
      else if (rank == 2) return 12; // NEEDS TESTING
      else if (rank == 3) return 22; // NEEDS TESTING
      else if (rank == 4) return 32; // NEEDS TESTING
      else if (rank == 5) return 42; // NEEDS TESTING
      else if (rank == 6) return 52;
      else if (rank == 7) return 60;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
}

class ShieldSlam extends Ability {
    use(attacker, defender) {
        let damage = this.damage(this.rank(attacker.level)) + attacker.getBlockValue() + defender.additivePhysBonus;
        damage *= (1 - armorReduction(attacker.stats.level, defender.getArmor())) * attacker.getDamageMod();
        let damageEvent = rollAttack(attacker, defender, damage, true, false, false, true);
        damageEvent.threat = 0;
        damageEvent.threat = this.threatCalculator(damageEvent, attacker);
        damageEvent.ability = this.name + " Rank(" + this.rank(attacker.level) + ")";

        // Remove rage
        updateRage(attacker, damageEvent.hit, this.rageCost)
        return damageEvent;
    }
    rank(level) {
      if (level < 40) return 0;
      else if (level < 48) return 1;
      else if (level < 54) return 2;
      else if (level < 60) return 3;
      else return 4;
    }
    damage(rank) {
      if (rank == 1) return Math.random()*10 + 225;
      else if (rank == 2) return Math.random()*12 + 264;
      else if (rank == 3) return Math.random()*14 + 303;
      else if (rank == 4) return Math.random()*16 + 342;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
    staticThreat(rank) {
      if (rank == 1) return 178;
      else if (rank == 2) return 203;
      else if (rank == 3) return 229;
      else if (rank == 4) return 254;
      else 
      {
        console.log("Error: invalid rank for " + this.name + ": " + rank)
        return 0;
      }
    }
}

